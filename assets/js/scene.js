/* ============================================================
   scene.js — Real, layered 3D artwork (Three.js)
   Everything here is generated procedurally: starfield, nebula,
   a glass "AI" orb, glowing week badges, and an opening
   treasure chest. No flat image cut-outs — pure geometry.
   ============================================================ */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ---- Microsoft "Fun" palette (as THREE colors) ---- */
const FUN = {
  blue:    new THREE.Color("#2b88ff"),
  indigo:  new THREE.Color("#6b5bff"),
  purple:  new THREE.Color("#9b4dff"),
  magenta: new THREE.Color("#e3008c"),
  pink:    new THREE.Color("#ff4db8"),
  teal:    new THREE.Color("#18c8b6"),
  green:   new THREE.Color("#22c55e"),
  orange:  new THREE.Color("#ff8a3d"),
  yellow:  new THREE.Color("#ffd23d"),
};
const FUN_ARR = Object.values(FUN);

export class Cosmos {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.pointer = new THREE.Vector2(0, 0);
    this.pointerTarget = new THREE.Vector2(0, 0);
    this.activeSlide = 0;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this._initRenderer();
    this._initScene();
    this._buildStarfield();
    this._buildNebula();
    this._buildBokeh();

    // Hero groups — one per slide
    this.heroes = [];
    this.orb = this._buildOrb();          // slide 0 (cover) + slide 1 (quote)
    this.badges = this._buildBadges();    // slide 2 (recap)
    this.chest = this._buildChest();      // slide 3 (august)

    this.heroes = [this.orb, this.orb, this.badges, this.chest];
    this._placeHeroes();

    this._bindEvents();
    this.resize();
  }

  /* -------------------------------------------------- core */
  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
    this.camera.position.set(0, 0, 13);

    // Image-based lighting for premium glass/gloss reflections
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // Key + rim lights in fun colors
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(5, 8, 7);
    this.scene.add(key);

    const rimA = new THREE.PointLight(FUN.purple, 60, 60);
    rimA.position.set(-9, 3, 4);
    const rimB = new THREE.PointLight(FUN.teal, 50, 60);
    rimB.position.set(9, -4, 5);
    const rimC = new THREE.PointLight(FUN.pink, 40, 60);
    rimC.position.set(0, 6, -6);
    this.scene.add(rimA, rimB, rimC);
    this.scene.add(new THREE.AmbientLight(0x404a7a, 1.2));
  }

  /* -------------------------------------------------- layer 1: stars */
  _buildStarfield() {
    const N = this.reduced ? 1200 : 3600;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const sz = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      // spherical shell distribution
      const r = 26 + Math.random() * 48;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      pos[i * 3 + 2] = r * Math.cos(p) - 20;
      const c = Math.random() < 0.4
        ? FUN_ARR[(Math.random() * FUN_ARR.length) | 0]
        : new THREE.Color(0xffffff);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      sz[i] = Math.random() * 2 + 0.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPix: { value: this.renderer.getPixelRatio() } },
      vertexColors: true,
      vertexShader: `
        attribute float aSize; varying vec3 vCol; uniform float uTime; uniform float uPix;
        void main(){
          vCol = color;
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          float tw = 0.6 + 0.4*sin(uTime*1.5 + position.x*1.3 + position.y*0.7);
          gl_PointSize = aSize * tw * (300.0/ -mv.z) * uPix;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vCol;
        void main(){
          vec2 d = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.0, length(d));
          gl_FragColor = vec4(vCol, a);
        }`,
    });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  /* -------------------------------------------------- layer 2: nebula glow */
  _glowTexture(color) {
    const s = 256;
    const cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const ctx = cv.getContext("2d");
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    const c = color.getStyle();
    g.addColorStop(0, c);
    g.addColorStop(0.25, c);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _buildNebula() {
    this.nebula = new THREE.Group();
    const defs = [
      { c: FUN.purple,  x: -14, y: 6,   z: -22, s: 30, o: 0.35 },
      { c: FUN.magenta, x: 16,  y: 9,   z: -26, s: 26, o: 0.28 },
      { c: FUN.teal,    x: 12,  y: -10, z: -20, s: 28, o: 0.26 },
      { c: FUN.blue,    x: -10, y: -8,  z: -24, s: 24, o: 0.24 },
      { c: FUN.orange,  x: 2,   y: 12,  z: -28, s: 22, o: 0.18 },
    ];
    for (const d of defs) {
      const mat = new THREE.SpriteMaterial({
        map: this._glowTexture(d.c),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: d.o,
        transparent: true,
      });
      const sp = new THREE.Sprite(mat);
      sp.position.set(d.x, d.y, d.z);
      sp.scale.set(d.s, d.s, 1);
      sp.userData.phase = Math.random() * Math.PI * 2;
      this.nebula.add(sp);
    }
    this.scene.add(this.nebula);
  }

  /* -------------------------------------------------- layer 3: floating bokeh */
  _buildBokeh() {
    this.bokeh = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const N = this.reduced ? 8 : 16;
    for (let i = 0; i < N; i++) {
      const c = FUN_ARR[(Math.random() * FUN_ARR.length) | 0];
      const mat = new THREE.MeshPhysicalMaterial({
        color: c,
        roughness: 0.12,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        emissive: c,
        emissiveIntensity: 0.45,
        envMapIntensity: 1.2,
        transparent: true,
        opacity: 0.88,
      });
      const m = new THREE.Mesh(geo, mat);
      const r = 7 + Math.random() * 9;
      const a = Math.random() * Math.PI * 2;
      m.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 12, -2 - Math.random() * 10);
      const s = 0.18 + Math.random() * 0.5;
      m.scale.setScalar(s);
      m.userData = { baseY: m.position.y, sp: 0.3 + Math.random() * 0.6, ph: Math.random() * 6.28, rot: (Math.random() - 0.5) * 0.4 };
      this.bokeh.add(m);
    }
    this.scene.add(this.bokeh);
  }

  /* -------------------------------------------------- hero: glass AI orb */
  _buildOrb() {
    const g = new THREE.Group();

    // Outer clear glass shell
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.05, 6),
      new THREE.MeshPhysicalMaterial({
        roughness: 0.02,
        metalness: 0,
        transmission: 1.0,
        thickness: 2.2,
        ior: 1.42,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 1,
        envMapIntensity: 1.4,
      })
    );
    g.add(shell);

    // Inner colourful "petals" — overlapping translucent lobes
    const lobeColors = [FUN.blue, FUN.purple, FUN.magenta, FUN.orange, FUN.green, FUN.teal];
    const lobes = new THREE.Group();
    lobeColors.forEach((c, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(1.05, 48, 48),
        new THREE.MeshPhysicalMaterial({
          color: c, emissive: c, emissiveIntensity: 0.55,
          roughness: 0.3, metalness: 0,
          transparent: true, opacity: 0.5,
        })
      );
      const a = (i / lobeColors.length) * Math.PI * 2;
      m.position.set(Math.cos(a) * 0.55, Math.sin(a) * 0.55, Math.sin(a * 1.7) * 0.4);
      lobes.add(m);
    });
    g.add(lobes);
    g.userData.lobes = lobes;

    // Orbiting beads + a thin ring
    const beads = new THREE.Group();
    const bgeo = new THREE.SphereGeometry(0.12, 24, 24);
    for (let i = 0; i < 11; i++) {
      const c = FUN_ARR[i % FUN_ARR.length];
      const m = new THREE.Mesh(bgeo, new THREE.MeshPhysicalMaterial({
        color: c, emissive: c, emissiveIntensity: 0.9, roughness: 0.2, clearcoat: 1,
      }));
      const a = Math.random() * Math.PI * 2;
      const r = 2.7 + Math.random() * 0.9;
      const tilt = (Math.random() - 0.5) * 0.9;
      m.userData = { a, r, tilt, sp: 0.2 + Math.random() * 0.5, sc: 0.7 + Math.random() * 0.9 };
      m.scale.setScalar(m.userData.sc);
      beads.add(m);
    }
    g.add(beads);
    g.userData.beads = beads;

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.015, 16, 160),
      new THREE.MeshBasicMaterial({ color: FUN.indigo, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = Math.PI * 0.46;
    g.add(ring);
    g.userData.ring = ring;

    this.scene.add(g);
    return g;
  }

  /* -------------------------------------------------- hero: week badges */
  _iconTexture(kind) {
    const s = 256;
    const cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const x = cv.getContext("2d");
    x.fillStyle = "#fff";
    x.strokeStyle = "#fff";
    x.lineWidth = 18;
    x.lineCap = "round";
    x.lineJoin = "round";
    const C = s / 2;
    if (kind === "spark") {
      // 4-point sparkle
      const star = (cx, cy, R) => {
        x.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
          const a2 = a + Math.PI / 4;
          x.lineTo(cx + Math.cos(a2) * R * 0.28, cy + Math.sin(a2) * R * 0.28);
        }
        x.closePath();
        x.fill();
      };
      star(C, C, 80);
      star(C + 70, C - 70, 26);
    } else if (kind === "code") {
      x.font = "bold 150px 'Space Grotesk', system-ui, sans-serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("</>", C, C + 6);
    } else if (kind === "chart") {
      const bars = [[-70, 60], [-12, 95], [46, 130]];
      bars.forEach(([bx, h], i) => {
        const w = 40;
        x.fillRect(C + bx - w / 2, C + 70 - h, w, h);
      });
    } else if (kind === "rocket") {
      // body
      x.beginPath();
      x.moveTo(C, C - 92);
      x.bezierCurveTo(C + 52, C - 40, C + 46, C + 30, C + 30, C + 56);
      x.lineTo(C - 30, C + 56);
      x.bezierCurveTo(C - 46, C + 30, C - 52, C - 40, C, C - 92);
      x.closePath();
      x.fill();
      // window
      x.fillStyle = "rgba(0,0,0,0.25)";
      x.beginPath(); x.arc(C, C - 18, 20, 0, 6.28); x.fill();
      // fins
      x.fillStyle = "#fff";
      x.beginPath(); x.moveTo(C - 30, C + 28); x.lineTo(C - 64, C + 70); x.lineTo(C - 30, C + 56); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(C + 30, C + 28); x.lineTo(C + 64, C + 70); x.lineTo(C + 30, C + 56); x.closePath(); x.fill();
      // flame
      x.fillStyle = "rgba(255,255,255,0.85)";
      x.beginPath(); x.moveTo(C - 16, C + 58); x.quadraticCurveTo(C, C + 110, C + 16, C + 58); x.closePath(); x.fill();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  _buildBadges() {
    const g = new THREE.Group();
    const data = [
      { c1: FUN.blue,    c2: FUN.indigo,  icon: "spark" },
      { c1: FUN.magenta, c2: FUN.purple,  icon: "code" },
      { c1: FUN.teal,    c2: FUN.green,   icon: "chart" },
      { c1: FUN.orange,  c2: FUN.yellow,  icon: "rocket" },
    ];
    const geo = new RoundedBoxGeometry(2.0, 2.0, 0.5, 6, 0.45);
    const spacing = 2.7;
    this.badgeMeshes = [];
    data.forEach((d, i) => {
      const sub = new THREE.Group();
      const mat = new THREE.MeshPhysicalMaterial({
        color: d.c1, emissive: d.c2, emissiveIntensity: 0.4,
        roughness: 0.18, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.1,
        envMapIntensity: 1.3, transparent: true, opacity: 0.97,
      });
      const box = new THREE.Mesh(geo, mat);
      sub.add(box);

      // icon decal on the front face
      const icon = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15, 1.15),
        new THREE.MeshBasicMaterial({
          map: this._iconTexture(d.icon), transparent: true,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      icon.position.z = 0.27;
      sub.add(icon);

      // colored glow behind badge
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this._glowTexture(d.c1), blending: THREE.AdditiveBlending,
        depthWrite: false, transparent: true, opacity: 0.5,
      }));
      glow.scale.set(5, 5, 1);
      glow.position.z = -0.6;
      sub.add(glow);

      sub.position.x = (i - 1.5) * spacing;
      sub.userData = { baseX: sub.position.x, baseY: 0, ph: i * 0.7 };
      this.badgeMeshes.push(sub);
      g.add(sub);
    });
    this.scene.add(g);
    return g;
  }

  /* -------------------------------------------------- hero: treasure chest */
  _buildChest() {
    const g = new THREE.Group();

    const woodMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#5b2ea8"), roughness: 0.35, metalness: 0.2,
      clearcoat: 0.6, emissive: new THREE.Color("#2a1259"), emissiveIntensity: 0.4,
    });
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffcf45"), roughness: 0.25, metalness: 1.0,
      emissive: new THREE.Color("#ff9b1a"), emissiveIntensity: 0.25, envMapIntensity: 1.5,
    });

    const W = 3.4, H = 1.7, D = 2.3;

    // Base body
    const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 4, 0.12), woodMat);
    body.position.y = -H / 2;
    g.add(body);

    // Gold bands on body
    const band = (x) => {
      const b = new THREE.Mesh(new RoundedBoxGeometry(0.22, H + 0.04, D + 0.06, 3, 0.05), goldMat);
      b.position.set(x, -H / 2, 0);
      g.add(b);
    };
    band(-W / 2 + 0.4); band(W / 2 - 0.4);
    const midBand = new THREE.Mesh(new RoundedBoxGeometry(W + 0.06, 0.28, D + 0.06, 3, 0.05), goldMat);
    midBand.position.y = -H / 2;
    g.add(midBand);

    // Lock
    const lock = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.6, 0.18, 4, 0.08), goldMat);
    lock.position.set(0, -H / 2, D / 2 + 0.04);
    g.add(lock);

    // Lid as a group hinged at the back-top edge
    const lid = new THREE.Group();
    lid.position.set(0, 0, -D / 2); // hinge at back, y=0 (top of body)
    const lidShape = new THREE.Mesh(
      new THREE.CylinderGeometry(D / 2, D / 2, W, 48, 1, false, 0, Math.PI),
      woodMat
    );
    lidShape.rotation.z = Math.PI / 2;
    lidShape.position.set(0, 0, D / 2);
    lid.add(lidShape);
    // gold trim on lid
    const lidBandGeo = new THREE.TorusGeometry(D / 2, 0.07, 12, 32, Math.PI);
    [-W / 2 + 0.4, W / 2 - 0.4].forEach((x) => {
      const t = new THREE.Mesh(lidBandGeo, goldMat);
      t.position.set(x, 0, D / 2);
      t.rotation.y = Math.PI / 2;
      lid.add(t);
    });
    lid.rotation.x = 0; // closed; opens toward -x rotation
    g.add(lid);
    g.userData.lid = lid;

    // Inner glow light + emissive floor (revealed when open)
    const innerLight = new THREE.PointLight(FUN.yellow, 0, 8);
    innerLight.position.set(0, 0.1, 0);
    g.add(innerLight);
    g.userData.innerLight = innerLight;

    const treasure = new THREE.Mesh(
      new THREE.PlaneGeometry(W - 0.4, D - 0.4),
      new THREE.MeshBasicMaterial({ color: FUN.yellow, transparent: true, opacity: 0 })
    );
    treasure.rotation.x = -Math.PI / 2;
    treasure.position.y = -0.05;
    g.add(treasure);
    g.userData.treasure = treasure;

    // Burst spheres (hidden until opened)
    const burst = new THREE.Group();
    const bgeo = new THREE.SphereGeometry(0.16, 20, 20);
    this.burstParts = [];
    for (let i = 0; i < 26; i++) {
      const c = FUN_ARR[(Math.random() * FUN_ARR.length) | 0];
      const m = new THREE.Mesh(bgeo, new THREE.MeshPhysicalMaterial({
        color: c, emissive: c, emissiveIntensity: 1.0, roughness: 0.15, clearcoat: 1,
      }));
      m.visible = false;
      m.userData = {
        vx: (Math.random() - 0.5) * 0.06,
        vy: 0.10 + Math.random() * 0.12,
        vz: (Math.random() - 0.5) * 0.06,
        sc: 0.5 + Math.random() * 1.1,
        spin: (Math.random() - 0.5) * 0.2,
      };
      m.scale.setScalar(m.userData.sc);
      burst.add(m);
      this.burstParts.push(m);
    }
    g.add(burst);
    g.userData.burst = burst;
    g.userData.bursting = false;

    this.scene.add(g);
    return g;
  }

  /* -------------------------------------------------- placement */
  _placeHeroes() {
    // default hidden state
    this.orb.scale.setScalar(0.001);
    this.badges.scale.setScalar(0.001);
    this.chest.scale.setScalar(0.001);
    this.orb.visible = this.badges.visible = this.chest.visible = false;
  }

  /* -------------------------------------------------- slide focus API */
  setSlide(index, gsap) {
    this.activeSlide = index;
    const show = (group, opts) => {
      group.visible = true;
      gsap.to(group.scale, { x: opts.s, y: opts.s, z: opts.s, duration: 1.1, ease: "elastic.out(0.7,0.6)" });
      gsap.to(group.position, { x: opts.x, y: opts.y, z: opts.z || 0, duration: 1.0, ease: "power3.out" });
    };
    const hide = (group) => {
      if (!group.visible) return;
      gsap.to(group.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.6, ease: "power3.in",
        onComplete: () => { if (group !== this.orb || (this.activeSlide !== 0 && this.activeSlide !== 1)) group.visible = false; } });
    };

    // Camera + hero choreography per slide
    if (index === 0) {
      show(this.orb, { s: 0.92, x: 0, y: 2.9, z: -1 });
      hide(this.badges); this._resetChest(gsap); hide(this.chest);
      this._camTo(gsap, 0, 0.7, 13);
    } else if (index === 1) {
      // quote: push orb to the right, calmer
      show(this.orb, { s: 0.78, x: 4.7, y: 0.3, z: -1 });
      hide(this.badges); this._resetChest(gsap); hide(this.chest);
      this._camTo(gsap, -0.6, 0, 12.5);
    } else if (index === 2) {
      show(this.badges, { s: 0.82, x: 0, y: -3.7, z: -0.5 });
      hide(this.orb); this._resetChest(gsap); hide(this.chest);
      this._camTo(gsap, 0, 0.4, 13.5);
    } else if (index === 3) {
      show(this.chest, { s: 0.92, x: 0, y: -2.7, z: 0 });
      hide(this.orb); hide(this.badges);
      this._openChest(gsap);
      this._camTo(gsap, 0, -0.1, 12.8);
    }
  }

  _camTo(gsap, x, y, z) {
    this.camBase = { x, y, z };
    gsap.to(this.camera.position, { x, y, z, duration: 1.3, ease: "power3.inOut" });
  }

  _openChest(gsap) {
    const c = this.chest;
    gsap.to(c.userData.lid.rotation, { x: -2.15, duration: 1.2, ease: "back.out(1.6)", delay: 0.35 });
    gsap.to(c.userData.innerLight, { intensity: 90, duration: 0.9, delay: 0.5 });
    gsap.to(c.userData.treasure.material, { opacity: 0.9, duration: 0.8, delay: 0.5 });
    // launch burst
    gsap.delayedCall(0.6, () => {
      c.userData.bursting = true;
      this.burstParts.forEach((p, i) => {
        p.visible = true;
        p.position.set((Math.random() - 0.5) * 1.6, 0, (Math.random() - 0.5) * 1.0);
        p.userData.life = 0;
      });
    });
  }

  _resetChest(gsap) {
    const c = this.chest;
    if (!c) return;
    c.userData.bursting = false;
    c.userData.lid.rotation.x = 0;
    c.userData.innerLight.intensity = 0;
    c.userData.treasure.material.opacity = 0;
    this.burstParts.forEach((p) => (p.visible = false));
  }

  /* -------------------------------------------------- events */
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
  }

  /* -------------------------------------------------- render loop */
  start() {
    const tick = () => {
      this._frame();
      this.renderer.render(this.scene, this.camera);
      this._raf = requestAnimationFrame(tick);
    };
    tick();
  }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed = (this.elapsed || 0) + dt;
    const t = this.elapsed;

    // pointer easing -> parallax
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * 0.05;
    if (this.camBase) {
      this.camera.position.x = this.camBase.x + this.pointer.x * 0.8;
      this.camera.position.y = this.camBase.y - this.pointer.y * 0.6;
    }
    this.camera.lookAt(0, this.camBase ? this.camBase.y * 0.2 : 0, 0);

    // stars + nebula
    if (this.stars) {
      this.stars.material.uniforms.uTime.value = t;
      this.stars.rotation.y = t * 0.012;
      this.stars.rotation.x = Math.sin(t * 0.05) * 0.04;
    }
    if (this.nebula) {
      this.nebula.children.forEach((s) => {
        s.material.opacity = (s.userData.baseO ?? s.material.opacity);
        s.position.y += Math.sin(t * 0.3 + s.userData.phase) * 0.002;
      });
      this.nebula.rotation.z = Math.sin(t * 0.03) * 0.05;
    }

    // bokeh drift
    if (this.bokeh) {
      this.bokeh.children.forEach((m) => {
        m.position.y = m.userData.baseY + Math.sin(t * m.userData.sp + m.userData.ph) * 0.6;
        m.rotation.x += m.userData.rot * dt;
        m.rotation.y += m.userData.rot * dt * 0.8;
      });
    }

    // orb
    if (this.orb && this.orb.visible) {
      this.orb.rotation.y = t * 0.18;
      this.orb.userData.lobes.rotation.y = -t * 0.25;
      this.orb.userData.lobes.rotation.x = Math.sin(t * 0.3) * 0.2;
      this.orb.userData.ring.rotation.z = t * 0.1;
      this.orb.userData.beads.children.forEach((b) => {
        b.userData.a += b.userData.sp * dt;
        const { a, r, tilt } = b.userData;
        b.position.set(Math.cos(a) * r, Math.sin(a) * tilt * r * 0.4, Math.sin(a) * r);
      });
    }

    // badges
    if (this.badges && this.badges.visible) {
      this.badgeMeshes.forEach((b) => {
        b.position.y = b.userData.baseY + Math.sin(t * 0.9 + b.userData.ph) * 0.18;
        b.rotation.y = Math.sin(t * 0.5 + b.userData.ph) * 0.35;
        b.rotation.x = Math.cos(t * 0.4 + b.userData.ph) * 0.1;
      });
    }

    // chest burst
    if (this.chest && this.chest.visible) {
      this.chest.rotation.y = Math.sin(t * 0.3) * 0.12;
      if (this.chest.userData.bursting) {
        this.burstParts.forEach((p) => {
          if (!p.visible) return;
          p.userData.life += dt;
          p.userData.vy -= 0.16 * dt; // gravity
          p.position.x += p.userData.vx;
          p.position.y += p.userData.vy;
          p.position.z += p.userData.vz;
          p.rotation.x += p.userData.spin;
          p.rotation.y += p.userData.spin;
          if (p.position.y < -0.2 && p.userData.vy < 0) {
            // recycle for a continuous gentle fountain
            p.position.set((Math.random() - 0.5) * 1.6, 0, (Math.random() - 0.5) * 1.0);
            p.userData.vy = 0.10 + Math.random() * 0.12;
          }
        });
      }
    }
  }
}
