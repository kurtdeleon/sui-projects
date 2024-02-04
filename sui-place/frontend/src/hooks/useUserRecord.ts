import { getUserRecordTx } from "@/actions";
import { COOLDOWN_TIME, RPC } from "@/constants";
import { UserData } from "@/types";
import { Connection, JsonRpcProvider } from "@mysten/sui.js";
import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";

const DEFAULT_USER_DATA = {
  lastAccessed: 0,
  accessCount: 0,
};

const provider = new JsonRpcProvider(new Connection({ fullnode: RPC }));

export function useUserRecord() {
  const { currentAccount, isConnected } = useWalletKit();
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA);
  const [cooldown, setCooldown] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const cd = Math.round(
        (COOLDOWN_TIME - Math.abs(userData.lastAccessed - Date.now())) / 1000
      );
      setCooldown(cd);
    }, 1000);
    return () => clearInterval(interval);
  }, [userData.lastAccessed]);

  const refreshUserData = async (address: string | undefined) => {
    if (address) {
      setLoading(true);

      let userData = { ...DEFAULT_USER_DATA };
      const res = await provider.devInspectTransactionBlock({
        transactionBlock: getUserRecordTx(),
        sender: address,
      });

      if (
        res.results &&
        res.results[0].returnValues &&
        res.results[0].returnValues.length > 1
      ) {
        userData.lastAccessed = Buffer.from(
          res.results[0].returnValues[0][0]
        ).readUIntLE(0, 8);
        userData.accessCount = Buffer.from(
          res.results[0].returnValues[1][0]
        ).readUIntLE(0, 8);
      }

      setUserData(userData);
      setLoading(false);
      setReady(true);
    } else {
      setUserData(DEFAULT_USER_DATA);
    }
  };

  useEffect(() => {
    refreshUserData(currentAccount?.address);
  }, [currentAccount]);

  return {
    userData,
    loading,
    refresh: () => refreshUserData(currentAccount?.address),
    cooldown,
    ready: (isConnected && ready) || !isConnected,
  };
}
