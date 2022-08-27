//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

/// @author: masangri.eth

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

import "./custom/ERC1155Base.sol";
import "./utils/ContextMixin.sol";
import "./utils/NativeMetaTransaction.sol";

// import "hardhat/console.sol";


/**
 * @dev
 * ERC1155 implementation for NFT editions with royalties on Polygon.
 */
contract ERC1155TestProject is ERC1155Base, ERC2981, ContextMixin, NativeMetaTransaction {

    /** 
     * @dev
     * Operator addresses make transactions on behalf of a token's owner. See {IERC1155}.
     * We also include a mapping for special addresses that are automatically approved for all users to reduce marketplace friction.
     */
    mapping(address => bool) private _operatorOverrides;

    /** 
     * @dev
     * Custom events for changes to the royalties. See {ERC2981}.
     */
    event DefaultRoyaltyUpdated(address _receiver, uint96 _feeNumerator);
    event TokenRoyaltyUpdated(uint256 _id, address _receiver, uint96 _feeNumerator);

    /** 
     * @dev
     * By default, OpenSea 1155 Polygon's added to _operatorApprovals for all accounts.
     * See {https://docs.opensea.io/docs/polygon-basic-integration}.
     */
    constructor(string memory _name, string memory _symbol, uint96 royaltyFraction) ERC1155Base(_name, _symbol) {
        // Register OpenSea's 1155 Polygon proxy address in _operatorOverrides
        _operatorOverrides[address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)] = true;

        // Set default royalty info
        _setDefaultRoyalty(owner(), royaltyFraction);
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
     * See {IERC2981}.
     */
    function feeDenominator() public pure returns (uint96) {
        return _feeDenominator();
    }

    /** 
     * @dev
     * See {IERC1155-isApprovedForAll}.
     * An operator registered in _operatorOverrides considered approved for all accounts (OpenSea).
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
        if (_operatorOverrides[_operator] == true) {
            return true;
        }
        return super.isApprovedForAll(_owner, _operator);
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
        emit DefaultRoyaltyUpdated(owner(), feeNumerator);
    }

    /** 
     * @dev
     * An operator registered in _operatorOverrides is considered approved for all accounts (in this case, OpenSea).
     * When any edits occur, the ApprovalForAll event will be emitted with aDDRESS(0) as the first argument ("owner").
     * See {IERC1155-setApprovalForAll}.
     * See {https://docs.opensea.io/docs/polygon-basic-integration}.
     */
    function setOperatorOverride(
        address operator,
        bool approved
    )
        public
        onlyOwner
    {
        _operatorOverrides[operator] = approved;
        emit ApprovalForAll(address(0), operator, approved);
    }

    /**
     * @dev
     * Sets the royalty information for a specific token id, overriding the global default.
     * See {IERC2981}.
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    )
        public
        onlyOwner
    {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
        emit TokenRoyaltyUpdated(tokenId, receiver, feeNumerator);
    }

    /** 
     * @dev
     * See {IERC165-supportsInterface}.
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
