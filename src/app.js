(() => {
const { T, SERVICES, CLIENTS, LOGO_DISC, render } = globalThis.CODA;

/* ───────────── setup ───────────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
const motion = hasGsap && !reduce;
if (!motion) document.documentElement.classList.add("rm");

// the URL decides the language: / is English, /ar/ is Arabic (each page is pre-rendered in its language)
let lang = document.documentElement.lang === "ar" ? "ar" : "en";
const LANG_PATH = { en: "/", ar: "/ar/" };
if (location.hash === "#ar" && lang !== "ar") location.replace(LANG_PATH.ar);
if (location.hash === "#en" && lang !== "en") location.replace(LANG_PATH.en);
const isRTL = () => lang === "ar";
const phone = () => innerWidth <= 860;
// pinned scenes run about 30% shorter on phones so the page doesn't feel endless under a thumb
const PIN = () => phone() ? .7 : 1;
$("#yr").textContent = new Date().getFullYear();

function grooves(g, from, to, step) {
  let html = "";
  for (let r = from; r <= to; r += step) html += `<circle class="groove" r="${r.toFixed(2)}" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
  g.innerHTML = html;
}
grooves($("#heroGrooves"), 15, 47, 2.2);
grooves($("#deckGrooves"), 15, 46, 2.4);
grooves($("#finGrooves"), 15, 47, 2.4);

// record crate (pre-rendered; fall back to the name when a logo fails to load)
$$(".sleeve img").forEach(img => {
  const fail = () => img.closest(".sleeve").classList.add("nologo");
  img.addEventListener("error", fail);
  if (img.complete && !img.naturalWidth) fail();
});

const menu = { open: false };
let scrollMax = 0;
const measureScroll = () => { scrollMax = document.documentElement.scrollHeight - innerHeight; };

/* ───────────── text ───────────── */
const el = {};
function cacheEls() {
  Object.assign(el, {
    words: $$("#manifesto .wd"), barFill: $("#barFill"), barHead: $("#barHead"), tCur: $("#tCur"),
    wave: $("#wave"), waveBg: $("#waveBg"), waveFg: $("#waveFg"),
    heroLines: $$("#heroH1 .ln>span"), heroFades: $$(".hero-copy .ln-fade"), heroCopy: $("#heroCopy"),
    progress: $("#progress"), arm: $("#arm"), sleeves: $$(".sleeve"), crateDisc: $("#crateDisc"),
    crateCount: $("#crateCount"), crateName: $("#crateName"), crateTicks: $$("#crateTicks i"),
    finC: $("#finC"), finDot: $("#finDot"), finDisc: $("#finDisc"), finHole: $("#finHole"),
  });
}
function applyText() {
  const d = T[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL() ? "rtl" : "ltr";
  document.title = d.seo_title;
  $('meta[name="description"]').setAttribute("content", d.seo_desc);
  $$("[data-t]").forEach(el => { const v = d[el.dataset.t]; if (typeof v === "string") { el.textContent = v; delete el.dataset.raw; } });
  $$("[data-t-html]").forEach(el => { el.innerHTML = d[el.dataset.tHtml]; });
  $("#langLabel").className = isRTL() ? "" : "ar-face";
  $("#langBtn").setAttribute("aria-label", d.lang_btn_aria);

  $("#heroH1").innerHTML = render.heroH1(lang);
  $("#manifesto").innerHTML = render.manifesto(lang);

  $("#drumA").innerHTML = render.drumLine(lang, d.twist_a, false);
  $("#drumB").innerHTML = render.drumLine(lang, d.twist_b, true);
  $("#drum").setAttribute("aria-label", `${d.twist_a}. ${d.twist_b}.`);
  $("#drumA").setAttribute("aria-hidden", "true");

  $("#tracklist").innerHTML = render.tracklist(lang);
  $("#steps").innerHTML = render.steps(lang);
  $("#crewTrack").innerHTML = render.crew(lang);
  $("#sndBtn").setAttribute("aria-label", $("#sndBtn").classList.contains("on") ? d.snd_off : d.snd_on);
  $("#menuBtn").setAttribute("aria-label", menu.open ? d.menu_close : d.menu_open);
  $(".badge").setAttribute("aria-label", d.scroll_down);
  cacheEls();
}

/* ───────────── helpers ───────────── */
function splitWords(el) {
  if (!el.dataset.raw) el.dataset.raw = el.textContent;
  const words = el.dataset.raw.trim().split(/\s+/);
  el.setAttribute("aria-label", el.dataset.raw);
  el.innerHTML = words.map(w => `<span class="wm" aria-hidden="true"><span class="wi">${w}</span></span>`).join(" ");
  return [...el.querySelectorAll(".wi")];
}
const clamp01 = v => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = t => 1 - Math.pow(1 - t, 3);
const eInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const bounce = t => { const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };
const DEG = 180 / Math.PI;

/* ───────────── hero ───────────── */
const hero = { p: 0, spin: 0, intro: motion ? 0 : 1, g: null, mx: 0, my: 0, tx: 0, ty: 0 };
const heroBack = $("#heroBack"), heroFront = $("#heroFront");
const heroDisc = $("#heroDisc"), heroC = $("#heroC"), heroDot = $("#heroDot"), hole = $("#hole"), holeText = $("#holeText");

function heroLayout() {
  const W = document.documentElement.clientWidth || innerWidth, H = $(".hero").clientHeight || innerHeight;
  const mobile = W < 760;
  let s, lx, ly;
  if (mobile) {
    // offsetTop ignores the intro/scroll transforms on the copy, so this is its resting position
    const top = 64, bottom = $("#heroCopy").offsetTop - 14, avail = Math.max(140, bottom - top);
    s = Math.min(avail / 212, W * 1.3 / 204);
    ly = top + 110 * s + Math.max(0, avail - 212 * s) / 2;
    lx = isRTL() ? W * .86 - 97 * s : W * .14 + 102 * s;
  }
  else {
    // big mark that runs off the near edge, with room for the headline beside it
    s = Math.min(H * 1.2 / 210, W * .0042);
    lx = isRTL() ? W * .47 - 97 * s : W * .53 + 100 * s;
    ly = H * .53;
  }
  heroBack.setAttribute("viewBox", `0 0 ${W} ${H}`);
  heroFront.setAttribute("viewBox", `0 0 ${W} ${H}`);
  hero.g = { W, H, s, lx, ly, mobile };
}

function heroRender() {
  const g = hero.g; if (!g) return;
  const { W, H, s } = g, p = hero.p, sign = isRTL() ? -1 : 1, I = hero.intro;
  const par = 1 - seg(p, 0, .2), lx = g.lx + hero.mx * 22 * par, ly = g.ly + hero.my * 16 * par;

  // load-in: C slides in, disc rolls in, dot drops, copy rises
  const ci = eOut(seg(I, 0, .5)), di = eOut(seg(I, .12, .7)), ti = bounce(seg(I, .5, .95));
  const introCX = (1 - ci) * -W * .45, introCR = (1 - ci) * -140;
  const introDX = (1 - di) * W * .55, introDR = -(introDX / (49.1 * s)) * DEG;
  const introDY = (1 - ti) * -H * .8;

  el.heroLines.forEach((l, i) => {
    const inn = eOut(seg(I, .3 + i * .1, .75 + i * .1));
    const out = eOut(seg(p, .02 + i * .035, .2 + i * .035));
    l.style.transform = `translateY(${(1 - inn) * 110 - out * 110}%)`;
  });
  const fin = eOut(seg(I, .55, 1)), fa = seg(p, 0, .14);
  el.heroFades.forEach(f => { f.style.opacity = fin * (1 - fa); f.style.transform = `translateY(${(1 - fin) * 16 - fa * 24}px)`; });
  el.heroCopy.style.visibility = p > .32 ? "hidden" : "visible";

  // scroll: C swings off toward the near edge, the dot flies up
  const a = eInOut(seg(p, .04, .34));
  heroC.setAttribute("transform", `translate(${lx + introCX + sign * a * W * .62} ${ly - a * H * .08}) rotate(${introCR + sign * a * 75}) scale(${s})`);
  heroC.style.opacity = ci * (1 - seg(p, .2, .34));
  const da = eInOut(seg(p, .02, .3));
  heroDot.setAttribute("transform", `translate(${lx + sign * da * W * .25} ${ly + introDY - da * H * .7}) scale(${s})`);
  heroDot.style.opacity = seg(I, .5, .52);

  // disc travels to centre and grows, then we fall through the hole
  const m = eInOut(seg(p, .1, .5)), z = seg(p, .5, 1);
  const rx = lx - 1.1 * s + introDX, ry = ly + 1.3 * s;
  const cx = lerp(rx, W / 2, m), cy = lerp(ry, H / 2, m);
  const k1 = Math.max(1, Math.min(W, H) * .42 / (49.1 * s));
  const kF = (Math.hypot(W, H) / 2 * 1.04) / (LOGO_DISC.holeMinR * s);
  let k = lerp(1, k1, m);
  if (z > 0) k = k1 * Math.pow(kF / k1, Math.pow(z, 1.6));
  heroDisc.setAttribute("transform", `translate(${cx} ${cy}) rotate(${hero.spin + introDR + p * 520}) scale(${s * k})`);

  const r = LOGO_DISC.holeMinR * s * k;
  hole.style.clipPath = `circle(${(z > 0 ? r : 0).toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
  const ht = seg(p, .72, .96);
  holeText.style.opacity = ht;
  holeText.style.transform = `scale(${lerp(.82, 1, eOut(ht))})`;
}


/* ───────────── finale ───────────── */
const fin = { p: 0, g: null, live: false, st: null };
function finLayout() {
  const W = document.documentElement.clientWidth || innerWidth, H = innerHeight, mobile = W < 760;
  const s = Math.min(W, H) * (mobile ? .58 : .62) / 216;
  fin.g = { W, H, s, cx: W / 2, cy: H / 2 };
  $("#finSvg").setAttribute("viewBox", `0 0 ${W} ${H}`);
}
function finRender() {
  const g = fin.g; if (!g) return;
  const { W, H, s, cx, cy } = g, p = fin.p;
  const ci = eOut(seg(p, 0, .26)), di = eOut(seg(p, .05, .3)), ti = bounce(seg(p, .2, .34));
  const out = eInOut(seg(p, .38, .54)), grow = seg(p, .44, .78);
  // C: swings in from the left, then out the other way
  el.finC.setAttribute("transform", `translate(${cx - (1 - ci) * W * .55 - out * W * .6} ${cy}) rotate(${-(1 - ci) * 130 - out * 50}) scale(${s})`);
  el.finC.style.opacity = ci * (1 - out);
  // dot: drops and bounces, then flies off
  el.finDot.setAttribute("transform", `translate(${cx + out * W * .3} ${cy - (1 - ti) * H * .9 - out * H * .6}) scale(${s})`);
  el.finDot.style.opacity = seg(p, .2, .21) * (1 - out);
  // disc: rolls in, centres itself, then grows until the screen is red
  const dx = (1 - di) * W * .6, roll = -(dx / (49.1 * s)) * DEG;
  const ox = lerp(-1.1 * s, 0, out), oy = lerp(1.3 * s, 0, out);
  const kF = (Math.hypot(W, H) / 2 * 1.08) / (LOGO_DISC.minR * s);
  const k = grow > 0 ? Math.pow(kF, Math.pow(grow, 1.7)) : 1;
  el.finDisc.setAttribute("transform", `translate(${cx + ox + dx} ${cy + oy}) rotate(${roll + deck.rot * .5}) scale(${s * k})`);
  el.finHole.setAttribute("transform", `scale(${(1 - eOut(Math.min(1, grow * 1.8))).toFixed(4)})`);
}

/* ───────────── waveform ───────────── */
const wave = { len: 0 };
function buildWave() {
  const svg = el.wave, b = svg.getBoundingClientRect(), vertical = innerWidth <= 860;
  const W = Math.max(1, b.width), H = Math.max(1, b.height);
  svg.setAttribute("viewBox", `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`);
  const wrap = svg.parentElement.getBoundingClientRect();
  const stepPos = $$(".step").map(x => { const r = x.getBoundingClientRect(); return vertical ? r.top - wrap.top + 5.5 : (isRTL() ? r.right - 5.5 : r.left + 5.5) - b.left; });
  const total = vertical ? H : W, mid = vertical ? W / 2 : H / 2, amp = mid * .85;
  // amplitude dips to zero at each step dot so the dots sit on the line
  const env = x => {
    let dmin = Infinity; for (const sp of stepPos) dmin = Math.min(dmin, Math.abs(x - sp));
    return Math.min(1, dmin / 46);
  };
  const pts = [];
  const order = (!vertical && isRTL());
  for (let i = 0; i <= total; i += 3) {
    const x = order ? total - i : i;
    const v = Math.sin(x * .19) * (.55 + .45 * Math.sin(x * .023)) * (.7 + .3 * Math.sin(x * .071));
    const o = mid + v * amp * env(x);
    pts.push(vertical ? `${o.toFixed(1)},${x.toFixed(1)}` : `${x.toFixed(1)},${o.toFixed(1)}`);
  }
  const d = "M" + pts.join(" L");
  el.waveBg.setAttribute("d", d); el.waveFg.setAttribute("d", d);
  wave.len = el.waveFg.getTotalLength();
  el.waveFg.style.strokeDasharray = wave.len;
  el.waveFg.style.strokeDashoffset = wave.len;
}

/* ───────────── lyrics ───────────── */
const lyr = { last: -2 };
function lyricRender(p) {
  const words = el.words, n = words.length, q = seg(p, .04, .9) * n, idx = Math.min(n, Math.floor(q));
  el.barFill.style.transform = `scaleX(${p})`;
  el.barHead.style.insetInlineStart = (p * 100) + "%";
  const t = Math.round(p * 30); el.tCur.textContent = `0:${String(t).padStart(2, "0")}`;
  if (idx === lyr.last) return;
  lyr.last = idx;
  words.forEach((w, i) => { w.classList.toggle("past", i < idx); w.classList.toggle("now", i === idx); });
}

/* ───────────── twist drum ───────────── */
function drumRender(p) {
  const A = $$("#drumA .ch"), B = $$("#drumB .ch");
  const q = eInOut(seg(p, .12, .82)), w = .38;
  const apply = (arr, out) => arr.forEach((c, i) => {
    const t = clamp01((q * (1 + w) - (arr.length > 1 ? i / (arr.length - 1) : 0)) / w);
    const e = eInOut(t);
    if (out) { c.style.transform = `rotateX(${e * 90}deg)`; c.style.opacity = 1 - e; }
    else { c.style.transform = `rotateX(${(1 - e) * -90}deg)`; c.style.opacity = e; }
  });
  apply(A, true); apply(B, false);
}

/* ───────────── deck ───────────── */
const deck = { rot: 0, speed: .2, arm: 4, armTarget: 4, active: -1, drag: false };
function setTrack(i) {
  if (i === deck.active) return;
  deck.active = i;
  $$(".track").forEach(t => t.classList.toggle("on", +t.dataset.i === i));
  const s = SERVICES[i];
  const str = `${s.c} · ${s.en[0].toUpperCase()} · `;
  const C = 2 * Math.PI * 30 * .985;
  $("#deckText").setAttribute("font-size", Math.min(4.8, C / (str.length * .72)).toFixed(2));
  $("#deckRing").textContent = str;
  $("#deckNow").textContent = s.c;
}

const deckDisc = $("#deckDisc");

/* ───────────── crate ───────────── */
const crate = { c: 0, front: -1, live: false };
function crateRender() {
  const sleeves = el.sleeves, N = sleeves.length;
  const base = Math.floor(crate.c), f = crate.c - base;
  const ce = base + eInOut(seg(f, .18, .82));
  const front = Math.min(N - 1, Math.round(ce));
  const moved = ce !== crate.lastCe; crate.lastCe = ce;
  if (moved) sleeves.forEach((el, i) => {
    const d = i - ce;
    el.style.zIndex = 200 - 2 * i;
    if (d <= -1) { el.style.opacity = 0; el.style.visibility = "hidden"; return; }
    el.style.visibility = "visible";
    if (d < 0) {
      const t = -d;
      el.style.transform = `perspective(1400px) translateY(${t * 18}%) rotateX(${-t * 105}deg)`;
      el.style.opacity = 1 - seg(t, .55, .95);
      el.style.filter = "none";
    } else {
      el.style.transform = `perspective(1400px) translateY(${-d * 7}%) scale(${1 - d * .06}) rotateX(${Math.min(d, 1) * 8}deg)`;
      el.style.opacity = d < 5 ? 1 : 0;
      el.style.filter = `brightness(${1 - Math.min(d, 4) * .16})`;
    }
  });
  const disc = el.crateDisc, fd = ce - Math.floor(ce);
  const peek = Math.max(1 - fd / .3, (fd - .7) / .3, 0);
  disc.style.zIndex = 200 - 2 * Math.ceil(ce - .0001) - 1;
  disc.style.transform = `translateX(${(isRTL() ? -1 : 1) * eOut(clamp01(peek)) * 44}%) rotate(${deck.rot}deg)`;
  if (front !== crate.front) {
    crate.front = front;
    el.crateCount.textContent = `${String(front + 1).padStart(2, "0")} / ${N}`;
    el.crateName.textContent = CLIENTS[front][0];
    el.crateTicks.forEach((t, i) => { t.classList.toggle("past", i < front); t.classList.toggle("now", i === front); });
    // the new name rises in like the next record coming forward
    if (motion && el.crateName.animate) el.crateName.animate(
      [{ opacity: 0, transform: "translateY(45%)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
      { duration: 480, easing: "cubic-bezier(.2,.8,.2,1)" });
  }
}


/* ───────────── build (all scroll scenes) ───────────── */
let ctx = null, lenis = null;

function build() {
  heroLayout();
  if (!motion) {
    hero.p = 0; hero.intro = 1; heroRender(); drumRender(1); setTrack(0); lyricRender(1);
    finLayout(); fin.p = 1; finRender();
    buildWave(); el.waveFg.style.strokeDashoffset = 0;
    return;
  }

  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: () => "+=" + innerHeight * 2.6 * PIN(),
    pin: true, scrub: true, anticipatePin: 1,
    onUpdate: st => { hero.p = st.progress; },
    onRefresh: st => { heroLayout(); hero.p = st.progress; },
  });

  // lyrics: words light up one by one like synced lyrics, with a player bar
  lyr.last = -2; lyricRender(0);
  ScrollTrigger.create({
    trigger: ".manifesto", start: "top top", end: () => "+=" + innerHeight * 1.7 * PIN(), pin: true, scrub: true,
    onUpdate: st => lyricRender(st.progress),
  });

  drumRender(0);
  ScrollTrigger.create({
    trigger: ".twist", start: "top top", end: () => "+=" + innerHeight * 1.8 * PIN(),
    pin: true, scrub: true, onUpdate: st => drumRender(st.progress),
  });
  gsap.fromTo(".twist-note", { opacity: 0, y: 16 }, {
    opacity: 1, y: 0, ease: "none",
    scrollTrigger: { trigger: ".twist", start: () => "top+=" + innerHeight * 1.2 * PIN() + " top", end: () => "top+=" + innerHeight * 1.6 * PIN() + " top", scrub: true },
  });

  setTrack(0);
  ScrollTrigger.create({
    trigger: "#tracklist", start: "top 58%", end: "bottom 58%",
    onUpdate: st => { deck.armTarget = 15 + st.progress * 23; },
    onLeaveBack: () => { deck.armTarget = 4; },
  });
  $$(".track").forEach(t => {
    ScrollTrigger.create({
      trigger: t, start: "top 58%", end: "bottom 58%",
      onToggle: st => { if (st.isActive) { setTrack(+t.dataset.i); sfxTick(); buzz(); } },
    });
  });

  // process: a sound wave draws itself through the five steps
  const steps = $$(".step");
  ScrollTrigger.create({
    trigger: ".steps-wrap", start: "top 78%", end: "bottom 55%", scrub: true,
    onRefresh: st => { buildWave(); el.waveFg.style.strokeDashoffset = wave.len * (1 - st.progress); },
    onUpdate: st => {
      const p = st.progress;
      el.waveFg.style.strokeDashoffset = wave.len * (1 - p);
      steps.forEach((x, i) => x.classList.toggle("on", p >= (i / (steps.length - 1)) * .96));
    },
  });

  const track = $("#crewTrack");
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const reel = gsap.to(track, {
    x: () => (isRTL() ? 1 : -1) * dist(), ease: "none",
    scrollTrigger: { trigger: ".crew", start: "top top", end: () => "+=" + dist(), pin: true, scrub: true, invalidateOnRefresh: true },
  });
  $$(".member figure").forEach(f => {
    gsap.fromTo(f, { clipPath: "inset(100% 0% 0% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", ease: "none",
      scrollTrigger: {
        trigger: f, containerAnimation: reel, scrub: true,
        start: isRTL() ? "right 0%" : "left 100%",
        end: isRTL() ? "right 30%" : "left 70%",
      },
    });
  });
  if (finePointer) $$(".member figure").forEach(f => {
    const glare = f.querySelector(".glare");
    f.addEventListener("pointermove", e => {
      const r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      gsap.to(f, { rotationY: (x - .5) * 14, rotationX: (.5 - y) * 12, transformPerspective: 900, duration: .5, ease: "power2.out" });
      glare.style.setProperty("--gx", x * 100 + "%"); glare.style.setProperty("--gy", y * 100 + "%");
    });
    f.addEventListener("pointerleave", () => gsap.to(f, { rotationY: 0, rotationX: 0, duration: .9, ease: "elastic.out(1,.5)" }));
  });
  $$(".member").forEach(m => {
    gsap.fromTo(m, { "--c": 0 }, {
      "--c": 1, ease: "none",
      scrollTrigger: {
        trigger: m, containerAnimation: reel, scrub: true,
        start: isRTL() ? "right 22%" : "left 78%",
        end: isRTL() ? "right 52%" : "left 48%",
      },
    });
  });

  crate.c = 0; crate.front = -1; crate.lastCe = null; crateRender();
  const crateST = ScrollTrigger.create({
    trigger: ".crate-sec", start: "top top", end: () => "+=" + innerHeight * .26 * PIN() * (CLIENTS.length - 1),
    pin: true, scrub: true,
    onUpdate: st => { crate.c = st.progress * (CLIENTS.length - 1); },
  });

  // headings rise in word by word; supporting copy fades up
  $$(".sec-head h2, .crate-info h2, .crew-intro h2").forEach(h => {
    const words = splitWords(h);
    const inReel = !!h.closest(".crew");
    gsap.fromTo(words, { yPercent: 115 }, {
      yPercent: 0, duration: 1.05, ease: "power4.out", stagger: .07,
      scrollTrigger: inReel ? { trigger: ".crew", start: "top 70%", toggleActions: "play none none reverse" }
                            : { trigger: h, start: "top 86%", toggleActions: "play none none reverse" },
    });
  });
  $$(".sec-head p, .crate-info>p, .crate-now").forEach(el => {
    if (el.classList.contains("twist-note")) return;
    gsap.fromTo(el, { y: 26, opacity: 0 }, {
      y: 0, opacity: 1, duration: .9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
    });
  });
  gsap.fromTo(".step", { y: 40, opacity: 0 }, {
    y: 0, opacity: 1, duration: .9, ease: "power3.out", stagger: .09,
    scrollTrigger: { trigger: ".steps-wrap", start: "top 85%", toggleActions: "play none none reverse" },
  });
  gsap.fromTo(".deck svg", { scale: .82, rotation: -40, opacity: 0 }, {
    scale: 1, rotation: 0, opacity: 1, ease: "none",
    scrollTrigger: { trigger: ".tracks-grid", start: "top 95%", end: "top 35%", scrub: true },
  });
  gsap.fromTo(".crate", { y: 80, opacity: 0, rotation: isRTL() ? -4 : 4 }, {
    y: 0, opacity: 1, rotation: 0, ease: "none",
    scrollTrigger: { trigger: ".crate-sec", start: "top 90%", end: "top 20%", scrub: true },
  });

  // finale: the logo builds at centre, the record swallows the screen in red, the call to action rises
  finLayout();
  const fWords = splitWords($("#finTitle"));
  const ftl = gsap.timeline({
    scrollTrigger: {
      trigger: "#finStage", start: "top top", end: () => "+=" + innerHeight * 2.6 * PIN(), pin: true, scrub: true,
      onUpdate: st => { fin.p = st.progress; document.documentElement.classList.toggle("fin-red", st.progress > .66); },
      onRefresh: st => { finLayout(); fin.p = st.progress; document.documentElement.classList.toggle("fin-red", st.progress > .66); },
    },
  });
  fin.st = ftl.scrollTrigger;
  // created after every pin so their positions include the pin spacing
  // the crate section is the pinned element, so its own box would end the "live" range one screen into the pin
  ScrollTrigger.create({ start: () => crateST.start - innerHeight, end: () => crateST.end + innerHeight, onToggle: st => { crate.live = st.isActive; } });
  ScrollTrigger.create({ trigger: ".finale", start: "top bottom", end: "bottom top", onToggle: st => { fin.live = st.isActive; if (st.isActive) finRender(); } });
  ftl.to({}, { duration: .72 })
    .fromTo(".fin-copy .def", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .06 }, .72)
    .fromTo(fWords, { yPercent: 115 }, { yPercent: 0, duration: .1, stagger: .018, ease: "power3.out" }, .74)
    .fromTo(".fin-copy .coda-sub", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .06 }, .84)
    .fromTo(".fin-copy .cta-row", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .06 }, .87)
    .fromTo(".fin-copy .phone", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .06 }, .9)
    .fromTo("#talk", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: .1, ease: "back.out(1.6)" }, .86)
    .to({}, { duration: .04 });
}

/* ───────────── run ───────────── */
applyText();

if (motion) {
  gsap.registerPlugin(ScrollTrigger);
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // loading intro: the C draws itself, the counter runs, the screen lifts and the hero assembles
  const ldC = $("#ldC"), len = ldC.getTotalLength();
  gsap.set(ldC, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set(["#ldDisc", "#ldHole", "#ldDot"], { scale: 0, transformOrigin: "50% 50%" });
  lenis && lenis.stop();
  const cnt = { v: 0 };
  gsap.timeline({ onComplete: () => { $("#loader").remove(); lenis && lenis.start(); } })
    .to(ldC, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0)
    .to(cnt, { v: 100, duration: 1.3, ease: "power2.inOut", onUpdate: () => { $("#ldCount").textContent = String(Math.round(cnt.v)).padStart(3, "0"); } }, 0)
    .to("#ldBar", { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, 0)
    .to("#ldDisc", { scale: 1, duration: .5, ease: "back.out(2)" }, .75)
    .to("#ldHole", { scale: 1, duration: .4, ease: "back.out(2)" }, .9)
    .to("#ldDot", { scale: 1, duration: .45, ease: "back.out(3)" }, 1.05)
    .to(".ld-inner", { scale: .9, opacity: 0, duration: .45, ease: "power2.in" }, 1.45)
    .to("#loader", { yPercent: -100, duration: .9, ease: "power4.inOut" }, 1.6)
    .add(() => gsap.to(hero, { intro: 1, duration: 2, ease: "none" }), 1.75);
  let lastY = scrollY;
  ScrollTrigger.addEventListener("refresh", measureScroll);
  gsap.ticker.add((time, dt) => {
    const v = lenis ? (lenis.velocity || 0) : (scrollY - lastY); if (!lenis) lastY = scrollY;
    // record spins at a steady pace and speeds up smoothly while you scroll
    hero.spinV = lerp(hero.spinV || .07, .07 + Math.min(.9, Math.abs(v) * .03), .04);
    hero.spin = (hero.spin + dt * hero.spinV) % 360;
    hero.mx = lerp(hero.mx, hero.tx, .06); hero.my = lerp(hero.my, hero.ty, .06);
    const y = lenis ? lenis.scroll : scrollY;
    el.progress.style.transform = `scaleX(${scrollMax > 0 ? Math.min(1, y / scrollMax) : 0})`;
    if (hero.p < 1 || hero.intro < 1) heroRender();
    if (!deck.drag) { deck.speed = lerp(deck.speed, .2, .03); deck.rot += dt * deck.speed + Math.abs(v) * .5; }
    deck.arm += (deck.armTarget - deck.arm) * .08;
    deckDisc.setAttribute("transform", `rotate(${(deck.rot % 360).toFixed(2)})`);
    el.arm.setAttribute("transform", `rotate(${deck.arm.toFixed(2)} 54 -50)`);
    if (crate.live) crateRender();
    if (fin.live) finRender();
  });
} else {
  if (!reduce) setInterval(() => { deck.rot += 5; deckDisc.setAttribute("transform", `rotate(${deck.rot % 360})`); }, 25);
}

ctx = hasGsap && motion ? gsap.context(build) : (build(), null);
measureScroll();

/* cursor + magnetic buttons */
if (finePointer && motion) {
  document.documentElement.classList.add("has-cur");
  const cur = $("#cur"), dot = $(".cur-dot"), ring = $(".cur-ring");
  const m = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 };
  addEventListener("pointermove", e => { m.x = e.clientX; m.y = e.clientY; }, { passive: true });
  gsap.ticker.add(() => {
    m.rx = lerp(m.rx, m.x, .18); m.ry = lerp(m.ry, m.y, .18);
    dot.style.transform = `translate(${m.x}px,${m.y}px)`;
    ring.style.transform = `translate(${m.rx}px,${m.ry}px)`;
  });
  document.addEventListener("pointerover", e => {
    cur.classList.toggle("hover", !!e.target.closest("a,button,.track"));
  });
  const talk = $("#talk");
  $("#finStage").addEventListener("pointermove", e => {
    const r = talk.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(x, y), pull = d < 320 ? (1 - d / 320) : 0;
    gsap.to(talk, { x: x * pull * .45, y: y * pull * .45, duration: .6, ease: "power3.out" });
  });
  $("#finStage").addEventListener("pointerleave", () => gsap.to(talk, { x: 0, y: 0, duration: .9, ease: "elastic.out(1,.45)" }));
  $$(".mag").forEach(b => {
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .4, ease: "power3.out" });
    });
    b.addEventListener("pointerleave", () => gsap.to(b, { x: 0, y: 0, duration: .7, ease: "elastic.out(1,.4)" }));
  });
}

// nav background once the hero is behind us
const nav = $("#nav");
const onScroll = () => { nav.classList.toggle("solid", $(".manifesto").getBoundingClientRect().top < 80); };
addEventListener("scroll", onScroll, { passive: true });
onScroll();

$("#tracklist").addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.closest(".track")) { e.preventDefault(); e.target.closest(".track").click(); }
});
// click a track to play it: scroll so it sits on the needle line
$("#tracklist").addEventListener("click", e => {
  const t = e.target.closest(".track"); if (!t) return;
  const r = t.getBoundingClientRect(), y = scrollY + r.top + r.height / 2 - innerHeight * .58;
  if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
});

/* ───────────── mobile menu ───────────── */
const menuBtn = $("#menuBtn"), mmenu = $("#mmenu");
const menuOutside = () => [$("main"), $(".nav-logo"), $("#sndBtn"), $("#langBtn"), $(".nav-cta"), $("#pill")];
function setMenu(open, instant) {
  if (open === menu.open) return;
  menu.open = open;
  const root = document.documentElement;
  if (instant) { root.classList.add("mm-instant"); requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("mm-instant"))); }
  if (open) {
    // the red circle grows out of the button
    const r = menuBtn.getBoundingClientRect();
    mmenu.style.setProperty("--ox", (r.left + r.width / 2) + "px");
    mmenu.style.setProperty("--oy", (r.top + r.height / 2) + "px");
  }
  root.classList.toggle("menu-open", open);
  mmenu.inert = !open;
  mmenu.setAttribute("aria-hidden", String(!open));
  menuOutside().forEach(n => { if (n) n.inert = open; });
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? T[lang].menu_close : T[lang].menu_open);
  if (lenis) open ? lenis.stop() : lenis.start();
  updatePill();
  if (open) mmenu.querySelector("a").focus({ preventScroll: true });
  else menuBtn.focus({ preventScroll: true });
}
menuBtn.addEventListener("click", () => setMenu(!menu.open));
document.addEventListener("keydown", e => {
  if (!menu.open) return;
  if (e.key === "Escape") { e.preventDefault(); setMenu(false); return; }
  if (e.key !== "Tab") return;
  const items = [menuBtn, ...mmenu.querySelectorAll("a")], i = items.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
  else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
});

/* ───────────── WhatsApp pill: shown between the hero and the finale ───────────── */
const pill = { hero: true, fin: false };
function updatePill() { document.documentElement.classList.toggle("pill-on", !pill.hero && !pill.fin && !menu.open); }
if ("IntersectionObserver" in window) {
  // the hero counts as gone once it has left the lower 60% of the screen
  new IntersectionObserver(es => { pill.hero = es[es.length - 1].isIntersecting; updatePill(); }, { rootMargin: "-40% 0px 0px 0px" }).observe($(".hero"));
  new IntersectionObserver(es => { pill.fin = es[es.length - 1].isIntersecting; updatePill(); }).observe($(".finale"));
}

/* ───────────── touch ───────────── */
// a persistent touchstart listener also lets iOS apply :active press styles
let touched = false;
addEventListener("touchstart", () => { touched = true; }, { passive: true });
const canBuzz = /Android/i.test(navigator.userAgent) && typeof navigator.vibrate === "function";
function buzz() { if (canBuzz && touched) try { navigator.vibrate(8); } catch (e) {} }

/* ───────────── sound (off until the visitor turns it on) ───────────── */
const audio = { ac: null, master: null, on: false };
function audioStart() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  const ac = new AC(), master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  // vinyl crackle: soft hiss with random pops, looped
  const len = ac.sampleRate * 6, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    d[i] += (Math.random() * 2 - 1) * .018;
    if (Math.random() < .00035) { const amp = (Math.random() * .6 + .2) * (Math.random() < .5 ? -1 : 1); for (let j = 0; j < 60 && i + j < len; j++) d[i + j] += amp * Math.exp(-j / 9); }
  }
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
  const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 700;
  const cg = ac.createGain(); cg.gain.value = .55;
  src.connect(hp); hp.connect(cg); cg.connect(master); src.start();
  // warm low pad underneath
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.connect(master);
  [[110, .022], [164.81, .014], [220.5, .008]].forEach(([f, g]) => {
    const o = ac.createOscillator(), og = ac.createGain(); o.type = "triangle"; o.frequency.value = f; og.gain.value = g;
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .08 + Math.random() * .1; lg.gain.value = g * .6;
    lfo.connect(lg); lg.connect(og.gain); o.connect(og); og.connect(lp); o.start(); lfo.start();
  });
  Object.assign(audio, { ac, master });
  return true;
}
function setSound(on) {
  if (on && !audio.ac && !audioStart()) return;
  if (!audio.ac) return;
  audio.on = on;
  const { ac, master } = audio;
  if (on && ac.state === "suspended") ac.resume();
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setTargetAtTime(on ? .9 : 0, ac.currentTime, on ? .5 : .15);
  if (!on) setTimeout(() => { if (!audio.on) ac.suspend(); }, 900);
  const b = $("#sndBtn"); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
  b.setAttribute("aria-label", on ? T[lang].snd_off : T[lang].snd_on);
  if (on) sfxNeedle();
}
$("#sndBtn").addEventListener("click", () => setSound(!audio.on));
function sfxNeedle() {
  if (!audio.on) return;
  const { ac, master } = audio, t = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(38, t + .28);
  g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.001, t + .35);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + .4);
}
function sfxTick() {
  if (!audio.on) return;
  const { ac, master } = audio, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = "square"; o.frequency.value = 1800; g.gain.setValueAtTime(.035, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + .06);
}

// anchor links through Lenis
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href");
  const node = id === "#top" ? document.body : $(id);
  if (!node) return;
  e.preventDefault();
  const jump = () => {
    let target = id === "#top" ? 0 : node;
    if (id === "#contact" && fin.st) target = fin.st.start + (fin.st.end - fin.st.start) * .97;
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else if (typeof target === "number") scrollTo(0, target); else target.scrollIntoView();
  };
  const go = a.closest("#mmenu") ? () => { setMenu(false, true); jump(); } : jump;
  if (motion) curtain(go); else go();
});

// keyboard users tabbing into the finale land on the finished state
$("#finCopy").addEventListener("focusin", () => {
  if (!motion || !fin.st || fin.p >= .9) return;
  const y = fin.st.start + (fin.st.end - fin.st.start) * .97;
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
});

// red curtain: covers the screen, runs the action, then lifts away
let curtainBusy = false;
function curtain(action) {
  if (curtainBusy) return; curtainBusy = true;
  const c = $("#curtain");
  gsap.timeline({ onComplete: () => { curtainBusy = false; gsap.set(c, { visibility: "hidden" }); } })
    .set(c, { visibility: "visible" })
    .fromTo(c, { yPercent: 100 }, { yPercent: 0, duration: .55, ease: "power4.inOut" })
    .fromTo("#curtain svg", { scale: .6, rotation: -90, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: .45, ease: "power3.out" }, .2)
    .add(sfxNeedle, .1)
    .add(() => { action(); ScrollTrigger.update(); }, .6)
    .to("#curtain svg", { scale: .8, opacity: 0, duration: .25, ease: "power2.in" }, .75)
    .to(c, { yPercent: -100, duration: .6, ease: "power4.inOut" }, .85);
}

// language switch: rebuild every scene with the new text and direction
$("#langBtn").addEventListener("click", () => { if (motion) curtain(switchLang); else switchLang(); });
function switchLang() {
  let current = "top";
  $$("main section[id]").forEach(s => { if (s.getBoundingClientRect().top <= innerHeight * .3) current = s.id; });
  const finP = fin.p;
  lang = isRTL() ? "en" : "ar";
  try { history.replaceState(null, "", LANG_PATH[lang]); } catch (e) {}
  if (ctx) ctx.revert();
  document.documentElement.classList.remove("fin-red");
  deck.active = -1; crate.front = -1;
  applyText();
  if (motion) { ctx = gsap.context(build); ScrollTrigger.refresh(); } else build();
  let target = current === "top" ? 0 : $("#" + current);
  if (current === "contact" && fin.st) target = fin.st.start + (fin.st.end - fin.st.start) * finP;
  if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
  else if (typeof target === "number") scrollTo(0, target); else if (target) target.scrollIntoView();
}

// copy phone number
$("#copyBtn").addEventListener("click", () => {
  const btn = $("#copyBtn"), num = "+963930003142";
  const done = () => { btn.textContent = T[lang].copied; setTimeout(() => { btn.textContent = T[lang].copy; }, 1800); };
  const select = () => { const r = document.createRange(); r.selectNodeContents($("#phoneNum")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
  try { navigator.clipboard.writeText(num).then(done, select); } catch (e) { select(); }
});

let rzW = innerWidth, rzH = innerHeight, rzT = 0;
addEventListener("resize", () => {
  if (innerWidth === rzW && Math.abs(innerHeight - rzH) < 120) return;
  clearTimeout(rzT);
  rzT = setTimeout(() => { rzW = innerWidth; rzH = innerHeight; measureScroll(); if (!phone() && menu.open) setMenu(false, true); heroLayout(); finLayout(); buildWave(); if (!motion) { heroRender(); finRender(); } }, 150);
});
if (finePointer && motion) addEventListener("pointermove", e => {
  hero.tx = e.clientX / innerWidth - .5; hero.ty = e.clientY / innerHeight - .5;
}, { passive: true });
if (document.fonts && motion) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
