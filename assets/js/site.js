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
  const frost = (lead || morph)
    ? `<div class="hero-frost reveal">${lead ? `<p class="hero-sub">${lead}</p>` : ""}${morph ? rotLine(morph) : ""}</div>`
    : "";
  return `<section class="hero">
    ${eyebrow ? `<span class="eyebrow reveal">${eyebrow}</span>` : ""}
    <h1 class="reveal">${h1}</h1>
    ${frost}
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
  ["Home", "#/home"], ["Join the Community", "#/join"], ["AI Events", "#/calendar"],
  ["AI Mastery Paths", "#/learning"], ["AI Tips in Minutes", "#/videos"], ["AI Tools", "#/tools"],
  ["AI Experts", "#/clinic"], ["Community Champions", "#/recognition"], ["Community Gallery", "#/gallery"],
  ["Guided AI Program", "#/teams"],
];

function buildNav() {
  document.getElementById("primary-nav").innerHTML =
    PRIMARY.map(([t, h]) => `<a href="${h}"${h === "#/join" ? ' class="cta"' : ""}>${t}</a>`).join("");
  document.getElementById("site-footer").innerHTML = `
    <div class="footer-inner">
      <div>
        <h4>CRO AI Community</h4>
        <p class="muted" style="font-size:14px;line-height:1.6;max-width:34ch">Built by the people who participate in it. Come in, share something, learn something, build something.</p>
        <div class="cta-row" style="margin-top:16px"><a class="btn primary sm" href="${VIVA_URL}" target="_blank" rel="noopener">${ic("users")}Join the Community</a></div>
      </div>
      <div>
        <h4>Take part</h4>
        <a href="#/join">Join the Community</a><a href="#/calendar">AI Events Calendar</a>
        <a href="#/recognition">Community Champions</a><a href="#/gallery">Community Gallery</a>
      </div>
      <div>
        <h4>Learn &amp; get help</h4>
        <a href="#/videos">AI Tips in Minutes</a><a href="#/learning">AI Mastery Paths</a>
        <a href="#/clinic">AI Experts</a><a href="#/tools">Tools &amp; Resources</a><a href="#/teams">Guided AI Program</a>
      </div>
    </div>`;
}

/* ============================================================
   Pages
   ============================================================ */
const ROUTES = {};

/* ---- Home ---- */
ROUTES.home = {
  title: "Home", formation: "ring",
  html: () => hero({
    h1: `Curious about AI? <span class="gradient-text">You're in the right place.</span>`,
    lead: "This is a space for everyone across CRO who wants to explore, learn, and share how AI can transform the way we work. Whether you're just getting started or already experimenting, this community is here for you.<br><br>Come in, connect with others, swap ideas, learn something new, and most importantly, try things out.",
    cta: [{ t: "Join the Community", k: "primary", h: "#/join", svg: "users" }],
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
    <button class="gthumb gthumb-btn" data-img="${s.img}" aria-label="View ${s.t} by ${s.author}"><img loading="lazy" src="${s.img}" alt="${s.t} — ${s.author}"></button>
    <span class="tag">${s.cat}</span>
    <h3>${s.t}</h3>
    <div class="gmeta">${s.author}</div>
  </article>`;
}
function appCard(a) {
  return `<article class="card gcard reveal">
    <span class="tag">App &amp; Tool</span>
    <h3>${a.t}</h3>
    <div class="gmeta">${a.author}</div>
    <div class="gactions"><button class="btn cool sm" data-app="${a.url}">${ic("bolt")}Open app</button></div>
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
    h1: `Join the <span class="gradient-text">Community</span>`,
    cta: [{ t: "Open the Viva Engage Community in a new tab", k: "primary", h: VIVA_URL, svg: "share" }],
  })

  + block({
    kicker: "Live now", title: "CRO AI Community Feed",
    lead: "Jump in, share your ideas, and ask your AI questions. Look out for weekly prompts and challenges to keep things fresh and interactive.",
    inner: `<div class="viva-embed reveal">
      <div class="viva-head"><span class="live-dot"></span> CRO AI Community Feed</div>
      <iframe name="embed-feed" title="Viva Engage" src="https://engage.cloud.microsoft/embed/groups/eyJfdHlwZSI6Ikdyb3VwIiwiaWQiOiIyMTA0NzYxMjgxNTExNDI0In0" loading="lazy"></iframe>
    </div>`
      + ctas([{ t: "Open the Viva Engage Community in a new tab", k: "cool", h: VIVA_URL, svg: "share" }]),
  }),
};

/* ---- Gallery ---- */
ROUTES.gallery = {
  title: "Community Gallery", formation: "grid",
  html: () => hero({
    eyebrow: "✦ Community Gallery",
    h1: `Community <span class="gradient-text">Gallery</span>`,
    lead: "Show us what you can do with AI. Weekly prompts and challenges will be posted in Viva Engage. Top entries will be showcased right here.",
    cta: [{ t: "Open the Viva Engage Community in a new tab", k: "primary", h: VIVA_URL, svg: "share" }],
  }),
};

/* ---- Skill Up, Speed Up (curated AI learning videos, embedded playback) ---- */
ROUTES.videos = {
  title: "AI Tips in Minutes", formation: "play",
  html: () => hero({
    eyebrow: "✦ AI Tips in Minutes",
    h1: `AI Tips in <span class="gradient-text">Minutes</span>`,
    lead: "Quick videos and simple guidance to help you build useful AI habits — one tip at a time.",
    cta: [{ t: "Start with Prompt Engineering", k: "primary", scroll: slug("Prompt Engineering"), svg: "play" }],
  })
  + LEARN_TRACKS.map((tr) => block({
      id: slug(tr), kicker: tr, title: TRACK_TAGLINE[tr],
      inner: `<div class="grid c3">` + LEARN.filter((v) => v.track === tr).map(learnCard).join("") + `</div>`,
    })).join("")
  + block({
    panel: true, title: "Got a video to add?",
    lead: "Found a great AI explainer, or made one yourself? Share it with the community and we'll add it to the library.",
    inner: ctas([{ t: "Share a Video in Viva Engage", k: "primary", h: VIVA_URL, svg: "play" }, { t: "Browse the Community Gallery", h: "#/gallery", svg: "grid" }]),
  }),
};

/* ---- AI Mastery Paths: curated LinkedIn Learning routes ---- */
const LL = (q) => "https://www.linkedin.com/learning/search?keywords=" + encodeURIComponent(q);
const MASTERY_PATHS = [
  {
    name: "AI for Business Productivity", color: "#ff8a3d",
    desc: "Work faster and smarter day to day — let AI handle the busywork.",
    courses: ["Microsoft Copilot for Productivity", "Boosting Productivity with Generative AI", "Prompt Engineering Essentials"],
  },
  {
    name: "AI for Customer Success", color: "#18c8b6",
    desc: "Use AI to prep, retain, and grow your accounts.",
    courses: ["AI for Customer Experience", "Generative AI for Customer Success", "Using AI to Strengthen Customer Relationships"],
  },
  {
    name: "AI for Data Analysis", color: "#2b88ff",
    desc: "Turn data into insight with AI assistance.",
    courses: ["AI for Data Analysis", "Data Analysis with Copilot in Excel", "Generative AI for Data Analytics"],
  },
  {
    name: "AI for Project Management", color: "#9b5dff",
    desc: "Plan, track, and deliver projects with AI support.",
    courses: ["AI for Project Managers", "Generative AI for Project Management", "Copilot for Planning & Reporting"],
  },
];
function pathCard(pth) {
  return `<article class="tool-card reveal" style="--tc:${pth.color}">
    <div class="tool-head"><span class="tool-dot"></span><div><h3>${pth.name}</h3></div></div>
    <p class="tool-rule">${pth.desc}</p>
    <ul class="path-courses">${pth.courses.map((c) => `<li><a href="${LL(c)}" target="_blank" rel="noopener">${c}</a></li>`).join("")}</ul>
  </article>`;
}
ROUTES.learning = {
  title: "AI Mastery Paths", formation: "book",
  html: () => hero({
    eyebrow: "✦ AI Mastery Paths",
    h1: `AI Mastery <span class="gradient-text">Paths</span>`,
    lead: "Curated learning journeys to help you strengthen AI capability, improve judgment, and apply AI with purpose.",
  })
  + block({ kicker: "Choose your route", title: "Four paths to grow", inner: `<div class="grid c2 tool-grid">` + MASTERY_PATHS.map(pathCard).join("") + `</div>` })
  + block({
    panel: true, title: "Powered by LinkedIn Learning",
    lead: "Courses are free under the Equinix LinkedIn Learning Enterprise license — certificates included.",
    inner: ctas([{ t: "Open LinkedIn Learning", k: "primary", h: "https://www.linkedin.com/learning/", svg: "book" }]),
  }),
};

/* ---- AI Clinic — book a 1:1 with a Community Expert ---- */
ROUTES.clinic = {
  title: "AI Experts", formation: "medical",
  html: () => hero({
    eyebrow: "✦ AI Experts",
    h1: `Book a <span class="gradient-text">1:1</span> with a Community Expert`,
    lead: "Have a question or idea you'd like to explore with an AI expert beyond the community chat? Book an AI clinic to meet with an expert, get live guidance, and learn how to move your project forward or connect with the right resources.",
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
  title: "Guided AI Program", formation: "rocket",
  html: () => hero({
    eyebrow: "✦ Guided AI Program",
    h1: `Guided AI <span class="gradient-text">Program</span>`,
    lead: "We guide your team through using AI on your real work, step by step. You bring the goals, we build the sessions and hands-on practice around them. Customized to your team, with options from single-day workshops to monthly programs with ongoing guidance.",
    cta: [{ t: "Learn More", k: "primary", h: "https://gtm-webapps.corp.equinix.com/gtmWebApps/v1/aiActivationStudio/", svg: "rocket" }],
  })
  + block({
    id: "team-details", kicker: "How it works", title: "Built around your team's real work",
    inner: iconCards([
      { t: "You bring the goals", p: "Tell us what your team needs to get done — we shape everything around it.", icon: "grid" },
      { t: "We build the sessions", p: "Custom sessions and hands-on practice on your real work, not generic exercises.", icon: "bolt" },
      { t: "Step by step", p: "Guided practice so the team learns by doing — and keeps the habit afterwards.", icon: "users" },
    ], 3),
  })
  + block({
    kicker: "Choose your format", panel: true, warm: true, title: "From a single day to an ongoing program",
    inner: pills(["Single-day workshop", "Multi-session series", "Monthly program", "Ongoing guidance"])
      + ctas([{ t: "Learn More", k: "primary", h: "https://gtm-webapps.corp.equinix.com/gtmWebApps/v1/aiActivationStudio/", svg: "rocket" }, { t: "Talk it through with an AI Expert", k: "cool", h: "#/clinic", svg: "chat" }]),
  }),
};

/* ---- Tools & Resources: which AI tool should I use? ---- */
const TOOLS = [
  {
    name: "Equinix SideKick", tag: "Employee Support", color: "#2bb673",
    url: "https://equinixinc.sharepoint.com/sites/TechITHub/SitePages/IT/How%20Do%20I/Sidekick/Sidekick%2C-your-Equinix-AI-assistant.aspx",
    rule: "Need help as an employee?",
    uses: ["HR", "Legal", "Compliance", "IT Help", "Policies", "Support tickets"],
  },
  {
    name: "Equinix ACE", tag: "Sales & Customer Success", color: "#2b88ff",
    url: "https://ace.equinix.com/",
    rule: "Need help selling to customers?",
    uses: ["Products & Services", "Customer Preparation", "Competitive Intelligence", "RFPs", "Sales Content", "GTM Knowledge"],
  },
  {
    name: "Microsoft Copilot", tag: "Personal Productivity", color: "#ff8a3d",
    access: "Access in MS Teams",
    rule: "Need help getting your own work done?",
    uses: ["Email", "Word", "Excel", "PowerPoint", "Teams", "Meeting summaries", "Brainstorming", "Writing", "Research", "General AI"],
  },
  {
    name: "Equinix Approved AI Tools", tag: "Approved Tools Directory", color: "#ffcf45",
    url: "https://equinixinc.sharepoint.com/sites/Intranet/SitePages/IT/Approved-AI-Applications-at-Equinix.aspx?web=1",
    rule: "See every AI application approved for use at Equinix.",
    uses: ["Full directory", "IT-approved", "Security-reviewed"],
  },
];
function toolCard(t) {
  const title = t.url
    ? `<a class="tool-link" href="${t.url}" target="_blank" rel="noopener">${t.name}</a>`
    : t.name;
  return `<article class="tool-card reveal" style="--tc:${t.color}">
    <div class="tool-head"><span class="tool-dot"></span><div><h3>${title}</h3><p class="tool-tag">${t.tag}</p></div></div>
    <p class="tool-rule">${t.rule}</p>
    <div class="pills">${t.uses.map((u) => `<span class="pill">${u}</span>`).join("")}</div>
    ${t.access ? `<p class="tool-access">${t.access}</p>` : ""}
  </article>`;
}
ROUTES.tools = {
  title: "Tools & Resources", formation: "grid",
  html: () => hero({
    eyebrow: "✦ Tools & Resources",
    h1: `Which AI Tool <span class="gradient-text">Should I Use?</span>`,
    lead: "Each AI tool at Equinix serves a distinct purpose and may draw from different data and knowledge sources. Unsure which one to use? Check out the decision tree below.",
  })
  + block({ inner: `<div class="grid c2 tool-grid">` + TOOLS.map(toolCard).join("") + `</div>` }),
};

/* ---- Community Champions ---- */
ROUTES.recognition = {
  title: "Community Champions", formation: "fireworks",
  html: () => hero({
    eyebrow: "✦ Community Champions",
    h1: `Community <span class="gradient-text">Champions</span>`,
    lead: "Passionate about AI and actively using it in their day-to-day work, these individuals help others learn, experiment, and get more value from AI. They share what works, answer questions, and inspire the community through real examples.",
    cta: [{ t: "Join the Community", k: "primary", h: "#/join", svg: "users" }],
  }),
};

/* ---- AI Events Calendar: AI-upskilling events hosted by teams across CRO ---- */
const EVENTS = [
  {
    group: "GTM Ops", color: "#2b88ff", cadence: "Monthly",
    title: "AI for Pipeline Hygiene & Forecasting",
    desc: "Hands-on: use AI to clean pipeline data, spot risk, and sharpen forecasts.",
  },
  {
    group: "Marketing", color: "#e3008c", cadence: "Monthly",
    title: "AI for Content & Campaigns",
    desc: "Draft, repurpose, and localize campaign content faster — with brand guardrails.",
  },
  {
    group: "Customer Success", color: "#18c8b6", cadence: "Monthly",
    title: "AI for Customer Health & QBRs",
    desc: "Summarize accounts, prep QBRs, and surface renewal and churn signals with AI.",
  },
  {
    group: "GTST", color: "#9b5dff", cadence: "Monthly",
    title: "AI for Technical Solution Prep",
    desc: "Speed up solution design, discovery, and technical responses with AI.",
  },
];
function eventCard(e) {
  return `<article class="card event-card reveal" style="--tc:${e.color}">
    <div class="event-top"><span class="event-host">Hosted by ${e.group}</span><span class="event-when">${e.cadence}</span></div>
    <h3>${e.title}</h3>
    <p>${e.desc}</p>
  </article>`;
}
ROUTES.calendar = {
  title: "AI Events Calendar", formation: "calendar",
  html: () => hero({
    eyebrow: "✦ AI Events Calendar",
    h1: `AI Events <span class="gradient-text">Calendar</span>`,
    lead: "AI-upskilling events hosted by teams across CRO — each tailored to how that team works. Drop into any session that's relevant to you.",
    cta: [{ t: "See events in Viva Engage", k: "primary", h: VIVA_URL, svg: "share" }],
  })
  + block({ kicker: "Hosted by your teams", title: "Sessions built for how each team works",
    inner: `<div class="grid c2">` + EVENTS.map(eventCard).join("") + `</div>` })
  + block({ panel: true, title: "Want your team to host one?",
    lead: "Running an AI-upskilling session for your group? Share it in the community and we'll add it to the calendar.",
    inner: ctas([{ t: "Add your event in Viva Engage", k: "primary", h: VIVA_URL, svg: "share" }]) }),
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
  document.title = page.title + " · CRO AI Community";
  main.innerHTML = `<div class="view"><div class="page-logo"><img src="assets/img/equinix-logo-mark.png" alt="Equinix"></div>${page.html()}</div>`;
  cosmos.applyFormation(page.formation, gsap, {});
  if (smoke && document.body.classList.contains("smoke-on")) smoke.burst();   // ink churns + resettles
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
  const im = e.target.closest("[data-img]");
  if (im) {
    e.preventDefault();
    openPlayer(`<img class="player-img" src="${im.getAttribute("data-img")}" alt="">`, "img");
  }
  const ap = e.target.closest("[data-app]");
  if (ap) {
    e.preventDefault();
    openPlayer(`<iframe src="${ap.getAttribute("data-app")}" title="Community app" loading="lazy" allow="fullscreen; autoplay; clipboard-write"></iframe>`);
  }
});

/* ---- inline video player (embedded; never redirects off the page) ---- */
const player = document.getElementById("player");
const playerFrame = document.getElementById("player-frame");
function openPlayer(html, mode) {
  if (!player) return;
  playerFrame.innerHTML = html;
  player.classList.toggle("is-img", mode === "img");   // images size naturally, not 16:9
  player.classList.add("open");
  player.setAttribute("aria-hidden", "false");
}
function closePlayer() {
  if (!player) return;
  playerFrame.innerHTML = "";              // unloading the iframe/video stops playback
  player.classList.remove("open");
  player.setAttribute("aria-hidden", "true");
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
  const desc = `1:1 AI Experts consultation with a CRO AI Community Expert.\n\nRequested by: ${name} <${email}>\n\nUse-case: ${intro}`;
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
    "SUMMARY:AI Experts — 1:1 with a Community Expert",
    `DESCRIPTION:${icsEscape(desc)}`,
    "LOCATION:Online",
    `ORGANIZER;CN=CRO AI Activation Community:mailto:${CLINIC.host}`,
    `ATTENDEE;CN=${icsEscape(name)};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${email}`,
    `ATTENDEE;CN=${CLINIC.hostName};ROLE=CHAIR;RSVP=TRUE:mailto:${CLINIC.host}`,
    "STATUS:CONFIRMED", "SEQUENCE:0",
    "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:AI Experts 1:1 in 10 minutes", "END:VALARM",
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
  const subject = encodeURIComponent(`AI Experts 1:1 — ${first} ${last} — ${label}, 12:30–1:00 PM ET`);
  const body = encodeURIComponent(
    `New AI Experts 1:1 booking\n\n` +
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
let smoke = null;           // lazily created on first switch to light
let engineTimer = null;     // delays parking the hidden engine until the cross-fade ends
let themeAnimTimer = null;
function applyTheme(mode, animate) {
  const light = mode === "light";
  if (animate) {
    document.body.classList.add("theme-anim");                 // ease all colours during the switch
    clearTimeout(themeAnimTimer);
    themeAnimTimer = setTimeout(() => document.body.classList.remove("theme-anim"), 950);
  }
  document.body.classList.toggle("light", light);
  clearTimeout(engineTimer);
  if (light) {
    if (!smoke) smoke = new Smoke(document.getElementById("smoke-canvas"));
    if (smoke.ok) {
      smoke.start(); cosmos.resume();                          // both run through the cross-fade
      document.body.classList.add("smoke-on");                 // ink fades in, particles fade out
      engineTimer = setTimeout(() => cosmos.pause(), 900);     // park particles once hidden
    } else { cosmos.resume(); }                                // no WebGL2 → keep particles as fallback
  } else {
    cosmos.resume();                                           // particles fade back in
    document.body.classList.remove("smoke-on");
    if (smoke) engineTimer = setTimeout(() => smoke.stop(), 900);
  }
  cosmos.setTheme(mode);
  themeBtn.setAttribute("aria-pressed", String(light));
  try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
}
let theme = "dark";
try { theme = localStorage.getItem(THEME_KEY) || "dark"; } catch (e) {}
themeBtn.addEventListener("click", () => {
  applyTheme(document.body.classList.contains("light") ? "dark" : "light", true);
});

/* boot */
buildNav();
applyTheme(theme);
if (!location.hash) location.replace("#/home");
render();
const loader = document.getElementById("loader");
setTimeout(() => loader.classList.add("hidden"), 450);
