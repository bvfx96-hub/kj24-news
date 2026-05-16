const DEFAULT_REMOTE_API_BASE = "https://kj24-news.onrender.com";
const ADMIN_STORAGE_KEY = "khabriJunctionAdminData";
const AUTH_SESSION_KEY = "khabriJunctionAdminAccess";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "kjadmin123";
const API_BASE_URL = window.KJ_API_BASE_URL
  || ((window.location.protocol === "file:" || /github\.io$|githubusercontent\.com$/i.test(window.location.hostname))
    ? DEFAULT_REMOTE_API_BASE
    : "");
const NEWS_SYNC_KEY = "khabriJunctionNewsSync";
const newsSyncChannel = typeof BroadcastChannel === "function"
  ? new BroadcastChannel("khabri-junction-news-sync")
  : null;
const fallbackImage = "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=900&auto=format&fit=crop";
const CMS_CATEGORIES = [
  "Breaking",
  "Durg",
  "Bhilai",
  "Raipur",
  "Bilaspur",
  "Rajnandgaon",
  "Kawardha",
  "Khairagarh",
  "Raipur Promotion",
  "Market",
  "Weather",
  "Viral Videos",
  "Local News",
  "MP Shahdol",
  "World",
  "Sports",
  "Astrology",
  "Politics",
  "Crime",
  "Entertainment",
  "Health",
  "Jobs",
  "Education",
  "Business",
  "Agriculture",
  "Technology",
  "Lifestyle",
  "Travel",
  "Fashion",
  "Movie",
  "Music",
  "Events",
  "Balod",
  "Bemetara",
  "Dhamtari",
  "Mahasamund",
  "Gariaband",
  "Mungeli",
  "Korba",
  "Raigarh",
  "Janjgir-Champa",
  "Sakti",
  "Sarangarh",
  "Surguja",
  "Bastar",
  "Kanker",
  "Kondagaon",
  "Dantewada",
  "Sukma",
  "Bijapur",
  "Narayanpur",
  "Jashpur",
  "Koriya",
  "Balrampur",
  "Surajpur"
];
const CMS_DISTRICTS = [
  { label: "Auto / None", value: "" },
  { label: "Balod", value: "balod" },
  { label: "Baloda Bazar-Bhatapara", value: "baloda-bazar-bhatapara" },
  { label: "Balrampur-Ramanujganj", value: "balrampur-ramanujganj" },
  { label: "Bastar", value: "bastar" },
  { label: "Bemetara", value: "bemetara" },
  { label: "Bhilai", value: "bhilai" },
  { label: "Bijapur", value: "bijapur" },
  { label: "Bilaspur", value: "bilaspur" },
  { label: "Dantewada", value: "dantewada" },
  { label: "Dhamtari", value: "dhamtari" },
  { label: "Durg", value: "durg" },
  { label: "Mahasamund", value: "mahasamund" },
  { label: "Gariaband", value: "gariaband" },
  { label: "Gaurela-Pendra-Marwahi", value: "gaurela-pendra-marwahi" },
  { label: "Janjgir-Champa", value: "janjgir-champa" },
  { label: "Jashpur", value: "jashpur" },
  { label: "Kanker", value: "kanker" },
  { label: "Kawardha / Kabirdham", value: "kabirdham" },
  { label: "Khairagarh-Chhuikhadan-Gandai", value: "khairagarh-chhuikhadan-gandai" },
  { label: "Kondagaon", value: "kondagaon" },
  { label: "Korba", value: "korba" },
  { label: "Korea", value: "korea" },
  { label: "Manendragarh-Chirmiri-Bharatpur", value: "manendragarh-chirmiri-bharatpur" },
  { label: "Mohla-Manpur-Ambagarh Chowki", value: "mohla-manpur-ambagarh-chowki" },
  { label: "Mungeli", value: "mungeli" },
  { label: "Narayanpur", value: "narayanpur" },
  { label: "Raigarh", value: "raigarh" },
  { label: "Raipur", value: "raipur" },
  { label: "Rajnandgaon", value: "rajnandgaon" },
  { label: "Sakti", value: "sakti" },
  { label: "Sarangarh-Bilaigarh", value: "sarangarh-bilaigarh" },
  { label: "Sukma", value: "sukma" },
  { label: "Surajpur", value: "surajpur" },
  { label: "Surguja", value: "surguja" }
];

let state = {
  topStory: {
    enabled: false,
    kicker: "BREAKING NEWS",
    kickerHi: "",
    title: "",
    titleHi: "",
    summary: "",
    summaryHi: "",
    body: "",
    bodyHi: "",
    image: ""
  },
  ticker: [],
  news: [],
  ads: [],
  manualNews: []
};
let activeStatusFilter = "pending";

const fields = {
  loginScreen: document.getElementById("loginScreen"),
  loginForm: document.getElementById("adminLoginForm"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginError: document.getElementById("loginError"),
  topEnabled: document.getElementById("topEnabled"),
  topKicker: document.getElementById("topKicker"),
  topKickerHi: document.getElementById("topKickerHi"),
  topTitle: document.getElementById("topTitle"),
  topTitleHi: document.getElementById("topTitleHi"),
  topSummary: document.getElementById("topSummary"),
  topBody: document.getElementById("topBody"),
  topImage: document.getElementById("topImage"),
  tickerLines: document.getElementById("tickerLines"),
  editingIndex: document.getElementById("editingIndex"),
  newsTag: document.getElementById("newsTag"),
  newsCategory: document.getElementById("newsCategory"),
  newsCity: document.getElementById("newsCity"),
  newsStatus: document.getElementById("newsStatus"),
  newsImage: document.getElementById("newsImage"),
  newsUpload: document.getElementById("newsUpload"),
  newsTitle: document.getElementById("newsTitle"),
  newsTitleHi: document.getElementById("newsTitleHi"),
  newsSummary: document.getElementById("newsSummary"),
  newsSummaryHi: document.getElementById("newsSummaryHi"),
  newsBody: document.getElementById("newsBody"),
  newsBodyHi: document.getElementById("newsBodyHi"),
  autoTranslateNews: document.getElementById("autoTranslateNews"),
  previewNewsDraft: document.getElementById("previewNewsDraft"),
  useSourceImage: document.getElementById("useSourceImage"),
  generateAiThumbnail: document.getElementById("generateAiThumbnail"),
  regenerateThumbnail: document.getElementById("regenerateThumbnail"),
  publishResult: document.getElementById("publishResult"),
  adminToastStack: document.getElementById("adminToastStack"),
  newsBreaking: document.getElementById("newsBreaking"),
  newsFeatured: document.getElementById("newsFeatured"),
  newsTrending: document.getElementById("newsTrending"),
  newsList: document.getElementById("newsList"),
  statusLine: document.getElementById("statusLine"),
  statusLineText: document.getElementById("statusLineText"),
  adminLoading: document.getElementById("adminLoading"),
  adminLoadingText: document.getElementById("adminLoadingText"),
  refreshDashboard: document.getElementById("refreshDashboard"),
  dashboardStats: document.getElementById("dashboardStats"),
  dashboardTrending: document.getElementById("dashboardTrending"),
  dashboardLogs: document.getElementById("dashboardLogs"),
  logoutAdmin: document.getElementById("logoutAdmin"),
  clearAllPosts: document.getElementById("clearAllPosts"),
  automationEnabled: document.getElementById("automationEnabled"),
  automationQuery: document.getElementById("automationQuery"),
  automationStatus: document.getElementById("automationStatus"),
  automationLog: document.getElementById("automationLog"),
  saveAutomation: document.getElementById("saveAutomation"),
  runAutomationNow: document.getElementById("runAutomationNow"),
  runFailedJobs: document.getElementById("runFailedJobs"),
  saveSiteSettings: document.getElementById("saveSiteSettings"),
  weatherSettings: document.getElementById("weatherSettings"),
  marketSettings: document.getElementById("marketSettings"),
  videoSettings: document.getElementById("videoSettings"),
  headerAdCode: document.getElementById("headerAdCode"),
  sidebarAdCode: document.getElementById("sidebarAdCode"),
  articleAdCode: document.getElementById("articleAdCode"),
  footerAdCode: document.getElementById("footerAdCode"),
  notificationTitle: document.getElementById("notificationTitle"),
  notificationDescription: document.getElementById("notificationDescription"),
  adForm: document.getElementById("adForm"),
  adId: document.getElementById("adId"),
  adTitle: document.getElementById("adTitle"),
  adPosition: document.getElementById("adPosition"),
  adTarget: document.getElementById("adTarget"),
  adEnabled: document.getElementById("adEnabled"),
  adImage: document.getElementById("adImage"),
  adUpload: document.getElementById("adUpload"),
  adLinkUrl: document.getElementById("adLinkUrl"),
  adCode: document.getElementById("adCode"),
  previewAd: document.getElementById("previewAd"),
  adList: document.getElementById("adList"),
  clearAdForm: document.getElementById("clearAdForm"),
  deleteAd: document.getElementById("deleteAd"),
  manualNewsForm: document.getElementById("manualNewsForm"),
  manualId: document.getElementById("manualId"),
  manualTitleHi: document.getElementById("manualTitleHi"),
  manualTitleEn: document.getElementById("manualTitleEn"),
  manualCategory: document.getElementById("manualCategory"),
  manualCity: document.getElementById("manualCity"),
  manualStatus: document.getElementById("manualStatus"),
  manualSlug: document.getElementById("manualSlug"),
  manualImage: document.getElementById("manualImage"),
  manualUpload: document.getElementById("manualUpload"),
  manualSummaryHi: document.getElementById("manualSummaryHi"),
  manualSummaryEn: document.getElementById("manualSummaryEn"),
  manualBodyHi: document.getElementById("manualBodyHi"),
  manualBodyEn: document.getElementById("manualBodyEn"),
  manualMetaTitle: document.getElementById("manualMetaTitle"),
  manualMetaDescription: document.getElementById("manualMetaDescription"),
  manualBreaking: document.getElementById("manualBreaking"),
  manualTrending: document.getElementById("manualTrending"),
  manualFeatured: document.getElementById("manualFeatured"),
  manualNewsList: document.getElementById("manualNewsList"),
  clearManualForm: document.getElementById("clearManualForm"),
  previewManual: document.getElementById("previewManual"),
  deleteManual: document.getElementById("deleteManual"),
  reviewTabButtons: document.querySelectorAll("[data-status-filter]"),
  pendingCount: document.getElementById("pendingCount"),
  publishedCount: document.getElementById("publishedCount"),
  rejectedCount: document.getElementById("rejectedCount"),
  bulkApprovePending: document.getElementById("bulkApprovePending"),
  previewModal: document.getElementById("adminPreviewModal"),
  closePreview: document.getElementById("closePreview"),
  pushForm: document.getElementById("pushForm"),
  pushTitle: document.getElementById("pushTitle"),
  pushBody: document.getElementById("pushBody"),
  pushUrl: document.getElementById("pushUrl"),
  pushDistrict: document.getElementById("pushDistrict"),
  loadSubscribers: document.getElementById("loadSubscribers"),
  subscriberList: document.getElementById("subscriberList"),
  previewBadge: document.getElementById("previewBadge"),
  previewImage: document.getElementById("previewImage"),
  previewTitle: document.getElementById("previewTitle"),
  previewSummary: document.getElementById("previewSummary"),
  previewBody: document.getElementById("previewBody"),
  previewLanguageSwitch: document.getElementById("previewLanguageSwitch"),
  previewLanguageButtons: document.querySelectorAll("[data-preview-lang]"),
  newsFormSubmit: document.querySelector("#newsForm .primary-btn[type='submit']")
};
let automationCountdownTimer = null;
let activeAdminRequests = 0;
let previewModalState = null;
let previewLanguage = "hi";

function hasAccess() {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === "granted";
}

function setSelectOptions(select, options) {
  if (!select) return;
  const currentValue = select.value;
  select.innerHTML = options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("");
  if (currentValue && options.some((option) => option.value === currentValue)) {
    select.value = currentValue;
  }
}

function ensureSelectValue(select, value) {
  if (!select || !value) return;
  const exists = Array.from(select.options).some((option) => option.value === value);
  if (!exists) {
    select.appendChild(new Option(value, value));
  }
}

function populateCmsTaxonomy() {
  const categoryOptions = CMS_CATEGORIES.map((category) => ({ label: category, value: category }));
  setSelectOptions(fields.newsCategory, categoryOptions);
  setSelectOptions(fields.manualCategory, categoryOptions);
  setSelectOptions(fields.newsCity, CMS_DISTRICTS);
  setSelectOptions(fields.manualCity, CMS_DISTRICTS);
  setSelectOptions(fields.pushDistrict, [{ label: "All districts", value: "" }, ...CMS_DISTRICTS.filter((district) => district.value)]);
}

function districtLabelFromValue(value = "") {
  const match = CMS_DISTRICTS.find((district) => district.value === value);
  return match?.label || "";
}

function categorySlug(value = "") {
  return slugifyAdmin(String(value || ""));
}

function districtRequiredForCategory(category = "") {
  const slug = categorySlug(category);
  return slug === "local-news" || CMS_DISTRICTS.some((district) => district.value && district.value === slug);
}

function validateNewsEditorItem(item, options = {}) {
  const errors = [];
  const category = item.category || "";
  const districtRequired = districtRequiredForCategory(category);
  const headline = item.title || item.titleHi || "";
  const body = item.body || item.bodyHi || "";

  if (!headline.trim()) {
    errors.push("Headline required hai.");
  }

  if (!category.trim()) {
    errors.push("Category required hai.");
  }

  if (districtRequired && !String(item.city || "").trim()) {
    errors.push("Is category ke liye district select karna zaroori hai.");
  }

  if (body.trim().length < 100) {
    errors.push("Body kam se kam 100 characters ka hona chahiye.");
  }

  if (options.focusFirst !== false && errors.length) {
    if (!headline.trim()) {
      fields.newsTitle.focus();
    } else if (!category.trim()) {
      fields.newsCategory.focus();
    } else if (districtRequired && !String(item.city || "").trim()) {
      fields.newsCity?.focus();
    } else if (body.trim().length < 100) {
      fields.newsBody.focus();
    }
  }

  return errors;
}

function publishResultMarkup(item = {}) {
  const title = escapeHTML(item.titleHi || item.title || "Published article");
  const summary = escapeHTML(item.summaryHi || item.summary || "Article is now live on the website.");
  const category = escapeHTML(item.category || "News");
  const district = escapeHTML(item.district || districtLabelFromValue(item.city) || "Chhattisgarh");
  const articleUrl = item.articleUrl ? absolutizeBackendUrl(item.articleUrl) : "";

  return `
    <strong><i class="fa-solid fa-circle-check"></i> Article published successfully</strong>
    <p>${title}</p>
    <p>${summary}</p>
    <div class="publish-result-meta">
      <span>${category}</span>
      <span>${district}</span>
      <span>${escapeHTML(formatDateTime(item.publishedAt || item.createdAt || new Date()))}</span>
    </div>
    <div class="publish-result-actions">
      ${articleUrl ? `<a class="primary-btn" href="${escapeHTML(articleUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> View Article</a>` : ""}
      <button class="ghost-btn" type="button" data-publish-result-edit="${escapeHTML(item._id || "")}"><i class="fa-solid fa-pen"></i> Edit Article</button>
    </div>
  `;
}

function showPublishResult(item = null) {
  if (!fields.publishResult) {
    return;
  }

  if (!item) {
    fields.publishResult.hidden = true;
    fields.publishResult.innerHTML = "";
    return;
  }

  fields.publishResult.hidden = false;
  fields.publishResult.innerHTML = publishResultMarkup(item);
}

function showToast(message, tone = "success", detail = "") {
  if (!fields.adminToastStack) {
    return;
  }

  const toast = document.createElement("article");
  toast.className = `admin-toast ${tone}`;
  toast.innerHTML = `
    <span class="admin-toast-icon" aria-hidden="true">${tone === "success" ? "✓" : "!"}</span>
    <div>
      <strong>${escapeHTML(message)}</strong>
      ${detail ? `<p>${escapeHTML(detail)}</p>` : ""}
    </div>
  `;
  fields.adminToastStack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));
  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => toast.remove(), 220);
  }, 3200);
}

function showToast(message, tone = "success", detail = "") {
  if (!fields.adminToastStack) {
    return;
  }

  const toast = document.createElement("article");
  toast.className = `admin-toast ${tone}`;
  toast.innerHTML = `
    <span class="admin-toast-icon" aria-hidden="true">${tone === "success" ? "\u2713" : "!"}</span>
    <div>
      <strong>${escapeHTML(message)}</strong>
      ${detail ? `<p>${escapeHTML(detail)}</p>` : ""}
    </div>
  `;
  fields.adminToastStack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));
  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => toast.remove(), 220);
  }, 3200);
}

function statusMeta(status = "pending") {
  const key = String(status || "pending").toLowerCase();

  if (key === "published") {
    return { key, label: "PUBLISHED", text: "Published", icon: "\u2713" };
  }

  if (key === "rejected") {
    return { key, label: "REJECTED", text: "Rejected", icon: "!" };
  }

  if (key === "draft") {
    return { key, label: "DRAFT", text: "Draft", icon: "" };
  }

  return { key: "pending", label: "PENDING", text: "Pending", icon: "\u2026" };
}

function statusBadgeMarkup(status = "pending") {
  const meta = statusMeta(status);
  return `<span class="news-item-state ${escapeHTML(meta.key)}">${escapeHTML(`${meta.icon ? `${meta.icon} ` : ""}${meta.label}`)}</span>`;
}

function statusPillMarkup(status = "pending") {
  const meta = statusMeta(status);
  return `<small class="status-${escapeHTML(meta.key)}">${escapeHTML(`${meta.icon ? `${meta.icon} ` : ""}${meta.label}`)}</small>`;
}

function showSavedOutcome(item = {}, fallbackMessage = "News updated.") {
  const meta = statusMeta(item.status || "pending");
  const title = item.titleHi || item.title || item.titleEn || "";
  showStatus(`${fallbackMessage} Status: ${meta.text}.`, "success");
  showToast("Update saved", "success", `${meta.text}${title ? `: ${title}` : ""}`);
}

function setButtonLoading(button, isLoading, nextLabel = "") {
  if (!button) {
    return;
  }

  if (isLoading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = nextLabel || "Saving...";
    return;
  }

  button.disabled = false;
  if (button.dataset.originalHtml) {
    button.innerHTML = button.dataset.originalHtml;
    delete button.dataset.originalHtml;
  }
}

function announceNewsSync(action = "updated", payload = {}) {
  const stamp = Date.now();
  const message = { action, stamp, ...payload };

  try {
    localStorage.setItem(NEWS_SYNC_KEY, JSON.stringify(message));
  } catch (error) {
    // Ignore localStorage write issues; BroadcastChannel may still work.
  }

  newsSyncChannel?.postMessage(message);
}

function handlePublishedArticleSuccess(item, message = "Article published successfully") {
  showPublishResult(item);
  showStatus(message, "success");
  showToast("Article published successfully", "success", item.titleHi || item.title || "");
  announceNewsSync("published", {
    id: item._id,
    slug: item.slug,
    categorySlug: item.categorySlug,
    districtSlug: item.districtSlug || item.city || ""
  });
}

function setAccess(isAllowed) {
  document.body.classList.toggle("locked", !isAllowed);

  if (isAllowed) {
    fields.loginError.textContent = "";
    showStatus("Access granted. You can update and publish news.");
  } else {
    fields.loginPassword.value = "";
    fields.loginUsername.focus();
  }
}

function handleLogin(event) {
  event.preventDefault();

  const username = fields.loginUsername.value.trim();
  const password = fields.loginPassword.value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_SESSION_KEY, "granted");
    setAccess(true);
    return;
  }

  fields.loginError.textContent = "Wrong username or password.";
  fields.loginPassword.value = "";
  fields.loginPassword.focus();
}

function logoutAdmin() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  setAccess(false);
}

function loadState() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY) || "{}";

    if (raw.length > 1500000) {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      showStatus("Old browser backup was too large and has been cleared. Loading from MongoDB.");
      return;
    }

    const saved = JSON.parse(raw);
    state = {
      ...state,
      ...saved,
      topStory: { ...state.topStory, ...(saved.topStory || {}) },
      ticker: Array.isArray(saved.ticker) ? saved.ticker : [],
      news: Array.isArray(saved.news) ? saved.news : []
    };
  } catch (error) {
    showStatus("Saved data could not be loaded. Starting fresh.");
  }
}

function publishState() {
  syncTopStory();
  syncTicker();
  saveLocalState("Saved locally. Publishing to MongoDB...");

  Promise.all([publishTopStoryToApi(), publishNewsListToApi()])
    .then(() => saveLocalState("Published to MongoDB. Open or refresh index.html to see changes."))
    .catch((error) => showStatus(`Saved locally, but MongoDB publish failed: ${error.message}`));
}

function friendlyErrorMessage(message) {
  const cleanMessage = String(message || "")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***")
    .replace(/\s+/g, " ")
    .trim();

  if (/openai/i.test(cleanMessage) && /(incorrect api key|invalid api key|401)/i.test(cleanMessage)) {
    return "OpenAI API key invalid hai. Render Environment me OPENAI_API_KEY update karke service redeploy karo.";
  }

  if (/(413|payload too large|request entity too large)/i.test(cleanMessage)) {
    return "Image bahut badi thi. Chhoti/compressed image try karo, system ab auto-optimize bhi karta hai.";
  }

  return cleanMessage;
}

function statusToneFromMessage(message) {
  const text = friendlyErrorMessage(message).toLowerCase();

  if (/(failed|error|wrong|invalid|denied|missing|could not)/i.test(text)) {
    return "error";
  }

  if (/(loading|upload ho raha|save ho raha|publishing|retrying|run ho raha|refresh ho raha|delete ho rahe|clear ho rahe)/i.test(text)) {
    return "working";
  }

  return "success";
}

function showStatus(message, tone = "") {
  const text = friendlyErrorMessage(message);
  const nextTone = tone || statusToneFromMessage(text);

  if (fields.statusLine) {
    fields.statusLine.dataset.tone = nextTone;
  }

  if (fields.statusLineText) {
    fields.statusLineText.textContent = text;
  } else if (fields.statusLine) {
    fields.statusLine.textContent = text;
  }

  const icon = fields.statusLine?.querySelector(".status-line-icon");
  if (icon) {
    icon.textContent = nextTone === "success" ? "✓" : nextTone === "working" ? "…" : "!";
  }
}

function showStatus(message, tone = "") {
  const text = friendlyErrorMessage(message);
  const nextTone = tone || statusToneFromMessage(text);

  if (fields.statusLine) {
    fields.statusLine.dataset.tone = nextTone;
  }

  if (fields.statusLineText) {
    fields.statusLineText.textContent = text;
  } else if (fields.statusLine) {
    fields.statusLine.textContent = text;
  }

  const icon = fields.statusLine?.querySelector(".status-line-icon");
  if (icon) {
    icon.textContent = nextTone === "success" ? "\u2713" : nextTone === "working" ? "\u2026" : "!";
  }
}

function setAdminLoading(isLoading, message = "Backend se data load ho raha hai...") {
  if (!fields.adminLoading) return;

  activeAdminRequests = Math.max(0, activeAdminRequests + (isLoading ? 1 : -1));

  if (isLoading) {
    if (fields.adminLoadingText) {
      fields.adminLoadingText.textContent = message;
    }
    fields.adminLoading.hidden = false;
    return;
  }

  if (activeAdminRequests === 0) {
    fields.adminLoading.hidden = true;
  }
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function saveLocalState(message) {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(createLocalStateSnapshot()));
  } catch (error) {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (removeError) {
      // Ignore cleanup errors; MongoDB remains the source of truth.
    }

    if (message) {
      showStatus(`${message} Browser backup skipped because local storage is full. MongoDB data is still safe.`);
      return;
    }

    showStatus("Browser backup skipped because local storage is full. MongoDB data is still safe.");
    return;
  }

  if (message) {
    showStatus(message);
  }
}

function compactLocalImage(value) {
  const text = String(value || "");

  if (text.startsWith("data:") || text.length > 1200) {
    return "";
  }

  return text;
}

function backendOrigin() {
  if (!API_BASE_URL) {
    return window.location.origin;
  }

  try {
    return new URL(API_BASE_URL, window.location.href).origin;
  } catch (error) {
    return window.location.origin;
  }
}

function absolutizeBackendUrl(value = "") {
  const text = String(value || "").trim();

  if (!text || text.startsWith("data:")) {
    return text;
  }

  try {
    return new URL(text, backendOrigin()).toString();
  } catch (error) {
    return text;
  }
}

function compactLocalNewsItem(item) {
  return {
    ...item,
    image: compactLocalImage(item.image),
    sourceImage: compactLocalImage(item.sourceImage),
    optimizedThumbnail: compactLocalImage(item.optimizedThumbnail),
    aiThumbnail: compactLocalImage(item.aiThumbnail)
  };
}

function createLocalStateSnapshot() {
  return {
    ...state,
    topStory: compactLocalNewsItem(state.topStory || {}),
    news: (state.news || []).slice(0, 50).map(compactLocalNewsItem)
  };
}

async function apiRequest(path, options = {}) {
  const { loadingMessage, ...fetchOptions } = options;
  setAdminLoading(true, loadingMessage || "Backend se data load ho raha hai...");

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(fetchOptions.headers || {})
      },
      ...fetchOptions
    });

    if (!response.ok) {
      let message = `API error ${response.status}`;

      try {
        const payload = await response.json();
        message = payload.error || message;
      } catch (error) {
        // Keep the status-based message when the response is not JSON.
      }

      throw new Error(friendlyErrorMessage(message));
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } finally {
    setAdminLoading(false);
  }
}

function formatDateTime(value) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCountdown(value) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return "Waiting for schedule";
  }

  const diff = date.getTime() - Date.now();

  if (diff <= 0) {
    return "Due now";
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function startAutomationCountdown(nextRunAt) {
  if (automationCountdownTimer) {
    clearInterval(automationCountdownTimer);
  }

  const update = () => {
    const countdown = document.getElementById("automationCountdown");

    if (countdown) {
      countdown.textContent = formatCountdown(nextRunAt);
    }
  };

  update();
  automationCountdownTimer = setInterval(update, 1000);
}

function setAutomationStatusHTML(html) {
  fields.automationStatus.innerHTML = html;
}

function renderAutomationLogs(logs = []) {
  if (!fields.automationLog) {
    return;
  }

  if (!logs.length) {
    fields.automationLog.innerHTML = '<article><strong>log</strong><p>No automation logs yet.</p><time>Ready</time></article>';
    return;
  }

  fields.automationLog.innerHTML = logs.slice(0, 12).map((log) => `
    <article>
      <strong>${escapeHTML(log.type || "log")}</strong>
      <p>${escapeHTML(log.message || "")}</p>
      <time>${escapeHTML(formatDateTime(log.createdAt))}</time>
    </article>
  `).join("");
}

function renderAutomationSettings(settings) {
  fields.automationEnabled.checked = Boolean(settings.enabled);
  fields.automationQuery.value = settings.query || "";

  const enabledText = settings.enabled ? "Enabled" : "Paused";
  const enabledClass = settings.enabled ? "status-good" : "status-warn";
  const openAiText = settings.openAIConfigured ? "Connected" : "API key missing";
  const openAiClass = settings.openAIConfigured ? "status-good" : "status-warn";
  const runText = settings.running ? "Running now" : settings.lastRunStatus || "never-run";
  const sourceStats = Array.isArray(settings.sourceStats) ? settings.sourceStats : [];
  const failedJobs = Array.isArray(settings.failedJobs) ? settings.failedJobs.length : 0;
  const topSources = sourceStats.slice(0, 3).map((item) => (
    `${item.sourceName}: fresh ${Number(item.fresh || 0)}, pending ${Number(item.pending || 0)}, dup ${Number(item.duplicates || 0)}`
  )).join(" | ");

  setAutomationStatusHTML(`
    <div>
      <strong class="${enabledClass}">${enabledText}</strong>
      <span>Schedule: every ${Number(settings.intervalMinutes || 30)} min</span>
    </div>
    <div>
      <strong>${escapeHTML(runText)}</strong>
      <span>Last run: ${escapeHTML(formatDateTime(settings.lastRunAt))}</span>
    </div>
    <div>
      <strong class="${openAiClass}">OpenAI ${openAiText}</strong>
      <span>Freshness window: ${Number(settings.freshnessWindowHours || 12)} hours</span>
    </div>
    <div>
      <strong>CG local first</strong>
      <span>${Number(settings.localSourceCount || 0)} sources, ${Number(settings.districtSourceCount || 0)} district feeds</span>
    </div>
    <div>
      <strong>Next run</strong>
      <span id="automationCountdown">${escapeHTML(formatCountdown(settings.nextRunAt))}</span>
    </div>
    <div>
      <strong>Pending cleanup</strong>
      <span>Stale removed: ${Number(settings.staleRemoved || 0)}</span>
    </div>
    <div>
      <strong>Failed jobs</strong>
      <span>${failedJobs} saved for retry</span>
    </div>
    <div>
      <strong>MongoDB publish</strong>
      <span>${escapeHTML(settings.lastRunMessage || "Pending-only workflow ready")}</span>
    </div>
    <div class="wide-status">
      <strong>Source stats</strong>
      <span>${escapeHTML(topSources || "Stats appear after the next RSS run.")}</span>
    </div>
  `);
  startAutomationCountdown(settings.nextRunAt);
  renderAutomationLogs(settings.logs || []);
}

function renderDashboard(report = {}) {
  if (!fields.dashboardStats) return;

  const stats = [
    ["Total News", report.totalNews],
    ["Published", report.publishedNews],
    ["Pending", report.pendingReview],
    ["Rejected", report.rejectedNews],
    ["Views", report.views],
    ["Clicks", report.clicks],
    ["Today", report.todayNews],
    ["Ads Active", `${Number(report.activeAds || 0)}/${Number(report.totalAds || 0)}`],
    ["Subscribers", report.subscribers],
    ["Failed Jobs", report.failedJobs],
    ["AI News", report.aiNews],
    ["Manual News", report.manualNews]
  ];

  fields.dashboardStats.innerHTML = stats.map(([label, value]) => `
    <article>
      <strong>${escapeHTML(value ?? 0)}</strong>
      <span>${escapeHTML(label)}</span>
    </article>
  `).join("");

  const trending = Array.isArray(report.trendingArticles) ? report.trendingArticles : [];
  fields.dashboardTrending.innerHTML = trending.length
    ? trending.slice(0, 6).map((item) => `
      <article>
        <strong>${escapeHTML(item.titleHi || item.title || "Untitled")}</strong>
        <span>${escapeHTML(item.category || "News")} • ${escapeHTML(item.city || "All")}</span>
      </article>
    `).join("")
    : `<article><strong>No trending report yet.</strong><span>Views/clicks ke baad yaha data aayega.</span></article>`;

  const logs = Array.isArray(report.automationLogs) ? report.automationLogs : [];
  fields.dashboardLogs.innerHTML = logs.length
    ? logs.slice(0, 6).map((log) => `
      <article>
        <strong>${escapeHTML(log.type || "log")}</strong>
        <span>${escapeHTML(log.message || "")}</span>
        <time>${escapeHTML(formatDateTime(log.createdAt))}</time>
      </article>
    `).join("")
    : `<article><strong>No logs yet.</strong><span>Automation run ke baad yaha logs dikhenge.</span></article>`;
}

async function loadDashboard() {
  if (!fields.dashboardStats) return;

  try {
    renderDashboard(await apiRequest("/api/dashboard/analytics", {
      loadingMessage: "Dashboard report load ho raha hai..."
    }));
  } catch (error) {
    fields.dashboardStats.innerHTML = `<article><strong>Offline</strong><span>${escapeHTML(error.message)}</span></article>`;
  }
}

function linesToItems(value, mapper) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((part) => part.trim()))
    .map(mapper)
    .filter(Boolean);
}

function renderSiteSettings(settings = {}) {
  if (!fields.weatherSettings) {
    return;
  }

  fields.weatherSettings.value = (settings.weather || [])
    .map((item) => [item.city, item.temp, item.condition].filter(Boolean).join(" | "))
    .join("\n");
  fields.marketSettings.value = (settings.market || [])
    .map((item) => [item.name, item.value, item.change].filter(Boolean).join(" | "))
    .join("\n");
  fields.videoSettings.value = (settings.videos || [])
    .map((item) => [item.title, item.url, item.type, item.thumbnail].filter(Boolean).join(" | "))
    .join("\n");
  fields.headerAdCode.value = settings.ads?.header || "";
  fields.sidebarAdCode.value = settings.ads?.sidebar || "";
  fields.articleAdCode.value = settings.ads?.inArticle || "";
  fields.footerAdCode.value = settings.ads?.footer || "";
  fields.notificationTitle.value = settings.notification?.title || "";
  fields.notificationDescription.value = settings.notification?.description || "";
}

function slugifyAdmin(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = source;
  });
}

async function fileToOptimizedDataUrl(file, options = {}) {
  if (!file) return "";

  if (!file.type.startsWith("image/") || /gif|svg/i.test(file.type)) {
    return fileToDataUrl(file);
  }

  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.84
  } = options;
  const source = await fileToDataUrl(file);
  const image = await loadImageElement(source);
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const mimeType = /png/i.test(file.type) ? "image/png" : "image/jpeg";
  return canvas.toDataURL(mimeType, quality);
}

async function uploadImage(file) {
  if (!file) return "";
  const dataUrl = await fileToOptimizedDataUrl(file);
  const result = await apiRequest("/api/uploads", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, dataUrl }),
    loadingMessage: "Image upload ho raha hai..."
  });
  return {
    ...result,
    url: absolutizeBackendUrl(result.absoluteUrl || result.url || result.previewUrl),
    previewUrl: absolutizeBackendUrl(result.absolutePreviewUrl || result.previewUrl || result.url),
    apiUrl: absolutizeBackendUrl(result.absoluteApiUrl || result.apiUrl)
  };
}

async function uploadAndFill(input, targetField, label) {
  const file = input?.files?.[0];

  if (!file || !targetField) {
    return;
  }

  input.disabled = true;
  showStatus(`${label} upload ho raha hai...`);

  try {
    const uploaded = await uploadImage(file);
    targetField.value = uploaded.url;
    input.value = "";
    showStatus(`${label} uploaded. Ab Save dabayein.`);
  } catch (error) {
    showStatus(`${label} upload failed: ${error.message}`);
  } finally {
    input.disabled = false;
  }
}

function clearAdForm() {
  if (!fields.adForm) return;
  fields.adId.value = "";
  fields.adTitle.value = "";
  fields.adPosition.value = "homepage";
  fields.adTarget.value = "all";
  fields.adEnabled.checked = true;
  fields.adImage.value = "";
  fields.adLinkUrl.value = "";
  fields.adCode.value = "";
  if (fields.adUpload) fields.adUpload.value = "";
}

function fillAdForm(ad) {
  fields.adId.value = ad._id || "";
  fields.adTitle.value = ad.title || "";
  fields.adPosition.value = ad.position || "homepage";
  fields.adTarget.value = ad.target || "all";
  fields.adEnabled.checked = Boolean(ad.enabled);
  fields.adImage.value = ad.image || "";
  fields.adLinkUrl.value = ad.linkUrl || "";
  fields.adCode.value = ad.adsenseCode || "";
}

function renderAds() {
  if (!fields.adList) return;
  fields.adList.innerHTML = state.ads.length ? "" : `<div class="news-item"><strong>No ads saved yet.</strong><p>Create header, article, sidebar or mobile sticky ad.</p></div>`;
  state.ads.forEach((ad) => {
    const card = document.createElement("article");
    card.className = "news-item";
    card.innerHTML = `
      <span>${escapeHTML(ad.position || "ad")}</span>
      <strong>${escapeHTML(ad.title || "Advertisement")}</strong>
      <div class="news-item-meta">
        <small class="${ad.enabled ? "status-published" : "status-rejected"}">${ad.enabled ? "ENABLED" : "DISABLED"}</small>
        <small>${escapeHTML(ad.target || "all")}</small>
        ${ad.title ? "<small>TEXT</small>" : ""}
        ${ad.adsenseCode ? "<small>ADSENSE CODE</small>" : ""}
        ${ad.image ? "<small>BANNER IMAGE</small>" : ""}
      </div>
      <div class="item-actions">
        <button type="button" data-ad-edit="${escapeHTML(ad._id)}"><i class="fa-solid fa-pen"></i> Edit</button>
        <button type="button" data-ad-preview="${escapeHTML(ad._id)}"><i class="fa-solid fa-eye"></i> Preview</button>
        <button type="button" data-ad-delete="${escapeHTML(ad._id)}"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>`;
    fields.adList.appendChild(card);
  });
}

async function loadAds() {
  if (!fields.adList) return;
  try {
    state.ads = (await apiRequest("/api/ads")).map((ad) => ({
      ...ad,
      image: absolutizeBackendUrl(ad.image || "")
    }));
    renderAds();
  } catch (error) {
    showStatus(`Ad Manager load failed: ${error.message}`);
  }
}

async function saveAd(event) {
  event.preventDefault();
  try {
    const uploadedUrl = fields.adUpload?.files?.[0] ? (await uploadImage(fields.adUpload.files[0])).url : "";
    const payload = {
      title: fields.adTitle.value.trim(),
      position: fields.adPosition.value,
      target: fields.adTarget.value,
      enabled: fields.adEnabled.checked,
      image: uploadedUrl || fields.adImage.value.trim(),
      linkUrl: fields.adLinkUrl.value.trim(),
      adsenseCode: fields.adCode.value.trim()
    };
    const id = fields.adId.value;
    await apiRequest(id ? `/api/ads/${id}` : "/api/ads", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
      loadingMessage: "Ad update save ho raha hai..."
    });
    showStatus("Ad saved. Refresh website to see placement update.");
    clearAdForm();
    await loadAds();
    await loadDashboard();
  } catch (error) {
    showStatus(`Ad save failed: ${error.message}`);
  }
}

async function deleteCurrentAd() {
  const id = fields.adId.value;
  if (!id) return clearAdForm();
  await apiRequest(`/api/ads/${id}`, { method: "DELETE" });
  showStatus("Ad deleted.");
  clearAdForm();
  await loadAds();
  await loadDashboard();
}

function clearManualForm() {
  if (!fields.manualNewsForm) return;
  fields.manualId.value = "";
  fields.manualTitleHi.value = "";
  fields.manualTitleEn.value = "";
  fields.manualCategory.value = "Durg";
  fields.manualCity.value = "";
  fields.manualStatus.value = "draft";
  fields.manualSlug.value = "";
  fields.manualImage.value = "";
  fields.manualSummaryHi.value = "";
  if (fields.manualSummaryEn) fields.manualSummaryEn.value = "";
  fields.manualBodyHi.value = "";
  if (fields.manualBodyEn) fields.manualBodyEn.value = "";
  fields.manualMetaTitle.value = "";
  fields.manualMetaDescription.value = "";
  fields.manualBreaking.checked = false;
  fields.manualTrending.checked = false;
  fields.manualFeatured.checked = false;
  if (fields.manualUpload) fields.manualUpload.value = "";
}

function fillManualForm(item) {
  fields.manualId.value = item._id || "";
  fields.manualTitleHi.value = item.titleHi || item.title || "";
  fields.manualTitleEn.value = item.titleEn || "";
  ensureSelectValue(fields.manualCategory, item.category);
  ensureSelectValue(fields.manualCity, item.city);
  fields.manualCategory.value = item.category || "Durg";
  fields.manualCity.value = item.city || "";
  fields.manualStatus.value = item.status || "draft";
  fields.manualSlug.value = item.slug || "";
  fields.manualImage.value = item.image || "";
  fields.manualSummaryHi.value = item.summaryHi || item.summary || "";
  if (fields.manualSummaryEn) fields.manualSummaryEn.value = item.summaryEn || "";
  fields.manualBodyHi.value = item.bodyHi || item.body || "";
  if (fields.manualBodyEn) fields.manualBodyEn.value = item.bodyEn || "";
  fields.manualMetaTitle.value = item.metaTitle || "";
  fields.manualMetaDescription.value = item.metaDescription || "";
  fields.manualBreaking.checked = Boolean(item.breaking);
  fields.manualTrending.checked = Boolean(item.trending);
  fields.manualFeatured.checked = Boolean(item.featured);
}

function manualPayload(imageUrl = "") {
  const titleHi = fields.manualTitleHi.value.trim();
  const image = imageUrl || fields.manualImage.value.trim();
  return {
    title: titleHi,
    titleHi,
    titleEn: fields.manualTitleEn.value.trim(),
    summary: fields.manualSummaryHi.value.trim(),
    summaryHi: fields.manualSummaryHi.value.trim(),
    summaryEn: fields.manualSummaryEn?.value.trim() || "",
    body: fields.manualBodyHi.value.trim(),
    bodyHi: fields.manualBodyHi.value.trim(),
    bodyEn: fields.manualBodyEn?.value.trim() || "",
    category: fields.manualCategory.value,
    city: fields.manualCity.value,
    status: fields.manualStatus.value,
    slug: fields.manualSlug.value.trim() || slugifyAdmin(titleHi),
    image,
    sourceImage: image,
    metaTitle: fields.manualMetaTitle.value.trim(),
    metaDescription: fields.manualMetaDescription.value.trim(),
    breaking: fields.manualBreaking.checked,
    trending: fields.manualTrending.checked,
    featured: fields.manualFeatured.checked,
    language: "hi",
    sourceName: "Khabri Junction Desk",
    automated: false
  };
}

function renderManualNews() {
  if (!fields.manualNewsList) return;
  fields.manualNewsList.innerHTML = state.manualNews.length ? "" : `<div class="news-item"><strong>No manual news yet.</strong><p>Manual published news will show first on homepage.</p></div>`;
  state.manualNews.forEach((item) => {
    const card = document.createElement("article");
    card.className = "news-item";
    const status = item.status || "draft";
    card.innerHTML = `
      <span>${escapeHTML(item.categoryBadge || item.category || "MANUAL")}</span>
      <div class="news-item-head">
        <strong>${escapeHTML(item.titleHi || item.title)}</strong>
        ${statusBadgeMarkup(status)}
      </div>
      <div class="news-item-meta">
        ${statusPillMarkup(status)}
        <small>${escapeHTML(item.city || "no district")}</small>
        <small>Views ${Number(item.views || 0)}</small>
        <small>Clicks ${Number(item.clicks || 0)}</small>
      </div>
      <p>${escapeHTML(item.summaryHi || item.summary || "")}</p>
      <div class="item-actions">
        <button type="button" data-manual-preview="${escapeHTML(item._id)}"><i class="fa-solid fa-eye"></i> Preview</button>
        <button type="button" data-manual-edit="${escapeHTML(item._id)}"><i class="fa-solid fa-pen"></i> Edit</button>
        <button type="button" data-manual-delete="${escapeHTML(item._id)}"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>`;
    fields.manualNewsList.appendChild(card);
  });
}

async function loadManualNews() {
  if (!fields.manualNewsList) return;
  try {
    state.manualNews = await apiRequest("/api/manual-news?all=true&limit=200");
    renderManualNews();
  } catch (error) {
    showStatus(`Manual CMS load failed: ${error.message}`);
  }
}

async function saveManualNews(event) {
  event.preventDefault();
  try {
    const uploadedUrl = fields.manualUpload?.files?.[0] ? (await uploadImage(fields.manualUpload.files[0])).url : "";
    const id = fields.manualId.value;
    const saved = await apiRequest(id ? `/api/manual-news/${id}` : "/api/manual-news", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(manualPayload(uploadedUrl)),
      loadingMessage: "Manual news save ho raha hai..."
    });
    if ((saved.status || "draft") === "published") {
      showStatus("Manual news published. Homepage priority is active.", "success");
      showToast("Article published successfully", "success", saved.titleHi || saved.title || "");
      announceNewsSync("published", {
        id: saved._id,
        slug: saved.slug,
        categorySlug: saved.categorySlug,
        districtSlug: saved.districtSlug || saved.city || ""
      });
    } else {
      showSavedOutcome(saved, "Manual news saved.");
    }
    clearManualForm();
    await loadManualNews();
    await loadDashboard();
  } catch (error) {
    showStatus(`Manual news save failed: ${error.message}`);
  }
}

function previewMarkupFromText(text = "") {
  return `<p>${escapeHTML(text || "")}</p>`;
}

function renderPreviewModalLanguage() {
  if (!previewModalState) {
    return;
  }

  const copy = previewModalState.localized?.[previewLanguage]
    || previewModalState.localized?.hi
    || previewModalState.localized?.en
    || {};

  fields.previewTitle.textContent = copy.title || previewModalState.title || "Preview";
  fields.previewSummary.textContent = copy.summary || previewModalState.summary || "";
  fields.previewBody.innerHTML = copy.bodyHtml || previewModalState.bodyHtml || previewMarkupFromText(previewModalState.bodyText || "");
  fields.previewLanguageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.previewLang === previewLanguage);
  });
}

function setPreviewLanguage(language = "hi") {
  previewLanguage = language === "en" ? "en" : "hi";
  renderPreviewModalLanguage();
}

function previewMetaMarkup(item = {}) {
  const meta = statusMeta(item.status || "pending");
  const district = item.district || districtLabelFromValue(item.city) || "";
  const date = item.publishedAt || item.updatedAt || item.createdAt || item.sourcePublishedAt || "";
  const chips = [
    `${meta.icon ? `${meta.icon} ` : ""}${meta.label}`,
    item.category || item.categoryBadge || item.tag || "",
    district,
    date ? formatDateTime(date) : ""
  ].filter(Boolean);

  return chips.length
    ? `<div class="preview-meta">${chips.map((chip) => `<span>${escapeHTML(chip)}</span>`).join("")}</div>`
    : "";
}

function openPreviewModal({ badge = "PREVIEW", image = "", title = "", summary = "", bodyHtml = "", bodyText = "", localized = null, defaultLanguage = "hi", status = "" }) {
  const meta = statusMeta(status || "pending");
  previewModalState = {
    badge,
    image,
    title,
    summary,
    bodyHtml,
    bodyText,
    localized
  };

  fields.previewBadge.textContent = badge;
  fields.previewBadge.className = status ? `preview-status-${meta.key}` : "";
  fields.previewLanguageSwitch.hidden = !localized;

  if (image) {
    fields.previewImage.onerror = () => {
      fields.previewImage.onerror = null;
      fields.previewImage.src = fallbackImage;
      fields.previewImage.alt = "";
      fields.previewImage.classList.add("is-fallback");
    };
    fields.previewImage.classList.remove("is-fallback");
    fields.previewImage.src = image;
    fields.previewImage.alt = "";
    fields.previewImage.hidden = false;
  } else {
    fields.previewImage.onerror = null;
    fields.previewImage.hidden = true;
  }

  setPreviewLanguage(localized ? defaultLanguage : "hi");
  fields.previewModal.classList.add("open");
  fields.previewModal.setAttribute("aria-hidden", "false");
}

function previewManualNews() {
  const payload = manualPayload();
  const meta = previewMetaMarkup(payload);
  openPreviewModal({
    badge: payload.category || "MANUAL",
    image: payload.image || fallbackImage,
    status: payload.status || "pending",
    localized: {
      hi: {
        title: payload.titleHi || payload.title,
        summary: payload.summaryHi || "",
        bodyHtml: `${meta}${previewMarkupFromText(payload.bodyHi || "")}`
      },
      en: {
        title: payload.titleEn || payload.title,
        summary: payload.summaryEn || "",
        bodyHtml: `${meta}${previewMarkupFromText(payload.bodyEn || payload.bodyHi || "")}`
      }
    }
  });
}

function previewNewsDraft() {
  const badge = fields.newsTag.value.trim() || fields.newsCategory.value || "PREVIEW";
  const status = fields.newsStatus.value || "pending";
  const meta = previewMetaMarkup({
    status,
    category: fields.newsCategory.value || badge,
    city: fields.newsCity.value || ""
  });

  openPreviewModal({
    badge,
    image: fields.newsImage.value.trim() || fallbackImage,
    status,
    localized: {
      hi: {
        title: fields.newsTitleHi.value.trim() || fields.newsTitle.value.trim(),
        summary: fields.newsSummaryHi.value.trim() || fields.newsSummary.value.trim(),
        bodyHtml: `${meta}${previewMarkupFromText(fields.newsBodyHi.value.trim() || fields.newsBody.value.trim())}`
      },
      en: {
        title: fields.newsTitle.value.trim() || fields.newsTitleHi.value.trim(),
        summary: fields.newsSummary.value.trim() || fields.newsSummaryHi.value.trim(),
        bodyHtml: `${meta}${previewMarkupFromText(fields.newsBody.value.trim() || fields.newsBodyHi.value.trim())}`
      }
    }
  });
}

function previewAdItem(ad = null) {
  const payload = ad || {
    title: fields.adTitle.value.trim() || "Advertisement",
    position: fields.adPosition.value || "homepage",
    target: fields.adTarget.value || "all",
    image: absolutizeBackendUrl(fields.adImage.value.trim()),
    linkUrl: fields.adLinkUrl.value.trim(),
    adsenseCode: fields.adCode.value.trim(),
    enabled: fields.adEnabled.checked
  };
  const bodyHtml = `
    <strong>Position</strong><p>${escapeHTML(payload.position || "homepage")}</p>
    <strong>Target</strong><p>${escapeHTML(payload.target || "all")}</p>
    ${payload.linkUrl ? `<strong>Link</strong><p>${escapeHTML(payload.linkUrl)}</p>` : ""}
    ${payload.title ? `<strong>Text</strong><p>${escapeHTML(payload.title)}</p>` : ""}
    ${payload.image ? "<p>Banner image preview with text active.</p>" : "<p>Text-only ad preview</p>"}
    ${payload.adsenseCode ? `<strong>Ad Code</strong><pre>${escapeHTML(payload.adsenseCode)}</pre>` : ""}
  `;

  openPreviewModal({
    badge: payload.enabled === false ? "DISABLED AD" : "AD PREVIEW",
    image: payload.image || fallbackImage,
    title: payload.title || "Advertisement",
    summary: payload.linkUrl || "Ad banner preview",
    bodyHtml
  });
}

async function deleteCurrentManualNews() {
  const id = fields.manualId.value;
  if (!id) return clearManualForm();
  await apiRequest(`/api/manual-news/${id}`, { method: "DELETE" });
  showStatus("Manual news deleted.");
  clearManualForm();
  await loadManualNews();
  await loadDashboard();
}

async function loadSubscribers() {
  if (!fields.subscriberList) return;

  try {
    const result = await apiRequest("/api/push/subscribers", {
      loadingMessage: "Subscribers load ho rahe hain..."
    });
    const items = Array.isArray(result.items) ? result.items : [];
    fields.subscriberList.innerHTML = items.length ? "" : `<div class="news-item"><strong>No subscribers yet.</strong><p>Website par notification subscribe hone ke baad list yaha dikhegi.</p></div>`;
    items.slice(0, 80).forEach((item) => {
      const card = document.createElement("article");
      card.className = "news-item";
      card.innerHTML = `
        <span>${item.active ? "ACTIVE" : "INACTIVE"}</span>
        <strong>${escapeHTML(item.platform || "web")} subscriber</strong>
        <div class="news-item-meta">
          <small>${escapeHTML(item.language || "hi")}</small>
          <small>${escapeHTML(item.district || "all districts")}</small>
          <small>${escapeHTML(formatDateTime(item.updatedAt || item.createdAt))}</small>
        </div>`;
      fields.subscriberList.appendChild(card);
    });
    showStatus(`Subscribers loaded: ${Number(result.active || 0)} active / ${Number(result.total || 0)} total.`);
  } catch (error) {
    showStatus(`Subscriber load failed: ${error.message}`);
  }
}

async function sendPushNotification(event) {
  event.preventDefault();

  const payload = {
    title: fields.pushTitle.value.trim(),
    body: fields.pushBody.value.trim(),
    url: fields.pushUrl.value.trim() || "/category/breaking",
    district: fields.pushDistrict.value
  };

  if (!payload.title || !payload.body) {
    showStatus("Notification title aur message dono required hain.");
    return;
  }

  try {
    const result = await apiRequest("/api/push/send", {
      method: "POST",
      body: JSON.stringify(payload),
      loadingMessage: "Notification send ho raha hai..."
    });
    showStatus(result.skipped
      ? `Notification skipped: ${result.reason || "Firebase/subscriber setup pending"}`
      : `Notification sent: ${Number(result.sent || 0)} sent, ${Number(result.failed || 0)} failed.`);
    await loadSubscribers();
    await loadDashboard();
  } catch (error) {
    showStatus(`Notification send failed: ${error.message}`);
  }
}

async function loadSiteSettings() {
  if (!fields.weatherSettings) {
    return;
  }

  try {
    renderSiteSettings(await apiRequest("/api/site-settings"));
  } catch (error) {
    showStatus(`Site settings load failed: ${error.message}`);
  }
}

async function saveSiteSettings() {
  const payload = {
    weather: linesToItems(fields.weatherSettings.value, ([city, temp, condition]) => city ? { city, temp, condition } : null),
    market: linesToItems(fields.marketSettings.value, ([name, value, change]) => name ? { name, value, change } : null),
    videos: linesToItems(fields.videoSettings.value, ([title, url, type, thumbnail]) => title ? { title, url, type, thumbnail } : null),
    ads: {
      header: fields.headerAdCode.value,
      sidebar: fields.sidebarAdCode.value,
      inArticle: fields.articleAdCode.value,
      footer: fields.footerAdCode.value
    },
    notification: {
      enabled: true,
      title: fields.notificationTitle.value,
      description: fields.notificationDescription.value
    }
  };

  try {
    renderSiteSettings(await apiRequest("/api/site-settings", {
      method: "PUT",
      body: JSON.stringify(payload)
    }));
    showStatus("Site settings saved. Refresh homepage to see updates.");
  } catch (error) {
    showStatus(`Site settings save failed: ${error.message}`);
  }
}

async function loadAutomationSettings() {
  try {
    const settings = await apiRequest("/api/automation");
    renderAutomationSettings(settings);
  } catch (error) {
    setAutomationStatusHTML(`
      <div>
        <strong class="status-warn">API offline</strong>
        <span>${escapeHTML(error.message)}</span>
      </div>
      <div>
        <strong>MongoDB needed</strong>
        <span>Start localhost:3000 server</span>
      </div>
      <div>
        <strong>OpenAI</strong>
        <span>Add OPENAI_API_KEY in .env</span>
      </div>
      <div>
        <strong>Automation</strong>
        <span>Controls unlock after API connects</span>
      </div>
    `);
    renderAutomationLogs([]);
  }
}

async function saveAutomationSettings() {
  fields.saveAutomation.disabled = true;
  showStatus("Saving AI automation settings...");

  try {
    const settings = await apiRequest("/api/automation", {
      method: "PUT",
      body: JSON.stringify({
        enabled: fields.automationEnabled.checked,
        query: fields.automationQuery.value.trim()
      })
    });

    renderAutomationSettings(settings);
    showStatus("AI automation settings saved.");
  } catch (error) {
    showStatus(`Automation save failed: ${error.message}`);
    await loadAutomationSettings();
  } finally {
    fields.saveAutomation.disabled = false;
  }
}

async function runAutomationNow() {
  fields.runAutomationNow.disabled = true;
  showStatus("Running AI news automation now...");

  try {
    const result = await apiRequest("/api/automation/run", {
      method: "POST",
      body: JSON.stringify({ limit: 8 })
    });

    renderAutomationSettings(result.settings);
    showStatus(`AI automation complete. Fetched ${result.fetched || 0}, generated ${result.generated || 0}, pending ${result.pending || result.created || 0}, duplicates ${result.duplicates || result.skipped || 0}, errors ${result.errors.length}.`);

    if (result.errors.length) {
      setAutomationStatusHTML(`
        <div>
          <strong class="status-warn">Completed with errors</strong>
          <span>${escapeHTML(result.errors.slice(0, 2).map(friendlyErrorMessage).join(" | "))}</span>
        </div>
        <div>
          <strong>Pending ${Number(result.pending || result.created || 0)}</strong>
          <span>Review before publishing</span>
        </div>
        <div>
          <strong>Duplicates ${Number(result.duplicates || result.skipped || 0)}</strong>
          <span>Duplicates prevented</span>
        </div>
        <div>
          <strong>Next run</strong>
          <span>Every 30 minutes when enabled</span>
        </div>
      `);
      renderAutomationLogs(result.settings?.logs || []);
    }

    await loadStateFromApi();
  } catch (error) {
    showStatus(`AI automation failed: ${error.message}`);
    await loadAutomationSettings();
  } finally {
    fields.runAutomationNow.disabled = false;
  }
}

async function runLastFailedJobs() {
  if (!fields.runFailedJobs) {
    return;
  }

  fields.runFailedJobs.disabled = true;
  showStatus("Retrying last failed AI jobs...");

  try {
    const result = await apiRequest("/api/automation/run-failed", {
      method: "POST",
      body: JSON.stringify({ limit: 8 })
    });

    renderAutomationSettings(result.settings);
    showStatus(`Failed jobs retry complete. Generated ${result.generated || 0}, pending ${result.pending || result.created || 0}, errors ${result.errors.length}.`);
    await loadStateFromApi();
  } catch (error) {
    showStatus(`Failed jobs retry failed: ${error.message}`);
    await loadAutomationSettings();
  } finally {
    fields.runFailedJobs.disabled = false;
  }
}

function inferCity(value) {
  const text = String(value || "").toLowerCase();
  const cities = CMS_DISTRICTS.map((district) => district.value).filter(Boolean);

  return cities.find((city) => text.includes(city)) || "";
}

function hasHindiText(value) {
  return /[\u0900-\u097F]/.test(String(value || ""));
}

function isLikelyEnglishCopy(value) {
  const text = String(value || "").trim();
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  const hindi = (text.match(/[\u0900-\u097F]/g) || []).length;
  return latin >= Math.max(6, hindi * 3);
}

function sourceLanguageOfNews(item = {}) {
  return item.language || (hasHindiText(`${item.titleHi || item.title || ""} ${item.summaryHi || item.summary || ""} ${item.bodyHi || item.body || ""}`) ? "hi" : "en");
}

function detectCategory(value) {
  const text = String(value || "").toLowerCase();
  const rules = [
    ["Raipur Promotion", ["raipur promotion", "promotion", "sponsored", "advertorial"]],
    ["Market", ["market", "sensex", "nifty", "stock", "share market"]],
    ["Weather", ["weather", "temperature", "rain", "mausam"]],
    ["Viral Videos", ["viral", "video", "reel", "youtube", "shorts"]],
    ["Local News", ["local", "district", "ward", "nagar"]],
    ["MP Shahdol", ["shahdol", "mp shahdol"]],
    ["World", ["world", "global", "international", "foreign", "desh duniya"]],
    ["Sports", ["ipl", "cricket", "football", "match", "tournament", "sports"]],
    ["Astrology", ["rashifal", "astrology", "horoscope", "zodiac"]],
    ["Crime", ["murder", "police", "theft", "crime", "arrest"]],
    ["Politics", ["government", "minister", "election", "politics"]],
    ["Entertainment", ["film", "movie", "cinema", "actor", "entertainment"]],
    ["Education", ["education", "school", "college", "exam", "admission"]],
    ["Business", ["business", "startup", "industry", "trade"]],
    ["Agriculture", ["agriculture", "farmer", "crop", "mandi", "farming"]],
    ["Technology", ["technology", "digital", "ai", "app", "tech"]],
    ["Lifestyle", ["lifestyle", "fashion", "food", "travel"]],
    ["Health", ["health", "hospital", "doctor", "medical"]],
    ["Jobs", ["job", "jobs", "recruitment", "vacancy"]],
    ...CMS_DISTRICTS
      .filter((district) => district.value)
      .map((district) => [district.label, [district.value, district.label.toLowerCase()]])
  ];
  const directCategory = CMS_CATEGORIES.find((category) => {
    const categoryText = category.toLowerCase();
    const categorySlug = slugifyAdmin(category).replace(/-/g, " ");
    return text.includes(categoryText) || text.includes(categorySlug);
  });
  const match = rules.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));

  return directCategory || (match ? match[0] : "Breaking");
}

function apiToAdminItem(news) {
  const sourceLanguage = sourceLanguageOfNews(news);
  return {
    _id: news._id,
    tag: news.categoryBadge || news.tag || news.category || "UPDATE",
    category: news.category || news.tag || "UPDATE",
    categorySlug: news.categorySlug || "",
    categoryPage: absolutizeBackendUrl(news.categoryPage || ""),
    categoryBadge: news.categoryBadge || news.tag || news.category || "UPDATE",
    city: news.city || "",
    district: news.district || districtLabelFromValue(news.city) || "",
    districtSlug: news.districtSlug || news.city || "",
    districtPage: absolutizeBackendUrl(news.districtPage || ""),
    image: absolutizeBackendUrl(news.image || "") || fallbackImage,
    sourceImage: absolutizeBackendUrl(news.sourceImage || ""),
    optimizedThumbnail: absolutizeBackendUrl(news.optimizedThumbnail || ""),
    aiThumbnail: absolutizeBackendUrl(news.aiThumbnail || ""),
    thumbnailHash: news.thumbnailHash || "",
    thumbnailStatus: news.thumbnailStatus || "",
    title: news.title || "",
    titleEn: news.titleEn || (sourceLanguage === "en" ? news.title || "" : ""),
    titleHi: news.titleHi || (sourceLanguage === "hi" ? news.title || "" : ""),
    summary: news.summary || "",
    summaryEn: news.summaryEn || (sourceLanguage === "en" ? news.summary || "" : ""),
    summaryHi: news.summaryHi || (sourceLanguage === "hi" ? news.summary || "" : ""),
    body: news.body || "",
    bodyEn: news.bodyEn || (sourceLanguage === "en" ? news.body || "" : ""),
    bodyHi: news.bodyHi || (sourceLanguage === "hi" ? news.body || "" : ""),
    status: news.status || "pending",
    breaking: Boolean(news.breaking),
    featured: Boolean(news.featured),
    trending: Boolean(news.trending),
    language: news.language || "en",
    createdAt: news.createdAt,
    publishedAt: news.publishedAt,
    sourceName: news.sourceName || "",
    feedSourceName: news.feedSourceName || "",
    sourceCredit: news.sourceCredit || news.sourceName || news.feedSourceName || "",
    sourcePublishedAt: news.sourcePublishedAt,
    freshnessScore: news.freshnessScore,
    slug: news.slug || "",
    articleUrl: absolutizeBackendUrl(news.articleUrl || ""),
    translationStatus: news.translationStatus || "",
    translationError: news.translationError || ""
  };
}

function apiToTopStory(news) {
  const sourceLanguage = sourceLanguageOfNews(news);
  return {
    _id: news._id,
    enabled: true,
    kicker: news.category || news.tag || "FEATURED",
    kickerHi: "",
    title: news.title || "",
    titleEn: news.titleEn || (sourceLanguage === "en" ? news.title || "" : ""),
    titleHi: news.titleHi || (sourceLanguage === "hi" ? news.title || "" : ""),
    summary: news.summary || "",
    summaryEn: news.summaryEn || (sourceLanguage === "en" ? news.summary || "" : ""),
    summaryHi: news.summaryHi || (sourceLanguage === "hi" ? news.summary || "" : ""),
    body: news.body || "",
    bodyEn: news.bodyEn || (sourceLanguage === "en" ? news.body || "" : ""),
    bodyHi: news.bodyHi || (sourceLanguage === "hi" ? news.body || "" : ""),
    image: absolutizeBackendUrl(news.image || ""),
    status: news.status || "published",
    breaking: Boolean(news.breaking),
    featured: true,
    trending: Boolean(news.trending),
    language: news.language || "en"
  };
}

function newsPayload(item, overrides = {}) {
  const category = overrides.category || item.category || item.tag || "Breaking";
  const language = sourceLanguageOfNews(item);

  return {
    title: item.title || item.titleEn || item.titleHi || "",
    titleEn: item.titleEn || (language === "en" ? item.title : "") || "",
    summary: item.summary || item.summaryEn || item.summaryHi || "",
    summaryEn: item.summaryEn || (language === "en" ? item.summary : "") || "",
    body: item.body || item.bodyEn || item.bodyHi || item.summary || "",
    bodyEn: item.bodyEn || (language === "en" ? item.body : "") || item.summaryEn || "",
    category,
    city: item.city || inferCity(`${category} ${item.title} ${item.summary}`),
    image: item.image || fallbackImage,
    sourceImage: item.sourceImage || "",
    optimizedThumbnail: item.optimizedThumbnail || "",
    aiThumbnail: item.aiThumbnail || "",
    thumbnailHash: item.thumbnailHash || "",
    thumbnailStatus: item.thumbnailStatus || "",
    status: item.status || "pending",
    breaking: Boolean(item.breaking),
    featured: Boolean(item.featured),
    trending: Boolean(item.trending),
    language,
    titleHi: item.titleHi || (language === "hi" ? item.title : "") || "",
    summaryHi: item.summaryHi || (language === "hi" ? item.summary : "") || "",
    bodyHi: item.bodyHi || (language === "hi" ? item.body : "") || "",
    tag: item.categoryBadge || item.tag || category,
    categoryBadge: item.categoryBadge || item.tag || category,
    sourceCredit: item.sourceCredit || item.sourceName || item.feedSourceName || "",
    ...overrides
  };
}

async function loadStateFromApi() {
  try {
    const news = await apiRequest("/api/news?all=true");
    const featured = news.find((item) => item.featured && item.status === "published");

    if (featured) {
      state.topStory = apiToTopStory(featured);
    }

    state.news = news.filter((item) => !item.featured).map(apiToAdminItem);
    fillTopStory();
    renderNewsList();
    showStatus("MongoDB connected. News loaded from database.");
    saveLocalState();
  } catch (error) {
    showStatus(`MongoDB API not connected. Using browser fallback. ${error.message}`);
  }
}

async function publishTopStoryToApi() {
  if (!state.topStory.enabled || !state.topStory.title) {
    return;
  }

  const payload = newsPayload(
    {
      ...state.topStory,
      category: state.topStory.kicker || "FEATURED",
      tag: state.topStory.kicker || "FEATURED",
      breaking: true,
      featured: true
    },
    {
      featured: true,
      breaking: true,
      trending: true,
      status: state.topStory.status || "published",
      language: state.topStory.language || "en"
    }
  );

  const saved = state.topStory._id
    ? await apiRequest(`/api/news/${state.topStory._id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })
    : await apiRequest("/api/news", {
        method: "POST",
        body: JSON.stringify(payload)
      });

  state.topStory = apiToTopStory(saved);
  fillTopStory();
}

async function publishNewsListToApi() {
  const savedNews = [];

  for (const item of state.news) {
    if (!item.title) {
      continue;
    }

    const saved = item._id
      ? await apiRequest(`/api/news/${item._id}`, {
          method: "PUT",
          body: JSON.stringify(newsPayload(item))
        })
      : await apiRequest("/api/news", {
          method: "POST",
          body: JSON.stringify(newsPayload(item))
        });

    savedNews.push(apiToAdminItem(saved));
  }

  state.news = savedNews;
  renderNewsList();
}

function syncTopStory() {
  state.topStory = {
    _id: state.topStory._id,
    enabled: fields.topEnabled.checked,
    kicker: fields.topKicker.value.trim(),
    kickerHi: fields.topKickerHi.value.trim(),
    title: fields.topTitle.value.trim(),
    titleHi: fields.topTitleHi.value.trim(),
    summary: fields.topSummary.value.trim(),
    summaryHi: "",
    body: fields.topBody.value.trim(),
    bodyHi: "",
    image: fields.topImage.value.trim(),
    status: state.topStory.status || "published",
    breaking: Boolean(state.topStory.breaking),
    featured: Boolean(state.topStory.featured),
    trending: Boolean(state.topStory.trending),
    language: state.topStory.language || "en"
  };
}

function syncTicker() {
  state.ticker = fields.tickerLines.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ en: line, hi: line }));
}

function fillTopStory() {
  fields.topEnabled.checked = Boolean(state.topStory.enabled);
  fields.topKicker.value = state.topStory.kicker || "";
  fields.topKickerHi.value = state.topStory.kickerHi || "";
  fields.topTitle.value = state.topStory.title || "";
  fields.topTitleHi.value = state.topStory.titleHi || "";
  fields.topSummary.value = state.topStory.summary || "";
  fields.topBody.value = state.topStory.body || "";
  fields.topImage.value = state.topStory.image || "";
}

function fillTicker() {
  fields.tickerLines.value = state.ticker.map((item) => item.en || item).join("\n");
}

function clearNewsForm() {
  fields.editingIndex.value = "";
  fields.newsTag.value = "";
  fields.newsCategory.value = "Durg";
  if (fields.newsCity) fields.newsCity.value = "";
  fields.newsStatus.value = "pending";
  fields.newsImage.value = "";
  fields.newsImage.dataset.original = "";
  if (fields.newsUpload) fields.newsUpload.value = "";
  fields.newsTitle.value = "";
  fields.newsTitleHi.value = "";
  fields.newsSummary.value = "";
  fields.newsSummaryHi.value = "";
  fields.newsBody.value = "";
  fields.newsBodyHi.value = "";
  fields.newsBreaking.checked = false;
  fields.newsFeatured.checked = false;
  fields.newsTrending.checked = false;
  showPublishResult(null);
}

function fillNewsForm(index) {
  const item = state.news[index];

  if (!item) {
    return;
  }

  fields.editingIndex.value = String(index);
  fields.newsTag.value = item.categoryBadge || item.tag || "";
  ensureSelectValue(fields.newsCategory, item.category);
  ensureSelectValue(fields.newsCity, item.city);
  fields.newsCategory.value = item.category || detectCategory(`${item.title} ${item.summary} ${item.tag}`);
  if (fields.newsCity) fields.newsCity.value = item.city || "";
  fields.newsStatus.value = item.status || "published";
  fields.newsImage.value = item.sourceImage || item.optimizedThumbnail || item.aiThumbnail || item.image || "";
  fields.newsImage.dataset.original = item.sourceImage || item.optimizedThumbnail || item.aiThumbnail || item.image || "";
  fields.newsTitle.value = item.title || "";
  fields.newsTitleHi.value = item.titleHi || "";
  fields.newsSummary.value = item.summary || "";
  fields.newsSummaryHi.value = item.summaryHi || "";
  fields.newsBody.value = item.body || "";
  fields.newsBodyHi.value = item.bodyHi || "";
  fields.newsBreaking.checked = Boolean(item.breaking);
  fields.newsFeatured.checked = Boolean(item.featured);
  fields.newsTrending.checked = Boolean(item.trending);
  showPublishResult((item.status || "pending") === "published" ? item : null);
  fields.newsTitle.focus();
}

async function saveNewsItem(event) {
  event.preventDefault();
  const submitButton = fields.newsFormSubmit;
  const detectedCategory = detectCategory(`${fields.newsTitle.value} ${fields.newsSummary.value} ${fields.newsBody.value} ${fields.newsTag.value}`);
  const category = fields.newsCategory.value || detectedCategory;
  const titleInput = fields.newsTitle.value.trim() || fields.newsTitleHi.value.trim();
  const summaryInput = fields.newsSummary.value.trim() || fields.newsSummaryHi.value.trim();
  const bodyInput = fields.newsBody.value.trim() || fields.newsBodyHi.value.trim();
  const sourceLanguage = hasHindiText(`${titleInput} ${summaryInput} ${bodyInput}`) ? "hi" : "en";

  const item = {
    tag: fields.newsTag.value.trim() || category,
    categoryBadge: fields.newsTag.value.trim() || category,
    category,
    city: (fields.newsCity && fields.newsCity.value) || inferCity(`${fields.newsTag.value} ${fields.newsTitle.value} ${fields.newsSummary.value}`),
    image: fields.newsImage.value.trim() || fallbackImage,
    sourceImage: fields.newsImage.value.trim(),
    title: titleInput,
    titleEn: sourceLanguage === "en" ? titleInput : "",
    titleHi: fields.newsTitleHi.value.trim(),
    summary: summaryInput,
    summaryEn: sourceLanguage === "en" ? summaryInput : "",
    summaryHi: fields.newsSummaryHi.value.trim(),
    body: bodyInput,
    bodyEn: sourceLanguage === "en" ? bodyInput : "",
    bodyHi: fields.newsBodyHi.value.trim(),
    status: fields.newsStatus.value || "pending",
    breaking: fields.newsBreaking.checked,
    featured: fields.newsFeatured.checked,
    trending: fields.newsTrending.checked,
    language: sourceLanguage
  };

  if (sourceLanguage === "hi") {
    item.titleHi = item.titleHi || item.title;
    item.summaryHi = item.summaryHi || item.summary;
    item.bodyHi = item.bodyHi || item.body;
  }

  const errors = validateNewsEditorItem(item);

  if (errors.length) {
    showStatus(errors[0], "error");
    showToast("Publishing failed. Please try again.", "error", errors[0]);
    return;
  }

  const index = Number(fields.editingIndex.value);
  const existing = Number.isInteger(index) && index >= 0 ? state.news[index] : null;
  const currentImage = fields.newsImage.value.trim();
  const originalImage = fields.newsImage.dataset.original || "";
  const imageChanged = Boolean(currentImage) && currentImage !== originalImage;
  const savingPublished = (item.status || "pending") === "published";
  let savedItem = null;

  setButtonLoading(submitButton, true, savingPublished ? "Publishing..." : "Saving...");
  showStatus(savingPublished ? "Publishing article..." : "Saving news item...", "working");

  try {
    const saved = existing?._id
      ? await apiRequest(`/api/news/${existing._id}`, {
          method: "PUT",
          body: JSON.stringify(newsPayload(
            {
              ...existing,
              ...item,
              ...(imageChanged ? {
                optimizedThumbnail: "",
                aiThumbnail: "",
                thumbnailHash: "",
                thumbnailStatus: ""
              } : {})
            }
          ))
        })
      : await apiRequest("/api/news", {
          method: "POST",
          body: JSON.stringify(newsPayload(item))
        });

    savedItem = apiToAdminItem(saved);

    if (existing) {
      state.news[index] = savedItem;
    } else {
      state.news.unshift(savedItem);
    }

    if ((savedItem.status || "pending") === "published") {
      handlePublishedArticleSuccess(savedItem);
    } else {
      showPublishResult(null);
      showSavedOutcome(savedItem, "News saved to MongoDB.");
      announceNewsSync("saved", {
        id: savedItem._id,
        slug: savedItem.slug,
        categorySlug: savedItem.categorySlug,
        districtSlug: savedItem.districtSlug || savedItem.city || ""
      });
    }
    fields.newsImage.dataset.original = savedItem.sourceImage || savedItem.optimizedThumbnail || savedItem.aiThumbnail || savedItem.image || "";
  } catch (error) {
    if (existing) {
      state.news[index] = { ...existing, ...item };
    } else {
      state.news.unshift(item);
    }

    showPublishResult(null);
    showStatus(`MongoDB save failed. Saved locally only: ${error.message}`, "error");
    showToast("Publishing failed. Please try again.", "error", error.message);
    renderNewsList();
    saveLocalState();
    setButtonLoading(submitButton, false);
    return;
  }

  clearNewsForm();
  if ((savedItem?.status || "pending") === "published") {
    showPublishResult(savedItem);
  }
  renderNewsList();
  loadDashboard();
  syncTicker();
  saveLocalState();
  setButtonLoading(submitButton, false);
}

async function deleteNewsItem(index) {
  const item = state.news[index];

  if (!item) {
    return;
  }

  if (item._id) {
    try {
      await apiRequest(`/api/news/${item._id}`, { method: "DELETE" });
      showStatus("News deleted from MongoDB.");
    } catch (error) {
      showStatus(`MongoDB delete failed. Removed locally only: ${error.message}`);
    }
  }

  state.news.splice(index, 1);
  renderNewsList();
  announceNewsSync("deleted", {
    id: item._id,
    slug: item.slug,
    categorySlug: item.categorySlug,
    districtSlug: item.districtSlug || item.city || ""
  });
  syncTicker();
  saveLocalState();
}

async function updateNewsItem(index, overrides, message, options = {}) {
  const item = state.news[index];

  if (!item) {
    return;
  }

  const updatedItem = { ...item, ...overrides };
  const targetStatus = updatedItem.status || item.status || "pending";
  const button = options.button || null;

  setButtonLoading(button, true, targetStatus === "published" ? "Publishing..." : "Updating...");
  showStatus(targetStatus === "published" ? "Publishing article..." : "Updating news status...", "working");

  try {
    const saved = item._id
      ? await apiRequest(targetStatus === "published"
        ? `/api/news/${item._id}/approve`
        : `/api/news/${item._id}`, {
          method: targetStatus === "published" ? "POST" : "PUT",
          body: JSON.stringify(newsPayload(updatedItem, overrides))
        })
      : await apiRequest("/api/news", {
          method: "POST",
          body: JSON.stringify(newsPayload(updatedItem, overrides))
        });

    state.news[index] = apiToAdminItem(saved);

    if ((state.news[index].status || "pending") === "published") {
      handlePublishedArticleSuccess(state.news[index], message);
    } else {
      showPublishResult(null);
      showSavedOutcome(state.news[index], message);
      announceNewsSync("updated", {
        id: state.news[index]._id,
        slug: state.news[index].slug,
        categorySlug: state.news[index].categorySlug,
        districtSlug: state.news[index].districtSlug || state.news[index].city || ""
      });
    }
  } catch (error) {
    state.news[index] = updatedItem;
    showStatus(`${message} Locally updated only: ${error.message}`, "error");
    if (targetStatus === "published") {
      showToast("Publishing failed. Please try again.", "error", error.message);
    }
  } finally {
    setButtonLoading(button, false);
  }

  renderNewsList();
  loadDashboard();
  saveLocalState();
}

function updateReviewTabs() {
  const counts = state.news.reduce((acc, item) => {
    const status = item.status || "pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  fields.pendingCount.textContent = String(counts.pending || 0);
  fields.publishedCount.textContent = String(counts.published || 0);
  fields.rejectedCount.textContent = String(counts.rejected || 0);
  fields.reviewTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.statusFilter === activeStatusFilter);
  });
}

function setReviewTab(status) {
  activeStatusFilter = status;
  renderNewsList();
}

function previewNewsItem(index) {
  const item = state.news[index];

  if (!item) {
    return;
  }

  const sourceLine = item.sourceName
    ? `${escapeHTML(item.sourceName)}${item.sourcePublishedAt ? ` - ${escapeHTML(formatDateTime(item.sourcePublishedAt))}` : ""}`
    : "";

  openPreviewModal({
    badge: item.categoryBadge || item.tag || item.category || "PREVIEW",
    image: item.image || "",
    localized: {
      hi: {
        title: item.titleHi || item.title || "Untitled news",
        summary: item.summaryHi || item.summary || "",
        bodyHtml: `
          ${sourceLine ? `<strong>स्रोत</strong><p>${sourceLine}</p>` : ""}
          <strong>हिंदी कॉपी</strong>
          <p>${escapeHTML(item.bodyHi || item.summaryHi || item.titleHi || "Hindi copy will auto-fill after save when OpenAI quota is available.")}</p>
        `
      },
      en: {
        title: item.titleEn || "Untitled news",
        summary: item.summaryEn || "",
        bodyHtml: `
          ${sourceLine ? `<strong>Source</strong><p>${sourceLine}</p>` : ""}
          <strong>English Copy</strong>
          <p>${escapeHTML(item.bodyEn || item.summaryEn || item.titleEn || "English translation is being prepared.")}</p>
        `
      }
    }
  });
}

function previewNewsItem(index) {
  const item = state.news[index];

  if (!item) {
    return;
  }

  const meta = previewMetaMarkup(item);
  const sourceLine = item.sourceName
    ? `${escapeHTML(item.sourceName)}${item.sourcePublishedAt ? ` - ${escapeHTML(formatDateTime(item.sourcePublishedAt))}` : ""}`
    : "";

  openPreviewModal({
    badge: item.categoryBadge || item.tag || item.category || "PREVIEW",
    image: item.image || item.optimizedThumbnail || item.aiThumbnail || item.sourceImage || fallbackImage,
    status: item.status || "pending",
    localized: {
      hi: {
        title: item.titleHi || item.title || "Untitled news",
        summary: item.summaryHi || item.summary || "",
        bodyHtml: `
          ${meta}
          ${sourceLine ? `<strong>स्रोत</strong><p>${sourceLine}</p>` : ""}
          <strong>हिंदी कॉपी</strong>
          <p>${escapeHTML(item.bodyHi || item.summaryHi || item.titleHi || "Hindi copy will auto-fill after save when OpenAI quota is available.")}</p>
        `
      },
      en: {
        title: item.titleEn || item.title || "Untitled news",
        summary: item.summaryEn || item.summary || "",
        bodyHtml: `
          ${meta}
          ${sourceLine ? `<strong>Source</strong><p>${sourceLine}</p>` : ""}
          <strong>English Copy</strong>
          <p>${escapeHTML(item.bodyEn || item.summaryEn || item.titleEn || "English translation is being prepared.")}</p>
        `
      }
    }
  });
}

function closePreview() {
  fields.previewModal.classList.remove("open");
  fields.previewModal.setAttribute("aria-hidden", "true");
  previewModalState = null;
}

async function autoTranslateCurrentNews() {
  const index = Number(fields.editingIndex.value);
  const item = Number.isInteger(index) && index >= 0 ? state.news[index] : null;

  if (!item?._id) {
    showStatus("Save this news first, then use Auto Translate.");
    return;
  }

  fields.autoTranslateNews.disabled = true;

  try {
    const saved = await apiRequest(`/api/news/${item._id}/translate`, {
      method: "POST",
      body: JSON.stringify({ force: true })
    });
    state.news[index] = apiToAdminItem(saved);
    fillNewsForm(index);
    renderNewsList();
    showStatus(saved.translationStatus === "complete"
      ? "Auto translation completed."
      : "Translation queued/pending. Check OpenAI quota if Hindi/English copy is still same.");
  } catch (error) {
    showStatus(`Auto translate failed: ${error.message}`);
  } finally {
    fields.autoTranslateNews.disabled = false;
  }
}

async function runThumbnailAction(action) {
  const index = Number(fields.editingIndex.value);
  const item = Number.isInteger(index) && index >= 0 ? state.news[index] : null;

  if (!item?._id) {
    showStatus("Save this news first, then use thumbnail tools.");
    return;
  }

  const buttons = [fields.useSourceImage, fields.generateAiThumbnail, fields.regenerateThumbnail].filter(Boolean);
  buttons.forEach((button) => {
    button.disabled = true;
  });
  showStatus(action === "use-source" ? "Creating source image thumbnail..." : "Generating AI thumbnail...");

  try {
    const saved = await apiRequest(`/api/news/${item._id}/thumbnail`, {
      method: "POST",
      body: JSON.stringify({
        action,
        sourceImage: fields.newsImage.value.trim() || item.sourceImage || item.image
      }),
      loadingMessage: action === "use-source" ? "Source image thumbnail ban raha hai..." : "AI thumbnail generate ho raha hai..."
    });
    state.news[index] = apiToAdminItem(saved);
    fillNewsForm(index);
    renderNewsList();
    showStatus(action === "use-source" ? "Source image thumbnail applied." : "AI thumbnail generated.");
  } catch (error) {
    showStatus(`Thumbnail update failed: ${error.message}`);
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
}

async function bulkApprovePending() {
  const pending = state.news.filter((item) => (item.status || "pending") === "pending" && item._id);

  if (!pending.length) {
    showStatus("No pending articles to approve.");
    return;
  }

  const confirmed = window.confirm(`Approve and publish ${pending.length} pending articles?`);

  if (!confirmed) {
    return;
  }

  try {
    const result = await apiRequest("/api/news/bulk-approve", {
      method: "POST",
      body: JSON.stringify({ ids: pending.map((item) => item._id) })
    });

    showStatus(`Bulk approved ${result.approved || 0} articles.`);
    showToast("Article published successfully", "success", `${result.approved || 0} article(s) approved.`);
    announceNewsSync("bulk-published", { count: result.approved || 0 });
    await loadStateFromApi();
    await loadAutomationSettings();
    await loadDashboard();
  } catch (error) {
    showStatus(`Bulk approve failed: ${error.message}`);
    showToast("Publishing failed. Please try again.", "error", error.message);
  }
}

function renderNewsList() {
  fields.newsList.innerHTML = "";
  updateReviewTabs();
  const visibleNews = state.news
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => (item.status || "pending") === activeStatusFilter);

  if (!visibleNews.length) {
    fields.newsList.innerHTML = `<div class="news-item"><strong>No ${escapeHTML(activeStatusFilter)} news found.</strong><p>Items will appear here after AI automation or admin edits.</p></div>`;
    return;
  }

  visibleNews.forEach(({ item, index }) => {
    const row = document.createElement("article");
    row.className = "news-item";
    const status = item.status || "pending";
    const stateBadge = `<span class="news-item-state ${escapeHTML(status)}">${status === "published" ? "✓" : status === "rejected" ? "!" : "…" } ${escapeHTML(status.toUpperCase())}</span>`;
    const articleLink = status === "published" && item.articleUrl
      ? `<a class="ghost-btn" href="${escapeHTML(item.articleUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> View Article</a>`
      : "";
    const districtLabel = item.district || districtLabelFromValue(item.city) || "";
    row.innerHTML = `
      <span>${escapeHTML(item.categoryBadge || item.tag || item.category || "UPDATE")}</span>
      <div class="news-item-head">
        <strong>${escapeHTML(item.title || "Untitled news")}</strong>
        ${stateBadge}
      </div>
      <div class="news-item-meta">
        <small class="status-${escapeHTML(status)}">${escapeHTML(status.toUpperCase())}</small>
        <small>${escapeHTML(item.category || "Breaking")}</small>
        ${districtLabel ? `<small>${escapeHTML(districtLabel)}</small>` : ""}
        ${item.sourceCredit || item.sourceName ? `<small>SOURCE ${escapeHTML(item.sourceCredit || item.sourceName)}</small>` : ""}
        ${item.thumbnailStatus ? `<small>THUMB ${escapeHTML(item.thumbnailStatus.toUpperCase())}</small>` : ""}
        ${item.sourcePublishedAt ? `<small>RSS ${escapeHTML(formatDateTime(item.sourcePublishedAt))}</small>` : ""}
        ${Number.isFinite(Number(item.freshnessScore)) ? `<small>FRESH ${Number(item.freshnessScore)}</small>` : ""}
        ${item.translationStatus ? `<small>TRANS ${escapeHTML(item.translationStatus.toUpperCase())}</small>` : ""}
        ${item.breaking ? "<small>BREAKING</small>" : ""}
        ${item.trending ? "<small>TRENDING</small>" : ""}
        ${item.featured ? "<small>TOP STORY</small>" : ""}
      </div>
      <p>${escapeHTML(item.summary || item.body || "No summary added.")}</p>
      <div class="item-actions">
        <button class="ghost-btn" type="button" data-preview="${index}"><i class="fa-solid fa-eye"></i> Preview</button>
        <button class="ghost-btn" type="button" data-edit="${index}"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="primary-btn" type="button" data-approve="${index}"><i class="fa-solid fa-check"></i> Approve & Publish</button>
        <button class="ghost-btn" type="button" data-pending="${index}"><i class="fa-solid fa-clock"></i> Pending</button>
        <button class="danger-btn" type="button" data-reject="${index}"><i class="fa-solid fa-ban"></i> Reject</button>
        <button class="ghost-btn" type="button" data-breaking="${index}"><i class="fa-solid fa-bolt"></i> Breaking</button>
        <button class="ghost-btn" type="button" data-top="${index}"><i class="fa-solid fa-star"></i> Top</button>
        <button class="ghost-btn" type="button" data-trending="${index}"><i class="fa-solid fa-arrow-trend-up"></i> Trend</button>
        ${articleLink}
        <button class="danger-btn" type="button" data-delete="${index}"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
    `;
    const stateBadgeNode = row.querySelector(".news-item-state");
    if (stateBadgeNode) {
      stateBadgeNode.textContent = `${status === "published" ? "✓" : status === "rejected" ? "!" : "…"} ${status.toUpperCase()}`;
    }
    fields.newsList.appendChild(row);
  });
}

function renderNewsList() {
  fields.newsList.innerHTML = "";
  updateReviewTabs();
  const visibleNews = state.news
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => (item.status || "pending") === activeStatusFilter);

  if (!visibleNews.length) {
    fields.newsList.innerHTML = `<div class="news-item"><strong>No ${escapeHTML(activeStatusFilter)} news found.</strong><p>Items will appear here after AI automation or admin edits.</p></div>`;
    return;
  }

  visibleNews.forEach(({ item, index }) => {
    const row = document.createElement("article");
    row.className = "news-item";
    const status = item.status || "pending";
    const articleLink = status === "published" && item.articleUrl
      ? `<a class="ghost-btn" href="${escapeHTML(item.articleUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> View Article</a>`
      : "";
    const districtLabel = item.district || districtLabelFromValue(item.city) || "";
    row.innerHTML = `
      <span>${escapeHTML(item.categoryBadge || item.tag || item.category || "UPDATE")}</span>
      <div class="news-item-head">
        <strong>${escapeHTML(item.title || item.titleHi || "Untitled news")}</strong>
        ${statusBadgeMarkup(status)}
      </div>
      <div class="news-item-meta">
        ${statusPillMarkup(status)}
        <small>${escapeHTML(item.category || "Breaking")}</small>
        ${districtLabel ? `<small>${escapeHTML(districtLabel)}</small>` : ""}
        ${item.sourceCredit || item.sourceName ? `<small>SOURCE ${escapeHTML(item.sourceCredit || item.sourceName)}</small>` : ""}
        ${item.thumbnailStatus ? `<small>THUMB ${escapeHTML(item.thumbnailStatus.toUpperCase())}</small>` : ""}
        ${item.sourcePublishedAt ? `<small>RSS ${escapeHTML(formatDateTime(item.sourcePublishedAt))}</small>` : ""}
        ${Number.isFinite(Number(item.freshnessScore)) ? `<small>FRESH ${Number(item.freshnessScore)}</small>` : ""}
        ${item.translationStatus ? `<small>TRANS ${escapeHTML(item.translationStatus.toUpperCase())}</small>` : ""}
        ${item.breaking ? "<small>BREAKING</small>" : ""}
        ${item.trending ? "<small>TRENDING</small>" : ""}
        ${item.featured ? "<small>TOP STORY</small>" : ""}
      </div>
      <p>${escapeHTML(item.summaryHi || item.summary || item.body || "No summary added.")}</p>
      <div class="item-actions">
        <button class="ghost-btn" type="button" data-preview="${index}"><i class="fa-solid fa-eye"></i> Preview</button>
        <button class="ghost-btn" type="button" data-edit="${index}"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="primary-btn" type="button" data-approve="${index}"><i class="fa-solid fa-check"></i> Approve & Publish</button>
        <button class="ghost-btn" type="button" data-pending="${index}"><i class="fa-solid fa-clock"></i> Pending</button>
        <button class="danger-btn" type="button" data-reject="${index}"><i class="fa-solid fa-ban"></i> Reject</button>
        <button class="ghost-btn" type="button" data-breaking="${index}"><i class="fa-solid fa-bolt"></i> Breaking</button>
        <button class="ghost-btn" type="button" data-top="${index}"><i class="fa-solid fa-star"></i> Top</button>
        <button class="ghost-btn" type="button" data-trending="${index}"><i class="fa-solid fa-arrow-trend-up"></i> Trend</button>
        ${articleLink}
        <button class="danger-btn" type="button" data-delete="${index}"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
    `;
    fields.newsList.appendChild(row);
  });
}

async function resetAll() {
  const confirmed = window.confirm("Remove all admin updates from this browser?");

  if (!confirmed) {
    return;
  }

  const idsToDelete = [
    state.topStory._id,
    ...state.news.map((item) => item._id)
  ].filter(Boolean);

  await Promise.allSettled(
    idsToDelete.map((id) => apiRequest(`/api/news/${id}`, { method: "DELETE" }))
  );

  localStorage.removeItem(ADMIN_STORAGE_KEY);
  state.topStory = {
    enabled: false,
    kicker: "BREAKING NEWS",
    kickerHi: "",
    title: "",
    titleHi: "",
    summary: "",
    summaryHi: "",
    body: "",
    bodyHi: "",
    image: "",
    status: "published",
    breaking: false,
    featured: false,
    trending: false,
    language: "en"
  };
  state.ticker = [];
  state.news = [];
  fillTopStory();
  fillTicker();
  clearNewsForm();
  renderNewsList();
  showStatus("Reset complete. Refresh index.html to remove admin updates.");
}

async function clearAllPosts() {
  const confirmed = window.confirm("Delete all AI + manual posts from MongoDB? This cannot be undone.");

  if (!confirmed) {
    return;
  }

  try {
    const result = await apiRequest("/api/admin/clear-posts", {
      method: "POST",
      body: JSON.stringify({ confirm: true }),
      loadingMessage: "Sabhi posts delete ho rahe hain..."
    });

    localStorage.removeItem(ADMIN_STORAGE_KEY);
    state.topStory = {
      enabled: false,
      kicker: "BREAKING NEWS",
      kickerHi: "",
      title: "",
      titleHi: "",
      summary: "",
      summaryHi: "",
      body: "",
      bodyHi: "",
      image: "",
      status: "published",
      breaking: false,
      featured: false,
      trending: false,
      language: "en"
    };
    state.ticker = [];
    state.news = [];
    state.manualNews = [];
    fillTopStory();
    fillTicker();
    clearNewsForm();
    clearManualForm();
    renderNewsList();
    renderManualNews();
    updateReviewTabs();
    saveLocalState();
    await loadDashboard();
    showStatus(`All posts removed. AI ${result.deletedAi || 0}, manual ${result.deletedManual || 0}.`, "success");
    showToast("All posts removed", "success", `AI ${result.deletedAi || 0}, manual ${result.deletedManual || 0}`);
    announceNewsSync("cleared", { deletedAi: result.deletedAi || 0, deletedManual: result.deletedManual || 0 });
  } catch (error) {
    showStatus(`All posts delete failed: ${error.message}`, "error");
  }
}

function bindEvents() {
  fields.previewLanguageButtons.forEach((button) => {
    if (button.dataset.previewLang === "hi") {
      button.textContent = "हिंदी";
    }
  });

  fields.loginForm.addEventListener("submit", handleLogin);
  fields.logoutAdmin.addEventListener("click", logoutAdmin);
  fields.refreshDashboard?.addEventListener("click", loadDashboard);
  document.getElementById("publishAll").addEventListener("click", publishState);
  document.getElementById("resetAll").addEventListener("click", resetAll);
  fields.clearAllPosts?.addEventListener("click", clearAllPosts);
  document.getElementById("addNews").addEventListener("click", clearNewsForm);
  document.getElementById("clearNewsForm").addEventListener("click", clearNewsForm);
  document.getElementById("newsForm").addEventListener("submit", saveNewsItem);
  fields.newsUpload?.addEventListener("change", () => uploadAndFill(fields.newsUpload, fields.newsImage, "News image"));
  fields.previewNewsDraft?.addEventListener("click", previewNewsDraft);
  fields.autoTranslateNews.addEventListener("click", autoTranslateCurrentNews);
  fields.useSourceImage?.addEventListener("click", () => runThumbnailAction("use-source"));
  fields.generateAiThumbnail?.addEventListener("click", () => runThumbnailAction("generate-ai"));
  fields.regenerateThumbnail?.addEventListener("click", () => runThumbnailAction("regenerate-ai"));
  fields.saveAutomation.addEventListener("click", saveAutomationSettings);
  fields.runAutomationNow.addEventListener("click", runAutomationNow);
  fields.runFailedJobs?.addEventListener("click", runLastFailedJobs);
  fields.saveSiteSettings?.addEventListener("click", saveSiteSettings);
  fields.adForm?.addEventListener("submit", saveAd);
  fields.adUpload?.addEventListener("change", () => uploadAndFill(fields.adUpload, fields.adImage, "Ad banner"));
  fields.previewAd?.addEventListener("click", () => previewAdItem());
  fields.clearAdForm?.addEventListener("click", clearAdForm);
  fields.deleteAd?.addEventListener("click", deleteCurrentAd);
  fields.manualNewsForm?.addEventListener("submit", saveManualNews);
  fields.manualUpload?.addEventListener("change", () => uploadAndFill(fields.manualUpload, fields.manualImage, "Thumbnail"));
  fields.clearManualForm?.addEventListener("click", clearManualForm);
  fields.previewManual?.addEventListener("click", previewManualNews);
  fields.deleteManual?.addEventListener("click", deleteCurrentManualNews);
  fields.pushForm?.addEventListener("submit", sendPushNotification);
  fields.loadSubscribers?.addEventListener("click", loadSubscribers);
  fields.manualTitleHi?.addEventListener("input", () => {
    if (!fields.manualId.value) {
      fields.manualSlug.value = slugifyAdmin(fields.manualTitleHi.value);
    }
  });
  fields.bulkApprovePending.addEventListener("click", bulkApprovePending);
  fields.closePreview.addEventListener("click", closePreview);
  fields.previewLanguageButtons.forEach((button) => {
    button.addEventListener("click", () => setPreviewLanguage(button.dataset.previewLang));
  });
  fields.previewModal.addEventListener("click", (event) => {
    if (event.target === fields.previewModal) {
      closePreview();
    }
  });
  fields.reviewTabButtons.forEach((button) => {
    button.addEventListener("click", () => setReviewTab(button.dataset.statusFilter));
  });

  fields.publishResult?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-publish-result-edit]");
    if (!editButton) {
      return;
    }

    const index = state.news.findIndex((item) => item._id === editButton.dataset.publishResultEdit);
    if (index >= 0) {
      fillNewsForm(index);
    }
  });

  fields.newsList.addEventListener("click", (event) => {
    const previewButton = event.target.closest("[data-preview]");
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    const approveButton = event.target.closest("[data-approve]");
    const pendingButton = event.target.closest("[data-pending]");
    const rejectButton = event.target.closest("[data-reject]");
    const breakingButton = event.target.closest("[data-breaking]");
    const topButton = event.target.closest("[data-top]");
    const trendingButton = event.target.closest("[data-trending]");

    if (previewButton) {
      previewNewsItem(Number(previewButton.dataset.preview));
    }

    if (editButton) {
      fillNewsForm(Number(editButton.dataset.edit));
    }

    if (approveButton) {
      updateNewsItem(Number(approveButton.dataset.approve), { status: "published" }, "News approved and published.", { button: approveButton });
    }

    if (pendingButton) {
      updateNewsItem(Number(pendingButton.dataset.pending), { status: "pending" }, "News moved to pending.", { button: pendingButton });
    }

    if (rejectButton) {
      updateNewsItem(Number(rejectButton.dataset.reject), { status: "rejected", featured: false, breaking: false, trending: false }, "News rejected.", { button: rejectButton });
    }

    if (breakingButton) {
      const index = Number(breakingButton.dataset.breaking);
      const item = state.news[index];
      updateNewsItem(index, { breaking: !item.breaking, category: item.breaking ? item.category : item.category || "Breaking" }, "Breaking flag updated.", { button: breakingButton });
    }

    if (topButton) {
      updateNewsItem(Number(topButton.dataset.top), { featured: true, trending: true, status: "published" }, "Top story set.", { button: topButton });
    }

    if (trendingButton) {
      const index = Number(trendingButton.dataset.trending);
      const item = state.news[index];
      updateNewsItem(index, { trending: !item.trending }, "Trending flag updated.", { button: trendingButton });
    }

    if (deleteButton) {
      deleteNewsItem(Number(deleteButton.dataset.delete));
    }
  });

  fields.adList?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-ad-edit]");
    const previewButton = event.target.closest("[data-ad-preview]");
    const deleteButton = event.target.closest("[data-ad-delete]");

    if (editButton) {
      const ad = state.ads.find((item) => item._id === editButton.dataset.adEdit);
      if (ad) fillAdForm(ad);
    }

    if (previewButton) {
      const ad = state.ads.find((item) => item._id === previewButton.dataset.adPreview);
      if (ad) previewAdItem(ad);
    }

    if (deleteButton) {
      await apiRequest(`/api/ads/${deleteButton.dataset.adDelete}`, { method: "DELETE" });
      showStatus("Ad deleted.");
      await loadAds();
    }
  });

  fields.manualNewsList?.addEventListener("click", async (event) => {
    const previewButton = event.target.closest("[data-manual-preview]");
    const editButton = event.target.closest("[data-manual-edit]");
    const deleteButton = event.target.closest("[data-manual-delete]");

    if (previewButton) {
      const item = state.manualNews.find((news) => news._id === previewButton.dataset.manualPreview);
      if (item) {
        fillManualForm(item);
        previewManualNews();
      }
    }

    if (editButton) {
      const item = state.manualNews.find((news) => news._id === editButton.dataset.manualEdit);
      if (item) fillManualForm(item);
    }

    if (deleteButton) {
      await apiRequest(`/api/manual-news/${deleteButton.dataset.manualDelete}`, { method: "DELETE" });
      showStatus("Manual news deleted.");
      await loadManualNews();
    }
  });
}

loadState();
populateCmsTaxonomy();
fillTopStory();
fillTicker();
renderNewsList();
bindEvents();
setAccess(hasAccess());
loadStateFromApi();
loadDashboard();
loadAutomationSettings();
loadSiteSettings();
loadAds();
loadManualNews();
loadSubscribers();
