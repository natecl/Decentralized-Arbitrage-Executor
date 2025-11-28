import { createClient, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";

const { chains, provider } = configureChains(
  [mainnet],
  [publicProvider()]
);

export const wagmiClient = createClient({
  autoConnect: true,
  provider,
});
