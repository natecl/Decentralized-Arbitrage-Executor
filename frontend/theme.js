// frontend/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      100: "#E0FFF9",
      200: "#B2F5EA",
      500: "#38B2AC",
      700: "#2C7A7B",
      900: "#234E52",
    },
    accent: {
      100: "#FFFAF0",
      500: "#ED8936",
      700: "#C05621",
    },
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "white",
      },
      a: {
        color: "brand.500",
      },
    },
  },
});

export default theme;
