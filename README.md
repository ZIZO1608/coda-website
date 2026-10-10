# CODA Media website

Static site in English (`/`) and Arabic (`/ar/`). The build pre-renders every section into the HTML, so Google and AI assistants (ChatGPT, Claude, Perplexity, Gemini) can read the whole page without running JavaScript.

## Run locally

```
npm run dev        # http://localhost:3000  and  http://localhost:3000/ar/
```

It rebuilds when you save a file. No `npm install` needed: there are no dependencies.

## Where things live

| File | What it holds |
| --- | --- |
| `src/content.js` | All text (EN + AR), services, team, clients, SEO titles and descriptions |
| `src/index.html` | Page layout and CSS. `{{SLOTS}}` are filled by the build |
| `src/app.js` | Animations, sound, language switch |
| `site.config.mjs` | Business details for Google: address, map pin, hours, profiles, verification codes |
| `public/` | Images, logos, icons, share images (copied as-is) |
| `build.mjs` | Builds `dist/`: both pages, `sitemap.xml`, `robots.txt`, `llms.txt`, manifest |
| `scripts/make-images.mjs` | Regenerates the share images and icons (`npm run images`, needs Chrome) |

## Deploy on Coolify

1. Push this folder to a Git repo (GitHub/GitLab) and add it in Coolify as a new **Application** from that repo.
2. **Build pack:** Dockerfile. **Port:** `80`.
3. **Environment variables (optional):** the site builds for `https://coda-media.com` by default. To use another domain, add `SITE_URL` = `https://otherdomain.com` (no trailing slash) and tick **Build Variable**.
4. **Domains:** enter `https://yourdomain.com,https://www.yourdomain.com`. Coolify gets the SSL certificate. Then turn on the www → non-www redirect (or the other way round) so only one version exists.
5. At your domain registrar, point an `A` record for `@` and `www` to the VPS IP.
6. Deploy. Check that `https://yourdomain.com/sitemap.xml` shows your real domain.

## After it's live (SEO checklist)

- **Google Search Console:** add the domain, put the code in `site.config.mjs → verification.google`, redeploy, then submit `https://yourdomain.com/sitemap.xml`. Do the same in **Bing Webmaster Tools**. ChatGPT search uses Bing's index.
- **Google Business Profile:** create it for "CODA Media" in Aleppo with the same name, phone and address as the site. This matters most for local searches like "وكالة إعلانية في حلب". Put its link in `site.config.mjs → mapUrl` and `sameAs`.
- **Fill in `site.config.mjs`:** street address, exact map coordinates, opening hours, email, founding year, and every social profile (Facebook, TikTok, LinkedIn…). Empty fields are left out of the output.
- **Test:** [Rich Results Test](https://search.google.com/test/rich-results) and [Schema validator](https://validator.schema.org) for the structured data. Paste the link into WhatsApp or the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to see the share preview.
- Link to the website from the Instagram bio.
