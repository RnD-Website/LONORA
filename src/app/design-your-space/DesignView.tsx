"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TLink } from "@/components/Transition";
import { SplitReveal, RevealGroup } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { projects } from "@/lib/content";
import {
  BACKWALLS,
  DEFAULT_STYLE,
  FLOORS,
  FURN,
  GROUPS,
  LIGHTS,
  MOODS,
  ROOMS,
  SLOT_LIST,
  STONES,
  UPHOLSTERY,
  WALLS,
  WINDOWS,
  WOODS,
  clampToRoom,
  find,
  quote,
  seedRoom,
  uid,
  type FurnId,
  type Item,
  type RoomType,
  type Style,
} from "./catalog";
import type { CameraView } from "./Planner3D";

const Planner3D = dynamic(() => import("./Planner3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-[12px] uppercase tracking-[0.18em] text-ink/40">
      Preparing the room…
    </div>
  ),
});

const STORE = "lonora-composer-v1";
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

type Saved = { rooms: Record<RoomType, Item[]>; style: Style };
const freshRooms = (): Record<RoomType, Item[]> => ({ living: seedRoom("living"), bedroom: seedRoom("bedroom"), dining: seedRoom("dining") });

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

function Icon({ type, className = "h-11 w-11" }: { type: FurnId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[type]}
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
  extra?: string; // label for an "inherit" option
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

type Tab = "room" | "furniture" | "materials" | "light";

export default function DesignView() {
  const [rooms, setRooms] = useState<Record<RoomType, Item[]>>(freshRooms);
  const [style, setStyle] = useState<Style>(DEFAULT_STYLE);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("furniture");
  const [drawing, setDrawing] = useState(false);
  const [view, setView] = useState<CameraView>("front");
  const [viewNonce, setViewNonce] = useState(0);
  const [mood, setMood] = useState<string | null>("warm-minimal");
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const loaded = useRef(false);

  const items = rooms[style.room];
  const setItems = useCallback(
    (fn: (list: Item[]) => Item[]) => setRooms((r) => ({ ...r, [style.room]: fn(r[style.room]) })),
    [style.room],
  );

  // Restore the visitor's last composition, then keep it saved.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        if (s.rooms && s.style && Object.values(s.rooms).every((l) => Array.isArray(l) && l.every((i) => i.type in FURN))) {
          /* eslint-disable react-hooks/set-state-in-effect -- browser storage is client-only */
          setRooms({ ...freshRooms(), ...s.rooms });
          setStyle({ ...DEFAULT_STYLE, ...s.style });
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
      window.localStorage.setItem(STORE, JSON.stringify({ rooms, style } satisfies Saved));
    } catch {}
  }, [rooms, style]);

  const price = useMemo(() => quote(items, style), [items, style]);
  const sel = items.find((i) => i.id === selected) ?? null;

  const patch = (p: Partial<Style>) => {
    setStyle((s) => ({ ...s, ...p }));
    setMood(null);
  };
  const add = (type: FurnId) => {
    const def = FURN[type];
    // New pieces land near the middle of the room, nudged so they don't stack exactly.
    const n = items.length;
    const p = clampToRoom(type, ((n % 5) - 2) * 0.3, 0.6 - def.d / 2 + ((n % 3) - 1) * 0.25);
    const it: Item = { id: uid(), type, x: p.x, z: p.z, rot: 0 };
    setItems((l) => [...l, it]);
    setSelected(it.id);
  };
  const remove = useCallback(
    (id: string) => {
      setItems((l) => l.filter((i) => i.id !== id));
      setSelected(null);
    },
    [setItems],
  );
  const update = (id: string, p: Partial<Item>) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const move = useCallback((id: string, x: number, z: number) => setItems((l) => l.map((i) => (i.id === id ? { ...i, x, z } : i))), [setItems]);
  const duplicate = (id: string) => {
    const src = items.find((i) => i.id === id);
    if (!src) return;
    const p = clampToRoom(src.type, src.x + 0.35, src.z + 0.35);
    const copy = { ...src, id: uid(), ...p };
    setItems((l) => [...l, copy]);
    setSelected(copy.id);
  };
  const switchRoom = (room: RoomType) => {
    setStyle((s) => ({ ...s, room }));
    setSelected(null);
  };
  const resetRoom = () => {
    setItems(() => seedRoom(style.room));
    setSelected(null);
  };
  const applyMood = (id: string) => {
    const m = MOODS.find((x) => x.id === id)!;
    setStyle((s) => ({ ...s, ...m.style }));
    setItems((l) => l.map((i) => ({ ...i, finish: undefined })));
    setMood(id);
  };
  const goView = (v: CameraView) => {
    setView(v);
    setViewNonce((n) => n + 1);
  };
  const saveImage = () => {
    const c = canvas.current;
    if (!c) return;
    const a = document.createElement("a");
    a.download = "lonora-my-room.png";
    a.href = c.toDataURL("image/png");
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

  const counts = useMemo(() => {
    const c: Partial<Record<FurnId, number>> = {};
    for (const i of items) c[i.type] = (c[i.type] ?? 0) + 1;
    return c;
  }, [items]);

  const summary = useMemo(() => {
    const room = ROOMS.find((r) => r.id === style.room)!.name;
    const parts = [
      room,
      find(BACKWALLS, style.back).name,
      find(WALLS, style.walls).name,
      find(FLOORS, style.floor).name,
      ...Object.entries(counts).map(([t, n]) => `${n} × ${FURN[t as FurnId].name}`),
    ];
    return encodeURIComponent(parts.join(", "));
  }, [counts, style]);

  const roomName = ROOMS.find((r) => r.id === style.room)!.name;

  return (
    <div className="bg-[#471F1F] text-bone">
      {/* Intro */}
      <section className="wrap pb-12 pt-32 md:pb-14 md:pt-40">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow mb-5 text-white/50">[ Design your space ]</p>
            <SplitReveal as="h1" immediate delay={0.2} className="display display-lg">
              Compose your room
            </SplitReveal>
          </div>
          <p className="max-w-[420px] text-[15.5px] leading-relaxed text-white/65 md:col-span-4 md:col-start-9">
            Shape the architecture, arrange the furniture and dress it in plaster, timber, stone and light. When it feels right,
            send it to the studio and we will develop it into a full design.
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
                  onClick={() => applyMood(m.id)}
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
        <div className="relative grid overflow-hidden rounded-[22px] border border-white/10 bg-white text-ink md:h-[min(calc(100svh-110px),860px)] md:min-h-[640px] md:grid-cols-[340px_1fr]">
          <aside className="order-2 flex min-h-0 flex-col border-t border-ink/10 bg-bone/60 md:order-1 md:border-r md:border-t-0">
            {sel ? (
              <SelectedPanel
                item={sel}
                style={style}
                onClose={() => setSelected(null)}
                onFinish={(f) => update(sel.id, { finish: f })}
                onRotate={(d) => update(sel.id, { rot: (sel.rot + d + 8) % 8 })}
                onDuplicate={() => duplicate(sel.id)}
                onRemove={() => remove(sel.id)}
              />
            ) : (
              <>
                <div className="grid grid-cols-4 gap-1 border-b border-ink/10 p-2">
                  {(["room", "furniture", "materials", "light"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`rounded-full px-2 py-2 text-[12.5px] capitalize transition-colors ${
                        tab === t ? "bg-ink text-bone" : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
                  {tab === "room" && (
                    <div className="space-y-7">
                      <Chips label="Room" list={ROOMS} value={style.room} onChange={switchRoom} />
                      <Chips label="Back wall" list={BACKWALLS} value={style.back} onChange={(v) => patch({ back: v })} />
                      <Chips label="Windows" list={WINDOWS} value={style.window} onChange={(v) => patch({ window: v })} />
                      <label className="flex cursor-pointer items-center justify-between gap-4">
                        <span>
                          <span className="block text-[11px] uppercase tracking-[0.14em] text-ink/45">Fireplace</span>
                          <span className="mt-1 block text-[12.5px] text-ink/60">Plaster chimney breast with a stone hearth</span>
                        </span>
                        <input type="checkbox" checked={style.fireplace} onChange={(e) => patch({ fireplace: e.target.checked })} className="peer sr-only" />
                        <span className="relative h-6 w-11 shrink-0 rounded-full bg-ink/15 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-terracotta peer-checked:after:translate-x-5" />
                      </label>
                      <button type="button" onClick={resetRoom} className="text-[12.5px] text-ink/55 underline-offset-4 hover:text-ink hover:underline">
                        Reset the {roomName.toLowerCase()} furniture
                      </button>
                    </div>
                  )}

                  {tab === "furniture" && (
                    <div className="space-y-7">
                      {GROUPS.map((g) => (
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
                                <span className="text-[10px] text-ink/40">{FURN[t].note}</span>
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
                        Click a piece to add it, then drag it into place in the room. Click any piece to rotate, refinish or remove it.
                      </p>
                    </div>
                  )}

                  {tab === "materials" && (
                    <div className="space-y-7">
                      <Swatches label="Walls" list={WALLS} value={style.walls} onChange={(v) => v && patch({ walls: v })} />
                      <Swatches label="Floor" list={FLOORS} value={style.floor} onChange={(v) => v && patch({ floor: v })} />
                      <Swatches label="Upholstery" list={UPHOLSTERY} value={style.upholstery} onChange={(v) => v && patch({ upholstery: v })} />
                      <Swatches label="Timber" list={WOODS} value={style.wood} onChange={(v) => v && patch({ wood: v })} />
                      <Swatches label="Stone" list={STONES} value={style.stone} onChange={(v) => v && patch({ stone: v })} />
                      <p className="text-[12px] leading-relaxed text-ink/45">
                        The palette applies to the whole room. Individual pieces can be given their own finish.
                      </p>
                    </div>
                  )}

                  {tab === "light" && (
                    <div className="space-y-3">
                      <Label>Time of day</Label>
                      {LIGHTS.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => patch({ light: l.id })}
                          className={`flex w-full items-center gap-4 rounded-[16px] border bg-white p-3 text-left transition-colors ${
                            style.light === l.id ? "border-terracotta" : "border-ink/10 hover:border-ink/30"
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
                        We study how light moves through every room we design. Windows face the morning and evening sun here.
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
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11.5px] text-ink/50">
                <span>Furniture</span>
                <span className="text-right tabular-nums">{money(price.furniture)}</span>
                <span>Architecture</span>
                <span className="text-right tabular-nums">{money(price.architecture)}</span>
                <span>Floor & walls</span>
                <span className="text-right tabular-nums">{money(price.surfaces)}</span>
                <span>Design (15%)</span>
                <span className="text-right tabular-nums">{money(price.design)}</span>
              </div>
              <TLink href={`/contact?design=${summary}`} className="btn btn-dark mt-4 w-full justify-center">
                Send my design
              </TLink>
            </div>
          </aside>

          {/* 3D room */}
          <div data-lenis-prevent className="relative order-1 h-[64svh] min-h-[440px] md:order-2 md:h-auto">
            <Planner3D
              items={items}
              style={style}
              drawing={drawing}
              view={view}
              viewNonce={viewNonce}
              selected={selected}
              onSelect={setSelected}
              onMove={move}
              onReady={(c) => (canvas.current = c)}
            />

            {/* Room switcher */}
            <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
              <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-ink/90 p-1 text-bone shadow-lg backdrop-blur">
                {ROOMS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => switchRoom(r.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors ${
                      style.room === r.id ? "bg-bone text-ink" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

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
                <button
                  type="button"
                  onClick={() => setDrawing(false)}
                  className={`px-3.5 py-2 text-left transition-colors ${!drawing ? "bg-ink text-bone" : "text-ink/70 hover:bg-ink/5"}`}
                >
                  Render
                </button>
                <button
                  type="button"
                  onClick={() => setDrawing(true)}
                  className={`px-3.5 py-2 text-left transition-colors ${drawing ? "bg-ink text-bone" : "text-ink/70 hover:bg-ink/5"}`}
                >
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

            <p className={`pointer-events-none absolute bottom-4 left-4 hidden text-[11.5px] md:block ${style.light === "evening" && !drawing ? "text-white/50" : "text-ink/45"}`}>
              Drag furniture to move it · Drag the room to orbit · Scroll to zoom
            </p>
            <span
              className={`pointer-events-none absolute bottom-4 right-4 font-[family-name:var(--font-display)] text-[15px] tracking-[0.12em] ${
                style.light === "evening" && !drawing ? "text-white/55" : "text-ink/50"
              }`}
            >
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
              The composer is a starting point. Our architects measure your space, test the plan and refine every detail with you.
            </p>
          </div>
          <RevealGroup className="mt-14 grid gap-px overflow-hidden rounded-[22px] bg-white/10 md:grid-cols-3">
            {[
              ["Compose", "Shape the room, place the furniture and choose the materials and light that feel like you."],
              ["Send", "Share it with the studio. It arrives with your layout, palette and indicative budget."],
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
  style,
  onClose,
  onFinish,
  onRotate,
  onDuplicate,
  onRemove,
}: {
  item: Item;
  style: Style;
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
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-terracotta">Selected</p>
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
          <Swatches label={slotLabel} list={list} value={item.finish} onChange={onFinish} extra="Room palette" />
          {item.finish === undefined && <p className="mt-2 text-[11.5px] text-ink/45">Following the room: {find(list, style[slot]).name}</p>}
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
