//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;


/**
 * @dev
 * Imported by EIP712Base for upgradable context.
 * https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable
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
