// Builds the static site into dist/: a pre-rendered page per language (/ and /ar/),
// plus robots.txt, sitemap.xml, llms.txt and the web manifest.
//   node build.mjs           build once
//   node build.mjs --serve   build, serve on http://localhost:3000 and rebuild on change
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import http from "node:http";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, "src"), PUB = path.join(ROOT, "public"), DIST = path.join(ROOT, "dist");
const LANGS = ["en", "ar"];
const LANG_PATH = { en: "/", ar: "/ar/" };
const OG_LOCALE = { en: "en_US", ar: "ar_SY" };

async function loadConfig() {
  const url = pathToFileURL(path.join(ROOT, "site.config.mjs")).href + "?t=" + Date.now();
  return (await import(url)).default;
}

function loadContent(code) {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.CODA;
}

const escAttr = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const stripTags = s => String(s).replace(/<[^>]+>/g, "");

/* ───────────── structured data ───────────── */
function jsonLd(site, C, lang) {
  const { T, SERVICES, CREW } = C, d = T[lang], base = site.url;
  const pageUrl = base + LANG_PATH[lang];
  const orgId = base + "/#organization";
  const addr = site.address;
  const org = {
    "@type": ["ProfessionalService", "Organization"],
    "@id": orgId,
    name: site.name[lang],
    alternateName: [site.name[lang === "en" ? "ar" : "en"], ...site.alternateNames],
    url: base + "/",
    logo: { "@type": "ImageObject", url: base + "/icon-512.png", width: 512, height: 512 },
    image: base + `/og-${lang}.png`,
    description: d.seo_desc,
    slogan: site.slogan[lang],
    telephone: site.phone,
    email: site.email || undefined,
    foundingDate: site.foundingDate || undefined,
    priceRange: site.priceRange || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: addr.street[lang] || undefined,
      addressLocality: addr.locality[lang],
      addressRegion: addr.region[lang],
      postalCode: addr.postalCode || undefined,
      addressCountry: addr.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapUrl || undefined,
    areaServed: [
      { "@type": "City", name: addr.locality[lang] },
      { "@type": "Country", name: lang === "ar" ? "سوريا" : "Syria" },
    ],
    knowsLanguage: ["ar", "en"],
    knowsAbout: SERVICES.map(s => s[lang][0]),
    sameAs: site.sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: site.phone,
      url: site.whatsapp,
      availableLanguage: ["Arabic", "English"],
      areaServed: addr.country,
    },
    openingHoursSpecification: site.openingHours.length
      ? site.openingHours.map(h => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.days, opens: h.opens, closes: h.closes }))
      : undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: d.services_title,
      itemListElement: SERVICES.map(s => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s[lang][0],
          description: s[lang][1],
          provider: { "@id": orgId },
          areaServed: { "@type": "Country", name: lang === "ar" ? "سوريا" : "Syria" },
        },
      })),
    },
    employee: CREW.map(m => ({
      "@type": "Person",
      name: m.n,
      jobTitle: m[lang][0],
      description: m[lang][1],
      image: base + m.img,
      worksFor: { "@id": orgId },
    })),
  };
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebSite", "@id": base + "/#website", url: base + "/", name: site.name.en,
        alternateName: site.name.ar, inLanguage: ["en", "ar"], publisher: { "@id": orgId },
      },
      {
        "@type": "WebPage", "@id": pageUrl + "#webpage", url: pageUrl, name: d.seo_title, description: d.seo_desc,
        inLanguage: lang, isPartOf: { "@id": base + "/#website" }, about: { "@id": orgId },
        primaryImageOfPage: { "@type": "ImageObject", url: base + `/og-${lang}.png`, width: 1200, height: 630 },
      },
    ],
  };
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}

/* ───────────── <head> ───────────── */
function head(site, C, lang) {
  const d = C.T[lang], base = site.url, url = base + LANG_PATH[lang];
  const other = lang === "en" ? "ar" : "en";
  const v = site.verification;
  const tags = [
    `<title>${escAttr(d.seo_title)}</title>`,
    `<meta name="description" content="${escAttr(d.seo_desc)}">`,
    `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">`,
    `<link rel="canonical" href="${url}">`,
    ...LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${base + LANG_PATH[l]}">`),
    `<link rel="alternate" hreflang="x-default" href="${base}/">`,
    `<meta name="author" content="${escAttr(site.name[lang])}">`,
    `<meta name="theme-color" content="#000000">`,
    `<meta name="format-detection" content="telephone=no">`,
    // local / geo targeting
    `<meta name="geo.region" content="${site.geoRegion}">`,
    `<meta name="geo.placename" content="${escAttr(site.address.locality[lang])}">`,
    `<meta name="geo.position" content="${site.geo.lat};${site.geo.lng}">`,
    `<meta name="ICBM" content="${site.geo.lat}, ${site.geo.lng}">`,
    // social previews (WhatsApp, Facebook, Instagram DMs, LinkedIn, X)
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escAttr(site.name[lang])}">`,
    `<meta property="og:title" content="${escAttr(d.seo_title)}">`,
    `<meta property="og:description" content="${escAttr(d.seo_desc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${base}/og-${lang}.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escAttr(site.name[lang] + " — " + d.hero_kicker)}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    `<meta property="og:locale:alternate" content="${OG_LOCALE[other]}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escAttr(d.seo_title)}">`,
    `<meta name="twitter:description" content="${escAttr(d.seo_desc)}">`,
    `<meta name="twitter:image" content="${base}/og-${lang}.png">`,
    // icons
    `<link rel="icon" href="/favicon.ico" sizes="32x32">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    `<link rel="manifest" href="/site.webmanifest">`,
    v.google && `<meta name="google-site-verification" content="${escAttr(v.google)}">`,
    v.bing && `<meta name="msvalidate.01" content="${escAttr(v.bing)}">`,
    v.yandex && `<meta name="yandex-verification" content="${escAttr(v.yandex)}">`,
    `<script type="application/ld+json">${jsonLd(site, C, lang)}</script>`,
  ];
  return tags.filter(Boolean).join("\n");
}

/* ───────────── page ───────────── */
function page(site, C, template, contentJs, appJs, lang) {
  const { T, CLIENTS, render, esc } = C, d = T[lang];
  const slots = {
    LANG: lang, DIR: lang === "ar" ? "rtl" : "ltr",
    HEAD: head(site, C, lang),
    SND_ARIA: escAttr(d.snd_on), SCROLL_ARIA: escAttr(d.scroll_down),
    MENU_ARIA: escAttr(d.menu_open),
    LANG_BTN_ARIA: escAttr(d.lang_btn_aria), LANG_LABEL_CLASS: lang === "ar" ? "" : "ar-face",
    HERO_H1: render.heroH1(lang), MANIFESTO: render.manifesto(lang),
    DRUM_LABEL: escAttr(`${d.twist_a}. ${d.twist_b}.`),
    DRUM_A: render.drumLine(lang, d.twist_a, false), DRUM_B: render.drumLine(lang, d.twist_b, true),
    TRACKLIST: render.tracklist(lang), STEPS: render.steps(lang), CREW: render.crew(lang),
    DISC: C.LOGO_DISC.outer, HOLE: C.LOGO_DISC.hole,
    CRATE: render.crate(), CRATE_TICKS: render.crateTicks(), CLIENT_COUNT: String(CLIENTS.length),
    CONTENT_JS: contentJs, APP_JS: appJs,
  };
  let html = template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => {
    if (!(k in slots)) throw new Error("Unknown template slot " + m);
    return slots[k];
  });
  // fill the static [data-t] / [data-t-html] elements with this language's text
  html = html.replace(/(<([a-z0-9]+)\b[^>]*?\sdata-t="([a-z_]+)"[^>]*>)[^<]*(<\/\2>)/g,
    (m, open, tag, key, close) => typeof d[key] === "string" ? open + esc(d[key]) + close : m);
  html = html.replace(/(<([a-z0-9]+)\b[^>]*?\sdata-t-html="([a-z_]+)"[^>]*>)[^<]*(<\/\2>)/g,
    (m, open, tag, key, close) => open + d[key] + close);
  return html;
}

/* ───────────── extra files ───────────── */
const today = () => new Date().toISOString().slice(0, 10);

function sitemap(site) {
  const alts = LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${site.url + LANG_PATH[l]}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${site.url}/"/>`).join("\n");
  const urls = LANGS.map(l => `  <url>
    <loc>${site.url + LANG_PATH[l]}</loc>
    <lastmod>${today()}</lastmod>
${alts}
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function robots(site) {
  return `# Search engines and AI assistants are welcome to read and cite this site.
User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`;
}

// llms.txt: a plain summary for AI assistants (ChatGPT, Claude, Perplexity, Gemini) — see llmstxt.org
function llms(site, C) {
  const { T, SERVICES, CREW, CLIENTS } = C, en = T.en, ar = T.ar;
  const a = site.address;
  const where = [a.street.en, a.locality.en, a.region.en, "Syria"].filter(Boolean).join(", ");
  return `# ${site.name.en} (${site.name.ar})

> ${site.name.en} is a creative media and advertising agency based in ${a.locality.en}, Syria. It plans, shoots, writes and launches campaigns for brands: video production and reels, photography, social media management, ad campaigns, content writing, graphic design, AI-powered advertising and startup launch plans. Bilingual team working in Arabic and English.

- Website (English): ${site.url}/
- Website (Arabic): ${site.url}/ar/
- Location: ${where}
- Phone / WhatsApp: ${site.phone} (${site.whatsapp})
${site.email ? `- Email: ${site.email}\n` : ""}${site.sameAs.map(u => `- Profile: ${u}`).join("\n")}

## About

${en.manifesto} ${en.twist_note}

Name origin: ${stripTags(en.coda_def)}

## Services

${SERVICES.map(s => `- **${s.en[0]}** (${s.ar[0]}): ${s.en[1]}`).join("\n")}

## How we work

${en.steps.map(([t, p], i) => `${i + 1}. **${t}**: ${p}`).join("\n")}

## Team

${CREW.map(m => `- **${m.n}**, ${m.en[0]}: ${m.en[1]}`).join("\n")}

## Clients

Brands CODA has worked with: ${CLIENTS.map(c => c[0]).join(", ")}.

## Contact

${en.contact_sub} Message on WhatsApp: ${site.whatsapp} or call ${site.phone}.

## بالعربية

${site.name.ar} — ${ar.hero_kicker}. ${ar.manifesto}

الخدمات: ${SERVICES.map(s => s.ar[0]).join("، ")}.

للتواصل: واتساب ${site.whatsapp} أو الهاتف ${site.phone}.
`;
}

function manifest(site) {
  return JSON.stringify({
    name: site.name.en, short_name: "CODA", description: "Creative media agency in Aleppo, Syria",
    start_url: "/", display: "standalone", background_color: "#000000", theme_color: "#000000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }, null, 2);
}

/* ───────────── build ───────────── */
async function build() {
  const t0 = Date.now();
  const site = await loadConfig();
  const template = fs.readFileSync(path.join(SRC, "index.html"), "utf8");
  const contentJs = fs.readFileSync(path.join(SRC, "content.js"), "utf8");
  const appJs = fs.readFileSync(path.join(SRC, "app.js"), "utf8");
  const C = loadContent(contentJs);

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.cpSync(PUB, DIST, { recursive: true });
  for (const lang of LANGS) {
    const out = path.join(DIST, LANG_PATH[lang], "index.html");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, page(site, C, template, contentJs, appJs, lang));
  }
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap(site));
  fs.writeFileSync(path.join(DIST, "robots.txt"), robots(site));
  fs.writeFileSync(path.join(DIST, "llms.txt"), llms(site, C));
  fs.writeFileSync(path.join(DIST, "site.webmanifest"), manifest(site));
  console.log(`built dist/ for ${site.url} in ${Date.now() - t0}ms`);
  if (/localhost|127\.0\.0\.1/.test(site.url) && !process.argv.includes("--serve"))
    console.warn("WARNING: SITE_URL is not set, so canonical/sitemap URLs point to localhost.");
}

/* ───────────── dev server ───────────── */
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };

function serve(port) {
  http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(DIST, path.normalize(p));
    if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, buf) => {
      if (err) {
        // /ar → /ar/
        if (fs.existsSync(path.join(file, "index.html"))) { res.writeHead(301, { Location: p + "/" }).end(); return; }
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(fs.existsSync(path.join(DIST, "404.html")) ? fs.readFileSync(path.join(DIST, "404.html")) : "Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(buf);
    });
  }).listen(port, () => console.log(`serving http://localhost:${port}  (Arabic: http://localhost:${port}/ar/)`));

  // reading files during a build fires watch events on Windows; ignore those so it doesn't loop
  let timer = 0, quietUntil = 0;
  const rebuild = () => {
    if (Date.now() < quietUntil) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      quietUntil = Infinity;
      try { await build(); } catch (e) { console.error(e.message); }
      quietUntil = Date.now() + 400;
    }, 120);
  };
  for (const target of [SRC, PUB, path.join(ROOT, "site.config.mjs")]) fs.watch(target, { recursive: true }, rebuild);
}

await build();
if (process.argv.includes("--serve")) serve(Number(process.env.PORT) || 3000);
