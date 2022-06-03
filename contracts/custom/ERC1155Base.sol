//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

/// @author: masangri.eth

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";


/**
 * @dev
 * ERC1155 implementation for NFT editions with unique token URIs per token ID.
 */
contract ERC1155Base is ERC1155, Ownable, ERC1155Burnable, ERC1155Pausable, ERC1155Supply {

    // URI per token ID
    mapping (uint256 => string) private _uris;
    // Token name
    string public name;
    // Token symbol
    string public symbol;

    /**
     * @dev
     * See {https://opensea.io/blog/announcements/decentralizing-nft-metadata-on-opensea/}.
     */
    event PermanentURI(string _value, uint256 indexed _id);

    /**
     * @dev
     * Contract's name and symbol properties set via contructor arguments.
     * URI set to empty string, as each token ID will have a unique URI.
     */
    constructor(string memory _name, string memory _symbol) ERC1155("") {
        name = _name;
        symbol = _symbol;
    }

    /**
     * @dev
     * Override for shared function across ERC1155 & ERC1155Supply extension.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal
        virtual
        override (ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    /**
     * @dev
     * Only contract owner can mint.
     * Once a supply has been minted for a token ID, additional tokens cannot be minted.
     */
    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        public
        onlyOwner
    {
        require(totalSupply(id) == 0, "ERC1155Base: Token ID already minted");
        _mint(account, id, amount, data);
    }

    /**
     * @dev
     * Batch mint. See {mint()} above.
     */
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
            require(totalSupply(ids[i]) == 0, "ERC1155Base: Token ID already minted");
        }
        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev
     * See {ERC1155Pausable}.
     */
    function pause()
        public
        onlyOwner
    {
         _pause();
    }

    /**
     * @dev
     * See {ERC1155Pausable}.
     */
    function unpause()
        public
        onlyOwner
    {
         _unpause();
    }

    /**
     * @dev
     * Set URI per token ID.
     *
     * Requirements:
     * Only contract owner can set token URI(s).
     * Token URI must not already be set.
     */
    function setTokenURI(
        uint256 tokenId,
        string memory tokenURI
    )
        public
        onlyOwner
    {
        require(
            bytes(_uris[tokenId]).length == 0,
            "ERC1155Base: URI can be set once and only once by the owner"
        );
        _uris[tokenId] = tokenURI;
        emit PermanentURI(tokenURI, tokenId);
    }

    /**
     * @dev
     * Batch set token URIs. See {setTokenURI()} above.
     */
    function setTokenURIBatch(uint256[] memory tokenIds, string[] memory tokenURIs)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            setTokenURI(tokenIds[i], tokenURIs[i]);
        }
    }

    /**
     * @dev
     * Override to return token URI per individual token ID.
     * See {IERC1155MetadataURI}.
     */
    function uri(
        uint256 tokenId
    )
        public
        view
        override
        returns (string memory)
    {
        return _uris[tokenId];
    }

}
