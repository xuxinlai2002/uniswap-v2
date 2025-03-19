// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
const {
    readConfig,
    writeConfig
} = require('./utils/helper')

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "Swapping tokens with the account:",
        await deployer.getAddress()
    );

    // 读取配置
    const config = readConfig();
    const token1 = await ethers.getContractAt("IERC20", config.token1);
    const token2 = await ethers.getContractAt("IERC20", config.token2);
    const router = await ethers.getContractAt("IUniswapV2Router02", config.router);

    // 设置交换参数
    const amountIn = ethers.utils.parseEther("0.1"); // 输入0.1个代币
    const amountOutMin = 0; // 最小输出数量，可以根据需要设置
    const path = [token1.address, token2.address]; // 交换路径：token1 -> token2
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20分钟后过期

    // 授权router使用token1
    console.log("Approving token1 for router...");
    await token1.approve(router.address, amountIn);

    // 执行交换
    console.log("Swapping tokens...");
    const tx = await router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        deployer.address,
        deadline
    );

    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("Swap completed successfully!");
    console.log("Transaction hash:", receipt.transactionHash);

    // 获取交换后的余额
    const token2Balance = await token2.balanceOf(deployer.address);
    console.log("Token2 balance after swap:", ethers.utils.formatEther(token2Balance));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
