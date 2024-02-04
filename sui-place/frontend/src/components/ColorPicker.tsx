import React, { FC, useEffect, useState } from "react";
import { PixelData } from "@/types";
import { RGBColor } from "react-color";
import { CustomPicker, SketchPicker } from "react-color";
import { useWalletKit } from "@mysten/wallet-kit";
import { AppState } from "@/constants";
import { IoMdRefresh } from "react-icons/io";
import { getOverlayIconColor } from "@/utils";

interface Props {
  selectedData: PixelData;
  submitPixelUpdate: (color: PixelData) => Promise<void>;
  appState: AppState;
  cooldown: number;
}

const ColorPicker: FC<Props> = ({
  selectedData,
  submitPixelUpdate,
  appState,
  cooldown,
}) => {
  const { isConnected } = useWalletKit();
  const [color, setColor] = useState<RGBColor>({ r: 0, g: 0, b: 0 });

  // Updates pixel color
  const setFromPixel = (p: PixelData) => setColor(p);
  useEffect(() => setFromPixel(selectedData), [selectedData]);

  // Component colors and
  const { r, g, b } = color;
  const refreshIconColor = getOverlayIconColor(selectedData);
  const newTextColor = getOverlayIconColor(color);

  // App states
  const isReady = appState === AppState.READY;
  const showSkeleton = appState === AppState.LOADING;
  const disableButton = !isReady || !isConnected || cooldown > 0;

  // CTA Button text
  let buttonText = "Submit";
  if (!isConnected) buttonText = "Connect your wallet";
  else if (!isReady) buttonText = "Loading...";
  else if (cooldown > 0) buttonText = `Cooldown (${cooldown}s)`;

  return (
    <>
      <div className="w-full flex flex-row p-2 gap-2">
        <div
          className={`Refresh w-[30px] h-[30px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.15)] hover:shadow-[inset_0_2px_6px_0_rgba(0,0,0,0.35)] duration-200 cursor-pointer flex items-center justify-center rounded-tl-sm${
            showSkeleton ? " bg-slate-400 animate-pulse" : ""
          }`}
          style={!showSkeleton ? { background: `rgb(${r},${g},${b})` } : {}}
          onClick={() => setColor(selectedData)}
        >
          <IoMdRefresh
            className="opacity-0 duration-200 place-center"
            size={20}
            color={refreshIconColor}
          />
        </div>
        <div
          className={`flex-1 h-[30px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.15)] relative text-[10px] rounded-tr-sm${
            showSkeleton ? " bg-slate-400 animate-pulse" : ""
          }`}
          style={
            !showSkeleton
              ? { background: `rgb(${color.r},${color.g},${color.b})` }
              : {}
          }
        >
          <span
            className="absolute right-[4px] bottom-[2px] opacity-60"
            style={{ color: newTextColor }}
          >
            NEW COLOR
          </span>
        </div>
      </div>
      <SketchPicker
        color={color}
        presetColors={[]}
        onChange={(c, e) => setColor(c.rgb)}
        styles={{ default: { picker: { background: "transparent" } } }}
        disableAlpha={true}
      />
      <div className="p-2 w-full flex flex-col gap-1">
        <button
          className="block flex-1 rounded-lg font-semibold shadow-sm w-full p-2 text-sm text-white bg-[#24649c] hover:bg-blue-500 shadow-sm shadow-blue-500/50 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => submitPixelUpdate(color)}
          disabled={disableButton}
        >
          {buttonText}
        </button>
      </div>
    </>
  );
};

export default CustomPicker(ColorPicker);
