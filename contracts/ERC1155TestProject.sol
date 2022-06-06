//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

/// @author: masangri.eth

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

import "./custom/ERC1155Base.sol";
import "./utils/ContextMixin.sol";

// import "hardhat/console.sol";


/**
 * @dev
 * ERC1155 implementation for NFT editions with royalties on Polygon.
 */
contract ERC1155TestProject is ERC1155Base, ERC2981, ContextMixin {

    /** 
     * @dev
     * Operator addresses to make transactions on behalf of a token's owner. See {IERC1155}.
     * Operator addresses for address(0) are considered approved for all accounts.
     */
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    /** 
     * @dev
     * By default, OpenSea 1155 Polygon's added to _operatorApprovals for all accounts.
     * See {https://docs.opensea.io/docs/polygon-basic-integration}.
     */
    constructor(string memory _name, string memory _symbol, uint96 royaltyFraction) ERC1155Base(_name, _symbol) {
        // OpenSea 1155 Polygon proxy address
        _operatorApprovals[address(0)][address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)] = true;

        // Set default royalty info
        setDefaultRoyalty(royaltyFraction);
    }

    /** 
     * @dev
     * Override _msgSender with Polygon's ContextMixin.
     * See {https://docs.opensea.io/docs/polygon-basic-integration}.
     */
    function _msgSender()
        internal
        override
        view
        returns (address sender)
    {
        return ContextMixin.msgSender();
    }

    /** 
     * @dev
     * Set storefront-level metadata uri.
     * See {https://docs.opensea.io/docs/contract-level-metadata}.
     */
    function contractURI()
        public
        pure
        returns (string memory)
    {
        return "ipfs://QmQ3vTtJJRx67hpv69emWELX7Z2MqLdzcqrDGGDmDhBZXW";
    }

    /** 
     * @dev
     * See {IERC1155-setApprovalForAll}.
     */
    function feeDenominator() public pure returns (uint96) {
        return _feeDenominator();
    }

    /** 
     * @dev
     * See {IERC1155-setApprovalForAll}.
     * An operator approved to the null address is considered approved for all accounts (OpenSea).
     * See {https://docs.opensea.io/docs/polygon-basic-integration}.
     */
    function isApprovedForAll(
        address _owner,
        address _operator
    )
        public
        override
        view
        returns (bool)
    {
        if (_operatorApprovals[address(0)][_operator] == true) {
            return true;
        }
        return super.isApprovedForAll(_owner, _operator);
    }

    /** 
     * @dev
     * See {IERC1155-setApprovalForAll}.
     *
     * Requirements:
     * Operator addresses for address(0) are considered approved for all accounts.
     * Operator addresses for address(0) can only be set by the contract owner.
     */
    function setApprovalForAll(
        address operator,
        bool approved
    )
        public
        virtual
        override
    {
        if(_operatorApprovals[address(0)][operator] == !approved) {
            require(
                msg.sender == owner(),
                "ERC1155TestProject: Only contract owner can set set override operators for marketplaces"
            );
            _operatorApprovals[address(0)][operator] = approved;
        } else {
            super.setApprovalForAll(operator, approved);
        }
    }

    /** 
     * @dev
     * See {IERC2981}.
     */
    function setDefaultRoyalty(uint96 feeNumerator)
        public
        onlyOwner
    {
        _setDefaultRoyalty(owner(), feeNumerator);
    }

    /** 
     * @dev
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override (ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
