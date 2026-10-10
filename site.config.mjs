// Business details used for SEO meta tags, JSON-LD structured data, sitemap and llms.txt.
// Fill in the empty fields when you have them; empty values are simply left out of the output.
export default {
  // Set SITE_URL in Coolify (no trailing slash), e.g. https://codamedia.com
  url: (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),

  name: { en: "CODA Media", ar: "كودا ميديا" },
  alternateNames: ["CODA", "CODA Media Agency", "كودا", "وكالة كودا الإعلامية"],
  slogan: { en: "The twist your audience remembers.", ar: "اللفتة التي لا ينساها جمهورك." },

  phone: "+963930003142",
  whatsapp: "https://wa.me/963930003142",
  email: "",                 // e.g. "hello@codamedia.com"
  sameAs: [                  // every official profile: Instagram, Facebook, TikTok, LinkedIn, Google Business Profile…
    "https://www.instagram.com/coda.media.sy",
  ],

  address: {
    street: { en: "", ar: "" },   // e.g. { en: "Al-Furqan, Street X, Building Y", ar: "الفرقان، شارع ..." }
    locality: { en: "Aleppo", ar: "حلب" },
    region: { en: "Aleppo Governorate", ar: "محافظة حلب" },
    postalCode: "",
    country: "SY",
  },
  // Aleppo city centre. Replace with the studio's exact pin (Google Maps → right-click → copy coordinates).
  geo: { lat: 36.2021, lng: 37.1343 },
  geoRegion: "SY-HL",          // ISO 3166-2 code for Aleppo Governorate
  mapUrl: "",                  // Google Maps link to the studio / Business Profile
  // Schema.org opening hours, e.g. [{ days: ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday"], opens: "10:00", closes: "18:00" }]
  openingHours: [],
  foundingDate: "",            // e.g. "2023"
  priceRange: "",              // e.g. "$$"

  // Search console verification codes (content="" value only)
  verification: { google: "", bing: "", yandex: "" },
};
