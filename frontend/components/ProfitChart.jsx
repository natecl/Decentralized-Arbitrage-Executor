// components/ProfitChart.jsx
"use client";
import { Card, CardHeader, CardBody } from "@chakra-ui/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function ProfitChart({ data }) {
    return (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Card bg="gray.800" borderRadius="2xl" shadow="2xl">
                <CardHeader fontSize="xl" fontWeight="bold" color="white">
                    Profit Trend Over Time
                </CardHeader>

                <CardBody>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data}>
                            <XAxis dataKey="time" stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey="profit"
                                stroke="#4FD1C5"
                                fill="#4FD1C522"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </motion.div>
    );
}
