const DEFAULT_REMOTE_API_BASE = "https://kj24-news.onrender.com";
const markets = [
  { name: "SENSEX", value: "77,958.52", change: "+1.22%", points: "+940.19" },
  { name: "NIFTY 50", value: "24,330.95", change: "+1.24%", points: "+298.15" },
  { name: "BANK NIFTY", value: "55,981.05", change: "+2.63%", points: "+1,435.55" }
];

const ADMIN_STORAGE_KEY = "khabriJunctionAdminData";
const API_BASE_URL = window.KJ_API_BASE_URL
  || ((window.location.protocol === "file:" || /github\.io$|githubusercontent\.com$/i.test(window.location.hostname))
    ? DEFAULT_REMOTE_API_BASE
    : "");
const NEWS_SYNC_KEY = "khabriJunctionNewsSync";
const newsSyncChannel = typeof BroadcastChannel === "function"
  ? new BroadcastChannel("khabri-junction-news-sync")
  : null;
const FALLBACK_NEWS_IMAGE = "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=900&auto=format&fit=crop";
const CATEGORY_LINKS = {
  "breaking.html": "/category/breaking-news",
  "durg.html": "/district/durg",
  "bhilai.html": "/district/bhilai",
  "raipur.html": "/district/raipur",
  "bilaspur.html": "/district/bilaspur",
  "kawardha.html": "/district/kawardha",
  "khairagarh.html": "/district/khairagarh",
  "rajnandgaon.html": "/district/rajnandgaon",
  "sports.html": "/category/sports",
  "astrology.html": "/category/horoscope",
  "politics.html": "/category/politics",
  "crime.html": "/category/crime",
  "entertainment.html": "/category/entertainment",
  "health.html": "/category/health",
  "jobs.html": "/category/jobs",
  "about.html": "/about",
  "contact.html": "/contact",
  "privacy-policy.html": "/privacy-policy",
  "cookie-policy.html": "/cookie-policy",
  "terms-and-conditions.html": "/terms-conditions",
  "disclaimer.html": "/disclaimer",
  "editorial-policy.html": "/editorial-policy",
  "fact-check-policy.html": "/fact-check-policy",
  "correction-policy.html": "/correction-policy",
  "advertise.html": "/advertise",
  "admin.html": "/admin",
  "/raipur-news": "/category/raipur",
  "/raipur-promotion-news": "/category/raipur-promotion",
  "/market-news": "/category/market",
  "/weather-update": "/category/weather",
  "/viral-videos": "/category/viral-videos",
  "/local-news": "/category/local-news",
  "/mp-shahdol-news": "/category/mp-shahdol",
  "/desh-duniya-news": "/category/world",
  "/weather": "/category/weather",
  "/mp": "/category/mp-shahdol",
  "/des": "/category/world"
};
let currentLanguage = "hi";
let storyIndex = 0;
let homepageLiveNews = [];

if (document.body) {
  document.body.classList.add("ads-pending");
} else {
  document.addEventListener("DOMContentLoaded", () => document.body?.classList.add("ads-pending"), { once: true });
}

const HINDI_TEXT_BY_EN = {
  "BREAKING": "ताजा",
  "Durg, Bhilai and Raipur news desk is live": "दुर्ग, भिलाई और रायपुर न्यूज़ डेस्क लाइव है",
  "Local news desk shares fresh district updates": "लोकल न्यूज़ डेस्क ताज़ा जिला अपडेट शेयर कर रहा है",
  "Kawardha, Khairagarh, Rajnandgaon and Bilaspur pages updated": "कवर्धा, खैरागढ़, राजनांदगांव और बिलासपुर पेज अपडेट",
  "Market watch and ad booking sections are open": "मार्केट वॉच और विज्ञापन बुकिंग सेक्शन खुले हैं",
  "Fastest digital news for Chhattisgarh": "छत्तीसगढ़ की सबसे तेज डिजिटल न्यूज़",
  "Durg 34°": "दुर्ग 34°",
  "Durg 34°": "दुर्ग 34°",
  "ADVERTISEMENT": "विज्ञापन",
  "Local business, stock marketing and digital campaigns": "लोकल बिज़नेस, स्टॉक मार्केटिंग और डिजिटल कैंपेन",
  "Menu": "मेन्यू",
  "Home": "होम",
  "Breaking": "ब्रेकिंग",
  "Durg": "दुर्ग",
  "Bhilai": "भिलाई",
  "Raipur": "रायपुर",
  "Khairagarh": "खैरागढ़",
  "Rajnandgaon": "राजनांदगांव",
  "Kawardha": "कवर्धा",
  "Bilaspur": "बिलासपुर",
  "Politics": "राजनीति",
  "Crime": "क्राइम",
  "Sports": "स्पोर्ट्स",
  "Entertainment": "मनोरंजन",
  "Health": "हेल्थ",
  "Jobs": "जॉब्स",
  "Contact": "संपर्क",
  "QUICK LINKS": "क्विक लिंक",
  "Districts": "जिले",
  "Market": "मार्केट",
  "TOP STORY": "मुख्य खबर",
  "Durg, Bhilai and Raipur news desk opens fast local updates": "दुर्ग, भिलाई और रायपुर न्यूज़ डेस्क पर तेज लोकल अपडेट",
  "Latest district stories, market updates and public alerts in one clean news website.": "जिला खबरें, मार्केट अपडेट और जन सूचना अब एक साफ न्यूज़ वेबसाइट में।",
  "Read Full News": "पूरी खबर पढ़ें",
  "FOR AD": "विज्ञापन",
  "Book banner, news sponsor or campaign slot": "बैनर, न्यूज़ स्पॉन्सर या कैंपेन स्लॉट बुक करें",
  "CITY LATEST NEWS": "शहर की ताज़ा खबरें",
  "LATEST NEWS": "लेटेस्ट न्यूज़",
  "INDIAN STOCK MARKET": "भारतीय शेयर बाजार",
  "Market Closed Today": "आज बाज़ार बंद",
  "Closed: 06 May 2026, 3:30 PM IST": "बंद: 06 मई 2026, 3:30 PM IST",
  "Closing values shown after todayâ€™s session.": "आज के सेशन के बाद क्लोजिंग वैल्यू दिखाई गई है।",
  "Closing values shown after today's session.": "आज के सेशन के बाद क्लोजिंग वैल्यू दिखाई गई है।",
  "Today close": "आज की क्लोजिंग",
  "Read": "पढ़ें",
  "Visit Page": "पेज देखें",
  "Visit Durg Page": "दुर्ग पेज देखें",
  "Visit Bhilai Page": "भिलाई पेज देखें",
  "Visit Raipur Page": "रायपुर पेज देखें",
  "Visit District Pages": "जिला पेज देखें",
  "MORE NEWS": "और खबरें",
  "Quick Links": "क्विक लिंक",
  "Important Pages": "जरूरी पेज",
  "About Us": "हमारे बारे में",
  "Contact Us": "संपर्क करें",
  "Privacy Policy": "प्राइवेसी पॉलिसी",
  "Terms & Conditions": "नियम और शर्तें",
  "Disclaimer": "डिस्क्लेमर",
  "Advertise": "विज्ञापन",
  "Admin Panel": "एडमिन पैनल",
  "ADMIN NEWS UPDATES": "एडमिन न्यूज अपडेट",
  "Durg, Chhattisgarh": "दुर्ग, छत्तीसगढ़",
  "FULL FLASH NEWS": "पूरी फ्लैश न्यूज़",
  "Back To Home": "होम पर वापस"
};

const UI_HI_LABELS = {
  "ADVERTISEMENT": "विज्ञापन",
  "Admin Panel": "एडमिन पैनल",
  "Astrology": "राशिफल",
  "ASTROLOGY": "राशिफल",
  "Bhilai": "भिलाई",
  "Bilaspur": "बिलासपुर",
  "BREAKING": "ब्रेकिंग",
  "Breaking": "ब्रेकिंग",
  "Breaking News": "ब्रेकिंग न्यूज़",
  "CITY LATEST NEWS": "ब्रेकिंग न्यूज",
  "Contact": "संपर्क",
  "Crime": "क्राइम",
  "Districts": "जिला पेज",
  "Durg": "दुर्ग",
  "DURG": "दुर्ग",
  "Entertainment": "मनोरंजन",
  "ENTERTAINMENT": "मनोरंजन",
  "ENTERTAINMENT TOP 6": "मनोरंजन की खबरें",
  "EVENTS": "इवेंट",
  "FASHION": "फैशन की खबरें",
  "FOR AD": "विज्ञापन",
  "Health": "हेल्थ",
  "HEALTH": "हेल्थ",
  "Home": "होम",
  "INDIAN STOCK MARKET": "आज का बाजार की स्थिति",
  "Jobs": "जॉब्स",
  "Kawardha": "कवर्धा",
  "Khairagarh": "खैरागढ़",
  "LATEST NEWS": "खास खबरें",
  "Local News": "लोकल खबरें",
  "LOCAL": "लोकल",
  "MARKET": "आज का बाजार",
  "Market": "आज का बाजार",
  "Market Closed Today": "आज बाजार बंद",
  "Menu": "मेन्यू",
  "MORE NEWS": "और खबरें",
  "Modern digital news platform for Chhattisgarh and India.": "छत्तीसगढ़ और भारत की भरोसेमंद डिजिटल न्यूज सेवा",
  "MOVIE": "फिल्म",
  "MP Shahdol": "शहडोल खबरें",
  "MUSIC": "म्यूजिक",
  "Politics": "राजनीति",
  "QUICK LINKS": "क्विक लिंक",
  "Raipur": "रायपुर",
  "Raipur Promotion": "रायपुर प्रमोशन",
  "Rajnandgaon": "राजनांदगांव",
  "Read": "पढ़ें",
  "Read Full News": "पूरी खबर पढ़ें",
  "REEL": "ट्रेंडिंग रील",
  "REELS": "ट्रेंडिंग रील",
  "Sports": "खेल जगत",
  "SPORTS": "खेल जगत",
  "TOP STORY": "मुख्य खबर",
  "VIRAL": "वायरल",
  "VIRAL REELS & VIDEO": "ट्रेंडिंग रील और वीडियो",
  "Viral Videos": "ट्रेंडिंग रील",
  "Visit Page": "पेज देखें",
  "WEATHER": "मौसम",
  "Weather": "मौसम की जानकारी",
  "Web Stories": "वेब स्टोरीज",
  "World": "देश-दुनिया",
  "WORLD": "देश-दुनिया",
  "WORLD NEWS UPDATE": "देश-दुनिया की खबर",
  "Khabri Junction से लोकल न्यूज़ अपडेट पाने के लिए नोटिफिकेशन सब्सक्राइब करें।": "लोकल खबरों की सूचना पाने के लिए नोटिफिकेशन सब्सक्राइब करें।"
};

const CLEAN_HI_LABELS = {
  "Fastest digital news for Chhattisgarh": "छत्तीसगढ़ की सबसे तेज डिजिटल न्यूज़",
  "Modern digital news platform for Chhattisgarh and India.": "छत्तीसगढ़ और भारत की भरोसेमंद डिजिटल न्यूज़ सेवा",
  "Durg, Chhattisgarh": "दुर्ग, छत्तीसगढ़",
  "Read Full News": "पूरी खबर पढ़ें",
  "Visit Page": "पेज देखें",
  "Back To Home": "होम पर वापस",
  "Share Now": "शेयर करें",
  "Latest News": "ताजा खबरें"
};

function looksCorruptHindi(value) {
  return /à|Â|Ã|�|ð|Ø/.test(String(value || ""));
}

function getHindiText(en, hi) {
  const english = String(en || "").trim();
  const hindi = String(hi || "").trim();

  if (CLEAN_HI_LABELS[english]) {
    return CLEAN_HI_LABELS[english];
  }

  if (UI_HI_LABELS[english] && !looksCorruptHindi(UI_HI_LABELS[english])) {
    return UI_HI_LABELS[english];
  }

  if (HINDI_TEXT_BY_EN[english] && !looksCorruptHindi(HINDI_TEXT_BY_EN[english])) {
    return HINDI_TEXT_BY_EN[english];
  }

  if (hindi && !looksCorruptHindi(hindi)) {
    return hindi;
  }

  return english;
}

function getLocalizedText(en, hi, language) {
  return language === "hi" ? getHindiText(en, hi) : String(en || "").trim();
}

function applyUiLanguage(language) {
  const selector = ".tag, .section-title strong, .menu-links a, .menu-district-menu summary, .quick-links a, .portal-main-nav a, .footer a, .footer h3, .footer p, .footer-links a, .footer-links strong, .copyright";

  document.querySelectorAll(selector).forEach((node) => {
    const original = node.dataset.autoEn || node.dataset.en || node.textContent.trim();

    if (!node.dataset.autoEn) {
      node.dataset.autoEn = original;
    }

    node.textContent = language === "hi" ? (UI_HI_LABELS[original] || getHindiText(original, node.dataset.hi)) : original;
  });
}

function repairMojibakeText(value) {
  const text = String(value || "").trim();

  if (!text || !/[àÂÃï¿½â]/.test(text)) {
    return text;
  }

  try {
    const percentEncoded = Array.from(text).map((char) => {
      const code = char.charCodeAt(0);
      return code <= 0xff ? `%${code.toString(16).padStart(2, "0")}` : encodeURIComponent(char);
    }).join("");

    return decodeURIComponent(percentEncoded);
  } catch (error) {
    return text;
  }
}

function looksCorruptHindi(value) {
  return /à|Ã‚|Ãƒ|ï¿½|ð|Ã˜|à¤|â€™|°|©/.test(String(value || ""));
}

function normalizeDisplayText(value) {
  const text = String(value || "").trim();
  return looksCorruptHindi(text) ? repairMojibakeText(text) : text;
}

function getHindiText(en, hi) {
  const english = normalizeDisplayText(en);
  const hindi = normalizeDisplayText(hi);

  if (CLEAN_HI_LABELS[english]) {
    return normalizeDisplayText(CLEAN_HI_LABELS[english]);
  }

  if (UI_HI_LABELS[english]) {
    return normalizeDisplayText(UI_HI_LABELS[english]);
  }

  if (HINDI_TEXT_BY_EN[english]) {
    return normalizeDisplayText(HINDI_TEXT_BY_EN[english]);
  }

  if (hindi) {
    return hindi;
  }

  return english;
}

function getLocalizedText(en, hi, language) {
  return language === "hi" ? getHindiText(en, hi) : normalizeDisplayText(en);
}

function applyUiLanguage(language) {
  const selector = ".tag, .section-title strong, .menu-links a, .menu-district-menu summary, .quick-links a, .portal-main-nav a, .footer a, .footer h3, .footer p, .footer-links a, .footer-links strong";

  document.querySelectorAll(selector).forEach((node) => {
    const original = normalizeDisplayText(node.dataset.autoEn || node.dataset.en || node.textContent.trim());

    if (!node.dataset.autoEn) {
      node.dataset.autoEn = original;
    }

    node.textContent = language === "hi" ? getHindiText(original, node.dataset.hi) : original;
  });

  document.querySelectorAll("[data-en]").forEach((node) => {
    node.dataset.en = normalizeDisplayText(node.dataset.en);
  });
}

const topStories = [
  {
    kicker: { en: "BREAKING NEWS", hi: "ब्रेकिंग न्यूज़" },
    title: {
      en: "Durg civic teams review smart traffic and health work",
      hi: "दुर्ग में स्मार्ट ट्रैफिक और हेल्थ कार्यों की समीक्षा"
    },
    summary: {
      en: "Local officials reviewed road control, public safety and hospital support updates.",
      hi: "लोकल अधिकारियों ने रोड कंट्रोल, जन सुरक्षा और अस्पताल सहायता अपडेट की समीक्षा की।"
    },
    body: {
      en: "Durg civic teams reviewed smart traffic points, public safety needs and health support counters for faster local services.",
      hi: "दुर्ग में स्मार्ट ट्रैफिक पॉइंट, जन सुरक्षा और हेल्थ सपोर्ट काउंटर की समीक्षा की गई ताकि लोकल सेवाएं तेज हों।"
    },
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1400&auto=format&fit=crop"
  },
  {
    kicker: { en: "BREAKING NEWS", hi: "ब्रेकिंग न्यूज़" },
    title: {
      en: "Bhilai steel city route plan gets fresh update",
      hi: "भिलाई स्टील सिटी रूट प्लान को नया अपडेट"
    },
    summary: {
      en: "Traffic timing and busy junction movement are being checked for smoother travel.",
      hi: "स्मूथ ट्रैवल के लिए ट्रैफिक टाइमिंग और व्यस्त चौक मूवमेंट की जांच हो रही है।"
    },
    body: {
      en: "Bhilai's latest route plan focuses on market roads, school movement and signal timing at key city junctions.",
      hi: "भिलाई का नया रूट प्लान बाजार मार्गों, स्कूल मूवमेंट और प्रमुख चौक के सिग्नल टाइमिंग पर फोकस करता है।"
    },
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1400&auto=format&fit=crop"
  },
  {
    kicker: { en: "BREAKING NEWS", hi: "ब्रेकिंग न्यूज़" },
    title: {
      en: "Raipur smart city dashboard work moves forward",
      hi: "रायपुर स्मार्ट सिटी डैशबोर्ड कार्य आगे बढ़ा"
    },
    summary: {
      en: "Public display, lighting and city information systems remain in focus.",
      hi: "पब्लिक डिस्प्ले, लाइटिंग और सिटी सूचना सिस्टम पर फोकस है।"
    },
    body: {
      en: "Raipur's smart city update includes public information boards, lighting review and better road safety visibility.",
      hi: "रायपुर स्मार्ट सिटी अपडेट में पब्लिक सूचना बोर्ड, लाइटिंग समीक्षा और बेहतर रोड सेफ्टी विजिबिलिटी शामिल है।"
    },
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop"
  },
  {
    kicker: { en: "BREAKING NEWS", hi: "ब्रेकिंग न्यूज़" },
    title: {
      en: "Kawardha farming support camp planned this week",
      hi: "कवर्धा में इस सप्ताह किसान सहायता शिविर"
    },
    summary: {
      en: "Farmers may get weather, crop planning and local scheme guidance.",
      hi: "किसानों को मौसम, फसल योजना और लोकल योजना की जानकारी मिल सकती है।"
    },
    body: {
      en: "Kawardha's farming support camp will focus on weather alerts, crop planning and scheme awareness for local farmers.",
      hi: "कवर्धा किसान सहायता शिविर में मौसम अलर्ट, फसल योजना और लोकल किसानों के लिए योजना जागरूकता पर फोकस होगा।"
    },
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1400&auto=format&fit=crop"
  },
  {
    kicker: { en: "BREAKING NEWS", hi: "ब्रेकिंग न्यूज़" },
    title: {
      en: "Bilaspur travel and rail movement advisory issued",
      hi: "बिलासपुर यात्रा और रेल मूवमेंट सलाह जारी"
    },
    summary: {
      en: "Passengers are advised to check route updates before leaving.",
      hi: "यात्रियों को निकलने से पहले रूट अपडेट देखने की सलाह दी गई है।"
    },
    body: {
      en: "Bilaspur passengers should check city route and rail movement updates before travel as advisory notices are being refreshed.",
      hi: "बिलासपुर यात्रियों को यात्रा से पहले सिटी रूट और रेल मूवमेंट अपडेट देखने चाहिए क्योंकि सलाह नोटिस अपडेट हो रहे हैं।"
    },
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop"
  }
];

function readAdminData() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function textPair(en, hi) {
  const english = String(en || "").trim();
  const hindi = String(hi || "").trim();

  return {
    en: english,
    hi: getHindiText(english, hindi)
  };
}

function sourceLanguageForItem(item = {}) {
  return item.language || (/[\u0900-\u097F]/.test(`${item.titleHi || item.title || ""} ${item.summaryHi || item.summary || ""} ${item.bodyHi || item.body || ""}`) ? "hi" : "en");
}

function localizedTextPair(item = {}, field, fallback = "") {
  const sourceLanguage = sourceLanguageForItem(item);
  const english = item[`${field}En`] || (sourceLanguage === "en" ? item[field] || "" : "");
  const hindi = item[`${field}Hi`] || (sourceLanguage === "hi" ? item[field] || fallback : fallback);
  return textPair(english, hindi);
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function apiRequest(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}

function mongoNewsToAdminData(news) {
  const publishedNews = Array.isArray(news)
    ? news.filter((item) => !item.status || item.status === "published")
    : [];
  const featured = publishedNews.find((item) => item.featured);

  return {
    topStory: featured
      ? {
          enabled: true,
          kicker: featured.category || featured.tag || "FEATURED",
          title: featured.title,
          titleEn: featured.titleEn || "",
          titleHi: featured.titleHi || featured.title,
          summary: featured.summary,
          summaryEn: featured.summaryEn || "",
          summaryHi: featured.summaryHi || featured.summary,
          body: featured.body,
          bodyEn: featured.bodyEn || "",
          bodyHi: featured.bodyHi || featured.body,
          image: featured.image,
          articleUrl: featured.articleUrl,
          language: featured.language || sourceLanguageForItem(featured)
        }
      : null,
    news: publishedNews
      .filter((item) => !item.featured)
      .map((item) => ({
        tag: item.tag || item.category || "UPDATE",
        category: item.category,
        city: item.city,
        title: item.title,
        titleEn: item.titleEn || "",
        titleHi: item.titleHi || item.title,
        summary: item.summary,
        summaryEn: item.summaryEn || "",
        summaryHi: item.summaryHi || item.summary,
        body: item.body,
        bodyEn: item.bodyEn || "",
        bodyHi: item.bodyHi || item.body,
        image: item.image,
        articleUrl: item.articleUrl,
        categoryPage: item.categoryPage,
        categorySlug: item.categorySlug,
        language: item.language || sourceLanguageForItem(item)
      })),
    ticker: []
  };
}

function newsIdentity(item = {}) {
  return item._id || item.slug || item.articleUrl || item.sourceUrl || item.title || "";
}

function localizedNewsField(item = {}, field, language = currentLanguage) {
  if (language === "hi") {
    const hindi = normalizeDisplayText(item[`${field}Hi`] || "");

    // Older records may already contain unrecoverable question marks. Never show
    // them as Hindi copy; use the intact English field until the article is edited.
    if (hasVisibleHindi(hindi) && !looksCorruptHindi(hindi)) {
      return hindi;
    }

    return normalizeDisplayText(item[`${field}En`] || item[field] || hindi);
  }

  return normalizeDisplayText(item[`${field}En`] || item[field] || item[`${field}Hi`] || "");
}

function safeSitePath(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";

  try {
    const contentOrigin = API_BASE_URL ? new URL(API_BASE_URL, window.location.href).origin : window.location.origin;
    const parsed = new URL(value, contentOrigin);
    const isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname);
    const isSameHost = parsed.host === window.location.host;

    if (isLocalhost || isSameHost) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    if (API_BASE_URL && /github\.io$|githubusercontent\.com$/i.test(window.location.hostname)) {
      return parsed.toString();
    }
  } catch (error) {
    return value;
  }

  return value;
}

function absoluteContentUrl(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";

  try {
    return new URL(value, API_BASE_URL || window.location.origin).toString();
  } catch (error) {
    return value;
  }
}

function normalizeApiNewsItem(item = {}) {
  return {
    ...item,
    image: absoluteContentUrl(item.image || item.optimizedThumbnail || item.aiThumbnail || ""),
    sourceImage: absoluteContentUrl(item.sourceImage || ""),
    optimizedThumbnail: absoluteContentUrl(item.optimizedThumbnail || ""),
    aiThumbnail: absoluteContentUrl(item.aiThumbnail || ""),
    articleUrl: safeSitePath(item.articleUrl || ""),
    categoryPage: safeSitePath(item.categoryPage || ""),
    districtPage: safeSitePath(item.districtPage || "")
  };
}

function newsPageLink(item = {}, mode = "article") {
  if (mode === "district") {
    return safeSitePath(item.districtPage) || safeSitePath(item.categoryPage) || (item.districtSlug ? `/district/${item.districtSlug}` : (item.categorySlug ? `/category/${item.categorySlug}` : "/category/breaking"));
  }

  if (mode === "category") {
    return safeSitePath(item.categoryPage) || (item.categorySlug ? `/category/${item.categorySlug}` : "/category/breaking");
  }

  return safeSitePath(item.articleUrl) || safeSitePath(item.categoryPage) || (item.categorySlug ? `/category/${item.categorySlug}` : "/category/breaking");
}

function articleHref(item = {}, mode = "article") {
  const base = newsPageLink(item, mode);
  if (!base) {
    return "";
  }

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}lang=${currentLanguage}`;
}

function newsMatches(item = {}, slug = "") {
  const text = `${item.city || ""} ${item.categorySlug || ""} ${item.category || ""} ${item.tag || ""}`.toLowerCase();
  return text.includes(String(slug || "").toLowerCase());
}

function takeNews(items = [], limit = 1, used = new Set(), predicate = () => true) {
  const picked = [];

  for (const item of items) {
    const key = newsIdentity(item);

    if (!key || used.has(key) || !predicate(item)) {
      continue;
    }

    used.add(key);
    picked.push(item);

    if (picked.length >= limit) {
      break;
    }
  }

  return picked;
}

function newsToStory(item = {}) {
  return {
    kicker: textPair(item.category || item.tag || "BREAKING NEWS", item.categoryBadge || item.category || "ब्रेकिंग न्यूज़"),
    title: localizedTextPair(item, "title"),
    summary: localizedTextPair(item, "summary", item.bodyHi || item.body || ""),
    body: localizedTextPair(item, "body", item.summaryHi || item.summary || ""),
    image: item.image || FALLBACK_NEWS_IMAGE,
    articleUrl: safeSitePath(item.articleUrl) || safeSitePath(item.categoryPage) || ""
  };
}

function setSectionTitleForGrid(gridSelector, en, hi) {
  const grid = document.querySelector(gridSelector);
  const title = grid?.closest(".section-block")?.querySelector(".section-title strong");

  if (!title) {
    return;
  }

  title.dataset.en = en;
  title.dataset.hi = hi;
  title.textContent = getLocalizedText(en, hi, currentLanguage);
}

function emptyNewsMarkup(type = "card") {
  const badge = currentLanguage === "hi" ? "लाइव" : "LIVE";
  const title = currentLanguage === "hi" ? "नई पोस्ट जल्द आएंगी" : "Fresh posts will appear soon";
  const summary = currentLanguage === "hi"
    ? "पुराने पोस्ट हटा दिए गए हैं। नई खबर publish होते ही यहां दिखाई देगी।"
    : "Older posts have been cleared. Newly published stories will appear here.";

  if (type === "district") {
    return `
      <article class="district-card news-empty-card" style="background: linear-gradient(135deg, rgba(20, 22, 26, 0.92), rgba(167, 12, 21, 0.92)), url('${FALLBACK_NEWS_IMAGE}') center/cover;">
        <h3>${badge}</h3>
        <p>${summary}</p>
        <button class="visit-btn" type="button" disabled>${title}</button>
      </article>
    `;
  }

  if (type === "mini") {
    return `
      <article class="news-empty-card">
        <p>${summary}</p>
        <button type="button" disabled>${currentLanguage === "hi" ? "जल्द" : "Soon"}</button>
      </article>
    `;
  }

  if (type === "video") {
    return `
      <article class="video-card linked-news-card news-empty-card">
        <img src="${FALLBACK_NEWS_IMAGE}" alt="${title}" loading="lazy" decoding="async">
        <span class="play-btn"><i class="fa-solid fa-play"></i></span>
        <div>
          <span class="tag">${badge}</span>
          <h3>${title}</h3>
        </div>
      </article>
    `;
  }

  return `
    <article class="news-card news-empty-card">
      <img src="${FALLBACK_NEWS_IMAGE}" alt="${title}" loading="lazy" decoding="async">
      <div class="card-body">
        <span class="tag">${badge}</span>
        <h3>${title}</h3>
        <p>${summary}</p>
        <button class="read-btn" type="button" disabled>${currentLanguage === "hi" ? "जल्द" : "Soon"}</button>
      </div>
    </article>
  `;
}

function districtEmptyMarkupList() {
  const placeholders = [
    { en: "Durg", hi: "दुर्ग", href: "durg.html" },
    { en: "Bhilai", hi: "भिलाई", href: "bhilai.html" },
    { en: "Rajnandgaon", hi: "राजनांदगांव", href: "rajnandgaon.html" },
    { en: "Bilaspur", hi: "बिलासपुर", href: "bilaspur.html" }
  ];
  const summaryEn = "Fresh district news will appear here after publish.";
  const summaryHi = "नई खबर publish होते ही यहां दिखाई देगी।";

  return placeholders.map((item) => `
    <article class="district-card news-empty-card" data-page-link="${item.href}" data-city="${item.en.toLowerCase()}">
      <h3 data-en="${item.en}" data-hi="${item.hi}">${currentLanguage === "hi" ? item.hi : item.en}</h3>
      <p data-en="${summaryEn}" data-hi="${summaryHi}">${currentLanguage === "hi" ? summaryHi : summaryEn}</p>
      <a class="visit-btn" href="${item.href}?lang=${currentLanguage}" data-en="Visit Page" data-hi="पेज देखें">${currentLanguage === "hi" ? "पेज देखें" : "Visit Page"}</a>
    </article>
  `).join("");
}

function renderHomepageEmptyState() {
  homepageLiveNews = [];
  setSectionTitleForGrid(".latest-grid", "Trending News", "ट्रेंडिंग न्यूज़");
  const replacements = [
    [".city-grid", emptyNewsMarkup("card").repeat(3)],
    [".district-news-grid", districtEmptyMarkupList()],
    [".latest-grid", emptyNewsMarkup("card").repeat(3)],
    [".entertainment-grid", emptyNewsMarkup("card").repeat(3)],
    [".world-grid", emptyNewsMarkup("card").repeat(3)],
    [".mini-news-grid", emptyNewsMarkup("mini").repeat(4)],
    [".video-grid", emptyNewsMarkup("video").repeat(2)]
  ];

  replacements.forEach(([selector, html]) => {
    const node = document.querySelector(selector);
    if (node) {
      node.innerHTML = html;
    }
  });
}

function applyNewsToCard(card, item, options = {}) {
  if (!card || !item) {
    return;
  }

  const mode = options.mode || "article";
  const titleEn = localizedNewsField(item, "title", "en") || localizedNewsField(item, "title", "hi") || item.title || "News update";
  const titleHi = localizedNewsField(item, "title", "hi") || titleEn;
  const summaryEn = localizedNewsField(item, "summary", "en") || localizedNewsField(item, "body", "en") || titleEn;
  const summaryHi = localizedNewsField(item, "summary", "hi") || localizedNewsField(item, "body", "hi") || titleHi;
  const bodyEn = localizedNewsField(item, "body", "en") || summaryEn;
  const bodyHi = localizedNewsField(item, "body", "hi") || summaryHi;
  const image = item.image || FALLBACK_NEWS_IMAGE;
  const tagBase = String(item.categoryBadge || item.category || item.city || "NEWS").trim();
  const tagTextEn = normalizeDisplayText(tagBase).toUpperCase();
  const tagTextHi = getHindiText(tagBase, tagBase);
  const pageLink = newsPageLink(item, mode);

  card.dataset.newsTitle = titleEn;
  card.dataset.newsHiTitle = titleHi;
  card.dataset.newsBody = bodyEn;
  card.dataset.newsHiBody = bodyHi;
  card.dataset.articleUrl = mode === "article" ? (safeSitePath(item.articleUrl) || pageLink) : "";
  card.dataset.pageLink = pageLink;
  card.dataset.city = item.city || "";
  card.dataset.category = item.category || "";

  const imageNode = card.querySelector("img");
  if (imageNode) {
    imageNode.src = image;
    imageNode.alt = titleEn;
  }

  if (card.classList.contains("district-card")) {
    card.style.background = `linear-gradient(135deg, rgba(20, 22, 26, 0.88), rgba(167, 12, 21, 0.86)), url("${image}") center/cover`;
  }

  const tagNode = card.querySelector(".tag");
  if (tagNode) {
    tagNode.dataset.en = tagTextEn;
    tagNode.dataset.hi = tagTextHi;
    tagNode.textContent = getLocalizedText(tagTextEn, tagTextHi, currentLanguage);
  }

  const titleNode = card.querySelector("h1, h2, h3");
  const districtNameEn = item.city
    ? `${item.city}`.replace(/(^\w)/, (char) => char.toUpperCase())
    : item.category || "";
  const districtNameHi = getHindiText(districtNameEn, districtNameEn);
  if (titleNode) {
    const cardTitleEn = card.classList.contains("district-card") && districtNameEn ? districtNameEn : titleEn;
    const cardTitleHi = card.classList.contains("district-card") && districtNameHi ? districtNameHi : titleHi;
    titleNode.dataset.en = cardTitleEn;
    titleNode.dataset.hi = cardTitleHi;
    titleNode.textContent = getLocalizedText(cardTitleEn, cardTitleHi, currentLanguage);
  }

  const summaryNode = card.querySelector(".card-body p, p");
  if (summaryNode) {
    const cardSummaryEn = card.classList.contains("district-card") || card.closest(".mini-news-grid") ? titleEn : summaryEn;
    const cardSummaryHi = card.classList.contains("district-card") || card.closest(".mini-news-grid") ? titleHi : summaryHi;
    summaryNode.dataset.en = cardSummaryEn;
    summaryNode.dataset.hi = cardSummaryHi;
    summaryNode.textContent = getLocalizedText(cardSummaryEn, cardSummaryHi, currentLanguage);
  }

  const actionNode = card.querySelector(".read-btn, .visit-btn, button");
  const actionEn = options.buttonEn || (mode === "category" ? "Visit Page" : "Read Full News");
  const actionHi = options.buttonHi || (mode === "category" ? "पेज देखें" : "पूरी खबर पढ़ें");

  if (actionNode) {
    actionNode.dataset.en = actionEn;
    actionNode.dataset.hi = actionHi;
    actionNode.textContent = getLocalizedText(actionEn, actionHi, currentLanguage);

    if (actionNode.tagName === "A") {
      actionNode.href = articleHref(item, mode);
    }
  }
}

function refreshHomepageTicker(items = []) {
  const track = document.querySelector(".flash-track");

  if (!track || !items.length) {
    return;
  }

  const tickerItems = items.slice(0, 6).map((item) => {
    const en = localizedNewsField(item, "title", "en") || item.title || "";
    const hi = localizedNewsField(item, "title", "hi") || en;
    return `<span data-en="${escapeHTML(en)}" data-hi="${escapeHTML(hi)}">${escapeHTML(getLocalizedText(en, hi, currentLanguage))}</span>`;
  }).join("");

  track.innerHTML = tickerItems + tickerItems;
}

function updateHomepageSeo(item = {}) {
  const title = localizedNewsField(item, "title", "hi") || localizedNewsField(item, "title", "en");
  const summary = localizedNewsField(item, "summary", "hi") || localizedNewsField(item, "summary", "en");
  const image = item.image || FALLBACK_NEWS_IMAGE;

  if (!title) {
    return;
  }

  document.title = `${title} | Khabri Junction`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", summary || "Khabri Junction brings latest Chhattisgarh news.");
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", `${title} | Khabri Junction`);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", summary || "Latest Chhattisgarh news on Khabri Junction.");
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", image);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${window.location.origin}/index.html`);
}

function hydrateHomepageSections(news = []) {
  const published = Array.isArray(news)
    ? news.filter((item) => !item.status || item.status === "published")
    : [];

  if (!published.length) {
    return;
  }

  homepageLiveNews = published.slice();
  document.querySelectorAll(".admin-updates-section").forEach((section) => section.remove());

  const sorted = published.slice().sort((a, b) => (
    Number(Boolean(b.breaking)) - Number(Boolean(a.breaking)) ||
    Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
    Number(Boolean(b.trending)) - Number(Boolean(a.trending)) ||
    new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0)
  ));

  const storyUsed = new Set();
  const topStoriesNews = [
    ...takeNews(sorted, 5, storyUsed, (item) => item.breaking || item.featured || item.trending),
    ...takeNews(sorted, 5, storyUsed)
  ].slice(0, 5);

  if (topStoriesNews.length) {
    topStories.splice(0, topStories.length, ...topStoriesNews.map(newsToStory));
    storyIndex = 0;
    renderTopStory(false);
    refreshHomepageTicker(topStoriesNews.concat(sorted));
    updateHomepageSeo(topStoriesNews[0]);
  }

  const used = new Set(topStoriesNews.map((item) => newsIdentity(item)));
  const cityCards = Array.from(document.querySelectorAll(".city-grid .news-card"));
  ["durg", "bhilai", "raipur"].forEach((slug, index) => {
    const item = takeNews(sorted, 1, used, (newsItem) => newsMatches(newsItem, slug))[0] || takeNews(sorted, 1, used)[0];
    applyNewsToCard(cityCards[index], item);
  });

  const districtCards = Array.from(document.querySelectorAll(".district-news-grid .district-card"));
  ["durg", "bhilai", "rajnandgaon", "bilaspur"].forEach((slug, index) => {
    const item = takeNews(sorted, 1, used, (newsItem) => newsMatches(newsItem, slug))[0] || takeNews(sorted, 1, used)[0];
    applyNewsToCard(districtCards[index], item, { mode: "category" });
  });

  setSectionTitleForGrid(".latest-grid", "Trending News", "ट्रेंडिंग न्यूज़");
  Array.from(document.querySelectorAll(".latest-grid .news-card")).forEach((card) => {
    const item = takeNews(sorted, 1, used, (newsItem) => newsItem.trending || newsMatches(newsItem, "sports") || newsMatches(newsItem, "politics") || newsMatches(newsItem, "health") || newsMatches(newsItem, "jobs"))[0]
      || takeNews(sorted, 1, used)[0];
    applyNewsToCard(card, item);
  });

  Array.from(document.querySelectorAll(".entertainment-grid .news-card")).forEach((card) => {
    const item = takeNews(sorted, 1, used, (newsItem) => newsMatches(newsItem, "entertainment"))[0]
      || takeNews(sorted, 1, used)[0];
    applyNewsToCard(card, item);
  });

  Array.from(document.querySelectorAll(".world-grid .news-card")).forEach((card) => {
    const item = takeNews(sorted, 1, used, (newsItem) => !newsItem.city && !newsMatches(newsItem, "durg") && !newsMatches(newsItem, "bhilai") && !newsMatches(newsItem, "raipur"))[0]
      || takeNews(sorted, 1, used)[0];
    applyNewsToCard(card, item);
  });

  Array.from(document.querySelectorAll(".mini-news-grid article")).forEach((card) => {
    const item = takeNews(sorted, 1, used)[0];
    applyNewsToCard(card, item);
  });

  const videoGrid = document.querySelector(".video-grid");
  if (videoGrid?.dataset.customVideos !== "true") {
    Array.from(document.querySelectorAll(".video-grid .video-card")).forEach((card) => {
      const item = takeNews(sorted, 1, used, (newsItem) => newsItem.trending || /video|reel|viral/i.test(`${newsItem.category || ""} ${newsItem.title || ""} ${newsItem.summary || ""}`))[0]
        || takeNews(sorted, 1, used)[0];
      applyNewsToCard(card, item);
    });
  }
}

function applyAdminTopStory(data) {
  if (!data.topStory || !data.topStory.enabled || !data.topStory.title) {
    return;
  }

  topStories.unshift({
    kicker: textPair(data.topStory.kicker || "ADMIN UPDATE", data.topStory.kickerHi),
    title: localizedTextPair(data.topStory, "title"),
    summary: localizedTextPair(data.topStory, "summary"),
    body: localizedTextPair(data.topStory, "body", data.topStory.summaryHi || data.topStory.summary || ""),
    image: data.topStory.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1400&auto=format&fit=crop",
    articleUrl: data.topStory.articleUrl || ""
  });
}

function applyAdminTicker(data) {
  if (!Array.isArray(data.ticker) || !data.ticker.length) {
    return;
  }

  const track = document.querySelector(".flash-track");

  if (!track) {
    return;
  }

  track.innerHTML = "";

  data.ticker.filter(Boolean).forEach((item) => {
    const text = textPair(item.en || item, item.hi);
    const span = document.createElement("span");
    span.dataset.en = text.en;
    span.dataset.hi = text.hi;
    span.textContent = text[currentLanguage] || text.en;
    track.appendChild(span);
  });
}

function renderAdminUpdates(data) {
  document.querySelectorAll(".admin-updates-section").forEach((section) => section.remove());

  if (!Array.isArray(data.news) || !data.news.length) {
    return;
  }

  const main = document.querySelector("main");
  const firstSection = main?.querySelector(".section-block");

  if (!main || !firstSection) {
    return;
  }

  const section = document.createElement("section");
  section.className = "section-block reveal admin-updates-section visible";
  section.innerHTML = `
    <div class="section-title">
      <span></span>
      <strong data-en="ADMIN NEWS UPDATES" data-hi="एडमिन न्यूज़ अपडेट">ADMIN NEWS UPDATES</strong>
    </div>
    <div class="news-grid latest-grid" id="adminNewsGrid"></div>
  `;

  const grid = section.querySelector("#adminNewsGrid");

  data.news.forEach((item) => {
    if (!item || !item.title) {
      return;
    }

    const title = localizedTextPair(item, "title");
    const body = localizedTextPair(item, "body", item.summaryHi || item.summary || "");
    const summary = localizedTextPair(item, "summary", item.bodyHi || item.body || "");
    const tag = escapeHTML(item.tag || item.category || "UPDATE");
    const image = escapeHTML(item.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=900&auto=format&fit=crop");
    const titleEn = escapeHTML(title.en);
    const titleHi = escapeHTML(title.hi);
    const summaryEn = escapeHTML(summary.en);
    const summaryHi = escapeHTML(summary.hi);
    const pageUrl = escapeHTML(item.categoryPage || (item.categorySlug ? `/category/${item.categorySlug}` : "/category/breaking"));
    const articleUrl = pageUrl;
    const article = document.createElement("article");

    article.className = "news-card";
    article.dataset.newsTitle = title.en;
    article.dataset.newsBody = body.en;
    article.dataset.newsHiTitle = title.hi;
    article.dataset.newsHiBody = body.hi;
    article.dataset.pageLink = pageUrl;
    article.innerHTML = `
      <img src="${image}" alt="${titleEn}" loading="lazy" decoding="async">
      <div class="card-body">
        <span class="tag">${tag}</span>
        <h3 data-en="${titleEn}" data-hi="${titleHi}">${escapeHTML(title[currentLanguage])}</h3>
        <p data-en="${summaryEn}" data-hi="${summaryHi}">${escapeHTML(summary[currentLanguage])}</p>
        ${articleUrl
          ? `<a class="read-btn" href="${articleUrl}" data-en="Read Full News" data-hi="पूरी खबर पढ़ें">Read Full News</a>`
          : `<button class="read-btn" type="button" data-news-open data-en="Read Full News" data-hi="पूरी खबर पढ़ें">Read Full News</button>`}
      </div>
    `;
    grid.appendChild(article);
  });

  if (grid.children.length) {
    main.insertBefore(section, firstSection);
    applyUiLanguage(currentLanguage);
  }
}

function applyAdminData() {
  const data = readAdminData();
  applyAdminTopStory(data);
  applyAdminTicker(data);
}

async function loadMongoNews() {
  try {
    const news = (await apiRequest("/api/news?status=published&limit=60")).map(normalizeApiNewsItem);
    if (!news.length) {
      renderHomepageEmptyState();
      bindNewsOpenButtons();
      applyUiLanguage(currentLanguage);
      addCardMeta();
      reorderHomepageSections();
      return;
    }
    hydrateHomepageSections(news);
    bindNewsOpenButtons();
    applyUiLanguage(currentLanguage);
    addCardMeta();
    reorderHomepageSections();
  } catch (error) {
    setSectionTitleForGrid(".latest-grid", "Trending News", "ट्रेंडिंग न्यूज़");
    bindNewsOpenButtons();
    applyUiLanguage(currentLanguage);
    addCardMeta();
    reorderHomepageSections();
  }
}

function duplicateTicker() {
  const track = document.querySelector(".flash-track");
  const items = Array.from(track.children);
  items.forEach((item) => track.appendChild(item.cloneNode(true)));
}

function initLoader() {
  const loader = document.getElementById("siteLoader");
  const loaderTime = document.getElementById("loaderTime");

  if (!loader || !loaderTime) {
    return;
  }

  loaderTime.textContent = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const hideLoader = () => {
    window.setTimeout(() => loader.classList.add("hidden"), 1100);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("en-IN");
}

function renderStoryDots() {
  const dots = document.getElementById("storyDots");

  if (!dots.children.length) {
    topStories.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = "story-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Show top story ${index + 1}`);
      dot.addEventListener("click", () => {
        storyIndex = index;
        renderTopStory();
      });
      dots.appendChild(dot);
    });
  }

  Array.from(dots.children).forEach((dot, index) => {
    dot.classList.toggle("active", index === storyIndex);
  });
}

function renderTopStory(animate = true) {
  const story = topStories[storyIndex];
  const card = document.getElementById("topStoryCard");
  const image = document.getElementById("topStoryImage");
  const kicker = document.getElementById("topStoryKicker");
  const title = document.getElementById("topStoryTitle");
  const summary = document.getElementById("topStorySummary");
  const language = currentLanguage;

  if (animate) {
    card.classList.add("is-changing");
    window.setTimeout(() => card.classList.remove("is-changing"), 420);
  }

  image.classList.remove("image-fallback");
  image.onerror = () => {
    image.onerror = null;
    image.classList.add("image-fallback");
    image.src = FALLBACK_NEWS_IMAGE;
  };
  image.src = story.image || FALLBACK_NEWS_IMAGE;
  image.alt = "";
  kicker.dataset.en = story.kicker.en;
  kicker.dataset.hi = story.kicker.hi;
  title.dataset.en = story.title.en;
  title.dataset.hi = story.title.hi;
  summary.dataset.en = story.summary.en;
  summary.dataset.hi = story.summary.hi;
  kicker.textContent = getLocalizedText(story.kicker.en, story.kicker.hi, language);
  title.textContent = getLocalizedText(story.title.en, story.title.hi, language);
  summary.textContent = getLocalizedText(story.summary.en, story.summary.hi, language);
  card.dataset.newsTitle = story.title.en;
  card.dataset.newsBody = story.body.en;
  card.dataset.newsHiTitle = getHindiText(story.title.en, story.title.hi);
  card.dataset.newsHiBody = getHindiText(story.body.en, story.body.hi);
  card.dataset.articleUrl = story.articleUrl || "";
  renderStoryDots();
}

function changeTopStory(direction) {
  storyIndex = (storyIndex + direction + topStories.length) % topStories.length;
  renderTopStory();
}

function updateMarkets() {
  const marketList = document.getElementById("marketList");
  if (!marketList) {
    return;
  }
  marketList.innerHTML = "";

  markets.forEach((market) => {
    const safeLabel = currentLanguage === "hi" ? "आज की क्लोजिंग" : "Today close";
    const label = currentLanguage === "hi" ? "आज की क्लोजिंग" : "Today close";

    const row = document.createElement("div");
    row.className = "market-row";
    row.innerHTML = `
      <div>
        <strong>${market.name}</strong>
        <small>${safeLabel}</small>
      </div>
      <span class="up">
        <i class="fa-solid fa-arrow-trend-up"></i>
        ${market.value} (${market.change})
      </span>
    `;
    marketList.appendChild(row);
  });
}

function youtubeThumbnail(url) {
  const text = String(url || "");
  const match = text.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/))([^?&/]+)/i);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
}

function renderWeatherWidget(weather = []) {
  if (!weather.length) {
    return;
  }

  const main = document.querySelector("main");
  const anchor = document.querySelector(".admin-updates-section") || document.querySelector(".section-block");

  if (!main || !anchor) {
    return;
  }

  let section = document.getElementById("homeWeatherWidget");
  const sectionHTML = `
    <div class="section-title"><span></span><strong>मौसम की जानकारी</strong></div>
    <div class="weather-mini-grid">
      ${weather.map((item) => `
        <a class="weather-mini-card" href="/category/weather">
          <strong>${escapeHTML(item.city || "City")}</strong>
          <span>${escapeHTML(item.temp || "--")}</span>
          <small>${escapeHTML(item.condition || "Weather update")}</small>
        </a>
      `).join("")}
    </div>
  `;

  if (section) {
    section.innerHTML = sectionHTML;
    applyUiLanguage(currentLanguage);
    return;
  }

  section = document.createElement("section");
  section.id = "homeWeatherWidget";
  section.className = "section-block reveal visible";
  section.innerHTML = sectionHTML;
  main.insertBefore(section, anchor.nextSibling);
  applyUiLanguage(currentLanguage);
}

async function realtimeWeatherFallback(weather = []) {
  const places = [
    { city: "Durg", latitude: 21.19, longitude: 81.28 },
    { city: "Bhilai", latitude: 21.21, longitude: 81.38 },
    { city: "Raipur", latitude: 21.25, longitude: 81.63 }
  ];

  try {
    const live = await Promise.all(places.map(async (place) => {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m&timezone=Asia%2FKolkata`, { cache: "no-store" });
      const payload = await response.json();
      const temp = payload.current?.temperature_2m;
      return {
        city: place.city,
        temp: Number.isFinite(Number(temp)) ? `${Math.round(Number(temp))}°C` : "",
        condition: "रीयल-टाइम तापमान"
      };
    }));
    return live.some((item) => item.temp) ? live : weather;
  } catch (error) {
    return weather;
  }
}

function renderCricketScores(scores = []) {
  if (!Array.isArray(scores) || !scores.length) {
    return;
  }

  const main = document.querySelector("main");
  const anchor = document.getElementById("homeWeatherWidget") || document.querySelector(".latest-grid")?.closest(".section-block");

  if (!main || !anchor) {
    return;
  }

  let section = document.getElementById("homeCricketScores");
  const sectionHTML = `
    <div class="section-title"><span></span><strong data-en="CRICKET SCORE" data-hi="क्रिकेट स्कोर">CRICKET SCORE</strong></div>
    <div class="page-link-grid">
      ${scores.map((item) => `
        <a href="/sports.html">
          <strong>${escapeHTML(item.match || "Cricket Match")}</strong>
          <span>${escapeHTML(item.score || "Score update")}</span>
          <small>${escapeHTML(item.status || "Live update")}</small>
        </a>
      `).join("")}
    </div>
  `;

  if (section) {
    section.innerHTML = sectionHTML;
    applyUiLanguage(currentLanguage);
    return;
  }

  section = document.createElement("section");
  section.id = "homeCricketScores";
  section.className = "section-block reveal visible";
  section.innerHTML = sectionHTML;
  main.insertBefore(section, anchor.nextSibling);
  applyUiLanguage(currentLanguage);
}

function looksLikeMediaUrl(value = "") {
  const text = String(value || "").trim();
  return /^(https?:)?\/\//i.test(text) || /^\/assets\//i.test(text);
}

function looksLikeImageAsset(value = "") {
  const text = String(value || "").trim();
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(text) || /images\.unsplash\.com|img\.youtube\.com|cloudinary|cdn|upload/i.test(text);
}

function normalizeHomepageVideoItem(video = {}) {
  const values = [video.title, video.url, video.type, video.thumbnail]
    .map((value) => normalizeDisplayText(value))
    .filter(Boolean);
  const uniqueValues = [...new Set(values)];
  const thumbnail = uniqueValues.find((value) => looksLikeImageAsset(value)) || normalizeDisplayText(video.thumbnail);
  const url = uniqueValues.find((value) => looksLikeMediaUrl(value) && !looksLikeImageAsset(value)) || normalizeDisplayText(video.url);
  const textValues = uniqueValues.filter((value) => !looksLikeMediaUrl(value) && !looksLikeImageAsset(value));
  let title = normalizeDisplayText(video.title);

  if (!title || looksLikeMediaUrl(title) || looksLikeImageAsset(title)) {
    title = textValues.find((value) => value.length > 8) || textValues[0] || "Viral Video";
  }

  let type = normalizeDisplayText(video.type);
  if (!type || looksLikeMediaUrl(type) || looksLikeImageAsset(type) || type.length > 22) {
    type = textValues.find((value) => value !== title && value.length <= 18) || "VIDEO";
  }

  if (looksLikeMediaUrl(title) || looksLikeImageAsset(title)) {
    title = currentLanguage === "hi" ? "ट्रेंडिंग वीडियो अपडेट" : "Trending video update";
  }

  if (looksLikeMediaUrl(type) || looksLikeImageAsset(type)) {
    type = "VIDEO";
  }

  return {
    ...video,
    title,
    url,
    type,
    thumbnail
  };
}

function renderAdminVideos(videos = []) {
  const grid = document.querySelector(".video-grid");
  const usableVideos = Array.isArray(videos)
    ? videos.map((video) => normalizeHomepageVideoItem(video)).filter((video) => video && (video.url || video.thumbnail || video.title))
    : [];

  if (!grid || !usableVideos.length) {
    return;
  }

  grid.dataset.customVideos = "true";
  grid.innerHTML = usableVideos.slice(0, 6).map((video) => {
    const image = video.thumbnail || youtubeThumbnail(video.url) || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop";
    const href = video.url || "/category/viral-videos";

    return `
      <a class="video-card linked-news-card" href="${escapeHTML(href)}" target="${video.url ? "_blank" : "_self"}" rel="noopener">
        <img src="${escapeHTML(image)}" alt="${escapeHTML(video.title || "Viral video")}" loading="lazy" decoding="async">
        <span class="play-btn"><i class="fa-solid fa-play"></i></span>
        <div>
          <span class="tag">${escapeHTML(video.type || "VIDEO")}</span>
          <h3>${escapeHTML(video.title || "Viral Video")}</h3>
        </div>
      </a>
    `;
  }).join("");
  applyUiLanguage(currentLanguage);
}

function renderWebStoriesSegment() {
  if (document.getElementById("homeWebStories")) {
    return;
  }

  const main = document.querySelector("main");
  const bottomAd = document.querySelector(".bottom-ad");

  if (!main || !bottomAd) {
    return;
  }

  const section = document.createElement("section");
  section.id = "homeWebStories";
  section.className = "section-block reveal visible";
  section.innerHTML = `
    <div class="section-title"><span></span><strong>Web Stories</strong></div>
    <div class="page-link-grid">
      <a href="/web-stories">ताजा वेब स्टोरी</a>
      <a href="/category/viral-videos">वायरल वीडियो</a>
      <a href="/category/raipur">रायपुर न्यूज</a>
      <a href="/category/market">मार्केट न्यूज</a>
      <a href="/category/weather">मौसम अपडेट</a>
      <a href="/category/mp-shahdol">MP Shahdol</a>
    </div>
  `;
  main.insertBefore(section, bottomAd);
  applyUiLanguage(currentLanguage);
}

function renderNotificationFooter(notification = {}) {
  if (!notification.enabled || document.getElementById("footerNotifyBox")) {
    return;
  }

  const footerGrid = document.querySelector(".footer-grid");

  if (!footerGrid) {
    return;
  }

  const box = document.createElement("div");
  box.id = "footerNotifyBox";
  box.className = "footer-notify-box";
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title || "Khabri Junction");
  box.innerHTML = `
    <h3>${escapeHTML(notification.title || "ताजा खबरों की सूचना पाएं")}</h3>
    <p>${escapeHTML(notification.description || "लोकल न्यूज अपडेट पाने के लिए सब्सक्राइब करें।")}</p>
    <div class="footer-notify-actions">
      <button class="read-btn" type="button">सब्सक्राइब</button>
      <div class="share-now-icons" aria-label="Share now">
        <span>Share Now</span>
        <a href="https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}" target="_blank" rel="noopener" aria-label="Share on Facebook"><i class="fa-brands fa-facebook-f"></i></a>
        <a href="https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}" target="_blank" rel="noopener" aria-label="Share on X"><i class="fa-brands fa-x-twitter"></i></a>
      </div>
    </div>
  `;
  footerGrid.appendChild(box);
}

function applyAdCode(selector, code) {
  const target = document.querySelector(selector);

  if (target && code) {
    target.innerHTML = code;
    target.classList.add("adsense-ready");
  } else if (target) {
    if (target.classList.contains("top-banner-ad")) {
      target.classList.add("adsense-ready");
    } else {
      target.classList.remove("adsense-ready");
    }
  }
}

async function loadSiteSettings() {
  try {
    document.body.classList.add("ads-pending");
    const settings = await apiRequest("/api/site-settings");

    if (Array.isArray(settings.market) && settings.market.length) {
      markets.splice(0, markets.length, ...settings.market);
      updateMarkets();
    }

    renderWeatherWidget(settings.weather || []);
    realtimeWeatherFallback(settings.weather || []).then(renderWeatherWidget);
    renderCricketScores(settings.cricket || []);
    renderAdminVideos(settings.videos || []);
    renderWebStoriesSegment();
    reorderHomepageSections();
    addCardMeta();
    renderNotificationFooter(settings.notification || {});
    normalizeCategoryLinks();
    applyAdCode(".header-ad", settings.ads?.header);
    applyAdCode(".vertical-ad", settings.ads?.sidebar || settings.ads?.homepage);
    applyAdCode(".wide-bottom-ad", settings.ads?.footer || settings.ads?.homepage);
    applyAdCode(".mobile-sticky-ad", settings.ads?.["mobile-sticky"]);
  } catch (error) {
    document.body.classList.add("ads-pending");
    renderWebStoriesSegment();
    reorderHomepageSections();
    normalizeCategoryLinks();
  }
}

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language === "hi" ? "hi" : "en";
  try {
    localStorage.setItem("khabriJunctionLanguage", currentLanguage);
    localStorage.setItem("kjLanguage", currentLanguage);
    localStorage.setItem("khabriJunctionPortalLanguage", currentLanguage);
  } catch (error) {
    // Language still applies on this page.
  }

  document.querySelectorAll("[data-en][data-hi]").forEach((node) => {
    node.textContent = getLocalizedText(node.dataset.en, node.dataset.hi, language);
  });

  document.querySelectorAll(".language-switch button").forEach((button) => {
    button.textContent = button.dataset.lang === "hi" ? "हिंदी" : "English";
    button.classList.toggle("active", button.dataset.lang === language);
  });

  updateMarkets();
  renderTopStory(false);
  applyUiLanguage(language);
  addCardMeta();
  const stickyButton = document.getElementById("stickySubscribeCta");
  if (stickyButton) {
    stickyButton.textContent = language === "hi" ? "ताजा खबरें" : "Latest News";
  }
}

function initialLanguage() {
  const params = new URLSearchParams(window.location.search);
  const queryLanguage = params.get("lang");

  if (queryLanguage === "en" || queryLanguage === "hi") {
    return queryLanguage;
  }

  try {
    const stored = localStorage.getItem("khabriJunctionLanguage")
      || localStorage.getItem("kjLanguage")
      || localStorage.getItem("khabriJunctionPortalLanguage");
    return stored === "en" ? "en" : "hi";
  } catch (error) {
    return "hi";
  }
}

function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

function openNews(article) {
  const modal = document.getElementById("newsModal");
  const title = getLocalizedText(article.dataset.newsTitle, article.dataset.newsHiTitle, currentLanguage);
  const body = getLocalizedText(article.dataset.newsBody, article.dataset.newsHiBody, currentLanguage);

  document.getElementById("modalTitle").textContent = title || "";
  document.getElementById("modalBody").textContent = body || "";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeNews() {
  const modal = document.getElementById("newsModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function bindNewsOpenButtons() {
  document.querySelectorAll("[data-news-open]").forEach((button) => {
    if (button.dataset.newsBound === "true") {
      return;
    }

    button.dataset.newsBound = "true";
    button.addEventListener("click", () => {
      const article = button.closest("[data-news-title]");

      if (article?.dataset.articleUrl) {
        const separator = article.dataset.articleUrl.includes("?") ? "&" : "?";
        window.location.href = `${article.dataset.articleUrl}${separator}lang=${currentLanguage}`;
        return;
      }

      if (article?.dataset.pageLink) {
        const separator = article.dataset.pageLink.includes("?") ? "&" : "?";
        window.location.href = `${article.dataset.pageLink}${separator}lang=${currentLanguage}`;
        return;
      }

      if (article) {
        openNews(article);
      }
    });
  });
}

function bindActions() {
  const menu = document.querySelector(".main-menu");
  const menuToggle = document.getElementById("menuToggle");
  const districtMenu = document.querySelector(".menu-district-menu");

  const positionDistrictMenu = () => {
    if (!districtMenu?.open || window.matchMedia("(max-width: 680px)").matches) {
      return;
    }

    const summary = districtMenu.querySelector("summary");
    const list = districtMenu.querySelector(".menu-district-list");

    if (!summary || !list) {
      return;
    }

    const rect = summary.getBoundingClientRect();
    const width = Math.min(620, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
    const top = Math.min(rect.bottom + 10, window.innerHeight - Math.min(list.scrollHeight || 430, 430) - 12);

    districtMenu.style.setProperty("--district-menu-width", `${width}px`);
    districtMenu.style.setProperty("--district-menu-left", `${left}px`);
    districtMenu.style.setProperty("--district-menu-top", `${Math.max(12, top)}px`);
  };

  districtMenu?.addEventListener("toggle", positionDistrictMenu);
  window.addEventListener("resize", positionDistrictMenu);
  window.addEventListener("scroll", positionDistrictMenu, { passive: true });

  document.addEventListener("click", (event) => {
    if (districtMenu?.open && !event.target.closest(".menu-district-menu")) {
      districtMenu.open = false;
    }
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".menu-links a").forEach((link) => {
    link.addEventListener("click", () => {
      districtMenu?.removeAttribute("open");
      menu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("prevStory").addEventListener("click", () => changeTopStory(-1));
  document.getElementById("nextStory").addEventListener("click", () => changeTopStory(1));

  document.querySelectorAll(".language-switch button").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  document.querySelector(".weather-chip")?.addEventListener("click", () => {
    window.location.href = "/category/weather";
  });

  document.querySelector(".city-market-card")?.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) {
      return;
    }

    window.location.href = "/category/market";
  });

  bindNewsOpenButtons();

  document.querySelectorAll("[data-page-link]").forEach((card) => {
    card.classList.add("linked-news-card");
    card.addEventListener("click", (event) => {
      if (event.target.closest("button, a, [data-news-open]")) {
        return;
      }

      const separator = card.dataset.pageLink.includes("?") ? "&" : "?";
      window.location.href = `${card.dataset.pageLink}${separator}lang=${currentLanguage}`;
    });
  });

  document.querySelector(".modal-close").addEventListener("click", closeNews);
  document.querySelector("[data-close-modal]").addEventListener("click", closeNews);
  document.getElementById("newsModal").addEventListener("click", (event) => {
    if (event.target.id === "newsModal") {
      closeNews();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNews();
    }
  });
}

function optimizeImagesForMobile() {
  document.querySelectorAll("img").forEach((image) => {
    if (!image.closest(".lead-story") && !image.classList.contains("brand-logo")) {
      image.loading = image.loading || "lazy";
    }

    image.decoding = image.decoding || "async";
  });
}

function addCardMeta() {
  document.querySelectorAll(".news-card, .district-card, .mini-news-grid article").forEach((card) => {
    if (card.classList.contains("lead-story")) {
      return;
    }

    if (card.querySelector(".card-meta-row")) {
      return;
    }

    const body = card.querySelector(".card-body") || card;
    const tag = body.querySelector(".tag")?.textContent?.trim()
      || card.dataset.city
      || card.dataset.category
      || "खबर";
    const meta = document.createElement("div");
    meta.className = "card-meta-row";
    meta.innerHTML = `<span>${escapeHTML(tag)}</span><time>${new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" })}</time>`;

    const title = body.querySelector("h3, p");
    if (title) {
      title.insertAdjacentElement("afterend", meta);
    }
  });
}

function addHeroMeta() {
  const overlay = document.querySelector(".lead-overlay");

  if (!overlay || overlay.querySelector(".hero-meta-row")) {
    return;
  }

  const meta = document.createElement("div");
  meta.className = "hero-meta-row";
  meta.innerHTML = `<span>छत्तीसगढ़</span><time>${new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" })}</time>`;
  overlay.insertBefore(meta, overlay.querySelector("h1"));
}

function reorderHomepageSections() {
  const main = document.querySelector("main");

  if (!main) {
    return;
  }

  const priorityFor = (section) => {
    if (section.classList.contains("lead-layout")) return 1;
    if (section.classList.contains("admin-updates-section")) return 2;
    if (section.querySelector(".city-grid")) return 3;
    if (section.id === "districts") return 4;
    if (section.querySelector("#sports")) return 5;
    if (section.querySelector("#politics")) return 6;
    if (section.id === "homeWeatherWidget") return 7;
    if (section.id === "homeCricketScores") return 8;
    if (section.querySelector(".entertainment-grid")) return 9;
    if (section.querySelector(".world-grid")) return 10;
    if (section.querySelector(".video-grid")) return 11;
    if (section.id === "homeWebStories") return 12;
    if (section.classList.contains("bottom-ad")) return 13;
    return 20;
  };

  Array.from(main.children)
    .sort((a, b) => priorityFor(a) - priorityFor(b))
    .forEach((section) => main.appendChild(section));
}

function createStickySubscribeCta() {
  if (document.getElementById("stickySubscribeCta")) {
    return;
  }

  const cta = document.createElement("button");
  cta.id = "stickySubscribeCta";
  cta.className = "sticky-subscribe-cta";
  cta.type = "button";
  cta.textContent = currentLanguage === "hi" ? "ताजा खबरें" : "Latest News";
  document.body.appendChild(cta);

  const toggle = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    const footerTop = document.querySelector(".footer")?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
    const nearFooter = footerTop < window.innerHeight - 96;
    cta.classList.toggle("visible", progress > 0.4 && !nearFooter);
  };

  cta.addEventListener("click", () => {
    window.location.href = "/category/breaking";
  });
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

function bindFooterLinks() {
  const normalizePath = (value = "") => {
    try {
      const url = new URL(value, window.location.origin);
      return url.pathname
        .replace(/\/index\.html$/i, "/")
        .replace(/\.html$/i, "")
        .replace(/\/+$/u, "") || "/";
    } catch (error) {
      return String(value || "").replace(/\.html$/i, "").replace(/\/+$/u, "") || "/";
    }
  };
  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll(".footer a, .visit-strip a").forEach((link) => {
    link.style.pointerEvents = "auto";
    link.style.position = "relative";
    link.style.zIndex = "20";
    const linkPath = normalizePath(link.getAttribute("href") || "");
    const isActive = linkPath === currentPath
      || (currentPath === "/category/breaking" && linkPath === "/category/breaking-news")
      || (currentPath === "/category/astrology" && linkPath === "/category/horoscope");
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    }
    link.addEventListener("click", (event) => {
      event.stopPropagation();
    }, { capture: true });
  });
}

function setupMobileFooterAccordion() {
  document.querySelectorAll(".footer-grid > div").forEach((section) => {
    section.dataset.footerAccordion = "true";
    section.classList.add("open");
  });
}

function startLiveUpdates() {
  updateMarkets();

  window.setInterval(updateMarkets, 30000);

  window.setInterval(() => {
    changeTopStory(1);
  }, 6500);
}

function normalizeCategoryLinks() {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const cleanHref = href.replace(/^\.?\//, "").split(/[?#]/)[0];
    const mappedHref = CATEGORY_LINKS[href] || CATEGORY_LINKS[`/${cleanHref}`] || CATEGORY_LINKS[cleanHref];

    if (mappedHref) {
      link.setAttribute("href", mappedHref);
    }
  });
}

const UTF_MOJIBAKE_BYTES = {
  0x20AC: 0x80,
  0x201A: 0x82,
  0x0192: 0x83,
  0x201E: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02C6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8A,
  0x2039: 0x8B,
  0x0152: 0x8C,
  0x017D: 0x8E,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201C: 0x93,
  0x201D: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02DC: 0x98,
  0x2122: 0x99,
  0x0161: 0x9A,
  0x203A: 0x9B,
  0x0153: 0x9C,
  0x017E: 0x9E,
  0x0178: 0x9F
};

const EXTRA_HI_LABELS_V2 = {
  "BREAKING NEWS": "\u092c\u094d\u0930\u0947\u0915\u093f\u0902\u0917 \u0928\u094d\u092f\u0942\u091c\u093c",
  "DISTRICT LATEST NEWS": "\u091c\u093f\u0932\u093e \u0932\u0947\u091f\u0947\u0938\u094d\u091f \u0928\u094d\u092f\u0942\u091c\u093c",
  "Trending News": "\u091f\u094d\u0930\u0947\u0902\u0921\u093f\u0902\u0917 \u0928\u094d\u092f\u0942\u091c\u093c",
  "Visit Astrology": "\u0930\u093e\u0936\u093f\u092b\u0932 \u0926\u0947\u0916\u0947\u0902",
  "Latest News": "\u0924\u093e\u091c\u093e \u0916\u092c\u0930\u0947\u0902",
  "World": "\u0926\u0947\u0936-\u0926\u0941\u0928\u093f\u092f\u093e",
  "Weather": "\u092e\u094c\u0938\u092e"
};

function repairMojibakeText(value) {
  const text = String(value || "").trim();

  if (!text || !/[à-ÿŒœŠšŽžŸ€‚ƒ„…†‡ˆ‰‹›‘’“”•–—˜™]/.test(text)) {
    return text;
  }

  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => {
      const code = char.charCodeAt(0);
      return code <= 0xff ? code : (UTF_MOJIBAKE_BYTES[code] ?? 0x3f);
    }));

    return new TextDecoder("utf-8").decode(bytes)
      .replace(/\uFFFD/g, "")
      .replace(/°/g, "°")
      .replace(/â€™/g, "'")
      .trim();
  } catch (error) {
    return text;
  }
}

function looksCorruptHindi(value) {
  return /[àÃÂâ�]|œ|™|š|ž|ÿ|\?{2,}/.test(String(value || ""));
}

function normalizeDisplayText(value) {
  const text = String(value || "").trim();
  const normalized = looksCorruptHindi(text) ? repairMojibakeText(text) : text;
  return normalized
    .replace(/°/g, "°")
    .replace(/â€™/g, "'")
    .trim();
}

function getHindiText(en, hi) {
  const english = normalizeDisplayText(en);
  const hindi = normalizeDisplayText(hi);

  if (EXTRA_HI_LABELS_V2[english]) {
    return EXTRA_HI_LABELS_V2[english];
  }

  if (CLEAN_HI_LABELS[english]) {
    return normalizeDisplayText(CLEAN_HI_LABELS[english]);
  }

  if (UI_HI_LABELS[english]) {
    return normalizeDisplayText(UI_HI_LABELS[english]);
  }

  if (HINDI_TEXT_BY_EN[english]) {
    return normalizeDisplayText(HINDI_TEXT_BY_EN[english]);
  }

  if (hindi && !looksCorruptHindi(hindi)) {
    return hindi;
  }

  return english;
}

function getLocalizedText(en, hi, language) {
  return language === "hi" ? getHindiText(en, hi) : normalizeDisplayText(en);
}

function applyUiLanguage(language) {
  const selector = ".tag, .section-title strong, .menu-links a, .menu-district-menu summary, .quick-links a, .portal-main-nav a, .footer a, .footer h3, .footer p, .footer-links a, .footer-links strong, .copyright";

  document.querySelectorAll(selector).forEach((node) => {
    const original = normalizeDisplayText(node.dataset.autoEn || node.dataset.en || node.textContent.trim());

    if (!node.dataset.autoEn) {
      node.dataset.autoEn = original;
    }

    node.textContent = language === "hi" ? getHindiText(original, node.dataset.hi) : original;
  });

  document.querySelectorAll("[data-en]").forEach((node) => {
    node.dataset.en = normalizeDisplayText(node.dataset.en);
  });
}

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language === "hi" ? "hi" : "en";
  try {
    localStorage.setItem("khabriJunctionLanguage", currentLanguage);
  } catch (error) {
    // Language still applies on this page.
  }

  document.querySelectorAll("[data-en][data-hi]").forEach((node) => {
    node.textContent = getLocalizedText(node.dataset.en, node.dataset.hi, language);
  });

  document.querySelectorAll(".language-switch button").forEach((button) => {
    button.textContent = button.dataset.lang === "hi" ? "\u0939\u093f\u0902\u0926\u0940" : "English";
    button.classList.toggle("active", button.dataset.lang === language);
  });

  const searchInput = document.querySelector('.site-search input[name="q"]');
  if (searchInput) {
    const placeholder = language === "hi" ? "\u0916\u092c\u0930 \u0916\u094b\u091c\u0947\u0902" : "Search news";
    searchInput.placeholder = placeholder;
    searchInput.setAttribute("aria-label", placeholder);
  }

  updateMarkets();
  renderTopStory(false);
  applyUiLanguage(language);
  const stickyButton = document.getElementById("stickySubscribeCta");
  if (stickyButton) {
    stickyButton.textContent = language === "hi" ? "\u0924\u093e\u091c\u093e \u0916\u092c\u0930\u0947\u0902" : "Latest News";
  }
}

function updateMarkets() {
  const marketList = document.getElementById("marketList");
  if (!marketList) {
    return;
  }
  marketList.innerHTML = "";

  markets.forEach((market) => {
    const label = currentLanguage === "hi" ? "\u0906\u091c \u0915\u0940 \u0915\u094d\u0932\u094b\u091c\u093f\u0902\u0917" : "Today close";
    const row = document.createElement("div");
    row.className = "market-row";
    row.innerHTML = `
      <div>
        <strong>${market.name}</strong>
        <small>${label}</small>
      </div>
      <span class="up">
        <i class="fa-solid fa-arrow-trend-up"></i>
        ${market.value} (${market.change})
      </span>
    `;
    marketList.appendChild(row);
  });
}

function renderWeatherWidget(weather = []) {
  if (!weather.length) {
    return;
  }

  const main = document.querySelector("main");
  const anchor = document.querySelector(".admin-updates-section") || document.querySelector(".section-block");

  if (!main || !anchor) {
    return;
  }

  let section = document.getElementById("homeWeatherWidget");
  const sectionHTML = `
    <div class="section-title"><span></span><strong>\u092e\u094c\u0938\u092e \u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940</strong></div>
    <div class="weather-mini-grid">
      ${weather.map((item) => `
        <a class="weather-mini-card" href="/category/weather">
          <strong>${escapeHTML(item.city || "City")}</strong>
          <span>${escapeHTML(item.temp || "--")}</span>
          <small>${escapeHTML(item.condition || "Weather update")}</small>
        </a>
      `).join("")}
    </div>
  `;

  if (section) {
    section.innerHTML = sectionHTML;
    applyUiLanguage(currentLanguage);
    return;
  }

  section = document.createElement("section");
  section.id = "homeWeatherWidget";
  section.className = "section-block reveal visible";
  section.innerHTML = sectionHTML;
  main.insertBefore(section, anchor.nextSibling);
  applyUiLanguage(currentLanguage);
}

async function realtimeWeatherFallback(weather = []) {
  const places = [
    { city: "Durg", latitude: 21.19, longitude: 81.28 },
    { city: "Bhilai", latitude: 21.21, longitude: 81.38 },
    { city: "Raipur", latitude: 21.25, longitude: 81.63 }
  ];

  try {
    const live = await Promise.all(places.map(async (place) => {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m&timezone=Asia%2FKolkata`, { cache: "no-store" });
      const payload = await response.json();
      const temp = payload.current?.temperature_2m;
      return {
        city: place.city,
        temp: Number.isFinite(Number(temp)) ? `${Math.round(Number(temp))}°C` : "",
        condition: "\u0930\u093f\u092f\u0932-\u091f\u093e\u0907\u092e \u0924\u093e\u092a\u092e\u093e\u0928"
      };
    }));
    return live.some((item) => item.temp) ? live : weather;
  } catch (error) {
    return weather;
  }
}

function createStickySubscribeCta() {
  if (document.getElementById("stickySubscribeCta")) {
    return;
  }

  const cta = document.createElement("button");
  cta.id = "stickySubscribeCta";
  cta.className = "sticky-subscribe-cta";
  cta.type = "button";
  cta.textContent = currentLanguage === "hi" ? "\u0924\u093e\u091c\u093e \u0916\u092c\u0930\u0947\u0902" : "Latest News";
  document.body.appendChild(cta);

  const toggle = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    const footerTop = document.querySelector(".footer")?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
    const nearFooter = footerTop < window.innerHeight - 96;
    cta.classList.toggle("visible", progress > 0.4 && !nearFooter);
  };

  cta.addEventListener("click", () => {
    window.location.href = "/category/breaking";
  });
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

initLoader();
normalizeCategoryLinks();
applyAdminData();
duplicateTicker();
revealOnScroll();
bindActions();
setLanguage(initialLanguage());
renderTopStory(false);
optimizeImagesForMobile();
addHeroMeta();
addCardMeta();
createStickySubscribeCta();
bindFooterLinks();
setupMobileFooterAccordion();
startLiveUpdates();
loadMongoNews();
loadSiteSettings();

let homepageNewsSyncTimer = null;

function queueHomepageNewsRefresh() {
  window.clearTimeout(homepageNewsSyncTimer);
  homepageNewsSyncTimer = window.setTimeout(() => {
    loadMongoNews();
  }, 220);
}

function setupHomepageNewsSync() {
  if (window.__khabriHomepageSyncBound) {
    return;
  }

  window.__khabriHomepageSyncBound = true;
  newsSyncChannel?.addEventListener("message", queueHomepageNewsRefresh);
  window.addEventListener("storage", (event) => {
    if (event.key === NEWS_SYNC_KEY) {
      queueHomepageNewsRefresh();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      queueHomepageNewsRefresh();
    }
  });
}

function emptyNewsMarkup(type = "card") {
  const badge = currentLanguage === "hi" ? "ताजा" : "LIVE";
  const title = currentLanguage === "hi" ? "नई पोस्ट जल्द आएगी" : "Fresh posts will appear soon";
  const summary = currentLanguage === "hi"
    ? "पुरानी पोस्ट हटाई जा चुकी हैं। नई खबर publish होते ही यहां दिखाई देगी।"
    : "Older posts have been cleared. Newly published stories will appear here.";

  if (type === "district") {
    return `
      <article class="district-card news-empty-card" style="background: linear-gradient(135deg, rgba(20, 22, 26, 0.92), rgba(167, 12, 21, 0.92)), url('${FALLBACK_NEWS_IMAGE}') center/cover;">
        <h3>${badge}</h3>
        <p>${summary}</p>
        <button class="visit-btn" type="button" disabled>${title}</button>
      </article>
    `;
  }

  if (type === "mini") {
    return `
      <article class="news-empty-card">
        <p>${summary}</p>
        <button type="button" disabled>${currentLanguage === "hi" ? "जल्द" : "Soon"}</button>
      </article>
    `;
  }

  if (type === "video") {
    return `
      <article class="video-card linked-news-card news-empty-card">
        <img src="${FALLBACK_NEWS_IMAGE}" alt="${title}" loading="lazy" decoding="async">
        <span class="play-btn"><i class="fa-solid fa-play"></i></span>
        <div>
          <span class="tag">${badge}</span>
          <h3>${title}</h3>
        </div>
      </article>
    `;
  }

  return `
    <article class="news-card news-empty-card">
      <img src="${FALLBACK_NEWS_IMAGE}" alt="${title}" loading="lazy" decoding="async">
      <div class="card-body">
        <span class="tag">${badge}</span>
        <h3>${title}</h3>
        <p>${summary}</p>
        <button class="read-btn" type="button" disabled>${currentLanguage === "hi" ? "जल्द" : "Soon"}</button>
      </div>
    </article>
  `;
}

function districtEmptyMarkupList() {
  const placeholders = [
    { en: "Durg", hi: "दुर्ग", href: "/district/durg" },
    { en: "Bhilai", hi: "भिलाई", href: "/district/bhilai" },
    { en: "Rajnandgaon", hi: "राजनांदगांव", href: "/district/rajnandgaon" },
    { en: "Bilaspur", hi: "बिलासपुर", href: "/district/bilaspur" }
  ];
  const summaryEn = "Fresh district news will appear here after publish.";
  const summaryHi = "नई खबर publish होते ही यहां दिखाई देगी।";

  return placeholders.map((item) => `
    <article class="district-card news-empty-card" data-page-link="${item.href}" data-city="${item.en.toLowerCase()}">
      <h3 data-en="${item.en}" data-hi="${item.hi}">${currentLanguage === "hi" ? item.hi : item.en}</h3>
      <p data-en="${summaryEn}" data-hi="${summaryHi}">${currentLanguage === "hi" ? summaryHi : summaryEn}</p>
      <a class="visit-btn" href="${item.href}?lang=${currentLanguage}" data-en="Visit Page" data-hi="पेज देखें">${currentLanguage === "hi" ? "पेज देखें" : "Visit Page"}</a>
    </article>
  `).join("");
}

function newsPageLink(item = {}, mode = "article") {
  if (mode === "district") {
    return safeSitePath(item.districtPage) || safeSitePath(item.categoryPage) || (item.districtSlug ? `/district/${item.districtSlug}` : (item.categorySlug ? `/category/${item.categorySlug}` : "/category/breaking"));
  }

  if (mode === "category") {
    return safeSitePath(item.categoryPage) || (item.categorySlug ? `/category/${item.categorySlug}` : "/category/breaking");
  }

  return safeSitePath(item.articleUrl) || safeSitePath(item.categoryPage) || (item.categorySlug ? `/category/${item.categorySlug}` : "/category/breaking");
}

function applyNewsToCard(card, item, options = {}) {
  if (!card || !item) {
    return;
  }

  const mode = options.mode || "article";
  const titleEn = localizedNewsField(item, "title", "en") || localizedNewsField(item, "title", "hi") || item.title || "News update";
  const titleHi = localizedNewsField(item, "title", "hi") || titleEn;
  const summaryEn = localizedNewsField(item, "summary", "en") || localizedNewsField(item, "body", "en") || titleEn;
  const summaryHi = localizedNewsField(item, "summary", "hi") || localizedNewsField(item, "body", "hi") || titleHi;
  const bodyEn = localizedNewsField(item, "body", "en") || summaryEn;
  const bodyHi = localizedNewsField(item, "body", "hi") || summaryHi;
  const image = item.image || FALLBACK_NEWS_IMAGE;
  const categoryEn = normalizeDisplayText(item.categoryBadge || item.category || "News");
  const categoryHi = getHindiText(categoryEn, categoryEn);
  const districtEn = normalizeDisplayText(item.district || item.city || "");
  const districtHi = districtEn ? getHindiText(districtEn, districtEn) : "";
  const pageLink = newsPageLink(item, mode);

  card.dataset.newsTitle = titleEn;
  card.dataset.newsHiTitle = titleHi;
  card.dataset.newsBody = bodyEn;
  card.dataset.newsHiBody = bodyHi;
  card.dataset.articleUrl = mode === "article" ? (safeSitePath(item.articleUrl) || pageLink) : "";
  card.dataset.pageLink = pageLink;
  card.dataset.city = item.city || "";
  card.dataset.category = item.category || "";
  card.dataset.categoryLabel = categoryEn;
  card.dataset.categoryLabelHi = categoryHi;
  card.dataset.districtLabel = districtEn;
  card.dataset.districtLabelHi = districtHi;
  card.dataset.publishedAt = item.publishedAt || item.createdAt || "";

  const imageNode = card.querySelector("img");
  if (imageNode) {
    imageNode.src = image;
    imageNode.alt = titleEn;
  }

  if (card.classList.contains("district-card")) {
    card.style.background = `linear-gradient(135deg, rgba(20, 22, 26, 0.88), rgba(167, 12, 21, 0.86)), url("${image}") center/cover`;
  }

  const tagNode = card.querySelector(".tag");
  if (tagNode) {
    tagNode.dataset.en = categoryEn;
    tagNode.dataset.hi = categoryHi;
    tagNode.textContent = getLocalizedText(categoryEn, categoryHi, currentLanguage);
  }

  const titleNode = card.querySelector("h1, h2, h3");
  if (titleNode) {
    titleNode.dataset.en = titleEn;
    titleNode.dataset.hi = titleHi;
    titleNode.textContent = getLocalizedText(titleEn, titleHi, currentLanguage);
  }

  const summaryNode = card.querySelector(".card-body p, p");
  if (summaryNode) {
    summaryNode.dataset.en = summaryEn;
    summaryNode.dataset.hi = summaryHi;
    summaryNode.textContent = getLocalizedText(summaryEn, summaryHi, currentLanguage);
  }

  const actionNode = card.querySelector(".read-btn, .visit-btn, button");
  const actionEn = options.buttonEn || (mode === "district" || mode === "category" ? "Read More" : "Read Full News");
  const actionHi = options.buttonHi || (mode === "district" || mode === "category" ? "और पढ़ें" : "पूरी खबर पढ़ें");

  if (actionNode) {
    actionNode.dataset.en = actionEn;
    actionNode.dataset.hi = actionHi;
    actionNode.textContent = getLocalizedText(actionEn, actionHi, currentLanguage);

    if (actionNode.tagName === "A") {
      actionNode.href = articleHref(item, mode);
    }
  }
}

function addCardMeta() {
  document.querySelectorAll(".news-card, .district-card, .mini-news-grid article").forEach((card) => {
    if (card.classList.contains("lead-story")) {
      return;
    }

    const body = card.querySelector(".card-body") || card;
    let meta = card.querySelector(".card-meta-row");

    if (!meta) {
      meta = document.createElement("div");
      meta.className = "card-meta-row";
      const titleNode = body.querySelector("h3, p");
      if (titleNode) {
        titleNode.insertAdjacentElement("afterend", meta);
      } else {
        body.appendChild(meta);
      }
    }

    const categoryEn = card.dataset.categoryLabel || body.querySelector(".tag")?.dataset.en || card.dataset.category || "News";
    const categoryHi = card.dataset.categoryLabelHi || body.querySelector(".tag")?.dataset.hi || categoryEn;
    const districtEn = card.dataset.districtLabel || "";
    const districtHi = card.dataset.districtLabelHi || districtEn;
    const rawDate = card.dataset.publishedAt;
    const date = rawDate ? new Date(rawDate) : null;
    const timeText = date && !Number.isNaN(date.getTime())
      ? date.toLocaleString(currentLanguage === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleTimeString(currentLanguage === "hi" ? "hi-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" });

    meta.innerHTML = `
      <span>${escapeHTML(getLocalizedText(categoryEn, categoryHi, currentLanguage))}</span>
      ${districtEn ? `<span>${escapeHTML(getLocalizedText(districtEn, districtHi, currentLanguage))}</span>` : ""}
      <time>${escapeHTML(timeText)}</time>
    `;
  });
}

function hydrateHomepageSections(news = []) {
  const published = Array.isArray(news)
    ? news.filter((item) => !item.status || item.status === "published")
    : [];

  if (!published.length) {
    return;
  }

  homepageLiveNews = published.slice();
  document.querySelectorAll(".admin-updates-section").forEach((section) => section.remove());

  const sorted = published.slice().sort((a, b) => (
    Number(Boolean(b.breaking)) - Number(Boolean(a.breaking)) ||
    Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
    Number(Boolean(b.trending)) - Number(Boolean(a.trending)) ||
    new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0)
  ));

  const storyUsed = new Set();
  const topStoriesNews = [
    ...takeNews(sorted, 5, storyUsed, (item) => item.breaking || item.featured || item.trending),
    ...takeNews(sorted, 5, storyUsed)
  ].slice(0, 5);

  if (topStoriesNews.length) {
    topStories.splice(0, topStories.length, ...topStoriesNews.map(newsToStory));
    storyIndex = 0;
    renderTopStory(false);
    refreshHomepageTicker(topStoriesNews.concat(sorted));
    updateHomepageSeo(topStoriesNews[0]);
  }

  const used = new Set(topStoriesNews.map((item) => newsIdentity(item)));
  const cityCards = Array.from(document.querySelectorAll(".city-grid .news-card"));
  ["durg", "bhilai", "raipur"].forEach((slug, index) => {
    const item = takeNews(sorted, 1, used, (newsItem) => newsMatches(newsItem, slug))[0] || takeNews(sorted, 1, used)[0];
    applyNewsToCard(cityCards[index], item);
  });

  const districtCards = Array.from(document.querySelectorAll(".district-news-grid .district-card"));
  ["durg", "bhilai", "rajnandgaon", "bilaspur"].forEach((slug, index) => {
    const item = takeNews(sorted, 1, used, (newsItem) => newsMatches(newsItem, slug))[0] || takeNews(sorted, 1, used)[0];
    applyNewsToCard(districtCards[index], item, { mode: "district" });
  });

  setSectionTitleForGrid(".latest-grid", "Trending News", "ट्रेंडिंग न्यूज़");
  Array.from(document.querySelectorAll(".latest-grid .news-card")).forEach((card) => {
    const item = takeNews(sorted, 1, used, (newsItem) => newsItem.trending || newsMatches(newsItem, "sports") || newsMatches(newsItem, "politics") || newsMatches(newsItem, "health") || newsMatches(newsItem, "jobs"))[0]
      || takeNews(sorted, 1, used)[0];
    applyNewsToCard(card, item);
  });

  Array.from(document.querySelectorAll(".entertainment-grid .news-card")).forEach((card) => {
    const item = takeNews(sorted, 1, used, (newsItem) => newsMatches(newsItem, "entertainment"))[0]
      || takeNews(sorted, 1, used)[0];
    applyNewsToCard(card, item);
  });

  Array.from(document.querySelectorAll(".world-grid .news-card")).forEach((card) => {
    const item = takeNews(sorted, 1, used, (newsItem) => !newsItem.city && !newsMatches(newsItem, "durg") && !newsMatches(newsItem, "bhilai") && !newsMatches(newsItem, "raipur"))[0]
      || takeNews(sorted, 1, used)[0];
    applyNewsToCard(card, item);
  });

  Array.from(document.querySelectorAll(".mini-news-grid article")).forEach((card) => {
    const item = takeNews(sorted, 1, used)[0];
    applyNewsToCard(card, item);
  });

  const videoGrid = document.querySelector(".video-grid");
  if (videoGrid?.dataset.customVideos !== "true") {
    Array.from(document.querySelectorAll(".video-grid .video-card")).forEach((card) => {
      const item = takeNews(sorted, 1, used, (newsItem) => newsItem.trending || /video|reel|viral/i.test(`${newsItem.category || ""} ${newsItem.title || ""} ${newsItem.summary || ""}`))[0]
        || takeNews(sorted, 1, used)[0];
      applyNewsToCard(card, item);
    });
  }
}

setupHomepageNewsSync();

const FINAL_SITE_MOJIBAKE_BYTES = {
  0x20AC: 0x80,
  0x201A: 0x82,
  0x0192: 0x83,
  0x201E: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02C6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8A,
  0x2039: 0x8B,
  0x0152: 0x8C,
  0x017D: 0x8E,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201C: 0x93,
  0x201D: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02DC: 0x98,
  0x2122: 0x99,
  0x0161: 0x9A,
  0x203A: 0x9B,
  0x0153: 0x9C,
  0x017E: 0x9E,
  0x0178: 0x9F
};

const FINAL_HOME_HI_LABELS = {
  "BREAKING": "ताज़ा",
  "Durg, Bhilai and Raipur news desk is live": "दुर्ग, भिलाई और रायपुर न्यूज़ डेस्क लाइव है",
  "Local news desk shares fresh district updates": "लोकल न्यूज़ डेस्क ताज़ा जिला अपडेट साझा कर रहा है",
  "Kawardha, Khairagarh, Rajnandgaon and Bilaspur pages updated": "कवर्धा, खैरागढ़, राजनांदगांव और बिलासपुर पेज अपडेट हैं",
  "Market watch and ad booking sections are open": "मार्केट वॉच और विज्ञापन बुकिंग सेक्शन खुले हैं",
  "Fastest digital news for Chhattisgarh": "छत्तीसगढ़ की सबसे तेज डिजिटल न्यूज़",
  "Durg 34°": "दुर्ग 34°",
  "ADVERTISEMENT": "विज्ञापन",
  "Local business, stock marketing and digital campaigns": "लोकल बिज़नेस, स्टॉक मार्केटिंग और डिजिटल कैंपेन",
  "Menu": "मेन्यू",
  "Home": "होम",
  "Breaking": "ब्रेकिंग",
  "Raipur Promotion": "रायपुर प्रमोशन",
  "Market": "आज का बाजार",
  "Weather": "मौसम",
  "Viral Videos": "वायरल वीडियो",
  "Local News": "लोकल खबरें",
  "MP Shahdol": "एमपी शहडोल",
  "World": "देश-दुनिया",
  "Coverage Across": "कवरेज",
  "Entire Chhattisgarh": "पूरा छत्तीसगढ़",
  "TOP STORY": "मुख्य खबर",
  "Read Full News": "पूरी खबर पढ़ें",
  "FOR AD": "विज्ञापन",
  "Book banner, news sponsor or campaign slot": "बैनर, न्यूज़ स्पॉन्सर या कैंपेन स्लॉट बुक करें",
  "CITY LATEST NEWS": "शहर की ताज़ा खबरें",
  "LATEST NEWS": "ताज़ा खबरें",
  "INDIAN STOCK MARKET": "भारतीय शेयर बाजार",
  "Market Closed Today": "आज बाजार बंद",
  "Today close": "आज की क्लोजिंग",
  "DISTRICT LATEST NEWS": "जिला लेटेस्ट न्यूज़",
  "Visit Page": "पेज देखें",
  "Visit Durg Page": "दुर्ग पेज देखें",
  "Visit Bhilai Page": "भिलाई पेज देखें",
  "Visit Raipur Page": "रायपुर पेज देखें",
  "All CG District News": "सभी सीजी जिला खबरें",
  "MORE NEWS": "और खबरें",
  "BOTTOM AD SPACE": "बॉटम विज्ञापन स्पेस",
  "ENTERTAINMENT TOP 6": "मनोरंजन टॉप 6",
  "Read": "पढ़ें",
  "VIRAL REELS & VIDEO": "ट्रेंडिंग रील और वीडियो",
  "WORLD NEWS UPDATE": "देश-दुनिया की खबर",
  "Quick Links": "क्विक लिंक",
  "Important Pages": "ज़रूरी पेज",
  "About Us": "हमारे बारे में",
  "Contact Us": "संपर्क करें",
  "Privacy Policy": "प्राइवेसी पॉलिसी",
  "Cookie Policy": "कुकी नीति",
  "Terms & Conditions": "नियम और शर्तें",
  "Disclaimer": "डिस्क्लेमर",
  "Editorial Policy": "संपादकीय नीति",
  "Fact Check Policy": "फैक्ट चेक नीति",
  "Correction Policy": "सुधार नीति",
  "Advertise": "विज्ञापन",
  "Admin Panel": "एडमिन पैनल",
  "Contact": "संपर्क",
  "Modern digital news platform for Chhattisgarh and India.": "छत्तीसगढ़ और भारत की भरोसेमंद डिजिटल न्यूज़ सेवा",
  "FULL FLASH NEWS": "फुल फ्लैश न्यूज़",
  "Back To Home": "होम पर वापस",
  "All Districts": "सभी जिले",
  "All CG News": "सभी सीजी खबरें",
  "CG DISTRICTS": "छत्तीसगढ़ जिले",
  "Search news": "खबर खोजें",
  "Latest News": "ताज़ा खबरें",
  "Read More": "और पढ़ें",
  "Soon": "जल्द",
  "Fresh posts will appear soon": "नई पोस्ट जल्द आएगी",
  "Older posts have been cleared. Newly published stories will appear here.": "पुरानी पोस्ट हटाई जा चुकी हैं। नई खबर publish होते ही यहां दिखाई देगी।",
  "Fresh district news will appear here after publish.": "नई खबर publish होते ही यहां दिखाई देगी।"
};

function decodeFinalSiteMojibake(value) {
  const text = String(value || "").trim();

  if (!text || !/[à-ÿĀ-žƒˆ˜€™]/.test(text)) {
    return text;
  }

  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => {
      const code = char.charCodeAt(0);
      return code <= 0xff ? code : (FINAL_SITE_MOJIBAKE_BYTES[code] ?? 0x3f);
    }));

    return new TextDecoder("utf-8").decode(bytes)
      .replace(/\uFFFD/g, "")
      .replace(/Â°/g, "°")
      .replace(/Ã¢â‚¬â„¢/g, "'")
      .trim();
  } catch (error) {
    return text;
  }
}

function cleanFinalSiteText(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) {
    return text;
  }
  return (/à¤|à¥|Ã|Â|â/.test(text) ? decodeFinalSiteMojibake(text) : text)
    .replace(/Â°/g, "°")
    .replace(/Ã¢â‚¬â„¢/g, "'")
    .trim();
}

function hasVisibleHindi(value) {
  return /[\u0900-\u097F]/.test(String(value || ""));
}

getHindiText = function getHindiText(en, hi) {
  const english = cleanFinalSiteText(en);
  const inlineHindi = cleanFinalSiteText(hi);

  if (FINAL_HOME_HI_LABELS[english]) {
    return FINAL_HOME_HI_LABELS[english];
  }

  if (hasVisibleHindi(inlineHindi)) {
    return inlineHindi;
  }

  const repairedMapped = cleanFinalSiteText(UI_HI_LABELS[english] || HINDI_TEXT_BY_EN[english] || "");
  if (hasVisibleHindi(repairedMapped)) {
    return repairedMapped;
  }

  return english;
};

getLocalizedText = function getLocalizedText(en, hi, language) {
  return language === "hi" ? getHindiText(en, hi) : cleanFinalSiteText(en);
};

applyUiLanguage = function applyUiLanguage(language) {
  const selector = ".tag, .section-title strong, .menu-links a, .menu-district-menu summary, .menu-district-menu a, .quick-links a, .coverage-links a, .portal-main-nav a, .footer a, .footer h3, .footer p, .footer-links a, .footer-links strong, .copyright";

  document.querySelectorAll(selector).forEach((node) => {
    const original = cleanFinalSiteText(node.dataset.autoEn || node.dataset.en || node.textContent.trim());

    if (!node.dataset.autoEn) {
      node.dataset.autoEn = original;
    }

    node.textContent = language === "hi" ? getHindiText(original, node.dataset.hi) : original;
  });

  document.querySelectorAll("[data-en]").forEach((node) => {
    node.dataset.en = cleanFinalSiteText(node.dataset.en);
    if (node.dataset.hi) {
      node.dataset.hi = getHindiText(node.dataset.en, node.dataset.hi);
    }
  });
};

emptyNewsMarkup = function emptyNewsMarkup(type = "card") {
  const badge = currentLanguage === "hi" ? "ताज़ा" : "LIVE";
  const title = currentLanguage === "hi" ? "नई पोस्ट जल्द आएगी" : "Fresh posts will appear soon";
  const summary = currentLanguage === "hi"
    ? "पुरानी पोस्ट हटाई जा चुकी हैं। नई खबर publish होते ही यहां दिखाई देगी।"
    : "Older posts have been cleared. Newly published stories will appear here.";

  if (type === "district") {
    return `
      <article class="district-card news-empty-card" style="background: linear-gradient(135deg, rgba(20, 22, 26, 0.92), rgba(167, 12, 21, 0.92)), url('${FALLBACK_NEWS_IMAGE}') center/cover;">
        <h3>${badge}</h3>
        <p>${summary}</p>
        <button class="visit-btn" type="button" disabled>${title}</button>
      </article>
    `;
  }

  if (type === "mini") {
    return `
      <article class="news-empty-card">
        <p>${summary}</p>
        <button type="button" disabled>${currentLanguage === "hi" ? "जल्द" : "Soon"}</button>
      </article>
    `;
  }

  if (type === "video") {
    return `
      <article class="video-card linked-news-card news-empty-card">
        <img src="${FALLBACK_NEWS_IMAGE}" alt="${title}" loading="lazy" decoding="async">
        <span class="play-btn"><i class="fa-solid fa-play"></i></span>
        <div>
          <span class="tag">${badge}</span>
          <h3>${title}</h3>
        </div>
      </article>
    `;
  }

  return `
    <article class="news-card news-empty-card">
      <img src="${FALLBACK_NEWS_IMAGE}" alt="${title}" loading="lazy" decoding="async">
      <div class="card-body">
        <span class="tag">${badge}</span>
        <h3>${title}</h3>
        <p>${summary}</p>
        <button class="read-btn" type="button" disabled>${currentLanguage === "hi" ? "जल्द" : "Soon"}</button>
      </div>
    </article>
  `;
};

districtEmptyMarkupList = function districtEmptyMarkupList() {
  const placeholders = [
    { en: "Durg", hi: "दुर्ग", href: "/district/durg" },
    { en: "Bhilai", hi: "भिलाई", href: "/district/bhilai" },
    { en: "Rajnandgaon", hi: "राजनांदगांव", href: "/district/rajnandgaon" },
    { en: "Bilaspur", hi: "बिलासपुर", href: "/district/bilaspur" }
  ];
  const summaryEn = "Fresh district news will appear here after publish.";
  const summaryHi = "नई खबर publish होते ही यहां दिखाई देगी।";

  return placeholders.map((item) => `
    <article class="district-card news-empty-card" data-page-link="${item.href}" data-city="${item.en.toLowerCase()}">
      <h3 data-en="${item.en}" data-hi="${item.hi}">${currentLanguage === "hi" ? item.hi : item.en}</h3>
      <p data-en="${summaryEn}" data-hi="${summaryHi}">${currentLanguage === "hi" ? summaryHi : summaryEn}</p>
      <a class="visit-btn" href="${item.href}?lang=${currentLanguage}" data-en="Visit Page" data-hi="पेज देखें">${currentLanguage === "hi" ? "पेज देखें" : "Visit Page"}</a>
    </article>
  `).join("");
};

setLanguage = function setLanguage(language) {
  currentLanguage = language === "en" ? "en" : "hi";
  document.documentElement.lang = currentLanguage;

  try {
    localStorage.setItem("khabriJunctionLanguage", currentLanguage);
    localStorage.setItem("kjLanguage", currentLanguage);
  } catch (error) {
    // Ignore storage issues on embedded contexts.
  }

  document.querySelectorAll("[data-en][data-hi]").forEach((node) => {
    node.dataset.en = cleanFinalSiteText(node.dataset.en);
    node.dataset.hi = getHindiText(node.dataset.en, node.dataset.hi);
    node.textContent = getLocalizedText(node.dataset.en, node.dataset.hi, currentLanguage);
  });

  document.querySelectorAll(".language-switch button").forEach((button) => {
    button.textContent = button.dataset.lang === "hi" ? "हिंदी" : "English";
    button.classList.toggle("active", button.dataset.lang === currentLanguage);
  });

  const searchInput = document.querySelector('.site-search input[name="q"]');
  if (searchInput) {
    const placeholder = currentLanguage === "hi" ? "खबर खोजें" : "Search news";
    searchInput.placeholder = placeholder;
    searchInput.setAttribute("aria-label", placeholder);
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", currentLanguage);
    window.history.replaceState({}, "", url);
  } catch (error) {
    // URL sync is optional.
  }

  updateMarkets();
  renderTopStory(false);
  applyUiLanguage(currentLanguage);
  addCardMeta();

  const stickyButton = document.getElementById("stickySubscribeCta");
  if (stickyButton) {
    stickyButton.textContent = currentLanguage === "hi" ? "ताज़ा खबरें" : "Latest News";
  }
};

setLanguage(currentLanguage || initialLanguage());

function pickHomepageCardNews(sorted, used, matcher) {
  return takeNews(sorted, 1, used, matcher)[0]
    || takeNews(sorted, 1, used)[0]
    || null;
}

hydrateHomepageSections = function hydrateHomepageSections(news = []) {
  const published = Array.isArray(news)
    ? news.filter((item) => !item.status || item.status === "published")
    : [];

  if (!published.length) {
    return;
  }

  homepageLiveNews = published.slice();
  document.querySelectorAll(".admin-updates-section").forEach((section) => section.remove());

  const sorted = published.slice().sort((a, b) => (
    Number(Boolean(b.breaking)) - Number(Boolean(a.breaking)) ||
    Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
    Number(Boolean(b.trending)) - Number(Boolean(a.trending)) ||
    new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0)
  ));

  const storyUsed = new Set();
  const topStoriesNews = [
    ...takeNews(sorted, 5, storyUsed, (item) => item.breaking || item.featured || item.trending),
    ...takeNews(sorted, 5, storyUsed)
  ].slice(0, 5);

  if (topStoriesNews.length) {
    topStories.splice(0, topStories.length, ...topStoriesNews.map(newsToStory));
    storyIndex = 0;
    renderTopStory(false);
    refreshHomepageTicker(topStoriesNews.concat(sorted));
    updateHomepageSeo(topStoriesNews[0]);
  }

  const used = new Set(topStoriesNews.map((item) => newsIdentity(item)));
  const cityCards = Array.from(document.querySelectorAll(".city-grid .news-card"));
  ["durg", "bhilai", "raipur"].forEach((slug, index) => {
    applyNewsToCard(cityCards[index], pickHomepageCardNews(sorted, used, (newsItem) => newsMatches(newsItem, slug)));
  });

  const districtCards = Array.from(document.querySelectorAll(".district-news-grid .district-card"));
  ["durg", "bhilai", "rajnandgaon", "bilaspur"].forEach((slug, index) => {
    applyNewsToCard(districtCards[index], pickHomepageCardNews(sorted, used, (newsItem) => newsMatches(newsItem, slug)), { mode: "district" });
  });

  setSectionTitleForGrid(".latest-grid", "Trending News", "ट्रेंडिंग न्यूज़");
  Array.from(document.querySelectorAll(".latest-grid .news-card")).forEach((card) => {
    applyNewsToCard(card, pickHomepageCardNews(sorted, used, (newsItem) => newsItem.trending || newsMatches(newsItem, "sports") || newsMatches(newsItem, "politics") || newsMatches(newsItem, "health") || newsMatches(newsItem, "jobs")));
  });

  Array.from(document.querySelectorAll(".entertainment-grid .news-card")).forEach((card) => {
    applyNewsToCard(card, pickHomepageCardNews(sorted, used, (newsItem) => newsMatches(newsItem, "entertainment")));
  });

  Array.from(document.querySelectorAll(".world-grid .news-card")).forEach((card) => {
    applyNewsToCard(card, pickHomepageCardNews(sorted, used, (newsItem) => !newsItem.city && !newsMatches(newsItem, "durg") && !newsMatches(newsItem, "bhilai") && !newsMatches(newsItem, "raipur")));
  });

  Array.from(document.querySelectorAll(".mini-news-grid article")).forEach((card) => {
    applyNewsToCard(card, pickHomepageCardNews(sorted, used));
  });

  const videoGrid = document.querySelector(".video-grid");
  if (videoGrid?.dataset.customVideos !== "true") {
    Array.from(document.querySelectorAll(".video-grid .video-card")).forEach((card) => {
      applyNewsToCard(card, pickHomepageCardNews(sorted, used, (newsItem) => newsItem.trending || /video|reel|viral/i.test(`${newsItem.category || ""} ${newsItem.title || ""} ${newsItem.summary || ""}`)));
    });
  }
};

if (Array.isArray(homepageLiveNews) && homepageLiveNews.length) {
  hydrateHomepageSections(homepageLiveNews);
}

const RENDER_MOJIBAKE_SEGMENT_RE = /(?:[ÃàÂâ][^<>"\u0900-\u097F]*)+/g;

function decodeRenderMojibakeSegment(segment) {
  const source = String(segment || "");
  if (!source) {
    return source;
  }

  try {
    const percentEncoded = Array.from(source).map((char) => {
      const code = char.charCodeAt(0);
      if (code <= 0xff) {
        return `%${code.toString(16).padStart(2, "0")}`;
      }
      return encodeURIComponent(char);
    }).join("");

    return decodeURIComponent(percentEncoded);
  } catch (error) {
    return source;
  }
}

function repairRenderMixedHindi(value) {
  let output = String(value || "").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

  if (!output || !/[ÃàÂâ]/.test(output)) {
    return output;
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const repaired = output.replace(RENDER_MOJIBAKE_SEGMENT_RE, (segment) => decodeRenderMojibakeSegment(segment));
    if (repaired === output) {
      break;
    }
    output = repaired;
  }

  return output.replace(/\uFFFD/g, "").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

repairMojibakeText = function repairMojibakeText(value) {
  return repairRenderMixedHindi(value);
};

looksCorruptHindi = function looksCorruptHindi(value) {
  return /Ã|à|Â|â|�|\?{2,}/.test(String(value || ""));
};

normalizeDisplayText = function normalizeDisplayText(value) {
  const text = repairRenderMixedHindi(value);
  return text
    .replace(/Â°/g, "°")
    .replace(/Ã¢â‚¬â„¢|â€™/g, "'")
    .trim();
};

decodeFinalSiteMojibake = function decodeFinalSiteMojibake(value) {
  return normalizeDisplayText(value);
};

cleanFinalSiteText = function cleanFinalSiteText(value) {
  return normalizeDisplayText(value);
};

getHindiText = function getHindiText(en, hi) {
  const english = cleanFinalSiteText(en);
  const inlineHindi = cleanFinalSiteText(hi);

  if (FINAL_HOME_HI_LABELS[english]) {
    return cleanFinalSiteText(FINAL_HOME_HI_LABELS[english]);
  }

  if (hasVisibleHindi(inlineHindi)) {
    return inlineHindi;
  }

  const mappedHindi = cleanFinalSiteText(CLEAN_HI_LABELS[english] || UI_HI_LABELS[english] || HINDI_TEXT_BY_EN[english] || "");
  if (hasVisibleHindi(mappedHindi)) {
    return mappedHindi;
  }

  return english;
};

getLocalizedText = function getLocalizedText(en, hi, language) {
  return language === "hi" ? getHindiText(en, hi) : cleanFinalSiteText(en);
};

document.querySelectorAll("*").forEach((node) => {
  for (const attr of node.getAttributeNames()) {
    if (attr === "data-en") {
      node.setAttribute(attr, cleanFinalSiteText(node.getAttribute(attr)));
      continue;
    }

    if (/^data-.*hi/i.test(attr)) {
      node.setAttribute(attr, cleanFinalSiteText(node.getAttribute(attr)));
    }
  }
});

setLanguage(currentLanguage || initialLanguage());
