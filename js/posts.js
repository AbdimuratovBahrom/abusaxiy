// ── Страница «Посты и позывные» — язык/тема общие с главной страницей ──────
const LANG_KEY = "abusaxiy_lang";
const THEME_KEY = "abusaxiy_theme";

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

let currentLang = safeGet(LANG_KEY) || "ru";
let activeFilter = "all";

const headerTitleEl  = document.getElementById("headerTitle");
const backLinkEl      = document.getElementById("postsBackLink");
const titleEl         = document.getElementById("postsTitle");
const totalLineEl     = document.getElementById("postsTotalLine");
const searchInput     = document.getElementById("postsSearchInput");
const chipsEl         = document.getElementById("postsChips");
const listEl          = document.getElementById("postsList");
const themeToggle     = document.getElementById("themeToggle");

const SECTIONS = window.POSTS_DATA.sections;
const TOTAL_NUMBERED = SECTIONS.reduce(
  (sum, s) => sum + s.posts.filter(p => p.n !== null).length, 0
);

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function postHaystack(post) {
  return [
    post.callsign.ru, post.callsign.uz_latn, post.callsign.uz_cyrl,
    post.post.ru, post.post.uz_latn, post.post.uz_cyrl
  ].join(" ").toLowerCase();
}

// ── Тема (светлая/тёмная), общая с главной страницей ────────────────────────
function applyTheme(theme) {
  if (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  const isDark = theme
    ? theme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (themeToggle) {
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-label", translations[currentLang][isDark ? "themeToLight" : "themeToDark"]);
  }
}
applyTheme(safeGet(THEME_KEY));

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark"
      || (!document.documentElement.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    safeSet(THEME_KEY, next);
    applyTheme(next);
  });
}

// ── Язык, общий с главной страницей ──────────────────────────────────────────
document.querySelectorAll(".ds-lang-btn[data-lang]").forEach(btn => {
  btn.classList.toggle("active", btn.dataset.lang === currentLang);
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    safeSet(LANG_KEY, currentLang);
    document.querySelectorAll(".ds-lang-btn[data-lang]").forEach(b => b.classList.toggle("active", b === btn));
    applyTheme(safeGet(THEME_KEY));
    render();
  });
});

// ── Чипы разделов ────────────────────────────────────────────────────────────
function renderChips(t) {
  chipsEl.innerHTML = "";

  const allChip = document.createElement("button");
  allChip.type = "button";
  allChip.className = "posts-chip" + (activeFilter === "all" ? " active" : "");
  allChip.textContent = t.postsAll;
  allChip.addEventListener("click", () => { activeFilter = "all"; render(); });
  chipsEl.appendChild(allChip);

  SECTIONS.forEach(section => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "posts-chip" + (activeFilter === section.id ? " active" : "");
    chip.textContent = section.title[currentLang];
    chip.addEventListener("click", () => { activeFilter = section.id; render(); });
    chipsEl.appendChild(chip);
  });
}

// ── Список постов ────────────────────────────────────────────────────────────
function renderList(t) {
  const query = searchInput.value.trim().toLowerCase();
  listEl.innerHTML = "";
  let shown = 0;

  SECTIONS.forEach(section => {
    if (activeFilter !== "all" && activeFilter !== section.id) return;

    const posts = query
      ? section.posts.filter(p => postHaystack(p).includes(query))
      : section.posts;
    if (posts.length === 0) return;

    shown += posts.length;

    const card = document.createElement("section");
    card.className = "ds-card";

    const heading = document.createElement("h2");
    heading.className = "posts-section-title";
    heading.innerHTML = `${escapeHTML(section.title[currentLang])} <span class="posts-section-count">(${section.posts.length})</span>`;
    card.appendChild(heading);

    posts.forEach(post => {
      const row = document.createElement("div");
      row.className = "posts-row";

      const name = post.post[currentLang].trim();
      const nameHTML = name
        ? escapeHTML(name)
        : `<span class="posts-name is-muted">${escapeHTML(t.postsNoName)}</span>`;

      const locationHTML = post.map
        ? `<a class="posts-location-btn" href="${escapeHTML(post.map)}" target="_blank" rel="noopener">${escapeHTML(t.postsLocation)}</a>`
        : `<span class="posts-no-location">${escapeHTML(t.postsNoLocation)}</span>`;

      row.innerHTML = `
        <div class="posts-row-top">
          <span class="posts-num">${post.n === null ? "•" : post.n}</span>
          <span class="posts-callsign">${escapeHTML(post.callsign[currentLang])}</span>
        </div>
        <div class="posts-row-bottom">
          ${name ? `<span class="posts-name">${nameHTML}</span>` : nameHTML}
          ${locationHTML}
        </div>
      `;
      card.appendChild(row);
    });

    listEl.appendChild(card);
  });

  if (shown === 0) {
    listEl.innerHTML = `<div class="ds-empty">
      <span class="ds-empty-icon">🔍</span>${escapeHTML(t.postsNotFound)}
    </div>`;
  }
}

if (searchInput) {
  searchInput.addEventListener("input", () => renderList(translations[currentLang]));
}

// ── Полная отрисовка страницы ────────────────────────────────────────────────
function render() {
  const t = translations[currentLang];
  document.documentElement.lang = currentLang === "ru" ? "ru" : "uz";

  if (headerTitleEl) headerTitleEl.textContent = t.appName;
  if (backLinkEl) backLinkEl.textContent = t.postsBack;
  if (titleEl) titleEl.textContent = t.postsTitle;
  document.title = `${t.postsTitle} — ${t.appName}`;
  if (totalLineEl) totalLineEl.textContent = `${t.postsTotal}: ${TOTAL_NUMBERED}`;
  if (searchInput) searchInput.placeholder = t.postsSearch;

  renderChips(t);
  renderList(t);
}

render();
