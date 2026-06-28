/* =====================================================================
   Smoke / ink-in-water engine — light theme only.

   A full-screen WebGL2 fragment shader that paints slowly flowing clouds
   of bright liquid colour, the way dye blooms and diffuses when dropped
   into clear water. Built with domain-warped fractal Brownian motion
   (fbm) — no particles, no three.js. Rendered at reduced resolution and
   softened, because the look is meant to be dreamy, not crisp.

   Usage:
     const smoke = new Smoke(canvasEl);
     smoke.start();   // begins the animation loop
     smoke.stop();    // pauses it (keeps the GL context)
   ===================================================================== */

const VERT = `#version 300 es
precision highp float;
const vec2 verts[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
void main(){ gl_Position = vec4(verts[gl_VertexID], 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uBurst;     // 0..1 — temporarily churns the cloud on page change
out vec4 fragColor;

float hash(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1,0));
  float c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
const mat2 M = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 6; i++){ v += a * noise(p); p = M * p; a *= 0.5; }
  return v;
}
// "billow" turbulence — abs() of signed noise stacks into puffy, cauliflower
// shapes, the structure you see in real ink clouds and smoke.
float turb(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 6; i++){ v += a * abs(2.0 * noise(p) - 1.0); p = M * p; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 c = uv - vec2(0.5, 0.52);
  c.x *= asp;                                  // aspect-correct, centred
  float t = uTime * 0.03;

  // slow domain warp drives the big rolling motion of the cloud; on a page
  // change uBurst swells the warp so the mass churns and rearranges itself.
  vec2 p = c * 1.55;
  float wamp = 1.0 + uBurst * 2.2;
  vec2 warp = wamp * vec2(fbm(p * 0.6 + vec2(0.0, t)), fbm(p * 0.6 + vec2(4.3, -t) + 5.0));

  // a big, thick billowing mass + a wide falloff so it stays a cloud in clear water
  float billow = turb(p * 1.3 + warp * 1.5 + vec2(t * 0.5, -t));
  float rad = length(c * vec2(0.8, 0.98));
  float fall = smoothstep(1.45, 0.05, rad);
  float d = smoothstep(0.28, 0.72, billow) * fall;

  // finer tendrils feathering off the edges of the mass
  float fine = turb(p * 3.6 + warp * 2.4 - vec2(t * 1.3, t));
  d += 0.34 * smoothstep(0.55, 0.92, fine) * fall * smoothstep(0.02, 0.4, d + 0.22);
  d = clamp(d, 0.0, 1.0);

  // which dye colours bloom where (a few bright liquids, cool-leaning like the ref)
  float hsel = fbm(p * 0.7 + warp + 12.0);
  vec3 blue    = vec3(0.10, 0.52, 0.94);
  vec3 cyan    = vec3(0.16, 0.80, 0.96);
  vec3 violet  = vec3(0.42, 0.32, 0.98);
  vec3 magenta = vec3(0.98, 0.30, 0.72);
  vec3 ink = mix(blue, cyan, smoothstep(0.18, 0.42, hsel));
  ink = mix(ink, violet,  smoothstep(0.48, 0.68, hsel));
  ink = mix(ink, magenta, smoothstep(0.76, 0.96, hsel));

  // depth: pale, translucent wisps at the edges → deep saturated cores
  vec3 edge = mix(vec3(1.0), ink, 0.85);
  vec3 core = ink * 0.40;
  vec3 inkShaded = mix(edge, core, smoothstep(0.28, 0.95, d));

  vec3 water = vec3(1.0);                       // clear water
  float alpha = smoothstep(0.0, 0.22, d);       // dense — ink reads strongly against the white
  vec3 col = mix(water, inkShaded, alpha);
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export class Smoke {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    this._raf = null;
    this._last = null;
    this._flow = 0;                          // accumulated flow time (advances fast during a burst)
    this._burst = 0;                         // 0..1 churn envelope, kicked on page change
    this._bt = Infinity;                     // seconds since the last burst started
    this._burstDur = 2.8;                    // how long the churn takes to fully settle
    this._scale = 0.8;                       // render a bit below native res (perf), still keeps tendrils
    if (!this.gl) { this.ok = false; return; }
    this.ok = this._build();
    if (this.ok) {
      this._onResize = () => this.resize();
      window.addEventListener("resize", this._onResize);
      this.resize();
    }
  }

  _compile(type, src) {
    const gl = this.gl, s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("Smoke shader error:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  _build() {
    const gl = this.gl;
    const vs = this._compile(gl.VERTEX_SHADER, VERT);
    const fs = this._compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("Smoke link error:", gl.getProgramInfoLog(prog));
      return false;
    }
    this.prog = prog;
    this.vao = gl.createVertexArray();        // empty VAO; verts come from the shader
    this.uRes = gl.getUniformLocation(prog, "uRes");
    this.uTime = gl.getUniformLocation(prog, "uTime");
    this.uBurst = gl.getUniformLocation(prog, "uBurst");
    return true;
  }

  resize() {
    if (!this.ok) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(2, Math.floor(window.innerWidth * dpr * this._scale));
    const h = Math.max(2, Math.floor(window.innerHeight * dpr * this._scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
    }
  }

  /** Kick a quick churn: the cloud morphs/rearranges, then settles. */
  burst() { this._bt = 0; }

  start() {
    if (!this.ok || this._raf) return;
    const gl = this.gl;
    const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const ATT = 0.12;                        // brief smooth attack, then a long smooth release
    const tick = (now) => {
      const dt = this._last == null ? 0.016 : Math.min(0.05, (now - this._last) / 1000);
      this._last = now;
      // burst envelope: smooth ramp up then ease all the way down to zero with
      // zero slope at the end, so the flow decelerates gently (no sudden stop).
      this._bt += dt;
      const u = this._bt / this._burstDur;
      this._burst = u >= 1 ? 0
        : (u < ATT ? smoothstep(0, ATT, u) : 1 - smoothstep(ATT, 1, u));
      const speed = 1.0 + this._burst * 6.0;
      this._flow += dt * speed;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.useProgram(this.prog);
      gl.bindVertexArray(this.vao);
      gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uTime, this._flow);
      gl.uniform1f(this.uBurst, this._burst);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    this._last = null;
    this._bt = Infinity;     // don't resume mid-churn next time
  }
}
