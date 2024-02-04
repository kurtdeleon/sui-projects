export interface Content {
  type: string;
  fields: Record<string, any>;
  hasPublicTransfer: boolean;
  dataType: "moveObject";
}

export type PixelData = {
  r: number;
  g: number;
  b: number;
}

export type RawPixelData = {
  type: string;
  fields: PixelData;
}

export type UserData = {
  lastAccessed: number;
  accessCount: number;
}