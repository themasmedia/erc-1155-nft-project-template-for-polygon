//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "./custom/ERC1155.sol";
import "./utils/PolygonCommon.sol";

import "hardhat/console.sol";


contract ERC1155TestProject is ERC1155Custom, ERC2981, NativeMetaTransaction, ContextMixin {

    // ERC2981 (Royalties)
    RoyaltyInfo private _defaultRoyaltyInfo;

    // ERC1155
    mapping(address => mapping(address => bool)) private _operatorApprovals;


    constructor() {
        /** 
        Operator addresses for null address are considered approved for all accounts.
        By default, we add OpenSea 1155 Polygon's proxy address.   
        https://docs.opensea.io/docs/polygon-basic-integration for more information.
        */
        name = "ERC1155TestProject";
        symbol = "TEST";
        _operatorApprovals[address(0)][address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)] = true; // OpenSea 1155 Polygon
    }

    // function _beforeTokenTransfer(
    //     address operator,
    //     address from,
    //     address to,
    //     uint256[] memory ids,
    //     uint256[] memory amounts,
    //     bytes memory data
    // )
    //     internal
    //     override(ERC1155, ERC1155Supply)
    // {
    //     super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    // }

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
        if (_operatorApprovals[address(0)][_operator]) {
            return true;
        }
        return super.isApprovedForAll(_owner, _operator);
    }

    // function mint(
    //     address account,
    //     uint256 id,
    //     uint256 amount,
    //     bytes memory data
    // )
    //     public
    //     onlyOwner
    // {
    //     require(totalSupply(id) == 0, "Token ID already minted");
    //     _mint(account, id, amount, data);
    // }

    // function mintBatch(
    //     address to,
    //     uint256[] memory ids,
    //     uint256[] memory amounts,
    //     bytes memory data
    // )
    //     public
    //     onlyOwner
    // {
    //     for (uint256 i = 0; i > ids.length; i++) {
    //         require(totalSupply(ids[i]) == 0, "Token ID already minted");
    //     }
    //     _mintBatch(to, ids, amounts, data);
    // }

    function setApprovalForAll(address operator, bool approved) public virtual override {

        if(_operatorApprovals[address(0)][operator] == !approved) {
            require(msg.sender == owner(), "Only contract owner can set set override operators for marketplaces");
        }

        super.setApprovalForAll(operator, approved);
    }

    function setDefaultRoyalty(uint96 feeNumerator)
        public
        onlyOwner
    {
        _setDefaultRoyalty(owner(), feeNumerator);
    }

    // function setTokenURI(uint256 tokenId, string memory tokenURI)
    //     public
    //     onlyOwner
    // {
    //     require(bytes(_uris[tokenId]).length == 0, "URI can be set once and only once by the owner");
    //     _uris[tokenId] = tokenURI;
    //     emit PermanentURI(tokenURI, tokenId);
    // }

    // function setTokenURIBatch(uint256[] memory tokenIds, string[] memory tokenURIs)
    //     public
    //     onlyOwner
    // {
    //     for (uint256 i = 0; i < tokenIds.length; i++) {
    //         require(bytes(_uris[tokenIds[i]]).length == 0, "URI can be set once and only once by the owner");
    //         _uris[tokenIds[i]] = tokenURIs[i];
    //         emit PermanentURI(tokenURIs[i], tokenIds[i]);
    //     }
    // }

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

    // function uri(
    //     uint256 tokenId
    // )
    //     public
    //     view
    //     override
    //     returns (string memory)
    // {
    //     return _uris[tokenId];
    // }

}
