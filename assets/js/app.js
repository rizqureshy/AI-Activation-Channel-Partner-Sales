/* ============================================================
   app.js — Slide controller + Framer-style flows (GSAP)
   ============================================================ */

import { Cosmos } from "./scene.js";

const gsap = window.gsap;

const cosmos = new Cosmos(document.getElementById("bg-canvas"));
cosmos.start();

const slides = Array.from(document.querySelectorAll(".slide"));
const total = slides.length;
let current = 0;
let animating = false;

/* ---- chrome refs ---- */
const dotsWrap = document.getElementById("dots");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const bar = document.getElementById("bar");
const counterNow = document.getElementById("c-now");
const counterTot = document.getElementById("c-tot");

/* build dots */
slides.forEach((_, i) => {
  const b = document.createElement("button");
  b.className = "dot-btn";
  b.setAttribute("aria-label", `Go to slide ${i + 1}`);
  b.addEventListener("click", () => go(i));
  dotsWrap.appendChild(b);
});
const dots = Array.from(dotsWrap.children);
counterTot.textContent = String(total).padStart(2, "0");

/* ---- per-slide intro animations ---- */
function animateIn(slide) {
  const items = slide.querySelectorAll(".reveal");
  gsap.killTweensOf(items);
  gsap.fromTo(
    items,
    { y: 42, opacity: 0, filter: "blur(10px)" },
    {
      y: 0, opacity: 1, filter: "blur(0px)",
      duration: 0.95, ease: "power3.out",
      stagger: 0.09, delay: 0.15,
    }
  );

  // special: week cards pop in 3D-ish
  const wks = slide.querySelectorAll(".wk");
  if (wks.length) {
    gsap.fromTo(
      wks,
      { y: 60, opacity: 0, rotateX: -25, transformPerspective: 800 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.0, ease: "back.out(1.4)", stagger: 0.1, delay: 0.35 }
    );
  }
}

function animateOut(slide) {
  const items = slide.querySelectorAll(".reveal");
  return gsap.to(items, {
    y: -30, opacity: 0, filter: "blur(8px)",
    duration: 0.4, ease: "power2.in", stagger: 0.03,
  });
}

/* ---- navigation ---- */
function go(index) {
  if (index < 0 || index >= total || index === current || animating) return;
  animating = true;
  const prevSlide = slides[current];
  const nextSlide = slides[index];

  animateOut(prevSlide);

  // drive the 3D scene
  cosmos.setSlide(index, gsap);
  current = index;
  updateChrome();

  // deterministic swap once the out-animation has played
  setTimeout(() => {
    prevSlide.classList.remove("is-active");
    nextSlide.classList.add("is-active");
    animateIn(nextSlide);
    setTimeout(() => (animating = false), 650);
  }, 360);
}

function next() { go(current + 1); }
function prev() { go(current - 1); }

function updateChrome() {
  dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === total - 1;
  bar.style.width = `${((current) / (total - 1)) * 100}%`;
  counterNow.textContent = String(current + 1).padStart(2, "0");
}

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);

/* keyboard */
window.addEventListener("keydown", (e) => {
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); next(); }
  else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
  else if (e.key === "Home") go(0);
  else if (e.key === "End") go(total - 1);
});

/* wheel (debounced) */
let wheelLock = false;
window.addEventListener("wheel", (e) => {
  if (wheelLock || animating) return;
  if (Math.abs(e.deltaY) < 18) return;
  wheelLock = true;
  e.deltaY > 0 ? next() : prev();
  setTimeout(() => (wheelLock = false), 900);
}, { passive: true });

/* touch swipe */
let touchY = null, touchX = null;
window.addEventListener("touchstart", (e) => {
  touchY = e.touches[0].clientY; touchX = e.touches[0].clientX;
}, { passive: true });
window.addEventListener("touchend", (e) => {
  if (touchY === null) return;
  const dy = e.changedTouches[0].clientY - touchY;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dy) > 50 || Math.abs(dx) > 50) {
    (dy < 0 || dx < 0) ? next() : prev();
  }
  touchY = touchX = null;
}, { passive: true });

/* ---- boot ---- */
function boot() {
  cosmos.setSlide(0, gsap);
  slides[0].classList.add("is-active");
  animateIn(slides[0]);
  updateChrome();
  const loader = document.getElementById("loader");
  loader.classList.add("hidden");
}

// Give the WebGL + fonts a moment, then reveal
window.addEventListener("load", () => setTimeout(boot, 650));
