const {
    readConfig,
    writeConfig
} = require('./utils/helper')

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "Deploying contracts with account:",
        await deployer.getAddress()
    );

    // 部署 WETH
    const WETH = await ethers.getContractFactory("WETH9");
    const weth = await WETH.deploy();
    await weth.deployed();
    console.log("WETH deployed to:", weth.address);

    // 部署 Factory
    const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    const factory = await UniswapV2Factory.deploy(deployer.address);
    await factory.deployed();
    console.log("Factory deployed to:", factory.address);

    // 部署 Router
    const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");
    const router = await UniswapV2Router02.deploy(factory.address, weth.address);
    await router.deployed();
    console.log("Router deployed to:", router.address);

    // 部署测试代币
    const Token = await ethers.getContractFactory("Token");
    const token1 = await Token.deploy("Token1", "TK1", ethers.utils.parseEther("1000000"));
    await token1.deployed();
    console.log("Token1 deployed to:", token1.address);

    const token2 = await Token.deploy("Token2", "TK2", ethers.utils.parseEther("1000000"));
    await token2.deployed();
    console.log("Token2 deployed to:", token2.address);

    // 保存配置
    const config = {
        weth9: weth.address,
        uniswapV2Factory: factory.address,
        uniswapV2Router02: router.address,
        token1: token1.address,
        token2: token2.address
    };
    await writeConfig('0config', config);

    console.log("Waiting for block confirmations...");
    await weth.deployTransaction.wait(5);
    await factory.deployTransaction.wait(5);
    await router.deployTransaction.wait(5);
    await token1.deployTransaction.wait(5);
    await token2.deployTransaction.wait(5);
    console.log("Confirmed!");

    console.log("Verifying contracts...");
    try {
        await run("verify:verify", {
            address: weth.address,
            constructorArguments: [],
        });
        console.log("WETH verified");

        await run("verify:verify", {
            address: factory.address,
            constructorArguments: [deployer.address],
        });
        console.log("Factory verified");

        await run("verify:verify", {
            address: router.address,
            constructorArguments: [factory.address, weth.address],
        });
        console.log("Router verified");

        await run("verify:verify", {
            address: token1.address,
            constructorArguments: ["Token1", "TK1", ethers.utils.parseEther("1000000")],
        });
        console.log("Token1 verified");

        await run("verify:verify", {
            address: token2.address,
            constructorArguments: ["Token2", "TK2", ethers.utils.parseEther("1000000")],
        });
        console.log("Token2 verified");
    } catch (error) {
        console.error("Verification failed:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 