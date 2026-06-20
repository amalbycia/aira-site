# Ideas — Future Iteration

## Live visual editor (dev-only overlay tool)

Problem: explaining element positions/sizes in words is slow and lossy; sketches get
misread. Want a way to directly manipulate the live localhost site and hand off exact
values.

Scoped plan (from 2026-06-17 discussion):

**Part 1 — Visual editor (build this first, moderate difficulty)**
- Dev-only overlay component, only mounts when `NODE_ENV=development` or behind
  `?edit=1` — never ships to prod
- Click any element → highlight outline + floating panel showing computed box model
  (width/height/margin/padding/position) via `getBoundingClientRect()` +
  `getComputedStyle()`
- Drag → live `transform: translate()`; corner handles → live width/height resize
- "Export" button → dumps clean JSON: `{ selector, property, oldValue, newValue }`
  for everything touched
- Paste that JSON to the agent → it maps selectors back to real JSX/CSS in the
  component files and applies the changes for real
- Built with vanilla DOM APIs + React state, scoped to this site only

**Part 2 — Sketch-to-wireframe (lower priority, skip heavy build)**
- True hand-drawn-sketch → structured layout recognition is a real CV problem, not
  worth building
- Pasting sketch/screenshot images directly into chat already works today (agent can
  read them) — no new tooling needed for this part
- If a drawing surface is wanted, just use a basic canvas page or an existing tool
  (e.g. Excalidraw) and screenshot/paste — don't build a recognition pipeline

Decision: revisit Part 1 once the actual site (home page, footer, photography/events
pages) is further along. Not blocking current work.
