/**
 * LONORA — site content.
 *
 * Everything editorial lives here so it can later move to a CMS without
 * touching components. Items marked PLACEHOLDER must be replaced with real
 * information before launch (contact details, testimonials, team).
 */

export const brand = {
  name: "LONORA",
  tagline: "Interiors composed like architecture",
  description:
    "LONORA is an interior architecture studio shaping residential and commercial spaces through light, proportion and material.",
};

// PLACEHOLDER — replace with real details before launch.
export const contact = {
  email: "hello@lonora.studio",
  phone: "+971 00 000 0000",
  whatsapp: "https://wa.me/000000000000",
  address: "Studio address to be confirmed",
  hours: "Sunday to Thursday, 9:00 to 18:00",
  socials: [
    { label: "Instagram", href: "#" },
    { label: "Pinterest", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Behance", href: "#" },
  ],
};

// `href: null` marks a menu label whose page is not built yet (shown as plain text).
export const nav: { label: string; href: string | null }[] = [
  { label: "Work", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/studio" },
  { label: "Journal", href: "/journal" },
  { label: "Design Your Space", href: "/design-your-space" },
];

/* -------------------------------------------------------------------------- */
/*  3D room presets — every project is rendered as a live WebGL interior       */
/* -------------------------------------------------------------------------- */

export type RoomLayout = "gallery" | "living" | "arch" | "loft" | "court";

export type RoomPreset = {
  layout: RoomLayout;
  wall: string;
  floor: string;
  accent: string;
  fabric: string;
  /** sun colour + intensity give each space its time of day */
  sun: string;
  sunIntensity: number;
  ambient: string;
  /** 0 = matte limestone, 1 = polished stone */
  floorGloss: number;
  floorPattern?: "slab" | "plank";
};

export type PlanRoom = { label: string; x: number; y: number; w: number; h: number };

export type Project = {
  slug: string;
  title: string;
  category: "Residential" | "Commercial";
  type: string;
  location: string;
  area: string;
  year: string;
  scope: string[];
  tagline: string;
  summary: string;
  concept: string[];
  materials: { name: string; color: string }[];
  facts: { label: string; value: string }[];
  plan: PlanRoom[];
  room: RoomPreset;
  /** Unsplash photo ids (free licence) — placeholder photography. images[0] is the hero. */
  images: string[];
  status: string;
  client: string;
  team: string[];
  story: { title: string; text: string }[];
};

const residentialPlan: PlanRoom[] = [
  { label: "Foyer", x: 0, y: 0, w: 22, h: 24 },
  { label: "Living", x: 22, y: 0, w: 46, h: 40 },
  { label: "Dining", x: 68, y: 0, w: 32, h: 26 },
  { label: "Kitchen", x: 68, y: 26, w: 32, h: 22 },
  { label: "Gallery", x: 0, y: 24, w: 22, h: 46 },
  { label: "Master suite", x: 22, y: 40, w: 30, h: 30 },
  { label: "Dressing", x: 52, y: 40, w: 16, h: 30 },
  { label: "Bath", x: 68, y: 48, w: 14, h: 22 },
  { label: "Terrace", x: 82, y: 48, w: 18, h: 22 },
];

const commercialPlan: PlanRoom[] = [
  { label: "Arrival", x: 0, y: 0, w: 26, h: 30 },
  { label: "Lounge", x: 26, y: 0, w: 44, h: 36 },
  { label: "Bar", x: 70, y: 0, w: 30, h: 22 },
  { label: "Private room", x: 70, y: 22, w: 30, h: 26 },
  { label: "Display", x: 0, y: 30, w: 26, h: 40 },
  { label: "Workspace", x: 26, y: 36, w: 44, h: 34 },
  { label: "Back of house", x: 70, y: 48, w: 30, h: 22 },
];

export const projects: Project[] = [
  {
    slug: "maison-sable",
    title: "Maison Sable",
    category: "Residential",
    type: "Penthouse",
    location: "Dubai, UAE",
    area: "640 m²",
    year: "2026",
    scope: ["Interior architecture", "Furniture curation", "Lighting design"],
    tagline: "A penthouse drawn in sand and afternoon light",
    summary:
      "A full-floor penthouse rebuilt around one idea: let the desert light do the decorating.",
    concept: [
      "The existing apartment was a sequence of small rooms facing a wall of glass. We removed eleven partitions and replaced them with a single limestone spine that holds storage, the fireplace and the bar, so the plan reads as one continuous room that steps toward the view.",
      "Surfaces are kept deliberately quiet: honed travertine floors, lime-washed walls and oak joinery with a sand-blasted grain. The colour comes from the sun as it moves across the floor through the day.",
    ],
    materials: [
      { name: "Honed travertine", color: "#D9C7A8" },
      { name: "Lime plaster", color: "#E8DFD0" },
      { name: "Smoked oak", color: "#6B4F3A" },
      { name: "Bouclé wool", color: "#EFE9DE" },
      { name: "Bronze", color: "#8C6A43" },
    ],
    facts: [
      { label: "Ceiling", value: "3.6 m" },
      { label: "Partitions removed", value: "11" },
      { label: "Bespoke pieces", value: "38" },
    ],
    plan: residentialPlan,
    room: {
      layout: "living",
      wall: "#E6DCCB",
      floor: "#CDB894",
      accent: "#8C6A43",
      fabric: "#EFE7DA",
      sun: "#FFD7A8",
      sunIntensity: 3.2,
      ambient: "#F2E8D4",
      floorGloss: 0.35,
    },
    images: ["1774199679021-db3b421867c3", "1583847268964-b28dc8f51f92", "1632829882891-5047ccc421bc", "1762529716272-b316f61502e7", "1773578978637-c9771e7a9913", "1609081144289-eacc3108cd03", "1616486338812-3dadae4b4ace"],
    status: "Completed",
    client: "Private client",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "One room that steps toward the view", text: "With the partitions gone, the living, dining and library areas flow around a single limestone spine. Each zone is lifted or lowered by a step, so the plan reads as a sequence of terraces descending toward the glass and the city beyond." },
      { title: "Colour borrowed from the sun", text: "We kept the palette to sand, lime and smoked oak, and let the desert light do the rest. By late afternoon the travertine turns honey-gold; at night, concealed linear lights wash the plaster walls in a warm, even glow." },
    ],
  },
  {
    slug: "atelier-noor",
    title: "Atelier Noor",
    category: "Commercial",
    type: "Fashion flagship",
    location: "Doha, Qatar",
    area: "420 m²",
    year: "2026",
    scope: ["Retail concept", "Space planning", "Fixture design"],
    tagline: "A colonnade of light for a couture house",
    summary:
      "A flagship where garments hang between columns of light rather than on racks.",
    concept: [
      "We treated the boutique as a gallery. A rhythm of fluted plaster columns divides the floor into bays, each lit from above by a concealed slot so the clothes appear to float in shafts of daylight.",
      "Everything functional, from fitting rooms to stock, is hidden behind a continuous wall of brushed brass panels that open on touch.",
    ],
    materials: [
      { name: "Fluted plaster", color: "#EDE6DA" },
      { name: "Brushed brass", color: "#B08D57" },
      { name: "Pietra serena", color: "#8E8C86" },
      { name: "Raw silk", color: "#E9DCC9" },
    ],
    facts: [
      { label: "Columns", value: "14" },
      { label: "Fitting suites", value: "4" },
      { label: "Display bays", value: "12" },
    ],
    plan: commercialPlan,
    room: {
      layout: "gallery",
      wall: "#EAE3D7",
      floor: "#9C978E",
      accent: "#B08D57",
      fabric: "#E9DCC9",
      sun: "#FFF1DC",
      sunIntensity: 3.6,
      ambient: "#EDE6DA",
      floorGloss: 0.7,
    },
    images: ["/images/atelier-noor.jpg", "1788953324777-3d98984c0fa0", "1782834294716-8e28c18bdba6", "1769107805465-bfd41863f1a0", "1764512680324-048f158cab2b", "1782834294705-88a8559c2109", "1771775529036-2a9dc65ca54b"],
    status: "Completed",
    client: "Fashion house",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "A gallery rather than a shop", text: "Garments hang in bays between fluted plaster columns, each lit from a concealed ceiling slot. The effect is closer to a museum than a store: fewer pieces on display, more space and light around each one." },
      { title: "Service, hidden in plain sight", text: "A continuous wall of brushed brass panels conceals stock, fitting suites and a private client lounge. Staff move behind the scenes while the front of house stays calm and uncluttered." },
    ],
  },
  {
    slug: "villa-olive",
    title: "Villa Olive",
    category: "Residential",
    type: "Private villa",
    location: "Abu Dhabi, UAE",
    area: "1,180 m²",
    year: "2025",
    scope: ["Interior architecture", "Renovation", "Landscape interface"],
    tagline: "Arches, shade and a courtyard at the centre",
    summary:
      "A family villa reorganised around a shaded inner court and a run of deep arches.",
    concept: [
      "The villa had turned its back on its garden. We cut a courtyard into the middle of the plan and lined it with deep plaster arches that give shade, frame the olive trees and draw air through the house.",
      "Olive green lacquer, terracotta tile and unpolished marble keep the palette close to the landscape outside.",
    ],
    materials: [
      { name: "Olive lacquer", color: "#5E6650" },
      { name: "Terracotta", color: "#C9805E" },
      { name: "Tadelakt", color: "#E3D6C2" },
      { name: "Verde marble", color: "#4D5547" },
    ],
    facts: [
      { label: "Arches", value: "9" },
      { label: "Court", value: "140 m²" },
      { label: "Bedrooms", value: "6" },
    ],
    plan: residentialPlan,
    room: {
      layout: "arch",
      wall: "#E3D6C2",
      floor: "#C9805E",
      accent: "#5E6650",
      fabric: "#D8CDB8",
      sun: "#FFCF9A",
      sunIntensity: 3.4,
      ambient: "#EFE3CF",
      floorGloss: 0.15,
    },
    images: ["1778640331184-dc4c3e2608e1", "1713192707527-13b598f4adca", "1786723172671-143165e4c687", "1761587705427-7ea1ab368adc", "1759250451654-72ab594ba2c9", "1783321332136-62115bb5c64a", "1755894761765-690f6a07fc2f"],
    status: "Completed",
    client: "Private family",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "A courtyard at the heart of the house", text: "We carved a 140 m\u00b2 court out of the centre of the plan. Every principal room now opens onto it, so the family lives around a garden of olive trees, water and shade rather than along a corridor." },
      { title: "Arches that shade and frame", text: "Nine deep plaster arches line the court. They cut the midday sun, draw cool air through the house and frame the trees like paintings, changing with every hour of the day." },
    ],
  },
  {
    slug: "ember-lounge",
    title: "Ember Lounge",
    category: "Commercial",
    type: "Members' lounge",
    location: "Riyadh, KSA",
    area: "760 m²",
    year: "2025",
    scope: ["Hospitality interiors", "Lighting design", "Furniture selection"],
    tagline: "A night room in walnut, smoke and low light",
    summary:
      "A private members' lounge designed for the hours after sunset.",
    concept: [
      "The brief asked for intimacy at scale. We broke a large open floor into a series of sunken conversation pits, each with its own low ceiling of stained walnut slats and a pool of warm light.",
      "Dark surfaces are balanced with soft mohair, hand-blown glass pendants and a single long bar carved from a block of rosso levanto.",
    ],
    materials: [
      { name: "Stained walnut", color: "#3E2A1E" },
      { name: "Rosso levanto", color: "#6E3B30" },
      { name: "Mohair", color: "#9A7A5E" },
      { name: "Smoked glass", color: "#2D2A27" },
    ],
    facts: [
      { label: "Seats", value: "120" },
      { label: "Bar length", value: "14 m" },
      { label: "Lounges", value: "5" },
    ],
    plan: commercialPlan,
    room: {
      layout: "loft",
      wall: "#4A3426",
      floor: "#2E211A",
      accent: "#C77B4A",
      fabric: "#9A7A5E",
      sun: "#FFB37A",
      sunIntensity: 2.4,
      ambient: "#6E4A35",
      floorGloss: 0.6,
      floorPattern: "plank",
    },
    images: ["/images/ember-lounge.jpg", "/images/ember-lounge-terrace.jpg", "1792670846245-09ef04789925", "1780398645489-85968d809196", "1784025173567-9ed10b66fdc1", "1776775358799-85c61b5fbb9a", "1759358342214-c23ed81014bc"],
    status: "Completed",
    client: "Private members' club",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "Intimacy at scale", text: "A 760 m\u00b2 floor was broken into five sunken lounges, each under its own low ceiling of stained walnut slats. Guests feel tucked away, even when the club is full." },
      { title: "Designed for after dark", text: "Light comes in warm pools from hand-blown pendants and backlit shelving, never from above. Dark timber, rosso levanto and mohair absorb sound so conversation stays close and quiet." },
    ],
  },
  {
    slug: "casa-lume",
    title: "Casa Lume",
    category: "Residential",
    type: "Townhouse",
    location: "Lisbon, Portugal",
    area: "380 m²",
    year: "2025",
    scope: ["Renovation", "Space planning", "Joinery design"],
    tagline: "A narrow townhouse opened to the sky",
    summary:
      "A five-storey townhouse where a new light well carries daylight to the ground floor.",
    concept: [
      "We carved a light well through all five floors and finished it in white lime so daylight bounces down to the kitchen. Each floor gets a different timber, from pale ash at the top to dark chestnut at street level.",
    ],
    materials: [
      { name: "White lime", color: "#F1EEE8" },
      { name: "Ash", color: "#D8C4A3" },
      { name: "Chestnut", color: "#7A5536" },
      { name: "Azulejo blue", color: "#3F5A73" },
    ],
    facts: [
      { label: "Floors", value: "5" },
      { label: "Light well", value: "16 m" },
      { label: "Timbers", value: "5" },
    ],
    plan: residentialPlan,
    room: {
      layout: "court",
      wall: "#F1EEE8",
      floor: "#D8C4A3",
      accent: "#3F5A73",
      fabric: "#E6DED0",
      sun: "#FFF4E2",
      sunIntensity: 3.8,
      ambient: "#F4F1EA",
      floorGloss: 0.2,
      floorPattern: "plank",
    },
    images: ["1647959122754-1d116ee18e2c", "1752847898155-908ada236b08", "1732408078193-e6a38af7ecca", "1752754516977-640ad001b86a", "1715444612205-bce09f1ae05f", "1728032648596-b969c7810937", "1560884420-dcc548329f4b"],
    status: "Completed",
    client: "Private client",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "Daylight to the ground floor", text: "A new light well runs through all five storeys and is finished in white lime, so daylight bounces down to the kitchen at street level. The stair wraps around it, turning circulation into the brightest part of the house." },
      { title: "Five floors, five timbers", text: "Each level has its own timber, from pale ash under the roof to dark chestnut at the bottom, so the house grows lighter as you climb toward the sky." },
    ],
  },
  {
    slug: "studio-verde",
    title: "Studio Verde",
    category: "Commercial",
    type: "Creative workplace",
    location: "Milan, Italy",
    area: "1,050 m²",
    year: "2024",
    scope: ["Workplace strategy", "Interior architecture", "Furniture selection"],
    tagline: "A workplace that feels like a library",
    summary:
      "Headquarters for a design agency, organised like a reading room rather than an office.",
    concept: [
      "Desks are arranged under a vaulted timber ceiling like tables in a library, with quiet rooms tucked into thick walls of shelving along the perimeter.",
    ],
    materials: [
      { name: "Sage plaster", color: "#B9C1B4" },
      { name: "Cork", color: "#A98463" },
      { name: "Oiled oak", color: "#B38B60" },
      { name: "Linen", color: "#E3DCCD" },
    ],
    facts: [
      { label: "Desks", value: "86" },
      { label: "Quiet rooms", value: "12" },
      { label: "Books shelved", value: "4,000" },
    ],
    plan: commercialPlan,
    room: {
      layout: "gallery",
      wall: "#C3CABD",
      floor: "#B38B60",
      accent: "#313729",
      fabric: "#E3DCCD",
      sun: "#FFF0D6",
      sunIntensity: 3.2,
      ambient: "#D0D5D2",
      floorGloss: 0.25,
      floorPattern: "plank",
    },
    images: ["1656646424895-aea229a814b0", "1698854536049-4ea3b8e4d035", "1558469469-861684f72828", "1656646424891-4bec4a649ef6", "1559133082-d15e8502d064", "1694114018436-4435ff9f94d0"],
    status: "Completed",
    client: "Design agency",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "A reading room for work", text: "Long shared tables sit under a vaulted timber ceiling, arranged like a library. Focused work happens at the tables; conversation moves to lounges at either end." },
      { title: "Quiet rooms in thick walls", text: "Twelve small rooms are tucked into deep walls of shelving around the perimeter, holding the agency's 4,000-book archive and giving every team a place to think, call or meet." },
    ],
  },
  {
    slug: "the-cedar-suite",
    title: "The Cedar Suite",
    category: "Residential",
    type: "Apartment",
    location: "London, UK",
    area: "290 m²",
    year: "2024",
    scope: ["Interior design", "Furniture curation", "Art consultancy"],
    tagline: "A collector's apartment in cedar and ink",
    summary:
      "A Mayfair apartment designed as a backdrop for a collection of works on paper.",
    concept: [
      "Walls are panelled in cedar with recessed picture rails so the collection can be rehung without marks. Ink-blue velvet and blackened steel give the rooms depth at night.",
    ],
    materials: [
      { name: "Cedar", color: "#9B6B47" },
      { name: "Ink velvet", color: "#26304A" },
      { name: "Blackened steel", color: "#2A2826" },
      { name: "Calacatta", color: "#ECE8E1" },
    ],
    facts: [
      { label: "Works hung", value: "64" },
      { label: "Rooms", value: "7" },
      { label: "Ceiling", value: "3.2 m" },
    ],
    plan: residentialPlan,
    room: {
      layout: "living",
      wall: "#9B6B47",
      floor: "#5A4130",
      accent: "#26304A",
      fabric: "#26304A",
      sun: "#FFE2BC",
      sunIntensity: 2.6,
      ambient: "#C9A887",
      floorGloss: 0.45,
      floorPattern: "plank",
    },
    images: ["1768578927442-24a68408c0c7", "1680971615878-18ce5b08c790", "1664509941658-bb5483d3eba7", "1680965075873-64356db057fb", "1727707185480-a50e6090b58c", "1792121041373-48bc4cb213ca", "1680965075898-39e6c2db33a8"],
    status: "Completed",
    client: "Private collector",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "A backdrop for a collection", text: "Cedar panelling with recessed picture rails runs through every room, so the owner can rehang the collection as often as they like without marking a wall." },
      { title: "Depth for the evening", text: "Ink-blue velvet, blackened steel and low, warm lighting give the rooms a richer mood at night, when the works on paper glow under their own picture lights." },
    ],
  },
  {
    slug: "halo-clinic",
    title: "Halo Clinic",
    category: "Commercial",
    type: "Wellness clinic",
    location: "Dubai, UAE",
    area: "540 m²",
    year: "2024",
    scope: ["Healthcare interiors", "Space planning", "3D visualisation"],
    tagline: "A clinic that feels like a spa",
    summary:
      "A longevity clinic where treatment rooms open off a soft, curved arrival hall.",
    concept: [
      "Corners are rounded throughout, the ceiling is a continuous backlit membrane and every treatment room borrows light from a central planted court.",
    ],
    materials: [
      { name: "Microcement", color: "#E4DED5" },
      { name: "Rose quartz", color: "#E7CFC4" },
      { name: "White oak", color: "#D2B98F" },
      { name: "Terrazzo", color: "#D9D2C6" },
    ],
    facts: [
      { label: "Treatment rooms", value: "9" },
      { label: "Curved walls", value: "100%" },
      { label: "Opened in", value: "14 wks" },
    ],
    plan: commercialPlan,
    room: {
      layout: "arch",
      wall: "#EDE5DC",
      floor: "#D9D2C6",
      accent: "#D37955",
      fabric: "#E7CFC4",
      sun: "#FFF2E4",
      sunIntensity: 3.4,
      ambient: "#F4EEE6",
      floorGloss: 0.5,
    },
    images: ["1773924093206-9a433a14bb44", "1776763018829-ad685e621871", "1761470575018-135c213340eb", "1630835425197-50feeba99ecd", "1762631203805-88841687ab4d", "1693578538512-fc66f318c833", "1757940113920-69e3686438d3"],
    status: "Completed",
    client: "Longevity clinic",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "Soft from the first step", text: "There are no hard corners anywhere in the clinic. A curved arrival hall leads to nine treatment rooms, each borrowing daylight from a central planted court." },
      { title: "Clinical, without feeling clinical", text: "A continuous backlit ceiling membrane, rose quartz, white oak and terrazzo replace the usual hospital palette, while hygiene and accessibility standards are met behind the scenes." },
    ],
  },
  {
    slug: "dune-house",
    title: "Dune House",
    category: "Residential",
    type: "Desert retreat",
    location: "Al Ula, KSA",
    area: "860 m²",
    year: "2023",
    scope: ["Interior architecture", "Furniture design", "Lighting design"],
    tagline: "Thick walls, small windows, long views",
    summary:
      "A weekend house where rammed-earth walls frame single, carefully placed views.",
    concept: [
      "Each room has one opening, sized and placed for one view: a rock face, a palm grove, the sunset. The rest is thick earth walls that keep the house cool and quiet.",
    ],
    materials: [
      { name: "Rammed earth", color: "#B98A64" },
      { name: "Sandstone", color: "#D8B58C" },
      { name: "Palm weave", color: "#C9A877" },
      { name: "Patinated copper", color: "#7A5A45" },
    ],
    facts: [
      { label: "Wall depth", value: "60 cm" },
      { label: "Openings", value: "21" },
      { label: "Guest suites", value: "4" },
    ],
    plan: residentialPlan,
    room: {
      layout: "court",
      wall: "#C99B72",
      floor: "#D8B58C",
      accent: "#7A5A45",
      fabric: "#E5D3B8",
      sun: "#FFC48A",
      sunIntensity: 4,
      ambient: "#E8C9A4",
      floorGloss: 0.1,
    },
    images: ["1762544968153-b9b47435fefd", "1724582586529-62622e50c0b3", "1772442363851-738a548f6c5c", "1761330439252-325f2091e88d", "1724582586458-a51791349977", "1787145879056-d02365c5b911", "1752986314596-d4e471784e0d"],
    status: "Completed",
    client: "Private client",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "One window, one view", text: "Each room has a single opening, sized and placed for a single view: the rock face, the palm grove or the sunset. Everything else is wall, which makes each view feel precious." },
      { title: "Cool, thick and quiet", text: "Sixty-centimetre rammed-earth walls keep the house cool through the day and release warmth at night. Inside, sandstone, palm weave and patinated copper keep the palette close to the desert." },
    ],
  },
  {
    slug: "mare",
    title: "Maré",
    category: "Commercial",
    type: "Restaurant",
    location: "Lisbon, Portugal",
    area: "310 m²",
    year: "2023",
    scope: ["Hospitality interiors", "Bespoke furniture", "Renovation"],
    tagline: "A seafood room in lime, rope and oak",
    summary:
      "A restaurant in a former boathouse, built around a single long oak counter.",
    concept: [
      "We kept the vaulted brick structure and limewashed it, then ran a 22-metre oak counter down the centre so every guest sits facing the kitchen fire.",
    ],
    materials: [
      { name: "Limewash", color: "#EDE7DB" },
      { name: "Oak", color: "#A57E57" },
      { name: "Hemp rope", color: "#C8B08A" },
      { name: "Lioz stone", color: "#E2D9C8" },
    ],
    facts: [
      { label: "Covers", value: "64" },
      { label: "Counter", value: "22 m" },
      { label: "Vaults", value: "6" },
    ],
    plan: commercialPlan,
    room: {
      layout: "arch",
      wall: "#EDE7DB",
      floor: "#A57E57",
      accent: "#313729",
      fabric: "#C8B08A",
      sun: "#FFE7C4",
      sunIntensity: 3.4,
      ambient: "#F2E8D4",
      floorGloss: 0.3,
      floorPattern: "plank",
    },
    images: ["1777502286903-96d96e5156aa", "1553487164-47dd19cf0a72", "1737140790906-14518fa29d1c", "1622140739492-f82f386260b5", "1680209667591-ff5930635a09", "1777734748789-7d1cbfe22c9a", "1616267231958-3179b1d0b7d1"],
    status: "Completed",
    client: "Restaurant group",
    team: ["Interior architecture: LONORA", "Lighting design: LONORA", "3D visualisation: LONORA", "Main contractor: to be confirmed"],
    story: [
      { title: "Everyone faces the fire", text: "A 22-metre oak counter runs down the centre of the old boathouse, so every one of the 64 guests sits facing the open kitchen and its wood fire." },
      { title: "Keeping the boathouse", text: "The brick vaults were repaired and limewashed rather than hidden. Hemp rope, lioz stone and oak bring the materials of the waterfront inside." },
    ],
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === decodeURIComponent(slug));

/* -------------------------------------------------------------------------- */

export type Service = {
  slug: string;
  index: string;
  title: string;
  short: string;
  description: string;
  deliverables: string[];
};

export const services: Service[] = [
  {
    slug: "interior-design",
    index: "01",
    title: "Interior Design",
    short: "Full interior architecture, from first sketch to final styling.",
    description:
      "Our complete service. We plan the space, design every surface and detail, choose materials, furniture and lighting, and stay with the project until the last cushion is placed.",
    deliverables: ["Concept and mood direction", "Detailed drawings", "Material and finish schedules", "Site supervision"],
  },
  {
    slug: "residential-interiors",
    index: "02",
    title: "Residential Interiors",
    short: "Homes, villas and penthouses shaped around how you live.",
    description:
      "Private homes designed around the rituals of the people who live in them, from the morning light in the kitchen to the art on the bedroom wall.",
    deliverables: ["Lifestyle brief", "Room-by-room design", "Joinery and bespoke furniture", "Art and object curation"],
  },
  {
    slug: "commercial-interiors",
    index: "03",
    title: "Commercial Interiors",
    short: "Hospitality, retail, workplace and wellness spaces that carry a brand.",
    description:
      "Spaces that work hard for a business: restaurants, boutiques, offices and clinics where the interior expresses the brand and supports operations.",
    deliverables: ["Brand-to-space strategy", "Operational planning", "FF&E specification", "Contractor coordination"],
  },
  {
    slug: "space-planning",
    index: "04",
    title: "Space Planning",
    short: "Layouts that make every square metre count.",
    description:
      "We study how a space is used and redraw it: circulation, zoning, storage and sightlines. Often the most valuable part of a project.",
    deliverables: ["Use and flow analysis", "Layout options", "Furniture plans", "Area schedules"],
  },
  {
    slug: "furniture-selection",
    index: "05",
    title: "Furniture Selection",
    short: "Curated and bespoke pieces, sourced and installed.",
    description:
      "We source from leading makers and design bespoke pieces where nothing existing fits, then handle procurement, logistics and installation.",
    deliverables: ["Curated selections", "Bespoke furniture design", "Procurement and logistics", "Installation and styling"],
  },
  {
    slug: "3d-visualization",
    index: "06",
    title: "3D Visualisation",
    short: "Photoreal renders and walkthroughs before anything is built.",
    description:
      "See the space before a wall is moved. Photoreal stills, animated walkthroughs and interactive 3D models that make decisions faster and more confident.",
    deliverables: ["Photoreal stills", "Animated walkthroughs", "Interactive 3D tours", "Material studies"],
  },
  {
    slug: "renovation",
    index: "07",
    title: "Renovation",
    short: "Transforming existing spaces with care for what is already there.",
    description:
      "From light refreshes to full structural renovations. We keep what has character, fix what does not work and manage the build from start to finish.",
    deliverables: ["Condition survey", "Renovation design", "Contractor tender", "Project management"],
  },
];

export const process = [
  {
    index: "01",
    title: "Listen",
    duration: "Week 1–2",
    text: "We visit the space and build a detailed brief: how you live or work, what you love and what must change.",
  },
  {
    index: "02",
    title: "Concept",
    duration: "Week 3–6",
    text: "Spatial ideas, mood and materials, with a first 3D walkthrough so you can feel the direction before it is fixed.",
  },
  {
    index: "03",
    title: "Design",
    duration: "Week 7–14",
    text: "Detailed drawings, joinery, lighting and finishes, with every piece of furniture chosen or designed.",
  },
  {
    index: "04",
    title: "Deliver",
    duration: "Month 4 to handover",
    text: "Contractors, procurement and site supervision through to final styling, with aftercare for the first year.",
  },
];

// PLACEHOLDER — replace with genuine client testimonials before launch.
export const testimonials = [
  {
    quote:
      "They listened more than they talked, and the apartment now feels like it was always meant to be this way.",
    name: "Client name",
    role: "Private residence, Dubai",
  },
  {
    quote:
      "The 3D walkthrough sold the concept to our board in one meeting. The finished flagship looks exactly like it.",
    name: "Client name",
    role: "Retail flagship, Doha",
  },
  {
    quote:
      "Calm, precise and completely on schedule. Our members ask who designed the lounge every week.",
    name: "Client name",
    role: "Hospitality, Riyadh",
  },
];

export const faqs = [
  {
    q: "Where do you work?",
    a: "We are based in the Gulf and take on projects internationally. For projects abroad we work with trusted local contractors and visit site at key stages.",
  },
  {
    q: "How long does a project take?",
    a: "A single apartment usually takes four to six months from brief to handover. Villas and commercial projects typically take eight to fourteen months depending on the scope of construction.",
  },
  {
    q: "How are your fees structured?",
    a: "We quote a fixed design fee based on area and scope, agreed before work begins. Procurement and site supervision are quoted separately so you only pay for what you need.",
  },
  {
    q: "Can you work with furniture I already own?",
    a: "Yes. We often design around pieces with history, whether family heirlooms, art or collected objects, and help decide what to keep, restore or replace.",
  },
  {
    q: "Do you provide 3D visualisation on its own?",
    a: "Yes. Developers, architects and homeowners commission us for photoreal stills, walkthroughs and interactive 3D tours independently of a full design service.",
  },
];

export type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  read: string;
  excerpt: string;
  body: string[];
  room: RoomPreset;
  /** Unsplash photo id (free licence) used for the article card. */
  image: string;
  /** Pull quote shown after the body. */
  quote: string;
  /** Three short takeaways. */
  takeaways: string[];
  /** Two supporting photos (Unsplash ids). */
  gallery: [string, string];
  gallerycaption: string;
  /** Slug of a project that shows the idea in practice. */
  project: string;
};

export const posts: Post[] = [
  {
    slug: "designing-with-daylight",
    title: "Designing with daylight",
    category: "Method",
    date: "November 2026",
    read: "5 min",
    excerpt: "Why we plan every room around where the sun will be at four in the afternoon.",
    body: [
      "Before we choose a single material, we map how the sun moves through a space across the day and the year. Light decides where people will want to sit, which walls deserve art and which surfaces will glow or glare.",
      "In hot climates this means controlling light as much as inviting it: deep reveals, screens and arches that turn harsh sun into soft, moving patterns on a floor.",
      "The result is a room that changes through the day, which is a kind of decoration no object can match.",
    ],
    room: projects[0].room,
    image: projects[0].images[2],
    quote: "Light decides where people want to sit long before the furniture does.",
    takeaways: [
      "Map the sun across the day and the year before choosing a single material.",
      "In hot climates, shade and reveals matter as much as glazing.",
      "Design surfaces to receive light, so the room changes hour by hour.",
    ],
    gallery: [projects[2].images[1], projects[0].images[4]],
    gallerycaption: "Arches and deep reveals turn hard sun into soft, moving pattern.",
    project: "villa-olive",
  },
  {
    slug: "the-case-for-fewer-materials",
    title: "The case for fewer materials",
    category: "Materials",
    date: "October 2026",
    read: "4 min",
    excerpt: "Three materials, used generously, almost always beat ten used carefully.",
    body: [
      "Our best rooms rarely use more than three or four principal materials. Restraint lets each one be used generously, in large, continuous surfaces that feel solid and calm.",
      "We choose one material to hold the room, one to touch and one to catch the light, and resist the urge to add more.",
    ],
    room: projects[2].room,
    image: projects[6].images[5],
    quote: "One material to hold the room, one to touch, and one to catch the light.",
    takeaways: [
      "Three or four principal materials are almost always enough.",
      "Use each one generously, in large and continuous surfaces.",
      "Choose materials that age with character rather than date.",
    ],
    gallery: [projects[6].images[3], projects[4].images[2]],
    gallerycaption: "Timber, stone and linen: a short palette used with confidence.",
    project: "the-cedar-suite",
  },
  {
    slug: "seeing-before-building",
    title: "Seeing before building",
    category: "Visualisation",
    date: "September 2026",
    read: "6 min",
    excerpt: "How real-time 3D changed the way our clients make decisions.",
    body: [
      "Plans and mood boards ask clients to imagine. Real-time 3D lets them stand in the room, turn around and see how the light falls at different times of day.",
      "Decisions that used to take weeks of samples now happen in a single session, and surprises on site have almost disappeared.",
    ],
    room: projects[1].room,
    image: projects[4].images[1],
    quote: "Our clients stop imagining their room and start standing in it.",
    takeaways: [
      "Walk the space in real-time 3D within the first weeks of design.",
      "Test light at different hours before committing to a finish.",
      "Fewer samples, faster decisions and almost no surprises on site.",
    ],
    gallery: [projects[1].images[2], projects[5].images[3]],
    gallerycaption: "What was approved in 3D is what was built, down to the joinery.",
    project: "atelier-noor",
  },
  {
    slug: "why-we-draw-the-plan-first",
    title: "Why we draw the plan first",
    category: "Method",
    date: "August 2026",
    read: "4 min",
    excerpt: "Before colour, fabric or furniture, we resolve how a space is entered, crossed and lived in.",
    body: [
      "A beautiful room with the wrong plan never feels right. Doors in the wrong place, a sofa with its back to the view, a kitchen island that blocks the way to the terrace: no finish can fix these.",
      "So we draw the plan first, and redraw it many times. We test circulation, sightlines and where the light will land, long before a single sample is ordered.",
      "When the plan is right, the decoration becomes simpler, because the space is already doing most of the work.",
    ],
    room: projects[7].room,
    image: projects[7].images[2],
    quote: "No finish can fix a plan that is wrong.",
    takeaways: [
      "Resolve entry, circulation and sightlines before choosing finishes.",
      "Place furniture on the plan early to test how a room is used.",
      "A good plan makes the decoration simpler, not harder.",
    ],
    gallery: [projects[7].images[0], projects[5].images[1]],
    gallerycaption: "Plans and sections are redrawn until every room flows into the next.",
    project: "halo-clinic",
  },
  {
    slug: "living-with-limestone",
    title: "Living with limestone",
    category: "Materials",
    date: "July 2026",
    read: "5 min",
    excerpt: "Why a soft, porous stone ages better in a family home than anything polished.",
    body: [
      "Limestone is not a perfect material, and that is exactly why we like it. It marks, it softens and it slowly takes on the life of the house.",
      "Honed rather than polished, it stays cool underfoot in hot climates and quietly hides the small traces of everyday use.",
      "Paired with oak, lime plaster and linen, it gives a home a calm, continuous ground that gets better every year.",
    ],
    room: projects[8].room,
    image: projects[8].images[3],
    quote: "The best materials don't stay new. They grow into the house.",
    takeaways: [
      "Choose honed limestone over polished for warmth and forgiveness.",
      "Use it in large, continuous runs so the floor reads as one ground.",
      "Pair it with oak, lime plaster and linen for a calm palette.",
    ],
    gallery: [projects[8].images[1], projects[9].images[2]],
    gallerycaption: "Honed limestone, oak and lime plaster: a palette that ages well.",
    project: "dune-house",
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

// PLACEHOLDER — team presentation to be developed with the brand.
// Photos are free Unsplash portraits used as stand-ins until the real team is photographed.
export const team = [
  { name: "Founder name", role: "Founder & Creative Director", photo: "1749793716288-a5ab5ed3b0e1" },
  { name: "Co-founder name", role: "Co-founder & Design Director", photo: "1762341124796-530c0085f7d8" },
  { name: "Team member", role: "Head of Interior Architecture", photo: "1783430018108-7415adec78a1" },
  { name: "Team member", role: "Senior Interior Designer", photo: "1760543998147-117ae5649c5c" },
  { name: "Team member", role: "3D Visualisation Lead", photo: "1768696081732-0a6dbfcef379" },
  { name: "Team member", role: "FF&E & Procurement Lead", photo: "1667423903868-846a7918c453" },
  { name: "Team member", role: "Project Director", photo: "1786534476916-9eb686c518d3" },
  { name: "Team member", role: "Studio Manager", photo: "1781762845917-107d53e0f9fe" },
  { name: "Team member", role: "Interior Designer", photo: "1788500304837-5c4d87012261" },
];

/* Home page journey — the scroll-driven WebGL chapters */
export const chapters = [
  {
    index: "01",
    title: "The threshold",
    text: "Every LONORA space begins with an arrival: a pause between the street and the room, framed in stone.",
    stats: [
      { label: "Founded", value: "2026" },
      { label: "Disciplines", value: "7" },
      { label: "Focus", value: "Interiors" },
    ],
  },
  {
    index: "02",
    title: "The colonnade",
    text: "Rhythm and proportion first. We draw space the way architects do, so light has something to fall between.",
    stats: [
      { label: "Grid", value: "600 mm" },
      { label: "Ceiling", value: "4.2 m" },
      { label: "Bays", value: "6" },
    ],
  },
  {
    index: "03",
    title: "The living room",
    text: "Then the rituals of daily life: where you sit, read, gather and look out. Comfort is designed, not decorated.",
    stats: [
      { label: "Materials", value: "3–4" },
      { label: "Bespoke", value: "Joinery" },
      { label: "Light", value: "Layered" },
    ],
  },
  {
    index: "04",
    title: "The light court",
    text: "Daylight is our first material. We study where the sun falls at every hour before we choose a single finish.",
    stats: [
      { label: "Sun studies", value: "Hourly" },
      { label: "Glare", value: "Controlled" },
      { label: "Views", value: "Framed" },
    ],
  },
  {
    index: "05",
    title: "The atelier",
    text: "Finally, the touch: stone, oak, plaster and brass chosen by hand and tested in the light of your space.",
    stats: [
      { label: "Samples", value: "Physical" },
      { label: "Makers", value: "Curated" },
      { label: "Finish", value: "By hand" },
    ],
  },
];
