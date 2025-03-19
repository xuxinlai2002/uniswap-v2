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

    //solidity version：0.6.6
    await uniswapV2Router02();
}

//solidity version：0.6.6
async function uniswapV2Router02(){
    const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");

    // constructor(address _factory, address _WETH) public {
    //     factory = _factory;
    //     WETH = _WETH;
    // }

    const uniswapV2Factory = await readConfig('0config', 'uniswapV2Factory');
    const weth9 = await readConfig('0config', 'weth9');
    const uniswapV2Router02 = await UniswapV2Router02.deploy(uniswapV2Factory, weth9);

    await uniswapV2Router02.deployed();

    writeConfig('0config', '0config', 'uniswapV2Router02', uniswapV2Router02.address);
    console.log("UniswapV2Router02 address:", uniswapV2Router02.address);
    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
