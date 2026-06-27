/* ============================================================
   CRO AI Activation Community — site controller
   Hash-routed multi-page site over the living particle engine.
   The WebGL field persists across pages and morphs per route.
   ============================================================ */

import { Cosmos } from "./scene.js";
import { Smoke } from "./smoke.js";
const gsap = window.gsap;

const cosmos = new Cosmos(document.getElementById("bg-canvas"));
cosmos.start();
cosmos.uniforms.uFade.value = 0.62;   // calmer backdrop so content always reads

/* external destinations */
const VIVA_URL = "https://engage.cloud.microsoft/main/org/equinix.com/groups/eyJfdHlwZSI6Ikdyb3VwIiwiaWQiOiIyMTA0NzYxMjgxNTExNDI0In0";
const PORTFOLIO_URL = "https://rizqureshy.github.io/AI-April-Portfolio/";
const RAW = "https://raw.githubusercontent.com/rizqureshy/AI-April-Portfolio/main/";
const rawUrl = (path) => RAW + encodeURI(path);

/* ---------------- tiny view helpers ---------------- */
const PATHS = {
  star: "M12 2l2.6 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.4z",
  users: "M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.7 0-8 1.3-8 4v3h9v-3c0-1 .4-1.9 1-2.6A12 12 0 0 0 8 13zm8 0c-.4 0-.9 0-1.4.1A5 5 0 0 1 17 17v3h7v-3c0-2.7-5.3-4-8-4z",
  share: "M18 16a3 3 0 0 0-2.4 1.2l-7-3.5a3 3 0 0 0 0-1.4l7-3.5a3 3 0 1 0-.8-2L8 10.3a3 3 0 1 0 0 3.4l7 3.5A3 3 0 1 0 18 16z",
  grid: "M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z",
  book: "M5 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2z",
  chat: "M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1z",
  shield: "M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3zm-1.2 13.4l5-5-1.4-1.4-3.6 3.6-1.6-1.6-1.4 1.4 3 3z",
  bolt: "M13 2L3 14h7l-1 8 10-12h-7z",
  key: "M14 2a6 6 0 0 0-5.7 8L2 16.3V22h5.7l.6-.6V19h2.4l.6-.6V16h2l.4-.4A6 6 0 1 0 14 2zm2.5 3.5a1.5 1.5 0 1 1-1.5 1.5 1.5 1.5 0 0 1 1.5-1.5z",
  bell: "M12 2a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 0 0-6-6zm0 20a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22z",
  calendar: "M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zM5 9h14v10H5V9z",
  bulb: "M9 21h6v-1H9v1zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",
  trophy: "M7 4h10v2h3v3a4 4 0 0 1-4 4 5 5 0 0 1-2 2.6V18h3v2H7v-2h3v-2.4A5 5 0 0 1 8 13a4 4 0 0 1-4-4V6h3V4zm0 4H6v1a2 2 0 0 0 1 1.7V8zm10 0v2.7A2 2 0 0 0 18 9V8h-1z",
  heart: "M12 21S4 14 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5C20 14 12 21 12 21z",
  check: "M9 16.2l-3.5-3.5L4 14.2 9 19.2 20 8.2l-1.5-1.4z",
  spark: "M12 2l2.6 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.4z",
  play: "M8 5v14l11-7z",
  rocket: "M14 3c3 .3 5.4 2.7 5.7 5.7.2 2.4-1.4 5-4.7 7.3l-.6 4-3-1.8-3-1.8 2.2-3.4C8.6 7.8 11.2 6.2 13.6 6.4M6 16c-1.2 1-1.5 3-1.5 4.5C6 20.5 8 20.2 9 19",
};
const ic = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${PATHS[n] || PATHS.spark}"/></svg>`;

const PAL = [
  { ic: "linear-gradient(135deg,#2b88ff,#6b5bff)", ac: "#2b88ff" },
  { ic: "linear-gradient(135deg,#ff8a3d,#e3008c)", ac: "#ff8a3d" },
  { ic: "linear-gradient(135deg,#18c8b6,#2b88ff)", ac: "#18c8b6" },
  { ic: "linear-gradient(135deg,#9b4dff,#6b5bff)", ac: "#9b4dff" },
  { ic: "linear-gradient(135deg,#22c55e,#18c8b6)", ac: "#22c55e" },
  { ic: "linear-gradient(135deg,#ffd23d,#ff8a3d)", ac: "#ffd23d" },
];

function iconCards(items, cols = 3) {
  return `<div class="grid c${cols}">` + items.map((it, i) => {
    const c = PAL[i % PAL.length];
    return `<article class="card reveal"><div class="ic" style="--ic:${c.ic};--ac:${c.ac}">${ic(it.icon || "spark")}</div>` +
      `<h3>${it.t}</h3>${it.p ? `<p>${it.p}</p>` : ""}` +
      `${it.link ? `<a class="link" href="${it.link}">${it.linkText || "Open"} →</a>` : ""}</article>`;
  }).join("") + `</div>`;
}
function numCards(items, cols = 3) {
  return `<div class="grid c${cols}">` + items.map((it, i) => {
    const c = PAL[i % PAL.length];
    const t = typeof it === "string" ? it : it.t;
    const p = typeof it === "string" ? "" : (it.p || "");
    return `<article class="card reveal"><div class="num" style="--ic:${c.ic}">${i + 1}</div><h3>${t}</h3>${p ? `<p>${p}</p>` : ""}</article>`;
  }).join("") + `</div>`;
}
const olist = (items) => `<ol class="olist reveal">` + items.map((t) => `<li>${t}</li>`).join("") + `</ol>`;
const bullets = (items) => `<ul class="bullets reveal">` + items.map((t) => `<li>${t}</li>`).join("") + `</ul>`;
const pills = (items) => `<div class="pills reveal">` + items.map((t) => `<span class="pill">${t}</span>`).join("") + `</div>`;

function ctas(arr) {
  return `<div class="cta-row reveal">` + arr.map((c) => {
    const inner = `${c.svg ? ic(c.svg) : ""}${c.t}`;
    if (c.scroll) return `<button class="btn ${c.k || "ghost"}" data-scroll="${c.scroll}">${inner}</button>`;
    if (c.toast) return `<button class="btn ${c.k || "ghost"}" data-toast="${c.toast}">${inner}</button>`;
    const ext = c.h && /^https?:/.test(c.h) ? ` target="_blank" rel="noopener"` : "";
    return `<a class="btn ${c.k || "ghost"}" href="${c.h || "#/home"}"${ext}>${inner}</a>`;
  }).join("") + `</div>`;
}

function block({ kicker, title, lead, inner = "", panel, warm, id }) {
  return `<section class="block"${id ? ` id="${id}"` : ""}>` +
    (panel ? `<div class="panel${warm ? " warm" : ""}">` : "") +
    (kicker ? `<span class="kicker reveal"><span class="dot"></span> ${kicker}</span>` : "") +
    (title ? `<h2 class="reveal">${title}</h2>` : "") +
    (lead ? `<p class="lead reveal">${lead}</p>` : "") +
    inner +
    (panel ? `</div>` : "") +
    `</section>`;
}

function morphCard(phrases) {
  // one centered line that morphs through each phrase; because it's centered,
  // the leading word ("You" / "Your") shifts position as the phrase changes
  return `<div class="manifesto morph" aria-label="${phrases.join(" ")}">` +
    phrases.map((w, i) => `<span class="mph m${i % 6}${i === phrases.length - 1 ? " mph-you" : ""}" style="--i:${i}" aria-hidden="true">${w}</span>`).join("") +
  `</div>`;
}

/* one-line vertical "slot" rotator — phrases swap in place so it stays a single line */
function rotLine(items) {
  const seq = items.concat(items[0]);   // duplicate first for a seamless loop
  return `<p class="frost-rot" aria-label="${items.join(" ")}"><span class="rot"><span class="rot-track">` +
    seq.map((w, i) => `<span class="ri ri${i % items.length}" aria-hidden="true">${w}</span>`).join("") +
  `</span></span></p>`;
}

function hero({ eyebrow, h1, lead, morph, cta }) {
  return `<section class="hero">
    ${eyebrow ? `<span class="eyebrow reveal">${eyebrow}</span>` : ""}
    <h1 class="reveal">${h1}</h1>
    <div class="hero-frost reveal">
      ${lead ? `<p class="hero-sub">${lead}</p>` : ""}
      ${morph ? rotLine(morph) : ""}
    </div>
    ${cta ? ctas(cta) : ""}
  </section>`;
}

/* form builder (presentational demo — submits show a toast) */
function field(f) {
  const id = (f.name || f.l).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (f.t === "checkbox") return `<label class="check"><input type="checkbox" id="${id}"> <span>${f.l}</span></label>`;
  let ctrl;
  if (f.t === "select") ctrl = `<select id="${id}"><option value="" disabled selected>Choose…</option>${(f.opts || []).map((o) => `<option>${o}</option>`).join("")}</select>`;
  else if (f.t === "textarea") ctrl = `<textarea id="${id}" placeholder="${f.ph || ""}"></textarea>`;
  else if (f.t === "file") ctrl = `<input id="${id}" type="file">`;
  else ctrl = `<input id="${id}" type="${f.t || "text"}" placeholder="${f.ph || ""}">`;
  return `<div class="field"><label for="${id}">${f.l}</label>${ctrl}</div>`;
}
const formHTML = (fields, submit) =>
  `<form class="form reveal" data-demo>${fields.map(field).join("")}<div class="cta-row"><button class="btn primary" type="submit">${ic("spark")}${submit}</button></div></form>`;

/* ============================================================
   Navigation
   ============================================================ */
const PRIMARY = [
  ["Home", "#/home"], ["Join the Community", "#/join"], ["Community Champions", "#/recognition"],
  ["AI Events Calendar", "#/calendar"], ["AI Clinic", "#/clinic"], ["Community Gallery", "#/gallery"],
  ["Skill Up, Speed Up", "#/videos"], ["Learning Lanes", "#/learning"], ["AI Activation for Teams", "#/teams"],
];

function buildNav() {
  document.getElementById("primary-nav").innerHTML =
    PRIMARY.map(([t, h]) => `<a href="${h}"${h === "#/join" ? ' class="cta"' : ""}>${t}</a>`).join("");
  document.getElementById("site-footer").innerHTML = `
    <div class="footer-inner">
      <div>
        <h4>CRO AI Activation Community</h4>
        <p class="muted" style="font-size:14px;line-height:1.6;max-width:34ch">Built by the people who participate in it. Come in, share something, learn something, build something.</p>
        <div class="cta-row" style="margin-top:16px"><a class="btn primary sm" href="${VIVA_URL}" target="_blank" rel="noopener">${ic("users")}Join the Community</a></div>
      </div>
      <div>
        <h4>Take part</h4>
        <a href="#/join">Join the Community</a><a href="#/recognition">Community Champions</a>
        <a href="#/gallery">Community Gallery</a><a href="#/calendar">AI Events Calendar</a>
      </div>
      <div>
        <h4>Learn &amp; get help</h4>
        <a href="#/learning">Learning Lanes</a><a href="#/videos">Skill Up, Speed Up</a>
        <a href="#/clinic">AI Clinic</a><a href="#/teams">AI Activation for Teams</a>
      </div>
    </div>
    <div class="footer-bottom">Your AI Story Matters · Your AI Questions Matter · Your AI Work Matters · You Matter</div>`;
}

/* ============================================================
   Pages
   ============================================================ */
const ROUTES = {};

/* ---- Home ---- */
ROUTES.home = {
  title: "Home", formation: "ring",
  html: () => hero({
    eyebrow: "✦ Learn · Share · Experiment · Have fun with AI",
    h1: `CRO <span class="gradient-text">AI Activation</span> Community`,
    lead: "The front door to AI at CRO — where everyone comes together to learn, build, and have fun. No experts required, just curiosity.",
    morph: ["Your Story matters.", "Your Questions matter.", "Your Experiments matter.", "Your Work matters.", "Your Fun matters.", "You matter."],
    cta: [
      { t: "Join the Community", k: "primary", h: "#/join", svg: "users" },
      { t: "Community Projects Gallery", k: "cool", h: "#/gallery", svg: "grid" },
    ],
  })

  + block({
    kicker: "Leadership Messages", title: "A warm welcome from our leaders",
    lead: "This community matters to leadership — and they show up here. Fun, warmth, and a place where every question and every role counts.",
    inner: leaderCards() + ctas([{ t: "Join the Community", k: "primary", h: "#/join", svg: "users" }]),
  }),
};

/* ---- gallery: real work from the AI April sprint (GTM AI Canvas portfolio) ---- */
const SHOTS = [
  { t: "AI Art", author: "Rizwan Qureshy", cat: "AI Art", img: "assets/img/gallery/art-rizwan.jpg" },
  { t: "AI Art", author: "Kelly Grover", cat: "AI Art", img: "assets/img/gallery/art-kelly.jpg" },
  { t: "AI Art", author: "Eamonn Ward", cat: "AI Art", img: "assets/img/gallery/art-eamonn.jpg" },
  { t: "AI Art", author: "Lorna Joiner", cat: "AI Art", img: "assets/img/gallery/art-lorna.jpg" },
  { t: "AI Art", author: "Dalia Osorio", cat: "AI Art", img: "assets/img/gallery/art-dalia.jpg" },
  { t: "AI Art", author: "Calley Hood", cat: "AI Art", img: "assets/img/gallery/art-calley.png" },
  { t: "Veronica's AI Dashboard", author: "Veronica John", cat: "Dashboard", img: "assets/img/gallery/dash-veronica.png" },
  { t: "Partner Enablement Dashboard", author: "Team", cat: "Dashboard", img: "assets/img/gallery/dash-partner.jpg" },
  { t: "AI CRO Strategy Plan", author: "Rizwan Qureshy", cat: "AI Deck", img: "assets/img/gallery/deck-cro-strategy.png" },
  { t: "AI for GTM Enablement Services", author: "Kelly Grover", cat: "AI Deck", img: "assets/img/gallery/deck-gtm-enablement.png" },
  { t: "AI Strategy Deck", author: "Eamonn Ward", cat: "AI Deck", img: "assets/img/gallery/deck-eamonn-strategy.png" },
  { t: "ACE Animation Concept", author: "Team", cat: "Animation", img: "assets/img/gallery/anim-ace.png" },
  { t: "AI Coding", author: "Team", cat: "Course", img: "assets/img/gallery/course-ai-coding.png" },
  { t: "Transform Workflows with Gen AI", author: "Team", cat: "Course", img: "assets/img/gallery/course-transform.png" },
];
const APPS = [
  { t: "Artemis II — Dark Side of the Moon", author: "Rizwan Qureshy", url: "https://artemis-ii-rizqureshy.replit.app/" },
  { t: "AI Essentials Course", author: "Calley Hood", url: "https://aiessentialscourse.netlify.app/" },
  { t: "Order Taker — Partner Simulator", author: "Michael Bourgeois", url: "https://partner-simulator.netlify.app/" },
  { t: "Challenger Sales Coaching", author: "Team", url: "https://id-preview--e21af167-a47d-42ba-a00f-070b0144e10a.lovable.app/" },
  { t: "Team Energy & Focus Dashboard", author: "Calley Hood", url: "https://idbycalley.github.io/Live-Team-Dashboard/" },
  { t: "Build-a-Band: Guitar & Piano", author: "Ashley Mims", url: "https://aprilaibuildaband.netlify.app/" },
  { t: "Pulse Pad Beat Studio", author: "Michael Bourgeois", url: "https://reliable-cassata-1d012c.netlify.app/" },
  { t: "Magic Guitar", author: "Calley Hood", url: "https://strong-daffodil-a46c5c.netlify.app/" },
];
function shotCard(s) {
  return `<article class="card gcard reveal">
    <div class="gthumb"><img loading="lazy" src="${s.img}" alt="${s.t} — ${s.author}"></div>
    <span class="tag">${s.cat}</span>
    <h3>${s.t}</h3>
    <div class="gmeta">${s.author}</div>
    <div class="gactions"><a class="btn cool sm" href="${PORTFOLIO_URL}" target="_blank" rel="noopener">${ic("grid")}Open in 3D Gallery</a></div>
  </article>`;
}
function appCard(a) {
  return `<article class="card gcard reveal">
    <span class="tag">App &amp; Tool</span>
    <h3>${a.t}</h3>
    <div class="gmeta">${a.author}</div>
    <div class="gactions"><a class="btn cool sm" href="${a.url}" target="_blank" rel="noopener">${ic("bolt")}Launch app</a></div>
  </article>`;
}
const galleryPreview = () => `<div class="grid c3">` + SHOTS.slice(0, 3).map(shotCard).join("") + `</div>`;

/* ---- Skill Up, Speed Up: AI video gallery (community AI films) ---- */
/* curated AI learning videos — play inline (embedded), grouped by track + level */
const LEARN_TRACKS = ["Prompt Engineering", "Beyond the Basics", "LLMs & RAG", "AI Agents"];
const TRACK_TAGLINE = {
  "Prompt Engineering": "Write prompts that actually work.",
  "Beyond the Basics": "Understand what's really happening under the hood.",
  "LLMs & RAG": "How models think — and how to ground them in your own data.",
  "AI Agents": "When AI starts taking actions, not just answering.",
};
const LEARN = [
  // Prompt Engineering
  { yt: "jC4v5AS4RIM", t: "The Perfect ChatGPT Prompt Formula", author: "Jeff Su", track: "Prompt Engineering", level: "Basic", len: "8 min" },
  { yt: "_ZvnD73m40o", t: "Prompt Engineering Tutorial — Master ChatGPT & LLMs", author: "freeCodeCamp · Ania Kubów", track: "Prompt Engineering", level: "Beginner → Intermediate", len: "41 min" },
  // Beyond the Basics
  { yt: "wjZofJX0v4M", t: "But what is a GPT? Visual intro to Transformers", author: "3Blue1Brown", track: "Beyond the Basics", level: "Intermediate", len: "27 min" },
  { yt: "zjkBMFhNj_g", t: "Intro to Large Language Models (1-hour talk)", author: "Andrej Karpathy", track: "Beyond the Basics", level: "Intermediate", len: "1 hr" },
  { yt: "eMlx5fFNoYc", t: "Attention in Transformers, Visually Explained", author: "3Blue1Brown", track: "Beyond the Basics", level: "Advanced", len: "26 min" },
  // LLMs & RAG
  { yt: "T-D1OfcDW1M", t: "What is Retrieval-Augmented Generation (RAG)?", author: "IBM Technology", track: "LLMs & RAG", level: "Basic", len: "7 min" },
  { yt: "sVcwVQRHIc8", t: "Learn RAG From Scratch (Python + LangChain)", author: "freeCodeCamp", track: "LLMs & RAG", level: "Advanced", len: "2.5 hr" },
  { yt: "7xTGNNLPyMI", t: "Deep Dive into LLMs like ChatGPT", author: "Andrej Karpathy", track: "LLMs & RAG", level: "Advanced", len: "3.5 hr" },
  // AI Agents
  { yt: "F8NKVhkZZWI", t: "What are AI Agents?", author: "IBM Technology", track: "AI Agents", level: "Basic", len: "12 min" },
];

/* community-made AI films (play inline too) */
const VIDEOS = [
  { t: "AI Super Hero", author: "Community", file: "assets/animations/AI Super Hero.mp4", tag: "AI Film" },
  { t: "Beyond the Chalkboard", author: "Community", file: "assets/animations/Beyond_the_Chalkboard.mp4", tag: "AI Film" },
  { t: "Did It My Way", author: "Rizwan Qureshy", file: "assets/animations/Did it my Way - Rizwan Qureshy.mp4", tag: "AI Music Film" },
  { t: "Number 1 and Nothing Less", author: "Rizwan Qureshy", file: "assets/animations/Number 1 and Nothing Less - Rizwan Qureshy.mp4", tag: "AI Music Film" },
  { t: "Folding Worries", author: "Community", file: "assets/animations/Folding_Worries.mp4", tag: "AI Film" },
  { t: "AI Eamonn", author: "Eamonn Ward", file: "assets/animations/AI Eamonn.mp4", tag: "AI Avatar" },
];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const LEVEL_CLASS = { "Basic": "lv-basic", "Beginner → Intermediate": "lv-inter", "Intermediate": "lv-inter", "Advanced": "lv-adv" };

function learnCard(v) {
  return `<article class="card vcard reveal">
    <button class="vthumb" data-video="${v.yt}" aria-label="Play ${v.t}">
      <img src="https://i.ytimg.com/vi/${v.yt}/hqdefault.jpg" alt="" loading="lazy" onerror="this.style.display='none'">
      <span class="vplay">${ic("play")}</span>
      <span class="vlen">${v.len}</span>
    </button>
    <span class="tag ${LEVEL_CLASS[v.level] || ""}">${v.level}</span>
    <h3>${v.t}</h3>
    <div class="gmeta">${v.author}</div>
  </article>`;
}
function videoCard(v) {
  return `<article class="card vcard reveal">
    <button class="vthumb noimg" data-file="${rawUrl(v.file)}" aria-label="Play ${v.t}"><span class="vplay">${ic("play")}</span></button>
    <span class="tag">${v.tag}</span>
    <h3>${v.t}</h3>
    <div class="gmeta">${v.author}</div>
  </article>`;
}
const videosPreview = () => `<div class="grid c3">` + VIDEOS.slice(0, 3).map(videoCard).join("") + `</div>`;

/* ---- leadership messages ---- */
const LEADERS = [
  {
    name: "Martyn Langley", role: "CRO AI Activation Community Sponsor", img: "assets/img/leaders/martyn.jpg",
    msg: "AI shouldn't feel like a test you're afraid to fail — it should feel like play. Bring your curiosity, your half-finished ideas, and yes, your &ldquo;silly&rdquo; questions. There are none. This is where we experiment out loud, learn from each other, and have real fun building what's next. You belong here, exactly as you are.",
  },
  {
    name: "Shane Paladin", role: "CRO AI Activation Community Sponsor", img: "assets/img/leaders/shane.jpg",
    msg: "The exciting thing about this new world of AI is that everyone gets to be a beginner again — together. Share what you tried, even when it broke. Ask the expert. Help the next person. Every role, every team, every voice makes us stronger. You're not a spectator here; you are what makes this community come alive.",
  },
  {
    name: "Eamonn Ward", role: "CRO AI Activation Community Sponsor", img: "assets/img/leaders/eamonn-ward.jpg",
    msg: "This is your space. Whether you're writing your first prompt or activating your whole team, there's room for you — and your story matters. Don't wait until you feel &ldquo;ready.&rdquo; Jump in, connect, and let's discover what AI can do for our customers and for each other. Warmth over fear, progress over perfection, community over going it alone.",
  },
];
const leaderCards = () => `<div class="grid c3">` + LEADERS.map((l) => `
  <article class="card leader reveal">
    <img class="lphoto" loading="lazy" src="${l.img}" alt="${l.name}">
    <div class="lwho"><h3>${l.name}</h3><span>${l.role}</span></div>
    <p class="lmsg">${l.msg}</p>
  </article>`).join("") + `</div>`;

/* ---- certification map + voices (6 people, 6 certs from the AI Enablement session) ---- */
const CERTS = [
  { img: "assets/img/certs/eduardo-deeplearning.jpg", issuer: "DeepLearning.AI", title: "AI For Everyone", who: "Eduardo", level: "Beginner" },
  { img: "assets/img/certs/microsoft-ai-business.webp", issuer: "Microsoft", title: "AI Business Professional", who: "Elena", level: "Beginner" },
  { img: "assets/img/certs/justin-databricks.png", issuer: "Databricks", title: "AI Agent Fundamentals", who: "Justin", level: "Intermediate" },
  { img: "assets/img/certs/michael-utaustin.webp", issuer: "UT Austin", title: "Generative AI for Business Applications", who: "Michael", level: "Intermediate" },
  { img: "assets/img/certs/shiran-kmi.webp", issuer: "KM Institute", title: "Certified AI Manager", who: "Shiran", level: "Intermediate" },
  { img: "assets/img/certs/rizwan-ieee-aiethics.webp", issuer: "IEEE", title: "CertifAIEd — AI Ethics Professional", who: "Rizwan", level: "Advanced" },
];
const CERTFOLKS = [
  { name: "Eduardo", photo: "assets/img/presenters/eduardo.jpg", cert: "DeepLearning.AI · AI For Everyone", quote: "Start broad. This gave me the language to talk about AI with any team — no code required. If you're wondering where to begin, begin here." },
  { name: "Elena", photo: "assets/img/presenters/elena.jpg", cert: "Microsoft · AI Business Professional", quote: "Practical and role-focused. I prepped in short evening sessions over a few weeks — totally doable alongside the day job." },
  { name: "Justin", photo: "assets/img/presenters/justin.jpg", cert: "Databricks · AI Agent Fundamentals", quote: "I wanted to understand agents beyond the hype. The hands-on labs made it click. Build one small agent and you're hooked." },
  { name: "Michael", photo: "assets/img/presenters/michael.jpg", cert: "UT Austin · Generative AI for Business", quote: "This connected AI to real business decisions. My advice: pick a real problem from your week and learn against that." },
  { name: "Shiran", photo: "assets/img/presenters/shiran.jpg", cert: "KM Institute · Certified AI Manager", quote: "It reframed AI as a management discipline, not just a tool — perfect if you're leading people through change." },
  { name: "Rizwan", photo: "assets/img/presenters/rizwan.png", cert: "IEEE · CertifAIEd AI Ethics", quote: "Ethics turned out to be the most human part of AI. What surprised me was how much it applies to everyday decisions, not just policy." },
];
const certMap = () => `<div class="grid c3">` + CERTS.map((c) => `
  <article class="card certcard reveal">
    <div class="cthumb"><img loading="lazy" src="${c.img}" alt="${c.issuer} — ${c.title}"></div>
    <span class="tag">${c.issuer} · ${c.level}</span>
    <h3>${c.title}</h3>
    <div class="gmeta">Earned by ${c.who}</div>
  </article>`).join("") + `</div>`;
const certVoices = () => `<div class="grid c3">` + CERTFOLKS.map((p) => `
  <article class="card folk reveal">
    <div class="fhead"><img class="favatar" loading="lazy" src="${p.photo}" alt="${p.name}"><div><h3>${p.name}</h3><span>${p.cert}</span></div></div>
    <p class="fquote">&ldquo;${p.quote}&rdquo;</p>
  </article>`).join("") + `</div>`;

/* ---- Join ---- */
ROUTES.join = {
  title: "Join the Community", formation: "heart",
  html: () => hero({
    eyebrow: "✦ Join the Community",
    h1: `You <span class="gradient-text">belong</span> here`,
    lead: "This community is for everyone across CRO. No perfect prompt required, no expert badge needed — just come in.",
    morph: ["Go ahead — ask away.", "Just say hi.", "Tell us what excites you.", "What do you want to know?", "What do you want to share?", "Want to organize a huddle?"],
    cta: [{ t: "Join the Viva Engage Community", k: "primary", h: VIVA_URL, svg: "users" }],
  })

  + block({
    inner: iconCards([
      { t: "You're welcome", p: "Exactly as you are — beginner or builder, every role counts.", icon: "heart" },
      { t: "You're celebrated", p: "Wins big and small get cheered on, out loud.", icon: "star" },
      { t: "You're recognized", p: "Earn stars and rise to Community Champion.", icon: "trophy" },
      { t: "You get the spotlight", p: "Your work and your story get featured.", icon: "bolt" },
    ], 4),
  })

  + block({
    kicker: "Our Promise", panel: true, warm: true,
    title: "What you can count on",
    inner: bullets([
      "You will be <b>heard</b> — your ideas reach a leadership-visible channel.",
      "You will be <b>helped</b> — no question is ever too small.",
      "You will be <b>celebrated</b> — and recognized for showing up.",
      "Curiosity counts more than expertise. Always.",
    ]) + ctas([{ t: "Join the Viva Engage Community", k: "primary", h: VIVA_URL, svg: "users" }]),
  }),
};

/* ---- Gallery ---- */
ROUTES.gallery = {
  title: "Community Gallery", formation: "grid",
  html: () => block({
    kicker: "Community Gallery", title: "Real work from real people",
    lead: "A living showcase from the community's AI April sprint — apps, AI art, dashboards, strategy decks, animations, and courses. Explore it as a 3D living canvas, or browse the highlights below.",
    inner: ctas([{ t: "Open the 3D Portfolio Gallery", k: "primary", h: PORTFOLIO_URL, svg: "grid" }, { t: "Share in Viva Engage", k: "cool", h: VIVA_URL, svg: "share" }])
      + pills(["AI Art", "Dashboards", "AI Decks", "Apps & Tools", "Animations", "Courses", "Customer workflow", "Productivity", "Beginner friendly", "Advanced"]),
  })
  + block({ kicker: "Highlights", title: "Art, dashboards, decks &amp; more", inner: `<div class="grid c3">` + SHOTS.map(shotCard).join("") + `</div>` })
  + block({ kicker: "Apps & Tools", title: "Things you can launch right now", lead: "Real working apps the community built with AI — open them and try.", inner: `<div class="grid c3">` + APPS.map(appCard).join("") + `</div>` })
  + block({ panel: true, title: "Have something to add?", lead: "The gallery grows when you contribute. Share your prompt, workflow, demo, app, or story in the community.", inner: ctas([{ t: "Share in Viva Engage", k: "primary", h: VIVA_URL, svg: "share" }, { t: "Open the 3D Gallery", h: PORTFOLIO_URL, svg: "grid" }]) }),
};

/* ---- Skill Up, Speed Up (curated AI learning videos, embedded playback) ---- */
ROUTES.videos = {
  title: "Skill Up, Speed Up", formation: "play",
  html: () => hero({
    eyebrow: "✦ Skill Up, Speed Up",
    h1: `Learn AI, <span class="gradient-text">fast</span>`,
    lead: "A curated path from your first prompt to building agents — basic, intermediate, and advanced. Click any video and it plays right here, no leaving the page.",
    cta: [{ t: "Start with Prompt Engineering", k: "primary", scroll: slug("Prompt Engineering"), svg: "play" }],
  })
  + LEARN_TRACKS.map((tr) => block({
      id: slug(tr), kicker: tr, title: TRACK_TAGLINE[tr],
      inner: `<div class="grid c3">` + LEARN.filter((v) => v.track === tr).map(learnCard).join("") + `</div>`,
    })).join("")
  + block({
    kicker: "Made by our community", title: "AI films from the community",
    lead: "Short creative films, music videos, and avatars our community made with AI. They play here too.",
    inner: `<div class="grid c3">` + VIDEOS.map(videoCard).join("") + `</div>`,
  })
  + block({
    panel: true, title: "Got a video to add?",
    lead: "Found a great AI explainer, or made one yourself? Share it with the community and we'll add it to the library.",
    inner: ctas([{ t: "Share a Video in Viva Engage", k: "primary", h: VIVA_URL, svg: "play" }, { t: "Browse the Community Gallery", h: "#/gallery", svg: "grid" }]),
  }),
};

/* ---- Learning Lanes: the GTM Ops AI Upskilling Pathway ---- */
const PATHWAY = [
  {
    tier: "Tier 1", tierTitle: "Proficiency floor", who: "Broad · for everyone",
    courses: [
      {
        idx: "01", t: "Google AI Essentials", prov: "Google · via Coursera (Grow with Google)",
        tags: [{ l: "Paid certificate" }, { l: "~$49 per person" }, { l: "~10 hours · self-paced" }],
        link: { url: "https://www.coursera.org/specializations/ai-essentials-google", label: "coursera.org/specializations/ai-essentials-google" },
        cost: "Certificate requires a paid Coursera subscription, about $49 per person. Not covered by an Equinix license.",
        outcome: "Universal generative-AI fluency: prompting, productivity, and responsible use across tools. Every operator can offload routine work and prompt with intent.",
      },
      {
        idx: "02", t: "Career Essentials in Generative AI", prov: "Microsoft and LinkedIn",
        tags: [{ l: "Free · LinkedIn Enterprise", free: true }, { l: "~4 to 5 hours" }, { l: "Certificate included" }],
        link: { url: "https://www.linkedin.com/learning/paths/career-essentials-in-generative-ai-by-microsoft-and-linkedin", label: "linkedin.com/learning · Career Essentials in Generative AI" },
        cost: "Free under the Equinix LinkedIn Learning Enterprise license, certificate included.",
        outcome: "Stack-aligned adoption: Copilot inside Word, Excel, Outlook, Teams and PowerPoint, plus GenAI fundamentals and ethics. Proficiency on the tools the team already has.",
      },
      {
        idx: "03", t: "Generative AI for Everyone", prov: "DeepLearning.AI (Andrew Ng) · via Coursera",
        tags: [{ l: "Paid certificate" }, { l: "~$49 per person" }, { l: "~5 hours · self-paced" }],
        link: { url: "https://www.coursera.org/learn/generative-ai-for-everyone", label: "coursera.org/learn/generative-ai-for-everyone" },
        cost: "Certificate requires a paid Coursera subscription, about $49 per person. Not covered by an Equinix license.",
        outcome: "Opportunity spotting and strategy: identify and scope where AI creates leverage across workflows. For the people who lead initiatives, not just use the tools.",
      },
    ],
  },
  {
    tier: "Tier 2", tierTitle: "Microsoft certifications", who: "Recognized credentials",
    courses: [
      {
        idx: "04", t: "Microsoft Certified: AI Business Professional", prov: "Microsoft · Exam AB-730 · practitioner level",
        tags: [{ l: "Free course + completion cert", free: true }, { l: "Paid exam · $99" }, { l: "No coding" }],
        link: { url: "https://learn.microsoft.com/en-us/credentials/certifications/ai-business-professional/", label: "learn.microsoft.com · AI Business Professional" },
        cost: "The AB-730T00 course is free on Microsoft Learn with a completion certificate, study guide, practice assessment and exam sandbox. Only the official exam costs money — $99 USD (regional pricing).",
        outcome: "Recognized practitioner credential: confident, responsible Copilot use in real business workflows. The broad cert for the GTM Ops population that clears Tier 1.",
      },
      {
        idx: "05", t: "Microsoft Certified: AI Transformation Leader", prov: "Microsoft · Exam AB-731 · leadership level",
        tags: [{ l: "Free course + completion cert", free: true }, { l: "Paid exam · $99" }, { l: "No coding" }],
        link: { url: "https://learn.microsoft.com/en-us/credentials/certifications/ai-transformation-leader/", label: "learn.microsoft.com · AI Transformation Leader" },
        cost: "The AB-731T00 course is free on Microsoft Learn with a completion certificate, study guide, practice assessment and exam sandbox. Only the official exam costs money — $99 USD (regional pricing).",
        outcome: "Recognized leadership credential: define AI business value, plan adoption, govern responsibly and drive transformation across teams. For the leaders steering adoption.",
      },
    ],
  },
];
function courseCard(c) {
  const tags = `<div class="pills">` + c.tags.map((t) => `<span class="pill${t.free ? " free" : ""}">${t.l}</span>`).join("") + `</div>`;
  return `<article class="course reveal">
    <div class="course-idx">${c.idx}</div>
    <div class="course-body">
      <h3>${c.t}</h3>
      <p class="course-prov">${c.prov}</p>
      ${tags}
      <p class="crow"><span class="clabel">Cost</span><span class="cval">${c.cost}</span></p>
      <p class="crow"><span class="clabel">Outcome</span><span class="cval">${c.outcome}</span></p>
      <p class="crow"><span class="clabel">Link</span><span class="cval"><a href="${c.link.url}" target="_blank" rel="noopener">${c.link.label} →</a></span></p>
    </div>
  </article>`;
}
function tierSection(t) {
  return `<section class="block">
    <div class="tier-head reveal"><span class="tier-num">${t.tier}</span><h2>${t.tierTitle}</h2><span class="tier-who">${t.who}</span></div>
    ${t.courses.map(courseCard).join("")}
  </section>`;
}
ROUTES.learning = {
  title: "Learning Lanes", formation: "book",
  html: () => hero({
    eyebrow: "✦ GTM Ops Enablement",
    h1: `AI Upskilling <span class="gradient-text">Pathway</span>`,
    lead: "A clear path to build AI proficiency across GTM Ops — start with the proficiency floor, then earn a recognized Microsoft credential.",
  })
  + PATHWAY.map(tierSection).join(""),
};

/* ---- AI Clinic — book a 1:1 with a Community Expert ---- */
ROUTES.clinic = {
  title: "AI Clinic", formation: "medical",
  html: () => hero({
    eyebrow: "✦ AI Clinic",
    h1: `Book a <span class="gradient-text">1:1</span> with a Community Expert`,
    lead: "A dedicated space to talk through, one to one with our experts:",
    morph: ["Your use-cases.", "Your ideas.", "Your challenges.", "Your prompts.", "Your AI journey.", "Whatever's on your mind."],
    cta: [{ t: "Book a 1:1 Consultation", k: "primary", scroll: "book", svg: "calendar" }],
  })
  + block({
    id: "book", panel: true, warm: true, title: "Book your 1:1 consultation",
    lead: "1:1 sessions run every Wednesday, 12:30–1:00 PM ET. Pick a date, tell us who you are and what you'd like to discuss, and we'll send a calendar invite to you and the clinic host.",
    inner: clinicBooking(),
  }),
};

/* ---- AI Clinic booking: weekly Wednesday 12:30–1:00 PM ET slots ---- */
const CLINIC = { host: "rqureshy@equinix.com", hostName: "Riz Qureshy", startHM: "1230", endHM: "1300" };

function nextWednesdays(count) {
  const out = [];
  const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7));   // 3 = Wednesday
  for (let i = 0; i < count; i++) { out.push(new Date(d)); d.setDate(d.getDate() + 7); }
  return out;
}
function ymd(d) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
function clinicBooking() {
  const slots = nextWednesdays(8).map((d) => {
    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return `<button type="button" class="slot" data-date="${ymd(d)}" data-label="${label}">
      <span class="slot-day">${label}</span><span class="slot-time">12:30–1:00 PM ET</span></button>`;
  }).join("");
  return `<div class="booking" id="booking">
    <span class="kicker reveal"><span class="dot"></span> Choose a Wednesday</span>
    <div class="slots reveal">${slots}</div>
    <form class="form reveal" data-booking>
      <div class="field"><label for="bk-first">First name</label><input id="bk-first" type="text" autocomplete="given-name" required></div>
      <div class="field"><label for="bk-last">Last name</label><input id="bk-last" type="text" autocomplete="family-name" required></div>
      <div class="field"><label for="bk-email">Email</label><input id="bk-email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="bk-intro">Brief intro — what's your use-case?</label><textarea id="bk-intro" required placeholder="A sentence or two about the idea, challenge, or use case you'd like to discuss."></textarea></div>
      <div class="cta-row"><button class="btn primary" type="submit">${ic("calendar")}Book my slot</button></div>
    </form>
  </div>`;
}

/* ---- AI Activation for Teams ---- */
ROUTES.teams = {
  title: "AI Activation for Teams", formation: "rocket",
  html: () => hero({
    eyebrow: "✦ AI Activation for Teams",
    h1: `Run AI Activation for <span class="gradient-text">your team</span>`,
    lead: "A hands-on service from the Enablement team — a custom, curated learning framework built entirely around your team's real work, motions, and goals. Not a generic course.",
    cta: [{ t: "Be the champion — reach out", k: "primary", h: VIVA_URL, svg: "rocket" }],
  })
  + block({
    kicker: "What you get", title: "Built around your team — totally hands-on",
    inner: iconCards([
      { t: "Custom &amp; curated", p: "We shape everything around your team's workflows, tools, and use cases — designed for you, not off the shelf.", icon: "grid" },
      { t: "Totally hands-on", p: "Real reps, real prompts, real workflows. Your team learns by doing, together, on the work that matters.", icon: "bolt" },
      { t: "We run it with you", p: "The Enablement team helps discover use cases, design the session, run it, and support adoption afterwards.", icon: "users" },
    ], 3),
  })
  + block({
    panel: true, warm: true, title: "Interested in running it for your team?",
    lead: "Be the champion for your team. Reach out and we'll help you scope it, design it, and run it — start to finish.",
    inner: ctas([{ t: "Reach Out in Viva Engage", k: "primary", h: VIVA_URL, svg: "users" }, { t: "Talk it through in the AI Clinic", k: "cool", h: "#/clinic", svg: "chat" }]),
  }),
};

/* ---- Community Champions ---- */
ROUTES.recognition = {
  title: "Community Champions", formation: "fireworks",
  html: () => hero({
    eyebrow: "✦ Community Champions",
    h1: `Community <span class="gradient-text">Champions</span>`,
    lead: "The Hall of Fame of our Community Champions — refreshed every month.",
    cta: [{ t: "Join the Community", k: "primary", h: "#/join", svg: "users" }],
  }),
};

/* ---- Community Calendar ---- */
ROUTES.calendar = {
  title: "AI Events Calendar", formation: "calendar",
  html: () => block({
    kicker: "AI Events Calendar", title: "The community rhythm",
    lead: "AI clinics, office hours, demo days, leadership messages, and showcase events — all in one place.",
    inner: `<div class="cal">` + [
      ["Mon", "Prompt of the Week", "Community kickoff", "Kickoff"],
      ["Tue", "AI Clinic — live help", "AI Clinic", "Clinic"],
      ["Wed", "Copilot Clinic + Office Hours", "AI Clinic", "Clinic"],
      ["Thu", "Learning Lane spotlight", "Learning Lanes", "Learn"],
      ["Fri", "Demo Friday — 60-second demos", "Showcase", "Showcase"],
      ["Monthly", "Leadership “What We Heard” update", "Leadership", "Leaders"],
      ["Monthly", "Community Showcase & awards", "Showcase", "Showcase"],
    ].map((e) => `<div class="cevent reveal"><span class="when">${e[0]}</span><div class="what"><h3>${e[1]}</h3><p>${e[2]}</p></div><span class="kind">${e[3]}</span></div>`).join("") + `</div>`
      + ctas([{ t: "View Upcoming Events", k: "primary", toast: "Opening the full calendar…", svg: "calendar" }]),
  }),
};

/* ============================================================
   Router + interactions
   ============================================================ */
const main = document.getElementById("main");
let revealObserver = null;

function observeReveals() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  main.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
}

function setActive(route) {
  document.querySelectorAll("#primary-nav a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#/" + route);
  });
}

function closeMenu() {
  document.getElementById("primary-nav").classList.remove("open");
  document.getElementById("nav-toggle").setAttribute("aria-expanded", "false");
}

function render() {
  const route = (location.hash.replace(/^#\/?/, "").split("?")[0]) || "home";
  const page = ROUTES[route] || ROUTES.home;
  document.title = page.title + " · CRO AI Activation Community";
  main.innerHTML = `<div class="view">${page.html()}</div>`;
  cosmos.applyFormation(page.formation, gsap, {});
  window.scrollTo(0, 0);
  setActive(ROUTES[route] ? route : "home");
  observeReveals();
  closeMenu();
}

window.addEventListener("hashchange", render);

/* hamburger */
document.getElementById("nav-toggle").addEventListener("click", () => {
  const nav = document.getElementById("primary-nav");
  const open = nav.classList.toggle("open");
  document.getElementById("nav-toggle").setAttribute("aria-expanded", String(open));
});
document.getElementById("primary-nav").addEventListener("click", (e) => { if (e.target.tagName === "A") closeMenu(); });

/* demo form submit + toast buttons */
const toast = document.getElementById("toast");
let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}
document.addEventListener("submit", (e) => {
  if (e.target.matches("form[data-booking]")) { e.preventDefault(); submitBooking(e.target); return; }
  if (e.target.matches("form[data-demo]")) {
    e.preventDefault();
    showToast("Thanks for contributing! 🎉  (Demo — wiring to Viva Engage / SharePoint comes next.)");
    e.target.reset();
  }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-toast]");
  if (b) { e.preventDefault(); showToast(b.getAttribute("data-toast")); }
  const s = e.target.closest("[data-scroll]");
  if (s) {
    e.preventDefault();
    const tgt = document.getElementById(s.getAttribute("data-scroll"));
    if (tgt) tgt.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const slot = e.target.closest(".slot");
  if (slot) {
    slot.closest(".slots").querySelectorAll(".slot.sel").forEach((s2) => s2.classList.remove("sel"));
    slot.classList.add("sel");
  }
  const yt = e.target.closest("[data-video]");
  if (yt) {
    e.preventDefault();
    openPlayer(`<iframe src="https://www.youtube.com/embed/${yt.getAttribute("data-video")}?autoplay=1&rel=0&modestbranding=1" title="Video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`);
  }
  const vf = e.target.closest("[data-file]");
  if (vf) {
    e.preventDefault();
    openPlayer(`<video src="${vf.getAttribute("data-file")}" controls autoplay playsinline></video>`);
  }
});

/* ---- inline video player (embedded; never redirects off the page) ---- */
const player = document.getElementById("player");
const playerFrame = document.getElementById("player-frame");
let bgmWasPlaying = false;
function openPlayer(html) {
  if (!player) return;
  playerFrame.innerHTML = html;
  player.classList.add("open");
  player.setAttribute("aria-hidden", "false");
  if (bgm && !bgm.paused) { bgmWasPlaying = true; bgm.pause(); soundBtn && soundBtn.classList.add("muted"); }
}
function closePlayer() {
  if (!player) return;
  playerFrame.innerHTML = "";              // unloading the iframe/video stops playback
  player.classList.remove("open");
  player.setAttribute("aria-hidden", "true");
  if (bgmWasPlaying && bgm) { bgm.play().then(() => soundBtn && soundBtn.classList.remove("muted")).catch(() => {}); }
  bgmWasPlaying = false;
}
if (player) {
  document.getElementById("player-close").addEventListener("click", closePlayer);
  player.addEventListener("click", (e) => { if (e.target === player) closePlayer(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && player.classList.contains("open")) closePlayer(); });
}

/* ---- AI Clinic booking: build a calendar invite + notify the host ---- */
function icsEscape(s) { return String(s).replace(/[\\,;]/g, (m) => "\\" + m).replace(/\r?\n/g, "\\n"); }
function utcStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}
function buildICS({ date, first, last, email, intro }) {
  const name = `${first} ${last}`.trim();
  const uid = `${date}-${Math.random().toString(36).slice(2)}@cro-ai-activation`;
  const desc = `1:1 AI Clinic consultation with a CRO AI Activation Community Expert.\n\nRequested by: ${name} <${email}>\n\nUse-case: ${intro}`;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CRO AI Activation Community//AI Clinic//EN",
    "CALSCALE:GREGORIAN", "METHOD:REQUEST",
    "BEGIN:VTIMEZONE", "TZID:America/New_York",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0400", "TZNAME:EDT",
    "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:-0400", "TZOFFSETTO:-0500", "TZNAME:EST",
    "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${utcStamp()}`,
    `DTSTART;TZID=America/New_York:${date}T${CLINIC.startHM}00`,
    `DTEND;TZID=America/New_York:${date}T${CLINIC.endHM}00`,
    "SUMMARY:AI Clinic — 1:1 with a Community Expert",
    `DESCRIPTION:${icsEscape(desc)}`,
    "LOCATION:Online",
    `ORGANIZER;CN=CRO AI Activation Community:mailto:${CLINIC.host}`,
    `ATTENDEE;CN=${icsEscape(name)};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${email}`,
    `ATTENDEE;CN=${CLINIC.hostName};ROLE=CHAIR;RSVP=TRUE:mailto:${CLINIC.host}`,
    "STATUS:CONFIRMED", "SEQUENCE:0",
    "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:AI Clinic 1:1 in 10 minutes", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}
function submitBooking(form) {
  const sel = document.querySelector("#booking .slot.sel");
  if (!sel) { showToast("Please pick a Wednesday slot first."); return; }
  const first = form.querySelector("#bk-first").value.trim();
  const last = form.querySelector("#bk-last").value.trim();
  const email = form.querySelector("#bk-email").value.trim();
  const intro = form.querySelector("#bk-intro").value.trim();
  if (!first || !last || !email || !intro) { showToast("Please complete every field so we can book your slot."); return; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showToast("That email doesn't look right — please check it."); return; }

  const date = sel.getAttribute("data-date");
  const label = sel.getAttribute("data-label");
  const ics = buildICS({ date, first, last, email, intro });

  // 1) hand the requestor a real calendar invite (.ics with both attendees)
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `AI-Clinic-1on1-${date}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);

  // 2) notify the host (cc the requestor) with the booking details
  const subject = encodeURIComponent(`AI Clinic 1:1 — ${first} ${last} — ${label}, 12:30–1:00 PM ET`);
  const body = encodeURIComponent(
    `New AI Clinic 1:1 booking\n\n` +
    `Name: ${first} ${last}\nEmail: ${email}\n` +
    `Slot: ${label}, 12:30–1:00 PM ET\n\nUse-case:\n${intro}\n\n` +
    `A calendar invite (.ics) has been generated for both attendees.`
  );
  const m = document.createElement("a");
  m.href = `mailto:${CLINIC.host}?cc=${encodeURIComponent(email)}&subject=${subject}&body=${body}`;
  document.body.appendChild(m); m.click(); m.remove();

  showToast(`Booked ${label}, 12:30–1:00 PM ET 🎉  Calendar invite downloaded — confirm the email to notify the host.`);
  form.reset();
  sel.classList.remove("sel");
}

/* ---- theme: dark (particles) ⟷ light (ink-in-water smoke) ---- */
const THEME_KEY = "cro-theme";
const themeBtn = document.getElementById("theme-toggle");
let smoke = null;   // lazily created on first switch to light
function applyTheme(mode) {
  const light = mode === "light";
  document.body.classList.toggle("light", light);
  if (light) {
    // hand the sky over to the smoke engine; park the particle field
    if (!smoke) smoke = new Smoke(document.getElementById("smoke-canvas"));
    if (smoke.ok) { smoke.start(); document.body.classList.add("smoke-on"); cosmos.pause(); }
    else { cosmos.resume(); }     // no WebGL2 → keep particles (light-tuned) as a fallback
  } else {
    if (smoke) smoke.stop();
    document.body.classList.remove("smoke-on");
    cosmos.resume();
  }
  cosmos.setTheme(mode);
  themeBtn.setAttribute("aria-pressed", String(light));
  try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
}
let theme = "dark";
try { theme = localStorage.getItem(THEME_KEY) || "dark"; } catch (e) {}
themeBtn.addEventListener("click", () => {
  applyTheme(document.body.classList.contains("light") ? "dark" : "light");
});

/* ---- background music (50% volume) ---- */
let startAudio = () => {};
const bgm = document.getElementById("bgm");
const soundBtn = document.getElementById("sound");
if (bgm && soundBtn) {
  bgm.volume = 0.5;
  let audioStarted = false;
  const refreshSound = () => { soundBtn.classList.toggle("muted", bgm.paused); soundBtn.setAttribute("aria-pressed", String(!bgm.paused)); };
  startAudio = () => { if (audioStarted) return; audioStarted = true; bgm.play().then(refreshSound).catch(() => soundBtn.classList.add("muted")); };
  // browsers block sound until a user gesture — kick it off on the first one
  window.addEventListener("pointerdown", startAudio, { once: true });
  window.addEventListener("keydown", startAudio, { once: true });
  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    audioStarted = true;
    if (bgm.paused) bgm.play().then(refreshSound).catch(() => {});
    else { bgm.pause(); refreshSound(); }
  });
}

/* boot */
buildNav();
applyTheme(theme);
if (!location.hash) location.replace("#/home");
render();
const loader = document.getElementById("loader");
setTimeout(() => loader.classList.add("hidden"), 450);

/* ---- splash door: open it to enter (and unlock the soundtrack) ---- */
const splash = document.getElementById("splash");
const splashOpen = document.getElementById("splash-open");
if (splash && splashOpen) {
  const openDoor = () => {
    if (splash.classList.contains("opening")) return;
    startAudio();                                   // the click is the gesture that unlocks audio
    document.body.classList.add("door-entry");      // home rises from the other side of the door
    splash.classList.add("opening");
    splash.setAttribute("aria-hidden", "true");
    setTimeout(() => splash.classList.add("gone"), 3700);
  };
  splashOpen.addEventListener("click", openDoor);
}
