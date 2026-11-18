"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TLink } from "@/components/Transition";
import { SplitReveal, RevealGroup } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { projects } from "@/lib/content";
import {
  BACKWALLS,
  FLOORS,
  FURN,
  GROUPS,
  LIGHTS,
  MAX_ROOMS,
  MOODS,
  ROOM_TYPES,
  SIZE_NAMES,
  SLOT_LIST,
  STONES,
  UPHOLSTERY,
  WALLS,
  WINDOWS,
  WOODS,
  applyMood,
  clampToRoom,
  defaultProject,
  dimsOf,
  find,
  floorLayout,
  makeRoom,
  quote,
  rescale,
  seedItems,
  styleOf,
  uid,
  type FurnId,
  type Item,
  type Palette,
  type Project,
  type RoomData,
  type RoomType,
  type SizeId,
} from "./catalog";
import type { CameraView, SceneRoom } from "./Planner3D";

const Planner3D = dynamic(() => import("./Planner3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-[12px] uppercase tracking-[0.18em] text-ink/40">
      Preparing your floor…
    </div>
  ),
});

const STORE = "lonora-floor-v1";
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// A photograph from our own portfolio for each starting mood.
const MOOD_PHOTOS: Record<string, string> = {
  "warm-minimal": projects[0].images[0],
  mediterranean: projects[2].images[0],
  "dark-moody": "/images/ember-lounge.jpg",
  japandi: projects[8].images[0],
  coastal: projects[9].images[0],
  terracotta: projects[6].images[0],
};

/* ------------------------------------------------------------- Icons -- */

const ICONS: Record<FurnId, ReactNode> = {
  sofa: (
    <>
      <path d="M8 30v-7a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v7" />
      <rect x="4" y="24" width="5" height="11" rx="2" />
      <rect x="39" y="24" width="5" height="11" rx="2" />
      <path d="M9 30h30v5H9zM11 35v3M37 35v3" />
    </>
  ),
  lounge: <path d="M13 36l2-17a4 4 0 0 1 4-3h9M11 29h22a4 4 0 0 1 4 4v3H11zM13 36v4M35 36v4" />,
  chair: <path d="M16 8h16v15H16zM14 25h20v3H14zM16 28v13M32 28v13" />,
  coffee: (
    <>
      <ellipse cx="24" cy="21" rx="16" ry="5" />
      <path d="M14 24v9c0 2 4.5 3.5 10 3.5s10-1.5 10-3.5v-9" />
    </>
  ),
  side: (
    <>
      <ellipse cx="24" cy="14" rx="8" ry="3" />
      <path d="M16 14v20c0 1.7 3.6 3 8 3s8-1.3 8-3V14" />
    </>
  ),
  dining: <path d="M4 19h40v3H4zM11 22v17M37 22v17M14 39h-6M40 39h-6" />,
  sideboard: <path d="M6 18h36v18H6zM18 18v18M30 18v18M9 36v3M39 36v3M10 12h4v6h-4zM34 14h5v4h-5z" />,
  shelf: <path d="M12 6h24v36H12zM12 15h24M12 24h24M12 33h24M15 9v6M18 10v5M21 9v6M27 27v6M30 28v5" />,
  nightstand: <path d="M12 24h24v15H12zM12 31h24M22 27.5h4M19 12h10l2 6H17zM24 18v6M14 39v2M34 39v2" />,
  bed: <path d="M6 35V17a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v18M6 27h36M6 35h36M10 20h11v5H10zM27 20h11v5H27zM8 35v3M40 35v3" />,
  kitchen: <path d="M4 26h40v14H4zM4 30h40M14 30v10M24 30v10M34 30v10M8 8h16v10H8zM16 8v10M28 14h14M31 22c0-3 4-3 4 0" />,
  island: <path d="M6 18h36v4H6zM8 22h32v10H8zM14 32v9M24 32v9M34 32v9M11 41h6M21 41h6M31 41h6" />,
  pantry: <path d="M12 4h24v40H12zM24 4v40M27 18h6v6h-6zM15 20v6M27 30h6M27 9h6" />,
  floorlamp: <path d="M18 6h12l3 10H15zM24 16v25M18 42h12" />,
  pendant: (
    <>
      <path d="M24 3v13" />
      <circle cx="24" cy="26" r="10" />
    </>
  ),
  olive: (
    <>
      <path d="M18 34h12l-2 9h-8zM24 34V20M24 26l-5-5M24 23l5-5" />
      <circle cx="17" cy="16" r="5" />
      <circle cx="29" cy="13" r="5" />
      <circle cx="23" cy="9" r="4" />
    </>
  ),
  rug: <path d="M8 14h32v20H8zM12 18h24v12H12zM8 14l-2-2M8 34l-2 2M40 14l2-2M40 34l2 2" />,
};

const ROOM_ICONS: Record<RoomType, ReactNode> = {
  living: ICONS.sofa,
  kitchen: ICONS.kitchen,
  dining: ICONS.dining,
  bedroom: ICONS.bed,
};

function Icon({ type, className = "h-11 w-11" }: { type: FurnId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[type]}
    </svg>
  );
}
function RoomIcon({ type, className = "h-6 w-6" }: { type: RoomType; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ROOM_ICONS[type]}
    </svg>
  );
}

/* ----------------------------------------------------------- Controls -- */

function Label({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-ink/45">{children}</p>
      {aside && <p className="truncate text-[12px] text-ink/70">{aside}</p>}
    </div>
  );
}

function Swatches<T extends { id: string; name: string; color: string }>({
  label,
  list,
  value,
  onChange,
  extra,
}: {
  label: string;
  list: readonly T[];
  value: string | undefined;
  onChange: (id: T["id"] | undefined) => void;
  extra?: string;
}) {
  const current = list.find((x) => x.id === value);
  return (
    <div>
      <Label aside={current?.name ?? extra}>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {extra && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={`h-8 rounded-full border px-3 text-[11.5px] transition-colors ${
              value === undefined ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink/65 hover:border-ink/40"
            }`}
          >
            {extra}
          </button>
        )}
        {list.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            title={o.name}
            aria-label={o.name}
            aria-pressed={o.id === value}
            className={`h-8 w-8 rounded-full border transition-[box-shadow,transform] duration-300 hover:scale-105 ${
              o.id === value ? "border-ink/40 shadow-[0_0_0_2px_#f6f2ea,0_0_0_3.5px_#ff6325]" : "border-ink/15"
            }`}
            style={{ background: o.color }}
          />
        ))}
      </div>
    </div>
  );
}

function Chips<T extends { id: string; name: string }>({ label, list, value, onChange }: { label: string; list: readonly T[]; value: string; onChange: (id: T["id"]) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {list.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
              o.id === value ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink"
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ View == */

type Tab = "rooms" | "furniture" | "materials" | "light";

function isProject(x: unknown): x is Project {
  const p = x as Project;
  return (
    !!p &&
    Array.isArray(p.rooms) &&
    p.rooms.length > 0 &&
    p.rooms.length <= MAX_ROOMS &&
    p.rooms.every((r) => r.type in { living: 1, kitchen: 1, dining: 1, bedroom: 1 } && Array.isArray(r.items) && r.items.every((i) => i.type in FURN)) &&
    !!p.palette
  );
}

export default function DesignView() {
  const [project, setProject] = useState<Project>(defaultProject);
  const [current, setCurrent] = useState<string>("r1");
  const [focus, setFocus] = useState(false); // false = whole floor, true = one room
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("rooms");
  const [drawing, setDrawing] = useState(false);
  const [view, setView] = useState<CameraView>("corner");
  const [viewNonce, setViewNonce] = useState(0);
  const [mood, setMood] = useState<string | null>("warm-minimal");
  const [adding, setAdding] = useState(false);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const loaded = useRef(false);

  const room = project.rooms.find((r) => r.id === current) ?? project.rooms[0];

  // Restore the visitor's last floor, then keep it saved.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) {
        const p = JSON.parse(raw);
        if (isProject(p)) {
          /* eslint-disable react-hooks/set-state-in-effect -- browser storage is client-only */
          setProject(p);
          setCurrent(p.rooms[0].id);
          setMood(null);
          /* eslint-enable react-hooks/set-state-in-effect */
        }
      }
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORE, JSON.stringify(project));
    } catch {}
  }, [project]);

  /* --------------------------------------------------------- Updates -- */

  const updateRoom = useCallback((id: string, fn: (r: RoomData) => RoomData) => {
    setProject((p) => ({ ...p, rooms: p.rooms.map((r) => (r.id === id ? fn(r) : r)) }));
  }, []);
  const patchRoom = (p: Partial<RoomData>) => {
    updateRoom(room.id, (r) => ({ ...r, ...p }));
    setMood(null);
  };
  const setItems = useCallback((roomId: string, fn: (l: Item[]) => Item[]) => updateRoom(roomId, (r) => ({ ...r, items: fn(r.items) })), [updateRoom]);
  const setPalette = (p: Partial<Palette>) => {
    setProject((x) => ({ ...x, palette: { ...x.palette, ...p } }));
    setMood(null);
  };

  const addRoom = (type: RoomType) => {
    if (project.rooms.length >= MAX_ROOMS) return;
    const base = ROOM_TYPES.find((t) => t.id === type)!.name;
    const same = project.rooms.filter((r) => r.type === type).length;
    const id = uid("r");
    const r = makeRoom(id, type, same ? `${base} ${same + 1}` : base);
    // New rooms pick up the home's current wall and floor finishes.
    const ref = project.rooms[0];
    const fresh: RoomData = { ...r, walls: ref.walls, floor: type === "kitchen" && ref.floor === "oak" ? "limestone" : ref.floor };
    setProject((p) => ({ ...p, rooms: [...p.rooms, fresh] }));
    setCurrent(id);
    setSelected(null);
    setAdding(false);
  };
  const removeRoom = (id: string) => {
    if (project.rooms.length <= 1) return;
    const rest = project.rooms.filter((r) => r.id !== id);
    setProject((p) => ({ ...p, rooms: p.rooms.filter((r) => r.id !== id) }));
    if (current === id) setCurrent(rest[0].id);
    setSelected(null);
  };
  const resize = (size: SizeId) => {
    updateRoom(room.id, (r) => ({ ...r, size, items: rescale(r.items, dimsOf(r.type, r.size), dimsOf(r.type, size)) }));
  };
  const resetFurniture = () => {
    updateRoom(room.id, (r) => ({ ...r, items: seedItems(r.type, r.size, uid(r.id)) }));
    setSelected(null);
  };
  const wallsFloorToAll = () => {
    setProject((p) => ({
      ...p,
      rooms: p.rooms.map((r) => ({ ...r, walls: room.walls, floor: r.type === "kitchen" && room.floor === "oak" ? r.floor : room.floor })),
    }));
  };

  const add = (type: FurnId) => {
    const dims = dimsOf(room.type, room.size);
    const n = room.items.length;
    const p = clampToRoom(type, ((n % 5) - 2) * 0.3, 0.5 - FURN[type].d / 2 + ((n % 3) - 1) * 0.25, dims);
    const it: Item = { id: uid(), type, x: p.x, z: p.z, rot: 0 };
    setItems(room.id, (l) => [...l, it]);
    setSelected(it.id);
  };
  const selRoom = project.rooms.find((r) => r.items.some((i) => i.id === selected));
  const sel = selRoom?.items.find((i) => i.id === selected) ?? null;
  const remove = useCallback(
    (id: string) => {
      setProject((p) => ({ ...p, rooms: p.rooms.map((r) => ({ ...r, items: r.items.filter((i) => i.id !== id) })) }));
      setSelected(null);
    },
    [],
  );
  const updateItem = (id: string, patch: Partial<Item>) =>
    setProject((p) => ({ ...p, rooms: p.rooms.map((r) => ({ ...r, items: r.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })) }));
  const rotate = (it: Item, roomData: RoomData, d: number) => {
    const rot = (it.rot + d + 8) % 8;
    updateItem(it.id, { rot, ...clampToRoom(it.type, it.x, it.z, dimsOf(roomData.type, roomData.size), rot) });
  };
  const duplicate = (it: Item, roomData: RoomData) => {
    const p = clampToRoom(it.type, it.x + 0.35, it.z + 0.35, dimsOf(roomData.type, roomData.size), it.rot);
    const copy = { ...it, id: uid(), ...p };
    setItems(roomData.id, (l) => [...l, copy]);
    setSelected(copy.id);
  };
  const move = useCallback((roomId: string, id: string, x: number, z: number) => setItems(roomId, (l) => l.map((i) => (i.id === id ? { ...i, x, z } : i))), [setItems]);
  const onSelect = useCallback((id: string | null, roomId?: string) => {
    setSelected(id);
    if (roomId) setCurrent(roomId);
  }, []);

  const openRoom = useCallback((id: string) => {
    setCurrent(id);
    setFocus(true);
    setSelected(null);
    setView("front");
    setViewNonce((n) => n + 1);
  }, []);
  const openFloor = () => {
    setFocus(false);
    setSelected(null);
    setView("corner");
    setViewNonce((n) => n + 1);
  };
  const doMood = (id: string) => {
    setProject((p) => applyMood(p, id));
    setMood(id);
  };
  const goView = (v: CameraView) => {
    setView(v);
    setViewNonce((n) => n + 1);
  };
  const saveImage = () => {
    const c = canvas.current;
    if (!c) return;
    // The 3D canvas is transparent over the dotted backdrop, so flatten it onto a solid colour.
    const out = document.createElement("canvas");
    out.width = c.width;
    out.height = c.height;
    const g = out.getContext("2d")!;
    g.fillStyle = drawing ? "#ffffff" : project.light === "evening" ? "#1a1614" : "#f4f1eb";
    g.fillRect(0, 0, out.width, out.height);
    g.drawImage(c, 0, 0);
    const a = document.createElement("a");
    a.download = "lonora-my-floor.png";
    a.href = out.toDataURL("image/png");
    a.click();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") setSelected(null);
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault();
        remove(selected);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, remove]);

  /* -------------------------------------------------------- Derived -- */

  const price = useMemo(() => quote(project), [project]);
  const sceneRooms: SceneRoom[] = useMemo(() => {
    const { offsets, dims } = floorLayout(project.rooms);
    return project.rooms.map((r, i) => ({ id: r.id, name: r.name, dims: dims[i], style: styleOf(r, project), items: r.items, offset: offsets[i] }));
  }, [project]);

  const counts = useMemo(() => {
    const c: Partial<Record<FurnId, number>> = {};
    for (const i of room.items) c[i.type] = (c[i.type] ?? 0) + 1;
    return c;
  }, [room]);

  const summary = useMemo(() => {
    const parts = project.rooms.map((r) => {
      const n = r.items.length;
      return `${r.name} (${(dimsOf(r.type, r.size).w * dimsOf(r.type, r.size).d).toFixed(0)} m², ${find(WALLS, r.walls).name}, ${find(FLOORS, r.floor).name}, ${n} pieces)`;
    });
    return encodeURIComponent(parts.join("; "));
  }, [project]);

  const groups = room.type === "kitchen" ? GROUPS : [...GROUPS.slice(1), GROUPS[0]];
  const full = project.rooms.length >= MAX_ROOMS;
  const evening = project.light === "evening" && !drawing;

  return (
    <div className="bg-[#471F1F] text-bone">
      {/* Intro */}
      <section className="wrap pb-12 pt-32 md:pb-14 md:pt-40">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow mb-5 text-white/50">[ Design your space ]</p>
            <SplitReveal as="h1" immediate delay={0.2} className="display display-lg">
              Compose your home
            </SplitReveal>
          </div>
          <p className="max-w-[420px] text-[15.5px] leading-relaxed text-white/65 md:col-span-4 md:col-start-9">
            Plan a whole floor of up to four rooms, kitchen included. Shape each room&apos;s architecture, arrange the furniture and
            dress it in plaster, timber, stone and light, then send it to the studio.
          </p>
        </div>

        {/* Start from a mood */}
        <div className="mt-12">
          <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-white/45">Start from a mood</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {MOODS.map((m) => {
              const active = mood === m.id;
              const sw = [find(WALLS, m.style.walls).color, find(FLOORS, m.style.floor).color, find(UPHOLSTERY, m.style.upholstery).color, find(WOODS, m.style.wood).color];
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => doMood(m.id)}
                  className={`group overflow-hidden rounded-[14px] border bg-white/[0.05] text-left text-bone transition-[border-color,box-shadow] duration-300 ${
                    active ? "border-terracotta shadow-[0_0_0_1px_#ff6325]" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Photo
                      id={MOOD_PHOTOS[m.id]}
                      alt={`${m.name} interior`}
                      sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                      className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                    />
                    <div className="absolute bottom-2 right-2 flex -space-x-1">
                      {sw.map((c, i) => (
                        <span key={i} className="h-3.5 w-3.5 rounded-full border border-white/80" style={{ background: c }} />
                      ))}
                    </div>
                    {active && (
                      <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-white">
                        Applied
                      </span>
                    )}
                  </div>
                  <div className="px-3.5 pb-3.5 pt-3">
                    <p className="display truncate text-[15px] leading-none">{m.name}</p>
                    <p className="mt-1.5 truncate text-[11.5px] text-white/50">{m.note}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Composer */}
      <section className="wrap pb-24 md:pb-32">
        <div className="relative grid overflow-hidden rounded-[22px] border border-white/10 bg-white text-ink md:h-[min(calc(100svh-110px),880px)] md:min-h-[660px] md:grid-cols-[350px_1fr]">
          <aside className="order-2 flex min-h-0 flex-col border-t border-ink/10 bg-bone/60 md:order-1 md:border-r md:border-t-0">
            {sel && selRoom ? (
              <SelectedPanel
                item={sel}
                roomName={selRoom.name}
                palette={project.palette}
                onClose={() => setSelected(null)}
                onFinish={(f) => updateItem(sel.id, { finish: f })}
                onRotate={(d) => rotate(sel, selRoom, d)}
                onDuplicate={() => duplicate(sel, selRoom)}
                onRemove={() => remove(sel.id)}
              />
            ) : (
              <>
                <div className="grid grid-cols-4 gap-1 border-b border-ink/10 p-2">
                  {(["rooms", "furniture", "materials", "light"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`rounded-full px-2 py-2 text-[12.5px] capitalize transition-colors ${tab === t ? "bg-ink text-bone" : "text-ink/60 hover:text-ink"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
                  {tab === "rooms" && (
                    <div className="space-y-8">
                      {/* Floor plan: the list of rooms */}
                      <div>
                        <Label aside={`${project.rooms.length} of ${MAX_ROOMS} rooms · ${price.area.toFixed(0)} m²`}>Your floor</Label>
                        <ul className="space-y-2">
                          {project.rooms.map((r) => {
                            const d = dimsOf(r.type, r.size);
                            const active = r.id === room.id;
                            return (
                              <li
                                key={r.id}
                                className={`flex items-center gap-3 rounded-[14px] border bg-white p-2.5 pl-3 transition-colors ${
                                  active ? "border-terracotta" : "border-ink/10"
                                }`}
                              >
                                <button type="button" onClick={() => setCurrent(r.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                                  <span className={active ? "text-terracotta" : "text-ink/60"}>
                                    <RoomIcon type={r.type} />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-[13.5px] font-medium">{r.name}</span>
                                    <span className="block text-[11.5px] text-ink/50">
                                      {d.w.toFixed(1)} × {d.d.toFixed(1)} m · {r.items.length} pieces
                                    </span>
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRoom(r.id)}
                                  className="rounded-full border border-ink/15 px-3 py-1 text-[11.5px] text-ink/70 transition-colors hover:border-ink hover:bg-ink hover:text-bone"
                                >
                                  Open
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeRoom(r.id)}
                                  disabled={project.rooms.length <= 1}
                                  aria-label={`Remove ${r.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-[15px] text-ink/40 transition-colors hover:bg-terracotta/10 hover:text-terracotta disabled:pointer-events-none disabled:opacity-30"
                                >
                                  ×
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="mt-3">
                          <p className="mb-2 text-[11.5px] text-ink/50">{full ? "Your floor is full. Remove a room to add another." : "Add a room"}</p>
                          <div className="grid grid-cols-4 gap-2">
                            {ROOM_TYPES.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                disabled={full}
                                onClick={() => addRoom(t.id)}
                                className="flex flex-col items-center gap-1 rounded-[12px] border border-dashed border-ink/20 bg-white/60 px-1 py-2.5 text-ink/65 transition-colors hover:border-terracotta hover:text-ink disabled:pointer-events-none disabled:opacity-35"
                              >
                                <RoomIcon type={t.id} />
                                <span className="text-[10.5px] leading-tight">+ {t.name.replace(" room", "")}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* The selected room's settings */}
                      <div className="space-y-6 border-t border-ink/10 pt-7">
                        <div>
                          <Label>Room name</Label>
                          <input
                            value={room.name}
                            maxLength={28}
                            onChange={(e) => patchRoom({ name: e.target.value })}
                            className="w-full rounded-full border border-ink/15 bg-white px-4 py-2 text-[13.5px] outline-none transition-colors focus:border-terracotta"
                          />
                        </div>
                        <Chips label="Size" list={SIZE_NAMES} value={room.size} onChange={resize} />
                        <Chips label="Back wall" list={BACKWALLS} value={room.back} onChange={(v) => patchRoom({ back: v })} />
                        <Chips label="Windows" list={WINDOWS} value={room.window} onChange={(v) => patchRoom({ window: v })} />
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                          <span>
                            <span className="block text-[11px] uppercase tracking-[0.14em] text-ink/45">Fireplace</span>
                            <span className="mt-1 block text-[12.5px] text-ink/60">Plaster chimney breast with a stone hearth</span>
                          </span>
                          <input type="checkbox" checked={room.fireplace} onChange={(e) => patchRoom({ fireplace: e.target.checked })} className="peer sr-only" />
                          <span className="relative h-6 w-11 shrink-0 rounded-full bg-ink/15 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-terracotta peer-checked:after:translate-x-5" />
                        </label>
                        <button type="button" onClick={resetFurniture} className="text-[12.5px] text-ink/55 underline-offset-4 hover:text-ink hover:underline">
                          Reset the furniture in {room.name}
                        </button>
                      </div>
                    </div>
                  )}

                  {tab === "furniture" && (
                    <div className="space-y-7">
                      <p className="rounded-[12px] bg-white px-3.5 py-2.5 text-[12.5px] text-ink/60">
                        Adding to <span className="font-medium text-ink">{room.name}</span>. Choose another room in the Rooms tab or the bar above.
                      </p>
                      {groups.map((g) => (
                        <div key={g.title}>
                          <Label>{g.title}</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {g.types.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => add(t)}
                                title={`Add ${FURN[t].name}`}
                                className="group relative flex flex-col items-center gap-1 rounded-[14px] border border-ink/10 bg-white px-1 pb-2.5 pt-3 text-ink/70 transition-colors hover:border-terracotta/60 hover:text-ink"
                              >
                                <Icon type={t} />
                                <span className="text-center text-[11px] leading-tight">{FURN[t].name}</span>
                                <span className="text-center text-[10px] leading-tight text-ink/40">{FURN[t].note}</span>
                                {counts[t] ? (
                                  <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] text-bone">
                                    {counts[t]}
                                  </span>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <p className="text-[12px] leading-relaxed text-ink/45">
                        Click a piece to add it, then drag it into place. Click any piece to rotate, refinish or remove it.
                      </p>
                    </div>
                  )}

                  {tab === "materials" && (
                    <div className="space-y-7">
                      <div className="space-y-6">
                        <p className="text-[12.5px] text-ink/60">
                          Walls and floor for <span className="font-medium text-ink">{room.name}</span>
                        </p>
                        <Swatches label="Walls" list={WALLS} value={room.walls} onChange={(v) => v && patchRoom({ walls: v })} />
                        <Swatches label="Floor" list={FLOORS} value={room.floor} onChange={(v) => v && patchRoom({ floor: v })} />
                        {project.rooms.length > 1 && (
                          <button type="button" onClick={wallsFloorToAll} className="text-[12.5px] text-terracotta underline-offset-4 hover:underline">
                            Use these walls and floor in every room
                          </button>
                        )}
                      </div>
                      <div className="space-y-6 border-t border-ink/10 pt-7">
                        <p className="text-[12.5px] text-ink/60">Across the whole home</p>
                        <Swatches label="Upholstery" list={UPHOLSTERY} value={project.palette.upholstery} onChange={(v) => v && setPalette({ upholstery: v })} />
                        <Swatches label="Timber" list={WOODS} value={project.palette.wood} onChange={(v) => v && setPalette({ wood: v })} />
                        <Swatches label="Stone" list={STONES} value={project.palette.stone} onChange={(v) => v && setPalette({ stone: v })} />
                      </div>
                    </div>
                  )}

                  {tab === "light" && (
                    <div className="space-y-3">
                      <Label>Time of day</Label>
                      {LIGHTS.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            setProject((p) => ({ ...p, light: l.id }));
                            setMood(null);
                          }}
                          className={`flex w-full items-center gap-4 rounded-[16px] border bg-white p-3 text-left transition-colors ${
                            project.light === l.id ? "border-terracotta" : "border-ink/10 hover:border-ink/30"
                          }`}
                        >
                          <span className="h-12 w-16 shrink-0 rounded-[10px]" style={{ background: l.preview }} />
                          <span>
                            <span className="display block text-[18px] leading-none">{l.name}</span>
                            <span className="mt-1 block text-[12px] text-ink/50">{l.note}</span>
                          </span>
                        </button>
                      ))}
                      <p className="pt-3 text-[12px] leading-relaxed text-ink/45">
                        Open a room to see the light fall through its windows. We study how light moves through every room we design.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Estimate + send */}
            <div className="border-t border-ink/10 bg-white p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.14em] text-ink/45">Indicative budget</span>
                <span className="display text-[26px] leading-none">{money(price.total)}</span>
              </div>
              <div data-lenis-prevent className="mt-3 grid max-h-[92px] grid-cols-[1fr_auto] gap-x-4 gap-y-1 overflow-y-auto text-[11.5px] text-ink/50">
                {price.rooms.map((r) => (
                  <div key={r.id} className="contents">
                    <span className="truncate">{r.name}</span>
                    <span className="text-right tabular-nums">{money(r.total)}</span>
                  </div>
                ))}
                <span>Design (15%)</span>
                <span className="text-right tabular-nums">{money(price.design)}</span>
              </div>
              <TLink href={`/contact?design=${summary}`} className="btn btn-dark mt-4 w-full justify-center">
                Send my design
              </TLink>
            </div>
          </aside>

          {/* 3D */}
          <div data-lenis-prevent className="relative order-1 h-[64svh] min-h-[460px] md:order-2 md:h-auto">
            <Planner3D
              rooms={sceneRooms}
              focus={focus ? room.id : null}
              current={room.id}
              light={project.light}
              drawing={drawing}
              view={view}
              viewNonce={viewNonce}
              selected={selected}
              onSelect={onSelect}
              onMove={move}
              onFocusRoom={openRoom}
              onReady={(c) => (canvas.current = c)}
            />

            {/* Floor / room switcher */}
            <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
              <div className="pointer-events-auto relative flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-ink/90 p-1 text-bone shadow-lg backdrop-blur">
                <button
                  type="button"
                  onClick={openFloor}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors ${!focus ? "bg-terracotta text-white" : "text-white/70 hover:text-white"}`}
                >
                  Whole floor
                </button>
                <span className="mx-1 h-4 w-px shrink-0 bg-white/15" />
                {project.rooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => openRoom(r.id)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors ${
                      focus && r.id === room.id ? "bg-bone text-ink" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
                {!full && (
                  <button
                    type="button"
                    onClick={() => setAdding((v) => !v)}
                    aria-expanded={adding}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[16px] leading-none transition-colors hover:bg-white/20"
                    title="Add a room"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
            {adding && !full && (
              <div className="absolute left-1/2 top-[62px] z-10 flex -translate-x-1/2 gap-1 rounded-[16px] border border-ink/10 bg-white p-1.5 shadow-xl">
                {ROOM_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => addRoom(t.id)}
                    className="flex flex-col items-center gap-1 rounded-[12px] px-3 py-2 text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    <RoomIcon type={t.id} />
                    <span className="whitespace-nowrap text-[11px]">{t.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* View controls */}
            <div className="absolute right-3 top-16 flex flex-col gap-2 md:right-4 md:top-4">
              <div className="flex flex-col overflow-hidden rounded-[14px] border border-ink/10 bg-white/90 text-[12px] backdrop-blur">
                {(["front", "corner", "plan"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => goView(v)}
                    className={`px-3.5 py-2 text-left capitalize transition-colors ${view === v ? "bg-ink text-bone" : "text-ink/70 hover:bg-ink/5"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex flex-col overflow-hidden rounded-[14px] border border-ink/10 bg-white/90 text-[12px] backdrop-blur">
                <button type="button" onClick={() => setDrawing(false)} className={`px-3.5 py-2 text-left transition-colors ${!drawing ? "bg-ink text-bone" : "text-ink/70 hover:bg-ink/5"}`}>
                  Render
                </button>
                <button type="button" onClick={() => setDrawing(true)} className={`px-3.5 py-2 text-left transition-colors ${drawing ? "bg-ink text-bone" : "text-ink/70 hover:bg-ink/5"}`}>
                  Drawing
                </button>
              </div>
              <button
                type="button"
                onClick={saveImage}
                className="rounded-[14px] border border-ink/10 bg-white/90 px-3.5 py-2 text-left text-[12px] text-ink/70 backdrop-blur transition-colors hover:bg-ink/5"
              >
                Save image
              </button>
            </div>

            <p className={`pointer-events-none absolute bottom-4 left-4 hidden text-[11.5px] md:block ${evening ? "text-white/50" : "text-ink/45"}`}>
              {focus ? "Drag furniture to move it · Drag the room to orbit · Scroll to zoom" : "Click a room's label to open it · Drag furniture to move it · Scroll to zoom"}
            </p>
            <span className={`pointer-events-none absolute bottom-4 right-4 font-[family-name:var(--font-display)] text-[15px] tracking-[0.12em] ${evening ? "text-white/55" : "text-ink/50"}`}>
              LONORA
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#311414] py-24 text-bone md:py-32">
        <div className="wrap">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <SplitReveal className="display display-md md:col-span-6">From first idea to a drawn design</SplitReveal>
            <p className="max-w-[400px] text-[15px] leading-relaxed text-white/60 md:col-span-4 md:col-start-9">
              The composer is a starting point. Our architects measure your home, test the plan and refine every detail with you.
            </p>
          </div>
          <RevealGroup className="mt-14 grid gap-px overflow-hidden rounded-[22px] bg-white/10 md:grid-cols-3">
            {[
              ["Compose", "Plan your rooms, place the furniture and choose the materials and light that feel like you."],
              ["Send", "Share it with the studio. It arrives with every room, its palette and an indicative budget."],
              ["Develop", "We survey, draw and render it properly, then return a full design with a fixed proposal."],
            ].map(([t, d], i) => (
              <div key={t} data-reveal data-delay={i * 0.08} className="bg-[#311414] p-8 md:p-10">
                <span className="display text-[44px] leading-none text-terracotta">0{i + 1}</span>
                <p className="display mt-6 text-[26px] leading-none">{t}</p>
                <p className="mt-4 max-w-[320px] text-[14.5px] leading-relaxed text-white/60">{d}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>
    </div>
  );
}

function SelectedPanel({
  item,
  roomName,
  palette,
  onClose,
  onFinish,
  onRotate,
  onDuplicate,
  onRemove,
}: {
  item: Item;
  roomName: string;
  palette: Palette;
  onClose: () => void;
  onFinish: (f: string | undefined) => void;
  onRotate: (d: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const def = FURN[item.type];
  const dims: [string, number][] = [
    ["Width", def.w],
    ["Depth", def.d],
    ["Height", item.type === "pendant" ? 0.5 : def.h],
  ];
  const slot = def.slot;
  const list = (slot === "none" ? [] : SLOT_LIST[slot]) as readonly { id: string; name: string; color: string }[];
  const slotLabel = { upholstery: "Upholstery", wood: "Timber", stone: "Stone", none: "" }[slot];
  return (
    <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto p-5">
      <button type="button" onClick={onClose} className="mb-5 text-[12.5px] text-ink/55 transition-colors hover:text-ink">
        ← Back
      </button>
      <div className="flex items-center gap-4 rounded-[16px] border border-ink/10 bg-white p-4">
        <span className="text-ink/70">
          <Icon type={item.type} className="h-14 w-14" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terracotta">Selected · {roomName}</p>
          <p className="display mt-1 text-[22px] leading-none">{def.name}</p>
          <p className="mt-2 text-[12px] text-ink/50">
            {def.note} · from ${def.price.toLocaleString("en-US")}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {dims.map(([k, v]) => (
          <div key={k} className="rounded-[12px] bg-white px-2 py-2.5">
            <dt className="text-[10px] uppercase tracking-[0.12em] text-ink/40">{k}</dt>
            <dd className="mt-0.5 text-[13.5px] tabular-nums">{Math.round(v * 1000)}</dd>
          </div>
        ))}
      </dl>
      {slot !== "none" && (
        <div className="mt-7">
          <Swatches label={slotLabel} list={list} value={item.finish} onChange={onFinish} extra="Home palette" />
          {item.finish === undefined && <p className="mt-2 text-[11.5px] text-ink/45">Following the home: {find(list, palette[slot]).name}</p>}
        </div>
      )}
      <div className="mt-7">
        <Label>Orientation</Label>
        <div className="flex gap-2">
          <button type="button" onClick={() => onRotate(-1)} className="btn btn-ghost-ink h-10 flex-1 justify-center text-[13px]">
            ↺ 45°
          </button>
          <button type="button" onClick={() => onRotate(1)} className="btn btn-ghost-ink h-10 flex-1 justify-center text-[13px]">
            ↻ 45°
          </button>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onDuplicate} className="btn btn-ghost-ink h-10 flex-1 justify-center text-[13px]">
          Duplicate
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="h-10 flex-1 rounded-full border border-terracotta/40 text-[13px] text-terracotta transition-colors hover:bg-terracotta hover:text-white"
        >
          Remove
        </button>
      </div>
      <p className="mt-6 text-[12px] leading-relaxed text-ink/45">Drag the piece in the room to move it. Press Delete to remove it.</p>
    </div>
  );
}
