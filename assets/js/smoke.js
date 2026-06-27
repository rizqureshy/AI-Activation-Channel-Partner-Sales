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

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * (uRes.x / uRes.y), uv.y) * 2.4;
  float t = uTime * 0.045;

  // domain warping: fold the noise field through itself for smoky tendrils
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.6 * q + vec2(1.7, 9.2) + 0.15 * t),
                fbm(p + 3.6 * q + vec2(8.3, 2.8) - 0.12 * t));
  float f = fbm(p + 3.8 * r);

  // bright liquid palette
  vec3 pink   = vec3(1.00, 0.30, 0.72);
  vec3 violet = vec3(0.42, 0.36, 1.00);
  vec3 teal   = vec3(0.09, 0.78, 0.71);
  vec3 blue   = vec3(0.17, 0.53, 1.00);
  vec3 gold   = vec3(1.00, 0.78, 0.27);

  // pick the dye colour from the warp vectors so different "drops" differ
  vec3 ink = mix(violet, pink,  clamp(length(q) * 1.1, 0.0, 1.0));
  ink = mix(ink, teal,   clamp(length(r) * 1.2, 0.0, 1.0));
  ink = mix(ink, blue,   clamp(0.6 * r.x + 0.4 * q.y, 0.0, 1.0));
  ink = mix(ink, gold,   clamp(f * f * 1.2 - 0.25, 0.0, 1.0));

  // clear water base, faintly cool
  vec3 water = vec3(0.95, 0.965, 0.99);

  // density of dye in the water — translucent, with brighter cores
  float d = smoothstep(0.32, 1.05, f + 0.35 * length(r));
  vec3 col = mix(water, ink, d * 0.92);
  col += 0.18 * smoothstep(0.85, 1.25, f + 0.3 * length(q)) * ink;   // luminous cores

  // a gentle top-down light so the water feels lit
  col *= 1.0 - 0.10 * (uv.y - 0.5);
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export class Smoke {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    this._raf = null;
    this._t0 = null;
    this._scale = 0.6;                       // render below native res — it's soft anyway
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

  start() {
    if (!this.ok || this._raf) return;
    const gl = this.gl;
    const tick = (now) => {
      if (this._t0 == null) this._t0 = now;
      const t = (now - this._t0) / 1000;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.useProgram(this.prog);
      gl.bindVertexArray(this.vao);
      gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  }
}
