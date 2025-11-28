// bot/index.js

const axios = require("axios");
const { ethers } = require("ethers");

// ---------- CONFIG ---------- //
const ALCHEMY_API_KEY = "jJ3Cd3CKOgVl74kgW91B6"; // <-- replace with your Alchemy key
const PROVIDER = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

const UNISWAP_PAIR_ADDRESS = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc"; // WETH/USDT
const UNISWAP_PAIR_ABI = [
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() view returns (address)",
    "function token1() view returns (address)"
];

const THRESHOLD = 0.005; // 0.5% arbitrage threshold
const CHECK_INTERVAL = 5000; // 5 seconds
const CEX_NAMES = ["Binance", "Coinbase", "KuCoin"];

// ---------- PRICE FETCHING FUNCTIONS ---------- //

async function getBinancePrice(symbol = "ETHUSDT") {
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const res = await axios.get(url);
    return parseFloat(res.data.price);
}

async function getCoinbasePrice(symbol = "ETH-USD") {
    const url = `https://api.coinbase.com/v2/prices/${symbol}/spot`;
    const res = await axios.get(url);
    return parseFloat(res.data.data.amount);
}

async function getKuCoinPrice(symbol = "ETH-USDT") {
    const url = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`;
    const res = await axios.get(url);
    return parseFloat(res.data.data.price);
}

async function getUniswapPrice() {
    const pair = new ethers.Contract(UNISWAP_PAIR_ADDRESS, UNISWAP_PAIR_ABI, PROVIDER);
    const [reserve0, reserve1] = await pair.getReserves();
    return reserve1 / reserve0; // USDT per WETH
}

// ---------- SAFE FETCH HELPER ---------- //

async function safeGetPrice(fetchFn, symbol) {
    try {
        return await fetchFn(symbol);
    } catch (err) {
        console.error(`Error fetching ${symbol}:`, err.message);
        return null; // skip if failed
    }
}

// ---------- ARBITRAGE CHECK ---------- //

async function checkArbitrage() {
    const binance = await safeGetPrice(getBinancePrice, "ETHUSDT");
    const coinbase = await safeGetPrice(getCoinbasePrice, "ETH-USD");
    const kucoin = await safeGetPrice(getKuCoinPrice, "ETH-USDT");
    const uniswap = await getUniswapPrice();

    const cexPrices = [binance, coinbase, kucoin];
    
    cexPrices.forEach((cexPrice, i) => {
        if (cexPrice === null) return; // skip failed fetch
        const cex = CEX_NAMES[i];

        if (cexPrice < uniswap * (1 - THRESHOLD)) {
            console.log(new Date().toISOString(), `Arbitrage opportunity! Buy on ${cex} at ${cexPrice}, sell on Uniswap at ${uniswap}`);
        } else if (cexPrice > uniswap * (1 + THRESHOLD)) {
            console.log(new Date().toISOString(), `Arbitrage opportunity! Buy on Uniswap at ${uniswap}, sell on ${cex} at ${cexPrice}`);
        }
    });
}

// ---------- MAIN LOOP ---------- //

async function main() {
    console.log("Arbitrage bot started...");
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
