// components/PriceChart.jsx
"use client";
import { Card, CardHeader, CardBody } from "@chakra-ui/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

export default function PriceChart({ data }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Card bg="gray.800" borderRadius="2xl" shadow="xl">
                <CardHeader fontSize="xl" fontWeight="bold" color="white">
                    Live CEX → DEX Price Comparison
                </CardHeader>

                <CardBody>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <XAxis dataKey="time" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip />
                            <Legend />

                            <Line type="monotone" dataKey="binance" stroke="#82ca9d" strokeWidth={2} />
                            <Line type="monotone" dataKey="coinbase" stroke="#8884d8" strokeWidth={2} />
                            <Line type="monotone" dataKey="kucoin" stroke="#ffc658" strokeWidth={2} />
                            <Line type="monotone" dataKey="uniswap" stroke="#ff6b6b" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </motion.div>
    );
}
