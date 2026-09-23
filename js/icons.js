// Hand-drawn line-icon set (no external icon font / CDN dependency).
// Usage: icon("pin") returns a ready-to-inject <span class="icon">…</span>.

const ICONS = {
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>`,

  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4.5h3.3l1.2 4-2 1.6a12.4 12.4 0 0 0 5.4 5.4l1.6-2 4 1.2V18c0 1-.8 1.8-1.8 1.7A15.8 15.8 0 0 1 3.3 6.3C3.2 5.3 4 4.5 5 4.5Z"/></svg>`,

  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`,

  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5 17 7"/><path d="M11.5 6.5H17v5.5"/><path d="M12.5 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5v-5.5"/></svg>`,

  sparkle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c.7 4 2.7 6 6.7 6.7-4 .7-6 2.7-6.7 6.7-.7-4-2.7-6-6.7-6.7C9.3 9 11.3 7 12 3Z"/></svg>`,

  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.7 14.7 9l6.6.9-4.8 4.6 1.2 6.6L12 17.9 6.3 21.1l1.2-6.6-4.8-4.6L9.3 9 12 2.7Z"/></svg>`,

  starOutline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2.7 14.7 9l6.6.9-4.8 4.6 1.2 6.6L12 17.9 6.3 21.1l1.2-6.6-4.8-4.6L9.3 9 12 2.7Z"/></svg>`,

  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,

  arrowUpRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>`,
};

function icon(name, extraClass) {
  const svg = ICONS[name] || "";
  return `<span class="icon${extraClass ? " " + extraClass : ""}" aria-hidden="true">${svg}</span>`;
}

window.icon = icon;
