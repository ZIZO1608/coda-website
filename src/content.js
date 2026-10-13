/* Site content and the HTML renderers for the dynamic sections.
   Shared by the browser (app.js) and the build (build.mjs), which pre-renders
   the same markup so search engines and AI crawlers read the full page without JS. */
(() => {
const T = {
  en: {
    seo_title: "CODA Media | Creative Media & Advertising Agency in Aleppo, Syria",
    seo_desc: "CODA is a creative media agency in Aleppo, Syria: video production & reels, photography, social media management, ad campaigns, design and AI-powered advertising.",
    lang_btn: "العربية", lang_btn_aria: "التبديل إلى العربية", nav_about: "About", nav_services: "Services", nav_crew: "Team", nav_clients: "Clients", nav_cta: "Start a project",
    nav_contact: "Contact", menu_title: "Menu", menu_open: "Open menu", menu_close: "Close menu",
    hero_kicker: "Creative media agency in Aleppo, Syria",
    hero_lines: ["The twist", "your audience", "remembers."],
    now_playing: "Now playing", track_name: "Manifesto", snd_on: "Turn sound on", snd_off: "Turn sound off", scroll_down: "Scroll down",
    hero_cta: "Start your story",
    hole: "We are CODA.",
    manifesto: "A creative media agency from Aleppo. We plan, shoot, write and launch, and every campaign carries one moment built to stop the scroll. That moment is the twist.",
    twist_a: "Every brand has a story", twist_b: "We write the twist",
    twist_note: "Every campaign gets one idea people repeat to each other. Finding it is our job.",
    services_title: "What we do",
    services_sub: "Nine services on one record. Keep scrolling and the needle plays them in order.",
    side_a: "Side A", side_b: "Side B",
    process_title: "How we work",
    process_sub: "Every project follows the same five steps, so you always know what happens next.",
    steps: [["Meet & brief", "We meet, learn how your business works and write the brief together."],
            ["Strategy", "Who your customer is, what we tell them, and where we say it."],
            ["Plan & offer", "A clear plan, timeline and price that you approve before work starts."],
            ["Production", "Scripts, shoots, design and editing, with your review after the first session."],
            ["Launch & follow-up", "We publish, track what works and adjust the plan."]],
    crew_title: "The team", crew_sub: "Five specialists, one studio in Aleppo. Strategy, design, film, photography and AI under one roof.",
    clients_title: "Brands we've worked with",
    clients_sub: "Delivery, retail, architecture, fashion and health brands. Scroll to flip through them.",
    coda_def: "<b>coda</b>, noun: the closing passage of a piece of music.",
    contact_title: "Ready for your twist?",
    contact_sub: "Tell us what you're launching, and we'll plan the moment people remember.",
    contact_wa: "Message us on WhatsApp", copy: "Copy number", copied: "Copied", talk: "Let's talk",
    footer: "CODA Media Agency, Aleppo, Syria",
  },
  ar: {
    seo_title: "كودا ميديا | وكالة إعلامية وإعلانية إبداعية في حلب، سوريا",
    seo_desc: "كودا وكالة إعلامية إبداعية في حلب، سوريا: إنتاج الفيديو والريلز، التصوير الفوتوغرافي، إدارة وسائل التواصل، الحملات الإعلانية، التصميم والإعلان بالذكاء الاصطناعي.",
    lang_btn: "English", lang_btn_aria: "Switch to English", nav_about: "من نحن", nav_services: "الخدمات", nav_crew: "الفريق", nav_clients: "العملاء", nav_cta: "ابدأ مشروعك",
    nav_contact: "تواصل معنا", menu_title: "القائمة", menu_open: "فتح القائمة", menu_close: "إغلاق القائمة",
    hero_kicker: "وكالة إعلامية إبداعية في حلب، سوريا",
    hero_lines: ["اللفتة", "التي لا ينساها", "جمهورك."],
    now_playing: "قيد التشغيل", track_name: "البيان", snd_on: "تشغيل الصوت", snd_off: "إيقاف الصوت", scroll_down: "انتقل للأسفل",
    hero_cta: "ابدأ قصتك",
    hole: "نحن كودا.",
    manifesto: "وكالة إعلامية إبداعية من حلب. نخطط ونصوّر ونكتب ونطلق، وفي كل حملة لحظة واحدة مصمَّمة لتوقف التمرير. تلك اللحظة هي اللفتة.",
    twist_a: "لكل علامة قصة", twist_b: "ونحن نكتب اللفتة",
    twist_note: "في كل حملة فكرة واحدة يردّدها الناس فيما بينهم. إيجادها هو عملنا.",
    services_title: "ماذا نقدّم",
    services_sub: "تسع خدمات على أسطوانة واحدة. تابع التمرير وستعزفها الإبرة بالترتيب.",
    side_a: "الوجه A", side_b: "الوجه B",
    process_title: "كيف نعمل",
    process_sub: "كل مشروع يمرّ بالخطوات الخمس نفسها، لتعرف دائماً ما الخطوة التالية.",
    steps: [["اللقاء والبريف", "نلتقي ونفهم طريقة عمل مشروعك ونكتب البريف معاً."],
            ["الاستراتيجية", "من هو عميلك، وماذا نقول له، وأين نقوله."],
            ["الخطة والعرض", "خطة وجدول زمني وسعر واضح توافق عليه قبل أن نبدأ."],
            ["الإنتاج", "سكربتات وتصوير وتصميم ومونتاج، مع مراجعتك بعد الجلسة الأولى."],
            ["الإطلاق والمتابعة", "ننشر ونتابع ما ينجح ونعدّل الخطة."]],
    crew_title: "الفريق", crew_sub: "خمسة اختصاصيين في استوديو واحد في حلب: استراتيجية وتصميم وفيديو وتصوير وذكاء اصطناعي تحت سقف واحد.",
    clients_title: "علامات عملنا معها",
    clients_sub: "علامات في التوصيل والتجزئة والعمارة والأزياء والصحة. مرّر لتتصفّحها.",
    coda_def: "<b>كودا</b>: المقطع الختامي في قطعة موسيقية.",
    contact_title: "جاهز للفتتك؟",
    contact_sub: "أخبرنا بما تطلقه، ونخطط معاً للّحظة التي سيتذكرها الناس.",
    contact_wa: "راسلنا على واتساب", copy: "انسخ الرقم", copied: "تم النسخ", talk: "لنتحدث",
    footer: "وكالة كودا الإعلامية، حلب، سوريا",
  }
};

const SERVICES = [
  { c: "A1", en: ["Video production & reels", "Cinematic content that moves people."], ar: ["إنتاج الفيديو والريلز", "محتوى سينمائي يحرّك المشاعر."] },
  { c: "A2", en: ["Photography", "Moments held still, on purpose."], ar: ["التصوير الفوتوغرافي", "لحظات نوقفها لغاية واضحة."] },
  { c: "A3", en: ["Social media management", "Your brand in the feed, every day."], ar: ["إدارة وسائل التواصل", "علامتك حاضرة في الصفحة كل يوم."] },
  { c: "A4", en: ["Ad campaigns", "Targeted, bold and hard to forget."], ar: ["الحملات الإعلانية", "موجّهة وجريئة ويصعب نسيانها."] },
  { c: "A5", en: ["Content writing", "Words that make people stop and read."], ar: ["كتابة المحتوى", "كلمات تجعل الناس يتوقفون ليقرؤوا."] },
  { c: "B1", en: ["Graphic design & posts", "A visual identity, built post by post."], ar: ["التصميم الغرافيكي والمنشورات", "هوية بصرية تُبنى منشوراً بعد منشور."] },
  { c: "B2", en: ["AI-powered advertising", "Faster ideas and wider reach, made with AI."], ar: ["الإعلان بالذكاء الاصطناعي", "أفكار أسرع ووصول أوسع بالذكاء الاصطناعي."] },
  { c: "B3", en: ["Startup launch plans", "From the first idea to opening day."], ar: ["خطط إطلاق الشركات", "من الفكرة الأولى حتى يوم الافتتاح."] },
  { c: "B4", en: ["Twist Cases", "Our signature strategy package."], ar: ["تويست كيس", "باقتنا الاستراتيجية الخاصة."] },
];

const CREW = [
  { n: "Ahmad Gebar", img: "/img/ahmad.webp",
    en: ["CEO & Creative Director", "Leads strategy, briefs and copy."],
    ar: ["المدير التنفيذي والمدير الإبداعي", "يقود الاستراتيجية والبريف وكتابة المحتوى."] },
  { n: "Abdulrahman Hallak", img: "/img/abdullah.webp",
    en: ["Graphic Designer", "Visual identities, posts and campaign design."],
    ar: ["مصمم غرافيك", "الهويات البصرية والمنشورات وتصاميم الحملات."] },
  { n: "Ghaith", img: "/img/ghaith.webp",
    en: ["Video Editor", "Edits reels, ads and long-form films."],
    ar: ["مونتير", "مونتاج الريلز والإعلانات والأفلام الطويلة."] },
  { n: "Hikmat Akil", img: "/img/hikmat.webp",
    en: ["Photographer", "Product, people and on-location shoots."],
    ar: ["مصوّر فوتوغرافي", "تصوير المنتجات والأشخاص والتصوير الميداني."] },
  { n: "Zaven Jooharian", img: "/img/zaven.webp",
    en: ["AI Artist & AI Advertiser", "AI visuals and AI-driven ad campaigns."],
    ar: ["فنان ومعلن بالذكاء الاصطناعي", "صور وحملات إعلانية مبنية على الذكاء الاصطناعي."] },
];

// Logos are white-on-black; blend modes tint them to each sleeve. FadArch is a portrait photo.
const CLIENTS = [
  ["Algo", "algo"], ["Sugar Rush", "sugar-rush"], ["Aroma", "aroma"], ["Autosan", "autosan"],
  ["Murakkan", "murakkan"], ["Superman Delivery", "superman"], ["Liwan", "liwan"], ["Ghost", "ghost"],
  ["Serjo Store", "serjo"], ["FadArch", "fadarch", true], ["Professional Design", "prodesign"], ["Tilal Afrin", "tilal"],
  ["Human Care", "human-care"], ["Bloom Style", "bloom-style"], ["Ahmad Asaad Abo Ras Sons & Co.", "ahmad-asaad"],
  ["Vilo", "vilo"], ["Top Light", "top-light"], ["Isaval", "isaval"],
];
const SLEEVE_STYLES = ["s-paper", "s-red", "s-black"];

// The logo's hand-drawn record, centred on its hole (same scale as the old r=49.1 circle).
// minR / holeMinR are the smallest radii, used where the disc or hole must cover the whole screen.
const LOGO_DISC = {
  outer: "M50.04,0 C49.85,2.32 49.42,4.64 48.86,6.87 C48.3,9.1 47.57,11.3 46.7,13.39 C45.83,15.49 44.8,17.52 43.66,19.44 C42.52,21.36 41.22,23.18 39.87,24.92 C38.53,26.65 37.09,28.3 35.58,29.85 C34.06,31.4 32.46,32.85 30.8,34.21 C29.15,35.57 27.41,36.82 25.63,38 C23.85,39.17 22.01,40.26 20.12,41.26 C18.23,42.25 16.28,43.15 14.28,43.95 C12.28,44.74 10.22,45.45 8.12,46.03 C6.01,46.61 3.85,47.1 1.66,47.45 C-0.54,47.81 -2.79,48.07 -5.06,48.16 C-7.33,48.26 -9.66,48.23 -11.97,48.03 C-14.29,47.82 -16.68,47.53 -18.97,46.95 C-21.27,46.38 -23.57,45.58 -25.74,44.59 C-27.92,43.6 -30.08,42.4 -32.04,41.01 C-34,39.61 -35.85,37.97 -37.52,36.23 C-39.19,34.49 -40.73,32.56 -42.05,30.55 C-43.38,28.54 -44.52,26.37 -45.45,24.16 C-46.37,21.96 -47.06,19.63 -47.61,17.33 C-48.15,15.03 -48.48,12.67 -48.72,10.36 C-48.97,8.04 -49.08,5.73 -49.08,3.43 C-49.08,1.14 -48.98,-1.15 -48.73,-3.41 C-48.48,-5.67 -48.11,-7.92 -47.58,-10.11 C-47.06,-12.31 -46.39,-14.49 -45.59,-16.59 C-44.79,-18.7 -43.85,-20.77 -42.78,-22.75 C-41.72,-24.73 -40.53,-26.67 -39.2,-28.48 C-37.87,-30.29 -36.39,-32.01 -34.82,-33.63 C-33.26,-35.24 -31.58,-36.77 -29.81,-38.16 C-28.05,-39.55 -26.17,-40.83 -24.24,-41.98 C-22.3,-43.13 -20.27,-44.15 -18.2,-45.04 C-16.13,-45.94 -13.98,-46.69 -11.8,-47.34 C-9.63,-47.99 -7.4,-48.56 -5.15,-48.96 C-2.89,-49.36 -0.58,-49.64 1.74,-49.74 C4.05,-49.85 6.45,-49.9 8.74,-49.56 C11.03,-49.22 13.32,-48.5 15.5,-47.7 C17.68,-46.89 19.79,-45.86 21.82,-44.75 C23.85,-43.63 25.8,-42.36 27.67,-41.03 C29.54,-39.69 31.34,-38.24 33.05,-36.71 C34.77,-35.18 36.41,-33.56 37.96,-31.85 C39.51,-30.14 40.99,-28.35 42.33,-26.45 C43.66,-24.55 44.9,-22.54 45.96,-20.46 C47.01,-18.38 47.95,-16.18 48.63,-13.95 C49.32,-11.71 49.81,-9.36 50.04,-7.03 C50.28,-4.71 50.24,-2.32 50.04,0Z",
  hole: "M12.83,0 C12.84,1.46 12.57,3.03 12.06,4.39 C11.54,5.75 10.7,7.09 9.74,8.17 C8.77,9.25 7.53,10.16 6.27,10.86 C5.01,11.56 3.59,12.1 2.18,12.36 C0.77,12.62 -0.77,12.64 -2.19,12.41 C-3.61,12.18 -5.09,11.7 -6.35,10.99 C-7.6,10.28 -8.8,9.28 -9.75,8.18 C-10.69,7.07 -11.51,5.74 -12.02,4.37 C-12.52,3.01 -12.77,1.46 -12.76,0 C-12.76,-1.46 -12.5,-3.01 -12,-4.37 C-11.49,-5.73 -10.67,-7.06 -9.72,-8.16 C-8.78,-9.26 -7.59,-10.26 -6.33,-10.97 C-5.08,-11.67 -3.6,-12.15 -2.18,-12.38 C-0.77,-12.62 0.76,-12.59 2.18,-12.35 C3.59,-12.11 5.05,-11.62 6.31,-10.93 C7.57,-10.23 8.8,-9.28 9.75,-8.18 C10.7,-7.09 11.5,-5.74 12.02,-4.37 C12.53,-3.01 12.82,-1.46 12.83,0Z",
  minR: 45.83, holeMinR: 12.50,
};

/* ───────────── renderers (return HTML strings) ───────────── */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const render = {
  heroH1: lang => T[lang].hero_lines.map(l => `<span class="ln"><span>${esc(l)}</span></span>`).join(" "),

  manifesto: lang => T[lang].manifesto.split(" ").map(w => `<span class="wd">${esc(w)}</span>`).join(" "),

  // LTR splits into letters for the flip; Arabic stays whole-word so the letters keep joining
  drumLine: (lang, text, dot) => {
    const words = text.split(" ");
    return words.map((w, wi) => {
      const units = lang === "ar" ? [w] : [...w];
      let html = units.map(u => `<span class="ch">${esc(u)}</span>`).join("");
      if (dot && wi === words.length - 1) html += `<span class="ch dotp"></span>`;
      return `<span class="w">${html}</span>`;
    }).join(" ");
  },

  tracklist: lang => {
    const d = T[lang];
    let html = "", side = "";
    SERVICES.forEach((s, i) => {
      const sd = s.c[0];
      if (sd !== side) { side = sd; html += `<li class="side" aria-hidden="true">${sd === "A" ? d.side_a : d.side_b}</li>`; }
      const [t, p] = s[lang];
      html += `<li class="track" data-i="${i}" tabindex="0" role="button"><span class="t-code">${s.c}</span><div><h3>${esc(t)}</h3><p>${esc(p)}</p></div></li>`;
    });
    return html;
  },

  steps: lang => T[lang].steps.map(([t, p], i) =>
    `<li class="step"><span class="st-n" dir="ltr">${String(i + 1).padStart(2, "0")}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join(""),

  crew: lang => {
    const d = T[lang];
    return `<div class="crew-intro"><h2>${esc(d.crew_title)}</h2><p>${esc(d.crew_sub)}</p></div>` +
      CREW.map(m => `<article class="member"><figure><span class="glare"></span><img src="${m.img}" alt="${esc(m.n)}, ${esc(m[lang][0])}" loading="lazy" width="720" height="900"></figure><h3 dir="ltr">${esc(m.n)}</h3><p class="role">${esc(m[lang][0])}</p><p class="quote">${esc(m[lang][1])}</p></article>`).join("");
  },

  crateTicks: () => CLIENTS.map(() => "<i></i>").join(""),

  crate: () => `<div class="crate-disc" id="crateDisc"></div>` + CLIENTS.map(([name, file, photo], i) => `<div class="sleeve ${SLEEVE_STYLES[i % 3]}" data-i="${i}">
    <span class="wear"></span>
    <img src="/logos/${file}.webp" alt="${esc(name)}${photo ? "" : " logo"}"${photo ? ' class="photo"' : ""} loading="lazy" decoding="async">
    <span class="s-name">${esc(name)}</span>
    <span class="cat" dir="ltr"><span>CODA-${String(i + 1).padStart(3, "0")}</span><span>33⅓</span></span>
  </div>`).join(""),
};

globalThis.CODA = { T, SERVICES, CREW, CLIENTS, LOGO_DISC, render, esc };
})();
