// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
const {
    writeConfig
} = require('./utils/helper')

async function main() {

    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log(
        "Deploying the contracts with the account:",
        await deployer.getAddress()
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    //solidity version：0.4.18
    const WETH9 = await ethers.getContractFactory("WETH9");
    const weth9 = await WETH9.deploy();
    await weth9.deployed();

    writeConfig('0config', '0config', 'weth9', weth9.address);
    console.log("WETH9 address:", weth9.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
