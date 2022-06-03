//

const fetch = require('node-fetch');
const fs = require('fs');

const { expect } = require('chai');
const { ethers } = require('hardhat');


const PROJECT_NAME = 'ERC1155TestProject';
const PROJECT_SYMBOL = 'TEST';
const ROYALTY_FRACTION = 0;

const testDataRaw = fs.readFileSync('test/data.json');
const testData = JSON.parse(testDataRaw);

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ONE_ETH = ethers.BigNumber.from('1000000000000000000');


describe('ERC-1155 contract deployment', function () {

  it('Contract should compile and deploy', async function () {

    const [owner, guest] = await ethers.getSigners();

    const ProjectContract = await ethers.getContractFactory(PROJECT_NAME);
    const projectContract = await ProjectContract.deploy(PROJECT_NAME, PROJECT_SYMBOL, ROYALTY_FRACTION);
    await projectContract.deployed();
    
    describe('ERC-1155 contract interactions', function () {

      /** CONTRACT PROPERTY TESTS*/
      it('The hard-coded values in the contract should match actual addresses and URIs', async function () {

        // Deployment address and contract owner address should match the public key in test data file.
        expect(owner.address).to.equal(testData.owner);
        expect(await projectContract.owner()).to.equal(testData.owner);

        // Contract name and symbol properties should match those set in constructor args.
        expect(await projectContract.name()).to.equal(PROJECT_NAME);
        expect(await projectContract.symbol()).to.equal(PROJECT_SYMBOL);
      
      });

      // Set constants for nested tests.
      const tokenIds = Object.keys(testData.tokenData);
      const tokenSupplies = tokenIds.map((x) => testData.tokenData[x].supply);
      const tokenURIs = tokenIds.map((x) => testData.tokenData[x].tokenURI);

      /** INTERFACE SUPPORT TESTS*/
      it('The contract should support all inherited interfaces (ERC165, ERC1155, ERC2981)', async function () {

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
      it('Only the contract owner should be able to mint NFTs, once and only once per tokenId', async function () {

        // Mint tokenId 0.
        await expect(projectContract.connect(guest).mint(
          guest.address,
          tokenIds[0],
          tokenSupplies[0],
          NULL_ADDRESS
        )).to.be.reverted;

        expect(await projectContract.mint(
          owner.address,
          tokenIds[0],
          tokenSupplies[0],
          NULL_ADDRESS
        )).to.emit('TransferSingle');

        // Batch mnint remaining TokenIds.
        await expect(projectContract.connect(guest).mintBatch(
          guest.address,
          tokenIds.slice(1),
          tokenSupplies.slice(1),
          NULL_ADDRESS
        )).to.be.reverted;

        expect(await projectContract.mintBatch(
          owner.address,
          tokenIds.slice(1),
          tokenSupplies.slice(1),
          NULL_ADDRESS
        )).to.emit('TransferBatch');

        // Attempt to mint more after initial mint.
        await expect(projectContract.mint(
          owner.address,
          tokenIds[0],
          1000000,
          NULL_ADDRESS
        )).to.be.reverted;

      });

      /** TOKEN URI (METADATA) WRITE TESTS*/
      it('Only owner should be able to set metadata URIs, once and only once per tokenId', async function () {
        
        // Set URI for tokenId 0.
        await expect(projectContract.connect(guest).setTokenURI(
          tokenIds[0],
          tokenURIs[0],
        )).to.be.reverted;

        expect(await projectContract.setTokenURI(
          tokenIds[0],
          tokenURIs[0],
        )).to.emit('PermanentURI');

        // Batch set URI for remaining TokenIds.
        expect(await projectContract.setTokenURIBatch(
          tokenIds.slice(1),
          tokenURIs.slice(1)
        )).to.emit('PermanentURI');

        // Attempt to set URI for a TokenId with URI already set.
        await expect(projectContract.setTokenURI(
          tokenIds[0],
          ""
        )).to.be.reverted;

      });

      /** TOKEN URI (METADATA) READ TESTS*/
      it('A tokenId\'s URI should return an IPFS path, which should return a metadata JSON file', async function () {

        // Read Metadata from contract and fetch from pinned IPFS (via Pinata).
        let tokenIpfsUri = await projectContract.uri(tokenIds[0]);
        let cid = tokenIpfsUri.match(/ipfs:\/\/(?<cid>\w+)/).groups.cid;
        let tokenHtmlUri = `https://gateway.pinata.cloud/ipfs/${cid}`;

        try {

          // Fetch data from IPFS URI.
          let tokenUriResponse = await fetch(tokenHtmlUri);
          // Serialize JSON from response and check for required fields.
          let tokenMetadata = await tokenUriResponse.json();

          // Check that the json metadata contains the required keys.
          expect(tokenMetadata).to.include.keys(...testData.metadataKeys);

        } catch (err) {

          // If any error is thrown, the test is failed.
          expect.fail('Token URI could not be fetched from IPFS:', err);

        };

      });

      /** TOKEN BALANCE & TRANSFER TESTS*/
      it('Tokens should be minted to the owner\'s address and be transferable', async function () {
        
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
        await projectContract.safeTransferFrom(
          owner.address,
          guest.address,
          tokenIds[0],
          1,
          NULL_ADDRESS
        );

        ownerBalances[0] = await projectContract.balanceOf(owner.address, tokenIds[0]);
        ownerBalances[0] = ownerBalances[0].toNumber();
        guestBalances[0] = await projectContract.balanceOf(guest.address, tokenIds[0]);
        guestBalances[0] = guestBalances[0].toNumber();

        expect(ownerBalances[0]).to.equal(tokenSupplies[0] - 1);
        expect(guestBalances[0]).to.equal(1);

        // Batch transfer one NFT of each other tokenId from owner to guest.
        await projectContract.safeBatchTransferFrom(
          owner.address,
          guest.address,
          tokenIds.slice(1),
          Array(tokenIds.slice(1).length).fill(1),
          NULL_ADDRESS
        );
        guestBalances = await projectContract.balanceOfBatch(
          Array(tokenIds.length).fill(guest.address),
          tokenIds
        );
        guestBalances = guestBalances.map((x) => x.toNumber());

        expect(guestBalances.every((x) => x == 1)).to.be.true;

      });

      /** TOKEN BURN TESTS*/
      it('Tokens should be burnable by the token owner', async function () {

        // Check token balances of guest account.
        let guestBalances = await projectContract.balanceOfBatch(
          Array(tokenIds.length).fill(guest.address),
          tokenIds
        );
        guestBalances = guestBalances.map((x) => x.toNumber());

        // Attempt to burn another owner's token(s).
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

        // Burn guest's token(s).
        expect(await projectContract.connect(guest).burn(
          guest.address,
          tokenIds[0],
          guestBalances[0]
        )).to.emit('TransferSingle');

        expect(await projectContract.connect(guest).burnBatch(
          guest.address,
          tokenIds.slice(1),
          guestBalances.slice(1)
        )).to.emit('TransferBatch');

        // Ensure all guest's token(s) were burned.
        guestBalances = await projectContract.balanceOfBatch(
          Array(tokenIds.length).fill(guest.address),
          tokenIds
        );
        guestBalances = guestBalances.map((x) => x.toNumber());
        expect(guestBalances.every((x) => x == 0)).to.be.true;
        
      });

      /** OPERATOR APPROVAL TESTS*/
      it(`Approval should be compatible with designated operator (only OpenSea).
      Approved operator should be revokable by the owner, if required`,
      async function () {

        const openSeaProxyAddress = '0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101';
        
        // Check approval of unapproved address as operator (including owner of the contract, obviously).
        expect(await projectContract.isApprovedForAll(guest.address, owner.address)).to.be.false;

        // Check approval of OpenSeaa Proxy address as operator for all addresses.
        let isApprovedForAll = await projectContract.isApprovedForAll(guest.address, openSeaProxyAddress);
        expect(isApprovedForAll).to.be.true;
        isApprovedForAll = await projectContract.isApprovedForAll(owner.address, openSeaProxyAddress);
        expect(isApprovedForAll).to.be.true;

        // Revoke approval of OpenSea operator for all addresses.
        // This should only be able to be done by the contract owner.
        await expect(projectContract.connect(guest).setApprovalForAll(
          openSeaProxyAddress,
          false
        )).to.be.reverted;
        
        expect(await projectContract.setApprovalForAll(
          openSeaProxyAddress,
          false
        )).to.emit('ApprovalForAll');

        isApprovedForAll = await projectContract.isApprovedForAll(guest.address, openSeaProxyAddress);
        expect(isApprovedForAll).to.be.false;

      });

      /** ROYALTY TESTS*/
      it('Royalty info should need to be set to the owner', async function () {

        // Check that the initial royalty info (_defaultRoyaltyInfo for all tokenIds) was set correctly.
        let feeDenominator = await projectContract.feeDenominator();
        let royaltyFraction = ROYALTY_FRACTION; // 0 bips = 0%
        let [royaltyReceiver, royaltyAmount] = await projectContract.royaltyInfo(0, 1000000);
        expect(royaltyReceiver).to.equal(NULL_ADDRESS);
        expect(ethers.utils.formatEther(royaltyAmount * feeDenominator)).to.equal(ethers.utils.formatEther(royaltyFraction));

        // Attempt to set the royalty to an illegally high value.
        royaltyFraction = 100000; // 10000 bips = 100%
        await expect(projectContract.setDefaultRoyalty(royaltyFraction)).to.be.reverted;

        // Set the default royalty to 5%.
        royaltyFraction = 500; // 500 bips = 5%
        await projectContract.setDefaultRoyalty(royaltyFraction);
        [royaltyReceiver, royaltyAmount] = await projectContract.royaltyInfo(0, ONE_ETH);
        expect(royaltyReceiver).to.equal(owner.address);
        expect(ethers.utils.formatEther(royaltyAmount) * feeDenominator).to.equal(royaltyFraction);

      });

    });

  });

});
