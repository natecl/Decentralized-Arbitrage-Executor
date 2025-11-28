import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function ArbitrageHistory({ contractAddress, contractABI }) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const fetchEvents = async () => {
      const filter = contract.filters.SwapExecuted(); // your contract event
      const logs = await contract.queryFilter(filter, 0, "latest");
      setEvents(logs.map(e => ({
        caller: e.args.caller,
        tokenIn: e.args.tokenIn,
        tokenOut: e.args.tokenOut,
        amountIn: ethers.utils.formatUnits(e.args.amountIn, 18),
        amountOut: ethers.utils.formatUnits(e.args.amountOut, 6),
      })));
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>Arbitrage History</h3>
      <ul>
        {events.map((ev, i) => (
          <li key={i}>
            {ev.caller} swapped {ev.amountIn} {ev.tokenIn} → {ev.amountOut} {ev.tokenOut}
          </li>
        ))}
      </ul>
    </div>
  );
}
