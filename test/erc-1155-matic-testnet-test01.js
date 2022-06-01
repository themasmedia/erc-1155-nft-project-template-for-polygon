//

const fetch = require('node-fetch');
const fs = require('fs');

const { expect } = require('chai');
const { ethers } = require('hardhat');

const testDataRaw = fs.readFileSync('test/data.json');
const testData = JSON.parse(testDataRaw);

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ONE_ETH = ethers.BigNumber.from('1000000000000000000');


describe('ERC-1155 Matic Mumbai Testnet contract deployment', function () {

  it('Contract should compile and deploy', async function () {

    // const provider = ethers.getDefaultProvider();
    // const owner = new ethers.Wallet(process.env.TESTNET_PRIVATE_KEY, provider);

    const [owner, guest] = await ethers.getSigners();

    const ERC1155MaticTestnet = await ethers.getContractFactory('ERC1155MaticTestnet');
    const erc1155MaticTestnet = await ERC1155MaticTestnet.deploy();
    await erc1155MaticTestnet.deployed();
    
    describe('ERC-1155 Metic Testnet contract interactions', function () {

      /** CONTRACT PROPERTY TESTS*/
      it('The hard-coded values in the contract should match actual addresses and URIs', async function () {

        // Deployment address and contract woner address should match the public key in test data file
        expect(owner.address).to.equal(testData.owner);
        expect(await erc1155MaticTestnet.owner()).to.equal(testData.owner)
      
      });

      const tokenIds = Object.keys(testData.tokenData);
      const tokenSupplies = tokenIds.map((x) => testData.tokenData[x].supply);
      const tokenURIs = tokenIds.map((x) => testData.tokenData[x].tokenURI);

      /** MINTING TESTS*/
      it('Only owner should be able to mint NFTs, once and only once per tokenId', async function () {

        // Mint tokenId 0
        await expect(erc1155MaticTestnet.connect(guest).mint(
          guest.address,
          tokenIds[0],
          tokenSupplies[0],
          NULL_ADDRESS
        )).to.be.reverted;

        expect(await erc1155MaticTestnet.mint(
          owner.address,
          tokenIds[0],
          tokenSupplies[0],
          NULL_ADDRESS
        )).to.emit('TransferSingle');

        // Batch mnint remaining TokenIds
        await expect(erc1155MaticTestnet.connect(guest).mintBatch(
          guest.address,
          tokenIds.slice(1),
          tokenSupplies.slice(1),
          NULL_ADDRESS
        )).to.be.reverted;

        expect(await erc1155MaticTestnet.mintBatch(
          owner.address,
          tokenIds.slice(1),
          tokenSupplies.slice(1),
          NULL_ADDRESS
        )).to.emit('TransferBatch');

        // Attempt to mint more after initial mint
        await expect(erc1155MaticTestnet.mint(
          owner.address,
          tokenIds[0],
          1000000,
          NULL_ADDRESS
        )).to.be.reverted;

      });

      /** TOKEN URI (METADATA) WRITE TESTS*/
      it('Only owner should be able to set metadata URIs, once and only once per tokenId', async function () {
        
        // Set URI for tokenId 0
        await expect(erc1155MaticTestnet.connect(guest).setTokenURI(
          tokenIds[0],
          tokenURIs[0],
        )).to.be.reverted;

        expect(await erc1155MaticTestnet.setTokenURI(
          tokenIds[0],
          tokenURIs[0],
        )).to.emit('PermanentURI');

        // Batch set URI for remaining TokenIds
        expect(await erc1155MaticTestnet.setTokenURIBatch(
          tokenIds.slice(1),
          tokenURIs.slice(1)
        )).to.emit('PermanentURI');

        // Attempt to set URI for a TokenId with URI already set
        await expect(erc1155MaticTestnet.setTokenURI(
          tokenIds[0],
          ""
        )).to.be.reverted;

      });

      /** TOKEN URI (METADATA) READ TESTS*/
      it('A tokenId\'s URI should return an IPFS path, which should return a metadata JSON file', async function () {

        // Read Metadata from contract and fetch from pinned IPFS
        let tokenIpfsUri = await erc1155MaticTestnet.uri(tokenIds[0]);
        let cid = tokenIpfsUri.match(/ipfs:\/\/(?<cid>\w+)/).groups.cid;
        let tokenHtmlUri = `https://gateway.pinata.cloud/ipfs/${cid}`;

        try {

          let tokenUriResponse = await fetch(tokenHtmlUri);
          // Serialize JSON from response and check for required fields
          let tokenMetadata = await tokenUriResponse.json();

          expect(tokenMetadata).to.include.keys(...testData.metadataKeys);

        } catch (err) {

          expect.fail('Token URI could not be fetched from IPFS');

        };

      });

      /** TOKEN BALANCE & TRANSFER TESTS*/
      it('Tokens should be minted to the owner\'s address and be transferable', async function () {
        
        // Check token balances of owner and guest account post-mint
        let ownerBalances = await erc1155MaticTestnet.balanceOfBatch(
          Array(tokenIds.length).fill(owner.address),
          tokenIds
        );
        ownerBalances = ownerBalances.map((x) => x.toNumber());
        let guestBalances = await erc1155MaticTestnet.balanceOfBatch(
          Array(tokenIds.length).fill(guest.address),
          tokenIds
        );
        guestBalances = guestBalances.map((x) => x.toNumber());

        expect(ownerBalances).to.eql(tokenSupplies);
        expect(guestBalances.every((x) => x == 0)).to.be.true;

        // Transfer one NFT of tokenId 0 from owner to guest
        await erc1155MaticTestnet.safeTransferFrom(
          owner.address,
          guest.address,
          tokenIds[0],
          1,
          NULL_ADDRESS
        );

        ownerBalances[0] = await erc1155MaticTestnet.balanceOf(owner.address, tokenIds[0]);
        ownerBalances[0] = ownerBalances[0].toNumber();
        guestBalances[0] = await erc1155MaticTestnet.balanceOf(guest.address, tokenIds[0]);
        guestBalances[0] = guestBalances[0].toNumber();

        expect(ownerBalances[0]).to.equal(tokenSupplies[0] - 1);
        expect(guestBalances[0]).to.equal(1);

        // Batch transfer one NFT of each other tokenId from owner to guest
        await erc1155MaticTestnet.safeBatchTransferFrom(
          owner.address,
          guest.address,
          tokenIds.slice(1),
          Array(tokenIds.slice(1).length).fill(1),
          NULL_ADDRESS
        );
        guestBalances = await erc1155MaticTestnet.balanceOfBatch(
          Array(tokenIds.length).fill(guest.address),
          tokenIds
        );
        guestBalances = guestBalances.map((x) => x.toNumber());

        expect(guestBalances.every((x) => x == 1)).to.be.true;

      });

      /** OPERATOR APPROVAL TESTS*/
      it(`Approval should be compatible with designated operator (OpenSea).
          Operator should be able to transfer tokens on behalf of any address.
          Approved operator should be revokable by the owner, if required`,
          async function () {

        expect(await erc1155MaticTestnet.isApprovedForAll(guest.address, owner.address)).to.be.false;

        let openSeaAddress = '0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101'
        let isApprovedForAll = await erc1155MaticTestnet.isApprovedForAll(guest.address, openSeaAddress);
        expect(isApprovedForAll).to.be.true;

        // TODO Transfer tokens back from guest to owner

        // TODO Revoke approval

      });

      /** ROYALTY TESTS*/
      it('Royalty info should need to be set to the owner', async function () {

        let feeDenominator = 10000;
        let royaltyFraction = 0; // 0 bips = 0%
        let [royaltyReceiver, royaltyAmount] = await erc1155MaticTestnet.royaltyInfo(0, 1000000);
        expect(royaltyReceiver).to.equal(NULL_ADDRESS);
        expect(ethers.utils.formatEther(royaltyAmount * feeDenominator)).to.equal(ethers.utils.formatEther(royaltyFraction));

        royaltyFraction = 100000; // 10000 bips = 100%
        await expect(erc1155MaticTestnet.setDefaultRoyalty(royaltyFraction)).to.be.reverted;

        royaltyFraction = 500; // 500 bips = 5%
        await erc1155MaticTestnet.setDefaultRoyalty(royaltyFraction);
        [royaltyReceiver, royaltyAmount] = await erc1155MaticTestnet.royaltyInfo(0, ONE_ETH);
        expect(royaltyReceiver).to.equal(owner.address);
        expect(ethers.utils.formatEther(royaltyAmount) * feeDenominator).to.equal(royaltyFraction);

      });

    });

  });

});
