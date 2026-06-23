/* ============================================================
   scene.js — Morphing particle field (Three.js)

   A single GPU particle system (~7k points) that flies between
   formations per slide:
     0  orb        — a glowing particle sphere (the "AI" core)
     1  time-ring  — particles settle into a slow orbital ring
     2  clusters   — they split into four week constellations
     3  burst      — gather into a chest, then erupt like treasure

   Restrained palette: mostly cool white/violet with sparse
   accent pops. Morphs are eased + arc-displaced so particles
   visibly "come and go" between shapes (Framer-style).
   ============================================================ */

import * as THREE from "three";

const C = {
  violet: new THREE.Color("#6b5bff"),
  iris:   new THREE.Color("#8b7bff"),
  blue:   new THREE.Color("#2b88ff"),
  teal:   new THREE.Color("#18c8b6"),
  pink:   new THREE.Color("#e3008c"),
  gold:   new THREE.Color("#ffcf45"),
  white:  new THREE.Color("#dfe4ff"),
};
const ACCENTS = [C.violet, C.blue, C.teal, C.pink];
const lerp = (a, b, t) => a + (b - a) * t;
const GA = Math.PI * (3 - Math.sqrt(5)); // golden angle

export class Cosmos {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.pointer = new THREE.Vector2(0, 0);
    this.pointerTarget = new THREE.Vector2(0, 0);
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.N = this.reduced ? 5000 : 15000;

    this._initRenderer();
    this._initScene();
    this._buildStars();
    this._buildNebula();
    this._buildParticles();

    this._bindEvents();
    this.resize();
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
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 160);
    this.camera.position.set(0, 0, 13);
    this.camBase = { x: 0, y: 0, z: 13 };
  }

  /* ---------------- faint background starfield ---------------- */
  _buildStars() {
    const N = this.reduced ? 700 : 1500;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 40 + Math.random() * 60;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      pos[i * 3 + 2] = r * Math.cos(p) - 30;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xcdd4ff, size: 0.7, sizeAttenuation: true,
      transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  _glowTexture(color) {
    const s = 256, cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const ctx = cv.getContext("2d");
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    const c = color.getStyle();
    g.addColorStop(0, c); g.addColorStop(0.3, c); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; return tex;
  }

  _buildNebula() {
    this.nebula = new THREE.Group();
    [
      { c: C.violet, x: -15, y: 7,  z: -34, s: 40, o: 0.13 },
      { c: C.blue,   x: 16,  y: -6, z: -36, s: 34, o: 0.10 },
    ].forEach((d) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this._glowTexture(d.c), blending: THREE.AdditiveBlending,
        depthWrite: false, opacity: d.o, transparent: true }));
      sp.position.set(d.x, d.y, d.z); sp.scale.set(d.s, d.s, 1);
      sp.userData = { baseY: d.y, ph: Math.random() * 6.28 };
      this.nebula.add(sp);
    });
    this.scene.add(this.nebula);
  }

  /* ============================================================
     The morphing particle field
     ============================================================ */
  _buildParticles() {
    const N = this.N;
    this.aFrom = new Float32Array(N * 3);
    this.aTo = new Float32Array(N * 3);
    this.cFrom = new Float32Array(N * 3);
    this.cTo = new Float32Array(N * 3);
    const aRand = new Float32Array(N);
    const aSize = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      aRand[i] = Math.random();
      aSize[i] = 0.3 + Math.random() * 0.85;
    }

    // initial formation = orb
    const t0 = this._formOrb();
    this.aFrom.set(t0.pos); this.aTo.set(t0.pos);
    this.cFrom.set(t0.col); this.cTo.set(t0.col);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.aTo, 3)); // required slot
    geo.setAttribute("aFrom", new THREE.BufferAttribute(this.aFrom, 3));
    geo.setAttribute("aTo", new THREE.BufferAttribute(this.aTo, 3));
    geo.setAttribute("cFrom", new THREE.BufferAttribute(this.cFrom, 3));
    geo.setAttribute("cTo", new THREE.BufferAttribute(this.cTo, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uMix: { value: 1 },
      uPix: { value: this.renderer.getPixelRatio() },
      uArc: { value: 1.3 },
      uSpin: { value: 0.0 },
    };

    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: this.uniforms,
      vertexShader: `
        uniform float uTime, uMix, uPix, uArc, uSpin;
        attribute vec3 aFrom; attribute vec3 aTo;
        attribute vec3 cFrom; attribute vec3 cTo;
        attribute float aRand; attribute float aSize;
        varying vec3 vCol;
        void main(){
          float m = clamp(uMix, 0.0, 1.0);
          float e = m*m*(3.0-2.0*m);                 // smoothstep ease
          vec3 pos = mix(aFrom, aTo, e);

          // arc displacement mid-flight -> particles "fly" between shapes
          float arc = sin(e*3.14159265);
          vec3 dir = vec3(sin(aRand*6.2831), cos(aRand*5.137), sin(aRand*9.42));
          pos += dir * arc * uArc * (0.4 + aRand);

          // idle sway around Y + gentle bob (alive at rest)
          float a = sin(uTime*0.12)*0.35 + uSpin*uTime;
          float s = sin(a), c = cos(a);
          pos = vec3(pos.x*c - pos.z*s, pos.y, pos.x*s + pos.z*c);
          pos.y += sin(uTime*0.7 + aRand*6.2831)*0.07;
          pos.x += cos(uTime*0.5 + aRand*6.2831)*0.05;

          vec4 mv = modelViewMatrix * vec4(pos,1.0);
          gl_PointSize = aSize * (150.0 / -mv.z) * uPix * (0.7 + 0.3*sin(uTime*2.0 + aRand*30.0));
          gl_Position = projectionMatrix * mv;
          vCol = mix(cFrom, cTo, e);
        }`,
      fragmentShader: `
        varying vec3 vCol;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vCol, a*0.5);
        }`,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  /* ---------------- formation generators ---------------- */
  _alloc() { return { pos: new Float32Array(this.N * 3), col: new Float32Array(this.N * 3) }; }
  _setCol(col, i, c, jitter = 0.0) {
    col[i * 3] = c.r * (1 - jitter + Math.random() * jitter * 2);
    col[i * 3 + 1] = c.g * (1 - jitter + Math.random() * jitter * 2);
    col[i * 3 + 2] = c.b * (1 - jitter + Math.random() * jitter * 2);
  }

  _formOrb() {
    const { pos, col } = this._alloc(), N = this.N, R = 3.0;
    const tmp = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * GA;
      const rad = R + (Math.random() - 0.5) * 0.5;
      const px = Math.cos(phi) * rr * rad;
      const py = y * rad;
      const pz = Math.sin(phi) * rr * rad;
      pos[i * 3] = px; pos[i * 3 + 1] = py + 0.3; pos[i * 3 + 2] = pz;
      // cool gradient by height; sparse pink
      const tcol = Math.random() < 0.05 ? C.pink : tmp.copy(C.violet).lerp(C.blue, (y + 1) / 2);
      this._setCol(col, i, tcol, 0.08);
    }
    return { pos, col };
  }

  _formRing() {
    const { pos, col } = this._alloc(), N = this.N, R = 3.2, r = 0.42;
    const tmp = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const z = (R + r * Math.cos(v)) * Math.sin(u);
      const y = r * Math.sin(v);
      // tilt the ring slightly for an "orbit" read; offset right
      pos[i * 3] = x + 3.4;
      pos[i * 3 + 1] = y + x * 0.18 + 0.3;
      pos[i * 3 + 2] = z;
      const tcol = Math.random() < 0.06 ? C.teal : tmp.copy(C.iris).lerp(C.blue, Math.random());
      this._setCol(col, i, tcol, 0.06);
    }
    return { pos, col };
  }

  _formClusters() {
    const { pos, col } = this._alloc(), N = this.N;
    const cols = [C.blue, C.violet, C.teal, C.gold];
    const spacing = 3.1;
    for (let i = 0; i < N; i++) {
      const g = i % 4;
      const cx = (g - 1.5) * spacing;
      // rounded box-ish gaussian cloud
      const rx = (Math.random() - 0.5) * 1.7;
      const ry = (Math.random() - 0.5) * 1.7;
      const rz = (Math.random() - 0.5) * 1.0;
      pos[i * 3] = cx + rx;
      pos[i * 3 + 1] = -3.4 + ry;
      pos[i * 3 + 2] = rz;
      this._setCol(col, i, cols[g], 0.12);
    }
    return { pos, col };
  }

  _formChest() {
    const { pos, col } = this._alloc(), N = this.N;
    const W = 1.9, H = 1.3, D = 1.3;
    for (let i = 0; i < N; i++) {
      // points on the surface of a rounded box (the "treasure box")
      const f = Math.floor(Math.random() * 6);
      let x = (Math.random() - 0.5) * W, y = (Math.random() - 0.5) * H, z = (Math.random() - 0.5) * D;
      if (f === 0) y = H / 2; else if (f === 1) y = -H / 2;
      else if (f === 2) x = W / 2; else if (f === 3) x = -W / 2;
      else if (f === 4) z = D / 2; else z = -D / 2;
      pos[i * 3] = x; pos[i * 3 + 1] = y - 2.4; pos[i * 3 + 2] = z;
      const tcol = Math.random() < 0.35 ? C.gold : C.violet;
      this._setCol(col, i, tcol, 0.1);
    }
    return { pos, col };
  }

  _formBurst() {
    const { pos, col } = this._alloc(), N = this.N;
    for (let i = 0; i < N; i++) {
      // upward-biased exploding shell — the "treasure" fountain
      const dirx = (Math.random() - 0.5) * 2;
      const diry = Math.random();             // bias up
      const dirz = (Math.random() - 0.5) * 2;
      const len = Math.sqrt(dirx * dirx + diry * diry + dirz * dirz) || 1;
      const rad = 1.5 + Math.random() * 5.0;
      pos[i * 3] = (dirx / len) * rad;
      pos[i * 3 + 1] = (diry / len) * rad - 1.0;
      pos[i * 3 + 2] = (dirz / len) * rad;
      const r = Math.random();
      const tcol = r < 0.15 ? ACCENTS[(r * 100 | 0) % ACCENTS.length] : (r < 0.6 ? C.gold : C.white);
      this._setCol(col, i, tcol, 0.1);
    }
    return { pos, col };
  }

  /* ---------------- morph driver ---------------- */
  _morphTo(form, opts = {}) {
    const gsap = this.gsap;
    // bake currently-displayed mix into aFrom so fast skips don't pop
    const e = (() => { const m = Math.min(Math.max(this.uniforms.uMix.value, 0), 1); return m * m * (3 - 2 * m); })();
    for (let i = 0; i < this.aFrom.length; i++) {
      this.aFrom[i] = lerp(this.aFrom[i], this.aTo[i], e);
      this.cFrom[i] = lerp(this.cFrom[i], this.cTo[i], e);
    }
    this.aTo.set(form.pos);
    this.cTo.set(form.col);
    const geo = this.points.geometry;
    geo.attributes.aFrom.needsUpdate = true;
    geo.attributes.aTo.needsUpdate = true;
    geo.attributes.cFrom.needsUpdate = true;
    geo.attributes.cTo.needsUpdate = true;

    this.uniforms.uMix.value = 0;
    gsap.killTweensOf(this.uniforms.uMix);
    gsap.killTweensOf(this.uniforms.uArc);
    this.uniforms.uArc.value = opts.arc ?? 1.4;
    gsap.to(this.uniforms.uMix, { value: 1, duration: opts.dur ?? 1.7, ease: opts.ease ?? "power3.inOut" });
    gsap.to(this.uniforms.uSpin, { value: opts.spin ?? 0.0, duration: 1.5, ease: "power2.out" });
  }

  /* ---------------- per-slide choreography ---------------- */
  setSlide(index, gsap) {
    this.gsap = gsap;
    if (this._chestTimer) { this._chestTimer.kill(); this._chestTimer = null; }

    if (index === 0) {
      this._morphTo(this._formOrb(), { spin: 0.05, arc: 1.5 });
      this._camTo(0, 0.5, 13);
    } else if (index === 1) {
      this._morphTo(this._formRing(), { spin: 0.10, arc: 1.2 });
      this._camTo(-0.6, 0.1, 12.5);
    } else if (index === 2) {
      this._morphTo(this._formClusters(), { spin: 0.0, arc: 1.8, dur: 1.9 });
      this._camTo(0, 0.3, 14.5);
    } else if (index === 3) {
      // gather into a chest, then erupt
      this._morphTo(this._formChest(), { spin: 0.0, arc: 1.2, dur: 1.3 });
      this._camTo(0, 0.0, 13);
      this._chestTimer = gsap.delayedCall(1.5, () => {
        this._morphTo(this._formBurst(), { spin: 0.06, arc: 2.6, dur: 1.6, ease: "power2.out" });
      });
    }
  }

  _camTo(x, y, z) {
    this.camBase = { x, y, z };
    this.gsap.to(this.camera.position, { x, y, z, duration: 1.4, ease: "power3.inOut" });
  }

  /* ---------------- events / loop ---------------- */
  _bindEvents() {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("pointermove", (e) => {
      this.pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.uniforms) this.uniforms.uPix.value = this.renderer.getPixelRatio();
  }

  start() {
    const tick = () => { this._frame(); this.renderer.render(this.scene, this.camera); this._raf = requestAnimationFrame(tick); };
    tick();
  }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed = (this.elapsed || 0) + dt;
    const t = this.elapsed;

    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * 0.05;
    this.camera.position.x = this.camBase.x + this.pointer.x * 0.8 + Math.sin(t * 0.1) * 0.2;
    this.camera.position.y = this.camBase.y - this.pointer.y * 0.6 + Math.cos(t * 0.12) * 0.15;
    this.camera.lookAt(0, this.camBase.y * 0.2, 0);

    if (this.uniforms) this.uniforms.uTime.value = t;
    if (this.stars) this.stars.rotation.y = t * 0.008;
    if (this.nebula) {
      this.nebula.children.forEach((s) => { s.position.y = s.userData.baseY + Math.sin(t * 0.25 + s.userData.ph) * 0.4; });
    }
  }
}
