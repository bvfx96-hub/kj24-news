const PORTAL_API_BASE_URL = window.KJ_API_BASE_URL || (window.location.protocol === "file:" ? "http://localhost:3000" : "");
const PORTAL_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=900&auto=format&fit=crop";
const PORTAL_LANGUAGE_KEY = "khabriJunctionPortalLanguage";
const requestedPortalLanguage = new URLSearchParams(window.location.search).get("lang");
let portalLanguage = requestedPortalLanguage === "en" ? "en" : "hi";
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
      <a href="${escapeHTML(item.articleUrl || `/news/${item.slug}`)}?lang=${portalLanguage}" target="_blank" rel="noopener">
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

  if (news.articleUrl) {
    articleLink.href = `${news.articleUrl}?lang=${portalLanguage}`;
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
    data-article-url="${escapeHTML(item.articleUrl || "")}"
  `;
}

function portalCard(item) {
  const image = item.image || PORTAL_FALLBACK_IMAGE;
  const title = localizedValue(item, "title");
  const summary = localizedValue(item, "summary");
  const url = item.articleUrl ? `${item.articleUrl}?lang=${portalLanguage}` : "#";

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
  const url = item.articleUrl ? `${item.articleUrl}?lang=${portalLanguage}` : "#";

  return `<article class="portal-list-item" ${newsDataset(item)}>
    <div><span>${escapeHTML(item.categoryBadge || item.category || "NEWS")}</span><h3>${escapeHTML(title)}</h3></div>
    <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" loading="lazy" decoding="async">
    <a class="read-btn" href="${escapeHTML(url)}">${uiText("Read More", "और पढ़ें")}</a>
  </article>`;
}

function portalPhotoItem(item) {
  const image = item.image || PORTAL_FALLBACK_IMAGE;
  const title = localizedValue(item, "title");
  const url = item.articleUrl ? `${item.articleUrl}?lang=${portalLanguage}` : "#";

  return `<article class="portal-photo-card" ${newsDataset(item)}>
    <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" loading="lazy" decoding="async">
    <h3>${escapeHTML(title)}</h3>
    <a class="read-btn" href="${escapeHTML(url)}">${uiText("Read", "पढ़ें")}</a>
  </article>`;
}

function portalSideItem(item) {
  const image = item.image || PORTAL_FALLBACK_IMAGE;
  const title = localizedValue(item, "title");

  return `<a class="portal-side-item" href="${escapeHTML(item.articleUrl || "#")}?lang=${portalLanguage}" ${newsDataset(item)}>
    <h3>${escapeHTML(title)}</h3>
    <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" loading="lazy" decoding="async">
  </a>`;
}

function renderPortalMongoNews(news) {
  if (!news.length) {
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
    block.innerHTML = `${title}${source.slice(0, 5).map(portalSideItem).join("")}<a class="portal-read-more" href="${pageSectionSlug()}.html">${uiText("Read More", "और पढ़ें")}</a>`;
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

    const news = await response.json();
    renderPortalMongoNews(news);
  } catch (error) {
    // Static previews keep their dummy content when the API is unavailable.
  }
}

createPortalModal();
addPortalLanguageSwitch();
highlightPortalNav();
bindPortalNewsCards();
bindPortalModal();
loadPortalMongoNews();
