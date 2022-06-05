//
//`yarn hardhat run scripts/checkInterface.js`
//


require('dotenv').config();

const { ethers, hre } = require("hardhat");


async function main() {
  //
  const owner = await ethers.getSigner();

  //
  const ProjectContract = await ethers.getContractFactory('InterfaceChecker', owner);
  const projectContract = await ProjectContract.deploy();
  await projectContract.deployed();

  console.log(await projectContract.interfaceId('IERC165'));
}


//
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
