import { useEffect, useState } from "react";
import axios from "axios";

export default function Prices() {
  const [prices, setPrices] = useState({ binance: 0, coinbase: 0, kucoin: 0, uniswap: 0 });

  const fetchPrices = async () => {
    try {
      const res = await axios.get("/api/prices"); // backend API endpoint
      setPrices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>Real-time Prices</h3>
      <ul>
        {Object.entries(prices).map(([exchange, price]) => (
          <li key={exchange}>{exchange}: {price}</li>
        ))}
      </ul>
    </div>
  );
}
