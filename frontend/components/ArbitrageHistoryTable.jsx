// components/ArbitrageHistoryTable.jsx
import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

export default function ArbitrageHistoryTable({ rows = [] }) {
  return (
    <Box bg="gray.800" p={4} borderRadius="md" maxH="70vh" overflow="auto">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Time</Th>
            <Th>Type</Th>
            <Th>Amount In</Th>
            <Th>Amount Out</Th>
            <Th>Tx</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r, i) => (
            <Tr key={i}>
              <Td>{r.time}</Td>
              <Td>{r.source}</Td>
              <Td>{r.amountIn ?? "—"}</Td>
              <Td>{r.amountOut ?? "—"}</Td>
              <Td>{r.tx ? r.tx.substring(0,8) : "—"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
