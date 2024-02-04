import { EXPECTED_PIXELS, PLACE_ID, RPC } from "@/constants";
import { Content, PixelData, RawPixelData } from "@/types";
import { Connection, JsonRpcProvider } from "@mysten/sui.js";
import { useEffect, useState } from "react";

const DEFAULT_PIXELS = Array(EXPECTED_PIXELS)
  .fill(0)
  .map(() => ({ r: 0, g: 0, b: 0 }));

const provider = new JsonRpcProvider(new Connection({ fullnode: RPC }));

export function usePixels() {
  const [pixels, setPixels] = useState<PixelData[]>(DEFAULT_PIXELS);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const refreshPlaceData = async () => {
    setLoading(true);

    const response = await provider.getObject({
      id: PLACE_ID,
      options: { showContent: true },
    });

    if (response?.data?.content) {
      const pixels: RawPixelData[] = (response.data.content as Content).fields
        .pixels;
      if (pixels.length === EXPECTED_PIXELS) {
        setPixels(pixels.map((p) => p.fields));
      }
    }

    setLoading(false);
    setReady(true);
  };

  useEffect(() => {
    refreshPlaceData();

    // Refresh Pixels data every 20 seconds
    const interval = setInterval(refreshPlaceData, 20000);
    return () => clearInterval(interval);
  }, []);

  return { pixels, loading, refresh: refreshPlaceData, ready };
}
