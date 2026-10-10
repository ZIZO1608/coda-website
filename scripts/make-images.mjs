// Renders the social share images (public/og-en.png, public/og-ar.png) and the PNG/ICO icons
// with headless Chrome. Run again only if the logo or tagline changes:  node scripts/make-images.mjs
// Set CHROME=/path/to/chrome if Chrome isn't in a standard location.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "public");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "coda-img-"));

const chrome = process.env.CHROME || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].find(p => fs.existsSync(p));
if (!chrome) throw new Error("Chrome not found; set CHROME=/path/to/chrome");

const MARK = `<path fill="#fff" d="M47.7,-87.9 A100,100 0 1,0 47.7,87.9 L47.7,40.2 A62.4,62.4 0 1,1 47.7,-40.2 Z"/><g transform="translate(-1.1 1.3)"><path fill="#E10600" d="M50.04,0 C49.85,2.32 49.42,4.64 48.86,6.87 C48.3,9.1 47.57,11.3 46.7,13.39 C45.83,15.49 44.8,17.52 43.66,19.44 C42.52,21.36 41.22,23.18 39.87,24.92 C38.53,26.65 37.09,28.3 35.58,29.85 C34.06,31.4 32.46,32.85 30.8,34.21 C29.15,35.57 27.41,36.82 25.63,38 C23.85,39.17 22.01,40.26 20.12,41.26 C18.23,42.25 16.28,43.15 14.28,43.95 C12.28,44.74 10.22,45.45 8.12,46.03 C6.01,46.61 3.85,47.1 1.66,47.45 C-0.54,47.81 -2.79,48.07 -5.06,48.16 C-7.33,48.26 -9.66,48.23 -11.97,48.03 C-14.29,47.82 -16.68,47.53 -18.97,46.95 C-21.27,46.38 -23.57,45.58 -25.74,44.59 C-27.92,43.6 -30.08,42.4 -32.04,41.01 C-34,39.61 -35.85,37.97 -37.52,36.23 C-39.19,34.49 -40.73,32.56 -42.05,30.55 C-43.38,28.54 -44.52,26.37 -45.45,24.16 C-46.37,21.96 -47.06,19.63 -47.61,17.33 C-48.15,15.03 -48.48,12.67 -48.72,10.36 C-48.97,8.04 -49.08,5.73 -49.08,3.43 C-49.08,1.14 -48.98,-1.15 -48.73,-3.41 C-48.48,-5.67 -48.11,-7.92 -47.58,-10.11 C-47.06,-12.31 -46.39,-14.49 -45.59,-16.59 C-44.79,-18.7 -43.85,-20.77 -42.78,-22.75 C-41.72,-24.73 -40.53,-26.67 -39.2,-28.48 C-37.87,-30.29 -36.39,-32.01 -34.82,-33.63 C-33.26,-35.24 -31.58,-36.77 -29.81,-38.16 C-28.05,-39.55 -26.17,-40.83 -24.24,-41.98 C-22.3,-43.13 -20.27,-44.15 -18.2,-45.04 C-16.13,-45.94 -13.98,-46.69 -11.8,-47.34 C-9.63,-47.99 -7.4,-48.56 -5.15,-48.96 C-2.89,-49.36 -0.58,-49.64 1.74,-49.74 C4.05,-49.85 6.45,-49.9 8.74,-49.56 C11.03,-49.22 13.32,-48.5 15.5,-47.7 C17.68,-46.89 19.79,-45.86 21.82,-44.75 C23.85,-43.63 25.8,-42.36 27.67,-41.03 C29.54,-39.69 31.34,-38.24 33.05,-36.71 C34.77,-35.18 36.41,-33.56 37.96,-31.85 C39.51,-30.14 40.99,-28.35 42.33,-26.45 C43.66,-24.55 44.9,-22.54 45.96,-20.46 C47.01,-18.38 47.95,-16.18 48.63,-13.95 C49.32,-11.71 49.81,-9.36 50.04,-7.03 C50.28,-4.71 50.24,-2.32 50.04,0Z"/><g clip-path="url(#dc)"><!--GROOVES--></g><path fill="#000" d="M12.83,0 C12.84,1.46 12.57,3.03 12.06,4.39 C11.54,5.75 10.7,7.09 9.74,8.17 C8.77,9.25 7.53,10.16 6.27,10.86 C5.01,11.56 3.59,12.1 2.18,12.36 C0.77,12.62 -0.77,12.64 -2.19,12.41 C-3.61,12.18 -5.09,11.7 -6.35,10.99 C-7.6,10.28 -8.8,9.28 -9.75,8.18 C-10.69,7.07 -11.51,5.74 -12.02,4.37 C-12.52,3.01 -12.77,1.46 -12.76,0 C-12.76,-1.46 -12.5,-3.01 -12,-4.37 C-11.49,-5.73 -10.67,-7.06 -9.72,-8.16 C-8.78,-9.26 -7.59,-10.26 -6.33,-10.97 C-5.08,-11.67 -3.6,-12.15 -2.18,-12.38 C-0.77,-12.62 0.76,-12.59 2.18,-12.35 C3.59,-12.11 5.05,-11.62 6.31,-10.93 C7.57,-10.23 8.8,-9.28 9.75,-8.18 C10.7,-7.09 11.5,-5.74 12.02,-4.37 C12.53,-3.01 12.82,-1.46 12.83,0Z"/></g><circle fill="#E10600" cx="77.5" cy="-91" r="19.1"/>`;
const GROOVES = Array.from({ length: 15 }, (_, i) => `<circle cx="0" cy="0" r="${15 + i * 2.3}" fill="none" stroke="#000" stroke-opacity=".17" stroke-width=".5"/>`).join("");

function shoot(name, html, w, h, scale = 1) {
  const file = path.join(TMP, name + ".html");
  fs.writeFileSync(file, html);
  const out = path.join(PUB, name + ".png");
  execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
    `--user-data-dir=${path.join(TMP, "profile")}`, "--default-background-color=000000ff",
    `--window-size=${w},${h}`, `--force-device-scale-factor=${scale}`, "--virtual-time-budget=6000",
    `--screenshot=${out}`, pathToFileURL(file).href,
  ], { stdio: "ignore" });
  console.log("wrote", path.relative(ROOT, out));
  return out;
}

const og = lang => {
  const ar = lang === "ar";
  const kicker = ar ? "وكالة إعلامية إبداعية في حلب، سوريا" : "Creative media agency in Aleppo, Syria";
  const line = ar ? "اللفتة التي لا ينساها جمهورك." : "The twist your audience remembers.";
  const services = ar ? "فيديو وريلز · تصوير · سوشيال ميديا · حملات إعلانية · ذكاء اصطناعي"
                      : "Reels · Photography · Social media · Ad campaigns · AI ads";
  return `<!doctype html><html lang="${lang}" dir="${ar ? "rtl" : "ltr"}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&family=Cairo:wght@600;800&display=block">
<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#000;color:#F4F1EE}
body{position:relative;font-family:${ar ? '"Cairo"' : '"Comfortaa"'},sans-serif}
.mark{position:absolute;top:50%;${ar ? "left:-30px" : "right:-30px"};width:520px;transform:translateY(-50%)}
.copy{position:absolute;${ar ? "right" : "left"}:80px;top:0;bottom:0;width:620px;display:flex;flex-direction:column;justify-content:center;gap:22px}
.brand{display:flex;align-items:center;gap:14px;font:700 30px/1 "Comfortaa",sans-serif;direction:ltr;${ar ? "align-self:flex-end" : ""}}
.brand svg{width:44px}
.kicker{margin:0;color:#A0958F;font-size:26px;font-weight:${ar ? 600 : 700}}
h1{margin:0;font-size:${ar ? 74 : 70}px;line-height:${ar ? 1.3 : 1.04};letter-spacing:${ar ? 0 : "-.035em"};font-weight:${ar ? 800 : 700}}
h1 i{display:inline-block;width:.2em;height:.2em;border-radius:50%;background:#E10600;margin-inline-start:.05em}
.svc{margin:6px 0 0;color:#F4F1EE;opacity:.72;font-size:20px;font-weight:${ar ? 600 : 700}}
.bar{position:absolute;left:0;right:0;bottom:0;height:10px;background:#E10600}
</style></head><body>
<svg class="mark" viewBox="-102 -112 204 216">${'<defs><clipPath id="dc"><path d="M50.04,0 C49.85,2.32 49.42,4.64 48.86,6.87 C48.3,9.1 47.57,11.3 46.7,13.39 C45.83,15.49 44.8,17.52 43.66,19.44 C42.52,21.36 41.22,23.18 39.87,24.92 C38.53,26.65 37.09,28.3 35.58,29.85 C34.06,31.4 32.46,32.85 30.8,34.21 C29.15,35.57 27.41,36.82 25.63,38 C23.85,39.17 22.01,40.26 20.12,41.26 C18.23,42.25 16.28,43.15 14.28,43.95 C12.28,44.74 10.22,45.45 8.12,46.03 C6.01,46.61 3.85,47.1 1.66,47.45 C-0.54,47.81 -2.79,48.07 -5.06,48.16 C-7.33,48.26 -9.66,48.23 -11.97,48.03 C-14.29,47.82 -16.68,47.53 -18.97,46.95 C-21.27,46.38 -23.57,45.58 -25.74,44.59 C-27.92,43.6 -30.08,42.4 -32.04,41.01 C-34,39.61 -35.85,37.97 -37.52,36.23 C-39.19,34.49 -40.73,32.56 -42.05,30.55 C-43.38,28.54 -44.52,26.37 -45.45,24.16 C-46.37,21.96 -47.06,19.63 -47.61,17.33 C-48.15,15.03 -48.48,12.67 -48.72,10.36 C-48.97,8.04 -49.08,5.73 -49.08,3.43 C-49.08,1.14 -48.98,-1.15 -48.73,-3.41 C-48.48,-5.67 -48.11,-7.92 -47.58,-10.11 C-47.06,-12.31 -46.39,-14.49 -45.59,-16.59 C-44.79,-18.7 -43.85,-20.77 -42.78,-22.75 C-41.72,-24.73 -40.53,-26.67 -39.2,-28.48 C-37.87,-30.29 -36.39,-32.01 -34.82,-33.63 C-33.26,-35.24 -31.58,-36.77 -29.81,-38.16 C-28.05,-39.55 -26.17,-40.83 -24.24,-41.98 C-22.3,-43.13 -20.27,-44.15 -18.2,-45.04 C-16.13,-45.94 -13.98,-46.69 -11.8,-47.34 C-9.63,-47.99 -7.4,-48.56 -5.15,-48.96 C-2.89,-49.36 -0.58,-49.64 1.74,-49.74 C4.05,-49.85 6.45,-49.9 8.74,-49.56 C11.03,-49.22 13.32,-48.5 15.5,-47.7 C17.68,-46.89 19.79,-45.86 21.82,-44.75 C23.85,-43.63 25.8,-42.36 27.67,-41.03 C29.54,-39.69 31.34,-38.24 33.05,-36.71 C34.77,-35.18 36.41,-33.56 37.96,-31.85 C39.51,-30.14 40.99,-28.35 42.33,-26.45 C43.66,-24.55 44.9,-22.54 45.96,-20.46 C47.01,-18.38 47.95,-16.18 48.63,-13.95 C49.32,-11.71 49.81,-9.36 50.04,-7.03 C50.28,-4.71 50.24,-2.32 50.04,0Z"/></clipPath></defs>' + MARK.replace("<!--GROOVES-->", GROOVES)}</svg>
<div class="copy">
  <div class="brand"><svg viewBox="-102 -112 204 216">${MARK.replace("<!--GROOVES-->", "")}</svg>CODA Media</div>
  <p class="kicker">${kicker}</p>
  <h1>${line.replace(/\.$/, "")}<i></i></h1>
  <p class="svc">${services}</p>
</div>
<i class="bar"></i>
</body></html>`;
};

// pad = empty space around the mark as a fraction of the icon (maskable icons need a wide safe zone)
const icon = pad => `<!doctype html><html><head><style>html,body{margin:0;width:512px;height:512px;background:#000;overflow:hidden}
svg{position:absolute;inset:${pad * 512}px;width:${512 * (1 - 2 * pad)}px;height:${512 * (1 - 2 * pad)}px}</style></head>
<body><svg viewBox="-104 -114 208 220">${MARK.replace("<!--GROOVES-->", "")}</svg></body></html>`;

shoot("og-en", og("en"), 1200, 630);
shoot("og-ar", og("ar"), 1200, 630);
shoot("icon-512", icon(.12), 512, 512);
shoot("icon-512-maskable", icon(.22), 512, 512);
shoot("icon-192", icon(.12), 512, 512, 192 / 512);
shoot("apple-touch-icon", icon(.14), 512, 512, 180 / 512);
const fav = shoot("favicon-32", icon(.04), 512, 512, 32 / 512);

// favicon.ico = an ICO header wrapping the 32px PNG
const png = fs.readFileSync(fav);
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);       // reserved, type=icon, count
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);                              // planes, bpp
ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);                      // size, offset
fs.writeFileSync(path.join(PUB, "favicon.ico"), Buffer.concat([ico, png]));
fs.rmSync(fav);
console.log("wrote public/favicon.ico");
fs.rmSync(TMP, { recursive: true, force: true });
