// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
const {
    readConfig
} = require('./utils/helper')

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "Adding liquidity with the account:",
        await deployer.getAddress()
    );

    // 读取配置
  
    const token1Address = await readConfig('0config', 'token1');
    const token2Address = await readConfig('0config', 'token2');
    const routerAddress = await readConfig('0config', 'uniswapV2Router02');

    const token1 = await ethers.getContractAt("IERC20", token1Address);
    const token2 = await ethers.getContractAt("IERC20", token2Address);
    const router = await ethers.getContractAt("IUniswapV2Router02", routerAddress);

    // 设置添加流动性的参数
    const amount1 = ethers.utils.parseEther("1"); // 1 ETH
    const amount2 = ethers.utils.parseEther("1"); // 1 token2
    const amount1Min = 0; // 最小接受数量
    const amount2Min = 0; // 最小接受数量
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20分钟后过期

    // 授权router使用token
    console.log("Approving tokens...");
    await token1.approve(router.address, amount1);
    await token2.approve(router.address, amount2);

    // 添加流动性
    console.log("Adding liquidity...");
    const tx = await router.addLiquidity(
        token1.address,
        token2.address,
        amount1,
        amount2,
        amount1Min,
        amount2Min,
        deployer.address,
        deadline
    );

    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("Liquidity added successfully!");
    console.log("Transaction hash:", receipt.transactionHash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
