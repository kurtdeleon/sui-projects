// Version 0.1
// export const PACKAGE_ID =
//   "0xf7848be981cbea1602eff71be83605ec5a8434343ba18fc5ee7ca20aeea2208b";
// export const PLACE_ID =
//   "0x79449f708f9723569b09d153032f15b64de4cb8d960ca8920ea86fe3ad015f15";
// export const ADMIN_CAP_ID =
//   "0x07f78771b3c28548559df976ba28c36ddb71b1a4e0ee511b4625b1e5927a33a8";
// export const UPGRADE_CAP_ID =
//   "0x785839e3d9af9a48497622661834b4ceead9c77cdf3786c650f6109000d5adce";

// Version 0.2
// export const PACKAGE_ID =
//   "0x705c104e1acc72bb011b4f37817d2f9621782fb5585c10d203e6b1188561d447";
// export const PLACE_ID =
//   "0xbf01feefcb510a392e8b34635f007e31c3e3a27771cceb94a1818f6ecca7a2f7";
// export const ADMIN_CAP_ID =
//   "0x035c29b66ac68f4e4216c49f4a3e01d79a6d268d359e0eba55cd28af8eddcda8";
// export const UPGRADE_CAP_ID =
//   "0x7db96f267b630078e222c9b0b40dd4855cbcfc1768772bb998ced9e3f9b137e4";

// Version 0.3
// Package admin 0x785839e3d9af9a48497622661834b4ceead9c77cdf3786c650f6109000d5adce
// Place admin 0xafbc093d15a817218f03b051b3895397684a2f3c373edd2e7a474b2ad564a4f7
export const PACKAGE_ID =
  "0x7759b635f9950794b6fbb01a1cb83c3dc938c7205921685cf1f6db903dbbb80c";
export const PLACE_ID =
  "0x74506559f21286071f3871b4d00ea047614d3d6cc83212483eb46959718f73bc";
export const ADMIN_CAP_ID =
  "0x4d7d70a39c7f7cf9ec11cffce218ce8beae8462f295bea13460ead36b6f4068f";
export const UPGRADE_CAP_ID =
  "0xffb2f8834bbcdfb2dc618913066ef5e369721d96a92fca4bd9c7446692866d7a";

export const RPC = "https://explorer-rpc.devnet.sui.io/";
export const EXPECTED_PIXELS = 36;
export const COOLDOWN_TIME = 60000; // 1 minute

export enum AppState {
  READY,
  LOADING,
  TX_APPROVING,
  TX_SENT,
}
