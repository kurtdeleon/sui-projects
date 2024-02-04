import { useState } from "react";
import { Connection, JsonRpcProvider } from "@mysten/sui.js";
import { useWalletKit } from "@mysten/wallet-kit";
import Head from "next/head";
import toast from "react-hot-toast";
import { Pixel } from "@/components/Pixel";
import { RPC, AppState } from "@/constants";
import { PixelData } from "@/types";
import ColorPicker from "@/components/ColorPicker";
import { updatePixelTx } from "@/actions";
import { usePixels } from "@/hooks/usePixels";
import { useUserRecord } from "@/hooks/useUserRecord";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const provider = new JsonRpcProvider(new Connection({ fullnode: RPC }));

export default function Home() {
  const { signTransactionBlock } = useWalletKit();

  // State controls
  const [state, setState] = useState<AppState>(AppState.READY);
  const [selectedPixel, setSelectedPixel] = useState<number>(0);
  const { pixels, ready: pixelsReady, refresh: refreshPixels } = usePixels();
  const {
    cooldown,
    refresh: refreshUserData,
    ready: userDataReady,
  } = useUserRecord();

  const submitPixelUpdate = async (color: PixelData) => {
    if (selectedPixel > -1 && selectedPixel < pixels.length) {
      const transactionBlock = updatePixelTx(selectedPixel, { ...color });

      try {
        // Allow user to sign the generated transaction
        const approveToast = toast.loading("Sign transaction on pop-up...");
        setState(AppState.TX_APPROVING);
        let signedTx = await signTransactionBlock({ transactionBlock });
        toast.dismiss(approveToast);

        // Attempt to send transaction to validators
        const sentToast = toast.loading("Confirming transaction...", {
          duration: 100000,
        });
        setState(AppState.TX_SENT);
        const response = await provider.executeTransactionBlock({
          transactionBlock: signedTx.transactionBlockBytes,
          signature: signedTx.signature,
          options: { showEffects: true },
          requestType: "WaitForLocalExecution",
        });
        toast.dismiss(sentToast);

        if (response.effects?.status.status === "success") {
          await new Promise((res) => setTimeout(res, 4000));
        }

        // Once response is received, let user know
        console.log("Server responded with:", response);
        toast.success("Successfully updated pixel!", { icon: "🎉" });
      } catch (err) {
        console.log(err);
        toast.dismiss(); // Since the dismiss calls above won't be called on error, dismiss all first
        toast.error("Error occurred");
      } finally {
        setState(AppState.READY);
        refreshPixels();
        refreshUserData();
      }
    }
  };

  const isReady = pixelsReady && userDataReady;

  return (
    <>
      <Head>
        <title>sui/place</title>
        <meta name="description" content="Fun little dApp for Sui Devnet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f17f.svg"
        />
      </Head>
      <div className="flex h-screen">
        <div className="w-[526px] m-auto flex flex-col gap-2">
          <Header />

          {/* Main Controls */}
          <main className="flex flex-row gap-2">
            <div className="grid grid-cols-6 gap-[2px] w-[310px] h-[310px] rounded-sm">
              {pixels.map((pixel, index) => (
                <Pixel
                  key={`grid-${index}`}
                  color={pixel}
                  handleClick={() => setSelectedPixel(index)}
                  selected={selectedPixel === index}
                  isReady={isReady}
                />
              ))}
            </div>
            <div className="flex flex-col h-[310px] w-[208px] bg-white rounded-md border-solid border-2 border-neutral-500/15">
              {selectedPixel > -1 ? (
                <ColorPicker
                  selectedData={pixels[selectedPixel]}
                  submitPixelUpdate={submitPixelUpdate}
                  appState={!isReady ? AppState.LOADING : state}
                  cooldown={cooldown}
                />
              ) : (
                <span className="m-auto text-center text-xs p-4">
                  Select a Pixel to get started 👀
                </span>
              )}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
