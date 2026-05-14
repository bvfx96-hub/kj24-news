const DEFAULT_REMOTE_API_BASE = "https://kj24-news.onrender.com";
const PORTAL_API_BASE_URL = window.KJ_API_BASE_URL
  || ((window.location.protocol === "file:" || /github\.io$|githubusercontent\.com$/i.test(window.location.hostname))
    ? DEFAULT_REMOTE_API_BASE
    : "");
const PORTAL_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=900&auto=format&fit=crop";
const PORTAL_LANGUAGE_KEY = "khabriJunctionPortalLanguage";
const requestedPortalLanguage = new URLSearchParams(window.location.search).get("lang");
let portalLanguage = requestedPortalLanguage === "en" ? "en" : "hi";

if (document.body) {
  document.body.classList.add("ads-pending");
} else {
  document.addEventListener("DOMContentLoaded", () => document.body?.classList.add("ads-pending"), { once: true });
}

const PORTAL_HINDI_TEXT = {
  "Related News": "संबंधित खबरें",
  "Open Full Page": "पूरी खबर खोलें",
  "Back To Page": "पेज पर वापस",
  "Read More": "और पढ़ें",
  "Read Full News": "पूरी खबर पढ़ें",
  "Read": "पढ़ें"
};

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pageSectionSlug() {
  return (window.location.pathname.split("/").pop() || "breaking.html").replace(".html", "").toLowerCase();
}

function portalCategoryPath(slug = pageSectionSlug()) {
  return `/category/${slug || "breaking"}`;
}

function safePortalPath(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";

  try {
    const contentOrigin = PORTAL_API_BASE_URL ? new URL(PORTAL_API_BASE_URL, window.location.href).origin : window.location.origin;
    const parsed = new URL(value, contentOrigin);
    const isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname);
    const isSameHost = parsed.host === window.location.host;

    if (isLocalhost || isSameHost) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    if (PORTAL_API_BASE_URL && /github\.io$|githubusercontent\.com$/i.test(window.location.hostname)) {
      return parsed.toString();
    }
  } catch (error) {
    return value;
  }

  return value;
}

function absolutePortalContentUrl(url = "") {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  try {
    return new URL(value, PORTAL_API_BASE_URL || window.location.origin).toString();
  } catch (error) {
    return value;
  }
}

function normalizePortalNewsItem(item = {}) {
  return {
    ...item,
    image: absolutePortalContentUrl(item.image || item.optimizedThumbnail || item.aiThumbnail || ""),
    sourceImage: absolutePortalContentUrl(item.sourceImage || ""),
    optimizedThumbnail: absolutePortalContentUrl(item.optimizedThumbnail || ""),
    aiThumbnail: absolutePortalContentUrl(item.aiThumbnail || ""),
    articleUrl: safePortalPath(item.articleUrl || ""),
    categoryPage: safePortalPath(item.categoryPage || "")
  };
}

function localizedValue(item, field) {
  if (portalLanguage === "hi") {
    return item[`${field}Hi`] || item[field] || item[`${field}En`] || "";
  }

  return item[`${field}En`] || item[field] || item[`${field}Hi`] || "";
}

function uiText(en, hi) {
  if (portalLanguage !== "hi") {
    return en;
  }

  if (PORTAL_HINDI_TEXT[en]) {
    return PORTAL_HINDI_TEXT[en];
  }

  return /à|Â|Ã|�/.test(String(hi || "")) ? en : hi;
}

function addPortalLanguageSwitch() {
  const header = document.querySelector(".portal-site-header");

  if (!header || document.getElementById("portalLanguageSwitch")) {
    return;
  }

  const switcher = document.createElement("div");
  switcher.className = "portal-language-switch";
  switcher.id = "portalLanguageSwitch";
  switcher.innerHTML = `
    <button class="${portalLanguage === "hi" ? "active" : ""}" type="button" data-portal-lang="hi">हिंदी</button>
    <button class="${portalLanguage === "en" ? "active" : ""}" type="button" data-portal-lang="en">English</button>
  `;
  switcher.querySelector('[data-portal-lang="hi"]').textContent = "हिंदी";
  header.appendChild(switcher);
  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("[data-portal-lang]");

    if (!button) {
      return;
    }

    portalLanguage = button.dataset.portalLang;
    localStorage.setItem(PORTAL_LANGUAGE_KEY, portalLanguage);
    switcher.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item.dataset.portalLang === portalLanguage));
    loadPortalMongoNews();
  });
}

function createPortalModal() {
  if (document.getElementById("portalNewsModal")) {
    return;
  }

  const modal = document.createElement("div");
  modal.className = "news-modal portal-news-modal";
  modal.id = "portalNewsModal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="portalModalTitle">
      <button class="modal-close" type="button" aria-label="Close news">&times;</button>
      <span class="modal-kicker" id="portalModalKicker">FULL NEWS</span>
      <img class="portal-modal-image" id="portalModalImage" src="" alt="">
      <h2 id="portalModalTitle"></h2>
      <p id="portalModalBody"></p>
      <div class="portal-related-news" id="portalRelatedNews"></div>
      <div class="portal-modal-actions">
        <a class="read-btn" id="portalArticleLink" href="#" target="_blank" rel="noopener">Open Full Page</a>
        <button class="ghost-portal-btn" type="button" data-portal-close>Back To Page</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function portalPageName() {
  const title = document.querySelector(".portal-title")?.textContent.trim();
  return title || "Khabri Junction";
}

function portalNewsBody(title, summary) {
  const page = portalPageName().replace(" News", "");
  const intro = summary || "This is a dummy full news update prepared for preview.";

  return `${intro}

${page} desk is tracking this update with local inputs, public response and official details. More verified information can be added from the admin panel or directly in this page when the final news copy is ready.`;
}

function newsFromCard(card) {
  const image = card.querySelector("img");

  return {
    id: card.dataset.newsId || "",
    title: card.dataset.newsTitle || card.querySelector("h1, h2, h3")?.textContent.trim() || image?.alt || "Full News",
    body: card.dataset.newsBody || card.querySelector("p")?.textContent.trim() || "",
    summary: card.dataset.newsSummary || card.querySelector("p")?.textContent.trim() || "",
    image: card.dataset.newsImage || image?.src || "",
    badge: card.dataset.newsBadge || portalPageName(),
    articleUrl: card.dataset.articleUrl || ""
  };
}

async function loadRelatedNews(newsId) {
  if (!newsId) {
    return [];
  }

  try {
    const response = await fetch(`${PORTAL_API_BASE_URL}/api/news/${newsId}/related`);

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch (error) {
    return [];
  }
}

function renderRelatedNews(related) {
  const box = document.getElementById("portalRelatedNews");

  if (!box) {
    return;
  }

  if (!related.length) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = `
    <h3>${uiText("Related News", "संबंधित खबरें")}</h3>
    ${related.slice(0, 4).map((item) => `
      <a href="${escapeHTML(safePortalPath(item.articleUrl) || `/news/${item.slug}`)}?lang=${portalLanguage}" target="_blank" rel="noopener">
        <span>${escapeHTML(item.categoryBadge || item.category || "NEWS")}</span>
        <strong>${escapeHTML(localizedValue(item, "title"))}</strong>
      </a>
    `).join("")}
  `;
}

async function openPortalNews(card) {
  const modal = document.getElementById("portalNewsModal");
  const news = newsFromCard(card);
  const modalImage = document.getElementById("portalModalImage");
  const articleLink = document.getElementById("portalArticleLink");

  document.getElementById("portalModalKicker").textContent = news.badge;
  document.getElementById("portalModalTitle").textContent = news.title;
  document.getElementById("portalModalBody").textContent = news.body || portalNewsBody(news.title, news.summary);
  articleLink.textContent = uiText("Open Full Page", "पूरी खबर खोलें");
  document.querySelector("[data-portal-close]").textContent = uiText("Back To Page", "पेज पर वापस");

  if (news.image) {
    modalImage.src = news.image;
    modalImage.alt = news.title;
    modalImage.hidden = false;
  } else {
    modalImage.hidden = true;
  }

  const articleUrl = safePortalPath(news.articleUrl);

  if (articleUrl) {
    articleLink.href = `${articleUrl}?lang=${portalLanguage}`;
    articleLink.hidden = false;
  } else {
    articleLink.hidden = true;
  }

  renderRelatedNews(await loadRelatedNews(news.id));
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closePortalNews() {
  const modal = document.getElementById("portalNewsModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function wireCard(card) {
  card.classList.add("portal-clickable-news");
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");

  card.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      return;
    }

    event.preventDefault();
    if (card.dataset.articleUrl) {
      window.location.href = `${card.dataset.articleUrl}?lang=${portalLanguage}`;
      return;
    }

    openPortalNews(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (card.dataset.articleUrl) {
        window.location.href = `${card.dataset.articleUrl}?lang=${portalLanguage}`;
        return;
      }

      openPortalNews(card);
    }
  });
}

function bindPortalNewsCards() {
  const selector = ".portal-card, .portal-list-item, .portal-photo-card, .portal-side-item";
  document.querySelectorAll(selector).forEach((card) => {
    if (card.dataset.portalBound === "true") {
      return;
    }

    card.dataset.portalBound = "true";
    wireCard(card);
  });
}

function bindPortalModal() {
  const modal = document.getElementById("portalNewsModal");

  modal.querySelector(".modal-close").addEventListener("click", closePortalNews);
  modal.querySelector("[data-portal-close]").addEventListener("click", closePortalNews);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closePortalNews();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closePortalNews();
    }
  });
}

function highlightPortalNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".portal-main-nav a").forEach((link) => {
    const linkPage = link.getAttribute("href");
    link.classList.toggle("active", linkPage === currentPage);
  });
}

function newsDataset(item) {
  const title = localizedValue(item, "title");
  const summary = localizedValue(item, "summary");
  const body = localizedValue(item, "body") || summary;

  return `
    data-news-id="${escapeHTML(item._id)}"
    data-news-title="${escapeHTML(title)}"
    data-news-summary="${escapeHTML(summary)}"
    data-news-body="${escapeHTML(body)}"
    data-news-image="${escapeHTML(item.image || PORTAL_FALLBACK_IMAGE)}"
    data-news-badge="${escapeHTML(item.categoryBadge || item.category || "NEWS")}"
    data-article-url="${escapeHTML(safePortalPath(item.articleUrl) || "")}"
  `;
}

function portalCard(item) {
  const image = item.image || PORTAL_FALLBACK_IMAGE;
  const title = localizedValue(item, "title");
  const summary = localizedValue(item, "summary");
  const articleUrl = safePortalPath(item.articleUrl);
  const url = articleUrl ? `${articleUrl}?lang=${portalLanguage}` : "#";

  return `<article class="portal-card" ${newsDataset(item)}>
    <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" loading="lazy" decoding="async">
    <span class="portal-badge">${escapeHTML(item.categoryBadge || item.category || "NEWS")}</span>
    <h3>${escapeHTML(title)}</h3>
    <p>${escapeHTML(summary || "")}</p>
    <a class="read-btn" href="${escapeHTML(url)}">${uiText("Read Full News", "पूरी खबर पढ़ें")}</a>
  </article>`;
}

function portalListItem(item) {
  const image = item.image || PORTAL_FALLBACK_IMAGE;
  const title = localizedValue(item, "title");
  const articleUrl = safePortalPath(item.articleUrl);
  const url = articleUrl ? `${articleUrl}?lang=${portalLanguage}` : "#";

  return `<article class="portal-list-item" ${newsDataset(item)}>
    <div><span>${escapeHTML(item.categoryBadge || item.category || "NEWS")}</span><h3>${escapeHTML(title)}</h3></div>
    <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" loading="lazy" decoding="async">
    <a class="read-btn" href="${escapeHTML(url)}">${uiText("Read More", "और पढ़ें")}</a>
  </article>`;
}

function portalPhotoItem(item) {
  const image = item.image || PORTAL_FALLBACK_IMAGE;
  const title = localizedValue(item, "title");
  const articleUrl = safePortalPath(item.articleUrl);
  const url = articleUrl ? `${articleUrl}?lang=${portalLanguage}` : "#";

  return `<article class="portal-photo-card" ${newsDataset(item)}>
    <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" loading="lazy" decoding="async">
    <h3>${escapeHTML(title)}</h3>
    <a class="read-btn" href="${escapeHTML(url)}">${uiText("Read", "पढ़ें")}</a>
  </article>`;
}

function portalSideItem(item) {
  const image = item.image || PORTAL_FALLBACK_IMAGE;
  const title = localizedValue(item, "title");

  const articleUrl = safePortalPath(item.articleUrl);

  return `<a class="portal-side-item" href="${escapeHTML(articleUrl || "#")}?lang=${portalLanguage}" ${newsDataset(item)}>
    <h3>${escapeHTML(title)}</h3>
    <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" loading="lazy" decoding="async">
  </a>`;
}

function portalEmptyMarkup() {
  const title = portalLanguage === "hi" ? "नई पोस्ट जल्द आएंगी" : "Fresh posts will appear soon";
  const summary = portalLanguage === "hi"
    ? "अभी इस पेज पर कोई published खबर नहीं है। नई खबर approve होते ही यहां दिखेगी।"
    : "There are no published stories on this page yet. Approved stories will appear here.";

  return `
    <article class="portal-card news-empty-card">
      <img src="${escapeHTML(PORTAL_FALLBACK_IMAGE)}" alt="${escapeHTML(title)}" loading="lazy" decoding="async">
      <span class="portal-badge">${portalLanguage === "hi" ? "लाइव" : "LIVE"}</span>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(summary)}</p>
      <a class="read-btn" href="/admin.html">${portalLanguage === "hi" ? "एडमिन खोलें" : "Open Admin"}</a>
    </article>
  `;
}

function renderPortalEmptyState() {
  const leadGrid = document.querySelector(".portal-lead-grid");
  const listGrid = document.querySelector(".portal-list-grid");
  const photoStrip = document.querySelector(".portal-photo-strip");
  const sideBlocks = document.querySelectorAll(".portal-side-block");

  if (leadGrid) {
    leadGrid.innerHTML = portalEmptyMarkup();
  }

  if (listGrid) {
    listGrid.innerHTML = portalEmptyMarkup();
  }

  if (photoStrip) {
    photoStrip.innerHTML = "";
  }

  sideBlocks.forEach((block) => {
    const title = block.querySelector("h2")?.outerHTML || `<h2>${portalLanguage === "hi" ? "ताज़ा खबरें" : "Latest News"}</h2>`;
    block.innerHTML = `${title}${portalEmptyMarkup()}`;
  });

  bindPortalNewsCards();
}

function renderPortalMongoNews(news) {
  if (!news.length) {
    renderPortalEmptyState();
    return;
  }

  const leadGrid = document.querySelector(".portal-lead-grid");
  const listGrid = document.querySelector(".portal-list-grid");
  const photoStrip = document.querySelector(".portal-photo-strip");
  const sideBlocks = document.querySelectorAll(".portal-side-block");
  const topNews = news.filter((item) => item.featured || item.trending || item.breaking).concat(news);

  if (leadGrid) {
    leadGrid.innerHTML = news.slice(0, 6).map(portalCard).join("");
  }

  if (listGrid) {
    listGrid.innerHTML = news.slice(0, 10).map(portalListItem).join("");
  }

  if (photoStrip) {
    photoStrip.innerHTML = news.filter((item) => item.image).slice(0, 5).map(portalPhotoItem).join("");
  }

  sideBlocks.forEach((block, index) => {
    const title = block.querySelector("h2")?.outerHTML || `<h2>${index ? "Latest News" : "Top News"}</h2>`;
    const source = index ? news : topNews;
    block.innerHTML = `${title}${source.slice(0, 5).map(portalSideItem).join("")}<a class="portal-read-more" href="${portalCategoryPath()}">${uiText("Read More", "और पढ़ें")}</a>`;
  });

  bindPortalNewsCards();
}

async function loadPortalMongoNews() {
  const section = pageSectionSlug();

  try {
    const response = await fetch(`${PORTAL_API_BASE_URL}/api/news?status=published&section=${encodeURIComponent(section)}`);

    if (!response.ok) {
      return;
    }

    const news = (await response.json()).map(normalizePortalNewsItem);
    renderPortalMongoNews(news);
  } catch (error) {
    // Static previews keep their dummy content when the API is unavailable.
  }
}

function repairPortalMojibake(value) {
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

function normalizePortalText(value) {
  const text = String(value || "").trim();
  return /Ã |Ã‚|Ãƒ|ï¿½|à¤|â€™|Â°|Â©/.test(text) ? repairPortalMojibake(text) : text;
}

portalLanguage = requestedPortalLanguage === "en" || requestedPortalLanguage === "hi"
  ? requestedPortalLanguage
  : (localStorage.getItem(PORTAL_LANGUAGE_KEY) === "en" ? "en" : "hi");

function uiText(en, hi) {
  if (portalLanguage !== "hi") {
    return normalizePortalText(en);
  }

  if (PORTAL_HINDI_TEXT[en]) {
    return normalizePortalText(PORTAL_HINDI_TEXT[en]);
  }

  const repaired = normalizePortalText(hi);
  return repaired || normalizePortalText(en);
}

function portalStaticLabel(value) {
  const text = normalizePortalText(value);
  const labels = {
    "Fast local news for Chhattisgarh": "छत्तीसगढ़ की तेज़ लोकल खबरें",
    "Home": "होम",
    "Durg": "दुर्ग",
    "Bhilai": "भिलाई",
    "Raipur": "रायपुर",
    "Bilaspur": "बिलासपुर",
    "Politics": "राजनीति",
    "Crime": "क्राइम",
    "Sports": "स्पोर्ट्स",
    "Entertainment": "मनोरंजन",
    "Health": "हेल्थ",
    "Jobs": "जॉब्स",
    "ADVERTISEMENT SPACE": "विज्ञापन स्थान",
    "Latest News": "ताज़ा खबरें",
    "Top News": "टॉप खबरें",
    "Photos": "फोटो",
    "Cricket": "क्रिकेट",
    "Football": "फुटबॉल",
    "Tennis": "टेनिस",
    "Photo": "फोटो",
    "Video": "वीडियो",
    "SPONSOR SLOT": "स्पॉन्सर स्लॉट",
    "All Rights Reserved": "सर्वाधिकार सुरक्षित"
  };

  return labels[text] || text;
}

function localizePortalTitle(text) {
  const raw = normalizePortalText(text);
  if (portalLanguage !== "hi") {
    return raw;
  }

  return raw
    .replace(/^Home \/\s*/i, "होम / ")
    .replace(/\bNews\b/g, "समाचार")
    .replace(/\bDurg\b/g, "दुर्ग")
    .replace(/\bBhilai\b/g, "भिलाई")
    .replace(/\bRaipur\b/g, "रायपुर")
    .replace(/\bBilaspur\b/g, "बिलासपुर")
    .replace(/\bRajnandgaon\b/g, "राजनांदगांव")
    .replace(/\bKhairagarh\b/g, "खैरागढ़")
    .replace(/\bKawardha\b/g, "कवर्धा")
    .replace(/\bAstrology\b/g, "राशिफल")
    .replace(/\bBreaking\b/g, "ब्रेकिंग")
    .replace(/\bPolitics\b/g, "राजनीति")
    .replace(/\bCrime\b/g, "क्राइम")
    .replace(/\bSports\b/g, "स्पोर्ट्स")
    .replace(/\bEntertainment\b/g, "मनोरंजन")
    .replace(/\bHealth\b/g, "हेल्थ")
    .replace(/\bJobs\b/g, "जॉब्स");
}

function translatePortalStatic() {
  document.documentElement.lang = portalLanguage === "hi" ? "hi" : "en";
  document.querySelectorAll(".portal-brand span, .portal-main-nav a, .portal-top-ad, .portal-tabs a, .portal-section-title, .portal-ad, .portal-side-ad, .portal-side-block h2, .portal-read-more").forEach((node) => {
    const english = normalizePortalText(node.dataset.portalEn || node.textContent);
    if (!node.dataset.portalEn) {
      node.dataset.portalEn = english;
    }
    node.textContent = portalLanguage === "hi" ? portalStaticLabel(english) : english;
  });

  const backLink = document.querySelector(".portal-back");
  if (backLink) {
    const english = normalizePortalText(backLink.dataset.portalEn || backLink.textContent);
    if (!backLink.dataset.portalEn) {
      backLink.dataset.portalEn = english;
    }
    backLink.textContent = portalLanguage === "hi" ? localizePortalTitle(english) : english;
  }

  const title = document.querySelector(".portal-title");
  if (title) {
    const english = normalizePortalText(title.dataset.portalEn || title.textContent);
    if (!title.dataset.portalEn) {
      title.dataset.portalEn = english;
    }
    title.textContent = portalLanguage === "hi" ? localizePortalTitle(english) : english;
  }

  const footer = document.querySelector(".portal-footer");
  if (footer) {
    const english = normalizePortalText(footer.dataset.portalEn || footer.textContent).replace("? 2026", "© 2026");
    if (!footer.dataset.portalEn) {
      footer.dataset.portalEn = english;
    }
    footer.textContent = portalLanguage === "hi"
      ? `© 2026 KHABRI JUNCTION - ${portalStaticLabel("All Rights Reserved")}`
      : english;
  }
}

function addPortalLanguageSwitch() {
  const header = document.querySelector(".portal-site-header");

  if (!header || document.getElementById("portalLanguageSwitch")) {
    return;
  }

  const switcher = document.createElement("div");
  switcher.className = "portal-language-switch";
  switcher.id = "portalLanguageSwitch";
  switcher.innerHTML = `
    <button class="${portalLanguage === "hi" ? "active" : ""}" type="button" data-portal-lang="hi">हिंदी</button>
    <button class="${portalLanguage === "en" ? "active" : ""}" type="button" data-portal-lang="en">English</button>
  `;
  header.appendChild(switcher);
  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("[data-portal-lang]");

    if (!button) {
      return;
    }

    portalLanguage = button.dataset.portalLang;
    localStorage.setItem(PORTAL_LANGUAGE_KEY, portalLanguage);
    switcher.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item.dataset.portalLang === portalLanguage));
    translatePortalStatic();
    loadPortalMongoNews();
  });
}

const PORTAL_UTF_MOJIBAKE_BYTES = {
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

function repairPortalMojibake(value) {
  const text = String(value || "").trim();

  if (!text || !/[à-ÿŒœŠšŽžŸ€‚ƒ„…†‡ˆ‰‹›‘’“”•–—˜™]/.test(text)) {
    return text;
  }

  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => {
      const code = char.charCodeAt(0);
      return code <= 0xff ? code : (PORTAL_UTF_MOJIBAKE_BYTES[code] ?? 0x3f);
    }));

    return new TextDecoder("utf-8").decode(bytes)
      .replace(/\uFFFD/g, "")
      .replace(/Â°/g, "°")
      .replace(/â€™/g, "'")
      .trim();
  } catch (error) {
    return text;
  }
}

function normalizePortalText(value) {
  const text = String(value || "").trim();
  const normalized = /à¤|Ã|Â|â€™|œ|™|š|ž|ÿ|�/.test(text) ? repairPortalMojibake(text) : text;
  return normalized
    .replace(/Â°/g, "°")
    .replace(/â€™/g, "'")
    .trim();
}

function uiText(en, hi) {
  if (portalLanguage !== "hi") {
    return normalizePortalText(en);
  }

  if (PORTAL_HINDI_TEXT[en]) {
    return normalizePortalText(PORTAL_HINDI_TEXT[en]);
  }

  const repaired = normalizePortalText(hi);
  return repaired || normalizePortalText(en);
}

function portalStaticLabel(value) {
  const text = normalizePortalText(value);
  const labels = {
    "Fast local news for Chhattisgarh": "\u091b\u0924\u094d\u0924\u0940\u0938\u0917\u0922\u093c \u0915\u0940 \u0924\u0947\u091c\u093c \u0932\u094b\u0915\u0932 \u0916\u092c\u0930\u0947\u0902",
    "Home": "\u0939\u094b\u092e",
    "Durg": "\u0926\u0941\u0930\u094d\u0917",
    "Bhilai": "\u092d\u093f\u0932\u093e\u0908",
    "Raipur": "\u0930\u093e\u092f\u092a\u0941\u0930",
    "Bilaspur": "\u092c\u093f\u0932\u093e\u0938\u092a\u0941\u0930",
    "Politics": "\u0930\u093e\u091c\u0928\u0940\u0924\u093f",
    "Crime": "\u0915\u094d\u0930\u093e\u0907\u092e",
    "Sports": "\u0938\u094d\u092a\u094b\u0930\u094d\u091f\u094d\u0938",
    "Entertainment": "\u092e\u0928\u094b\u0930\u0902\u091c\u0928",
    "Health": "\u0939\u0947\u0932\u094d\u0925",
    "Jobs": "\u091c\u0949\u092c\u094d\u0938",
    "ADVERTISEMENT SPACE": "\u0935\u093f\u091c\u094d\u091e\u093e\u092a\u0928 \u0938\u094d\u0925\u093e\u0928",
    "Latest News": "\u0924\u093e\u091c\u093c\u093e \u0916\u092c\u0930\u0947\u0902",
    "Top News": "\u091f\u0949\u092a \u0916\u092c\u0930\u0947\u0902",
    "Photos": "\u092b\u094b\u091f\u094b",
    "Cricket": "\u0915\u094d\u0930\u093f\u0915\u0947\u091f",
    "Football": "\u092b\u0941\u091f\u092c\u0949\u0932",
    "Tennis": "\u091f\u0947\u0928\u093f\u0938",
    "Photo": "\u092b\u094b\u091f\u094b",
    "Video": "\u0935\u0940\u0921\u093f\u092f\u094b",
    "SPONSOR SLOT": "\u0938\u094d\u092a\u0949\u0928\u094d\u0938\u0930 \u0938\u094d\u0932\u0949\u091f",
    "All Rights Reserved": "\u0938\u0930\u094d\u0935\u093e\u0927\u093f\u0915\u093e\u0930 \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924"
  };

  return labels[text] || text;
}

function localizePortalTitle(text) {
  const raw = normalizePortalText(text);
  if (portalLanguage !== "hi") {
    return raw;
  }

  return raw
    .replace(/^Home \/\s*/i, "\u0939\u094b\u092e / ")
    .replace(/\bNews\b/g, "\u0938\u092e\u093e\u091a\u093e\u0930")
    .replace(/\bDurg\b/g, "\u0926\u0941\u0930\u094d\u0917")
    .replace(/\bBhilai\b/g, "\u092d\u093f\u0932\u093e\u0908")
    .replace(/\bRaipur\b/g, "\u0930\u093e\u092f\u092a\u0941\u0930")
    .replace(/\bBilaspur\b/g, "\u092c\u093f\u0932\u093e\u0938\u092a\u0941\u0930")
    .replace(/\bRajnandgaon\b/g, "\u0930\u093e\u091c\u0928\u093e\u0902\u0926\u0917\u093e\u0902\u0935")
    .replace(/\bKhairagarh\b/g, "\u0916\u0948\u0930\u093e\u0917\u0922\u093c")
    .replace(/\bKawardha\b/g, "\u0915\u0935\u0930\u094d\u0927\u093e")
    .replace(/\bAstrology\b/g, "\u0930\u093e\u0936\u093f\u092b\u0932")
    .replace(/\bBreaking\b/g, "\u092c\u094d\u0930\u0947\u0915\u093f\u0902\u0917")
    .replace(/\bPolitics\b/g, "\u0930\u093e\u091c\u0928\u0940\u0924\u093f")
    .replace(/\bCrime\b/g, "\u0915\u094d\u0930\u093e\u0907\u092e")
    .replace(/\bSports\b/g, "\u0938\u094d\u092a\u094b\u0930\u094d\u091f\u094d\u0938")
    .replace(/\bEntertainment\b/g, "\u092e\u0928\u094b\u0930\u0902\u091c\u0928")
    .replace(/\bHealth\b/g, "\u0939\u0947\u0932\u094d\u0925")
    .replace(/\bJobs\b/g, "\u091c\u0949\u092c\u094d\u0938");
}

function translatePortalStatic() {
  document.documentElement.lang = portalLanguage === "hi" ? "hi" : "en";
  document.querySelectorAll(".portal-brand span, .portal-main-nav a, .portal-top-ad, .portal-tabs a, .portal-section-title, .portal-ad, .portal-side-ad, .portal-side-block h2, .portal-read-more").forEach((node) => {
    const english = normalizePortalText(node.dataset.portalEn || node.textContent);
    if (!node.dataset.portalEn) {
      node.dataset.portalEn = english;
    }
    node.textContent = portalLanguage === "hi" ? portalStaticLabel(english) : english;
  });

  const backLink = document.querySelector(".portal-back");
  if (backLink) {
    const english = normalizePortalText(backLink.dataset.portalEn || backLink.textContent);
    if (!backLink.dataset.portalEn) {
      backLink.dataset.portalEn = english;
    }
    backLink.textContent = portalLanguage === "hi" ? localizePortalTitle(english) : english;
  }

  const title = document.querySelector(".portal-title");
  if (title) {
    const english = normalizePortalText(title.dataset.portalEn || title.textContent);
    if (!title.dataset.portalEn) {
      title.dataset.portalEn = english;
    }
    title.textContent = portalLanguage === "hi" ? localizePortalTitle(english) : english;
  }

  const footer = document.querySelector(".portal-footer");
  if (footer) {
    const english = normalizePortalText(footer.dataset.portalEn || footer.textContent).replace("? 2026", "© 2026");
    if (!footer.dataset.portalEn) {
      footer.dataset.portalEn = english;
    }
    footer.textContent = portalLanguage === "hi"
      ? `© 2026 KHABRI JUNCTION - ${portalStaticLabel("All Rights Reserved")}`
      : english;
  }
}

function addPortalLanguageSwitch() {
  const header = document.querySelector(".portal-site-header");

  if (!header || document.getElementById("portalLanguageSwitch")) {
    return;
  }

  const switcher = document.createElement("div");
  switcher.className = "portal-language-switch";
  switcher.id = "portalLanguageSwitch";
  switcher.innerHTML = `
    <button class="${portalLanguage === "hi" ? "active" : ""}" type="button" data-portal-lang="hi">हिंदी</button>
    <button class="${portalLanguage === "en" ? "active" : ""}" type="button" data-portal-lang="en">English</button>
  `;
  header.appendChild(switcher);
  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("[data-portal-lang]");

    if (!button) {
      return;
    }

    portalLanguage = button.dataset.portalLang;
    localStorage.setItem(PORTAL_LANGUAGE_KEY, portalLanguage);
    switcher.querySelectorAll("button").forEach((item) => {
      item.textContent = item.dataset.portalLang === "hi" ? "हिंदी" : "English";
      item.classList.toggle("active", item.dataset.portalLang === portalLanguage);
    });
    translatePortalStatic();
    loadPortalMongoNews();
  });
}

createPortalModal();
addPortalLanguageSwitch();
translatePortalStatic();
highlightPortalNav();
bindPortalNewsCards();
bindPortalModal();
loadPortalMongoNews();
