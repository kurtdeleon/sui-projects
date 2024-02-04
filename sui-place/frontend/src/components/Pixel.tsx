import React, { FC } from "react";
import { PixelData } from "@/types";
import { CgColorPicker } from "react-icons/cg";
import { getOverlayIconColor } from "@/utils";

interface Props {
  color: PixelData;
  handleClick: () => void;
  selected: boolean;
  isReady: boolean;
}

export const Pixel: FC<Props> = ({ color, handleClick, selected, isReady }) => {
  const { r, g, b } = color;
  const iconColor = getOverlayIconColor(color);

  return (
    <div
      style={isReady ? { background: `rgb(${r}, ${g}, ${b})` } : {}}
      className={`Pixel cursor-pointer relative rounded-md shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.15)] hover:shadow-[inset_0_2px_6px_0_rgba(0,0,0,0.35)] duration-200${
        !isReady ? " bg-slate-400 animate-pulse" : ""
      }`}
      onClick={handleClick}
    >
      <CgColorPicker
        size={16}
        color={iconColor}
        className={`pixel-color-picker-icon ${
          selected ? "pixel-color-picker-icon-selected " : ""
        }absolute right-[4px] top-[4px]`}
      />
    </div>
  );
};
