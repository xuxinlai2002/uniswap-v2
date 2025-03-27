const { ethers } = require("hardhat");

async function main() {
  // 获取 UniswapV2Pair 合约工厂
  const UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
  
  // 获取合约的字节码
  const bytecode = UniswapV2Pair.bytecode;
  
  // 计算 init code hash
  const initCodeHash = ethers.utils.keccak256(bytecode);
  
  console.log("Init Code Hash:", initCodeHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 