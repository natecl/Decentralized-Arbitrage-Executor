require("dotenv").config();
const axios = require("axios");
const { ethers } = require("ethers");

// ---------- CONFIG ----------
const PROVIDER = new ethers.JsonRpcProvider(process.env.RPC_URL);
const WALLET = new ethers.Wallet(process.env.PRIVATE_KEY);
const SIGNER = WALLET.connect(PROVIDER);

const UNISWAP_V2_ADDRESS = process.env.UNISWAP_V2;
const UNISWAP_V3_ADDRESS = process.env.UNISWAP_V3;

const UNISWAP_PAIR_ABI = [
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() view returns (address)",
    "function token1() view returns (address)"
];

const THRESHOLD = 0.005; // 0.5%
const SLIPPAGE_PERCENT = 0.5; // 0.5%
const CHECK_INTERVAL = 5000; 
const CEX_NAMES = ["Binance", "Coinbase", "KuCoin"];

// Smart contract
const ARBITRAGE_CONTRACT_ADDRESS = process.env.CONTRACT;
const ARBITRAGE_CONTRACT_ABI = [ /* paste your ABI here */ ];
const contract = new ethers.Contract(ARBITRAGE_CONTRACT_ADDRESS, ARBITRAGE_CONTRACT_ABI, SIGNER);

// Tokens from .env
const TOKEN_IN = process.env.TOKEN_IN;
const TOKEN_OUT = process.env.TOKEN_OUT;
const TOKEN_DECIMALS_IN = parseInt(process.env.TOKEN_DECIMALS_IN || "18");
const TOKEN_DECIMALS_OUT = parseInt(process.env.TOKEN_DECIMALS_OUT || "6");

// Map token addresses to symbols for CEXes
const TOKEN_SYMBOLS = {
    [TOKEN_IN.toLowerCase()]: "ETH",
    [TOKEN_OUT.toLowerCase()]: "USDC"
};

// ---------- DYNAMIC CEX SYMBOLS ----------
function getCEXSymbol(tokenInAddr, tokenOutAddr, exchange) {
    const inSym = TOKEN_SYMBOLS[tokenInAddr.toLowerCase()];
    const outSym = TOKEN_SYMBOLS[tokenOutAddr.toLowerCase()];
    switch (exchange) {
        case "Binance":
        case "KuCoin":
            return `${inSym}${outSym}`;
        case "Coinbase":
            return `${inSym}-${outSym}`;
        default:
            throw new Error("Unknown exchange for symbol generation");
    }
}

// ---------- PRICE FETCHING ----------
async function getPriceFromCEX(exchange) {
    const symbol = getCEXSymbol(TOKEN_IN, TOKEN_OUT, exchange);
    try {
        switch (exchange) {
            case "Binance": {
                const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
                return parseFloat(res.data.price);
            }
            case "Coinbase": {
                const res = await axios.get(`https://api.coinbase.com/v2/prices/${symbol}/spot`);
                return parseFloat(res.data.data.amount);
            }
            case "KuCoin": {
                const res = await axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`);
                return parseFloat(res.data.data.price);
            }
        }
    } catch (err) {
        console.error(`Error fetching ${symbol} from ${exchange}:`, err.message);
        return null;
    }
}

// ---------- GET CEX ORDER BOOK SIZE ----------
async function getCEXLiquidity(exchange) {
    const symbol = getCEXSymbol(TOKEN_IN, TOKEN_OUT, exchange);
    try {
        switch (exchange) {
            case "Binance": {
                const res = await axios.get(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=5`);
                const bids = res.data.bids;
                const asks = res.data.asks;
                return Math.min(parseFloat(bids[0][1]), parseFloat(asks[0][1]));
            }
            case "Coinbase": {
                const res = await axios.get(`https://api.coinbase.com/v2/prices/${symbol}/spot`);
                return parseFloat(res.data.data.amount); // approximate liquidity
            }
            case "KuCoin": {
                const res = await axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=${symbol}`);
                const bids = res.data.data.bids;
                const asks = res.data.data.asks;
                return Math.min(parseFloat(bids[0][1]), parseFloat(asks[0][1]));
            }
        }
    } catch (err) {
        console.error(`Error fetching liquidity for ${symbol} on ${exchange}:`, err.message);
        return null;
    }
}

// ---------- UNISWAP V2 PRICE ----------
async function getUniswapV2Price(tokenIn, tokenOut) {
    const pair = new ethers.Contract(UNISWAP_V2_ADDRESS, UNISWAP_PAIR_ABI, PROVIDER);
    const token0 = await pair.token0();
    const token1 = await pair.token1();
    const [reserve0, reserve1] = await pair.getReserves();
    if (token0.toLowerCase() === tokenIn.toLowerCase()) {
        return reserve1 / reserve0;
    } else {
        return reserve0 / reserve1;
    }
}

// ---------- UNISWAP V3 PRICE ----------
async function getUniswapV3Price(tokenIn, tokenOut) {
    const poolContract = new ethers.Contract(
        UNISWAP_V3_ADDRESS,
        ["function slot0() view returns (uint160 sqrtPriceX96)"],
        PROVIDER
    );
    const slot0 = await poolContract.slot0();
    const sqrtPriceX96 = ethers.BigNumber.from(slot0.sqrtPriceX96);

    const numerator = sqrtPriceX96.mul(sqrtPriceX96);
    const denominator = ethers.BigNumber.from(2).pow(192);
    const decimalsFactor = ethers.BigNumber.from(10).pow(TOKEN_DECIMALS_IN - TOKEN_DECIMALS_OUT);
    const priceBN = numerator.mul(decimalsFactor).div(denominator);
    return priceBN;
}

// ---------- SLIPPAGE ----------
function calculateMinOut(amountOutBN, slippagePercent) {
    return amountOutBN.mul(1000 - Math.floor(slippagePercent * 10)).div(1000);
}

// ---------- ON-CHAIN EXECUTION ----------
async function executeArbitrageOnChain(tokenIn, tokenOut, amountIn, expectedOutBN) {
    try {
        const minOut = calculateMinOut(expectedOutBN, SLIPPAGE_PERCENT);
        const gasEstimate = await contract.estimateGas.executeArbitrage(tokenIn, tokenOut, amountIn, minOut);
        const tx = await contract.executeArbitrage(tokenIn, tokenOut, amountIn, minOut, { gasLimit: gasEstimate.mul(2) });
        console.log(new Date().toISOString(), "Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log(new Date().toISOString(), "Transaction confirmed in block", receipt.blockNumber);
    } catch (err) {
        console.error("Error executing arbitrage on-chain:", err);
    }
}

// ---------- ARBITRAGE CHECK WITH PROFIT LOGGING ----------
async function checkArbitrage() {
    const cexPrices = await Promise.all(CEX_NAMES.map(ex => getPriceFromCEX(ex)));
    const cexLiquidity = await Promise.all(CEX_NAMES.map(ex => getCEXLiquidity(ex)));

    const uniswapV2 = await getUniswapV2Price(TOKEN_IN, TOKEN_OUT);
    const uniswapV3BN = await getUniswapV3Price(TOKEN_IN, TOKEN_OUT);
    const dexPriceBN = ethers.BigNumber.from(Math.min(uniswapV2, parseFloat(uniswapV3BN.toString())) * 10 ** TOKEN_DECIMALS_OUT);

    for (let i = 0; i < cexPrices.length; i++) {
        const cexPrice = cexPrices[i];
        const cexAvailable = cexLiquidity[i];
        if (!cexPrice || !cexAvailable) continue;
        const cex = CEX_NAMES[i];

        // Dynamic trade size
        let amountIn = Math.min(0.01, cexAvailable);
        amountIn = ethers.utils.parseUnits(amountIn.toString(), TOKEN_DECIMALS_IN);

        const expectedOutBN = amountIn.mul(dexPriceBN).div(ethers.utils.parseUnits("1", TOKEN_DECIMALS_IN));

        // Profit estimation
        const cexValueBN = amountIn.mul(ethers.utils.parseUnits(cexPrice.toString(), TOKEN_DECIMALS_OUT))
                                 .div(ethers.utils.parseUnits("1", TOKEN_DECIMALS_IN));
        const profitBN = expectedOutBN.sub(cexValueBN);
        const profit = parseFloat(ethers.utils.formatUnits(profitBN, TOKEN_DECIMALS_OUT));

        if (cexPrice < parseFloat(dexPriceBN.toString()) * (1 - THRESHOLD)) {
            console.log(new Date().toISOString(), 
                `Arbitrage: Buy on ${cex} at ${cexPrice}, sell on DEX. Estimated profit: ${profit.toFixed(6)} units`);
            if (profit > 0) {
                await executeArbitrageOnChain(TOKEN_IN, TOKEN_OUT, amountIn, expectedOutBN);
            }
        } else if (cexPrice > parseFloat(dexPriceBN.toString()) * (1 + THRESHOLD)) {
            console.log(new Date().toISOString(), 
                `Arbitrage: Buy on DEX, sell on ${cex} at ${cexPrice}. Estimated profit: ${profit.toFixed(6)} units`);
            if (profit > 0) {
                await executeArbitrageOnChain(TOKEN_OUT, TOKEN_IN, amountIn, expectedOutBN);
            }
        }
    }
}

// ---------- MAIN LOOP ----------
async function main() {
    console.log("Production-ready dynamic arbitrage bot running with profit logging...");
    while (true) {
        try {
            await checkArbitrage();
        } catch (err) {
            console.error("Error in arbitrage check:", err.message);
        }
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
}

main();
