# Troll Factory: classroom pilot

**Play:** open `site/index.html` directly in a modern browser or serve this directory as static files. No setup or network required. Play as a desk editor at the fictional Harbor Desk. Teacher materials: `teacher.html`; note-ready print view: `takeaway.html`; optional before-debrief cold transfer: `transfer.html`.

## Layout
- `episodes/harbor-hall.js`: data-only fictional briefing, sources with origin IDs, claim verdicts, publication branches, recovery and transfer. All scenario text, roles and names are original; no historical screenshot/person/face or live content.
- `assets/engine.js`: deterministic state transitions and evaluation. Side effects live in `assets/desk.js`.
- `assets/harbor.svg`: original decorative district map, not evidence. CSS uses local system fonts.
- All state is in the current page; no storage, trackers, names, network requests, outbound publishing, ranking by harm, or privileged information. Reload or use Restart to clear. The teacher guide and takeaway are standalone pages; browser Back can restore a page on browsers that support their normal back/forward cache, not durable storage.

## Pilot defaults, not decisions on future scope
Desk editor/shift lead, one civic venue-change incident, one later piece of evidence, three publication choices, branch-specific repair/hold, qualitative public effects, balanced transfer about a museum’s attendance numbers. English, 12–15 minutes tentative and not timed. Local browser play before school-hosting review. No antagonist role, real cases, freeform manipulative mechanics, live share actions, multiplayer or leaderboard. No reuse/licensing decision on original Yle assets: none used. The owner approved a public repository and GitHub Pages for this original pilot.

## Reproduction
`node site/qa/engine.test.cjs` exercises state transitions and six branches.
`TMPDIR=<writable scratch dir> node site/qa/browser.cjs` with Playwright installed; optionally set `CHROMIUM_PATH` and `PLAYWRIGHT_MODULE`. See `site/qa/QA.md` for exact scope and evidence once run.
