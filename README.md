# CRO AI Activation Community — Website

A warm, community-led website for the **CRO AI Activation Community**, built on the
project's 3D **particle engine**. One persistent WebGL particle field lives behind every
page and **morphs into a themed formation** as you move through the site (orb on Home,
fireworks on Recognition, a rocket on Team Activation, a power symbol on Access Help, and
so on).

> This is not a training portal. Not a static SharePoint page. It's the front door to the
> community: **The Community Wants You.**

## Run it

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

No build step. Three.js + GSAP are vendored locally; fonts load from Google Fonts.

## How it's built

It's a **hash-routed single-page site** so the WebGL background never reloads between
pages — it just morphs.

```
index.html            # shell: nav, background canvas, #main, footer
assets/
  css/site.css        # theme tokens, glass components, layout, forms, responsive nav
  js/site.js          # router + all page content + nav + forms + engine wiring
  js/scene.js         # the particle engine (formations + live fireworks sim)
  vendor/             # three.js + gsap (offline-friendly)
```

- **`assets/js/site.js`** holds every page as a `ROUTES[...]` entry: `{ title, formation, html() }`.
  Content is generated from small builders (`block`, `iconCards`, `numCards`, `formHTML`,
  `ctas`, …) to stay DRY. To edit copy or add a page, edit this one file.
- On each route change the router renders the page into `#main`, calls
  `cosmos.applyFormation(formation, gsap)`, and runs an `IntersectionObserver` to reveal
  sections on scroll.

### Pages (simplified navigation)

Home · Join the Community · Community Champions · AI Events Calendar · AI Clinic ·
Community Gallery · Skill Up, Speed Up (AI video gallery) · Learning Lanes ·
AI Activation for Teams.

A single primary nav (no separate quick-links bar), a footer, and community mechanics
(star earnings, contributor levels, champions/leaderboard) are included.

### Forms

All forms are **presentational demos** — submitting shows a confirmation toast and resets
the form. The field sets match the spec; wiring them to Teams / SharePoint / a backend is
the next step.

## Particle formations used

`orb · burst · question · split · clusters:N · grid · stream · ring · check · rocket ·
power · core · fireworks (live)`. The fireworks formation runs a live CPU simulation
(rockets launch, burst, fall under gravity, recycle); everything else is a morph target.

> The interactive presentation deck that this engine was originally built for lives on the
> `deck/ai-enablement-session` branch.

---

*Built on the AI Activation particle engine. Restrained "fun universe" theme, made warm.*
