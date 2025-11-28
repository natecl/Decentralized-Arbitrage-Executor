// pages/api/history.js
import axios from "axios";
export default async function handler(req, res) {
  try {
    const r = await axios.get(`${process.env.BOT_SERVER_URL}/history`);
    res.status(200).json(r.data);
  } catch (err) {
    res.status(500).json([]);
  }
}
