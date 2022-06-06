//

require('dotenv').config();

require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// Set RPC URLs
let alchemyMainnetUrl = process.env.ALCHEMY_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` : null;
let alchemyTestnetUrl = process.env.ALCHEMY_API_KEY ? `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` : null;
let infuraMainnetUrl = process.env.INFURA_API_KEY ? `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}` : null;
let infuraTestnetUrl = process.env.INFURA_API_KEY ? `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}` : null;

const RPC_MAINNET_URL = alchemyMainnetUrl || infuraMainnetUrl;
const RPC_TESTNET_URL = alchemyTestnetUrl || infuraTestnetUrl;

if (!RPC_MAINNET_URL && !RPC_TESTNET_URL) {
  throw new Error('No Alchemy or Infura API key found');
}


module.exports = {
  defaultNetwork: 'hardhat',
  solidity: '0.8.4',
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },
  networks: {
    hardhat: {
      accounts: [
        // Owner account for contract deployment
        {
          'privateKey': `0x${process.env.PRIVATE_KEY}`,
          'balance': '1000000000000000000'
        },
        // Guest account for testing (first account from default hardhat node)
        {
          'privateKey': '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
          'balance': '1000000000000000000'
        }
      ],
      forking: {
        url: RPC_MAINNET_URL,
      },
    },
    polygon: {
      accounts: [
        `0x${process.env.PRIVATE_KEY}`,
      ],
      chainId: 137,
      url: RPC_MAINNET_URL,
    },
    polygonMumbai: {
      accounts: [
        `0x${process.env.PRIVATE_KEY}`,
      ],
      chainId: 80001,
      gas: 2100000,
      gasPrice: 8000000000,
      url: RPC_TESTNET_URL,
    },
  },
};
