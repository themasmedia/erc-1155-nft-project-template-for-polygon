// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
//


require('dotenv').config();

const { ethers, hre } = require("hardhat");

const PROJECT_NAME = 'ERC1155TestProject';
const PROJECT_SYMBOL = 'TEST';
const ROYALTY_FRACTION = 0;


async function main() {
  //

  // We get the contract to deploy
  const provider = ethers.getDefaultProvider();
  const ownerWallet = new ethers.Wallet(process.env.TESTNET_PRIVATE_KEY, provider);

  //
  const [owner, guest] = await ethers.getSigners();

  //
  console.log(await ownerWallet.getAddress());
  console.log(owner.address, guest.address);

  //
  const ProjectContract = await ethers.getContractFactory(PROJECT_NAME);
  const projectContract = await ProjectContract.deploy(PROJECT_NAME, PROJECT_SYMBOL, ROYALTY_FRACTION);
  await projectContract.deployed();

}


//
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
