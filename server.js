require("dotenv").config();

const crypto = require("crypto");
const cors = require("cors");
const cron = require("node-cron");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");
const { MongoClient, ObjectId } = require("mongodb");

const PORT = Number(process.env.PORT || 3000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB = process.env.MONGODB_DB || "khabri_junction";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const WEATHER_API_URL = process.env.WEATHER_API_URL || "";
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "";
const MARKET_API_URL = process.env.MARKET_API_URL || "";
const MARKET_API_KEY = process.env.MARKET_API_KEY || "";
const CRICKET_API_URL = process.env.CRICKET_API_URL || "";
const CRICKET_API_KEY = process.env.CRICKET_API_KEY || "";
const FIREBASE_SERVER_KEY = process.env.FIREBASE_SERVER_KEY || "";
const NEWS_COLLECTION = "news";
const ADS_COLLECTION = "ads";
const MANUAL_NEWS_COLLECTION = "manual_news";
const NEWS_ANALYTICS_COLLECTION = "news_analytics";
const PUSH_SUBSCRIBERS_COLLECTION = "push_subscribers";
const SETTINGS_COLLECTION = "settings";
const UPLOADS_COLLECTION = "uploads";
const DEFAULT_AUTOMATION_QUERY = process.env.GOOGLE_NEWS_QUERY || "Chhattisgarh Durg Bhilai Raipur Bilaspur sports astrology";
const AUTOMATION_INTERVAL_MINUTES = 30;
const AUTOMATION_CRON_EXPRESSION = "*/30 * * * *";
const NEWS_FRESHNESS_HOURS = 12;
const NEWS_FRESHNESS_WINDOW_MS = NEWS_FRESHNESS_HOURS * 60 * 60 * 1000;
const RSS_FETCH_RETRY_COUNT = 3;
const AUTOMATION_STUCK_MS = 20 * 60 * 1000;
const SITE_URL = (process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`).replace(/\/+$/, "");
const DEFAULT_NEWS_IMAGE = "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop";
const THUMBNAIL_WIDTH = 1200;
const THUMBNAIL_HEIGHT = 675;
const MIN_SOURCE_IMAGE_LENGTH = 18;
const CATEGORY_DEFINITIONS = [
  { label: "Raipur Promotion", slug: "raipur-promotion", page: "raipur-promotion-news", badge: "RAIPUR PROMO", keywords: ["raipur promotion", "promotion", "brand promotion", "sponsored", "advertorial"] },
  { label: "Market", slug: "market", page: "market-news", badge: "MARKET", keywords: ["market", "sensex", "nifty", "stock", "share market", "business", "trading"] },
  { label: "Weather", slug: "weather", page: "weather-update", badge: "WEATHER", keywords: ["weather", "temperature", "rain", "heat", "cold", "mausam"] },
  { label: "Viral Videos", slug: "viral-videos", page: "viral-videos", badge: "VIRAL", keywords: ["viral", "video", "reel", "youtube", "shorts", "trending reel"] },
  { label: "Local News", slug: "local-news", page: "local-news", badge: "LOCAL", keywords: ["local", "district", "city", "ward", "nagar", "local news"] },
  { label: "MP Shahdol", slug: "mp-shahdol", page: "mp-shahdol-news", badge: "SHAHDOL", keywords: ["shahdol", "mp shahdol", "madhya pradesh shahdol"] },
  { label: "World", slug: "world", page: "desh-duniya-news", badge: "WORLD", keywords: ["world", "global", "international", "desh duniya", "foreign"] },
  { label: "Education", slug: "education", page: "local-news", badge: "EDUCATION", keywords: ["education", "school", "college", "exam", "admission", "à¤¶à¤¿à¤•्षा", "à¤¸à¥à¤•à¥‚ल"] },
  { label: "Business", slug: "business", page: "market-news", badge: "BUSINESS", keywords: ["business", "startup", "industry", "trade", "व्यापार", "à¤•à¤¾à¤°à¥‹बार"] },
  { label: "Agriculture", slug: "agriculture", page: "local-news", badge: "AGRI", keywords: ["agriculture", "farmer", "crop", "mandi", "farming", "à¤•िसान", "à¤–à¥‡à¤¤à¥€"] },
  { label: "Technology", slug: "technology", page: "local-news", badge: "TECH", keywords: ["technology", "digital", "ai", "app", "tech", "à¤Ÿà¥‡à¤•"] },
  { label: "Lifestyle", slug: "lifestyle", page: "entertainment.html", badge: "LIFESTYLE", keywords: ["lifestyle", "fashion", "food", "travel", "à¤²à¤¾à¤‡à¤«à¤¸à¥à¤Ÿà¤¾à¤‡ल"] },
  { label: "Travel", slug: "travel", page: "local-news", badge: "TRAVEL", keywords: ["travel", "tourism", "tourist", "यात्रा", "à¤ªà¤°à¥à¤¯à¤Ÿन"] },
  { label: "Fashion", slug: "fashion", page: "entertainment.html", badge: "FASHION", keywords: ["fashion", "style", "à¤«à¥ˆशन"] },
  { label: "Movie", slug: "movie", page: "entertainment.html", badge: "MOVIE", keywords: ["movie", "film", "cinema", "फिल्म"] },
  { label: "Music", slug: "music", page: "entertainment.html", badge: "MUSIC", keywords: ["music", "song", "singer", "à¤—à¥€त", "à¤¸à¤‚à¤—à¥€त"] },
  { label: "Events", slug: "events", page: "local-news", badge: "EVENTS", keywords: ["event", "programme", "festival", "à¤•à¤¾à¤°à¥à¤¯à¤•्रम", "à¤®à¤¹à¥‹त्सव"] },
  { label: "Sports", slug: "sports", page: "sports.html", badge: "SPORTS", keywords: ["ipl", "cricket", "football", "match", "tournament", "sports", "score", "team", "league"] },
  { label: "Astrology", slug: "astrology", page: "astrology.html", badge: "ASTROLOGY", keywords: ["rashifal", "astrology", "horoscope", "zodiac", "panchang"] },
  { label: "Crime", slug: "crime", page: "crime.html", badge: "CRIME", keywords: ["murder", "police", "theft", "crime", "arrest", "fraud", "case", "fir"] },
  { label: "Politics", slug: "politics", page: "politics.html", badge: "POLITICS", keywords: ["government", "minister", "election", "politics", "cabinet", "vidhan", "bjp", "congress"] },
  { label: "Entertainment", slug: "entertainment", page: "entertainment.html", badge: "ENTERTAINMENT", keywords: ["film", "movie", "cinema", "actor", "actress", "bollywood", "ott", "entertainment"] },
  { label: "Health", slug: "health", page: "health.html", badge: "HEALTH", keywords: ["health", "hospital", "doctor", "medical", "clinic", "patient", "medicine"] },
  { label: "Jobs", slug: "jobs", page: "jobs.html", badge: "JOBS", keywords: ["job", "jobs", "recruitment", "vacancy", "exam", "result", "career", "rojgar"] },
  { label: "Durg", slug: "durg", page: "durg.html", badge: "DURG", keywords: ["durg"] },
  { label: "Bhilai", slug: "bhilai", page: "bhilai.html", badge: "BHILAI", keywords: ["bhilai"] },
  { label: "Raipur", slug: "raipur", page: "raipur.html", badge: "RAIPUR", keywords: ["raipur"] },
  { label: "Bilaspur", slug: "bilaspur", page: "bilaspur.html", badge: "BILASPUR", keywords: ["bilaspur"] },
  { label: "Kawardha", slug: "kawardha", page: "kawardha.html", badge: "KAWARDHA", keywords: ["kawardha", "kabirdham"] },
  { label: "Khairagarh", slug: "khairagarh", page: "khairagarh.html", badge: "KHAIRAGARH", keywords: ["khairagarh"] },
  { label: "Rajnandgaon", slug: "rajnandgaon", page: "rajnandgaon.html", badge: "RAJNANDGAON", keywords: ["rajnandgaon"] },
  { label: "Balod", slug: "balod", page: "local-news", badge: "BALOD", keywords: ["balod"] },
  { label: "Bemetara", slug: "bemetara", page: "local-news", badge: "BEMETARA", keywords: ["bemetara"] },
  { label: "Dhamtari", slug: "dhamtari", page: "local-news", badge: "DHAMTARI", keywords: ["dhamtari"] },
  { label: "Mahasamund", slug: "mahasamund", page: "local-news", badge: "MAHASAMUND", keywords: ["mahasamund"] },
  { label: "Gariaband", slug: "gariaband", page: "local-news", badge: "GARIABAND", keywords: ["gariaband"] },
  { label: "Mungeli", slug: "mungeli", page: "local-news", badge: "MUNGELI", keywords: ["mungeli"] },
  { label: "Korba", slug: "korba", page: "local-news", badge: "KORBA", keywords: ["korba"] },
  { label: "Raigarh", slug: "raigarh", page: "local-news", badge: "RAIGARH", keywords: ["raigarh"] },
  { label: "Janjgir-Champa", slug: "janjgir-champa", page: "local-news", badge: "JANJGIR", keywords: ["janjgir", "champa"] },
  { label: "Sakti", slug: "sakti", page: "local-news", badge: "SAKTI", keywords: ["sakti"] },
  { label: "Sarangarh", slug: "sarangarh", page: "local-news", badge: "SARANGARH", keywords: ["sarangarh", "bilaigarh"] },
  { label: "Surguja", slug: "surguja", page: "local-news", badge: "SURGUJA", keywords: ["surguja", "ambikapur"] },
  { label: "Bastar", slug: "bastar", page: "local-news", badge: "BASTAR", keywords: ["bastar", "jagdalpur"] },
  { label: "Kanker", slug: "kanker", page: "local-news", badge: "KANKER", keywords: ["kanker"] },
  { label: "Kondagaon", slug: "kondagaon", page: "local-news", badge: "KONDAGAON", keywords: ["kondagaon"] },
  { label: "Dantewada", slug: "dantewada", page: "local-news", badge: "DANTEWADA", keywords: ["dantewada"] },
  { label: "Sukma", slug: "sukma", page: "local-news", badge: "SUKMA", keywords: ["sukma"] },
  { label: "Bijapur", slug: "bijapur", page: "local-news", badge: "BIJAPUR", keywords: ["bijapur"] },
  { label: "Narayanpur", slug: "narayanpur", page: "local-news", badge: "NARAYANPUR", keywords: ["narayanpur"] },
  { label: "Jashpur", slug: "jashpur", page: "local-news", badge: "JASHPUR", keywords: ["jashpur"] },
  { label: "Koriya", slug: "koriya", page: "local-news", badge: "KORIYA", keywords: ["koriya", "korea"] },
  { label: "Balrampur", slug: "balrampur", page: "local-news", badge: "BALRAMPUR", keywords: ["balrampur"] },
  { label: "Surajpur", slug: "surajpur", page: "local-news", badge: "SURAJPUR", keywords: ["surajpur"] },
  { label: "Breaking", slug: "breaking", page: "breaking.html", badge: "BREAKING", keywords: ["breaking", "latest", "alert", "big news", "urgent"] }
];
const CLEAN_CATEGORY_ROUTES = [
  { path: "/raipur-news", title: "Raipur News", category: "Raipur", description: "रायपुर à¤•à¥€ à¤¤à¤¾à¤œा à¤–à¤¬à¤°à¥‡à¤‚, à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤”र à¤²à¥‹à¤•ल à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ।" },
  { path: "/raipur-promotion-news", title: "Raipur Promotion News", category: "Raipur Promotion", description: "रायपुर à¤ªà¥à¤°à¤®à¥‹शन, à¤¬à¥à¤°à¤¾à¤‚ड à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤”र à¤¸à¥à¤ªà¥‰न्सर्ड à¤²à¥‹à¤•ल à¤–à¤¬à¤°à¥‡à¤‚।" },
  { path: "/market-news", title: "Market News", category: "Market", description: "à¤¶à¥‡यर à¤®à¤¾à¤°à¥à¤•à¥‡à¤Ÿ, à¤¬à¤¿à¤œà¤¨à¥‡स à¤”र à¤¬à¤¾à¤œार à¤…à¤ªà¤¡à¥‡à¤Ÿ।" },
  { path: "/weather-update", title: "Weather Update", category: "Weather", description: "à¤¦à¥à¤°à¥à¤—, à¤­à¤¿à¤²à¤¾à¤ˆ à¤”र रायपुर à¤•ा à¤®à¥Œसम à¤…à¤ªà¤¡à¥‡à¤Ÿ।" },
  { path: "/viral-videos", title: "Viral Reels / Viral Videos", category: "Viral Videos", description: "वायरल à¤µà¥€à¤¡à¤¿à¤¯à¥‹, à¤¯à¥‚à¤Ÿà¥à¤¯à¥‚ब à¤°à¥€ल à¤”र à¤Ÿà¥à¤°à¥‡à¤‚à¤¡à¤¿à¤‚à¤— à¤²à¥‹à¤•ल à¤•्लिप।" },
  { path: "/local-news", title: "Local News", category: "Local News", description: "à¤›à¤¤à¥à¤¤à¥€à¤¸à¤—ढ़ à¤•à¥€ à¤²à¥‹à¤•ल à¤”र à¤œिला à¤–à¤¬à¤°à¥‡à¤‚।" },
  { path: "/mp-shahdol-news", title: "MP Shahdol News", category: "MP Shahdol", description: "मध्य à¤ªà¥à¤°à¤¦à¥‡श à¤¶à¤¹à¤¡à¥‹ल à¤•à¥€ à¤¤à¤¾à¤œा à¤–à¤¬à¤°à¥‡à¤‚।" },
  { path: "/desh-duniya-news", title: "à¤¦à¥‡श-दुनिया à¤•à¥€ à¤–बर", category: "World", description: "à¤¦à¥‡श-दुनिया, à¤…à¤‚à¤¤à¤°à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¥€य à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤”र à¤—à¥à¤²à¥‹बल à¤–à¤¬à¤°à¥‡à¤‚।" }
];
const CATEGORY_ROUTE_ALIASES = new Map([
  ["home", "breaking"],
  ["latest", "breaking"],
  ["breaking-news", "breaking"],
  ["market-news", "market"],
  ["weather-update", "weather"],
  ["mausam", "weather"],
  ["viral", "viral-videos"],
  ["viral-video", "viral-videos"],
  ["viral-videos", "viral-videos"],
  ["reels", "viral-videos"],
  ["local", "local-news"],
  ["local-news", "local-news"],
  ["mp", "mp-shahdol"],
  ["shahdol", "mp-shahdol"],
  ["mp-shahdol-news", "mp-shahdol"],
  ["des", "world"],
  ["desh", "world"],
  ["desh-duniya", "world"],
  ["desh-duniya-news", "world"],
  ["world-news", "world"],
  ["raipur-news", "raipur"],
  ["raipur-promotion-news", "raipur-promotion"]
]);
const CITY_DEFINITIONS = [
  { label: "Durg", slug: "durg", keywords: ["durg"] },
  { label: "Bhilai", slug: "bhilai", keywords: ["bhilai"] },
  { label: "Raipur", slug: "raipur", keywords: ["raipur"] },
  { label: "Bilaspur", slug: "bilaspur", keywords: ["bilaspur"] },
  { label: "Balod", slug: "balod", keywords: ["balod"] },
  { label: "Baloda Bazar-Bhatapara", slug: "baloda-bazar-bhatapara", keywords: ["baloda bazar", "bhatapara", "baloda-bazar-bhatapara"] },
  { label: "Balrampur-Ramanujganj", slug: "balrampur-ramanujganj", keywords: ["balrampur", "ramanujganj", "balrampur-ramanujganj"] },
  { label: "Bastar", slug: "bastar", keywords: ["bastar", "jagdalpur"] },
  { label: "Bemetara", slug: "bemetara", keywords: ["bemetara"] },
  { label: "Bijapur", slug: "bijapur", keywords: ["bijapur"] },
  { label: "Dantewada", slug: "dantewada", keywords: ["dantewada"] },
  { label: "Dhamtari", slug: "dhamtari", keywords: ["dhamtari"] },
  { label: "Gariaband", slug: "gariaband", keywords: ["gariaband"] },
  { label: "Gaurela-Pendra-Marwahi", slug: "gaurela-pendra-marwahi", keywords: ["gaurela", "pendra", "marwahi", "gaurela-pendra-marwahi"] },
  { label: "Janjgir-Champa", slug: "janjgir-champa", keywords: ["janjgir", "champa", "janjgir-champa"] },
  { label: "Jashpur", slug: "jashpur", keywords: ["jashpur"] },
  { label: "Kanker", slug: "kanker", keywords: ["kanker"] },
  { label: "Kawardha / Kabirdham", slug: "kabirdham", keywords: ["kabirdham", "kawardha"] },
  { label: "Khairagarh-Chhuikhadan-Gandai", slug: "khairagarh-chhuikhadan-gandai", keywords: ["khairagarh", "chhuikhadan", "gandai", "khairagarh-chhuikhadan-gandai"] },
  { label: "Kondagaon", slug: "kondagaon", keywords: ["kondagaon"] },
  { label: "Korba", slug: "korba", keywords: ["korba"] },
  { label: "Korea", slug: "korea", keywords: ["korea", "koriya"] },
  { label: "Mahasamund", slug: "mahasamund", keywords: ["mahasamund"] },
  { label: "Manendragarh-Chirmiri-Bharatpur", slug: "manendragarh-chirmiri-bharatpur", keywords: ["manendragarh", "chirmiri", "bharatpur", "mcb", "manendragarh-chirmiri-bharatpur"] },
  { label: "Mohla-Manpur-Ambagarh Chowki", slug: "mohla-manpur-ambagarh-chowki", keywords: ["mohla", "manpur", "ambagarh chowki", "mohla-manpur-ambagarh-chowki"] },
  { label: "Mungeli", slug: "mungeli", keywords: ["mungeli"] },
  { label: "Narayanpur", slug: "narayanpur", keywords: ["narayanpur"] },
  { label: "Raigarh", slug: "raigarh", keywords: ["raigarh"] },
  { label: "Rajnandgaon", slug: "rajnandgaon", keywords: ["rajnandgaon"] },
  { label: "Sakti", slug: "sakti", keywords: ["sakti"] },
  { label: "Sarangarh-Bilaigarh", slug: "sarangarh-bilaigarh", keywords: ["sarangarh", "bilaigarh", "sarangarh-bilaigarh"] },
  { label: "Sukma", slug: "sukma", keywords: ["sukma"] },
  { label: "Surajpur", slug: "surajpur", keywords: ["surajpur"] },
  { label: "Surguja", slug: "surguja", keywords: ["surguja", "ambikapur"] }
];

function districtDefinitionFromValue(value = "") {
  const normalizedSlug = toSlug(value);
  const normalizedText = slugText(value);

  return CITY_DEFINITIONS.find((district) => (
    district.slug === normalizedSlug ||
    slugText(district.label) === normalizedText ||
    district.keywords.some((keyword) => normalizedText === slugText(keyword))
  )) || null;
}

function districtRoutePath(value = "") {
  const district = districtDefinitionFromValue(value);
  return district ? `/district/${district.slug}` : "";
}
const CG_LOCAL_NEWS_SOURCES = [
  { name: "Haribhoomi Chhattisgarh", query: "Chhattisgarh latest site:haribhoomi.com", priority: 1 },
  { name: "Patrika Chhattisgarh", query: "Chhattisgarh latest site:patrika.com", priority: 1 },
  { name: "Dainik Bhaskar Chhattisgarh", query: "Chhattisgarh latest site:bhaskar.com/local/chhattisgarh", priority: 1 },
  { name: "Amar Ujala Chhattisgarh", query: "Chhattisgarh latest site:amarujala.com/chhattisgarh", priority: 1 },
  { name: "Navbharat CG", query: "Chhattisgarh latest site:navbharatlive.com/chhattisgarh", priority: 1 },
  { name: "Deshbandhu", query: "Chhattisgarh latest site:deshbandhu.co.in", priority: 1 },
  { name: "Lalluram", query: "Chhattisgarh latest site:lalluram.com", priority: 1 },
  { name: "CGWALL", query: "Chhattisgarh latest site:cgwall.com OR site:cgwall.in", priority: 1 },
  { name: "The Hitavada Raipur", query: "Raipur Chhattisgarh latest site:thehitavada.com", priority: 1 },
  { name: "News18 Chhattisgarh", query: "Chhattisgarh latest site:hindi.news18.com/news/chhattisgarh", priority: 1 },
  { name: "Zee MPCG", query: "Chhattisgarh latest site:zeenews.india.com/hindi/india/madhya-pradesh-chhattisgarh", priority: 1 },
  { name: "ETV Bharat Chhattisgarh", query: "Chhattisgarh latest site:etvbharat.com", priority: 1 },
  { name: "TV9 Chhattisgarh", query: "Chhattisgarh latest site:tv9hindi.com/state/chhattisgarh", priority: 1 },
  { name: "Swadesh CG", query: "Chhattisgarh latest site:swadeshnews.in OR site:swadesh.in", priority: 1 },
  { name: "Dainik Chhattisgarh", query: "Chhattisgarh latest site:dailychhattisgarh.com", priority: 1 },
  { name: "Raipur Local Portals", query: "Raipur local news Chhattisgarh latest", priority: 2 },
  { name: "Bhilai Durg Local Portals", query: "Bhilai Durg local news Chhattisgarh latest", priority: 2 }
];
const DISTRICT_NEWS_SOURCES = CITY_DEFINITIONS.map((city) => ({
  name: `${city.label} District Feed`,
  query: `${city.label} Chhattisgarh latest news`,
  priority: 2,
  district: city.slug
}));
const NATIONAL_FALLBACK_NEWS_SOURCES = [
  { name: "Google Hindi Chhattisgarh Fallback", query: "Chhattisgarh latest Hindi news", priority: 4 },
  { name: "National Hindi Chhattisgarh Fallback", query: "Chhattisgarh breaking news Hindi", priority: 4 }
];
const CG_RELEVANCE_TERMS = [
  "chhattisgarh", "cg", "raipur", "durg", "bhilai", "bilaspur", "rajnandgaon", "kawardha", "kabirdham", "khairagarh",
  "bastar", "surguja", "korba", "raigarh", "jashpur", "kanker", "kondagaon", "sukma", "bijapur", "dhamtari",
  "mahasamund", "balod", "bemetara", "mungeli", "gariaband", "balrampur", "janjgir", "ambikapur", "dantewada"
];
const MIN_LOCAL_ITEMS_BEFORE_FALLBACK = 4;
const MAX_ITEMS_PER_SOURCE_PER_RUN = 2;

const app = express();
const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
app.set("trust proxy", true);

let newsCollection;
let adsCollection;
let manualNewsCollection;
let newsAnalyticsCollection;
let pushSubscribersCollection;
let settingsCollection;
let uploadsCollection;
let mongoReady = false;
let mongoError = null;
let automationRunning = false;
let automationTask;

app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: false, limit: "30mb" }));

function renderHomepage(req) {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const base = publicBaseUrl(req);
  return html.replaceAll("http://localhost:3000", base);
}

app.get(["/", "/index", "/index.html"], (req, res) => {
  res.type("html").send(renderHomepage(req));
});

app.use(express.static(__dirname));

app.get("/favicon.ico", (req, res) => {
  res.type("png").sendFile(`${__dirname}/assets/logo-kj.png`);
});

const CP1252_REVERSE = {
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
const HTML_ENTITY_MAP = {
  nbsp: " ",
  amp: "&",
  quot: "\"",
  apos: "'",
  lt: "<",
  gt: ">",
  ndash: "-",
  mdash: "—",
  hellip: "…"
};

function decodeMojibake(value) {
  const text = String(value || "").trim();

  if (!text || !/[à-ÿŒœŠšŽžŸ€‚ƒ„…†‡ˆ‰‹›‘’“”•–—˜™]/.test(text)) {
    return text;
  }

  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => {
      const code = char.charCodeAt(0);
      return code <= 0xff ? code : (CP1252_REVERSE[code] ?? 0x3f);
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

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => {
      const parsed = Number.parseInt(code, 10);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : " ";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const parsed = Number.parseInt(code, 16);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : " ";
    })
    .replace(/&([a-z]+);/gi, (match, name) => HTML_ENTITY_MAP[name.toLowerCase()] ?? match);
}

function normalizeText(value) {
  const text = decodeHtmlEntities(String(value || ""))
    .replace(/\u00a0/g, " ")
    .trim();
  const normalized = /à¤|Ã|Â|â€™|œ|™|š|ž|ÿ|�/.test(text) ? decodeMojibake(text) : text;
  return normalized
    .replace(/°/g, "°")
    .replace(/â€™/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function normalizeBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function slugText(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toSlug(value) {
  return slugText(value)
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "news-update";
}

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function languageCharStats(value) {
  const text = normalizeText(value);
  return {
    hindi: (text.match(/[\u0900-\u097F]/g) || []).length,
    latin: (text.match(/[A-Za-z]/g) || []).length
  };
}

function looksLikeLanguageCopy(value, targetLanguage) {
  const text = normalizeText(value);

  if (!text) {
    return false;
  }

  const stats = languageCharStats(text);
  if (targetLanguage === "hi") {
    return stats.hindi >= Math.max(4, Math.ceil(stats.latin * 0.35));
  }

  return stats.latin >= Math.max(8, stats.hindi * 3);
}

function comparableCopy(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksCopiedFromSource(candidate, source) {
  const left = comparableCopy(candidate);
  const right = comparableCopy(source);

  if (!left || !right) {
    return false;
  }

  if (left === right) {
    return true;
  }

  const sample = right.split(" ").filter(Boolean).slice(0, 12).join(" ");
  return sample.length >= 32 && left.includes(sample);
}

function cleanNewsCopyText(value, options = {}) {
  const targetLanguage = normalizeText(options.targetLanguage || "");
  let cleaned = normalizeText(value)
    .replace(/&nbsp;?/giu, " ")
    .replace(/&#160;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/\|\s*google news\s*$/iu, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  [options.sourceName, options.feedSourceName].map((item) => normalizeText(item)).filter(Boolean).forEach((name) => {
    const safeName = escapeRegExp(name);
    cleaned = cleaned
      .replace(new RegExp(`(?:\\s*[|:-]\\s*)${safeName}\\s*$`, "iu"), "")
      .replace(new RegExp(`(?:^|\\n)\\s*${safeName}\\s*(?=\\n|$)`, "giu"), "\n");
  });

  cleaned = cleaned
    .replace(/\s*(?:\||-|:|\/)\s*(?:Patrika News|Amar Ujala|Dainik Bhaskar|Haribhoomi|News18|TV9|ETV Bharat|Lalluram|CGWALL|The Hitavada|Zee MPCG)\s*$/giu, "")
    .replace(/^\s*(?:Patrika News|Amar Ujala|Dainik Bhaskar|Haribhoomi|News18|TV9|ETV Bharat|Lalluram|CGWALL|The Hitavada|Zee MPCG)\s*[:|-]\s*/giu, "");

  if (targetLanguage === "hi" && hasHindiText(cleaned)) {
    cleaned = cleaned.replace(/^[A-Za-z][A-Za-z0-9\s'’&(),.-]{6,}:\s*(?=[\u0900-\u097F])/u, "");
  }

  cleaned = cleaned
    .replace(/^(ai generated|ai-generated|generated by ai)\s*[:|-]?\s*/gimu, "")
    .replace(/^(khabri junction desk|desk report|news desk)\s*[:|-]?\s*/gimu, "")
    .replace(/^available information.*$/gimu, "")
    .replace(/^.*desk ने (?:संकलित|तैयार) किया है।?$/gimu, "")
    .replace(/^.*उपलब्ध शुरुआती जानकारी.*$/gimu, "")
    .replace(/^फिलहाल पाठकों को सलाह है.*$/gimu, "")
    .replace(/^जैसे-जैसे आधिकारिक जानकारी.*$/gimu, "")
    .replace(/(?:\s*[|:/-]\s*)?(?:source|स्रोत)\s*[:|-]?\s*$/gimu, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function localizedCopySeed(copy = {}) {
  return [copy.title, copy.summary, copy.body].map((item) => normalizeText(item)).filter(Boolean).join(" ");
}

function looksLikeHttpUrl(value) {
  return /^(https?:)?\/\//i.test(normalizeText(value));
}

function looksLikeImageUrl(value) {
  const text = normalizeText(value);
  return Boolean(text) && (
    /^data:image\//i.test(text) ||
    /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(text) ||
    /images\.unsplash\.com|img\.youtube\.com|cloudinary|cdn|upload/i.test(text)
  );
}

function normalizeVideoSetting(item = {}) {
  const values = [item.title, item.url, item.type, item.thumbnail]
    .map((value) => normalizeText(value))
    .filter(Boolean);
  const uniqueValues = [...new Set(values)];
  const thumbnail = uniqueValues.find((value) => looksLikeImageUrl(value)) || normalizeText(item.thumbnail);
  const url = uniqueValues.find((value) => looksLikeHttpUrl(value) && !looksLikeImageUrl(value)) || normalizeText(item.url);
  const textValues = uniqueValues.filter((value) => !looksLikeHttpUrl(value) && !looksLikeImageUrl(value));
  let title = normalizeText(item.title);

  if (!title || looksLikeHttpUrl(title) || looksLikeImageUrl(title)) {
    title = textValues.find((value) => value.length > 8) || textValues[0] || "Viral Video";
  }

  let type = normalizeText(item.type);
  if (!type || looksLikeHttpUrl(type) || looksLikeImageUrl(type) || type.length > 24) {
    type = textValues.find((value) => value !== title && value.length <= 18) || "VIDEO";
  }

  return {
    ...item,
    title,
    url,
    type,
    thumbnail
  };
}

function normalizeSiteSettings(settings = {}) {
  return {
    ...settings,
    weather: Array.isArray(settings.weather)
      ? settings.weather.map((item) => ({
          ...item,
          city: normalizeText(item.city),
          temp: normalizeText(item.temp).replace(/°/g, "°"),
          condition: normalizeText(item.condition)
        }))
      : [],
    market: Array.isArray(settings.market)
      ? settings.market.map((item) => ({
          ...item,
          name: normalizeText(item.name),
          value: normalizeText(item.value),
          change: normalizeText(item.change)
        }))
      : [],
    cricket: Array.isArray(settings.cricket)
      ? settings.cricket.map((item) => ({
          ...item,
          match: normalizeText(item.match),
          score: normalizeText(item.score),
          status: normalizeText(item.status)
        }))
      : [],
    videos: Array.isArray(settings.videos)
      ? settings.videos.map((item) => normalizeVideoSetting(item))
      : [],
    notification: {
      ...(settings.notification || {}),
      title: normalizeText(settings.notification?.title),
      description: normalizeText(settings.notification?.description)
    }
  };
}

function parseDateCandidate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "object") {
    return parseDateCandidate(value["#text"] || value["@_datetime"] || value["@_content"] || value["@_date"]);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function findDateCandidate(value, depth = 0) {
  if (!value || depth > 3 || typeof value !== "object") {
    return null;
  }

  const directKeys = ["pubDate", "isoDate", "published", "updated", "datePublished", "dateCreated", "dc:date", "atom:updated"];

  for (const key of directKeys) {
    const parsed = parseDateCandidate(value[key]);

    if (parsed) {
      return parsed;
    }
  }

  for (const [key, nested] of Object.entries(value)) {
    if (/date|published|updated/i.test(key)) {
      const parsed = parseDateCandidate(nested);

      if (parsed) {
        return parsed;
      }
    }
  }

  for (const nested of Object.values(value)) {
    const parsed = findDateCandidate(nested, depth + 1);

    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function freshnessInfo(publishedAt, now = new Date()) {
  const sourcePublishedAt = parseDateCandidate(publishedAt);

  if (!sourcePublishedAt) {
    return {
      isFresh: false,
      score: 0,
      ageHours: null,
      reason: "missing publish date"
    };
  }

  const ageMs = now.getTime() - sourcePublishedAt.getTime();

  if (ageMs < -10 * 60 * 1000) {
    return {
      isFresh: false,
      score: 0,
      ageHours: 0,
      reason: "publish date is in the future"
    };
  }

  const ageHours = Math.max(0, ageMs / (60 * 60 * 1000));

  if (ageMs > NEWS_FRESHNESS_WINDOW_MS) {
    return {
      isFresh: false,
      score: 0,
      ageHours,
      reason: `older than ${NEWS_FRESHNESS_HOURS} hours`
    };
  }

  return {
    isFresh: true,
    score: Math.max(1, Math.round(100 - (ageMs / NEWS_FRESHNESS_WINDOW_MS) * 100)),
    ageHours,
    reason: ""
  };
}

function normalizeSourceUrl(value) {
  return normalizeText(value).replace(/\/+$/u, "").toLowerCase();
}

function sourceHashFromUrl(value) {
  const normalized = normalizeSourceUrl(value);
  return normalized ? hashValue(normalized) : "";
}

function sourceHashForItem(item) {
  return normalizeText(item?.sourceHash) || sourceHashFromUrl(item?.sourceUrl);
}

function formatIST(value) {
  const date = parseDateCandidate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

function startOfISTDay(value = new Date()) {
  const date = parseDateCandidate(value) || new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value || 0);
  const month = Number(parts.find((part) => part.type === "month")?.value || 1);
  const day = Number(parts.find((part) => part.type === "day")?.value || 1);

  return new Date(Date.UTC(year, month - 1, day, 0, -330, 0, 0));
}

function wordCount(value) {
  const text = stripHTML(value);
  return text ? text.split(/\s+/u).filter(Boolean).length : 0;
}

function normalizeTagList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  return normalizeText(value)
    .split(",")
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function deriveNewsTagString(input = {}, existing = {}, category = "", city = "") {
  const tags = Array.from(new Set([
    ...normalizeTagList(input.tags),
    ...normalizeTagList(input.tag),
    ...normalizeTagList(existing.tags),
    ...normalizeTagList(existing.tag),
    normalizeText(category),
    normalizeText(city),
    "Khabri Junction"
  ].filter(Boolean)));

  return tags.slice(0, 8).join(", ");
}

function normalizeImageCrop(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const x = Number(value.x ?? value.left);
  const y = Number(value.y ?? value.top);
  const width = Number(value.width ?? value.w);
  const height = Number(value.height ?? value.h);

  if (![x, y, width, height].every(Number.isFinite)) {
    return null;
  }

  return { x, y, width, height };
}

function createValidationError(message, details = []) {
  const error = new Error(message);
  error.status = 400;
  error.details = details;
  return error;
}

function nextScheduledRunDate(intervalMinutes = AUTOMATION_INTERVAL_MINUTES, from = new Date()) {
  const intervalMs = Math.max(1, Number(intervalMinutes || AUTOMATION_INTERVAL_MINUTES)) * 60 * 1000;
  const next = Math.ceil((from.getTime() + 1000) / intervalMs) * intervalMs;
  return new Date(next);
}

function stripHTML(value) {
  return normalizeText(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

function firstArrayItem(value) {
  return Array.isArray(value) ? value[0] : value;
}

function extractImageUrlFromValue(value) {
  const item = firstArrayItem(value);

  if (!item) {
    return "";
  }

  if (typeof item === "string") {
    const imgMatch = item.match(/<img[^>]+src=["']([^"']+)["']/i);
    return normalizeText(imgMatch?.[1] || item);
  }

  if (typeof item === "object") {
    return normalizeText(item["@_url"] || item["@_href"] || item.url || item.href || item.link || item["#text"]);
  }

  return "";
}

function extractRssImage(item = {}) {
  const candidates = [
    item["media:content"],
    item["media:thumbnail"],
    item.enclosure,
    item.image?.url,
    item.image,
    item["itunes:image"],
    item["content:encoded"],
    item.description
  ];

  for (const candidate of candidates) {
    const url = extractImageUrlFromValue(candidate);

    if (url && !isLikelyLowQualityImage(url)) {
      return url;
    }
  }

  return "";
}

function extractImageFromHtml(html) {
  const text = String(html || "");
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const url = normalizeText(match?.[1]);

    if (url && !isLikelyLowQualityImage(url)) {
      return url;
    }
  }

  return "";
}

async function fetchSourceImageFromPage(url) {
  const sourceUrl = normalizeText(url);

  if (!sourceUrl || /news\.google\.com/i.test(sourceUrl)) {
    return "";
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "KhabriJunctionBot/1.0"
      },
      signal: AbortSignal.timeout(4500)
    });

    if (!response.ok) {
      return "";
    }

    return extractImageFromHtml(await response.text());
  } catch (error) {
    return "";
  }
}

function splitThumbnailTitle(value, maxLength = 28, maxLines = 4) {
  const title = normalizeText(typeof value === "object" ? value.title : value || "Khabri Junction News");
  const words = title.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const nextLine = `${line} ${word}`.trim();

    if (nextLine.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  return lines.slice(0, maxLines);
}

function thumbnailPalette(input = {}) {
  const category = toSlug(input.categorySlug || input.category || input.categoryBadge || "");
  const palettes = {
    sports: ["#0b3b2e", "#138a36", "#f7c948"],
    politics: ["#1f2937", "#b91c1c", "#ffffff"],
    crime: ["#111827", "#7f1d1d", "#fca5a5"],
    entertainment: ["#2d1b69", "#d946ef", "#fef3c7"],
    health: ["#064e3b", "#10b981", "#d1fae5"],
    astrology: ["#1e1b4b", "#7c3aed", "#fde68a"],
    jobs: ["#0f172a", "#2563eb", "#dbeafe"],
    breaking: ["#101820", "#e1081b", "#ffffff"]
  };

  if (["durg", "bhilai", "raipur", "bilaspur", "rajnandgaon", "kawardha", "khairagarh"].includes(category) || input.city) {
    return ["#111827", "#c1121f", "#fff7ed"];
  }

  return palettes[category] || palettes.breaking;
}

function thumbnailBadges(input = {}) {
  return Array.from(new Set([
    normalizeText(input.categoryBadge || input.category || "NEWS").toUpperCase(),
    normalizeText(input.city || input.districtHint).toUpperCase()
  ].filter(Boolean)));
}

function svgDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function isLikelyLowQualityImage(value) {
  const url = normalizeText(value);

  if (!url || url.length < MIN_SOURCE_IMAGE_LENGTH || url.startsWith("data:image/svg")) {
    return true;
  }

  return /logo|icon|avatar|sprite|placeholder|default|transparent|1x1|pixel/i.test(url);
}

function optimizedRemoteImageUrl(value) {
  const url = normalizeText(value);

  if (!url || url.startsWith("data:")) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (/images\.unsplash\.com$/i.test(parsed.hostname)) {
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", String(THUMBNAIL_WIDTH));
      parsed.searchParams.set("q", "74");
    }

    return parsed.toString();
  } catch (error) {
    return url;
  }
}

function preferredSourceImage(input = {}, existing = {}) {
  const direct = normalizeText(input.sourceImage || existing.sourceImage || input.sourceImageUrl || existing.sourceImageUrl);

  if (direct && !isLikelyLowQualityImage(direct)) {
    return direct;
  }

  const candidate = normalizeText(input.image || existing.image);

  if (candidate && !candidate.startsWith("data:") && !isLikelyLowQualityImage(candidate) && candidate !== DEFAULT_NEWS_IMAGE) {
    return candidate;
  }

  return "";
}

function renderThumbnailOverlay(input = {}) {
  const badges = thumbnailBadges(input);
  const [dark, accent, light] = thumbnailPalette(input);
  const title = normalizeText(input.title || input.titleHi || "Khabri Junction News");
  const lines = splitThumbnailTitle({ title }, 30, 3);
  const badgeSvg = badges.map((badge, index) => `
    <rect x="${70 + index * 260}" y="62" width="${Math.min(235, Math.max(130, badge.length * 20))}" height="58" rx="12" fill="${index ? accent : "#ffffff"}"/>
    <text x="${92 + index * 260}" y="101" fill="${index ? "#ffffff" : accent}" font-family="Arial, sans-serif" font-size="26" font-weight="900">${escapeHTML(badge.slice(0, 18))}</text>
  `).join("");
  const titleSvg = lines.map((text, index) => (
    `<text x="70" y="${310 + index * 62}" fill="#ffffff" font-family="Arial, sans-serif" font-size="46" font-weight="800">${escapeHTML(text)}</text>`
  )).join("");

  return {
    dark,
    accent,
    light,
    badgeSvg,
    titleSvg
  };
}

function generateNewsThumbnail(input = {}) {
  const { dark, accent, light, badgeSvg, titleSvg } = renderThumbnailOverlay(input);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" viewBox="0 0 ${THUMBNAIL_WIDTH} ${THUMBNAIL_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${dark}"/>
      <stop offset="0.58" stop-color="${accent}"/>
      <stop offset="1" stop-color="${light}"/>
    </linearGradient>
    <pattern id="lines" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <rect width="16" height="48" fill="rgba(255,255,255,0.1)"/>
    </pattern>
  </defs>
  <rect width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" fill="url(#bg)"/>
  <rect width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" fill="url(#lines)"/>
  ${badgeSvg}
  <text x="70" y="210" fill="#ffffff" opacity="0.75" font-family="Arial, sans-serif" font-size="28" font-weight="700">KHABRI JUNCTION</text>
  ${titleSvg}
  <text x="70" y="610" fill="#ffffff" opacity="0.8" font-family="Arial, sans-serif" font-size="25" font-weight="700">khabrijunction.com</text>
  <text x="730" y="610" fill="#ffffff" opacity="0.18" font-family="Arial, sans-serif" font-size="82" font-weight="900">KJ NEWS</text>
</svg>`;

  return svgDataUrl(svg);
}

function buildWatermarkedSourceThumbnail(input = {}) {
  const sourceImage = optimizedRemoteImageUrl(input.sourceImage || input.image);

  if (isLikelyLowQualityImage(sourceImage)) {
    return "";
  }

  const { accent, badgeSvg, titleSvg } = renderThumbnailOverlay(input);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" viewBox="0 0 ${THUMBNAIL_WIDTH} ${THUMBNAIL_HEIGHT}">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0.72)"/>
      <stop offset="0.48" stop-color="rgba(0,0,0,0.25)"/>
      <stop offset="1" stop-color="rgba(193,18,31,0.72)"/>
    </linearGradient>
  </defs>
  <rect width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" fill="#111827"/>
  <image href="${escapeHTML(sourceImage)}" width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" preserveAspectRatio="xMidYMid slice"/>
  <rect width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" fill="url(#shade)"/>
  ${badgeSvg}
  <rect x="70" y="175" width="292" height="50" rx="10" fill="${accent}" opacity="0.92"/>
  <text x="92" y="208" fill="#ffffff" font-family="Arial, sans-serif" font-size="25" font-weight="900">KHABRI JUNCTION</text>
  ${titleSvg}
  <text x="790" y="612" fill="#ffffff" opacity="0.55" font-family="Arial, sans-serif" font-size="36" font-weight="900">KJ NEWS</text>
</svg>`;

  return svgDataUrl(svg);
}

function thumbnailHashForNews(input = {}) {
  return hashValue([
    input.sourceImage,
    input.titleHi || input.title,
    input.categorySlug || input.category,
    input.city || input.districtHint,
    input.sourceUrl
  ].filter(Boolean).join("|"));
}

function aiThumbnailPrompt(input = {}) {
  const category = normalizeText(input.category || input.categoryBadge || "Breaking");
  const city = normalizeText(input.city || input.districtHint || "Chhattisgarh");
  const title = normalizeText(input.titleHi || input.title || "Local Chhattisgarh news");

  return `Create a realistic indian local news thumbnail for Khabri Junction.
Category style: ${category}.
District/city: ${city}.
News headline context: ${title}.
Visual rules:
- Indian Chhattisgarh local newsroom style, cinematic lighting.
- Realistic editorial/photojournalism look, no poster look.
- No real politician or accused face unless provided.
- No fake text, no logo, no watermark in the AI image.
- Natural Indian places, newsroom, public location, local civic scene when relevant.
- Strong but clean red, white and black brand-compatible feel.
- Leave room for KHABRI JUNCTION watermark, category badge and district badge.
- Google Discover friendly, fast mobile thumbnail composition.`;
}

async function generateOpenAIThumbnail(input = {}) {
  if (!OPENAI_API_KEY) {
    return "";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_IMAGE_MODEL,
        prompt: aiThumbnailPrompt(input),
        size: "1024x1024",
        quality: "low",
        output_format: "webp",
        n: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      await addAutomationLog("thumbnail-error", "OpenAI image generation failed", { error: errorText.slice(0, 180) });
      return "";
    }

    const payload = await response.json();
    const image = payload.data?.[0];

    if (image?.b64_json) {
      return `data:image/webp;base64,${image.b64_json}`;
    }

    return normalizeText(image?.url);
  } catch (error) {
    await addAutomationLog("thumbnail-error", "OpenAI image generation failed", { error: error.message });
    return "";
  }
}

async function buildThumbnailFields(input = {}, existing = {}, options = {}) {
  const sourceImage = preferredSourceImage(input, existing);
  const title = normalizeText(input.titleHi || input.title || existing.titleHi || existing.title);
  const categoryBadge = normalizeText(input.categoryBadge || existing.categoryBadge || input.category || existing.category);
  const thumbnailBase = {
    ...existing,
    ...input,
    title,
    categoryBadge,
    sourceImage
  };
  const thumbnailHash = thumbnailHashForNews(thumbnailBase);
  const canReuse = !options.force && existing.thumbnailHash === thumbnailHash;
  let optimizedThumbnail = normalizeText(input.optimizedThumbnail || existing.optimizedThumbnail);
  let aiThumbnail = normalizeText(input.aiThumbnail || existing.aiThumbnail);
  const allowAi = options.allowAi !== false;
  let thumbnailStatus = normalizeText(input.thumbnailStatus || existing.thumbnailStatus);

  if (!canReuse || options.action === "use-source") {
    optimizedThumbnail = buildWatermarkedSourceThumbnail(thumbnailBase);
  }

  const shouldGenerateAi = allowAi && (
    options.action === "generate-ai" ||
    options.action === "regenerate-ai" ||
    (!optimizedThumbnail && !aiThumbnail && options.action !== "use-source")
  );

  if (shouldGenerateAi) {
    const generatedAi = options.action === "generate-ai" && canReuse && aiThumbnail
      ? aiThumbnail
      : await generateOpenAIThumbnail(thumbnailBase);

    if (generatedAi) {
      aiThumbnail = generatedAi;
      thumbnailStatus = "ai-generated";
    } else {
      aiThumbnail = generateNewsThumbnail(thumbnailBase);
      thumbnailStatus = "fallback";
    }
  } else if (!optimizedThumbnail && !aiThumbnail) {
    aiThumbnail = generateNewsThumbnail(thumbnailBase);
    thumbnailStatus = "fallback";
  }

  if (optimizedThumbnail) {
    thumbnailStatus = "source-watermarked";
  } else if (!thumbnailStatus) {
    thumbnailStatus = aiThumbnail ? "ai-generated" : "fallback";
  }

  return {
    sourceImage,
    optimizedThumbnail,
    aiThumbnail,
    thumbnailHash,
    thumbnailStatus,
    image: optimizedThumbnail || aiThumbnail || sourceImage || normalizeText(input.image || existing.image) || DEFAULT_NEWS_IMAGE
  };
}

function categoryFromValue(value) {
  const slug = toSlug(value);
  const aliasedSlug = CATEGORY_ROUTE_ALIASES.get(slug) || slug;
  const normalized = slugText(value);

  return CATEGORY_DEFINITIONS.find((category) => (
    category.slug === aliasedSlug ||
    category.page === slug ||
    slugText(category.label) === normalized ||
    slugText(category.badge) === normalized
  )) || null;
}

function categoryRoutePath(categoryOrValue = "breaking") {
  const category = typeof categoryOrValue === "object" ? categoryOrValue : categoryFromValue(categoryOrValue);
  return `/category/${category?.slug || "breaking"}`;
}

function inferCategory(text) {
  const value = slugText(text);
  const topicCategories = CATEGORY_DEFINITIONS.filter((category) => !CITY_DEFINITIONS.some((city) => city.slug === category.slug));
  const cityCategories = CATEGORY_DEFINITIONS.filter((category) => CITY_DEFINITIONS.some((city) => city.slug === category.slug));
  const topicMatch = topicCategories.find((category) => category.keywords.some((keyword) => value.includes(keyword)));

  if (topicMatch) {
    return topicMatch.label;
  }

  const cityMatch = cityCategories.find((category) => category.keywords.some((keyword) => value.includes(keyword)));

  if (cityMatch) {
    return cityMatch.label;
  }

  return "Breaking";

  const categoryRules = [
    ["Astrology", ["astrology", "rashifal", "horoscope", "panchang", "zodiac", "राशिफल", "à¤œà¥à¤¯à¥‹तिष"]],
    ["Sports", ["sports", "cricket", "ipl", "football", "match", "à¤–à¥‡ल", "à¤•à¥à¤°à¤¿à¤•à¥‡à¤Ÿ"]],
    ["Durg", ["durg", "à¤¦à¥à¤°à¥à¤—"]],
    ["Bhilai", ["bhilai", "à¤­à¤¿à¤²à¤¾à¤ˆ"]],
    ["Raipur", ["raipur", "रायपुर"]],
    ["Bilaspur", ["bilaspur", "बिलासपुर"]],
    ["Kawardha", ["kawardha", "à¤•वर्धा"]],
    ["Khairagarh", ["khairagarh", "à¤–à¥ˆà¤°à¤¾à¤—ढ़", "à¤–à¥ˆà¤°à¤¾à¤—ढ़"]],
    ["Rajnandgaon", ["rajnandgaon", "à¤°à¤¾à¤œà¤¨à¤¾à¤‚à¤¦à¤—à¤¾à¤‚व"]],
    ["Politics", ["politics", "election", "minister", "bjp", "congress", "à¤°à¤¾à¤œà¤¨à¥€ति", "à¤šुनाव"]],
    ["Crime", ["crime", "police", "arrest", "murder", "fraud", "à¤…पराध", "पुलिस"]],
    ["Health", ["health", "hospital", "doctor", "medical", "स्वास्थ्य", "à¤…स्पताल"]],
    ["Jobs", ["job", "jobs", "recruitment", "vacancy", "à¤°à¥‹à¤œà¤—ार", "à¤¨à¥Œà¤•à¤°à¥€"]]
  ];

  const match = categoryRules.find(([, keywords]) => keywords.some((keyword) => value.includes(keyword)));
  return match ? match[0] : "Breaking";
}

function inferCity(text) {
  const value = slugText(text);
  const cityMatch = CITY_DEFINITIONS.find((city) => city.keywords.some((keyword) => value.includes(keyword)));

  if (cityMatch) {
    return cityMatch.slug;
  }

  return "";

  const cityRules = [
    ["durg", ["durg", "à¤¦à¥à¤°à¥à¤—"]],
    ["bhilai", ["bhilai", "à¤­à¤¿à¤²à¤¾à¤ˆ"]],
    ["raipur", ["raipur", "रायपुर"]],
    ["bilaspur", ["bilaspur", "बिलासपुर"]],
    ["kawardha", ["kawardha", "à¤•वर्धा"]],
    ["khairagarh", ["khairagarh", "à¤–à¥ˆà¤°à¤¾à¤—ढ़", "à¤–à¥ˆà¤°à¤¾à¤—ढ़"]],
    ["rajnandgaon", ["rajnandgaon", "à¤°à¤¾à¤œà¤¨à¤¾à¤‚à¤¦à¤—à¤¾à¤‚व"]]
  ];

  const match = cityRules.find(([, keywords]) => keywords.some((keyword) => value.includes(keyword)));
  return match ? match[0] : "";
}

function categoryDefinitionForNews(input, existing = {}) {
  const directCategory = categoryFromValue(input.category || input.tag || existing.category || existing.categorySlug);
  const detectedCategory = categoryFromValue(inferCategory(`${input.title} ${input.summary} ${input.body} ${input.sourceTitle} ${input.category} ${input.tag}`));

  return directCategory || detectedCategory || CATEGORY_DEFINITIONS.find((category) => category.slug === "breaking");
}

function trimForMeta(value, maxLength = 155) {
  const text = normalizeText(value).replace(/\s+/g, " ");

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function buildSeoFields(news) {
  const title = normalizeText(news.title);
  const summary = trimForMeta(news.summary || news.body || title);
  const badge = normalizeText(news.categoryBadge || news.category || "News");

  return {
    slug: normalizeText(news.slug) || toSlug(title),
    metaTitle: trimForMeta(news.metaTitle || `${title} | Khabri Junction`, 70),
    metaDescription: trimForMeta(news.metaDescription || summary, 155),
    ogTitle: trimForMeta(news.ogTitle || title, 90),
    ogDescription: trimForMeta(news.ogDescription || summary, 200),
    schemaType: "NewsArticle",
    keywords: Array.from(new Set([badge, news.category, news.city, "Khabri Junction", "Chhattisgarh"].filter(Boolean))).join(", ")
  };
}

function hasHindiText(value) {
  return /[\u0900-\u097F]/.test(String(value || ""));
}

function detectContentLanguage(value) {
  return hasHindiText(value) ? "hi" : "en";
}

function sourceLanguageForNews(news = {}) {
  return normalizeText(news.language || detectContentLanguage(localizedCopySeed({
    title: news.titleHi || news.title || news.titleEn,
    summary: news.summaryHi || news.summary || news.summaryEn,
    body: news.bodyHi || news.body || news.bodyEn
  })));
}

function needsLocalizationRepair(news = {}) {
  const sourceLanguage = sourceLanguageForNews(news);
  const englishSeed = localizedCopySeed({ title: news.titleEn, summary: news.summaryEn, body: news.bodyEn });
  const hindiSeed = localizedCopySeed({ title: news.titleHi, summary: news.summaryHi, body: news.bodyHi });
  const hasEntityNoise = /&(?:nbsp|amp|quot|apos|lt|gt|#\d+);/i.test(`${news.titleEn || ""} ${news.titleHi || ""} ${news.bodyEn || ""} ${news.bodyHi || ""}`);
  const copiedHindi = looksCopiedFromSource(`${news.titleHi || ""} ${news.summaryHi || ""}`, `${news.sourceTitle || ""} ${news.summary || ""}`);

  if (hasEntityNoise || copiedHindi) {
    return true;
  }

  if (!looksLikeLanguageCopy(hindiSeed, "hi")) {
    return true;
  }

  if (!looksLikeLanguageCopy(englishSeed, "en")) {
    return true;
  }

  return Boolean(sourceLanguage === "hi" && comparableCopy(englishSeed) === comparableCopy(hindiSeed));
}

function parseJsonObject(text) {
  const raw = normalizeText(text);

  try {
    return JSON.parse(raw);
  } catch (error) {
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
}

async function translateNewsCopy(source, targetLanguage) {
  const cleanedSource = {
    title: cleanNewsCopyText(source.title, { targetLanguage, sourceName: source.sourceName, feedSourceName: source.feedSourceName }),
    summary: cleanNewsCopyText(source.summary, { targetLanguage, sourceName: source.sourceName, feedSourceName: source.feedSourceName }),
    body: cleanNewsCopyText(source.body, { targetLanguage, sourceName: source.sourceName, feedSourceName: source.feedSourceName })
  };
  const sourceLanguage = detectContentLanguage(localizedCopySeed(cleanedSource));

  if (!OPENAI_API_KEY) {
    return sourceLanguage === targetLanguage ? cleanedSource : { title: "", summary: "", body: "" };
  }

  const targetName = targetLanguage === "hi" ? "Hindi" : "English";
  let lastCleaned = { title: "", summary: "", body: "" };

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const prompt = `
Translate this news copy into ${targetName} for Khabri Junction.

Rules:
- Keep facts, numbers, names, places and allegations exactly as given.
- Do not add new facts.
- Keep the language natural for a news website.
- Output ONLY in ${targetName}.
- ${targetLanguage === "en"
    ? "Do not leave Hindi sentences or mixed Hindi-English paragraphs in the result."
    : "Do not leave English headline prefixes or English-only body paragraphs in the result except names and official terms."}
- Remove source labels, publisher names, and HTML entities like &nbsp; from the final copy.
- Return ONLY valid JSON.

Input:
${JSON.stringify(cleanedSource, null, 2)}

Return JSON:
{
  "title": "translated title",
  "summary": "translated summary",
  "body": "translated full body"
}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: prompt,
        max_output_tokens: 1600
      })
    });

    if (!response.ok) {
      await addAutomationLog("translation-fallback", "OpenAI translation unavailable, original copy preserved", {
        status: response.status,
        targetLanguage,
        attempt
      });
      if (attempt === 2) {
        return sourceLanguage === targetLanguage ? cleanedSource : { title: "", summary: "", body: "" };
      }
      continue;
    }

    const payload = await response.json();
    const outputText = payload.output_text || payload.output?.flatMap((part) => part.content || []).map((part) => part.text || "").join("\n");
    const parsed = parseJsonObject(outputText);
    lastCleaned = {
      title: cleanNewsCopyText(parsed.title, { targetLanguage, sourceName: source.sourceName, feedSourceName: source.feedSourceName }),
      summary: cleanNewsCopyText(parsed.summary, { targetLanguage, sourceName: source.sourceName, feedSourceName: source.feedSourceName }),
      body: cleanNewsCopyText(parsed.body, { targetLanguage, sourceName: source.sourceName, feedSourceName: source.feedSourceName })
    };

    if (looksLikeLanguageCopy(localizedCopySeed(lastCleaned), targetLanguage)) {
      return lastCleaned;
    }
  }

  return sourceLanguage === targetLanguage ? cleanedSource : lastCleaned;
}

async function prepareBilingualNews(input, existing = {}) {
  const sourceTitle = cleanNewsCopyText(input.title || input.titleEn || input.titleHi || existing.title || existing.titleEn || existing.titleHi, {
    targetLanguage: normalizeText(input.language || existing.language),
    sourceName: input.sourceName || existing.sourceName,
    feedSourceName: input.feedSourceName || existing.feedSourceName
  });
  const sourceSummary = cleanNewsCopyText(input.summary || input.summaryEn || input.summaryHi || existing.summary || existing.summaryEn || existing.summaryHi, {
    targetLanguage: normalizeText(input.language || existing.language),
    sourceName: input.sourceName || existing.sourceName,
    feedSourceName: input.feedSourceName || existing.feedSourceName
  });
  const sourceBody = cleanNewsCopyText(input.body || input.bodyEn || input.bodyHi || existing.body || existing.bodyEn || existing.bodyHi, {
    targetLanguage: normalizeText(input.language || existing.language),
    sourceName: input.sourceName || existing.sourceName,
    feedSourceName: input.feedSourceName || existing.feedSourceName
  });
  const sourceLanguage = normalizeText(input.language || existing.language || detectContentLanguage(`${sourceTitle} ${sourceSummary} ${sourceBody}`));
  const sourceIsHindi = sourceLanguage === "hi" || detectContentLanguage(`${sourceTitle} ${sourceSummary} ${sourceBody}`) === "hi";
  let titleEn = cleanNewsCopyText(input.titleEn || existing.titleEn || (!sourceIsHindi ? sourceTitle : ""), {
    targetLanguage: "en",
    sourceName: input.sourceName || existing.sourceName,
    feedSourceName: input.feedSourceName || existing.feedSourceName
  });
  let summaryEn = cleanNewsCopyText(input.summaryEn || existing.summaryEn || (!sourceIsHindi ? sourceSummary : ""), {
    targetLanguage: "en",
    sourceName: input.sourceName || existing.sourceName,
    feedSourceName: input.feedSourceName || existing.feedSourceName
  });
  let bodyEn = cleanNewsCopyText(input.bodyEn || existing.bodyEn || (!sourceIsHindi ? sourceBody : ""), {
    targetLanguage: "en",
    sourceName: input.sourceName || existing.sourceName,
    feedSourceName: input.feedSourceName || existing.feedSourceName
  });
  let titleHi = cleanNewsCopyText(input.titleHi || existing.titleHi || (sourceIsHindi ? sourceTitle : ""), {
    targetLanguage: "hi",
    sourceName: input.sourceName || existing.sourceName,
    feedSourceName: input.feedSourceName || existing.feedSourceName
  });
  let summaryHi = cleanNewsCopyText(input.summaryHi || existing.summaryHi || (sourceIsHindi ? sourceSummary : ""), {
    targetLanguage: "hi",
    sourceName: input.sourceName || existing.sourceName,
    feedSourceName: input.feedSourceName || existing.feedSourceName
  });
  let bodyHi = cleanNewsCopyText(input.bodyHi || existing.bodyHi || (sourceIsHindi ? sourceBody : ""), {
    targetLanguage: "hi",
    sourceName: input.sourceName || existing.sourceName,
    feedSourceName: input.feedSourceName || existing.feedSourceName
  });
  const errors = [];
  const englishSeed = () => localizedCopySeed({ title: titleEn, summary: summaryEn, body: bodyEn });
  const hindiSeed = () => localizedCopySeed({ title: titleHi, summary: summaryHi, body: bodyHi });

  if ((!titleEn || !summaryEn || !bodyEn || !looksLikeLanguageCopy(englishSeed(), "en")) && (titleHi || summaryHi || bodyHi)) {
    try {
      const translated = await translateNewsCopy({
        title: titleHi,
        summary: summaryHi,
        body: bodyHi,
        sourceName: input.sourceName || existing.sourceName,
        feedSourceName: input.feedSourceName || existing.feedSourceName
      }, "en");
      titleEn = titleEn || translated.title;
      summaryEn = summaryEn || translated.summary;
      bodyEn = bodyEn || translated.body;
    } catch (error) {
      errors.push(error.message);
    }
  }

  if ((!titleHi || !summaryHi || !bodyHi || !looksLikeLanguageCopy(hindiSeed(), "hi")) && (titleEn || summaryEn || bodyEn)) {
    try {
      const translated = await translateNewsCopy({
        title: titleEn,
        summary: summaryEn,
        body: bodyEn,
        sourceName: input.sourceName || existing.sourceName,
        feedSourceName: input.feedSourceName || existing.feedSourceName
      }, "hi");
      titleHi = titleHi || translated.title;
      summaryHi = summaryHi || translated.summary;
      bodyHi = bodyHi || translated.body;
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (!looksLikeLanguageCopy(englishSeed(), "en")) {
    titleEn = sourceIsHindi ? "" : sourceTitle;
    summaryEn = sourceIsHindi ? "" : sourceSummary;
    bodyEn = sourceIsHindi ? "" : sourceBody;
    errors.push("english copy pending");
  }

  if (!looksLikeLanguageCopy(hindiSeed(), "hi")) {
    titleHi = sourceIsHindi ? sourceTitle : "";
    summaryHi = sourceIsHindi ? sourceSummary : "";
    bodyHi = sourceIsHindi ? sourceBody : "";
    errors.push("hindi copy pending");
  }

  return {
    ...input,
    title: sourceIsHindi ? titleHi : titleEn,
    summary: sourceIsHindi ? summaryHi : summaryEn,
    body: sourceIsHindi ? bodyHi : bodyEn,
    titleEn,
    summaryEn,
    bodyEn,
    titleHi,
    summaryHi,
    bodyHi,
    language: sourceLanguage,
    translationStatus: errors.length ? "pending" : "complete",
    translationError: errors.slice(0, 2).join(" | ")
  };
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXML(value) {
  return escapeHTML(value);
}

function publicBaseUrl(req) {
  if (!req) {
    return SITE_URL;
  }

  const forwardedHost = normalizeText(req.get("x-forwarded-host")).split(",")[0].trim();
  const forwardedProto = normalizeText(req.get("x-forwarded-proto")).split(",")[0].trim();
  const host = forwardedHost || req.get("host");
  const proto = forwardedProto || req.protocol || "https";
  const base = `${proto}://${host}`.replace(/\/+$/, "");

  if (/^https?:\/\/localhost(?::\d+)?$/i.test(base) && process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, "");
  }

  return base;
}

function routeSlugForNews(doc) {
  const categorySlug = normalizeText(doc.categorySlug || toSlug(doc.category || "breaking"));
  const citySlug = normalizeText(doc.city);
  const cityCategory = citySlug ? categoryFromValue(citySlug) : null;

  if (categorySlug === "breaking" && cityCategory) {
    return cityCategory.slug;
  }

  return categorySlug || "breaking";
}

function landingPageForNews(doc) {
  const routeSlug = routeSlugForNews(doc);
  const routeCategory = categoryFromValue(routeSlug);

  return categoryRoutePath(routeCategory || routeSlug);
}

function articleUrl(doc, req) {
  return `${publicBaseUrl(req)}${articlePath(doc)}`;
}

function articlePath(doc) {
  return `${categoryRoutePath(routeSlugForNews(doc))}/${doc.slug || toSlug(doc.title)}`;
}

function normalizeNews(input, existing = {}) {
  const now = new Date();
  const title = normalizeText(input.title || input.titleEn || input.titleHi);

  if (!title) {
    const error = new Error("title is required");
    error.status = 400;
    throw error;
  }

  const automated = normalizeBoolean(input.automated || existing.automated);
  const categoryDefinition = categoryDefinitionForNews(input, existing);
  const combinedText = `${input.title} ${input.titleEn} ${input.titleHi} ${input.summary} ${input.summaryEn} ${input.summaryHi} ${input.body} ${input.bodyEn} ${input.bodyHi} ${input.sourceTitle} ${input.category} ${input.tag}`;
  const directDistrict = normalizeText(input.city || existing.city || input.districtHint || existing.districtHint || inferCity(combinedText));
  const fallbackDistrict = districtDefinitionFromValue(categoryDefinition.slug);
  const districtDefinition = districtDefinitionFromValue(directDistrict) || fallbackDistrict;
  const city = normalizeText(districtDefinition?.slug || directDistrict);
  const status = normalizeText(input.status || existing.status || (automated ? "pending" : "published"));
  const sourceUrl = normalizeText(input.sourceUrl || existing.sourceUrl);
  const sourceHash = normalizeText(input.sourceHash || existing.sourceHash || sourceHashFromUrl(sourceUrl));
  const storyHash = normalizeText(input.storyHash || existing.storyHash);
  const sourcePublishedAt = parseDateCandidate(input.sourcePublishedAt || existing.sourcePublishedAt);
  const freshnessScoreValue = Number(input.freshnessScore ?? existing.freshnessScore);
  const categoryBadge = normalizeText(input.categoryBadge || input.tag || categoryDefinition.badge);
  const cmsUploadedImage = [
    input.image,
    input.sourceImage,
    input.optimizedThumbnail,
    input.aiThumbnail
  ].map((item) => normalizeText(item)).find(isCmsUploadedImage) || "";
  const sourceImage = preferredSourceImage(input, existing);
  const sourceImageChanged = Boolean(sourceImage) && sourceImage !== normalizeText(existing.sourceImage);
  const optimizedThumbnail = cmsUploadedImage
    ? ""
    : normalizeText(input.optimizedThumbnail || (sourceImageChanged ? "" : existing.optimizedThumbnail)) || buildWatermarkedSourceThumbnail({
      ...input,
      ...existing,
      title,
      categoryBadge,
      category: categoryDefinition.label,
      city,
      sourceImage
    });
  const aiThumbnail = cmsUploadedImage ? "" : normalizeText(input.aiThumbnail || (sourceImageChanged ? "" : existing.aiThumbnail));
  const fallbackThumbnail = generateNewsThumbnail({ title, categoryBadge, category: categoryDefinition.label, city });
  const thumbnailHash = normalizeText(input.thumbnailHash || (sourceImageChanged ? "" : existing.thumbnailHash) || thumbnailHashForNews({
    ...input,
    title,
    category: categoryDefinition.label,
    categoryBadge,
    city,
    sourceImage
  }));
  const image = cmsUploadedImage || optimizedThumbnail || aiThumbnail || sourceImage || normalizeText(input.image || existing.image) || fallbackThumbnail;
  const tag = deriveNewsTagString(input, existing, categoryDefinition.label, city) || normalizeText(input.categoryBadge || categoryDefinition.badge);
  const imageCrop = normalizeImageCrop(input.imageCrop || existing.imageCrop);
  const news = {
    title,
    summary: normalizeText(input.summary),
    body: normalizeText(input.body),
    titleEn: normalizeText(input.titleEn || input.title || existing.titleEn || existing.title),
    summaryEn: normalizeText(input.summaryEn || input.summary || existing.summaryEn || existing.summary),
    bodyEn: normalizeText(input.bodyEn || input.body || existing.bodyEn || existing.body),
    titleHi: normalizeText(input.titleHi || existing.titleHi),
    summaryHi: normalizeText(input.summaryHi || existing.summaryHi),
    bodyHi: normalizeText(input.bodyHi || existing.bodyHi),
    category: categoryDefinition.label,
    categorySlug: categoryDefinition.slug,
    categoryPage: categoryDefinition.page,
    categoryBadge,
    city,
    image,
    sourceImage,
    optimizedThumbnail,
    aiThumbnail,
    thumbnailHash,
    thumbnailStatus: normalizeText(cmsUploadedImage ? "manual-upload" : input.thumbnailStatus || (sourceImageChanged ? "" : existing.thumbnailStatus) || (optimizedThumbnail ? "source-watermarked" : aiThumbnail ? "ai-generated" : "fallback")),
    createdAt: existing.createdAt || input.createdAt || now,
    updatedAt: now,
    publishedAt: status === "published"
      ? parseDateCandidate(input.publishedAt || existing.publishedAt || now) || now
      : parseDateCandidate(existing.publishedAt),
    status,
    breaking: normalizeBoolean(input.breaking) || categoryDefinition.slug === "breaking",
    featured: normalizeBoolean(input.featured),
    trending: normalizeBoolean(input.trending),
    language: normalizeText(input.language || existing.language || "en"),
    translationStatus: normalizeText(input.translationStatus || existing.translationStatus),
    translationError: normalizeText(input.translationError || existing.translationError),
    tag,
    tags: normalizeTagList(input.tags || existing.tags || tag),
    author: normalizeText(input.author || existing.author || "Khabri Junction Desk"),
    sourceCredit: cmsUploadedImage ? "" : normalizeText(input.sourceCredit || existing.sourceCredit || input.sourceName || existing.sourceName || input.feedSourceName || existing.feedSourceName),
    imageAlt: normalizeText(input.imageAlt || existing.imageAlt || title),
    imageCredit: normalizeText(input.imageCredit || existing.imageCredit),
    imageSource: normalizeText(input.imageSource || existing.imageSource || sourceUrl),
    imageCrop,
    reviewNotes: normalizeText(input.reviewNotes || existing.reviewNotes),
    sourceUrl,
    sourceTitle: normalizeText(input.sourceTitle || existing.sourceTitle),
    sourceName: normalizeText(input.sourceName || existing.sourceName),
    feedSourceName: normalizeText(input.feedSourceName || existing.feedSourceName),
    sourcePriority: Number(input.sourcePriority ?? existing.sourcePriority ?? 9),
    districtHint: normalizeText(input.districtHint || existing.districtHint),
    sourcePublishedAt,
    sourceHash,
    storyHash,
    freshnessScore: Number.isFinite(freshnessScoreValue) ? freshnessScoreValue : null,
    duplicateKey: normalizeText(input.duplicateKey || existing.duplicateKey || sourceHash || hashValue(slugText(input.sourceUrl || input.sourceTitle || title))),
    automated
  };
  const seo = buildSeoFields({ ...news, ...input, slug: input.slug || existing.slug });
  const normalized = {
    ...news,
    ...seo
  };

  if (!normalized.sourceUrl) {
    delete normalized.sourceUrl;
  }

  if (!normalized.sourceHash) {
    delete normalized.sourceHash;
  }

  if (!normalized.storyHash) {
    delete normalized.storyHash;
  }

  if (!normalized.sourcePublishedAt) {
    delete normalized.sourcePublishedAt;
  }

  ["sourceImage", "optimizedThumbnail", "aiThumbnail", "thumbnailHash", "thumbnailStatus"].forEach((field) => {
    if (!normalized[field]) {
      delete normalized[field];
    }
  });

  if (!normalized.imageCrop) {
    delete normalized.imageCrop;
  }

  return normalized;
}

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error("invalid news id");
    error.status = 400;
    throw error;
  }

  return new ObjectId(id);
}

function serializeNews(doc) {
  if (!doc) {
    return null;
  }

  const district = districtDefinitionFromValue(doc.city || doc.districtHint);

  return {
    _id: String(doc._id),
    title: doc.title,
    summary: doc.summary,
    body: doc.body,
    titleEn: normalizeText(doc.titleEn),
    summaryEn: normalizeText(doc.summaryEn),
    bodyEn: normalizeText(doc.bodyEn),
    titleHi: normalizeText(doc.titleHi),
    summaryHi: normalizeText(doc.summaryHi),
    bodyHi: normalizeText(doc.bodyHi),
    category: doc.category,
    categorySlug: doc.categorySlug,
    categoryPage: landingPageForNews(doc),
    categoryBadge: doc.categoryBadge,
    city: doc.city,
    district: district?.label || "",
    districtSlug: district?.slug || normalizeText(doc.city || ""),
    districtPage: district ? districtRoutePath(district.slug) : "",
    image: doc.image,
    sourceImage: doc.sourceImage,
    optimizedThumbnail: doc.optimizedThumbnail,
    aiThumbnail: doc.aiThumbnail,
    thumbnailHash: doc.thumbnailHash,
    thumbnailStatus: doc.thumbnailStatus,
    slug: doc.slug,
    articleUrl: articlePath(doc),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    publishedAt: doc.publishedAt,
    status: doc.status,
    breaking: doc.breaking,
    featured: doc.featured,
    trending: doc.trending,
    language: doc.language,
    translationStatus: doc.translationStatus,
    translationError: doc.translationError,
    tag: doc.tag,
    tags: Array.isArray(doc.tags) ? doc.tags : normalizeTagList(doc.tag),
    author: doc.author || "Khabri Junction Desk",
    sourceCredit: doc.sourceCredit || doc.sourceName || doc.feedSourceName || "",
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription,
    ogTitle: doc.ogTitle,
    ogDescription: doc.ogDescription,
    schemaType: doc.schemaType,
    keywords: doc.keywords,
    imageAlt: doc.imageAlt || doc.title,
    imageCredit: doc.imageCredit || "",
    imageSource: doc.imageSource || doc.sourceUrl || "",
    imageCrop: doc.imageCrop || null,
    reviewNotes: doc.reviewNotes || "",
    sourceUrl: doc.sourceUrl,
    sourceTitle: doc.sourceTitle,
    sourceName: doc.sourceName,
    feedSourceName: doc.feedSourceName,
    sourcePriority: doc.sourcePriority,
    districtHint: doc.districtHint,
    sourcePublishedAt: doc.sourcePublishedAt,
    sourceHash: doc.sourceHash,
    storyHash: doc.storyHash,
    freshnessScore: doc.freshnessScore,
    automated: doc.automated,
    contentSource: doc.contentSource || (doc.automated ? "ai" : "manual"),
    views: doc.views || 0,
    clicks: doc.clicks || 0
  };
}

async function requireDatabase(req, res, next) {
  if (!mongoReady || !newsCollection || !settingsCollection || !adsCollection || !manualNewsCollection || !newsAnalyticsCollection || !pushSubscribersCollection) {
    await connectToMongo();
  }

  if (!mongoReady || !newsCollection || !settingsCollection || !adsCollection || !manualNewsCollection || !newsAnalyticsCollection || !pushSubscribersCollection) {
    if (req.accepts("html")) {
      return res.status(503).type("html").send(`<!DOCTYPE html>
<html lang="hi" translate="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google" content="notranslate">
  <title>Loading News | Khabri Junction</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body class="article-page">
  <main class="portal-shell">
    <section class="market-card category-focus-card">
      <div class="section-title"><span></span><strong>à¤¨à¥à¤¯à¥‚à¤œ सर्वर à¤•à¤¨à¥‡à¤•à¥à¤Ÿ à¤¹à¥‹ रहा à¤¹à¥ˆ</strong></div>
      <p class="article-summary">à¤•à¥ƒपया à¤•à¥à¤› à¤¸à¥‡à¤•à¤‚ड बाद à¤ªà¥‡à¤œ refresh à¤•à¤°à¥‡à¤‚. MongoDB connection à¤…à¤­à¥€ à¤¤à¥ˆयार à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆ.</p>
      <a class="read-btn" href="/index.html">à¤¹à¥‹म पर à¤œà¤¾à¤à¤‚</a>
    </section>
  </main>
</body>
</html>`);
    }

    return res.status(503).json({
      error: "MongoDB is not connected",
      detail: mongoError ? mongoError.message : "Check MONGODB_URI and start MongoDB."
    });
  }

  next();
}

function serializeAd(doc) {
  return doc ? {
    _id: String(doc._id),
    title: doc.title,
    position: doc.position,
    enabled: doc.enabled,
    target: doc.target || "all",
    image: doc.image || "",
    linkUrl: doc.linkUrl || "",
    adsenseCode: doc.adsenseCode || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  } : null;
}

function normalizeAd(input, existing = {}) {
  const now = new Date();
  const rawPosition = normalizeText(input.position || existing.position || "homepage").toLowerCase();
  const positionAliases = {
    "in-article": "article-top",
    article: "article-top",
    "article-top": "article-top",
    "article-bottom": "article-bottom",
    "mobile sticky": "mobile-sticky",
    mobile: "mobile-sticky"
  };
  return {
    title: normalizeText(input.title || existing.title || "Advertisement"),
    position: positionAliases[rawPosition] || rawPosition,
    enabled: input.enabled === undefined ? normalizeBoolean(existing.enabled) : normalizeBoolean(input.enabled),
    target: normalizeText(input.target || existing.target || "all"),
    image: normalizeText(input.image || existing.image),
    linkUrl: normalizeText(input.linkUrl || existing.linkUrl),
    adsenseCode: normalizeText(input.adsenseCode || existing.adsenseCode),
    createdAt: existing.createdAt || now,
    updatedAt: now
  };
}

async function uniqueSlugAcrossCollections(title, sourceHash = "", existingId = null, collection = newsCollection) {
  const baseSlug = toSlug(title);
  const suffix = normalizeText(sourceHash).slice(0, 8) || hashValue(`${baseSlug}:${Date.now()}`).slice(0, 8);
  let candidate = baseSlug;
  let counter = 1;
  const idFilter = existingId ? { _id: { $ne: existingId } } : {};

  while (
    await newsCollection.findOne({ slug: candidate, ...idFilter }, { projection: { _id: 1 } }) ||
    await manualNewsCollection.findOne({ slug: candidate, ...idFilter }, { projection: { _id: 1 } })
  ) {
    candidate = `${baseSlug}-${counter === 1 ? suffix : `${suffix}-${counter}`}`.slice(0, 110);
    counter += 1;
  }

  return candidate;
}

async function normalizeManualNews(input, existing = {}, options = {}) {
  const existingId = existing._id || null;
  const prepared = await prepareBilingualNews({
    ...input,
    automated: false,
    contentSource: "manual",
    sourceName: normalizeText(input.sourceName || existing.sourceName || "Khabri Junction Desk")
  }, existing);
  const normalized = normalizeNews(prepared, existing);
  const requestedSlug = normalizeText(input.slug || existing.slug);
  const slug = requestedSlug && requestedSlug === existing.slug
    ? requestedSlug
    : await uniqueSlugAcrossCollections(requestedSlug || normalized.title, normalized.duplicateKey, existingId, manualNewsCollection);

  const manualNews = {
    ...normalized,
    slug,
    automated: false,
    contentSource: "manual",
    priority: 1,
    author: normalizeText(input.author || existing.author || "Khabri Junction Desk"),
    views: Number(existing.views || 0),
    clicks: Number(existing.clicks || 0)
  };

  if (options.validatePublish && (manualNews.status || "published") === "published") {
    validatePublishableNews(manualNews);
  }

  return manualNews;
}

function primaryNewsImage(news = {}) {
  return normalizeText(news.optimizedThumbnail || news.aiThumbnail || news.sourceImage || news.image);
}

function isCmsUploadedImage(value = "") {
  const image = normalizeText(value);

  if (!image) {
    return false;
  }

  try {
    const parsed = new URL(image, SITE_URL || `http://localhost:${PORT}`);
    return /^\/(?:assets\/uploads|api\/uploads)\//i.test(parsed.pathname);
  } catch (error) {
    return /^\/(?:assets\/uploads|api\/uploads)\//i.test(image);
  }
}

function uploadedFeaturedImage(news = {}) {
  return [
    news.image,
    news.sourceImage,
    news.optimizedThumbnail,
    news.aiThumbnail
  ].map((item) => normalizeText(item)).find(isCmsUploadedImage) || "";
}

function articleFeaturedImage(news = {}) {
  return uploadedFeaturedImage(news)
    || normalizeText(news.optimizedThumbnail)
    || normalizeText(news.aiThumbnail)
    || normalizeText(news.image)
    || normalizeText(news.sourceImage)
    || DEFAULT_NEWS_IMAGE;
}

function articleImageCredit(news = {}, featuredImage = "", language = "hi") {
  if (!featuredImage || isCmsUploadedImage(featuredImage)) {
    return "";
  }

  const source = normalizeText(news.imageCredit || news.sourceCredit || news.sourceName || news.feedSourceName);
  if (!source || /^khabri junction(?: desk)?$/i.test(source)) {
    return "";
  }

  return `${language === "hi" ? "\u091b\u0935\u093f \u0938\u094d\u0930\u094b\u0924" : "Image source"}: ${source}`;
}

function stripBodyImages(value = "") {
  return normalizeText(value)
    .replace(/<figure\b[\s\S]*?<\/figure>/gi, " ")
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function validatePublishableNews(news) {
  const details = [];
  const bodyLength = Math.max(
    normalizeText(news.body).length,
    normalizeText(news.bodyHi).length,
    normalizeText(news.bodyEn).length
  );
  const categorySlug = normalizeText(news.categorySlug || toSlug(news.category));
  const districtRequired = categorySlug === "local-news" || Boolean(districtDefinitionFromValue(categorySlug));

  if (bodyLength < 100) {
    details.push("body minimum 100 characters is required");
  }

  if (!normalizeText(news.slug)) {
    details.push("unique slug is required");
  }

  if (!normalizeText(news.category)) {
    details.push("category is required");
  }

  if (districtRequired && !districtDefinitionFromValue(news.city || news.districtHint)) {
    details.push("district is required for local district news");
  }

  if (!normalizeText(news.metaTitle)) {
    details.push("meta title is required");
  }

  if (!normalizeText(news.metaDescription)) {
    details.push("meta description is required");
  }

  if (!normalizeText(news.author)) {
    details.push("author is required");
  }

  if (!parseDateCandidate(news.publishedAt || news.sourcePublishedAt)) {
    details.push("publish date is required");
  }

  if (details.length) {
    throw createValidationError("publish validation failed", details);
  }
}

async function normalizeManagedNews(input, existing = {}, options = {}) {
  const existingId = existing._id || null;
  const prepared = await prepareBilingualNews({
    ...input,
    sourceName: normalizeText(input.sourceName || existing.sourceName || "Khabri Junction Desk")
  }, existing);
  const normalized = normalizeNews(prepared, existing);
  const requestedSlug = normalizeText(input.slug || existing.slug);
  const slug = requestedSlug && requestedSlug === existing.slug
    ? requestedSlug
    : await uniqueSlugAcrossCollections(requestedSlug || normalized.title, normalized.duplicateKey, existingId, newsCollection);
  const managed = {
    ...normalized,
    slug,
    author: normalizeText(input.author || existing.author || normalized.author || "Khabri Junction Desk"),
    views: Number(existing.views || 0),
    clicks: Number(existing.clicks || 0)
  };

  if (options.validatePublish && (managed.status || "pending") === "published") {
    validatePublishableNews(managed);
  }

  return managed;
}

function adHtml(ad) {
  if (!ad || !ad.enabled) {
    return "";
  }

  const title = normalizeText(ad.title || "Advertisement");
  const image = normalizeText(ad.image);
  const linkUrl = normalizeText(ad.linkUrl);
  const caption = title ? `<span class="managed-ad-caption">${escapeHTML(title)}</span>` : "";
  const imageMarkup = image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(title || "Advertisement")}" loading="lazy">` : "";
  const mediaInner = `${caption}${imageMarkup}`;
  const mediaMarkup = mediaInner
    ? (linkUrl
      ? `<a class="managed-ad-media" href="${escapeHTML(linkUrl)}" target="_blank" rel="noopener">${mediaInner}</a>`
      : `<div class="managed-ad-media">${mediaInner}</div>`)
    : "";
  const codeMarkup = ad.adsenseCode ? `<div class="managed-ad-code">${ad.adsenseCode}</div>` : "";

  if (mediaMarkup || codeMarkup) {
    return `<div class="managed-ad-stack">${mediaMarkup}${codeMarkup}</div>`;
  }

  return escapeHTML(title || "Advertisement");
}

async function activeAdsByPosition() {
  if (!adsCollection) {
    return {};
  }

  const ads = await adsCollection.find({ enabled: true }).sort({ updatedAt: -1 }).toArray();
  return ads.reduce((acc, ad) => {
    if (!acc[ad.position]) {
      acc[ad.position] = adHtml(ad);
    }
    return acc;
  }, {});
}

function buildNewsQuery(query) {
  const mongoQuery = {};
  const andConditions = [];

  if (!query.status && !normalizeBoolean(query.all) && !normalizeBoolean(query.includeAll)) {
    mongoQuery.status = "published";
  }

  ["status", "category", "categorySlug", "city", "language"].forEach((field) => {
    if (query[field]) {
      mongoQuery[field] = query[field];
    }
  });

  if (query.district && !mongoQuery.city) {
    mongoQuery.city = districtDefinitionFromValue(query.district)?.slug || toSlug(query.district);
  }

  if (query.section) {
    const section = toSlug(query.section);
    const sectionCategory = categoryFromValue(section);
    const sectionCity = districtDefinitionFromValue(section);

    if (section === "breaking") {
      andConditions.push({ $or: [{ categorySlug: "breaking" }, { breaking: true }] });
    } else if (sectionCity) {
      andConditions.push({ $or: [{ categorySlug: sectionCity.slug }, { city: sectionCity.slug }] });
    } else if (sectionCategory) {
      mongoQuery.categorySlug = sectionCategory.slug;
    }
  }

  if (query.q) {
    const search = normalizeText(query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    andConditions.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
        { tag: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ]
    });
  }

  ["breaking", "featured", "trending", "automated"].forEach((field) => {
    if (query[field] !== undefined) {
      mongoQuery[field] = normalizeBoolean(query[field]);
    }
  });

  if (andConditions.length) {
    mongoQuery.$and = andConditions;
  }

  return mongoQuery;
}

function defaultAutomationSettings() {
  const now = new Date();

  return {
    _id: "automation",
    enabled: normalizeBoolean(process.env.AUTOMATION_ENABLED),
    query: DEFAULT_AUTOMATION_QUERY,
    intervalMinutes: AUTOMATION_INTERVAL_MINUTES,
    updatedAt: now,
    lastRunAt: null,
    lastRunStatus: "never-run",
    lastRunMessage: "",
    nextRunAt: nextScheduledRunDate(AUTOMATION_INTERVAL_MINUTES, now),
    freshnessWindowHours: NEWS_FRESHNESS_HOURS,
    cronHealth: {
      enabled: normalizeBoolean(process.env.AUTOMATION_ENABLED),
      running: false,
      lastStartedAt: null,
      lastCompletedAt: null,
      nextRunAt: nextScheduledRunDate(AUTOMATION_INTERVAL_MINUTES, now),
      lastHeartbeatAt: null
    },
    sourceStats: [],
    failedJobs: [],
    staleRemoved: 0,
    logs: []
  };
}

async function getAutomationSettings() {
  const existing = await settingsCollection.findOne({ _id: "automation" });

  if (existing) {
    return existing;
  }

  const defaults = defaultAutomationSettings();
  await settingsCollection.insertOne(defaults);
  return defaults;
}

function defaultSiteSettings() {
  const now = new Date();

  return {
    _id: "site",
    weather: [
      { city: "Durg", temp: "34°C", condition: "साफ à¤®à¥Œसम", updatedAt: now },
      { city: "Bhilai", temp: "33°C", condition: "à¤¹à¤²à¥à¤•à¥€ à¤—à¤°à¥à¤®à¥€", updatedAt: now },
      { city: "Raipur", temp: "35°C", condition: "à¤§à¥‚प", updatedAt: now }
    ],
    market: [
      { name: "SENSEX", value: "77,958.52", change: "+1.22%" },
      { name: "NIFTY 50", value: "24,330.95", change: "+1.24%" },
      { name: "BANK NIFTY", value: "55,981.05", change: "+2.63%" }
    ],
    cricket: [
      { match: "IPL: CSK vs RCB", score: "RCB 184/6", status: "Innings break" },
      { match: "Ranji Update", score: "CG 248/7", status: "Stumps" },
      { match: "Local League", score: "Durg XI 126/3", status: "Live" }
    ],
    videos: [
      { title: "à¤²à¥‹à¤•ल à¤®à¤¾à¤°à¥à¤•à¥‡à¤Ÿ à¤°à¥€ल वायरल", url: "", type: "Reel", thumbnail: DEFAULT_NEWS_IMAGE },
      { title: "शहर à¤Ÿà¥à¤°à¥ˆà¤«à¤¿à¤• à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤µà¥€à¤¡à¤¿à¤¯à¥‹", url: "", type: "Video", thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop" }
    ],
    ads: {
      header: "",
      sidebar: "",
      inArticle: "",
      footer: ""
    },
    notification: {
      enabled: true,
      title: "à¤¤à¤¾à¤œा à¤–à¤¬à¤°à¥‹à¤‚ à¤•à¥€ à¤¸à¥‚à¤šना à¤ªà¤¾à¤à¤‚",
      description: "Khabri Junction à¤¸à¥‡ à¤²à¥‹à¤•ल à¤¨à¥à¤¯à¥‚à¤œ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤ªà¤¾à¤¨à¥‡ à¤•à¥‡ लिए à¤¨à¥‹à¤Ÿà¤¿à¤«à¤¿à¤•à¥‡शन à¤¸à¤¬à¥à¤¸à¤•à¥à¤°à¤¾à¤‡ब à¤•à¤°à¥‡à¤‚।"
    },
    integrations: {
      weather: {
        enabled: Boolean(WEATHER_API_URL),
        providerUrl: WEATHER_API_URL,
        apiKeyConfigured: Boolean(WEATHER_API_KEY),
        lastSyncAt: null,
        lastError: ""
      },
      market: {
        enabled: Boolean(MARKET_API_URL),
        providerUrl: MARKET_API_URL,
        apiKeyConfigured: Boolean(MARKET_API_KEY),
        lastSyncAt: null,
        lastError: ""
      },
      cricket: {
        enabled: Boolean(CRICKET_API_URL),
        providerUrl: CRICKET_API_URL,
        apiKeyConfigured: Boolean(CRICKET_API_KEY),
        lastSyncAt: null,
        lastError: ""
      },
      firebase: {
        enabled: Boolean(FIREBASE_SERVER_KEY),
        apiKeyConfigured: Boolean(FIREBASE_SERVER_KEY),
        lastSentAt: null,
        lastError: ""
      }
    },
    updatedAt: now
  };
}

async function getSiteSettings() {
  const existing = await settingsCollection.findOne({ _id: "site" });
  const dynamicAds = await activeAdsByPosition();

  if (existing) {
    const defaults = defaultSiteSettings();
    return normalizeSiteSettings({
      ...defaults,
      ...existing,
      ads: { ...defaults.ads, ...(existing.ads || {}), ...dynamicAds },
      notification: { ...defaults.notification, ...(existing.notification || {}) },
      integrations: {
        ...defaults.integrations,
        ...(existing.integrations || {}),
        weather: { ...defaults.integrations.weather, ...(existing.integrations?.weather || {}) },
        market: { ...defaults.integrations.market, ...(existing.integrations?.market || {}) },
        cricket: { ...defaults.integrations.cricket, ...(existing.integrations?.cricket || {}) },
        firebase: { ...defaults.integrations.firebase, ...(existing.integrations?.firebase || {}) }
      }
    });
  }

  const defaults = defaultSiteSettings();
  await settingsCollection.insertOne(defaults);
  return normalizeSiteSettings({ ...defaults, ads: { ...defaults.ads, ...dynamicAds } });
}

function sanitizeIntegrationConfig(type, config = {}) {
  const envDefaults = {
    weather: { providerUrl: WEATHER_API_URL, apiKey: WEATHER_API_KEY },
    market: { providerUrl: MARKET_API_URL, apiKey: MARKET_API_KEY },
    cricket: { providerUrl: CRICKET_API_URL, apiKey: CRICKET_API_KEY },
    firebase: { apiKey: FIREBASE_SERVER_KEY }
  };
  const defaults = envDefaults[type] || {};
  const providerUrl = normalizeText(config.providerUrl || defaults.providerUrl);
  const apiKey = normalizeText(config.apiKey || defaults.apiKey);

  return {
    enabled: config.enabled === undefined ? Boolean(providerUrl || apiKey) : normalizeBoolean(config.enabled),
    providerUrl,
    apiKeyConfigured: Boolean(apiKey),
    apiKey,
    lastSyncAt: config.lastSyncAt || null,
    lastSentAt: config.lastSentAt || null,
    lastError: normalizeText(config.lastError),
    sourceName: normalizeText(config.sourceName || `${type}-api`)
  };
}

function arrayFromPayload(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
}

function normalizeWeatherFeed(payload) {
  return arrayFromPayload(payload, ["items", "data", "weather", "list", "results"])
    .map((item) => ({
      city: normalizeText(item.city || item.name || item.location || item.district),
      temp: normalizeText(item.temp || item.temperature || item.current || item.value),
      condition: normalizeText(item.condition || item.description || item.weather || item.summary),
      updatedAt: new Date()
    }))
    .filter((item) => item.city);
}

function normalizeMarketFeed(payload) {
  return arrayFromPayload(payload, ["items", "data", "market", "list", "results", "quotes"])
    .map((item) => ({
      name: normalizeText(item.name || item.symbol || item.index || item.title),
      value: normalizeText(item.value || item.price || item.last || item.close),
      change: normalizeText(item.change || item.delta || item.percent || item.changePercent)
    }))
    .filter((item) => item.name);
}

function normalizeCricketFeed(payload) {
  return arrayFromPayload(payload, ["items", "data", "matches", "list", "results"])
    .map((item) => ({
      match: normalizeText(item.match || item.name || item.title || `${item.team1 || ""} vs ${item.team2 || ""}`),
      score: normalizeText(item.score || item.summary || item.result || item.statusText),
      status: normalizeText(item.status || item.state || item.note || item.stage)
    }))
    .filter((item) => item.match);
}

async function fetchExternalJson(url, apiKey = "") {
  const headers = { Accept: "application/json" };

  if (apiKey) {
    headers.Authorization = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`integration request failed: ${response.status}`);
  }

  return response.json();
}

async function syncIntegrationData(type, overrides = {}) {
  const current = await getSiteSettings();
  const config = sanitizeIntegrationConfig(type, { ...(current.integrations?.[type] || {}), ...overrides });
  const fieldMap = {
    weather: { field: "weather", normalize: normalizeWeatherFeed },
    market: { field: "market", normalize: normalizeMarketFeed },
    cricket: { field: "cricket", normalize: normalizeCricketFeed }
  };
  const target = fieldMap[type];

  if (!target) {
    throw createValidationError("invalid integration type");
  }

  if (!config.providerUrl) {
    return {
      configured: false,
      items: Array.isArray(current[target.field]) ? current[target.field] : [],
      integration: config
    };
  }

  try {
    const payload = await fetchExternalJson(config.providerUrl, config.apiKey);
    const items = target.normalize(payload).slice(0, 20);
    const integrationUpdate = {
      ...config,
      apiKeyConfigured: config.apiKeyConfigured,
      lastSyncAt: new Date(),
      lastError: ""
    };

    await settingsCollection.updateOne(
      { _id: "site" },
      {
        $set: {
          [target.field]: items.length ? items : current[target.field],
          [`integrations.${type}`]: integrationUpdate,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return { configured: true, items, integration: integrationUpdate };
  } catch (error) {
    const integrationUpdate = {
      ...config,
      lastError: error.message
    };

    await settingsCollection.updateOne(
      { _id: "site" },
      {
        $set: {
          [`integrations.${type}`]: integrationUpdate,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    throw error;
  }
}

function normalizePushSubscriber(input, existing = {}) {
  const token = normalizeText(input.token || existing.token);

  if (!token) {
    throw createValidationError("firebase token is required");
  }

  const now = new Date();
  return {
    token,
    platform: normalizeText(input.platform || existing.platform || "web"),
    language: normalizeText(input.language || existing.language || "hi"),
    district: normalizeText(input.district || existing.district),
    active: input.active === undefined ? existing.active !== false : normalizeBoolean(input.active),
    createdAt: existing.createdAt || now,
    updatedAt: now,
    unsubscribedAt: input.active === false || input.active === "false" ? now : existing.unsubscribedAt || null
  };
}

async function sendFirebaseNotification(payload, filter = {}) {
  if (!pushSubscribersCollection) {
    return { sent: 0, skipped: true, reason: "subscriber collection unavailable" };
  }

  const subscribers = await pushSubscribersCollection.find({ active: true, ...filter }).limit(500).toArray();

  if (!subscribers.length) {
    return { sent: 0, skipped: true, reason: "no subscribers" };
  }

  if (!FIREBASE_SERVER_KEY) {
    return { sent: 0, skipped: true, reason: "FIREBASE_SERVER_KEY missing" };
  }

  const response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: `key=${FIREBASE_SERVER_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      registration_ids: subscribers.map((item) => item.token),
      notification: {
        title: normalizeText(payload.title),
        body: normalizeText(payload.body),
        image: normalizeText(payload.image)
      },
      data: {
        url: normalizeText(payload.url),
        slug: normalizeText(payload.slug),
        category: normalizeText(payload.category),
        district: normalizeText(payload.district)
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`firebase push failed: ${response.status} ${errorText.slice(0, 160)}`);
  }

  const result = await response.json();
  await settingsCollection.updateOne(
    { _id: "site" },
    {
      $set: {
        "integrations.firebase.lastSentAt": new Date(),
        "integrations.firebase.lastError": "",
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  return {
    sent: Number(result.success || 0),
    failed: Number(result.failure || 0),
    total: subscribers.length
  };
}

function buildPublishNotification(news) {
  return {
    title: normalizeText(news.titleHi || news.title || "à¤¤à¤¾à¤œ़ा à¤–बर"),
    body: trimForMeta(news.summaryHi || news.summary || news.metaDescription || "", 110),
    image: primaryNewsImage(news),
    url: `${SITE_URL}${articlePath(news)}`,
    slug: news.slug,
    category: news.category,
    district: news.city
  };
}

async function notifyPublishedArticle(news) {
  try {
    return await sendFirebaseNotification(buildPublishNotification(news));
  } catch (error) {
    await settingsCollection.updateOne(
      { _id: "site" },
      {
        $set: {
          "integrations.firebase.lastError": error.message,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    return { sent: 0, failed: 0, error: error.message };
  }
}

function serializeAutomationSettings(settings) {
  const openAIConfigured = Boolean(OPENAI_API_KEY);
  const staleMissingKeyMessage = openAIConfigured && settings.lastRunStatus === "missing-openai-key";
  const intervalMinutes = Number(settings.intervalMinutes || AUTOMATION_INTERVAL_MINUTES);
  const cronHealth = settings.cronHealth || {};
  const nextRunAt = cronHealth.nextRunAt || settings.nextRunAt || nextScheduledRunDate(intervalMinutes);

  return {
    enabled: Boolean(settings.enabled),
    query: settings.query || DEFAULT_AUTOMATION_QUERY,
    intervalMinutes,
    updatedAt: settings.updatedAt,
    lastRunAt: staleMissingKeyMessage ? null : settings.lastRunAt,
    lastRunStatus: staleMissingKeyMessage ? "ready" : settings.lastRunStatus || "never-run",
    lastRunMessage: staleMissingKeyMessage ? "OpenAI connected. Run automation now or enable schedule." : settings.lastRunMessage || "",
    nextRunAt,
    freshnessWindowHours: Number(settings.freshnessWindowHours || NEWS_FRESHNESS_HOURS),
    localSourceCount: CG_LOCAL_NEWS_SOURCES.length,
    districtSourceCount: DISTRICT_NEWS_SOURCES.length,
    staleRemoved: Number(settings.staleRemoved || 0),
    cronHealth: {
      enabled: Boolean(cronHealth.enabled ?? settings.enabled),
      running: Boolean(cronHealth.running || automationRunning),
      runId: normalizeText(cronHealth.runId),
      runningSince: cronHealth.runningSince || null,
      lastStartedAt: cronHealth.lastStartedAt || null,
      lastCompletedAt: cronHealth.lastCompletedAt || null,
      lastHeartbeatAt: cronHealth.lastHeartbeatAt || null,
      nextRunAt
    },
    sourceStats: Array.isArray(settings.sourceStats) ? settings.sourceStats : [],
    failedJobs: Array.isArray(settings.failedJobs) ? settings.failedJobs : [],
    logs: Array.isArray(settings.logs) ? settings.logs : [],
    running: automationRunning,
    openAIConfigured
  };
}

async function addAutomationLog(type, message, meta = {}) {
  if (!settingsCollection) {
    return;
  }

  await settingsCollection.updateOne(
    { _id: "automation" },
    {
      $push: {
        logs: {
          $each: [
            {
              type,
              message,
              meta,
              createdAt: new Date(),
              createdAtIST: formatIST(new Date())
            }
          ],
          $position: 0,
          $slice: 80
        }
      }
    },
    { upsert: true }
  );
}

function googleNewsUrl(query) {
  const encoded = encodeURIComponent(query || DEFAULT_AUTOMATION_QUERY);
  return `https://news.google.com/rss/search?q=${encoded}&hl=hi&gl=IN&ceid=IN:hi`;
}

function cleanGoogleTitle(title) {
  return normalizeText(title).replace(/\s+-\s+[^-]+$/u, "");
}

function sourceNameFromRssItem(item) {
  const source = item?.source;
  const name = normalizeText(typeof source === "object" ? source["#text"] : source);

  if (name) {
    return name;
  }

  try {
    return new URL(normalizeText(item?.link)).hostname.replace(/^www\./, "");
  } catch (error) {
    return "Google News";
  }
}

function updateSourceStat(sourceStats, sourceName, field, amount = 1) {
  const name = normalizeText(sourceName) || "Google News";
  const current = sourceStats[name] || {
    sourceName: name,
    total: 0,
    fresh: 0,
    stale: 0,
    duplicates: 0,
    nonLocalSkipped: 0,
    generated: 0,
    pending: 0,
    errors: 0
  };

  current[field] = Number(current[field] || 0) + amount;
  sourceStats[name] = current;
  return current;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchGoogleNewsXml(query) {
  let lastError = null;

  for (let attempt = 1; attempt <= RSS_FETCH_RETRY_COUNT; attempt += 1) {
    try {
      const response = await fetch(googleNewsUrl(query), {
        headers: {
          "User-Agent": "KhabriJunctionBot/1.0"
        }
      });

      if (!response.ok) {
        throw new Error(`Google News RSS failed: ${response.status}`);
      }

      return {
        xml: await response.text(),
        attempts: attempt
      };
    } catch (error) {
      lastError = error;

      if (attempt < RSS_FETCH_RETRY_COUNT) {
        await addAutomationLog("retry", `RSS fetch retry ${attempt + 1}/${RSS_FETCH_RETRY_COUNT}`, { error: error.message });
        await sleep(700 * attempt);
      }
    }
  }

  throw lastError || new Error("Google News RSS failed");
}

async function fetchGoogleNewsItems(query, options = {}) {
  const now = options.now || new Date();
  const { xml, attempts } = await fetchGoogleNewsXml(query);
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item || [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  const sourceStats = {};
  const stats = {
    query: query || DEFAULT_AUTOMATION_QUERY,
    sourcePlan: normalizeText(options.sourceName),
    districtHint: normalizeText(options.district),
    priority: Number(options.priority || 9),
    fetchedAt: now,
    fetchedAtIST: formatIST(now),
    attempts,
    total: 0,
    fresh: 0,
    stale: 0,
    invalidDate: 0,
    sources: sourceStats
  };
  const mappedItems = items
    .filter(Boolean)
    .map((item) => {
      const rssSourceName = sourceNameFromRssItem(item);
      const sourceName = rssSourceName && rssSourceName !== "Google News" ? rssSourceName : normalizeText(options.sourceName) || rssSourceName;
      const sourcePublishedAt = findDateCandidate(item);
      const freshness = freshnessInfo(sourcePublishedAt, now);
      const sourceUrl = normalizeText(item.link || item.guid?.["#text"] || item.guid);
      const sourceImage = extractRssImage(item);
      const mapped = {
        sourceTitle: normalizeText(item.title),
        title: cleanGoogleTitle(item.title),
        summary: stripHTML(item.description),
        sourceUrl,
        sourceName,
        feedSourceName: normalizeText(options.sourceName),
        sourcePriority: Number(options.priority || 9),
        districtHint: normalizeText(options.district),
        sourceImage,
        sourcePublishedAt,
        publishedAt: sourcePublishedAt,
        freshnessScore: freshness.score,
        freshnessAgeHours: freshness.ageHours,
        staleReason: freshness.reason,
        isFresh: freshness.isFresh,
        sourceHash: sourceHashFromUrl(sourceUrl)
      };

      if (!mapped.title || !mapped.sourceUrl) {
        return null;
      }

      stats.total += 1;
      updateSourceStat(sourceStats, sourceName, "total");

      if (mapped.isFresh) {
        stats.fresh += 1;
        updateSourceStat(sourceStats, sourceName, "fresh");
      } else {
        stats.stale += 1;
        updateSourceStat(sourceStats, sourceName, "stale");

        if (!mapped.sourcePublishedAt) {
          stats.invalidDate += 1;
        }
      }

      return mapped;
    })
    .filter(Boolean);

  return {
    items: options.includeStale ? mappedItems : mappedItems.filter((item) => item.isFresh),
    allItems: mappedItems,
    stats: {
      ...stats,
      sources: Object.values(sourceStats).sort((a, b) => b.total - a.total)
    }
  };
}

function storyHashForItem(item) {
  const normalizedTitle = slugText(cleanGoogleTitle(item?.title || item?.sourceTitle))
    .replace(/\b(chhattisgarh|cg|news|latest|breaking|live|update|hindi)\b/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalizedTitle ? hashValue(normalizedTitle.slice(0, 180)) : "";
}

function isChhattisgarhRelevant(item) {
  let raw = [
    item?.title,
    item?.sourceTitle,
    item?.summary,
    item?.districtHint
  ].filter(Boolean).join(" ");
  const sourceLabels = [
    item?.sourceName,
    item?.feedSourceName,
    ...CG_LOCAL_NEWS_SOURCES.map((source) => source.name),
    ...DISTRICT_NEWS_SOURCES.map((source) => source.name),
    "Daily Chhattisgarh News",
    "Google News"
  ].filter(Boolean);

  for (const label of sourceLabels) {
    raw = raw.replace(new RegExp(escapeRegExp(label), "gi"), " ");
  }

  const value = slugText(raw);

  return CG_RELEVANCE_TERMS.some((term) => value.includes(term));
}

function mergeSourceStats(target, sourceStats = []) {
  for (const stat of sourceStats) {
    const name = normalizeText(stat.sourceName) || "Google News";
    const current = target[name] || {
      sourceName: name,
      total: 0,
      fresh: 0,
      stale: 0,
      duplicates: 0,
      nonLocalSkipped: 0,
      generated: 0,
      pending: 0,
      errors: 0
    };

    ["total", "fresh", "stale", "duplicates", "nonLocalSkipped", "generated", "pending", "errors"].forEach((field) => {
      current[field] = Number(current[field] || 0) + Number(stat[field] || 0);
    });
    target[name] = current;
  }
}

function dedupeFetchedItems(items = [], sourceStats = {}) {
  const seenSourceHashes = new Set();
  const seenStoryHashes = new Set();
  const deduped = [];

  for (const item of items) {
    const sourceHash = sourceHashForItem(item);
    const storyHash = storyHashForItem(item);

    if ((sourceHash && seenSourceHashes.has(sourceHash)) || (storyHash && seenStoryHashes.has(storyHash))) {
      updateSourceStat(sourceStats, item.sourceName, "duplicates");
      continue;
    }

    if (sourceHash) {
      seenSourceHashes.add(sourceHash);
    }

    if (storyHash) {
      seenStoryHashes.add(storyHash);
    }

    deduped.push({
      ...item,
      storyHash
    });
  }

  return deduped;
}

function balanceItemsBySource(items = [], limit = 8) {
  const sorted = [...items].sort((a, b) => {
    const priorityDiff = Number(a.sourcePriority || 9) - Number(b.sourcePriority || 9);

    if (priorityDiff) {
      return priorityDiff;
    }

    const freshnessDiff = Number(b.freshnessScore || 0) - Number(a.freshnessScore || 0);

    if (freshnessDiff) {
      return freshnessDiff;
    }

    return new Date(b.sourcePublishedAt || 0).getTime() - new Date(a.sourcePublishedAt || 0).getTime();
  });
  const selected = [];
  const perSourceCounts = {};
  const firstPass = [];
  const overflow = [];

  for (const item of sorted) {
    const sourceKey = normalizeText(item.sourceName || item.feedSourceName || "Google News").toLowerCase();
    const count = Number(perSourceCounts[sourceKey] || 0);

    if (count < MAX_ITEMS_PER_SOURCE_PER_RUN) {
      firstPass.push(item);
      perSourceCounts[sourceKey] = count + 1;
    } else {
      overflow.push(item);
    }
  }

  for (const item of firstPass) {
    if (selected.length < limit) {
      selected.push(item);
    }
  }

  for (const item of overflow) {
    if (selected.length < limit) {
      selected.push(item);
    }
  }

  return selected;
}

function localAutomationFeedPlans(settings = {}) {
  const customQuery = normalizeText(settings.query);
  const plans = [
    ...CG_LOCAL_NEWS_SOURCES,
    ...DISTRICT_NEWS_SOURCES
  ];

  if (customQuery && customQuery !== DEFAULT_AUTOMATION_QUERY) {
    plans.push({
      name: "Admin Custom CG Query",
      query: customQuery,
      priority: 3
    });
  }

  return plans;
}

async function fetchAutomationFeedItems(settings, options = {}) {
  const now = options.now || new Date();
  const limit = Number(options.limit || 8);
  const sourceStats = {};
  const failedJobs = [];
  const fetchPlans = async (plans, stage) => {
    const collected = [];

    for (const plan of plans) {
      try {
        const rssResult = await fetchGoogleNewsItems(plan.query, {
          now,
          sourceName: plan.name,
          district: plan.district,
          priority: plan.priority
        });

        const relevantItems = rssResult.items.filter(isChhattisgarhRelevant);
        const nonLocalSkipped = rssResult.items.length - relevantItems.length;
        collected.push(...relevantItems);
        mergeSourceStats(sourceStats, rssResult.stats.sources);
        if (nonLocalSkipped > 0) {
          updateSourceStat(sourceStats, plan.name, "nonLocalSkipped", nonLocalSkipped);
        }

        await addAutomationLog("source-fetched", `${plan.name}: ${relevantItems.length} CG fresh, ${rssResult.stats.stale} stale`, {
          query: plan.query,
          stage,
          total: rssResult.stats.total,
          fresh: rssResult.stats.fresh,
          stale: rssResult.stats.stale,
          nonLocalSkipped
        });
      } catch (error) {
        updateSourceStat(sourceStats, plan.name, "errors");
        failedJobs.push({
          type: "fetch",
          sourceName: plan.name,
          query: plan.query,
          stage,
          attempts: RSS_FETCH_RETRY_COUNT,
          error: error.message,
          createdAt: new Date()
        });
        await addAutomationLog("source-error", `${plan.name} RSS failed`, {
          query: plan.query,
          error: error.message,
          stage
        });
      }
    }

    return collected;
  };

  const localItems = await fetchPlans(localAutomationFeedPlans(settings), "cg-local");
  let deduped = dedupeFetchedItems(localItems, sourceStats);
  let selected = balanceItemsBySource(deduped, limit);
  let usedFallback = false;

  if (selected.length < Math.min(limit, MIN_LOCAL_ITEMS_BEFORE_FALLBACK)) {
    usedFallback = true;
    const fallbackItems = await fetchPlans(NATIONAL_FALLBACK_NEWS_SOURCES, "national-fallback");
    deduped = dedupeFetchedItems([...deduped, ...fallbackItems], sourceStats);
    selected = balanceItemsBySource(deduped, limit);
  }

  return {
    items: selected,
    stats: {
      total: deduped.length,
      fresh: deduped.filter((item) => item.isFresh).length,
      stale: Object.values(sourceStats).reduce((sum, stat) => sum + Number(stat.stale || 0), 0),
      usedFallback,
      sources: Object.values(sourceStats).sort((a, b) => (
        Number(b.fresh || 0) + Number(b.pending || 0) + Number(b.generated || 0)
      ) - (
        Number(a.fresh || 0) + Number(a.pending || 0) + Number(a.generated || 0)
      ))
    },
    failedJobs
  };
}

function parseGeneratedArticle(outputText, fallback) {
  const text = normalizeText(outputText);
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0] || text;

  try {
    const parsed = JSON.parse(jsonText);
    return {
      title: cleanNewsCopyText(parsed.title, { targetLanguage: "hi", sourceName: fallback.sourceName, feedSourceName: fallback.feedSourceName }) || fallback.title,
      summary: cleanNewsCopyText(parsed.summary, { targetLanguage: "hi", sourceName: fallback.sourceName, feedSourceName: fallback.feedSourceName }) || fallback.summary,
      body: cleanNewsCopyText(parsed.body, { targetLanguage: "hi", sourceName: fallback.sourceName, feedSourceName: fallback.feedSourceName }) || fallback.summary,
      category: normalizeText(parsed.category) || fallback.category,
      city: normalizeText(parsed.city) || fallback.city,
      breaking: normalizeBoolean(parsed.breaking)
    };
  } catch (error) {
    return {
      title: cleanNewsCopyText(fallback.title, { targetLanguage: "hi", sourceName: fallback.sourceName, feedSourceName: fallback.feedSourceName }),
      summary: cleanNewsCopyText(fallback.summary, { targetLanguage: "hi", sourceName: fallback.sourceName, feedSourceName: fallback.feedSourceName }),
      body: cleanNewsCopyText(text || fallback.summary, { targetLanguage: "hi", sourceName: fallback.sourceName, feedSourceName: fallback.feedSourceName }),
      category: fallback.category,
      city: fallback.city,
      breaking: false
    };
  }
}

function buildFallbackHindiArticle(item) {
  const category = inferCategory(`${item.title} ${item.summary}`);
  const city = inferCity(`${item.title} ${item.summary}`);
  const sourceTitle = cleanNewsCopyText(item.title || "ताजा खबर", {
    targetLanguage: "hi",
    sourceName: item.sourceName,
    feedSourceName: item.feedSourceName
  });
  const sourceSummary = cleanNewsCopyText(item.summary || item.title || "स्थानीय अपडेट", {
    targetLanguage: "hi",
    sourceName: item.sourceName,
    feedSourceName: item.feedSourceName
  });
  const titlePrefix = city
    ? `${city.charAt(0).toUpperCase()}${city.slice(1)} अपडेट`
    : `${category || "Breaking"} अपडेट`;
  const summaryLine = hasHindiText(sourceSummary)
    ? sourceSummary
    : `${titlePrefix} को लेकर नई जानकारी सामने आई है।`;
  const title = `${titlePrefix}: ${summaryLine.replace(/[।!?].*$/u, "").trim()}`.slice(0, 95);
  const summary = summaryLine.replace(/\s+/g, " ").trim();
  const locationLabel = districtDefinitionFromValue(city)?.label || category || "छत्तीसगढ़";
  const paragraphOne = `${summary} यह मामला ${locationLabel} से जुड़ा है और शुरुआती जानकारी के अनुसार घटनाक्रम ने स्थानीय स्तर पर ध्यान खींचा है।`;
  const paragraphTwo = `घटना कब हुई, किस वजह से सामने आई और इससे कौन-कौन प्रभावित हुआ, इसे लेकर संबंधित पक्षों से जानकारी जुटाई जा रही है।`;
  const paragraphThree = `मौके और हालात से जुड़ी पुष्टि के आधार पर प्रशासनिक तथा आधिकारिक पक्ष सामने आने पर खबर को आगे अपडेट किया जाएगा।`;
  const body = [paragraphOne, paragraphTwo, paragraphThree].filter(Boolean).join("\n\n");

  return {
    title,
    summary,
    body,
    category,
    city,
    breaking: /ब्रेकिंग|ताजा|urgent|breaking/i.test(`${sourceTitle} ${sourceSummary}`)
  };
}

async function generateHindiArticle(item) {
  if (!OPENAI_API_KEY) {
    return buildFallbackHindiArticle(item);
  }

  const category = inferCategory(`${item.title} ${item.summary}`);
  const city = inferCity(`${item.title} ${item.summary}`);
  const prompt = `
Create a Hindi news article for Khabri Junction.

Source headline: ${item.title}
Source summary: ${item.summary || "No summary available"}
Source URL: ${item.sourceUrl}

Rewrite rules:
- Do NOT copy-paste the source headline, source summary, or source wording.
- Create a fresh Hindi headline in Khabri Junction's own style.
- Rewrite the story in original Hindi language while keeping only the verified facts.
- Write in clean professional Hindi newsroom style.
- Follow 5W structure naturally: क्या, कहाँ, कब, कौन, कैसे.
- Do not reuse more than 7 consecutive words from the source text.
- Do not translate word-for-word; paraphrase naturally for local Hindi readers.
- Do not add fake quotes, fake names, fake numbers, or unverified allegations.
- Do not include publisher/source names like ${item.sourceName || "source name"} inside the final headline or body.
- Do not leave HTML entities like &nbsp; in the output.
- Do not include lines like "AI generated", "desk ne sankalit kiya", "available information", or disclaimer-style filler.

Return ONLY valid JSON with:
{
  "title": "Hindi headline",
  "summary": "2 line Hindi summary",
  "body": "Full Hindi news body, 5-7 short paragraphs, neutral and factual",
  "category": "One of: Durg, Bhilai, Raipur, Bilaspur, Sports, Astrology, Politics, Crime, Entertainment, Health, Jobs, Breaking",
  "city": "lowercase city slug if local, else empty string",
  "breaking": true or false
}
If exact details are unavailable, use careful wording and keep the article neutral.
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt,
      max_output_tokens: 1200
    })
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("OpenAI API failed:", {
      status: response.status,
      body: errorText.slice(0, 500)
    });
    await addAutomationLog("openai-fallback", "OpenAI unavailable, fallback article created", {
      status: response.status,
      sourceUrl: item.sourceUrl,
      title: item.title
    });
    return buildFallbackHindiArticle(item);
  }

  const payload = await response.json();
  const outputText = payload.output_text || payload.output?.flatMap((part) => part.content || []).map((part) => part.text || "").join("\n");

  return parseGeneratedArticle(outputText, {
    title: item.title,
    summary: item.summary,
    category,
    city,
    sourceName: item.sourceName,
    feedSourceName: item.feedSourceName
  });
}

async function uniqueArticleSlug(title, sourceHash = "") {
  const baseSlug = toSlug(title);
  const suffix = normalizeText(sourceHash).slice(0, 8) || hashValue(`${baseSlug}:${Date.now()}`).slice(0, 8);
  let candidate = baseSlug;
  let counter = 1;

  while (
    await newsCollection.findOne({ slug: candidate }, { projection: { _id: 1 } }) ||
    (manualNewsCollection && await manualNewsCollection.findOne({ slug: candidate }, { projection: { _id: 1 } }))
  ) {
    candidate = `${baseSlug}-${counter === 1 ? suffix : `${suffix}-${counter}`}`.slice(0, 110);
    counter += 1;
  }

  return candidate;
}

async function saveGeneratedNews(item, article) {
  const sourceHash = sourceHashForItem(item);
  const duplicateKey = sourceHash;
  const storyHash = normalizeText(item.storyHash || storyHashForItem(item));
  const combinedText = `${item.title} ${item.summary} ${article.title} ${article.summary} ${article.body} ${article.category}`;
  const detectedCategory = categoryFromValue(article.category) || categoryFromValue(inferCategory(combinedText));
  const category = detectedCategory?.label || inferCategory(combinedText);
  const city = article.city || inferCity(combinedText);
  const slug = await uniqueArticleSlug(article.title, sourceHash);
  const thumbnailFields = await buildThumbnailFields({
    title: article.title,
    titleHi: article.title,
    category,
    categoryBadge: category,
    city,
    sourceImage: item.sourceImage,
    sourceUrl: item.sourceUrl
  }, {}, { action: item.sourceImage ? "use-source" : "generate-ai" });
  const exists = await newsCollection.findOne({
    $or: [
      ...(sourceHash ? [{ sourceHash }, { duplicateKey: sourceHash }] : []),
      ...(storyHash ? [{ storyHash }] : []),
      { sourceUrl: item.sourceUrl }
    ].filter(Boolean)
  });

  if (exists) {
    return { skipped: true, reason: "exact-source-duplicate", id: String(exists._id) };
  }

  const news = normalizeNews(await prepareBilingualNews({
    title: article.title,
    titleHi: article.title,
    summary: article.summary,
    summaryHi: article.summary,
    body: article.body,
    bodyHi: article.body,
    category,
    city,
    image: thumbnailFields.image,
    sourceImage: thumbnailFields.sourceImage,
    optimizedThumbnail: thumbnailFields.optimizedThumbnail,
    aiThumbnail: thumbnailFields.aiThumbnail,
    thumbnailHash: thumbnailFields.thumbnailHash,
    thumbnailStatus: thumbnailFields.thumbnailStatus,
    slug,
    createdAt: new Date(),
    status: "pending",
    breaking: article.breaking,
    featured: false,
    trending: false,
    language: "hi",
    tag: category,
    sourceUrl: item.sourceUrl,
    sourceTitle: item.sourceTitle,
    sourceName: item.sourceName,
    sourceImage: item.sourceImage,
    feedSourceName: item.feedSourceName,
    sourcePriority: item.sourcePriority,
    districtHint: item.districtHint,
    sourcePublishedAt: item.sourcePublishedAt || item.publishedAt,
    sourceHash,
    storyHash,
    freshnessScore: item.freshnessScore,
    duplicateKey,
    automated: true
  }));
  let result;

  try {
    result = await newsCollection.insertOne(news);
  } catch (error) {
    if (error.code === 11000) {
      return { skipped: true, reason: "duplicate", id: "" };
    }

    throw error;
  }

  return { skipped: false, id: String(result.insertedId) };
}

function emptyAutomationResult(status = "completed") {
  return {
    status,
    fetched: 0,
    fresh: 0,
    stale: 0,
    generated: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    duplicates: 0,
    created: 0,
    skipped: 0,
    staleRemoved: 0,
    sourceStats: [],
    errors: []
  };
}

async function cleanStalePendingArticles(now = new Date()) {
  const cutoff = new Date(now.getTime() - NEWS_FRESHNESS_WINDOW_MS);
  const result = await newsCollection.deleteMany({
    automated: true,
    status: "pending",
    $or: [
      { sourcePublishedAt: { $lt: cutoff } },
      {
        sourcePublishedAt: { $exists: false },
        createdAt: { $lt: cutoff }
      }
    ]
  });

  if (result.deletedCount) {
    await addAutomationLog("stale-removed", `Removed ${result.deletedCount} stale pending articles`, {
      cutoff,
      cutoffIST: formatIST(cutoff)
    });
  }

  return result.deletedCount || 0;
}

function failedJobFromItem(item, error, attempts = 1) {
  return {
    type: "item",
    title: item.title,
    summary: item.summary,
    sourceUrl: item.sourceUrl,
    sourceTitle: item.sourceTitle,
    sourceName: item.sourceName,
    feedSourceName: item.feedSourceName,
    sourcePriority: item.sourcePriority,
    districtHint: item.districtHint,
    sourcePublishedAt: item.sourcePublishedAt || item.publishedAt,
    sourceHash: sourceHashForItem(item),
    storyHash: item.storyHash || storyHashForItem(item),
    freshnessScore: item.freshnessScore,
    attempts,
    error: normalizeText(error?.message || error),
    createdAt: new Date()
  };
}

function freshFailedJobs(jobs = [], now = new Date()) {
  return (Array.isArray(jobs) ? jobs : []).filter((job) => {
    const publishedAt = parseDateCandidate(job.sourcePublishedAt);
    return job.type === "fetch" || freshnessInfo(publishedAt, now).isFresh;
  }).slice(0, 25);
}

function itemFromFailedJob(job) {
  return {
    sourceTitle: normalizeText(job.sourceTitle || job.title),
    title: cleanGoogleTitle(job.title),
    summary: normalizeText(job.summary),
    sourceUrl: normalizeText(job.sourceUrl),
    sourceName: normalizeText(job.sourceName),
    sourceImage: normalizeText(job.sourceImage),
    feedSourceName: normalizeText(job.feedSourceName),
    sourcePriority: Number(job.sourcePriority || 9),
    districtHint: normalizeText(job.districtHint),
    sourcePublishedAt: parseDateCandidate(job.sourcePublishedAt),
    publishedAt: parseDateCandidate(job.sourcePublishedAt),
    freshnessScore: Number(job.freshnessScore || 0),
    sourceHash: normalizeText(job.sourceHash) || sourceHashFromUrl(job.sourceUrl),
    storyHash: normalizeText(job.storyHash),
    isFresh: true
  };
}

function automationMessage(result) {
  if (result.status === "openai-quota-error") {
    return "OpenAI quota or billing error. Cron remains enabled; fresh articles will stay pending after API credits are available.";
  }

  if (result.status === "missing-openai-key") {
    return "OPENAI_API_KEY is missing. Add it in .env and restart the server.";
  }

  return `Fresh ${result.fresh}, stale ${result.stale}, generated ${result.generated}, pending ${result.pending}, duplicates ${result.duplicates}, errors ${result.errors.length}`;
}

async function runNewsAutomation({ force = false, limit = 8, retryFailed = false } = {}) {
  const settings = await getAutomationSettings();
  const now = new Date();
  const staleRunningSince = parseDateCandidate(settings.cronHealth?.runningSince);

  if (automationRunning && staleRunningSince && now.getTime() - staleRunningSince.getTime() > AUTOMATION_STUCK_MS) {
    automationRunning = false;
    await addAutomationLog("cron-health", "Automation lock reset after timeout", { runningSince: staleRunningSince });
  }

  if (automationRunning) {
    return {
      ...emptyAutomationResult("running"),
      errors: ["Automation is already running."]
    };
  }

  const staleRemoved = await cleanStalePendingArticles(now);

  if (!settings.enabled && !force) {
    const nextRunAt = nextScheduledRunDate(Number(settings.intervalMinutes || AUTOMATION_INTERVAL_MINUTES), now);
    await settingsCollection.updateOne(
      { _id: "automation" },
      {
        $set: {
          staleRemoved,
          nextRunAt,
          "cronHealth.enabled": false,
          "cronHealth.running": false,
          "cronHealth.nextRunAt": nextRunAt
        }
      }
    );

    return {
      ...emptyAutomationResult("disabled"),
      staleRemoved
    };
  }

  if (!OPENAI_API_KEY) {
    await addAutomationLog("openai-fallback", "OPENAI_API_KEY missing. Automation will save fallback Hindi copies to pending review.", {
      ranAt: now
    });
  }

  automationRunning = true;
  const runId = hashValue(`${now.toISOString()}:${Math.random()}`).slice(0, 12);
  const intervalMinutes = Number(settings.intervalMinutes || AUTOMATION_INTERVAL_MINUTES);
  const nextRunAt = nextScheduledRunDate(intervalMinutes, now);
  const result = {
    ...emptyAutomationResult("completed"),
    staleRemoved
  };
  const sourceStats = {};
  const failedJobs = [];

  await settingsCollection.updateOne(
    { _id: "automation" },
    {
      $set: {
        lastRunStatus: "running",
        lastRunMessage: "Automation running. Fresh RSS articles are being checked.",
        lastCronStartedAt: now,
        nextRunAt,
        staleRemoved,
        cronHealth: {
          enabled: Boolean(settings.enabled),
          running: true,
          runId,
          runningSince: now,
          lastStartedAt: now,
          lastHeartbeatAt: now,
          nextRunAt
        }
      }
    }
  );
  await addAutomationLog("cron-start", `Automation started at ${formatIST(now)} IST`, { runId, retryFailed });

  try {
    let items = [];
    let shouldFetchRss = !retryFailed;

    if (retryFailed) {
      const retryJobs = freshFailedJobs(settings.failedJobs, now);
      const hasFetchRetry = retryJobs.some((job) => job.type === "fetch");
      items = retryJobs
        .filter((job) => job.type === "item")
        .map(itemFromFailedJob)
        .filter((item) => item.title && item.sourceUrl)
        .slice(0, limit);
      result.fresh = items.length;
      result.fetched = items.length;
      shouldFetchRss = !items.length && hasFetchRetry;
      await addAutomationLog("retry", `Loaded ${items.length} failed item jobs for retry`, { runId, fetchRetry: hasFetchRetry });
    }

    if (shouldFetchRss) {
      const rssResult = await fetchAutomationFeedItems(settings, { now, limit });
      items = rssResult.items;
      result.fetched = items.length;
      result.fresh = rssResult.stats.fresh;
      result.stale = rssResult.stats.stale;
      failedJobs.push(...rssResult.failedJobs);

      for (const stat of rssResult.stats.sources) {
        sourceStats[stat.sourceName] = { ...stat };
      }

      await addAutomationLog("fetched", `Fetched ${items.length} balanced fresh CG/local RSS items`, {
        localFirst: true,
        fallbackUsed: rssResult.stats.usedFallback,
        total: rssResult.stats.total,
        stale: rssResult.stats.stale,
        runId
      });
    }

    for (const item of items) {
      const freshness = freshnessInfo(item.sourcePublishedAt || item.publishedAt, now);
      const statName = item.sourceName || "Google News";

      if (!freshness.isFresh) {
        result.skipped += 1;
        result.stale += 1;
        updateSourceStat(sourceStats, statName, "stale");
        await addAutomationLog("stale-skipped", `Stale RSS skipped: ${item.title}`, {
          reason: freshness.reason,
          sourcePublishedAt: item.sourcePublishedAt,
          runId
        });
        continue;
      }

      item.freshnessScore = item.freshnessScore || freshness.score;

      try {
        const sourceHash = sourceHashForItem(item);
        const exists = await newsCollection.findOne({
          $or: [
            ...(sourceHash ? [{ sourceHash }, { duplicateKey: sourceHash }] : []),
            ...(item.storyHash ? [{ storyHash: item.storyHash }] : []),
            { sourceUrl: item.sourceUrl }
          ].filter(Boolean)
        });

        if (exists) {
          result.skipped += 1;
          result.duplicates += 1;
          updateSourceStat(sourceStats, statName, "duplicates");
          await addAutomationLog("duplicate-skipped", `Exact source duplicate skipped: ${item.title}`, {
            sourceUrl: item.sourceUrl,
            sourceHash,
            runId
          });
          continue;
        }

        if (!item.sourceImage) {
          item.sourceImage = await fetchSourceImageFromPage(item.sourceUrl);
        }

        const article = await generateHindiArticle(item);
        result.generated += 1;
        updateSourceStat(sourceStats, statName, "generated");
        await addAutomationLog("generated", `Generated Hindi article: ${article.title}`, {
          sourceUrl: item.sourceUrl,
          freshnessScore: item.freshnessScore,
          runId
        });
        const saved = await saveGeneratedNews(item, article);

        if (saved.skipped) {
          result.skipped += 1;
          result.duplicates += 1;
          updateSourceStat(sourceStats, statName, "duplicates");
          await addAutomationLog("duplicate-skipped", `Exact source duplicate skipped after generation: ${article.title}`, {
            sourceUrl: item.sourceUrl,
            runId
          });
        } else {
          result.created += 1;
          result.pending += 1;
          updateSourceStat(sourceStats, statName, "pending");
          await addAutomationLog("pending", `Saved pending article: ${article.title}`, {
            id: saved.id,
            sourcePublishedAt: item.sourcePublishedAt,
            freshnessScore: item.freshnessScore,
            runId
          });
        }
      } catch (error) {
        result.errors.push(`${item.title}: ${error.message}`);
        updateSourceStat(sourceStats, statName, "errors");
        failedJobs.push(failedJobFromItem(item, error));
        await addAutomationLog("error", `Automation error: ${item.title}`, {
          error: error.message,
          runId
        });
      }

      await settingsCollection.updateOne(
        { _id: "automation" },
        {
          $set: {
            "cronHealth.lastHeartbeatAt": new Date()
          }
        }
      );
    }

    const quotaError = result.errors.some((message) => /429|quota|billing/i.test(message));

    if (quotaError) {
      result.status = "openai-quota-error";
    } else if (result.errors.length) {
      result.status = "completed-with-errors";
    }
  } catch (error) {
    result.status = "failed";
    result.errors.push(error.message);
    failedJobs.push({
      type: "fetch",
      query: settings.query,
      attempts: RSS_FETCH_RETRY_COUNT,
      error: error.message,
      createdAt: new Date()
    });
    await addAutomationLog("error", "RSS fetch failed", { error: error.message, runId });
  } finally {
    automationRunning = false;
  }

  const completedAt = new Date();
  const nextScheduled = nextScheduledRunDate(intervalMinutes, completedAt);
  const sourceStatsList = Object.values(sourceStats).sort((a, b) => (b.fresh + b.generated + b.pending) - (a.fresh + a.generated + a.pending));
  const retainedFailedJobs = freshFailedJobs(failedJobs, completedAt);

  result.sourceStats = sourceStatsList;

  await settingsCollection.updateOne(
    { _id: "automation" },
    {
      $set: {
        enabled: settings.enabled,
        intervalMinutes,
        freshnessWindowHours: NEWS_FRESHNESS_HOURS,
        lastRunAt: completedAt,
        lastRunStatus: result.status,
        lastRunMessage: automationMessage(result),
        nextRunAt: nextScheduled,
        staleRemoved,
        sourceStats: sourceStatsList,
        failedJobs: retainedFailedJobs,
        cronHealth: {
          enabled: Boolean(settings.enabled),
          running: false,
          runId,
          runningSince: null,
          lastStartedAt: now,
          lastCompletedAt: completedAt,
          lastHeartbeatAt: completedAt,
          nextRunAt: nextScheduled
        }
      }
    }
  );

  await addAutomationLog("cron-complete", `Automation finished: ${automationMessage(result)}`, {
    runId,
    completedAtIST: formatIST(completedAt),
    nextRunAt: nextScheduled
  });

  return result;
}

function startAutomationCron() {
  if (automationTask) {
    automationTask.stop();
  }

  automationTask = cron.schedule(AUTOMATION_CRON_EXPRESSION, () => {
    runNewsAutomation().catch((error) => console.error("Automation run failed:", error.message));
  });
}

async function findRelatedNews(news, limit = 4) {
  const conditions = [];

  if (news.categorySlug) {
    conditions.push({ categorySlug: news.categorySlug });
  }

  if (news.city) {
    conditions.push({ city: news.city });
  }

  if (!conditions.length) {
    conditions.push({ breaking: true });
  }

  const aiNews = await newsCollection
    .find({
      _id: { $ne: news._id },
      status: "published",
      $or: conditions
    })
    .sort({ featured: -1, trending: -1, breaking: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
  const manualNews = manualNewsCollection ? await manualNewsCollection
    .find({
      _id: { $ne: news._id },
      status: "published",
      $or: conditions
    })
    .sort({ featured: -1, trending: -1, breaking: -1, publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray() : [];

  return [...manualNews, ...aiNews].slice(0, limit);
}

async function getCombinedPublishedNews(query = {}, limit = 24) {
  const mongoQuery = buildNewsQuery(query);
  const manualQuery = { ...mongoQuery };
  const shouldIncludeManual = !normalizeBoolean(query.all) && !normalizeBoolean(query.includeAll) && query.includeManual !== "false";

  if (!shouldIncludeManual || !manualNewsCollection) {
    return newsCollection
      .find(mongoQuery)
      .sort({ featured: -1, trending: -1, breaking: -1, publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  manualQuery.status = query.status || "published";
  const manualLimit = Math.ceil(limit * 0.65);
  const aiLimit = limit;
  const [manualNews, aiNews] = await Promise.all([
    manualNewsCollection
      .find(manualQuery)
      .sort({ featured: -1, trending: -1, breaking: -1, publishedAt: -1, createdAt: -1 })
      .limit(manualLimit)
      .toArray(),
    newsCollection
      .find(mongoQuery)
      .sort({ featured: -1, trending: -1, breaking: -1, publishedAt: -1, createdAt: -1 })
      .limit(aiLimit)
      .toArray()
  ]);

  return [...manualNews, ...aiNews].slice(0, limit);
}

async function findNewsRecordById(id, source = "") {
  const _id = parseObjectId(id);

  if (source === "manual") {
    return manualNewsCollection.findOne({ _id });
  }

  if (source === "ai") {
    return newsCollection.findOne({ _id });
  }

  return (manualNewsCollection && await manualNewsCollection.findOne({ _id })) ||
    await newsCollection.findOne({ _id });
}

async function getTrendingNews(limit = 12) {
  const analytics = newsAnalyticsCollection
    ? await newsAnalyticsCollection.find({})
      .sort({ views: -1, clicks: -1, updatedAt: -1 })
      .limit(limit * 4)
      .toArray()
    : [];
  const manualIds = analytics
    .filter((item) => item.source === "manual" && ObjectId.isValid(item.articleId))
    .map((item) => new ObjectId(item.articleId));
  const aiIds = analytics
    .filter((item) => item.source !== "manual" && ObjectId.isValid(item.articleId))
    .map((item) => new ObjectId(item.articleId));
  const [manualDocs, aiDocs] = await Promise.all([
    manualIds.length ? manualNewsCollection.find({ _id: { $in: manualIds }, status: "published" }).toArray() : [],
    aiIds.length ? newsCollection.find({ _id: { $in: aiIds }, status: "published" }).toArray() : []
  ]);
  const byKey = new Map();
  [...manualDocs, ...aiDocs].forEach((item) => byKey.set(String(item._id), item));
  const ordered = analytics.map((item) => byKey.get(item.articleId)).filter(Boolean);

  if (ordered.length >= limit) {
    return ordered.slice(0, limit);
  }

  const fallback = await getCombinedPublishedNews({ trending: true, status: "published" }, limit);
  const combined = [...ordered];

  for (const item of fallback) {
    if (!combined.find((current) => String(current._id) === String(item._id))) {
      combined.push(item);
    }
  }

  return combined.slice(0, limit);
}

async function findPublishedArticleBySlug(slug, category = "") {
  const categorySlug = category ? toSlug(category) : "";
  const categoryFilter = categorySlug
    ? { $or: [{ categorySlug }, { city: categorySlug }] }
    : {};
  const query = { slug, status: "published", ...categoryFilter };

  return (manualNewsCollection && await manualNewsCollection.findOne(query)) ||
    await newsCollection.findOne(query);
}

async function incrementAnalytics(news, type = "view") {
  if (!newsAnalyticsCollection || !news?._id) {
    return;
  }

  const source = news.contentSource || (news.automated ? "ai" : "manual");
  const field = type === "click" ? "clicks" : "views";
  await newsAnalyticsCollection.updateOne(
    { articleId: String(news._id), source },
    {
      $setOnInsert: {
        articleId: String(news._id),
        source,
        slug: news.slug,
        title: news.title,
        category: news.category,
        createdAt: new Date()
      },
      $inc: { [field]: 1 },
      $set: { updatedAt: new Date() }
    },
    { upsert: true }
  );

  const collection = source === "manual" ? manualNewsCollection : newsCollection;
  await collection.updateOne({ _id: news._id }, { $inc: { [field]: 1 }, $set: { analyticsUpdatedAt: new Date() } });
}

async function backfillNewsMetadata() {
  const docs = await newsCollection
    .find({
      $or: [
        { categorySlug: { $exists: false } },
        { categoryPage: { $exists: false } },
        { categoryBadge: { $exists: false } },
        { slug: { $exists: false } },
        { metaTitle: { $exists: false } },
        { titleEn: { $exists: false } },
        { summaryEn: { $exists: false } },
        { bodyEn: { $exists: false } },
        { summaryHi: { $exists: false } },
        { bodyHi: { $exists: false } }
      ]
    })
    .limit(500)
    .toArray();

  for (const doc of docs) {
    const prepared = normalizeNews(
      await prepareBilingualNews({
        ...doc,
        slug: doc.slug || `${toSlug(doc.title)}-${String(doc._id).slice(-6)}`
      }, doc),
      doc
    );

    await newsCollection.updateOne(
      { _id: doc._id },
      {
        $set: {
          category: prepared.category,
          categorySlug: prepared.categorySlug,
          categoryPage: prepared.categoryPage,
          categoryBadge: prepared.categoryBadge,
          city: prepared.city,
          image: prepared.image,
          titleEn: prepared.titleEn,
          summaryEn: prepared.summaryEn,
          bodyEn: prepared.bodyEn,
          titleHi: prepared.titleHi,
          summaryHi: prepared.summaryHi,
          bodyHi: prepared.bodyHi,
          slug: prepared.slug,
          metaTitle: prepared.metaTitle,
          metaDescription: prepared.metaDescription,
          ogTitle: prepared.ogTitle,
          ogDescription: prepared.ogDescription,
          schemaType: prepared.schemaType,
          keywords: prepared.keywords,
          translationStatus: prepared.translationStatus,
          translationError: prepared.translationError,
          trending: prepared.trending,
          publishedAt: prepared.publishedAt
        }
      }
    );
  }
}

async function repairNewsLocalization(limit = 40) {
  const docs = await newsCollection
    .find({ automated: true })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
  let updated = 0;

  for (const doc of docs) {
    if (!needsLocalizationRepair(doc)) {
      continue;
    }

    let nextInput = { ...doc };

    if (looksCopiedFromSource(`${doc.titleHi || ""} ${doc.summaryHi || ""}`, `${doc.sourceTitle || ""} ${doc.summary || ""}`)) {
      const regenerated = await generateHindiArticle({
        title: doc.sourceTitle || doc.title || doc.titleHi,
        summary: doc.summaryHi || doc.summary || doc.sourceTitle,
        sourceUrl: doc.sourceUrl,
        sourceName: doc.sourceName,
        feedSourceName: doc.feedSourceName,
        districtHint: doc.districtHint,
        sourceImage: doc.sourceImage,
        sourcePublishedAt: doc.sourcePublishedAt
      });

      nextInput = {
        ...nextInput,
        title: regenerated.title,
        titleHi: regenerated.title,
        summary: regenerated.summary,
        summaryHi: regenerated.summary,
        body: regenerated.body,
        bodyHi: regenerated.body,
        category: regenerated.category || doc.category,
        city: regenerated.city || doc.city,
        breaking: regenerated.breaking ?? doc.breaking,
        language: "hi"
      };
    }

    const prepared = normalizeNews(await prepareBilingualNews(nextInput, doc), doc);
    await newsCollection.updateOne(
      { _id: doc._id },
      {
        $set: {
          title: prepared.title,
          summary: prepared.summary,
          body: prepared.body,
          titleEn: prepared.titleEn,
          summaryEn: prepared.summaryEn,
          bodyEn: prepared.bodyEn,
          titleHi: prepared.titleHi,
          summaryHi: prepared.summaryHi,
          bodyHi: prepared.bodyHi,
          translationStatus: prepared.translationStatus,
          translationError: prepared.translationError,
          category: prepared.category,
          categorySlug: prepared.categorySlug,
          categoryPage: prepared.categoryPage,
          categoryBadge: prepared.categoryBadge,
          city: prepared.city,
          tag: prepared.tag,
          metaTitle: prepared.metaTitle,
          metaDescription: prepared.metaDescription,
          ogTitle: prepared.ogTitle,
          ogDescription: prepared.ogDescription,
          keywords: prepared.keywords,
          updatedAt: new Date()
        }
      }
    );
    updated += 1;
  }

  return updated;
}

async function backfillNewsThumbnails() {
  const docs = await newsCollection
    .find({
      $or: [
        { sourceImage: { $exists: false } },
        { thumbnailStatus: { $exists: false } },
        { thumbnailHash: { $exists: false } },
        {
          $and: [
            { optimizedThumbnail: { $exists: false } },
            { aiThumbnail: { $exists: false } }
          ]
        }
      ]
    })
    .limit(1000)
    .toArray();

  let updated = 0;

  for (const doc of docs) {
    try {
      const prepared = normalizeNews({
        ...doc,
        slug: doc.slug || `${toSlug(doc.title || doc.titleEn || doc.titleHi || "news")}-${String(doc._id).slice(-6)}`,
        sourceImage: preferredSourceImage(doc, doc)
      }, doc);
      const sourceImage = preferredSourceImage(prepared, doc);
      const thumbnailFields = await buildThumbnailFields(
        {
          ...prepared,
          sourceImage
        },
        doc,
        {
          action: sourceImage ? "use-source" : "backfill",
          allowAi: false,
          force: true
        }
      );
      const update = {
        image: thumbnailFields.image,
        thumbnailHash: thumbnailFields.thumbnailHash,
        thumbnailStatus: thumbnailFields.thumbnailStatus,
        updatedAt: new Date()
      };

      if (thumbnailFields.sourceImage) {
        update.sourceImage = thumbnailFields.sourceImage;
      }

      if (thumbnailFields.optimizedThumbnail) {
        update.optimizedThumbnail = thumbnailFields.optimizedThumbnail;
      }

      if (thumbnailFields.aiThumbnail) {
        update.aiThumbnail = thumbnailFields.aiThumbnail;
      }

      await newsCollection.updateOne({ _id: doc._id }, { $set: update });
      updated += 1;
    } catch (error) {
      console.warn(`Thumbnail backfill skipped for ${doc._id}: ${error.message}`);
    }
  }

  return updated;
}

function requestedLanguage(req) {
  return req?.query?.lang === "en" ? "en" : "hi";
}

function localizedValue(news, field, language) {
  const sourceLanguage = sourceLanguageForNews(news);
  const fallback = normalizeText(news[field] || news[`${field}Hi`] || news[`${field}En`] || "");

  if (language === "hi") {
    return normalizeText(news[`${field}Hi`] || (sourceLanguage === "hi" ? news[field] : "") || fallback);
  }

  return normalizeText(news[`${field}En`] || (sourceLanguage === "en" ? news[field] : "") || fallback);
}

function localizedNews(news, language) {
  return {
    ...news,
    displayLanguage: language,
    title: localizedValue(news, "title", language),
    summary: localizedValue(news, "summary", language),
    body: localizedValue(news, "body", language),
    metaTitle: language === "hi" ? `${localizedValue(news, "title", language)} | Khabri Junction` : news.metaTitle,
    metaDescription: language === "hi" ? trimForMeta(localizedValue(news, "summary", language)) : news.metaDescription,
    ogTitle: language === "hi" ? localizedValue(news, "title", language) : news.ogTitle,
    ogDescription: language === "hi" ? localizedValue(news, "summary", language) : news.ogDescription
  };
}

function renderNewsSchema(news, related, req) {
  const url = articleUrl(news, req);
  const image = articleFeaturedImage(news);
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.metaDescription || news.summary,
    image: [image],
    datePublished: news.publishedAt || news.createdAt,
    dateModified: news.updatedAt || news.createdAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    },
    author: {
      "@type": "Person",
      name: "Khabri Junction Desk",
      image: `${publicBaseUrl(req)}/assets/logo-kj.png`
    },
    publisher: {
      "@type": "Organization",
      name: "Khabri Junction",
      logo: {
        "@type": "ImageObject",
        url: `${publicBaseUrl(req)}/assets/logo-kj.png`
      }
    },
    articleSection: news.category,
    keywords: news.keywords,
    thumbnailUrl: image,
    creditText: articleImageCredit(news, image, "en") || "Khabri Junction Desk",
    isPartOf: {
      "@type": "NewsMediaOrganization",
      name: "Khabri Junction"
    }
  };

  if (related.length) {
    schema.relatedLink = related.map((item) => articleUrl(item, req));
  }

  return JSON.stringify(schema);
}

function articlePageLabels(language) {
  if (language === "en") {
    return {
      home: "Home",
      news: "News",
      published: "Published",
      updated: "Updated",
      source: "Source",
      author: "Author",
      category: "Category",
      district: "District",
      tags: "Tags",
      related: "Related News",
      noRelated: "No related news yet."
    };
  }

  return {
    home: "\u0939\u094b\u092e",
    news: "\u0916\u092c\u0930",
    published: "\u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924",
    updated: "\u0905\u092a\u0921\u0947\u091f",
    source: "\u0938\u094d\u0930\u094b\u0924",
    author: "\u0932\u0947\u0916\u0915",
    category: "\u0936\u094d\u0930\u0947\u0923\u0940",
    district: "\u091c\u093f\u0932\u093e",
    tags: "\u091f\u0948\u0917",
    related: "\u0938\u0902\u092c\u0902\u0927\u093f\u0924 \u0916\u092c\u0930\u0947\u0902",
    noRelated: "\u0905\u092d\u0940 \u0938\u0902\u092c\u0902\u0927\u093f\u0924 \u0916\u092c\u0930\u0947\u0902 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0902\u0964"
  };
}

const HINDI_DISTRICT_LABELS = {
  Durg: "\u0926\u0941\u0930\u094d\u0917",
  Bhilai: "\u092d\u093f\u0932\u093e\u0908",
  Raipur: "\u0930\u093e\u092f\u092a\u0941\u0930",
  Bilaspur: "\u092c\u093f\u0932\u093e\u0938\u092a\u0941\u0930",
  Balod: "\u092c\u093e\u0932\u094b\u0926",
  "Baloda Bazar-Bhatapara": "\u092c\u0932\u094c\u0926\u093e \u092c\u093e\u091c\u093e\u0930-\u092d\u093e\u091f\u093e\u092a\u093e\u0930\u093e",
  "Balrampur-Ramanujganj": "\u092c\u0932\u0930\u093e\u092e\u092a\u0941\u0930-\u0930\u093e\u092e\u093e\u0928\u0941\u091c\u0917\u0902\u091c",
  Bastar: "\u092c\u0938\u094d\u0924\u0930",
  Bemetara: "\u092c\u0947\u092e\u0947\u0924\u0930\u093e",
  Bijapur: "\u092c\u0940\u091c\u093e\u092a\u0941\u0930",
  Dantewada: "\u0926\u0902\u0924\u0947\u0935\u093e\u0921\u093c\u093e",
  Dhamtari: "\u0927\u092e\u0924\u0930\u0940",
  Gariaband: "\u0917\u0930\u093f\u092f\u093e\u092c\u0902\u0926",
  "Gaurela-Pendra-Marwahi": "\u0917\u094c\u0930\u0947\u0932\u093e-\u092a\u0947\u0902\u0921\u094d\u0930\u093e-\u092e\u0930\u0935\u093e\u0939\u0940",
  "Janjgir-Champa": "\u091c\u093e\u0902\u091c\u0917\u0940\u0930-\u091a\u093e\u0902\u092a\u093e",
  Jashpur: "\u091c\u0936\u092a\u0941\u0930",
  Kanker: "\u0915\u093e\u0902\u0915\u0947\u0930",
  "Kawardha / Kabirdham": "\u0915\u0935\u0930\u094d\u0927\u093e",
  "Khairagarh-Chhuikhadan-Gandai": "\u0916\u0948\u0930\u093e\u0917\u0922\u093c",
  Kondagaon: "\u0915\u094b\u0902\u0921\u093e\u0917\u093e\u0902\u0935",
  Rajnandgaon: "\u0930\u093e\u091c\u0928\u093e\u0902\u0926\u0917\u093e\u0902\u0935",
  Korba: "\u0915\u094b\u0930\u092c\u093e",
  Korea: "\u0915\u094b\u0930\u093f\u092f\u093e",
  Mahasamund: "\u092e\u0939\u093e\u0938\u092e\u0941\u0902\u0926",
  "Manendragarh-Chirmiri-Bharatpur": "\u092e\u0928\u0947\u0902\u0926\u094d\u0930\u0917\u0922\u093c-\u091a\u093f\u0930\u092e\u093f\u0930\u0940-\u092d\u0930\u0924\u092a\u0941\u0930",
  "Mohla-Manpur-Ambagarh Chowki": "\u092e\u094b\u0939\u0932\u093e-\u092e\u093e\u0928\u092a\u0941\u0930-\u0905\u0902\u092c\u093e\u0917\u0922\u093c \u091a\u094c\u0915\u0940",
  Mungeli: "\u092e\u0941\u0902\u0917\u0947\u0932\u0940",
  Narayanpur: "\u0928\u093e\u0930\u093e\u092f\u0923\u092a\u0941\u0930",
  Raigarh: "\u0930\u093e\u092f\u0917\u0922\u093c",
  Sakti: "\u0938\u0915\u094d\u0924\u0940",
  "Sarangarh-Bilaigarh": "\u0938\u093e\u0930\u0902\u0917\u0922\u093c-\u092c\u093f\u0932\u093e\u0908\u0917\u0922\u093c",
  Sukma: "\u0938\u0941\u0915\u092e\u093e",
  Surajpur: "\u0938\u0942\u0930\u091c\u092a\u0941\u0930",
  Jagdalpur: "\u091c\u0917\u0926\u0932\u092a\u0941\u0930",
  Ambikapur: "\u0905\u0902\u092c\u093f\u0915\u093e\u092a\u0941\u0930",
  Surguja: "\u0938\u0930\u0917\u0941\u091c\u093e",
  Bastar: "\u092c\u0938\u094d\u0924\u0930"
};

const TOP_DISTRICT_NAV_SLUGS = [
  "raipur",
  "durg",
  "bhilai",
  "bilaspur",
  "korba",
  "rajnandgaon",
  "raigarh",
  "bastar",
  "surguja",
  "kabirdham",
  "khairagarh-chhuikhadan-gandai"
];

const TOP_DISTRICT_NAV_LABELS = {
  bastar: { hi: "\u091c\u0917\u0926\u0932\u092a\u0941\u0930", en: "Jagdalpur" },
  surguja: { hi: "\u0905\u0902\u092c\u093f\u0915\u093e\u092a\u0941\u0930", en: "Ambikapur" },
  kabirdham: { hi: "\u0915\u0935\u0930\u094d\u0927\u093e", en: "Kawardha" },
  "khairagarh-chhuikhadan-gandai": { hi: "\u0916\u0948\u0930\u093e\u0917\u0922\u093c", en: "Khairagarh" }
};

function districtNavLabel(district, language = "hi") {
  if (!district) {
    return "";
  }

  if (language === "hi") {
    return HINDI_DISTRICT_LABELS[district.label] || district.label;
  }

  return district.label;
}

function portalHeaderNav(language = "hi", activeDistrictSlug = "") {
  const activeSlug = normalizeText(activeDistrictSlug);
  const topDistricts = TOP_DISTRICT_NAV_SLUGS
    .map((slug) => districtDefinitionFromValue(slug))
    .filter(Boolean);
  const dropdownDistricts = CITY_DEFINITIONS.filter((district) => district.slug !== "bhilai");
  const homeLabel = language === "hi" ? "\u0939\u094b\u092e" : "Home";
  const allLabel = language === "hi" ? "\u0938\u092d\u0940 \u091c\u093f\u0932\u0947" : "All Districts";
  const topLinks = topDistricts.map((district) => {
    const active = district.slug === activeSlug ? " active" : "";
    const labelOverride = TOP_DISTRICT_NAV_LABELS[district.slug]?.[language];
    return `<a class="portal-nav-link${active}" href="${districtRoutePath(district.slug)}">${escapeHTML(labelOverride || districtNavLabel(district, language))}</a>`;
  }).join("");
  const dropdownLinks = dropdownDistricts.map((district) => {
    const active = district.slug === activeSlug ? " active" : "";
    return `<a class="${active.trim()}" href="${districtRoutePath(district.slug)}">${escapeHTML(districtNavLabel(district, language))}</a>`;
  }).join("");

  return `<nav class="portal-main-nav" aria-label="${language === "hi" ? "\u091c\u093f\u0932\u093e \u0928\u0947\u0935\u093f\u0917\u0947\u0936\u0928" : "District navigation"}">
      <a class="portal-nav-link" href="/index.html">${homeLabel}</a>
      ${topLinks}
      <details class="portal-district-menu">
        <summary>${allLabel}</summary>
        <div class="portal-district-list">${dropdownLinks}</div>
      </details>
    </nav>`;
}

function articleDistrictLabel(news = {}, language = "en") {
  const district = districtDefinitionFromValue(news.city || news.districtHint);
  const label = district?.label || normalizeText(news.city || news.districtHint) || "";
  return language === "hi" ? (HINDI_DISTRICT_LABELS[label] || label) : label;
}

function sameDisplayLabel(left = "", right = "") {
  return slugText(left) === slugText(right);
}

function articleCategoryLabel(news = {}, language = "hi") {
  const category = normalizeText(news.category || news.categoryBadge);
  const categoryDefinition = categoryFromValue(news.categorySlug || category);
  const district = articleDistrictLabel(news, "en");
  const label = categoryDefinition?.label || category;

  if (district && sameDisplayLabel(label, district)) {
    return language === "hi" ? "\u0932\u094b\u0915\u0932 \u0928\u094d\u092f\u0942\u091c\u093c" : "Local News";
  }

  return label || (language === "hi" ? "\u0916\u092c\u0930" : "News");
}

function articleTags(news = {}, language = "hi") {
  const district = articleDistrictLabel(news, language);
  const englishEquivalentKeys = language === "hi"
    ? new Set([slugText(articleCategoryLabel(news, "en")), slugText(articleDistrictLabel(news, "en"))].filter(Boolean))
    : new Set();
  const blocked = new Set(["khabri-junction", "khabri junction", "kj", "kj-news"]);
  const seen = new Set();
  const candidates = [
    articleCategoryLabel(news, language),
    district,
    ...normalizeText(news.tag).split(",").map((item) => normalizeText(item))
  ];

  return candidates
    .map((tag) => normalizeText(tag))
    .filter((tag) => {
      const key = slugText(tag);
      if (!tag || !key || blocked.has(key) || key.includes("khabri junction") || englishEquivalentKeys.has(key)) {
        return false;
      }

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

function renderBreadcrumbSchema(news, req, language) {
  const categoryName = articleDistrictLabel(news) || news.category || (language === "hi" ? "\u0916\u092c\u0930" : "News");
  const categoryPage = `${publicBaseUrl(req)}${landingPageForNews(news)}`;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: language === "hi" ? "\u0939\u094b\u092e" : "Home",
        item: `${publicBaseUrl(req)}/index.html`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: categoryPage
      },
      {
        "@type": "ListItem",
        position: 3,
        name: localizedValue(news, "title", language) || news.title,
        item: articleUrl(news, req)
      }
    ]
  });
}

function formatArticleDate(value, language = "hi") {
  const date = new Date(value || Date.now());

  if (language === "hi") {
    const dateText = new Intl.DateTimeFormat("hi-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
    const timeText = new Intl.DateTimeFormat("hi-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date);

    return `${dateText}, ${timeText} बजे IST`;
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function articleImageFallbackDataUri(title = "Khabri Junction") {
  const safeTitle = escapeHTML(normalizeText(title).slice(0, 92) || "Khabri Junction");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <rect width="1200" height="675" fill="#f3f4f6"/>
    <rect x="46" y="46" width="1108" height="583" rx="18" fill="#fff" stroke="#d8dee8"/>
    <text x="80" y="132" fill="#c1121f" font-family="Arial, sans-serif" font-size="34" font-weight="800">KHABRI JUNCTION</text>
    <text x="80" y="338" fill="#151922" font-family="Arial, sans-serif" font-size="54" font-weight="800">${safeTitle}</text>
    <text x="80" y="420" fill="#6b7280" font-family="Arial, sans-serif" font-size="28">Image unavailable</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function articleImageMarkup(src, alt, className, options = {}) {
  const fallback = articleImageFallbackDataUri(alt);
  const loading = options.loading || "lazy";
  const priority = loading === "eager" ? "fetchpriority=\"high\"" : "";
  return `<img class="${escapeHTML(className)}" src="${escapeHTML(src || fallback)}" alt="${escapeHTML(alt || "")}" loading="${escapeHTML(loading)}" decoding="async" ${priority} onerror="this.onerror=null;this.src='${escapeHTML(fallback)}';this.classList.add('image-fallback');">`;
}

function renderArticlePage(news, related, req, adjacent = {}, settings = {}) {
  const language = requestedLanguage(req);
  const labels = articlePageLabels(language);
  const article = localizedNews(news, language);
  const cleanArticleOptions = {
    targetLanguage: language,
    sourceName: news.sourceName || news.sourceCredit,
    feedSourceName: news.feedSourceName
  };
  article.title = cleanNewsCopyText(article.title, cleanArticleOptions) || article.title;
  article.summary = cleanNewsCopyText(article.summary, cleanArticleOptions) || article.summary;
  article.body = cleanNewsCopyText(article.body, cleanArticleOptions) || article.body;
  article.metaTitle = cleanNewsCopyText(article.metaTitle, cleanArticleOptions) || article.metaTitle;
  article.metaDescription = cleanNewsCopyText(article.metaDescription, cleanArticleOptions) || article.metaDescription;
  article.ogTitle = cleanNewsCopyText(article.ogTitle, cleanArticleOptions) || article.ogTitle;
  article.ogDescription = cleanNewsCopyText(article.ogDescription, cleanArticleOptions) || article.ogDescription;
  const url = articleUrl(news, req);
  const categoryUrl = landingPageForNews(news);
  const shareText = encodeURIComponent(article.title);
  const shareUrl = encodeURIComponent(url);
  const sourceName = news.sourceCredit || news.sourceName || news.feedSourceName || "Khabri Junction";
  const authorName = normalizeText(news.author || "Khabri Junction Desk");
  const publishedAt = news.publishedAt || news.sourcePublishedAt || news.createdAt;
  const updatedAt = news.updatedAt || publishedAt;
  const categoryLabel = articleCategoryLabel(news, language);
  const districtLabel = articleDistrictLabel(news, language);
  const activeDistrictSlug = districtDefinitionFromValue(news.city || news.districtHint)?.slug || "";
  const tags = articleTags(news, language);
  const articleBanner = articleFeaturedImage(news);
  const imageCredit = articleImageCredit(news, articleBanner, language);
  const tagChips = tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
  const relatedCards = related.map((item) => `
    <a class="article-related-card" href="${escapeHTML(articleUrl(item, req))}?lang=${language}">
      <span>${escapeHTML(item.categoryBadge || item.category || "NEWS")}</span>
      <strong>${escapeHTML(localizedValue(item, "title", language))}</strong>
    </a>
  `).join("");
  const prevLink = adjacent.previous
    ? `<a href="${escapeHTML(articleUrl(adjacent.previous, req))}?lang=${language}"><span>${language === "hi" ? "\u092a\u093f\u091b\u0932\u0940 \u0916\u092c\u0930" : "Previous story"}</span><strong>${escapeHTML(localizedValue(adjacent.previous, "title", language))}</strong></a>`
    : "";
  const nextLink = adjacent.next
    ? `<a href="${escapeHTML(articleUrl(adjacent.next, req))}?lang=${language}"><span>${language === "hi" ? "\u0905\u0917\u0932\u0940 \u0916\u092c\u0930" : "Next story"}</span><strong>${escapeHTML(localizedValue(adjacent.next, "title", language))}</strong></a>`
    : "";
  const bodyText = stripBodyImages(article.body || article.summary);
  const paragraphs = escapeHTML(bodyText)
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
  const adTop = normalizeText(settings.ads?.["article-top"] || settings.ads?.inArticle);
  const adBottom = normalizeText(settings.ads?.["article-bottom"] || settings.ads?.inArticle);
  const sidebarAd = normalizeText(settings.ads?.sidebar);
  const mobileStickyAd = normalizeText(settings.ads?.["mobile-sticky"]);
  const taxonomyMeta = [
    `<div><strong>${escapeHTML(labels.category)}</strong><span>${escapeHTML(categoryLabel)}</span></div>`,
    districtLabel ? `<div><strong>${escapeHTML(labels.district)}</strong><span>${escapeHTML(districtLabel)}</span></div>` : "",
    `<div><strong>${escapeHTML(labels.author)}</strong><span>${escapeHTML(authorName)}</span></div>`
  ].filter(Boolean).join("");
  const sourceCreditMarkup = imageCredit
    ? `<p class="article-source-credit">${escapeHTML(imageCredit)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="${escapeHTML(language)}" translate="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google" content="notranslate">
  <title>${escapeHTML(article.metaTitle || article.title)}</title>
  <meta name="description" content="${escapeHTML(article.metaDescription || article.summary)}">
  <meta name="keywords" content="${escapeHTML(news.keywords || "")}">
  <link rel="canonical" href="${escapeHTML(url)}">
  <link rel="alternate" hreflang="en" href="${escapeHTML(url)}?lang=en">
  <link rel="alternate" hreflang="hi" href="${escapeHTML(url)}?lang=hi">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHTML(article.ogTitle || article.title)}">
  <meta property="og:description" content="${escapeHTML(article.ogDescription || article.summary)}">
  <meta property="og:image" content="${escapeHTML(articleBanner)}">
  <meta property="og:url" content="${escapeHTML(url)}">
  <meta property="article:section" content="${escapeHTML(news.category || "News")}">
  <meta property="article:published_time" content="${new Date(news.publishedAt || news.createdAt).toISOString()}">
  <meta property="article:modified_time" content="${new Date(news.updatedAt || news.createdAt).toISOString()}">
  <link rel="icon" href="/assets/logo-kj.png" type="image/png">
  <link rel="apple-touch-icon" href="/assets/logo-kj.png">
  <link rel="stylesheet" href="/style.css">
  <script type="application/ld+json">${renderNewsSchema(article, related, req)}</script>
  <script type="application/ld+json">${renderBreadcrumbSchema(news, req, language)}</script>
</head>
<body class="article-page">
  <header class="portal-site-header">
    <a class="portal-brand" href="/index.html" aria-label="Khabri Junction home">
      <img src="/assets/logo-kj.png" alt="Khabri Junction logo">
      <div><strong>KHABRI JUNCTION</strong><span>छत्तीसगढ़ की ताजा खबरें</span></div>
    </a>
    ${portalHeaderNav(language, activeDistrictSlug)}
    <div class="portal-language-switch" aria-label="Article language">
      <a class="${language === "hi" ? "active" : ""}" href="${escapeHTML(url)}?lang=hi">हिंदी</a>
      <a class="${language === "en" ? "active" : ""}" href="${escapeHTML(url)}?lang=en">English</a>
    </div>
  </header>
  <main class="article-shell">
    <article class="article-main">
      <a class="portal-back" href="${escapeHTML(categoryUrl)}">${escapeHTML(labels.home)} / ${escapeHTML(news.category || labels.news)}</a>
      <span class="tag">${escapeHTML(categoryLabel)}</span>
      <h1>${escapeHTML(article.title)}</h1>
      <p class="article-summary">${escapeHTML(article.summary)}</p>
      <figure class="article-hero-figure">
        ${articleImageMarkup(articleBanner, article.title, "article-hero-image", { loading: "eager" })}
      </figure>
      <div class="article-meta">
        <span>${escapeHTML(labels.published)}: ${escapeHTML(formatArticleDate(publishedAt, language))}</span>
        <span>${escapeHTML(labels.updated)}: ${escapeHTML(formatArticleDate(updatedAt, language))}</span>
      </div>
      <div class="article-meta-grid">
        ${taxonomyMeta}
      </div>
      ${tagChips ? `<div class="article-taxonomy">
        <strong>${escapeHTML(labels.tags)}</strong>
        <div class="article-taxonomy-chips">${tagChips}</div>
      </div>` : ""}
      <div class="share-row" aria-label="Share article">
        <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener">Facebook</a>
        <a href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}" target="_blank" rel="noopener">X</a>
        <a href="https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
      ${adTop ? `<div class="ad-slot in-article-ad adsense-ready">${adTop}</div>` : ""}
      <div class="article-body">${paragraphs}</div>
      ${sourceCreditMarkup}
      ${adBottom ? `<div class="ad-slot in-article-ad adsense-ready">${adBottom}</div>` : ""}
      <nav class="article-next-prev" aria-label="Next and previous articles">${prevLink}${nextLink}</nav>
    </article>
    <aside class="article-sidebar">
      ${sidebarAd ? `<div class="portal-side-ad adsense-ready">${sidebarAd}</div>` : ""}
      <section class="article-related">
        <h2>${escapeHTML(labels.related)}</h2>
        ${relatedCards || `<p>${escapeHTML(labels.noRelated)}</p>`}
      </section>
    </aside>
  </main>
  ${mobileStickyAd ? `<div class="mobile-sticky-ad adsense-ready">${mobileStickyAd}</div>` : ""}
  <footer class="portal-footer">&copy; 2026 KHABRI JUNCTION - All Rights Reserved</footer>
</body>
</html>`;
}

function renderSearchPage(results, query, req) {
  const language = requestedLanguage(req);
  const title = query ? `${language === "hi" ? "Search result" : "Search results"} for ${query} | Khabri Junction` : "Search News | Khabri Junction";
  const description = query ? `Latest Khabri Junction news results for ${query}.` : "Search latest Khabri Junction news by keyword, city or category.";
  const resultCards = results.map((rawItem) => {
    const item = localizedNews(rawItem, language);

    return `
    <article class="search-result-card">
      <a href="${escapeHTML(articleUrl(rawItem, req))}?lang=${language}">
        <img src="${escapeHTML(item.image || DEFAULT_NEWS_IMAGE)}" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async">
        <div>
          <span>${escapeHTML(item.categoryBadge || item.category || "NEWS")}</span>
          <h2>${escapeHTML(item.title)}</h2>
          <p>${escapeHTML(item.summary || "")}</p>
        </div>
      </a>
    </article>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="${escapeHTML(language)}" translate="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google" content="notranslate">
  <title>${escapeHTML(title)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <link rel="canonical" href="${escapeHTML(publicBaseUrl(req))}/search?q=${encodeURIComponent(query || "")}&lang=${language}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHTML(title)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <link rel="icon" href="/assets/logo-kj.png" type="image/png">
  <link rel="stylesheet" href="/style.css">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"SearchResultsPage","name":${JSON.stringify(title)},"description":${JSON.stringify(description)}}</script>
</head>
<body class="article-page">
  <header class="portal-site-header">
    <a class="portal-brand" href="/index.html"><img src="/assets/logo-kj.png" alt="Khabri Junction logo"><div><strong>KHABRI JUNCTION</strong><span>Fast local news for Chhattisgarh</span></div></a>
    ${portalHeaderNav(language, "")}
  </header>
  <main class="search-shell">
    <form class="portal-search-form" action="/search" method="get">
      <input name="q" value="${escapeHTML(query || "")}" placeholder="Search news, city, category">
      <input name="lang" value="${escapeHTML(language)}" type="hidden">
      <button class="read-btn" type="submit">Search</button>
    </form>
    <h1>${escapeHTML(query ? `Search: ${query}` : "Search News")}</h1>
    <div class="search-results">${resultCards || "<p>No published news found.</p>"}</div>
  </main>
  <footer class="portal-footer">&copy; 2026 KHABRI JUNCTION - All Rights Reserved</footer>
</body>
</html>`;
}

async function findAdjacentNews(news) {
  const publishedAt = news.publishedAt || news.createdAt || new Date();
  const baseQuery = { status: "published", _id: { $ne: news._id } };
  const previous = await newsCollection
    .findOne({ ...baseQuery, publishedAt: { $lt: publishedAt } }, { sort: { publishedAt: -1, createdAt: -1 } });
  const next = await newsCollection
    .findOne({ ...baseQuery, publishedAt: { $gt: publishedAt } }, { sort: { publishedAt: 1, createdAt: 1 } });

  return { previous, next };
}

function renderCategoryLandingPage(route, articles, settings, req) {
  const language = requestedLanguage(req);
  const routeTitle = normalizeText(route.title);
  const routeDescription = normalizeText(route.description);
  const cleanSettings = normalizeSiteSettings(settings || {});
  const activeDistrictSlug = districtDefinitionFromValue(route.districtLabel || route.category || route.path)?.slug || "";
  const ui = language === "en" ? {
    readMore: "Read full story",
    brandTagline: "Latest news from Chhattisgarh",
    empty: "Fresh stories will appear in this section soon.",
    weatherTitle: "Weather Update",
    marketTitle: "Market Tracker",
    videoTitle: "Viral Videos",
    weatherFocus: "Durg, Bhilai and Raipur weather",
    marketFocus: "Real-time market tracker",
    marketNote: "Values can be updated manually from the admin panel."
  } : {
    readMore: "\u092a\u0942\u0930\u0940 \u0916\u092c\u0930 \u092a\u0922\u093c\u0947\u0902",
    brandTagline: "\u091b\u0924\u094d\u0924\u0940\u0938\u0917\u0922\u093c \u0915\u0940 \u0924\u093e\u091c\u093e \u0916\u092c\u0930\u0947\u0902",
    empty: "\u0907\u0938 \u0938\u0947\u0915\u094d\u0936\u0928 \u092e\u0947\u0902 \u091c\u0932\u094d\u0926 \u0928\u0908 \u0916\u092c\u0930\u0947\u0902 \u0906\u090f\u0902\u0917\u0940\u0964",
    weatherTitle: "\u092e\u094c\u0938\u092e \u0905\u092a\u0921\u0947\u091f",
    marketTitle: "\u092e\u093e\u0930\u094d\u0915\u0947\u091f \u091f\u094d\u0930\u0948\u0915\u0930",
    videoTitle: "\u0935\u093e\u092f\u0930\u0932 \u0935\u0940\u0921\u093f\u092f\u094b",
    weatherFocus: "\u0926\u0941\u0930\u094d\u0917, \u092d\u093f\u0932\u093e\u0908 \u0914\u0930 \u0930\u093e\u092f\u092a\u0941\u0930 \u092e\u094c\u0938\u092e",
    marketFocus: "\u0930\u093f\u092f\u0932-\u091f\u093e\u0907\u092e \u092e\u093e\u0930\u094d\u0915\u0947\u091f \u091f\u094d\u0930\u0948\u0915\u0930",
    marketNote: "Admin panel \u0938\u0947 values manually update \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964"
  };
  const title = `${routeTitle} | Khabri Junction`;
  const canonical = `${publicBaseUrl(req)}${route.path}`;
  const cards = articles.map((rawItem) => {
    const item = localizedNews(rawItem, language);
    const districtLabel = articleDistrictLabel(rawItem);
    const publishedAt = formatArticleDate(rawItem.publishedAt || rawItem.createdAt, language);
    return `
      <article class="news-card">
        <img src="${escapeHTML(articleFeaturedImage(rawItem))}" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async">
        <div class="card-body">
          <div class="card-chip-row">
            <span class="tag">${escapeHTML(item.categoryBadge || item.category || "NEWS")}</span>
            ${districtLabel ? `<span class="tag tag-muted">${escapeHTML(districtLabel)}</span>` : ""}
          </div>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.summary || "")}</p>
          <div class="card-meta-row">
            <span>${escapeHTML(item.category || "खबर")}</span>
            ${districtLabel ? `<span>${escapeHTML(districtLabel)}</span>` : ""}
            <time>${escapeHTML(publishedAt)}</time>
          </div>
          <a class="read-btn" href="${escapeHTML(articleUrl(rawItem, req))}?lang=${escapeHTML(language)}">${ui.readMore}</a>
        </div>
      </article>`;
  }).join("");
  const videos = (cleanSettings.videos || []).slice(0, 3).map((video) => `
    <a class="portal-side-item" href="${escapeHTML(video.url || "/viral-videos")}" target="${video.url ? "_blank" : "_self"}" rel="noopener">
      <div><strong>${escapeHTML(video.title || "Viral Video")}</strong><span>${escapeHTML(video.type || "Video")}</span></div>
      <img src="${escapeHTML(video.thumbnail || DEFAULT_NEWS_IMAGE)}" alt="${escapeHTML(video.title || "Viral Video")}" loading="lazy" decoding="async">
    </a>
  `).join("");
  const weather = (cleanSettings.weather || []).map((item) => `
    <div class="market-row"><div><strong>${escapeHTML(item.city)}</strong><small>${escapeHTML(item.condition || "Weather")}</small></div><span>${escapeHTML(item.temp || "--")}</span></div>
  `).join("");
  const market = (cleanSettings.market || []).map((item) => `
    <div class="market-row"><div><strong>${escapeHTML(item.name)}</strong><small>Live tracker</small></div><span class="up">${escapeHTML(item.value || "--")} ${escapeHTML(item.change || "")}</span></div>
  `).join("");
  const mainWidget = route.path === "/weather-update"
    ? `<section class="market-card category-focus-card">
        <div class="section-title small"><span></span><strong>${ui.weatherFocus}</strong></div>
        <div class="weather-mini-grid">${(cleanSettings.weather || []).map((item) => `
          <div class="weather-mini-card">
            <strong>${escapeHTML(item.city || "City")}</strong>
            <span>${escapeHTML(item.temp || "--")}</span>
            <small>${escapeHTML(item.condition || "Weather update")}</small>
          </div>
        `).join("")}</div>
      </section>`
      : route.path === "/market-news"
      ? `<section class="market-card category-focus-card">
          <div class="section-title small"><span></span><strong>${ui.marketFocus}</strong></div>
          <div class="market-list">${market}</div>
          <p class="market-note">${ui.marketNote}</p>
        </section>`
      : "";

  return `<!DOCTYPE html>
<html lang="${escapeHTML(language)}" translate="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google" content="notranslate">
  <title>${escapeHTML(title)}</title>
  <meta name="description" content="${escapeHTML(routeDescription)}">
  <link rel="canonical" href="${escapeHTML(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHTML(title)}">
  <meta property="og:description" content="${escapeHTML(routeDescription)}">
  <meta property="og:url" content="${escapeHTML(canonical)}">
  <meta property="og:image" content="${escapeHTML(publicBaseUrl(req))}/assets/logo-kj.png">
  <link rel="icon" href="/assets/logo-kj.png" type="image/png">
  <link rel="stylesheet" href="/style.css">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":${JSON.stringify(title)},"description":${JSON.stringify(routeDescription)},"url":${JSON.stringify(canonical)}}</script>
</head>
<body class="article-page">
  <div class="ad-slot article-top-ad">${cleanSettings.ads?.header || "ADVERTISEMENT"}</div>
  <header class="portal-site-header">
    <a class="portal-brand" href="/index.html"><img src="/assets/logo-kj.png" alt="Khabri Junction logo"><div><strong>KHABRI JUNCTION</strong><span>${ui.brandTagline}</span></div></a>
    ${portalHeaderNav(language, activeDistrictSlug)}
  </header>
  <main class="portal-shell">
    <div class="portal-language-switch category-language-switch" aria-label="Page language">
      <a class="${language === "hi" ? "active" : ""}" href="${escapeHTML(route.path)}?lang=hi">हिंदी</a>
      <a class="${language === "en" ? "active" : ""}" href="${escapeHTML(route.path)}?lang=en">English</a>
    </div>
    <section class="portal-layout">
      <div>
        <div class="section-title"><span></span><strong>${escapeHTML(routeTitle)}</strong></div>
        <p class="article-summary">${escapeHTML(routeDescription)}</p>
        ${mainWidget}
        <div class="news-grid latest-grid">${cards || `<div class="ad-slot">${ui.empty}</div>`}</div>
      </div>
      <aside class="portal-sidebar">
        <div class="portal-side-ad">${cleanSettings.ads?.sidebar || "ADVERTISEMENT<br>300 x 250"}</div>
        <section class="market-card"><div class="section-title small"><span></span><strong>${ui.weatherTitle}</strong></div><div class="market-list">${weather}</div></section>
        <section class="market-card"><div class="section-title small"><span></span><strong>${ui.marketTitle}</strong></div><div class="market-list">${market}</div></section>
        <section class="market-card"><div class="section-title small"><span></span><strong>${ui.videoTitle}</strong></div>${videos || "<p>No videos yet.</p>"}</section>
      </aside>
    </section>
  </main>
  <footer class="portal-footer">&copy; 2026 KHABRI JUNCTION - All Rights Reserved</footer>
</body>
</html>`;
}

function storySlides(news) {
  const paragraphs = normalizeText(news.body || news.summary).split(/\n{2,}/).filter(Boolean);
  return [
    { title: news.title, text: news.summary || news.title },
    ...paragraphs.slice(0, 4).map((paragraph, index) => ({ title: index ? "Update" : news.category || "News", text: paragraph }))
  ].slice(0, 5);
}

function renderWebStory(news, req) {
  const language = requestedLanguage(req);
  const storyNews = localizedNews(news, language);
  const canonical = articleUrl(news, req);
  const storyUrl = `${publicBaseUrl(req)}/web-stories/${news.slug}?lang=${language}`;
  const slides = storySlides(storyNews).map((slide, index) => `
    <amp-story-page id="page-${index + 1}">
      <amp-story-grid-layer template="fill">
        <amp-img src="${escapeHTML(news.image || DEFAULT_NEWS_IMAGE)}" width="720" height="1280" layout="responsive" alt="${escapeHTML(storyNews.title)}"></amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical" class="story-layer">
        <span>${escapeHTML(news.categoryBadge || news.category || "NEWS")}</span>
        <h1>${escapeHTML(slide.title)}</h1>
        <p>${escapeHTML(slide.text)}</p>
      </amp-story-grid-layer>
    </amp-story-page>
  `).join("");

  return `<!doctype html>
<html amp lang="${escapeHTML(language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <title>${escapeHTML(storyNews.title)} | Khabri Junction Web Story</title>
  <meta name="description" content="${escapeHTML(storyNews.metaDescription || storyNews.summary)}">
  <link rel="canonical" href="${escapeHTML(canonical)}">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
  <link rel="icon" href="/assets/logo-kj.png" type="image/png">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    amp-story{font-family:Arial,sans-serif;color:#fff}
    .story-layer{align-content:end;padding:42px;background:linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.72))}
    .story-layer span{width:max-content;padding:7px 10px;border-radius:6px;background:#d70f1c;font-weight:800;font-size:13px}
    .story-layer h1{font-size:34px;line-height:1.08;margin:14px 0 8px}
    .story-layer p{font-size:18px;line-height:1.45}
  </style>
</head>
<body>
  <amp-story standalone title="${escapeHTML(storyNews.title)}" publisher="Khabri Junction" publisher-logo-src="${publicBaseUrl(req)}/assets/logo-kj.png" poster-portrait-src="${escapeHTML(news.image || DEFAULT_NEWS_IMAGE)}">
    ${slides}
    <amp-story-bookend src="${publicBaseUrl(req)}/api/web-story-bookend/${news.slug}" layout="nodisplay"></amp-story-bookend>
  </amp-story>
</body>
</html>`;
}

function renderWebStoriesIndex(news, req) {
  const language = requestedLanguage(req);
  const cards = news.map((rawItem) => {
    const item = localizedNews(rawItem, language);

    return `
      <a class="web-story-card" href="/web-stories/${escapeHTML(item.slug)}?lang=${language}">
        <img src="${escapeHTML(item.image || DEFAULT_NEWS_IMAGE)}" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async">
        <span>${escapeHTML(item.categoryBadge || item.category || "NEWS")}</span>
        <strong>${escapeHTML(item.title)}</strong>
      </a>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="${escapeHTML(language)}" translate="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google" content="notranslate">
  <title>Khabri Junction Web Stories</title>
  <meta name="description" content="Mobile-first Web Stories from Khabri Junction.">
  <link rel="canonical" href="${publicBaseUrl(req)}/web-stories">
  <link rel="icon" href="/assets/logo-kj.png" type="image/png">
  <link rel="stylesheet" href="/style.css">
</head>
<body class="article-page">
  <header class="portal-site-header"><a class="portal-brand" href="/index.html"><img src="/assets/logo-kj.png" alt="Khabri Junction logo"><div><strong>KHABRI JUNCTION</strong><span>Web Stories</span></div></a></header>
  <main class="web-stories-shell"><h1>Web Stories</h1><div class="web-story-grid">${cards || "<p>No published stories yet.</p>"}</div></main>
  <footer class="portal-footer">&copy; 2026 KHABRI JUNCTION - All Rights Reserved</footer>
</body>
</html>`;
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    database: MONGODB_DB,
    collection: NEWS_COLLECTION,
    collections: [NEWS_COLLECTION, MANUAL_NEWS_COLLECTION, ADS_COLLECTION, NEWS_ANALYTICS_COLLECTION, PUSH_SUBSCRIBERS_COLLECTION],
    mongoConnected: mongoReady,
    mongoError: mongoError ? mongoError.message : null,
    automationRunning,
    openAIConfigured: Boolean(OPENAI_API_KEY),
    integrations: {
      weatherConfigured: Boolean(WEATHER_API_URL),
      marketConfigured: Boolean(MARKET_API_URL),
      cricketConfigured: Boolean(CRICKET_API_URL),
      firebaseConfigured: Boolean(FIREBASE_SERVER_KEY)
    }
  });
});

app.get("/api/taxonomy", (req, res) => {
  res.json({
    categories: CATEGORY_DEFINITIONS.map((category) => ({
      label: category.label,
      slug: category.slug,
      page: category.page,
      badge: category.badge
    })),
    districts: CITY_DEFINITIONS.map((city) => ({
      label: city.label,
      slug: city.slug
    }))
  });
});

app.get("/api/automation", requireDatabase, async (req, res, next) => {
  try {
    const settings = await getAutomationSettings();
    res.json(serializeAutomationSettings(settings));
  } catch (error) {
    next(error);
  }
});

app.put("/api/automation", requireDatabase, async (req, res, next) => {
  try {
    const current = await getAutomationSettings();
    const enabled = normalizeBoolean(req.body.enabled);
    const query = normalizeText(req.body.query) || current.query || DEFAULT_AUTOMATION_QUERY;
    const update = {
      enabled,
      query,
      intervalMinutes: AUTOMATION_INTERVAL_MINUTES,
      nextRunAt: nextScheduledRunDate(AUTOMATION_INTERVAL_MINUTES),
      "cronHealth.enabled": enabled,
      "cronHealth.nextRunAt": nextScheduledRunDate(AUTOMATION_INTERVAL_MINUTES),
      updatedAt: new Date()
    };

    await settingsCollection.updateOne({ _id: "automation" }, { $set: update }, { upsert: true });
    const settings = await getAutomationSettings();
    res.json(serializeAutomationSettings(settings));
  } catch (error) {
    next(error);
  }
});

app.post("/api/automation/run", requireDatabase, async (req, res, next) => {
  try {
    const rawLimit = Number(req.body?.limit || req.query.limit || 8);
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 8, 1), 15);
    const result = await runNewsAutomation({ force: true, limit });
    const settings = await getAutomationSettings();

    res.json({
      ...result,
      settings: serializeAutomationSettings(settings)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/automation/run-failed", requireDatabase, async (req, res, next) => {
  try {
    const rawLimit = Number(req.body?.limit || req.query.limit || 8);
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 8, 1), 15);
    const result = await runNewsAutomation({ force: true, limit, retryFailed: true });
    const settings = await getAutomationSettings();

    res.json({
      ...result,
      settings: serializeAutomationSettings(settings)
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/automation/logs", requireDatabase, async (req, res, next) => {
  try {
    const settings = await getAutomationSettings();
    res.json(Array.isArray(settings.logs) ? settings.logs : []);
  } catch (error) {
    next(error);
  }
});

app.get("/api/site-settings", async (req, res, next) => {
  try {
    if (!mongoReady || !settingsCollection) {
      return res.json(normalizeSiteSettings(defaultSiteSettings()));
    }

    const settings = await getSiteSettings();
    res.json(settings);
  } catch (error) {
    if (!mongoReady) {
      return res.json(normalizeSiteSettings(defaultSiteSettings()));
    }

    next(error);
  }
});

app.put("/api/site-settings", requireDatabase, async (req, res, next) => {
  try {
    const current = await getSiteSettings();
    const update = {
      weather: Array.isArray(req.body?.weather) ? req.body.weather : current.weather,
      market: Array.isArray(req.body?.market) ? req.body.market : current.market,
      cricket: Array.isArray(req.body?.cricket) ? req.body.cricket : current.cricket,
      videos: Array.isArray(req.body?.videos) ? req.body.videos : current.videos,
      ads: { ...(current.ads || {}), ...(req.body?.ads || {}) },
      notification: { ...(current.notification || {}), ...(req.body?.notification || {}) },
      integrations: {
        ...(current.integrations || {}),
        ...(req.body?.integrations || {}),
        weather: sanitizeIntegrationConfig("weather", { ...(current.integrations?.weather || {}), ...(req.body?.integrations?.weather || {}) }),
        market: sanitizeIntegrationConfig("market", { ...(current.integrations?.market || {}), ...(req.body?.integrations?.market || {}) }),
        cricket: sanitizeIntegrationConfig("cricket", { ...(current.integrations?.cricket || {}), ...(req.body?.integrations?.cricket || {}) }),
        firebase: sanitizeIntegrationConfig("firebase", { ...(current.integrations?.firebase || {}), ...(req.body?.integrations?.firebase || {}) })
      },
      updatedAt: new Date()
    };

    await settingsCollection.updateOne({ _id: "site" }, { $set: update }, { upsert: true });
    res.json(await getSiteSettings());
  } catch (error) {
    next(error);
  }
});

app.get("/api/integrations", requireDatabase, async (req, res, next) => {
  try {
    const settings = await getSiteSettings();
    res.json(settings.integrations || defaultSiteSettings().integrations);
  } catch (error) {
    next(error);
  }
});

app.put("/api/integrations/:type", requireDatabase, async (req, res, next) => {
  try {
    const type = normalizeText(req.params.type);

    if (!["weather", "market", "cricket", "firebase"].includes(type)) {
      throw createValidationError("invalid integration type");
    }

    const current = await getSiteSettings();
    const nextConfig = sanitizeIntegrationConfig(type, {
      ...(current.integrations?.[type] || {}),
      ...(req.body || {})
    });

    await settingsCollection.updateOne(
      { _id: "site" },
      {
        $set: {
          [`integrations.${type}`]: nextConfig,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    const settings = await getSiteSettings();
    res.json(settings.integrations?.[type] || nextConfig);
  } catch (error) {
    next(error);
  }
});

app.post("/api/integrations/:type/sync", requireDatabase, async (req, res, next) => {
  try {
    const type = normalizeText(req.params.type);
    const result = await syncIntegrationData(type, req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard/analytics", requireDatabase, async (req, res, next) => {
  try {
    const todayStart = startOfISTDay();
    const automation = await getAutomationSettings();
    const [
      totalAi,
      totalManual,
      todayAi,
      todayManual,
      pendingAi,
      pendingManual,
      rejectedAi,
      rejectedManual,
      publishedAi,
      publishedManual,
      totalAds,
      activeAds,
      subscribers,
      analyticsSummary,
      trending
    ] = await Promise.all([
      newsCollection.countDocuments({}),
      manualNewsCollection.countDocuments({}),
      newsCollection.countDocuments({ createdAt: { $gte: todayStart } }),
      manualNewsCollection.countDocuments({ createdAt: { $gte: todayStart } }),
      newsCollection.countDocuments({ status: "pending" }),
      manualNewsCollection.countDocuments({ status: "pending" }),
      newsCollection.countDocuments({ status: "rejected" }),
      manualNewsCollection.countDocuments({ status: "rejected" }),
      newsCollection.countDocuments({ status: "published" }),
      manualNewsCollection.countDocuments({ status: "published" }),
      adsCollection.countDocuments({}),
      adsCollection.countDocuments({ enabled: true }),
      pushSubscribersCollection.countDocuments({ active: true }),
      newsAnalyticsCollection.aggregate([
        {
          $group: {
            _id: null,
            views: { $sum: "$views" },
            clicks: { $sum: "$clicks" }
          }
        }
      ]).toArray(),
      getTrendingNews(8)
    ]);
    const totals = analyticsSummary[0] || { views: 0, clicks: 0 };

    res.json({
      totalNews: totalAi + totalManual,
      aiNews: totalAi,
      manualNews: totalManual,
      todayNews: todayAi + todayManual,
      pendingReview: pendingAi + pendingManual,
      publishedNews: publishedAi + publishedManual,
      rejectedNews: rejectedAi + rejectedManual,
      totalAds,
      activeAds,
      failedJobs: Array.isArray(automation.failedJobs) ? automation.failedJobs.length : 0,
      subscribers,
      views: Number(totals.views || 0),
      clicks: Number(totals.clicks || 0),
      trendingArticles: trending.map(serializeNews),
      automationLogs: Array.isArray(automation.logs) ? automation.logs.slice(0, 12) : [],
      cronHealth: automation.cronHealth || {},
      sourceStats: Array.isArray(automation.sourceStats) ? automation.sourceStats : []
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/ads", requireDatabase, async (req, res, next) => {
  try {
    const query = normalizeBoolean(req.query.active) ? { enabled: true } : {};

    if (req.query.position) {
      query.position = normalizeText(req.query.position);
    }

    const ads = await adsCollection.find(query).sort({ position: 1, updatedAt: -1 }).toArray();
    res.json(ads.map(serializeAd));
  } catch (error) {
    next(error);
  }
});

app.post("/api/ads", requireDatabase, async (req, res, next) => {
  try {
    const ad = normalizeAd(req.body || {});
    const result = await adsCollection.insertOne(ad);
    res.status(201).json(serializeAd(await adsCollection.findOne({ _id: result.insertedId })));
  } catch (error) {
    next(error);
  }
});

app.put("/api/ads/:id", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await adsCollection.findOne({ _id });

    if (!existing) {
      return res.status(404).json({ error: "ad not found" });
    }

    await adsCollection.updateOne({ _id }, { $set: normalizeAd(req.body || {}, existing) });
    res.json(serializeAd(await adsCollection.findOne({ _id })));
  } catch (error) {
    next(error);
  }
});

app.post("/api/ads/:id/toggle", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await adsCollection.findOne({ _id });

    if (!existing) {
      return res.status(404).json({ error: "ad not found" });
    }

    await adsCollection.updateOne(
      { _id },
      {
        $set: normalizeAd(
          { ...existing, enabled: req.body?.enabled === undefined ? !existing.enabled : req.body.enabled },
          existing
        )
      }
    );
    res.json(serializeAd(await adsCollection.findOne({ _id })));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/ads/:id", requireDatabase, async (req, res, next) => {
  try {
    const result = await adsCollection.deleteOne({ _id: parseObjectId(req.params.id) });

    if (!result.deletedCount) {
      return res.status(404).json({ error: "ad not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/uploads/:id", requireDatabase, async (req, res, next) => {
  try {
    const upload = await uploadsCollection.findOne({ _id: parseObjectId(req.params.id) });

    if (!upload?.data || !upload?.mimeType) {
      return res.status(404).send("upload not found");
    }

    res.setHeader("Content-Type", upload.mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(Buffer.from(upload.data, "base64"));
  } catch (error) {
    next(error);
  }
});

app.post("/api/uploads", async (req, res, next) => {
  try {
    const dataUrl = normalizeText(req.body?.dataUrl);
    const originalName = normalizeText(req.body?.filename || "upload.png");
    const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,([\s\S]+)$/i);

    if (!match) {
      return res.status(400).json({ error: "valid image dataUrl is required" });
    }

    const extByMime = { "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp", "image/gif": "gif" };
    const ext = extByMime[match[1].toLowerCase()] || path.extname(originalName).replace(".", "") || "png";
    const uploadDir = path.join(__dirname, "assets", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${hashValue(originalName).slice(0, 8)}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    const imageBuffer = Buffer.from(match[2], "base64");
    fs.writeFileSync(filePath, imageBuffer);
    let apiUrl = "";

    if (uploadsCollection) {
      const uploadResult = await uploadsCollection.insertOne({
        filename,
        originalName,
        mimeType: match[1].toLowerCase(),
        data: imageBuffer.toString("base64"),
        size: imageBuffer.length,
        createdAt: new Date()
      });
      apiUrl = `/api/uploads/${uploadResult.insertedId}`;
    }

    const url = `/assets/uploads/${filename}`;
    const absoluteUrl = new URL(url, publicBaseUrl(req)).toString();
    res.status(201).json({
      url,
      previewUrl: url,
      apiUrl,
      absoluteUrl,
      absolutePreviewUrl: absoluteUrl,
      absoluteApiUrl: apiUrl ? new URL(apiUrl, publicBaseUrl(req)).toString() : "",
      imageAlt: normalizeText(req.body?.imageAlt),
      imageCredit: normalizeText(req.body?.imageCredit),
      imageSource: normalizeText(req.body?.imageSource),
      imageCrop: normalizeImageCrop(req.body?.imageCrop)
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/images/preview", async (req, res, next) => {
  try {
    const url = normalizeText(req.query.url);

    if (!url) {
      throw createValidationError("image url is required");
    }

    const localPath = url.startsWith("/assets/")
      ? path.join(__dirname, url.replace(/^\/+/, "").replaceAll("/", path.sep))
      : "";

    const absolutePreviewUrl = new URL(url, publicBaseUrl(req)).toString();
    res.json({
      url,
      previewUrl: url,
      absoluteUrl: absolutePreviewUrl,
      absolutePreviewUrl,
      local: Boolean(localPath && fs.existsSync(localPath)),
      exists: Boolean(localPath && fs.existsSync(localPath)),
      imageAlt: normalizeText(req.query.imageAlt),
      imageCredit: normalizeText(req.query.imageCredit),
      imageSource: normalizeText(req.query.imageSource),
      imageCrop: normalizeImageCrop(req.query)
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/push/subscribers", requireDatabase, async (req, res, next) => {
  try {
    const subscribers = await pushSubscribersCollection.find({}).sort({ updatedAt: -1 }).limit(500).toArray();
    res.json({
      total: subscribers.length,
      active: subscribers.filter((item) => item.active !== false).length,
      items: subscribers.map((item) => ({
        _id: String(item._id),
        token: item.token,
        platform: item.platform,
        language: item.language,
        district: item.district,
        active: item.active !== false,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/push/subscribe", requireDatabase, async (req, res, next) => {
  try {
    const token = normalizeText(req.body?.token);
    const existing = token ? await pushSubscribersCollection.findOne({ token }) : null;
    const subscriber = normalizePushSubscriber(req.body || {}, existing || {});

    await pushSubscribersCollection.updateOne(
      { token: subscriber.token },
      { $set: subscriber },
      { upsert: true }
    );

    res.status(existing ? 200 : 201).json({ ok: true, active: subscriber.active });
  } catch (error) {
    next(error);
  }
});

app.post("/api/push/send", requireDatabase, async (req, res, next) => {
  try {
    const payload = {
      title: normalizeText(req.body?.title),
      body: normalizeText(req.body?.body),
      image: normalizeText(req.body?.image),
      url: normalizeText(req.body?.url),
      slug: normalizeText(req.body?.slug),
      category: normalizeText(req.body?.category),
      district: normalizeText(req.body?.district)
    };

    if (!payload.title || !payload.body) {
      throw createValidationError("title and body are required");
    }

    const result = await sendFirebaseNotification(payload, req.body?.district ? { district: normalizeText(req.body.district) } : {});
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/api/manual-news", requireDatabase, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 100), 1), 300);
    const news = await manualNewsCollection
      .find(buildNewsQuery(req.query))
      .sort({ featured: -1, trending: -1, breaking: -1, publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    res.json(news.map(serializeNews));
  } catch (error) {
    next(error);
  }
});

app.post("/api/manual-news", requireDatabase, async (req, res, next) => {
  try {
    const targetStatus = normalizeText(req.body?.status || "published");
    const news = await normalizeManualNews(req.body || {}, {}, { validatePublish: targetStatus === "published" });
    const result = await manualNewsCollection.insertOne(news);
    const created = await manualNewsCollection.findOne({ _id: result.insertedId });

    if ((created?.status || "published") === "published") {
      await notifyPublishedArticle(created);
    }

    res.status(201).json(serializeNews(created));
  } catch (error) {
    next(error);
  }
});

app.put("/api/manual-news/:id", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await manualNewsCollection.findOne({ _id });

    if (!existing) {
      return res.status(404).json({ error: "manual news not found" });
    }

    const targetStatus = normalizeText(req.body?.status || existing.status || "published");
    const news = await normalizeManualNews(req.body || {}, existing, {
      validatePublish: targetStatus === "published" && (existing.status || "published") !== "published"
    });
    await manualNewsCollection.updateOne({ _id }, { $set: news });
    const updated = await manualNewsCollection.findOne({ _id });

    if ((existing.status || "published") !== "published" && (updated?.status || "published") === "published") {
      await notifyPublishedArticle(updated);
    }

    res.json(serializeNews(updated));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/manual-news/:id", requireDatabase, async (req, res, next) => {
  try {
    const result = await manualNewsCollection.deleteOne({ _id: parseObjectId(req.params.id) });

    if (!result.deletedCount) {
      return res.status(404).json({ error: "manual news not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/news-analytics", requireDatabase, async (req, res, next) => {
  try {
    const analytics = await newsAnalyticsCollection.find({}).sort({ views: -1, clicks: -1, updatedAt: -1 }).limit(200).toArray();
    res.json(analytics.map((item) => ({ ...item, _id: String(item._id) })));
  } catch (error) {
    next(error);
  }
});

app.post("/api/news-analytics/click", requireDatabase, async (req, res, next) => {
  try {
    const id = normalizeText(req.body?.id);
    const source = normalizeText(req.body?.source || "manual");
    const collection = source === "ai" ? newsCollection : manualNewsCollection;
    const news = ObjectId.isValid(id) ? await collection.findOne({ _id: new ObjectId(id) }) : null;

    if (!news) {
      return res.status(404).json({ error: "article not found" });
    }

    await incrementAnalytics(news, "click");
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

async function sendCategoryPage(req, res, next, rawSlug) {
  try {
    const categoryAlias = {
      "breaking-news": "breaking",
      horoscope: "astrology"
    };
    const category = categoryFromValue(categoryAlias[toSlug(rawSlug)] || rawSlug);
    const settings = await getSiteSettings();

    if (!category) {
      return res.status(404).type("html").send(renderCategoryLandingPage({
        path: req.path,
        title: "Category Not Found",
        category: "Breaking",
        description: "यह à¤•à¥ˆà¤Ÿà¥‡à¤—à¤°à¥€ à¤…à¤­à¥€ à¤‰पलब्ध à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆ. à¤¤à¤¾à¤œा à¤–à¤¬à¤°à¥‹à¤‚ à¤•à¥‡ लिए à¤¹à¥‹म या à¤¬à¥à¤°à¥‡à¤•à¤¿à¤‚à¤— à¤¨à¥à¤¯à¥‚à¤œ à¤¦à¥‡à¤–à¥‡à¤‚."
      }, [], settings, req));
    }

    const matchedRoute = CLEAN_CATEGORY_ROUTES.find((item) => categoryFromValue(item.category)?.slug === category.slug);
    const route = matchedRoute ? { ...matchedRoute } : {
      path: categoryRoutePath(category),
      title: `${category.label} News`,
      category: category.label,
      description: `${category.label} à¤•à¥€ à¤¤à¤¾à¤œा à¤–à¤¬à¤°à¥‡à¤‚, à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤”र à¤²à¥‹à¤•ल à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ Khabri Junction पर à¤ªà¤¢à¤¼à¥‡à¤‚.`
    };
    route.path = categoryRoutePath(category);
    const articles = await getCombinedPublishedNews({ status: "published", section: category.slug }, 24);

    res.type("html").send(renderCategoryLandingPage(route, articles, settings, req));
  } catch (error) {
    next(error);
  }
}

async function sendDistrictPage(req, res, next, rawSlug) {
  try {
    const district = districtDefinitionFromValue(rawSlug);
    const settings = await getSiteSettings();

    if (!district) {
      return res.status(404).type("html").send(renderCategoryLandingPage({
        path: req.path,
        title: "District Not Found",
        category: "Local News",
        districtLabel: "Chhattisgarh",
        description: "यह जिला पेज अभी उपलब्ध नहीं है। ताजा खबरों के लिए होम या लोकल न्यूज़ सेक्शन देखें।"
      }, [], settings, req));
    }

    const articles = await getCombinedPublishedNews({ status: "published", city: district.slug }, 24);
    return res.type("html").send(renderCategoryLandingPage({
      path: districtRoutePath(district.slug),
      title: `${district.label} News`,
      category: "Local News",
      districtLabel: district.label,
      description: `${district.label} की ताजा खबरें, लोकल अपडेट, प्रशासनिक सूचना और पब्लिक रिपोर्ट Khabri Junction पर पढ़ें।`
    }, articles, settings, req));
  } catch (error) {
    next(error);
  }
}

app.get("/category/:slug", requireDatabase, (req, res, next) => {
  sendCategoryPage(req, res, next, req.params.slug);
});

app.get("/district/:slug", requireDatabase, (req, res, next) => {
  sendDistrictPage(req, res, next, req.params.slug);
});

const STATIC_PAGE_ROUTES = {
  "/about": "about.html",
  "/contact": "contact.html",
  "/privacy-policy": "privacy-policy.html",
  "/cookie-policy": "cookie-policy.html",
  "/terms-conditions": "terms-and-conditions.html",
  "/disclaimer": "disclaimer.html",
  "/editorial-policy": "editorial-policy.html",
  "/fact-check-policy": "fact-check-policy.html",
  "/correction-policy": "correction-policy.html",
  "/advertise": "advertise.html",
  "/admin": "admin.html"
};

Object.entries(STATIC_PAGE_ROUTES).forEach(([routePath, fileName]) => {
  app.get(routePath, (req, res) => {
    res.sendFile(path.join(__dirname, fileName));
  });
});

CLEAN_CATEGORY_ROUTES.forEach((route) => {
  app.get(route.path, (req, res) => {
    const category = categoryFromValue(route.category);
    res.redirect(301, categoryRoutePath(category || route.category));
  });
});

app.get("/news-sitemap.xml", requireDatabase, async (req, res, next) => {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const [manualNews, aiNews] = await Promise.all([
      manualNewsCollection.find({
        status: "published",
        publishedAt: { $gte: twoDaysAgo }
      }).sort({ publishedAt: -1, createdAt: -1 }).limit(500).toArray(),
      newsCollection
      .find({
        status: "published",
        publishedAt: { $gte: twoDaysAgo }
      })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(1000)
      .toArray()
    ]);
    const news = [...manualNews, ...aiNews].slice(0, 1000);
    const items = news.map((item) => `
  <url>
    <loc>${escapeXML(articleUrl(item, req))}</loc>
    <news:news>
      <news:publication>
        <news:name>Khabri Junction</news:name>
        <news:language>${escapeXML(item.language || "hi")}</news:language>
      </news:publication>
      <news:publication_date>${new Date(item.publishedAt || item.createdAt).toISOString()}</news:publication_date>
      <news:title>${escapeXML(item.title)}</news:title>
    </news:news>
  </url>`).join("");

    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${items}
</urlset>`);
  } catch (error) {
    next(error);
  }
});

app.get("/sitemap.xml", requireDatabase, async (req, res, next) => {
  try {
    const staticPages = [
      "index.html",
      "breaking.html",
      "durg.html",
      "bhilai.html",
      "raipur.html",
      "bilaspur.html",
      "sports.html",
      "astrology.html",
      "politics.html",
      "crime.html",
      "entertainment.html",
      "health.html",
      "jobs.html",
      "web-stories",
      ...CATEGORY_DEFINITIONS.map((category) => categoryRoutePath(category).replace(/^\/+/, "")),
      ...CITY_DEFINITIONS.map((district) => districtRoutePath(district.slug).replace(/^\/+/, ""))
    ];
    const [manualNews, aiNews] = await Promise.all([
      manualNewsCollection.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).limit(1000).toArray(),
      newsCollection.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).limit(5000).toArray()
    ]);
    const news = [...manualNews, ...aiNews].slice(0, 5000);
    const urls = [
      ...staticPages.map((page) => ({ loc: `${publicBaseUrl(req)}/${page}`, lastmod: new Date() })),
      ...news.flatMap((item) => [
        { loc: articleUrl(item, req), lastmod: item.updatedAt || item.publishedAt || item.createdAt },
        { loc: `${publicBaseUrl(req)}/web-stories/${item.slug}`, lastmod: item.updatedAt || item.publishedAt || item.createdAt }
      ])
    ];

    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((item) => `  <url><loc>${escapeXML(item.loc)}</loc><lastmod>${new Date(item.lastmod).toISOString()}</lastmod></url>`).join("\n")}
</urlset>`);
  } catch (error) {
    next(error);
  }
});

app.get("/robots.txt", (req, res) => {
  const base = publicBaseUrl(req);

  res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /api/

Sitemap: ${base}/sitemap.xml
Sitemap: ${base}/news-sitemap.xml
`);
});

app.get("/search", requireDatabase, async (req, res, next) => {
  try {
    const q = normalizeText(req.query.q);
    const results = q ? await getCombinedPublishedNews({ q, status: "published" }, 50) : [];

    res.type("html").send(renderSearchPage(results, q, req));
  } catch (error) {
    next(error);
  }
});

app.get("/api/search", requireDatabase, async (req, res, next) => {
  try {
    const q = normalizeText(req.query.q);
    const results = q ? await getCombinedPublishedNews({ q, status: "published" }, 30) : [];

    res.json(results.map(serializeNews));
  } catch (error) {
    next(error);
  }
});

app.get("/api/news/search", requireDatabase, async (req, res, next) => {
  try {
    const q = normalizeText(req.query.q);
    const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);
    const results = q ? await getCombinedPublishedNews({ ...req.query, q, status: req.query.status || "published" }, limit) : [];
    res.json(results.map(serializeNews));
  } catch (error) {
    next(error);
  }
});

app.get("/web-stories", requireDatabase, async (req, res, next) => {
  try {
    const news = await getCombinedPublishedNews({ status: "published" }, 30);
    res.type("html").send(renderWebStoriesIndex(news, req));
  } catch (error) {
    next(error);
  }
});

app.get("/web-stories/:slug", requireDatabase, async (req, res, next) => {
  try {
    const news = await findPublishedArticleBySlug(req.params.slug);

    if (!news) {
      return res.status(404).send("Story not found");
    }

    res.type("html").send(renderWebStory(news, req));
  } catch (error) {
    next(error);
  }
});

app.get("/api/web-story-bookend/:slug", requireDatabase, async (req, res, next) => {
  try {
    const news = await findPublishedArticleBySlug(req.params.slug);

    if (!news) {
      return res.status(404).json({ error: "story not found" });
    }

    const related = await findRelatedNews(news, 3);
    res.json({
      bookendVersion: "v1.0",
      shareProviders: ["facebook", "twitter", "whatsapp"],
      components: [
        {
          type: "heading",
          text: "Related News"
        },
        ...related.map((item) => ({
          type: "small",
          title: item.title,
          url: articleUrl(item, req),
          image: item.image || DEFAULT_NEWS_IMAGE
        }))
      ]
    });
  } catch (error) {
    next(error);
  }
});

app.get("/news/:slug", requireDatabase, async (req, res, next) => {
  try {
    const news = await findPublishedArticleBySlug(req.params.slug);

    if (!news) {
      return res.status(404).send("News not found");
    }

    await incrementAnalytics(news, "view");
    const related = await findRelatedNews(news, 4);
    const adjacent = await findAdjacentNews(news);
    const settings = await getSiteSettings();
    res.type("html").send(renderArticlePage(news, related, req, adjacent, settings));
  } catch (error) {
    next(error);
  }
});

app.get("/category/:category/:slug", requireDatabase, async (req, res, next) => {
  try {
    const category = categoryFromValue(req.params.category);

    if (!category) {
      return next();
    }

    const news = await findPublishedArticleBySlug(req.params.slug, category.slug);

    if (!news) {
      return next();
    }

    await incrementAnalytics(news, "view");
    const related = await findRelatedNews(news, 4);
    const adjacent = await findAdjacentNews(news);
    const settings = await getSiteSettings();
    res.type("html").send(renderArticlePage(news, related, req, adjacent, settings));
  } catch (error) {
    next(error);
  }
});

app.get("/:category/:slug", requireDatabase, async (req, res, next) => {
  try {
    if (!categoryFromValue(req.params.category)) {
      return next();
    }

    const category = toSlug(req.params.category);
    const news = await findPublishedArticleBySlug(req.params.slug, category);

    if (!news) {
      return next();
    }

    await incrementAnalytics(news, "view");
    const related = await findRelatedNews(news, 4);
    const adjacent = await findAdjacentNews(news);
    const settings = await getSiteSettings();
    res.type("html").send(renderArticlePage(news, related, req, adjacent, settings));
  } catch (error) {
    next(error);
  }
});

app.get("/api/news", requireDatabase, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 100), 1), 300);
    const news = await getCombinedPublishedNews(req.query, limit);

    res.json(news.map(serializeNews));
  } catch (error) {
    next(error);
  }
});

app.get("/api/news/trending", requireDatabase, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 50);
    const news = await getTrendingNews(limit);
    res.json(news.map(serializeNews));
  } catch (error) {
    next(error);
  }
});

app.get("/api/news/category/:slug", requireDatabase, async (req, res, next) => {
  try {
    const category = categoryFromValue(req.params.slug);

    if (!category) {
      return res.status(404).json({ error: "category not found" });
    }

    const limit = Math.min(Math.max(Number(req.query.limit || 60), 1), 200);
    const news = await getCombinedPublishedNews({ ...req.query, categorySlug: category.slug }, limit);
    res.json(news.map(serializeNews));
  } catch (error) {
    next(error);
  }
});

app.get("/api/news/district/:slug", requireDatabase, async (req, res, next) => {
  try {
    const district = districtDefinitionFromValue(req.params.slug);

    if (!district) {
      return res.status(404).json({ error: "district not found" });
    }

    const limit = Math.min(Math.max(Number(req.query.limit || 60), 1), 200);
    const news = await getCombinedPublishedNews({ ...req.query, city: district.slug }, limit);
    res.json(news.map(serializeNews));
  } catch (error) {
    next(error);
  }
});

app.get("/api/news/by-slug/:slug", requireDatabase, async (req, res, next) => {
  try {
    const news = (manualNewsCollection && await manualNewsCollection.findOne({ slug: req.params.slug })) ||
      await newsCollection.findOne({ slug: req.params.slug });

    if (!news) {
      return res.status(404).json({ error: "news not found" });
    }

    res.json(serializeNews(news));
  } catch (error) {
    next(error);
  }
});

app.get("/api/news/:id/related", requireDatabase, async (req, res, next) => {
  try {
    const news = await findNewsRecordById(req.params.id, normalizeText(req.query.source));

    if (!news) {
      return res.status(404).json({ error: "news not found" });
    }

    const related = await findRelatedNews(news, 6);
    res.json(related.map(serializeNews));
  } catch (error) {
    next(error);
  }
});

app.post("/api/news/:id/translate", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await newsCollection.findOne({ _id });

    if (!existing) {
      return res.status(404).json({ error: "news not found" });
    }

    const force = normalizeBoolean(req.body?.force);
    const input = force
      ? {
          ...existing,
          titleEn: existing.language === "hi" ? "" : existing.titleEn,
          summaryEn: existing.language === "hi" ? "" : existing.summaryEn,
          bodyEn: existing.language === "hi" ? "" : existing.bodyEn,
          titleHi: existing.language === "hi" ? existing.titleHi : "",
          summaryHi: existing.language === "hi" ? existing.summaryHi : "",
          bodyHi: existing.language === "hi" ? existing.bodyHi : ""
        }
      : existing;
    const news = normalizeNews(await prepareBilingualNews(input, existing), existing);

    await newsCollection.updateOne({ _id }, { $set: news });
    const updated = await newsCollection.findOne({ _id });
    res.json(serializeNews(updated));
  } catch (error) {
    next(error);
  }
});

app.post("/api/news/:id/thumbnail", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await newsCollection.findOne({ _id });

    if (!existing) {
      return res.status(404).json({ error: "news not found" });
    }

    const action = normalizeText(req.body?.action || "use-source");
    const existingImageAsSource = !isLikelyLowQualityImage(existing.image) && !normalizeText(existing.image).startsWith("data:")
      ? existing.image
      : "";
    const sourceImage = normalizeText(req.body?.sourceImage || existing.sourceImage || existing.sourceImageUrl || existingImageAsSource);
    const thumbnailFields = await buildThumbnailFields(
      {
        ...existing,
        sourceImage,
        categoryBadge: existing.categoryBadge || existing.category,
        city: existing.city
      },
      existing,
      {
        action,
        force: action === "regenerate-ai"
      }
    );
    const update = {
      sourceImage: thumbnailFields.sourceImage,
      optimizedThumbnail: thumbnailFields.optimizedThumbnail,
      aiThumbnail: thumbnailFields.aiThumbnail,
      thumbnailHash: thumbnailFields.thumbnailHash,
      thumbnailStatus: thumbnailFields.thumbnailStatus,
      image: thumbnailFields.image,
      updatedAt: new Date()
    };

    await newsCollection.updateOne({ _id }, { $set: update });
    const updated = await newsCollection.findOne({ _id });
    res.json(serializeNews(updated));
  } catch (error) {
    next(error);
  }
});

app.post("/api/news/:id/image", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await newsCollection.findOne({ _id });

    if (!existing) {
      return res.status(404).json({ error: "news not found" });
    }

    const sourceImage = normalizeText(req.body?.sourceImage || req.body?.image || existing.sourceImage || existing.image);
    const thumbnailFields = await buildThumbnailFields(
      {
        ...existing,
        sourceImage,
        categoryBadge: existing.categoryBadge || existing.category,
        city: existing.city
      },
      existing,
      {
        action: sourceImage ? "use-source" : "backfill",
        force: sourceImage !== normalizeText(existing.sourceImage)
      }
    );
    const update = {
      image: thumbnailFields.image || normalizeText(req.body?.image || existing.image),
      sourceImage: sourceImage || existing.sourceImage,
      optimizedThumbnail: thumbnailFields.optimizedThumbnail || "",
      aiThumbnail: thumbnailFields.aiThumbnail || "",
      thumbnailHash: thumbnailFields.thumbnailHash || "",
      thumbnailStatus: thumbnailFields.thumbnailStatus || "",
      imageAlt: normalizeText(req.body?.imageAlt || existing.imageAlt || existing.title),
      imageCredit: normalizeText(req.body?.imageCredit || existing.imageCredit),
      imageSource: normalizeText(req.body?.imageSource || existing.imageSource || existing.sourceUrl),
      imageCrop: normalizeImageCrop(req.body?.imageCrop || existing.imageCrop),
      updatedAt: new Date()
    };

    if (!update.imageCrop) {
      delete update.imageCrop;
    }

    await newsCollection.updateOne({ _id }, { $set: update });
    const updated = await newsCollection.findOne({ _id });
    res.json(serializeNews(updated));
  } catch (error) {
    next(error);
  }
});

app.get("/api/news/:id", requireDatabase, async (req, res, next) => {
  try {
    const news = await findNewsRecordById(req.params.id, normalizeText(req.query.source));

    if (!news) {
      return res.status(404).json({ error: "news not found" });
    }

    res.json(serializeNews(news));
  } catch (error) {
    next(error);
  }
});

app.post("/api/news", requireDatabase, async (req, res, next) => {
  try {
    const targetStatus = normalizeText(req.body?.status || (normalizeBoolean(req.body?.automated) ? "pending" : "published"));
    const news = await normalizeManagedNews(req.body || {}, {}, { validatePublish: targetStatus === "published" });
    const result = await newsCollection.insertOne(news);
    const created = await newsCollection.findOne({ _id: result.insertedId });

    res.status(201).json(serializeNews(created));
  } catch (error) {
    next(error);
  }
});

app.put("/api/news/:id", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await newsCollection.findOne({ _id });

    if (!existing) {
      return res.status(404).json({ error: "news not found" });
    }

    const targetStatus = normalizeText(req.body?.status || existing.status || "published");
    const news = await normalizeManagedNews(req.body || {}, existing, {
      validatePublish: targetStatus === "published" && (existing.status || "pending") !== "published"
    });
    await newsCollection.updateOne({ _id }, { $set: news });
    const updated = await newsCollection.findOne({ _id });
    const previousStatus = existing.status || "published";
    const nextStatus = updated.status || "published";

    if (previousStatus !== nextStatus) {
      if (nextStatus === "published") {
        await addAutomationLog("approved", `Approved and published: ${updated.title}`, { id: String(updated._id) });
        await notifyPublishedArticle(updated);
      } else if (nextStatus === "rejected") {
        await addAutomationLog("rejected", `Rejected article: ${updated.title}`, { id: String(updated._id) });
      } else if (nextStatus === "pending") {
        await addAutomationLog("pending", `Moved article to pending: ${updated.title}`, { id: String(updated._id) });
      }
    }

    res.json(serializeNews(updated));
  } catch (error) {
    next(error);
  }
});

app.post("/api/news/:id/approve", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await newsCollection.findOne({ _id });

    if (!existing) {
      return res.status(404).json({ error: "news not found" });
    }

    const news = await normalizeManagedNews({ ...existing, ...req.body, status: "published" }, existing, { validatePublish: true });
    await newsCollection.updateOne({ _id }, { $set: news });
    const updated = await newsCollection.findOne({ _id });
    await addAutomationLog("approved", `Approved and published: ${updated.title}`, { id: String(updated._id) });
    await notifyPublishedArticle(updated);

    res.json(serializeNews(updated));
  } catch (error) {
    next(error);
  }
});

app.post("/api/news/:id/reject", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await newsCollection.findOne({ _id });

    if (!existing) {
      return res.status(404).json({ error: "news not found" });
    }

    const news = await normalizeManagedNews({ ...existing, ...req.body, status: "rejected", featured: false, breaking: false, trending: false }, existing);
    await newsCollection.updateOne({ _id }, { $set: news });
    const updated = await newsCollection.findOne({ _id });
    await addAutomationLog("rejected", `Rejected article: ${updated.title}`, { id: String(updated._id) });

    res.json(serializeNews(updated));
  } catch (error) {
    next(error);
  }
});

app.post("/api/news/bulk-approve", requireDatabase, async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(ObjectId.isValid).map((id) => new ObjectId(id)) : [];
    const filter = ids.length ? { _id: { $in: ids }, status: "pending" } : { status: "pending" };
    const pending = await newsCollection.find(filter).toArray();
    let approved = 0;

    for (const item of pending) {
      const news = await normalizeManagedNews({ ...item, status: "published" }, item, { validatePublish: true });
      await newsCollection.updateOne({ _id: item._id }, { $set: news });
      approved += 1;
      await addAutomationLog("approved", `Bulk approved: ${item.title}`, { id: String(item._id) });
      await notifyPublishedArticle({ ...item, ...news, _id: item._id });
    }

    res.json({ approved });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/news/:id", requireDatabase, async (req, res, next) => {
  try {
    const _id = parseObjectId(req.params.id);
    const existing = await newsCollection.findOne({ _id });
    const result = await newsCollection.deleteOne({ _id });

    if (!result.deletedCount) {
      return res.status(404).json({ error: "news not found" });
    }

    if (existing) {
      await addAutomationLog("deleted", `Deleted article: ${existing.title}`, { id: String(existing._id), status: existing.status });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/clear-posts", requireDatabase, async (req, res, next) => {
  try {
    if (!normalizeBoolean(req.body?.confirm)) {
      return res.status(400).json({ error: "confirmation required" });
    }

    const [aiResult, manualResult, analyticsResult] = await Promise.all([
      newsCollection.deleteMany({}),
      manualNewsCollection.deleteMany({}),
      newsAnalyticsCollection.deleteMany({})
    ]);

    await addAutomationLog(
      "admin-clear",
      `All posts removed by admin. AI ${aiResult.deletedCount || 0}, manual ${manualResult.deletedCount || 0}`,
      {
        deletedAi: aiResult.deletedCount || 0,
        deletedManual: manualResult.deletedCount || 0,
        deletedAnalytics: analyticsResult.deletedCount || 0
      }
    );

    res.json({
      ok: true,
      deletedAi: aiResult.deletedCount || 0,
      deletedManual: manualResult.deletedCount || 0,
      deletedAnalytics: analyticsResult.deletedCount || 0
    });
  } catch (error) {
    next(error);
  }
});

app.get("/:slug", async (req, res, next) => {
  const slug = toSlug(req.params.slug);

  if (!slug || req.path.includes(".") || req.path.startsWith("/api")) {
    return next();
  }

  const category = categoryFromValue(slug);
  if (!category) {
    return next();
  }

  return res.redirect(301, categoryRoutePath(category));
});

app.use((req, res) => {
  if (req.accepts("html")) {
    return res.status(404).type("html").send(`<!DOCTYPE html>
<html lang="hi" translate="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google" content="notranslate">
  <title>Page Not Found | Khabri Junction</title>
  <link rel="icon" href="/assets/logo-kj.png" type="image/png">
  <link rel="stylesheet" href="/style.css">
</head>
<body class="article-page">
  <main class="portal-shell">
    <section class="market-card category-focus-card">
      <div class="section-title"><span></span><strong>à¤ªà¥‡à¤œ à¤¨à¤¹à¥€à¤‚ मिला</strong></div>
      <p class="article-summary">यह à¤²à¤¿à¤‚à¤• à¤‰पलब्ध à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆ. à¤¨à¥€à¤šà¥‡ à¤¸à¥‡ à¤¸à¤¹à¥€ à¤•à¥ˆà¤Ÿà¥‡à¤—à¤°à¥€ à¤–à¥‹à¤²à¥‡à¤‚.</p>
      <div class="quick-links">
        ${CATEGORY_DEFINITIONS.slice(0, 24).map((category) => `<a href="${categoryRoutePath(category)}">${escapeHTML(category.label)}</a>`).join("")}
      </div>
      <a class="read-btn" href="/index.html">à¤¹à¥‹म पर à¤œà¤¾à¤à¤‚</a>
    </section>
  </main>
</body>
</html>`);
  }

  res.status(404).json({ error: "not found" });
});

app.use((error, req, res, next) => {
  const status = error.status || (error.code === 11000 ? 409 : 500);
  const message = error.code === 11000 ? "duplicate news already exists" : status >= 500 ? "server error" : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: message,
    ...(Array.isArray(error.details) && error.details.length ? { details: error.details } : {})
  });
});

async function connectToMongo() {
  if (mongoReady) {
    return;
  }

  try {
    await client.connect();
    const database = client.db(MONGODB_DB);
    newsCollection = database.collection(NEWS_COLLECTION);
    adsCollection = database.collection(ADS_COLLECTION);
    manualNewsCollection = database.collection(MANUAL_NEWS_COLLECTION);
    newsAnalyticsCollection = database.collection(NEWS_ANALYTICS_COLLECTION);
    pushSubscribersCollection = database.collection(PUSH_SUBSCRIBERS_COLLECTION);
    settingsCollection = database.collection(SETTINGS_COLLECTION);
    uploadsCollection = database.collection(UPLOADS_COLLECTION);
    await newsCollection.updateMany({ status: "review" }, { $set: { status: "pending", publishedAt: null } });
    await backfillNewsMetadata();
    const thumbnailBackfillCount = await backfillNewsThumbnails();
    await newsCollection.createIndex({ status: 1, category: 1, city: 1, createdAt: -1 });
    await newsCollection.createIndex({ status: 1, categorySlug: 1, city: 1, createdAt: -1 });
    await newsCollection.createIndex({ featured: 1, breaking: 1, createdAt: -1 });
    await newsCollection.createIndex({ trending: 1, createdAt: -1 });
    await newsCollection.createIndex({ duplicateKey: 1 }, { unique: true, sparse: true });
    await newsCollection.createIndex({ sourceUrl: 1 }, { unique: true, sparse: true });
    await newsCollection.createIndex({ sourceHash: 1 }, { unique: true, sparse: true });
    await newsCollection.createIndex({ storyHash: 1 }, { unique: true, sparse: true });
    await newsCollection.createIndex({ status: 1, sourcePublishedAt: -1, freshnessScore: -1 });
    await newsCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
    await manualNewsCollection.createIndex({ status: 1, categorySlug: 1, city: 1, createdAt: -1 });
    await manualNewsCollection.createIndex({ featured: 1, trending: 1, breaking: 1, publishedAt: -1 });
    await manualNewsCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
    await adsCollection.createIndex({ position: 1, enabled: 1, updatedAt: -1 });
    await newsAnalyticsCollection.createIndex({ articleId: 1, source: 1 }, { unique: true });
    await newsAnalyticsCollection.createIndex({ views: -1, clicks: -1 });
    await pushSubscribersCollection.createIndex({ token: 1 }, { unique: true });
    await pushSubscribersCollection.createIndex({ active: 1, district: 1, updatedAt: -1 });
    await getAutomationSettings();
    await getSiteSettings();
    await settingsCollection.updateOne(
      { _id: "automation" },
      {
        $set: {
          enabled: true,
          intervalMinutes: AUTOMATION_INTERVAL_MINUTES,
          freshnessWindowHours: NEWS_FRESHNESS_HOURS,
          nextRunAt: nextScheduledRunDate(AUTOMATION_INTERVAL_MINUTES),
          "cronHealth.enabled": true,
          "cronHealth.nextRunAt": nextScheduledRunDate(AUTOMATION_INTERVAL_MINUTES),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    startAutomationCron();
    mongoReady = true;
    mongoError = null;
    repairNewsLocalization().then((count) => {
      if (count) {
        console.log(`Localization repair updated ${count} automated articles.`);
      }
    }).catch((error) => console.warn(`Localization repair failed: ${error.message}`));
    if (thumbnailBackfillCount) {
      console.log(`Thumbnail backfill updated ${thumbnailBackfillCount} articles.`);
    }
    console.log(`MongoDB connected: ${MONGODB_DB}.${NEWS_COLLECTION}`);
  } catch (error) {
    mongoReady = false;
    mongoError = error;
    console.warn(`MongoDB not connected yet: ${error.message}`);
  }
}

async function startServer() {
  await connectToMongo();

  setInterval(() => {
    if (!mongoReady) {
      connectToMongo().catch((error) => console.warn(`MongoDB reconnect failed: ${error.message}`));
    }
  }, 10000);

  app.listen(PORT, () => {
    console.log(`Khabri Junction API running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start API server:", error);
    process.exit(1);
  });
} else {
  connectToMongo().catch((error) => console.warn(`MongoDB initial connect failed: ${error.message}`));
}

module.exports = app;

