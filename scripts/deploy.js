//
//`yarn hardhat run scripts/deploy.js`
//


require('dotenv').config();

const hre = require("hardhat");


const PROJECT_NAME = process.env.PROJECT_NAME;
const PROJECT_SYMBOL = process.env.PROJECT_SYMBOL;
const ROYALTY_FRACTION = process.env.ROYALTY_FRACTION;


async function main() {
  //
  const ProjectContract = await hre.ethers.getContractFactory(PROJECT_NAME);
  const projectContract = await ProjectContract.deploy(PROJECT_NAME, PROJECT_SYMBOL, ROYALTY_FRACTION);
  await projectContract.deployed();

  console.log(`"${PROJECT_NAME}" contract deployed successfully to ${projectContract.address} on the "${hre.network.name}" network!`);
}


//
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
