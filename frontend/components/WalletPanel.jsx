// components/WalletPanel.jsx
import React, { useState } from "react";
import { Button, Text, VStack } from "@chakra-ui/react";
import { ethers } from "ethers";

export default function WalletPanel() {
  const [addr, setAddr] = useState(null);
  const [bal, setBal] = useState(null);

  async function connect() {
    if (!window.ethereum) return alert("Install MetaMask");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const p = new ethers.providers.Web3Provider(window.ethereum);
    const s = p.getSigner();
    const a = await s.getAddress();
    setAddr(a);
    const b = await s.getBalance();
    setBal(ethers.utils.formatEther(b));
  }

  return (
    <VStack align="end">
      {addr ? (
        <>
          <Text fontSize="sm">Connected: {addr.substring(0,6)}...{addr.slice(-4)}</Text>
          <Text fontSize="xs">Balance: {parseFloat(bal).toFixed(4)} ETH</Text>
        </>
      ) : (
        <Button onClick={connect}>Connect Wallet</Button>
      )}
    </VStack>
  );
}
