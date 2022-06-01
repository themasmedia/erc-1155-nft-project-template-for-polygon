//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";


/**
 * https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/ContextMixin.sol
 */
abstract contract ContextMixin {
    function msgSender()
        internal
        view
        returns (address payable sender)
    {
        if (msg.sender == address(this)) {
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
                sender := and(
                    mload(add(array, index)),
                    0xffffffffffffffffffffffffffffffffffffffff
                )
            }
        } else {
            sender = payable(msg.sender);
        }
        return sender;
    }
}

/**
 * https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/Initializable.sol
 */
contract Initializable {
    bool inited = false;

    modifier initializer() {
        require(!inited, "already inited");
        _;
        inited = true;
    }
}

/**
 * https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/EIP712Base.sol
 */
contract EIP712Base is Initializable {
    struct EIP712Domain {
        string name;
        string version;
        address verifyingContract;
        bytes32 salt;
    }

    string constant public ERC712_VERSION = "1";

    bytes32 internal constant EIP712_DOMAIN_TYPEHASH = keccak256(
        bytes(
            "EIP712Domain(string name,string version,address verifyingContract,bytes32 salt)"
        )
    );
    bytes32 internal domainSeperator;

    // supposed to be called once while initializing.
    // one of the contractsa that inherits this contract follows proxy pattern
    // so it is not possible to do this in a constructor
    function _initializeEIP712(
        string memory name
    )
        internal
        initializer
    {
        _setDomainSeperator(name);
    }

    function _setDomainSeperator(string memory name) internal {
        domainSeperator = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(ERC712_VERSION)),
                address(this),
                bytes32(getChainId())
            )
        );
    }

    function getDomainSeperator() public view returns (bytes32) {
        return domainSeperator;
    }

    function getChainId() public view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    /**
     * Accept message hash and returns hash message in EIP712 compatible form
     * So that it can be used to recover signer from signature signed using EIP712 formatted data
     * https://eips.ethereum.org/EIPS/eip-712
     * "\\x19" makes the encoding deterministic
     * "\\x01" is the version byte to make it compatible to EIP-191
     */
    function toTypedMessageHash(bytes32 messageHash)
        internal
        view
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked("\x19\x01", getDomainSeperator(), messageHash)
            );
    }
}

/**
 * https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/NativeMetaTransaction.sol
 */
contract NativeMetaTransaction is EIP712Base {
    bytes32 private constant META_TRANSACTION_TYPEHASH = keccak256(
        bytes(
            "MetaTransaction(uint256 nonce,address from,bytes functionSignature)"
        )
    );
    event MetaTransactionExecuted(
        address userAddress,
        address payable relayerAddress,
        bytes functionSignature
    );
    mapping(address => uint256) nonces;

    /*
     * Meta transaction structure.
     * No point of including value field here as if user is doing value transfer then he has the funds to pay for gas
     * He should call the desired function directly in that case.
     */
    struct MetaTransaction {
        uint256 nonce;
        address from;
        bytes functionSignature;
    }

    function executeMetaTransaction(
        address userAddress,
        bytes memory functionSignature,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) public payable returns (bytes memory) {
        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[userAddress],
            from: userAddress,
            functionSignature: functionSignature
        });

        require(
            verify(userAddress, metaTx, sigR, sigS, sigV),
            "Signer and signature do not match"
        );

        // increase nonce for user (to avoid re-use)
        nonces[userAddress] = nonces[userAddress] + 1;

        emit MetaTransactionExecuted(
            userAddress,
            payable(msg.sender),
            functionSignature
        );

        // Append userAddress and relayer address at the end to extract it from calling context
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodePacked(functionSignature, userAddress)
        );
        require(success, "Function call not successful");

        return returnData;
    }

    function hashMetaTransaction(MetaTransaction memory metaTx)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    META_TRANSACTION_TYPEHASH,
                    metaTx.nonce,
                    metaTx.from,
                    keccak256(metaTx.functionSignature)
                )
            );
    }

    function getNonce(address user) public view returns (uint256 nonce) {
        nonce = nonces[user];
    }

    function verify(
        address signer,
        MetaTransaction memory metaTx,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) internal view returns (bool) {
        require(signer != address(0), "NativeMetaTransaction: INVALID_SIGNER");
        return
            signer ==
            ecrecover(
                toTypedMessageHash(hashMetaTransaction(metaTx)),
                sigV,
                sigR,
                sigS
            );
    }
}


contract ERC1155MaticTestnet is ERC1155, ERC2981, Ownable, NativeMetaTransaction, ContextMixin, ERC1155Burnable, ERC1155Supply {

    // Whitelists
    // mapping(address => bool) private _operatorWL;

    // ERC2981 (Royalties)
    RoyaltyInfo private _defaultRoyaltyInfo;

    // ERC1155
    string public name;
    string public symbol;
     mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping (uint256 => string) private _uris;

    // Events
    event PermanentURI(string _value, uint256 indexed _id);


    constructor() ERC1155("") {
        name = "ERC1155MaticTestnet";
        symbol = "TEST";
        // _operatorWL[address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)] = true; // OpenSea 1155 Polygon
        _operatorApprovals[address(0)][address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)] = true; // OpenSea 1155 Polygon
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _msgSender()
        internal
        override
        view
        returns (address sender)
    {
        return ContextMixin.msgSender();
    }

    function contractURI()
        public
        pure
        returns (string memory)
    {
        return "ipfs://QmQ3vTtJJRx67hpv69emWELX7Z2MqLdzcqrDGGDmDhBZXW";
    }

    function isApprovedForAll(
        address _owner,
        address _operator
    )
        public
        override
        view
        returns (bool)
    {
        // if (_operatorWL[_operator] == true) {
        //     return true;
        // }
        if (_operatorApprovals[address(0)][_operator]) {
            return true;
        }
        return super.isApprovedForAll(_owner, _operator);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        public
        onlyOwner
    {
        require(totalSupply(id) == 0, "Token ID already minted");
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        public
        onlyOwner
    {
        for (uint256 i = 0; i > ids.length; i++) {
            require(totalSupply(ids[i]) == 0, "Token ID already minted");
        }
        _mintBatch(to, ids, amounts, data);
    }

    function setDefaultRoyalty(uint96 feeNumerator)
        public
        onlyOwner
    {
        _setDefaultRoyalty(owner(), feeNumerator);
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI)
        public
        onlyOwner
    {
        require(bytes(_uris[tokenId]).length == 0, "URI can be set once and only once by the owner");
        _uris[tokenId] = tokenURI;
        emit PermanentURI(tokenURI, tokenId);
    }

    function setTokenURIBatch(uint256[] memory tokenIds, string[] memory tokenURIs)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(bytes(_uris[tokenIds[i]]).length == 0, "URI can be set once and only once by the owner");
            _uris[tokenIds[i]] = tokenURIs[i];
            emit PermanentURI(tokenURIs[i], tokenIds[i]);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override (ERC1155, ERC2981)
        returns (bool)
    {
        // return (interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId));
        return (ERC1155.supportsInterface(interfaceId) || ERC2981.supportsInterface(interfaceId));
    }

    function uri(
        uint256 tokenId
    )
        public
        view
        override
        returns (string memory)
    {
        // TODO
        return _uris[tokenId];
    }

}
