// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const {
    readConfig,
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

    //solidity version：0.5.16
    await factory();
}

//solidity version：0.5.16
async function factory(){
    const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    const weth9 = await readConfig('0config', 'weth9');
    
    const uniswapV2Factory = await UniswapV2Factory.deploy(weth9);
    await uniswapV2Factory.deployed();

    writeConfig('0config', '0config', 'uniswapV2Factory', uniswapV2Factory.address);
    console.log("UniswapV2Factory address:", uniswapV2Factory.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
