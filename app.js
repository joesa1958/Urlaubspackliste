/* Urlaubspackliste – Daten in Dropbox (App-Ordner der Wohnmobil-Checkliste), Seite auf GitHub Pages */
'use strict';

const DROPBOX_APP_KEY = '9wwhq5jwa3tjcf4';
const DATA_PATH = '/urlaubspackliste.json';
const SOURCE_PATH = '/listen.json';
const TPL = 'vorlage'; // Vorlage für neue Listen: liegt bei den Listen, gehört zu keiner Gruppe (daher nicht in der Übersicht) // Wohnmobil-Checkliste: einmalige Übernahme der „Packliste unsere Sachen“
const LS = 'urlaub.';

/* ---------- Hilfen ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = o => JSON.parse(JSON.stringify(o));
function lsGet(k, d) { try { const v = localStorage.getItem(LS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) {} }
function lsDel(k) { try { localStorage.removeItem(LS + k); } catch (e) {} }
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}
const PEOPLE = { J: 'Jörg', A: 'Anne', B: 'Beide' };
const RESP_CYCLE = ['J', 'A', 'B', ''];
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const fmtDate = iso => { const d = new Date(iso); return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const fmtTime = ts => new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

/* ---------- Icons ---------- */
const I = {
  advent: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="9.1" y="8.4" width="2.4" height="8" rx=".6" fill="currentColor" opacity=".7"/><rect x="12.5" y="8.4" width="2.4" height="8" rx=".6" fill="currentColor" opacity=".7"/><path d="M10.3 7.4c-1.2-1.1-1.1-2.6 0-3.9 1.1 1.3 1.2 2.8 0 3.9zM13.7 7.4c-1.2-1.1-1.1-2.6 0-3.9 1.1 1.3 1.2 2.8 0 3.9z" fill="currentColor" opacity=".7"/><path d="M2.5 18.5c0-1.8 4.3-3.2 9.5-3.2s9.5 1.4 9.5 3.2-4.3 3.2-9.5 3.2-9.5-1.4-9.5-3.2z" fill="none" stroke="currentColor" stroke-width="2.8"/><rect x="5" y="10.2" width="2.8" height="8.6" rx=".7" fill="currentColor"/><rect x="16.2" y="10.2" width="2.8" height="8.6" rx=".7" fill="currentColor"/><path d="M6.4 9.2c-1.2-1.1-1.1-2.6 0-3.9 1.1 1.3 1.2 2.8 0 3.9zM17.6 9.2c-1.2-1.1-1.1-2.6 0-3.9 1.1 1.3 1.2 2.8 0 3.9z" fill="currentColor"/></svg>',
  gift: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="8.5" width="17" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 12.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5M12 8.5V21M12 8.5c-1-2.8-2.6-4.5-4.3-4.5A1.9 1.9 0 0 0 7.7 8C9 8.5 10.6 8.5 12 8.5zM12 8.5c1-2.8 2.6-4.5 4.3-4.5a1.9 1.9 0 0 1 0 4c-1.3.5-2.9.5-4.3.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  island: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 16.5c1.8-2.6 4.6-4 7.5-4s5.7 1.4 7.5 4M12.5 12.6c.2-2.8-.2-5.3-1.2-7.6M11.3 5C9.8 3.6 7.5 3.4 6 4.5c1.6 0 2.9.4 3.8 1.3M11.3 5c1.3-1.6 3.6-2 5.3-1.1-1.6.2-2.8.8-3.6 1.8M2.5 20c1.6 0 1.6-1.3 3.2-1.3s1.6 1.3 3.2 1.3 1.6-1.3 3.1-1.3 1.6 1.3 3.2 1.3 1.6-1.3 3.1-1.3 1.6 1.3 3.2 1.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lighthouse: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 8h5l1.5 12H8zM10 8V6.5a2 2 0 0 1 4 0V8M12 3v1.5M8.8 13.5h6.4M5 6l2.5 1M19 6l-2.5 1M5.5 21h13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sea: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 9c1.6 0 1.6-1.5 3.2-1.5S7.3 9 8.9 9s1.6-1.5 3.1-1.5S13.6 9 15.2 9s1.6-1.5 3.1-1.5S19.9 9 21.5 9M2.5 13.5c1.6 0 1.6-1.5 3.2-1.5s1.6 1.5 3.2 1.5 1.6-1.5 3.1-1.5 1.6 1.5 3.2 1.5 1.6-1.5 3.1-1.5 1.6 1.5 3.2 1.5M2.5 18c1.6 0 1.6-1.5 3.2-1.5s1.6 1.5 3.2 1.5 1.6-1.5 3.1-1.5 1.6 1.5 3.2 1.5 1.6-1.5 3.1-1.5 1.6 1.5 3.2 1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  beach: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11a8 8 0 0 1 15.5-2.8zM11.8 9.7 15 20M3 20.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  boat: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M12 4l6.5 10H12M10 6.5 5.5 14H10M3.5 17.5h17l-2 3h-13zM3 21.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  palm: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9.5c0 4 .8 8 1.8 11.5M12 9.5C10 6 6.5 5.5 4 7c2.5-.2 4.5.5 5.5 2M12 9.5c2-3.5 5.5-4 8-2.5-2.5-.2-4.5.5-5.5 2M12 9.5C11 6 12.5 3.5 15 3M12 9.5c-1.5-2.5-4-3.5-6.5-3M7 21h11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  suitcase: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="12.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7M9 7v12.5M15 7v12.5M7 19.5V21M17 19.5V21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  plane: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3.8c0-1 .7-1.8 1.5-1.8s1.5.8 1.5 1.8V9l7 4.2v2l-7-2.2v4.8l2.2 1.7V21L12 20l-3.7 1v-1.5l2.2-1.7V13l-7 2.2v-2L10.5 9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  city: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V9l5-3v15M10 21V4l7 3v14M19 21V12h-2M13 9h1M13 12h1M13 15h1M7 12h1M7 15h1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mountain: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 20 9 8l4 7 2.5-4 6 9zM7 12.5l2 1.5 2-1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  refresh: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  select: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5l1.8 1.8L9 5M4 12.5l1.8 1.8L9 11M4 18.5l1.8 1.8L9 17M12 7h8M12 13h8M12 19h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  copy: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  up: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  wrench: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5zM14.5 6.5l3-3a4 4 0 0 1 3 3l-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cart: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 10.5a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19.5" r="1.5" fill="currentColor"/><circle cx="17" cy="19.5" r="1.5" fill="currentColor"/></svg>',
  paw: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="4.5" ry="3.8" fill="currentColor"/><circle cx="6" cy="10.5" r="2" fill="currentColor"/><circle cx="18" cy="10.5" r="2" fill="currentColor"/><circle cx="9.3" cy="6.5" r="2" fill="currentColor"/><circle cx="14.7" cy="6.5" r="2" fill="currentColor"/></svg>',
  flag: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bike: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="16" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="16" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 16l4-7h6l2 7M10 9l-1.5-3H6M12 16l4-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  drop: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  flame: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-1.5 2-2 3.5-2 5-1-1-1.6-2-1.8-3C8 9 6 11.5 6 15a6 6 0 0 0 6 6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  bolt: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  key: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 12l9-9M16 7l3 3M18 5l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  medic: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 6V4.5h6V6M12 10v6M9 13h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  awning: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18M3 5l2 7h14l2-7M7 12v7M17 12v7M5 12c0 1.5 1 2 2 2s2-.5 2-2c0 1.5 1 2 2 2s2-.5 2-2c0 1.5 1 2 2 2s2-.5 2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  window: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2"/></svg>',
  door: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="14.5" cy="12" r="1.2" fill="currentColor"/></svg>',
  lock: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  step: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h6v-5h6v-5h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  support: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M7 6v10M17 6v10M4 20h6M14 20h6M7 16l-2 4M7 16l2 4M17 16l-2 4M17 16l2 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plug: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0V8zM12 17v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tire: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5" stroke="currentColor" stroke-width="2"/></svg>',
  light: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fridge: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 10h12M9 6v2M9 13v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  trash: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cabinet: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 9h16M4 15h16M10 6h4M10 12h4M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  toilet: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h6v7H7zM5 10h14a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6zM9 16l-1 5h8l-1-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  fan: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1.8" fill="currentColor"/><path d="M12 10.2C11 6 12.5 3 15 3.5c2.3.5 1.6 4-3 6.7M13.8 12c4.2-1 7.2.5 6.7 3-.5 2.3-4 1.6-6.7-3M12 13.8c1 4.2-.5 7.2-3 6.7-2.3-.5-1.6-4 3-6.7M10.2 12C6 13 3 11.5 3.5 9c.5-2.3 4-1.6 6.7 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  wedge: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 19h18L21 9 3 19zM9 15.7l1.5 3.3M14 12.9l2 6.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  fuel: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M4 10h10M14 8l3 3v6.5a1.5 1.5 0 0 0 3 0V8l-3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  oil: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h4l2-2h4l6-2-5 7v3a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-5zM7 10V7h4M20.5 15.5c0 1-.7 1.7-1.5 1.7s-1.5-.7-1.5-1.7c0-.8 1.5-2.7 1.5-2.7s1.5 1.9 1.5 2.7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  canister: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21h12a1 1 0 0 0 1-1V8l-4-4H9L5 8v12a1 1 0 0 0 1 1zM9 4V2.5h4V4M8 12h8M8 16h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  wiper: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18a13 13 0 0 1 18 0M12 18l5-9M16 10l2.5 1.2M9 6.5c0 .9-.7 1.6-1.5 1.6S6 7.4 6 6.5c0-.8 1.5-2.5 1.5-2.5S9 5.7 9 6.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gasbottle: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9a5 5 0 0 1 10 0v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9zM10 4V2.5h4V4M9.5 4h5M7 12h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  waste: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9zM12 10v5M9.8 13l2.2 2.2 2.2-2.2M5 21h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gauge: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17a8 8 0 1 1 16 0M12 17l4-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.6" fill="currentColor"/><path d="M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  nav: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 19.5 21 12 17l-7.5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  plant: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14h8l-1 7H9zM12 14V9M12 11c-3 0-5-2-5-5 3 0 5 2 5 5zM12 9c0-3 2-5 5-5 0 3-2 5-5 5z"/></g></svg>',
  shield: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></g></svg>',
  tap: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h10a3 3 0 0 1 3 3v2M9 9V6M6 6h6M17 18c0 1-.7 1.8-1.5 1.8S14 19 14 18c0-.9 1.5-2.5 1.5-2.5S17 17.1 17 18z"/></g></svg>',
  bottle: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4v3l2 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3zM8 13h8"/></g></svg>',
  roll: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="7" cy="10" rx="3" ry="5"/><path d="M7 5h11v10H7M18 15v4H10"/></g></svg>',
  doc: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/></g></svg>',
  map: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/></g></svg>',
  box: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/></g></svg>',
  bowl: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18c0 4-4 7-9 7s-9-3-9-7zM8 21h8M9 8c0-1.5 1-2 1-3.5M14 8c0-1.5 1-2 1-3.5"/></g></svg>',
  leash: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21c0-5 4-6 6-9s1-7 4-8a2.5 2.5 0 1 1 2 4.5M3 21h6"/></g></svg>',
  blanket: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M4 14h16"/></g></svg>',
  bed: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19V9M3 15h18v4M21 15v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="6.5" cy="12.5" r="1.5"/></g></svg>',
  shoe: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V10l4 1 2.5 2.5H14l5 1.5a2 2 0 0 1 2 2V18zM3 21h18"/></g></svg>',
  shirt: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3c0 1.7-1.3 3-4 3S8 4.7 8 3z"/></g></svg>',
  umbrella: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 1-4 0"/></g></svg>',
  pill: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7zM7 7l7 7"/></g></svg>',
  cream: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1 12H9zM10 15h4v4h-4zM11 19v2h2v-2"/></g></svg>',
  tooth: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3c-2 0-3 2-3 4 0 3 1 4 2 7s1 7 3 7 2-5 3-5 1 5 3 5 2-4 3-7 2-4 2-7c0-2-1-4-3-4s-3 1-5 1-3-1-5-1z"/></g></svg>',
  scissors: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 18M8 15.5L20 6"/></g></svg>',
  glasses: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="14" r="3.5"/><circle cx="17" cy="14" r="3.5"/><path d="M10.5 14h3M3.5 14L5 7M20.5 14L19 7"/></g></svg>',
  towel: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v15l-3-2-3 2-3-2-3 2zM6 8h12"/></g></svg>',
  bug: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="14" rx="3" ry="5"/><path d="M12 9V6M9 5l3 1 3-1M9 12H4M15 12h5M9 16l-3 2M15 16l3 2"/></g></svg>',
  torch: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8v4l-2 3v11h-4V10L8 7zM8 7h8M12 13v2"/></g></svg>',
  headphones: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z"/></g></svg>',
  laptop: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h14v10H5zM2 19h20l-2-4H4z"/></g></svg>',
  dice: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></g></svg>',
  binoculars: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="16" r="4"/><circle cx="17" cy="16" r="4"/><path d="M9.5 9h5M5 13V5h4v8M15 13V5h4v8"/></g></svg>',
  gem: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l3 6-9 12L3 9zM3 9h18M9 3l3 6 3-6M12 9v12"/></g></svg>',
  coffee: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 11h2a2 2 0 0 1 0 4h-2M8 3v3M12 3v3"/></g></svg>',
  cheese: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18l18-6v8H3zM3 18v-4l11-7 7 5"/><circle cx="9" cy="17" r="1.2"/><circle cx="15" cy="16.5" r="1"/></g></svg>',
  jar: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8h10v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2zM6 4h12v4H6zM10 13h4"/></g></svg>',
  apple: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8c-2-1-5-1-6 2s0 8 3 10c1 .8 2 .8 3 0 1 .8 2 .8 3 0 3-2 4-7 3-10s-4-3-6-2zM12 8c0-2 1-3.5 3-5"/></g></svg>',
  egg: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.5 0 6 6 6 10a6 6 0 0 1-12 0c0-4 2.5-10 6-10z"/></g></svg>',
  beer: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h10v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM16 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M6 8a3 3 0 0 1 5-2 3 3 0 0 1 5 2M9.5 12v5M12.5 12v5"/></g></svg>',
  wine: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8v5a4 4 0 0 1-8 0zM12 12v9M8 21h8M8 6h8"/></g></svg>',
  pot: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2 10h2M20 10h2M9 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/></g></svg>',
  bikini: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2.5v2M17 2.5v2M3.5 10.5L7 4.5l4 6zM13 10.5l4-6 3.5 6zM11 10.5h2"/><path d="M4 14.5h16l-6.5 4.5L12 20.5 10.5 19z"/></g></svg>',
  rainshirt: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8.5l-4 2.3 1.6 3.2 2.4-.8V22h6v-8.8l2.4.8 1.6-3.2-4-2.3c0 1.3-1 2.3-3 2.3s-3-1-3-2.3z"/><path d="M5.5 4.6c0 .8-.6 1.4-1.2 1.4S3.1 5.4 3.1 4.6c0-.8 1.2-2 1.2-2s1.2 1.2 1.2 2zM20.9 4.6c0 .8-.6 1.4-1.2 1.4s-1.2-.6-1.2-1.4c0-.8 1.2-2 1.2-2s1.2 1.2 1.2 2zM13.2 4.1c0 .8-.6 1.4-1.2 1.4s-1.2-.6-1.2-1.4c0-.8 1.2-2 1.2-2s1.2 1.2 1.2 2z"/></g></svg>',
  list: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4.5" cy="6" r="1.4" fill="currentColor"/><circle cx="4.5" cy="12" r="1.4" fill="currentColor"/><circle cx="4.5" cy="18" r="1.4" fill="currentColor"/></svg>',
  edit: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg class="chev" width="8" height="14" viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5 6.5 7l-5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tick: (s = 14, c = '#fff', w = 2.4) => `<svg width="${s}" height="${s}" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5 5.5 10.5 11.5 3.5" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  handle: '<svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><path d="M2 2h16M2 7h16M2 12h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  arrow: '<svg width="10" height="18" viewBox="0 0 12 20" aria-hidden="true"><path d="M2 2l8 8-8 8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  van: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13V8a2 2 0 0 1 2-2h11l5 5v2M3 13v4h2m16-4v4h-2M7 17h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="17.5" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="17.5" r="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  bag: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 12h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  go: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tent: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M6 20l6-14 6 14M12 6v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  home: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  snow: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 6l2.5-1.5M9.5 19.5 12 18l2.5 1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sun: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

/* ---------- Listen-Grundgerüst ---------- */
const LISTS = [
  { id: 'sommer', name: 'Sommerurlaub', group: 'Urlaub', icon: 'sun', done: 'Alles gepackt!' },
  { id: 'winter', name: 'Winterurlaub', group: 'Urlaub', icon: 'snow', done: 'Alles gepackt!' },
  { id: 'stadt', name: 'Städtetrip', group: 'Kurz unterwegs', icon: 'city', done: 'Alles gepackt!' },
  { id: 'wochenende', name: 'Wochenende', group: 'Kurz unterwegs', icon: 'home', done: 'Alles gepackt!' }
];
const GROUPS = ['Urlaub', 'Kurz unterwegs'];
/* Farben wie in der Ablage (Hintergrund, Symbol) und Symbole zur Auswahl */
const FARBEN = { // [Seitenhintergrund, Farbe, dunkel] – deutlich unterscheidbare Töne
  grau: ['#ECEBE7', '#6B6A65', '#45443F'], gruen: ['#E4F2D8', '#3F8A1F', '#2B6413'], petrol: ['#DBF2EF', '#0E8C82', '#086159'],
  blau: ['#E1ECFB', '#1F6FD1', '#134E99'], violett: ['#ECE8FD', '#6B52D6', '#4A35A8'], rosa: ['#FCE5EE', '#D23F7E', '#9C2A5C'],
  rot: ['#FCE4E1', '#D63A2F', '#9E2419'], rotbraun: ['#FDEBDB', '#E07415', '#A65208'], gelb: ['#FBF1CF', '#C29200', '#8A6700']
};
const ICONS = ['suitcase', 'gift', 'advent', 'sea', 'island', 'lighthouse', 'beach', 'boat', 'palm', 'plane', 'city', 'mountain', 'van', 'go', 'tent', 'home', 'bag', 'cart', 'bike', 'snow', 'sun', 'drop', 'flame', 'bolt', 'wrench', 'key', 'medic', 'paw', 'flag', 'list'];
const ITEM_ICONS = ['gift', 'advent', 'sea', 'island', 'lighthouse', 'beach', 'boat', 'palm', 'suitcase', 'plane', 'bike', 'awning', 'window', 'door', 'cabinet', 'lock', 'toilet', 'fan', 'wedge', 'fuel', 'oil', 'canister', 'wiper', 'gasbottle', 'waste', 'gauge', 'nav', 'bikini', 'rainshirt', 'plant', 'shield', 'tap', 'bottle', 'roll', 'doc', 'map', 'box', 'bowl', 'leash', 'blanket', 'bed', 'shoe', 'shirt', 'umbrella', 'pill', 'cream', 'tooth', 'scissors', 'glasses', 'towel', 'bug', 'torch', 'headphones', 'laptop', 'dice', 'binoculars', 'gem', 'coffee', 'cheese', 'jar', 'apple', 'egg', 'beer', 'wine', 'pot', 'step', 'support', 'plug', 'bolt', 'drop', 'flame', 'tire', 'light', 'fridge', 'trash', 'key', 'wrench', 'medic', 'snow', 'sun', 'paw', 'flag'];
/* Eigene Symbole: jedes Emoji ist als Symbol erlaubt (wird wie die eingebauten gespeichert) */
const isEmo = v => typeof v === 'string' && !!v && !I[v] && [...v].length <= 12 && /\p{Extended_Pictographic}/u.test(v);
const ico = v => I[v] || (isEmo(v) ? `<span class="emo">${esc(v)}</span>` : '');
const firstEmo = v => { const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter('de', { granularity: 'grapheme' }).segment(v)].map(x => x.segment) : [...v]; return seg.find(isEmo) || ''; };
const itemIcon = (ic, cls = '') => ic && ico(ic) ? `<span class="itemicon ${cls}" aria-hidden="true">${ico(ic)}</span>` : '';
const DEFAULT_COLOR = { sommer: 'rotbraun', winter: 'blau', stadt: 'violett', wochenende: 'rosa' };
const meta = id => { const L = view.lists[id]; return L ? { id, name: L.name || 'Liste', done: L.done || 'Alles gepackt!', icon: (I[L.icon] && ICONS.includes(L.icon)) || isEmo(L.icon) ? L.icon : 'list', color: FARBEN[L.color] ? L.color : (DEFAULT_COLOR[id] || 'grau') } : null; };
const slugId = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
function emptyDoc() { return ensureLists({ v: 1, lists: {} }); }
function newList(id, name, icon, done) { return { name, icon, done: done || 'Alles gepackt!', sections: [{ id: 's-' + id, title: '', items: [] }], lastDone: null }; }
function ensureLists(doc) {
  doc.lists = doc.lists || {};
  if (!Array.isArray(doc.groups)) { // ältere Dateien: Standard-Gruppen ergänzen (auf jedem Gerät gleich)
    doc.groups = GROUPS.map(g => ({ id: 'g-' + slugId(g), name: g, lists: LISTS.filter(l => l.group === g).map(l => l.id) }));
  }
  LISTS.forEach(l => { const L = doc.lists[l.id]; if (L) { if (L.name == null) L.name = l.name; if (!L.icon) L.icon = l.icon; if (!L.done) L.done = l.done; } });
  doc.groups.forEach(g => g.lists.forEach(id => {
    if (!doc.lists[id]) { const d = LISTS.find(x => x.id === id) || {}; doc.lists[id] = newList(id, d.name || 'Neue Liste', d.icon || 'list', d.done); }
    if (!doc.lists[id].sections.length) doc.lists[id].sections.push({ id: 's-' + id, title: '', items: [] });
  }));
  return doc;
}
const listGroup = (doc, id) => doc.groups.find(g => g.lists.includes(id));

const allItems = L => L.sections.flatMap(s => s.items);

/* ---------- Änderungen als Operationen (werden bei Konflikten neu angewendet) ---------- */
function findItem(list, iid) {
  for (const s of list.sections) { const i = s.items.findIndex(x => x.id === iid); if (i >= 0) return { s, i, item: s.items[i] }; }
  return null;
}
function applyOp(doc, op) {
  const grp = id => doc.groups.find(g => g.id === id);
  switch (op.t) {
    case 'copyItem': { // Punkt in eine andere Liste kopieren (gleichnamiger Abschnitt, sonst der letzte)
      const from = doc.lists[op.l], to = doc.lists[op.to]; if (!from || !to || findItem(to, op.id)) return;
      const f = findItem(from, op.i); if (!f) return;
      const target = to.sections.find(s => s.title === f.s.title) || to.sections[to.sections.length - 1];
      target.items.push({ ...JSON.parse(JSON.stringify(f.item)), id: op.id, sel: true }); return;
    }
    case 'respDefault': { // einmalig: Punkte ohne Zuständigkeit auf „Beide“
      doc.seeded = doc.seeded || {}; if (doc.seeded[op.key]) return;
      Object.values(doc.lists).forEach(L => L.sections.forEach(s => s.items.forEach(it => { if (!it.resp) it.resp = 'B'; })));
      doc.seeded[op.key] = true; return;
    }
    case 'swapIcon': { // einmalig ein vorbelegtes Symbol tauschen, nur wenn es noch das alte ist
      doc.seeded = doc.seeded || {}; if (doc.seeded[op.key]) return;
      const L = doc.lists[op.l]; const f = L && findItem(L, op.i); if (f && f.item.icon === op.from) f.item.icon = op.to;
      doc.seeded[op.key] = true; return;
    }
    case 'presetIcons': {
      doc.seeded = doc.seeded || {}; if (doc.seeded[op.key]) return;
      Object.entries(op.map).forEach(([l, m]) => { const L = doc.lists[l]; if (!L) return; Object.entries(m).forEach(([iid, ic]) => { const f = findItem(L, iid); if (f && !f.item.icon) f.item.icon = ic; }); });
      doc.seeded[op.key] = true; return;
    }
    case 'importList': { // einmalig: Punkte aus der Wohnmobil-Checkliste übernehmen, nur in eine leere Liste
      doc.seeded = doc.seeded || {}; if (doc.seeded[op.key]) return;
      const L = doc.lists[op.l]; if (L && !allItems(L).length) L.sections = JSON.parse(JSON.stringify(op.sections));
      doc.seeded[op.key] = true; return;
    }
    case 'initTemplate': { // einmalig: Vorlage anlegen, alle Punkte abgewählt
      doc.seeded = doc.seeded || {}; if (doc.seeded[op.key] || doc.lists[TPL]) { doc.seeded[op.key] = true; return; }
      doc.lists[TPL] = { name: 'Vorlage', icon: 'list', color: 'grau', done: 'Alles gepackt!', lastDone: null,
        sections: JSON.parse(JSON.stringify(op.sections)).map(x => ({ ...x, items: x.items.map(it => ({ ...it, sel: false })) })) };
      if (!doc.lists[TPL].sections.length) doc.lists[TPL].sections.push({ id: 's-' + TPL, title: '', items: [] });
      doc.seeded[op.key] = true; return;
    }
    case 'addList': {
      if (doc.lists[op.list.id]) return;
      doc.lists[op.list.id] = newList(op.list.id, op.list.name, op.list.icon);
      const T = op.fromTpl && doc.lists[TPL];
      if (T && allItems(T).length) { // neue Liste als Kopie der Vorlage, alle Punkte abgewählt
        doc.lists[op.list.id].sections = T.sections.map((x, si) => ({ id: `${op.list.id}-s${si}`, title: x.title,
          items: x.items.map((it, n) => ({ ...JSON.parse(JSON.stringify(it)), id: `${op.list.id}-${si}-${n}`, sel: false })) }));
      }
      (grp(op.g) || doc.groups[doc.groups.length - 1]).lists.push(op.list.id); return;
    }
    case 'dupList': {
      const src = doc.lists[op.l]; if (!src || doc.lists[op.id]) return;
      const copy = JSON.parse(JSON.stringify(src));
      copy.name = op.name; copy.lastDone = null; if (!copy.color && op.color) copy.color = op.color;
      copy.sections.forEach((s, si) => { s.id = `${op.id}-s${si}`; s.items.forEach((it, n) => { it.id = `${op.id}-${si}-${n}`; }); });
      doc.lists[op.id] = copy;
      const g = doc.groups.find(x => x.lists.includes(op.l)) || doc.groups[doc.groups.length - 1];
      g.lists.splice(g.lists.indexOf(op.l) + 1, 0, op.id); return;
    }
    case 'delList': doc.groups.forEach(g => { g.lists = g.lists.filter(x => x !== op.l); }); delete doc.lists[op.l]; return;
    case 'moveList': {
      const to = grp(op.g); if (!to || !doc.lists[op.l]) return;
      doc.groups.forEach(g => { g.lists = g.lists.filter(x => x !== op.l); });
      const idx = op.before ? to.lists.indexOf(op.before) : -1;
      if (idx >= 0) to.lists.splice(idx, 0, op.l); else to.lists.push(op.l); return;
    }
    case 'addGroup': if (!grp(op.g.id)) doc.groups.push({ id: op.g.id, name: op.g.name, lists: [] }); return;
    case 'renameGroup': { const g = grp(op.g); if (g) g.name = op.name; return; }
    case 'delGroup': {
      const i = doc.groups.findIndex(g => g.id === op.g); if (i < 0 || doc.groups.length < 2) return;
      const [g] = doc.groups.splice(i, 1); doc.groups[Math.max(0, i - 1)].lists.push(...g.lists); return;
    }
    case 'moveGroup': {
      const i = doc.groups.findIndex(g => g.id === op.g), j = i + op.dir;
      if (i < 0 || j < 0 || j >= doc.groups.length) return;
      [doc.groups[i], doc.groups[j]] = [doc.groups[j], doc.groups[i]]; return;
    }
  }
  const L = doc.lists[op.l]; if (!L) return;
  const sec = id => L.sections.find(s => s.id === id);
  switch (op.t) {
    case 'addSection': if (!sec(op.sec.id)) L.sections.push({ ...op.sec, items: [] }); break;
    case 'renameSection': { const s = sec(op.s); if (s) s.title = op.title; break; }
    case 'delSection': {
      const i = L.sections.findIndex(s => s.id === op.s);
      if (i >= 0 && L.sections.length > 1) { const [s] = L.sections.splice(i, 1); if (!op.withItems) (L.sections[Math.max(0, i - 1)]).items.push(...s.items); }
      break;
    }
    case 'dupItem': { const f = findItem(L, op.i); if (f && !findItem(L, op.id)) f.s.items.splice(f.i + 1, 0, { ...JSON.parse(JSON.stringify(f.item)), id: op.id, text: op.text }); break; }
    case 'addItem': { const s = sec(op.s) || L.sections[L.sections.length - 1]; if (!findItem(L, op.item.id)) s.items.push(op.item); break; }
    case 'editItem': { const f = findItem(L, op.i); if (f) Object.assign(f.item, op.patch); break; }
    case 'delItem': { const f = findItem(L, op.i); if (f) f.s.items.splice(f.i, 1); break; }
    case 'moveItem': {
      const f = findItem(L, op.i); const to = sec(op.s); if (!f || !to) break;
      f.s.items.splice(f.i, 1);
      const idx = op.before ? to.items.findIndex(x => x.id === op.before) : -1;
      if (idx >= 0) to.items.splice(idx, 0, f.item); else to.items.push(f.item);
      break;
    }
    case 'selectAll': L.sections.forEach(s => s.items.forEach(it => { it.sel = op.val; })); break;
    case 'selectSection': { const x = sec(op.s); if (x) x.items.forEach(it => { it.sel = op.val; }); break; }
    case 'lastDone': L.lastDone = op.date; break;
    case 'renameList': L.name = op.name; break;
    case 'setDate': if (op.date) L.date = op.date; else delete L.date; break;
    case 'setIcon': L.icon = op.icon; break;
    case 'setColor': L.color = op.color; break;
    case 'seedIcons': {
      doc.seeded = doc.seeded || {};
      if (doc.seeded['icons-' + op.l]) break;
      op.icons.forEach((ic, n) => { const f = findItem(L, `seed-${op.l}-${n}`); if (f && !f.item.icon) f.item.icon = ic; });
      doc.seeded['icons-' + op.l] = true; break;
    }
    case 'seedSections': {
      doc.seeded = doc.seeded || {};
      if (doc.seeded['sections-' + op.l]) break;
      if (!allItems(L).length) {
        const resp = t => / Anne$/.test(t) ? 'A' : / Jörg$/.test(t) ? 'J' : '';
        L.sections = op.sections.map(([title, items], si) => ({ id: `seed-${op.l}-s${si}`, title,
          items: items.map((text, n) => ({ id: `seed-${op.l}-${si}-${n}`, text, resp: resp(text), sel: true })) }));
      }
      doc.seeded['sections-' + op.l] = true; break;
    }
    case 'seed': {
      doc.seeded = doc.seeded || {};
      if (doc.seeded[op.l]) break;
      if (!allItems(L).length) L.sections[0].items.push(...op.items.map((text, n) => ({ id: `seed-${op.l}-${n}`, text, resp: '', sel: true })));
      doc.seeded[op.l] = true; break;
    }
  }
}

/* ---------- Zustand ---------- */
const store = {
  base: ensureLists(lsGet('base', null) || emptyDoc()),
  rev: lsGet('rev', null),
  pending: lsGet('pending', []),
  lastSync: lsGet('lastSync', null),
  status: 'idle', // idle | busy | ok | offline | err | off
  error: ''
};
let view = computeView();
function computeView() { const d = ensureLists(clone(store.base)); store.pending.forEach(op => applyOp(d, op)); return d; }
function persist() { lsSet('base', store.base); lsSet('rev', store.rev); lsSet('pending', store.pending); lsSet('lastSync', store.lastSync); }
function commit(op) {
  store.pending.push(op); persist(); view = computeView(); render(); scheduleSync();
}
const runs = lsGet('runs', {});
Object.keys(runs).forEach(k => { if (!Array.isArray(runs[k].done)) delete runs[k]; }); // altes Format verwerfen
function saveRuns() { lsSet('runs', runs); }

/* ---------- Dropbox ---------- */
const auth = { refresh: lsGet('refresh', null), access: null, exp: 0 };
const connected = () => !!auth.refresh;
const redirectUri = () => location.origin + location.pathname;
const isStandalone = () => window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;

function b64url(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function pkce() {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  return { verifier, challenge };
}
// PKCE vorab erzeugen; der Anmelde-Knopf ist ein echter Link,
// weil iOS (Home-Bildschirm) per Script geöffnete Fenster blockiert
let prepared = null;
function preparePkce() {
  prepared = null;
  pkce().then(x => { prepared = x; if (route().v === 'settings' || !connected()) render(); }).catch(err => toast('Anmeldung nicht möglich: ' + err.message));
}
preparePkce();
function loginHref(withRedirect) {
  if (!prepared) return '';
  const p = new URLSearchParams({ client_id: DROPBOX_APP_KEY, response_type: 'code', code_challenge: prepared.challenge, code_challenge_method: 'S256', token_access_type: 'offline' });
  if (withRedirect) p.set('redirect_uri', redirectUri());
  return 'https://www.dropbox.com/oauth2/authorize?' + p;
}
// läuft im Tipp, bevor der Link geöffnet wird
function rememberLogin(withRedirect) {
  if (!prepared) return false;
  lsSet('verifier', prepared.verifier); lsSet('withRedirect', withRedirect);
  return true;
}
async function tokenRequest(params) {
  const r = await fetch('https://api.dropboxapi.com/oauth2/token', { method: 'POST', body: new URLSearchParams({ client_id: DROPBOX_APP_KEY, ...params }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error_description || j.error || ('HTTP ' + r.status)); e.code = j.error; throw e; }
  return j;
}
async function finishLogin(code) {
  const verifier = lsGet('verifier', null);
  if (!verifier) throw new Error('Anmeldung bitte neu starten.');
  const params = { grant_type: 'authorization_code', code: code.trim(), code_verifier: verifier };
  if (lsGet('withRedirect', false)) params.redirect_uri = redirectUri();
  const j = await tokenRequest(params);
  auth.refresh = j.refresh_token; auth.access = j.access_token; auth.exp = Date.now() + (j.expires_in - 60) * 1000;
  lsSet('refresh', auth.refresh); lsDel('verifier'); lsDel('withRedirect');
}
function logout() {
  auth.refresh = null; auth.access = null; lsDel('refresh'); store.status = 'off';
  // nichts von euren Listen auf dem Gerät zurücklassen
  ['base', 'rev', 'pending', 'lastSync', 'runs'].forEach(lsDel);
  store.base = ensureLists(emptyDoc()); store.rev = null; store.pending = []; Object.keys(runs).forEach(k => delete runs[k]);
  view = computeView(); render();
}
async function accessToken() {
  if (auth.access && Date.now() < auth.exp) return auth.access;
  try {
    const j = await tokenRequest({ grant_type: 'refresh_token', refresh_token: auth.refresh });
    auth.access = j.access_token; auth.exp = Date.now() + (j.expires_in - 60) * 1000; return auth.access;
  } catch (e) {
    if (e.code === 'invalid_grant') { logout(); throw new Error('Dropbox-Anmeldung abgelaufen – bitte neu verbinden.'); }
    throw e;
  }
}
async function dbxDownload(path = DATA_PATH) {
  const r = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST', headers: { Authorization: 'Bearer ' + await accessToken(), 'Dropbox-API-Arg': JSON.stringify({ path }) }
  });
  if (r.status === 409) { const t = await r.text(); if (t.includes('not_found')) return null; throw new Error('Dropbox: ' + t.slice(0, 120)); }
  if (!r.ok) throw new Error('Dropbox HTTP ' + r.status);
  const metaHdr = r.headers.get('Dropbox-API-Result');
  const data = await r.json();
  let rev = metaHdr ? JSON.parse(metaHdr).rev : null;
  if (!rev) { // Kopfzeile nicht lesbar → Revision separat holen
    const m = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
      method: 'POST', headers: { Authorization: 'Bearer ' + await accessToken(), 'Content-Type': 'application/json' }, body: JSON.stringify({ path })
    });
    if (m.ok) rev = (await m.json()).rev;
  }
  return { data, rev };
}
async function dbxUpload(doc, rev) {
  const mode = rev ? { '.tag': 'update', update: rev } : { '.tag': 'add' };
  const r = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + await accessToken(), 'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ path: DATA_PATH, mode, autorename: false, mute: true, strict_conflict: true }) },
    body: new Blob([JSON.stringify(doc, null, 1)], { type: 'application/octet-stream' })
  });
  if (r.status === 409) return { conflict: true };
  if (!r.ok) throw new Error('Dropbox HTTP ' + r.status);
  const j = await r.json(); return { rev: j.rev };
}

let syncTimer = null, syncing = null, syncAgain = false, importing = false, templating = false;
async function maybeTemplate() {
  if (templating || !connected() || view.lists[TPL] || (view.seeded && view.seeded['template'])) return;
  templating = true;
  try {
    let src = null; try { src = await dbxDownload(SOURCE_PATH); } catch (e) {}
    let S = src && src.data && src.data.lists && src.data.lists.sachen;
    if (!S || !allItems(S).length) { const first = view.groups[0] && view.lists[view.groups[0].lists[0]]; S = first; }
    if (!S) return;
    const sections = S.sections.filter(x => x.items.length).map((x, si) => ({ id: `${TPL}-s${si}`, title: x.title || '',
      items: x.items.map((it, n) => ({ ...it, id: `${TPL}-${si}-${n}` })) }));
    if (view.lists[TPL]) return;
    commit({ t: 'initTemplate', key: 'template', sections });
  } catch (e) {} finally { templating = false; }
}
/* Einmalig die „Packliste unsere Sachen“ aus der Wohnmobil-Checkliste in die erste Liste übernehmen */
async function maybeImport() {
  if (importing || !connected() || (view.seeded && view.seeded['import-sachen'])) return;
  const target = view.groups[0] && view.groups[0].lists[0], L = target && view.lists[target];
  if (!L || allItems(L).length) return;
  importing = true;
  try {
    const src = await dbxDownload(SOURCE_PATH);
    const S = src && src.data && src.data.lists && src.data.lists.sachen;
    if (!S || !allItems(S).length) return;
    const sections = S.sections.filter(x => x.items.length).map(x => ({ id: 'imp-' + x.id, title: x.title || '',
      items: x.items.map(it => ({ ...it, id: 'imp-' + it.id, sel: true })) }));
    commit({ t: 'importList', key: 'import-sachen', l: target, sections });
    toast(`„${S.name || 'Packliste unsere Sachen'}“ übernommen`);
  } catch (e) { /* nächster Abgleich versucht es erneut */ } finally { importing = false; }
}
function scheduleSync() { if (!connected()) return; clearTimeout(syncTimer); syncTimer = setTimeout(() => sync(), 900); }
async function sync(manual) {
  if (!connected()) { if (manual) { toast('Noch nicht mit Dropbox verbunden'); location.hash = '#/einstellungen'; } return; }
  if (syncing) { syncAgain = true; return syncing; }
  store.status = 'busy'; renderStatus();
  syncing = (async () => {
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const sent = store.pending.length;
        if (!sent) {
          const remote = await dbxDownload();
          if (remote) { if (remote.rev !== store.rev) { store.base = ensureLists(remote.data); store.rev = remote.rev; } }
          else { const up = await dbxUpload(computeView(), null); if (up.conflict) continue; store.base = computeView(); store.rev = up.rev; }
          break;
        }
        const doc = computeView();
        const up = await dbxUpload(doc, store.rev);
        if (up.conflict) {
          const remote = await dbxDownload();
          if (remote) { store.base = ensureLists(remote.data); store.rev = remote.rev; } else store.rev = null;
          continue;
        }
        store.base = clone(store.base); store.pending.slice(0, sent).forEach(op => applyOp(store.base, op));
        store.pending = store.pending.slice(sent); store.rev = up.rev;
        if (!store.pending.length) break;
      }
      store.lastSync = Date.now(); store.status = 'ok'; store.error = '';
      setTimeout(maybeImport, 0); setTimeout(maybeTemplate, 50);
    } catch (e) {
      store.status = navigator.onLine === false ? 'offline' : 'err';
      store.error = e.message || String(e);
      if (manual) toast(store.status === 'offline' ? 'Offline – Änderungen bleiben gespeichert' : store.error);
    } finally {
      persist(); view = computeView(); syncing = null;
      const keepFocus = document.activeElement && document.activeElement.matches('input,textarea');
      if (!keepFocus) render(); else renderStatus();
      if (syncAgain) { syncAgain = false; scheduleSync(); }
    }
  })();
  return syncing;
}
function statusInfo() {
  if (!connected()) return { cls: '', text: 'Nicht mit Dropbox verbunden – hier einrichten' };
  if (store.status === 'busy') return { cls: 'busy', text: 'Wird abgeglichen …' };
  if (store.status === 'offline') return { cls: 'busy', text: 'Offline – Änderungen werden später gespeichert' };
  if (store.status === 'err') return { cls: 'err', text: 'Abgleich fehlgeschlagen – erneut versuchen' };
  if (store.pending.length) return { cls: 'busy', text: 'Änderungen noch nicht gespeichert' };
  return { cls: 'ok', text: 'Dropbox synchron' + (store.lastSync ? ' · ' + fmtTime(store.lastSync) : '') };
}
function renderStatus() {
  document.querySelectorAll('[data-status]').forEach(el => { const s = statusInfo(); el.innerHTML = `<span class="dot ${s.cls}"></span>${esc(s.text)}`; });
  document.querySelectorAll('[data-act="refresh"]').forEach(b => b.classList.toggle('spin', store.status === 'busy'));
}

/* ---------- Hilfen für Listen ---------- */
const isSel = it => it.sel !== false;
function chip(r, extraCls = '') { return r ? `<span class="chip ${r} ${extraCls}">${PEOPLE[r]}</span>` : ''; }
const refreshBtn = (light) => `<button class="iconbtn" data-act="refresh" aria-label="Aktualisieren">${I.refresh}</button>`;

/* ---------- Ansichten ---------- */
/* Ablauf eines Checks (nur auf diesem iPhone): done = erledigte Punkte, cursor = aktueller Punkt */
function runState(id) {
  const L = view.lists[id];
  const byId = {}; L.sections.forEach(s => s.items.forEach(it => { byId[it.id] = { it, sec: s.title }; }));
  const run = runs[id] || { done: [] };
  const seq = allItems(L).filter(isSel).map(x => x.id);
  const done = new Set(run.done.filter(x => seq.includes(x)));
  const rest = seq.filter(x => !done.has(x));
  const nextOpen = (from, incl) => { for (let k = incl ? 0 : 1; k <= seq.length; k++) { const x = seq[(from + k) % seq.length]; if (!done.has(x)) return x; } return null; };
  let cur = null;
  if (rest.length) {
    const ci = seq.indexOf(run.cursor);
    cur = ci >= 0 ? nextOpen(ci, true) : nextOpen(0, true);
  }
  const upcoming = [];
  if (cur) { const ci = seq.indexOf(cur); for (let k = 1; k < seq.length && upcoming.length < 2; k++) { const x = seq[(ci + k) % seq.length]; if (!done.has(x)) upcoming.push(x); } }
  return { run, byId, seq, done, rest, cur, upcoming, nextOpen, pos: cur ? seq.indexOf(cur) + 1 : seq.length,
    total: seq.length, doneCount: done.size, started: !!runs[id] && done.size > 0, begun: !!(runs[id] && (runs[id].started || done.size)) };
}
function resetRun(id) { delete runs[id]; saveRuns(); }

/* Abreisedatum: rechts in der Listenzeile, mit „in x Tagen“ */
const WTAGE = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
function dateBadge(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, mo, d] = iso.split('-').map(Number), dt = new Date(y, mo - 1, d), now = new Date();
  const days = Math.round((dt - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
  const rel = days === 0 ? 'heute' : days === 1 ? 'morgen' : days > 1 ? `in ${days} Tagen` : 'vorbei';
  return `<span class="ldbadge ${days < 0 ? 'past' : days <= 7 ? 'soon' : ''}"><span class="ldd">${WTAGE[dt.getDay()]} ${d}. ${MONTHS[mo - 1]}</span><span class="ldr">${rel}</span></span>`;
}

/* Seite 1: Übersicht */
function vHome() {
  const groups = view.groups.map(gr => {
    const g = gr.name;
    const rows = gr.lists.map(meta).filter(Boolean).map(l => {
      const L = view.lists[l.id]; const items = allItems(L);
      const st = runState(l.id);
      let stat = !items.length ? 'noch leer' : st.total ? `${st.total} Punkt${st.total === 1 ? '' : 'e'}` : 'noch nichts ausgewählt';
      if (st.started && st.rest.length) stat = `${st.doneCount} von ${st.total} eingepackt`;
      else if (L.lastDone && items.length) stat = `zuletzt gepackt: ${fmtDate(L.lastDone)}`;
      return `<a class="row" href="#/liste/${l.id}" data-act="openList" data-l="${l.id}">
        ${listIcon(l.icon, l.color)}
        <span class="listtext"><span class="listname">${esc(l.name)}</span><span class="liststat">${esc(stat)}</span></span>${dateBadge(L.date)}${I.chev}</a>`;
    }).join('');
    return `<section class="group"><div class="grouphead"><span class="grouptitle">${esc(g)}</span></div><div class="card">${rows || '<div class="empty">Keine Listen in dieser Gruppe</div>'}</div></section>`;
  }).join('');
  return `<div class="screen">
    <header class="hero"><img src="hero.jpg" alt=""><div class="inner">
      <div class="bar"><span class="name">${I.suitcase}Unser Urlaub</span><div class="icons">${refreshBtn()}<a class="iconbtn" href="#/listen" aria-label="Listen bearbeiten">${I.edit}</a></div></div>
      <h1>Packlisten</h1></div></header>
    <main class="content">${groups}</main>
    <a class="foot" href="#/einstellungen" data-status></a>
  </div>`;
}

const listIcon = (icon, color = 'grau') => `<span class="listicon" style="background:${FARBEN[color][1]};color:#FFFFFF">${ico(icon)}</span>`;
function topBar(backHref, backLabel, right) {
  return `<div class="bar"><a class="back" href="${backHref}">${I.back}${esc(backLabel)}</a><div class="icons">${right}</div></div>`;
}
const listIcons = id => `<a class="iconbtn" href="#/liste/${id}/auswahl" aria-label="Auswahl: was diesmal mitkommt">${I.select}</a><a class="iconbtn" href="#/liste/${id}/bearbeiten" aria-label="Liste bearbeiten">${I.edit}</a>`;

/* Abschnitte als antippbare Liste (Sprung an den Anfang des Abschnitts) */
let secPick = null, introView = null, secDel = null; const wheelPos = {};
function secListHtml(st, secNames, secOf, showDone) {
  return `<div class="seclist">${secNames.map((n, i) => {
    const xs = st.seq.filter(x => secOf(x) === n), d = xs.filter(x => st.done.has(x)).length;
    return `<button data-act="jumpSec" data-sec="${esc(n)}"><span>${esc(n || 'Ohne Abschnitt')}</span><span>${d}/${xs.length} ›</span></button>`;
  }).join('')}</div>`;
}

/* Seite 2: Check */
function vRun(id) {
  const m = meta(id), items = allItems(view.lists[id]);
  const st = runState(id);
  const head = (left) => `<div class="bar"><a class="back" href="#/">${I.back}Listen</a><div class="icons">${left}${refreshBtn()}${listIcons(id)}</div></div>`;
  if (!items.length || !st.total) {
    return `<div class="screen"><div class="run">${head('')}
      <div class="finished"><h2>${esc(m.name)}</h2>
        <div class="sub">${items.length ? 'Für heute ist kein Punkt ausgewählt.' : 'Diese Liste ist noch leer.'}</div>
        <a class="secondary" style="display:flex;align-items:center;justify-content:center;text-decoration:none;max-width:280px" href="#/liste/${id}/${items.length ? 'auswahl' : 'bearbeiten'}">${items.length ? 'Punkte auswählen' : 'Punkte hinzufügen'}</a></div>
    </div></div>`;
  }
  // Abschnitte in Prüf-Reihenfolge
  const secOf = x => st.byId[x].sec || '';
  const secNames = [...new Set(view.lists[id].sections.flatMap(s => s.items.filter(isSel).map(() => s.title)))]; // Reihenfolge wie in der Liste
  const multiSec = secNames.length > 1 || (secNames[0] || '') !== '';
  const progress = st.total <= 24
    ? `<div class="dots">${st.seq.map(x => `<span class="${st.done.has(x) ? 'done' : x === st.cur ? 'cur' : ''}"></span>`).join('')}</div>`
    : `<div class="progress"><div style="width:${Math.round(st.doneCount / st.total * 100)}%"></div></div>`;
  const big = `style="width:72px;height:72px;border-radius:20px"`;
  if (st.begun && secPick === id && multiSec) { // Abschnitt wählen während des Checks
    return `<div class="screen"><div class="run">${head('')}
      ${progress}
      <div class="finished intro"><h2>Zu Abschnitt springen</h2>${secListHtml(st, secNames, secOf, true)}</div>
      <button class="later" data-act="secPickClose">Abbrechen</button>
    </div></div>`;
  }
  if (!st.begun || (introView === id && st.rest.length)) { // Anfang (auch mitten im Check, ohne zurückzusetzen)
    const secList = multiSec ? secListHtml(st, secNames, secOf, false) : '';
    return `<div class="screen"><div class="run">${head('')}
      <div class="finished intro">
        <span class="listicon" ${big}>${ico(m.icon)}</span>
        <h2>${esc(m.name)}</h2>
        <div class="sub">${st.begun ? `${st.doneCount} von ${st.total} eingepackt` : `${st.total} Punkt${st.total === 1 ? '' : 'e'}`}${multiSec && secNames.length > 1 ? ` in ${secNames.length} Abschnitten` : ''}${st.total < items.length ? ` · ${items.length - st.total} abgewählt` : ''}</div>
        ${secList}
      </div>
      ${st.begun ? `<button class="primary" data-act="introClose">Weiter · Punkt ${st.pos} von ${st.total} ${I.arrow}</button>
      <div class="runlinks"><button class="later" data-act="restart">Neue Packrunde</button><a class="later" style="text-decoration:none" href="#/liste/${id}/auswahl">Auswahl ändern</a></div>`
      : `<button class="primary" data-act="runStart">Packen starten ${I.arrow}</button>`}
      ${st.begun ? '' : `<a class="later" style="text-align:center;text-decoration:none;display:block;padding-top:12px" href="#/liste/${id}/auswahl">Auswahl ändern</a>`}
    </div></div>`;
  }
  if (!st.rest.length) { // Ende
    return `<div class="screen"><div class="run">${head('')}
      ${progress}
      <div class="finished"><div class="badge">${I.tick(44, '#fff', 1.8)}</div><h2>${esc(m.done)}</h2><div class="sub">Alle ${st.total} Punkte sind eingepackt.</div></div>
      <a class="primary" href="#/" data-act="finish">Zur Übersicht</a>
      <div class="runlinks"><button class="later" data-act="restart">Neue Packrunde</button></div>
    </div></div>`;
  }
  const cur = st.byId[st.cur];
  const cs = secOf(st.cur), ci = st.seq.indexOf(st.cur);
  const prevPos = wheelPos[id]; wheelPos[id] = ci;
  const shift = prevPos == null ? 0 : Math.max(-2, Math.min(2, ci - prevPos));
  const cls = { '-2': 'wm2', '-1': 'wm1', '0': 'w0', '1': 'wp1', '2': 'wp2' };
  const slots = [-2, -1, 0, 1, 2].map(o => {
    const x = st.seq[ci + o];
    if (!x) return `<div class="wslot ${cls[o]}" aria-hidden="true"></div>`;
    const b = st.byId[x], d = st.done.has(x), ic = b.it.icon && ico(b.it.icon);
    if (o === 0) return `<div class="wslot w0">${ic ? `<span class="wicon" aria-hidden="true">${ic}</span>` : ''}<span class="wtext">${esc(b.it.text)}</span>${b.it.note ? `<span class="explain wnote">${esc(b.it.note)}</span>` : ''}${b.it.resp ? `<span class="resp wresp">Zuständig: ${chip(b.it.resp)}</span>` : ''}</div>`;
    return `<button class="wslot ${cls[o]} ${d ? 'isdone' : ''}" data-act="wheelJump" data-i="${x}" aria-label="${esc(b.it.text)}${d ? ' (eingepackt)' : ''}">${d ? `<span class="wtick">${I.tick(16, 'currentColor', 2.4)}</span>` : ''}<span class="wtext">${esc(b.it.text)}</span></button>`;
  }).join('');
  return `<div class="screen"><div class="run">${head(`<span class="count" style="padding:0 6px">${st.doneCount} / ${st.total}</span>`)}
    ${progress}
    <div class="current wheelwrap">
      ${multiSec ? `<button class="secpill" data-act="secPick">${esc(cs || m.name)} <span aria-hidden="true">▾</span></button>` : ''}
      <div class="wheel${shift ? ' roll' : ''}" style="--from:${shift * 46}px">${slots}</div>
    </div>
    <button class="done-btn" data-act="runDone" data-i="${cur.it.id}">${I.tick(22, '#fff', 2)} Eingepackt</button>
    <div class="runlinks">
      <button class="later" data-act="runBack" ${st.rest.length > 1 ? '' : 'disabled style="opacity:.4"'}>${I.back} Zurück</button>
      <button class="later" data-act="runLater" data-i="${cur.it.id}" ${st.rest.length > 1 ? '' : 'disabled style="opacity:.4"'}>Weiter ›</button>
      <button class="later" data-act="introOpen">Anfang</button></div>
  </div></div>`;
}

/* Seite 3: Auswahl */
function vSelect(id) {
  const m = meta(id), L = view.lists[id], items = allItems(L);
  const sel = items.filter(isSel).length, pct = items.length ? Math.round(sel / items.length * 100) : 0;
  const body = !items.length
    ? `<div class="card"><div class="empty">Diese Liste ist noch leer.<br><a href="#/liste/${id}/bearbeiten">Punkte hinzufügen</a></div></div>`
    : L.sections.filter(s => s.items.length).map(s => `<section class="group">
        ${(() => { const on = s.items.filter(isSel).length, full = on === s.items.length;
          return `<div class="grouphead"><span class="grouptitle">${esc(s.title || '')}</span><button class="textbtn small" data-act="selSec" data-s="${s.id}" data-val="${full ? 0 : 1}">${full ? 'Alle abwählen' : on ? `Alle wählen (${on}/${s.items.length})` : 'Alle wählen'}</button></div>`; })()}
        <div class="card"><ul>${s.items.map(it => `<li><button class="row ${isSel(it) ? '' : 'off'}" data-act="toggleSel" data-i="${it.id}" role="checkbox" aria-checked="${isSel(it)}">
          <span class="check ${isSel(it) ? 'on' : ''}">${isSel(it) ? I.tick() : ''}</span>
          ${itemIcon(it.icon)}<span class="label">${esc(it.text)}${it.note ? `<span class="lnote">${esc(it.note)}</span>` : ''}</span>${chip(it.resp)}</button></li>`).join('')}</ul></div></section>`).join('');
  const allOn = items.length && sel === items.length;
  return `<div class="screen">
    <header class="top">
      ${topBar(`#/liste/${id}`, 'Packen', refreshBtn() + `<a class="iconbtn" href="#/liste/${id}/bearbeiten" aria-label="Liste bearbeiten">${I.edit}</a>`)}
      <div class="titlerow"><div><h1>${esc(m.name)}</h1><div class="sub">Was kommt diesmal mit?</div></div>
        ${items.length ? `<div class="count">${sel} von ${items.length} gewählt</div>` : ''}</div>
      ${items.length ? `<div class="progress"><div style="width:${pct}%"></div></div>` : ''}
    </header>
    <main class="content">${body}</main>
    ${items.length ? `<footer class="bottom">
      <a class="primary" href="#/liste/${id}">Zum Packen · ${sel} Punkt${sel === 1 ? '' : 'e'} ${I.arrow}</a>
      <div class="bottomrow"><button class="textbtn" data-act="selAll" data-val="${allOn ? 0 : 1}">${allOn ? 'Alle abwählen' : 'Alle auswählen'}</button><span data-status></span></div>
    </footer>` : `<a class="foot" href="#/einstellungen" data-status></a>`}
  </div>`;
}

function vEdit(id) {
  const m = meta(id), L = view.lists[id];
  const filt = id !== TPL; // normale Liste: nur gewählte Punkte bearbeiten, Rest unten „aus der Vorlage“
  const shown = s => filt ? s.items.filter(isSel) : s.items;
  const secs = L.sections.filter(s => !filt || !s.items.length || shown(s).length).map((s, si) => `<section class="group" data-s="${s.id}">
    <div class="grouphead">
      <input class="sectitle" data-act="secTitle" data-s="${s.id}" value="${esc(s.title)}" placeholder="${L.sections.length > 1 ? 'Abschnitt benennen' : 'Abschnitt (optional)'}" aria-label="Name des Abschnitts" enterkeyhint="done">
      ${L.sections.length > 1 ? `<button class="smallbtn" data-act="delSection" data-s="${s.id}">Abschnitt löschen</button>` : ''}
    </div>
    ${secDel === s.id ? `<div class="secdel">
      <div class="secdelq">„${esc(s.title || 'Ohne Namen')}“ löschen${s.items.length ? ` – was passiert mit den ${s.items.length} Punkt${s.items.length === 1 ? '' : 'en'}?` : '?'}</div>
      ${s.items.length ? `<button class="secondary danger" data-act="delSectionAll" data-s="${s.id}">Abschnitt mit allen Punkten löschen</button>
      <button class="secondary" data-act="delSectionOnly" data-s="${s.id}">Nur Abschnitt löschen, Punkte nach oben verschieben</button>`
      : `<button class="secondary danger" data-act="delSectionOnly" data-s="${s.id}">Abschnitt löschen</button>`}
      <button class="textbtn" data-act="delSectionCancel">Abbrechen</button>
    </div>` : ''}
    <div class="card"><ul class="items" data-s="${s.id}">
      ${shown(s).map(it => moveSel ? `<li data-i="${it.id}"><button class="erow mrow ${moveSel.has(it.id) ? 'on' : ''}" data-act="moveToggle" data-i="${it.id}" aria-pressed="${moveSel.has(it.id)}">
        <span class="mcheck" aria-hidden="true">${moveSel.has(it.id) ? I.tick(16, '#fff', 2.6) : ''}</span>${itemIcon(it.icon)}<span class="label">${esc(it.text)}</span>${chip(it.resp)}</button></li>` : `<li data-i="${it.id}"><div class="erow">
        ${filt ? `<button class="minus" data-act="unselItem" data-i="${it.id}" aria-label="„${esc(it.text)}“ aus dieser Liste nehmen"><span></span></button>`
          : `<button class="minus" data-act="delItem" data-i="${it.id}" aria-label="Punkt löschen"><span></span></button>`}
        <button class="ipick ${it.icon ? '' : 'none'}" data-act="pickItemIcon" data-i="${it.id}" aria-label="Symbol für diesen Punkt">${ico(it.icon) || '+'}</button>
        <div class="etext"><textarea rows="1" data-act="itemText" data-i="${it.id}" aria-label="Punkt umbenennen" enterkeyhint="done">${esc(it.text)}</textarea>
          <textarea rows="1" class="note" data-act="itemNote" data-i="${it.id}" aria-label="Erklärung zu „${esc(it.text)}“" placeholder="Erklärung …">${esc(it.note || '')}</textarea></div>
        <button class="chip ${it.resp || 'none'}" data-act="cycleResp" data-i="${it.id}" aria-label="Zuständig: ${it.resp ? PEOPLE[it.resp] : 'niemand'} – antippen zum Ändern">${it.resp ? PEOPLE[it.resp] : 'Zuständig?'}</button>
        <button class="more" data-act="itemMenu" data-i="${it.id}" aria-label="Punkt kopieren oder duplizieren">${I.copy}</button>
        <span class="handle" data-drag="${it.id}" aria-hidden="true">${I.handle}</span>
      </div>
      ${itemMenu === it.id ? `<div class="picker">
        <button class="secondary" style="min-height:44px" data-act="dupItem" data-i="${it.id}">Hier duplizieren</button>
        ${L.sections.length > 1 ? `<div class="pickhead">In Abschnitt verschieben</div>
        <div class="copyto">${L.sections.filter(x => x.id !== s.id).map(x => `<button data-act="moveOne" data-i="${it.id}" data-s="${x.id}"><span>${esc(x.title || 'Ohne Namen')}</span></button>`).join('')}</div>` : ''}
        <div class="pickhead">In andere Liste kopieren</div>
        <div class="copyto">${[...view.groups.flatMap(g => g.lists), ...(view.lists[TPL] ? [TPL] : [])].filter(x => x !== id).map(meta).filter(Boolean).map(l => `<button data-act="copyItem" data-i="${it.id}" data-to="${l.id}">${listIcon(l.icon, l.color)}<span>${esc(l.name)}</span></button>`).join('')}</div>
        <button class="textbtn strong" style="align-self:flex-end" data-act="itemMenu" data-i="${it.id}">Fertig</button>
      </div>` : ''}
      ${itemPick === it.id ? `<div class="picker"><div class="pickhead">Symbol für diesen Punkt</div>
        <div class="iconrow">${ITEM_ICONS.map(ic => `<button class="ipick big ${ic === it.icon ? 'on' : ''}" data-act="setItemIcon" data-i="${it.id}" data-icon="${ic}" aria-label="Symbol ${ic}">${I[ic]}</button>`).join('')}</div>
        <label class="emorow"><span>Eigenes Emoji</span><input class="emoinput" data-emo="item" data-i="${it.id}" value="${isEmo(it.icon) ? esc(it.icon) : ''}" placeholder="🙂" aria-label="Eigenes Emoji als Symbol" autocomplete="off"></label>
        <div style="display:flex;justify-content:space-between"><button class="textbtn" data-act="setItemIcon" data-i="${it.id}" data-icon="">Kein Symbol</button><button class="textbtn strong" data-act="pickItemIcon" data-i="${it.id}">Fertig</button></div>
      </div>` : ''}</li>`).join('')}
    </ul>
    ${moveSel ? '' : `<form class="addrow" data-act="addItem" data-s="${s.id}"><span class="plus" aria-hidden="true">+</span>
      <label class="sr" for="add-${s.id}">Punkt hinzufügen</label>
      <input id="add-${s.id}" placeholder="Punkt hinzufügen" enterkeyhint="enter" autocomplete="off"></form>`}
    </div></section>`).join('');
  return `<div class="screen">
    <header class="top">
      ${id === TPL ? `<div class="bar"><a class="back" href="#/listen">${I.back}Listen</a><div class="icons">${refreshBtn()}<a class="textbtn strong" href="#/listen">Fertig</a></div></div>
      <h1>Vorlage bearbeiten</h1><div class="sub">Neue Listen starten als Kopie davon.</div>`
      : `<div class="bar"><a class="back" href="#/liste/${id}">${I.back}Packen</a><div class="icons">${refreshBtn()}<a class="iconbtn" href="#/liste/${id}/auswahl" aria-label="Auswahl">${I.select}</a><a class="textbtn strong" href="#/liste/${id}">Fertig</a></div></div>
      <h1>${esc(m.name)} bearbeiten</h1>`}
    </header>
    <main class="content">
      ${L.sections.length > 1 && allItems(L).length ? (moveSel ? `<p class="hint" style="margin-top:0">Punkte antippen, die verschoben werden sollen. Dann unten den Ziel-Abschnitt wählen.</p>`
        : `<button class="movebtn" data-act="moveMode">${I.handle}Mehrere Punkte verschieben</button>`) : ''}
      ${secs}
      ${moveSel ? '' : `<button class="dashed" data-act="addSection">Abschnitt hinzufügen</button>
      ${filt ? reserveHtml(id) : ''}`}
      <p class="hint">Das Feld links vor einem Punkt wählt ein Symbol, das Kopier-Symbol rechts dupliziert den Punkt oder kopiert ihn in eine andere Liste. Unter jedem Punkt kann eine Erklärung stehen – sie erscheint beim Prüfen unter dem Stichwort. Zuständigkeit: Feld antippen wechselt zwischen Jörg, Anne, Beide und niemand. Reihenfolge: rechts am Griff ziehen. Änderungen werden sofort gespeichert.</p>
    </main>
    ${moveSel ? `<div class="bottom movebar">
      <div class="movehead"><b>${moveSel.size ? `${moveSel.size} Punkt${moveSel.size === 1 ? '' : 'e'} verschieben nach …` : 'Noch nichts ausgewählt'}</b><button class="textbtn" data-act="moveCancel">Abbrechen</button></div>
      <div class="copyto">${L.sections.map(x => `<button data-act="moveTo" data-s="${x.id}" ${moveSel.size ? '' : 'disabled style="opacity:.45"'}><span>${esc(x.title || 'Ohne Namen')}</span></button>`).join('')}</div>
    </div>` : `<a class="foot" href="#/einstellungen" data-status></a>`}
  </div>`;
}

let iconPick = null, itemPick = null, itemMenu = null, reserveOpen = false, moveSel = null;
/* Weitere Punkte: abgewählte Punkte dieser Liste und Punkte der Vorlage, die hier noch fehlen */
function reserveHtml(id) {
  const L = view.lists[id], T = id !== TPL && view.lists[TPL];
  const have = new Set(allItems(L).map(it => it.text.trim().toLowerCase()));
  const bySec = new Map(); const put = (title, row) => { const k = title || ''; if (!bySec.has(k)) bySec.set(k, []); bySec.get(k).push(row); };
  L.sections.forEach(s => s.items.filter(it => !isSel(it)).forEach(it => put(s.title, { act: 'selItem', i: it.id, it })));
  if (T) T.sections.forEach(s => s.items.filter(it => !have.has(it.text.trim().toLowerCase())).forEach(it => put(s.title, { act: 'addFromTpl', i: it.id, it })));
  const n = [...bySec.values()].reduce((a, r) => a + r.length, 0);
  if (!n) return '';
  return `<section class="group reserve"><button class="reservehead" data-act="reserveToggle">
      <span>Aus der Vorlage hinzufügen <span class="rcount">${n}</span></span><span aria-hidden="true">${reserveOpen ? '▴' : '▾'}</span></button>
    ${reserveOpen ? [...bySec.entries()].map(([title, rows]) => `<div class="grouphead"><span class="grouptitle">${esc(title || 'Ohne Abschnitt')}</span></div>
      <div class="card"><ul>${rows.map(r => `<li><button class="row" data-act="${r.act}" data-i="${r.i}"><span class="plusbtn" aria-hidden="true">+</span>${itemIcon(r.it.icon)}<span class="label">${esc(r.it.text)}</span>${chip(r.it.resp)}</button></li>`).join('')}</ul></div>`).join('') : ''}
  </section>`;
}
function vLists() {
  const groups = view.groups.map((g, gi) => `<section class="group" data-s="${g.id}">
    <div class="grouphead">
      <input class="sectitle" data-act="groupTitle" data-g="${g.id}" value="${esc(g.name)}" placeholder="Gruppe benennen" aria-label="Name der Gruppe" enterkeyhint="done">
      <span class="icons">
        <button class="iconbtn small" data-act="groupUp" data-g="${g.id}" aria-label="Gruppe nach oben" ${gi ? '' : 'disabled'}>${I.up}</button>
        <button class="iconbtn small" data-act="groupDown" data-g="${g.id}" aria-label="Gruppe nach unten" ${gi < view.groups.length - 1 ? '' : 'disabled'}>${I.down}</button>
        ${view.groups.length > 1 ? `<button class="smallbtn" data-act="delGroup" data-g="${g.id}">Löschen</button>` : ''}
      </span>
    </div>
    <div class="card"><ul class="items" data-s="${g.id}">
      ${g.lists.map(meta).filter(Boolean).map(l => `<li data-i="${l.id}"><div class="erow">
        <button class="minus" data-act="delList" data-l="${l.id}" aria-label="Liste löschen"><span></span></button>
        <button class="iconpick" data-act="pickIcon" data-l="${l.id}" aria-label="Symbol und Farbe ändern">${listIcon(l.icon, l.color)}</button>
        <div class="etext"><textarea rows="1" data-act="listName" data-l="${l.id}" aria-label="Liste umbenennen" enterkeyhint="done">${esc(l.name)}</textarea>
          <label class="ldate"><span>Abreise</span><input type="date" data-act="listDate" data-l="${l.id}" value="${esc(view.lists[l.id].date || '')}"></label></div>
        <button class="iconbtn small" data-act="dupList" data-l="${l.id}" aria-label="Liste „${esc(l.name)}“ duplizieren">${I.copy}</button>
        <span class="handle" data-drag="${l.id}" aria-hidden="true">${I.handle}</span>
      </div>
      ${iconPick === l.id ? `<div class="picker">
        <div class="pickhead">Symbol</div>
        <div class="iconrow">${ICONS.map(ic => `<button class="iconpick ${ic === l.icon ? 'on' : ''}" data-act="setIcon" data-l="${l.id}" data-icon="${ic}" aria-label="Symbol ${ic}">${listIcon(ic, l.color)}</button>`).join('')}</div>
        <label class="emorow"><span>Eigenes Emoji</span><input class="emoinput" data-emo="list" data-l="${l.id}" value="${isEmo(l.icon) ? esc(l.icon) : ''}" placeholder="🙂" aria-label="Eigenes Emoji als Symbol" autocomplete="off"></label>
        <div class="pickhead">Farbe</div>
        <div class="iconrow">${Object.keys(FARBEN).map(c => `<button class="swatch ${c === l.color ? 'on' : ''}" data-act="setColor" data-l="${l.id}" data-color="${c}" aria-label="Farbe ${c}" style="background:${FARBEN[c][1]};border-color:${FARBEN[c][1]}"><span style="background:#fff"></span></button>`).join('')}</div>
        <button class="textbtn strong" data-act="pickIcon" data-l="${l.id}" style="align-self:flex-end">Fertig</button>
      </div>` : ''}
      </li>`).join('')}
    </ul>
    <form class="addrow" data-act="addList" data-s="${g.id}"><span class="plus" aria-hidden="true">+</span>
      <label class="sr" for="addl-${g.id}">Liste hinzufügen</label>
      <input id="addl-${g.id}" placeholder="Liste hinzufügen" enterkeyhint="enter" autocomplete="off"></form>
    </div></section>`).join('');
  return `<div class="screen">
    <header class="top">
      <div class="bar"><a class="back" href="#/">${I.back}Listen</a><div class="icons">${refreshBtn()}<a class="textbtn strong" href="#/">Fertig</a></div></div>
      <h1>Listen bearbeiten</h1>
    </header>
    <main class="content">${groups}
      <button class="dashed" data-act="addGroup">Gruppe hinzufügen</button>
      ${view.lists[TPL] ? `<section class="group"><div class="grouphead"><span class="grouptitle">Vorlage für neue Listen</span></div>
        <div class="card"><a class="row" href="#/liste/${TPL}/bearbeiten">${listIcon('list', 'grau')}
          <span class="listtext"><span class="listname">Vorlage</span><span class="liststat">${allItems(view.lists[TPL]).length} Punkte · erscheint nicht in der Übersicht</span></span>${I.chev}</a></div>
        <p class="hint">Jede neue Liste startet als Kopie der Vorlage, mit allen Punkten abgewählt. Danach wählt ihr aus, was mitkommt.</p></section>` : ''}
      <p class="hint">Namen direkt antippen und ändern. Symbol antippen, um Symbol und Farbe zu wählen. Das Kopier-Symbol dupliziert eine Liste mit allen Punkten. Listen am Griff rechts in eine andere Reihenfolge oder Gruppe ziehen. Gruppen mit den Pfeilen verschieben.</p>
    </main>
    <a class="foot" href="#/einstellungen" data-status></a>
  </div>`;
}

function vLogin() {
  const code = isStandalone() || (lsGet('verifier', null) && !lsGet('withRedirect', false));
  return `<div class="screen"><div class="run" style="justify-content:center;text-align:center;align-items:center;gap:16px">
    <img src="apple-touch-icon.png" alt="" style="width:96px;height:96px;border-radius:22px">
    <h2 style="margin:0;font-size:26px">Urlaubspackliste</h2>
    <p class="sub" style="max-width:320px">Die Listen liegen in eurer Dropbox. Ohne Verbindung wird nichts angezeigt.</p>
    <a class="primary" data-act="login" href="${esc(loginHref(!isStandalone()))}" ${isStandalone() ? 'target="_blank" rel="noopener"' : ''} style="max-width:340px;display:flex;align-items:center;justify-content:center;text-decoration:none">Verbindung zur Dropbox herstellen</a>
    ${code ? `<form class="field" data-act="code" style="width:100%;max-width:340px;border:0;padding:0"><label for="code">Nach der Anmeldung zeigt Dropbox einen Code. Kopieren und hier einfügen:</label>
      <input id="code" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Code einfügen"><button class="secondary" style="margin-top:6px">Code bestätigen</button></form>` : ''}
    <p class="hint" style="max-width:320px">Tipp: In Safari über Teilen › Zum Home-Bildschirm ablegen, dann über das Symbol öffnen und dort verbinden.</p>
  </div></div>`;
}

function vSettings() {
  const pendingCode = lsGet('verifier', null) && !lsGet('withRedirect', false);
  const conn = connected();
  return `<div class="screen">
    <header class="top">${topBar('#/', 'Listen', refreshBtn())}<h1>Einstellungen</h1></header>
    <main class="content">
      <section class="group"><div class="grouphead"><span class="grouptitle">Dropbox</span></div>
        <div class="card">
          <div class="para">${conn ? '<b>Verbunden.</b> Die Listen liegen in eurer Dropbox unter <b>Apps › Wohnmobil-Checkliste › urlaubspackliste.json</b>.'
            : 'Meldet euch auf jedem iPhone einmal mit eurem <b>gemeinsamen Dropbox-Konto</b> an. Danach werden die Listen automatisch abgeglichen.'}</div>
          <div class="para" data-status style="display:flex;align-items:center;gap:8px;padding-top:0"></div>
          ${conn ? `<div class="btnrow"><button class="secondary" data-act="refresh">Jetzt abgleichen</button><button class="secondary danger" data-act="logout">Abmelden</button></div>`
          : `<div class="btnrow"><a class="primary" data-act="login" href="${esc(loginHref(!isStandalone()))}" ${isStandalone() ? 'target="_blank" rel="noopener"' : ''}>Mit Dropbox anmelden</a></div>
            ${pendingCode || isStandalone() ? `<form class="field" data-act="code"><label for="code">${isStandalone() ? 'Nach der Anmeldung zeigt Dropbox einen Code. Kopieren und hier einfügen:' : 'Code von Dropbox:'}</label>
              <input id="code" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Code einfügen"><button class="secondary" style="margin-top:6px">Code bestätigen</button></form>` : ''}`}
        </div>
        ${store.error && conn ? `<p class="hint">Letzter Fehler: ${esc(store.error)}</p>` : ''}
      </section>
      <section class="group"><div class="grouphead"><span class="grouptitle">Sicherung</span></div>
        <div class="card"><div class="para">Alle Listen als Datei sichern oder eine Sicherung zurückspielen.</div>
          <div class="btnrow"><button class="secondary" data-act="export">Exportieren</button><button class="secondary" data-act="import">Importieren</button></div>
          <input type="file" id="importfile" accept=".json,application/json" hidden></div>
      </section>
      <section class="group"><div class="grouphead"><span class="grouptitle">Tipp</span></div>
        <div class="card"><div class="para">In Safari über <b>Teilen › Zum Home-Bildschirm</b> ablegen – dann startet die Packliste wie eine App und bleibt angemeldet.</div></div>
      </section>
    </main>
  </div>`;
}

/* ---------- Routing & Rendern ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (h[0] === 'listen') return { v: 'lists' };
  if (h[0] === 'liste' && meta(h[1])) return { v: h[2] === 'auswahl' ? 'select' : h[2] === 'bearbeiten' ? 'edit' : 'run', id: h[1] };
  if (h[0] === 'einstellungen') return { v: 'settings' };
  return { v: 'home' };
}
let lastRouteKey = '';
function autosize(root = document) { root.querySelectorAll('textarea[data-act]').forEach(t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }); }
document.addEventListener('input', e => {
  if (e.target.matches('input[data-emo]')) {
    const v = firstEmo(e.target.value); if (!v) return;
    const r = route();
    if (e.target.dataset.emo === 'list') commit({ t: 'setIcon', l: e.target.dataset.l, icon: v });
    else { const f = findItem(view.lists[r.id], e.target.dataset.i); if (f) { itemPick = null; commit({ t: 'editItem', l: r.id, i: f.item.id, patch: { icon: v } }); } }
    return;
  }
  if (e.target.matches('textarea[data-act]')) { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; } });
function applyTheme(r) {
  const st = document.documentElement.style, m = r.id && meta(r.id);
  const keys = ['--accent', '--accent-dark', '--accent-soft', '--bg', '--sel'];
  if (m && r.v !== 'lists') {
    const [bg, fg, dk] = FARBEN[m.color];
    st.setProperty('--accent', fg); st.setProperty('--accent-dark', dk); st.setProperty('--accent-soft', 'color-mix(in srgb, ' + fg + ' 18%, white)');
    st.setProperty('--bg', bg); st.setProperty('--sel', bg);
  } else keys.forEach(k => st.removeProperty(k));
  const tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#F6F4EF';
}
function render() {
  const r = route(); const key = r.v + (r.id || '');
  const sy = key === lastRouteKey ? window.scrollY : 0;
  const html = !connected() ? vLogin() : r.v === 'select' ? vSelect(r.id) : r.v === 'run' ? vRun(r.id) : r.v === 'edit' ? vEdit(r.id) : r.v === 'settings' ? vSettings() : r.v === 'lists' ? vLists() : vHome();
  applyTheme(r);
  $('#app').innerHTML = html;
  renderStatus();
  autosize();
  window.scrollTo(0, sy);
  lastRouteKey = key;
}

/* ---------- Aktionen ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const r = route(), id = r.id, act = el.dataset.act;
  if (el.tagName === 'INPUT' || el.tagName === 'FORM') return;
  switch (act) {
    case 'refresh': e.preventDefault(); sync(true); checkUpdate(); break;
    case 'toggleSel': {
      const f = findItem(view.lists[id], el.dataset.i); if (f) commit({ t: 'editItem', l: id, i: f.item.id, patch: { sel: !isSel(f.item) } });
      break;
    }
    case 'selAll': commit({ t: 'selectAll', l: id, val: el.dataset.val === '1' }); break;
    case 'openList': { introView = null; const st = runState(el.dataset.l); if (!st.rest.length || !st.doneCount) resetRun(el.dataset.l); break; }
    case 'runDone': {
      const run = runs[id] || (runs[id] = { done: [], started: true });
      const st = runState(id), ci = st.seq.indexOf(el.dataset.i);
      if (!run.done.includes(el.dataset.i)) run.done.push(el.dataset.i);
      const st2 = runState(id); run.cursor = st2.rest.length ? st2.nextOpen(ci, false) : null; saveRuns();
      if (navigator.vibrate) navigator.vibrate(15);
      if (!st2.rest.length) commit({ t: 'lastDone', l: id, date: new Date().toISOString() }); else render();
      break;
    }
    case 'wheelJump': {
      const run = runs[id] || (runs[id] = { done: [], started: true });
      const x = el.dataset.i, k = run.done.indexOf(x);
      if (k >= 0) { run.done.splice(k, 1); toast('Wieder offen'); }
      run.cursor = x; saveRuns(); render(); break;
    }
    case 'runLater': {
      const run = runs[id] || (runs[id] = { done: [], started: true });
      const st = runState(id); run.cursor = st.nextOpen(st.seq.indexOf(el.dataset.i), false); saveRuns(); render(); break;
    }
    case 'secPick': secPick = id; render(); break;
    case 'introOpen': introView = id; render(); break;
    case 'introClose': introView = null; render(); break;
    case 'secPickClose': secPick = null; render(); break;
    case 'jumpSec': {
      const run = runs[id] || (runs[id] = { done: [] }); run.started = true;
      const st = runState(id), target = el.dataset.sec;
      const inSec = st.seq.filter(x => (st.byId[x].sec || '') === target);
      run.cursor = inSec.find(x => !st.done.has(x)) || inSec[0];
      if (!inSec.some(x => !st.done.has(x))) toast(`„${target}“ ist schon erledigt`);
      secPick = null; introView = null; saveRuns(); render(); break;
    }
    case 'runStart': runs[id] = { done: [], started: true }; saveRuns(); render(); break;
    case 'runBack': {
      // zum vorherigen noch offenen Punkt (Erledigtes bleibt erledigt)
      const run = runs[id]; const st = runState(id); if (!run || !st.cur) break;
      const ci = st.seq.indexOf(st.cur), n = st.seq.length;
      for (let k = 1; k < n; k++) { const x = st.seq[(ci - k + n) % n]; if (!st.done.has(x)) { run.cursor = x; break; } }
      saveRuns(); render(); break;
    }
    case 'restart': {
      // ohne Systemdialog: erster Tipp fragt nach, zweiter setzt zurück
      if (runState(id).rest.length && el.dataset.sure !== '1') {
        el.dataset.sure = '1'; el.textContent = 'Alles wieder offen?'; el.classList.add('warn');
        setTimeout(() => { if (el.isConnected) { el.dataset.sure = ''; el.textContent = 'Neue Packrunde'; el.classList.remove('warn'); } }, 4000);
        break;
      }
      resetRun(id); secPick = null; introView = null; render(); toast('Neue Packrunde – alle Punkte offen'); break;
    }
    case 'finish': resetRun(id); break;
    case 'itemMenu': itemMenu = itemMenu === el.dataset.i ? null : el.dataset.i; itemPick = null; render(); break;
    case 'dupItem': {
      const f = findItem(view.lists[id], el.dataset.i); if (!f) break;
      const nid = 'i-' + uid(); itemMenu = null;
      commit({ t: 'dupItem', l: id, i: f.item.id, id: nid, text: f.item.text + ' (Kopie)' });
      const t = document.querySelector(`textarea[data-act="itemText"][data-i="${nid}"]`); if (t) { t.focus(); t.select(); }
      break;
    }
    case 'copyItem': {
      const f = findItem(view.lists[id], el.dataset.i); if (!f) break;
      commit({ t: 'copyItem', l: id, i: f.item.id, to: el.dataset.to, id: 'i-' + uid() });
      toast(`„${f.item.text}“ kopiert nach „${meta(el.dataset.to).name}“`); break;
    }
    case 'pickItemIcon': itemMenu = null; itemPick = itemPick === el.dataset.i ? null : el.dataset.i; render(); break;
    case 'setItemIcon': { const f = findItem(view.lists[id], el.dataset.i); itemPick = null; if (f) commit({ t: 'editItem', l: id, i: f.item.id, patch: { icon: el.dataset.icon } }); else render(); break; }
    case 'pickIcon': iconPick = iconPick === el.dataset.l ? null : el.dataset.l; render(); break;
    case 'setIcon': commit({ t: 'setIcon', l: el.dataset.l, icon: el.dataset.icon }); break;
    case 'setColor': commit({ t: 'setColor', l: el.dataset.l, color: el.dataset.color }); break;
    case 'dupList': {
      const L = view.lists[el.dataset.l], nid = 'l-' + uid();
      commit({ t: 'dupList', l: el.dataset.l, id: nid, name: L.name + ' (Kopie)', color: meta(el.dataset.l).color });
      toast(`„${L.name} (Kopie)“ angelegt`);
      const t = document.querySelector(`textarea[data-l="${nid}"]`); if (t) { t.focus(); t.select(); }
      break;
    }
    case 'delList': {
      const L = view.lists[el.dataset.l], n = allItems(L).length;
      if (confirm(`Liste „${L.name}“${n ? ` mit ${n} Punkt${n === 1 ? '' : 'en'}` : ''} löschen? Das lässt sich nicht rückgängig machen.`)) { resetRun(el.dataset.l); commit({ t: 'delList', l: el.dataset.l }); }
      break;
    }
    case 'addGroup': {
      const gid = 'g-' + uid(); commit({ t: 'addGroup', g: { id: gid, name: '' } });
      const inp = document.querySelector(`.sectitle[data-g="${gid}"]`); if (inp) inp.focus(); break;
    }
    case 'delGroup': {
      const g = view.groups.find(x => x.id === el.dataset.g);
      if (confirm(g.lists.length ? `Gruppe „${g.name}“ löschen? Ihre ${g.lists.length} Listen wandern in die Gruppe darüber.` : `Gruppe „${g.name}“ löschen?`)) commit({ t: 'delGroup', g: g.id });
      break;
    }
    case 'groupUp': commit({ t: 'moveGroup', g: el.dataset.g, dir: -1 }); break;
    case 'groupDown': commit({ t: 'moveGroup', g: el.dataset.g, dir: 1 }); break;
    case 'moveMode': moveSel = new Set(); itemMenu = null; itemPick = null; render(); break;
    case 'moveCancel': moveSel = null; render(); break;
    case 'moveToggle': { const x = el.dataset.i; if (moveSel.has(x)) moveSel.delete(x); else moveSel.add(x); render(); break; }
    case 'moveTo': {
      const L = view.lists[id], target = L.sections.find(x => x.id === el.dataset.s); if (!target || !moveSel || !moveSel.size) break;
      const order = allItems(L).map(it => it.id).filter(x => moveSel.has(x)); // Reihenfolge beibehalten
      order.forEach(x => commit({ t: 'moveItem', l: id, i: x, s: target.id }));
      toast(`${order.length} Punkt${order.length === 1 ? '' : 'e'} nach „${target.title || 'Ohne Namen'}“ verschoben`);
      moveSel = null; render(); break;
    }
    case 'moveOne': {
      const L = view.lists[id], target = L.sections.find(x => x.id === el.dataset.s), f = findItem(L, el.dataset.i); if (!target || !f) break;
      itemMenu = null; commit({ t: 'moveItem', l: id, i: f.item.id, s: target.id });
      toast(`„${f.item.text}“ nach „${target.title || 'Ohne Namen'}“ verschoben`); break;
    }
    case 'reserveToggle': reserveOpen = !reserveOpen; render(); break;
    case 'unselItem': { const f = findItem(view.lists[id], el.dataset.i); if (f) { commit({ t: 'editItem', l: id, i: f.item.id, patch: { sel: false } }); toast(`„${f.item.text}“ herausgenommen – unten wieder hinzufügbar`); } break; }
    case 'selItem': { const f = findItem(view.lists[id], el.dataset.i); if (f) { commit({ t: 'editItem', l: id, i: f.item.id, patch: { sel: true } }); toast(`„${f.item.text}“ hinzugefügt`); } break; }
    case 'addFromTpl': { const f = findItem(view.lists[TPL], el.dataset.i); if (f) { commit({ t: 'copyItem', l: TPL, i: f.item.id, to: id, id: 'i-' + uid() }); toast(`„${f.item.text}“ hinzugefügt`); } break; }
    case 'delItem': {
      const f = findItem(view.lists[id], el.dataset.i);
      if (f && (!f.item.text || confirm(`„${f.item.text}“ löschen?`))) commit({ t: 'delItem', l: id, i: f.item.id });
      break;
    }
    case 'cycleResp': {
      const f = findItem(view.lists[id], el.dataset.i); if (!f) break;
      const next = RESP_CYCLE[(RESP_CYCLE.indexOf(f.item.resp || '') + 1) % RESP_CYCLE.length];
      commit({ t: 'editItem', l: id, i: f.item.id, patch: { resp: next } }); break;
    }
    case 'addSection': {
      const sid = 's-' + uid(); commit({ t: 'addSection', l: id, sec: { id: sid, title: '' } });
      const inp = document.querySelector(`.sectitle[data-s="${sid}"]`); if (inp) inp.focus(); break;
    }
    case 'delSection': secDel = secDel === el.dataset.s ? null : el.dataset.s; render(); break;
    case 'delSectionCancel': secDel = null; render(); break;
    case 'delSectionOnly': case 'delSectionAll': {
      const L = view.lists[id]; const s = L.sections.find(x => x.id === el.dataset.s); secDel = null; if (!s) { render(); break; }
      const all = act === 'delSectionAll', n = s.items.length;
      commit({ t: 'delSection', l: id, s: s.id, withItems: all });
      toast(all && n ? `„${s.title || 'Abschnitt'}“ mit ${n} Punkt${n === 1 ? '' : 'en'} gelöscht` : `„${s.title || 'Abschnitt'}“ gelöscht`); break;
    }
    case 'selSec': commit({ t: 'selectSection', l: id, s: el.dataset.s, val: el.dataset.val === '1' }); break;
    case 'login': if (!rememberLogin(!isStandalone())) { e.preventDefault(); toast('Einen Moment – bitte nochmal tippen'); } break;
    case 'logout': if (confirm('Von Dropbox abmelden? Die Listen werden von diesem iPhone entfernt und bleiben in der Dropbox.')) logout(); break;
    case 'export': {
      const blob = new Blob([JSON.stringify(view, null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `urlaubspackliste-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000); break;
    }
    case 'import': $('#importfile').click(); break;
  }
});

function commitText(inp) {
  const r = route(), id = r.id, v = inp.value.trim();
  if (inp.dataset.act === 'itemText') {
    const f = findItem(view.lists[id], inp.dataset.i);
    if (f && v && v !== f.item.text) commit({ t: 'editItem', l: id, i: f.item.id, patch: { text: v } });
    else if (f && !v) inp.value = f.item.text;
  } else if (inp.dataset.act === 'listName') {
    const L = view.lists[inp.dataset.l];
    if (L && v && v !== L.name) commit({ t: 'renameList', l: inp.dataset.l, name: v }); else if (L && !v) inp.value = L.name;
  } else if (inp.dataset.act === 'groupTitle') {
    const g = view.groups.find(x => x.id === inp.dataset.g);
    if (g && v !== g.name) commit({ t: 'renameGroup', g: g.id, name: v });
  } else if (inp.dataset.act === 'itemNote') {
    const f = findItem(view.lists[id], inp.dataset.i); const nv = inp.value.trim();
    if (f && nv !== (f.item.note || '')) commit({ t: 'editItem', l: id, i: f.item.id, patch: { note: nv } });
  } else if (inp.dataset.act === 'secTitle') {
    const s = view.lists[id].sections.find(x => x.id === inp.dataset.s);
    if (s && v !== s.title) commit({ t: 'renameSection', l: id, s: s.id, title: v });
  }
}
document.addEventListener('focusout', e => { if (e.target.matches('[data-act="itemText"],[data-act="itemNote"],[data-act="secTitle"],[data-act="listName"],[data-act="groupTitle"]')) commitText(e.target); });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('[data-act="itemText"],[data-act="secTitle"],[data-act="listName"],[data-act="groupTitle"]')) { e.preventDefault(); e.target.blur(); }
});
document.addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, r = route();
  if (f.dataset.act === 'addList') {
    const inp = f.querySelector('input'), name = inp.value.trim(); if (!name) return;
    const nid = 'l-' + uid(), T = view.lists[TPL], fromTpl = !!(T && allItems(T).length);
    commit({ t: 'addList', g: f.dataset.s, list: { id: nid, name, icon: fromTpl ? 'suitcase' : 'list' }, fromTpl });
    if (fromTpl) { inp.blur(); location.hash = `#/liste/${nid}/auswahl`; toast('Aus der Vorlage angelegt – jetzt auswählen, was mitkommt'); }
    else { const again = document.querySelector(`form.addrow[data-s="${f.dataset.s}"] input`); if (again) again.focus(); }
  } else if (f.dataset.act === 'addItem') {
    const inp = f.querySelector('input'), text = inp.value.trim(); if (!text) return;
    const sid = f.dataset.s;
    commit({ t: 'addItem', l: r.id, s: sid, item: { id: 'i-' + uid(), text, resp: 'B', sel: true } });
    const again = document.querySelector(`form.addrow[data-s="${sid}"] input`); if (again) { again.focus(); }
  } else if (f.dataset.act === 'code') {
    const code = f.querySelector('input').value; if (!code.trim()) return;
    try { await finishLogin(code); toast('Mit Dropbox verbunden'); location.hash = '#/'; render(); await sync(true); }
    catch (err) { toast('Anmeldung fehlgeschlagen: ' + err.message); }
  }
});
document.addEventListener('change', async e => {
  if (e.target.matches('[data-act="listDate"]')) {
    const L = view.lists[e.target.dataset.l], v = e.target.value || '';
    if (L && v !== (L.date || '')) commit({ t: 'setDate', l: e.target.dataset.l, date: v });
    return;
  }
  if (e.target.id !== 'importfile') return;
  const file = e.target.files[0]; if (!file) return;
  try {
    const data = ensureLists(JSON.parse(await file.text()));
    if (!confirm('Alle Listen durch die Sicherung ersetzen?')) return;
    // Import als Satz von Operationen gegen den aktuellen Stand
    store.base = data; store.pending = []; persist(); view = computeView();
    if (connected()) {
      const remote = await dbxDownload().catch(() => null);
      const up = await dbxUpload(data, remote ? remote.rev : null);
      if (!up.conflict) { store.rev = up.rev; store.lastSync = Date.now(); persist(); }
    }
    toast('Sicherung eingespielt'); render();
  } catch (err) { toast('Datei konnte nicht gelesen werden'); }
});

/* ---------- Ziehen zum Sortieren ---------- */
let drag = null;
document.addEventListener('pointerdown', e => {
  const h = e.target.closest('[data-drag]'); if (!h) return;
  e.preventDefault();
  const li = h.closest('li'); const rect = li.getBoundingClientRect();
  const ph = document.createElement('li'); ph.className = 'placeholder'; ph.style.height = rect.height + 'px';
  li.after(ph);
  li.classList.add('dragging'); li.style.position = 'fixed'; li.style.left = rect.left + 'px'; li.style.top = rect.top + 'px'; li.style.width = rect.width + 'px';
  drag = { li, ph, id: h.dataset.drag, dy: e.clientY - rect.top, pid: e.pointerId };
  h.setPointerCapture && h.setPointerCapture(e.pointerId);
});
document.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.pid) return;
  e.preventDefault();
  drag.li.style.top = (e.clientY - drag.dy) + 'px';
  // erst den Abschnitt bestimmen, über dem der Finger ist (auch leere Abschnitte), dann die Stelle darin
  const uls = [...document.querySelectorAll('ul.items')];
  let target = uls[uls.length - 1];
  for (const ul of uls) { const r = ul.closest('section.group').getBoundingClientRect(); if (e.clientY <= r.bottom) { target = ul; break; } }
  const lis = [...target.querySelectorAll(':scope > li:not(.dragging):not(.placeholder)')];
  const before = lis.find(li => { const r = li.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
  if (before) { if (drag.ph.nextElementSibling !== before) before.before(drag.ph); }
  else if (target.lastElementChild !== drag.ph) target.appendChild(drag.ph);
  if (e.clientY < 70) window.scrollBy(0, -8); else if (e.clientY > innerHeight - 70) window.scrollBy(0, 8);
}, { passive: false });
function endDrag() {
  if (!drag) return;
  const { li, ph, id } = drag; drag = null;
  const ul = ph.parentElement; const sid = ul.dataset.s;
  let nxt = ph.nextElementSibling; while (nxt && (nxt === li || nxt.classList.contains('placeholder'))) nxt = nxt.nextElementSibling;
  const before = nxt ? nxt.dataset.i : null;
  li.remove(); ph.remove();
  if (route().v === 'lists') commit({ t: 'moveList', l: id, g: sid, before });
  else commit({ t: 'moveItem', l: route().id, i: id, s: sid, before });
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);

/* ---------- Start ---------- */
/* Neue Version der Seite erkennen und laden (iPhone hält sonst die alte im Speicher) */
const APP_VERSION = 14;
async function checkUpdate() {
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    const j = await r.json();
    if (j.v > APP_VERSION && !document.querySelector('input:focus,textarea:focus')) location.replace(location.pathname + '?u=' + j.v + location.hash);
  } catch (e) {}
}
async function boot() {
  // Rückkehr von Dropbox (Anmeldung mit Weiterleitung)
  const q = new URLSearchParams(location.search);
  if (q.get('code')) {
    history.replaceState(null, '', location.pathname + '#/');
    try { await finishLogin(q.get('code')); toast('Mit Dropbox verbunden'); } catch (err) { toast('Anmeldung fehlgeschlagen: ' + err.message); }
  } else if (q.get('error')) {
    history.replaceState(null, '', location.pathname + '#/einstellungen'); toast('Anmeldung abgebrochen');
  }
  if (!connected()) store.status = 'off';
  persist(); view = computeView();
  render();
  sync(); checkUpdate();
}
window.addEventListener('hashchange', () => { moveSel = null; render(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { sync(); checkUpdate(); } });
window.addEventListener('online', () => sync());
boot();
