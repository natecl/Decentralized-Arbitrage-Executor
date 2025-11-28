// pages/api/prices.js
import axios from "axios";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const UNISWAP_PAIR_ADDRESS = process.env.NEXT_PUBLIC_UNISWAP_PAIR_ADDRESS;
const UNISWAP_PAIR_ABI = ["function getReserves() view returns (uint112, uint112, uint32)","function token0() view returns (address)","function token1() view returns (address)"];

export default async function handler(req, res) {
  try {
    const [bin, cb, ku] = await Promise.all([
      axios.get("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"),
      axios.get("https://api.coinbase.com/v2/prices/ETH-USD/spot"),
      axios.get("https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=ETH-USDT")
    ]);

    let dex = null;
    try {
      if (UNISWAP_PAIR_ADDRESS) {
        const pair = new ethers.Contract(UNISWAP_PAIR_ADDRESS, UNISWAP_PAIR_ABI, provider);
        const r = await pair.getReserves();
        dex = Number(r[1]) / Number(r[0]);
      }
    } catch (e) { /* ignore */ }

    res.status(200).json({
      binance: parseFloat(bin.data.price),
      coinbase: parseFloat(cb.data.data.amount),
      kucoin: parseFloat(ku.data.data.price),
      dex: dex || parseFloat(cb.data.data.amount)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
