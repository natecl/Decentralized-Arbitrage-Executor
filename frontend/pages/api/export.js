// pages/api/export.js
import axios from "axios";
import { Parser } from "json2csv";

export default async function handler(req, res) {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: "unauthorized" });
  try {
    const r = await axios.get(`${process.env.BOT_SERVER_URL}/history`);
    const fields = ["time","tx","source","amountIn","amountOut","profit"];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(r.data);
    res.setHeader("Content-Disposition", `attachment; filename="arbitrage_history_${Date.now()}.csv"`);
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
