// app/dashboard/page.jsx (Next.js)
"use client";

import { useEffect, useState } from "react";
import { Box, VStack } from "@chakra-ui/react";
import PriceChart from "@/components/PriceChart";
import ProfitChart from "@/components/ProfitChart";

export default function Dashboard() {
    const [priceData, setPriceData] = useState([]);
    const [profitData, setProfitData] = useState([]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await fetch("/api/prices");   // your API route
            const prices = await res.json();

            setPriceData(prev => [...prev.slice(-30), prices]); // keep 30 pts

            const res2 = await fetch("/api/profits");
            const profits = await res2.json();

            setProfitData(prev => [...prev.slice(-30), profits]);

        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Box p={6}>
            <VStack spacing={8}>
                <PriceChart data={priceData} />
                <ProfitChart data={profitData} />
            </VStack>
        </Box>
    );
}
