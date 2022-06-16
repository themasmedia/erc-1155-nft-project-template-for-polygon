//

require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const { expect } = require('chai');
const { ethers } = require('hardhat');


const PROJECT_NAME = process.env.PROJECT_NAME;
const PROJECT_SYMBOL = process.env.PROJECT_SYMBOL;
const ROYALTY_FRACTION = process.env.ROYALTY_FRACTION;

const testDataRaw = fs.readFileSync('test/data.json');
const testData = JSON.parse(testDataRaw);

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ONE_ETH = ethers.BigNumber.from('1000000000000000000');


describe('ERC-1155 contract deployment', function () {

  it('1. Contract should compile and deploy', async function () {

    const [owner, guest] = await ethers.getSigners();

    const ProjectContract = await ethers.getContractFactory(PROJECT_NAME);
    const projectContract = await ProjectContract.deploy(PROJECT_NAME, PROJECT_SYMBOL, ROYALTY_FRACTION);
    await projectContract.deployed();

    console.log(`"${PROJECT_NAME}" contract deployed successfully to ${projectContract.address} on the "${network.name}" network!`);
    
    describe('ERC-1155 contract interactions', function () {

      /** CONTRACT PROPERTY TESTS*/
      it('2. The hard-coded and constructor values in the contract should match specified values', async function () {

        // Deployment address and contract owner address should match.
        expect(await projectContract.owner()).to.equal(owner.address);

        // Contract name and symbol properties should match those set in constructor args.
        expect(await projectContract.name()).to.equal(PROJECT_NAME);
        expect(await projectContract.symbol()).to.equal(PROJECT_SYMBOL);
      
      });

      // Set constants for nested tests.
      const tokenIds = Object.keys(testData.tokenData);
      const tokenSupplies = tokenIds.map((x) => testData.tokenData[x].supply);
      const tokenURIs = tokenIds.map((x) => testData.tokenData[x].tokenURI);

      /** INTERFACE SUPPORT TESTS*/
      it('3. The contract should support all inherited interfaces (ERC165, ERC1155, ERC2981)', async function () {

        const interfaceIds = [
          // IERC165
          ethers.utils.hexlify(0x01ffc9a7),
          // IERC1155
          ethers.utils.hexlify(0xd9b67a26),
          // IERC2981
          ethers.utils.hexlify(0x2a55205a)
        ];
        for (let interfaceId of interfaceIds) {
          expect(await projectContract.supportsInterface(interfaceId)).to.be.true;
        }
        
      });

      /** MINTING TESTS*/
      it('4. Only the contract owner should be able to mint NFTs, once and only once per tokenId', async function () {

        // Mint tokenId 0.
        await expect(projectContract.connect(guest).mint(
          guest.address,
          tokenIds[0],
          tokenSupplies[0],
          NULL_ADDRESS
        )).to.be.reverted;

        await expect(projectContract.mint(
          owner.address,
          tokenIds[0],
          tokenSupplies[0],
          NULL_ADDRESS
        )).to.emit(projectContract, 'TransferSingle').withArgs(
          owner.address,
          NULL_ADDRESS,
          owner.address,
          tokenIds[0],
          tokenSupplies[0]
        );

        // Batch mnint remaining TokenIds.
        await expect(projectContract.connect(guest).mintBatch(
          guest.address,
          tokenIds.slice(1),
          tokenSupplies.slice(1),
          NULL_ADDRESS
        )).to.be.reverted;

        await expect(projectContract.mintBatch(
          owner.address,
          tokenIds.slice(1),
          tokenSupplies.slice(1),
          NULL_ADDRESS
        )).to.emit(projectContract, 'TransferBatch').withArgs(
          owner.address,
          NULL_ADDRESS,
          owner.address,
          tokenIds.slice(1),
          tokenSupplies.slice(1)
        );

        // Attempt to mint more after initial mint.
        await expect(projectContract.mint(
          owner.address,
          tokenIds[0],
          1000000,
          NULL_ADDRESS
        )).to.be.reverted;

      });

      /** TOKEN URI (METADATA) WRITE TESTS*/
      it('5. Only owner should be able to set metadata URIs, once and only once per tokenId', async function () {
        
        // Set URI for tokenId 0.
        await expect(projectContract.connect(guest).setTokenURI(
          tokenIds[0],
          tokenURIs[0],
        )).to.be.reverted;

        await expect(projectContract.setTokenURI(
          tokenIds[0],
          tokenURIs[0],
        )).to.emit(projectContract, 'PermanentURI').withArgs(tokenURIs[0], tokenIds[0]);

        // Batch set URI for remaining TokenIds.
        await expect(projectContract.setTokenURIBatch(
          tokenIds.slice(1),
          tokenURIs.slice(1)
        )).to.emit(projectContract, 'PermanentURI').withArgs(tokenURIs[1], tokenIds[1]);

        // Attempt to set URI for a TokenId with URI already set.
        await expect(projectContract.setTokenURI(
          tokenIds[0],
          ""
        )).to.be.reverted;

      });

      /** TOKEN URI (METADATA) READ TESTS*/
      it('6. A tokenId\'s URI should return an IPFS path, which should return a metadata JSON file', async function () {

        // Read Metadata from contract and fetch from pinned IPFS (via Pinata).
        let tokenIpfsUri = await projectContract.uri(tokenIds[0]);
        let cid = tokenIpfsUri.match(/ipfs:\/\/(?<cid>\w+)/).groups.cid;
        let tokenHtmlUri = `https://gateway.pinata.cloud/ipfs/${cid}`;

        try {

          // Fetch data from IPFS URI.
          let tokenUriResponse = await fetch(tokenHtmlUri);
          // Serialize data from a successful response to a JSON object.
          let tokenMetadata = await tokenUriResponse.json();

          // Check that the JSON metadata contains the required keys.
          expect(tokenMetadata).to.include.keys(...testData.metadataKeys);

        } catch (err) {

          // If any error is thrown in getting a response, the test fails.
          expect.fail('Token URI could not be fetched from IPFS:', err);

        };

      });

      /** TOKEN BALANCE & TRANSFER TESTS*/
      it('7. Tokens should be minted to the owner\'s address and be transferable', async function () {
        
        // Check token balances of owner and guest account post-mint.
        let ownerBalances = await projectContract.balanceOfBatch(
          Array(tokenIds.length).fill(owner.address),
          tokenIds
        );
        ownerBalances = ownerBalances.map((x) => x.toNumber());
        let guestBalances = await projectContract.balanceOfBatch(
          Array(tokenIds.length).fill(guest.address),
          tokenIds
        );
        guestBalances = guestBalances.map((x) => x.toNumber());

        expect(ownerBalances).to.eql(tokenSupplies);
        expect(guestBalances.every((x) => x == 0)).to.be.true;

        // Transfer one NFT of tokenId 0 from owner to guest.
        let amountSingle = 1;
        await expect(projectContract.safeTransferFrom(
          owner.address,
          guest.address,
          tokenIds[0],
          amountSingle,
          NULL_ADDRESS
        )).to.emit(projectContract, 'TransferSingle').withArgs(
          owner.address,
          owner.address,
          guest.address,
          tokenIds[0],
          amountSingle
        );

        ownerBalances[0] = await projectContract.balanceOf(owner.address, tokenIds[0]);
        ownerBalances[0] = ownerBalances[0].toNumber();
        guestBalances[0] = await projectContract.balanceOf(guest.address, tokenIds[0]);
        guestBalances[0] = guestBalances[0].toNumber();

        expect(ownerBalances[0]).to.equal(tokenSupplies[0] - 1);
        expect(guestBalances[0]).to.equal(1);

        // Batch transfer one NFT of each other tokenId from owner to guest.
        let amountBatch = Array(tokenIds.slice(1).length).fill(1);
        await expect(projectContract.safeBatchTransferFrom(
          owner.address,
          guest.address,
          tokenIds.slice(1),
          amountBatch,
          NULL_ADDRESS
        )).to.emit(projectContract, 'TransferBatch').withArgs(
          owner.address,
          owner.address,
          guest.address,
          tokenIds.slice(1),
          amountBatch
        );
        guestBalances = await projectContract.balanceOfBatch(
          Array(tokenIds.length).fill(guest.address),
          tokenIds
        );
        guestBalances = guestBalances.map((x) => x.toNumber());

        expect(guestBalances.every((x) => x == 1)).to.be.true;

      });

      /** CONTRACT PAUSE TESTS*/
      it('8. The contract owner should be able to pause transactions temporarily, if needed', async function () {

        // Initial paused state should be false.
        expect(await projectContract.paused()).to.be.false;

        // Pause the contract.
        await expect(projectContract.connect(guest).pause()).to.be.reverted;
        await expect(projectContract.pause()).to.emit(projectContract, 'Paused').withArgs(owner.address);

        // Ensure that transactions are paused for all.
        await expect(projectContract.connect(guest).safeTransferFrom(
          guest.address,
          owner.address,
          tokenIds[0],
          1,
          NULL_ADDRESS
        )).to.be.reverted;

        await expect(projectContract.safeTransferFrom(
          owner.address,
          guest.address,
          tokenIds[0],
          1,
          NULL_ADDRESS
        )).to.be.reverted;

        // Unpause the contract.
        await expect(projectContract.connect(guest).unpause()).to.be.reverted;
        await expect(projectContract.unpause()).to.emit(projectContract, 'Unpaused').withArgs(owner.address);
        
      });

      /** TOKEN BURN TESTS*/
      it('9. Tokens should be burnable by the token owner', async function () {

        // Check token balances of guest account.
        let guestBalances = await projectContract.balanceOfBatch(
          Array(tokenIds.length).fill(guest.address),
          tokenIds
        );
        guestBalances = guestBalances.map((x) => x.toNumber());

        // Attempt to burn another token owner's NFT(s).
        await expect(projectContract.burn(
          guest.address,
          tokenIds[0],
          guestBalances[0]
        )).to.be.reverted;

        await expect(projectContract.burnBatch(
          guest.address,
          tokenIds.slice(1),
          guestBalances.slice(1)
        )).to.be.reverted;

        // Burn all guest's NFT(s).
        await expect(projectContract.connect(guest).burn(
          guest.address,
          tokenIds[0],
          guestBalances[0]
        )).to.emit(projectContract, 'TransferSingle').withArgs(
          guest.address,
          guest.address,
          NULL_ADDRESS,
          tokenIds[0],
          guestBalances[0]
        );

        await expect(projectContract.connect(guest).burnBatch(
          guest.address,
          tokenIds.slice(1),
          guestBalances.slice(1)
        )).to.emit(projectContract, 'TransferBatch').withArgs(
          guest.address,
          guest.address,
          NULL_ADDRESS,
          tokenIds.slice(1),
          guestBalances.slice(1)
        );

        // Ensure all guest's token(s) were burned.
        guestBalances = await projectContract.balanceOfBatch(
          Array(tokenIds.length).fill(guest.address),
          tokenIds
        );
        guestBalances = guestBalances.map((x) => x.toNumber());
        expect(guestBalances.every((x) => x == 0)).to.be.true;
        
      });

      /** OPERATOR APPROVAL TESTS*/
      it(`10. Approval operator overrides should be registered in _operatorOverrides (only OpenSea).
      Unless registed in _operatorOverrides, approved operator(s) should be revokable by the token owner, if required.`,
      async function () {

        const openSeaProxyAddress = '0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101';
        
        // Check approval of unapproved address as operator (includes owner of the contract).
        expect(await projectContract.isApprovedForAll(guest.address, owner.address)).to.be.false;

        // Check approval of OpenSea Proxy address as operator override for all addresses.
        let isApprovedForGuest = await projectContract.isApprovedForAll(guest.address, openSeaProxyAddress);
        expect(isApprovedForGuest).to.be.true;
        let isApprovedForOwner = await projectContract.isApprovedForAll(owner.address, openSeaProxyAddress);
        expect(isApprovedForOwner).to.be.true;

        // Revoke approval of OpenSea operator for all addresses.
        // This should only be able to be done by the contract owner.
        await expect(projectContract.connect(guest).setOperatorOverride(
          openSeaProxyAddress,
          false
        )).to.be.reverted;
        
        await expect(projectContract.setOperatorOverride(
          openSeaProxyAddress,
          false
        )).to.emit(projectContract, 'ApprovalForAll').withArgs(
          NULL_ADDRESS,
          openSeaProxyAddress,
          false
        );

        isApprovedForGuest = await projectContract.isApprovedForAll(guest.address, openSeaProxyAddress);
        expect(isApprovedForGuest).to.be.false;

        // setApprovalForAll() should only set approval for the operator for the caller's account.
        await expect(projectContract.setApprovalForAll(
          openSeaProxyAddress,
          true
        )).to.emit(projectContract, 'ApprovalForAll').withArgs(
          owner.address,
          openSeaProxyAddress,
          true
        );

        isApprovedForGuest = await projectContract.isApprovedForAll(guest.address, openSeaProxyAddress);
        expect(isApprovedForGuest).to.be.false;
        await expect(projectContract.setApprovalForAll(
          openSeaProxyAddress,
          false
        )).to.emit(projectContract, 'ApprovalForAll').withArgs(
          owner.address,
          openSeaProxyAddress,
          false
        );

        // Re-enable approval of OpenSea operator for all addresses.
        await expect(projectContract.setOperatorOverride(
          openSeaProxyAddress,
          true
        )).to.emit(projectContract, 'ApprovalForAll').withArgs(
          NULL_ADDRESS,
          openSeaProxyAddress,
          true
        );

        isApprovedForGuest = await projectContract.isApprovedForAll(guest.address, openSeaProxyAddress);
        expect(isApprovedForGuest).to.be.true;

      });

      /** ROYALTY TESTS*/
      it(`11. The initial royalty fraction value should match what was set in the constructor (default: 0%).
      By default, the contract owner should be the receiver of all royalties and have authority to edit the royalty fraction value.`,
      async function () {

        // Check that the initial/default royalty info is set correctly.
        let feeDenominator = await projectContract.feeDenominator();
        let royaltyFraction = Number(ROYALTY_FRACTION); // 0 bips = 0%
        let [royaltyReceiver, royaltyAmount] = await projectContract.royaltyInfo(tokenIds[0], ONE_ETH);
        expect(royaltyReceiver).to.equal(owner.address);
        expect(ethers.utils.formatEther(royaltyAmount) * feeDenominator).to.equal(royaltyFraction);

        // Attempt to set the royalty to an illegally high value.
        royaltyFraction = 100000; // 10000 bips = 100%
        await expect(projectContract.setDefaultRoyalty(royaltyFraction)).to.be.reverted;

        // Set the default royalty to 5%.
        royaltyFraction = 500; // 500 bips = 5%
        await expect(projectContract.setDefaultRoyalty(
          royaltyFraction
        )).to.emit(projectContract, 'DefaultRoyaltyUpdated').withArgs(
          owner.address,
          royaltyFraction
        );

        [royaltyReceiver, royaltyAmount] = await projectContract.royaltyInfo(tokenIds[0], ONE_ETH);
        expect(ethers.utils.formatEther(royaltyAmount) * feeDenominator).to.equal(royaltyFraction);

        // Set the royalty for a specific token ID (overrides the default royalty).
        let newRoyaltyFraction = 1000;
        await expect(projectContract.setTokenRoyalty(
          tokenIds[0],
          guest.address,
          newRoyaltyFraction
        )).to.emit(projectContract, 'TokenRoyaltyUpdated').withArgs(
          tokenIds[0],
          guest.address,
          newRoyaltyFraction
        );

        let [newRoyaltyReceiver, newRoyaltyAmount] = await projectContract.royaltyInfo(tokenIds[0], ONE_ETH);
        expect(newRoyaltyReceiver).to.not.equal(royaltyReceiver);
        expect(ethers.utils.formatEther(newRoyaltyAmount) * feeDenominator).to.not.equal(royaltyFraction);

      });

    });

  });

});
