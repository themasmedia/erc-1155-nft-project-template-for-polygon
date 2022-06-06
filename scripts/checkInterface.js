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

  // Replace with applicable interface name.
  let interfaceName = 'IERC165';
  console.log(await projectContract.interfaceId(interfaceName));
}


//
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
