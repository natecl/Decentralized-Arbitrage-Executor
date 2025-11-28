import WalletConnect from "../components/WalletConnect";
import Prices from "../components/Prices";
import ArbitrageHistory from "../components/ArbitrageHistory";
import DepositFunds from "../components/DepositFunds";
import { ARBITRAGE_CONTRACT_ADDRESS, ARBITRAGE_CONTRACT_ABI } from "../config";

export default function Dashboard() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Arbitrage Dashboard</h1>
      <WalletConnect />
      <DepositFunds contractAddress={ARBITRAGE_CONTRACT_ADDRESS} contractABI={ARBITRAGE_CONTRACT_ABI} />
      <Prices />
      <ArbitrageHistory contractAddress={ARBITRAGE_CONTRACT_ADDRESS} contractABI={ARBITRAGE_CONTRACT_ABI} />
      <button onClick={() => alert("Simulation Triggered!")}>Trigger Simulation</button>
    </div>
  );
}
