# HammingSpace Visual Upgrade — DESIGN.md

Source of truth for tokens, visual language, motion, and camera shots. All implementation decisions reference this document.

---

## 1. COLOR TOKENS (single source: `src/theme.ts` + CSS variables)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#0b0f19` | Scene background, Canvas clear color |
| `--color-surface` | `#111827` | Panels, cards, laptop screen bg |
| `--color-surface-elevated` | `#1e2536` | Desk tops, tray plinth, modal bg |
| `--color-border` | `#334155` | Subtle edges, rim lines |
| `--color-border-strong` | `#475569` | Focus rings, active edges |
| `--color-text-primary` | `#f8fafc` | Primary UI text |
| `--color-text-secondary` | `#94a3b8` | Labels, hints, inactive text |
| `--color-text-muted` | `#64748b` | Subtle annotations |
| **Semantic Bit Colors** | | |
| `--color-data` | `#0ea5e9` | Data/message bits (teal) — *from hammingLesson.css `.is-data`* |
| `--color-data-bg` | `#0f3d42` | Data bit background |
| `--color-parity` | `#f59e0b` | Parity bits (amber) — *from hammingLesson.css `.is-parity`* |
| `--color-parity-bg` | `#4a3212` | Parity bit background |
| `--color-error` | `#f43f5e` | Flipped/corrupted bits (red) |
| `--color-error-bg` | `#5f1c2b` | Error bit background |
| `--color-corrected` | `#10b981` | Corrected bits (green) |
| `--color-corrected-bg` | `#14532d` | Corrected bit background |
| **Status Accents** | | |
| `--color-status-idle` | `#64748b` | Idle / neutral |
| `--color-status-encoding` | `#3b82f6` | Encoding / in progress |
| `--color-status-transit` | `#3b82f6` | In channel |
| `--color-status-decoding` | `#818cf8` | Decoding |
| `--color-status-error` | `#f43f5e` | Error detected |
| `--color-status-corrected` | `#10b981` | Corrected / valid |
| **Materials** | | |
| `--mat-aluminum` | `#334155` | Laptop chassis, desk legs |
| `--mat-aluminum-dark` | `#1e293b` | Keyboard well, screen bezel |
| `--mat-keycap` | `#1e293b` | Keycaps (instanced) |
| `--mat-trackpad` | `#1e293b` | Trackpad surface |
| `--mat-screen-bg` | `#0b101d` | Laptop screen plane |
| `--mat-screen-text` | `#f8fafc` | Screen text |
| `--mat-floor` | `#161b26` | Studio floor |
| `--mat-rug` | `#1e2536` | Area rug under desks |
| `--mat-wall-slat` | `#1e293b` | Acoustic wall slats |
| `--mat-wall-cove` | `#fef3c7` / emissive `#fbbf24` | Cove light strip |
| `--mat-tray` | `#1e293b` | Codeword tray carrier |
| `--mat-sphere` | Ceramic: base `#1e293b`, data `#0ea5e9`, parity `#f59e0b`, error `#f43f5e`, corrected `#10b981` |

**CSS Variable Mirror** — All tokens exported as `:root { --hamm-* }` in `src/index.css` for DOM components.

---

## 2. BIT VISUAL LANGUAGE (IDENTICAL everywhere)

Every bit representation — 3D tray sphere, laptop screen tile, overlay matrix cell — uses the **same visual grammar**:

| State | Shape | Fill | Ring | Label |
|-------|-------|------|------|-------|
| **Empty / unknown** | Rounded square (2D) / Sphere (3D) | `--color-surface` | `--color-border` | `·` |
| **Data 0** | — | `--color-data-bg` | `--color-border` | `0` (muted) |
| **Data 1** | — | `--color-data-bg` + emissive `--color-data` | `--color-data` | `1` (bright) |
| **Parity 0** | — | `--color-parity-bg` | `--color-border` | `0` (muted) |
| **Parity 1** | — | `--color-parity-bg` + emissive `--color-parity` | `--color-parity` | `1` (bright) |
| **Error (flipped)** | — | `--color-error-bg` + emissive `--color-error` | **Red ring** 2px | `1`/`0` white |
| **Corrected** | — | `--color-corrected-bg` + emissive `--color-corrected` | **Green ring** 2px | `1`/`0` white |

- **Typography**: Mono font for all bit digits and matrices (`ui-monospace, SFMono-Regular, Consolas, monospace`). Sans for all other UI (`system-ui, -apple-system, sans-serif`).
- **Sizes**: 2D tile min 32×32px; 3D sphere radius scales with `n` (max 0.44× spacing).
- **Role label**: Below each bit — "dat" (teal) or "par" (amber), 10px mono.

---

## 3. MOTION TOKENS (`src/motion.ts` + CSS variables)

| Token | Value | Use Case |
|-------|-------|----------|
| `--motion-fast` | `150ms` | Hover, button press, small UI transitions |
| `--motion-base` | `300ms` | Panel open/close, tray slot fill, bit flip |
| `--motion-slow` | `600ms` | Codeword build sequence, lesson step transitions |
| `--motion-camera` | `1400–1800ms` | Camera preset transitions (ease-in-out) |
| `--motion-flip` | `450ms` | FLIP overlay from laptop screen rect |
| `--ease-standard` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default for all motion |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful overshoot (only tray sphere drop) |
| `--ease-camera` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Camera lerp (smooth, no overshoot) |

**Reduced Motion** — `useReducedMotion()` hook reads `prefers-reduced-motion`. When true:
- All durations → `0ms` (instant)
- Spring → linear
- FLIP → simple fade
- No parallax, no head bob

**Timeline Helper** — `src/motion.ts` exports `sequence(steps: Array<{duration, callback}>)` returning `{cancel(), promise}`. All sequenced animations use this; `reset`/`skip`/`unmount` call `cancel()`.

---

## 4. CAMERA SHOT LIST (named shots, single director module)

| Shot Name | Position | LookAt | FOV | Duration | Trigger |
|-----------|----------|--------|-----|----------|---------|
| `overview` | `[0, 3.8, 16.0]` | `[0, 0.4, 0]` | 46 | 1600ms | Initial, Reset, Overview btn |
| `txScreen` | `[-6.2, 2.4, 8.8]` | `[-6.2, 0.6, -0.2]` | 38 | 1600ms | S1 Transmit (Encode pressed) |
| `tray` | `[-6.2, 1.2, 4.5]` | `[-6.2, 0.1, 0.4]` | 32 | 1400ms | S3 Codeword build (tray focus) |
| `channel` | `[0, 1.8, 7.5]` | `[0, 0.25, 0.45]` | 40 | 1600ms | S4 Tray slides to channel |
| `noise` | `[0, 1.4, 5.6]` | `[0, 0.35, 0.45]` | 35 | 1200ms | S5 Noise injection (close on bit) |
| `rxScreen` | `[6.2, 2.4, 8.8]` | `[6.2, 0.6, -0.2]` | 38 | 1600ms | S6 Lesson B opens |
| `rxResult` | `[5.2, 1.6, 6.5]` | `[5.4, 0.6, 0.3]` | 32 | 1400ms | S7 Result (corrected bit focus) |
| `firstPerson` | Eye level, WASD | — | 60 | — | 1st Person btn |

**Rules**:
- Manual input disabled during guided transition (`isTransitioning` flag)
- `Skip` / `Esc` → jump to end pose instantly, `isTransitioning = false`
- Preset buttons use same director (no duplicate logic)
- Paths avoid intersecting desks/laptops/tray (validated by dev bounds check)

---

## 5. STAGE-BY-STAGE VISUAL STORYTELLING

### S0 Compose (Idle)
- TX laptop: shows **only message bits** (k slots), large readable tiles
- Tray: **empty sockets** (no digits, no zeros), labeled "CODEWORD TRAY [n BITS]"
- RX laptop: shows "READY", blank rows
- Focus: TX laptop bright (100%), RX dim (60%), channel dim (60%)

### S1 Transmit → S2 Lesson A
- Camera eases to `txScreen` (1600ms)
- Lesson overlay **FLIPs from TX laptop screen rect** (450ms)
- Steps 1–5 play; Previous disabled on step 1
- Last button (step 5): "Finish & send to channel →"

### S3 Codeword Build
- Overlay FLIPs **back into TX laptop screen** (450ms)
- **Tray builds**: data spheres drop (80ms stagger), then parity spheres (150ms stagger)
- **Parity pulse**: before each parity sphere lands, its contributing data spheres pulse (emissive flash, 200ms)
- TX laptop screen switches from message → codeword, shows "SENT" badge
- Codeword **never visible before this point**

### S4 To Channel
- Tray slides along rail to channel center (1200ms spring)
- Camera follows to `channel` shot
- Noise injection available (HUD button + clickable spheres)

### S5 Noise
- Click sphere → shake (150ms) + red ring appears + error count updates
- User presses "Proceed to Receiver"

### S6 Lesson B
- Camera eases to `rxScreen` (1600ms)
- Overlay FLIPs from **RX laptop screen rect** (450ms)
- Steps 6–9 use **real injected errors**

### S7 Result
- Overlay FLIPs back into RX screen (450ms)
- RX screen shows: Received row, Syndrome, Corrected row, Recovered message
- Corrected bit has **green ring highlight**
- Camera to `rxResult` (1400ms)

### Global
- "Start over" / Reset → returns to S0, clears all state, camera to `overview`
- Auto-open OFF / Skip → same 3D animations, no overlay panels

---

## 6. SCENE & MODEL SPECIFICATIONS

### Lighting (no HDR, no CDN)
- **Key Light**: Directional `[-6, 14, 8]`, color `#fffbeb`, intensity `1.8`, shadow map 1024
- **Fill Light**: Directional `[8, 10, 6]`, color `#e0f2fe`, intensity `0.9`
- **Cove Light**: Spot `[0, 7.5, -4.5]` → target `[0, 2, -6.5]`, color `#fed7aa`, intensity `3.2`, angle `PI/2.6`, penumbra `0.8`
- **Station Accents**: Point lights at `[-6.2, 4.5, 1.2]` and `[6.2, 4.5, 1.2]`, intensity `1.1`
- **Ambient**: `#cbd5e1` intensity `0.4`
- **Renderer**: ACESFilmicToneMapping, sRGBEncoding, exposure `1.0`, DPR `[1, 2]`

### Room
- Floor: Plane 50×36, `--mat-floor`, roughness 0.45, metalness 0.25, receives shadow
- Rug: Plane 22×9 at y=-2.115, `--mat-rug`, roughness 0.85
- Back Wall: Charcoal substrate + 38 acoustic slats (0.35×14×0.12, `--mat-wall-slat`, spacing 0.55)
- Cove Strip: Box 32×0.14×0.18 at top of back wall, emissive `--mat-wall-cove`
- Side Walls: Planes at x=±18, with window frames (left only, soft daylight emissive)
- **No ceiling bar**, no bloom, no post-processing

### Laptop (shared component, used for TX & RX)
- **Desk**: 5.2×0.10×3.4, `--mat-surface-elevated`, 4 slim legs (0.045 radius, 0.65 tall, `--mat-aluminum`)
- **Base**: 3.8×0.07×2.5, `--mat-aluminum`, recessed keyboard well
- **Keyboard**: 4 rows of instanced keycaps (3.2×0.018×0.22 each, `--mat-keycap`), trackpad 1.3×0.008×0.8 glass
- **Hinge**: Cylinder 0.04×3.2 at back edge
- **Lid**: 3.8×2.5×0.06 outer (`--mat-aluminum`), 3.75×2.45×0.015 bezel (`#060913`), screen plane 3.6×2.25 offset +0.01 from bezel (avoid z-fight)
- **Webcam**: Circle 0.02 at top center of lid
- **Screen content**: Rendered via `CanvasTexture` at 2× DPR (crisp text) or `drei Text`
- **Screen glow**: Emissive `#080e1a` intensity `0.04` (very faint)
- **Title bar**: 3.55×0.28 at top, shows title (TX-01/RX-02) + status badge
- **Rotation**: Lid tilted back -0.26 rad (~15° from vertical = 105° open)

### Codeword Tray
- **Plinth**: Low box on desk to right of laptop, clear gap from laptop base
- **Sockets**: n shallow cylinders evenly spaced, radius = spacing × 0.44
- **Label plate**: Front face "CODEWORD TRAY [n BITS]"
- **Spheres**: Instanced meshes, ceramic material (roughness 0.2, metalness 0.4), digit as `Text` on front face
- **Role text**: "dat" / "par" below socket
- **Scaling**: Works for n=7 and n=15 (spacing auto)

### Channel
- **Rail**: Brushed stainless cylinder 0.016 radius, 8.2 long, along desk height
- **Flow label**: Small text "TX ──────── DATA LINK ────────► RX" at rail height
- **Noise Zone**: Marked section at center (subtle floor texture change)
- **Packet**: Tray glides along rail; spheres pulse during transit
- **Status text**: Small unobtrusive label (replaces old harsh bar)

### Receiver
- Same laptop component
- Screen shows: RECEIVED row, SYNDROME, CORRECTED row (when corrected), recovered message

---

## 7. OVERLAY & HUD RESTYLE

### Lesson Overlay
- Panel: Slate `#111a2e`, border `#22304a`, radius 10px, shadow `0 20px 80px rgba(0,0,0,0.6)`
- Scrim: `rgba(4,8,17,0.84)` + `backdrop-filter: blur(5px)`
- Typography: Georgia/Times serif for body (≥15px), mono for math/bitstrings
- Badges: Encoding = teal `#5fd4c4`, Decoding = amber `#e8a33d` (matching hammingLesson.css)
- Buttons: Primary teal `#5fd4c4`, Secondary transparent + border
- Progress bar: Teal fill
- Focus trap + keyboard nav (Enter/Right=Next, Left=Prev, Esc=Skip)
- Hit targets ≥40px, AA contrast

### Control Panel
- Calm slate `#0f172a`/`#1e293b`, thin borders `#334155`
- Teal accent for primary actions, amber for parity-related
- Bit chips: Data=teal bg, Parity=amber bg, Error=red ring, Corrected=green ring
- Minimized state preserved
- Responsive: max-w-[calc(100vw-2rem)], readable at 1366×768

### Stage Instruction / Game Controller / Session Log / Camera Controls
- Same slate palette, consistent radius, spacing, typography
- No emoji, no gradient text, no sparkle icons (replace with clean icons)

---

## 8. DEV-ONLY LAYOUT GUARD

`src/debug/boundsGuard.ts` (dev only):
- After each render in `LabScene`, compute `Box3` for: TX laptop, RX laptop, Tray, Channel rail, Tables
- `console.warn` on any intersection
- Silent when clean
- Guard disabled in production build

---

## 9. PERFORMANCE BUDGET

| Metric | Target (15,11) @ 1080p integrated GPU |
|--------|---------------------------------------|
| Draw calls | < 120 |
| Triangles | < 180k |
| Frame time | < 16.67ms (60fps) |
| DPR | capped at 2 |
| Instancing | Spheres (n≤15), Keycaps (4 rows × ~10), Wall slats (38) |
| Disposal | Geometries/textures disposed on scene reset |

---

## 10. DECISIONS LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-28 | Use `CanvasTexture` at 2× DPR for laptop screens instead of `drei Text` | Crisp text at any camera distance; avoids font atlas blur |
| 2026-09-28 | Single shared `LaptopStation` component for TX & RX | DRY; identical hardware, different screen content |
| 2026-09-28 | Parity pulse uses contribution map from `deriveHammingParams` (never hardcoded) | Works for any (n,k); teaches the actual math |
| 2026-09-28 | FLIP animation for overlay open/close | Feels like panel emerges from physical screen |
| 2026-09-28 | No HDR/env map; local Lightformers only | Zero runtime downloads; predictable look |
| 2026-09-28 | Removed harsh yellow ceiling bar | "AI neon sci-fi" anti-pattern |
| 2026-09-28 | Instanced spheres for tray bits | Performance at n=15 |
| 2026-09-28 | Dev-only bounds guard with Box3 | Catch clipping without runtime cost in prod |

---

## 11. NEEDS HUMAN EYEBALL (mark in QA report)

- [ ] Laptop screen text crispness at various camera distances
- [ ] Tray sphere parity pulse visibility (not too subtle, not distracting)
- [ ] Camera transition paths — no clipping through desks
- [ ] Overlay FLIP alignment with laptop screen rect
- [ ] Color contrast AA on all text (especially slate panel on dark bg)
- [ ] Reduced motion experience — no jank
- [ ] Overall "calm professional product" feel vs "generated neon"