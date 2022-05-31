//

const fs = require('fs');

const { expect } = require('chai');
const { ethers } = require('hardhat');


const testDataRaw = fs.readFileSync('test/data.json');
const testData = JSON.parse(testDataRaw);

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ONE_ETH = ethers.BigNumber.from('1000000000000000000');


describe('ERC-1155 Metic Testnet contract deployment', function () {

  it('Contract should compile and deploy', async function () {

    // const provider = ethers.getDefaultProvider();
    // const owner = new ethers.Wallet(process.env.MASANGRI_TESTNET_PRIVATE_KEY, provider);

    const [owner, guest] = await ethers.getSigners();

    const ERC1155MaticTestnet = await ethers.getContractFactory('ERC1155MaticTestnet');
    const erc1155MaticTestnet = await ERC1155MaticTestnet.deploy();
    await erc1155MaticTestnet.deployed();
    
    describe('ERC-1155 Metic Testnet contract interactions', function () {

      /** CONTRACT PROPERTY TESTS*/
      it('The hard-coded values in the contract should be corect', async function () {

        // Deployment address and contract woner address should match the public key in test data file
        expect(owner.address).to.equal(testData.owner);
        expect(await erc1155MaticTestnet.owner()).to.equal(testData.owner)
      
      });

      /** MINTING TESTS*/
      it('Only owner should be able to mint NFTs, once and only once per tokenId', async function () {

        // Mint tokenId 0
        await expect(erc1155MaticTestnet.connect(guest).mint(
          guest.address,
          0,
          10,
          NULL_ADDRESS
        )).to.be.reverted;

        expect(await erc1155MaticTestnet.mint(
          owner.address,
          0,
          10,
          NULL_ADDRESS
        )).to.emit('TransferSingle');

        // Batch mnint remaining TokenIds
        await expect(erc1155MaticTestnet.connect(guest).mintBatch(
          guest.address,
          [1, 2, 3, 4, 5, 6],
          [10, 10, 5, 5, 1, 1],
          NULL_ADDRESS
        )).to.be.reverted;

        expect(await erc1155MaticTestnet.mintBatch(
          owner.address,
          [1, 2, 3, 4, 5, 6],
          [10, 10, 5, 5, 1, 1],
          NULL_ADDRESS
        )).to.emit('TransferBatch');

        // Attempt to mint more after initial mint
        await expect(erc1155MaticTestnet.mint(
          owner.address,
          0,
          1000000,
          NULL_ADDRESS
        )).to.be.reverted;

      });

      /** TOKEN URI (METADATA) TESTS*/
      it('Only owner should be able to set metadata URIs, once and only once per tokenId', async function () {

        let tokenURIs = testData.tokenURIs;
        
        // Set URI for tokenId 0
        await expect(erc1155MaticTestnet.connect(guest).setTokenURI(
          0,
          tokenURIs[0],
        )).to.be.reverted;

        expect(await erc1155MaticTestnet.setTokenURI(
          0,
          tokenURIs[0],
        )).to.emit('PermanentURI');

        // Batch set URI for remaining TokenIds
        

        // Attempt to set URI for a TokenId with URI already set
        await expect(erc1155MaticTestnet.setTokenURI(
          0,
          ""
        )).to.be.reverted;

      });

      it('Royalty should need to be set to the owner', async function () {

        /** ROYALTY TESTS*/

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

      it('Should be comaptible with OpenSea', async function () {

        /** APPROVAL TESTS*/

        expect(await erc1155MaticTestnet.isApprovedForAll(guest.address, owner.address)).to.be.false;

        let openSeaAddress = '0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101'
        let isApprovedForAll = await erc1155MaticTestnet.isApprovedForAll(guest.address, openSeaAddress);
        expect(isApprovedForAll).to.be.true;

      });

    });

  });

});
