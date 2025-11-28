import axios from "axios";

export default async function handler(req, res) {
  const binance = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT");
  const coinbase = await axios.get("https://api.coinbase.com/v2/prices/ETH-USD/spot");
  const kucoin = await axios.get("https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=ETH-USDT");

  res.status(200).json({
    binance: parseFloat(binance.data.price),
    coinbase: parseFloat(coinbase.data.data.amount),
    kucoin: parseFloat(kucoin.data.data.price),
    uniswap: 0 // optionally fetch from on-chain
  });
}
