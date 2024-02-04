import tinycolor from "tinycolor2";
import { PixelData } from "./types";

export const getOverlayIconColor = (color: PixelData) => {
  return tinycolor(color).isLight() ? "#000000" : "#ffffff";
};
