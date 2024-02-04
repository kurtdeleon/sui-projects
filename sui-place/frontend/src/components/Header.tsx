import { formatAddress } from "@mysten/sui.js";
import { ConnectButton, useWalletKit } from "@mysten/wallet-kit";
import Image from "next/image";

export default function Header() {
  const { currentAccount, isConnected } = useWalletKit();

  return (
    <header className="flex items-center gap-1">
      <Image
        src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f17f.svg"
        alt="sui place"
        height={24}
        width={24}
      />
      <span className="text-[#24649c]">
        place <span className="text-xs opacity-75">sui/devnet</span>
      </span>
      <ConnectButton
        className="ml-auto"
        connectText={"Connect Wallet"}
        connectedText={`Connected: ${formatAddress(
          currentAccount?.address ?? ""
        )}`}
        style={{
          backgroundColor: isConnected ? "white" : "#24649c",
          padding: "6px 8px",
          fontSize: "12px",
          color: isConnected ? "#24649c" : "white",
        }}
        size="md"
      />
    </header>
  );
}
