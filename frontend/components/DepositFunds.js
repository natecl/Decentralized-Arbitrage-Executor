import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useState } from "react";

export default function DepositFunds({ contractAddress, contractABI }) {
  const { isConnected, address, connector } = useAccount();
  const [amount, setAmount] = useState("");

  const deposit = async () => {
    if (!isConnected) return alert("Connect wallet first");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.deposit({ value: ethers.utils.parseEther(amount) });
    await tx.wait();
    alert("Deposit successful!");
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Amount ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={deposit}>Deposit</button>
    </div>
  );
}
