//

require('dotenv').config();
require('@nomiclabs/hardhat-waffle');

//
let alchemyUrl = process.env.ALCHEMY_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` : null;
let infuraUrl = process.env.INFURA_API_KEY ? `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}` : null;
const RPC_URL = alchemyUrl || infuraUrl;

if (!RPC_URL) {
  throw new Error('No Alchemy or Infura API key found');
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  solidity: '0.8.4',
  etherscan: {
    apiKey: {
      polygon: `https://api.polygonscan.com/${process.env.POLYGONSCAN_API_KEY}`,
      polygonMumbai: `https://api-testnet.polygonscan.com/${process.env.POLYGONSCAN_API_KEY}`,
    },
  },
  networks: {
    hardhat: {
      accounts: [
        {
          'privateKey': process.env.OWNER_PRIVATE_KEY,
          'balance': '1000000000000000000'
        },
        {
          'privateKey': 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
          'balance': '1000000000000000000'
        }
      ],
      forking: {
        url: RPC_URL
      }
    },
    polygon: {
      accounts: [
        process.env.OWNER_PRIVATE_KEY,
      ],
      chainId: 137,
      url: RPC_URL
    },
    polygonMumbai: {
      accounts: [
        process.env.OWNER_PRIVATE_KEY,
        process.env.GUEST_PRIVATE_KEY,
      ],
      chainId: 80001,
      url: RPC_URL
    },
  }
};
