# AI Activation — Channel Partner Sales

An interactive, **3D HTML presentation** of the *AI Activation for Channel Partner Sales* deck.
A single **morphing particle field** (≈7,000 GPU points) flies between formations as you move
through the slides — restrained, cosmic, and Framer-style.

![Cover](docs/preview/01-cover.png)

## What's inside

The whole deck is driven by **one WebGL particle system** that transforms from shape to
shape. Particles arc and fly between formations on every transition (they visibly "come and
go"), then breathe and sway at rest:

| # | Slide | Particle formation |
|---|-------|--------------------|
| 1 | **A summer of AI Activation** (cover) | Particles gather into a glowing **sphere** — the "AI" core |
| 2 | **The quote** (Yamini Rangan, HubSpot) | They flow into a slow **orbital ring** ("time") drifting beside the quote |
| 3 | **AI April was a blast** (recap) | The field splits into **four week-constellations** beneath the content cards |
| 4 | **Your very own AI August** (reveal) | Particles gather into a **treasure chest**, then **erupt** in a celebratory burst |

The palette is deliberately restrained — mostly cool white / violet / blue with sparse
accent pops (and gold for the treasure). It all sits inside a faint starfield with soft
nebula and pointer-driven camera parallax.

| Quote (ring) | Recap (clusters) | AI August (burst) |
|---|---|---|
| ![Quote](docs/preview/02-quote.png) | ![Recap](docs/preview/03-recap.png) | ![August](docs/preview/04-august.png) |

## Controls

- **← / →**, **↑ / ↓**, **Space**, **Page Up/Down** — move between slides
- **Home / End** — jump to first / last slide
- **Mouse wheel / trackpad** — scroll to advance
- **Touch swipe** — on mobile / tablet
- **On-screen** — arrows, progress bar, and the dot navigator
- Move the mouse to gently parallax the whole scene

## Running it

It's a fully static site with **no build step** and **no network dependencies** — Three.js
and GSAP are vendored under `assets/vendor/`.

```bash
# any static server works, e.g.
python3 -m http.server 8000
# then open http://localhost:8000
```

> ES module import maps require the page to be served over `http(s)://`
> (opening `index.html` via `file://` won't load the modules).

### Deploy to GitHub Pages

Push this repo and enable **Settings → Pages → Deploy from branch** (root). The site is
served as-is.

## Tech

- **[Three.js](https://threejs.org/) r160** — WebGL rendering; a custom GLSL particle
  shader handles the morph (eased mix between formations + arc displacement + idle motion)
- **[GSAP](https://gsap.com/) 3.12** — drives the morph (`uMix`), camera moves, and the
  depth-based DOM reveals
- Vanilla JS, CSS, and a single `index.html` — no framework, no bundler

## Project layout

```
index.html              # markup + slide content + import map
assets/
  css/styles.css        # theme, glassmorphism, chrome, responsive
  js/scene.js           # the morphing particle field + formations + shader
  js/app.js             # slide controller, navigation, GSAP flows
  vendor/               # three.js + gsap (local, offline-friendly)
docs/preview/           # screenshots used in this README
```

---

*© 2026 Equinix, Inc. — content from the AI Activation for Channel Partner Sales deck.*
