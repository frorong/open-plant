export type Bounds = [number, number, number, number];

export interface TileDefinition {
  id: string;
  url: string;
  bounds: Bounds;
}
