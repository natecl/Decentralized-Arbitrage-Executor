// pages/index.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Grid, GridItem, VStack, HStack, Heading, Button, Text, Stat, StatLabel, StatNumber, useToast
} from "@chakra-ui/react";
import axios from "axios";
import { format } from "date-fns";
import PriceChart from "../components/PriceChart";     // Recharts components (below)
import ProfitChart from "../components/ProfitChart";
import ArbitrageHistoryTable from "../components/ArbitrageHistoryTable";
import WalletPanel from "../components/WalletPanel";
import ControlsPanel from "../components/ControlsPanel";

export default function Dashboard() {
  const [prices, setPrices] = useState([]);
  const [profits, setProfits] = useState([]);
  const [history, setHistory] = useState([]);
  const [botStatus, setBotStatus] = useState({ running: false, lastCheck: null });
  const toast = useToast();

  // Fetch aggregated info from our own Next API which proxies to CEX/DEX and bot
  const fetchAll = useCallback(async () => {
    try {
      const [pRes, profitRes, statusRes, historyRes] = await Promise.all([
        fetch("/api/prices").then(r => r.json()),
        fetch("/api/profits").then(r => r.json()),
        fetch("/api/bot-status").then(r => r.json()),
        fetch("/api/history").then(r => r.json())
      ]);
      // append and keep limited history
      setPrices(prev => [...prev.slice(-59), { time: format(new Date(), "HH:mm:ss"), ...pRes }]);
      setProfits(prev => [...prev.slice(-199), { time: format(new Date(), "HH:mm:ss"), profit: profitRes.instant || 0 }]);
      setBotStatus(statusRes);
      setHistory(historyRes.slice(0, 200));
    } catch (err) {
      console.error("fetchAll error", err);
      toast({ title: "Data fetch error", description: err.message, status: "error", duration: 3000 });
    }
  }, [toast]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 3000);
    return () => clearInterval(id);
  }, [fetchAll]);

  return (
    <Box p={6} bg="gray.900" minH="100vh" color="white">
      <HStack justify="space-between" align="center" mb={6}>
        <Heading size="md">Arbitrage Dashboard</Heading>
        <WalletPanel />
      </HStack>

      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        <GridItem colSpan={3}>
          <VStack spacing={4} align="stretch">
            <Stat bg="gray.800" p={4} borderRadius="md">
              <StatLabel>Latest DEX Price</StatLabel>
              <StatNumber>{prices.length ? prices[prices.length-1].dex : "—"}</StatNumber>
            </Stat>

            <Stat bg="gray.800" p={4} borderRadius="md">
              <StatLabel>Latest CEX Price (min)</StatLabel>
              <StatNumber>{prices.length ? Math.min(prices[prices.length-1].binance, prices[prices.length-1].coinbase, prices[prices.length-1].kucoin).toFixed(4) : "—"}</StatNumber>
            </Stat>

            <Stat bg="gray.800" p={4} borderRadius="md">
              <StatLabel>Bot Status</StatLabel>
              <StatNumber>{botStatus.running ? `Running (last ${botStatus.lastCheck})` : "Stopped"}</StatNumber>
            </Stat>

            <ControlsPanel refresh={fetchAll} />
          </VStack>
        </GridItem>

        <GridItem colSpan={6}>
          <VStack spacing={4} align="stretch">
            <PriceChart data={prices} />
            <ProfitChart data={profits} />
          </VStack>
        </GridItem>

        <GridItem colSpan={3}>
          <ArbitrageHistoryTable rows={history} />
        </GridItem>
      </Grid>
    </Box>
  );
}
