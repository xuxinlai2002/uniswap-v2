const {
    readConfig,
    writeConfig
} = require('./utils/helper')

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "Adding liquidity with ETH using account:",
        await deployer.getAddress()
    );

    const token1Address = await readConfig('0config', 'token1');
    const routerAddress = await readConfig('0config', 'uniswapV2Router02');

    const token = await ethers.getContractAt("Token", token1Address);
    const router = await ethers.getContractAt("UniswapV2Router02", routerAddress);

    // 设置添加流动性的参数
    const amountTokenDesired = ethers.utils.parseEther("1"); // 1个代币
    const amountETHDesired = ethers.utils.parseEther("0.1"); // 0.1 ETH
    const amountTokenMin = 0; // 最小代币数量
    const amountETHMin = 0; // 最小ETH数量
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20分钟后过期

    // 检查授权
    const allowance = await token.allowance(deployer.address, router.address);
    console.log("xxl allowance", allowance);
    if (allowance.lt(amountTokenDesired)) {
        console.log("Approving token for router...");
        const approveTx = await token.approve(router.address, amountTokenDesired);
        await approveTx.wait();
        console.log("Token approved successfully");
    }

    // 添加流动性
    console.log("Adding liquidity with ETH...");
    const tx = await router.addLiquidityETH(
        token.address,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        deployer.address,
        deadline,
        {
            value: amountETHDesired, // 发送ETH
            gasLimit: 8000000
        }
    );

    console.log("Transaction sent:", tx.hash);
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