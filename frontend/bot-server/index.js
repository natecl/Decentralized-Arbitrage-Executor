// bot-server/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let lastProfit = 0;
let running = true;
const history = []; // in-memory; persist to DB in prod

app.get("/status", (req, res) => {
  res.json({ running, lastCheck: new Date().toISOString() });
});

app.get("/profit", (req, res) => {
  res.json({ instant: lastProfit });
});

app.get("/history", (req, res) => {
  res.json(history);
});

app.post("/log", (req, res) => {
  const entry = {
    time: new Date().toISOString(),
    ...req.body
  };
  history.unshift(entry);
  if (history.length > 1000) history.pop();
  if (entry.profit) lastProfit = entry.profit;
  res.json({ ok: true });
});

app.post("/simulate", (req, res) => {

  res.json({ ok: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log("Bot server listening", port));
