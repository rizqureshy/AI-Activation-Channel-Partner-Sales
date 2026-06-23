/* ============================================================
   scene.js — Particle Construction Engine (Three.js)

   Particles ARE the slide. For each slide we measure the live DOM:
     • elements tagged data-particle="text"  -> their glyphs are
       rasterised and sampled into particle targets (particle text)
     • elements tagged data-particle="box"   -> their outline is
       sampled into particle targets (particle containers)
   The single particle field morphs:  shatter -> storm -> assemble
   into the next slide's shapes. Crisp DOM body copy fades in after.

   Camera is fixed head-on so the z=0 plane maps 1:1 to the viewport,
   which keeps particle shapes aligned with the DOM that fades in.
   ============================================================ */

import * as THREE from "three";

const C = {
  violet: new THREE.Color("#6b5bff"),
  iris:   new THREE.Color("#8b7bff"),
  blue:   new THREE.Color("#2b88ff"),
  teal:   new THREE.Color("#18c8b6"),
  white:  new THREE.Color("#eaf0ff"),
  peri:   new THREE.Color("#b9c2ff"),
};
const lerp = (a, b, t) => a + (b - a) * t;

export class Cosmos {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.N = this.reduced ? 9000 : 34000;
    this.camDist = 12;
    this.currentSlide = null;
    this._timers = [];

    // reusable offscreen canvas for glyph sampling
    this._scratch = document.createElement("canvas");
    this._sctx = this._scratch.getContext("2d", { willReadFrequently: true });

    this._initRenderer();
    this._initScene();
    this._buildStars();
    this._buildNebula();
    this._buildParticles();

    window.addEventListener("resize", () => this._onResize());
    this._onResize();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true, powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160);
    this.camera.position.set(0, 0, this.camDist);
    this.camera.lookAt(0, 0, 0);
  }

  /* ---- world<->screen mapping on the z=0 plane ---- */
  _viewSize() {
    const vh = 2 * this.camDist * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    return { vh, vw: vh * this.camera.aspect };
  }
  _worldFromScreen(sx, sy) {
    const { vw, vh } = this._viewSize();
    const x = (sx / window.innerWidth - 0.5) * vw;
    const y = -(sy / window.innerHeight - 0.5) * vh;
    return [x, y];
  }

  /* ---------------- faint ambient backdrop ---------------- */
  _buildStars() {
    const N = this.reduced ? 600 : 1300;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 30 + Math.random() * 55;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      pos[i * 3 + 2] = r * Math.cos(p) - 40;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xb9c2ff, size: 0.7, sizeAttenuation: true,
      transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.scene.add(this.stars);
  }
  _glowTex(color) {
    const s = 256, cv = document.createElement("canvas"); cv.width = cv.height = s;
    const x = cv.getContext("2d");
    const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, color.getStyle()); g.addColorStop(0.3, color.getStyle()); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  _buildNebula() {
    this.nebula = new THREE.Group();
    [{ c: C.violet, x: -16, y: 8, z: -34, s: 40, o: 0.10 },
     { c: C.blue, x: 17, y: -7, z: -36, s: 34, o: 0.08 }].forEach((d) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this._glowTex(d.c), blending: THREE.AdditiveBlending, depthWrite: false, opacity: d.o, transparent: true }));
      sp.position.set(d.x, d.y, d.z); sp.scale.set(d.s, d.s, 1);
      sp.userData = { baseY: d.y, ph: Math.random() * 6.28 }; this.nebula.add(sp);
    });
    this.scene.add(this.nebula);
  }

  /* ---------------- the particle field ---------------- */
  _buildParticles() {
    const N = this.N;
    this.aFrom = new Float32Array(N * 3);
    this.aTo = new Float32Array(N * 3);
    this.cFrom = new Float32Array(N * 3);
    this.cTo = new Float32Array(N * 3);
    const aRand = new Float32Array(N);
    const aSize = new Float32Array(N);
    for (let i = 0; i < N; i++) { aRand[i] = Math.random(); aSize[i] = 0.6 + Math.random() * 0.8; }

    const storm = this._stormForm();
    this.aFrom.set(storm.pos); this.aTo.set(storm.pos);
    this.cFrom.set(storm.col); this.cTo.set(storm.col);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.aTo, 3));
    geo.setAttribute("aFrom", new THREE.BufferAttribute(this.aFrom, 3));
    geo.setAttribute("aTo", new THREE.BufferAttribute(this.aTo, 3));
    geo.setAttribute("cFrom", new THREE.BufferAttribute(this.cFrom, 3));
    geo.setAttribute("cTo", new THREE.BufferAttribute(this.cTo, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));

    this.uniforms = {
      uTime: { value: 0 }, uMix: { value: 1 }, uPix: { value: this.renderer.getPixelRatio() },
      uArc: { value: 1.4 }, uDist: { value: this.camDist },
    };

    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: this.uniforms,
      vertexShader: `
        uniform float uTime, uMix, uPix, uArc, uDist;
        attribute vec3 aFrom; attribute vec3 aTo; attribute vec3 cFrom; attribute vec3 cTo;
        attribute float aRand; attribute float aSize;
        varying vec3 vCol;
        void main(){
          float m = clamp(uMix, 0.0, 1.0);
          float e = m*m*(3.0-2.0*m);
          vec3 pos = mix(aFrom, aTo, e);
          // mid-flight bulge so particles visibly fly between shapes
          float arc = sin(e*3.14159265);
          vec3 dir = vec3(sin(aRand*6.2831), cos(aRand*5.137), sin(aRand*9.42));
          pos += dir * arc * uArc * (0.5 + aRand);
          pos.z += arc * (1.0 + aRand*2.0);                 // pop toward camera mid-transit
          // gentle idle so assembled text stays alive but readable
          pos.x += cos(uTime*0.5 + aRand*6.2831) * 0.012;
          pos.y += sin(uTime*0.6 + aRand*6.2831) * 0.014;

          vec4 mv = modelViewMatrix * vec4(pos,1.0);
          gl_PointSize = aSize * (40.0 / -mv.z) * uPix * (0.8 + 0.2*sin(uTime*2.0 + aRand*30.0));
          gl_Position = projectionMatrix * mv;
          vCol = mix(cFrom, cTo, e);
        }`,
      fragmentShader: `
        varying vec3 vCol;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          vec3 col = vCol * (1.1 + 0.5*(1.0 - d*2.0));
          gl_FragColor = vec4(col, a*0.9);
        }`,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  /* ---------------- target builders ---------------- */
  _textColor(t) { const c = C.white.clone().lerp(C.peri, t); return [c.r, c.g, c.b]; }

  _sampleText(el, rect) {
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize) || 40;
    const lh = cs.lineHeight === "normal" ? fs * 1.08 : (parseFloat(cs.lineHeight) || fs * 1.08);
    const font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const align = cs.textAlign;
    const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ");
    if (!text) return [];
    const cw = Math.max(1, Math.ceil(rect.width));
    const ch = Math.max(1, Math.ceil(rect.height));
    const x = this._sctx; this._scratch.width = cw; this._scratch.height = ch;
    x.clearRect(0, 0, cw, ch);
    x.fillStyle = "#fff"; x.textBaseline = "top"; x.font = font;

    // word-wrap to the element width
    const words = text.split(" ");
    const lines = []; let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (x.measureText(t).width > cw && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);

    let sy = Math.max(0, (ch - lines.length * lh) / 2);
    for (const ln of lines) {
      const w = x.measureText(ln).width;
      const sx = align === "center" ? (cw - w) / 2 : align === "right" || align === "end" ? cw - w : 0;
      x.fillText(ln, sx, sy); sy += lh;
    }

    const data = x.getImageData(0, 0, cw, ch).data;
    const S = this.reduced ? 4 : 3;
    const pts = [];
    for (let py = 0; py < ch; py += S) {
      for (let px = 0; px < cw; px += S) {
        if (data[(py * cw + px) * 4 + 3] > 120) {
          const [wx, wy] = this._worldFromScreen(rect.left + px, rect.top + py);
          const col = this._textColor(px / cw);
          pts.push([wx, wy, (Math.random() - 0.5) * 0.04, col[0], col[1], col[2]]);
        }
      }
    }
    return pts;
  }

  _sampleBox(el, rect) {
    const acc = new THREE.Color(el.dataset.accent || "#6b5bff");
    const S = this.reduced ? 11 : 7;
    const pts = [];
    const inset = 2;
    const L = rect.left + inset, T = rect.top + inset, R = rect.right - inset, B = rect.bottom - inset;
    const line = (x0, y0, x1, y1) => {
      const n = Math.max(1, Math.floor(Math.hypot(x1 - x0, y1 - y0) / S));
      for (let i = 0; i <= n; i++) {
        const sx = x0 + (x1 - x0) * i / n, sy = y0 + (y1 - y0) * i / n;
        const [wx, wy] = this._worldFromScreen(sx, sy);
        pts.push([wx, wy, (Math.random() - 0.5) * 0.04, acc.r, acc.g, acc.b]);
      }
    };
    line(L, T, R, T); line(R, T, R, B); line(R, B, L, B); line(L, B, L, T);
    return pts;
  }

  /** Measure the slide DOM and build N particle targets. */
  buildTargets(slide) {
    let pts = [];
    slide.querySelectorAll("[data-particle]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      if (el.dataset.particle === "text") pts = pts.concat(this._sampleText(el, rect));
      else if (el.dataset.particle === "box") pts = pts.concat(this._sampleBox(el, rect));
    });
    if (pts.length === 0) return this._stormForm();   // graceful fallback
    return this._compose(pts);
  }

  _compose(pts) {
    const N = this.N, M = pts.length;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = M - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
    for (let i = 0; i < N; i++) {
      const p = pts[i % M];
      const dup = i >= M;
      pos[i * 3] = p[0] + (dup ? (Math.random() - 0.5) * 0.05 : 0);
      pos[i * 3 + 1] = p[1] + (dup ? (Math.random() - 0.5) * 0.05 : 0);
      pos[i * 3 + 2] = p[2];
      col[i * 3] = p[3]; col[i * 3 + 1] = p[4]; col[i * 3 + 2] = p[5];
    }
    return { pos, col };
  }

  _stormForm() {
    const N = this.N, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const u = Math.random() * Math.PI * 2, ct = 2 * Math.random() - 1;
      const st = Math.sqrt(Math.max(0, 1 - ct * ct));
      const rad = 2.2 + Math.random() * 4.0;
      pos[i * 3] = Math.cos(u) * st * rad;
      pos[i * 3 + 1] = ct * rad;
      pos[i * 3 + 2] = Math.sin(u) * st * rad * 0.7;
      const c = Math.random() < 0.5 ? tmp.copy(C.white) : tmp.copy(C.iris).lerp(C.blue, Math.random());
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return { pos, col };
  }

  /* ---------------- morph driver ---------------- */
  _morphTo(form, opts = {}) {
    const gsap = this.gsap;
    const m = Math.min(Math.max(this.uniforms.uMix.value, 0), 1);
    const e = m * m * (3 - 2 * m);
    for (let i = 0; i < this.aFrom.length; i++) {
      this.aFrom[i] = lerp(this.aFrom[i], this.aTo[i], e);
      this.cFrom[i] = lerp(this.cFrom[i], this.cTo[i], e);
    }
    this.aTo.set(form.pos); this.cTo.set(form.col);
    const g = this.points.geometry;
    g.attributes.aFrom.needsUpdate = g.attributes.aTo.needsUpdate = true;
    g.attributes.cFrom.needsUpdate = g.attributes.cTo.needsUpdate = true;

    this.uniforms.uMix.value = 0;
    gsap.killTweensOf(this.uniforms.uMix);
    gsap.killTweensOf(this.uniforms.uArc);
    this.uniforms.uArc.value = opts.arc ?? 1.4;
    gsap.to(this.uniforms.uMix, { value: 1, duration: opts.dur ?? 1.3, ease: opts.ease ?? "power3.out" });
  }

  _clearTimers() { this._timers.forEach((t) => t.kill && t.kill()); this._timers = []; }

  /* ============================================================
     Public: transition into a slide — shatter -> storm -> assemble.
     Calls onAssembled() once the particles have formed the shapes.
     ============================================================ */
  transition(slide, gsap, onAssembled) {
    this.gsap = gsap;
    this.currentSlide = slide;
    this._clearTimers();

    // 1) shatter to a storm/orb
    this._morphTo(this._stormForm(), { arc: 0.9, dur: 0.55, ease: "power2.in" });

    // 2) assemble the slide's shapes out of the storm
    this._timers.push(gsap.delayedCall(0.5, () => {
      this._morphTo(this.buildTargets(slide), { arc: 1.5, dur: 1.25, ease: "power3.out" });
      this._timers.push(gsap.delayedCall(1.0, () => onAssembled && onAssembled()));
    }));
  }

  /** Re-fit the current slide's shapes (e.g. after a resize) without the storm. */
  reflow() {
    if (!this.currentSlide || !this.gsap) return;
    this._morphTo(this.buildTargets(this.currentSlide), { arc: 0.4, dur: 0.5, ease: "power2.out" });
  }

  _onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.uniforms) this.uniforms.uPix.value = this.renderer.getPixelRatio();
    clearTimeout(this._rzT);
    this._rzT = setTimeout(() => this.reflow(), 220);
  }

  /* ---------------- loop ---------------- */
  start() {
    const tick = () => { this._frame(); this.renderer.render(this.scene, this.camera); this._raf = requestAnimationFrame(tick); };
    tick();
  }
  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed = (this.elapsed || 0) + dt;
    const t = this.elapsed;
    if (this.uniforms) this.uniforms.uTime.value = t;
    if (this.stars) this.stars.rotation.y = t * 0.006;
    if (this.nebula) this.nebula.children.forEach((s) => { s.position.y = s.userData.baseY + Math.sin(t * 0.25 + s.userData.ph) * 0.4; });
  }
}
