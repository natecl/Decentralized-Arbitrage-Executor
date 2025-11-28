import React from "react";

export default function ArbitrageHistoryTable({ history }) {
  return (
    <div className="history-table">
      <h2>Arbitrage History</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Buy Exchange</th>
            <th>Sell Exchange</th>
            <th>Profit</th>
          </tr>
        </thead>
        <tbody>
          {history?.map((row, i) => (
            <tr key={i}>
              <td>{row.timestamp}</td>
              <td>{row.buy}</td>
              <td>{row.sell}</td>
              <td>{row.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
