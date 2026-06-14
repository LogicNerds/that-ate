const BASE = new URL("../", import.meta.url).href;

export function bitesInnerHTML(val) {
  const filled = Math.round(val || 0);
  return [1, 2, 3, 4, 5].map(i =>
    `<span class="bite${i <= filled ? " on" : ""}" data-val="${i}"><img src="${BASE}that-ate-assets/that-ate-bite.png" alt="bite" width="16" height="16"></span>`
  ).join("");
}

export function bitesHTML(val, size = "sm") {
  return `<div class="bites ${size}">${bitesInnerHTML(val)}</div>`;
}

// ── Date formatter ───────────────────────────────────────────────

export function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
}

// ── HTML escaper ─────────────────────────────────────────────────

export function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Toast notification ───────────────────────────────────────────

export function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

// ── Shared CSS string (injected by each page) ────────────────────
// Each page calls injectBaseStyles() at the top of its script
// so all shared styles live in one place.

export function injectBaseStyles() {
  const style = document.createElement("style");
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --indigo:    #4338CA;
      --indigo-dk: #3730a3;
      --indigo-lt: #eef2ff;
      --bg:        #F8FAFC;
      --surface:   #ffffff;
      --border:    #e2e8f0;
      --border-md: #cbd5e1;
      --text:      #1F2937;
      --muted:     #6b7280;
      --subtle:    #f1f5f9;
      --amber:     #F59E0B;
      --red:       #dc2626;
      --radius:    10px;
      --ff:        'Plus Jakarta Sans', system-ui, sans-serif;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--ff);
      font-size: 15px;
      line-height: 1.6;
      min-height: 100vh;
      text-transform: lowercase;
    }
    input, select, textarea { text-transform: none; font-family: var(--ff); }
    button { font-family: var(--ff); cursor: pointer; text-transform: lowercase; }
    a { text-transform: lowercase; }
    ::selection { background: #4338ca22; }

    /* Nav */
    .nav {
      position: sticky; top: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 1.75rem; height: 58px;
      background: var(--indigo);
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .nav-brand { display: flex; align-items: center; gap: 0.4rem; text-decoration: none; }
    .nav-brand-icon { font-size: 1.2rem; line-height: 1; }
    .nav-brand-name {
      font-size: 1.2rem; font-weight: 600;
      color: #fff; letter-spacing: -0.01em;
    }
    .nav-links { display: flex; gap: 0.25rem; }
    .nav-link {
      color: rgba(255,255,255,0.7);
      font-size: 0.82rem; font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0.4rem 0.75rem; border-radius: 6px;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .nav-link:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .nav-link.active { background: rgba(255,255,255,0.18); color: #fff; }
    .nav-user {
      background: rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.85);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px; padding: 4px 13px;
      font-size: 0.78rem; font-weight: 500;
    }

    /* Buttons */
    .btn-primary {
      background: var(--indigo); color: #fff;
      border: none; border-radius: 7px;
      padding: 0.5rem 1.1rem;
      font-size: 0.84rem; font-weight: 600;
      text-decoration: none; display: inline-block;
      transition: background 0.15s;
    }
    .btn-primary:hover { background: var(--indigo-dk); }
    .btn-ghost {
      background: none; color: var(--indigo);
      border: 1.5px solid var(--indigo); border-radius: 7px;
      padding: 0.45rem 1rem;
      font-size: 0.84rem; font-weight: 600;
      text-decoration: none; display: inline-block;
      transition: background 0.15s;
    }
    .btn-ghost:hover { background: var(--indigo-lt); }

    /* Tags */
    .tag {
      background: var(--indigo-lt); color: var(--indigo);
      border-radius: 20px; padding: 2px 9px;
      font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.04em; white-space: nowrap;
    }

    /* Bites */
    .bites { display: flex; gap: 4px; align-items: center; line-height: 1; }
    .bites .bite { display: inline-flex; user-select: none; transition: opacity 0.1s; opacity: 0.25; }
    .bites .bite.on { opacity: 1; }
    .bites.clickable .bite { cursor: pointer; }
    .bites.clickable .bite:hover { opacity: 0.75; }
    .bites.sm .bite img { width: 14px; height: 14px; }
    .bites.md .bite img { width: 20px; height: 20px; }
    .bites.lg .bite img { width: 32px; height: 32px; }

    /* Breadcrumb */
    .breadcrumb { font-size: 0.78rem; color: var(--muted); margin-bottom: 0.5rem; }
    .breadcrumb a { color: var(--indigo); font-weight: 500; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }

    /* Empty states */
    .empty { text-align: center; color: var(--muted); padding: 3.5rem 0; }
    .empty p { margin-bottom: 0.75rem; }
    .empty-cta {
      color: var(--indigo); font-weight: 600;
      font-size: 0.93rem; text-decoration: none;
      background: none; border: none; font-family: var(--ff);
    }
    .empty-cta:hover { text-decoration: underline; }

    /* Status */
    .status { text-align: center; color: var(--muted); padding: 3rem; }

    /* Toast */
    .toast {
      position: fixed; bottom: 1.5rem; left: 50%;
      transform: translateX(-50%) translateY(70px);
      background: var(--text); color: #fff;
      border-radius: 8px; padding: 0.6rem 1.25rem;
      font-size: 0.87rem; font-weight: 500;
      opacity: 0; transition: all 0.28s ease;
      white-space: nowrap; z-index: 999;
    }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* Form shared styles */
    .form-group { margin-bottom: 1.15rem; }
    .form-label {
      display: block; font-size: 0.75rem; font-weight: 600;
      letter-spacing: 0.06em; color: var(--muted); margin-bottom: 0.4rem;
    }
    .form-label .optional {
      color: #9ca3af; font-weight: 400; font-style: italic;
      letter-spacing: 0; font-size: 0.72rem; text-transform: none;
    }
    .form-input {
      width: 100%; padding: 0.65rem 0.9rem;
      background: var(--surface);
      border: 1.5px solid var(--border-md);
      border-radius: 7px; color: var(--text);
      font-size: 0.93rem; font-family: var(--ff);
      outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-input:focus {
      border-color: var(--indigo);
      box-shadow: 0 0 0 3px rgba(67,56,202,0.1);
    }
    .form-input::placeholder { color: #9ca3af; }
    .form-input:disabled { opacity: 0.45; cursor: not-allowed; background: var(--subtle); }
    select.form-input { cursor: pointer; }
    textarea.form-input { resize: vertical; line-height: 1.55; }
    .form-divider { height: 1px; background: var(--border); margin: 1.5rem 0; }
    .form-error {
      background: #fef2f2; border: 1px solid #fecaca;
      color: var(--red); font-size: 0.84rem;
      border-radius: 6px; padding: 0.55rem 0.9rem;
      margin-bottom: 0.85rem;
    }
    .btn-submit {
      width: 100%; padding: 0.8rem;
      background: var(--indigo); color: #fff;
      border: none; border-radius: 7px;
      font-size: 0.95rem; font-weight: 600;
      letter-spacing: 0.02em; transition: background 0.15s;
    }
    .btn-submit:hover:not(:disabled) { background: var(--indigo-dk); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 600px) {
      .nav-links { gap: 0; }
      .nav-link { padding: 0.4rem 0.5rem; font-size: 0.76rem; }
    }
  `;
  document.head.appendChild(style);
}
