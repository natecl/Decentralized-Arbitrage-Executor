require('dotenv').config();  // <- now reads .env by default
const hre = require('hardhat');
const { ethers } = hre;

async function main() {
    // ------------------------------
    // CONFIG FROM ENV
    // ------------------------------
    const contractAddress = process.env.CONTRACT;
    const tokenInAddress = process.env.TOKEN_IN;
    const tokenOutAddress = process.env.TOKEN_OUT;

    // Amounts to deposit / swap
    const depositAmount = ethers.parseUnits("10", 18);    // 10 WETH (18 decimals)
    const swapAmount = ethers.parseUnits("5", 18);        // Swap 5 WETH

    // ------------------------------
    // SETUP PROVIDER AND WALLET
    // ------------------------------
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // ------------------------------
    // GET CONTRACT INSTANCE
    // ------------------------------
    const ArbitrageExecutor = await ethers.getContractAt(
        "ArbitrageExecutor",
        contractAddress,
        wallet
    );

    // ------------------------------
    // APPROVE AND DEPOSIT TOKEN_IN
    // ------------------------------
    const tokenIn = await ethers.getContractAt("IERC20", tokenInAddress, wallet);

    console.log(`Approving ${depositAmount} of tokenIn...`);
    const approveTx = await tokenIn.approve(contractAddress, depositAmount);
    await approveTx.wait();
    console.log("Approval complete.");

    console.log(`Depositing ${depositAmount} of tokenIn to contract...`);
    const depositTx = await ArbitrageExecutor.deposit(tokenInAddress, depositAmount);
    await depositTx.wait();
    console.log("Deposit complete.");

    // ------------------------------
    // EXECUTE SWAP
    // ------------------------------
    console.log(`Swapping ${swapAmount} tokenIn -> tokenOut...`);
    const swapTx = await ArbitrageExecutor.executeSwap(tokenInAddress, tokenOutAddress, swapAmount);
    const receipt = await swapTx.wait();

    const swapEvent = receipt.events.find(e => e.event === "SwapExecuted");
    if (swapEvent) {
        console.log(`Swap executed! AmountIn: ${swapEvent.args.amountIn}, AmountOut: ${swapEvent.args.amountOut}`);
    } else {
        console.log("SwapExecuted event not found.");
    }

    // ------------------------------
    // WITHDRAW tokenOut
    // ------------------------------
    console.log("Withdrawing tokenOut to wallet...");
    const amountOut = swapEvent.args.amountOut;
    const withdrawTx = await ArbitrageExecutor.withdrawToken(tokenOutAddress, amountOut);
    await withdrawTx.wait();
    console.log("Withdrawal complete.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
