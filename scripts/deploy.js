require('dotenv').config({ path: '.env.clean' });
const hre = require("hardhat");

async function main() {
    const v2 = process.env.UNISWAP_V2;
    const v3 = process.env.UNISWAP_V3;

    console.log("Uniswap V2:", v2);
    console.log("Uniswap V3:", v3);

    if (!v2.startsWith('0x') || !v3.startsWith('0x')) throw new Error("Invalid router addresses");

    const Factory = await hre.ethers.getContractFactory("ArbitrageExecutor");
    const contract = await Factory.deploy(v2, v3);

    console.log("ArbitrageExecutor deployed at:", contract.target);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
