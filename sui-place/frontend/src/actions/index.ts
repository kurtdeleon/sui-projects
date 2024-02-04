import { SUI_CLOCK_OBJECT_ID, TransactionBlock } from "@mysten/sui.js";
import { PACKAGE_ID, PLACE_ID } from "@/constants";
import { PixelData } from "@/types";

export const updatePixelTx = (index: number, color: PixelData) => {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::place::set_color`,
    arguments: [
      tx.pure(PLACE_ID),
      tx.pure(SUI_CLOCK_OBJECT_ID),
      tx.pure(index), // This is the index of Pixel to update
      tx.pure(color.r),
      tx.pure(color.g),
      tx.pure(color.b),
    ],
  });
  return tx;
};

export const getUserRecordTx = () => {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::place::get_user_record`,
    arguments: [tx.pure(PLACE_ID)],
  });
  return tx;
}