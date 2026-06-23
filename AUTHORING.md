# Authoring a deck on the Particle Engine

This branch (`particle-engine-template`) is a **reusable presentation platform**. The 3D
particle engine, animations, theme, and slide controls are done. To make a new deck you
only write **HTML content** — no JavaScript changes required.

> **Workflow:** branch a new deck off this template, e.g.
> `git checkout particle-engine-template && git checkout -b deck/<name>`,
> then edit `index.html` (and the brand/title). Keep the engine files untouched.

---

## How it works (the big idea)

The particles **are** the slide. For each slide the engine measures the live DOM and turns
tagged elements into particle targets:

- `data-particle="text"` — the element's words are rasterised and **rendered in particles**
  (use on the headline). The DOM node is hidden but still laid out, so the particles sit
  exactly where the text would be.
- `data-particle="box"` `data-accent="#hex"` — the element's outline is **drawn in
  particles** (use on cards / containers). The crisp card then fades in inside the outline.

On every slide change the shapes **shatter → swirl into a storm → reassemble** into the next
slide. Crisp body copy (everything not tagged) fades in once the particles finish assembling.
The camera is fixed head-on so particle shapes stay aligned with the DOM.

## 1. Anatomy of a slide

Every slide is one `<section class="slide">` inside `<main id="stage">`:

```html
<section class="slide content" data-slide="1">
  <div class="slide-inner">
    <div class="lead">
      <span class="kicker reveal"><span class="dot"></span> Section</span>
      <h2 data-particle="text">Headline built from particles</h2>
      <p class="lede reveal">Crisp body copy that fades in.</p>
    </div>
    <div class="cards c3">
      <article class="card pop" data-particle="box" data-accent="#2b88ff"> … </article>
      …
    </div>
  </div>
  <div class="eq-credit">© 2026 Your Org</div>
</section>
```

- `data-slide` is just a label (ordering comes from DOM order).
- Tag the **headline** with `data-particle="text"` and **containers** with
  `data-particle="box" data-accent="#hex"`.
- The dots, counter, and prev/next **update automatically** from the number of slides —
  add or remove `<section class="slide">` blocks and everything follows.

### Slide layout modifiers (on the `<section>`)
| Class | Effect |
|-------|--------|
| `content` | left-aligned content slide (default for body slides) |
| `center` | center everything (covers, closings, statements) |
| `cover` | larger title sizing for the opening slide |

---

## 2. Animation classes (add to elements inside a slide)

| Class | Use it on | What it does |
|-------|-----------|--------------|
| `reveal` | text, kickers, ledes, notes, CTAs | fades/rises in with a 3D tilt, staggered |
| `pop` | cards & panels | cascades in with depth + spring |

Anything without these is simply visible. Keep big text on `.reveal`, grids of cards on `.pop`.

### Glowing key words
Wrap words in `gradient-text` to make them glow and radiate:

```html
<h2 class="reveal">A clear <span class="gradient-text">point</span> for this slide</h2>
```

---

## 3. Particle tags

| Tag | Put it on | Result |
|-----|-----------|--------|
| `data-particle="text"` | the headline (`h1`/`h2`) | the words are rendered in particles; the DOM node is hidden |
| `data-particle="box"` + `data-accent="#hex"` | cards / containers / pipeline stages | the element's outline is drawn in particles in that accent colour |

**The slide's "shape" emerges from its layout.** Four cards → four particle boxes; a row of
pipeline stages → boxes in a line; a wall/grid of items → a grid of boxes. You don't pick an
abstract formation any more — you lay out the content and the particles build it.

Tips:
- Keep headlines short-ish; particle text reads best at large sizes.
- Only tag the **big** headline as `text`. Body copy and labels stay crisp DOM (`.reveal`).
- Any element can be a `box` — cards, the pipeline `.flow`, a single statement panel.
- A slide with **no** tags still works: particles fall back to a storm/orb behind the text.
- The camera is fixed (no per-slide camera knobs) so particles line up with the DOM.

---

## 4. Content components (copy-paste)

All components live in `assets/css/styles.css` and use the shared glass theme.

**Kicker (eyebrow):**
```html
<span class="kicker reveal"><span class="dot"></span> Section label</span>
```

**Lead block (kicker + heading + lede):**
```html
<div class="lead">
  <span class="kicker reveal"><span class="dot"></span> Section</span>
  <h2 class="reveal">Heading with a <span class="gradient-text">key word</span></h2>
  <p class="lede reveal">One or two sentences of context.</p>
</div>
```

**Card grid** — `cards c2` / `c3` / `c4`. Per-card accent via inline `--ic` (icon gradient)
and `--ac` (glow):
```html
<div class="cards c3">
  <article class="card pop" style="--ic:linear-gradient(135deg,#2b88ff,#4a3fd0);--ac:#2b88ff;">
    <div class="ic"><svg viewBox="0 0 24 24"><path d="…"/></svg></div>
    <span class="tag">optional label</span>
    <h3>Card title</h3>
    <p>Supporting copy.</p>
  </article>
  …
</div>
```

**Pipeline / flow strip:**
```html
<div class="flow reveal">
  <span class="stage">Build</span><span class="arrow">›</span>
  <span class="stage">Validate</span><span class="arrow">›</span>
  <span class="stage">Ship</span>
</div>
```

**Numbered list:**
```html
<div class="moves">
  <div class="move pop"><span class="n">1</span><p><b>Lead-in.</b> Detail.</p></div>
  …
</div>
```

**People / owners** (card with initials avatar):
```html
<article class="card pop" style="--ac:#2b88ff;">
  <div class="ava" style="--ic:linear-gradient(135deg,#2b88ff,#4a3fd0);">RA</div>
  <div class="who">Full Name</div>
  <p class="role">Role line</p>
</article>
```

**Status pill** (e.g. "research"): `<span class="status reveal">Status · …</span>`
**Note line:** `<p class="note reveal">…</p>`  ·  **CTA:** `<p class="cta reveal">…</p>`
**Presenter (cover):** `<div class="presenter reveal"><span class="dot2"></span> <span><b>Name</b> · Team</span></div>`

Icons are inline `<svg viewBox="0 0 24 24"><path d="…"/></svg>` with `fill:#fff` (handled by
`.card .ic svg`). Grab paths from any icon set.

### Accent palette
`--blue #2b88ff` · `--indigo #6b5bff` · `--purple #9b4dff` · `--teal #18c8b6` ·
`--gold #ffcf45`. Keep colour use restrained — a couple of accents per slide.

---

## 5. Branding (per deck)

In `index.html`:
- `<title>…</title>`
- brand label in the top bar: `<div class="logo"><span class="spark"></span> Your Title</div>`
- footer credit: each slide's `<div class="eq-credit">© 2026 Your Org</div>`
- the loader caption (optional): `.lbl` text

Theme colours and fonts live in `:root` at the top of `assets/css/styles.css`.

---

## 6. Run & deploy

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
Must be served over `http(s)://` (ES module import maps don't work from `file://`).
No build step, no network needed at runtime — Three.js + GSAP are vendored in
`assets/vendor/`.

Deploy: push the deck branch and enable **GitHub Pages → Deploy from branch (root)**.

---

## 7. Where things live

```
index.html            # the deck — the only file you edit for content
assets/css/styles.css # theme tokens + components + chrome
assets/js/scene.js    # particle construction engine (DOM → particles)  (don't edit for content)
assets/js/app.js      # slide controller + navigation          (don't edit for content)
assets/vendor/        # three.js + gsap
```

Want a new kind of particle shape (beyond text/box) or to tweak the shatter/storm timing?
That's an engine change in `scene.js` — add a sampler and call it from `buildTargets()`, or
adjust the `transition()` phases.
