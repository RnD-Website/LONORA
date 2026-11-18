// Room composer data: furniture, architecture, materials, light and pricing.
// Units are metres. The room is centred on the origin; the back wall is at
// z = -ROOM.d / 2 and the open side faces the camera (+z).

export const ROOM = { w: 5.2, d: 4.4, h: 2.9 };
export const BACK = -ROOM.d / 2;
export const LEFT = -ROOM.w / 2;

/* ------------------------------------------------------------ Furniture -- */

export type FurnId =
  | "sofa"
  | "lounge"
  | "chair"
  | "coffee"
  | "side"
  | "dining"
  | "sideboard"
  | "shelf"
  | "nightstand"
  | "bed"
  | "floorlamp"
  | "pendant"
  | "olive"
  | "rug";

export type Slot = "upholstery" | "wood" | "stone" | "none";

export type FDef = { id: FurnId; name: string; w: number; d: number; h: number; price: number; slot: Slot; note: string };

export const FURN: Record<FurnId, FDef> = {
  sofa: { id: "sofa", name: "Sofa", w: 2.3, d: 0.95, h: 0.78, price: 6800, slot: "upholstery", note: "Deep three-seater" },
  lounge: { id: "lounge", name: "Lounge chair", w: 0.82, d: 0.86, h: 0.86, price: 2900, slot: "upholstery", note: "Timber frame" },
  chair: { id: "chair", name: "Dining chair", w: 0.5, d: 0.52, h: 0.98, price: 890, slot: "wood", note: "Solid timber" },
  coffee: { id: "coffee", name: "Coffee table", w: 1.1, d: 1.1, h: 0.4, price: 2400, slot: "stone", note: "Round, stone" },
  side: { id: "side", name: "Side table", w: 0.5, d: 0.5, h: 0.5, price: 780, slot: "stone", note: "Stone drum" },
  dining: { id: "dining", name: "Dining table", w: 2.2, d: 1.0, h: 0.77, price: 5200, slot: "wood", note: "Seats six" },
  sideboard: { id: "sideboard", name: "Sideboard", w: 1.8, d: 0.45, h: 0.75, price: 4200, slot: "wood", note: "Stone top" },
  shelf: { id: "shelf", name: "Bookcase", w: 1.2, d: 0.36, h: 2.0, price: 3100, slot: "wood", note: "Open shelving" },
  nightstand: { id: "nightstand", name: "Bedside table", w: 0.5, d: 0.42, h: 0.88, price: 1250, slot: "wood", note: "With lamp" },
  bed: { id: "bed", name: "Bed", w: 1.9, d: 2.15, h: 1.12, price: 5600, slot: "upholstery", note: "Upholstered, king" },
  floorlamp: { id: "floorlamp", name: "Floor lamp", w: 0.5, d: 0.5, h: 1.72, price: 950, slot: "none", note: "Linen shade" },
  pendant: { id: "pendant", name: "Pendant", w: 0.5, d: 0.5, h: 2.9, price: 1100, slot: "none", note: "Paper lantern" },
  olive: { id: "olive", name: "Olive tree", w: 0.7, d: 0.7, h: 1.9, price: 680, slot: "none", note: "Terracotta pot" },
  rug: { id: "rug", name: "Rug", w: 2.8, d: 2.0, h: 0.02, price: 1900, slot: "upholstery", note: "Hand-knotted wool" },
};

export const GROUPS: { title: string; types: FurnId[] }[] = [
  { title: "Seating", types: ["sofa", "lounge", "chair"] },
  { title: "Tables", types: ["coffee", "side", "dining"] },
  { title: "Storage", types: ["sideboard", "shelf", "nightstand"] },
  { title: "Sleeping", types: ["bed"] },
  { title: "Light & decor", types: ["floorlamp", "pendant", "olive", "rug"] },
];

/* ------------------------------------------------------------ Materials -- */

export const WALLS = [
  { id: "bone", name: "Bone lime plaster", color: "#EEE7DC", factor: 1 },
  { id: "sand", name: "Sand lime plaster", color: "#E1CFB6", factor: 1 },
  { id: "clay", name: "Clay plaster", color: "#CE9F84", factor: 1.05 },
  { id: "sage", name: "Sage limewash", color: "#C3C9BB", factor: 1 },
  { id: "espresso", name: "Espresso plaster", color: "#4A3A31", factor: 1.08 },
] as const;

export type FloorKind = "planks" | "herringbone" | "tiles" | "terrazzo";
export const FLOORS = [
  { id: "oak", name: "Oak planks", color: "#C6A27A", kind: "planks" as FloorKind, perM2: 140 },
  { id: "herringbone", name: "Oak herringbone", color: "#BC976B", kind: "herringbone" as FloorKind, perM2: 190 },
  { id: "limestone", name: "Limestone", color: "#DCD1BF", kind: "tiles" as FloorKind, perM2: 210 },
  { id: "terrazzo", name: "Terrazzo", color: "#E4DDD2", kind: "terrazzo" as FloorKind, perM2: 230 },
  { id: "walnut", name: "Walnut planks", color: "#6A4A35", kind: "planks" as FloorKind, perM2: 170 },
] as const;

export const UPHOLSTERY = [
  { id: "boucle", name: "Ivory bouclé", color: "#ECE6DA", factor: 1.1 },
  { id: "linen", name: "Sand linen", color: "#D3C1A5", factor: 1 },
  { id: "terracotta", name: "Terracotta velvet", color: "#B05F40", factor: 1.15 },
  { id: "olive", name: "Olive wool", color: "#6E7250", factor: 1.08 },
  { id: "charcoal", name: "Charcoal wool", color: "#3A3836", factor: 1.05 },
] as const;

export const WOODS = [
  { id: "oak", name: "Natural oak", color: "#C49A6C", factor: 1 },
  { id: "walnut", name: "Walnut", color: "#6B4831", factor: 1.12 },
  { id: "ebony", name: "Ebonised oak", color: "#2B2521", factor: 1.18 },
] as const;

export const STONES = [
  { id: "travertine", name: "Travertine", color: "#D8C7AA", factor: 1 },
  { id: "marble", name: "Calacatta marble", color: "#EDEAE5", factor: 1.15 },
  { id: "verde", name: "Verde stone", color: "#4F5F53", factor: 1.25 },
] as const;

export const SLOT_LIST = { upholstery: UPHOLSTERY, wood: WOODS, stone: STONES } as const;

/* --------------------------------------------------------- Architecture -- */

export const BACKWALLS = [
  { id: "plain", name: "Plain", price: 0 },
  { id: "arch", name: "Arched opening", price: 4800 },
  { id: "slats", name: "Timber slats", price: 3600 },
  { id: "fluted", name: "Fluted plaster", price: 4200 },
] as const;
export type BackWall = (typeof BACKWALLS)[number]["id"];

export const WINDOWS = [
  { id: "none", name: "None", price: 0 },
  { id: "one", name: "One tall window", price: 6500 },
  { id: "two", name: "Two tall windows", price: 11800 },
] as const;
export type WindowId = (typeof WINDOWS)[number]["id"];

export const FIREPLACE_PRICE = 7800;

// Where architectural features sit (metres along each wall).
export const ARCH = { cx: 1.25, w: 1.2, h: 2.45 };
export const FEATURE_SPAN: [number, number] = [-2.2, 0.75]; // slats / fluting on the back wall
export const WINDOW_Z: Record<WindowId, number[]> = { none: [], one: [-0.1], two: [-1.15, 1.05] };
export const WINDOW = { w: 1.25, y0: 0.35, y1: 2.55 };
export const FIREPLACE_Z = 0.2;

/* ---------------------------------------------------------------- Light -- */

export const LIGHTS = [
  { id: "morning", name: "Morning", note: "Cool, clear daylight", preview: "linear-gradient(160deg,#dbe8f2,#f6f1e8)" },
  { id: "golden", name: "Golden hour", note: "Low, warm sun", preview: "linear-gradient(160deg,#f3b77d,#f6e2c6)" },
  { id: "evening", name: "Evening", note: "Lamps and firelight", preview: "linear-gradient(160deg,#1f2738,#5b3a28)" },
] as const;
export type LightId = (typeof LIGHTS)[number]["id"];

/* ---------------------------------------------------------------- Rooms -- */

export type RoomType = "living" | "bedroom" | "dining";
export const ROOMS: { id: RoomType; name: string }[] = [
  { id: "living", name: "Living room" },
  { id: "bedroom", name: "Bedroom" },
  { id: "dining", name: "Dining room" },
];

export type Item = { id: string; type: FurnId; x: number; z: number; rot: number; finish?: string };

type Seed = [FurnId, number, number, number?];
const SEEDS: Record<RoomType, Seed[]> = {
  living: [
    ["rug", -0.5, -0.55],
    ["sofa", -0.6, -1.55],
    ["coffee", -0.6, -0.5],
    ["lounge", 0.95, 0.15, 5],
    ["floorlamp", -2.1, -1.85],
    ["olive", 2.15, -1.85],
  ],
  bedroom: [
    ["rug", -0.5, -0.8],
    ["bed", -0.5, -1.12],
    ["nightstand", -1.78, -1.97],
    ["nightstand", 0.78, -1.97],
    ["lounge", 1.55, 0.6, 5],
    ["olive", 2.15, -1.85],
  ],
  dining: [
    ["rug", -0.3, -0.2],
    ["dining", -0.3, -0.2],
    ["chair", -1.0, -0.95],
    ["chair", -0.3, -0.95],
    ["chair", 0.4, -0.95],
    ["chair", -1.0, 0.55, 4],
    ["chair", -0.3, 0.55, 4],
    ["chair", 0.4, 0.55, 4],
    ["pendant", -0.3, -0.2],
    ["sideboard", -1.3, -1.97],
    ["olive", 2.15, -1.85],
  ],
};

// Deterministic ids so the first render matches on server and browser.
export const seedRoom = (room: RoomType): Item[] =>
  SEEDS[room].map(([type, x, z, rot = 0], i) => ({ id: `${room}-${i}`, type, x, z, rot }));

// Runtime ids, only ever created from clicks.
let seq = 0;
export const uid = () => `f${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Keep a piece inside the room. */
export function clampToRoom(type: FurnId, x: number, z: number) {
  const def = FURN[type];
  const r = Math.min(def.w, def.d) / 2;
  return {
    x: Math.max(LEFT + r, Math.min(-LEFT - r, x)),
    z: Math.max(BACK + r, Math.min(ROOM.d / 2 - r, z)),
  };
}

/* ---------------------------------------------------------------- Style -- */

export type Style = {
  room: RoomType;
  walls: (typeof WALLS)[number]["id"];
  floor: (typeof FLOORS)[number]["id"];
  upholstery: (typeof UPHOLSTERY)[number]["id"];
  wood: (typeof WOODS)[number]["id"];
  stone: (typeof STONES)[number]["id"];
  back: BackWall;
  window: WindowId;
  fireplace: boolean;
  light: LightId;
};

export const DEFAULT_STYLE: Style = {
  room: "living",
  walls: "bone",
  floor: "oak",
  upholstery: "boucle",
  wood: "oak",
  stone: "travertine",
  back: "arch",
  window: "one",
  fireplace: false,
  light: "morning",
};

export const find = <T extends { id: string }>(list: readonly T[], id: string | undefined) => list.find((x) => x.id === id) ?? list[0];

/** The finish a piece uses: its own choice, or the room palette. */
export function finishOf(item: Item, style: Style) {
  const slot = FURN[item.type].slot;
  if (slot === "none") return null;
  const list: readonly { id: string; name: string; color: string; factor: number }[] = SLOT_LIST[slot];
  return find(list, item.finish ?? style[slot]);
}

/* -------------------------------------------------------------- Presets -- */

export const MOODS: { id: string; name: string; note: string; style: Omit<Style, "room"> }[] = [
  {
    id: "warm-minimal",
    name: "Warm minimal",
    note: "Bone plaster, oak and bouclé",
    style: { walls: "bone", floor: "oak", upholstery: "boucle", wood: "oak", stone: "travertine", back: "arch", window: "one", fireplace: false, light: "morning" },
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    note: "Sand lime, limestone and linen",
    style: { walls: "sand", floor: "limestone", upholstery: "linen", wood: "walnut", stone: "travertine", back: "arch", window: "two", fireplace: false, light: "golden" },
  },
  {
    id: "dark-moody",
    name: "Dark & moody",
    note: "Espresso walls, walnut and velvet",
    style: { walls: "espresso", floor: "walnut", upholstery: "terracotta", wood: "ebony", stone: "verde", back: "slats", window: "one", fireplace: true, light: "evening" },
  },
  {
    id: "coastal",
    name: "Coastal",
    note: "Terrazzo, linen and sea light",
    style: { walls: "bone", floor: "terrazzo", upholstery: "linen", wood: "oak", stone: "marble", back: "plain", window: "two", fireplace: false, light: "morning" },
  },
  {
    id: "terracotta",
    name: "Earthy clay",
    note: "Clay plaster, travertine and walnut",
    style: { walls: "clay", floor: "limestone", upholstery: "terracotta", wood: "walnut", stone: "travertine", back: "arch", window: "one", fireplace: true, light: "golden" },
  },
  {
    id: "japandi",
    name: "Japandi",
    note: "Sage limewash, fluting and olive wool",
    style: { walls: "sage", floor: "herringbone", upholstery: "olive", wood: "oak", stone: "marble", back: "fluted", window: "one", fireplace: false, light: "morning" },
  },
];

/* -------------------------------------------------------------- Pricing -- */

export function quote(items: Item[], style: Style) {
  const furniture = items.reduce((sum, it) => sum + FURN[it.type].price * (finishOf(it, style)?.factor ?? 1), 0);
  const architecture =
    find(BACKWALLS, style.back).price + find(WINDOWS, style.window).price + (style.fireplace ? FIREPLACE_PRICE : 0);
  const area = ROOM.w * ROOM.d;
  const wallArea = (ROOM.w + ROOM.d * 2) * ROOM.h;
  const surfaces = area * find(FLOORS, style.floor).perM2 + wallArea * 48 * find(WALLS, style.walls).factor;
  const subtotal = furniture + architecture + surfaces;
  const design = subtotal * 0.15;
  return { furniture, architecture, surfaces, design, total: Math.round(subtotal + design) };
}
