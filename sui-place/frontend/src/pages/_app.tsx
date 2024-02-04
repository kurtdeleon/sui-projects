import { WalletKitProvider } from "@mysten/wallet-kit";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletKitProvider>
      <Toaster position="top-center" />
      <Component {...pageProps} />
    </WalletKitProvider>
  );
}
