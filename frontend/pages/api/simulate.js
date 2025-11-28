// pages/api/simulate.js
import axios from "axios";

export default async function handler(req, res) {
  const adminKey = req.headers["x-admin-key"] || req.body?.adminKey;
  if (adminKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: "unauthorized" });
  try {
    const r = await axios.post(`${process.env.BOT_SERVER_URL}/simulate`);
    res.status(200).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
