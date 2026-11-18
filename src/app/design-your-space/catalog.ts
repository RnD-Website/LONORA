// Floor composer data: rooms, furniture, architecture, materials, light, pricing.
// Units are metres. Each room is modelled around its own origin: the back wall
// sits at z = -d / 2, the left wall at x = -w / 2 and the open side faces +z.

export const WALL_H = 2.9;
export const MAX_ROOMS = 4;

export type Dims = { w: number; d: number; h: number };

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
  | "kitchen"
  | "island"
  | "pantry"
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
  kitchen: { id: "kitchen", name: "Kitchen run", w: 3.0, d: 0.62, h: 2.2, price: 18500, slot: "wood", note: "Sink, hob, cabinets" },
  island: { id: "island", name: "Island", w: 2.2, d: 1.5, h: 0.92, price: 7800, slot: "wood", note: "Stone top, 3 stools" },
  pantry: { id: "pantry", name: "Pantry & oven", w: 1.2, d: 0.62, h: 2.3, price: 9600, slot: "wood", note: "Tall units" },
  floorlamp: { id: "floorlamp", name: "Floor lamp", w: 0.5, d: 0.5, h: 1.72, price: 950, slot: "none", note: "Linen shade" },
  pendant: { id: "pendant", name: "Pendant", w: 0.5, d: 0.5, h: 2.9, price: 1100, slot: "none", note: "Paper lantern" },
  olive: { id: "olive", name: "Olive tree", w: 0.7, d: 0.7, h: 1.9, price: 680, slot: "none", note: "Terracotta pot" },
  rug: { id: "rug", name: "Rug", w: 2.8, d: 2.0, h: 0.02, price: 1900, slot: "upholstery", note: "Hand-knotted wool" },
};

export const GROUPS: { title: string; types: FurnId[] }[] = [
  { title: "Kitchen", types: ["kitchen", "island", "pantry"] },
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
export type WallId = (typeof WALLS)[number]["id"];

export type FloorKind = "planks" | "herringbone" | "tiles" | "terrazzo";
export const FLOORS = [
  { id: "oak", name: "Oak planks", color: "#C6A27A", kind: "planks" as FloorKind, perM2: 140 },
  { id: "herringbone", name: "Oak herringbone", color: "#BC976B", kind: "herringbone" as FloorKind, perM2: 190 },
  { id: "limestone", name: "Limestone", color: "#DCD1BF", kind: "tiles" as FloorKind, perM2: 210 },
  { id: "terrazzo", name: "Terrazzo", color: "#E4DDD2", kind: "terrazzo" as FloorKind, perM2: 230 },
  { id: "walnut", name: "Walnut planks", color: "#6A4A35", kind: "planks" as FloorKind, perM2: 170 },
] as const;
export type FloorId = (typeof FLOORS)[number]["id"];

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
export const WINDOW = { w: 1.25, y0: 0.35, y1: 2.55 };
export const ARCH_SIZE = { w: 1.2, h: 2.45 };

// Feature positions scale with the room so they always sit sensibly.
export const archX = (d: Dims) => d.w / 2 - 1.35;
export const featureSpan = (d: Dims): [number, number] => [-d.w / 2 + 0.4, Math.max(-d.w / 2 + 1.6, d.w / 2 - 1.85)];
export const windowZs = (id: WindowId, d: Dims) => (id === "one" ? [-0.1] : id === "two" ? [-d.d * 0.26, d.d * 0.24] : []);

/* ---------------------------------------------------------------- Light -- */

export const LIGHTS = [
  { id: "morning", name: "Morning", note: "Cool, clear daylight", preview: "linear-gradient(160deg,#dbe8f2,#f6f1e8)" },
  { id: "golden", name: "Golden hour", note: "Low, warm sun", preview: "linear-gradient(160deg,#f3b77d,#f6e2c6)" },
  { id: "evening", name: "Evening", note: "Lamps and firelight", preview: "linear-gradient(160deg,#1f2738,#5b3a28)" },
] as const;
export type LightId = (typeof LIGHTS)[number]["id"];

/* ---------------------------------------------------------------- Rooms -- */

export type RoomType = "living" | "kitchen" | "dining" | "bedroom";
export type SizeId = "s" | "m" | "l";

export const ROOM_TYPES: { id: RoomType; name: string }[] = [
  { id: "living", name: "Living room" },
  { id: "kitchen", name: "Kitchen" },
  { id: "dining", name: "Dining room" },
  { id: "bedroom", name: "Bedroom" },
];

export const SIZES: Record<RoomType, Record<SizeId, { w: number; d: number }>> = {
  living: { s: { w: 4.4, d: 3.8 }, m: { w: 5.2, d: 4.4 }, l: { w: 6.0, d: 5.0 } },
  kitchen: { s: { w: 3.8, d: 3.4 }, m: { w: 4.8, d: 4.0 }, l: { w: 5.6, d: 4.6 } },
  dining: { s: { w: 3.8, d: 3.4 }, m: { w: 4.6, d: 4.0 }, l: { w: 5.4, d: 4.6 } },
  bedroom: { s: { w: 3.8, d: 3.6 }, m: { w: 4.4, d: 4.0 }, l: { w: 5.0, d: 4.6 } },
};
export const SIZE_NAMES: { id: SizeId; name: string }[] = [
  { id: "s", name: "Compact" },
  { id: "m", name: "Standard" },
  { id: "l", name: "Generous" },
];
export const dimsOf = (type: RoomType, size: SizeId): Dims => ({ ...SIZES[type][size], h: WALL_H });

export type Item = { id: string; type: FurnId; x: number; z: number; rot: number; finish?: string };

export type RoomData = {
  id: string;
  name: string;
  type: RoomType;
  size: SizeId;
  walls: WallId;
  floor: FloorId;
  back: BackWall;
  window: WindowId;
  fireplace: boolean;
  items: Item[];
};

type Seed = [FurnId, number, number, number?];
// Layouts authored for a reference room size; they are scaled to the real room.
const SEEDS: Record<RoomType, { ref: { w: number; d: number }; items: Seed[] }> = {
  living: {
    ref: { w: 5.2, d: 4.4 },
    items: [
      ["rug", -0.5, -0.55],
      ["sofa", -0.6, -1.55],
      ["coffee", -0.6, -0.5],
      ["lounge", 0.95, 0.15, 5],
      ["floorlamp", -2.1, -1.85],
      ["olive", 2.15, -1.85],
    ],
  },
  kitchen: {
    ref: { w: 4.8, d: 4.0 },
    items: [
      ["kitchen", -0.75, -1.69],
      ["pantry", 1.7, -1.69],
      ["island", -0.4, 0.2],
      ["pendant", -0.9, -0.05],
      ["pendant", 0.1, -0.05],
    ],
  },
  dining: {
    ref: { w: 5.2, d: 4.4 },
    items: [
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
  },
  bedroom: {
    ref: { w: 5.2, d: 4.4 },
    items: [
      ["rug", -0.5, -0.8],
      ["bed", -0.5, -1.12],
      ["nightstand", -1.78, -1.97],
      ["nightstand", 0.78, -1.97],
      ["lounge", 1.55, 0.6, 5],
      ["olive", 2.15, -1.85],
    ],
  },
};

/** Half-extents of a piece on the floor, given its rotation in 45° steps. */
export function extents(type: FurnId, rot: number) {
  const { w, d } = FURN[type];
  const r = ((rot % 8) + 8) % 8;
  if (r % 2 === 1) {
    const e = (w + d) / (2 * Math.SQRT2);
    return { hx: e, hz: e };
  }
  return r % 4 === 0 ? { hx: w / 2, hz: d / 2 } : { hx: d / 2, hz: w / 2 };
}

/** Keep a piece inside its room. */
export function clampToRoom(type: FurnId, x: number, z: number, dims: Dims, rot = 0) {
  const { hx, hz } = extents(type, rot);
  const fx = Math.max(0, dims.w / 2 - hx);
  const fz = Math.max(0, dims.d / 2 - hz);
  return { x: Math.max(-fx, Math.min(fx, x)), z: Math.max(-fz, Math.min(fz, z)) };
}

/** Furnish a room from its seed layout, scaled to the room's size. */
export function seedItems(type: RoomType, size: SizeId, prefix: string): Item[] {
  const { ref, items } = SEEDS[type];
  const dims = dimsOf(type, size);
  return items.map(([t, x, z, rot = 0], i) => {
    const p = clampToRoom(t, (x * dims.w) / ref.w, (z * dims.d) / ref.d, dims, rot);
    return { id: `${prefix}-${i}`, type: t, rot, ...p };
  });
}

/** Re-fit a room's furniture after its size changes. */
export function rescale(items: Item[], from: Dims, to: Dims): Item[] {
  return items.map((it) => ({ ...it, ...clampToRoom(it.type, (it.x * to.w) / from.w, (it.z * to.d) / from.d, to, it.rot) }));
}

export function makeRoom(id: string, type: RoomType, name: string, size: SizeId = "m"): RoomData {
  return {
    id,
    name,
    type,
    size,
    walls: "bone",
    floor: type === "kitchen" ? "limestone" : "oak",
    back: type === "living" ? "arch" : type === "bedroom" ? "fluted" : "plain",
    window: type === "kitchen" ? "one" : type === "dining" ? "two" : "one",
    fireplace: false,
    items: seedItems(type, size, id),
  };
}

// Runtime ids, only ever created from clicks.
let seq = 0;
export const uid = (p = "f") => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

/* -------------------------------------------------------------- Project -- */

export type Palette = { upholstery: (typeof UPHOLSTERY)[number]["id"]; wood: (typeof WOODS)[number]["id"]; stone: (typeof STONES)[number]["id"] };
export type Project = { rooms: RoomData[]; palette: Palette; light: LightId };

export const defaultProject = (): Project => ({
  rooms: [makeRoom("r1", "living", "Living room"), makeRoom("r2", "kitchen", "Kitchen"), makeRoom("r3", "bedroom", "Bedroom")],
  palette: { upholstery: "boucle", wood: "oak", stone: "travertine" },
  light: "morning",
});

/** Everything the 3D scene needs to draw one room. */
export type Style = {
  walls: WallId;
  floor: FloorId;
  back: BackWall;
  window: WindowId;
  fireplace: boolean;
  light: LightId;
} & Palette;

export const styleOf = (room: RoomData, p: Project): Style => ({
  walls: room.walls,
  floor: room.floor,
  back: room.back,
  window: room.window,
  fireplace: room.fireplace,
  light: p.light,
  ...p.palette,
});

export const find = <T extends { id: string }>(list: readonly T[], id: string | undefined) => list.find((x) => x.id === id) ?? list[0];

/** The finish a piece uses: its own choice, or the home palette. */
export function finishOf(item: Item, palette: Palette) {
  const slot = FURN[item.type].slot;
  if (slot === "none") return null;
  const list: readonly { id: string; name: string; color: string; factor: number }[] = SLOT_LIST[slot];
  return find(list, item.finish ?? palette[slot]);
}

/**
 * Whole-floor arrangement: rooms fill a 2 × 2 grid and share walls along the
 * centre lines, so three or four rooms read as one apartment plan.
 */
export function floorLayout(rooms: RoomData[]) {
  const dims = rooms.map((r) => dimsOf(r.type, r.size));
  if (rooms.length === 1) return { offsets: [[0, 0] as [number, number]], dims };
  const offsets = rooms.map((_, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const d = dims[i];
    return [col === 0 ? -d.w / 2 : d.w / 2, row === 0 ? d.d / 2 : -d.d / 2] as [number, number];
  });
  return { offsets, dims };
}

/* -------------------------------------------------------------- Presets -- */

type MoodStyle = { walls: WallId; floor: FloorId; back: BackWall; window: WindowId; fireplace: boolean; light: LightId } & Palette;
export const MOODS: { id: string; name: string; note: string; style: MoodStyle }[] = [
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

/** Apply a mood to the whole home. Kitchens keep a plain back wall and no fireplace. */
export function applyMood(p: Project, id: string): Project {
  const m = MOODS.find((x) => x.id === id)!.style;
  return {
    light: m.light,
    palette: { upholstery: m.upholstery, wood: m.wood, stone: m.stone },
    rooms: p.rooms.map((r) => ({
      ...r,
      walls: m.walls,
      floor: r.type === "kitchen" && m.floor === "oak" ? "limestone" : m.floor,
      back: r.type === "kitchen" ? "plain" : m.back,
      window: m.window,
      fireplace: r.type === "living" ? m.fireplace : false,
      items: r.items.map((i) => ({ ...i, finish: undefined })),
    })),
  };
}

/* -------------------------------------------------------------- Pricing -- */

export function quoteRoom(r: RoomData, palette: Palette) {
  const dims = dimsOf(r.type, r.size);
  const furniture = r.items.reduce((sum, it) => sum + FURN[it.type].price * (finishOf(it, palette)?.factor ?? 1), 0);
  const architecture = find(BACKWALLS, r.back).price + find(WINDOWS, r.window).price + (r.fireplace ? FIREPLACE_PRICE : 0);
  const wallArea = (dims.w + dims.d * 2) * dims.h;
  const surfaces = dims.w * dims.d * find(FLOORS, r.floor).perM2 + wallArea * 48 * find(WALLS, r.walls).factor;
  return { furniture, architecture, surfaces, area: dims.w * dims.d, total: furniture + architecture + surfaces };
}

export function quote(p: Project) {
  const rooms = p.rooms.map((r) => ({ id: r.id, name: r.name, ...quoteRoom(r, p.palette) }));
  const subtotal = rooms.reduce((s, r) => s + r.total, 0);
  const design = subtotal * 0.15;
  const area = rooms.reduce((s, r) => s + r.area, 0);
  return { rooms, design, area, total: Math.round(subtotal + design) };
}
