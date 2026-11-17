# LONORA — website

An immersive interior architecture site built with Next.js 16, React Three Fiber, GSAP and Lenis.

```bash
npm install
npm run dev   # http://localhost:3000
```

## How it works

- **Live 3D, no image assets.** Every interior is generated in real time from a preset in `src/lib/content.ts` (`room`: layout, palette, sun, floor). Textures (stone slabs, timber, plaster) are drawn procedurally in `src/components/three/materials.ts`.
- **Homepage journey** (`components/home/Journey.tsx`, `three/HomeScene.tsx`): a pinned, scroll-driven camera walk through five rooms with glass chapter cards, depth-of-field-style post-processing (AO, bloom, vignette).
- **Project cards and heroes** render through one shared canvas (`three/ViewCanvas.tsx`) using drei `View`, so many live 3D cards cost one GL context.
- **Page transitions**: `components/Transition.tsx` (`TLink`). Smooth scroll: `components/SmoothScroll.tsx`.

## Content

All copy lives in `src/lib/content.ts`. Items marked **PLACEHOLDER** must be replaced before launch:

- `contact` (email, phone, WhatsApp, address, socials)
- `testimonials` (must be genuine client quotes)
- `team`

## Before launch

- **Display font**: the reference uses PP Fragment Glare (commercial, Pangram Pangram). Marcellus stands in. After licensing, add `public/fonts/PPFragment-GlareRegular.woff2` and uncomment the `@font-face` in `src/app/globals.css`.
- **Enquiry form**: `src/app/api/inquiry/route.ts` validates and logs only. Connect it to email or a CRM.
- Brand logo, favicon and OG image.
