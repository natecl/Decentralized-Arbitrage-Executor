// components/ControlsPanel.jsx
import React from "react";
import { Button, VStack } from "@chakra-ui/react";
import axios from "axios";

export default function ControlsPanel({ refresh }) {
  async function simulate() {
    try {
      await axios.post("/api/simulate", {}, { headers: { "x-admin-key": process.env.NEXT_PUBLIC_CLIENT_ADMIN_KEY || "" } });
      alert("Simulation triggered");
    } catch (err) {
      alert("Simulate failed: " + err.message);
    }
  }

  async function exportCSV() {
    try {
      const res = await axios.get("/api/export", { responseType: "blob", headers: { "x-admin-key": process.env.NEXT_PUBLIC_CLIENT_ADMIN_KEY || "" } });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `arbitrage_history_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  }

  return (
    <VStack align="stretch">
      <Button onClick={simulate}>Trigger Simulation</Button>
      <Button onClick={refresh}>Refresh Now</Button>
      <Button onClick={exportCSV}>Export CSV</Button>
    </VStack>
  );
}
