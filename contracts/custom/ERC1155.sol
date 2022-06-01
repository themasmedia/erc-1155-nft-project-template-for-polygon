//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

import "hardhat/console.sol";


contract ERC1155Custom is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {


    // ERC1155
    string public name;
    string public symbol;
    // mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping (uint256 => string) private _uris;

    // Events
    event PermanentURI(string _value, uint256 indexed _id);


    constructor() ERC1155("") {
        /** 
        Operator addresses for null address are considered approved for all accounts.
        By default, we add OpenSea 1155 Polygon's proxy address.   
        */
        name = "";
        symbol = "";
        // _operatorApprovals[address(0)][address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)] = true;
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

    // function contractURI()
    //     public
    //     pure
    //     returns (string memory)
    // {
    //     return "ipfs://QmQ3vTtJJRx67hpv69emWELX7Z2MqLdzcqrDGGDmDhBZXW";
    // }

    // function isApprovedForAll(
    //     address _owner,
    //     address _operator
    // )
    //     public
    //     override
    //     view
    //     returns (bool)
    // {
    //     if (_operatorApprovals[address(0)][_operator]) {
    //         return true;
    //     }
    //     return super.isApprovedForAll(_owner, _operator);
    // }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        public
        onlyOwner
    {
        require(totalSupply(id) == 0, "ERC1155: Token ID already minted");
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
            require(totalSupply(ids[i]) == 0, "ERC1155: Token ID already minted");
        }
        _mintBatch(to, ids, amounts, data);
    }

    // function setApprovalForAll(address operator, bool approved) public virtual override {

    //     if(_operatorApprovals[address(0)][operator] == !approved) {
    //         require(msg.sender == owner(), "ERC1155: Only contract owner can set override operator:");
    //     }

    //     super.setApprovalForAll(operator, approved);
    // }

    function setTokenURI(uint256 tokenId, string memory tokenURI)
        public
        onlyOwner
    {
        require(bytes(_uris[tokenId]).length == 0, "ERC1155: URI can be set once and only once by the owner");
        _uris[tokenId] = tokenURI;
        emit PermanentURI(tokenURI, tokenId);
    }

    function setTokenURIBatch(uint256[] memory tokenIds, string[] memory tokenURIs)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            setTokenURI(tokenIds[i], tokenURIs[i]);
        }
    }

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
