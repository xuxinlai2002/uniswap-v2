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
    await erc20Factory();
}

//solidity version：0.8.0
async function erc20Factory(){
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy('token1', 'token1');
    await token.deployed();

    writeConfig('0config', '0config', 'token1', token.address);
    console.log("erc20 address:", token.address);

    const token2 = await Token.deploy('token2', 'token2');
    await token2.deployed();

    writeConfig('0config', '0config', 'token2', token2.address);
    console.log("erc20 address:", token2.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
