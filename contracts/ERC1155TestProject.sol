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
     * Custom events for changes to the royalties. See {ERC2981}.
     */
    event DefaultRoyaltyUpdated(address _receiver, uint96 _feeNumerator);
    event TokenRoyaltyUpdated(uint256 _id, address _receiver, uint96 _feeNumerator);

    /** 
     * @dev
     * Constructor function.
     */
    constructor(string memory _name, string memory _symbol, uint96 royaltyFraction) ERC1155Base(_name, _symbol) {
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
