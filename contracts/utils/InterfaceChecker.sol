//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

// @author: masangri.eth


import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC777.sol";
import "@openzeppelin/contracts/interfaces/IERC1155.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/interfaces/IERC1363.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";


/**
 * @dev
 * Library that returns the Interface ID (bytes4) of a given interface,
 * since it's damn-near impossible to find these values anywhere online.
 * Not meant to be used in production.
 *
 * Cheat Sheet:
 * IERC20:   0x36372b07 (Token Standard)
 * IERC165:  0x01ffc9a7 (Standard Interface Detection)
 * IERC721:  0x80ac58cd (Non-Fungible Token Standard)
 * IERC777:  0xe58e113c (Token Standard)
 * IERC1155: 0xd9b67a26 (Multi Token Standard)
 * IERC1271: 0x1626ba7e (Standard Signature Validation Method for Contracts)
 * IERC1363: 0xb0202a11 (Payable Token)
 * IERC2981: 0x2a55205a (NFT Royalty Standard)
 */
library _InterfaceChecker {

    /** 
     * @dev
     * Get the interface ID of the given contract interface name (imported above).
     */
    function _interfaceId(string memory interfaceType) internal pure returns (bytes4 id){
        bytes32 interfaceHash = keccak256(abi.encodePacked(interfaceType));
        if (interfaceHash == keccak256('IERC20')) {
            return type(IERC20).interfaceId;
        } else if (interfaceHash == keccak256('IERC165')) {
            return type(IERC165).interfaceId;
        } else if (interfaceHash == keccak256('IERC721')) {
            return type(IERC721).interfaceId;
        } else if (interfaceHash == keccak256('IERC777')) {
            return type(IERC777).interfaceId;
        } else if (interfaceHash == keccak256('IERC1155')) {
            return type(IERC1155).interfaceId;
        } else if (interfaceHash == keccak256('IERC1271')) {
            return type(IERC1271).interfaceId;
        } else if (interfaceHash == keccak256('IERC1363')) {
            return type(IERC1363).interfaceId;
        } else if (interfaceHash == keccak256('IERC2981')) {
            return type(IERC2981).interfaceId;
        } else {
            return bytes4(0);
        }
    }
}

/**
 * @dev
 * Simply a contract that uses the _InterfaceChecker library.
 */
contract InterfaceChecker {
    //
    using _InterfaceChecker for string;

    /** 
     * @dev
     * See {_InterfaceChecker._interfaceId}.
     */
    function interfaceId(string memory interfaceType) public pure returns (bytes4 id){
        return interfaceType._interfaceId();
    }
}
