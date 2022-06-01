//

require('dotenv').config();
require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: "0.8.4",
  etherscan: {
    api: process.env.ETHERSCAN_API_KEY
  },
  networks: {
    hardhat: {
      accounts: [
        {
          'privateKey': process.env.TESTNET_PRIVATE_KEY,
          'balance': '1000000000000000000'
        },
        {
          'privateKey': 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
          'balance': '1000000000000000000'
        }
        // {
        //   'privateKey': '59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': 'dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': 'f214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': 'a267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': 'c526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': 'ea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': '689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': 'de9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0',
        //   'balance': '1000000000000000000'
        // },
        // {
        //   'privateKey': 'df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e',
        //   'balance': '1000000000000000000'
        // }
      ]
    },
    mainnet: {
      accounts: [process.env.TESTNET_PRIVATE_KEY],
      chainId: 1,
      url: process.env.ALCHEMY_MAINNET_HTTP,
    },
    // matic: {
    //   accounts: [process.env.PRIVATE_KEY],
    //   url: "https://rpc-mumbai.maticvigil.com",
    // },
    rinkeby: {
      accounts: [process.env.TESTNET_PRIVATE_KEY],
      url: process.env.ALCHEMY_RINKEBY_HTTP,
    }
  }
};
