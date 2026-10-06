// ── Страница «Фото щитов» — язык/тема общие с главной страницей ────────────
const LANG_KEY = "abusaxiy_lang";
const THEME_KEY = "abusaxiy_theme";

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

let currentLang = safeGet(LANG_KEY) || "ru";
let activeBlock = "all";
let activeRow = "all";
let activeType = "all";

const headerTitleEl = document.getElementById("headerTitle");
const backLinkEl     = document.getElementById("shieldsBackLink");
const titleEl        = document.getElementById("shieldsTitle");
const introEl        = document.getElementById("shieldsIntroLine");
const totalLineEl    = document.getElementById("shieldsTotalLine");
const blockSelectEl  = document.getElementById("shieldsBlockSelect");
const rowSelectEl    = document.getElementById("shieldsRowSelect");
const typeChipsEl    = document.getElementById("shieldsTypeChips");
const gridEl         = document.getElementById("shieldsGrid");
const themeToggle    = document.getElementById("themeToggle");

const PHOTOS = window.SHIELDS_DATA;
const IMG_BASE = "./img/shields/";
const TYPE_LABELS = { SHO: "ШО", SHR: "ШР", VRU: "ВРУ", PANEL: "ЩИТ" };

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

// ── Блоки и ряды ──────────────────────────────────────────────────────────────
function blockLabel(block, t) {
  return block === "common" ? t.shieldsCommon : block;
}

function rowLabel(row) {
  return row === "X" ? "?" : row;
}

function rowsForBlock(block) {
  const rows = new Set();
  PHOTOS.forEach(p => {
    if (block === "all" || p.block === block) rows.add(p.row);
  });
  return [...rows].sort();
}

function renderBlockSelect(t) {
  const blocks = [...new Set(PHOTOS.map(p => p.block))].sort();
  blockSelectEl.innerHTML = `<option value="all">${escapeHTML(t.shieldsAllBlocks)}</option>` +
    blocks.map(b => `<option value="${escapeHTML(b)}">${escapeHTML(blockLabel(b, t))}</option>`).join("");
  blockSelectEl.value = activeBlock;
}

function renderRowSelect(t) {
  const rows = rowsForBlock(activeBlock);
  if (!rows.includes(activeRow)) activeRow = "all";
  rowSelectEl.innerHTML = `<option value="all">${escapeHTML(t.shieldsAllRows)}</option>` +
    rows.map(r => `<option value="${escapeHTML(r)}">${escapeHTML(rowLabel(r))}</option>`).join("");
  rowSelectEl.value = activeRow;
}

blockSelectEl.addEventListener("change", () => {
  activeBlock = blockSelectEl.value;
  renderRowSelect(translations[currentLang]);
  renderGrid(translations[currentLang]);
});
rowSelectEl.addEventListener("change", () => {
  activeRow = rowSelectEl.value;
  renderGrid(translations[currentLang]);
});

// ── Чипы типов щитов ─────────────────────────────────────────────────────────
function renderTypeChips(t) {
  const types = [...new Set(PHOTOS.map(p => p.type))];
  typeChipsEl.innerHTML = "";

  const allChip = document.createElement("button");
  allChip.type = "button";
  allChip.className = "shields-chip" + (activeType === "all" ? " active" : "");
  allChip.textContent = t.shieldsAllTypes;
  allChip.addEventListener("click", () => { activeType = "all"; render(); });
  typeChipsEl.appendChild(allChip);

  types.forEach(type => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "shields-chip" + (activeType === type ? " active" : "");
    chip.textContent = TYPE_LABELS[type] || type;
    chip.addEventListener("click", () => { activeType = type; render(); });
    typeChipsEl.appendChild(chip);
  });
}

// ── Сетка фото ────────────────────────────────────────────────────────────────
function renderGrid(t) {
  const matches = PHOTOS.filter(p =>
    (activeBlock === "all" || p.block === activeBlock) &&
    (activeRow === "all" || p.row === activeRow) &&
    (activeType === "all" || p.type === activeType)
  );

  totalLineEl.textContent = `${t.shieldsTotal}: ${matches.length}`;
  gridEl.innerHTML = "";

  if (matches.length === 0) {
    gridEl.innerHTML = `<div class="ds-empty">
      <span class="ds-empty-icon">🔍</span>${escapeHTML(t.shieldsNotFound)}
    </div>`;
    return;
  }

  matches.forEach(p => {
    const src = IMG_BASE + encodeURIComponent(p.file);
    const card = document.createElement("a");
    card.className = "shields-card";
    card.href = src;
    card.target = "_blank";
    card.rel = "noopener";
    card.innerHTML = `
      <img class="shields-thumb" src="${src}" alt="${escapeHTML(TYPE_LABELS[p.type] || p.type)} ${escapeHTML(p.label)}" loading="lazy"/>
      <div class="shields-card-body">
        <span class="shields-card-type">${escapeHTML(TYPE_LABELS[p.type] || p.type)}</span>
        <span class="shields-card-meta">${escapeHTML(t.shieldsBlockLabel)} ${escapeHTML(blockLabel(p.block, t))} · ${escapeHTML(t.shieldsRowLabel)} ${escapeHTML(rowLabel(p.row))}</span>
        <span class="shields-card-label">${escapeHTML(p.label)}</span>
      </div>
    `;
    gridEl.appendChild(card);
  });
}

// ── Полная отрисовка страницы ────────────────────────────────────────────────
function render() {
  const t = translations[currentLang];
  document.documentElement.lang = currentLang === "ru" ? "ru" : "uz";

  if (headerTitleEl) headerTitleEl.textContent = t.appName;
  if (backLinkEl) backLinkEl.textContent = t.shieldsBack;
  if (titleEl) titleEl.textContent = t.shieldsTitle;
  document.title = `${t.shieldsTitle} — ${t.appName}`;
  if (introEl) introEl.textContent = t.shieldsIntro;

  renderBlockSelect(t);
  renderRowSelect(t);
  renderTypeChips(t);
  renderGrid(t);
}

render();
