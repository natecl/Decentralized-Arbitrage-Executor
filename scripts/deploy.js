require('dotenv').config({ path: '.env.clean' });
const hre = require("hardhat");

async function main() {
    const RouterAddress = process.env.UNISWAP_ROUTER;
    console.log("Router address from .env.clean:", RouterAddress);

    if (!RouterAddress || !RouterAddress.startsWith('0x')) {
        throw new Error("Router address is invalid or not loaded correctly!");
    }

    const ArbitrageExecutor = await hre.ethers.getContractFactory("ArbitrageExecutor");
    const contract = await ArbitrageExecutor.deploy(RouterAddress);

    // In ethers v6, contract is already deployed after deploy(), no need for .deployed()
    console.log("ArbitrageExecutor deployed at:", contract.target); 
    // contract.target holds the deployed address in ethers v6
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
