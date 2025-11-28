// pages/api/profits.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.get(`${process.env.BOT_SERVER_URL}/profit`);
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ instant: 0, error: err.message });
  }
}
