'use strict';

/* ============================================================
   MyFinance — finanzas personales e inversiones
   Todo se guarda en este navegador (localStorage).
   Usá Ajustes > Respaldo para exportar una copia.
   ============================================================ */

const STORE_KEY = 'misFinanzas.v1';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
const currentMonth = () => todayISO().slice(0, 7);
const nowTime = () => new Date().toTimeString().slice(0, 5);

/* Íconos de línea (estilo app de banco). Trazos de 24×24 que heredan el color del texto. */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  pie: '<path d="M21 12A9 9 0 1 1 12 3"/><path d="M12 3a9 9 0 0 1 9 9h-9z"/>',
  party: '<path d="M4 20l4.5-11.5 7 7z"/><path d="M13 3.5v2.5M19 9.5h2M17 6l1.8-1.8M11.5 8.5c1.2-1.2 3-1.2 4 0M15.5 12.5c1.2-1 2.8-.8 3.5.2"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 17v-5M12.5 17V8M17 17v-8"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 17v3h16v-3"/>',
  dollar: '<path d="M12 2.5v19"/><path d="M17 6.5c-.8-1.3-2.6-2-5-2-2.8 0-4.5 1.3-4.5 3.3 0 4.7 9.5 2.4 9.5 7.4 0 2-1.8 3.3-5 3.3-2.4 0-4.2-.8-5-2.2"/>',
  trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  sync: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 3v5h-5"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c6.4 0 10 8 10 8a17.6 17.6 0 0 1-2.2 3.2"/><path d="M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 8 10 8a9.7 9.7 0 0 0 5.4-1.6"/><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2"/><path d="m2 2 20 20"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
  mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3.5"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7z"/><path d="m11 13 9-9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5M18 9.5v5"/>',
  bank: '<path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 20h18"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  swap: '<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19"/><path d="M6.5 15h4"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  check: '<path d="M4 12.5 9.5 18 20 6.5"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  faceid: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9.5v1M15 9.5v1M12 9.5v3.5h-1"/><path d="M9 15.5a4 4 0 0 0 6 0"/>',
  back: '<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="m15 9-4 6M11 9l4 6"/>',
  flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-6.5 1-8.5z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  handshake: '<path d="m11 17 2 2a1.4 1.4 0 0 0 2-2"/><path d="m14 14 2.5 2.5a1.4 1.4 0 0 0 2-2l-3.9-3.9a2.8 2.8 0 0 0-4 0l-.9.9a1.4 1.4 0 0 1-2-2l2.8-2.8a5 5 0 0 1 6 -.8l.5.3a3 3 0 0 0 2 .4H21"/><path d="m21 15-1 1"/><path d="M3 7h2l6 6"/><path d="m3 15 6 6"/>',
  alert: '<path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  minus: '<path d="M5 12h14"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  cart: '<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2.5 3.5h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.4-1.1l1.8-6.8H6.4"/>',
  food: '<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18"/><path d="M17 21V3c-2.2 1-3.5 3.5-3.5 7v4H17"/>',
  bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 18v3M16 18v3"/><circle cx="8" cy="14.5" r=".8"/><circle cx="16" cy="14.5" r=".8"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.3-9.2A5 5 0 0 1 12 6a5 5 0 0 1 9.3 4.8C19.5 15.4 12 20 12 20z"/>',
  paw: '<circle cx="5.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 11c-3 0-6 4.5-6 7 0 1.7 1.3 2.5 3 2.5 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.7 0 3-.8 3-2.5 0-2.5-3-7-6-7z"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/>',
  ticket: '<path d="M3 8.5V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.5a2.5 2.5 0 0 0 0-5z"/><path d="M14 5v14" stroke-dasharray="2 2"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  plane: '<path d="M10.5 13 3 10.5l1.5-1.5 8 1 4-4.5c.8-.8 2.2-.9 2.9-.2s.6 2.1-.2 2.9l-4.5 4 1 8-1.5 1.5L12.5 15 9 18.5v2L7.5 22l-1-3.5L3 17.5 4.5 16h2z"/>',
  receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  laptop: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
  gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13"/><path d="M12 8C10 4 6.5 4.5 7.5 7c.5 1 4.5 1 4.5 1zM12 8c2-4 5.5-3.5 4.5-1-.5 1-4.5 1-4.5 1z"/>',
};
const icon = (name, size = 20) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const paintIcons = (root = document) => $$('[data-icon]', root).forEach((el) => { el.innerHTML = icon(el.dataset.icon); });

// Acepta "1.234,56", "1,234.56", "0,5", "0.5"
function parseNum(v) {
  if (typeof v === 'number') return v;
  let s = String(v ?? '').trim().replace(/\s|US\$|\$/g, '');
  if (!s) return null;
  const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
  if (lc > -1 && ld > -1) {
    s = lc > ld ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (lc > -1) {
    s = (s.match(/,/g).length > 1) ? s.replace(/,/g, '') : s.replace(',', '.');
  } else if ((s.match(/\./g) || []).length > 1 || /^-?[1-9]\d{0,2}\.\d{3}$/.test(s)) {
    s = s.replace(/\./g, ''); // "1.234.567" o "15.000" = miles
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/* ---------------- Catálogos ---------------- */

const CURRENCIES = [
  ['USD', 'Dólar estadounidense'], ['ARS', 'Peso argentino'], ['MXN', 'Peso mexicano'],
  ['COP', 'Peso colombiano'], ['CLP', 'Peso chileno'], ['PEN', 'Sol peruano'],
  ['UYU', 'Peso uruguayo'], ['BOB', 'Boliviano'], ['PYG', 'Guaraní'], ['BRL', 'Real brasileño'],
  ['EUR', 'Euro'], ['USDT', 'Tether (USDT ≈ USD)'], ['USDC', 'USD Coin (USDC ≈ USD)'],
];
const USD_PEGGED = new Set(['USD', 'USDT', 'USDC']);

const ACCOUNT_TYPES = {
  efectivo: { label: 'Efectivo', icon: 'cash' },
  banco: { label: 'Cuenta bancaria', icon: 'bank' },
  billetera: { label: 'Billetera virtual', icon: 'phone' },
  exchange: { label: 'Saldo en exchange / broker', icon: 'swap' },
  debito: { label: 'Tarjeta de débito', icon: 'card' },
  credito: { label: 'Tarjeta de crédito', icon: 'card' },
};
const accIcon = (a) => icon(a?.id === 'family' ? 'users' : ACCOUNT_TYPES[a?.type]?.icon || 'wallet', 18);

const ASSET_TYPES = { etf: 'ETF', accion: 'Acción', cripto: 'Cripto', oro: 'Oro', otro: 'Otro' };

// Colores fijos por categoría (el color sigue a la categoría, no al ranking)
const ALLOC = [
  { k: 'efectivo', label: 'Efectivo', c: 1 },
  { k: 'banco', label: 'Bancos', c: 2 },
  { k: 'billetera', label: 'Billeteras y exchanges', c: 3 },
  { k: 'oro', label: 'Oro', c: 4 },
  { k: 'accion', label: 'Acciones', c: 5 },
  { k: 'cripto', label: 'Cripto', c: 6 },
  { k: 'etf', label: 'ETF', c: 7 },
  { k: 'otro', label: 'Otros', c: 8 },
];

const CG_IDS = {
  BTC: 'bitcoin', ETH: 'ethereum', PAXG: 'pax-gold', XAUT: 'tether-gold', USDT: 'tether', USDC: 'usd-coin',
  SOL: 'solana', BNB: 'binancecoin', XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin', DOT: 'polkadot',
  AVAX: 'avalanche-2', LINK: 'chainlink', LTC: 'litecoin', TRX: 'tron', TON: 'the-open-network', POL: 'polygon-ecosystem-token',
};

const CAT_GASTO = ['Supermercado', 'Comida y salidas', 'Transporte', 'Vivienda / alquiler', 'Servicios', 'Salud', 'Gimnasio / deporte', 'Educación',
  'Ocio', 'Compras', 'Suscripciones', 'Viajes', 'Impuestos', 'Pago de tarjeta (intereses)', 'Eventos y fiestas', 'Mascotas', 'Otros gastos'];
const CAT_INGRESO = ['Sueldo', 'Mesada / familia', 'Freelance', 'Dividendos', 'Intereses', 'Venta de algo', 'Regalo', 'Otros ingresos'];
// Tus categorías (S.customCats) van antes de "Otros"
const catsOf = (type) => {
  const base = type === 'ingreso' ? CAT_INGRESO : CAT_GASTO, other = base[base.length - 1];
  const mine = (S?.customCats || []).filter((c) => c.type === type && !base.includes(c.name)).map((c) => c.name);
  return [...base.slice(0, -1), ...mine, other];
};
const OTHER_CATS = new Set(['Otros gastos', 'Otros ingresos']);
// Para reconocer tus categorías al dictar o leer un comprobante (ej. "comparsa")
const customCatWords = (type) => (S?.customCats || []).filter((c) => c.type === type).map((c) => [c.name, norm(c.name).replace(/[^a-z0-9 ]/g, ' ')]);

const ARS_TYPES = [['oficial', 'Oficial'], ['bolsa', 'MEP'], ['blue', 'Blue'], ['contadoconliqui', 'CCL'], ['cripto', 'Cripto'], ['tarjeta', 'Tarjeta']];
const BOB_TYPES = [['oficial', 'Oficial del BCB (el que usan los bancos)'], ['binance', 'Binance (USDT/BOB)'], ['manual', 'El de mi banco (lo cargo yo)']];

// Blend: el protocolo DeFi (Stellar) donde Meru invierte tus USDC. Fuente: DefiLlama.
const BLEND_USDC_POOL = 'ecf788e3-d2ef-4fdd-9ece-8a2d96226ddf';

// Abajo (en el celular) van Inicio, Movimientos y Plan; todo lo demás se abre desde "Más"
const MORE_GROUPS = [
  ['Organizar tu mes', [
    ['fijos', 'Fijos', 'repeat', 'Sueldo, mesada, gym…'],
    ['programados', 'Programados', 'calendar', 'Turnos, matrícula…'],
    ['presupuesto', 'Presupuesto', 'pie', 'Topes por categoría'],
    ['metas', 'Metas', 'target', 'A qué querés llegar'],
  ]],
  ['Tu plata', [
    ['cuentas', 'Cuentas', 'wallet', 'Saldos y tarjetas'],
    ['prestamos', 'Préstamos', 'handshake', 'Lo que prestás o debés'],
    ['inversiones', 'Inversiones', 'trending', 'Cripto, oro, acciones'],
    ['miplan', 'Mi plan', 'shield', 'Perfil, plan y notas'],
    ['dolar', 'Dólar', 'dollar', 'Tipo de cambio'],
  ]],
  ['Entender tus números', [
    ['analisis', 'Análisis', 'chart', 'En qué gastás'],
    ['consejos', 'Consejos', 'sparkle', 'Ahorrar y ganar más'],
    ['informe', 'Informe', 'download', 'PDF o Excel'],
  ]],
  ['La app', [
    ['respaldo', 'Respaldo', 'sync', 'iPhone, PC y copias'],
    ['ajustes', 'Ajustes', 'settings', 'Bloqueo y más'],
  ]],
];
const MORE_VIEWS = MORE_GROUPS.flatMap(([, list]) => list.map(([v]) => v));
const VIEWS = { resumen: 'Inicio', movimientos: 'Movimientos', plan: 'Plan', ...Object.fromEntries(MORE_GROUPS.flatMap(([, list]) => list.map(([v, l]) => [v, l]))) };
const VIEW_ALIAS = {};

/* ---------------- Estado ---------------- */

function defaultState() {
  const acc = (name, type, institution, currency, extra = {}) => ({ id: uid(), name, type, institution, currency, balance: 0, last4: '', creditLimit: 0, closingDay: '', dueDay: '', notes: '', apy: 0, apySource: 'manual', apyOffset: 0, apyAccrue: false, apyLastAccrual: '', ...extra });
  const h = (symbol, name, assetType, platform, coingeckoId = '') => ({
    id: uid(), symbol, name, assetType, platform, quantity: 0, avgCost: 0, price: 0,
    change24h: null, priceUpdated: null, priceSource: '', coingeckoId, trades: [],
  });
  return {
    version: 1,
    settings: {
      localCurrency: 'BOB', displayCurrency: 'USD', arsRateType: 'bolsa', bobRateType: 'oficial', autoRates: true,
      rates: { USD: 1 }, ratesUpdated: null, finnhubKey: '', lastRefresh: null,
      lastBackup: null, privacy: false, view: 'resumen', txMonth: '', txAccount: '',
      aiKey: '', defaultAccountId: '', blendApy: null, blendUpdated: null,
      // Las migraciones viejas (cargar mis fijos, Meru, etc.) no corren en una instalación nueva
      seededRecurring: true, seededMeru: true, migratedBOB: true, migratedBCB: true,
    },
    // Instalación nueva: vacía (sin datos de nadie). Cada uno agrega sus cuentas, inversiones y fijos
    accounts: [acc('Efectivo', 'efectivo', '', 'BOB')],
    scheduled: [], // gastos programados de una sola vez: { id, name, date, amount, currency, accountId, category }
    recurring: [], // ingresos y gastos fijos: { id, type, name, amount, currency, accountId, category, day|null, startMonth }
    goals: [],     // metas: { id, name, target, currency, date, source }
    loans: [],     // préstamos: { id, dir: preste|debo, person, amount, currency, date, dueDate, payments }
    checkins: [],  // días marcados como "hoy no gasté"
    rateLog: [],   // tipo de cambio de cada día, para ver la devaluación
    holdings: [],
    transactions: [],
    budgets: {}, // { categoría: { amount, currency } } presupuesto mensual
    dayBudgets: {}, // presupuesto del día que mostró la app: { 'AAAA-MM-DD': { v: USD, at: cuándo } } (para el "Acumulado sin gastar")
    history: [],
  };
}

let S;

function migrate(s) {
  const d = defaultState();
  s.settings = { ...d.settings, ...(s.settings || {}) };
  s.settings.rates = { USD: 1, ...(s.settings.rates || {}) };
  for (const k of ['accounts', 'holdings', 'transactions', 'history', 'recurring', 'scheduled', 'goals', 'loans', 'checkins', 'rateLog', 'deleted', 'customCats']) if (!Array.isArray(s[k])) s[k] = [];
  if (!s.budgets || typeof s.budgets !== 'object' || Array.isArray(s.budgets)) s.budgets = {};
  if (!s.dayBudgets || typeof s.dayBudgets !== 'object' || Array.isArray(s.dayBudgets)) s.dayBudgets = {};
  if (!s.priceLog || typeof s.priceLog !== 'object' || Array.isArray(s.priceLog)) s.priceLog = {};
  if (!Array.isArray(s.balanceLog)) s.balanceLog = [];
  if (!s.priceHist || typeof s.priceHist !== 'object' || Array.isArray(s.priceHist)) s.priceHist = {};
  for (const a of s.accounts) {
    if (a.apy == null) Object.assign(a, { apy: 0, apySource: 'manual', apyOffset: 0, apyAccrue: false, apyLastAccrual: '' });
  }
  // Vivís en Bolivia: si quedó el peso argentino de la primera versión y no hay plata cargada en pesos, pasa a bolivianos
  if (!s.settings.migratedBOB) {
    s.settings.migratedBOB = true;
    const arsAccs = s.accounts.filter((a) => a.currency === 'ARS');
    const arsUsed = arsAccs.some((a) => Number(a.balance)) || s.transactions.some((t) => arsAccs.some((a) => a.id === t.accountId || a.id === t.toAccountId));
    if (s.settings.localCurrency === 'ARS' && !arsUsed) {
      s.settings.localCurrency = 'BOB';
      for (const a of arsAccs) {
        a.currency = 'BOB';
        if (a.name === 'Efectivo en pesos') a.name = 'Efectivo en bolivianos';
      }
    }
  }
  // Los bancos en Bolivia usan el tipo de cambio oficial del BCB: pasa a ser el predeterminado (una sola vez)
  if (!s.settings.migratedBCB) { s.settings.migratedBCB = true; if (s.settings.bobRateType === 'binance') s.settings.bobRateType = 'oficial'; }
  // Meru paga ~0,8 puntos menos que Blend (el protocolo donde invierte): se calibra con lo que muestra la app de Meru
  if (!s.settings.seededMeru) {
    s.settings.seededMeru = true;
    const meru = s.accounts.find((a) => /meru/i.test(a.name + ' ' + a.institution));
    if (meru && !Number(meru.apy)) Object.assign(meru, { apy: 5.05, apySource: 'blend', apyOffset: 0.78, apyAccrue: true });
  }
  // (Antes acá se cargaban fijos de ejemplo; ya no: al restaurar un respaldo viejo se registraban solos)
  s.settings.seededRecurring = true;
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { S = migrate(JSON.parse(raw)); stampEdits(null); return true; }
  } catch (e) { console.warn(e); }
  S = migrate(defaultState());
  stampEdits(null);
  return false;
}

/* Cada cuenta, movimiento, fijo, etc. guarda cuándo lo editaste por última vez (campo u).
   Así, al unir dos dispositivos, gana la edición más nueva de cada cosa (antes siempre ganaba este dispositivo).
   Se detecta comparando con cómo estaba en el último guardado: no hace falta marcarlo en cada formulario.
   No cuentan los campos que cambian solos (saldo por los movimientos, precios, cantidades por las compras). */
const STAMPED = ['accounts', 'holdings', 'recurring', 'scheduled', 'goals', 'loans', 'transactions', 'customCats'];
const STAMP_SKIP = {
  accounts: ['balance', 'apyLastAccrual'],
  holdings: ['quantity', 'avgCost', 'trades', 'price', 'change24h', 'priceUpdated', 'priceSource'],
  loans: ['payments', 'closed'],
  recurring: ['skip'],
};
let lastSeen = new Map();
function itemKey(k, x) {
  const skip = STAMP_SKIP[k] || [];
  return JSON.stringify(x, (f, v) => (f === 'u' || skip.includes(f) ? undefined : v));
}
function stampEdits(now) {
  const seen = new Map();
  for (const k of STAMPED) for (const x of S[k] || []) {
    if (!x?.id) continue;
    const j = itemKey(k, x);
    if (now && lastSeen.get(x.id) !== j) x.u = now;
    seen.set(x.id, j);
  }
  lastSeen = seen;
}

// edit=false para cambios que no son datos tuyos (precios, vista, filtros): no cuentan como "última edición"
function save(edit = true) {
  if (edit) S.editedAt = new Date().toISOString();
  stampEdits(edit ? S.editedAt : null);
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('⚠ No se pudo guardar en el navegador. Hacé una copia en Más → Respaldo.'); }
  FileSync.schedule();
  if (edit) CloudSync.schedule();
}

/* ---------------- Monedas ---------------- */

function rate(cur) {
  if (USD_PEGGED.has(cur)) return 1;
  const r = S.settings.rates[cur];
  return r > 0 ? r : null;
}
const toUSD = (amount, cur) => { const r = rate(cur); return r ? (Number(amount) || 0) / r : 0; };
const fromUSD = (usd, cur) => usd * (rate(cur) || 1);
// Convierte entre monedas; null si falta un tipo de cambio (mejor avisar que guardar un monto mal)
function convert(amount, from, to) {
  if (from === to || (USD_PEGGED.has(from) && USD_PEGGED.has(to))) return round2(Number(amount) || 0);
  const a = rate(from), b = rate(to);
  return a && b ? round2((Number(amount) || 0) / a * b) : null;
}
const NO_RATE = 'Falta el tipo de cambio: tocá Actualizar (con internet) y probá de nuevo.';
const dispCur = () => (S.settings.displayCurrency === 'LOCAL' ? S.settings.localCurrency : 'USD');

const CUR_SYMBOL = { BOB: 'Bs' };
const curLabel = (c) => CUR_SYMBOL[c] || c;

function fmtIn(amount, cur, { sign = false, decimals } = {}) {
  const v = Number(amount) || 0;
  const big = Math.abs(v) >= 100000;
  const opts = { minimumFractionDigits: decimals ?? (big ? 0 : 2), maximumFractionDigits: decimals ?? (big ? 0 : 2) };
  if (sign) opts.signDisplay = 'exceptZero';
  // Bolivianos con su símbolo de siempre: "Bs 300,00"
  if (CUR_SYMBOL[cur]) {
    const s = new Intl.NumberFormat('es-AR', opts).format(v);
    return s.startsWith('-') || s.startsWith('+') ? `${s[0]}${CUR_SYMBOL[cur]} ${s.slice(1)}` : `${CUR_SYMBOL[cur]} ${s}`;
  }
  if (cur.length === 3) {
    try { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: cur, ...opts }).format(v); } catch (e) { /* cae al formato simple */ }
  }
  return new Intl.NumberFormat('es-AR', opts).format(v) + ' ' + cur;
}
// Valor para precargar un input numérico: coma decimal y sin separador de miles ("12,345" = 12.345)
const numInput = (v) => (v === '' || v == null || !Number.isFinite(Number(v))) ? (v ?? '')
  : Number(v).toLocaleString('es-AR', { useGrouping: false, maximumFractionDigits: 10 });
const fmtMoney = (usd, { cur = dispCur(), sign = false } = {}) => fmtIn(fromUSD(usd, cur), cur, { sign });
const fmtNum = (n, max = 8) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: max }).format(Number(n) || 0);
const fmtPct = (p, sign = true) => (p == null || !Number.isFinite(p)) ? '—'
  : new Intl.NumberFormat('es-AR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: sign ? 'exceptZero' : 'auto' }).format(p / 100);
const fmtDate = (iso) => iso ? new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'nunca';
const cls = (n) => (n > 0 ? 'up' : n < 0 ? 'down' : '');
const arrow = (n) => (n > 0 ? '▲ ' : n < 0 ? '▼ ' : '');

function missingRates() {
  const used = new Set([S.settings.localCurrency, ...S.accounts.map((a) => a.currency)]);
  return [...used].filter((c) => !rate(c));
}

/* ---------------- Cálculos ---------------- */

const holdingValue = (h) => (Number(h.quantity) || 0) * (Number(h.price) || 0);
// Compras menos ventas registradas (hasta una fecha, si se indica)
// (un "ajuste" de cantidad suma o resta lo que diga su cantidad, con signo)
const tradeDelta = (x) => (x.side === 'compra' ? x.qty : x.side === 'venta' ? -x.qty : Number(x.qty) || 0);
const netTrades = (h, upTo) => (h.trades || []).filter((x) => !upTo || x.date <= upTo).reduce((s, x) => s + tradeDelta(x), 0);
// Diferencia entre tu posición y la suma de tus operaciones: > 0 faltan operaciones (sin fecha), < 0 sobran
const positionGap = (h) => Math.round(((Number(h.quantity) || 0) - netTrades(h)) * 1e10) / 1e10;
// "Saldo inicial": lo que tenés de un activo que no sale de compras registradas (ej. algo que ya tenías)
const baseQty = (h) => Math.max(0, Math.round(((Number(h.quantity) || 0) - netTrades(h)) * 1e10) / 1e10);
// Saldo inicial sin fecha: no se sabe desde cuándo lo tenés (se pide completarla)
const undatedBase = (h) => baseQty(h) > 1e-9 && !h.initial?.date;
const holdingCost = (h) => (Number(h.quantity) || 0) * (Number(h.avgCost) || 0);

function allocKeyAccount(a) {
  if (a.type === 'banco' || a.type === 'debito') return 'banco';
  if (a.type === 'billetera' || a.type === 'exchange') return 'billetera';
  return 'efectivo';
}

function totals() {
  let liquid = 0, debt = 0, inv = 0, cost = 0, invWithCost = 0;
  const alloc = {};
  for (const a of S.accounts) {
    const usd = toUSD(a.balance, a.currency);
    if (a.type === 'credito') { debt += usd; continue; }
    liquid += usd;
    const k = allocKeyAccount(a);
    alloc[k] = (alloc[k] || 0) + usd;
  }
  for (const h of S.holdings) {
    const v = holdingValue(h);
    inv += v;
    if (Number(h.avgCost) > 0) { cost += holdingCost(h); invWithCost += v; }
    alloc[h.assetType] = (alloc[h.assetType] || 0) + v;
  }
  // Préstamos: lo que te deben suma, lo que debés resta
  let lent = 0, owed = 0;
  for (const l of S.loans || []) {
    const rem = loanRemaining(l);
    if (l.closed || rem <= 0) continue;
    if (l.dir === 'preste') lent += toUSD(rem, l.currency); else owed += toUSD(rem, l.currency);
  }
  // netWorth = lo que tenés hoy (lo prestado todavía no volvió); netWorthWithLent = si te devuelven todo
  const netWorth = liquid + inv - debt - owed;
  return { liquid, debt, inv, cost, invWithCost, lent, owed, netWorth, netWorthWithLent: netWorth + lent, alloc };
}

// Compras/ventas de inversiones y préstamos mueven plata pero no son gasto ni ingreso
// Intereses, dividendos y rendimientos (ej. Binance Earn, Meru) son ingresos de inversión, no ingresos para gastar
const INV_INCOME_CATS = new Set(['Intereses', 'Dividendos']);
const isInvIncome = (t) => t.type === 'ingreso' && !!(t.invIncome || INV_INCOME_CATS.has(t.category));
// Lo que no es gasto ni ingreso "normal": inversiones, préstamos, lo que pagó tu familia y rendimientos de inversión
const nonFlow = (t) => !!(t.investment || t.loan || t.familyPaid || isInvIncome(t));

// Tipo de cambio de un día, de lo que la app guardó cada día. est = estimado (no hay dato cerca de esa fecha)
function rateAt(cur, date) {
  if (USD_PEGGED.has(cur)) return { r: 1, est: false };
  let best = null, after = null;
  for (const x of S.rateLog || []) {
    if (x.cur !== cur || !(x.rate > 0)) continue;
    if (x.date <= date) { if (!best || x.date > best.date) best = x; } else if (!after || x.date < after.date) after = x;
  }
  const pick = best || after;
  if (pick) return { r: pick.rate, est: Math.abs(Date.parse(pick.date) - Date.parse(date)) > 3 * 864e5 };
  return { r: rate(cur), est: true };
}
// Un monto convertido con el tipo de cambio del día del movimiento (para el informe)
function convertAt(amount, from, to, date) {
  if (from === to) return { v: Number(amount) || 0, est: false };
  const a = rateAt(from, date), b = rateAt(to, date);
  if (!a.r || !b.r) return { v: convert(amount, from, to) ?? 0, est: true };
  return { v: (Number(amount) || 0) / a.r * b.r, est: a.est || b.est };
}
// Gastos que pagó tu familia directamente por vos (ej. la U): no salen de tus cuentas
const FAMILY_ID = 'family';
const familyAcc = () => ({ id: FAMILY_ID, name: 'Lo pagó mi familia', type: 'familia', currency: S.settings.localCurrency, balance: 0 });
const familyPaidIn = (month) => S.transactions.filter((t) => t.familyPaid && t.type === 'gasto' && t.date?.startsWith(month)).reduce((s, t) => s + txUSD(t), 0);

// Lápidas: ids borrados, para que al unir los datos de dos dispositivos no "revivan"
function tombstone(id) {
  if (!id) return;
  S.deleted = S.deleted || [];
  if (!S.deleted.includes(id)) S.deleted.push(id);
  if (S.deleted.length > 5000) S.deleted.splice(0, S.deleted.length - 5000);
}

function txUSD(t) {
  const acc = S.accounts.find((a) => a.id === t.accountId);
  return toUSD(t.amount, acc?.currency || t.currency || 'USD');
}

function monthStats(month, txs = S.transactions) {
  let income = 0, expense = 0;
  const byCat = {}, incomeCats = {};
  for (const t of txs) {
    if (!t.date?.startsWith(month) || nonFlow(t) || t.type === 'transferencia') continue;
    const usd = txUSD(t);
    if (t.type === 'ingreso') { income += usd; incomeCats[t.category || 'Otros ingresos'] = (incomeCats[t.category || 'Otros ingresos'] || 0) + usd; }
    if (t.type === 'gasto') { expense += usd; byCat[t.category || 'Otros gastos'] = (byCat[t.category || 'Otros gastos'] || 0) + usd; }
  }
  return { income, expense, byCat, incomeCats };
}

// Precio de cada activo por día (para el informe "día por día": las acciones y ETF no tienen historial gratis)
function logPrices(date, px, { keep = false } = {}) {
  if (!Object.keys(px).length) return;
  const log = S.priceLog || (S.priceLog = {});
  log[date] = keep ? { ...px, ...(log[date] || {}) } : { ...(log[date] || {}), ...px };
  const keys = Object.keys(log).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - 420))) delete log[k];
}

function snapshot() {
  const t = totals();
  if (!S.accounts.some((a) => Number(a.balance)) && !S.holdings.some((h) => Number(h.quantity))) return;
  const d = todayISO();
  const row = { date: d, netWorth: t.netWorth, inv: t.inv, liquid: t.liquid, debt: t.debt };
  logPrices(d, Object.fromEntries(S.holdings.filter((h) => Number(h.price) > 0).map((h) => [h.symbol, Number(h.price)])));
  const last = S.history[S.history.length - 1];
  if (last && last.date === d) Object.assign(last, row); else S.history.push(row);
  if (S.history.length > 3650) S.history.shift();
}

/* ---------------- Movimientos: efecto en saldos ---------------- */

// Una tarjeta de crédito guarda la DEUDA como saldo positivo: un gasto la sube, un pago la baja.
const signFor = (acc, delta) => (acc.type === 'credito' ? -delta : delta);

function txEffects(t) {
  const from = S.accounts.find((a) => a.id === t.accountId);
  const out = [];
  const amt = Number(t.amount) || 0;
  if (t.type === 'ingreso' && from) out.push([from, signFor(from, amt)]);
  if (t.type === 'gasto' && from) out.push([from, signFor(from, -amt)]);
  if (t.type === 'transferencia') {
    const to = S.accounts.find((a) => a.id === t.toAccountId);
    if (from) out.push([from, signFor(from, -amt)]);
    if (to) out.push([to, signFor(to, Number(t.toAmount) || amt)]);
  }
  return out;
}
function applyTx(t, dir = 1) {
  for (const [acc, delta] of txEffects(t)) acc.balance = round2((Number(acc.balance) || 0) + dir * delta);
}
const round2 = (n) => Math.round(n * 100) / 100;

/* ---------------- Red: precios y tipos de cambio ---------------- */

async function getJSON(url, ms = 12000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

let refreshing = false;
// Si algo falla a mitad de camino, el botón Actualizar no queda trabado
async function refreshAll(opts) {
  if (refreshing) return;
  try { await refreshAllInner(opts); }
  catch (e) { console.warn(e); toast(`No se pudo actualizar todo: ${e.message}`, 4000); }
  finally { refreshing = false; const b = $('#refreshBtn'); if (b) b.disabled = false; }
}

async function refreshAllInner({ silent = false } = {}) {
  refreshing = true;
  const btn = $('#refreshBtn');
  btn.disabled = true;
  const notes = [];
  let updated = 0;
  const now = new Date().toISOString();

  // Cripto y oro tokenizado: CoinGecko (sin clave)
  const cg = S.holdings.filter((h) => h.coingeckoId);
  if (cg.length) {
    try {
      const ids = [...new Set(cg.map((h) => h.coingeckoId.trim().toLowerCase()))].join(',');
      const j = await getJSON(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`);
      for (const h of cg) {
        const q = j[h.coingeckoId.trim().toLowerCase()];
        if (q && q.usd) { Object.assign(h, { price: q.usd, change24h: q.usd_24h_change ?? null, priceUpdated: now, priceSource: 'CoinGecko' }); updated++; }
        else notes.push(`${h.symbol}: ID de CoinGecko no encontrado`);
      }
    } catch (e) { notes.push('CoinGecko no respondió'); }
  }

  // Acciones y ETF: Finnhub (requiere clave gratuita)
  const stocks = S.holdings.filter((h) => !h.coingeckoId && h.symbol && h.assetType !== 'otro');
  if (stocks.length) {
    const key = String(S.settings.finnhubKey || '').trim();
    if (!key) notes.push('acciones/ETF sin precio automático (falta clave de Finnhub)');
    else {
      await Promise.all(stocks.map(async (h) => {
        try {
          const q = await getJSON(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(h.symbol.trim().toUpperCase())}&token=${encodeURIComponent(key)}`);
          if (q && q.c > 0) {
            Object.assign(h, { price: q.c, change24h: q.dp ?? null, priceUpdated: now, priceSource: 'Finnhub' }); updated++;
            // El cierre del día hábil anterior también se guarda (si ese día no se abrió la app)
            if (q.pc > 0 && q.t) {
              let p = q.t * 1000 - 864e5; // día hábil anterior (el lunes, el anterior es el viernes)
              while ([0, 6].includes(new Date(p).getDay())) p -= 864e5;
              logPrices(isoOf(p), { [h.symbol]: q.pc }, { keep: true });
            }
          }
          else notes.push(`${h.symbol}: sin cotización en Finnhub`);
        } catch (e) { notes.push(`${h.symbol}: Finnhub no respondió`); }
      }));
    }
  }

  // Tipos de cambio
  if (S.settings.autoRates) {
    try {
      const j = await getJSON('https://open.er-api.com/v6/latest/USD');
      if (j && j.rates) {
        for (const [code] of CURRENCIES) if (j.rates[code] && !USD_PEGGED.has(code) && !(code === 'BOB' && S.settings.bobRateType === 'manual')) S.settings.rates[code] = j.rates[code];
        S.settings.ratesUpdated = now;
      }
    } catch (e) { notes.push('tipos de cambio no disponibles'); }
    if (S.settings.localCurrency === 'ARS' || S.accounts.some((a) => a.currency === 'ARS')) {
      try {
        const d = await getJSON(`https://dolarapi.com/v1/dolares/${S.settings.arsRateType || 'bolsa'}`);
        if (d && d.venta > 0) { S.settings.rates.ARS = d.venta; S.settings.ratesUpdated = now; }
      } catch (e) { notes.push('dólar ARS no disponible'); }
    }
    // Bolivia: oficial del BCB o el de Binance (USDT/BOB), que es el que se usa en la calle
    if (S.settings.bobRateType !== 'manual' && (S.settings.localCurrency === 'BOB' || S.accounts.some((a) => a.currency === 'BOB'))) {
      try {
        const list = await getJSON('https://bo.dolarapi.com/v1/dolares');
        const d = Array.isArray(list) && (list.find((x) => x.casa === (S.settings.bobRateType || 'binance')) || list[0]);
        if (d && d.venta > 0) { S.settings.rates.BOB = d.venta; S.settings.ratesUpdated = now; }
      } catch (e) { notes.push('dólar en Bolivia no disponible'); }
    }
  }

  // Rendimiento de Blend (donde Meru invierte tus USDC)
  if (S.accounts.some((a) => a.apySource === 'blend')) {
    try {
      const j = await getJSON(`https://yields.llama.fi/chart/${BLEND_USDC_POOL}`);
      const last = j?.data?.[j.data.length - 1];
      if (last && last.apy > 0) {
        S.settings.blendApy = last.apy;
        S.settings.blendUpdated = now;
        for (const a of S.accounts) if (a.apySource === 'blend') a.apy = round2(effectiveApy(a));
      }
    } catch (e) { notes.push('tasa de Meru/Blend no disponible'); }
  }
  accrueInterest();
  logRate();

  S.settings.lastRefresh = now;
  snapshot();
  save(false);
  render();
  btn.disabled = false;
  refreshing = false;
  syncPriceHistory();
  if (!silent || notes.length) toast(`Actualizado: ${updated} precio(s).` + (notes.length ? ' ' + notes.slice(0, 3).join(' · ') : ''), notes.length ? 6000 : 2500);
}

/* ---------------- UI helpers ---------------- */

let toastTimer;
// action = { label, fn }: agrega un botón (ej. "Deshacer") al aviso
// Una ventana abierta (formulario u hoja) tapa todo lo demás: el aviso se muestra adentro de la de más arriba
const topHost = () => $$('dialog[open]').filter((d) => !d.classList.contains('closing')).pop() || document.body;
const toTop = (el) => { const h = topHost(); if (el.parentNode !== h) h.append(el); };

// (si el aviso estaba adentro de una hoja que se volvió a dibujar, se perdió: se crea de nuevo)
const tipEl = () => document.getElementById('tip') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'tip', className: 'tip', hidden: true }));
const toastEl = () => $('#toast') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'toast', className: 'toast' }));

function toast(msg, ms = 2600, action) {
  const el = toastEl();
  el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
  toTop(el);
  setTimeout(() => toTop(el), 0); // por si el formulario que lo llamó se cierra justo después
  el.textContent = msg;
  if (action) {
    const b = document.createElement('button');
    b.className = 'toast-btn';
    b.textContent = action.label;
    b.onclick = () => { el.classList.remove('show'); action.fn(); };
    el.append(b);
  }
  el.classList.toggle('has-action', !!action);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// Tooltip para cualquier elemento con data-tip
document.addEventListener('mousemove', (e) => {
  const t = e.target.closest?.('[data-tip]');
  const tip = tipEl();
  if (!t) { if (!tip.dataset.owner) tip.hidden = true; return; }
  tip.dataset.owner = '';
  tip.innerHTML = t.dataset.tip;
  tip.hidden = false;
  placeTip(e.clientX, e.clientY);
});
function placeTip(x, y) {
  const tip = tipEl();
  toTop(tip);
  const w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = Math.min(x + 14, window.innerWidth - w - 8) + 'px';
  tip.style.top = (y + h + 20 > window.innerHeight ? y - h - 12 : y + 16) + 'px';
}

function confirmDlg(title, text, okLabel = 'Eliminar') {
  return new Promise((resolve) => {
    openForm({
      title, submitLabel: okLabel, danger: true,
      fields: [{ type: 'html', html: `<p style="margin:0">${text}</p>` }],
      onSubmit: () => { resolve(true); },
      onCancel: () => resolve(false),
    });
  });
}

/* Formulario genérico en diálogo
   field: {name,label,type,options,value,hint,placeholder,full,showIf(vals),required} */
function openForm({ title, fields, submitLabel = 'Guardar', onSubmit, onInput, onCancel, danger }) {
  const dlg = $('#dlg'), form = $('#dlgForm');
  const fieldHTML = (f) => {
    const id = 'f_' + f.name;
    const val = f.value ?? '';
    let input;
    switch (f.type) {
      case 'html': return `<div class="field full">${f.html}</div>`;
      case 'select':
        input = `<select id="${id}" name="${f.name}">${f.options.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`; break;
      case 'textarea': input = `<textarea id="${id}" name="${f.name}" placeholder="${esc(f.placeholder || '')}">${esc(val)}</textarea>`; break;
      case 'checkbox':
        // Toda la fila se puede tocar; el texto largo se acomoda al lado de la casilla
        return `<label class="field check full ${/^(remove|del)/.test(f.name) ? 'danger' : ''}" data-field="${f.name}"><input type="checkbox" id="${id}" name="${f.name}" ${val ? 'checked' : ''}>
          <span class="check-txt">${esc(f.label)}${f.hint ? `<small>${f.hint}</small>` : ''}</span></label>`;
      case 'number':
        input = `<input type="text" inputmode="decimal" autocomplete="off" id="${id}" name="${f.name}" value="${esc(val === 0 && f.blankZero ? '' : numInput(val))}" placeholder="${esc(f.placeholder || '0')}">`; break;
      case 'stepper':
        input = `<div class="stepper"><button type="button" class="step-btn" data-step="-1" data-for="${f.name}" aria-label="Menos ${f.step}">−</button>
          <input type="text" inputmode="decimal" autocomplete="off" id="${id}" name="${f.name}" value="${esc(numInput(val))}" placeholder="0">
          <button type="button" class="step-btn" data-step="1" data-for="${f.name}" aria-label="Más ${f.step}">+</button></div>
          ${f.chips?.length ? `<div class="amount-chips">${f.chips.map((c) => `<button type="button" class="chip" data-set="${c}" data-for="${f.name}">${esc(numInput(c))}</button>`).join('')}</div>` : ''}`; break;
      default:
        input = `<input type="${f.type || 'text'}" id="${id}" name="${f.name}" value="${esc(val)}" placeholder="${esc(f.placeholder || '')}" autocomplete="off">`;
    }
    return `<div class="field ${f.full ? 'full' : ''}" data-field="${f.name}"><label for="${id}">${esc(f.label)}</label>${input}${f.hint ? `<span class="hint">${f.hint}</span>` : ''}</div>`;
  };
  form.innerHTML = `<h2>${esc(title)}</h2><div class="fields">${fields.map(fieldHTML).join('')}</div>
    <p class="form-error" hidden></p>
    <div class="dlg-actions"><button type="button" class="btn ghost" data-close>Cancelar</button>
    <button type="submit" class="btn ${danger ? 'danger' : 'primary'}">${esc(submitLabel)}</button></div>`;

  const read = () => {
    const vals = {};
    for (const f of fields) {
      if (!f.name) continue;
      const el = form.elements[f.name];
      if (!el) continue;
      vals[f.name] = f.type === 'checkbox' ? el.checked : f.type === 'number' || f.type === 'stepper' ? parseNum(el.value) : el.value.trim();
    }
    return vals;
  };
  const update = (e) => {
    if (e && onInput) onInput(form, read(), e.target?.name);
    const vals = read();
    for (const f of fields) if (f.showIf) { const el = form.querySelector(`[data-field="${f.name}"]`); if (el) el.hidden = !f.showIf(vals); }
  };
  form.oninput = update; form.onchange = update; update();
  // − / + y montos rápidos de los campos "stepper"
  form.onclick = (e) => {
    const b = e.target.closest('[data-step], [data-set]');
    if (!b) return;
    const f = fields.find((x) => x.name === b.dataset.for), el = form.elements[b.dataset.for];
    if (!f || !el) return;
    const cur = parseNum(el.value) || 0;
    const next = b.dataset.set != null ? Number(b.dataset.set) : Math.max(0, Math.round((cur + Number(b.dataset.step) * (f.step || 1)) * 100) / 100);
    el.value = numInput(next);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    form.querySelectorAll(`[data-set][data-for="${f.name}"]`).forEach((c) => c.classList.toggle('on', Number(c.dataset.set) === next));
  };

  let done = false;
  form.onsubmit = (e) => {
    e.preventDefault();
    const vals = read();
    for (const f of fields) {
      const visible = !f.showIf || f.showIf(vals);
      if (!visible) continue;
      if (f.required && (vals[f.name] === '' || vals[f.name] == null)) return showErr(`Completá "${f.label}".`);
      if ((f.type === 'number' || f.type === 'stepper') && Number.isNaN(vals[f.name])) return showErr(`"${f.label}" no es un número válido.`);
    }
    const err = onSubmit(vals);
    if (err) return showErr(err);
    done = true;
    dlg.close();
  };
  const showErr = (m) => { const p = form.querySelector('.form-error'); p.textContent = m; p.hidden = false; };
  form.querySelector('[data-close]').onclick = () => dlg.close();
  dlg.onclose = () => { if (!done && onCancel) onCancel(); };
  dlg.showModal();
  form.querySelector('input:not([type=checkbox]), select, textarea')?.focus();
}

/* ---------------- Gráficos ---------------- */

function allocChart(t) {
  const items = ALLOC.map((a) => ({ ...a, v: Math.max(0, t.alloc[a.k] || 0) })).filter((a) => a.v > 0.005);
  const sum = items.reduce((s, a) => s + a.v, 0);
  if (!sum) return `<div class="empty">Cargá saldos o cantidades para ver la distribución.</div>`;
  const tipFor = (a) => esc(`<b>${a.label}</b><br>${fmtMoney(a.v)} · ${fmtPct((a.v / sum) * 100, false)}`);
  return `<div class="stack">${items.map((a) => `<div style="flex:${a.v};background:var(--c${a.c})" data-tip="${tipFor(a)}"></div>`).join('')}</div>
    <div class="list">${items.map((a) => `
      <div class="list-row" data-tip="${tipFor(a)}">
        <span class="swatch" style="background:var(--c${a.c})"></span>
        <span class="grow">${a.label}</span>
        <span class="val money">${fmtMoney(a.v)}</span>
        <span class="val muted" style="width:56px">${fmtPct((a.v / sum) * 100, false)}</span>
      </div>`).join('')}</div>`;
}

function hbars(entries, total) {
  if (!entries.length) return `<div class="empty">Sin gastos registrados este mes.</div>`;
  const max = Math.max(...entries.map((e) => e[1]));
  return `<div class="hbars">${entries.map(([k, v]) => {
    const tip = esc(`<b>${esc(k)}</b><br>${fmtMoney(v)} · ${fmtPct((v / total) * 100, false)} del mes`);
    return `<div class="hbar" data-tip="${tip}"><span class="lbl">${esc(k)}</span><div class="track"><div class="bar" style="width:${(v / max) * 100}%"></div></div><span class="v money">${fmtMoney(v)}</span></div>`;
  }).join('')}</div>`;
}

function niceTicks(min, max, n = 4) {
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const step0 = span / n;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) || 10 * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(v);
  return ticks;
}

function compact(v, cur) {
  const a = Math.abs(v);
  const n = a >= 1e9 ? (v / 1e9).toFixed(1) + 'B' : a >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : a >= 1e3 ? (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'k' : v.toFixed(0);
  return (cur === 'USD' ? 'US$' : CUR_SYMBOL[cur] ? CUR_SYMBOL[cur] + ' ' : '$') + n.replace('.', ',');
}

function drawLine(el, rows) {
  if (!el) return;
  if (rows.length < 2) {
    el.innerHTML = `<div class="empty" style="padding-top:70px">El historial se arma solo: cada día que abras la app se guarda tu patrimonio.<br>Volvé mañana para ver la primera línea.</div>`;
    return;
  }
  const cur = dispCur();
  const pts = rows.map((r) => ({ d: r.date, v: fromUSD(r.netWorth, cur) }));
  const W = el.clientWidth || 500, H = el.clientHeight || 220;
  const m = { l: 56, r: 12, t: 10, b: 24 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const vals = pts.map((p) => p.v);
  const ticks = niceTicks(Math.min(...vals), Math.max(...vals));
  const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const x = (i) => m.l + (i / (pts.length - 1)) * iw;
  const y = (v) => m.t + ih - ((v - y0) / (y1 - y0 || 1)) * ih;
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
  const area = `${path}L${x(pts.length - 1).toFixed(1)},${m.t + ih}L${m.l},${m.t + ih}Z`;
  const xl = [0, Math.floor((pts.length - 1) / 2), pts.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución del patrimonio neto">
    ${ticks.map((t) => `<line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}" stroke="var(--grid)" stroke-width="1"/>
      <text class="axis-txt" x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${compact(t, cur)}</text>`).join('')}
    ${xl.map((i) => `<text class="axis-txt" x="${x(i)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}">${fmtDate(pts[i].d)}</text>`).join('')}
    <path d="${area}" fill="var(--c1)" opacity="0.10"/>
    <path d="${path}" fill="none" stroke="var(--c1)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <line class="xh" y1="${m.t}" y2="${m.t + ih}" stroke="var(--axis)" stroke-width="1" visibility="hidden"/>
    <circle class="dot" r="5" fill="var(--c1)" stroke="var(--surface)" stroke-width="2" visibility="hidden"/>
    <rect x="${m.l}" y="0" width="${iw}" height="${H}" fill="transparent" class="hit"/>
  </svg>`;
  const svg = el.querySelector('svg'), xh = svg.querySelector('.xh'), dot = svg.querySelector('.dot'), tip = tipEl();
  const hit = svg.querySelector('.hit');
  hit.addEventListener('mousemove', (e) => {
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(pts.length - 1, Math.round(((px - m.l) / iw) * (pts.length - 1))));
    const p = pts[i];
    xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(p.v)); dot.setAttribute('visibility', 'visible');
    const prev = pts[i - 1];
    const ch = prev ? p.v - prev.v : null;
    tip.dataset.owner = 'line';
    tip.innerHTML = `<b>${fmtDate(p.d)}</b><br>${fmtIn(p.v, cur)}${ch != null ? `<br>${arrow(ch)}${fmtIn(ch, cur, { sign: true })} vs. anterior` : ''}`;
    tip.hidden = false;
    placeTip(e.clientX, e.clientY);
  });
  hit.addEventListener('mouseleave', () => { xh.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.dataset.owner = ''; tip.hidden = true; });
}

/* ---------------- Vistas ---------------- */

function tile(label, valueHTML, sub = '') {
  return `<section class="card tile"><div class="t-label">${label}</div><div class="t-value money">${valueHTML}</div><div class="t-sub">${sub}</div></section>`;
}

function viewResumen() {
  const t = totals();
  const other = dispCur() === 'USD' ? S.settings.localCurrency : 'USD';
  const prev = [...S.history].reverse().find((r) => r.date < todayISO());
  const delta = prev ? t.netWorth - prev.netWorth : null;
  const gp = t.invWithCost - t.cost;
  const missing = missingRates();
  const stale = !CloudSync.enabled() && (FileSync.status === 'none' || FileSync.status === 'unsupported') && hasData();
  const recent = [...S.transactions].sort(sortTx).slice(0, 5);
  // Pendientes: lo de esta semana + tus gastos programados del próximo mes (para que los veas venir)
  const pend = upcomingItems(31).filter((it) => it.schedId || it.undated || it.overdue || Date.parse(it.date) - Date.parse(todayISO()) <= 7 * 864e5).slice(0, 5);
  const holdings = [...S.holdings].sort((a, b) => holdingValue(b) - holdingValue(a));
  const accounts = [...S.accounts].sort((a, b) => Math.abs(toUSD(b.balance, b.currency)) - Math.abs(toUSD(a.balance, a.currency)));

  return `
  ${missing.length ? `<div class="banner">Falta el tipo de cambio de ${missing.join(', ')}. Tocá <b>Actualizar</b> o cargalo en <a href="#" data-action="go" data-id="dolar">Dólar</a>.</div>` : ''}
  ${stale ? `<div class="banner">Tus datos viven sólo en este dispositivo. <a href="#" data-action="go" data-id="respaldo">Activá la sincronización automática</a> para no perderlos.</div>` : ''}
  ${dueSoonBanner()}
  <section class="card hero">
    <div class="label">Patrimonio hoy${t.lent ? ' <span class="muted small">(sin lo prestado)</span>' : ''}</div>
    <div class="hero-value money">${fmtMoney(t.netWorth)}</div>
    <div class="sub"><span class="money">≈ ${fmtMoney(t.netWorth, { cur: other })}</span>
      ${delta != null ? ` · <span class="${cls(delta)} money">${arrow(delta)}${fmtMoney(delta, { sign: true })}</span> desde el ${fmtDate(prev.date)}` : ''}</div>
    ${t.lent ? `<div class="hero-split">
      <div><span class="muted small">Si te devuelven lo prestado</span><b class="money">${fmtMoney(t.netWorthWithLent)}</b></div>
      <div><span class="muted small">Te deben</span><b class="money up">+${fmtMoney(t.lent)}</b></div>
    </div>` : ''}
    ${quickActionsHTML()}
    ${favorites().length ? `<div class="favs-label">Rápidos: un toque y queda guardado</div>${favChipsHTML()}` : ''}
  </section>

  ${spendCardHTML()}
  ${runwayHTML()}

  ${pend.length ? `<section class="card"><div class="card-head" style="margin-bottom:4px"><h2>Pendientes</h2><a href="#" data-action="go" data-id="${pend.every((it) => it.schedId) ? 'programados' : 'fijos'}" class="small">Ver todo</a></div>
    <div class="list">${pend.map((it) => `<div class="list-row act">
      <span class="acc-ico sm ${it.type === 'ingreso' ? 'in' : ''}">${icon(it.kind === 'Tarjeta' ? 'card' : it.kind === 'Préstamo' ? 'handshake' : 'calendar', 16)}</span>
      <div class="grow"><div class="name">${esc(it.name)}</div><div class="meta">${it.undated ? 'Este mes' : `${it.schedId ? `${fmtDay(it.date)} · ` : ''}${daysUntil(it.date)}`}</div></div>
      <span class="money ${it.type === 'ingreso' ? 'up' : ''}">${it.type === 'ingreso' ? '+' : '−'}${fmtIn(it.amount, it.currency)}</span>
      ${it.recId ? `<button class="btn sm primary" data-action="payRecurring" data-id="${it.recId}">${it.type === 'ingreso' ? 'Ya entró' : 'Ya pagué'}</button>`
        : it.accId ? `<button class="btn sm primary" data-action="payCard" data-id="${it.accId}">Pagar</button>`
        : it.loanId ? `<button class="btn sm primary" data-action="loanPay" data-id="${it.loanId}">Registrar</button>`
        : it.schedId ? `<button class="btn sm primary" data-action="paySched" data-id="${it.schedId}">Ya pagué</button>` : ''}
    </div>`).join('')}</div></section>` : ''}

  <section class="card"><div class="card-head" style="margin-bottom:4px"><h2>Últimos movimientos</h2><a href="#" data-action="go" data-id="movimientos" class="small">Ver todos</a></div>
    ${txListHTML(recent)}</section>

  ${S.goals.length ? `<section class="card"><div class="card-head" style="margin-bottom:6px"><h2>Metas</h2><a href="#" data-action="go" data-id="metas" class="small">Ver metas</a></div>${goalsMiniHTML()}</section>` : ''}

  <details class="more-box" ${S.settings.resumenMore ? 'open' : ''} data-pref="resumenMore">
    <summary>Ver más: cuentas, inversiones y gráficos</summary>
    <div class="more-inner">
      <div class="tiles">
        ${tile('Liquidez', fmtMoney(t.liquid), 'Efectivo, bancos y billeteras')}
        ${tile('Inversiones', fmtMoney(t.inv), t.cost > 0 ? `<span class="${cls(gp)}">${arrow(gp)}${fmtMoney(gp, { sign: true })} (${fmtPct((gp / t.cost) * 100)})</span>` : `${S.holdings.length} activos`)}
        ${tile('Deuda de tarjetas', fmtMoney(t.debt), t.owed ? `Debés en préstamos: ${fmtMoney(t.owed)}` : 'Tarjetas de crédito')}
        ${tile('Te deben', fmtMoney(t.lent), 'Préstamos por cobrar')}
      </div>
      <section class="card"><div class="card-head"><h2>Cuentas</h2><a href="#" data-action="go" data-id="cuentas" class="small">Ver todo</a></div>
        <div class="list">${accounts.map((a) => `
          <div class="list-row">
            <span class="acc-ico sm">${accIcon(a)}</span>
            <div class="grow"><div class="name">${esc(a.name)}</div><div class="meta">${esc(ACCOUNT_TYPES[a.type]?.label)}${a.institution ? ' · ' + esc(a.institution) : ''}</div></div>
            <div class="val"><div class="money ${a.type === 'credito' && Number(a.balance) > 0 ? 'down' : ''}">${a.type === 'credito' && Number(a.balance) > 0 ? '−' : ''}${fmtIn(a.balance, a.currency)}</div>
            ${a.currency !== dispCur() ? `<div class="meta money">≈ ${fmtMoney(toUSD(a.balance, a.currency))}</div>` : ''}</div>
          </div>`).join('') || '<div class="empty">Sin cuentas</div>'}</div></section>
      ${fxCardHTML()}
      <div class="grid-2">
        <section class="card"><div class="card-head"><h2>Distribución</h2></div>${allocChart(t)}</section>
        <section class="card"><div class="card-head"><h2>Evolución del patrimonio</h2><span class="muted small">${dispCur()}</span></div><div id="nwChart" class="line-chart"></div></section>
      </div>
      <section class="card"><div class="card-head"><h2>Inversiones</h2><a href="#" data-action="go" data-id="inversiones" class="small">Ver todo</a></div>
        <div class="list">${holdings.map((h) => `
          <div class="list-row">
            <div class="grow"><div class="name">${esc(h.symbol)} <span class="muted small">${esc(h.name)}</span></div>
            <div class="meta">${fmtNum(h.quantity)} · ${h.change24h != null ? `<span class="${cls(h.change24h)}">${fmtPct(h.change24h)} 24h</span>` : 'sin variación'}</div></div>
            <div class="val"><div class="money">${fmtMoney(holdingValue(h))}</div><div class="meta">${t.inv ? fmtPct((holdingValue(h) / t.inv) * 100, false) : '—'}</div></div>
          </div>`).join('') || '<div class="empty">Sin inversiones</div>'}</div></section>
    </div>
  </details>`;
}

function viewInversiones() {
  const t = totals();
  const noKey = !S.settings.finnhubKey && S.holdings.some((h) => !h.coingeckoId && h.assetType !== 'otro');
  const rows = [...S.holdings].sort((a, b) => holdingValue(b) - holdingValue(a)).map((h) => {
    const v = holdingValue(h), c = holdingCost(h), g = v - c;
    const hasCost = Number(h.avgCost) > 0;
    const src = h.priceUpdated ? `${h.priceSource || 'manual'} · ${fmtDateTime(h.priceUpdated)}` : 'sin precio';
    return `<tr>
      <td><div class="sym">${esc(h.symbol)}</div><div class="muted small">${esc(h.name)}</div></td>
      <td><span class="tag">${ASSET_TYPES[h.assetType] || h.assetType}</span>${h.platform ? `<div class="muted small">${esc(h.platform)}</div>` : ''}</td>
      <td class="num money">${fmtNum(h.quantity)}</td>
      <td class="num" data-tip="${esc(src)}">${h.price ? fmtIn(h.price, 'USD') : '<span class="muted">—</span>'}</td>
      <td class="num ${cls(h.change24h)}">${fmtPct(h.change24h)}</td>
      <td class="num money"><b>${fmtMoney(v)}</b></td>
      <td class="num money">${hasCost ? fmtIn(h.avgCost, 'USD') : '<span class="muted">—</span>'}</td>
      <td class="num money ${hasCost ? cls(g) : ''}">${hasCost ? `${fmtMoney(g, { sign: true })}<div class="small">${fmtPct((g / c) * 100)}</div>` : '<span class="muted">—</span>'}</td>
      <td class="num">${t.inv ? fmtPct((v / t.inv) * 100, false) : '—'}</td>
      <td><div class="row-actions">
        <button class="btn sm" data-action="trade" data-id="${h.id}">Compra/Venta</button>
        <button class="btn sm" data-action="opsHist" data-id="${h.id}">Historial</button>
        <button class="btn sm ghost" data-action="editHolding" data-id="${h.id}">Editar</button>
        <button class="btn sm ghost danger" data-action="delHolding" data-id="${h.id}" title="Eliminar">✕</button>
      </div></td></tr>`;
  }).join('');
  const gp = t.invWithCost - t.cost;
  return `
  ${S.holdings.map((h) => positionWarnHTML(h)).join('')}
  ${noKey ? `<div class="banner">Bitcoin, Ethereum y PAXG se actualizan solos. Para que <b>VOO, NVDA y GOOGL</b> también se actualicen, pegá una clave gratuita de Finnhub en <a href="#" data-action="go" data-id="ajustes">Ajustes</a>. Mientras tanto podés cargar el precio a mano con “Editar”.</div>` : ''}
  <div class="tiles">
    ${tile('Valor del portafolio', fmtMoney(t.inv), `${S.holdings.length} activos`)}
    ${tile('Costo cargado', t.cost ? fmtMoney(t.cost) : '—', 'Según tu precio promedio de compra')}
    ${tile('Ganancia / pérdida', t.cost ? `<span class="${cls(gp)}">${fmtMoney(gp, { sign: true })}</span>` : '—', t.cost ? fmtPct((gp / t.cost) * 100) : 'Cargá el precio promedio para verla')}
    ${tile('Precios actualizados', `<span style="font-size:16px">${fmtDateTime(S.settings.lastRefresh)}</span>`, 'Tocá Actualizar para refrescar')}
  </div>
  <a href="#" class="link-row" data-action="go" data-id="miplan">${icon('shield', 18)}<span>Mi plan</span><span class="spacer"></span><span class="muted small">${(() => { const pr = planProfile(), g = Number(planOf().emergencyGoal) || 0, e = planAlloc().by.emergencia; return [pr ? `Perfil ${PLAN_LEVELS[pr.level].name.toLowerCase()}` : 'Definí tu perfil', g && e < g ? 'completá tu fondo de emergencia' : ''].filter(Boolean).join(' · '); })()}</span>${icon('right', 18)}</a>
  <section class="card">
    <div class="card-head"><h2>Mis posiciones</h2>
      <div class="toolbar"><button class="btn" data-action="go" data-id="ajustes" data-anchor="importar">Importar desde mi chat</button>
      <button class="btn primary" data-action="addHolding">+ Agregar activo</button></div></div>
    <div class="list show-sm">${[...S.holdings].sort((a, b) => holdingValue(b) - holdingValue(a)).map((h) => {
      const v = holdingValue(h), c = holdingCost(h), g = v - c, hasCost = Number(h.avgCost) > 0;
      return `<div class="hold-row">
        <div class="hold-top"><div class="grow"><div class="name"><b>${esc(h.symbol)}</b> <span class="muted small">${esc(h.name)}</span></div>
          <div class="meta">${fmtNum(h.quantity)} · ${esc(ASSET_TYPES[h.assetType] || h.assetType)}${h.platform ? ` · ${esc(h.platform)}` : ''}${h.change24h != null ? ` · <span class="${cls(h.change24h)}">${fmtPct(h.change24h)} hoy</span>` : ''}</div></div>
          <div class="val"><div class="money"><b>${fmtMoney(v)}</b></div>${hasCost ? `<div class="meta money ${cls(g)}">${fmtMoney(g, { sign: true })} (${fmtPct((g / c) * 100)})</div>` : ''}</div></div>
        <div class="row-actions" style="justify-content:flex-start">
          <button class="btn sm" data-action="trade" data-id="${h.id}">Compra/Venta</button>
        <button class="btn sm" data-action="opsHist" data-id="${h.id}">Historial</button>
          <button class="btn sm ghost" data-action="editHolding" data-id="${h.id}">Editar</button>
          <button class="btn sm ghost danger" data-action="delHolding" data-id="${h.id}" title="Eliminar">✕</button></div></div>`;
    }).join('') || '<div class="empty">Todavía no cargaste activos.</div>'}</div>
    <div class="table-wrap hide-sm"><table>
      <thead><tr><th>Activo</th><th>Tipo</th><th class="num">Cantidad</th><th class="num">Precio (USD)</th><th class="num">24h</th>
      <th class="num">Valor</th><th class="num">Precio prom.</th><th class="num">G/P</th><th class="num">% cartera</th><th></th></tr></thead>
      <tbody>${rows || `<tr><td colspan="10" class="empty">Todavía no cargaste activos.</td></tr>`}
      ${rows ? `<tr class="total"><td colspan="5">Total</td><td class="num money">${fmtMoney(t.inv)}</td><td></td><td class="num money ${cls(gp)}">${t.cost ? fmtMoney(gp, { sign: true }) : ''}</td><td class="num">100%</td><td></td></tr>` : ''}
      </tbody></table></div>
  </section>`;
}

// Cuentas sin saldo que nunca se usaron (ej. "Tarjeta 2" de ejemplo): se pueden quitar de un toque
function unusedAccounts() {
  // (las que configuraste con banco/entidad o rendimiento, como Meru, nunca se sugieren)
  return S.accounts.filter((a) => !Number(a.balance) && !a.institution && !(Number(a.apy) > 0)
    && !S.transactions.some((t) => t.accountId === a.id || t.toAccountId === a.id)
    && !S.recurring.some((r) => r.accountId === a.id)
    && !(S.loans || []).some((l) => l.accountId === a.id)
    && !(S.goals || []).some((g) => g.source === a.id));
}

function viewCuentas() {
  const groups = Object.entries(ACCOUNT_TYPES).map(([k, info]) => [k, info, S.accounts.filter((a) => a.type === k)]).filter(([, , list]) => list.length);
  const card = (a) => {
    const isCredit = a.type === 'credito';
    const bal = Number(a.balance) || 0;
    const usdEq = a.currency !== 'USD' ? `<div class="muted small money">≈ ${fmtIn(toUSD(bal, a.currency), 'USD')}</div>` : '';
    let extra = '';
    if (isCredit) {
      const lim = Number(a.creditLimit) || 0;
      extra = `<div class="acc-kv">
        <span>Límite</span><span class="money">${lim ? fmtIn(lim, a.currency) : '—'}</span>
        <span>Disponible</span><span class="money">${lim ? fmtIn(lim - bal, a.currency) : '—'}</span>
        <span>Cierre / vencimiento</span><span>${a.closingDay ? 'día ' + esc(a.closingDay) : '—'} / ${a.dueDay ? 'día ' + esc(a.dueDay) : '—'}</span></div>
        ${lim ? `<div class="meter" data-tip="${esc(`Usado: ${fmtPct((bal / lim) * 100, false)} del límite`)}"><div style="width:${Math.min(100, Math.max(0, (bal / lim) * 100))}%"></div></div>` : ''}`;
    }
    return `<section class="card acc-card">
      <div class="acc-top"><div class="acc-ico">${accIcon(a)}</div>
        <div style="flex:1;min-width:0"><div class="name" style="font-weight:600">${esc(a.name)}</div>
        <div class="muted small">${esc(a.institution || 'Sin entidad')}${a.last4 ? ' · •••• ' + esc(a.last4) : ''} · ${esc(a.currency)}</div></div></div>
      <div><div class="muted small">${isCredit ? 'Deuda actual' : 'Saldo'}</div>
        <div class="acc-bal money ${isCredit && bal > 0 ? 'down' : ''}">${fmtIn(bal, a.currency)}</div>${usdEq}</div>
      ${extra}
      ${!isCredit && effectiveApy(a) > 0 ? `<div class="apy-line">${icon('trending', 14)} <b>${fmtNum(effectiveApy(a), 2)}% APY</b>${a.apySource === 'blend' ? ' · automático' : ''}
        <span class="muted money">· ~${fmtIn(bal * effectiveApy(a) / 100 / 12, a.currency)}/mes</span></div>` : ''}
      ${a.notes ? `<div class="muted small">${esc(a.notes)}</div>` : ''}
      <div class="row-actions" style="justify-content:flex-start">
        <button class="btn sm" data-action="setBalance" data-id="${a.id}">${isCredit ? 'Actualizar deuda' : 'Actualizar saldo'}</button>
        ${isCredit ? `<button class="btn sm" data-action="payCard" data-id="${a.id}">Pagar</button>` : `<button class="btn sm" data-action="transferFrom" data-id="${a.id}">${icon('swap', 14)} Pasar</button>`}
        <button class="btn sm ghost" data-action="editAccount" data-id="${a.id}">Editar</button>
        <button class="btn sm ghost danger" data-action="delAccount" data-id="${a.id}" title="Eliminar">✕</button>
      </div></section>`;
  };
  const t = totals();
  return `
  <div class="tiles">
    ${tile('Liquidez total', fmtMoney(t.liquid), 'Todo menos tarjetas de crédito')}
    ${tile('Deuda de tarjetas', fmtMoney(t.debt), 'Suma de tarjetas de crédito')}
    ${tile('Liquidez neta', fmtMoney(t.liquid - t.debt), 'Liquidez − deudas')}
    ${tile('Cuentas', String(S.accounts.length), `${groups.length} tipo(s)`)}
  </div>
  ${unusedAccounts().length ? `<div class="banner">Tenés ${unusedAccounts().length} cuenta(s) que nunca usaste: <b>${unusedAccounts().map((a) => esc(a.name)).join(", ")}</b>. <a href="#" data-action="cleanAccounts">Quitarlas</a></div>` : ""}
  <div class="toolbar"><span class="muted small">Por seguridad guardá sólo los últimos 4 dígitos de cada tarjeta.</span><span class="spacer"></span>
    <button class="btn primary" data-action="addAccount">+ Agregar cuenta o tarjeta</button></div>
  ${groups.map(([k, info, list]) => `<div class="acc-group"><h3>${info.label}</h3><div class="acc-grid">${list.map(card).join('')}</div></div>`).join('')
    || '<div class="empty">No tenés cuentas cargadas.</div>'}
  <a href="#" class="link-row" data-action="go" data-id="prestamos">${icon('handshake', 18)}<span>Préstamos</span><span class="spacer"></span>${loanCountLabel()}${icon('right', 18)}</a>`;
}

/* ---------------- Ingresos y gastos fijos ----------------
   Con día fijo (ej. sueldo el 12): se registran solos ese día.
   Sin día (ej. la mesada o el gym): quedan "pendientes" hasta que tocás "Ya entró" / "Ya pagué". */

const daysInMonth = (ym) => new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0).getDate();
// Un fijo con "Se repite todos los meses" desmarcado queda guardado en la lista, pero no se registra ni se espera solo
const repeats = (r) => r.active !== false;
// Ingresos fijos que elegiste no contar (ej. una mesada que no sabés si llega) quedan fuera de "Hoy podés gastar"
const countsInPlan = (r) => r.countInPlan !== false;
// Ingreso seguro (llega sí o sí, ej. el sueldo) o "a veces" (la mesada, trabajos sueltos). Si no lo elegiste: la familia cuenta como "a veces"
const isSure = (r) => r.sure ?? !/mesada|familia|papa|mama/i.test(norm(`${r.category} ${r.name}`));
const recurringTx = (r, month) => S.transactions.find((t) => t.recurringId === r.id && t.date?.startsWith(month));

// Monto de la regla convertido a la moneda de la cuenta donde entra / sale
function recurringAmountFor(r, acc) {
  return acc ? convert(r.amount, r.currency, acc.currency) : r.amount;
}

function registerRecurring(r, { date, time, amount, accountId } = {}) {
  const acc = S.accounts.find((a) => a.id === (accountId || r.accountId)) || S.accounts.find((a) => a.type !== 'credito');
  if (!acc) return null;
  const amt = amount ?? recurringAmountFor(r, acc);
  if (amt == null) return null; // sin tipo de cambio no se registra (se reintenta al abrir con internet)
  const tx = {
    id: uid(), created: new Date().toISOString(), type: r.type, date: date || todayISO(), time: time || nowTime(),
    accountId: acc.id, amount: amt, category: r.category, note: r.name, recurringId: r.id,
  };
  S.transactions.push(tx);
  applyTx(tx, 1);
  return tx;
}

// Registra los fijos con día que ya vencieron (desde el mes en que los creaste)
function processRecurring() {
  const today = todayISO(), cur = currentMonth();
  const done = [];
  for (const r of S.recurring) {
    if (!r.day || !repeats(r)) continue;
    for (let m = r.startMonth || cur; m <= cur; m = addMonths(m, 1)) {
      const day = Math.min(Number(r.day), daysInMonth(m));
      const date = `${m}-${String(day).padStart(2, '0')}`;
      if (date > today || recurringTx(r, m) || (r.skip || []).includes(m)) continue;
      if (registerRecurring(r, { date, time: '09:00' })) done.push(r.name);
    }
  }
  if (done.length) {
    snapshot(); save();
    setTimeout(() => toast(`Registré automáticamente: ${[...new Set(done)].map((x) => { const k = done.filter((y) => y === x).length; return k > 1 ? `${x} (×${k})` : x; }).join(', ')}.`, 4500), 600);
  }
}

const pendingRecurring = (month = currentMonth()) => S.recurring.filter((r) => repeats(r) && !r.day && !recurringTx(r, month));

// Sugerencias para crear fijos con un toque (útil cuando recién empezás)
const RECURRING_PRESETS = [
  { type: 'ingreso', name: 'Sueldo', category: 'Sueldo' },
  { type: 'ingreso', name: 'Mesada', category: 'Mesada / familia' },
  { type: 'gasto', name: 'Alquiler', category: 'Vivienda / alquiler' },
  { type: 'gasto', name: 'Luz', category: 'Servicios' },
  { type: 'gasto', name: 'Agua', category: 'Servicios' },
  { type: 'gasto', name: 'Internet', category: 'Servicios' },
  { type: 'gasto', name: 'Celular', category: 'Servicios' },
  { type: 'gasto', name: 'Gimnasio', category: 'Gimnasio / deporte' },
  { type: 'gasto', name: 'Suscripción', category: 'Suscripciones' },
  { type: 'gasto', name: 'Universidad', category: 'Educación' },
];

function recurringRowHTML(r, month) {
  const isCur = month === currentMonth();
  const on = repeats(r);
  const tx = recurringTx(r, month);
  const acc = S.accounts.find((a) => a.id === r.accountId);
  let status = '';
  if (tx) status = `<span class="status good">${icon('check', 14)} ${r.type === 'ingreso' ? 'Entró' : 'Pagado'} el ${fmtDate(tx.date).slice(0, 5)}</span>`;
  else if (!on) status = isCur ? `<button class="btn sm" data-action="payRecurring" data-id="${r.id}">Registrar este mes</button>` : '';
  else if (r.day) status = `<span class="status neutral">Se registra solo el día ${r.day}</span>`;
  else if (isCur) status = `<button class="btn sm primary" data-action="payRecurring" data-id="${r.id}">${r.type === 'ingreso' ? 'Ya entró' : 'Ya pagué'}</button>`;
  else status = '<span class="status warning">No registrado</span>';
  return `<div class="list-row act rec-row ${on ? '' : 'off'}">
    <label class="rec-check" title="Se repite todos los meses"><input type="checkbox" data-repeat="${r.id}" ${on ? 'checked' : ''}><span></span></label>
    <div class="grow"><div class="name">${esc(r.name)}</div>
      <div class="meta">${on ? (r.day ? `Todos los ${r.day}` : 'Cada mes, sin día fijo') : 'No se repite'}${r.type === 'ingreso' ? (isSure(r) ? ' · seguro' : ' · a veces') : ''}${r.type === 'ingreso' && on && !countsInPlan(r) ? ' · no se cuenta' : ''} · ${esc(acc?.name || 'sin cuenta')}</div></div>
    <div class="val"><div class="money ${r.type === 'ingreso' ? 'up' : ''}">${r.type === 'ingreso' ? '+' : '−'}${fmtIn(r.amount, r.currency)}</div></div>
    ${status}
    <button class="btn sm ghost icon-only" data-action="editRecurring" data-id="${r.id}" title="Editar">${icon('settings', 16)}</button>
  </div>`;
}

function recurringHTML(month) {
  const presets = `<div class="rec-presets"><span class="muted small">Agregar rápido:</span>${RECURRING_PRESETS
    .filter((p) => !S.recurring.some((r) => norm(r.name) === norm(p.name)))
    .map((p, i) => `<button class="chip ${p.type}" data-action="addRecurringPreset" data-id="${RECURRING_PRESETS.indexOf(p)}">${p.type === 'ingreso' ? '+' : '−'} ${esc(p.name)}</button>`).join('')}
    <button class="chip" data-action="addRecurring">Otro…</button></div>`;
  if (!S.recurring.length) {
    return `<div class="empty" style="padding:8px 0 12px">Agregá lo que entra o sale todos los meses (sueldo, alquiler, luz…).
      La app lo tiene en cuenta para decirte cuánto podés gastar.</div>${presets}`;
  }
  const byType = (list) => [...list].sort((a, b) => (a.type === b.type ? 0 : a.type === 'ingreso' ? -1 : 1));
  const on = byType(S.recurring.filter(repeats)), off = byType(S.recurring.filter((r) => !repeats(r)));
  const inc = on.filter((r) => r.type === 'ingreso').reduce((s, r) => s + toUSD(r.amount, r.currency), 0);
  const out = on.filter((r) => r.type === 'gasto').reduce((s, r) => s + toUSD(r.amount, r.currency), 0);
  return `<div class="small muted" style="margin-bottom:6px">La casilla marcada = se repite todos los meses.</div>
    <div class="list">${on.map((r) => recurringRowHTML(r, month)).join('') || '<div class="empty">Ninguno marcado para repetirse.</div>'}</div>
    ${on.length ? `<div class="small muted" style="margin-top:10px">Cada mes: entran <b class="money">${fmtMoney(inc)}</b>, salen <b class="money">${fmtMoney(out)}</b> → te quedan <b class="money">${fmtMoney(inc - out)}</b>.</div>` : ''}
    ${off.length ? `<div class="rec-sub">Guardados (no se repiten)</div><div class="list">${off.map((r) => recurringRowHTML(r, month)).join('')}</div>` : ''}
    ${presets}`;
}

function recurringForm(r, preset = null) {
  const isNew = !r;
  r = r || { type: 'gasto', name: '', amount: '', currency: S.settings.localCurrency, accountId: S.accounts.find((a) => a.type !== 'credito')?.id, category: '', day: null, ...(preset || {}) };
  const accOpts = S.accounts.map((a) => [a.id, `${a.name} (${curLabel(a.currency)})`]);
  openForm({
    title: isNew ? 'Nuevo ingreso o gasto fijo' : `Editar: ${r.name}`,
    fields: [
      { name: 'type', label: 'Tipo', type: 'select', value: r.type, options: [['ingreso', 'Ingreso fijo (sueldo, mesada…)'], ['gasto', 'Gasto fijo (gym, alquiler…)']], full: true },
      { name: 'name', label: 'Nombre', value: r.name, required: true, placeholder: 'ej. Sueldo, Mesada de papá, Gimnasio', full: true },
      { name: 'amount', label: 'Monto por mes', type: 'number', value: r.amount, required: true },
      { name: 'currency', label: 'Moneda', type: 'select', value: r.currency, options: CURRENCIES.map(([c, n]) => [c, `${curLabel(c)} — ${n}`]) },
      { name: 'accountId', label: 'Cuenta', type: 'select', value: r.accountId, options: accOpts, full: true },
      { name: 'catGasto', label: 'Categoría', type: 'select', value: r.category, options: catsOf('gasto').map((c) => [c, c]), showIf: (v) => v.type === 'gasto' },
      { name: 'catIngreso', label: 'Categoría', type: 'select', value: r.category, options: catsOf('ingreso').map((c) => [c, c]), showIf: (v) => v.type === 'ingreso' },
      { name: 'day', label: 'Día del mes', value: r.day || '', placeholder: 'Vacío = sin día fijo', hint: 'Con día: se registra solo. Sin día: te queda pendiente para marcar cuando pase.' },
      { name: 'active', label: 'Se repite todos los meses', type: 'checkbox', value: repeats(r), full: true, hint: 'Desmarcalo si no es todos los meses: queda guardado para registrarlo cuando pase.' },
      { name: 'countInPlan', label: 'Contarlo en "Hoy podés gastar" (apagalo si no sabés si va a llegar)', type: 'checkbox', value: r.countInPlan !== false, full: true, showIf: (v) => v.type === 'ingreso' },
      { name: 'sure', label: 'Es seguro (llega sí o sí todos los meses, como un sueldo)', type: 'checkbox', value: isSure(r), full: true, showIf: (v) => v.type === 'ingreso' },
      ...(isNew ? [] : [{ name: 'remove', label: 'Eliminar este fijo (los movimientos ya registrados quedan)', type: 'checkbox', full: true }]),
    ],
    onSubmit: (v) => {
      if (v.remove) { S.recurring = S.recurring.filter((x) => x !== r); tombstone(r.id); save(); render(); return; }
      const day = v.day ? Number(v.day) : null;
      if (day != null && !(Number.isInteger(day) && day >= 1 && day <= 31)) return 'El día tiene que ser un número entero del 1 al 31.';
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      const next = { type: v.type, name: v.name, amount: v.amount, currency: v.currency, accountId: v.accountId,
        category: v.type === 'gasto' ? v.catGasto : v.catIngreso, day, countInPlan: v.type === 'ingreso' ? !!v.countInPlan : true, active: !!v.active, sure: v.type === 'ingreso' ? !!v.sure : undefined };
      // Al crear un fijo o cambiarle el día, sólo se registra solo desde el próximo vencimiento
      // (si el día de este mes ya pasó, ya lo tenés en tu saldo; marcalo a mano si hace falta)
      if (isNew || day !== r.day || (next.active && !repeats(r))) next.startMonth = day && day < new Date().getDate() ? addMonths(currentMonth(), 1) : currentMonth();
      if (isNew) S.recurring.push({ id: uid(), ...next }); else Object.assign(r, next);
      processRecurring();
      save(); render();
    },
  });
}

// "Ya entró" / "Ya pagué": se confirma con el monto real (la mesada puede variar)
function payRecurringForm(r) {
  const acc = S.accounts.find((a) => a.id === r.accountId) || S.accounts.find((a) => a.type !== 'credito');
  openForm({
    title: r.type === 'ingreso' ? `¿Cuánto entró de ${r.name}?` : `Pago de ${r.name}`,
    fields: [
      { name: 'accountId', label: 'Cuenta', type: 'select', value: acc?.id, full: true, options: S.accounts.map((a) => [a.id, `${a.name} (${curLabel(a.currency)})`]) },
      { name: 'amount', label: 'Monto (en la moneda de la cuenta)', type: 'stepper', step: stepFor(r.amount), value: recurringAmountFor(r, acc), required: true, full: true },
      { name: 'date', label: 'Fecha', type: 'date', value: todayISO() },
      { name: 'time', label: 'Hora', type: 'time', value: nowTime() },
    ],
    submitLabel: r.type === 'ingreso' ? 'Registrar ingreso' : 'Registrar pago',
    // Si cambiás de cuenta (ej. de dólares a bolivianos), el monto se convierte
    onInput: (form, v, changed) => {
      if (changed !== 'accountId') return;
      const a = S.accounts.find((x) => x.id === v.accountId);
      if (a) form.elements.amount.value = numInput(recurringAmountFor(r, a));
    },
    onSubmit: (v) => {
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      registerRecurring(r, { date: v.date, time: v.time, amount: v.amount, accountId: v.accountId });
      snapshot(); save(); render();
      toast(`${r.name}: registrado ✓`);
    },
  });
}


/* ---------------- Gastos programados (de una sola vez, con fecha) ---------------- */
// ej. la cuota de la fraternidad el jueves que te toca: se descuenta de "Hoy podés gastar" el mes en que cae.
// Queda pagado cuando hay un movimiento con su scheduledId (así funciona igual al sincronizar o al borrar el movimiento)
const schedTx = (s) => S.transactions.find((t) => t.scheduledId === s.id);
const isFixedTx = (t) => !!(t.recurringId || t.scheduledId);
const monthEndISO = (m) => `${m}-${String(daysInMonth(m)).padStart(2, '0')}`;
const schedPending = () => (S.scheduled || []).filter((s) => !schedTx(s)).sort((a, b) => a.date.localeCompare(b.date));
// Sin pagar que caen este mes o ya vencieron: se reservan en el presupuesto de este mes
const schedDueThisMonth = () => schedPending().filter((s) => s.date <= monthEndISO(currentMonth()));
const fmtDay = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace(',', '').replace('-', '/');
// Paso del − / +: Bs 300 sube de a 5, Bs 1.500 de a 10…
const stepFor = (a) => ((a = Math.abs(Number(a) || 0)) >= 2000 ? 50 : a >= 500 ? 10 : a >= 50 ? 5 : 1);
// Montos rápidos entre el mínimo y el máximo (ej. 280 · 285 · 290 · 295 · 300)
function rangeChips(min, max) {
  min = Number(min); max = Number(max);
  if (!(min > 0) || !(max > min)) return [];
  const step = stepFor(max);
  const out = new Set();
  for (let i = 0; i <= 4; i++) out.add(Math.round((min + ((max - min) * i) / 4) / step) * step);
  return [...out].filter((v) => v >= min && v <= max);
}
const schedAmountLabel = (s) => (Number(s.minAmount) > 0 && Number(s.minAmount) < Number(s.amount) ? `${curLabel(s.currency)} ${numInput(s.minAmount)} a ${numInput(s.amount)}` : fmtIn(s.amount, s.currency));

function scheduledForm(s, preset = null) {
  const isNew = !s;
  s = s || { name: '', amount: '', currency: S.settings.localCurrency, date: '', category: 'Otros gastos',
    accountId: S.settings.defaultAccountId || S.accounts.find((a) => a.type !== 'credito')?.id, ...(preset || {}) };
  openForm({
    title: isNew ? 'Programar un gasto' : `Editar: ${s.name}`,
    fields: [
      ...(isNew ? [{ type: 'html', html: '<div class="small muted">Un gasto de una sola vez con fecha (tu turno en la fraternidad, una matrícula, un cumpleaños…). El mes en que cae se descuenta de "Hoy podés gastar", así te lo vas guardando.</div>' }] : []),
      { name: 'name', label: 'Qué es', value: s.name, required: true, placeholder: 'ej. Turno fraternidad', full: true },
      { name: 'date', label: 'Fecha', type: 'date', value: s.date, required: true },
      { name: 'amount', label: 'Monto (si varía, el más alto)', type: 'stepper', step: stepFor(s.amount || 100), value: s.amount, required: true },
      { name: 'minAmount', label: '¿Varía? Desde (opcional)', type: 'number', value: s.minAmount || '', placeholder: 'ej. 280', hint: 'Se reserva el más alto; al pagar elegís el real.' },
      { name: 'currency', label: 'Moneda', type: 'select', value: s.currency, options: CURRENCIES.map(([c, n]) => [c, `${curLabel(c)} — ${n}`]) },
      { name: 'accountId', label: 'Lo pagás desde', type: 'select', value: s.accountId, options: S.accounts.map((a) => [a.id, `${a.name} (${curLabel(a.currency)})`]) },
      { name: 'category', label: 'Categoría', type: 'select', value: s.category, options: catsOf('gasto').map((c) => [c, c]), full: true },
      ...(isNew ? [] : [{ name: 'remove', label: 'Eliminar (si ya lo pagaste, el movimiento queda)', type: 'checkbox', full: true }]),
    ],
    submitLabel: isNew ? 'Programar' : 'Guardar',
    onSubmit: (v) => {
      if (v.remove) { S.scheduled = S.scheduled.filter((x) => x !== s); tombstone(s.id); save(); render(); return; }
      if (!v.date) return 'Elegí la fecha.';
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      if (v.minAmount && !(v.minAmount < v.amount)) return 'El "desde" tiene que ser menor que el monto.';
      const next = { name: v.name, date: v.date, amount: v.amount, minAmount: v.minAmount > 0 ? v.minAmount : null, currency: v.currency, accountId: v.accountId, category: v.category };
      if (isNew) S.scheduled.push({ id: uid(), ...next }); else Object.assign(s, next);
      save(); render();
      if (isNew) toast(`Programado: ${v.name} el ${fmtDay(v.date)}`);
    },
  });
}

// "Ya pagué": se registra con el monto real (ej. Bs 285 aunque programaste 300)
function paySchedForm(s) {
  const acc = S.accounts.find((a) => a.id === s.accountId) || S.accounts.find((a) => a.type !== 'credito');
  const amountIn = (a) => (a ? convert(s.amount, s.currency, a.currency) : null);
  openForm({
    title: `Pago de ${s.name}`,
    fields: [
      { name: 'accountId', label: 'Cuenta', type: 'select', value: acc?.id, full: true, options: S.accounts.map((a) => [a.id, `${a.name} (${curLabel(a.currency)})`]) },
      { name: 'amount', label: 'Cuánto pagaste (en la moneda de la cuenta)', type: 'stepper', step: stepFor(s.amount), value: amountIn(acc) ?? '', required: true, full: true,
        chips: acc?.currency === s.currency ? rangeChips(s.minAmount, s.amount) : [] },
      { name: 'date', label: 'Fecha', type: 'date', value: todayISO() },
      { name: 'time', label: 'Hora', type: 'time', value: nowTime() },
    ],
    submitLabel: 'Registrar pago',
    onInput: (form, v, changed) => {
      if (changed !== 'accountId') return;
      const a = S.accounts.find((x) => x.id === v.accountId);
      const amt = amountIn(a);
      if (amt != null) form.elements.amount.value = numInput(amt);
    },
    onSubmit: (v) => {
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      const tx = { id: uid(), created: new Date().toISOString(), type: 'gasto', date: v.date || todayISO(), time: v.time || nowTime(),
        accountId: v.accountId, amount: v.amount, category: s.category, note: s.name, scheduledId: s.id };
      S.transactions.push(tx);
      applyTx(tx, 1);
      snapshot(); save(); render();
      // Para la fraternidad: cuando sepas tu próximo turno, lo cargás con el mismo nombre y monto
      toast(`${s.name}: pagado ✓`, 7000, { label: 'Programar el próximo', fn: () => scheduledForm(null, { name: s.name, amount: s.amount, minAmount: s.minAmount, currency: s.currency, accountId: s.accountId, category: s.category }) });
    },
  });
}

// Cambiar sólo el monto (ej. este turno sale 290 en vez de 300)
function schedAmountForm(s) {
  openForm({
    title: `Monto de ${s.name}`,
    fields: [
      { name: 'amount', label: `Monto (${curLabel(s.currency)})`, type: 'stepper', step: stepFor(s.amount), value: s.amount, required: true, full: true, chips: rangeChips(s.minAmount, s.amount) },
      { type: 'html', html: '<div class="small muted">Es lo que se reserva de tu presupuesto. Al pagar ponés lo que salió de verdad.</div>' },
    ],
    onSubmit: (v) => {
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      if (Number(s.minAmount) >= v.amount) s.minAmount = null;
      s.amount = v.amount;
      save(); render();
      toast(`${s.name}: ${fmtIn(v.amount, s.currency)}`);
    },
  });
}

function schedRowHTML(s) {
  const tx = schedTx(s);
  const acc = S.accounts.find((a) => a.id === s.accountId);
  const late = !tx && s.date < todayISO();
  const soon = !tx && !late && Math.round((Date.parse(s.date) - Date.parse(todayISO())) / 864e5) <= 3;
  const status = tx ? `<span class="status good">${icon('check', 14)} Pagado el ${fmtDate(tx.date).slice(0, 5)}</span>`
    : `<button class="btn sm primary" data-action="paySched" data-id="${s.id}">Ya pagué</button>`;
  return `<div class="list-row act rec-row ${tx ? 'off' : ''}">
    <span class="acc-ico sm">${icon('calendar', 16)}</span>
    <div class="grow"><div class="name">${esc(s.name)}</div>
      <div class="meta">${fmtDay(s.date)}${tx ? '' : ` · <b class="${late || soon ? 'warn-text' : ''}">${daysUntil(s.date)}</b>`} · ${esc(acc?.name || 'sin cuenta')}</div></div>
    <div class="val">${tx ? `<div class="money">−${fmtIn(tx.amount, S.accounts.find((a) => a.id === tx.accountId)?.currency || s.currency)}</div>`
      : `<button class="amt-btn money" data-action="schedAmount" data-id="${s.id}" title="Cambiar monto">−${schedAmountLabel(s)} ${icon('edit', 13)}</button>`}</div>
    ${status}
    <button class="btn sm ghost icon-only" data-action="editSched" data-id="${s.id}" title="Editar">${icon('settings', 16)}</button>
  </div>`;
}

function schedHTML() {
  const pend = schedPending();
  const paid = (S.scheduled || []).filter(schedTx).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  if (!pend.length && !paid.length) {
    return '<div class="empty" style="padding:8px 0 4px">Cargá gastos de una sola vez que ya sabés que vienen (ej. tu turno en la fraternidad el jueves 19). La app los descuenta de "Hoy podés gastar" el mes en que caen.</div>';
  }
  const due = schedDueThisMonth().reduce((t, s) => t + toUSD(s.amount, s.currency), 0);
  return `<div class="list">${pend.map(schedRowHTML).join('') || '<div class="empty">No tenés gastos programados pendientes.</div>'}</div>
    ${due > 0 ? `<div class="small muted" style="margin-top:10px">Este mes se reservan <b class="money">${fmtIn(fromUSD(due, S.settings.localCurrency), S.settings.localCurrency)}</b> de tu presupuesto para estos pagos.</div>` : ''}
    ${paid.length ? `<div class="rec-sub">Ya pagados</div><div class="list">${paid.map(schedRowHTML).join('')}</div>` : ''}`;
}
/* ---------------- Movimientos ---------------- */

let lastMonthly = null;
let dayOpened = ''; // día en que se calcularon intereses y fijos (para actualizar si la app queda abierta hasta el otro día)

// Gastos de los últimos 6 meses (para comparar el mes elegido con los anteriores)
function monthlySeries(month, n = 6) {
  return Array.from({ length: n }, (_, i) => {
    const m = addMonths(month, i - n + 1);
    return { m, ...monthStats(m) };
  });
}

function drawMonthly(el, data) {
  if (!el) return;
  const cur = dispCur();
  const vals = data.series.map((p) => fromUSD(p.expense, cur));
  const max = Math.max(0, ...vals);
  if (!max) { el.innerHTML = '<div class="empty" style="padding-top:60px">Todavía no hay gastos para comparar.</div>'; return; }
  const W = el.clientWidth || 500, H = el.clientHeight || 200;
  const m = { l: 56, r: 6, t: 12, b: 24 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const ticks = niceTicks(0, max);
  const top = ticks[ticks.length - 1];
  const y = (v) => m.t + ih - (v / top) * ih;
  const gw = iw / vals.length, bw = Math.max(6, Math.min(36, gw * 0.55));
  const prev = vals.slice(0, -1).filter((v) => v > 0);
  const avg = prev.length ? prev.reduce((s, v) => s + v, 0) / prev.length : 0;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gastos por mes">
    ${ticks.map((t) => `<line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}" stroke="var(--grid)"/><text class="axis-txt" x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${compact(t, cur)}</text>`).join('')}
    ${vals.map((v, i) => {
      const x = m.l + gw * i + (gw - bw) / 2;
      const sel = i === vals.length - 1;
      return `<g class="mbar" data-i="${i}">
        <rect x="${m.l + gw * i}" y="${m.t}" width="${gw}" height="${ih}" fill="transparent"/>
        ${v > 0 ? `<path d="${roundedBar(x, y(v), bw, m.t + ih - y(v))}" fill="var(--c2)" fill-opacity="${sel ? 1 : 0.38}"/>` : ''}
        <text class="axis-txt" x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" ${sel ? 'style="fill:var(--text);font-weight:600"' : ''}>${monthLabel(data.series[i].m)}</text></g>`;
    }).join('')}
    ${avg ? `<line x1="${m.l}" x2="${W - m.r}" y1="${y(avg)}" y2="${y(avg)}" stroke="var(--text-2)" stroke-dasharray="4 4"/>
      <text class="axis-txt" x="${W - m.r}" y="${y(avg) - 5}" text-anchor="end">promedio ${compact(avg, cur)}</text>` : ''}
    <line x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}" stroke="var(--axis)"/>
  </svg>`;
  const tip = tipEl();
  $$('.mbar', el).forEach((g) => {
    g.addEventListener('mousemove', (e) => {
      const p = data.series[+g.dataset.i];
      tip.dataset.owner = 'monthly';
      tip.innerHTML = `<b>${monthLabel(p.m, 'long')} ${p.m.slice(0, 4)}</b><br>Gastos: ${fmtMoney(p.expense)}<br>Ingresos: ${fmtMoney(p.income)}${avg ? `<br>${fmtPct((fromUSD(p.expense, cur) / avg - 1) * 100)} vs. promedio` : ''}`;
      tip.hidden = false;
      placeTip(e.clientX, e.clientY);
    });
    g.addEventListener('mouseleave', () => { tip.dataset.owner = ''; tip.hidden = true; });
  });
}

// Cada categoría: este mes vs. el promedio de los 3 meses anteriores
function categoryCompareHTML(month) {
  const now = monthStats(month).byCat;
  const prevMonths = [1, 2, 3].map((k) => monthStats(addMonths(month, -k)));
  const active = prevMonths.filter((p) => p.expense > 0).length;
  const avg = {};
  for (const p of prevMonths) for (const [c, v] of Object.entries(p.byCat)) avg[c] = (avg[c] || 0) + v / Math.max(1, active);
  const cats = [...new Set([...Object.keys(now), ...Object.keys(avg)])].sort((a, b) => (now[b] || 0) - (now[a] || 0));
  if (!cats.length) return '<div class="empty">Sin gastos todavía.</div>';
  const max = Math.max(...cats.map((c) => Math.max(now[c] || 0, avg[c] || 0)));
  return `<div class="cmp">${cats.map((c) => {
    const a = now[c] || 0, b = avg[c] || 0;
    const ch = b > 0 ? (a / b - 1) * 100 : null;
    return `<div class="cmp-row">
      <div class="cmp-top"><span>${esc(c)}</span><span class="money"><b>${fmtMoney(a)}</b>${active ? ` <span class="muted small">vs ${fmtMoney(b)}</span>` : ''}</span>
        ${ch != null ? `<span class="small ${ch > 5 ? 'down' : ch < -5 ? 'up' : 'muted'}">${arrow(ch)}${fmtPct(Math.abs(ch), false)}</span>` : '<span class="small muted">nuevo</span>'}</div>
      <div class="cmp-bars"><div class="b now" style="width:${(a / max) * 100}%"></div>${active ? `<div class="b avg" style="width:${(b / max) * 100}%"></div>` : ''}</div>
    </div>`;
  }).join('')}</div>
  ${active ? '<div class="legend small" style="margin-top:10px"><span><i class="swatch" style="background:var(--c2)"></i>Este mes</span><span><i class="swatch" style="background:var(--axis)"></i>Promedio 3 meses anteriores</span></div>' : ''}`;
}

function viewMovimientos() {
  const month = S.settings.txMonth || currentMonth();
  const accFilter = S.settings.txAccount || '';
  lastMonthly = { series: monthlySeries(month) };
  const list = S.transactions
    .filter((t) => t.date?.startsWith(month) && (!accFilter || t.accountId === accFilter || t.toAccountId === accFilter))
    .sort(sortTx);
  const isCur = month === currentMonth();
  const pendN = isCur ? pendingRecurring(month).length : 0;
  const ml = monthLabel(month, 'long');
  return `
  <div class="month-nav">
    <button class="q-icon" data-action="monthShift" data-id="-1" aria-label="Mes anterior">${icon('left', 20)}</button>
    <b>${ml[0].toUpperCase() + ml.slice(1)} ${month.slice(0, 4)}</b>
    <button class="q-icon" data-action="monthShift" data-id="1" aria-label="Mes siguiente" ${isCur ? 'disabled' : ''}>${icon('right', 20)}</button>
  </div>
  <section class="card">
    ${monthSummaryHTML(month)}
    ${quickActionsHTML()}
    <div class="sub-actions">
      <button class="link-btn" data-action="addTx" data-id="transferencia">${icon('swap', 14)} Pasar plata entre cuentas</button>
      <button class="link-btn" data-action="addSched">${icon('calendar', 14)} Programar un gasto</button>
      ${month < currentMonth() ? `<button class="link-btn" data-action="monthClose" data-id="${month}">${icon('calendar', 14)} Cierre del mes</button>` : ''}
    </div>
  </section>

  <section class="card">
    <div class="card-head" style="margin-bottom:4px"><h2>Movimientos</h2>
      <label class="filter">Ver<select id="txAccount" aria-label="Filtrar por cuenta"><option value="">Todas las cuentas</option>${S.accounts.map((a) => `<option value="${a.id}" ${a.id === accFilter ? 'selected' : ''}>Sólo ${esc(a.name)}</option>`).join('')}</select></label></div>
    ${txListHTML(list)}
  </section>

  <div class="shortcuts">
    ${shortcutHTML('fijos', pendN ? `${pendN} pendiente${pendN > 1 ? 's' : ''}` : `${S.recurring.filter(repeats).length} activos`, pendN)}
    ${shortcutHTML('programados', schedPending().length ? `${schedPending().length} pendiente${schedPending().length > 1 ? 's' : ''}` : 'Ninguno pendiente', schedPending().length)}
    ${shortcutHTML('analisis', 'Gráficos del mes')}
    ${shortcutHTML('presupuesto', Object.keys(S.budgets).length ? `${Object.keys(S.budgets).length} topes` : 'Sin topes')}
  </div>`;
}

// Acceso directo a otra sección (ej. desde Movimientos o Plan)
function shortcutHTML(view, sub, warn = false) {
  const it = MORE_GROUPS.flatMap(([, l]) => l).find(([v]) => v === view);
  return `<button class="shortcut" data-action="go" data-id="${view}">
    <span class="sc-ico">${icon(it[2], 20)}</span>
    <span class="sc-txt"><b>${it[1]}</b><small class="${warn ? 'warn-text' : ''}">${sub}</small></span></button>`;
}

/* ---------------- Secciones de "Más" ---------------- */

function viewFijos() {
  const sug = fixedSuggestions();
  return `${sug.length ? `<section class="card"><div class="card-head" style="margin-bottom:4px"><h2>¿Los hacemos fijos?</h2></div>
    <div class="small muted" style="margin-bottom:4px">Se repiten todos los meses con un monto parecido.</div>
    <div class="list">${sug.map((s, i) => `<div class="list-row act">
      <div class="grow"><div class="name">${esc(s.name)}</div><div class="meta">${esc(s.category)} · ${s.months.map((m) => monthLabel(m)).join(', ')}</div></div>
      <span class="money">${fmtIn(s.amount, s.currency)}</span>
      <button class="btn sm primary" data-action="fixSuggest" data-id="${i}">Hacer fijo</button>
      <button class="btn sm ghost icon-only" data-action="fixDismiss" data-id="${i}" title="No sugerir más" aria-label="No sugerir más">${icon('x', 16)}</button></div>`).join('')}</div></section>` : ''}
  <section class="card"><div class="card-head"><span class="muted small">Lo que entra o sale todos los meses</span><button class="btn sm primary" data-action="addRecurring">+ Fijo</button></div>
    ${recurringHTML(currentMonth())}</section>`;
}

// Gastos que se repiten todos los meses con monto parecido (ej. seguro, suscripción del banco) y todavía no son fijos
function fixedSuggestions() {
  const months = [0, 1, 2].map((k) => addMonths(currentMonth(), -k));
  const dismissed = new Set(S.settings.fixDismissed || []);
  const groups = new Map();
  for (const t of S.transactions) {
    const m = t.date?.slice(0, 7);
    if (t.type !== 'gasto' || nonFlow(t) || isFixedTx(t) || t.adjust || !t.note || !months.includes(m)) continue;
    const key = `${norm(t.note)}|${t.category}`;
    if (dismissed.has(key) || S.recurring.some((r) => norm(r.name) === norm(t.note))) continue;
    const g = groups.get(key) || { key, name: t.note, category: t.category, byMonth: {}, last: t };
    (g.byMonth[m] = g.byMonth[m] || []).push(Number(t.amount) || 0);
    if (t.date >= g.last.date) g.last = t;
    groups.set(key, g);
  }
  const out = [];
  for (const g of groups.values()) {
    const ms = Object.keys(g.byMonth).sort();
    if (ms.length < 2 || ms.some((m) => g.byMonth[m].length > 2)) continue; // una o dos veces por mes, no algo de todos los días
    const per = ms.map((m) => g.byMonth[m].reduce((s, x) => s + x, 0)).sort((a, b) => a - b);
    const mid = per[Math.floor(per.length / 2)];
    if (!(mid > 0) || per.some((x) => Math.abs(x - mid) > mid * 0.2)) continue; // monto parecido (±20%)
    const acc = S.accounts.find((a) => a.id === g.last.accountId);
    out.push({ key: g.key, name: g.name, category: g.category, amount: round2(mid), currency: acc?.currency || S.settings.localCurrency, accountId: acc?.id || '', months: ms });
  }
  return out.slice(0, 5);
}

function viewProgramados() {
  return `<section class="card"><div class="card-head"><span class="muted small">De una sola vez, con fecha: turnos, matrícula, cumpleaños…</span><button class="btn sm primary" data-action="addSched">+ Programar</button></div>
    ${schedHTML()}</section>`;
}

function viewPrestamos() { return loansHTML(); }

function loanCountLabel() {
  const n = (S.loans || []).filter((l) => !l.closed && loanRemaining(l) > 0).length;
  return `<span class="muted small">${n ? `${n} abierto${n > 1 ? 's' : ''}` : 'Ninguno'}</span>`;
}

const CHAT_PROMPT = `Con toda la información que tenés de mi portafolio, devolveme SOLO un bloque JSON (sin texto extra) con UNA línea por cada compra que hice (si compré el mismo activo varias veces, una línea por cada compra), con este formato exacto:
[
  {"symbol": "VOO", "quantity": 0, "avgCost": 0, "platform": "broker", "purchaseDate": "AAAA-MM-DD", "fee": 0, "total": 0},
  {"symbol": "PAXG", "quantity": 0, "avgCost": 0, "platform": "Binance", "purchaseDate": "AAAA-MM-DD", "fee": 0, "total": 0}
]
- symbol: ticker (VOO, PAXG, BTC, ETH, NVDA, GOOGL, etc.)
- quantity: cantidad de unidades/acciones/monedas de ESA compra (se aceptan decimales, ej. 0.145)
- avgCost: precio por unidad en USD de esa compra
- platform: dónde lo tengo (Binance, broker, etc.)
- purchaseDate: fecha de esa compra (AAAA-MM-DD). Si no la sabés, dejala vacía ""
- fee: comisión en USD de esa compra (0 si no hubo)
- total: monto pagado en USD (cantidad × precio + comisión; 0 si no lo sabés)`;

function viewRespaldo() {
  const s = S.settings;
  return `
  <div class="settings-grid">
    <section class="card" id="sincro">
      <h2 style="margin-bottom:8px">${icon('sync', 18)} Tus datos en iPhone y PC</h2>
      <div id="cloudSync">${cloudSyncHTML()}</div>
    </section>
    <section class="card">
      <h2 style="margin-bottom:8px">Copia de seguridad</h2>
      <p class="small" style="color:var(--text-2);margin-top:0">Un archivo con todos tus datos. Última copia: <b>${fmtDateTime(s.lastBackup)}</b></p>
      <div class="toolbar">
        <button class="btn" data-action="backup">Descargar copia</button>
        <label class="btn">Restaurar copia<input type="file" id="restoreFile" accept=".json,application/json" hidden></label>
      </div>
    </section>
    ${FileSync.handle ? `<section class="card">
      <h2 style="margin-bottom:8px">Archivo vinculado (OneDrive)</h2>
      <div id="fileSync">${fileSyncHTML()}</div>
    </section>` : ''}
  </div>`;
}

// Dólar: cuánto de tu plata depende del tipo de cambio y qué tipo de cambio usa la app
function viewDolar() {
  const s = S.settings;
  const used = [...new Set([s.localCurrency, ...S.accounts.map((a) => a.currency)])].filter((c) => !USD_PEGGED.has(c));
  const manualBOB = used.includes('BOB') && s.bobRateType === 'manual';
  return `
  ${fxCardHTML()}
  <div class="settings-grid">
    <section class="card">
      <h2 style="margin-bottom:14px">Moneda y tipo de cambio</h2>
      <div class="form-row"><label for="setLocal">Tu moneda</label>
        <select id="setLocal">${CURRENCIES.filter(([c]) => !USD_PEGGED.has(c)).map(([c, n]) => `<option value="${c}" ${c === s.localCurrency ? 'selected' : ''}>${curLabel(c)} — ${n}</option>`).join('')}</select></div>
      ${used.includes('BOB') ? `<div class="form-row"><label for="setBobType">Dólar que se usa para convertir</label>
        <select id="setBobType">${BOB_TYPES.map(([v, l]) => `<option value="${v}" ${v === s.bobRateType ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <span class="hint">Hoy: <b>Bs ${fmtNum(s.rates.BOB || 0, 2)}</b> por dólar${manualBOB ? '' : ` · actualizado ${fmtDateTime(s.ratesUpdated)}`}</span></div>` : ''}
      ${manualBOB ? `<div class="form-row"><label>Tipo de cambio de tu banco (Bs por 1 dólar)</label>
        <input type="text" inputmode="decimal" data-rate="BOB" value="${numInput(s.rates.BOB)}" placeholder="ej. 12,10"></div>` : ''}
      ${used.includes('ARS') ? `<div class="form-row"><label for="setArsType">Dólar para convertir pesos argentinos</label>
        <select id="setArsType">${ARS_TYPES.map(([v, l]) => `<option value="${v}" ${v === s.arsRateType ? 'selected' : ''}>${l}</option>`).join('')}</select></div>` : ''}
    </section>
    <section class="card">
      <h2 style="margin-bottom:14px">Todos los tipos de cambio</h2>
      <label class="check-line"><input type="checkbox" id="setAutoRates" ${s.autoRates ? 'checked' : ''}><span>Actualizar automáticamente</span></label>
      <div class="hint" style="margin:6px 0 10px">Última actualización: ${fmtDateTime(s.ratesUpdated)}</div>
      <table class="rates-table"><thead><tr><th>Moneda</th><th class="num">Unidades por 1 USD</th></tr></thead><tbody>
        ${used.map((c) => `<tr><td>${curLabel(c)}</td><td class="num"><input type="text" inputmode="decimal" data-rate="${c}" value="${numInput(s.rates[c])}"></td></tr>`).join('') || '<tr><td colspan="2" class="muted">Sólo usás dólares.</td></tr>'}
      </tbody></table>
    </section>
  </div>`;
}

function viewAjustes() {
  const s = S.settings;
  return `
  <div class="settings-grid">
    <section class="card" id="bloqueo">
      <h2 style="margin-bottom:8px">${icon('lock', 18)} Bloqueo con Face ID o PIN</h2>
      ${lockSettingsHTML()}
    </section>

    <section class="card">
      <h2 style="margin-bottom:8px">Precios de acciones y ETF</h2>
      <p class="small" style="color:var(--text-2);margin-top:0">BTC, ETH y PAXG se actualizan solos. Para VOO, NVDA y GOOGL hace falta una clave gratis de
        <a href="https://finnhub.io/register" target="_blank" rel="noopener">Finnhub</a>.</p>
      <div class="form-row"><input type="password" id="setFinnhub" value="${esc(s.finnhubKey)}" placeholder="Clave de Finnhub" autocomplete="off"></div>
      <button class="btn" data-action="saveKey">Guardar clave</button>
    </section>

    <section class="card" id="importar">
      <h2 style="margin-bottom:8px">Importar mi portafolio desde mi chat</h2>
      <p class="small" style="color:var(--text-2);margin-top:0">Copiá este pedido, pegalo en tu chat de Claude y pegá abajo lo que te devuelva.</p>
      <div class="prompt-box" id="chatPrompt">${esc(CHAT_PROMPT)}</div>
      <div class="toolbar" style="margin:10px 0 14px"><button class="btn" data-action="copyPrompt">Copiar pedido</button></div>
      <textarea id="importText" placeholder='[{"symbol":"VOO","quantity":1.5,"avgCost":480,"platform":"broker"}]'></textarea>
      <div class="toolbar" style="margin-top:10px"><button class="btn primary" data-action="importHoldings">Importar</button></div>
    </section>

    ${customCatsHTML()}

    <section class="card">
      <h2 style="margin-bottom:8px">Zona peligrosa</h2>
      <button class="btn danger" data-action="resetAll">Borrar todos los datos</button>
    </section>
  </div>
  <button class="link-btn" style="margin:0" data-action="reminderHelp">${icon('flame', 14)} ¿Cómo activo un recordatorio diario?</button>`;
}
/* ---------------- Análisis ---------------- */

// Necesidades (regla 50/30/20). Todo lo demás cuenta como "gustos".
const NEEDS = new Set(['Supermercado', 'Transporte', 'Vivienda / alquiler', 'Servicios', 'Salud', 'Educación', 'Impuestos', 'Pago de tarjeta (intereses)']);
const INTEREST = 'Pago de tarjeta (intereses)';
const FIXED = new Set(['Vivienda / alquiler', 'Servicios', 'Suscripciones', 'Impuestos', 'Educación', INTEREST]);

// [cuánto se puede recortar como máximo, consejo concreto]
const CUT_GUIDE = {
  'Eventos y fiestas': [0.2, 'Armá un fondo para eventos: separá un poco cada mes antes de la fecha de cada cuota.'],
  [INTEREST]: [1, 'Pagá el total del resumen: los intereses son plata perdida.'],
  'Comida y salidas': [0.3, 'Cociná más en casa, llevá vianda y limitá el delivery a 1 vez por semana.'],
  'Compras': [0.35, 'Antes de comprar algo no planificado, esperá 48 horas.'],
  'Suscripciones': [0.5, 'Cancelá las que no usaste el último mes o compartí planes familiares.'],
  'Ocio': [0.3, 'Alterná con planes gratis y poné un tope semanal.'],
  'Viajes': [0.25, 'Reservá con anticipación y viajá en temporada baja.'],
  'Otros gastos': [0.2, 'Revisá qué hay en "Otros": suele esconder gastos hormiga.'],
  'Supermercado': [0.12, 'Hacé lista, comprá segundas marcas y aprovechá días de descuento de tu banco.'],
  'Transporte': [0.12, 'Combiná transporte público, compartí viajes y evitá apps en hora pico.'],
  'Servicios': [0.1, 'Revisá tu plan de celular e internet y el consumo de luz y gas.'],
};

let lastAnalysis = null;

function addMonths(ym, k) {
  const d = new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1 + k, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
const monthLabel = (ym, month = 'short') => new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1, 1).toLocaleDateString('es-AR', { month }).replace('.', '');

// "Gasto hormiga": hasta Bs 20 (o unos US$ 3 en otras monedas)
const antLimitLocal = () => (S.settings.localCurrency === 'BOB' ? 20 : Math.round(fromUSD(3, S.settings.localCurrency)));
const antLimitUSD = () => toUSD(antLimitLocal(), S.settings.localCurrency) || 3;

function analyze(n, txs) {
  const end = currentMonth();
  const months = Array.from({ length: n }, (_, i) => addMonths(end, i - n + 1));
  const prevMonths = months.map((m) => addMonths(m, -n));
  const per = months.map((m) => ({ m, ...monthStats(m, txs) }));
  const prevPer = prevMonths.map((m) => monthStats(m, txs));
  // Se promedia sobre los meses que tienen datos (así un usuario nuevo no ve promedios diluidos)
  const k = Math.max(1, per.filter((p) => p.income || p.expense).length);
  const prevK = prevPer.filter((p) => p.income || p.expense).length;
  const sumCats = (list, key) => list.reduce((acc, p) => { for (const [c, v] of Object.entries(p[key])) acc[c] = (acc[c] || 0) + v; return acc; }, {});
  const byCatTot = sumCats(per, 'byCat');
  const prevTot = sumCats(prevPer, 'byCat');
  const income = per.reduce((s, p) => s + p.income, 0) / k;
  const expense = per.reduce((s, p) => s + p.expense, 0) / k;
  const small = { count: 0, total: 0 };
  for (const t of txs) {
    if (t.type !== 'gasto' || nonFlow(t) || !months.some((m) => t.date?.startsWith(m))) continue;
    const usd = txUSD(t);
    if (usd > 0 && usd <= antLimitUSD()) { small.count++; small.total += usd; }
  }
  return {
    n, months, per, k, prevK, income, expense, saving: income - expense,
    rate: income > 0 ? ((income - expense) / income) * 100 : null,
    byCat: Object.entries(byCatTot).map(([c, v]) => [c, v / k]).sort((a, b) => b[1] - a[1]),
    prevByCat: Object.fromEntries(Object.entries(prevTot).map(([c, v]) => [c, v / Math.max(1, prevK)])),
    incomeCats: Object.keys(sumCats(per, 'incomeCats')),
    small: { count: small.count / k, total: small.total / k },
  };
}

function savingsStatus(rate) {
  if (rate == null) return null;
  if (rate < 0) return { tone: 'critical', icon: '⛔', label: 'Gastás más de lo que ganás' };
  if (rate < 10) return { tone: 'warning', icon: '⚠', label: 'Ahorro bajo' };
  if (rate < 20) return { tone: 'good', icon: '✓', label: 'Bien' };
  return { tone: 'good', icon: '★', label: 'Excelente' };
}
const statusPill = (s) => (s ? `<span class="status ${s.tone}">${s.icon} ${s.label}</span>` : '');

// Reparte el recorte necesario: primero intereses, después gustos y por último necesidades flexibles,
// proporcional a cuánto se puede recortar razonablemente de cada categoría.
function planFor(a, pct) {
  if (!(a.income > 0)) return null;
  const target = (a.income * pct) / 100;
  const cats = a.byCat.map(([c, v]) => ({ c, v, cap: CUT_GUIDE[c]?.[0] ?? 0, tip: CUT_GUIDE[c]?.[1] || '' })).filter((x) => x.cap > 0 && x.v > 0);
  const tiers = [cats.filter((x) => x.c === INTEREST), cats.filter((x) => !NEEDS.has(x.c)), cats.filter((x) => NEEDS.has(x.c) && x.c !== INTEREST)];
  let remaining = target;
  const rows = [];
  for (const tier of tiers) {
    if (remaining <= 0.005) break;
    const capTotal = tier.reduce((s, x) => s + x.v * x.cap, 0);
    if (!capTotal) continue;
    const take = Math.min(remaining, capTotal);
    for (const x of tier) {
      const cut = (x.v * x.cap * take) / capTotal;
      if (cut > 0.005) rows.push({ ...x, cut, newV: x.v - cut, pct: (cut / x.v) * 100 });
    }
    remaining -= take;
  }
  rows.sort((p, q) => q.cut - p.cut);
  const achieved = target - Math.max(0, remaining);
  return { pct, target, rows, achieved, remaining: Math.max(0, remaining), newRate: ((a.saving + achieved) / a.income) * 100 };
}

function insightsFor(a) {
  const out = [];
  const fm = (v) => `<span class="money">${fmtMoney(v)}</span>`;
  const pc = (v) => fmtPct(v, false);
  if (a.rate != null) {
    if (a.rate < 0) out.push(['⛔', 'Estás gastando más de lo que ingresás', `En promedio salen ${fm(-a.saving)} por mes más de lo que entra. Lo primero es frenar los gustos hasta volver a positivo.`]);
    else if (a.rate < 20) out.push(['✓', `Ahorrás el ${pc(a.rate)} de tus ingresos`, `Lo recomendado es al menos 20%. Te faltan ${fm(a.income * 0.2 - a.saving)} por mes para llegar.`]);
    else out.push(['★', `Ahorrás el ${pc(a.rate)} de tus ingresos`, 'Estás por encima del 20% recomendado. ¡Muy bien!']);
  } else {
    out.push(['ℹ', 'No registraste ingresos en el período', 'Cargá tus ingresos (sueldo, freelance, etc.) para calcular cuánto ahorrás.']);
  }
  if (a.byCat.length) {
    const [c, v] = a.byCat[0];
    out.push(['🥇', `Tu mayor gasto es ${esc(c)}`, `Es el ${pc((v / a.expense) * 100)} de todo lo que gastás (${fm(v)} por mes).`]);
  }
  const wants = a.byCat.filter(([c]) => !NEEDS.has(c)).reduce((s, [, v]) => s + v, 0);
  if (a.income > 0 && (wants / a.income) * 100 > 30) {
    out.push(['⚠', `Los gustos se llevan el ${pc((wants / a.income) * 100)} de tus ingresos`, 'La regla 50/30/20 sugiere no pasar del 30%. Es el primer lugar donde recortar.']);
  }
  if (a.prevK > 0) {
    a.byCat.filter(([c, v]) => { const p = a.prevByCat[c]; return p > 0 && v > p * 1.15 && v - p > a.expense * 0.02; })
      .slice(0, 2)
      .forEach(([c, v]) => out.push(['📈', `${esc(c)} subió ${fmtPct((v / a.prevByCat[c] - 1) * 100)}`, `Pasaste de ${fm(a.prevByCat[c])} a ${fm(v)} por mes comparado con el período anterior.`]));
  }
  const interest = a.byCat.find(([c]) => c === INTEREST)?.[1] || 0;
  if (interest > 0) out.push(['💳', 'Estás pagando intereses de tarjeta', `${fm(interest)} por mes (${fm(interest * 12)} al año). Pagar el total del resumen es el ahorro más fácil de todos.`]);
  if (a.small.count >= 8) out.push(['🐜', `Hacés unos ${Math.round(a.small.count)} gastos chicos por mes`, `Compras de hasta ${fmtIn(antLimitLocal(), S.settings.localCurrency)} que suman ${fm(a.small.total)} por mes (${fm(a.small.total * 12)} al año). Los "gastos hormiga" son los más fáciles de recortar.`]);
  if (a.expense > 0) {
    const t = totals();
    const cover = t.liquid / a.expense;
    if (cover < 3) out.push(['🛟', 'Tu fondo de emergencia es corto', `Tu liquidez cubre ${fmtNum(cover, 1)} meses de gastos. Lo ideal son 3 a 6 meses: entre ${fm(a.expense * 3)} y ${fm(a.expense * 6)}.`]);
    else out.push(['🛟', 'Fondo de emergencia cubierto', `Tu liquidez cubre ${fmtNum(cover, 1)} meses de gastos (lo ideal son 3 a 6).`]);
    if (t.debt > 0 && a.income > 0 && t.debt > a.income * 0.3) out.push(['💳', 'Deuda de tarjeta alta', `Debés ${fm(t.debt)}, el ${pc((t.debt / a.income) * 100)} de tu ingreso mensual.`]);
  }
  if (a.saving > 0) out.push(['🎯', 'Si seguís a este ritmo', `En 12 meses juntás ${fm(a.saving * 12)}.`]);
  return out;
}

function incomeIdeas(a) {
  const ideas = [];
  if (a.incomeCats.length <= 1) ideas.push(['🧩', 'Sumá una segunda fuente de ingresos', 'Hoy dependés de una sola. Aunque sea chica, una segunda fuente te da colchón.']);
  ideas.push(['💼', 'Freelance o trabajos puntuales', 'Ofrecé lo que ya sabés hacer (diseño, clases, Excel, idiomas, reparaciones) en tus tiempos libres.']);
  ideas.push(['📦', 'Vendé lo que no usás', 'Ropa, tecnología o muebles parados son plata inmovilizada.']);
  ideas.push(['🤝', 'Negociá tu sueldo', 'Llevá datos de cuánto se paga tu puesto en el mercado y tus logros del último año.']);
  const payers = S.holdings.filter((h) => ['VOO', 'GOOGL', 'NVDA'].includes(h.symbol) && Number(h.quantity) > 0);
  if (payers.length && !a.incomeCats.includes('Dividendos')) {
    ideas.push(['🧾', 'Registrá tus dividendos', `${payers.map((h) => esc(h.symbol)).join(', ')} pagan dividendos: cargalos como ingreso "Dividendos" para verlos acá.`]);
  }
  return ideas;
}

function roundedBar(x, y, w, h) {
  const r = Math.min(4, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function drawBars(el, per) {
  if (!el) return;
  const cur = dispCur();
  const data = per.map((p) => ({ m: p.m, inc: fromUSD(p.income, cur), exp: fromUSD(p.expense, cur) }));
  const max = Math.max(0, ...data.map((d) => Math.max(d.inc, d.exp)));
  if (!max) { el.innerHTML = '<div class="empty">Sin datos en el período.</div>'; return; }
  const W = el.clientWidth || 500, H = el.clientHeight || 240;
  const m = { l: 56, r: 6, t: 10, b: 24 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const ticks = niceTicks(0, max);
  const top = ticks[ticks.length - 1];
  const y = (v) => m.t + ih - (v / top) * ih;
  const gw = iw / data.length;
  const bw = Math.max(3, Math.min(22, gw * 0.32));
  const every = Math.ceil(data.length / Math.max(1, Math.floor(iw / 44)));
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ingresos y gastos por mes">
    ${ticks.map((t) => `<line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}" stroke="var(--grid)"/><text class="axis-txt" x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${compact(t, cur)}</text>`).join('')}
    ${data.map((d, i) => `<rect class="hitg" data-i="${i}" x="${m.l + gw * i}" y="${m.t}" width="${gw}" height="${ih}" fill="var(--grid)" fill-opacity="0"/>`).join('')}
    <g pointer-events="none">${data.map((d, i) => {
      const cx = m.l + gw * i + gw / 2;
      const bar = (v, x, c) => (v > 0 ? `<path d="${roundedBar(x, y(v), bw, m.t + ih - y(v))}" fill="var(--${c})"/>` : '');
      return bar(d.inc, cx - bw - 1, 'c1') + bar(d.exp, cx + 1, 'c2')
        + (i % every === 0 || i === data.length - 1 ? `<text class="axis-txt" x="${cx}" y="${H - 6}" text-anchor="middle">${monthLabel(d.m)}</text>` : '');
    }).join('')}
    <line x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}" stroke="var(--axis)"/></g>
  </svg>`;
  const tip = tipEl();
  $$('.hitg', el).forEach((r) => {
    r.addEventListener('mousemove', (e) => {
      $$('.hitg', el).forEach((o) => o.setAttribute('fill-opacity', o === r ? '0.5' : '0'));
      const d = data[+r.dataset.i];
      const sav = d.inc - d.exp;
      tip.dataset.owner = 'bars';
      tip.innerHTML = `<b>${monthLabel(d.m, 'long')} ${d.m.slice(0, 4)}</b><br>Ingresos: ${fmtIn(d.inc, cur)}<br>Gastos: ${fmtIn(d.exp, cur)}<br>Ahorro: ${fmtIn(sav, cur, { sign: true })}${d.inc ? ` (${fmtPct((sav / d.inc) * 100, false)})` : ''}`;
      tip.hidden = false;
      placeTip(e.clientX, e.clientY);
    });
    r.addEventListener('mouseleave', () => { r.setAttribute('fill-opacity', '0'); tip.dataset.owner = ''; tip.hidden = true; });
  });
}

function goalSlider() {
  const pct = Number(S.settings.savingsGoal) || 5;
  return `<div class="goal-row"><label for="goalRange">Quiero ahorrar un <b id="goalVal">${pct}%</b> más de lo que me entra</label>
    <input type="range" id="goalRange" min="1" max="20" step="1" value="${pct}"></div>`;
}

// Plan para ahorrar más, en palabras simples y montos redondos
function planHTML(a) {
  const pct = Number(S.settings.savingsGoal) || 5;
  const p = planFor(a, pct);
  const cur = dispCur();
  const R = (usd) => fmtIn(Math.round(fromUSD(usd, cur)), cur, { decimals: 0 });
  const one = (Number(S.settings.anPeriod) || 3) === 1;
  if (!p) return `<div class="empty">Todavía no te entró plata ${one ? 'este mes' : 'en estos meses'}.</div>`;
  const head = `<div class="plan-goal"><span class="muted small">${one ? 'Este mes te entró' : 'Por mes te entra'} ${R(a.income)}. Un ${pct}% más es:</span>
    <b class="plan-goal-val money">${R(p.target)} extra por mes</b></div>`;
  if (!p.rows.length) return `${head}<div class="empty">No encontré gastos para recortar. Elegí bien la categoría al registrar (Comida, Transporte, Compras…).</div>`;
  const ok = p.remaining <= 0.5 / (rate(cur) || 1);
  return `${head}
    <div class="calc-sub" style="margin-top:12px"><b>Para lograrlo, gastá menos en:</b></div>
    <div class="list">${p.rows.map((r) => `<div class="plan-row">
      <div class="plan-top"><b>${esc(r.c)}</b><b class="money up">−${R(r.cut)}</b></div>
      <div class="small muted money">Gastaste ${R(r.v)} → que sean ${R(r.newV)}</div>
      ${r.tip ? `<div class="small" style="color:var(--text-2)">💡 ${esc(r.tip)}</div>` : ''}</div>`).join('')}</div>
    ${ok ? `<div class="safe-line ok">${icon('check', 16)}<span>Con esto ahorrás los ${R(p.target)}.</span></div>`
      : `<div class="banner" style="margin-top:10px">Con esto ahorrás <b class="money">${R(p.achieved)}</b> de los ${R(p.target)}. Para los <b class="money">${R(p.remaining)}</b> que faltan, bajá un poco el % o buscá ganar algo más.</div>`}
    <button class="btn primary wide" style="margin-top:12px" data-action="applyPlan">Poner estos límites</button>
    <p class="muted small" style="margin:6px 0 0;text-align:center">Se agregan arriba como topes, para que veas si te pasás.</p>`;
}

function budgetHTML(txs) {
  const month = currentMonth();
  const ms = monthStats(month, txs);
  const now = new Date();
  const day = now.getDate(), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const entries = Object.entries(S.budgets).filter(([, b]) => Number(b.amount) > 0);
  if (!entries.length) {
    return `<div class="empty">Todavía no tenés topes. Tocá <b>+ Tope</b> para ponerle un máximo por mes a una categoría.</div>`;
  }
  return `<div class="list">${entries.map(([c, b]) => {
    const lim = toUSD(b.amount, b.currency);
    const spent = ms.byCat[c] || 0;
    // Gastos fijos (se pagan una vez al mes) no se proyectan
    const proj = FIXED.has(c) ? spent : (spent / day) * dim;
    const st = spent >= lim ? { tone: 'critical', icon: '⛔', label: 'Excedido' }
      : proj > lim ? { tone: 'warning', icon: '⚠', label: 'En riesgo' } : { tone: 'good', icon: '✓', label: 'En camino' };
    const used = lim ? Math.min(100, (spent / lim) * 100) : 100;
    return `<div class="budget-row">
      <div class="budget-top"><b>${esc(c)}</b> ${statusPill(st)}<span class="spacer"></span>
        <button class="btn sm ghost icon-only" data-action="editBudget" data-id="${esc(c)}" title="Editar tope" aria-label="Editar tope">${icon('settings', 16)}</button></div>
      <div class="small"><b class="money">${fmtIn(fromUSD(spent, b.currency), b.currency)}</b> <span class="muted">de <span class="money">${fmtIn(b.amount, b.currency)}</span></span></div>
      <div class="meter"><div class="${st.tone}" style="width:${used}%"></div></div>
      <div class="muted small money">${spent >= lim ? `Te pasaste ${fmtIn(fromUSD(spent - lim, b.currency), b.currency)}` : `Te quedan ${fmtIn(fromUSD(lim - spent, b.currency), b.currency)}`}${FIXED.has(c) || spent >= lim ? '' : ` · a este ritmo llegás a ${fmtIn(fromUSD(proj, b.currency), b.currency)}`}</div>
    </div>`;
  }).join('')}</div>`;
}

// Datos para Análisis, Presupuesto y Consejos (null si todavía no hay movimientos)
function analysisData() {
  const n = Number(S.settings.anPeriod) || 3;
  const hasReal = S.transactions.some((t) => !nonFlow(t) && t.type !== 'transferencia');
  if (!hasReal) { lastAnalysis = null; return null; }
  const txs = S.transactions;
  const a = analyze(n, txs);
  lastAnalysis = a;
  return { a, n, txs };
}

const noAnalysisHTML = () => `<section class="card" style="text-align:center;padding:36px 20px">
  <h2 style="font-size:18px;margin-bottom:8px">Todavía no hay movimientos para analizar</h2>
  <p style="color:var(--text-2);max-width:420px;margin:0 auto 18px">Cuando registres tus gastos, acá vas a ver en qué gastás más.</p>
  <button class="btn primary" data-action="go" data-id="movimientos">Ir a Movimientos</button></section>`;

// Elegir el período (este mes, 3, 6 o 12 meses)
function periodBarHTML(a, n) {
  return `<div class="period-bar">
    <select id="anPeriod" aria-label="Período">${[[1, 'Este mes'], [3, 'Últimos 3 meses'], [6, 'Últimos 6 meses'], [12, 'Últimos 12 meses']].map(([v, l]) => `<option value="${v}" ${v === n ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <span class="muted small">${n === 1 ? 'Mira lo que pasó en este mes' : `Mira el promedio de ${n} meses`}</span>
  </div>`;
}

const insightList = (items) => `<div class="insights">${items.map(([ico, title, text]) => `<div class="insight"><span class="ins-ico">${ico}</span><div><b>${title}</b><div class="small" style="color:var(--text-2)">${text}</div></div></div>`).join('')}</div>`;
const DISCLAIMER = '<p class="muted small" style="margin:0">Son sugerencias generales, no asesoramiento financiero profesional.</p>';

// Qué hay dentro de "Otros" (por lo que escribiste en "¿Qué fue?"), con tus notas
function othersDetail(months, type = 'gasto') {
  const g = new Map();
  for (const t of S.transactions) {
    if (t.type !== type || !OTHER_CATS.has(t.category) || nonFlow(t) || t.adjust || !months.includes(t.date?.slice(0, 7))) continue;
    const name = t.note && t.note !== t.category ? t.note : '(sin detalle)';
    const x = g.get(norm(name)) || { name, usd: 0, n: 0, memos: [] };
    x.usd += txUSD(t); x.n++;
    if (t.memo && !x.memos.includes(t.memo)) x.memos.push(t.memo);
    g.set(norm(name), x);
  }
  return [...g.values()].sort((a, b) => b.usd - a.usd);
}
function othersBoxHTML(months) {
  const od = othersDetail(months);
  if (!od.length) return '';
  return `<div class="others-box"><div class="calc-sub"><b>Dentro de "Otros"</b> <span class="muted small">(total del período)</span></div>
    ${od.slice(0, 10).map((x) => `<div class="calc-row"><span>${esc(x.name)}${x.n > 1 ? ` <span class="muted">×${x.n}</span>` : ''}${x.memos.length ? `<span class="others-memo">${esc(x.memos.join(' · '))}</span>` : ''}</span><b class="money">${fmtMoney(x.usd)}</b></div>`).join('')}</div>`;
}

// Análisis: cuánto entra, cuánto sale y en qué
function viewAnalisis() {
  const month = currentMonth();
  lastMonthly = { series: monthlySeries(month) };
  const D = analysisData();
  if (!D) return noAnalysisHTML();
  const { a, n } = D;
  const st = savingsStatus(a.rate);
  const prevM = addMonths(month, -1);
  return `
  ${periodBarHTML(a, n)}
  <div class="tiles">
    ${tile('Ingreso promedio', fmtMoney(a.income), 'por mes')}
    ${tile('Gasto promedio', fmtMoney(a.expense), a.income ? `${fmtPct((a.expense / a.income) * 100, false)} de tus ingresos` : 'por mes')}
    ${tile('Ahorro promedio', `<span class="${cls(a.saving)}">${fmtMoney(a.saving, { sign: true })}</span>`, 'por mes')}
    ${tile('Tasa de ahorro', a.rate != null ? fmtPct(a.rate, false) : '—', statusPill(st) || 'Faltan ingresos')}
  </div>
  <div class="grid-2">
    <section class="card"><div class="card-head"><h2>¿En qué gastás más?</h2><span class="muted small">por mes</span></div>
      ${a.byCat.length ? `<div class="hbars">${a.byCat.map(([c, v]) => {
        const prev = a.prevByCat[c];
        const ch = a.prevK > 0 && prev > 0 ? (v / prev - 1) * 100 : null;
        const tip = esc(`<b>${esc(c)}</b><br>${fmtMoney(v)} por mes · ${fmtPct((v / a.expense) * 100, false)} de tus gastos${ch != null ? `<br>${fmtPct(ch)} vs. período anterior` : ''}`);
        return `<div class="hbar cat" data-tip="${tip}"><span class="lbl">${esc(c)}</span>
          <div class="track"><div class="bar" style="width:${(v / a.byCat[0][1]) * 100}%"></div></div>
          <span class="v"><span class="money">${fmtMoney(v)}</span> <span class="muted small">${fmtPct((v / a.expense) * 100, false)}</span></span></div>`;
      }).join('')}</div>` : '<div class="empty">Sin gastos en el período.</div>'}
      ${othersBoxHTML(a.per.map((p) => p.m))}
    </section>
    <section class="card"><div class="card-head"><h2>¿Gastás más de lo que ingresás?</h2>
      <div class="legend"><span><i class="swatch" style="background:var(--c1)"></i>Ingresos</span><span><i class="swatch" style="background:var(--c2)"></i>Gastos</span></div></div>
      <div id="barsChart" class="line-chart"></div></section>
  </div>
  <div class="grid-2">
    <section class="card"><div class="card-head"><h2>Este mes vs. tu promedio</h2><span class="muted small">por categoría</span></div>${categoryCompareHTML(month)}</section>
    <section class="card"><div class="card-head"><h2>Gastos por mes</h2></div><div id="monthlyChart" class="line-chart" style="height:200px"></div></section>
  </div>
  <button class="btn wide" data-action="monthClose" data-id="${prevM}">${icon('calendar', 16)} Ver el cierre de ${monthLabel(prevM, 'long')}</button>
  ${DISCLAIMER}`;
}

// Presupuesto: topes por categoría y plan para ahorrar más
function viewPresupuesto() {
  const D = analysisData();
  return `
  <section class="card"><div class="card-head"><h2>Topes de ${monthLabel(currentMonth(), 'long')}</h2>
    <button class="btn sm primary" data-action="addBudget">+ Tope</button></div>
    ${budgetHTML(S.transactions)}</section>
  ${D ? `<section class="card"><div class="card-head" style="margin-bottom:10px"><h2>¿Querés ahorrar más?</h2></div>
    ${periodBarHTML(D.a, D.n)}
    ${goalSlider()}<div id="planBox">${planHTML(D.a)}</div></section>
  ${DISCLAIMER}` : noAnalysisHTML()}`;
}

// Consejos: lo que se ve en tus números e ideas para ganar más
function viewConsejos() {
  const D = analysisData();
  if (!D) return noAnalysisHTML();
  return `
  ${periodBarHTML(D.a, D.n)}
  <section class="card"><div class="card-head"><h2>Lo que veo en tus números</h2></div>${insightList(insightsFor(D.a))}</section>
  ${D.a.rate == null || D.a.rate < 10 ? `<section class="card"><div class="card-head"><h2>Ideas para ganar más</h2><span class="muted small">tu ahorro está bajo</span></div>${insightList(incomeIdeas(D.a))}</section>` : ''}
  <div class="shortcuts">${shortcutHTML('presupuesto', 'Plan para ahorrar más')}${shortcutHTML('metas', S.goals.length ? `${S.goals.length} meta${S.goals.length > 1 ? 's' : ''}` : 'Crear una meta')}</div>
  ${DISCLAIMER}`;
}

const roundNice = (v) => (v >= 1000 ? Math.round(v / 100) * 100 : Math.round(v));

function budgetForm(cat) {
  const cur = S.settings.localCurrency;
  const b = cat ? S.budgets[cat] : null;
  const used = new Set(Object.keys(S.budgets));
  openForm({
    title: cat ? `Presupuesto: ${cat}` : 'Nuevo presupuesto mensual',
    fields: [
      cat ? { type: 'html', html: '' } : { name: 'cat', label: 'Categoría', type: 'select', full: true, options: catsOf('gasto').filter((c) => !used.has(c)).map((c) => [c, c]) },
      { name: 'amount', label: `Tope por mes (${cur})`, type: 'number', full: true, required: true,
        value: b ? round2(fromUSD(toUSD(b.amount, b.currency), cur)) : '' },
      ...(cat ? [{ name: 'remove', label: 'Eliminar este tope', type: 'checkbox', full: true }] : []),
    ],
    onSubmit: (v) => {
      const c = cat || v.cat;
      if (cat && v.remove) { delete S.budgets[cat]; save(); render(); toast(`Tope de ${cat} eliminado`); return; }
      if (!c) return 'Ya tenés presupuesto para todas las categorías.';
      if (!(v.amount > 0)) { delete S.budgets[c]; } else S.budgets[c] = { amount: v.amount, currency: cur };
      save(); render();
    },
  });
}

/* ---------------- Rendimiento (APY) de cuentas como Meru ---------------- */

// Con fuente "blend", la tasa sigue a Blend (DefiLlama) menos la diferencia que se queda Meru
function effectiveApy(a) {
  if (a.apySource === 'blend' && S.settings.blendApy != null) return Math.max(0, S.settings.blendApy - (Number(a.apyOffset) || 0));
  return Number(a.apy) || 0;
}

// Interés compuesto diario sobre el saldo, como lo hace Meru
function accrueInterest() {
  const today = todayISO();
  let changed = false;
  for (const a of S.accounts) {
    if (a.type === 'credito' || !a.apyAccrue) continue;
    if (!a.apyLastAccrual) { a.apyLastAccrual = today; changed = true; continue; }
    const days = Math.round((Date.parse(today) - Date.parse(a.apyLastAccrual)) / 864e5);
    if (days < 1) continue;
    const apy = effectiveApy(a);
    if (apy > 0 && Number(a.balance) > 0) a.balance = Math.round(Number(a.balance) * (1 + apy / 100) ** (days / 365) * 1e6) / 1e6;
    a.apyLastAccrual = today;
    changed = true;
  }
  return changed;
}

const monthlyInterestUSD = () => S.accounts.filter((a) => a.type !== 'credito')
  .reduce((s, a) => s + Math.max(0, toUSD(a.balance, a.currency)) * (effectiveApy(a) / 100) / 12, 0);

/* ---------------- Metas y proyecciones ---------------- */

let lastProjection = null;

const GOAL_SOURCES = () => [['liquid', 'Mi liquidez (efectivo, bancos y billeteras)'], ['networth', 'Todo mi patrimonio (con inversiones)'],
  ...S.accounts.filter((a) => a.type !== 'credito').map((a) => [a.id, `Sólo la cuenta ${a.name}`])];

function goalCurrent(g) {
  const t = totals();
  if (g.source === 'networth') return t.netWorth;
  if (g.source === 'liquid' || !g.source) return t.liquid;
  const a = S.accounts.find((x) => x.id === g.source);
  return a ? toUSD(a.balance, a.currency) : 0;
}

const isVariable = (t) => t.type === 'gasto' && !nonFlow(t) && !t.recurringId && !t.scheduledId;

// Números base del plan, todo en USD por mes
function planNumbers() {
  const recInc = S.recurring.filter((r) => repeats(r) && r.type === 'ingreso' && countsInPlan(r)).reduce((s, r) => s + toUSD(r.amount, r.currency), 0);
  const recOut = S.recurring.filter((r) => repeats(r) && r.type === 'gasto').reduce((s, r) => s + toUSD(r.amount, r.currency), 0);
  const interest = monthlyInterestUSD();
  // Gasto variable promedio de los 3 meses anteriores con datos (o lo que va de este mes si recién empezás)
  const prev = [1, 2, 3].map((k) => addMonths(currentMonth(), -k));
  const per = prev.map((m) => {
    const txs = S.transactions.filter((t) => t.date?.startsWith(m));
    return {
      variable: txs.filter(isVariable).reduce((s, t) => s + txUSD(t), 0),
      extra: txs.filter((t) => t.type === 'ingreso' && !nonFlow(t) && !t.recurringId).reduce((s, t) => s + txUSD(t), 0),
      any: txs.some((t) => !nonFlow(t)),
    };
  }).filter((p) => p.any);
  let avgVariable, avgExtra;
  if (per.length) {
    avgVariable = per.reduce((s, p) => s + p.variable, 0) / per.length;
    avgExtra = per.reduce((s, p) => s + p.extra, 0) / per.length;
  } else {
    const now = new Date();
    const soFar = S.transactions.filter((t) => t.date?.startsWith(currentMonth()) && isVariable(t)).reduce((s, t) => s + txUSD(t), 0);
    avgVariable = (soFar / now.getDate()) * daysInMonth(currentMonth());
    avgExtra = 0;
  }
  const maxSaving = recInc + interest - recOut;
  return { recInc, recOut, interest, avgVariable, avgExtra, maxSaving, projectedSaving: maxSaving + avgExtra - avgVariable };
}

function goalMath(g, P) {
  const current = goalCurrent(g);
  const target = toUSD(g.target, g.currency);
  const remaining = Math.max(0, target - current);
  const monthsLeft = g.date ? Math.max(0.5, (Date.parse(g.date) - Date.now()) / (30.44 * 864e5)) : null;
  const needed = monthsLeft ? remaining / monthsLeft : null;
  // Máximo de gastos variables por mes para llegar (sin contar ingresos extra que no son seguros)
  const maxVariable = needed != null ? P.maxSaving - needed : null;
  const etaMonths = remaining <= 0 ? 0 : P.projectedSaving > 0 ? remaining / P.projectedSaving : null;
  return { current, target, remaining, monthsLeft, needed, maxVariable, etaMonths, pct: target ? Math.min(100, (current / target) * 100) : 0 };
}

function etaLabel(months) {
  if (months == null) return 'a este ritmo no llegás';
  if (months <= 0) return '¡ya llegaste!';
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + Math.ceil(months));
  return `${monthLabel(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 'long')} ${d.getFullYear()} (${fmtNum(months, 1)} meses)`;
}

function goalCardHTML(g, P) {
  const M = goalMath(g, P);
  const onTrack = M.needed == null || P.projectedSaving >= M.needed;
  return `<section class="card goal-card">
    <div class="card-head"><div><h2>${esc(g.name)}</h2><div class="muted small">${g.date ? `Para el ${fmtDate(g.date)}` : 'Sin fecha límite'} · ${esc(GOAL_SOURCES().find(([v]) => v === (g.source || 'liquid'))?.[1] || '')}</div></div>
      <button class="btn sm ghost" data-action="editGoal" data-id="${g.id}">Editar</button></div>
    <div class="goal-nums"><span class="money goal-now">${fmtMoney(M.current)}</span><span class="muted"> de </span><span class="money">${fmtIn(g.target, g.currency)}</span>
      <span class="spacer"></span><b>${fmtNum(M.pct, 0)}%</b></div>
    <div class="meter big"><div style="width:${M.pct}%"></div></div>
    <div class="goal-facts">
      <div><span class="muted small">Te falta</span><b class="money">${fmtMoney(M.remaining)}</b></div>
      ${M.needed != null ? `<div><span class="muted small">Necesitás ahorrar</span><b class="money">${fmtMoney(M.needed)}/mes</b></div>` : ''}
      <div><span class="muted small">A tu ritmo llegás</span><b>${M.remaining <= 0 ? '¡Ya llegaste!' : M.etaMonths == null ? 'No llegás' : etaLabel(M.etaMonths)}</b></div>
    </div>
    ${M.needed != null ? `<div class="small ${onTrack ? 'up' : 'down'}" style="margin:8px 0">${onTrack ? '✓ Llegás a tiempo.' : `⚠ Te faltan ${fmtMoney(M.needed - P.projectedSaving)} por mes para llegar a tiempo.`}</div>` : ''}
  </section>`;
}

function savingsTable(P) {
  const cur = currentMonth();
  const rows = [];
  let acc = 0;
  for (let k = -5; k <= 6; k++) {
    const m = addMonths(cur, k);
    if (k <= 0) {
      const ms = monthStats(m);
      const fixed = S.transactions.filter((t) => t.date?.startsWith(m) && t.type === 'gasto' && isFixedTx(t)).reduce((s, t) => s + txUSD(t), 0);
      if (!ms.income && !ms.expense) continue;
      const real = ms.income - ms.expense;
      acc += real;
      rows.push({ m, proj: false, inc: ms.income, fixed, max: ms.income - fixed, variable: ms.expense - fixed, real, acc });
    } else {
      const inc = P.recInc + P.interest + P.avgExtra;
      const real = P.projectedSaving;
      acc += real;
      rows.push({ m, proj: true, inc, fixed: P.recOut, max: inc - P.recOut, variable: P.avgVariable, real, acc });
    }
  }
  const best = rows.filter((r) => !r.proj).reduce((b, r) => (!b || r.real > b.real ? r : b), null);
  return { rows, best };
}

function drawProjection(el, data) {
  if (!el) return;
  const cur = dispCur();
  const { start, perMonth, target, needed, months } = data;
  const n = Math.max(3, Math.min(36, Math.ceil(months || 12)));
  const proj = Array.from({ length: n + 1 }, (_, i) => start + perMonth * i);
  const need = needed != null ? Array.from({ length: n + 1 }, (_, i) => start + needed * i) : null;
  const all = [...proj, ...(need || []), target || 0, start].map((v) => fromUSD(v, cur));
  const W = el.clientWidth || 500, H = el.clientHeight || 240;
  const m = { l: 60, r: 12, t: 14, b: 24 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const ticks = niceTicks(Math.min(0, ...all), Math.max(...all));
  const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const x = (i) => m.l + (i / n) * iw;
  const y = (v) => m.t + ih - ((fromUSD(v, cur) - y0) / (y1 - y0 || 1)) * ih;
  const path = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const lbl = (i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + i); return monthLabel(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`) + (d.getMonth() === 0 || i === 0 ? ` ${String(d.getFullYear()).slice(2)}` : ''); };
  const step = Math.ceil(n / Math.max(1, Math.floor(iw / 56)));
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Proyección de ahorro">
    ${ticks.map((t) => `<line x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih - ((t - y0) / (y1 - y0 || 1)) * ih}" y2="${m.t + ih - ((t - y0) / (y1 - y0 || 1)) * ih}" stroke="var(--grid)"/>
      <text class="axis-txt" x="${m.l - 8}" y="${m.t + ih - ((t - y0) / (y1 - y0 || 1)) * ih + 4}" text-anchor="end">${compact(t, cur)}</text>`).join('')}
    ${Array.from({ length: n + 1 }, (_, i) => i).filter((i) => i % step === 0).map((i) => `<text class="axis-txt" x="${x(i)}" y="${H - 6}" text-anchor="middle">${lbl(i)}</text>`).join('')}
    ${target ? `<line x1="${m.l}" x2="${W - m.r}" y1="${y(target)}" y2="${y(target)}" stroke="var(--text-2)" stroke-dasharray="5 4"/>
      <text class="axis-txt" x="${W - m.r}" y="${y(target) - 6}" text-anchor="end" style="fill:var(--text-2)">Meta ${compact(fromUSD(target, cur), cur)}</text>` : ''}
    ${need ? `<path d="${path(need)}" fill="none" stroke="var(--c2)" stroke-width="2" stroke-dasharray="6 4"/>` : ''}
    <path d="${path(proj)}" fill="none" stroke="var(--c1)" stroke-width="2"/>
    <circle cx="${x(0)}" cy="${y(start)}" r="4.5" fill="var(--c1)" stroke="var(--surface)" stroke-width="2"/>
    <line class="xh" y1="${m.t}" y2="${m.t + ih}" stroke="var(--axis)" visibility="hidden"/>
    <rect x="${m.l}" y="0" width="${iw}" height="${H}" fill="transparent" class="hit"/>
  </svg>`;
  const svg = el.querySelector('svg'), xh = svg.querySelector('.xh'), tip = tipEl();
  svg.querySelector('.hit').addEventListener('mousemove', (e) => {
    const r = svg.getBoundingClientRect();
    const i = Math.max(0, Math.min(n, Math.round((((e.clientX - r.left) / r.width) * W - m.l) / iw * n)));
    xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('visibility', 'visible');
    tip.dataset.owner = 'proj';
    tip.innerHTML = `<b>${lbl(i)}</b><br>A tu ritmo: ${fmtMoney(proj[i])}${need ? `<br>Lo necesario: ${fmtMoney(need[i])}` : ''}${target ? `<br>Meta: ${fmtMoney(target)}` : ''}`;
    tip.hidden = false;
    placeTip(e.clientX, e.clientY);
  });
  svg.querySelector('.hit').addEventListener('mouseleave', () => { xh.setAttribute('visibility', 'hidden'); tip.dataset.owner = ''; tip.hidden = true; });
}

function viewMetas() {
  const P = planNumbers();
  const T = savingsTable(P);
  const g0 = S.goals[0];
  const M0 = g0 ? goalMath(g0, P) : null;
  const start = g0 ? M0.current : totals().liquid;
  lastProjection = { start, perMonth: P.projectedSaving, target: M0?.target || null, needed: M0?.needed ?? null, months: M0?.monthsLeft || (M0?.etaMonths ? Math.min(36, M0.etaMonths + 1) : 12) };
  const thisMonth = monthStats(currentMonth());
  return `
  ${S.goals.length ? S.goals.map((g) => goalCardHTML(g, P)).join('') : `<section class="card" style="text-align:center;padding:28px 20px">
    <h2 style="font-size:18px;margin-bottom:6px">¿A qué querés llegar?</h2>
    <p class="muted" style="margin:0 auto 14px;max-width:420px">Poné cuánto querés juntar y te digo cuánto ahorrar por mes.</p>
    <button class="btn primary" data-action="addGoal">${icon('target', 16)} Crear mi meta</button></section>`}
  ${S.goals.length ? '<div class="toolbar"><span class="spacer"></span><button class="btn" data-action="addGoal">+ Otra meta</button></div>' : ''}
  <div class="tiles">
    ${tile('Podés ahorrar hasta', fmtMoney(P.maxSaving) + '<span class="t-unit">/mes</span>', 'Si sólo pagás tus fijos')}
    ${tile('Ahorro de este mes', `<span class="${cls(thisMonth.income - thisMonth.expense)}">${fmtMoney(thisMonth.income - thisMonth.expense, { sign: true })}</span>`, 'Lo que va del mes')}
    ${tile('Tu mejor mes', T.best ? fmtMoney(T.best.real) : '—', T.best ? `${monthLabel(T.best.m, 'long')} ${T.best.m.slice(0, 4)}` : 'Todavía no hay')}
    ${tile('En un año', `<span class="${cls(P.projectedSaving)}">${fmtMoney(P.projectedSaving * 12, { sign: true })}</span>`, `Ahorrando ${fmtMoney(P.projectedSaving)}/mes`)}
  </div>
  <section class="card"><div class="card-head"><h2>Cómo vas${g0 ? `: ${esc(g0.name)}` : ''}</h2>
    <div class="legend"><span><i class="swatch" style="background:var(--c1)"></i>A tu ritmo</span>${M0?.needed != null ? '<span><i class="swatch" style="background:var(--c2)"></i>Lo necesario</span>' : ''}</div></div>
    <div id="projChart" class="line-chart" style="height:240px"></div></section>`;
}

// Mini resumen de cada meta (Inicio y Plan)
function goalsMiniHTML(P = planNumbers()) {
  return S.goals.map((g) => {
    const M = goalMath(g, P);
    return `<div class="goal-mini"><div class="budget-top"><b>${esc(g.name)}</b><span class="spacer"></span><b class="small">${fmtNum(M.pct, 0)}%</b></div>
      <div class="meter"><div style="width:${M.pct}%"></div></div>
      <div class="small muted">${M.remaining <= 0 ? '¡Ya llegaste!' : `Te faltan <span class="money">${fmtMoney(M.remaining)}</span> · ${M.etaMonths == null ? 'a este ritmo no llegás' : `llegás en ${etaLabel(M.etaMonths)}`}`}</div></div>`;
  }).join('');
}

// Plan: lo importante del mes en una pantalla; el detalle está en Metas, Presupuesto, Análisis y Consejos
function viewPlan() {
  const nb = Object.keys(S.budgets).length;
  return `
  ${spendCardHTML()}
  ${S.goals.length ? `<section class="card"><div class="card-head" style="margin-bottom:6px"><h2>Tus metas</h2><a href="#" data-action="go" data-id="metas" class="small">Ver detalle</a></div>${goalsMiniHTML()}</section>`
    : `<section class="card" style="text-align:center;padding:24px 20px">
    <h2 style="font-size:17px;margin-bottom:6px">¿A qué querés llegar?</h2>
    <p class="muted small" style="margin:0 auto 14px;max-width:420px">Poné cuánto querés juntar y te digo cuánto ahorrar por mes.</p>
    <button class="btn primary" data-action="addGoal">${icon('target', 16)} Crear mi meta</button></section>`}
  ${incomeSafetyHTML()}
  <div class="shortcuts">
    ${shortcutHTML('presupuesto', nb ? `${nb} tope${nb > 1 ? 's' : ''} este mes` : 'Poné topes por categoría')}
    ${shortcutHTML('analisis', 'En qué gastás')}
    ${shortcutHTML('consejos', 'Ahorrar y ganar más')}
    ${shortcutHTML('metas', 'Proyección y récord')}
  </div>`;
}

function goalForm(g) {
  const isNew = !g;
  g = g || { name: '', target: '', currency: 'USD', date: '', source: 'liquid' };
  openForm({
    title: isNew ? 'Nueva meta' : `Editar: ${g.name}`,
    fields: [
      { name: 'name', label: 'Nombre', value: g.name, required: true, placeholder: 'ej. Fondo de emergencia, Viaje, Laptop', full: true },
      { name: 'target', label: 'Monto a juntar', type: 'number', value: g.target, required: true },
      { name: 'currency', label: 'Moneda', type: 'select', value: g.currency, options: CURRENCIES.map(([c, n]) => [c, `${curLabel(c)} — ${n}`]) },
      { name: 'date', label: 'Para cuándo (opcional)', type: 'date', value: g.date || '', full: true },
      { name: 'source', label: '¿Con qué plata cuenta esta meta?', type: 'select', value: g.source || 'liquid', options: GOAL_SOURCES(), full: true },
      ...(isNew ? [] : [{ name: 'remove', label: 'Eliminar esta meta', type: 'checkbox', full: true }]),
    ],
    onSubmit: (v) => {
      if (v.remove) { S.goals = S.goals.filter((x) => x !== g); tombstone(g.id); save(); render(); return; }
      if (!(v.target > 0)) return 'El monto tiene que ser mayor a 0.';
      if (v.date && v.date <= todayISO()) return 'La fecha tiene que ser en el futuro.';
      const next = { name: v.name, target: v.target, currency: v.currency, date: v.date, source: v.source };
      if (isNew) S.goals.push({ id: uid(), created: new Date().toISOString(), ...next }); else Object.assign(g, next);
      save(); render();
    },
  });
}

/* ---------------- Registrar hablando o escribiendo ----------------
   Entiende frases como "almuerzo 25 bs, taxi 15 con efectivo y ayer me pagaron 500 del sueldo".
   Todo se interpreta en el teléfono, gratis y sin conexión (no usa ninguna API paga). */

const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const CAT_WORDS = [
  // Mascotas primero: "comida del perro" es de la mascota, no tuya
  ['Mascotas', 'perro perrito perrita gato gatito mascota mascotas veterinaria veterinario croquetas dog chow pedigree balanceado petshop'],
  ['Comida y salidas', 'almuerzo almorce cena cene desayuno desayune comida comi restaurante resto cafe cafecito pizza hamburguesa saltena saltenas tucumana pollo pollito delivery pedidosya snack helado bebida cerveza chela trago bar salchipapa api anticucho sandwich empanada gaseosa coca refresco jugo merienda'],
  ['Supermercado', 'super supermercado mercado hipermaxi fidalga ketal icnorte viveres verdura verduras fruta frutas abarrotes despensa'],
  ['Transporte', 'taxi uber yango indriver micro trufi minibus bus colectivo pasaje pasajes gasolina combustible nafta diesel teleferico parqueo estacionamiento peaje'],
  ['Servicios', 'luz agua internet wifi celular credito megas recarga telefono gas cable entel tigo viva'],
  ['Salud', 'farmacia medico doctor remedio medicamento pastillas dentista consulta clinica analisis'],
  ['Gimnasio / deporte', 'gym gimnasio deporte futbol cancha crossfit natacion piscina proteina'],
  ['Educación', 'universidad uni facultad curso libro libros fotocopias fotocopia colegio matricula clase clases udemy mensualidad pension upb ucb umsa emi unifranz semestre'],
  ['Suscripciones', 'netflix spotify youtube premium icloud chatgpt claude suscripcion disney hbo prime apple music'],
  ['Eventos y fiestas', 'carnaval comparsa fraternidad preste prestes morenada diablada caporales tinku tobas folklorica folklore cumpleanos boda matrimonio bautizo graduacion promocion aniversario kermes'],
  ['Ocio', 'cine juego juegos fiesta salida entrada concierto boliche videojuego steam playstation'],
  ['Compras', 'ropa zapatos zapatillas polera pantalon compre tienda amazon temu shein regalo audifonos'],
  ['Vivienda / alquiler', 'alquiler anticretico expensas'],
  ['Viajes', 'viaje hotel hostal pasaje avion boleto aereo'],
  ['Impuestos', 'impuesto impuestos tramite multa'],
];
const INC_WORDS = [
  ['Sueldo', 'sueldo salario pasantia trabajo quincena'],
  ['Mesada / familia', 'mesada papa padre mama madre familia abuelo abuela tio tia'],
  ['Freelance', 'freelance trabajito proyecto cliente diseno particulares'],
  ['Dividendos', 'dividendo dividendos'],
  ['Intereses', 'interes intereses rendimiento apy'],
  ['Venta de algo', 'vendi venta'],
  ['Regalo', 'regalo regalaron cumple cumpleanos'],
];
const INCOME_RX = /\b(me (pagaron|depositaron|dieron|mando|mandaron|transfirieron|llego|entro|regalaron|devolvieron)|cobre|recibi|gane|ingreso|ingresaron|entro|entraron|sueldo|salario|mesada)\b/;

// Números dichos en palabras (el dictado a veces escribe "veinticinco" en vez de "25")
const NUM_WORDS = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13,
  catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiun: 21, veintiuno: 21, veintidos: 22,
  veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40,
  cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400,
  quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900, mil: 1000,
};
function wordsToDigits(text) {
  // "3 mil" / "2,5 mil" → 3000 / 2500 (antes de convertir palabras, para no leer "3 1000")
  text = text.replace(/\b(\d+(?:[.,]\d+)?)\s*mil\b/g, (m, n) => String(Math.round(parseNum(n) * 1000)));
  // La "y" sólo se come dentro de un número ("treinta y cinco"), no entre dos gastos ("veinte y taxi")
  return text.replace(/\b(?:(?:un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieci\w+|veinte|veinti\w+|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|cien|ciento|\w+cientos|mil)(?:\s+y\s+(?=(?:uno|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b)|\s+|\b))+/g, (m) => {
    const words = m.trim().split(/\s+/).filter((w) => w !== 'y');
    if (!words.every((w) => NUM_WORDS[w] != null)) return m;
    if (words.length === 1 && ['un', 'una', 'uno'].includes(words[0])) return m; // "un almuerzo" no es un monto
    let total = 0, chunk = 0;
    for (const w of words) {
      const n = NUM_WORDS[w];
      if (n === 1000) { total += (chunk || 1) * 1000; chunk = 0; } else chunk += n;
    }
    return String(total + chunk) + (m.endsWith(' ') ? ' ' : '');
  });
}

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const isoOf = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };

function findDate(s) {
  const d = new Date();
  if (/\banteayer|antier\b/.test(s)) { d.setDate(d.getDate() - 2); return isoOf(d); }
  if (/\bayer|anoche\b/.test(s)) { d.setDate(d.getDate() - 1); return isoOf(d); }
  if (/\bhoy\b/.test(s)) return todayISO();
  const wd = s.match(/\b(?:el\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\b/);
  if (wd) { const diff = (d.getDay() - WEEKDAYS.indexOf(wd[1]) + 7) % 7 || 7; d.setDate(d.getDate() - diff); return isoOf(d); }
  const dm = s.match(/\b(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/);
  if (dm) { const mon = dm[2] === 'setiembre' ? 8 : MONTHS_ES.indexOf(dm[2]); const x = new Date(d.getFullYear(), mon, +dm[1]); if (x > d) x.setFullYear(x.getFullYear() - 1); return isoOf(x); }
  const sl = s.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (sl) { const yy = sl[3] ? (+sl[3] < 100 ? 2000 + +sl[3] : +sl[3]) : d.getFullYear(); return isoOf(new Date(yy, +sl[2] - 1, +sl[1])); }
  const el = s.match(/\bel\s+(?:dia\s+)?(\d{1,2})\b(?!\s*(?:bs|bolivianos|\$|dolares|usd|pesos|:))/);
  if (el && +el[1] >= 1 && +el[1] <= 31) { const x = new Date(d.getFullYear(), d.getMonth(), +el[1]); if (x > d) x.setMonth(x.getMonth() - 1); return isoOf(x); }
  return null;
}

function findTime(s) {
  let m = s.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?/);
  if (!m) m = s.match(/\ba\s+las?\s+(\d{1,2})(?:\s*y\s*(media|cuarto))?\s*(am|pm|de la manana|de la tarde|de la noche)?/);
  if (!m) m = s.match(/\b(\d{1,2})\s*(am|pm)\b/);
  if (m) {
    let h = +m[1];
    let min = m[2] === 'media' ? 30 : m[2] === 'cuarto' ? 15 : /^\d+$/.test(m[2] || '') ? +m[2] : 0;
    const suf = m[3] || (/^(am|pm)$/.test(m[2] || '') ? m[2] : '');
    if (/pm|tarde|noche/.test(suf) && h < 12) h += 12;
    if (/am|manana/.test(suf) && h === 12) h = 0;
    if (!suf && h >= 1 && h <= 6) h += 12; // "a las 3" casi siempre es de tarde
    if (h < 24 && min < 60) return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }
  if (/mediodia/.test(s)) return '13:00';
  if (/\b(en|por|de|a) la manana|temprano\b/.test(s)) return '09:00';
  if (/\b(en|por|a) la tarde\b/.test(s)) return '17:00';
  if (/\b(en|por|a) la noche|anoche\b/.test(s)) return '21:00';
  return null;
}

function findAccount(s) {
  const card = s.match(/\btarjeta\s*(\d)\b/);
  if (card) { const a = S.accounts.find((x) => norm(x.name) === `tarjeta ${card[1]}`); if (a) return a; }
  const generic = new Set(['tarjeta', 'efectivo', 'cuenta', 'credito', 'debito', 'banco', 'billetera', 'dolares', 'bolivianos', 'pesos', 'en', 'de', 'del', 'la', 'el', 'mi']);
  let best = null, bestLen = 0;
  for (const a of S.accounts) {
    for (const w of norm(`${a.name} ${a.institution || ''}`).split(/[^a-z0-9]+/)) {
      if (w.length >= 3 && !generic.has(w) && new RegExp(`\\b${w}\\b`).test(s) && w.length > bestLen) { best = a; bestLen = w.length; }
    }
  }
  if (best) return best;
  if (/\befectivo|cash|en mano\b/.test(s)) return 'efectivo';
  if (/\b(con|la)\s+tarjeta\b|\btarjeta de credito\b/.test(s)) return 'tarjeta'; // "crédito" a secas suele ser recarga del celular
  return null;
}

function defaultAccount(currency) {
  const byId = S.accounts.find((a) => a.id === S.settings.defaultAccountId);
  if (byId && (!currency || byId.currency === currency)) return byId;
  return S.accounts.find((a) => a.type === 'efectivo' && a.currency === currency)
    || S.accounts.find((a) => a.type !== 'credito' && a.currency === currency)
    || byId || S.accounts.find((a) => a.type === 'efectivo') || S.accounts.find((a) => a.type !== 'credito') || S.accounts[0];
}

function localParse(text) {
  const clean = wordsToDigits(norm(text));
  // Partes: por renglón, coma, punto y coma, "y", "también", "además"
  const parts = clean.split(/\n|;|,(?!\d)|\.\s|\s+(?:tambien|ademas|despues|luego)\s+|\s+y\s+(?=(?:\D*)\d)/).map((p) => p.trim()).filter(Boolean);
  const out = [];
  // "ayer: taxi 10, almuerzo 20" → "ayer" vale para lo que sigue; sólo si lo dijiste en la primera parte
  let ctxDate = parts.length ? findDate(parts[0]) : null;
  let carry = '';
  for (let raw of parts) {
    raw = (carry + ' ' + raw).trim();
    const date = findDate(raw);
    if (date) ctxDate = date;
    const time = findTime(raw);
    // Sacar fechas y horas antes de buscar el monto
    const s = raw.replace(/\b\d{1,2}:\d{2}\b|\ba\s+las?\s+\d{1,2}\b|\b\d{1,2}\s*(am|pm)\b|\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b|\bel\s+(dia\s+)?\d{1,2}\b(?!\s*(bs|bolivianos|\$|dolares|usd))|\b\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b|\btarjeta\s*\d\b/g, ' ');
    // De todos los números, el monto es el que tiene moneda; si ninguno la tiene, el más grande ("2 salteñas 16" → 16)
    const nums = [...s.matchAll(/(\$|us\$|usd\s*)?\s*(\d+(?:[.,]\d+)?)\s*(?:(k|lucas)\b)?\s*(bs\b|bob\b|bolivianos?\b|pesos\b|\$|usd\b|usdt\b|usdc\b|dolares\b|dolar\b|verdes\b)?/gi)]
      .filter((m) => parseNum(m[2]) > 0);
    const amt = nums.find((m) => m[1] || m[4]) || nums.sort((a, b) => parseNum(b[2]) - parseNum(a[2]))[0];
    if (!amt) { carry = raw; continue; }
    carry = '';
    let amount = parseNum(amt[2]);
    if (amt[3]) amount *= 1000;
    if (!(amount > 0)) continue;
    const curWord = `${amt[1] || ''} ${amt[4] || ''}`;
    let currency = /\$|usd|dolar|verde/.test(curWord) ? 'USD' : /bs|bob|bolivian|pesos/.test(curWord) ? S.settings.localCurrency : null;
    if (!currency && /\b(dolares|usd|usdt|usdc)\b/.test(raw)) currency = 'USD';
    const isIncome = INCOME_RX.test(raw);
    const words = [...customCatWords(isIncome ? 'ingreso' : 'gasto'), ...(isIncome ? INC_WORDS : CAT_WORDS)];
    let category = isIncome ? 'Otros ingresos' : 'Otros gastos';
    const catText = raw.replace(/\b(con )?(la )?tarjeta( de credito| de debito)?\b/g, ' '); // "con tarjeta de crédito" no es recarga de celular
    for (const [cat, list] of words) if (list.split(' ').some((w) => w.length > 2 && new RegExp(`\\b${w}\\b`).test(catText))) { category = cat; break; }
    let acc = findAccount(raw);
    if (acc === 'efectivo') acc = S.accounts.find((a) => a.type === 'efectivo' && (!currency || a.currency === currency)) || defaultAccount(currency);
    else if (acc === 'tarjeta') acc = S.accounts.find((a) => a.type === 'credito' || a.type === 'debito') || defaultAccount(currency);
    if (!acc) acc = defaultAccount(currency || S.settings.localCurrency);
    currency = currency || acc?.currency || S.settings.localCurrency;
    // Detalle: la frase sin montos, monedas ni palabras de relleno
    const accWords = acc ? norm(`${acc.name} ${acc.institution || ''}`).split(/[^a-z0-9]+/).filter((w) => w.length >= 3) : [];
    let note = raw.replace(amt[0], ' ')
      .replace(/\btarjeta\s*\d\b|\ba\s+las?\s+\d{1,2}(:\d{2})?\b|\b\d{1,2}:\d{2}\b|\b(en|por|de|a) la (manana|tarde|noche)\b|\b(el\s+)?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/g, ' ')
      .replace(/\b(gaste|pague|compre|cargue|me costo|costo|por|en|con|de|del|el|la|los|las|un|una|mi|me|hoy|ayer|anoche|anteayer|antier|bs|bolivianos|dolares|pesos|usd|efectivo|tarjeta|pagaron|dieron|dio|depositaron|recibi|cobre|llego|llegaron|entro|y)\b/g, ' ')
      .replace(/\b\d+([.,]\d+)?\b/g, ' ');
    for (const w of accWords) note = note.replace(new RegExp(`\\b${w}\\b`, 'g'), ' ');
    note = note.replace(/\s+/g, ' ').trim();
    note = note ? note[0].toUpperCase() + note.slice(1) : category;
    const d = date || ctxDate || todayISO();
    // Préstamos: "le presté 50 a Juan", "Juan me prestó 100", "le debo 20 a Ana"
    const notName = /^(la|las|el|los|mi|un|una|me|le|que|por|con)$/;
    const pick = (...rx) => { for (const r of rx) { const m = raw.match(r); if (m && !notName.test(m[1])) return m[1]; } return null; };
    const lentTo = pick(/\bpreste\b.*?\ba\s+([a-z]+)/, /\ble\s+preste\b\s+([a-z]+)/);
    const borrowedFrom = lentTo ? null : pick(/\b([a-z]+)\s+me\s+presto\b/, /\bme\s+presto\s+([a-z]+)/, /\ble\s+debo\b.*?\ba\s+([a-z]+)/);
    if (lentTo || borrowedFrom) {
      const person = (lentTo || borrowedFrom).replace(/^\w/, (c) => c.toUpperCase());
      const dir = lentTo ? 'preste' : 'debo';
      out.push({ type: dir === 'preste' ? 'gasto' : 'ingreso', amount, currency, category: dir === 'preste' ? 'Otros gastos' : 'Otros ingresos', accountId: acc?.id || '',
        date: d, time: time || nowTime(), note: dir === 'preste' ? `Préstamo a ${person}` : `Préstamo de ${person}`, loan: { dir, person } });
      continue;
    }
    out.push({ type: isIncome ? 'ingreso' : 'gasto', amount, currency, category, accountId: acc?.id || '', date: d, time: time || (d === todayISO() ? nowTime() : '12:00'), note: note.slice(0, 60) });
  }
  return out;
}

// JSON pegado desde tu chat de Claude (claude.ai)
function parseMovementsJSON(text) {
  const m = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (!m) return null;
  let data;
  try { data = JSON.parse(m[0]); } catch (e) { return null; }
  if (!Array.isArray(data)) data = data.movimientos || data.movements || [];
  return data.map((r) => {
    const type = /ingreso|income/i.test(r.tipo || r.type || '') ? 'ingreso' : 'gasto';
    const currency = String(r.moneda || r.currency || S.settings.localCurrency).toUpperCase().replace('BS', 'BOB');
    const accName = norm(r.cuenta || r.account || '');
    const acc = S.accounts.find((a) => a.id === (r.cuenta || r.account)) || S.accounts.find((a) => accName && norm(a.name).includes(accName)) || defaultAccount(currency);
    const cats = catsOf(type);
    const category = cats.find((c) => norm(c) === norm(r.categoria || r.category || '')) || (type === 'ingreso' ? 'Otros ingresos' : 'Otros gastos');
    return { type, amount: parseNum(r.monto ?? r.amount), currency, category, accountId: acc?.id || '', date: r.fecha || r.date || todayISO(), time: r.hora || r.time || nowTime(), note: r.detalle || r.note || category };
  }).filter((r) => r.amount > 0);
}

/* --- Ventana de chat --- */

let chatPending = []; // movimientos interpretados esperando confirmación
let recognizer = null;

const CHAT_CLAUDE_PROMPT = () => `Te voy a contar mis gastos e ingresos. Devolveme SOLO un bloque JSON con este formato (sin texto extra):
[{"tipo":"gasto","monto":25,"moneda":"BOB","categoria":"Comida y salidas","cuenta":"Efectivo en bolivianos","fecha":"${todayISO()}","hora":"13:30","detalle":"Almuerzo"}]
- tipo: "gasto" o "ingreso"
- moneda: BOB (bolivianos) o USD
- categoria (gastos): ${catsOf('gasto').join(', ')}
- categoria (ingresos): ${catsOf('ingreso').join(', ')}
- cuenta: una de estas: ${S.accounts.map((a) => a.name).join(', ')}
- fecha AAAA-MM-DD y hora HH:MM (si no lo digo, usá ahora)`;

function chatBubble(html, who = 'bot') {
  const log = $('#chatLog');
  if (!log) return;
  log.insertAdjacentHTML('beforeend', `<div class="bubble ${who}">${html}</div>`);
  log.scrollTop = log.scrollHeight;
}

function pendingCardsHTML() {
  const accOpts = (sel) => S.accounts.map((a) => `<option value="${a.id}" ${a.id === sel ? 'selected' : ''}>${esc(a.name)} (${curLabel(a.currency)})</option>`).join('');
  const catOpts = (type, sel) => catsOf(type).map((c) => `<option ${c === sel ? 'selected' : ''}>${esc(c)}</option>`).join('');
  return `<div class="pcards">${chatPending.map((p, i) => p.loan ? `
    <div class="pcard loan" data-i="${i}">
      <div class="pcard-top">
        <span class="tag">${icon('handshake', 14)} ${p.loan.dir === 'preste' ? 'Prestaste a' : 'Te prestó'}</span>
        <input data-k="person" value="${esc(p.loan.person)}" class="pperson">
        <button class="pdel" data-del="${i}" aria-label="Quitar">${icon('x', 16)}</button>
      </div>
      <div class="pcard-top">
        <input data-k="amount" inputmode="decimal" value="${esc(numInput(p.amount))}" class="pamount">
        <select data-k="currency">${CURRENCIES.map(([c]) => `<option value="${c}" ${c === p.currency ? 'selected' : ''}>${curLabel(c)}</option>`).join('')}</select>
      </div>
      <div class="pcard-row"><select data-k="accountId">${accOpts(p.accountId)}</select><input type="date" data-k="date" value="${p.date}"></div>
      <div class="small muted">Se anota en Cuentas → Préstamos (no cuenta como gasto ni ingreso).</div>
    </div>` : `
    <div class="pcard ${p.type}" data-i="${i}">
      <div class="pcard-top">
        <select data-k="type"><option value="gasto" ${p.type === 'gasto' ? 'selected' : ''}>Gasto</option><option value="ingreso" ${p.type === 'ingreso' ? 'selected' : ''}>Ingreso</option></select>
        <input data-k="amount" inputmode="decimal" value="${esc(numInput(p.amount))}" class="pamount">
        <select data-k="currency">${CURRENCIES.map(([c]) => `<option value="${c}" ${c === p.currency ? 'selected' : ''}>${curLabel(c)}</option>`).join('')}</select>
        <button class="pdel" data-del="${i}" aria-label="Quitar">${icon('x', 16)}</button>
      </div>
      <input data-k="note" value="${esc(p.note)}" placeholder="Detalle">
      <div class="pcard-row"><select data-k="category">${catOpts(p.type, p.category)}</select><select data-k="accountId">${accOpts(p.accountId)}</select></div>
      <div class="pcard-row"><input type="date" data-k="date" value="${p.date}"><input type="time" data-k="time" value="${p.time}"></div>
    </div>`).join('')}</div>
    <div class="toolbar" style="margin-top:8px"><button class="btn primary" data-chat="save">${icon('check', 16)} Guardar ${chatPending.length === 1 ? 'movimiento' : `${chatPending.length} movimientos`}</button>
      <button class="btn ghost" data-chat="discard">Descartar</button></div>`;
}

function readPendingFromDOM() {
  $$('#chatLog .pending-box .pcard').forEach((card) => {
    const p = chatPending[+card.dataset.i];
    if (!p) return;
    $$('[data-k]', card).forEach((el) => { p[el.dataset.k] = el.dataset.k === 'amount' ? parseNum(el.value) : el.value; });
  });
}

function renderPending() {
  const box = $('#chatLog .pending-box');
  if (!box) return;
  if (chatPending.length) box.innerHTML = pendingCardsHTML();
  else { box.className = 'saved-box'; box.innerHTML = '<span class="muted">Descartado.</span>'; }
}

async function handleChatSend() {
  const ta = $('#chatText');
  const text = ta.value.trim();
  if (!text) return;
  stopMic({ keepResult: false });
  ta.value = '';
  chatBubble(esc(text), 'me');
  let items = parseMovementsJSON(text);
  let via = 'tu chat de Claude';
  if (!items) {
    items = localParse(text);
    via = '';
  }
  if (!items.length) {
    chatBubble('No encontré montos en eso. Probá algo como <i>"almuerzo 25 bs y taxi 15 con efectivo"</i>.');
    return;
  }
  // Si ya había tarjetas sin guardar, se suman
  readPendingFromDOM();
  $$('#chatLog .pending-box').forEach((b) => b.closest('.bubble')?.remove());
  chatPending = [...chatPending, ...items];
  chatBubble(`Entendí esto${via ? ` <span class="muted small">(con ${via})</span>` : ''}. Revisá y tocá guardar:<div class="pending-box">${pendingCardsHTML()}</div>`);
}

function savePending() {
  readPendingFromDOM();
  const ok = chatPending.filter((p) => p.amount > 0 && S.accounts.some((a) => a.id === p.accountId));
  if (!ok.length) return toast('No hay movimientos válidos para guardar.');
  const touched = new Set();
  for (const p of ok) {
    const acc = S.accounts.find((a) => a.id === p.accountId);
    if (p.loan) {
      createLoan({ dir: p.loan.dir, person: (p.person || p.loan.person).replace(/^\w/, (c) => c.toUpperCase()), amount: p.amount, currency: p.currency, date: p.date, accountId: acc.id });
      touched.add(acc);
      continue;
    }
    const amount = convert(p.amount, p.currency, acc.currency);
    if (amount == null) { toast(NO_RATE, 4500); continue; }
    const tx = { id: uid(), created: new Date().toISOString(), type: p.type, date: p.date || todayISO(), time: p.time || '', accountId: acc.id, amount, category: p.category, note: p.note || p.category, via: 'chat' };
    // "Pagué el gym" o "me llegó la mesada" marca ese fijo como hecho en vez de sumarlo como extra
    // Sólo fijos sin día, y si el monto se parece (±25%) o dijiste su nombre ("cancha 50" no es el gym de 300)
    const rule = S.recurring.find((r) => {
      if (!repeats(r) || r.day || r.type !== p.type || r.category !== p.category || recurringTx(r, tx.date.slice(0, 7))) return false;
      const ruleUSD = toUSD(r.amount, r.currency), pUSD = toUSD(p.amount, p.currency);
      return (ruleUSD > 0 && Math.abs(pUSD - ruleUSD) / ruleUSD <= 0.25) || norm(p.note || '').includes(norm(r.name).split(' ')[0]);
    });
    if (rule) { tx.recurringId = rule.id; tx.note = rule.name; }
    S.transactions.push(tx);
    applyTx(tx, 1);
    touched.add(acc);
  }
  chatPending = [];
  $$('#chatLog .pending-box').forEach((b) => { b.className = 'saved-box'; b.innerHTML = `<span class="up">${icon('check', 16)} Guardado</span>`; });
  snapshot(); save(); render();
  const m = monthStats(currentMonth());
  chatBubble(`Listo, guardé ${ok.length} ${ok.length === 1 ? 'movimiento' : 'movimientos'}. ${[...touched].map((a) => `${esc(a.name)}: <b class="money">${fmtIn(a.balance, a.currency)}</b>`).join(' · ')}<br>
    <span class="muted small">Este mes llevás gastado <span class="money">${fmtMoney(m.expense)}</span>.</span>`);
}

/* --- Micrófono (dictado del iPhone / navegador) ---
   iOS a veces no avisa cuando termina de escuchar (si cerrás el chat, cambiás de app o no hablás).
   Por eso cada escucha se maneja por separado y hay un "seguro" que la libera sola,
   así el botón nunca queda trabado. */

let recWatch = null;
const SPEECH_LANGS = ['es-MX', 'es-ES', 'es-US', 'es-CL', 'es-CO', 'es-419'];
const speechLang = () => (SPEECH_LANGS.includes(navigator.language) ? navigator.language : 'es-MX');

function micUI(on, hint = '') {
  $('#chatMic')?.classList.toggle('rec', on);
  const h = $('#micHint');
  if (h) { h.textContent = hint; h.hidden = !hint; }
}

// Corta cualquier escucha (sin esperar a que iOS avise) y deja el botón listo para la próxima
function stopMic({ keepResult = false } = {}) {
  clearTimeout(recWatch);
  const r = recognizer;
  recognizer = null;
  micUI(false);
  if (!r) return;
  r._done = !keepResult;
  try { keepResult ? r.stop() : r.abort(); } catch (e) { /* ya estaba cortada */ }
}

function toggleMic({ autoSend = false } = {}) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const ta = $('#chatText');
  if (!ta) return;
  if (!SR) {
    ta.focus();
    toast('Tocá el micrófono del teclado para dictar.', 3500);
    return;
  }
  if (recognizer) { stopMic({ keepResult: true }); return; } // segundo toque = "ya terminé"

  ta.blur(); // con el teclado abierto, iOS a veces no le da el micrófono a la app
  const base = ta.value ? ta.value.trimEnd() + ' ' : '';
  const rec = new SR();
  rec.lang = speechLang();
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let heard = false;
  const arm = (ms) => { clearTimeout(recWatch); recWatch = setTimeout(() => { if (recognizer === rec) stopMic({ keepResult: heard }); }, ms); };

  rec.onstart = () => { if (recognizer === rec) micUI(true, 'Escuchando… hablá ahora'); };
  rec.onresult = (e) => {
    if (rec._done) return;
    heard = true;
    ta.value = base + [...e.results].map((r) => r[0].transcript).join('');
    ta.dispatchEvent(new Event('input'));
    if (recognizer === rec) { micUI(true, 'Escuchando… (tocá el micrófono cuando termines)'); arm(6000); }
  };
  rec.onerror = (e) => {
    if (rec._done || e.error === 'aborted') return;
    const msg = {
      'no-speech': 'No te escuché. Tocá el micrófono y hablá enseguida.',
      'not-allowed': 'MyFinance no tiene permiso para el micrófono. Revisá Ajustes del iPhone → Safari → Micrófono, o usá el micrófono del teclado.',
      'service-not-allowed': 'El dictado no está disponible ahora. Usá el micrófono del teclado.',
      'audio-capture': 'Otra app está usando el micrófono. Probá de nuevo.',
      'network': 'El dictado necesita internet. Probá de nuevo o usá el micrófono del teclado.',
      'language-not-supported': 'Tu iPhone no tiene el dictado en español activado. Usá el micrófono del teclado.',
    }[e.error] || 'El micrófono se cortó. Tocá de nuevo.';
    toast(msg, 5000);
  };
  rec.onend = () => {
    rec._done = true;
    if (recognizer === rec) { clearTimeout(recWatch); recognizer = null; micUI(false); }
    // Si lo abriste para hablar y dijiste algo, se interpreta solo (después revisás y guardás)
    if (heard && autoSend && $('#chatDlg')?.open && ta.value.trim()) handleChatSend();
  };

  recognizer = rec;
  micUI(true, 'Preparando el micrófono…');
  try {
    rec.start();
    arm(12000); // seguro: si en 12 s no escuchó nada ni avisó, se libera solo
  } catch (e) {
    recognizer = null;
    micUI(false);
    toast('El micrófono estaba ocupado. Tocá de nuevo.', 3500);
  }
}

function openChat({ listen = false } = {}) {
  stopMic(); // por si quedó una escucha trabada de antes
  const dlg = $('#chatDlg');
  const pend = pendingRecurring();
  dlg.innerHTML = `<div class="chat">
    <header class="chat-head"><div><b>Registrar</b><div class="muted small">Contame qué gastaste o qué te entró</div></div>
      <button class="btn ghost icon-btn" data-chat="close" aria-label="Cerrar">${icon('x')}</button></header>
    <div class="chat-log" id="chatLog">
      <div class="bubble bot">Decímelo como te salga, por ejemplo:<br><i>"Almuerzo 25 bs, taxi 15 y ayer a la noche cine 40 con la tarjeta 1"</i><br><i>"Me pagaron el sueldo, 500 bs"</i></div>
      ${pend.length ? `<div class="bubble bot">Pendientes de este mes:<div class="chips">${pend.map((r) => `<button class="chip" data-rec="${r.id}">${r.type === 'ingreso' ? 'Ya entró' : 'Ya pagué'}: ${esc(r.name)}</button>`).join('')}</div></div>` : ''}
    </div>
    <div id="micHint" class="mic-hint" hidden></div>
    <div class="chat-input">
      <button class="btn ghost icon-btn mic" id="chatMic" data-chat="mic" aria-label="Dictar">${icon('mic', 22)}</button>
      <textarea id="chatText" rows="1" placeholder="ej. Almuerzo 25 bs con efectivo"></textarea>
      <button class="btn primary icon-btn" data-chat="send" aria-label="Enviar">${icon('send', 20)}</button>
    </div>
    <div class="chat-foot">Se interpreta en tu teléfono, sin costo · <a href="#" data-chat="prompt">Usar mi chat de Claude</a></div>
  </div>`;
  chatPending = [];
  dlg.showModal();
  const ta = $('#chatText');
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } });
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; });
  dlg.onclick = async (e) => {
    const b = e.target.closest('[data-chat],[data-del],[data-rec]');
    if (!b) { if (e.target === dlg) dlg.close(); return; }
    e.preventDefault();
    if (b.dataset.del != null) { readPendingFromDOM(); chatPending.splice(+b.dataset.del, 1); renderPending(); return; }
    if (b.dataset.rec) { const r = S.recurring.find((x) => x.id === b.dataset.rec); if (r) { payRecurringForm(r); b.remove(); } return; }
    const act = b.dataset.chat;
    if (act === 'close') dlg.close();
    if (act === 'send') handleChatSend();
    if (act === 'mic') toggleMic();
    if (act === 'save') savePending();
    if (act === 'discard') { chatPending = []; renderPending(); }
    if (act === 'prompt') {
      try { await navigator.clipboard.writeText(CHAT_CLAUDE_PROMPT()); toast('Instrucciones copiadas: pegalas en tu chat de Claude y después pegá acá lo que te devuelva.', 6000); }
      catch (err) { chatBubble(`Copiá esto en tu chat de Claude:<pre class="prompt-box">${esc(CHAT_CLAUDE_PROMPT())}</pre>`); }
    }
  };
  // Cambiar Gasto/Ingreso cambia la lista de categorías
  dlg.onchange = (e) => {
    if (e.target.dataset.k !== 'type') return;
    readPendingFromDOM();
    const p = chatPending[+e.target.closest('.pcard').dataset.i];
    p.category = p.type === 'ingreso' ? 'Otros ingresos' : 'Otros gastos';
    renderPending();
  };
  dlg.onclose = () => stopMic();
  // Abierto desde un botón de micrófono: empieza a escuchar en el mismo toque
  if (listen) toggleMic({ autoSend: true });
  else setTimeout(() => ta.focus(), 50);
}

/* ---------------- Sincronización automática entre dispositivos (GitHub, cifrada) ----------------
   Tus datos se cifran en el teléfono con TU contraseña (AES-256) y se guardan en un Gist secreto de tu
   cuenta de GitHub. Sin la contraseña nadie puede leerlos, ni GitHub. Es gratis. */

const CLOUD_STORE = 'misFinanzas.cloud'; // { token, pass, gistId } — queda sólo en este dispositivo
const CLOUD_FILE = 'mis-finanzas.cifrado.json';
const cloudCfg = () => { try { return JSON.parse(localStorage.getItem(CLOUD_STORE) || 'null'); } catch (e) { return null; } };
const setCloudCfg = (c) => { try { c ? localStorage.setItem(CLOUD_STORE, JSON.stringify(c)) : localStorage.removeItem(CLOUD_STORE); } catch (e) { /* nada */ } };

function bufToB64(buf) {
  const a = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000));
  return btoa(s);
}
const b64ToBuf = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(pass, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function encryptState(pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // Se copia el estado ANTES de cifrar (tarda): si cambiás algo mientras tanto, queda para la próxima subida
  const json = JSON.stringify(S), edited = S.editedAt || '';
  const key = await deriveKey(pass, salt);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(json));
  // editedAt va sin cifrar: sólo una fecha, para saber qué versión es más nueva sin descifrar
  const content = JSON.stringify({ app: 'mis-finanzas', v: 1, editedAt: edited, kdf: 'PBKDF2-SHA256-250000', salt: bufToB64(salt), iv: bufToB64(iv), data: bufToB64(data) });
  return { content, edited };
}

async function decryptPayload(p, pass) {
  const key = await deriveKey(pass, b64ToBuf(p.salt));
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBuf(p.iv) }, key, b64ToBuf(p.data));
    return JSON.parse(new TextDecoder().decode(plain));
  } catch (e) { throw Object.assign(new Error('La contraseña de cifrado no coincide con la de tus datos en GitHub.'), { code: 'pass' }); }
}

async function gh(path, opts = {}, token = cloudCfg()?.token) {
  const r = await fetch('https://api.github.com' + path, {
    ...opts, cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  if (r.status === 401) throw Object.assign(new Error('El token de GitHub no es válido o venció.'), { code: 'auth' });
  if (r.status === 403 || r.status === 404) throw Object.assign(new Error('El token no tiene permiso de "gist" o el archivo no existe.'), { code: 'perm' });
  if (!r.ok) throw new Error(`GitHub respondió con un error (${r.status}).`);
  return r.json();
}

async function readGist(id, token) {
  const g = await gh(`/gists/${id}`, {}, token);
  const f = g.files?.[CLOUD_FILE];
  if (!f) return null;
  const text = f.truncated ? await (await fetch(f.raw_url, { cache: 'no-store' })).text() : f.content;
  try { const p = JSON.parse(text); return p.app === 'mis-finanzas' ? p : null; } catch (e) { return null; }
}

async function findGist(token) {
  for (let page = 1; page <= 5; page++) {
    const list = await gh(`/gists?per_page=100&page=${page}`, {}, token);
    const g = list.find((x) => x.files && x.files[CLOUD_FILE]);
    if (g) return g.id;
    if (list.length < 100) break;
  }
  return null;
}

// Cierra formularios abiertos antes de reemplazar los datos (si no, guardarían sobre objetos viejos)
const closeDialogs = () => $$('dialog[open]').forEach((d) => d.close());

/* Une los datos de otro dispositivo (R) con los de acá (S), sin perder nada de ninguno:
   - lo que el otro borró se borra acá (revirtiendo su efecto en el saldo)
   - movimientos nuevos del otro se agregan y se aplican a los saldos
   - cuentas, inversiones, fijos, metas y préstamos nuevos se agregan
   Si los dos editaron el MISMO elemento, queda la versión de este dispositivo. */
// Corregiste el saldo a mano en el otro dispositivo: se toma ese saldo y se le suman los movimientos que sólo están acá
function balanceFromRemote(acc, rAcc, R, dead) {
  const eff = (t) => txEffects(t).filter(([a]) => a.id === acc.id).reduce((s, [, d]) => s + d, 0);
  const remoteTx = new Map((R.transactions || []).map((t) => [t.id, t]));
  const remoteDead = new Set(R.deleted || []);
  let bal = Number(rAcc.balance) || 0;
  for (const t of S.transactions) {
    const rt = remoteTx.get(t.id);
    if (!rt) bal += eff(t); // registrado acá y no allá
    else if ((t.u || '') > (rt.u || '')) bal += eff(t) - eff(rt); // corregido acá después
  }
  for (const t of R.transactions || []) if (dead.has(t.id) && !remoteDead.has(t.id)) bal -= eff(t); // borrado acá
  return round2(bal);
}

function mergeRemote(R) {
  const dead = new Set([...(S.deleted || []), ...(R.deleted || [])]);
  const remoteDead = new Set(R.deleted || []);
  for (const t of S.transactions) if (remoteDead.has(t.id)) applyTx(t, -1);
  S.transactions = S.transactions.filter((t) => !dead.has(t.id));
  const have = new Set(S.transactions.map((t) => t.id));
  const newer = (r, l) => (r?.u || '') > (l?.u || '');
  const remoteTx = new Map((R.transactions || []).map((t) => [t.id, t]));
  // Movimientos corregidos en el otro dispositivo (ej. 50 → 45): se revierte el viejo y se aplica el nuevo
  for (const t of S.transactions) {
    const rt = remoteTx.get(t.id);
    if (!rt || !newer(rt, t)) continue;
    applyTx(t, -1);
    for (const f of Object.keys(t)) delete t[f];
    Object.assign(t, JSON.parse(JSON.stringify(rt)));
    applyTx(t, 1);
  }
  for (const t of R.transactions || []) {
    if (have.has(t.id) || dead.has(t.id)) continue;
    // El mismo fijo registrado solo en los dos dispositivos: queda uno
    if (t.recurringId && S.transactions.some((x) => x.recurringId === t.recurringId && x.date?.slice(0, 7) === t.date?.slice(0, 7))) { dead.add(t.id); continue; }
    if (t.scheduledId && S.transactions.some((x) => x.scheduledId === t.scheduledId)) { dead.add(t.id); continue; }
    S.transactions.push(t);
    applyTx(t, 1); // sólo afecta cuentas que ya existían acá; las cuentas nuevas traen su saldo
    // (las compras/ventas del otro dispositivo se unen más abajo, junto con las editadas o borradas)
  }
  for (const k of ['accounts', 'holdings', 'recurring', 'scheduled', 'goals', 'loans', 'customCats']) {
    S[k] = (S[k] || []).filter((x) => !dead.has(x.id));
    for (const x of S[k]) {
      const rx = (R[k] || []).find((y) => y.id === x.id);
      if (!rx) continue;
      // Saldo corregido a mano allá después que acá: gana ese saldo (más lo que registraste sólo acá)
      if (k === 'accounts' && (rx.balanceSetAt || '') > (x.balanceSetAt || '')) {
        x.balance = balanceFromRemote(x, rx, R, dead);
        x.balanceSetAt = rx.balanceSetAt;
      }
      if (!newer(rx, x)) continue;
      const keep = Object.fromEntries((STAMP_SKIP[k] || []).filter((f) => f in x).map((f) => [f, x[f]]));
      if (k === 'accounts') keep.balanceSetAt = x.balanceSetAt;
      for (const f of Object.keys(x)) delete x[f];
      Object.assign(x, JSON.parse(JSON.stringify(rx)), keep);
    }
    const ids = new Set(S[k].map((x) => x.id));
    for (const x of R[k] || []) if (!ids.has(x.id) && !dead.has(x.id)) S[k].push(x);
  }
  // Operaciones de inversión: nuevas, editadas (gana la más nueva) o borradas en cualquiera de los dos. Después se recalcula la posición
  for (const h of S.holdings) {
    const rh = (R.holdings || []).find((x) => x.id === h.id);
    const theirs = (rh?.trades || []).filter((tr) => !dead.has(tr.id));
    const touched = (h.trades || []).some((x) => dead.has(x.id)) || theirs.some((tr) => {
      const mine = (h.trades || []).find((x) => x.id === tr.id);
      return !mine || (tr.u || '') > (mine.u || '');
    });
    if (!touched) continue;
    changeTrades(h, (list) => {
      const out = list.filter((x) => !dead.has(x.id));
      for (const tr of theirs) {
        const i = out.findIndex((x) => x.id === tr.id);
        if (i < 0) out.push(JSON.parse(JSON.stringify(tr)));
        else if ((tr.u || '') > (out[i].u || '')) out[i] = JSON.parse(JSON.stringify(tr));
      }
      return out;
    });
  }
  // Devoluciones de préstamos registradas en el otro dispositivo
  for (const l of S.loans) {
    const rl = (R.loans || []).find((x) => x.id === l.id);
    if (!rl) continue;
    const key = (p) => `${p.date}|${p.amount}`;
    const mine = new Set((l.payments || []).map(key));
    for (const p of rl.payments || []) if (!mine.has(key(p))) (l.payments = l.payments || []).push(p);
    l.closed = loanRemaining(l) <= 0.005;
  }
  for (const r of S.recurring) {
    const rr = (R.recurring || []).find((x) => x.id === r.id);
    if (rr?.skip) r.skip = [...new Set([...(r.skip || []), ...rr.skip])];
  }
  S.checkins = [...new Set([...(S.checkins || []), ...(R.checkins || [])])];
  S.dayBudgets = mergeDayBudgets(S.dayBudgets, R.dayBudgets);
  // Mi plan: gana la versión editada más tarde
  if ((R.plan?.u || '') > (S.plan?.u || '')) S.plan = JSON.parse(JSON.stringify(R.plan));
  // Precios guardados día por día y correcciones de saldo: se juntan los de los dos dispositivos
  for (const [d, px] of Object.entries(R.priceLog || {})) S.priceLog[d] = { ...px, ...(S.priceLog?.[d] || {}) };
  S.priceHist = { ...(R.priceHist || {}), ...(S.priceHist || {}) };
  const seenFix = new Set((S.balanceLog || []).map((x) => x.id));
  for (const x of R.balanceLog || []) if (!seenFix.has(x.id)) S.balanceLog.push(x);
  S.budgets = { ...(R.budgets || {}), ...(S.budgets || {}) };
  S.deleted = [...dead].slice(-5000);
}

const CloudSync = {
  status: 'off', // off | ok | syncing | error
  error: '',
  timer: null,
  chain: Promise.resolve(),
  lastSync: null,
  lastPull: 0,
  enabled: () => !!cloudCfg()?.gistId,

  setStatus(st, error = '') {
    this.status = st;
    this.error = error;
    updateFileStatusUI();
    const box = $('#cloudSync');
    if (box) box.innerHTML = cloudSyncHTML();
  },

  // Después de cada cambio: sincroniza (que primero mira si el otro dispositivo subió algo)
  schedule() {
    if (!this.enabled()) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.timer = null; this.sync(); }, 1500);
  },

  push() { clearTimeout(this.timer); this.timer = null; return this.sync(); },

  async upload() {
    const c = cloudCfg();
    const { content, edited } = await encryptState(c.pass);
    await gh(`/gists/${c.gistId}`, { method: 'PATCH', body: JSON.stringify({ files: { [CLOUD_FILE]: { content } } }) });
    setCloudCfg({ ...cloudCfg(), base: edited });
    // Si registraste algo mientras se subía, se vuelve a subir
    if ((S.editedAt || '') > edited) this.schedule();
  },

  /* Compara las dos versiones contra la última que ambos vieron ("base"):
     sólo cambió el otro → se trae; sólo cambió este → se sube; cambiaron los dos → se unen y se sube. */
  sync({ quiet = true } = {}) {
    this.chain = this.chain.then(async () => {
      const c = cloudCfg();
      if (!c?.gistId) return;
      this.lastPull = Date.now();
      try {
        this.setStatus('syncing');
        const remote = await readGist(c.gistId);
        const base = c.base || '';
        const remoteChanged = remote && (remote.editedAt || '') > base;
        const data = remoteChanged ? await decryptPayload(remote, c.pass) : null;
        // Se vuelve a mirar después de descifrar (tarda): si registraste algo mientras tanto, se unen en vez de reemplazar
        const replace = remoteChanged && (!hasData() || (S.editedAt || '') <= base);
        if (!remote) await this.upload();
        else if (replace) {
          closeDialogs();
          const localDays = S.dayBudgets;
          S = migrate(data);
          S.dayBudgets = mergeDayBudgets(S.dayBudgets, localDays); // no se pierden los días guardados sólo acá
          S.editedAt = remote.editedAt || S.editedAt;
          setCloudCfg({ ...cloudCfg(), base: remote.editedAt || '' });
          save(false);
          render();
          toast('Datos actualizados desde tu otro dispositivo ✓');
        } else if (remoteChanged) {
          closeDialogs();
          mergeRemote(migrate(data));
          S.editedAt = new Date().toISOString();
          snapshot();
          save(false);
          await this.upload();
          render();
          toast('Uní los cambios de tus dos dispositivos ✓');
        } else if ((S.editedAt || '') > base) await this.upload();
        this.lastSync = new Date().toISOString();
        this.setStatus('ok');
        if (!quiet) toast('Sincronizado ✓');
      } catch (e) { this.setStatus('error', e.message); if (!quiet) toast(e.message, 5000); }
    });
    return this.chain;
  },

  async connect(token, pass) {
    this.setStatus('syncing');
    try {
      let id = await findGist(token);
      if (id) {
        const remote = await readGist(id, token);
        const data = remote ? await decryptPayload(remote, pass) : null;
        let choice = 'local';
        if (data && isValidData(data)) {
          choice = 'remote';
          if (hasData() && (remote.editedAt || '') !== (S.editedAt || '')) {
            // La configuración se guarda recién después de elegir, así nada se sincroniza antes
            choice = await chooseDlg('Ya tenés datos en GitHub',
              `Encontré tus datos sincronizados (última edición: ${fmtDateTime(remote.editedAt)}). Este dispositivo tiene datos del ${fmtDateTime(S.editedAt)}.`,
              [['merge', 'Unir los dos (recomendado: no se pierde nada)'], ['remote', 'Usar sólo los de GitHub'], ['local', 'Usar sólo los de este dispositivo']]);
            if (!choice) { this.setStatus('off'); return; }
          }
        }
        setCloudCfg({ token, pass, gistId: id, base: '' });
        if (choice === 'remote') {
          closeDialogs();
          const localDays = S.dayBudgets;
          S = migrate(data);
          S.dayBudgets = mergeDayBudgets(S.dayBudgets, localDays);
          S.editedAt = remote.editedAt || S.editedAt;
          setCloudCfg({ ...cloudCfg(), base: remote.editedAt || '' });
          save(false);
        } else {
          if (choice === 'merge') { mergeRemote(migrate(data)); snapshot(); }
          S.editedAt = new Date().toISOString();
          save(false);
          await this.upload();
        }
      } else {
        S.editedAt = S.editedAt || new Date().toISOString();
        const g = await gh('/gists', { method: 'POST', body: JSON.stringify({ description: 'MyFinance — datos cifrados', public: false, files: { [CLOUD_FILE]: { content: (await encryptState(pass)).content } } }) }, token);
        id = g.id;
        setCloudCfg({ token, pass, gistId: id, base: S.editedAt });
      }
      this.lastSync = new Date().toISOString();
      this.setStatus('ok');
      render();
      toast('Listo: tus datos se sincronizan solos entre tus dispositivos.', 4000);
    } catch (e) {
      if (e.code === 'pass' || e.code === 'auth' || e.code === 'perm') setCloudCfg(null);
      this.setStatus('error', e.message);
      toast(e.message, 5000);
    }
  },

  disconnect() { setCloudCfg(null); this.setStatus('off'); render(); },
};

function cloudSyncHTML() {
  const c = cloudCfg();
  if (!c?.gistId) {
    return `<p class="small" style="color:var(--text-2);margin-top:0">Tus datos se guardan solos y <b>cifrados con tu contraseña</b> en tu cuenta de GitHub (gratis),
      y cada dispositivo (iPhone y PC) se pone al día al abrir la app. Nadie más puede leerlos, ni GitHub.</p>
      <ol class="small" style="color:var(--text-2);padding-left:18px;margin:0 0 12px">
        <li>Entrá a <a href="https://github.com/settings/tokens/new?scopes=gist&description=Mis%20Finanzas" target="_blank" rel="noopener">este link de GitHub</a> (ya viene marcado sólo el permiso <b>gist</b>).</li>
        <li>En "Expiration" elegí <b>No expiration</b>, tocá <b>Generate token</b> y copiá el código (empieza con <code>ghp_</code>).</li>
        <li>Tocá <b>Activar</b>, pegalo y elegí una contraseña de cifrado. Usá <b>la misma contraseña</b> en todos tus dispositivos.</li></ol>
      ${CloudSync.status === 'error' ? `<div class="banner" style="margin-bottom:10px">⚠ ${esc(CloudSync.error)}</div>` : ''}
      <button class="btn primary" data-action="cloudConnect">${icon('sync', 16)} Activar sincronización</button>`;
  }
  const st = CloudSync.status === 'syncing' ? `<span class="status neutral">Sincronizando…</span>`
    : CloudSync.status === 'error' ? `<span class="status critical">⚠ ${esc(CloudSync.error)}</span>`
    : `<span class="status good">${icon('check', 14)} Activa</span>`;
  return `<p class="small" style="margin-top:0">${st}<br><span class="muted">Última sincronización: ${fmtDateTime(CloudSync.lastSync)}. Se cifra con tu contraseña antes de salir del dispositivo.</span></p>
    <div class="toolbar"><button class="btn sm" data-action="cloudNow">${icon('sync', 14)} Sincronizar ahora</button>
    <button class="btn sm ghost danger" data-action="cloudOff">Desactivar en este dispositivo</button></div>`;
}

function cloudConnectForm() {
  openForm({
    title: 'Sincronización automática',
    fields: [
      { name: 'token', label: 'Token de GitHub (permiso gist)', type: 'password', required: true, placeholder: 'ghp_…', full: true },
      { name: 'pass', label: 'Contraseña de cifrado', type: 'password', required: true, full: true, hint: 'Mínimo 8 caracteres. Si la olvidás, los datos en GitHub no se pueden recuperar (los de cada dispositivo siguen ahí).' },
      { name: 'pass2', label: 'Repetí la contraseña', type: 'password', required: true, full: true },
    ],
    submitLabel: 'Activar',
    onSubmit: (v) => {
      if (!/^(ghp_|github_pat_)\w+/.test(v.token)) return 'Ese token no parece de GitHub (empieza con "ghp_").';
      if (v.pass.length < 8) return 'La contraseña tiene que tener al menos 8 caracteres.';
      if (v.pass !== v.pass2) return 'Las contraseñas no coinciden.';
      setTimeout(() => CloudSync.connect(v.token.trim(), v.pass), 50);
    },
  });
}

/* ---------------- Bloqueo con Face ID / huella o PIN ---------------- */

const LOCK_STORE = 'misFinanzas.lock'; // { pinHash, salt, pinLen, credId } — sólo en este dispositivo
const lockCfg = () => { try { return JSON.parse(localStorage.getItem(LOCK_STORE) || 'null'); } catch (e) { return null; } };
const setLockCfg = (c) => { try { c ? localStorage.setItem(LOCK_STORE, JSON.stringify(c)) : localStorage.removeItem(LOCK_STORE); } catch (e) { /* nada */ } };
const LOCK_AFTER_MS = 60 * 1000;
const bioAvailable = () => !!(window.PublicKeyCredential && location.protocol === 'https:' && navigator.credentials);

async function sha256(text) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const Lock = {
  locked: false,
  hiddenAt: 0,
  entry: '',
  afterUnlock: [],
  enabled: () => !!lockCfg()?.pinHash,

  show() {
    if (!this.enabled()) return;
    closeDialogs(); // un formulario abierto quedaría por encima del bloqueo
    stopMic();
    this.locked = true;
    this.entry = '';
    document.body.classList.add('locked');
    const el = $('#lockScreen');
    const c = lockCfg();
    el.innerHTML = `<div class="lock-box">
      <img class="lock-logo" src="icons/logo-96.png" alt="">
      <h2>MyFinance</h2><p class="muted">Ingresá tu PIN</p>
      <div class="pin-dots">${Array.from({ length: c.pinLen }, () => '<i></i>').join('')}</div>
      <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-k="${n}">${n}</button>`).join('')}
        <button data-k="bio" ${c.credId && bioAvailable() ? '' : 'style="visibility:hidden"'} aria-label="Face ID">${icon('faceid', 26)}</button>
        <button data-k="0">0</button><button data-k="del" aria-label="Borrar">${icon('back', 24)}</button></div>
      <button class="link-btn" data-k="forgot">¿Olvidaste el PIN?</button>
    </div>`;
    el.hidden = false;
    el.onclick = (e) => {
      const b = e.target.closest('[data-k]');
      if (!b) return;
      const k = b.dataset.k;
      if (k === 'bio') this.bio();
      else if (k === 'del') { this.entry = this.entry.slice(0, -1); this.paint(); }
      else if (k === 'forgot') this.forgot();
      else if (this.entry.length < c.pinLen) { this.entry += k; this.paint(); if (this.entry.length === c.pinLen) this.check(); }
    };
  },

  paint() { $$('#lockScreen .pin-dots i').forEach((d, i) => d.classList.toggle('on', i < this.entry.length)); },

  async check() {
    const c = lockCfg();
    if (await sha256(c.salt + this.entry) === c.pinHash) return this.unlock();
    const dots = $('#lockScreen .pin-dots');
    dots.classList.add('shake');
    setTimeout(() => { dots.classList.remove('shake'); this.entry = ''; this.paint(); }, 450);
  },

  async bio() {
    const c = lockCfg();
    try {
      await navigator.credentials.get({ publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: 'public-key', id: b64ToBuf(c.credId) }],
        userVerification: 'required', timeout: 60000,
      } });
      this.unlock();
    } catch (e) { toast('No se pudo verificar. Usá tu PIN.'); }
  },

  forgot() {
    openForm({
      title: '¿Olvidaste el PIN?',
      fields: [{ type: 'html', html: `<p style="margin:0">Por seguridad no se puede ver el PIN. Podés <b>borrar los datos de este dispositivo</b> y quitar el bloqueo.
        ${CloudSync.enabled() ? 'Tus datos siguen guardados en GitHub y vuelven solos al abrir la app.' : 'Si no tenés respaldo ni sincronización, se pierden.'}</p>` }],
      submitLabel: 'Borrar datos de este dispositivo', danger: true,
      onSubmit: () => {
        try { localStorage.removeItem(STORE_KEY); } catch (e) { /* nada */ }
        if (cloudCfg()) setCloudCfg({ ...cloudCfg(), base: '' }); // al abrir, trae tus datos de GitHub
        setLockCfg(null);
        location.reload();
      },
    });
  },

  unlock() {
    this.locked = false;
    document.body.classList.remove('locked', 'veiled');
    $('#lockScreen').hidden = true;
    const fns = this.afterUnlock.splice(0);
    fns.forEach((f) => f());
  },

  // Corre f ahora, o apenas se desbloquee
  then(f) { if (this.locked) this.afterUnlock.push(f); else f(); },
};

function lockSettingsHTML() {
  const c = lockCfg();
  if (!c?.pinHash) {
    return `<p class="small" style="color:var(--text-2);margin-top:0">Pide un PIN (o Face ID / huella) al abrir la app y cuando volvés después de 1 minuto.
      Se configura por dispositivo.</p><button class="btn primary" data-action="lockOn">${icon('lock', 16)} Activar bloqueo</button>`;
  }
  return `<p class="small" style="margin-top:0"><span class="status good">${icon('check', 14)} Bloqueo activo</span> · PIN de ${c.pinLen} dígitos${c.credId ? ' · Face ID / huella activado' : ''}</p>
    <div class="toolbar">
      ${bioAvailable() ? `<button class="btn sm" data-action="${c.credId ? 'bioOff' : 'bioOn'}">${icon('faceid', 16)} ${c.credId ? 'Quitar Face ID' : 'Usar Face ID / huella'}</button>` : '<span class="muted small">Face ID funciona en la app instalada (https).</span>'}
      <button class="btn sm" data-action="lockOn">Cambiar PIN</button>
      <button class="btn sm ghost danger" data-action="lockOff">Quitar bloqueo</button></div>`;
}

function pinForm(onDone) {
  openForm({
    title: 'Elegí un PIN',
    fields: [
      { name: 'pin', label: 'PIN (4 a 6 números)', type: 'password', required: true, full: true },
      { name: 'pin2', label: 'Repetí el PIN', type: 'password', required: true, full: true },
    ],
    onSubmit: (v) => {
      if (!/^\d{4,6}$/.test(v.pin)) return 'El PIN tiene que tener de 4 a 6 números.';
      if (v.pin !== v.pin2) return 'Los PIN no coinciden.';
      const salt = bufToB64(crypto.getRandomValues(new Uint8Array(16)));
      sha256(salt + v.pin).then((pinHash) => {
        setLockCfg({ ...(lockCfg() || {}), pinHash, salt, pinLen: v.pin.length });
        render();
        toast('Bloqueo activado.');
        onDone?.();
      });
    },
  });
  $$('#dlgForm input[type=password]').forEach((i) => { i.inputMode = 'numeric'; i.maxLength = 6; });
}

async function enableBio() {
  try {
    const cred = await navigator.credentials.create({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: 'MyFinance', id: location.hostname },
      user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'mis-finanzas', displayName: 'MyFinance' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
      timeout: 60000,
    } });
    setLockCfg({ ...lockCfg(), credId: bufToB64(cred.rawId) });
    render();
    toast('Face ID / huella activado.');
  } catch (e) { toast('No se pudo activar Face ID en este dispositivo.'); }
}

/* ---------------- Hábito: racha de días registrando ---------------- */

function activeDays() {
  const set = new Set(S.checkins || []);
  for (const t of S.transactions) if (t.date) set.add(t.date);
  return set;
}

function streak() {
  const set = activeDays();
  const d = new Date();
  if (!set.has(isoOf(d))) d.setDate(d.getDate() - 1); // hoy todavía no cuenta como cortada
  let n = 0;
  while (set.has(isoOf(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function bestStreak() {
  const days = [...activeDays()].sort();
  let best = 0, cur = 0, prev = null;
  for (const d of days) {
    cur = prev && (Date.parse(d) - Date.parse(prev)) / 864e5 === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

function habitHTML() {
  const today = todayISO();
  const doneToday = activeDays().has(today);
  const n = streak();
  const late = new Date().getHours() >= 19;
  return `<div class="habit ${doneToday ? 'done' : ''}">
    <span class="habit-ico">${icon('flame', 20)}</span>
    <div class="grow"><b>${n} ${n === 1 ? 'día seguido' : 'días seguidos'} registrando</b>
      <div class="small muted">${doneToday ? 'Hoy ya registraste ✓' : late ? '¿Registraste lo de hoy?' : 'Registrá lo de hoy para sumar un día'} · récord: ${Math.max(n, bestStreak())}</div></div>
    ${doneToday ? '' : `<button class="btn sm" data-action="checkin">Hoy no gasté</button>`}
  </div>`;
}

/* ---------------- Devaluación: tu plata frente al dólar ---------------- */


function logRate() {
  const cur = S.settings.localCurrency;
  const r = rate(cur);
  if (USD_PEGGED.has(cur) || !r) return;
  S.rateLog = S.rateLog || [];
  const today = todayISO();
  const last = S.rateLog[S.rateLog.length - 1];
  if (last && last.date === today) { last.rate = r; last.cur = cur; } else S.rateLog.push({ date: today, cur, rate: r });
  if (S.rateLog.length > 2000) S.rateLog.shift();
}

function fxCardHTML() {
  const n2 = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cur = S.settings.localCurrency;
  const r = rate(cur);
  if (USD_PEGGED.has(cur) || !r) return '';
  const accs = S.accounts.filter((a) => a.type !== 'credito');
  const local = accs.filter((a) => a.currency === cur).reduce((s, a) => s + Math.max(0, Number(a.balance) || 0), 0);
  const liquid = accs.reduce((s, a) => s + Math.max(0, toUSD(a.balance, a.currency)), 0);
  const pct = liquid ? (toUSD(local, cur) / liquid) * 100 : 0;
  const log = (S.rateLog || []).filter((x) => x.cur === cur);
  const first = log[0];
  const ch = first && first.rate !== r ? (r / first.rate - 1) * 100 : null;
  const lost = first ? local / first.rate - local / r : 0;
  return `<section class="card"><div class="card-head" style="margin-bottom:10px"><h2>Tu plata frente al dólar</h2><span class="muted small">${curLabel(cur)} ${n2(r)} por US$</span></div>
    <div class="fx-row"><span>En ${cur === 'BOB' ? 'bolivianos' : cur}</span><b class="money">${fmtIn(local, cur)}</b><span class="muted small">${fmtPct(pct, false)} de tu liquidez</span></div>
    <div class="meter"><div style="width:${Math.min(100, pct)}%;background:var(--c2)"></div></div>
    <div class="small" style="margin-top:10px;color:var(--text-2)">
      ${ch != null ? `Desde el ${fmtDate(first.date)} el dólar pasó de ${curLabel(cur)} ${n2(first.rate)} a ${n2(r)} (<b class="${ch > 0 ? 'down' : 'up'}">${fmtPct(ch)}</b>):
        tus ${fmtIn(local, cur)} ${lost > 0 ? `valen <b class="money down">US$ ${n2(lost)} menos</b>` : `valen <b class="money up">US$ ${n2(-lost)} más</b>`}.` : 'Con los días vas a ver acá cuánto cambia el valor de tu plata.'}
    </div></section>`;
}

/* ---------------- Próximos pagos y cobros ---------------- */

function nextMonthlyDate(day, fromISO) {
  let m = fromISO.slice(0, 7);
  for (let i = 0; i < 2; i++) {
    const d = `${m}-${String(Math.min(day, daysInMonth(m))).padStart(2, '0')}`;
    if (d >= fromISO) return d;
    m = addMonths(m, 1);
  }
  return null;
}

function upcomingItems(days = 30) {
  const today = todayISO();
  const end = isoOf(Date.now() + days * 864e5);
  const out = [];
  for (const r of S.recurring) {
    if (r.day && repeats(r)) {
      let d = nextMonthlyDate(r.day, today);
      if (d && recurringTx(r, d.slice(0, 7))) d = nextMonthlyDate(r.day, `${addMonths(d.slice(0, 7), 1)}-01`);
      if (d && d <= end) out.push({ date: d, name: r.name, amount: r.amount, currency: r.currency, type: r.type, kind: 'Fijo' });
    }
  }
  for (const r of pendingRecurring()) out.push({ date: `${currentMonth()}-${String(daysInMonth(currentMonth())).padStart(2, '0')}`, name: r.name, amount: r.amount, currency: r.currency, type: r.type, kind: 'Fijo sin día', undated: true, recId: r.id });
  for (const s of schedPending()) if (s.date <= end) out.push({ date: s.date, name: s.name, amount: s.amount, currency: s.currency, type: 'gasto', kind: 'Programado', schedId: s.id, overdue: s.date < today });
  for (const a of S.accounts) {
    if (a.type === 'credito' && Number(a.balance) > 0 && Number(a.dueDay)) {
      const d = nextMonthlyDate(Number(a.dueDay), today);
      if (d && d <= end) out.push({ date: d, name: `Pagar ${a.name}`, amount: a.balance, currency: a.currency, type: 'gasto', kind: 'Tarjeta', accId: a.id });
    }
  }
  for (const l of S.loans || []) {
    const rem = loanRemaining(l);
    if (l.closed || rem <= 0 || !l.dueDate || l.dueDate > end) continue;
    out.push({ date: l.dueDate, name: l.dir === 'preste' ? `${l.person} te devuelve` : `Devolverle a ${l.person}`, amount: rem, currency: l.currency, type: l.dir === 'preste' ? 'ingreso' : 'gasto', kind: 'Préstamo', loanId: l.id, overdue: l.dueDate < today });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

function daysUntil(iso) {
  const n = Math.round((Date.parse(iso) - Date.parse(todayISO())) / 864e5);
  return n < 0 ? `vencido hace ${-n} día${n === -1 ? '' : 's'}` : n === 0 ? 'hoy' : n === 1 ? 'mañana' : `en ${n} días`;
}

function upcomingHTML() {
  const items = upcomingItems(30);
  if (!items.length) return '';
  return `<section class="card"><div class="card-head" style="margin-bottom:6px"><h2>Próximos 30 días</h2><span class="muted small">pagos y cobros</span></div>
    <div class="list">${items.slice(0, 8).map((it) => {
      const soon = !it.undated && (it.overdue || Math.round((Date.parse(it.date) - Date.parse(todayISO())) / 864e5) <= 3);
      const btn = it.recId ? `<button class="btn sm primary" data-action="payRecurring" data-id="${it.recId}">${it.type === 'ingreso' ? 'Ya entró' : 'Ya pagué'}</button>`
        : it.accId ? `<button class="btn sm primary" data-action="payCard" data-id="${it.accId}">Pagar</button>`
        : it.loanId ? `<button class="btn sm primary" data-action="loanPay" data-id="${it.loanId}">Registrar</button>`
        : it.schedId ? `<button class="btn sm primary" data-action="paySched" data-id="${it.schedId}">Ya pagué</button>` : '';
      return `<div class="list-row act ${soon && it.type === 'gasto' ? 'soon' : ''}">
        <span class="acc-ico sm ${it.type === 'ingreso' ? 'in' : ''}">${icon(it.kind === 'Tarjeta' ? 'card' : it.kind === 'Préstamo' ? 'handshake' : 'calendar', 16)}</span>
        <div class="grow"><div class="name">${esc(it.name)}</div><div class="meta">${it.undated ? 'Fijo · pendiente este mes' : `${it.kind} · ` + `${fmtDate(it.date)} · <b class="${soon ? 'warn-text' : ''}">${daysUntil(it.date)}</b>`}</div></div>
        <span class="money ${it.type === 'ingreso' ? 'up' : ''}">${it.type === 'ingreso' ? '+' : '−'}${fmtIn(it.amount, it.currency)}</span>${btn}</div>`;
    }).join('')}</div></section>`;
}

function dueSoonBanner() {
  const urgent = upcomingItems(3).filter((it) => it.type === 'gasto' && !it.undated);
  if (!urgent.length) return '';
  return `<div class="banner">${icon('alert', 16)} ${urgent.map((it) => `<b>${esc(it.name)}</b> ${daysUntil(it.date)} (${fmtIn(it.amount, it.currency)})`).join(' · ')}</div>`;
}

/* ---------------- Cierre de mes ---------------- */

function monthCloseHTML(m) {
  const ms = monthStats(m);
  const prev = monthStats(addMonths(m, -1));
  const saving = ms.income - ms.expense;
  const rateM = ms.income ? (saving / ms.income) * 100 : null;
  const prevSaving = prev.income - prev.expense;
  // Récord: mejor ahorro mensual antes de este mes
  const first = S.transactions.reduce((min, t) => (t.date && t.date < min ? t.date : min), m).slice(0, 7);
  let record = null;
  for (let k = first; k < m; k = addMonths(k, 1)) {
    const s = monthStats(k);
    if ((s.income || s.expense) && (record == null || s.income - s.expense > record)) record = s.income - s.expense;
  }
  const cats = Object.entries(ms.byCat).sort((a, b) => b[1] - a[1]);
  const over = Object.entries(S.budgets).filter(([c, b]) => (ms.byCat[c] || 0) > toUSD(b.amount, b.currency));
  const days = [...activeDays()].filter((d) => d.startsWith(m)).length;
  const st = savingsStatus(rateM);
  const lines = [];
  if (record != null) lines.push(saving > record + 0.005 ? ['★', `¡Nuevo récord! Superaste tu mejor mes (${fmtMoney(record)}).`]
    : Math.abs(saving - record) <= 0.005 ? ['★', '¡Igualaste tu mejor mes!']
    : ['🏁', `Tu mejor mes sigue siendo ${fmtMoney(record)}: te faltaron ${fmtMoney(record - saving)}.`]);
  if ((prev.income || prev.expense) && Math.abs(saving - prevSaving) > 0.005) lines.push([saving >= prevSaving ? '📈' : '📉', `Ahorraste ${fmtMoney(Math.abs(saving - prevSaving))} ${saving >= prevSaving ? 'más' : 'menos'} que el mes anterior.`]);
  if (cats.length) lines.push(['🥇', `Tu mayor gasto fue ${esc(cats[0][0])}: ${fmtMoney(cats[0][1])} (${fmtPct((cats[0][1] / ms.expense) * 100, false)}).`]);
  if (over.length) lines.push(['⚠', `Te pasaste del presupuesto en ${over.map(([c]) => esc(c)).join(', ')}.`]);
  lines.push(['🔥', `Registraste ${days} de ${daysInMonth(m)} días.`]);
  for (const g of S.goals) { const M = goalMath(g, planNumbers()); lines.push(['🎯', `${esc(g.name)}: vas ${fmtNum(M.pct, 0)}% (${fmtMoney(M.current)} de ${fmtIn(g.target, g.currency)}).`]); }
  return `<div class="close-grid">
      <div><span class="muted small">Ingresos</span><b class="money">${fmtMoney(ms.income)}</b></div>
      <div><span class="muted small">Gastos</span><b class="money">${fmtMoney(ms.expense)}</b></div>
      <div><span class="muted small">Ahorro</span><b class="money ${cls(saving)}">${fmtMoney(saving, { sign: true })}</b></div>
      <div><span class="muted small">Tasa de ahorro</span><b>${rateM != null ? fmtPct(rateM, false) : '—'}</b> ${statusPill(st)}</div>
    </div>
    <div class="insights" style="margin-top:14px">${lines.map(([i, t]) => `<div class="insight"><span class="ins-ico">${i}</span><div class="small">${t}</div></div>`).join('')}</div>`;
}

function showMonthClose(m) {
  openForm({ title: `Cierre de ${monthLabel(m, 'long')} ${m.slice(0, 4)}`, fields: [{ type: 'html', html: monthCloseHTML(m) }], submitLabel: 'Listo', onSubmit: () => {} });
  $('#dlgForm [data-close]').style.display = 'none';
}

// El primer día que abrís la app en un mes nuevo, te muestra el resumen del mes que terminó
function maybeMonthClose() {
  const prev = addMonths(currentMonth(), -1);
  if (S.settings.lastClosedMonth === prev) return;
  const s = monthStats(prev);
  S.settings.lastClosedMonth = prev;
  save(false);
  if (s.income || s.expense) Lock.then(() => setTimeout(() => { if (!$('#dlg').open) showMonthClose(prev); }, 900));
}

/* ---------------- Préstamos ---------------- */

const loanRemaining = (l) => round2((Number(l.amount) || 0) - (l.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0));

// Mueve plata de una cuenta por un préstamo, sin contarlo como gasto ni ingreso
function loanTx(l, kind, amount, accountId, date) {
  const acc = S.accounts.find((a) => a.id === accountId);
  if (!acc) return null;
  const out = (l.dir === 'preste') === (kind === 'start'); // prestar o devolver lo que debo = sale plata
  const amt = convert(amount, l.currency, acc.currency);
  if (amt == null) { toast(NO_RATE, 4500); return null; }
  const tx = { id: uid(), created: new Date().toISOString(), type: out ? 'gasto' : 'ingreso', date: date || todayISO(), time: nowTime(), accountId: acc.id,
    amount: amt, category: out ? 'Otros gastos' : 'Otros ingresos', loan: true, loanId: l.id, loanKind: kind,
    note: kind === 'start' ? (l.dir === 'preste' ? `Préstamo a ${l.person}` : `Préstamo de ${l.person}`) : (l.dir === 'preste' ? `${l.person} me devolvió` : `Le devolví a ${l.person}`) };
  S.transactions.push(tx);
  applyTx(tx, 1);
  return tx;
}

function createLoan({ dir, person, amount, currency, date, dueDate, accountId, note }) {
  const l = { id: uid(), dir, person, amount, currency, date: date || todayISO(), dueDate: dueDate || '', accountId: accountId || '', note: note || '', payments: [], closed: false };
  S.loans.push(l);
  if (accountId) loanTx(l, 'start', amount, accountId, l.date);
  return l;
}

function loanForm(l) {
  const isNew = !l;
  l = l || { dir: 'preste', person: '', amount: '', currency: S.settings.localCurrency, date: todayISO(), dueDate: '', accountId: S.accounts.find((a) => a.type === 'efectivo')?.id || '', note: '' };
  openForm({
    title: isNew ? 'Nuevo préstamo' : `Préstamo: ${l.person}`,
    fields: [
      { name: 'dir', label: 'Tipo', type: 'select', value: l.dir, full: true, options: [['preste', 'Yo presté (me tienen que devolver)'], ['debo', 'Me prestaron (tengo que devolver)']] },
      { name: 'person', label: 'Persona', value: l.person, required: true, placeholder: 'ej. Juan' },
      { name: 'amount', label: 'Monto', type: 'number', value: l.amount, required: true },
      { name: 'currency', label: 'Moneda', type: 'select', value: l.currency, options: CURRENCIES.map(([c, n]) => [c, `${curLabel(c)} — ${n}`]) },
      { name: 'date', label: 'Fecha', type: 'date', value: l.date },
      { name: 'dueDate', label: 'Fecha para devolver (opcional)', type: 'date', value: l.dueDate },
      ...(isNew ? [{ name: 'accountId', label: '¿De qué cuenta salió / a cuál entró?', type: 'select', value: l.accountId, full: true,
        options: [['', '— No mover plata de ninguna cuenta —'], ...S.accounts.filter((a) => a.type !== 'credito').map((a) => [a.id, `${a.name} (${curLabel(a.currency)})`])] }] : []),
      { name: 'note', label: 'Nota', value: l.note, full: true, placeholder: 'Opcional' },
      ...(isNew ? [] : [{ name: 'remove', label: 'Eliminar este préstamo (revierte lo que movió en tus cuentas)', type: 'checkbox', full: true }]),
    ],
    onSubmit: (v) => {
      if (v.remove) {
        for (const t of S.transactions.filter((x) => x.loanId === l.id)) applyTx(t, -1);
        for (const t of S.transactions) if (t.loanId === l.id) tombstone(t.id);
        S.transactions = S.transactions.filter((x) => x.loanId !== l.id);
        tombstone(l.id);
        S.loans = S.loans.filter((x) => x !== l);
        snapshot(); save(); render(); return;
      }
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      const person = v.person.replace(/^\w/, (c) => c.toUpperCase());
      if (isNew) createLoan({ ...v, person });
      else {
        // Si cambia el monto, la moneda o el tipo, se rehace lo que salió/entró de la cuenta al prestar
        const moved = v.amount !== Number(l.amount) || v.currency !== l.currency || v.dir !== l.dir;
        const start = S.transactions.find((t) => t.loanId === l.id && (t.loanKind === 'start' || (!t.loanKind && /^Préstamo/.test(t.note))));
        if (moved && start) {
          const acc = S.accounts.find((a) => a.id === start.accountId);
          if (acc && convert(v.amount, v.currency, acc.currency) == null) return NO_RATE;
          applyTx(start, -1);
          S.transactions = S.transactions.filter((t) => t !== start);
          tombstone(start.id);
        }
        Object.assign(l, { dir: v.dir, person, amount: v.amount, currency: v.currency, date: v.date, dueDate: v.dueDate, note: v.note, closed: loanRemaining({ ...l, amount: v.amount }) <= 0 });
        if (moved && start) loanTx(l, 'start', v.amount, start.accountId, l.date);
      }
      snapshot(); save(); render();
    },
  });
}

function loanPayForm(l) {
  const rem = loanRemaining(l);
  openForm({
    title: l.dir === 'preste' ? `¿Cuánto te devolvió ${l.person}?` : `Devolverle a ${l.person}`,
    fields: [
      { type: 'html', html: `<div class="muted small">Falta: <b class="money">${fmtIn(rem, l.currency)}</b> de ${fmtIn(l.amount, l.currency)}</div>` },
      { name: 'amount', label: `Monto (${curLabel(l.currency)})`, type: 'number', value: rem, required: true },
      { name: 'date', label: 'Fecha', type: 'date', value: todayISO() },
      { name: 'accountId', label: l.dir === 'preste' ? '¿A qué cuenta entró?' : '¿De qué cuenta salió?', type: 'select', value: l.accountId || S.accounts.find((a) => a.type === 'efectivo')?.id, full: true,
        options: [['', '— No mover plata de ninguna cuenta —'], ...S.accounts.filter((a) => a.type !== 'credito').map((a) => [a.id, `${a.name} (${curLabel(a.currency)})`])] },
    ],
    submitLabel: 'Registrar',
    onSubmit: (v) => {
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      l.payments = l.payments || [];
      l.payments.push({ date: v.date || todayISO(), amount: v.amount });
      if (v.accountId) loanTx(l, 'pay', v.amount, v.accountId, v.date);
      if (loanRemaining(l) <= 0.005) l.closed = true;
      snapshot(); save(); render();
      toast(l.closed ? 'Préstamo saldado ✓' : `Registrado. Falta ${fmtIn(loanRemaining(l), l.currency)}.`);
    },
  });
}

function loansHTML() {
  const open = (S.loans || []).filter((l) => !l.closed && loanRemaining(l) > 0);
  const closed = (S.loans || []).filter((l) => l.closed || loanRemaining(l) <= 0);
  const lent = open.filter((l) => l.dir === 'preste').reduce((s, l) => s + toUSD(loanRemaining(l), l.currency), 0);
  const owed = open.filter((l) => l.dir === 'debo').reduce((s, l) => s + toUSD(loanRemaining(l), l.currency), 0);
  const row = (l) => {
    const rem = loanRemaining(l);
    const overdue = !l.closed && l.dueDate && l.dueDate < todayISO();
    return `<div class="list-row act">
      <span class="acc-ico sm ${l.dir === 'preste' ? 'in' : ''}">${icon('handshake', 16)}</span>
      <div class="grow"><div class="name">${esc(l.person)} <span class="muted small">· ${l.dir === 'preste' ? 'te debe' : 'le debés'}</span></div>
        <div class="meta">${fmtDate(l.date)}${l.dueDate ? ` · devolver: <span class="${overdue ? 'down' : ''}">${fmtDate(l.dueDate)}${overdue ? ' (vencido)' : ''}</span>` : ''}${l.note ? ` · ${esc(l.note)}` : ''}</div></div>
      <div class="val"><div class="money ${l.dir === 'preste' ? 'up' : 'down'}">${fmtIn(rem, l.currency)}</div>${rem !== Number(l.amount) ? `<div class="meta money">de ${fmtIn(l.amount, l.currency)}</div>` : ''}</div>
      ${l.closed ? '<span class="status good">Saldado</span>' : `<button class="btn sm primary" data-action="loanPay" data-id="${l.id}">${l.dir === 'preste' ? 'Me devolvió' : 'Devolví'}</button>`}
      <button class="btn sm ghost icon-only" data-action="loanEdit" data-id="${l.id}" title="Editar">${icon('settings', 16)}</button></div>`;
  };
  return `<section class="card" id="prestamos"><div class="card-head"><h2>Préstamos</h2><button class="btn sm" data-action="loanAdd">+ Préstamo</button></div>
    ${open.length || closed.length ? `<div class="fx-row" style="margin-bottom:6px"><span>Te deben</span><b class="money up">${fmtMoney(lent)}</b><span class="spacer"></span><span>Debés</span><b class="money down">${fmtMoney(owed)}</b></div>` : ''}
    <div class="list">${open.map(row).join('') || '<div class="empty">Anotá lo que prestás o te prestan para que no se olvide. Tip: en el chat podés decir "le presté 50 a Juan".</div>'}</div>
    ${closed.length ? `<details class="small" style="margin-top:8px"><summary class="muted">Saldados (${closed.length})</summary><div class="list">${closed.map(row).join('')}</div></details>` : ''}
  </section>`;
}

/* ---------------- Mi plan: perfil de inversor, plan de cartera, notas y pasos ----------------
   Categorías: fondo de emergencia, pendiente de invertir, renta fija, renta variable y diversificadores (oro…).
   El perfil sale de 6 preguntas + tu plan + qué tan concentrada está tu renta variable (cripto, acciones sueltas).
   Es una guía para vos, no asesoramiento financiero. */

const PLAN_QUIZ = [
  ['¿Para cuándo vas a necesitar esta plata?', ['En menos de 1 año', 'En 1 a 3 años', 'En 3 a 5 años', 'En más de 5 años']],
  ['Si tus inversiones caen 20% en un mes, ¿qué hacés?', ['Vendo todo', 'Vendo una parte', 'Espero sin tocar nada', 'Compro más']],
  ['¿Qué preferís?', ['Ganar poco pero seguro', 'Un poco más, con pocos altibajos', 'Más, aunque suba y baje', 'Lo máximo, aunque a veces pierda mucho']],
  ['¿Cuánto sabés de inversiones?', ['Nada', 'Lo básico', 'Bastante', 'Mucho']],
  ['Si perdieras esta plata, ¿afecta tu día a día?', ['Mucho', 'Algo', 'Poco', 'Nada']],
  ['¿Tenés un fondo de emergencia (plata para 3 a 6 meses de gastos)?', ['No', 'Menos de 3 meses', 'Sí, de 3 a 6 meses', 'Más de 6 meses']],
];
const PLAN_LEVELS = {
  conservador: { name: 'Conservador', icon: 'shield', text: 'Priorizás no perder. Te queda bien mucha renta fija (60–80%): depósitos a plazo, ahorro con rendimiento.' },
  moderado: { name: 'Moderado', icon: 'pie', text: 'Buscás crecer sin grandes sustos: más o menos mitad renta fija y mitad renta variable, mejor en ETFs amplios.' },
  crecimiento: { name: 'Crecimiento', icon: 'chart', text: 'Buscás crecer a largo plazo con mucha renta variable, pero diversificada (ETFs amplios). Las caídas se aguantan con tiempo y un fondo de emergencia.' },
  arriesgado: { name: 'Arriesgado', icon: 'trending', text: 'Mucha renta variable y concentrada (cripto o acciones sueltas): puede subir mucho, pero también caer fuerte. Clave: fondo de emergencia aparte y no vender en pánico.' },
};
// Categorías de cada activo o cuenta
const PLAN_CLASSES = [['emergencia', 'Fondo de emergencia'], ['pendiente', 'Pendiente de invertir'], ['fija', 'Renta fija'], ['variable', 'Renta variable'], ['diversificador', 'Diversificador'], ['fuera', 'No cuenta']];
const PLAN_COLORS = { fija: 'var(--c3)', variable: 'var(--c2)', diversificador: 'var(--c4)' };
const STABLES = new Set(['USDT', 'USDC', 'DAI', 'BUSD', 'FDUSD', 'TUSD', 'USDP', 'PYUSD']);
const planOf = () => S.plan || (S.plan = {});
const touchPlan = () => { planOf().u = new Date().toISOString(); };
const levelOf = (x) => (x == null ? null : x < 0.35 ? 'conservador' : x < 0.55 ? 'moderado' : x < 0.75 ? 'crecimiento' : 'arriesgado');
// Plan objetivo: % renta fija, % diversificadores; la renta variable es el resto
function planTarget() {
  const P = planOf();
  if (P.target == null) return null;
  const fija = P.target, div = Math.min(P.targetDiv || 0, 100 - fija);
  return { fija, div, variable: 100 - fija - div };
}

// Cada activo o cuenta con su categoría (la que elegiste o la de siempre)
function planItems() {
  const cls = planOf().classes || {};
  const items = [];
  for (const h of S.holdings) {
    const usd = holdingValue(h);
    if (!(usd > 0)) continue;
    const def = STABLES.has(h.symbol) ? 'pendiente' : h.assetType === 'oro' ? 'diversificador' : 'variable';
    // Dentro de la renta variable: ETF amplio, acción individual o cripto (para ver qué tan concentrada está)
    const sub = h.assetType === 'etf' ? 'etf' : h.assetType === 'accion' ? 'accion' : h.assetType === 'cripto' ? 'cripto' : 'otro';
    items.push({ id: h.id, name: h.symbol, kind: ASSET_TYPES[h.assetType] || '', usd, def, cls: cls[h.id] || def, sub });
  }
  for (const a of S.accounts) {
    if (a.type === 'credito') continue;
    const usd = toUSD(a.balance, a.currency);
    if (!(usd > 0)) continue;
    // Billeteras y cuentas para gastar (ej. Meru) = fondo de emergencia; saldo en un exchange = pendiente de invertir
    const def = a.type === 'exchange' ? 'pendiente' : 'emergencia';
    items.push({ id: a.id, name: a.name, kind: ACCOUNT_TYPES[a.type]?.label || '', usd, def, cls: cls[a.id] || def, sub: 'cuenta' });
  }
  return items;
}
function planAlloc() {
  const items = planItems();
  const sum = (c) => items.filter((x) => x.cls === c).reduce((s, x) => s + x.usd, 0);
  const by = Object.fromEntries(PLAN_CLASSES.map(([c]) => [c, sum(c)]));
  const invested = by.fija + by.variable + by.diversificador; // lo que cuenta para el plan
  const pct = (c) => (invested > 0 ? (by[c] / invested) * 100 : null);
  // Concentración de la renta variable
  const varItems = items.filter((x) => x.cls === 'variable');
  const subSum = (s) => varItems.filter((x) => x.sub === s).reduce((t, x) => t + x.usd, 0);
  const vs = { etf: subSum('etf'), accion: subSum('accion'), cripto: subSum('cripto'), otro: by.variable - subSum('etf') - subSum('accion') - subSum('cripto') };
  const vpct = (s) => (by.variable > 0 ? (vs[s] / by.variable) * 100 : 0);
  return { items, by, invested, pct, vs, vpct };
}

// Perfil: 60% las respuestas, 40% el riesgo de tu plan. El riesgo del plan sube con la renta variable y con
// cuánto de ella es cripto o acciones sueltas (un 80% en ETFs amplios no es lo mismo que un 80% en cripto)
function planProfile() {
  const P = planOf(), ans = P.quiz || {}, T = planTarget(), A = planAlloc();
  const answered = PLAN_QUIZ.filter((_, i) => ans[i] != null).length;
  const quiz = answered === PLAN_QUIZ.length ? PLAN_QUIZ.reduce((s, _, i) => s + ans[i], 0) / (PLAN_QUIZ.length * 3) : null;
  const cripto = A.vpct('cripto'), accion = A.vpct('accion');
  const conc = Math.min(1, (cripto + accion * 0.5) / 100);
  const varShare = T ? (T.variable + T.div * 0.3) / 100 : null;
  const planRisk = varShare != null ? Math.min(1, varShare * (0.75 + 0.5 * conc)) : null;
  if (quiz == null && planRisk == null) return null;
  const score = quiz != null && planRisk != null ? 0.6 * quiz + 0.4 * planRisk : quiz ?? planRisk;
  // Qué lo vuelve más arriesgado (o más tranquilo)
  const why = [];
  if (T) why.push(`${T.variable}% de tu plan es renta variable${T.div ? ` (y ${T.div}% diversificadores)` : ''}`);
  if (A.by.variable > 0) {
    if (cripto >= 10) why.push(`${fmtNum(cripto, 0)}% de tu renta variable es cripto (sube y baja mucho)`);
    if (accion >= 10) why.push(`${fmtNum(accion, 0)}% de tu renta variable son acciones individuales (dependen de una sola empresa)`);
    if (A.vpct('etf') >= 50) why.push(`${fmtNum(A.vpct('etf'), 0)}% de tu renta variable está en ETFs amplios (más diversificado: baja el riesgo)`);
  }
  if (quiz != null) why.push(`tus respuestas dan un perfil ${PLAN_LEVELS[levelOf(quiz)].name.toLowerCase()}`);
  return { level: levelOf(score), score, quiz, quizLevel: levelOf(quiz), planLevel: levelOf(planRisk), answered, why, cripto, accion };
}

// Barra de reparto (renta fija / variable / diversificadores)
const planBar = (p) => `<div class="stack plan-stack">${['fija', 'variable', 'diversificador'].filter((c) => p[c] > 0).map((c) => `<div style="flex:${p[c]};background:${PLAN_COLORS[c]}"></div>`).join('')}</div>`;
const planTxt = (p) => `${fmtNum(p.fija, 0)}% fija · ${fmtNum(p.variable, 0)}% variable${p.diversificador ? ` · ${fmtNum(p.diversificador, 0)}% diversif.` : ''}`;

// Qué hacer para volver al plan: dentro de ±5 puntos está bien; hasta 10, dirigir las compras nuevas; más de 10, mover plata
function planAdvice(T, A) {
  const names = { fija: 'renta fija', variable: 'renta variable', diversificador: 'diversificadores' };
  const diffs = ['fija', 'variable', 'diversificador'].map((c) => ({ c, d: A.pct(c) - T[c === 'diversificador' ? 'div' : c] }));
  const worst = diffs.reduce((a, b) => (Math.abs(b.d) > Math.abs(a.d) ? b : a));
  if (Math.abs(worst.d) <= 5) return { ok: true, html: `Vas según tu plan: todo está dentro del margen de ±5 puntos.` };
  const under = diffs.filter((x) => x.d < 0).sort((a, b) => a.d - b.d)[0], over = diffs.filter((x) => x.d > 0).sort((a, b) => b.d - a.d)[0];
  const need = under ? (-under.d / 100) * A.invested : 0;
  if (Math.abs(worst.d) <= 10) {
    return { ok: false, html: `Tenés <b>${fmtNum(Math.abs(worst.d), 0)} puntos ${worst.d > 0 ? 'de más' : 'de menos'}</b> en ${names[worst.c]}. No hace falta vender: hacé tus <b>próximas compras en ${names[under.c]}</b> (unos <b class="money">${fmtMoney(need)}</b>) hasta acercarte al plan.` };
  }
  return { ok: false, html: `Tenés <b>${fmtNum(Math.abs(worst.d), 0)} puntos ${worst.d > 0 ? 'de más' : 'de menos'}</b> en ${names[worst.c]} (más de 10). Podés <b>pasar unos <span class="money">${fmtMoney(need)}</span> de ${names[over.c]} a ${names[under.c]}</b>, o, si no querés vender, poner todas tus compras nuevas en ${names[under.c]}.` };
}

function viewMiPlan() {
  const P = planOf(), pr = planProfile(), A = planAlloc(), T = planTarget();
  const ans = P.quiz || {};
  const L = pr && PLAN_LEVELS[pr.level];
  const steps = P.steps || [];
  const done = steps.filter((s) => s.done).length;
  const eGoal = Number(P.emergencyGoal) || 0, eNow = A.by.emergencia;
  const suggested = Math.round(monthlyCostUSD() * 3);
  const ePct = eGoal > 0 ? Math.min(100, (eNow / eGoal) * 100) : null;
  const eLow = eGoal > 0 && eNow < eGoal;
  const real = A.invested > 0 ? { fija: A.pct('fija'), variable: A.pct('variable'), diversificador: A.pct('diversificador') } : null;
  const adv = T && real ? planAdvice(T, A) : null;
  const clsOpts = (x) => PLAN_CLASSES.map(([v, l]) => `<option value="${v}" ${x.cls === v ? 'selected' : ''}>${l}</option>`).join('');
  const note = (k, label, ph) => `<label class="plan-note"><span>${label}</span><textarea data-plan-note="${k}" rows="3" placeholder="${esc(ph)}">${esc(P.notes?.[k] || '')}</textarea></label>`;
  return `
  ${eLow ? `<div class="banner plan-first">${icon('shield', 16)} <b>Completá tu fondo de emergencia antes de invertir más.</b> Te faltan <span class="money">${fmtMoney(eGoal - eNow)}</span></div>` : ''}
  <section class="card plan-profile ${pr ? pr.level : ''}">
    <div class="muted small">Tu perfil de inversor</div>
    ${pr ? `<div class="plan-level">${icon(L.icon, 22)}<b>${L.name}</b></div>
      <p class="small" style="margin:4px 0 0;color:var(--text-2)">${L.text}</p>
      ${pr.why.length ? `<div class="small" style="margin-top:8px"><b>Por qué:</b><ul class="plan-why">${pr.why.map((w) => `<li>${w}</li>`).join('')}</ul></div>` : ''}
      ${pr.quizLevel && pr.planLevel && pr.quizLevel !== pr.planLevel ? `<div class="safe-line bad">${icon('alert', 16)}<span>Tus respuestas son de un perfil <b>${PLAN_LEVELS[pr.quizLevel].name.toLowerCase()}</b> y tu plan es de uno <b>${PLAN_LEVELS[pr.planLevel].name.toLowerCase()}</b>. Revisá si tu plan va con vos.</span></div>` : ''}
      ${pr.quiz == null ? '<div class="small muted" style="margin-top:6px">Calculado sólo con tu plan y tu cartera. Respondé las preguntas para que sea más preciso.</div>' : ''}`
    : '<p class="small" style="margin:6px 0 0;color:var(--text-2)">Respondé las preguntas y armá tu plan para saber si sos <b>conservador</b>, <b>moderado</b>, <b>de crecimiento</b> o <b>arriesgado</b>.</p>'}
  </section>

  <details class="more-box" ${pr?.quiz == null ? 'open' : ''}>
    <summary>${pr?.quiz == null ? `Preguntas (${pr?.answered || 0} de ${PLAN_QUIZ.length})` : 'Cambiar mis respuestas'}</summary>
    <div class="more-inner"><section class="card">${PLAN_QUIZ.map(([q, opts], i) => `<div class="quiz-q"><b>${i + 1}. ${q}</b>
      <div class="quiz-opts">${opts.map((o, j) => `<label class="quiz-opt"><input type="radio" name="pq_${i}" value="${j}" ${ans[i] === j ? 'checked' : ''}><span>${o}</span></label>`).join('')}</div></div>`).join('')}</section></div>
  </details>

  <section class="card">
    <div class="card-head" style="margin-bottom:6px"><h2>${icon('shield', 18)} Fondo de emergencia</h2></div>
    <div class="plan-emerg"><b class="money" style="font-size:20px">${fmtMoney(eNow)}</b><span class="muted small">${eGoal ? `de <span class="money">${fmtMoney(eGoal)}</span>` : 'sin meta todavía'}</span></div>
    ${ePct != null ? `<div class="meter big"><div class="${eLow ? 'warning' : 'good'}" style="width:${ePct}%"></div></div>` : ''}
    <label class="plan-note" style="margin:10px 0 0"><span>Mi meta (USD)</span><input type="text" inputmode="decimal" id="planEmerg" value="${eGoal ? numInput(eGoal) : ''}" placeholder="${suggested > 0 ? `ej. ${suggested} (3 meses de tus gastos)` : 'ej. 1500'}"></label>
    <div class="small muted" style="margin-top:6px">Es plata para imprevistos, aparte de tus inversiones. Por defecto cuentan tus billeteras y cuentas para gastar.${suggested > 0 ? ` Lo recomendado es 3 a 6 meses de gastos (≈ <span class="money">${fmtMoney(suggested)}</span> a <span class="money">${fmtMoney(suggested * 2)}</span>).` : ''}</div>
  </section>

  <section class="card">
    <div class="card-head" style="margin-bottom:8px"><h2>${icon('pie', 18)} Mi plan de cartera</h2></div>
    <label for="planFija" class="small" style="color:var(--text-2)">Renta fija</label>
    <input type="range" id="planFija" min="0" max="100" step="5" value="${T?.fija ?? 20}" class="plan-range fija">
    <label for="planDiv" class="small" style="color:var(--text-2)">Diversificadores (oro y similares)</label>
    <input type="range" id="planDiv" min="0" max="30" step="5" value="${T?.div ?? 0}" class="plan-range div">
    <div class="plan-split"><span><i class="swatch" style="background:var(--c3)"></i> Fija <b id="planFijaVal">${T?.fija ?? 20}%</b></span>
      <span><i class="swatch" style="background:var(--c2)"></i> Variable <b id="planVarVal">${T?.variable ?? 80}%</b></span>
      <span><i class="swatch" style="background:var(--c4)"></i> Diversif. <b id="planDivVal">${T?.div ?? 0}%</b></span></div>
    ${T == null ? '<div class="small muted">Mové las barras para guardar tu plan. La renta variable es lo que queda.</div>' : ''}
    <div class="small muted" style="margin-top:6px">El fondo de emergencia y lo pendiente de invertir no entran en este reparto.</div>
  </section>

  <section class="card">
    <div class="card-head" style="margin-bottom:8px"><h2>${icon('chart', 18)} Cómo vas</h2></div>
    ${real ? `<div class="plan-row2"><span class="muted small">Tu plan</span>${T ? `${planBar({ fija: T.fija, variable: T.variable, diversificador: T.div })}<span class="small">${planTxt({ fija: T.fija, variable: T.variable, diversificador: T.div })}</span>` : '<div class="small muted">Armá tu plan arriba.</div>'}</div>
      <div class="plan-row2"><span class="muted small">Hoy (invertido: <span class="money">${fmtMoney(A.invested)}</span>)</span>${planBar(real)}<span class="small"><b>${planTxt(real)}</b></span></div>
      ${A.by.variable > 0 ? `<div class="small muted">Renta variable: ${fmtNum(A.vpct('etf'), 0)}% ETFs amplios · ${fmtNum(A.vpct('accion'), 0)}% acciones individuales · ${fmtNum(A.vpct('cripto'), 0)}% cripto${A.vpct('otro') >= 1 ? ` · ${fmtNum(A.vpct('otro'), 0)}% otros` : ''}</div>` : ''}
      ${adv ? `<div class="safe-line ${adv.ok ? 'ok' : 'bad'}">${icon(adv.ok ? 'check' : 'alert', 16)}<span>${adv.html}</span></div>` : ''}`
    : '<div class="small muted">Cuando tengas inversiones, acá ves tu reparto real contra tu plan.</div>'}
    ${A.by.pendiente > 0 ? `<div class="small" style="margin-top:8px">${icon('calendar', 14)} Pendiente de invertir: <b class="money">${fmtMoney(A.by.pendiente)}</b> <span class="muted">(no cuenta en el reparto)</span></div>` : ''}
    ${A.items.length ? `<details class="plan-classes"><summary class="small">Mover cada activo o cuenta a otra categoría</summary>
      <div class="list">${A.items.map((x) => `<div class="list-row"><div class="grow"><div class="name">${esc(x.name)}</div><div class="meta">${esc(x.kind)} · <span class="money">${fmtMoney(x.usd)}</span></div></div>
        <select data-plan-class="${x.id}" aria-label="Categoría de ${esc(x.name)}">${clsOpts(x)}</select></div>`).join('')}</div></details>` : ''}
  </section>

  <section class="card">
    <div class="card-head" style="margin-bottom:8px"><h2>${icon('book', 18)} Mis notas</h2></div>
    ${note('ahorro', 'Mi plan de ahorro', 'ej. Ahorro el 20% de lo que me entra el día que cobro, antes de gastar.')}
    ${note('inversion', 'Mi plan de inversión', 'ej. 75% renta variable (VOO y un poco de BTC), 20% renta fija, 5% oro (PAXG).')}
    ${note('riesgo', 'Cómo manejo el riesgo', 'ej. Si el mercado cae, no vendo: compro un poco más cada mes. Reviso mi cartera una vez por mes.')}
    <div class="small muted">Se guarda solo mientras escribís.</div>
  </section>

  <section class="card">
    <div class="card-head" style="margin-bottom:6px"><h2>${icon('check', 18)} Los pasos que sigo</h2>${steps.length ? `<span class="muted small">${done} de ${steps.length}</span>` : ''}</div>
    <div class="list">${steps.map((s) => `<div class="list-row plan-step ${s.done ? 'done' : ''}"><label class="check-line grow"><input type="checkbox" data-plan-step="${s.id}" ${s.done ? 'checked' : ''}><span>${esc(s.text)}</span></label>
      <button class="btn sm ghost icon-only" data-action="planStepDel" data-id="${s.id}" title="Borrar" aria-label="Borrar">${icon('x', 16)}</button></div>`).join('')}</div>
    <div class="plan-add"><input type="text" id="planStepNew" placeholder="ej. Comprar VOO todos los meses el día 5" autocomplete="off"><button class="btn primary" data-action="planStepAdd">Agregar</button></div>
  </section>
  <p class="muted small" style="margin:0">Es una guía para ordenar tu plan, no asesoramiento financiero profesional.</p>`;
}

// Para el informe: tu plan, tu perfil y cada categoría por separado
function planReport() {
  const P = planOf(), pr = planProfile(), A = planAlloc(), T = planTarget();
  const r2 = (x) => (x == null ? null : round2(x));
  const label = Object.fromEntries(PLAN_CLASSES);
  const subName = { etf: 'ETF amplio', accion: 'Acción individual', cripto: 'Cripto', otro: 'Otro', cuenta: 'Cuenta' };
  return {
    perfil: pr ? PLAN_LEVELS[pr.level].name : '', perfilRespuestas: pr?.quizLevel ? PLAN_LEVELS[pr.quizLevel].name : '', porque: pr?.why || [],
    objetivo: T, real: A.invested > 0 ? { fija: r2(A.pct('fija')), variable: r2(A.pct('variable')), diversificador: r2(A.pct('diversificador')) } : null,
    investedUSD: r2(A.invested),
    categorias: [
      ['Fondo de emergencia', A.by.emergencia, P.emergencyGoal ? `meta US$ ${fmtNum(P.emergencyGoal, 2)} (${fmtNum(Math.min(100, (A.by.emergencia / P.emergencyGoal) * 100), 0)}%)` : 'sin meta'],
      ['Pendiente de invertir', A.by.pendiente, 'no cuenta en el reparto'],
      ['Renta fija', A.by.fija, ''],
      ['Renta variable: ETFs amplios', A.vs.etf, ''], ['Renta variable: acciones individuales', A.vs.accion, ''], ['Renta variable: cripto', A.vs.cripto, ''],
      ...(A.vs.otro > 0.005 ? [['Renta variable: otros', A.vs.otro, '']] : []),
      ['Diversificadores (oro y similares)', A.by.diversificador, ''],
    ].map(([n, usd, extra]) => ({ categoria: n, usd: r2(usd), extra })),
    items: A.items.map((x) => ({ nombre: x.name, tipo: x.cls === 'variable' ? subName[x.sub] : x.kind, clase: label[x.cls], usd: r2(x.usd) })),
    notas: [['Mi plan de ahorro', P.notes?.ahorro], ['Mi plan de inversión', P.notes?.inversion], ['Cómo manejo el riesgo', P.notes?.riesgo]].filter(([, t]) => t),
    pasos: (P.steps || []).map((s) => ({ paso: s.text, hecho: s.done ? 'Sí' : 'No' })),
    respuestas: PLAN_QUIZ.map(([q, o], i) => [q, P.quiz?.[i] != null ? o[P.quiz[i]] : '']).filter(([, a]) => a),
  };
}

/* ---------------- Tus categorías ----------------
   Además de las de siempre, podés crear las tuyas (ej. "Comparsa"). Aparecen en el registro rápido,
   los formularios, los topes, el análisis y el informe; se sincronizan entre tus dispositivos. */
const CAT_ICON_CHOICES = [['party', 'Fiesta'], ['ticket', 'Entrada'], ['gift', 'Regalo'], ['heart', 'Salud / cariño'], ['book', 'Estudio'], ['food', 'Comida'],
  ['cart', 'Compras'], ['bag', 'Bolsa'], ['bus', 'Transporte'], ['plane', 'Viaje'], ['home', 'Casa'], ['bolt', 'Servicio'], ['dumbbell', 'Deporte'],
  ['play', 'Suscripción'], ['paw', 'Mascota'], ['users', 'Personas'], ['briefcase', 'Trabajo'], ['laptop', 'Compu'], ['phone', 'Celular'],
  ['card', 'Tarjeta'], ['tag', 'Etiqueta'], ['sparkle', 'Otro']];

function customCatForm(type, onDone, cat = null) {
  openForm({
    title: cat ? `Editar categoría: ${cat.name}` : `Nueva categoría de ${type === 'ingreso' ? 'ingreso' : 'gasto'}`,
    fields: [
      { name: 'name', label: 'Nombre', value: cat?.name || '', required: true, full: true, placeholder: type === 'ingreso' ? 'ej. Clases particulares' : 'ej. Comparsa, Universidad, Regalos' },
      { name: 'icon', label: 'Ícono', type: 'select', value: cat?.icon || 'tag', full: true, options: CAT_ICON_CHOICES },
      { type: 'html', html: '<div class="cat-preview" id="catPreview"></div>' },
      ...(cat ? [{ name: 'remove', label: 'Eliminar esta categoría (tus movimientos quedan con su nombre)', type: 'checkbox', full: true }] : []),
    ],
    onInput: (form, v) => { const p = $('#catPreview'); if (p) p.innerHTML = `<span class="q-cat-ico">${icon(v.icon || 'tag', 20)}</span><b>${esc(v.name || 'Tu categoría')}</b>`; },
    onSubmit: (v) => {
      if (cat && v.remove) {
        S.customCats = S.customCats.filter((x) => x !== cat); tombstone(cat.id);
        save(); render(); toast(`Categoría "${cat.name}" eliminada`); return;
      }
      const name = v.name.replace(/\s+/g, ' ').trim().replace(/^\p{Ll}/u, (c) => c.toUpperCase());
      if (name.length < 2) return 'Poné un nombre de al menos 2 letras.';
      const taken = [...CAT_GASTO, ...CAT_INGRESO, ...(S.customCats || []).filter((x) => x !== cat).map((x) => x.name)].some((c) => norm(c) === norm(name));
      if (taken) return `Ya existe una categoría "${name}".`;
      if (cat) {
        // Si le cambiás el nombre, tus movimientos, fijos y topes se pasan al nombre nuevo
        if (cat.name !== name) {
          for (const t of S.transactions) if (t.category === cat.name) t.category = name;
          for (const r of S.recurring) if (r.category === cat.name) r.category = name;
          for (const s of S.scheduled) if (s.category === cat.name) s.category = name;
          if (S.budgets[cat.name]) { S.budgets[name] = S.budgets[cat.name]; delete S.budgets[cat.name]; }
        }
        Object.assign(cat, { name, icon: v.icon });
      } else {
        (S.customCats = S.customCats || []).push({ id: uid(), type, name, icon: v.icon });
      }
      save(); render();
      toast(cat ? 'Categoría guardada ✓' : `Categoría "${name}" creada ✓`);
      if (onDone) setTimeout(() => onDone(name), 30);
    },
  });
  const p = $('#catPreview'); if (p) p.innerHTML = `<span class="q-cat-ico">${icon(cat?.icon || 'tag', 20)}</span><b>${esc(cat?.name || 'Tu categoría')}</b>`;
}

function customCatsHTML() {
  const list = S.customCats || [];
  const row = (c) => `<div class="list-row act"><span class="acc-ico sm">${icon(c.icon || 'tag', 16)}</span>
    <div class="grow"><div class="name">${esc(c.name)}</div><div class="meta">${c.type === 'ingreso' ? 'Ingreso' : 'Gasto'}</div></div>
    <button class="btn sm ghost icon-only" data-action="catEdit" data-id="${c.id}" title="Editar" aria-label="Editar">${icon('edit', 16)}</button></div>`;
  return `<section class="card">
    <div class="card-head" style="margin-bottom:6px"><h2>${icon('tag', 18)} Tus categorías</h2></div>
    <div class="list">${list.map(row).join('') || '<div class="small muted">Todavía no creaste ninguna. También podés crearlas con "+ Nueva" al registrar un gasto.</div>'}</div>
    <div class="toolbar" style="margin-top:10px"><button class="btn sm" data-action="catAdd" data-id="gasto">+ Categoría de gasto</button>
      <button class="btn sm" data-action="catAdd" data-id="ingreso">+ Categoría de ingreso</button></div>
  </section>`;
}

/* ---------------- Registro rápido: − Gasto / + Ingreso ----------------
   Una sola pantalla: monto, categoría con un toque y listo. La cuenta viene elegida
   (la última que usaste) y sólo la cambiás si querés. */

const CAT_ICON = {
  'Supermercado': 'cart', 'Comida y salidas': 'food', 'Transporte': 'bus', 'Vivienda / alquiler': 'home', 'Servicios': 'bolt',
  'Salud': 'heart', 'Gimnasio / deporte': 'dumbbell', 'Educación': 'book', 'Ocio': 'ticket', 'Compras': 'bag',
  'Suscripciones': 'play', 'Viajes': 'plane', 'Impuestos': 'receipt', 'Pago de tarjeta (intereses)': 'card', 'Eventos y fiestas': 'party', 'Mascotas': 'paw', 'Otros gastos': 'more',
  'Sueldo': 'briefcase', 'Mesada / familia': 'users', 'Freelance': 'laptop', 'Dividendos': 'trending', 'Intereses': 'percent',
  'Venta de algo': 'tag', 'Regalo': 'gift', 'Otros ingresos': 'plus',
  'Compra de inversión': 'trending', 'Venta de inversión': 'trending',
};
const CAT_SHORT = {
  'Comida y salidas': 'Comida', 'Vivienda / alquiler': 'Vivienda', 'Gimnasio / deporte': 'Gym', 'Eventos y fiestas': 'Eventos', 'Pago de tarjeta (intereses)': 'Intereses tarjeta',
  'Otros gastos': 'Otros', 'Mesada / familia': 'Mesada', 'Venta de algo': 'Venta', 'Otros ingresos': 'Otros', 'Suscripciones': 'Suscrip.',
};
const catIcon = (c, size = 18) => icon(CAT_ICON[c] || (S.customCats || []).find((x) => x.name === c)?.icon || 'more', size);
const shortCat = (c) => CAT_SHORT[c] || c;

// Categorías ordenadas por cuánto las usás (las más usadas primero)
function catsByUse(type) {
  const base = catsOf(type);
  const since = isoOf(Date.now() - 120 * 864e5);
  const n = {};
  for (const t of S.transactions) if (t.type === type && t.date >= since) n[t.category] = (n[t.category] || 0) + 1;
  const other = type === 'ingreso' ? 'Otros ingresos' : 'Otros gastos';
  return [...base].sort((a, b) => (a === other) - (b === other) || (n[b] || 0) - (n[a] || 0) || base.indexOf(a) - base.indexOf(b));
}

function lastAccountFor(type) {
  const id = S.settings.lastAccount?.[type];
  const ok = (a) => a && (type === 'gasto' || a.type !== 'credito');
  return [S.accounts.find((a) => a.id === id), S.accounts.find((a) => a.id === S.settings.defaultAccountId), defaultAccount(S.settings.localCurrency)].find(ok)?.id
    || S.accounts.find((a) => a.type !== 'credito')?.id;
}

// Un gasto/ingreso que coincide con un fijo pendiente (ej. "Gym 300") lo marca como pagado
function matchRecurring(type, category, amount, currency, note, date) {
  return S.recurring.find((r) => {
    if (!repeats(r) || r.day || r.type !== type || r.category !== category || recurringTx(r, date.slice(0, 7))) return false;
    const ruleUSD = toUSD(r.amount, r.currency), pUSD = toUSD(amount, currency);
    return (ruleUSD > 0 && Math.abs(pUSD - ruleUSD) / ruleUSD <= 0.25) || norm(note || '').includes(norm(r.name).split(' ')[0]);
  });
}

function whenLabel(date, time) {
  const d = date === todayISO() ? 'Hoy' : date === isoOf(Date.now() - 864e5) ? 'Ayer' : fmtDate(date);
  return `${d}${time ? `, ${time}` : ''}`;
}

function quickEntry(type = 'gasto', t = null, pre = null) {
  if (!S.accounts.length) return toast('Primero agregá una cuenta en Cuentas.');
  const st = {
    type: t?.type || type, amount: t ? t.amount : '', category: t?.category || '', note: t?.note && t.note !== t.category ? t.note : '', memo: t?.memo || '',
    accountId: t?.familyPaid ? FAMILY_ID : t?.accountId || lastAccountFor(t?.type || type), date: t?.date || todayISO(), time: t?.time || nowTime(), showAcc: false, showWhen: false,
    ...(pre || {}),
  };
  const dlg = $('#quickDlg');
  const read = () => {
    const a = $('#qAmount'), n = $('#qNote'), d = $('#qDate'), h = $('#qTime');
    if (a) st.amount = a.value;
    if (n) st.note = n.value.trim();
    const mm = $('#qMemo'); if (mm) st.memo = mm.value.trim();
    if (d && d.value) st.date = d.value;
    if (h) st.time = h.value;
  };
  const paint = (focus) => {
    const acc = st.accountId === FAMILY_ID ? familyAcc() : S.accounts.find((a) => a.id === st.accountId);
    const accs = S.accounts.filter((a) => st.type === 'gasto' || a.type !== 'credito');
    // "Otros": se pide qué fue (para que el análisis de fin de mes lo muestre) y una nota opcional
    const isOther = OTHER_CATS.has(st.category);
    const out = st.type === 'gasto';
    dlg.innerHTML = `<form class="quick ${st.type}" novalidate>
      <div class="q-top">
        <div class="q-seg"><button type="button" data-q-type="gasto" class="${out ? 'on' : ''}">${icon('minus', 16)} Gasto</button>
          <button type="button" data-q-type="ingreso" class="${out ? '' : 'on'}">${icon('plus', 16)} Ingreso</button></div>
        ${t ? '' : `<button type="button" class="q-icon" data-q="receipt" aria-label="Leer un comprobante">${icon('receipt', 20)}</button>`}
        <button type="button" class="q-icon" data-q="mic" aria-label="Dictar">${icon('mic', 20)}</button>
        <button type="button" class="q-icon" data-q="close" aria-label="Cerrar">${icon('x', 20)}</button>
      </div>
      
      ${st.receipt ? `<div class="q-receipt ${st.receipt.found ? '' : 'warn'}">${icon('receipt', 16)}<span>${st.receipt.found ? 'Leí el comprobante: revisá que el monto, la fecha y quién pagó estén bien.' : 'No encontré el monto en el comprobante: escribilo vos.'}</span></div>
        <details class="q-ocr"><summary>Ver el texto que leí</summary><pre>${esc(st.receipt.text.slice(0, 1500) || '(nada)')}</pre></details>` : t ? '' : favChipsHTML(st.type, 'data-q-fav')}
      <label class="q-amount"><span class="q-sign">${out ? '−' : '+'}</span><span class="q-cur">${curLabel(acc?.currency || '')}</span>
        <input id="qAmount" inputmode="decimal" autocomplete="off" placeholder="0" value="${esc(st.amount === '' ? '' : numInput(st.amount))}"></label>
      <div class="q-cats">${catsByUse(st.type).map((c) => `<button type="button" class="q-cat ${c === st.category ? 'on' : ''}" data-q-cat="${esc(c)}">
        <span class="q-cat-ico">${catIcon(c, 20)}</span><span class="q-cat-name">${esc(shortCat(c))}</span></button>`).join('')}
        <button type="button" class="q-cat q-cat-new" data-q="newcat"><span class="q-cat-ico">${icon('plus', 20)}</span><span class="q-cat-name">Nueva</span></button></div>
      <input type="text" id="qNote" class="q-note ${isOther ? 'q-need' : ''}" placeholder="${isOther ? '¿Qué fue? (obligatorio) ej. cuota extra del carnaval' : 'Detalle (opcional): ej. almuerzo con amigos'}" value="${esc(st.note)}" autocomplete="off">
      ${isOther ? `<textarea id="qMemo" class="q-memo" rows="2" placeholder="Explicalo con tus palabras si querés (opcional): ej. la comparsa subió a 300$ a tipo 12 y tuve que pagar la diferencia">${esc(st.memo)}</textarea>` : ''}
      <div class="q-chips">
        <button type="button" class="q-chip" data-q="acc">${accIcon(acc)}<span>${acc?.id === FAMILY_ID ? 'Lo pagó <b>tu familia</b>' : `${out ? 'Sale de' : 'Entra a'} <b>${esc(acc?.name || '—')}</b>`}</span>${icon('chevron', 14)}</button>
        <button type="button" class="q-chip" data-q="when">${icon('calendar', 16)}<span>${whenLabel(st.date, st.time)}</span>${icon('chevron', 14)}</button>
      </div>
      <div class="q-accs" ${st.showAcc ? '' : 'hidden'}>${accs.map((a) => `<button type="button" class="q-acc ${a.id === st.accountId ? 'on' : ''}" data-q-acc="${a.id}">
        ${accIcon(a)}<span>${esc(a.name)}<small>${fmtIn(a.balance, a.currency)}${a.type === 'credito' ? ' de deuda' : ''}</small></span></button>`).join('')}
        ${out ? `<button type="button" class="q-acc fam ${st.accountId === FAMILY_ID ? 'on' : ''}" data-q-acc="${FAMILY_ID}">${icon('users', 18)}<span>Lo pagó mi familia<small>No sale de tus cuentas (ej. la U, la comida del perro)</small></span></button>` : ''}</div>
      <div class="q-when" ${st.showWhen ? '' : 'hidden'}><input type="date" id="qDate" value="${st.date}"><input type="time" id="qTime" value="${st.time}"></div>
      <p class="form-error" hidden></p>
      <button type="submit" class="q-save">${t ? 'Guardar cambios' : out ? 'Guardar gasto' : 'Guardar ingreso'}</button>
      ${t ? `<button type="button" class="q-del" data-q="del">Eliminar este movimiento</button>` : ''}
    </form>`;
    if (focus) setTimeout(() => $('#qAmount')?.focus(), 60);
  };
  const err = (m) => { const p = dlg.querySelector('.form-error'); p.textContent = m; p.hidden = false; };

  dlg.onclick = (e) => {
    const b = e.target.closest('[data-q],[data-q-type],[data-q-cat],[data-q-acc],[data-q-fav]');
    if (!b) { if (e.target === dlg) dlg.close(); return; }
    if (b.hasAttribute('data-q-fav')) { dlg.close(); addFavorite(b.dataset.id); return; }
    read();
    if (b.dataset.qType) {
      if (b.dataset.qType === st.type) return;
      st.type = b.dataset.qType;
      st.category = '';
      const acc = S.accounts.find((a) => a.id === st.accountId);
      if (st.type === 'ingreso' && (acc?.type === 'credito' || st.accountId === FAMILY_ID)) st.accountId = lastAccountFor('ingreso');
      return paint(true);
    }
    if (b.dataset.qCat) {
      st.category = b.dataset.qCat;
      // Si es un fijo pendiente (ej. Mesada, Gym), trae su cuenta y su monto
      const r = !t && S.recurring.find((x) => repeats(x) && !x.day && x.type === st.type && x.category === st.category && !recurringTx(x, st.date.slice(0, 7)));
      const ra = r && S.accounts.find((a) => a.id === r.accountId);
      if (ra) {
        st.accountId = ra.id;
        if (!parseNum(st.amount)) st.amount = recurringAmountFor(r, ra) ?? '';
      }
      return paint(false);
    }
    if (b.dataset.qAcc) { st.accountId = b.dataset.qAcc; st.showAcc = false; return paint(false); }
    const q = b.dataset.q;
    if (q === 'close') dlg.close();
    if (q === 'newcat') customCatForm(st.type, (name) => { st.category = name; paint(false); });
    if (q === 'mic') { dlg.close(); openChat({ listen: true }); }
    if (q === 'receipt') { dlg.close(); pickReceipt(); }
    if (q === 'acc') { st.showAcc = !st.showAcc; st.showWhen = false; paint(false); }
    if (q === 'when') { st.showWhen = !st.showWhen; st.showAcc = false; paint(false); }
    if (q === 'del') { dlg.close(); ACTIONS.delTx(t.id); }
  };
  dlg.onsubmit = (e) => {
    e.preventDefault();
    read();
    const amount = parseNum(st.amount);
    if (!(amount > 0)) return err('Escribí el monto.');
    const fam = st.type === 'gasto' && st.accountId === FAMILY_ID;
    const acc = fam ? familyAcc() : S.accounts.find((a) => a.id === st.accountId);
    if (!acc) return err('Elegí la cuenta.');
    const category = st.category || (st.type === 'ingreso' ? 'Otros ingresos' : 'Otros gastos');
    // "Otros" sin detalle no sirve para el análisis: se pide qué fue
    if (OTHER_CATS.has(category) && !st.note) { $('#qNote')?.focus(); return err(st.category ? 'Contá qué fue en "¿Qué fue?" (ej. cuota extra del carnaval).' : 'Elegí una categoría o contá qué fue en el detalle.'); }
    const next = { type: st.type, amount: round2(amount), category, note: st.note || category, memo: OTHER_CATS.has(category) && st.memo ? st.memo : undefined, accountId: fam ? '' : acc.id, date: st.date || todayISO(), time: st.time || '',
      familyPaid: fam || undefined, currency: fam ? acc.currency : undefined };
    if (st.receipt) S.settings.receiptPayer = st.accountId; // la próxima vez, el mismo "quién pagó"
    if (!fam) S.settings.lastAccount = { ...(S.settings.lastAccount || {}), [st.type]: acc.id };
    if (t) {
      const r = t.recurringId && S.recurring.find((x) => x.id === t.recurringId);
      if (r && next.date.slice(0, 7) !== t.date.slice(0, 7)) r.skip = [...new Set([...(r.skip || []), t.date.slice(0, 7)])];
      applyTx(t, -1); Object.assign(t, next); applyTx(t, 1);
    } else {
      const tx = { id: uid(), created: new Date().toISOString(), ...next };
      const rule = matchRecurring(tx.type, category, amount, acc.currency, st.note, tx.date);
      if (rule) { tx.recurringId = rule.id; if (!st.note) tx.note = rule.name; }
      S.transactions.push(tx);
      applyTx(tx, 1);
    }
    dlg.close();
    snapshot(); save(); render();
    toast(t ? 'Cambios guardados ✓' : fam ? 'Guardado ✓ · lo pagó tu familia (no sale de tus cuentas)' : `${st.type === 'gasto' ? 'Gasto' : 'Ingreso'} guardado ✓ · ${acc.name}: ${fmtIn(acc.balance, acc.currency)}`);
  };
  paint(true);
  dlg.showModal();
}

/* ---------------- Leer un comprobante desde una foto ----------------
   Ej. el comprobante que te manda tu papá cuando paga la U. Se lee en el teléfono con Tesseract
   (gratis, de código abierto): la imagen no se sube a ningún lado. La primera vez descarga el lector (~6 MB). */

const OCR_LIB = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const OCR_LANG = 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/spa@1.0.0/4.0.0_best_int';
let ocrLoad = null;
const loadOcr = () => ocrLoad || (ocrLoad = new Promise((res, rej) => {
  const s = document.createElement('script');
  s.src = OCR_LIB;
  s.onload = () => res(window.Tesseract);
  s.onerror = () => { ocrLoad = null; s.remove(); rej(new Error('No se pudo descargar el lector. Revisá tu conexión.')); };
  document.head.append(s);
}));

function pickReceipt() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.hidden = true;
  inp.onchange = () => { const f = inp.files?.[0]; inp.remove(); if (f) readReceipt(f); };
  document.body.append(inp);
  inp.click();
}

// Fotos grandes (4000 px) tardan mucho: se achican a 2000 px
async function shrinkImage(file, max = 2000) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c;
}

const receiptPayer = () => (S.settings.receiptPayer === FAMILY_ID || S.accounts.some((a) => a.id === S.settings.receiptPayer) ? S.settings.receiptPayer : FAMILY_ID);

async function readReceipt(file) {
  const dlg = $('#dlg'), form = $('#dlgForm');
  let cancelled = false, worker = null;
  form.innerHTML = `<h2>Leyendo el comprobante…</h2>
    <p class="small muted" id="ocrMsg" style="margin:0">Preparando…</p>
    <div class="meter"><div id="ocrBar" class="good" style="width:3%"></div></div>
    <p class="small muted" style="margin:0">${icon('lock', 13)} Se lee en tu teléfono: la imagen no se sube a ningún lado.</p>
    <div class="dlg-actions"><button type="button" class="btn ghost" data-close>Cancelar</button></div>`;
  form.onsubmit = (e) => e.preventDefault();
  form.oninput = null; form.onchange = null; form.onclick = null;
  dlg.onclose = null;
  form.querySelector('[data-close]').onclick = () => { cancelled = true; worker?.terminate(); dlg.close(); };
  dlg.showModal();
  const msg = (t, p) => {
    const m = $('#ocrMsg'); if (m) m.textContent = t;
    const b = $('#ocrBar'); if (b && p != null) b.style.width = `${Math.max(3, Math.round(p * 100))}%`;
  };
  try {
    msg(S.settings.ocrReady ? 'Abriendo el lector…' : 'Descargando el lector (sólo la primera vez, unos 6 MB)…', 0.05);
    const T = await loadOcr();
    if (cancelled) return;
    const img = await shrinkImage(file).catch(() => file);
    worker = await T.createWorker('spa', 1, {
      langPath: OCR_LANG,
      logger: (m) => {
        if (m.status === 'recognizing text') msg('Leyendo el texto…', 0.35 + (m.progress || 0) * 0.65);
        else msg('Preparando el lector…', 0.08 + (m.progress || 0) * 0.25);
      },
    });
    if (cancelled) return;
    const { data } = await worker.recognize(img);
    await worker.terminate(); worker = null;
    if (cancelled) return;
    if (!S.settings.ocrReady) { S.settings.ocrReady = true; save(false); }
    const r = parseReceipt(data.text || '');
    dlg.close();
    quickEntry('gasto', null, {
      amount: r.amount ?? '', date: r.date || todayISO(), time: r.time || nowTime(), note: r.note || '', category: r.category,
      accountId: receiptPayer(), showAcc: true, receipt: { text: (data.text || '').trim(), found: r.amount != null },
    });
  } catch (e) {
    console.warn(e);
    worker?.terminate();
    if (cancelled) return;
    msg(`No pude leer el comprobante: ${e.message || e}`, null);
    const b = $('#ocrBar'); if (b) b.className = 'critical';
  }
}

const MONTH_ABBR = { ene: 1, jan: 1, feb: 2, mar: 3, abr: 4, apr: 4, may: 5, jun: 6, jul: 7, ago: 8, aug: 8, sep: 9, set: 9, oct: 10, nov: 11, dic: 12, dec: 12 };

// Saca monto, fecha, hora y concepto del texto de un comprobante (BNB, BCP, Unión, Mercantil, Tigo Money, QR…)
function parseReceipt(text) {
  const lines = String(text).split(/\n+/).map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const low = lines.map((l) => norm(l));
  // Monto: se puntúa cada número según lo que tiene alrededor ("Monto", "Bs", ",00") y se queda el mejor
  const cands = [];
  const numRx = /\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?/g;
  lines.forEach((l, i) => {
    const n = low[i];
    const kw = /\b(monto|importe|total|valor|pagado|transferido|debitado|a pagar|pago de)\b/.test(n);
    const kwPrev = i > 0 && /\b(monto|importe|total|valor)\b[^0-9]*$/.test(low[i - 1]);
    const cur = /(\bbs\b\.?|\bbob\b|bs\.)/.test(n);
    const bad = /\b(saldo|comision|cargo|itf|nro|numero|cuenta|codigo|transaccion|operacion|referencia|ci|nit|telefono|celular|tarjeta)\b|n[°º]/.test(n);
    for (const m of l.matchAll(numRx)) {
      const raw = m[0];
      const before = l[m.index - 1] || '', after = l[m.index + raw.length] || '';
      if (/[\/:\-]/.test(before) || /[\/:\-]/.test(after) || /\d/.test(after)) continue; // fechas, horas
      if (raw.replace(/\D/g, '').length > 9) continue; // números de cuenta
      const v = parseNum(raw);
      if (!(v > 0) || v > 1e6) continue;
      let score = 0;
      if (kw) score += 4;
      if (kwPrev) score += 3;
      if (cur) score += 3;
      if (/[.,]\d{2}$/.test(raw)) score += 2;
      if (bad) score -= 5;
      cands.push({ v, score });
    }
  });
  cands.sort((a, b) => b.score - a.score || b.v - a.v);
  const amount = cands[0] && cands[0].score >= 2 ? round2(cands[0].v) : null;

  // Fecha y hora
  const iso = (y, mo, d) => {
    if (!(y > 2000 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31)) return null;
    const s = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const t = Date.parse(s + 'T12:00:00');
    return t && t <= Date.now() + 864e5 && t >= Date.now() - 400 * 864e5 ? s : null;
  };
  let date = null, time = null;
  for (const l of low) {
    let m;
    if (!date && (m = l.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/))) date = iso(+m[1], +m[2], +m[3]);
    if (!date && (m = l.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})\b/))) date = iso(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
    // "04/Nov/2026" (Banco Económico) o "04-nov-26"
    if (!date && (m = l.match(/\b(\d{1,2})[\/\-. ](ene|jan|feb|mar|abr|apr|may|jun|jul|ago|aug|sep|set|oct|nov|dic|dec)[a-z]*\.?[\/\-. ,]+(\d{4}|\d{2})\b/))) date = iso(m[3].length === 2 ? 2000 + +m[3] : +m[3], MONTH_ABBR[m[2]], +m[1]);
    if (!date && (m = l.match(/\b(\d{1,2})(?: de)? (ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic)[a-z]*\.?,?(?: de| del)? (\d{4})\b/))) date = iso(+m[3], MONTH_ABBR[m[2]], +m[1]);
    if (!time && (m = l.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::\d\d)?\s*(a\.? ?m\.?|p\.? ?m\.?)?/))) {
      let h = +m[1];
      if (m[3] && /p/.test(m[3]) && h < 12) h += 12;
      if (m[3] && /a/.test(m[3]) && h === 12) h = 0;
      time = `${String(h).padStart(2, '0')}:${m[2]}`;
    }
  }

  // Concepto ("Glosa", "Concepto"…) y a quién se pagó
  // Sin las rayas que algunos bancos ponen al lado del título ("Beneficiario ————")
  const clean = (s) => s.replace(/[—–_=~<>|•·«»]+/g, ' ').replace(/-{2,}/g, ' ').replace(/^[\s:.\-]+/, '').replace(/\s+/g, ' ').trim();
  const field = (rx) => {
    for (let i = 0; i < low.length; i++) {
      const m = low[i].match(rx);
      if (!m) continue;
      const rest = clean(lines[i].slice(m.index + m[0].length));
      const val = /[a-z]{2}/i.test(rest) ? rest : clean(lines[i + 1] || '');
      if (val && /[a-z]{2}/i.test(val) && !/\d{5,}/.test(val)) return val.slice(0, 60);
    }
    return '';
  };
  const concept = field(/\b(glosa|concepto|nota|descripcion|motivo|detalle|referencia del pago)\b/);
  const dest = field(/\b(destinatario|beneficiario|nombre del destinatario|a nombre de|para|comercio|pagado a)\b/);
  const cap = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
  const sentence = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  // "Pagos a UPB" queda tal cual; sólo lo que viene TODO EN MAYÚSCULAS se pasa a minúsculas
  const allCaps = (s) => s === s.toUpperCase();
  const note = concept ? (allCaps(concept) ? sentence(concept) : concept.charAt(0).toUpperCase() + concept.slice(1)) : dest ? `Pago a ${allCaps(dest) ? cap(dest) : dest}` : '';
  const catText = norm(`${concept} ${dest}`);
  let category = 'Otros gastos';
  for (const [cat, list] of [...customCatWords('gasto'), ...CAT_WORDS]) if (list.split(' ').some((w) => w.length > 2 && new RegExp(`\\b${w}\\b`).test(catText))) { category = cat; break; }
  return { amount, date, time, note, category };
}

/* ---------------- Informe para analizar (PDF o Excel) ----------------
   Elegís desde qué mes y hasta cuál (sólo aparecen los meses con registros) y el formato.
   Todo se arma en el teléfono con librerías gratis (jsPDF y SheetJS); los precios de cripto de cada día
   se bajan gratis de CoinGecko. Las acciones (VOO, NVDA…) sólo tienen precio de los días en que abriste la app. */

const PDF_LIBS = ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'];
const XLSX_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const scriptLoads = {};
const loadScript = (src) => scriptLoads[src] || (scriptLoads[src] = new Promise((res, rej) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = res;
  s.onerror = () => { delete scriptLoads[src]; s.remove(); rej(new Error('No se pudo descargar el generador del informe. Revisá tu conexión.')); };
  document.head.append(s);
}));

// Meses con algo registrado (movimientos o compras/ventas de inversiones), del más viejo al más nuevo
function reportMonths() {
  const dates = [...S.transactions.map((t) => t.date), ...S.holdings.flatMap((h) => (h.trades || []).map((x) => x.date))].filter(Boolean).sort();
  const months = [...new Set(dates.map((d) => d.slice(0, 7)))].filter((m) => m <= currentMonth());
  return { first: dates[0] || null, months };
}

function viewInforme() {
  const { first, months } = reportMonths();
  if (!months.length) return `<section class="card" style="text-align:center;padding:30px 20px">
    <h2 style="font-size:18px;margin-bottom:8px">Todavía no hay nada para el informe</h2>
    <p class="muted" style="margin:0 auto 16px;max-width:420px">Cuando registres tus gastos e ingresos, acá vas a poder descargar un informe por mes en PDF o Excel.</p>
    <button class="btn primary" data-action="go" data-id="movimientos">Ir a Movimientos</button></section>`;
  const s = S.settings;
  const from = months.includes(s.repFrom) ? s.repFrom : months[0];
  const to = months.includes(s.repTo) ? s.repTo : months[months.length - 1];
  const fmt = s.repFmt === 'xlsx' ? 'xlsx' : 'pdf';
  const opt = (sel) => months.map((m) => `<option value="${m}" ${m === sel ? 'selected' : ''}>${monthLabel(m, 'long').replace(/^\w/, (c) => c.toUpperCase())} ${m.slice(0, 4)}</option>`).join('');
  return `<section class="card">
    <h2 style="margin-bottom:6px">${icon('download', 18)} Informe para analizar</h2>
    <p class="small" style="color:var(--text-2);margin:0 0 14px">Empezaste a registrar el <b>${fmtDate(first)}</b>. Sólo aparecen los meses en los que registraste algo.</p>
    <div class="rep-grid">
      <div class="form-row"><label for="repFrom">Desde</label><select id="repFrom">${opt(from)}</select></div>
      <div class="form-row"><label for="repTo">Hasta</label><select id="repTo">${opt(to)}</select></div>
    </div>
    <div class="form-row"><label>Formato</label>
      <div class="rep-fmt">
        <button type="button" class="${fmt === 'pdf' ? 'on' : ''}" data-action="repFmt" data-id="pdf">${icon('receipt', 16)} PDF</button>
        <button type="button" class="${fmt === 'xlsx' ? 'on' : ''}" data-action="repFmt" data-id="xlsx">${icon('list', 16)} Excel</button>
      </div></div>
    <button class="btn primary wide" data-action="reportMake">${icon('download', 16)} Descargar informe</button>
  </section>
  <section class="card">
    <h2 style="margin-bottom:8px">Qué trae</h2>
    <ul class="small rep-list">
      <li>Resumen de cada mes: ingresos, gastos, ahorro, lo que pagó tu familia y tu patrimonio.</li>
      <li>Todos los movimientos con fecha, día, hora, categoría, detalle y cuenta.</li>
      <li>Gastos por categoría y gasto de cada día.</li>
      <li>Tus inversiones día por día: precio, cantidad, valor y variación de cada activo, y las compras y ventas.</li>
      <li>Separado: gastos propios, lo que pagó tu familia, transferencias, inversiones y préstamos (con lo que falta cobrar).</li>
      <li>Saldos de tus cuentas día por día, tus fijos y "Para revisar": días sin registros, saldos que bajaron sin movimientos y datos estimados.</li>
    </ul>
    <p class="small muted" style="margin:8px 0 0">Los precios de cripto y oro (PAXG) de cada día se bajan gratis de CoinGecko. Las acciones y ETF tienen precio sólo de los días en que abriste la app; desde ahora se guardan todos los días.</p>
  </section>`;
}

// Cantidad que tenías de un activo al final de un día, a partir de la cantidad de hoy y las compras/ventas posteriores
// Cantidad que tenías al final de un día: sólo compras y ventas registradas hasta ese día, más el saldo
// inicial desde su fecha. Antes de la primera compra (o del saldo inicial) es 0; un saldo sin fecha no se cuenta.
function qtyAt(h, date) {
  const base = h.initial?.date && date >= h.initial.date ? baseQty(h) : 0;
  return Math.max(0, Math.round((base + netTrades(h, date)) * 1e10) / 1e10);
}

/* Historial de precios de cripto y oro (CoinGecko, gratis): desde la primera compra de cada activo hasta hoy.
   Se guarda en priceLog (un precio por día) para el informe diario y el rendimiento del mes.
   Sólo se baja lo que falta (S.priceHist recuerda qué rango ya está). La versión gratis da hasta 365 días atrás. */
const firstHoldDate = (h) => [...(h.trades || []).map((t) => t.date), h.initial?.date].filter(Boolean).sort()[0] || null;
let priceHistRun = null, priceHistAgain = false;
function syncPriceHistory({ onStep } = {}) {
  if (priceHistRun) { priceHistAgain = true; return priceHistRun; } // si ya está bajando, vuelve a mirar al terminar
  priceHistRun = (async () => {
    let changed = false;
    do {
      priceHistAgain = false;
      const today = todayISO(), minFrom = isoOf(Date.now() - 364 * 864e5);
      const hist = S.priceHist || (S.priceHist = {});
      const jobs = [];
      for (const h of S.holdings) {
        const id = (h.coingeckoId || '').trim().toLowerCase(), first = firstHoldDate(h);
        if (!id || !first) continue;
        const key = `${id}|${h.symbol}`, need = first < minFrom ? minFrom : first, cov = hist[key];
        const ranges = !cov ? [[need, today]] : [...(need < cov.from ? [[need, cov.from]] : []), ...(cov.to < today ? [[cov.to, today]] : [])];
        if (ranges.length) jobs.push({ h, id, key, need, ranges });
      }
      for (const [i, j] of jobs.entries()) {
        onStep?.(`Bajando precios de ${j.h.symbol}…`);
        let ok = true;
        for (const [a, b] of j.ranges) {
          try {
            const from = Math.floor(Date.parse(a + 'T00:00:00') / 1000), to = Math.floor(Math.min(Date.now(), Date.parse(b + 'T23:59:59')) / 1000);
            const res = await getJSON(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(j.id)}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`, 20000);
            const days = {};
            for (const [ms, p] of res.prices || []) if (p > 0) days[isoOf(ms)] = p; // queda el último precio de cada día
            for (const [d, p] of Object.entries(days)) logPrices(d, { [j.h.symbol]: p });
            if (Object.keys(days).length) changed = true; else ok = false;
          } catch (e) { ok = false; console.warn(e); }
          await new Promise((r) => setTimeout(r, 1200)); // sin apurar a CoinGecko
        }
        if (ok) { const c = hist[j.key]; hist[j.key] = { from: c && c.from < j.need ? c.from : j.need, to: today, at: new Date().toISOString() }; }
      }
    } while (priceHistAgain);
    if (changed) save(false);
    return changed;
  })().catch((e) => { console.warn(e); return false; }).finally(() => { priceHistRun = null; });
  return priceHistRun;
}
// Si cambia el ID de CoinGecko (o el símbolo), los precios guardados de ese activo se vuelven a bajar completos
function resetPriceHistory(h) {
  for (const k of Object.keys(S.priceHist || {})) if (k.endsWith(`|${h.symbol}`)) delete S.priceHist[k];
  // (los precios viejos de ese activo eran de otra moneda: se borran para que no se mezclen)
  for (const d of Object.keys(S.priceLog || {})) if (S.priceLog[d]?.[h.symbol] != null) delete S.priceLog[d][h.symbol];
}

// Todos los datos del informe, mes por mes.
// Montos convertidos con el tipo de cambio de la FECHA de cada movimiento; lo estimado queda marcado.
async function buildReport(fromM, toM, onStep) {
  const cur = S.settings.localCurrency;
  const R2 = (x) => round2(x);
  const today = todayISO();
  const months = reportMonths().months.filter((m) => m >= fromM && m <= toM);
  const firstDay = `${months[0]}-01`, lastM = months[months.length - 1];
  const lastDay = `${lastM}-${String(daysInMonth(lastM)).padStart(2, '0')}`;
  // Antes de armar el informe se completa el historial de precios guardado (cripto y oro desde su primera compra)
  if (S.holdings.some((h) => h.coingeckoId)) await syncPriceHistory({ onStep });
  onStep?.('Ordenando tus movimientos…');
  const histByDay = Object.fromEntries((S.history || []).map((r) => [r.date, r]));
  const accOf = (id) => S.accounts.find((a) => a.id === id);
  const curOfTx = (t) => accOf(t.accountId)?.currency || t.currency || cur;
  // Monto del movimiento en moneda local y en USD con el tipo de cambio de su fecha
  const conv = (t) => {
    const c = curOfTx(t), amt = Number(t.amount) || 0;
    const loc = convertAt(amt, c, cur, t.date), usd = convertAt(amt, c, 'USD', t.date);
    return { loc: loc.v, usd: usd.v, est: c !== cur && loc.est, tc: rateAt(cur, t.date) };
  };
  const weekday = (d) => new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long' });
  const accName = (t) => (t.familyPaid ? 'Lo pagó tu familia' : accOf(t.accountId)?.name || '');
  const group = (t) => (t.type === 'transferencia' ? 'Transferencia' : t.familyPaid ? 'Pagado por la familia' : t.loan ? 'Préstamo'
    : t.investment || isInvIncome(t) ? 'Inversión' : t.adjust ? 'Ajuste de saldo' : 'Propio');
  const ownFlow = (t) => t.type !== 'transferencia' && !nonFlow(t); // gastos e ingresos propios (incluye ajustes)
  const priceOn = (h, d) => {
    const px = S.priceLog?.[d]?.[h.symbol] ?? histByDay[d]?.px?.[h.symbol];
    if (px != null) return { p: px, src: h.coingeckoId ? 'CoinGecko' : 'Guardado por la app' };
    if (d === today && Number(h.price)) return { p: Number(h.price), src: 'Guardado por la app' };
    return null;
  };
  const quality = []; // avisos de datos incompletos o estimados (para todo el período)
  for (const h of S.holdings) {
    if (undatedBase(h)) quality.push(`${h.symbol}: tenés ${fmtNum(baseQty(h))} sin fecha de compra. No se cuentan en el día por día hasta que pongas la fecha (Inversiones → Editar).`);
    if (h.initial?.src === 'importado') quality.push(`${h.symbol}: la cantidad inicial se importó el ${fmtDate(h.initial.date)}; antes de esa fecha no hay datos.`);
  }
  const out = [];
  for (const m of months) {
    const dim = daysInMonth(m);
    const start = `${m}-01`, end = `${m}-${String(dim).padStart(2, '0')}`;
    const lastD = end < today ? end : today;
    const nDays = Number(lastD.slice(8, 10));
    const txs = S.transactions.filter((t) => t.date?.startsWith(m)).sort((a, b) => `${a.date}${a.time || ''}`.localeCompare(`${b.date}${b.time || ''}`));
    const cv = new Map(txs.map((t) => [t, conv(t)]));
    const fxEst = txs.filter((t) => cv.get(t).est).length;
    const sum = (list, k = 'loc') => list.reduce((s, t) => s + cv.get(t)[k], 0);
    const own = txs.filter(ownFlow);
    const gastos = own.filter((t) => t.type === 'gasto'), ingresos = own.filter((t) => t.type === 'ingreso');
    const fam = txs.filter((t) => t.familyPaid && t.type === 'gasto');
    const transfers = txs.filter((t) => t.type === 'transferencia');
    const invIncome = txs.filter(isInvIncome);
    const loanTxs = txs.filter((t) => t.loan);
    const adjusts = txs.filter((t) => t.adjust);
    const fixed = gastos.filter(isFixedTx), variable = txs.filter(isVariable);
    const byCat = (list) => {
      const o = {};
      for (const t of list) { const c = t.category || 'Otros'; o[c] = o[c] || { loc: 0, usd: 0, n: 0 }; o[c].loc += cv.get(t).loc; o[c].usd += cv.get(t).usd; o[c].n++; }
      const tot = Object.values(o).reduce((s, x) => s + x.loc, 0);
      return Object.entries(o).sort((a, b) => b[1].loc - a[1].loc).map(([c, x]) => ({ categoria: c, local: R2(x.loc), usd: R2(x.usd), pct: tot ? R2((x.loc / tot) * 100) : 0, n: x.n }));
    };
    const rows = txs.map((t) => {
      const c = cv.get(t), sign = t.type === 'gasto' ? -1 : 1;
      return {
        fecha: t.date, dia: weekday(t.date), hora: t.time || '', grupo: group(t),
        tipo: t.type === 'gasto' ? 'Gasto' : t.type === 'ingreso' ? 'Ingreso' : 'Transferencia',
        categoria: t.type === 'transferencia' ? 'Transferencia' : t.category || '',
        detalle: t.note && t.note !== t.category ? t.note : '',
        cuenta: t.type === 'transferencia' ? `${accName(t)} -> ${accOf(t.toAccountId)?.name || ''}` : accName(t),
        moneda: curOfTx(t), monto: Number(t.amount) || 0,
        llega: t.type === 'transferencia' && t.toAmount ? Number(t.toAmount) : null, monedaLlega: t.type === 'transferencia' ? accOf(t.toAccountId)?.currency || '' : '',
        tcOperacion: t.fxRate ? R2(t.fxRate) : null,
        montoLocal: R2(sign * c.loc), montoUSD: R2(sign * c.usd), tc: c.tc.r ? R2(c.tc.r) : null, tcEstimado: c.est ? 'Sí' : '',
        nota: t.memo || '',
        fijo: t.recurringId ? 'Sí' : '', programado: t.scheduledId ? 'Sí' : '',
      };
    });
    // Día por día
    const days = [];
    for (let d = 1; d <= nDays; d++) {
      const iso = `${m}-${String(d).padStart(2, '0')}`;
      const dayTx = txs.filter((t) => t.date === iso);
      const bud = S.dayBudgets?.[iso]?.v;
      days.push({ fecha: iso, dia: weekday(iso), variable: R2(sum(dayTx.filter(isVariable))), gastos: R2(sum(dayTx.filter((t) => ownFlow(t) && t.type === 'gasto'))),
        ingresos: R2(sum(dayTx.filter((t) => ownFlow(t) && t.type === 'ingreso'))), familia: R2(sum(dayTx.filter((t) => t.familyPaid))),
        presupuesto: bud != null ? R2(convertAt(bud, 'USD', cur, iso).v) : null, n: dayTx.length });
    }
    // Días sin registros (5 o más seguidos, desde que empezaste a registrar)
    const firstRec = reportMonths().first || start;
    const monthQuality = [];
    let gapStart = null;
    for (let d = 1; d <= nDays + 1; d++) {
      const iso = d <= nDays ? `${m}-${String(d).padStart(2, '0')}` : null;
      const empty = iso && iso >= firstRec && !txs.some((t) => t.date === iso);
      if (empty && !gapStart) gapStart = iso;
      if (!empty && gapStart) {
        const prev = addDays(iso || addDays(lastD, 1), -1), len = Math.round((Date.parse(prev) - Date.parse(gapStart)) / 864e5) + 1;
        if (len >= 5) monthQuality.push(`No hay movimientos registrados entre el ${fmtDate(gapStart)} y el ${fmtDate(prev)} (${len} días).`);
        gapStart = null;
      }
    }
    // El saldo de una cuenta bajó sin movimientos (corrección de saldo sin ajuste)
    for (const x of (S.balanceLog || []).filter((b) => b.date?.startsWith(m) && b.delta < 0)) {
      const acc = accOf(x.accountId);
      const lastTx = S.transactions.filter((t) => (t.accountId === x.accountId || t.toAccountId === x.accountId) && t.date < x.date).map((t) => t.date).sort().pop();
      monthQuality.push(`El saldo de ${acc?.name || 'una cuenta'} bajó ${fmtIn(-x.delta, x.currency || acc?.currency)}${lastTx ? ` entre el ${fmtDate(lastTx)} y el ${fmtDate(x.date)}` : ` el ${fmtDate(x.date)}`} sin movimientos registrados. ¿Querés agregarlos?`);
    }
    if (adjusts.length) monthQuality.push(`${adjusts.length} movimiento(s) de "Ajuste de saldo": plata que entró o salió sin registrar el detalle.`);
    if (fxEst) monthQuality.push(`${fxEst} movimiento(s) en otra moneda usan un tipo de cambio estimado (no había dato guardado de ese día).`);
    // Inversiones: cantidad sólo desde las compras (o el saldo inicial), precio de cada día o "sin precio"
    const invDaily = [], holdRows = [];
    let noPrice = 0;
    for (const h of S.holdings) {
      const tradesM = (h.trades || []).filter((x) => x.date?.startsWith(m));
      let prevP = null, prevD = null, first = null, last = null, sinPrecio = 0;
      for (let d = 1; d <= nDays; d++) {
        const iso = `${m}-${String(d).padStart(2, '0')}`;
        const q = qtyAt(h, iso);
        if (!(q > 0) && !tradesM.some((x) => x.date === iso)) { prevP = null; continue; }
        const pr = priceOn(h, iso);
        if (!pr) { noPrice++; sinPrecio++; }
        const p = pr?.p ?? null;
        const ch = p != null && prevP != null && prevD === addDays(iso, -1) ? R2((p / prevP - 1) * 100) : null;
        invDaily.push({ fecha: iso, activo: h.symbol, cantidad: q, precio: p != null ? Math.round(p * 100) / 100 : null, variacion: ch,
          valorUSD: p != null ? R2(q * p) : null, valorLocal: p != null ? R2(convertAt(q * p, 'USD', cur, iso).v) : null, fuente: pr?.src || 'Sin precio' });
        if (p != null) { if (!first) first = { d: iso, p, q }; last = { d: iso, p, q }; prevP = p; prevD = iso; }
      }
      const qEnd = qtyAt(h, lastD), qStart = qtyAt(h, addDays(start, -1));
      if (!qEnd && !qStart && !tradesM.length) continue;
      const buys = tradesM.filter((x) => x.side === 'compra').reduce((s, x) => s + x.qty * x.price + (x.fee || 0), 0);
      const sells = tradesM.filter((x) => x.side === 'venta').reduce((s, x) => s + x.qty * x.price - (x.fee || 0), 0);
      // Rendimiento del mes: desde el valor al inicio del mes o desde la compra (lo más reciente), descontando lo que compraste/vendiste
      const vStart = first ? (qStart > 0 ? qStart * first.p : 0) : null, vEnd = last ? qEnd * last.p : null;
      const gain = vStart != null && vEnd != null ? vEnd - vStart - buys + sells : null;
      const base = qStart > 0 ? vStart : buys;
      holdRows.push({ activo: h.symbol, nombre: h.name || '', tipo: ASSET_TYPES[h.assetType] || h.assetType, plataforma: h.platform || '',
        desde: first?.d || '', cantidadInicio: qStart, cantidadFin: qEnd, compradoUSD: R2(buys), vendidoUSD: R2(sells),
        precioInicio: first ? Math.round(first.p * 100) / 100 : null, precioFin: last ? Math.round(last.p * 100) / 100 : null,
        variacionPrecio: first && last ? R2((last.p / first.p - 1) * 100) : null,
        gananciaMesUSD: gain != null ? R2(gain) : null, rendimientoMes: gain != null && base > 0 ? R2((gain / base) * 100) : null,
        precioPromedio: Number(h.avgCost) || null, rendimientoCompra: Number(h.avgCost) > 0 && last ? R2((last.p / Number(h.avgCost) - 1) * 100) : null,
        valorFinUSD: vEnd != null ? R2(vEnd) : null, valorFinLocal: vEnd != null ? R2(convertAt(vEnd, 'USD', cur, lastD).v) : null,
        nota: [undatedBase(h) && `${fmtNum(baseQty(h))} sin fecha de compra (no contados)`, tradesM.some((x) => x.src === 'importado') && 'incluye cantidades importadas', !last && 'sin precio en el mes', last && sinPrecio && `${sinPrecio} día(s) sin precio`].filter(Boolean).join('; ') });
    }
    if (noPrice) monthQuality.push(`${noPrice} día(s) de inversiones sin precio guardado (acciones/ETF de días en que no se actualizaron los precios).`);
    const trades = S.holdings.flatMap((h) => (h.trades || []).filter((x) => x.date?.startsWith(m)).map((x) => ({ fecha: x.date, activo: h.symbol, operacion: x.side === 'compra' ? 'Compra' : x.side === 'venta' ? 'Venta' : 'Ajuste de cantidad',
      cantidad: x.qty, precio: x.price || 0, comision: x.fee || 0, totalUSD: x.side === 'ajuste' ? 0 : R2(x.qty * x.price + (x.side === 'compra' ? 1 : -1) * (x.fee || 0)), origen: x.src === 'importado' ? 'Importado sin fecha (estimado)' : x.src === 'chat' ? 'Importado del chat' : 'Registrado' }))).sort((a, b) => a.fecha.localeCompare(b.fecha));
    // Préstamos: lo que prestaste/te prestaron y cuánto falta al final del mes
    const loans = (S.loans || []).filter((l) => l.date <= lastD).map((l) => {
      const paid = (l.payments || []).filter((p) => p.date <= lastD).reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const paidM = (l.payments || []).filter((p) => p.date?.startsWith(m)).reduce((s, p) => s + (Number(p.amount) || 0), 0);
      return { persona: l.person, tipo: l.dir === 'preste' ? 'Le presté (por cobrar)' : 'Me prestaron (por pagar)', fecha: l.date, monto: Number(l.amount) || 0, moneda: l.currency,
        devueltoEnElMes: R2(paidM), devueltoTotal: R2(paid), falta: R2(Math.max(0, (Number(l.amount) || 0) - paid)), vence: l.dueDate || '', nuevoEsteMes: l.date.startsWith(m) ? 'Sí' : '' };
    }).filter((l) => l.falta > 0.005 || l.devueltoEnElMes > 0 || l.nuevoEsteMes);
    const owedToYou = loans.filter((l) => l.tipo.startsWith('Le')).reduce((s, l) => s + convertAt(l.falta, l.moneda, cur, lastD).v, 0);
    const youOwe = loans.filter((l) => l.tipo.startsWith('Me')).reduce((s, l) => s + convertAt(l.falta, l.moneda, cur, lastD).v, 0);
    // Saldos de cada cuenta al final de cada día: el saldo de hoy menos todo lo que pasó después
    const balRows = [];
    for (const a of S.accounts) {
      for (let d = 1; d <= nDays; d++) {
        const iso = `${m}-${String(d).padStart(2, '0')}`;
        let b = Number(a.balance) || 0;
        for (const t of S.transactions) if (t.date > iso) for (const [acc, delta] of txEffects(t)) if (acc === a) b -= delta;
        for (const x of S.balanceLog || []) if (x.accountId === a.id && x.date > iso) b -= a.type === 'credito' ? -x.delta : x.delta;
        balRows.push({ fecha: iso, cuenta: a.name, moneda: a.currency, saldo: R2(b), saldoLocal: R2(convertAt(a.type === 'credito' ? -b : b, a.currency, cur, iso).v),
          estimado: a.apyAccrue ? 'Sí (los intereses diarios no son movimientos)' : '' });
      }
    }
    const hist = (S.history || []).filter((r) => r.date.startsWith(m));
    const biggest = gastos.filter((t) => !t.adjust).sort((a, b) => cv.get(b).loc - cv.get(a).loc)[0];
    const sIn = sum(ingresos), sOut = sum(gastos), sFam = sum(fam);
    out.push({
      m, nombre: `${monthLabel(m, 'long').replace(/^\w/, (c) => c.toUpperCase())} ${m.slice(0, 4)}`, completo: end < today,
      resumen: {
        ingresos: R2(sIn), gastos: R2(sOut), ahorro: R2(sIn - sOut), tasa: sIn ? R2(((sIn - sOut) / sIn) * 100) : null,
        familia: R2(sFam), costoReal: R2(sOut + sFam), fijos: R2(sum(fixed)), variables: R2(sum(variable)), promedioDiario: R2(sum(variable) / nDays),
        transferencias: transfers.length, transferido: R2(sum(transfers)),
        invCompras: R2(trades.filter((x) => x.operacion === 'Compra').reduce((s, x) => s + x.totalUSD, 0)), invVentas: R2(trades.filter((x) => x.operacion === 'Venta').reduce((s, x) => s + x.totalUSD, 0)),
        invRendimientos: R2(sum(invIncome)), prestado: R2(sum(loanTxs.filter((t) => t.loanKind === 'start' && t.type === 'gasto'))),
        cobrado: R2(sum(loanTxs.filter((t) => t.loanKind === 'pay' && t.type === 'ingreso'))), porCobrar: R2(owedToYou), porPagar: R2(youOwe),
        ajustes: R2(sum(adjusts.filter((t) => t.type === 'gasto')) - sum(adjusts.filter((t) => t.type === 'ingreso'))),
        movimientos: txs.length, diasConRegistro: new Set(txs.map((t) => t.date)).size, dias: nDays,
        mayorGasto: biggest ? `${biggest.note || biggest.category} (${fmtIn(R2(cv.get(biggest).loc), cur)}, ${biggest.date})` : '',
        categoriaTop: byCat(gastos)[0]?.categoria || '',
        patrimonioInicio: hist[0] ? R2(fromUSD(hist[0].netWorth, cur)) : null, patrimonioFin: hist.length ? R2(fromUSD(hist[hist.length - 1].netWorth, cur)) : null,
        tcEstimados: fxEst,
      },
      gastosCat: byCat(gastos), ingresosCat: byCat(ingresos), movimientos: rows, dias: days,
      otros: othersDetail([m]).map((x) => ({ detalle: x.name, local: R2(convertAt(x.usd, 'USD', cur, lastD).v), usd: R2(x.usd), n: x.n, notas: x.memos.join(' · ') })),
      familia: rows.filter((r) => r.grupo === 'Pagado por la familia'), transferencias: rows.filter((r) => r.grupo === 'Transferencia'),
      invMovs: rows.filter((r) => r.grupo === 'Inversión'), prestamosMov: rows.filter((r) => r.grupo === 'Préstamo'), prestamos: loans,
      inversiones: holdRows, operaciones: trades, invDiario: invDaily, saldos: balRows,
      patrimonio: hist.map((r) => ({ fecha: r.date, patrimonio: R2(fromUSD(r.netWorth, cur)), liquidez: R2(fromUSD(r.liquid, cur)), inversiones: R2(fromUSD(r.inv, cur)), deuda: R2(fromUSD(r.debt || 0, cur)) })),
      revisar: monthQuality,
    });
  }
  return {
    meses: out, moneda: cur, simbolo: curLabel(cur), tipoCambio: rate(cur), generado: new Date().toLocaleString('es-AR'), primerRegistro: reportMonths().first, revisar: quality,
    cuentas: S.accounts.map((a) => ({ cuenta: a.name, tipo: ACCOUNT_TYPES[a.type]?.label || a.type, moneda: a.currency, saldo: Number(a.balance) || 0, saldoLocal: R2(fromUSD(toUSD(a.balance, a.currency), cur)) })),
    fijos: S.recurring.map((r) => ({ nombre: r.name, tipo: r.type === 'ingreso' ? 'Ingreso' : 'Gasto', monto: Number(r.amount) || 0, moneda: r.currency, dia: r.day || 'Sin día fijo', categoria: r.category, seRepite: repeats(r) ? 'Sí' : 'No', seguro: r.type === 'ingreso' ? (isSure(r) ? 'Sí' : 'A veces (el monto real puede variar)') : '' })),
    metas: S.goals.map((g) => ({ meta: g.name, objetivo: Number(g.target) || 0, moneda: g.currency, fecha: g.date || '' })),
    plan: planReport(),
  };
}

const addDays = (iso, k) => isoOf(Date.parse(iso + 'T12:00:00') + k * 864e5);

const REPORT_NOTES = [
  'Cada movimiento se convierte con el tipo de cambio de SU fecha (guardado por la app cada día). Si no había dato cerca de esa fecha, se usa el más cercano y queda marcado como estimado.',
  'Grupos: Propio = tus gastos e ingresos. Pagado por la familia = no sale de tus cuentas. Transferencia = plata entre tus cuentas (no es gasto ni ingreso). Inversión = compras, ventas, intereses y dividendos (no son gasto ni ingreso normal). Préstamo = lo que prestás o te prestan (no es gasto: es plata por cobrar o por pagar). Ajuste de saldo = plata que entró o salió sin registrar el detalle.',
  'Fijo = de todos los meses. Programado = de una sola vez con fecha. Día a día (variable) = el resto de tus gastos propios.',
  'Presupuesto del día = lo que la app mostró en "Hoy podés gastar" ese día (sólo desde que se guarda).',
  'Inversiones: la cantidad de cada día sale SÓLO de las compras y ventas registradas (y del saldo inicial desde su fecha). Precios de cripto y oro: CoinGecko. Acciones y ETF: precios guardados por la app; los días sin dato dicen "Sin precio".',
  'Rendimiento del mes = desde el valor al inicio del mes o desde la compra (lo más reciente), descontando compras y ventas del mes. Rendimiento desde la compra = precio promedio de compra contra el precio al final del mes.',
  'Saldos de cuentas día por día = el saldo de hoy menos los movimientos posteriores a ese día.',
];

/* ---- PDF ---- */
const pdfTxt = (s) => String(s ?? '').replace(/[−–—]/g, '-').replace(/→/g, '->').replace(/[✓✔]/g, 'OK').replace(/[^\x00-\xFF]/g, '').trim();

async function reportPDF(R) {
  for (const src of PDF_LIBS) await loadScript(src);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), M = 36;
  const sym = R.simbolo;
  const n = (v, d = 2) => (v == null || Number.isNaN(v) ? '-' : Number(v).toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d }));
  const money = (v) => (v == null ? '-' : `${sym} ${n(v)}`);
  const pct = (v) => (v == null ? '-' : `${n(v)}%`);
  let y = M;
  const title = (t, size = 13) => { if (y > 760) { doc.addPage(); y = M; } doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.setTextColor(0); doc.text(pdfTxt(t), M, y); y += size + 6; doc.setFont('helvetica', 'normal'); };
  const para = (t, size = 9, color = 0) => { doc.setFontSize(size); doc.setTextColor(color); const lines = doc.splitTextToSize(pdfTxt(t), W - 2 * M); if (y + lines.length * (size + 3) > 800) { doc.addPage(); y = M; } doc.text(lines, M, y); y += lines.length * (size + 3) + 4; doc.setTextColor(0); };
  const note = (t) => para(`* ${t}`, 8, 110);
  const table = (head, body, opts = {}) => {
    if (!body.length) { para('(sin datos)', 8, 120); return; }
    doc.autoTable({ startY: y, head: [head.map(pdfTxt)], body: body.map((r) => r.map(pdfTxt)), margin: { left: M, right: M }, styles: { fontSize: 7.5, cellPadding: 3 }, headStyles: { fillColor: [42, 120, 214] }, theme: 'striped', ...opts });
    y = doc.lastAutoTable.finalY + 12;
  };
  const movTable = (list) => table(['Fecha', 'Hora', 'Tipo', 'Categoría', 'Detalle', 'Cuenta', 'Monto', sym, 'TC est.'],
    list.map((t) => [t.fecha, t.hora, t.tipo, t.categoria, t.nota ? `${t.detalle} - ${t.nota}` : t.detalle, t.cuenta, `${n(t.monto)}${t.moneda === R.moneda ? '' : ` ${t.moneda}`}`, n(t.montoLocal), t.tcEstimado]), { columnStyles: { 4: { cellWidth: 85 } } });
  title('Informe financiero - MyFinance', 18);
  para(`Período: ${R.meses[0].nombre} a ${R.meses[R.meses.length - 1].nombre}. Generado el ${R.generado}. Empezaste a registrar el ${fmtDate(R.primerRegistro)}.`);
  para(`Moneda: ${R.moneda} (${sym}). Tipo de cambio de hoy: ${sym} ${n(R.tipoCambio)} por 1 USD (cada movimiento usa el de su fecha).`);
  title('Resumen por mes');
  table(['Mes', 'Ingresos', 'Gastos', 'Ahorro', 'Tasa', 'Pagó familia', 'Por cobrar'], R.meses.map((x) => [x.nombre, money(x.resumen.ingresos), money(x.resumen.gastos), money(x.resumen.ahorro), pct(x.resumen.tasa), money(x.resumen.familia), money(x.resumen.porCobrar)]));
  if (R.revisar.length || R.meses.some((x) => x.revisar.length)) {
    title('Para revisar');
    for (const t of R.revisar) para(`- ${t}`, 8.5);
    for (const x of R.meses) for (const t of x.revisar) para(`- ${x.nombre}: ${t}`, 8.5);
  }
  title('Cuentas (saldo de hoy)');
  table(['Cuenta', 'Tipo', 'Moneda', 'Saldo', `En ${sym}`], R.cuentas.map((a) => [a.cuenta, a.tipo, a.moneda, n(a.saldo), money(a.saldoLocal)]));
  if (R.fijos.length) { title('Ingresos y gastos fijos'); table(['Nombre', 'Tipo', 'Monto', 'Moneda', 'Día', 'Categoría', 'Se repite', 'Seguro'], R.fijos.map((f) => [f.nombre, f.tipo, n(f.monto), f.moneda, f.dia, f.categoria, f.seRepite, f.seguro])); }
  if (R.metas.length) { title('Metas'); table(['Meta', 'Objetivo', 'Moneda', 'Para'], R.metas.map((g) => [g.meta, n(g.objetivo), g.moneda, g.fecha])); }
  if (R.plan.perfil || R.plan.objetivo || R.plan.notas.length || R.plan.pasos.length) {
    const p = R.plan, pc = (o) => (o ? `${n(o.fija, 0)}% fija · ${n(o.variable, 0)}% variable · ${n(o.div ?? o.diversificador, 0)}% diversificadores` : '-');
    title('Mi plan (perfil, categorías y notas)');
    table(['Dato', 'Valor'], [
      ['Perfil de inversor', p.perfil || '-'], ['Perfil según las respuestas', p.perfilRespuestas || '-'],
      ['Plan objetivo', pc(p.objetivo)], ['Hoy (sobre lo invertido)', p.real ? `${pc(p.real)} (US$ ${n(p.investedUSD)})` : '-'],
    ], { columnStyles: { 0: { cellWidth: 200 } } });
    if (p.porque.length) { para('Por qué ese perfil:', 9); for (const w of p.porque) para(`- ${w}`, 8.5); }
    title('Categorías', 11);
    table(['Categoría', 'USD', 'Nota'], p.categorias.map((c) => [c.categoria, n(c.usd), c.extra]));
    if (p.items.length) table(['Activo o cuenta', 'Tipo', 'Categoría', 'Valor USD'], p.items.map((x) => [x.nombre, x.tipo, x.clase, n(x.usd)]));
    for (const [t, txt] of p.notas) { title(t, 11); para(txt); }
    if (p.pasos.length) { title('Los pasos que sigo', 11); table(['Paso', 'Hecho'], p.pasos.map((s) => [s.paso, s.hecho])); }
    if (p.respuestas.length) { title('Respuestas del perfil', 11); table(['Pregunta', 'Respuesta'], p.respuestas); }
    note('El perfil es una guía, no asesoramiento financiero. El fondo de emergencia y lo pendiente de invertir no entran en el reparto.');
  }
  title('Notas para el análisis');
  for (const t of REPORT_NOTES) para(`- ${t}`, 8.5);
  for (const x of R.meses) {
    doc.addPage(); y = M;
    const r = x.resumen;
    title(`${x.nombre}${x.completo ? '' : ' (mes en curso)'}`, 16);
    table(['Dato', 'Valor'], [
      ['Ingresos propios', money(r.ingresos)], ['Gastos propios', money(r.gastos)], ['Ahorro', money(r.ahorro)], ['Tasa de ahorro', pct(r.tasa)],
      ['Pagado por la familia', money(r.familia)], ['Costo real del mes (gastos + familia)', money(r.costoReal)],
      ['Gastos fijos y programados', money(r.fijos)], ['Gastos del día a día', money(r.variables)], ['Promedio diario (día a día)', money(r.promedioDiario)],
      ['Transferencias entre tus cuentas', `${r.transferencias} (${money(r.transferido)}) - no son gasto ni ingreso`],
      ['Inversiones: compras / ventas (USD)', `US$ ${n(r.invCompras)} / US$ ${n(r.invVentas)}`], ['Intereses y dividendos', money(r.invRendimientos)],
      ['Préstamos: prestado / cobrado en el mes', `${money(r.prestado)} / ${money(r.cobrado)}`], ['Por cobrar / por pagar al final del mes', `${money(r.porCobrar)} / ${money(r.porPagar)}`],
      ['Ajustes de saldo (salió sin detalle)', money(r.ajustes)], ['Movimientos registrados', String(r.movimientos)], ['Días con registros', `${r.diasConRegistro} de ${r.dias}`],
      ['Mayor gasto', r.mayorGasto || '-'], ['Categoría con más gasto', r.categoriaTop || '-'], ['Patrimonio al inicio / al final', `${money(r.patrimonioInicio)} / ${money(r.patrimonioFin)}`],
    ], { columnStyles: { 0: { cellWidth: 200 } } });
    if (r.tcEstimados) note(`${r.tcEstimados} movimiento(s) en otra moneda con tipo de cambio estimado.`);
    if (x.revisar.length) { title('Para revisar', 11); for (const t of x.revisar) para(`- ${t}`, 8.5); }
    title('Gastos propios por categoría', 11);
    table(['Categoría', `Total ${sym}`, 'USD', '%', 'Movimientos'], x.gastosCat.map((c) => [c.categoria, n(c.local), n(c.usd), `${n(c.pct, 1)}%`, String(c.n)]));
    if (x.otros.length) { title('Dentro de "Otros"', 11); table(['Qué fue', `Total ${sym}`, 'Veces', 'Nota'], x.otros.map((o) => [o.detalle, n(o.local), String(o.n), o.notas])); }
    if (x.ingresosCat.length) { title('Ingresos propios por categoría', 11); table(['Categoría', `Total ${sym}`, 'USD', '%'], x.ingresosCat.map((c) => [c.categoria, n(c.local), n(c.usd), `${n(c.pct, 1)}%`])); }
    title('Día por día', 11);
    table(['Fecha', 'Día', `Día a día ${sym}`, `Gastos propios ${sym}`, `Ingresos ${sym}`, `Familia ${sym}`, `Presup. del día ${sym}`, 'Mov.'], x.dias.map((d) => [d.fecha, d.dia, n(d.variable), n(d.gastos), n(d.ingresos), n(d.familia), d.presupuesto == null ? '-' : n(d.presupuesto), String(d.n)]));
    note('Presupuesto del día: sólo de los días en que la app lo guardó.');
    title('Gastos e ingresos propios', 11);
    movTable(x.movimientos.filter((t) => t.grupo === 'Propio' || t.grupo === 'Ajuste de saldo'));
    if (x.familia.length) { title('Pagado por tu familia', 11); movTable(x.familia); }
    if (x.transferencias.length) {
      title('Transferencias entre tus cuentas', 11);
      table(['Fecha', 'De -> a', 'Sale', 'Llega', 'TC usado'], x.transferencias.map((t) => [t.fecha, t.cuenta, `${n(t.monto)} ${t.moneda}`, t.llega != null ? `${n(t.llega)} ${t.monedaLlega}` : `${n(t.monto)} ${t.moneda}`, t.tcOperacion != null ? n(t.tcOperacion) : '-']));
    }
    if (x.inversiones.length || x.operaciones.length || x.invMovs.length) {
      title('Inversiones del mes', 11);
      table(['Activo', 'Desde', 'Cant. inicio', 'Cant. fin', 'Precio ini.', 'Precio fin', 'Rend. mes', 'Ganancia mes USD', 'Rend. desde compra', 'Valor fin USD'],
        x.inversiones.map((h) => [h.activo, h.desde, n(h.cantidadInicio, 6), n(h.cantidadFin, 6), n(h.precioInicio), n(h.precioFin), pct(h.rendimientoMes), n(h.gananciaMesUSD), pct(h.rendimientoCompra), n(h.valorFinUSD)]));
      for (const h of x.inversiones.filter((h) => h.nota)) note(`${h.activo}: ${h.nota}.`);
      if (x.operaciones.length) { title('Compras y ventas', 11); table(['Fecha', 'Activo', 'Operación', 'Cantidad', 'Precio USD', 'Comisión', 'Total USD', 'Origen'], x.operaciones.map((o) => [o.fecha, o.activo, o.operacion, n(o.cantidad, 6), n(o.precio), n(o.comision), n(o.totalUSD), o.origen])); }
      if (x.invMovs.length) { title('Movimientos de inversión (plata que entró o salió)', 11); movTable(x.invMovs); }
      title('Inversiones día por día', 11);
      table(['Fecha', 'Activo', 'Cantidad', 'Precio USD', 'Var. día', 'Valor USD', `Valor ${sym}`, 'Fuente'], x.invDiario.map((d) => [d.fecha, d.activo, n(d.cantidad, 6), n(d.precio), d.variacion == null ? '-' : `${n(d.variacion)}%`, n(d.valorUSD), n(d.valorLocal), d.fuente]));
      note('Sólo desde la fecha de compra (o del saldo inicial). "Sin precio" = ese día no hay precio guardado.');
    }
    if (x.prestamos.length || x.prestamosMov.length) {
      title('Préstamos', 11);
      table(['Persona', 'Tipo', 'Fecha', 'Monto', 'Devuelto en el mes', 'Falta', 'Vence'], x.prestamos.map((l) => [l.persona, l.tipo, l.fecha, `${n(l.monto)} ${l.moneda}`, n(l.devueltoEnElMes), `${n(l.falta)} ${l.moneda}`, l.vence || '-']));
      note('Prestar no es un gasto: es plata por cobrar. Las devoluciones parciales se descuentan de "Falta".');
    }
    const accs = [...new Set(x.saldos.map((s) => s.cuenta))];
    if (accs.length) {
      title('Saldos de tus cuentas', 11);
      table(['Cuenta', 'Moneda', 'Al inicio del mes', 'Al final', `Final en ${sym}`, 'Estimado'], accs.map((c) => { const l = x.saldos.filter((s) => s.cuenta === c); return [c, l[0].moneda, n(l[0].saldo), n(l[l.length - 1].saldo), n(l[l.length - 1].saldoLocal), l[0].estimado ? 'Sí' : '']; }));
      note('Calculados desde el saldo de hoy restando los movimientos posteriores. El día por día está en el Excel.');
    }
    if (x.patrimonio.length) { title('Tu patrimonio (días en que se guardó)', 11); table(['Fecha', `Patrimonio ${sym}`, `Liquidez ${sym}`, `Inversiones ${sym}`, `Deuda ${sym}`], x.patrimonio.map((p) => [p.fecha, n(p.patrimonio), n(p.liquidez), n(p.inversiones), n(p.deuda)])); }
  }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(140); doc.text(`MyFinance - página ${i} de ${pages}`, W - M, 820, { align: 'right' }); }
  return doc.output('blob');
}

/* ---- Excel ---- */
async function reportXLSX(R) {
  await loadScript(XLSX_LIB);
  const X = window.XLSX;
  const wb = X.utils.book_new();
  const sym = R.simbolo;
  const add = (name, rows) => {
    const ws = X.utils.json_to_sheet(rows.length ? rows : [{ '(sin datos)': '' }]);
    ws['!cols'] = Object.keys(rows[0] || { x: 1 }).map((k) => ({ wch: Math.min(48, Math.max(10, k.length + 2, ...rows.slice(0, 200).map((r) => String(r[k] ?? '').length + 1))) }));
    X.utils.book_append_sheet(wb, ws, name);
  };
  const mov = (x, t) => ({ Mes: x.nombre, Fecha: t.fecha, Día: t.dia, Hora: t.hora, Grupo: t.grupo, Tipo: t.tipo, Categoría: t.categoria, Detalle: t.detalle, Nota: t.nota, Cuenta: t.cuenta, Moneda: t.moneda, Monto: t.monto,
    [`Monto ${sym} (+entra / -sale)`]: t.montoLocal, 'Monto USD': t.montoUSD, [`TC del día (${sym}/USD)`]: t.tc, 'TC estimado': t.tcEstimado, Fijo: t.fijo, Programado: t.programado });
  add('Resumen', R.meses.map((x) => { const r = x.resumen; return { Mes: x.nombre, 'Mes completo': x.completo ? 'Sí' : 'En curso',
    [`Ingresos propios ${sym}`]: r.ingresos, [`Gastos propios ${sym}`]: r.gastos, [`Ahorro ${sym}`]: r.ahorro, 'Tasa de ahorro %': r.tasa,
    [`Pagado por la familia ${sym}`]: r.familia, [`Costo real ${sym}`]: r.costoReal, [`Fijos y programados ${sym}`]: r.fijos, [`Día a día ${sym}`]: r.variables, [`Promedio diario ${sym}`]: r.promedioDiario,
    Transferencias: r.transferencias, [`Transferido ${sym}`]: r.transferido, 'Inversión: compras USD': r.invCompras, 'Inversión: ventas USD': r.invVentas, [`Intereses y dividendos ${sym}`]: r.invRendimientos,
    [`Prestado ${sym}`]: r.prestado, [`Cobrado ${sym}`]: r.cobrado, [`Por cobrar ${sym}`]: r.porCobrar, [`Por pagar ${sym}`]: r.porPagar, [`Ajustes de saldo ${sym}`]: r.ajustes,
    Movimientos: r.movimientos, 'Días con registros': r.diasConRegistro, 'Días del mes': r.dias, 'Mayor gasto': r.mayorGasto, 'Categoría con más gasto': r.categoriaTop,
    [`Patrimonio inicio ${sym}`]: r.patrimonioInicio, [`Patrimonio fin ${sym}`]: r.patrimonioFin, 'Movimientos con TC estimado': r.tcEstimados }; }));
  add('Para revisar', [...R.revisar.map((t) => ({ Mes: 'Todo el período', Aviso: t })), ...R.meses.flatMap((x) => x.revisar.map((t) => ({ Mes: x.nombre, Aviso: t })))]);
  add('Movimientos', R.meses.flatMap((x) => x.movimientos.map((t) => mov(x, t))));
  add('Gastos propios', R.meses.flatMap((x) => x.movimientos.filter((t) => (t.grupo === 'Propio' || t.grupo === 'Ajuste de saldo') && t.tipo === 'Gasto').map((t) => mov(x, t))));
  add('Pagado por familia', R.meses.flatMap((x) => x.familia.map((t) => mov(x, t))));
  add('Transferencias', R.meses.flatMap((x) => x.transferencias.map((t) => ({ Mes: x.nombre, Fecha: t.fecha, 'De -> a': t.cuenta, Sale: t.monto, 'Moneda sale': t.moneda, Llega: t.llega ?? t.monto, 'Moneda llega': t.monedaLlega || t.moneda, 'TC de la operación': t.tcOperacion, Detalle: t.detalle }))));
  add('Por categoría', R.meses.flatMap((x) => [...x.gastosCat.map((c) => ({ ...c, t: 'Gasto propio' })), ...x.ingresosCat.map((c) => ({ ...c, t: 'Ingreso propio' }))]
    .map((c) => ({ Mes: x.nombre, Tipo: c.t, Categoría: c.categoria, [`Total ${sym}`]: c.local, 'Total USD': c.usd, '%': c.pct, Movimientos: c.n }))));
  add('Detalle de Otros', R.meses.flatMap((x) => x.otros.map((o) => ({ Mes: x.nombre, 'Qué fue': o.detalle, [`Total ${sym}`]: o.local, 'Total USD': o.usd, Veces: o.n, Nota: o.notas }))));
  add('Día por día', R.meses.flatMap((x) => x.dias.map((d) => ({ Mes: x.nombre, Fecha: d.fecha, Día: d.dia, [`Día a día ${sym}`]: d.variable, [`Gastos propios ${sym}`]: d.gastos, [`Ingresos propios ${sym}`]: d.ingresos, [`Pagado por familia ${sym}`]: d.familia, [`Presupuesto del día ${sym}`]: d.presupuesto, Movimientos: d.n }))));
  add('Inversiones', R.meses.flatMap((x) => x.inversiones.map((h) => ({ Mes: x.nombre, Activo: h.activo, Nombre: h.nombre, Tipo: h.tipo, Plataforma: h.plataforma, 'Primer día con precio': h.desde,
    'Cantidad inicio': h.cantidadInicio, 'Cantidad fin': h.cantidadFin, 'Comprado en el mes USD': h.compradoUSD, 'Vendido en el mes USD': h.vendidoUSD, 'Precio inicio USD': h.precioInicio, 'Precio fin USD': h.precioFin,
    'Variación del precio %': h.variacionPrecio, 'Ganancia del mes USD': h.gananciaMesUSD, 'Rendimiento del mes %': h.rendimientoMes, 'Precio promedio de compra USD': h.precioPromedio,
    'Rendimiento desde la compra %': h.rendimientoCompra, 'Valor fin USD': h.valorFinUSD, [`Valor fin ${sym}`]: h.valorFinLocal, Nota: h.nota }))));
  add('Inversiones diario', R.meses.flatMap((x) => x.invDiario.map((d) => ({ Fecha: d.fecha, Activo: d.activo, Cantidad: d.cantidad, 'Precio USD': d.precio, 'Variación día %': d.variacion, 'Valor USD': d.valorUSD, [`Valor ${sym}`]: d.valorLocal, Fuente: d.fuente }))));
  add('Compras y ventas', R.meses.flatMap((x) => x.operaciones.map((o) => ({ Fecha: o.fecha, Activo: o.activo, Operación: o.operacion, Cantidad: o.cantidad, 'Precio USD': o.precio, 'Comisión USD': o.comision, 'Total USD': o.totalUSD, Origen: o.origen }))));
  add('Mov. de inversión', R.meses.flatMap((x) => x.invMovs.map((t) => mov(x, t))));
  add('Préstamos', R.meses.flatMap((x) => x.prestamos.map((l) => ({ Mes: x.nombre, Persona: l.persona, Tipo: l.tipo, Fecha: l.fecha, Monto: l.monto, Moneda: l.moneda, 'Devuelto en el mes': l.devueltoEnElMes, 'Devuelto total': l.devueltoTotal, 'Falta (fin de mes)': l.falta, Vence: l.vence }))));
  add('Saldos diarios', R.meses.flatMap((x) => x.saldos.map((s) => ({ Fecha: s.fecha, Cuenta: s.cuenta, Moneda: s.moneda, Saldo: s.saldo, [`Saldo en ${sym}`]: s.saldoLocal, Estimado: s.estimado }))));
  add('Patrimonio diario', R.meses.flatMap((x) => x.patrimonio.map((p) => ({ Fecha: p.fecha, [`Patrimonio ${sym}`]: p.patrimonio, [`Liquidez ${sym}`]: p.liquidez, [`Inversiones ${sym}`]: p.inversiones, [`Deuda ${sym}`]: p.deuda }))));
  add('Cuentas', R.cuentas.map((a) => ({ Cuenta: a.cuenta, Tipo: a.tipo, Moneda: a.moneda, 'Saldo de hoy': a.saldo, [`En ${sym}`]: a.saldoLocal })));
  add('Mi plan', [
    { Dato: 'Perfil de inversor', Valor: R.plan.perfil }, { Dato: 'Perfil según las respuestas', Valor: R.plan.perfilRespuestas },
    ...R.plan.porque.map((w) => ({ Dato: 'Por qué', Valor: w })),
    { Dato: 'Plan: % renta fija', Valor: R.plan.objetivo?.fija ?? null }, { Dato: 'Plan: % renta variable', Valor: R.plan.objetivo?.variable ?? null }, { Dato: 'Plan: % diversificadores', Valor: R.plan.objetivo?.div ?? null },
    { Dato: 'Hoy: % renta fija', Valor: R.plan.real?.fija ?? null }, { Dato: 'Hoy: % renta variable', Valor: R.plan.real?.variable ?? null }, { Dato: 'Hoy: % diversificadores', Valor: R.plan.real?.diversificador ?? null },
    { Dato: 'Total invertido USD (fija + variable + diversificadores)', Valor: R.plan.investedUSD },
    ...R.plan.categorias.map((c) => ({ Dato: `Categoría: ${c.categoria} (USD)`, Valor: c.usd, Nota: c.extra })),
    ...R.plan.items.map((x) => ({ Dato: `${x.nombre} (${x.tipo})`, Valor: `${x.clase} · US$ ${x.usd}` })),
    ...R.plan.notas.map(([t, txt]) => ({ Dato: t, Valor: txt })),
    ...R.plan.pasos.map((s) => ({ Dato: `Paso: ${s.paso}`, Valor: s.hecho === 'Sí' ? 'Hecho' : 'Pendiente' })),
    ...R.plan.respuestas.map(([q, a]) => ({ Dato: q, Valor: a })),
  ]);
  add('Fijos', R.fijos.map((f) => ({ Nombre: f.nombre, Tipo: f.tipo, Monto: f.monto, Moneda: f.moneda, Día: f.dia, Categoría: f.categoria, 'Se repite': f.seRepite, Seguro: f.seguro })));
  add('Notas', [
    { Nota: `Informe de ${R.meses[0].nombre} a ${R.meses[R.meses.length - 1].nombre}, generado el ${R.generado}.` },
    { Nota: `Empezaste a registrar el ${fmtDate(R.primerRegistro)}. Moneda ${R.moneda}; tipo de cambio de hoy ${R.tipoCambio} por 1 USD.` },
    ...REPORT_NOTES.map((t) => ({ Nota: t })),
  ]);
  const data = X.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// Arma el informe con una ventana de progreso; al terminar, un botón para guardarlo o compartirlo
// (el iPhone sólo deja compartir un archivo como respuesta directa a un toque)
async function makeReport() {
  const s = S.settings;
  const { months } = reportMonths();
  let from = $('#repFrom')?.value || months[0], to = $('#repTo')?.value || months[months.length - 1];
  if (from > to) [from, to] = [to, from];
  const fmt = s.repFmt === 'xlsx' ? 'xlsx' : 'pdf';
  const dlg = $('#dlg'), form = $('#dlgForm');
  let cancelled = false;
  form.innerHTML = `<h2>Armando tu informe…</h2>
    <p class="small muted" id="repMsg" style="margin:0">Preparando…</p>
    <div class="meter"><div id="repBar" class="good" style="width:8%"></div></div>
    <div class="dlg-actions"><button type="button" class="btn ghost" data-close>Cancelar</button></div>`;
  form.onsubmit = (e) => e.preventDefault();
  form.oninput = null; form.onchange = null; form.onclick = null; dlg.onclose = null;
  form.querySelector('[data-close]').onclick = () => { cancelled = true; dlg.close(); };
  dlg.showModal();
  const step = (t, p) => { const m = $('#repMsg'); if (m) m.textContent = t; const b = $('#repBar'); if (b && p != null) b.style.width = `${p}%`; };
  try {
    step('Juntando tus datos…', 15);
    const R = await buildReport(from, to, (t) => step(t, 40));
    if (cancelled) return;
    step(fmt === 'pdf' ? 'Armando el PDF…' : 'Armando el Excel…', 75);
    const blob = fmt === 'pdf' ? await reportPDF(R) : await reportXLSX(R);
    if (cancelled) return;
    const name = `MyFinance-informe-${from}${from === to ? '' : `-a-${to}`}.${fmt}`;
    const file = new File([blob], name, { type: blob.type });
    form.innerHTML = `<h2>Tu informe está listo</h2>
      <p class="small" style="margin:0;color:var(--text-2)"><b>${esc(name)}</b> · ${R.meses.length} mes${R.meses.length > 1 ? 'es' : ''} · ${Math.max(1, Math.round(blob.size / 1024))} KB</p>
      <p class="small muted" style="margin:0">Guardalo en Archivos o mandalo directo a tu app de Claude para analizarlo.</p>
      <div class="dlg-actions"><button type="button" class="btn ghost" data-close>Cerrar</button>
        <button type="button" class="btn primary" id="repSave">${icon('download', 16)} Guardar o compartir</button></div>`;
    form.querySelector('[data-close]').onclick = () => dlg.close();
    $('#repSave').onclick = async () => {
      const mobile = matchMedia('(pointer: coarse)').matches;
      if (mobile && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: name }); dlg.close(); return; }
        catch (e) { if (e.name === 'AbortError') return; }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      dlg.close();
      toast('Informe descargado ✓');
    };
  } catch (e) {
    console.warn(e);
    if (cancelled) return;
    step(`No pude armar el informe: ${e.message || e}`, null);
    const b = $('#repBar'); if (b) b.className = 'critical';
  }
}

/* --- Filas de movimientos (Resumen y Movimientos) --- */

function txRowHTML(t) {
  const acc = S.accounts.find((a) => a.id === t.accountId);
  const to = t.type === 'transferencia' && S.accounts.find((a) => a.id === t.toAccountId);
  const sign = t.type === 'ingreso' ? '+' : t.type === 'gasto' ? '−' : '';
  const cur = acc?.currency || t.currency || 'USD';
  const ico = t.type === 'transferencia' ? icon('swap', 18) : t.loan ? icon('handshake', 18) : catIcon(t.category);
  const title = t.note || (t.type === 'transferencia' ? 'Transferencia' : t.category);
  const meta = t.type === 'transferencia' ? `${esc(acc?.name || '—')} → ${esc(to?.name || '—')}${t.fxRate ? ` · a ${Number(t.fxRate).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}`
    : `${esc(shortCat(t.category || ''))} · ${t.familyPaid ? 'Lo pagó tu familia' : esc(acc?.name || 'cuenta eliminada')}`;
  return `<button class="tx-row" data-action="editTx" data-id="${t.id}">
    <span class="tx-ico ${t.type}">${ico}</span>
    <span class="tx-main"><span class="tx-title">${esc(title)}${t.recurringId ? ' <span class="tag">fijo</span>' : t.scheduledId ? ' <span class="tag">programado</span>' : ''}${t.familyPaid ? ' <span class="tag fam">familia</span>' : ''}</span><span class="tx-meta">${meta}${t.time ? ` · ${esc(t.time)}` : ''}</span></span>
    <span class="tx-amt money ${t.type}">${sign}${fmtIn(t.amount, cur)}${t.type === 'transferencia' && t.toAmount && to ? `<small class="tx-to">→ ${fmtIn(t.toAmount, to.currency)}</small>` : ''}</span>
  </button>`;
}

const dayLabel = (iso) => {
  if (iso === todayISO()) return 'Hoy';
  if (iso === isoOf(Date.now() - 864e5)) return 'Ayer';
  const d = new Date(iso + 'T12:00:00');
  const s = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '');
  return s[0].toUpperCase() + s.slice(1);
};

function txListHTML(list) {
  if (!list.length) return '<div class="empty">Todavía no hay movimientos. Tocá <b>− Gasto</b> o <b>+ Ingreso</b> para empezar.</div>';
  let html = '', last = '';
  for (const t of list) {
    if (t.date !== last) { html += `<div class="tx-day">${dayLabel(t.date)}</div>`; last = t.date; }
    html += txRowHTML(t);
  }
  return `<div class="tx-list">${html}</div>`;
}

const sortTx = (a, b) => `${b.date}${b.time || ''}${b.created || ''}`.localeCompare(`${a.date}${a.time || ''}${a.created || ''}`);

const quickActionsHTML = () => `<div class="quick-actions">
  <button class="qa out" data-action="quick" data-id="gasto">${icon('minus', 22)}<span>Gasto</span></button>
  <button class="qa in" data-action="quick" data-id="ingreso">${icon('plus', 22)}<span>Ingreso</span></button>
  <button class="qa mic" data-action="receipt" aria-label="Leer un comprobante">${icon('receipt', 22)}<span>Recibo</span></button>
  <button class="qa mic" data-action="openChat" aria-label="Registrar hablando">${icon('mic', 22)}<span>Hablar</span></button>
</div>`;

function monthSummaryHTML(month) {
  const ms = monthStats(month);
  const fam = familyPaidIn(month);
  const left = ms.income - ms.expense;
  return `<div class="month-sum">
    <div><span>Gastaste</span><b class="money">${fmtMoney(ms.expense)}</b></div>
    <div><span>Entró</span><b class="money up">${fmtMoney(ms.income)}</b></div>
    <div><span>${left >= 0 ? 'Te queda' : 'Te pasaste'}</span><b class="money ${left >= 0 ? '' : 'down'}">${fmtMoney(Math.abs(left))}</b></div>
  </div>
  ${fam > 0 ? `<div class="small muted fam-note">Tu familia pagó <b class="money">${fmtMoney(fam)}</b> por vos: tu mes cuesta en realidad <b class="money">${fmtMoney(ms.expense + fam)}</b>.</div>` : ''}`;
}

/* ---------------- "Hoy podés gastar" ----------------
   Ingresos del mes (lo que ya entró + los fijos que faltan) − gastos fijos − lo que querés ahorrar
   = plata para el día a día. Se reparte entre los días que quedan del mes. */

function spendPlan() {
  const P = planNumbers();
  const month = currentMonth(), today = todayISO();
  const txs = S.transactions.filter((t) => t.date?.startsWith(month) && !nonFlow(t));
  const sum = (list) => list.reduce((s, t) => s + txUSD(t), 0);
  const pendingRules = (type) => S.recurring.filter((r) => repeats(r) && r.type === type && (!r.startMonth || r.startMonth <= month) && !recurringTx(r, month) && !(r.day && (r.skip || []).includes(month)));
  const income = sum(txs.filter((t) => t.type === 'ingreso')) + pendingRules('ingreso').filter(countsInPlan).reduce((s, r) => s + toUSD(r.amount, r.currency), 0);
  // (los intereses de Meru no se suman: quedan adentro de Meru como ahorro, no son plata para gastar)
  const fixed = sum(txs.filter((t) => t.type === 'gasto' && t.recurringId)) + pendingRules('gasto').reduce((s, r) => s + toUSD(r.amount, r.currency), 0);
  // Gastos programados: los de este mes (pagados o no) y los vencidos sin pagar
  const sched = sum(txs.filter((t) => t.type === 'gasto' && t.scheduledId)) + schedDueThisMonth().reduce((s, x) => s + toUSD(x.amount, x.currency), 0);
  const g = S.goals[0];
  const M = g ? goalMath(g, P) : null;
  const rate = Number(S.settings.saveRate ?? 10);
  const save = M?.needed != null ? M.needed : Math.max(0, income * rate / 100);
  const budget = income - fixed - sched - save;
  const spentBefore = sum(txs.filter((t) => isVariable(t) && t.date < today));
  const spentToday = sum(txs.filter((t) => isVariable(t) && t.date === today));
  const daysLeft = daysInMonth(month) - new Date().getDate() + 1;
  const perDay = (budget - spentBefore) / daysLeft;
  const spent = spentBefore + spentToday;
  // monthLeft < 0 = ya gastaste más de lo que tenías para todo el mes
  return { income, fixed, sched, save, budget, rate, goal: M?.needed != null ? g : null, spentBefore, spentToday, spent, daysLeft, perDay, todayLeft: perDay - spentToday, monthLeft: budget - spent };
}

/* ---------------- "Acumulado sin gastar" ----------------
   Sólo informativo: NO cambia spendPlan() ni ningún cálculo, saldo, ahorro, fijo o programado.
   Cada día se guarda el presupuesto del día que mostró la app; el acumulado suma, día por día desde
   el 1 del mes hasta ayer, lo que te sobró de ese presupuesto. Si gastaste de más, se descuenta, sin bajar de 0.
   Los días sin presupuesto guardado se estiman con la fórmula actual (y esa estimación no se guarda). */

// Guarda el presupuesto del día de hoy (el último valor que mostró la app hoy)
function recordDayBudget(p) {
  const today = todayISO();
  const v = Math.max(0, Number(p.perDay) || 0);
  const days = S.dayBudgets || (S.dayBudgets = {});
  if (days[today] && Math.abs(days[today].v - v) < 1e-9) return;
  days[today] = { v, at: new Date().toISOString() };
  // Alcanza con este mes y el anterior
  const from = addMonths(currentMonth(), -1);
  for (const k of Object.keys(days)) if (k.slice(0, 7) < from) delete days[k];
  save(false);
}

// Une los días guardados en dos dispositivos: de cada fecha queda el valor guardado más tarde
function mergeDayBudgets(a = {}, b = {}) {
  const out = { ...(a || {}) };
  for (const [d, x] of Object.entries(b || {})) if (x && Number.isFinite(x.v) && (!out[d] || (x.at || '') > (out[d].at || ''))) out[d] = x;
  return out;
}

// { usd, estimated }: estimated = true si algún día se calculó sin presupuesto guardado
function dailySaved() {
  const month = currentMonth(), today = todayISO();
  const dim = daysInMonth(month), todayDay = Number(today.slice(8, 10));
  const p = spendPlan();
  // Lo que gastaste cada día (los mismos gastos que cuenta "Hoy podés gastar": sin fijos, programados, familia ni transferencias)
  const spentOn = {};
  for (const t of S.transactions) if (t.date?.startsWith(month) && t.date < today && isVariable(t)) spentOn[t.date] = (spentOn[t.date] || 0) + txUSD(t);
  // No se cuentan los días antes de que empezaras a usar la app
  const firsts = [...S.transactions.map((t) => t.date), ...Object.keys(S.dayBudgets || {})].filter(Boolean).sort();
  const start = firsts[0] || today;
  let acc = 0, before = 0, estimated = false;
  for (let d = 1; d < todayDay; d++) {
    const iso = `${month}-${String(d).padStart(2, '0')}`;
    const spent = spentOn[iso] || 0;
    if (iso >= start) {
      const snap = S.dayBudgets?.[iso];
      let rec;
      if (snap && Number.isFinite(snap.v)) rec = snap.v;
      else { rec = (p.budget - before) / (dim - d + 1); estimated = true; } // misma fórmula que spendPlan() para ese día
      acc = Math.max(0, acc + Math.max(0, rec) - spent);
    }
    before += spent;
  }
  return { usd: acc, estimated };
}

/* ---------------- Colchón e ingreso seguro ---------------- */

// Lo que te cuesta un mes "normal": tus gastos fijos + lo que gastás en promedio en el día a día (USD)
function monthlyCostUSD() {
  const P = planNumbers();
  return P.recOut + P.avgVariable;
}

// "Si no entra nada más, aguantás X días": tu plata disponible (sin inversiones, menos lo que debés en tarjetas) ÷ lo que gastás por día
function runway() {
  const t = totals();
  const money = Math.max(0, t.liquid - t.debt);
  const perMonth = monthlyCostUSD();
  if (!(perMonth > 0) || !hasData()) return null;
  return { money, perMonth, days: Math.floor(money / (perMonth / 30)) };
}

// Si no entra nada más, ¿cuánto aguantás? (corto: el número y una línea)
function runwayHTML() {
  const r = runway();
  if (!r) return '';
  const cur = S.settings.localCurrency;
  const L = (usd) => fmtIn(fromUSD(usd, cur), cur);
  const tone = r.days < 30 ? 'critical' : r.days < 90 ? 'warning' : 'good';
  const big = r.days >= 730 ? 'más de 2 años' : r.days >= 60 ? `${fmtNum(r.days / 30, 1)} meses` : `${r.days} día${r.days === 1 ? '' : 's'}`;
  return `<section class="card runway">
    <div class="runway-top"><span class="muted small">Si no te entra nada más, te alcanza para</span>
      <b class="runway-val ${tone}">${big}</b></div>
    <div class="meter"><div class="${tone}" style="width:${Math.min(100, (r.days / 180) * 100)}%"></div></div>
    <div class="small muted money" style="margin-top:6px">Tenés ${L(r.money)} · gastás ${L(r.perMonth)} por mes</div>
  </section>`;
}

// ¿Qué tan seguro es lo que te entra? (corto: la barra, una conclusión y qué pasa si se corta cada ingreso)
function incomeSafetyHTML() {
  const incomes = S.recurring.filter((r) => repeats(r) && r.type === 'ingreso');
  if (!incomes.length) return '';
  const cur = S.settings.localCurrency;
  const L = (usd) => fmtIn(fromUSD(Math.abs(usd), cur), cur);
  const v = (r) => toUSD(r.amount, r.currency);
  const sure = incomes.filter(isSure).reduce((s, r) => s + v(r), 0);
  const maybe = incomes.filter((r) => !isSure(r)).reduce((s, r) => s + v(r), 0);
  const total = sure + maybe;
  const cost = monthlyCostUSD();
  const ok = sure >= cost;
  const cut = incomes.length > 1 || maybe > 0 ? incomes.map((r) => {
    const left = total - v(r) - cost;
    return `<div class="calc-row ${left < 0 ? 'over' : ''}"><span>Sin ${esc(r.name)}</span><b class="money ${left < 0 ? '' : 'up'}">${left < 0 ? '−' : '+'}${L(left)}/mes</b></div>`;
  }).join('') : '';
  return `<section class="card">
    <div class="card-head" style="margin-bottom:10px"><h2>Lo que te entra</h2><a href="#" data-action="go" data-id="fijos" class="small">Cambiar</a></div>
    <div class="stack">${sure > 0 ? `<div style="flex:${sure};background:var(--good)"></div>` : ''}${maybe > 0 ? `<div style="flex:${maybe};background:#fab219"></div>` : ''}</div>
    <div class="small" style="display:flex;gap:14px;flex-wrap:wrap;margin:6px 0 10px">
      <span><span class="swatch" style="background:var(--good)"></span> Seguro <b class="money">${L(sure)}</b></span>
      <span><span class="swatch" style="background:#fab219"></span> A veces <b class="money">${L(maybe)}</b></span></div>
    ${cost > 0 ? `<div class="safe-line ${ok ? 'ok' : 'bad'}">${icon(ok ? 'check' : 'alert', 16)}<span>${ok
      ? 'Con lo seguro te alcanza para todo el mes.'
      : `Sólo con lo seguro te faltan <b class="money">${L(cost - sure)}</b> por mes.`}</span></div>` : ''}
    ${cut ? `<div class="calc-sub" style="margin-top:10px"><b>Si se corta uno:</b></div><div class="calc">${cut}</div>` : ''}
  </section>`;
}

function spendCardHTML() {
  const p = spendPlan();
  const cur = S.settings.localCurrency;
  const L = (usd) => fmtIn(fromUSD(usd, cur), cur);
  const n = streak(), doneToday = activeDays().has(todayISO());
  const pct = p.budget > 0 ? Math.min(100, (p.spent / p.budget) * 100) : 100;
  // Si te pasaste, el número grande muestra cuánto (en negativo y en rojo), no Bs 0
  const overMonth = p.monthLeft < 0, overToday = !overMonth && p.todayLeft < 0;
  const val = overMonth ? p.monthLeft : p.todayLeft;
  const tone = p.budget <= 0 || val < 0 ? 'critical' : p.todayLeft < p.perDay * 0.3 ? 'warning' : 'good';
  const month = monthLabel(currentMonth(), 'long').replace(/^\w/, (c) => c.toUpperCase());
  const head = (showStreak) => `<div class="card-head" style="margin-bottom:4px"><span class="muted small">${month}</span>
      ${showStreak ? `<span class="streak ${doneToday ? 'done' : ''}">${icon('flame', 15)} ${n} ${n === 1 ? 'día' : 'días'}</span>` : ''}</div>`;
  // Sin fijos todavía: sólo la invitación a cargarlos (sin una barra roja de "Bs 0 de Bs 0")
  if (p.budget <= 0 && p.income <= 0 && !S.recurring.length) return `<section class="card spend-card">
    ${head(n > 0)}
    <div class="label">¿Cuánto podés gastar por día?</div>
    <div class="small muted" style="margin:4px 0 12px">Cargá tu sueldo y tus gastos de todos los meses y la app lo calcula.</div>
    <button class="btn primary" data-action="go" data-id="fijos">${icon('repeat', 16)} Agregar mis fijos</button>
  </section>`;
  const notCounted = S.recurring.filter((r) => repeats(r) && r.type === 'ingreso' && !countsInPlan(r));
  recordDayBudget(p);
  const saved = dailySaved();
  return `<section class="card spend-card">
    ${head(true)}
    ${p.budget <= 0 ? `<div class="label">Este mes no queda para el día a día</div>
      <div class="small muted" style="margin:4px 0 8px">Lo que te entra no alcanza para tus fijos y el ahorro.</div>`
    : `<button class="spend-main" data-action="spendInfo">
      <div class="label">Hoy podés gastar</div>
      <div class="spend-value money ${tone}">${L(val)}</div>
      <div class="saved-line ${saved.usd > 0.004 ? '' : 'zero'}" ${saved.estimated ? 'title="Incluye días estimados (sin presupuesto guardado ese día)"' : ''}>Acumulado sin gastar: <b class="money">${L(saved.usd)}</b></div>
      ${overMonth ? '<div class="over-note">Te pasaste del mes</div>' : overToday ? '<div class="over-note">Te pasaste hoy · mañana se reparte lo que queda</div>' : ''}
    </button>`}
    <div class="meter"><div class="${tone}" style="width:${pct}%"></div></div>
    <div class="small muted money" style="margin-top:6px">Llevás ${L(p.spent)} de ${L(Math.max(0, p.budget))} · ${p.daysLeft === 1 ? 'último día' : `quedan ${p.daysLeft} días`}</div>
    ${notCounted.length ? `<div class="small muted" style="margin-top:4px">Sin contar: ${notCounted.map((r) => esc(r.name)).join(', ')}</div>` : ''}
    <div class="spend-foot">
      <button class="link-btn" data-action="spendInfo">¿Cómo se calcula?</button>
      ${!doneToday && new Date().getHours() >= 19 ? `<button class="btn sm" data-action="checkin">Hoy no gasté</button>` : ''}
    </div>
  </section>`;
}

function spendInfo() {
  const p = spendPlan();
  const cur = S.settings.localCurrency;
  const L = (usd) => fmtIn(fromUSD(usd, cur), cur);
  const row = (a, b, c = '') => `<div class="calc-row ${c}"><span>${a}</span><b class="money">${b}</b></div>`;
  const incomes = S.recurring.filter((r) => repeats(r) && r.type === 'ingreso');
  const overMonth = p.monthLeft < 0;
  openForm({
    title: '¿Cómo se calcula?',
    fields: [
      ...(incomes.length ? [{ type: 'html', html: `<div class="calc-sub"><b>¿Qué ingresos contás?</b><br><span class="muted small">Apagá los que no sabés si van a llegar.</span></div>` }] : []),
      ...incomes.map((r) => ({
        name: `inc_${r.id}`, type: 'checkbox', full: true, value: countsInPlan(r),
        label: `${r.name} · ${fmtIn(r.amount, r.currency)}${recurringTx(r, currentMonth()) ? ' (ya entró)' : ''}`,
      })),
      { type: 'html', html: `<div class="calc">
        ${row('Te entra este mes', L(p.income))}
        ${row('− Fijos', L(p.fixed))}
        ${p.sched > 0 ? row('− Programados', L(p.sched)) : ''}
        ${row(p.goal ? `− Ahorro para "${esc(p.goal.name)}"` : `− Ahorro (${p.rate}%)`, L(p.save))}
        ${row('= Para gastar este mes', L(p.budget), 'total')}
        ${overMonth ? `
        ${row('− Ya gastaste', L(p.spent))}
        ${row('= Hoy podés gastar', L(p.monthLeft), 'total over')}` : `
        ${row('− Gastado antes de hoy', L(p.spentBefore))}
        ${row(`÷ ${p.daysLeft} días que quedan`, `${L(p.perDay)} por día`, 'total')}
        ${row('− Gastado hoy', L(p.spentToday))}
        ${row('= Hoy podés gastar', L(p.todayLeft), p.todayLeft < 0 ? 'total over' : 'total')}`}
      </div>` },
      { name: 'saveRate', label: p.goal ? 'Si no tuvieras meta: % para ahorrar' : '% de lo que te entra para ahorrar', type: 'number', value: p.rate, full: true },
    ],
    submitLabel: 'Listo',
    onSubmit: (v) => {
      if (v.saveRate != null && !(v.saveRate >= 0 && v.saveRate <= 90)) return 'Elegí un porcentaje entre 0 y 90.';
      if (v.saveRate != null) S.settings.saveRate = v.saveRate;
      for (const r of incomes) r.countInPlan = !!v[`inc_${r.id}`];
      save(); render();
    },
  });
}

/* ---------------- Favoritos de un toque ----------------
   Lo que registrás seguido (mismo detalle, categoría, monto y cuenta) aparece como botón:
   un toque y queda guardado, con "Deshacer" por si acaso. */

function favorites(type, n = 6) {
  const since = isoOf(Date.now() - 90 * 864e5);
  const groups = new Map();
  for (const t of S.transactions) {
    if (t.date < since || (type && t.type !== type) || !['gasto', 'ingreso'].includes(t.type) || nonFlow(t) || isFixedTx(t)) continue;
    if (!S.accounts.some((a) => a.id === t.accountId)) continue;
    const key = [t.type, norm(t.note || ''), t.category, t.amount, t.accountId].join('|');
    const g = groups.get(key) || { t, n: 0, last: '' };
    g.n++;
    if (t.date >= g.last) { g.last = t.date; g.t = t; }
    groups.set(key, g);
  }
  return [...groups.values()].filter((g) => g.n >= 2).sort((a, b) => b.n - a.n || b.last.localeCompare(a.last)).slice(0, n).map((g) => g.t);
}

function favChipsHTML(type, attr = 'data-action="fav"') {
  const favs = favorites(type);
  if (!favs.length) return '';
  return `<div class="favs">${favs.map((t) => {
    const acc = S.accounts.find((a) => a.id === t.accountId);
    const label = t.note && t.note !== t.category ? t.note : shortCat(t.category);
    return `<button class="fav ${t.type}" ${attr} data-id="${t.id}">${catIcon(t.category, 16)}<span>${esc(label.length > 16 ? label.slice(0, 15) + '…' : label)}</span>
      <b class="money">${t.type === 'gasto' ? '−' : '+'}${fmtIn(t.amount, acc?.currency || 'USD')}</b></button>`;
  }).join('')}</div>`;
}

function addFavorite(id) {
  const src = byId(S.transactions, id);
  if (!src) return;
  const tx = { id: uid(), created: new Date().toISOString(), type: src.type, date: todayISO(), time: nowTime(), accountId: src.accountId,
    amount: src.amount, category: src.category, note: src.note, via: 'favorito' };
  S.transactions.push(tx);
  applyTx(tx, 1);
  snapshot(); save(); render();
  const acc = S.accounts.find((a) => a.id === tx.accountId);
  toast(`Guardado: ${tx.note || tx.category} ${tx.type === 'gasto' ? '−' : '+'}${fmtIn(tx.amount, acc?.currency || 'USD')}`, 6000, {
    label: 'Deshacer',
    fn: () => {
      if (!S.transactions.includes(tx)) return;
      applyTx(tx, -1);
      S.transactions = S.transactions.filter((x) => x !== tx);
      tombstone(tx.id);
      snapshot(); save(); render();
      toast('Listo, lo deshice.');
    },
  });
}

/* ---------------- Render ---------------- */

const VIEW_FN = {
  resumen: () => viewResumen(), movimientos: () => viewMovimientos(), plan: () => viewPlan(),
  fijos: () => viewFijos(), programados: () => viewProgramados(), presupuesto: () => viewPresupuesto(), metas: () => viewMetas(),
  cuentas: () => viewCuentas(), prestamos: () => viewPrestamos(), inversiones: () => viewInversiones(), dolar: () => viewDolar(),
  analisis: () => viewAnalisis(), consejos: () => viewConsejos(), informe: () => viewInforme(), miplan: () => viewMiPlan(), historial: () => viewHistorial(), respaldo: () => viewRespaldo(), ajustes: () => viewAjustes(),
};

/* Menú "Más": una hoja con todas las secciones, agrupadas */
function moreMenuHTML() {
  const v = S.settings.view;
  const badge = { fijos: pendingRecurring().length, programados: schedPending().length };
  return `<div class="more-head"><b>Más secciones</b><button class="q-icon" data-more-close aria-label="Cerrar">${icon('x', 18)}</button></div>
    ${MORE_GROUPS.map(([title, list]) => `<div class="more-group"><div class="more-title">${title}</div><div class="more-grid">
      ${list.map(([id, label, ico]) => `<button class="more-item ${id === v ? 'on' : ''}" data-view="${id}">
        <span class="mi-ico">${icon(ico, 22)}${badge[id] ? `<i class="mi-badge">${badge[id]}</i>` : ''}</span><span class="mi-label">${label}</span></button>`).join('')}
    </div></div>`).join('')}`;
}
const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let moreTimer = null;
function openMore() {
  clearTimeout(moreTimer);
  const m = $('#moreMenu'), bd = $('#moreBackdrop');
  m.classList.remove('closing'); bd.classList.remove('closing');
  m.innerHTML = moreMenuHTML();
  m.hidden = false;
  bd.hidden = false;
  document.documentElement.classList.add('more-open');
  $('#moreBtn').classList.add('open');
}
// El menú "Más" baja suave al cerrarse (no desaparece de golpe)
function closeMore() {
  const m = $('#moreMenu'), bd = $('#moreBackdrop');
  if (m.hidden || m.classList.contains('closing')) return;
  document.documentElement.classList.remove('more-open');
  $('#moreBtn')?.classList.remove('open');
  const done = () => { m.hidden = true; bd.hidden = true; m.classList.remove('closing'); bd.classList.remove('closing'); };
  if (REDUCED()) return done();
  m.classList.add('closing'); bd.classList.add('closing');
  moreTimer = setTimeout(done, 200);
}

// Las hojas de abajo (registro rápido, secciones) bajan suave al cerrarse.
// Si se vuelven a abrir mientras bajan, se cancela el cierre.
function smoothClose(dlg) {
  const close = dlg.close.bind(dlg), show = dlg.showModal.bind(dlg);
  let t = null;
  dlg.close = (v) => {
    if (!dlg.open || t) return;
    if (REDUCED() || dlg.style.transform) return close(v); // al deslizarla ya bajó
    dlg.classList.add('closing');
    t = setTimeout(() => { t = null; dlg.classList.remove('closing'); close(v); }, 200);
  };
  dlg.showModal = () => {
    if (t) { clearTimeout(t); t = null; dlg.classList.remove('closing'); return; }
    if (!dlg.open) show();
  };
}

// Al cambiar de pantalla o abrir una hoja, el contenido aparece suave y en cascada
function animateIn(el) {
  if (!el || REDUCED()) return;
  el.classList.remove('view-in');
  void el.offsetWidth;
  el.classList.add('view-in');
  clearTimeout(el._viewIn);
  el._viewIn = setTimeout(() => el.classList.remove('view-in'), 700);
}

// En la computadora, todas las secciones van en la barra de la izquierda
function sidebarExtrasHTML() {
  return MORE_GROUPS.map(([title, list]) => `<div class="nav-group nav-secondary">${title}</div>
    ${list.map(([id, label, ico]) => `<button class="nav-btn nav-secondary" data-view="${id}"><span class="nav-ico">${icon(ico, 18)}</span><span>${label}</span></button>`).join('')}`).join('');
}

function render() {
  if (VIEW_ALIAS[S.settings.view]) S.settings.view = VIEW_ALIAS[S.settings.view];
  const v = VIEWS[S.settings.view] ? S.settings.view : 'resumen';
  $$('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
  $('#viewTitle').textContent = VIEWS[v];
  document.title = `${VIEWS[v]} · MyFinance`;
  const content = $('#content');
  content.innerHTML = fileBannerHTML() + VIEW_FN[v]();
  drawCharts();
  $('#curLocalBtn').textContent = curLabel(S.settings.localCurrency);
  $$('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.cur === S.settings.displayCurrency));
  document.body.classList.toggle('privado', !!S.settings.privacy);
  $('#privacyBtn').innerHTML = icon(S.settings.privacy ? 'eyeOff' : 'eye');
  $('#moreBtn').classList.toggle('active', MORE_VIEWS.includes(v));
  $('#lastRefresh').innerHTML = footHTML();
  tipEl().hidden = true;
  fillSheet(); // si hay una hoja abierta (ej. Fijos), se actualiza también
}

// Los gráficos se dibujan después de insertar el HTML (necesitan el ancho real)
function drawCharts(v = S.settings.view) {
  if (v === 'resumen') drawLine($('#nwChart'), S.history);
  if (v === 'analisis' && lastAnalysis) drawBars($('#barsChart'), lastAnalysis.per);
  if (v === 'analisis' && lastMonthly) drawMonthly($('#monthlyChart'), lastMonthly);
  if (v === 'metas' && lastProjection) drawProjection($('#projChart'), lastProjection);
}

/* Hoja deslizable: una sección (Fijos, Programados, Metas…) se abre encima de donde estás,
   sin irte a "Más". Se cierra deslizándola hacia abajo o con la X. */
let sheetView = null;
function openSheet(view) {
  if (!VIEW_FN[view]) return;
  closeMore();
  sheetView = view;
  const d = $('#sheetDlg');
  d.showModal();
  fillSheet();
  $('#sheet').scrollTop = 0;
  animateIn($('#sheet'));
}
function fillSheet() {
  const d = $('#sheetDlg');
  if (!sheetView || !d?.open) return;
  const sh = $('#sheet'), y = sh.scrollTop;
  const title = sheetView === 'historial' ? `Historial de ${esc(S.holdings.find((x) => x.id === S.settings.histId)?.symbol || '')}` : VIEWS[sheetView];
  sh.innerHTML = `<div class="sheet-head"><h2>${title}</h2>
    <button type="button" class="q-icon" data-sheet-close aria-label="Cerrar">${icon('x', 18)}</button></div>${VIEW_FN[sheetView]()}`;
  sh.scrollTop = y;
  drawCharts(sheetView);
}

function go(view, anchor) {
  closeMore();
  if ($('#sheetDlg')?.open) $('#sheetDlg').close();
  $('#content').style.minHeight = '';
  S.settings.view = VIEW_ALIAS[view] || view;
  save(false);
  render();
  window.scrollTo(0, 0);
  animateIn($('#content'));
  if (anchor) $('#' + anchor)?.scrollIntoView({ block: 'start' });
}

/* ---------------- Acciones: inversiones ---------------- */

/* Agregar activo: "Lo compré hoy" o "Ya lo tenía (compra anterior)". Cada compra (lote) se guarda como una
   operación real con su fecha; con "+ Agregar otra compra" se cargan varias en el mismo formulario. */
function addHoldingForm(state = { n: 1, vals: {} }) {
  const n = state.n, V = state.vals;
  const fields = [
    { name: 'when', label: '¿Cuándo lo compraste?', type: 'select', value: V.when || 'hoy', full: true, options: [['hoy', 'Lo compré hoy'], ['antes', 'Ya lo tenía (compra anterior)']] },
    { name: 'symbol', label: 'Ticker / símbolo', value: V.symbol || '', required: true, placeholder: 'VOO, BTC, NVDA…' },
    { name: 'name', label: 'Nombre', value: V.name || '', placeholder: 'Opcional' },
    { name: 'assetType', label: 'Tipo', type: 'select', value: V.assetType || 'accion', options: Object.entries(ASSET_TYPES) },
    { name: 'platform', label: 'Dónde lo tenés', value: V.platform || '', placeholder: 'Binance, broker…' },
    { name: 'coingeckoId', label: 'ID de CoinGecko', value: V.coingeckoId || '', placeholder: 'bitcoin, pax-gold…', full: true, hint: 'Para precio automático de cripto/oro.', showIf: (v) => v.assetType === 'cripto' || v.assetType === 'oro' },
  ];
  for (let k = 0; k < n; k++) {
    fields.push({ type: 'html', html: `<div class="imp-head"><b>${n > 1 ? `Compra ${k + 1}` : 'La compra'}</b></div>` });
    // La primera compra de "Lo compré hoy" es de hoy; las demás (o "Ya lo tenía") piden su fecha
    fields.push({ name: `date_${k}`, label: 'Fecha de compra', type: 'date', value: V[`date_${k}`] || '', full: true, showIf: (v) => v.when === 'antes' || k > 0 });
    fields.push({ name: `qty_${k}`, label: 'Cantidad', type: 'number', value: V[`qty_${k}`] ?? '', placeholder: 'ej. 0,1450' });
    fields.push({ name: `total_${k}`, label: 'Monto pagado (USD)', type: 'number', value: V[`total_${k}`] ?? '', placeholder: 'ej. 100' });
    fields.push({ name: `price_${k}`, label: 'Precio de compra por unidad (USD)', type: 'number', value: V[`price_${k}`] ?? '' });
    fields.push({ name: `fee_${k}`, label: 'Comisión (USD, opcional)', type: 'number', value: V[`fee_${k}`] ?? '', placeholder: '0' });
    fields.push({ type: 'html', html: `<div class="fx-hint" id="lotHint_${k}"></div>` });
  }
  fields.push({ type: 'html', html: '<button type="button" class="btn wide" id="addLotBtn">+ Agregar otra compra de este activo</button>' });
  fields.push({ type: 'html', html: '<div id="lotTotal" class="imp-result"></div>' });
  // Cantidad, monto y precio de una compra: lo último que escribiste manda
  const lotOf = (v, k) => {
    const price = v[`price_${k}`], fee = Math.max(0, v[`fee_${k}`] || 0);
    let qty = v[`qty_${k}`] > 0 ? v[`qty_${k}`] : null;
    if (!qty && v[`total_${k}`] > 0 && price > 0) qty = Math.round(((v[`total_${k}`] - fee) / price) * 1e8) / 1e8;
    return { qty, price, fee, date: k === 0 && v.when !== 'antes' ? todayISO() : v[`date_${k}`] };
  };
  let priceAsked = '';
  openForm({
    title: 'Agregar activo',
    fields,
    onInput: (form, v, changed) => {
      if (changed === 'symbol' || changed === 'assetType') {
        const id = CG_IDS[v.symbol.toUpperCase()];
        if (id && !form.elements.coingeckoId.value) form.elements.coingeckoId.value = id;
        if (changed === 'symbol' && id && form.elements.assetType.value !== 'oro') form.elements.assetType.value = id.includes('gold') ? 'oro' : 'cripto';
      }
      // "Lo compré hoy": se sugiere el precio actual como precio de compra
      const cg = form.elements.coingeckoId?.value.trim().toLowerCase();
      if (v.when === 'hoy' && cg && cg !== priceAsked && !form.elements.price_0.value) {
        priceAsked = cg;
        getJSON(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cg)}&vs_currencies=usd`).then((j) => {
          const p = j?.[cg]?.usd;
          if (p > 0 && !form.elements.price_0.value && $('#addLotBtn')) { form.elements.price_0.value = numInput(p); form.elements.price_0.dispatchEvent(new Event('input', { bubbles: true })); }
        }).catch(() => {});
      }
      const m = changed && changed.match(/^(qty|total|price|fee)_(\d+)$/);
      if (m) {
        const k = m[2], el = (x) => form.elements[`${x}_${k}`];
        if (m[1] === 'qty' || m[1] === 'total') form.dataset[`last${k}`] = m[1];
        const last = form.dataset[`last${k}`], price = parseNum(el('price').value), fee = Math.max(0, parseNum(el('fee').value) || 0);
        if (price > 0 && last === 'qty' && parseNum(el('qty').value) > 0) el('total').value = numInput(round2(parseNum(el('qty').value) * price + fee));
        if (price > 0 && last === 'total' && parseNum(el('total').value) > 0) el('qty').value = numInput(Math.round(((parseNum(el('total').value) - fee) / price) * 1e8) / 1e8);
      }
      let tq = 0, tc = 0;
      for (let k = 0; k < n; k++) {
        const L = lotOf({ ...v, ...Object.fromEntries(['qty', 'total', 'price', 'fee'].map((x) => [`${x}_${k}`, parseNum(form.elements[`${x}_${k}`].value)])) }, k);
        const h = $(`#lotHint_${k}`);
        if (h) h.innerHTML = L.qty > 0 && L.price > 0 ? `${fmtNum(L.qty)} × US$ ${fmtNum(L.price, 2)}${L.fee ? ` + comisión US$ ${fmtNum(L.fee, 2)}` : ''} = <b>US$ ${fmtNum(round2(L.qty * L.price + L.fee), 2)}</b>` : 'Escribí la cantidad o el monto pagado, y el precio.';
        if (L.qty > 0 && L.price > 0) { tq += L.qty; tc += L.qty * L.price + L.fee; }
      }
      const tot = $('#lotTotal');
      if (tot) tot.innerHTML = tq > 0 ? `Posición: <b class="money">${fmtNum(Math.round(tq * 1e8) / 1e8)} ${esc((v.symbol || '').toUpperCase())}</b> · precio promedio <b class="money">US$ ${fmtNum(tc / tq, 2)}</b>` : '';
    },
    onSubmit: (v) => {
      const symbol = v.symbol.toUpperCase();
      if (S.holdings.some((x) => x.symbol === symbol && x.platform === v.platform)) return `Ya tenés ${symbol} en esa plataforma. Usá Compra/Venta o su Historial.`;
      const trades = [];
      for (let k = 0; k < n; k++) {
        const L = lotOf(v, k), tag = n > 1 ? ` (compra ${k + 1})` : '';
        if (!L.date) return `Poné la fecha de compra${tag}.`;
        if (L.date > todayISO()) return `La fecha de compra${tag} no puede ser futura.`;
        if (!(L.price > 0)) return `Poné el precio de compra${tag}.`;
        if (!(L.qty > 0)) return `Poné la cantidad o el monto pagado${tag}.`;
        if (v[`qty_${k}`] > 0 && v[`total_${k}`] > 0 && Math.abs(v[`qty_${k}`] * L.price + L.fee - v[`total_${k}`]) > Math.max(0.05, v[`total_${k}`] * 0.01))
          return `No cierra${tag}: ${fmtNum(v[`qty_${k}`])} × US$ ${fmtNum(L.price, 2)}${L.fee ? ' + comisión' : ''} = US$ ${fmtNum(round2(v[`qty_${k}`] * L.price + L.fee), 2)}, no US$ ${fmtNum(v[`total_${k}`], 2)}.`;
        trades.push({ id: uid(), date: L.date, side: 'compra', qty: L.qty, price: L.price, fee: L.fee, u: new Date().toISOString() });
      }
      const cg = (v.assetType === 'cripto' || v.assetType === 'oro') ? v.coingeckoId.toLowerCase() : '';
      const today = v.when !== 'antes' ? lotOf(v, 0).price : 0;
      const h = { id: uid(), symbol, name: v.name, assetType: v.assetType, platform: v.platform, quantity: 0, avgCost: 0, coingeckoId: cg, trades: [],
        price: today || 0, priceUpdated: today ? new Date().toISOString() : null, priceSource: today ? 'manual' : '', change24h: null };
      S.holdings.push(h);
      changeTrades(h, () => trades, [], { resetGap: true });
      snapshot(); save(); render();
      toast(`${symbol}: ${trades.length} compra${trades.length > 1 ? 's' : ''} registrada${trades.length > 1 ? 's' : ''} ✓`);
      syncPriceHistory();
      if (cg || !h.price) refreshAll({ silent: true });
    },
  });
  const form = $('#dlgForm');
  for (const k of Object.keys(form.dataset)) delete form.dataset[k];
  // "+ Agregar otra compra": se vuelve a abrir con una compra más, sin perder lo que escribiste
  $('#addLotBtn').onclick = () => {
    const vals = Object.fromEntries([...form.elements].filter((e) => e.name).map((e) => [e.name, e.value]));
    $('#dlg').close();
    addHoldingForm({ n: n + 1, vals });
    $(`#dlgForm [name="date_${n}"]`)?.focus();
  };
  form.elements.symbol.dispatchEvent(new Event('input', { bubbles: true }));
}

function holdingForm(h) {
  const isNew = !h;
  h = h || { symbol: '', name: '', assetType: 'accion', platform: '', quantity: 0, avgCost: 0, price: 0, coingeckoId: '' };
  openForm({
    title: isNew ? 'Agregar activo' : `Editar ${h.symbol}`,
    fields: [
      { name: 'symbol', label: 'Ticker / símbolo', value: h.symbol, required: true, placeholder: 'VOO, BTC, NVDA…' },
      { name: 'name', label: 'Nombre', value: h.name, placeholder: 'Opcional' },
      { name: 'assetType', label: 'Tipo', type: 'select', value: h.assetType, options: Object.entries(ASSET_TYPES) },
      { name: 'platform', label: 'Dónde lo tenés', value: h.platform, placeholder: 'Binance, broker…' },
      { name: 'quantity', label: 'Cantidad', type: 'number', value: h.quantity, hint: 'Acciones, unidades o monedas. Se aceptan fracciones (0,1450).' },
      { name: 'avgCost', label: 'Precio promedio de compra (USD)', type: 'number', value: h.avgCost, blankZero: true, placeholder: 'Opcional' },
      // Lo que ya tenías sin registrar la compra: ¿desde cuándo? (así el informe no lo muestra en días anteriores)
      { name: 'initDate', label: '¿Desde qué fecha tenés esta cantidad?', type: 'date', value: h.initial?.date || (isNew ? todayISO() : ''), full: true,
        hint: 'Es tu "saldo inicial": poné la fecha en que lo compraste. Las compras y ventas nuevas registralas con Compra/Venta.',
        showIf: (v) => (v.quantity || 0) - (isNew ? 0 : netTrades(h)) > 1e-9 },
      { name: 'coingeckoId', label: 'ID de CoinGecko', value: h.coingeckoId, placeholder: 'bitcoin, pax-gold…', hint: 'Para precio automático de cripto/oro.', showIf: (v) => v.assetType === 'cripto' || v.assetType === 'oro' },
      { name: 'price', label: 'Precio actual (USD)', type: 'number', value: h.price, blankZero: true, hint: 'Se pisa al actualizar si hay precio automático.' },
    ],
    onInput: (form, vals, changed) => {
      if (changed !== 'symbol' && changed !== 'assetType') return;
      const id = CG_IDS[vals.symbol.toUpperCase()];
      if (id && !form.elements.coingeckoId.value) form.elements.coingeckoId.value = id;
      if (changed === 'symbol' && id && form.elements.assetType.value !== 'oro') form.elements.assetType.value = id.includes('gold') ? 'oro' : 'cripto';
    },
    onSubmit: (v) => {
      const symbol = v.symbol.toUpperCase();
      if (S.holdings.some((x) => x.symbol === symbol && x !== h && x.platform === v.platform)) return `Ya tenés ${symbol} en esa plataforma. Editalo o usá Compra/Venta.`;
      const changes = {
        symbol, name: v.name, assetType: v.assetType, platform: v.platform, quantity: v.quantity || 0, avgCost: v.avgCost || 0,
        coingeckoId: (v.assetType === 'cripto' || v.assetType === 'oro') ? v.coingeckoId.toLowerCase() : '',
      };
      if ((v.price || 0) !== (Number(h.price) || 0)) Object.assign(changes, { price: v.price || 0, priceUpdated: new Date().toISOString(), priceSource: 'manual', change24h: null });
      // Saldo inicial: lo que no sale de compras registradas necesita una fecha
      const base = (v.quantity || 0) - (isNew ? 0 : netTrades(h));
      if (base > 1e-9) {
        if (v.initDate && v.initDate > todayISO()) return 'La fecha no puede ser futura.';
        if (isNew && !v.initDate) return 'Poné desde qué fecha tenés esta cantidad.';
        if (v.initDate) changes.initial = { date: v.initDate, price: v.avgCost || null };
      } else if (!isNew && h.initial) changes.initial = null;
      // Otro ID de CoinGecko (u otro símbolo): sus precios guardados se vuelven a bajar desde la primera compra
      if (!isNew && (changes.coingeckoId !== (h.coingeckoId || '') || changes.symbol !== h.symbol)) resetPriceHistory(h);
      if (isNew) S.holdings.push({ id: uid(), change24h: null, priceUpdated: null, priceSource: '', trades: [], price: 0, ...changes });
      else Object.assign(h, changes);
      snapshot(); save(); render();
      if (changes.coingeckoId && !(Number(changes.price) || Number(h.price))) refreshAll({ silent: true });
      syncPriceHistory();
    },
  });
}

// Compra o venta: primero elegís si escribís el MONTO en USD o la CANTIDAD de unidades (el otro se calcula con el precio).
// Acepta fracciones (0,1450). La comisión se suma al costo (y se resta de lo que cobrás al vender).
function tradeForm(h) {
  const accOpts = [['', '— No mover dinero de ninguna cuenta —'], ...S.accounts.filter((a) => a.type !== 'credito').map((a) => [a.id, `${a.name} (${a.currency})`])];
  const mode0 = S.settings.tradeMode === 'qty' ? 'qty' : 'usd';
  openForm({
    title: `Compra / venta de ${h.symbol}`,
    fields: [
      { name: 'side', label: 'Operación', type: 'select', value: 'compra', options: [['compra', 'Compra'], ['venta', 'Venta']] },
      { name: 'date', label: 'Fecha', type: 'date', value: todayISO() },
      { name: 'mode', label: '¿Qué vas a escribir?', type: 'select', value: mode0, full: true, options: [['usd', 'Monto en USD (ej. invertí 100 dólares)'], ['qty', `Cantidad de unidades (ej. 0,1450 ${h.symbol})`]] },
      { name: 'total', label: 'Monto (USD)', type: 'number', placeholder: 'ej. 100', full: true, showIf: (v) => v.mode === 'usd' },
      { name: 'qty', label: `Cantidad (${h.symbol})`, type: 'number', placeholder: 'ej. 0,1450', hint: 'Se aceptan fracciones.', full: true, showIf: (v) => v.mode === 'qty' },
      { name: 'price', label: 'Precio por unidad (USD)', type: 'number', value: Number(h.price) || '', required: true },
      { name: 'fee', label: 'Comisión (USD, opcional)', type: 'number', blankZero: true, placeholder: '0' },
      { name: 'accountId', label: 'Cuenta de donde sale / a donde entra el dinero', type: 'select', options: accOpts, full: true,
        hint: 'Opcional. Si elegís una, se descuenta (compra) o acredita (venta) en esa cuenta.' },
      { type: 'html', html: '<div id="tradeHint" class="fx-hint"></div>' },
    ],
    submitLabel: 'Registrar',
    onInput: (form, v) => {
      const qty = v.mode === 'qty' ? v.qty : v.total > 0 && v.price > 0 ? Math.round((v.total / v.price) * 1e8) / 1e8 : null;
      const fee = v.fee || 0, sign = v.side === 'compra' ? 1 : -1;
      $('#tradeHint').innerHTML = qty > 0 && v.price > 0
        ? `${v.mode === 'usd' ? `Son <b>${fmtNum(qty)} ${esc(h.symbol)}</b>. ` : ''}${fmtNum(qty)} × US$ ${fmtNum(v.price, 2)} = <b>US$ ${fmtNum(round2(qty * v.price), 2)}</b>${fee ? ` ${sign > 0 ? '+' : '−'} comisión US$ ${fmtNum(fee, 2)} = <b>US$ ${fmtNum(round2(qty * v.price + sign * fee), 2)}</b>` : ''}`
        : (v.mode === 'usd' ? v.total > 0 : v.qty > 0) && !(v.price > 0) ? 'Escribí el precio para calcular.' : '';
    },
    onSubmit: (v) => {
      if (!(v.price > 0)) return 'El precio tiene que ser mayor a 0.';
      S.settings.tradeMode = v.mode;
      const qty = v.mode === 'qty' ? v.qty : v.total > 0 ? Math.round((v.total / v.price) * 1e8) / 1e8 : 0;
      if (!(qty > 0)) return v.mode === 'qty' ? 'Escribí la cantidad.' : 'Escribí el monto en USD.';
      const fee = Math.max(0, v.fee || 0);
      const q = Number(h.quantity) || 0;
      if (v.side === 'venta' && qty > q + 1e-12) return `Sólo tenés ${fmtNum(q)} ${h.symbol}.`;
      if (v.date > todayISO()) return 'La fecha no puede ser futura.';
      const acc = v.accountId ? S.accounts.find((a) => a.id === v.accountId) : null;
      if (acc && convert(1, 'USD', acc.currency) == null) return NO_RATE;
      // ¿Monto raro? (mucho más que tu saldo o que tus compras de siempre): se pregunta antes de guardar
      const total = qty * v.price;
      const past = S.holdings.flatMap((x) => x.trades || []).filter((x) => x.side === 'compra').map((x) => x.qty * x.price).filter((x) => x > 0).sort((a, b) => a - b);
      const typical = past.length >= 2 ? past[Math.floor(past.length / 2)] : null;
      const saldo = acc ? toUSD(acc.balance, acc.currency) : null;
      const big = v.side === 'compra' && ((saldo != null && total > Math.max(saldo, 0) * 1.5 + 1) || (typical && total > typical * 10));
      if (big) {
        const why = saldo != null ? `en ${esc(acc.name)} tenés US$ ${fmtNum(round2(saldo), 2)}` : `tus compras de siempre son de ≈ US$ ${fmtNum(round2(typical), 2)}`;
        setTimeout(async () => {
          if (v.mode === 'qty') {
            // Escribiste unidades: quizás eran dólares
            const asUsd = Math.round((qty / v.price) * 1e8) / 1e8;
            const ch = await chooseDlg('¿Está bien la cantidad?',
              `${fmtNum(qty)} ${esc(h.symbol)} × US$ ${fmtNum(v.price, 2)} = <b>US$ ${fmtNum(round2(total), 2)}</b>, y ${why}.<br><br>¿Quisiste decir <b>US$ ${fmtNum(qty, 2)}</b> en lugar de ${fmtNum(qty)} unidades?`,
              [['usd', `Sí: US$ ${fmtNum(qty, 2)} (${fmtNum(asUsd)} ${h.symbol})`], ['units', `No: son ${fmtNum(qty)} unidades`]]);
            if (ch === 'usd') saveTrade(h, { ...v, qty: asUsd, fee, acc });
            else if (ch === 'units') saveTrade(h, { ...v, qty, fee, acc });
          } else {
            const ch = await chooseDlg('¿Está bien el monto?', `Vas a registrar una compra de <b>US$ ${fmtNum(round2(total), 2)}</b>, y ${why}.`,
              [['ok', `Sí, registrar US$ ${fmtNum(round2(total), 2)}`], ['no', 'No, lo corrijo']]);
            if (ch === 'ok') saveTrade(h, { ...v, qty, fee, acc });
            else if (ch === 'no') tradeForm(h);
          }
        }, 80);
        return;
      }
      saveTrade(h, { ...v, qty, fee, acc });
    },
  });
}

function saveTrade(h, { side, date, qty, price, fee, acc }) {
  const tradeId = uid();
  const err = changeTrades(h, (list) => [...list, { id: tradeId, date, side, qty, price, fee: fee || 0, u: new Date().toISOString() }]);
  if (err) return toast(err, 5000);
  if (acc) {
    const tx = { id: uid(), created: new Date().toISOString(), investment: true, holdingId: h.id, tradeId, ...tradeTxFields(h, { side, date, qty, price, fee }, acc) };
    S.transactions.push(tx);
    applyTx(tx, 1);
  }
  snapshot(); save(); render();
  toast(`${side === 'compra' ? 'Compra' : 'Venta'} de ${fmtNum(qty)} ${h.symbol} registrada.`);
  syncPriceHistory(); // si la compra es de antes, se bajan los precios desde esa fecha
}

// Lo que mueve en tu cuenta una compra (sale plata, con la comisión) o una venta (entra, menos la comisión)
function tradeTxFields(h, { side, date, qty, price, fee }, acc) {
  const usd = side === 'compra' ? qty * price + (fee || 0) : qty * price - (fee || 0);
  return {
    date, type: side === 'compra' ? 'gasto' : 'ingreso', accountId: acc.id, amount: round2(convert(usd, 'USD', acc.currency)),
    category: side === 'compra' ? 'Compra de inversión' : 'Venta de inversión',
    note: `${side === 'compra' ? 'Compra' : 'Venta'} ${fmtNum(qty)} ${h.symbol}${fee ? ` (comisión US$ ${fmtNum(fee, 2)})` : ''}`,
  };
}

/* ---------------- Historial de operaciones de un activo ----------------
   Cada compra, venta o ajuste se puede ver, editar o borrar. La cantidad, el precio promedio,
   el rendimiento y el informe se recalculan solos. */

const tradeLabel = (t) => (t.side === 'compra' ? 'Compra' : t.side === 'venta' ? 'Venta' : 'Ajuste de cantidad');

// Aviso cuando tu posición no coincide con la suma de tus operaciones (con las dos formas de arreglarlo)
function positionWarnHTML(h, inSheet = false) {
  const gap = positionGap(h);
  if (Math.abs(gap) <= 1e-9 || (gap > 0 && h.initial?.date)) return '';
  const sum = netTrades(h);
  return `<div class="banner pos-warn"><div>${gap > 0
    ? `<b>${esc(h.symbol)}</b>: tu posición dice <b>${fmtNum(Number(h.quantity) || 0)}</b>, pero tus operaciones suman <b>${fmtNum(Math.round(sum * 1e10) / 1e10)}</b>. Faltan ${fmtNum(gap)} sin fecha (¿algo que ya tenías?).`
    : `<b>${esc(h.symbol)}</b>: tu posición dice <b>${fmtNum(Number(h.quantity) || 0)}</b>, pero tus operaciones suman <b>${fmtNum(Math.round(sum * 1e10) / 1e10)}</b> (${fmtNum(-gap)} de más).`}</div>
    <div class="toolbar" style="margin-top:8px">
      ${inSheet ? '' : `<button class="btn sm" data-action="opsHist" data-id="${h.id}">Corregir una operación</button>`}
      <button class="btn sm primary" data-action="qtyAdjust" data-id="${h.id}">Crear un ajuste de cantidad</button></div></div>`;
}

function viewHistorial() {
  const h = S.holdings.find((x) => x.id === S.settings.histId);
  if (!h) return '<div class="empty">Ese activo ya no existe.</div>';
  const list = byTradeDate(h.trades || []).reverse();
  const base = baseQty(h), q = Number(h.quantity) || 0, avg = Number(h.avgCost) || 0, p = Number(h.price) || 0;
  const linked = (t) => S.transactions.find((x) => x.tradeId === t.id);
  return `<section class="card">
    <div class="hist-head"><div><div class="muted small">Tu posición</div><b class="money" style="font-size:20px">${fmtNum(q)} ${esc(h.symbol)}</b></div>
      <div style="text-align:right"><div class="muted small">Precio promedio</div><b class="money">${avg ? `US$ ${fmtNum(avg, 2)}` : '—'}</b></div></div>
    <div class="small muted money" style="margin-top:6px">${p ? `Precio actual US$ ${fmtNum(p, 2)} · valor US$ ${fmtNum(round2(q * p), 2)}` : 'Sin precio actual'}${avg && p ? ` · <span class="${cls(p - avg)}">${fmtPct((p / avg - 1) * 100)} desde la compra</span>` : ''}</div>
  </section>
  ${positionWarnHTML(h, true)}
  <section class="card"><div class="card-head" style="margin-bottom:4px"><h2>Operaciones</h2><button class="btn sm primary" data-action="trade" data-id="${h.id}">+ Compra/Venta</button></div>
    <div class="list">${list.map((t) => {
      const total = t.side === 'ajuste' ? null : t.qty * t.price + (t.side === 'compra' ? 1 : -1) * (t.fee || 0);
      const acc = S.accounts.find((a) => a.id === linked(t)?.accountId);
      return `<div class="list-row act op-row">
        <span class="acc-ico sm ${t.side === 'venta' ? 'in' : ''}">${icon(t.side === 'ajuste' ? 'edit' : 'trending', 16)}</span>
        <div class="grow"><div class="name">${tradeLabel(t)}${t.src === 'importado' ? ' <span class="tag">importado (sin fecha)</span>' : t.src === 'chat' ? ' <span class="tag">del chat</span>' : ''}</div>
          <div class="meta money">${fmtDate(t.date)} · ${t.side === 'ajuste' ? `${t.qty > 0 ? '+' : ''}${fmtNum(t.qty)} ${esc(h.symbol)}` : `${fmtNum(t.qty)} × US$ ${fmtNum(t.price, 2)}`}${t.fee ? ` + comisión US$ ${fmtNum(t.fee, 2)}` : ''}${acc ? ` · ${esc(acc.name)}` : ''}</div></div>
        <div class="val">${total != null ? `<div class="money"><b>US$ ${fmtNum(round2(total), 2)}</b></div>` : ''}</div>
        <button class="btn sm ghost icon-only" data-action="tradeEdit" data-id="${h.id}|${t.id}" title="Editar" aria-label="Editar">${icon('edit', 16)}</button>
        <button class="btn sm ghost icon-only danger" data-action="tradeDel" data-id="${h.id}|${t.id}" title="Borrar" aria-label="Borrar">${icon('x', 16)}</button></div>`;
    }).join('')}
    ${base > 1e-9 ? `<div class="list-row act op-row">
        <span class="acc-ico sm">${icon('wallet', 16)}</span>
        <div class="grow"><div class="name">Saldo inicial</div><div class="meta money">${h.initial?.date ? fmtDate(h.initial.date) : '<span class="warn-text">sin fecha</span>'} · ${fmtNum(base)} ${esc(h.symbol)}${h.initial?.price ? ` × US$ ${fmtNum(h.initial.price, 2)}` : ''}</div></div>
        <button class="btn sm ghost icon-only" data-action="editHolding" data-id="${h.id}" title="Editar" aria-label="Editar">${icon('edit', 16)}</button></div>` : ''}
    ${!list.length && !(base > 1e-9) ? '<div class="empty">Todavía no hay operaciones.</div>' : ''}</div>
  </section>
  <p class="small muted" style="margin:0">Al editar o borrar una operación se recalculan tu cantidad, el precio promedio, el rendimiento y el informe.</p>`;
}

// Editar una compra, venta o ajuste (y la plata que movió en tu cuenta, si tenía una)
function tradeEditForm(h, t) {
  const tx = S.transactions.find((x) => x.tradeId === t.id);
  const isAdj = t.side === 'ajuste';
  const accOpts = [['', '— No mover dinero de ninguna cuenta —'], ...S.accounts.filter((a) => a.type !== 'credito').map((a) => [a.id, `${a.name} (${a.currency})`])];
  openForm({
    title: `Editar ${tradeLabel(t).toLowerCase()} de ${h.symbol}`,
    fields: isAdj ? [
      { name: 'date', label: 'Fecha', type: 'date', value: t.date },
      { name: 'qty', label: `Cantidad (+ suma, − resta)`, type: 'number', value: t.qty, required: true },
      { name: 'note', label: 'Motivo', value: t.note || '', full: true, placeholder: 'Opcional' },
    ] : [
      { name: 'side', label: 'Operación', type: 'select', value: t.side, options: [['compra', 'Compra'], ['venta', 'Venta']] },
      { name: 'date', label: 'Fecha', type: 'date', value: t.date },
      { name: 'qty', label: `Cantidad (${h.symbol})`, type: 'number', value: t.qty, required: true },
      { name: 'price', label: 'Precio por unidad (USD)', type: 'number', value: t.price, required: true },
      { name: 'fee', label: 'Comisión (USD)', type: 'number', value: t.fee || 0, blankZero: true, placeholder: '0' },
      { name: 'accountId', label: 'Cuenta donde se movió la plata', type: 'select', value: tx?.accountId || '', options: accOpts, full: true },
      { type: 'html', html: '<div id="tradeHint" class="fx-hint"></div>' },
    ],
    onInput: (form, v) => {
      const hint = $('#tradeHint');
      if (hint && v.qty > 0 && v.price > 0) hint.innerHTML = `${fmtNum(v.qty)} × US$ ${fmtNum(v.price, 2)}${v.fee ? ` ${v.side === 'compra' ? '+' : '−'} US$ ${fmtNum(v.fee, 2)}` : ''} = <b>US$ ${fmtNum(round2(v.qty * v.price + (v.side === 'compra' ? 1 : -1) * (v.fee || 0)), 2)}</b>`;
    },
    onSubmit: (v) => {
      if (v.date > todayISO()) return 'La fecha no puede ser futura.';
      if (isAdj ? !v.qty : !(v.qty > 0)) return 'La cantidad no puede ser 0.';
      if (!isAdj && !(v.price > 0)) return 'El precio tiene que ser mayor a 0.';
      const acc = !isAdj && v.accountId ? S.accounts.find((a) => a.id === v.accountId) : null;
      if (acc && convert(1, 'USD', acc.currency) == null) return NO_RATE;
      const next = isAdj ? { ...t, date: v.date, qty: v.qty, note: v.note, u: new Date().toISOString() }
        : { ...t, side: v.side, date: v.date, qty: v.qty, price: v.price, fee: Math.max(0, v.fee || 0), src: undefined, u: new Date().toISOString() };
      const err = changeTrades(h, (list) => list.map((x) => (x.id === t.id ? next : x)));
      if (err) return err;
      // La plata que movió en tu cuenta se rehace con los datos nuevos
      if (!isAdj) {
        if (tx) { applyTx(tx, -1); S.transactions = S.transactions.filter((x) => x !== tx); tombstone(tx.id); }
        if (acc) {
          const nt = { id: uid(), created: new Date().toISOString(), investment: true, holdingId: h.id, tradeId: t.id, ...tradeTxFields(h, next, acc) };
          S.transactions.push(nt); applyTx(nt, 1);
        }
      }
      snapshot(); save(); render();
      toast(`${tradeLabel(next)} de ${h.symbol} corregida ✓`);
      syncPriceHistory();
    },
  });
}

async function tradeDelete(h, t) {
  const tx = S.transactions.find((x) => x.tradeId === t.id);
  const ok = await confirmDlg(`Borrar ${tradeLabel(t).toLowerCase()}`,
    `Se borra la ${tradeLabel(t).toLowerCase()} del ${fmtDate(t.date)} (${fmtNum(t.qty)} ${esc(h.symbol)}) y se recalcula tu cantidad y tu precio promedio${tx ? '. También se revierte la plata que movió en tu cuenta' : ''}.`, 'Borrar');
  if (!ok) return;
  const err = undoTrade(h, t.id);
  if (err) return toast(err, 5000);
  if (tx) { applyTx(tx, -1); S.transactions = S.transactions.filter((x) => x !== tx); tombstone(tx.id); }
  snapshot(); save(); render();
  toast('Operación borrada ✓');
}

// Ajuste de cantidad: deja tus operaciones iguales a tu posición (con fecha, para que el informe sepa desde cuándo)
function qtyAdjustForm(h) {
  const gap = positionGap(h);
  openForm({
    title: `Ajuste de cantidad de ${h.symbol}`,
    fields: [
      { type: 'html', html: `<p class="small" style="margin:0;color:var(--text-2)">Tu posición: <b>${fmtNum(Number(h.quantity) || 0)}</b> · tus operaciones suman: <b>${fmtNum(Math.round(netTrades(h) * 1e10) / 1e10)}</b>.<br>
        Se registra un ajuste de <b>${gap > 0 ? '+' : ''}${fmtNum(gap)} ${esc(h.symbol)}</b> para que coincidan. No mueve plata de tus cuentas.</p>` },
      { name: 'date', label: gap > 0 ? '¿Desde qué fecha lo tenés?' : '¿Desde qué fecha ya no lo tenés?', type: 'date', value: todayISO(), full: true, required: true },
      { name: 'note', label: 'Motivo', value: '', full: true, placeholder: gap > 0 ? 'ej. lo tenía antes de usar la app' : 'ej. comisión cobrada en cripto' },
    ],
    submitLabel: 'Crear ajuste',
    onSubmit: (v) => {
      if (v.date > todayISO()) return 'La fecha no puede ser futura.';
      const id = uid();
      // Si suma, lleva el costo de esas unidades (así tu precio promedio no cambia); si resta, no mueve el precio promedio
      const price = gap > 0 ? Math.round(baseAvgOf(h) * 1e6) / 1e6 : 0;
      const err = changeTrades(h, (list) => [...list, { id, date: v.date, side: 'ajuste', qty: gap, price, fee: 0, note: v.note, u: new Date().toISOString() }], [], { resetGap: true });
      if (err) return err;
      snapshot(); save(); render();
      toast('Listo: tu posición y tus operaciones coinciden ✓');
    },
  });
}

// Deshace una compra/venta (al borrar su movimiento): devuelve la cantidad y el precio promedio de antes
function undoTrade(h, tradeId) {
  if (!(h.trades || []).some((x) => x.id === tradeId)) return null;
  return changeTrades(h, (list) => list.filter((x) => x.id !== tradeId), [tradeId]);
}

/* La posición (cantidad y precio promedio) sale de repasar TODAS las operaciones en orden de fecha,
   partiendo del saldo inicial. Así, al editar o borrar cualquier operación, todo se recalcula solo. */
const byTradeDate = (list) => list.map((t, i) => [t, i]).sort((a, b) => (a[0].date || '').localeCompare(b[0].date || '') || a[1] - b[1]).map(([t]) => t);
function replayHolding(h, trades, base, baseAvg) {
  let q = base, avg = base > 0 ? baseAvg : 0;
  for (const t of byTradeDate(trades)) {
    t.prevAvg = avg;
    // Una compra (o un ajuste que suma con su costo) cambia el precio promedio; una venta o un ajuste que resta, no
    if (t.side === 'compra' || (t.side === 'ajuste' && t.qty > 0 && t.price > 0)) { const nq = q + t.qty; avg = nq > 0 ? (q * avg + t.qty * t.price + (t.fee || 0)) / nq : avg; q = nq; }
    else q += tradeDelta(t);
    if (q < -1e-9) return { error: `Con este cambio te quedarías con ${fmtNum(Math.round(q * 1e8) / 1e8)} ${h.symbol} el ${fmtDate(t.date)}: revisá las ventas de después.` };
  }
  return { q: Math.max(0, Math.round(q * 1e10) / 1e10), avg };
}
// Precio promedio del saldo inicial: el que cargaste, o el que hace cerrar tu precio promedio de hoy
function baseAvgOf(h) {
  if (h.initial?.price > 0) return h.initial.price;
  const base = baseQty(h), trades = (h.trades || []).map((t) => ({ ...t }));
  if (!(base > 0)) return 0;
  if (!trades.some((t) => t.side === 'compra')) return Number(h.avgCost) || 0;
  const a0 = replayHolding(h, trades.map((t) => ({ ...t })), base, 0).avg, a1 = replayHolding(h, trades.map((t) => ({ ...t })), base, 1).avg;
  return a1 - a0 > 1e-12 ? Math.max(0, ((Number(h.avgCost) || 0) - a0) / (a1 - a0)) : Number(h.avgCost) || 0;
}
// Cambia las operaciones de un activo (agregar, editar o borrar) y recalcula su posición.
// Devuelve un texto de error (y no cambia nada) si la cantidad quedaría negativa en algún momento.
function changeTrades(h, mutate, removedIds = [], { resetGap = false } = {}) {
  // Si tu posición ya no coincidía con las operaciones, esa diferencia se mantiene (se corrige con el aviso de Inversiones).
  // Un ajuste de cantidad (resetGap) la reemplaza: desde ahí, posición = suma de operaciones.
  const gap = resetGap ? 0 : positionGap(h), base = Math.max(0, gap), offset = Math.min(0, gap), bAvg = baseAvgOf(h);
  const next = mutate((h.trades || []).map((t) => ({ ...t })));
  const r = replayHolding(h, next, base, bAvg);
  if (r.error) return r.error;
  h.trades = next;
  h.quantity = Math.max(0, Math.round((r.q + offset) * 1e10) / 1e10);
  if (r.q > 0 || next.length) h.avgCost = r.avg;
  for (const id of removedIds) tombstone(id); // así no vuelve desde el otro dispositivo
  return null;
}

/* ---------------- Importar desde mi chat ----------------
   Cada entrada es una compra (un "lote") con su fecha: el mismo activo puede venir varias veces.
   Antes de guardar se muestra una vista previa (fechas que faltan, reemplazar o agregar, duplicados y avisos). */

// Lee el texto pegado: devuelve los lotes válidos y los que no se pueden cargar (con el motivo)
function parseImport(text) {
  const m = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  let data;
  try { data = JSON.parse(m ? m[0] : text); } catch (e) { return { error: 'No pude leer el JSON. Revisá que esté completo.' }; }
  if (!Array.isArray(data)) data = data.holdings || data.portfolio || data.portafolio || data.compras || [];
  const lots = [], bad = [];
  data.forEach((r, i) => {
    const symbol = String(r.symbol || r.ticker || '').toUpperCase().trim();
    const n = (x) => (x == null || x === '' ? null : parseNum(x));
    let qty = n(r.quantity ?? r.cantidad), price = n(r.avgCost ?? r.price ?? r.precio ?? r.precioPromedio ?? r.avg_cost);
    const fee = Math.max(0, n(r.fee ?? r.comision) || 0), total = n(r.total ?? r.monto);
    const date = String(r.purchaseDate ?? r.fecha ?? r.date ?? '').trim();
    const why = [];
    if (!symbol) why.push('falta el símbolo');
    // Con el total se completa la cantidad o el precio que falte
    if (total > 0 && !(qty > 0) && price > 0) qty = Math.round(((total - fee) / price) * 1e8) / 1e8;
    if (total > 0 && qty > 0 && !(price > 0)) price = (total - fee) / qty;
    if (!(qty > 0)) why.push('la cantidad tiene que ser mayor a 0');
    if (!(price > 0)) why.push('el precio tiene que ser mayor a 0');
    if (qty > 0 && price > 0 && total > 0 && Math.abs(qty * price + fee - total) > Math.max(0.05, total * 0.01)) why.push(`cantidad × precio (+ comisión) da US$ ${fmtNum(round2(qty * price + fee), 2)}, no US$ ${fmtNum(total, 2)}`);
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))) why.push(`la fecha "${date}" no es AAAA-MM-DD`);
    else if (date > todayISO()) why.push('la fecha es futura');
    const lot = { i, symbol, name: r.name || r.nombre || '', type: r.type || '', platform: String(r.platform || r.plataforma || '').trim(), qty, price, fee, date };
    if (why.length) bad.push({ ...lot, why: why.join('; ') }); else lots.push(lot);
  });
  return { lots, bad };
}

const findHolding = (symbol, platform) => S.holdings.find((x) => x.symbol === symbol && (!platform || !x.platform || x.platform === platform));
const sameTrade = (a, b) => a.date === b.date && Math.abs(a.qty - b.qty) < 1e-9 && Math.abs(a.price - b.price) <= Math.max(0.01, b.price * 0.001);

// Resultado de importar un activo (posición y precio promedio) sin guardar nada: para la vista previa y para guardar
function planImport(group, vals) {
  const today = todayISO(), h = group.h;
  const mode = h ? vals[`mode_${group.k}`] || 'add' : 'replace';
  const trades = [], dups = [];
  for (const l of group.lots) {
    const qty = vals[`usd_${l.i}`] ? Math.round((l.qty / l.price) * 1e8) / 1e8 : l.qty; // era un monto en USD, no unidades
    const noDate = !l.date && vals[`nodate_${l.i}`];
    const date = l.date || (noDate ? today : vals[`date_${l.i}`] || today);
    const t = noDate
      ? { id: uid(), date: today, side: 'ajuste', qty, price: l.price, fee: 0, note: 'Saldo inicial importado (sin fecha de compra)', src: 'importado', u: new Date().toISOString() }
      : { id: uid(), date, side: 'compra', qty, price: l.price, fee: l.fee, src: 'chat', u: new Date().toISOString() };
    const dup = [...(mode === 'add' ? h?.trades || [] : []), ...trades].some((x) => sameTrade(x, t));
    (dup ? dups : trades).push({ ...t, lot: l });
  }
  const clean = (list) => list.map(({ lot, ...t }) => ({ ...t }));
  let q, avg;
  if (h && mode === 'add') {
    const gap = positionGap(h), r = replayHolding(h, clean([...(h.trades || []), ...trades]), Math.max(0, gap), baseAvgOf(h));
    q = r.error ? null : Math.max(0, r.q + Math.min(0, gap)); avg = r.avg;
  } else {
    const r = replayHolding({ symbol: group.symbol }, clean(trades), 0, 0);
    q = r.q; avg = r.avg;
  }
  return { mode, trades, dups, q, avg };
}

function importHoldings(text) {
  const P = parseImport(text);
  if (P.error) return toast(P.error, 4500);
  if (!P.lots.length) return toast(P.bad.length ? `No se puede cargar nada: ${P.bad[0].why}.` : 'No encontré activos en el texto.', 5000);
  // Agrupado por activo (símbolo + plataforma)
  const groups = [];
  for (const l of P.lots) {
    let g = groups.find((x) => x.symbol === l.symbol && (x.platform === l.platform || !x.platform || !l.platform));
    if (!g) groups.push(g = { k: groups.length, symbol: l.symbol, platform: l.platform, name: l.name, type: l.type, lots: [], h: findHolding(l.symbol, l.platform) });
    g.lots.push(l);
  }
  // ¿Monto en USD en vez de unidades? Si un lote vale muchísimo más que el resto de tu cartera
  const portfolio = S.holdings.reduce((s, h) => s + holdingValue(h), 0) + P.lots.reduce((s, l) => s + l.qty * l.price, 0);
  for (const l of P.lots) { const v = l.qty * l.price, rest = portfolio - v; l.big = v > 1000 && v > Math.max(rest, 100) * 10; }
  const fields = [{ type: 'html', html: '<p class="small" style="margin:0;color:var(--text-2)">Revisá lo que encontré. Cada línea es una compra con su fecha; nada se guarda hasta que toques <b>Importar</b>.</p>' }];
  for (const g of groups) {
    fields.push({ type: 'html', html: `<div class="imp-head"><b>${esc(g.symbol)}</b>${g.platform ? ` <span class="muted small">· ${esc(g.platform)}</span>` : ''} ${g.h ? '<span class="tag">ya lo tenés</span>' : '<span class="tag good">nuevo</span>'}</div>` });
    if (g.h) fields.push({ name: `mode_${g.k}`, label: `Ya tenés ${fmtNum(Number(g.h.quantity) || 0)} ${g.symbol}: ¿qué hago?`, type: 'select', value: 'add', full: true,
      options: [['add', 'Agregar: sumar estas compras a las que ya tengo'], ['replace', 'Reemplazar: borrar mis compras de este activo y usar éstas']] });
    for (const l of g.lots) {
      fields.push({ type: 'html', html: `<div class="imp-lot"><span>${l.date ? fmtDate(l.date) : '<span class="warn-text">sin fecha</span>'}</span><span class="money">${fmtNum(l.qty)} × US$ ${fmtNum(l.price, 2)}${l.fee ? ` + US$ ${fmtNum(l.fee, 2)}` : ''}</span><b class="money">US$ ${fmtNum(round2(l.qty * l.price + l.fee), 2)}</b></div>` });
      if (l.big) fields.push({ name: `usd_${l.i}`, type: 'checkbox', full: true, label: `¿Quisiste decir US$ ${fmtNum(l.qty, 2)} en lugar de ${fmtNum(l.qty)} unidades?`, hint: `${fmtNum(l.qty)} × US$ ${fmtNum(l.price, 2)} da US$ ${fmtNum(round2(l.qty * l.price), 2)}, muchísimo más que el resto de tu cartera. Marcalo si era un monto en dólares.` });
      if (!l.date) {
        fields.push({ name: `date_${l.i}`, label: `¿Cuándo compraste estos ${fmtNum(l.qty)} ${l.symbol}?`, type: 'date', full: true, showIf: (v) => !v[`nodate_${l.i}`] });
        fields.push({ name: `nodate_${l.i}`, type: 'checkbox', full: true, label: 'No la sé → usar como saldo inicial desde hoy' });
      }
    }
    fields.push({ type: 'html', html: `<div class="imp-result" id="impRes_${g.k}"></div>` });
  }
  if (P.bad.length) fields.push({ type: 'html', html: `<div class="banner"><b>No se van a cargar:</b><br>${P.bad.map((b) => `${esc(b.symbol || '(sin símbolo)')}: ${esc(b.why)}`).join('<br>')}</div>` });
  const paint = (v) => {
    for (const g of groups) {
      const p = planImport(g, v), el = $(`#impRes_${g.k}`);
      if (!el) continue;
      el.innerHTML = `${p.dups.length ? `<div class="small warn-text">${p.dups.length} compra(s) repetida(s): no se cargan dos veces.</div>` : ''}
        Resultado: <b class="money">${p.q == null ? '—' : `${fmtNum(p.q)} ${esc(g.symbol)}`}</b> · precio promedio <b class="money">${p.avg ? `US$ ${fmtNum(p.avg, 2)}` : '—'}</b>
        ${g.h && p.mode === 'replace' ? '<div class="small muted">Las compras que movieron plata de una cuenta quedan en Movimientos.</div>' : ''}`;
    }
  };
  openForm({
    title: 'Vista previa de la importación',
    fields,
    submitLabel: 'Importar',
    onInput: (form, v) => paint(v),
    onSubmit: (v) => {
      for (const g of groups) for (const l of g.lots) {
        if (l.date || v[`nodate_${l.i}`]) continue;
        const d = v[`date_${l.i}`];
        if (!d) return `Falta la fecha de compra de ${fmtNum(l.qty)} ${l.symbol} (o marcá "No la sé").`;
        if (d > todayISO()) return `La fecha de ${l.symbol} no puede ser futura.`;
      }
      const plans = groups.map((g) => [g, planImport(g, v)]);
      const neg = plans.find(([, p]) => p.q == null);
      if (neg) return `${neg[0].symbol}: con estas compras la cantidad quedaría negativa en algún momento. Elegí "Reemplazar" o revisá tus ventas.`;
      let added = 0, dupN = 0;
      for (const [g, p] of plans) {
        const trades = p.trades.map(({ lot, ...t }) => t);
        dupN += p.dups.length;
        let h = g.h;
        if (!h) {
          const cg = CG_IDS[g.symbol] || '';
          h = { id: uid(), symbol: g.symbol, name: g.name, assetType: cg ? (cg.includes('gold') ? 'oro' : 'cripto') : (g.type || 'accion'), platform: g.platform,
            quantity: 0, avgCost: 0, price: 0, change24h: null, priceUpdated: null, priceSource: '', coingeckoId: cg, trades: [] };
          S.holdings.push(h);
          changeTrades(h, () => trades, [], { resetGap: true });
        } else if (p.mode === 'replace') {
          // Las compras de antes se borran (la plata que movieron queda en Movimientos, sin vínculo)
          const old = (h.trades || []).map((t) => t.id);
          for (const t of S.transactions) if (t.holdingId === h.id && old.includes(t.tradeId)) { delete t.tradeId; delete t.holdingId; }
          h.initial = null;
          changeTrades(h, () => trades, old, { resetGap: true });
        } else {
          changeTrades(h, (list) => [...list, ...trades]);
        }
        if (g.platform) h.platform = g.platform;
        added += trades.length;
      }
      snapshot(); save();
      toast(`Importado: ${added} compra(s) en ${groups.length} activo(s)${dupN ? ` · ${dupN} repetida(s) no se cargaron` : ''}.`, 4500);
      syncPriceHistory();
      setTimeout(() => { go('inversiones'); refreshAll({ silent: true }); }, 50);
    },
  });
  paint(Object.fromEntries([...$('#dlgForm').elements].filter((e) => e.name).map((e) => [e.name, e.type === 'checkbox' ? e.checked : e.value])));
}

/* ---------------- Acciones: cuentas ---------------- */

function accountForm(a) {
  const isNew = !a;
  a = a || { name: '', type: 'banco', institution: '', currency: S.settings.localCurrency, balance: 0, last4: '', creditLimit: 0, closingDay: '', dueDay: '', notes: '' };
  const isCard = (v) => v.type === 'credito' || v.type === 'debito';
  openForm({
    title: isNew ? 'Agregar cuenta o tarjeta' : `Editar ${a.name}`,
    fields: [
      { name: 'type', label: 'Tipo', type: 'select', value: a.type, options: Object.entries(ACCOUNT_TYPES).map(([k, i]) => [k, i.label]) },
      { name: 'name', label: 'Nombre', value: a.name, required: true, placeholder: 'ej. Visa Galicia, Meru, Efectivo' },
      { name: 'institution', label: 'Banco / entidad', value: a.institution, placeholder: 'ej. Galicia, Santander, Meru, Binance' },
      { name: 'currency', label: 'Moneda', type: 'select', value: a.currency, options: CURRENCIES.map(([c, n]) => [c, `${c} — ${n}`]) },
      { name: 'balance', label: 'Saldo actual', type: 'number', value: a.balance, showIf: (v) => v.type !== 'credito' },
      { name: 'debt', label: 'Deuda actual (lo que debés)', type: 'number', value: a.balance, showIf: (v) => v.type === 'credito' },
      { name: 'last4', label: 'Últimos 4 dígitos', value: a.last4, placeholder: '1234', showIf: isCard, hint: 'Nunca cargues el número completo.' },
      { name: 'creditLimit', label: 'Límite de crédito', type: 'number', value: a.creditLimit, blankZero: true, showIf: (v) => v.type === 'credito' },
      { name: 'closingDay', label: 'Día de cierre', value: a.closingDay, placeholder: 'ej. 25', showIf: (v) => v.type === 'credito' },
      { name: 'dueDay', label: 'Día de vencimiento', value: a.dueDay, placeholder: 'ej. 5', showIf: (v) => v.type === 'credito' },
      // Rendimiento: Meru (USDC en Blend) u otra cuenta remunerada
      { name: 'apySource', label: 'Rendimiento (APY)', type: 'select', value: a.apySource === 'blend' ? 'blend' : Number(a.apy) ? 'manual' : 'none', full: true,
        options: [['none', 'Esta cuenta no genera intereses'], ['manual', 'Tasa fija que cargo yo'], ['blend', 'Automático: tasa de Blend, como Meru (USDC)']],
        showIf: (v) => v.type !== 'credito' },
      { name: 'apy', label: 'APY anual (%)', type: 'number', value: a.apySource === 'blend' ? '' : a.apy, placeholder: 'ej. 5', showIf: (v) => v.type !== 'credito' && v.apySource === 'manual' },
      { name: 'apyShown', label: 'APY que te muestra Meru hoy (%)', type: 'number', value: a.apySource === 'blend' ? round2(effectiveApy(a)) : '', placeholder: 'ej. 5,05',
        hint: S.settings.blendApy != null ? `Blend paga hoy ${fmtNum(S.settings.blendApy, 2)}%. Con tu dato calculo cuánto se queda Meru y sigo la tasa sola.` : 'Tocá Actualizar para traer la tasa de Blend.',
        showIf: (v) => v.type !== 'credito' && v.apySource === 'blend' },
      { name: 'apyAccrue', label: 'Sumar los intereses al saldo cada día', type: 'checkbox', value: a.apyAccrue, full: true, showIf: (v) => v.type !== 'credito' && v.apySource !== 'none' },
      { name: 'notes', label: 'Notas', value: a.notes, full: true, placeholder: 'Opcional' },
    ],
    onSubmit: (v) => {
      if (v.last4 && !/^\d{4}$/.test(v.last4)) return 'Los últimos dígitos tienen que ser exactamente 4 números.';
      // Cambiar la moneda reinterpretaría todos sus movimientos (100 dólares pasarían a ser Bs 100)
      if (a.id && v.currency !== a.currency && S.transactions.some((t) => t.accountId === a.id || t.toAccountId === a.id))
        return `Esta cuenta ya tiene movimientos en ${curLabel(a.currency)}. Para otra moneda, creá una cuenta nueva y pasá la plata con "Pasar plata entre cuentas".`;
      const apySource = v.type === 'credito' || v.apySource === 'none' ? 'manual' : v.apySource;
      let apy = v.type === 'credito' || v.apySource === 'none' ? 0 : Number(v.apy) || 0;
      let apyOffset = Number(a.apyOffset) || 0;
      if (apySource === 'blend') {
        apy = Number(v.apyShown) || effectiveApy(a) || 0;
        if (S.settings.blendApy != null && v.apyShown > 0) apyOffset = round2(S.settings.blendApy - v.apyShown);
      }
      const changes = {
        type: v.type, name: v.name, institution: v.institution, currency: v.currency,
        balance: (v.type === 'credito' ? v.debt : v.balance) || 0,
        last4: isCard(v) ? v.last4 : '', creditLimit: v.type === 'credito' ? (v.creditLimit || 0) : 0,
        closingDay: v.type === 'credito' ? v.closingDay : '', dueDay: v.type === 'credito' ? v.dueDay : '', notes: v.notes,
        apy, apySource, apyOffset, apyAccrue: apy > 0 && !!v.apyAccrue, apyLastAccrual: todayISO(),
      };
      if (isNew) S.accounts.push({ id: uid(), ...changes }); else Object.assign(a, changes);
      snapshot(); save(); render();
      if (!rate(v.currency)) refreshAll({ silent: true });
    },
  });
}

function balanceForm(a) {
  const isCredit = a.type === 'credito';
  const cur0 = Number(a.balance) || 0;
  openForm({
    title: `${isCredit ? 'Deuda' : 'Saldo'} de ${a.name}`,
    fields: [
      { name: 'balance', label: `${isCredit ? 'Deuda actual' : 'Saldo actual'} (${a.currency})`, type: 'number', value: a.balance, full: true,
        hint: 'Usalo para corregir el saldo y que coincida con tu banco/app.' },
      { type: 'html', html: '<div id="balHint" class="fx-hint"></div>' },
      { name: 'asTx', label: 'Registrar la diferencia como un movimiento de ajuste', type: 'checkbox', value: true, full: true,
        hint: 'Así queda en tus movimientos y en el informe. Desmarcalo si sólo querés corregir el número.',
        showIf: (v) => Math.abs((v.balance || 0) - cur0) > 0.005 },
    ],
    onInput: (form, v) => {
      const diff = round2((v.balance || 0) - cur0);
      $('#balHint').innerHTML = Math.abs(diff) > 0.005
        ? `La app calculaba <b class="money">${fmtIn(cur0, a.currency)}</b>. ${(isCredit ? diff > 0 : diff < 0) ? 'Salieron' : 'Entraron'} <b class="money">${fmtIn(Math.abs(diff), a.currency)}</b> que no están registrados.` : '';
    },
    onSubmit: (v) => {
      const next = v.balance || 0, diff = round2(next - cur0);
      if (Math.abs(diff) > 0.005) {
        const out = isCredit ? diff > 0 : diff < 0; // salió plata (o aumentó la deuda)
        if (v.asTx) {
          const tx = { id: uid(), created: new Date().toISOString(), type: out ? 'gasto' : 'ingreso', date: todayISO(), time: nowTime(), accountId: a.id,
            amount: Math.abs(diff), category: out ? 'Otros gastos' : 'Otros ingresos', note: 'Ajuste de saldo', adjust: true };
          S.transactions.push(tx); applyTx(tx, 1);
        } else {
          a.balance = next;
          a.balanceSetAt = new Date().toISOString(); // si corregís el saldo a mano en un dispositivo, el otro lo respeta al sincronizar
          // Para el informe: el saldo cambió sin movimientos registrados
          S.balanceLog.push({ id: uid(), accountId: a.id, date: todayISO(), delta: out ? -Math.abs(diff) : Math.abs(diff), currency: a.currency });
          if (S.balanceLog.length > 500) S.balanceLog.shift();
        }
      }
      snapshot(); save(); render();
    },
  });
}

/* ---------------- Acciones: movimientos ---------------- */

function txForm(type, t) {
  const isNew = !t;
  const accs = S.accounts;
  if (!accs.length) return toast('Primero agregá una cuenta.');
  t = t || { type, date: todayISO(), time: nowTime(), accountId: lastAccountFor(type === 'ingreso' ? 'ingreso' : 'gasto') || accs[0].id, toAccountId: '', amount: '', toAmount: '', category: '', note: '' };
  const accOpts = accs.map((a) => [a.id, `${a.name} (${a.currency})`]);
  const curOf = (id) => accs.find((a) => a.id === id)?.currency;
  const titles = { ingreso: 'ingreso', gasto: 'gasto', transferencia: 'transferencia' };
  openForm({
    title: `${isNew ? 'Nuevo' : 'Editar'} ${titles[t.type]}`,
    fields: [
      { name: 'type', label: 'Tipo', type: 'select', value: t.type, options: [['gasto', 'Gasto'], ['ingreso', 'Ingreso'], ['transferencia', 'Transferencia / pago de tarjeta']] },
      { name: 'date', label: 'Fecha', type: 'date', value: t.date },
      { name: 'time', label: 'Hora', type: 'time', value: t.time || '' },
      { name: 'accountId', label: 'Cuenta', type: 'select', value: t.accountId, options: accOpts, full: true },
      { name: 'toAccountId', label: 'Hacia la cuenta', type: 'select', value: t.toAccountId || accs.find((a) => a.id !== t.accountId)?.id, options: accOpts, showIf: (v) => v.type === 'transferencia' },
      { name: 'amount', label: 'Monto', type: 'number', value: t.amount, required: true },
      { name: 'toAmount', label: 'Monto que llega', type: 'number', value: t.toAmount, hint: 'Las cuentas tienen distinta moneda.',
        showIf: (v) => v.type === 'transferencia' && curOf(v.accountId) !== curOf(v.toAccountId) },
      { name: 'catGasto', label: 'Categoría', type: 'select', value: t.category, options: catsOf('gasto').map((c) => [c, c]), showIf: (v) => v.type === 'gasto' },
      { name: 'catIngreso', label: 'Categoría', type: 'select', value: t.category, options: catsOf('ingreso').map((c) => [c, c]), showIf: (v) => v.type === 'ingreso' },
      { name: 'note', label: 'Detalle', value: t.note, full: true, placeholder: 'ej. Almuerzo, pasaje, sueldo octubre…' },
      { name: 'memo', label: 'Nota (opcional): explicalo con tus palabras', type: 'textarea', value: t.memo || '', full: true,
        showIf: (v) => v.type !== 'transferencia' && OTHER_CATS.has(v.type === 'gasto' ? v.catGasto : v.catIngreso) },
      ...(isNew ? [] : [{ name: 'remove', label: 'Eliminar este movimiento', type: 'checkbox', full: true }]),
    ],
    onInput: (form, v, changed) => {
      if (!['amount', 'accountId', 'toAccountId', 'type'].includes(changed)) return;
      const c1 = curOf(v.accountId), c2 = curOf(v.toAccountId);
      if (v.type === 'transferencia' && c1 !== c2 && v.amount > 0) form.elements.toAmount.value = numInput(round2(fromUSD(toUSD(v.amount, c1), c2)));
    },
    onSubmit: (v) => {
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      if (v.remove) { setTimeout(() => ACTIONS.delTx(t.id), 50); return; }
      if (v.type === 'transferencia' && v.accountId === v.toAccountId) return 'Elegí dos cuentas distintas.';
      const cat = v.type === 'gasto' ? v.catGasto : v.type === 'ingreso' ? v.catIngreso : '';
      if (OTHER_CATS.has(cat) && (!v.note || v.note === cat)) return 'Contá qué fue en "Detalle" (ej. cuota extra del carnaval): así aparece en el análisis.';
      const sameCur = curOf(v.accountId) === curOf(v.toAccountId);
      const next = {
        type: v.type, date: v.date || todayISO(), time: v.time || '', accountId: v.accountId, amount: v.amount,
        toAccountId: v.type === 'transferencia' ? v.toAccountId : '',
        toAmount: v.type === 'transferencia' && !sameCur ? (v.toAmount || 0) : '',
        category: v.type === 'gasto' ? v.catGasto : v.type === 'ingreso' ? v.catIngreso : '', note: v.note, memo: OTHER_CATS.has(cat) && v.memo ? v.memo : undefined,
      };
      if (isNew) {
        const tx = { id: uid(), created: new Date().toISOString(), ...next };
        S.transactions.push(tx); applyTx(tx, 1);
      } else {
        // Si un fijo se mueve a otro mes, el mes original no se vuelve a registrar solo
        const r = t.recurringId && S.recurring.find((x) => x.id === t.recurringId);
        if (r && next.date.slice(0, 7) !== t.date.slice(0, 7)) r.skip = [...new Set([...(r.skip || []), t.date.slice(0, 7)])];
        applyTx(t, -1); Object.assign(t, next); applyTx(t, 1);
      }
      S.settings.txMonth = next.date.slice(0, 7);
      snapshot(); save(); render();
    },
  });
}

/* Pasar plata entre tus cuentas, con el tipo de cambio que te dieron de verdad
   (ej. Meru → banco: Meru te paga menos Bs por dólar que el oficial). */

// Cómo se expresa el tipo de cambio entre dos monedas: siempre "Bs por 1 US$" cuando hay dólares de por medio
function fxPair(from, to) {
  if (USD_PEGGED.has(from) && !USD_PEGGED.has(to)) return { label: `${curLabel(to)} por 1 US$`, out: (amt, r) => amt * r, rate: (amt, got) => got / amt };
  if (!USD_PEGGED.has(from) && USD_PEGGED.has(to)) return { label: `${curLabel(from)} por 1 US$`, out: (amt, r) => amt / r, rate: (amt, got) => amt / got };
  return { label: `${curLabel(to)} por 1 ${curLabel(from)}`, out: (amt, r) => amt * r, rate: (amt, got) => got / amt };
}
const marketFx = (from, to) => { const one = convert(1, from, to); if (one == null) return null; return fxPair(from, to).rate(1, one); };

function transferForm(fromId, t = null) {
  const accs = S.accounts;
  if (accs.length < 2) return toast('Necesitás al menos dos cuentas.');
  const last = S.settings.lastTransfer || {};
  const from0 = t?.accountId || fromId || last.from || accs.find((a) => /meru/i.test(a.name + a.institution))?.id || accs[0].id;
  // Destino: el último que usaste; si no, una cuenta de banco en otra moneda (ej. Meru en dólares → banco en Bs)
  const fromCur = accs.find((a) => a.id === from0)?.currency;
  const others = accs.filter((a) => a.id !== from0 && a.type !== 'credito');
  const to0 = t?.toAccountId || (last.to !== from0 && accs.some((a) => a.id === last.to) && last.to)
    || (others.find((a) => a.currency !== fromCur && (a.type === 'banco' || a.type === 'debito'))
      || others.find((a) => a.currency !== fromCur) || others[0])?.id;
  const accOpts = accs.map((a) => [a.id, `${a.name} (${curLabel(a.currency)})`]);
  const curOf = (id) => accs.find((a) => a.id === id)?.currency;
  const pairKey = (a, b) => `${curOf(a)}>${curOf(b)}`;
  // Para una fecha pasada se propone el tipo de cambio de ESE día; para hoy, el último que usaste
  const marketFxAt = (c1, c2, date) => { const one = convertAt(1, c1, c2, date).v; return one > 0 ? fxPair(c1, c2).rate(1, one) : null; };
  const rateFor = (a, b, date) => (date && date !== todayISO() ? marketFxAt(curOf(a), curOf(b), date) : null)
    || S.settings.lastFx?.[pairKey(a, b)] || marketFx(curOf(a), curOf(b));
  const r0 = t?.fxRate || rateFor(from0, to0);
  openForm({
    title: t ? 'Editar transferencia' : 'Pasar plata entre cuentas',
    fields: [
      { name: 'from', label: 'Sale de', type: 'select', value: from0, options: accOpts },
      { name: 'to', label: 'Llega a', type: 'select', value: to0, options: accOpts },
      { name: 'amount', label: `Monto que sale (${curLabel(curOf(from0))})`, type: 'number', value: t?.amount ?? '', required: true, full: true },
      { name: 'rate', label: `Tipo de cambio que te dieron (${fxPair(curOf(from0), curOf(to0)).label})`, type: 'number', value: r0 ? round2(r0) : '', full: true,
        showIf: (v) => curOf(v.from) !== curOf(v.to) },
      { name: 'got', label: 'Monto que te llegó', type: 'number', value: t?.toAmount || '', full: true, hint: 'Si escribís lo que te llegó, calculo el tipo de cambio solo.',
        showIf: (v) => curOf(v.from) !== curOf(v.to) },
      { type: 'html', html: '<div id="fxHint" class="fx-hint"></div>' },
      { name: 'date', label: 'Fecha', type: 'date', value: t?.date || todayISO() },
      { name: 'time', label: 'Hora', type: 'time', value: t?.time || nowTime() },
      { name: 'note', label: 'Detalle', value: t?.note || '', full: true, placeholder: 'ej. Meru al banco por QR' },
      ...(t ? [{ name: 'remove', label: 'Eliminar esta transferencia', type: 'checkbox', full: true }] : []),
    ],
    submitLabel: t ? 'Guardar cambios' : 'Pasar plata',
    onInput: (form, v, changed) => {
      const c1 = curOf(v.from), c2 = curOf(v.to);
      const P = fxPair(c1, c2);
      if (changed === 'from' || changed === 'to' || (changed === 'date' && !t)) {
        form.querySelector('[data-field="amount"] label').textContent = `Monto que sale (${curLabel(c1)})`;
        form.querySelector('[data-field="rate"] label').textContent = `Tipo de cambio que te dieron (${P.label})`;
        const r = rateFor(v.from, v.to, v.date);
        if (c1 !== c2 && r) { form.elements.rate.value = numInput(round2(r)); v.rate = round2(r); if (changed === 'date') changed = 'rate'; }
      }
      if (c1 === c2) { $('#fxHint').innerHTML = ''; return; }
      // Escribiste lo que te llegó → calculo el tipo de cambio; si no, calculo lo que llega
      if (changed === 'got' && v.amount > 0 && v.got > 0) { v.rate = P.rate(v.amount, v.got); form.elements.rate.value = numInput(round2(v.rate)); }
      // (sólo si cambiaste el monto, el tipo de cambio o las cuentas: escribir el detalle o la fecha no toca lo que te llegó)
      else if (['amount', 'rate', 'from', 'to'].includes(changed) && v.amount > 0 && v.rate > 0) { v.got = round2(P.out(v.amount, v.rate)); form.elements.got.value = numInput(v.got); }
      const market = convert(v.amount, c1, c2);
      const mr = marketFx(c1, c2);
      if (!(v.amount > 0) || !(v.got > 0) || market == null) { $('#fxHint').innerHTML = mr ? `Tipo de cambio de referencia hoy: <b>${fmtNum(mr, 2)}</b>` : ''; return; }
      const diff = market - v.got;
      $('#fxHint').innerHTML = Math.abs(diff) < 0.005 ? `Igual al tipo de cambio de referencia (${fmtNum(mr, 2)}).`
        : diff > 0 ? `Referencia hoy: <b>${fmtNum(mr, 2)}</b>. Con este cambio recibís <b class="down">${fmtIn(diff, c2)} menos</b> (${fmtPct((diff / market) * 100, false)}).`
        : `Referencia hoy: <b>${fmtNum(mr, 2)}</b>. Con este cambio recibís <b class="up">${fmtIn(-diff, c2)} más</b>.`;
    },
    onSubmit: (v) => {
      if (v.remove) { setTimeout(() => ACTIONS.delTx(t.id), 50); return; }
      if (v.from === v.to) return 'Elegí dos cuentas distintas.';
      if (!(v.amount > 0)) return 'Escribí el monto que sale.';
      const c1 = curOf(v.from), c2 = curOf(v.to);
      const same = c1 === c2;
      let got = '', rate = null;
      if (!same) {
        const P = fxPair(c1, c2);
        rate = v.rate > 0 ? v.rate : v.got > 0 ? P.rate(v.amount, v.got) : null;
        got = v.got > 0 ? v.got : rate ? round2(P.out(v.amount, rate)) : null;
        if (!(got > 0)) return 'Escribí el tipo de cambio o el monto que te llegó.';
        S.settings.lastFx = { ...(S.settings.lastFx || {}), [`${c1}>${c2}`]: round2(rate) };
      }
      S.settings.lastTransfer = { from: v.from, to: v.to };
      const next = { type: 'transferencia', date: v.date || todayISO(), time: v.time || '', accountId: v.from, toAccountId: v.to, amount: v.amount,
        toAmount: same ? '' : got, fxRate: same ? null : rate, category: '', note: v.note };
      if (t) { applyTx(t, -1); Object.assign(t, next); applyTx(t, 1); }
      else { const tx = { id: uid(), created: new Date().toISOString(), ...next }; S.transactions.push(tx); applyTx(tx, 1); }
      snapshot(); save(); render();
      const to = S.accounts.find((a) => a.id === v.to);
      toast(`Listo ✓ ${to.name}: ${fmtIn(to.balance, to.currency)}`);
    },
  });
  // Calcula "lo que llega" y la comparación con el oficial apenas se abre
  setTimeout(() => $('#dlgForm')?.dispatchEvent(new Event('input')), 0);
}

function payCardForm(card) {
  const sources = S.accounts.filter((a) => a.type !== 'credito');
  if (!sources.length) return toast('Agregá una cuenta de donde pagar.');
  openForm({
    title: `Pagar ${card.name}`,
    fields: [
      { type: 'html', html: `<div class="muted small">Deuda actual: <b class="money">${fmtIn(card.balance, card.currency)}</b></div>` },
      { name: 'from', label: 'Pagar desde', type: 'select', options: sources.map((a) => [a.id, `${a.name} (${a.currency})`]), full: true },
      { name: 'amount', label: `Monto a pagar (${card.currency})`, type: 'number', value: card.balance > 0 ? card.balance : '', required: true },
      { name: 'date', label: 'Fecha', type: 'date', value: todayISO() },
    ],
    submitLabel: 'Registrar pago',
    onSubmit: (v) => {
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      const from = S.accounts.find((a) => a.id === v.from);
      const paid = convert(v.amount, card.currency, from.currency);
      if (paid == null) return NO_RATE;
      const tx = { id: uid(), created: new Date().toISOString(), type: 'transferencia', date: v.date || todayISO(), accountId: from.id, toAccountId: card.id,
        amount: paid, toAmount: from.currency !== card.currency ? v.amount : '', category: '', note: `Pago ${card.name}` };
      S.transactions.push(tx); applyTx(tx, 1);
      snapshot(); save(); render();
      toast('Pago registrado.');
    },
  });
}

/* ---------------- Respaldo ---------------- */

function downloadJSON(name, json) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function backup() {
  S.settings.lastBackup = new Date().toISOString();
  save(false);
  downloadJSON(`mis-finanzas-respaldo-${todayISO()}.json`, JSON.stringify(S, null, 2));
  render();
  toast('Respaldo descargado.');
}

function restore(file) {
  const r = new FileReader();
  r.onload = async () => {
    try {
      const data = JSON.parse(r.result);
      if (!data || !Array.isArray(data.accounts) || !Array.isArray(data.holdings)) throw new Error('formato');
      if (!(await confirmDlg('Restaurar respaldo', `Esto reemplaza todos tus datos actuales por los del archivo <b>${esc(file.name)}</b>.`, 'Restaurar'))) return;
      S = migrate(data);
      save(); render();
      toast('Respaldo restaurado.');
    } catch (e) { toast('El archivo no es un respaldo válido de MyFinance.'); }
  };
  r.readAsText(file);
}

/* ---------------- Guardado automático en archivo (OneDrive) ---------------- */

// El "permiso" sobre el archivo elegido se recuerda en IndexedDB.
const idb = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('misFinanzas', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => { this.db = r.result; res(r.result); };
      r.onerror = () => rej(r.error);
    });
  },
  async run(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const q = fn(db.transaction('kv', mode).objectStore('kv'));
      q.onsuccess = () => res(q.result);
      q.onerror = () => rej(q.error);
    });
  },
  get: (k) => idb.run('readonly', (s) => s.get(k)),
  set: (k, v) => idb.run('readwrite', (s) => s.put(v, k)),
  del: (k) => idb.run('readwrite', (s) => s.delete(k)),
};

const FILE_TYPES = [{ description: 'Datos de MyFinance', accept: { 'application/json': ['.json'] } }];
const isValidData = (d) => !!d && Array.isArray(d.accounts) && Array.isArray(d.holdings);
const hasData = () => S.accounts.some((a) => Number(a.balance)) || S.holdings.some((h) => Number(h.quantity)) || S.transactions.length > 0;

async function readHandle(h) {
  const text = await (await h.getFile()).text();
  return text.trim() ? JSON.parse(text) : null;
}

const FileSync = {
  supported: typeof window.showSaveFilePicker === 'function',
  handle: null,
  status: 'none', // none | ok | paused | error | unsupported
  lastSaved: null,
  error: '',
  timer: null,
  chain: Promise.resolve(),

  setStatus(st, error = '') {
    const changed = st !== this.status;
    this.status = st;
    this.error = error;
    if (changed) render(); else updateFileStatusUI();
  },

  async init() {
    if (!this.supported) { this.status = 'unsupported'; return; }
    try { this.handle = (await idb.get('fileHandle')) || null; } catch (e) { this.handle = null; }
    if (!this.handle) return;
    const p = await this.handle.queryPermission?.({ mode: 'readwrite' });
    if (p === 'granted') { this.status = 'ok'; await this.sync(); }
    else this.status = 'paused';
  },

  // Archivo vs. navegador: gana la versión editada más recientemente.
  async sync() {
    let data = null;
    try { data = await readHandle(this.handle); } catch (e) { /* vacío o ilegible: se sobrescribe */ }
    if (isValidData(data) && (!hasData() || (data.editedAt || '') > (S.editedAt || ''))) {
      S = migrate(data);
      save(false);
      render();
      if (data.editedAt) toast(`Cargué tus datos más recientes desde ${this.handle.name}.`);
      return;
    }
    await this.write();
  },

  schedule() {
    if (this.status !== 'ok' || !this.handle) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.timer = null; this.write(); }, 700);
  },

  write() {
    clearTimeout(this.timer);
    this.timer = null;
    const json = JSON.stringify(S, null, 2);
    this.chain = this.chain.then(async () => {
      try {
        const w = await this.handle.createWritable();
        await w.write(json);
        await w.close();
        this.lastSaved = new Date().toISOString();
        this.setStatus('ok');
      } catch (e) {
        if (e.name === 'NotAllowedError' || e.name === 'SecurityError') this.setStatus('paused');
        else this.setStatus('error', e.message || String(e));
      }
    });
    return this.chain;
  },

  async attach(h) {
    this.handle = h;
    try { await idb.set('fileHandle', h); } catch (e) { toast('No pude recordar el archivo: habrá que elegirlo de nuevo la próxima vez.'); }
    this.status = 'ok';
  },

  // Crear un archivo nuevo (o elegir uno) donde guardar
  async link() {
    let h;
    try { h = await window.showSaveFilePicker({ suggestedName: 'mis-finanzas.json', types: FILE_TYPES, startIn: 'documents' }); }
    catch (e) { if (e.name !== 'AbortError') toast('No se pudo elegir el archivo: ' + e.message); return; }
    let data = null;
    try { data = await readHandle(h); } catch (e) { /* archivo nuevo */ }
    if (isValidData(data) && hasData()) {
      const c = await chooseDlg('Ese archivo ya tiene datos',
        `<b>${esc(h.name)}</b> ya tiene datos de MyFinance (última edición: ${fmtDateTime(data.editedAt)}). ¿Qué querés hacer?`,
        [['file', 'Usar los datos del archivo'], ['local', 'Reemplazar el archivo con los datos de este navegador']]);
      if (!c) return;
      await this.attach(h);
      if (c === 'file') { S = migrate(data); save(false); render(); } else { render(); await this.write(); }
    } else if (isValidData(data)) {
      await this.attach(h);
      S = migrate(data); save(false); render();
    } else {
      await this.attach(h);
      render();
      await this.write();
    }
    toast(`Listo: cada cambio se guarda automáticamente en ${h.name}.`, 4000);
  },

  // Abrir un archivo que ya existe (por ejemplo, desde otra computadora)
  async openExisting() {
    try {
      const [h] = await window.showOpenFilePicker({ types: FILE_TYPES, startIn: 'documents' });
      const data = await readHandle(h);
      if (!isValidData(data)) return toast('Ese archivo no es de MyFinance.');
      if (hasData() && !(await confirmDlg('Abrir archivo', `Se van a reemplazar los datos de este navegador por los de <b>${esc(h.name)}</b>.`, 'Abrir'))) return;
      if ((await h.requestPermission({ mode: 'readwrite' })) !== 'granted') return toast('Sin permiso para guardar en ese archivo.');
      S = migrate(data);
      await this.attach(h);
      save(false);
      render();
      toast(`Abierto ${h.name}. Los cambios se guardan ahí automáticamente.`, 4000);
    } catch (e) { if (e.name !== 'AbortError') toast('No se pudo abrir el archivo: ' + e.message); }
  },

  async reconnect() {
    try {
      if ((await this.handle.requestPermission({ mode: 'readwrite' })) !== 'granted') return toast('Sin permiso: el guardado sigue en pausa.');
      this.status = 'ok';
      await this.sync();
      render();
    } catch (e) { this.setStatus('error', e.message); }
  },

  async unlink() {
    clearTimeout(this.timer);
    this.timer = null;
    this.handle = null;
    this.lastSaved = null;
    try { await idb.del('fileHandle'); } catch (e) { /* nada */ }
    this.setStatus(this.supported ? 'none' : 'unsupported');
  },
};

function chooseDlg(title, text, options) {
  return new Promise((resolve) => {
    openForm({
      title, submitLabel: 'Continuar',
      fields: [{ type: 'html', html: `<p style="margin:0">${text}</p>` }, { name: 'choice', label: 'Opción', type: 'select', options, value: options[0][0], full: true }],
      onSubmit: (v) => { resolve(v.choice); },
      onCancel: () => resolve(null),
    });
  });
}

function fileSyncHTML() {
  const f = FileSync;
  const name = f.handle ? `<b>${esc(f.handle.name)}</b>` : '';
  switch (f.status) {
    case 'unsupported':
      return '';
    case 'ok':
      return `<p class="small" style="margin-top:0"><span class="up">✓</span> Guardando automáticamente en ${name}.<br>
        <span class="muted">Último guardado: ${f.lastSaved ? fmtDateTime(f.lastSaved) : 'pendiente'}</span></p>
        <div class="toolbar"><button class="btn sm" data-action="fileLink">Cambiar archivo</button>
        <button class="btn sm ghost danger" data-action="fileUnlink">Desvincular</button></div>`;
    case 'paused':
      return `<div class="banner" style="margin-bottom:10px">⏸ El guardado en ${name} está en pausa: el navegador pide permiso otra vez (pasa cuando lo reiniciás).</div>
        <div class="toolbar"><button class="btn sm primary" data-action="fileReconnect">Reactivar</button>
        <button class="btn sm ghost danger" data-action="fileUnlink">Desvincular</button></div>`;
    case 'error':
      return `<div class="banner" style="margin-bottom:10px">⚠ No se pudo guardar en ${name}: ${esc(f.error)}</div>
        <div class="toolbar"><button class="btn sm primary" data-action="fileReconnect">Reintentar</button>
        <button class="btn sm" data-action="fileLink">Elegir otro archivo</button></div>`;
    default:
      return `<p class="small" style="color:var(--text-2);margin-top:0">Elegí dónde guardar un archivo dentro de tu carpeta de <b>OneDrive</b> y la app va a escribir ahí cada cambio.
        Así tus datos quedan en la nube y los podés abrir desde otra computadora.</p>
        <div class="toolbar"><button class="btn primary" data-action="fileLink">Elegir dónde guardar</button>
        <button class="btn" data-action="fileOpen">Abrir un archivo existente</button></div>`;
  }
}

function fileBannerHTML() {
  if (FileSync.status === 'paused') return `<div class="banner">⏸ El guardado automático en tu archivo está en pausa. <a href="#" data-action="fileReconnect">Reactivar</a></div>`;
  if (FileSync.status === 'error') return `<div class="banner">⚠ No se pudo guardar en tu archivo. <a href="#" data-action="go" data-id="respaldo">Ver detalle</a></div>`;
  return '';
}

function footHTML() {
  const f = FileSync;
  const file = f.status === 'ok' ? `✓ Guardado en ${esc(f.handle.name)}${f.lastSaved ? ' · ' + fmtDateTime(f.lastSaved).split(', ').pop() : ''}`
    : f.status === 'paused' ? '⏸ Guardado en archivo en pausa'
    : f.status === 'error' ? '⚠ Error al guardar en archivo'
    : 'Guardado sólo en este navegador';
  const cloud = CloudSync.enabled() ? `<br>${CloudSync.status === 'error' ? '⚠ Error al sincronizar' : `✓ Sincronizado ${CloudSync.lastSync ? fmtDateTime(CloudSync.lastSync).split(', ').pop() : ''}`}` : '';
  return `Precios: ${fmtDateTime(S.settings.lastRefresh)}<br>${file}${cloud}`;
}

function updateFileStatusUI() {
  const box = $('#fileSync');
  if (box) box.innerHTML = fileSyncHTML();
  $('#lastRefresh').innerHTML = footHTML();
}

/* ---------------- Eventos ---------------- */

const byId = (arr, id) => arr.find((x) => x.id === id);

const ACTIONS = {
  // Un enlace a una sección de "Más" (Fijos, Programados, Metas…) la abre en una hoja, sin cambiar de pestaña
  go: (id, el) => (MORE_VIEWS.includes(id) && !el.dataset.anchor ? openSheet(id) : go(id, el.dataset.anchor)),
  addHolding: () => addHoldingForm(),
  editHolding: (id) => holdingForm(byId(S.holdings, id)),
  trade: (id) => tradeForm(byId(S.holdings, id)),
  delHolding: async (id) => {
    const h = byId(S.holdings, id);
    if (await confirmDlg('Eliminar activo', `¿Eliminar <b>${esc(h.symbol)}</b> de tu portafolio?`)) {
      S.holdings = S.holdings.filter((x) => x !== h); tombstone(h.id); snapshot(); save(); render();
    }
  },
  addAccount: () => accountForm(),
  editAccount: (id) => accountForm(byId(S.accounts, id)),
  setBalance: (id) => balanceForm(byId(S.accounts, id)),
  payCard: (id) => payCardForm(byId(S.accounts, id)),
  delAccount: async (id) => {
    const a = byId(S.accounts, id);
    const n = S.transactions.filter((t) => t.accountId === id || t.toAccountId === id).length;
    if (await confirmDlg('Eliminar cuenta', `¿Eliminar <b>${esc(a.name)}</b>?${n ? ` Tiene ${n} movimiento(s), que quedarán como “cuenta eliminada”.` : ''}`)) {
      // Sus movimientos guardan la moneda, así siguen sumando bien en los análisis
      for (const t of S.transactions) if (t.accountId === id && !t.currency) t.currency = a.currency;
      S.accounts = S.accounts.filter((x) => x !== a); tombstone(a.id); snapshot(); save(); render();
    }
  },
  addTx: (type) => (type === 'transferencia' ? transferForm() : quickEntry(type)),
  transferFrom: (id) => transferForm(id),
  quick: (type) => quickEntry(type),
  editTx: (id) => {
    const t = byId(S.transactions, id);
    if (!t) return;
    if (t.loanId) return go('prestamos');
    if (t.type === 'transferencia') return transferForm(null, t);
    if (t.investment) return txForm(null, t);
    quickEntry(null, t);
  },
  monthShift: (d) => {
    const m = addMonths(S.settings.txMonth || currentMonth(), Number(d));
    if (m > currentMonth()) return;
    S.settings.txMonth = m; save(false); render();
  },
  delTx: async (id) => {
    const t = byId(S.transactions, id);
    if (t.loanId) return toast('Este movimiento es de un préstamo: corregilo desde Cuentas → Préstamos.', 4500);
    const h = t.holdingId && S.holdings.find((x) => x.id === t.holdingId);
    // Si el activo ya se eliminó, se puede borrar igual (sólo se revierte el saldo de la cuenta)
    if (t.investment && !h && !t.holdingId) return toast('Es una compra/venta de inversión: corregí la cantidad desde Inversiones → Editar.', 4500);
    if (await confirmDlg('Eliminar movimiento', `Se va a revertir su efecto en el saldo de la cuenta${h ? ` y en tu cantidad de ${esc(h.symbol)}` : ''}.`)) {
      if (h) { const err = undoTrade(h, t.tradeId); if (err) return toast(err, 5000); }
      // Un fijo borrado no se vuelve a registrar solo ese mes
      const r = t.recurringId && S.recurring.find((x) => x.id === t.recurringId);
      if (r && r.day) r.skip = [...new Set([...(r.skip || []), t.date.slice(0, 7)])];
      applyTx(t, -1); S.transactions = S.transactions.filter((x) => x !== t); tombstone(t.id); snapshot(); save(); render();
    }
  },
  saveKey: () => { S.settings.finnhubKey = $('#setFinnhub').value.trim(); save(); toast('Clave guardada.'); refreshAll(); },
  copyPrompt: async () => {
    try { await navigator.clipboard.writeText(CHAT_PROMPT); toast('Pedido copiado. Pegalo en tu chat.'); }
    catch (e) { const r = document.createRange(); r.selectNodeContents($('#chatPrompt')); getSelection().removeAllRanges(); getSelection().addRange(r); toast('Seleccionado: copialo con Ctrl+C.'); }
  },
  importHoldings: () => importHoldings($('#importText').value),
  repFmt: (fmt) => { S.settings.repFmt = fmt; save(false); render(); },
  opsHist: (id) => { S.settings.histId = id; openSheet('historial'); },
  tradeEdit: (ids) => { const [hid, tid] = ids.split('|'); const h = byId(S.holdings, hid); const t = h?.trades?.find((x) => x.id === tid); if (t) tradeEditForm(h, t); },
  tradeDel: (ids) => { const [hid, tid] = ids.split('|'); const h = byId(S.holdings, hid); const t = h?.trades?.find((x) => x.id === tid); if (t) tradeDelete(h, t); },
  qtyAdjust: (id) => qtyAdjustForm(byId(S.holdings, id)),
  catAdd: (type) => customCatForm(type),
  planStepAdd: () => {
    const inp = $('#planStepNew'), text = inp?.value.trim();
    if (!text) { inp?.focus(); return toast('Escribí el paso.'); }
    const P = planOf(); P.steps = [...(P.steps || []), { id: uid(), text, done: false }]; touchPlan(); save(); render();
    setTimeout(() => $('#planStepNew')?.focus(), 50);
  },
  planStepDel: (id) => { const P = planOf(); P.steps = (P.steps || []).filter((s) => s.id !== id); touchPlan(); save(); render(); },
  catEdit: (id) => { const c = (S.customCats || []).find((x) => x.id === id); if (c) customCatForm(c.type, null, c); },
  fixSuggest: (i) => { const s = fixedSuggestions()[Number(i)]; if (s) recurringForm(null, { type: 'gasto', name: s.name, amount: s.amount, currency: s.currency, accountId: s.accountId, category: s.category }); },
  fixDismiss: (i) => { const s = fixedSuggestions()[Number(i)]; if (!s) return; S.settings.fixDismissed = [...(S.settings.fixDismissed || []), s.key].slice(-100); save(false); render(); },
  reportMake: () => makeReport(),
  backup: () => backup(),
  addBudget: () => budgetForm(),
  editBudget: (cat) => budgetForm(cat),
  applyPlan: () => {
    const p = lastAnalysis && planFor(lastAnalysis, Number(S.settings.savingsGoal) || 5);
    if (!p?.rows.length) return;
    const cur = S.settings.localCurrency;
    // Una meta de 0 (ej. intereses) no es un presupuesto: es "no pagar más"
    for (const r of p.rows) if (r.newV > 0.5) S.budgets[r.c] = { amount: roundNice(fromUSD(r.newV, cur)), currency: cur };
    save(); render();
    ($('#sheetDlg').open && sheetView ? $('#sheet') : window).scrollTo({ top: 0, behavior: 'smooth' });
    toast('Listo: esos montos quedaron como topes del mes.');
  },
  openChat: () => openChat({ listen: true }),
  cloudConnect: () => cloudConnectForm(),
  reminderHelp: () => openForm({
    title: 'Recordatorio diario',
    fields: [{ type: 'html', html: `<ol style="margin:0;padding-left:18px;color:var(--text-2)">
      <li>Abrí la app <b>Atajos</b> → <b>Automatización</b> → <b>+</b> → <b>Hora del día</b>.</li>
      <li>Elegí <b>21:00</b>, <b>Diariamente</b> y <b>Ejecutar inmediatamente</b>.</li>
      <li>Agregá <b>Mostrar notificación</b>: "¿Registraste tus gastos de hoy?".</li></ol>` }],
    submitLabel: 'Listo',
    onSubmit: () => {},
  }),
  cloudNow: () => CloudSync.sync({ quiet: false }),
  cloudOff: async () => { if (await confirmDlg('Desactivar sincronización', 'Este dispositivo deja de sincronizarse. Tus datos siguen acá y en GitHub.', 'Desactivar')) CloudSync.disconnect(); },
  lockOn: () => pinForm(() => { if (bioAvailable() && !lockCfg()?.credId) setTimeout(() => toast('Tip: también podés activar Face ID / huella acá abajo.', 4000), 600); }),
  lockOff: async () => { if (await confirmDlg('Quitar bloqueo', 'La app se va a abrir sin pedir PIN en este dispositivo.', 'Quitar')) { setLockCfg(null); render(); } },
  bioOn: () => enableBio(),
  bioOff: () => { const c = lockCfg(); delete c.credId; setLockCfg(c); render(); },
  spendInfo: () => spendInfo(),
  cleanAccounts: async () => {
    const list = unusedAccounts();
    if (!list.length) return;
    if (await confirmDlg('Quitar cuentas sin usar', `Se van a quitar: <b>${list.map((a) => esc(a.name)).join(', ')}</b>. No tienen saldo ni movimientos, así que no cambia nada de tus números.`, 'Quitar')) {
      for (const a of list) tombstone(a.id);
      S.accounts = S.accounts.filter((a) => !list.includes(a));
      save(); render(); toast('Listo, cuentas quitadas.');
    }
  },
  fav: (id) => addFavorite(id),
  checkin: () => { if (!S.checkins.includes(todayISO())) S.checkins.push(todayISO()); save(); render(); toast('Anotado: hoy sin gastos 💪'); },
  loanAdd: () => loanForm(),
  loanEdit: (id) => loanForm(byId(S.loans, id)),
  loanPay: (id) => loanPayForm(byId(S.loans, id)),
  monthClose: (m) => showMonthClose(m),
  addRecurring: () => recurringForm(),
  addRecurringPreset: (i) => recurringForm(null, { ...RECURRING_PRESETS[Number(i)] }),
  editRecurring: (id) => recurringForm(byId(S.recurring, id)),
  payRecurring: (id) => payRecurringForm(byId(S.recurring, id)),
  addSched: () => scheduledForm(),
  receipt: () => pickReceipt(),
  editSched: (id) => scheduledForm(byId(S.scheduled, id)),
  paySched: (id) => paySchedForm(byId(S.scheduled, id)),
  schedAmount: (id) => schedAmountForm(byId(S.scheduled, id)),
  addGoal: () => goalForm(),
  editGoal: (id) => goalForm(byId(S.goals, id)),
  fileLink: () => FileSync.link(),
  fileOpen: () => FileSync.openExisting(),
  fileReconnect: () => FileSync.reconnect(),
  fileUnlink: async () => {
    if (await confirmDlg('Desvincular archivo', 'La app deja de escribir en el archivo (el archivo no se borra). Tus datos siguen en este navegador.', 'Desvincular')) FileSync.unlink();
  },
  resetAll: async () => {
    if (await confirmDlg('Borrar todo', `Se van a borrar <b>todas</b> tus cuentas, inversiones y movimientos de este dispositivo. Si tenés un archivo vinculado, se desvincula pero <b>no se borra</b>.${CloudSync.enabled() ? ' La sincronización con GitHub se desconecta (tu copia en GitHub no se borra).' : ''}`, 'Borrar todo')) {
      await FileSync.unlink();
      // Si no, la próxima sincronización subiría la app vacía y borraría tus datos en el otro dispositivo
      setCloudCfg(null);
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* nada */ }
      S = migrate(defaultState()); save(false); render(); welcome();
    }
  },
};

function bindEvents() {
  $('#moreBtn').insertAdjacentHTML('beforebegin', sidebarExtrasHTML());
  paintIcons();
  $$('.nav-btn[data-view]').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
  // En el celular, todo lo que no es Inicio / Movimientos / Plan va dentro de "Más"
  $('#moreBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const m = $('#moreMenu');
    if (m.hidden || m.classList.contains('closing')) openMore(); else closeMore();
  });
  $('#moreMenu').addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]');
    if (b) return go(b.dataset.view);
    if (e.target.closest('[data-more-close]')) closeMore();
  });
  $('#moreBackdrop').addEventListener('click', closeMore);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#moreMenu').hidden) closeMore(); });
  $('#fabBtn').addEventListener('click', () => quickEntry('gasto'));
  // Las secciones "Ver más" recuerdan si las dejaste abiertas y dibujan sus gráficos al abrirse
  $('#content').addEventListener('toggle', (e) => {
    const d = e.target;
    if (d.dataset?.pref) { S.settings[d.dataset.pref] = d.open; save(false); }
    if (d.open) drawCharts();
  }, true);
  // Al abrir o cerrar una sección, su título se queda donde lo tocaste (antes la página "saltaba" al cerrar)
  document.addEventListener('click', (e) => {
    const sum = e.target.closest('details > summary');
    if (!sum || sum.closest('dialog')) return;
    const d = sum.parentElement, content = $('#content');
    if (d.open) {
      // Cerrar: la página se achica de golpe y todo baja. Se mantiene la altura un momento y se desliza suave
      // El título queda donde lo tocaste: el espacio de abajo se va achicando a medida que subís
      e.preventDefault();
      const openH = d.offsetHeight, fullH = content.offsetHeight;
      content.style.minHeight = `${fullH}px`;
      d.open = false;
      const natural = fullH - (openH - d.offsetHeight);
      const topY = content.getBoundingClientRect().top + window.scrollY;
      const shrink = () => {
        const need = Math.max(natural, window.scrollY + window.innerHeight - topY);
        if (need <= natural + 1 || !content.style.minHeight) { content.style.minHeight = ''; window.removeEventListener('scroll', shrink); return; }
        content.style.minHeight = `${need}px`;
      };
      window.addEventListener('scroll', shrink, { passive: true });
      shrink();
      return;
    }
    const before = sum.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      const diff = sum.getBoundingClientRect().top - before;
      if (Math.abs(diff) > 1) window.scrollBy(0, diff);
    });
  });
  // Con una ventana abierta, el fondo no se desliza (respaldo para iPhone sin :has)
  new MutationObserver(() => document.documentElement.classList.toggle('dlg-open', $$('dialog').some((d) => d.open)))
    .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
  // Las hojas de abajo (registro rápido y secciones) se cierran deslizándolas hacia abajo, como en las apps del iPhone
  smoothClose($('#quickDlg'));
  smoothClose($('#sheetDlg'));
  for (const dlg of [$('#quickDlg'), $('#sheetDlg')]) {
    let y0 = null, dy = 0;
    dlg.addEventListener('touchstart', (e) => {
      const sc = e.target.closest('.quick, .sheet');
      y0 = (sc && sc.scrollTop > 0) || e.target.closest('input, textarea, select') ? null : e.touches[0].clientY;
      dy = 0; dlg.style.transition = 'none';
    }, { passive: true });
    dlg.addEventListener('touchmove', (e) => {
      if (y0 == null) return;
      dy = e.touches[0].clientY - y0;
      if (dy <= 0) { dlg.style.transform = ''; return; }
      e.preventDefault();
      dlg.style.transform = `translateY(${dy}px)`;
    }, { passive: false });
    const end = () => {
      if (y0 == null) return;
      y0 = null;
      dlg.style.transition = 'transform .2s ease';
      if (dy > 110) {
        dlg.style.transform = 'translateY(100%)';
        setTimeout(() => { dlg.close(); dlg.style.transform = ''; dlg.style.transition = ''; }, 200);
      } else dlg.style.transform = '';
    };
    dlg.addEventListener('touchend', end);
    dlg.addEventListener('touchcancel', end);
  }
  $('#sheetDlg').addEventListener('close', () => { sheetView = null; });
  // iOS ignora user-scalable=no en Safari: se bloquea el pellizco a mano
  ['gesturestart', 'gesturechange'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  $$('.seg button').forEach((b) => b.addEventListener('click', () => { S.settings.displayCurrency = b.dataset.cur; save(false); render(); }));
  $('#privacyBtn').addEventListener('click', () => { S.settings.privacy = !S.settings.privacy; save(false); render(); });
  $('#refreshBtn').addEventListener('click', () => refreshAll());
  $('#syncBtn').addEventListener('click', () => {
    if (CloudSync.enabled()) CloudSync.sync({ quiet: false }).then(() => toast(CloudSync.status === 'error' ? CloudSync.error : 'Sincronizado ✓'));
    else if (FileSync.status === 'paused') FileSync.reconnect();
    else go('respaldo');
  });
  // En pantallas táctiles el tooltip no tiene "mouseleave": se oculta al desplazar
  window.addEventListener('scroll', () => { const tip = tipEl(); tip.dataset.owner = ''; tip.hidden = true; }, { passive: true });

  // Mi plan: preguntas, reparto, qué cuenta como fija/variable, notas y pasos (se guardan solos)
  let noteTimer;
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'planFija' || t.id === 'planDiv') {
      const f = Number($('#planFija').value), d = Math.min(Number($('#planDiv').value), 100 - f);
      $('#planFijaVal').textContent = `${f}%`; $('#planDivVal').textContent = `${d}%`; $('#planVarVal').textContent = `${100 - f - d}%`;
    }
    if (t.dataset?.planNote) {
      const P = planOf(); P.notes = { ...(P.notes || {}), [t.dataset.planNote]: t.value };
      clearTimeout(noteTimer); noteTimer = setTimeout(() => { touchPlan(); save(); }, 700);
    }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset?.planNote) { clearTimeout(noteTimer); touchPlan(); save(); }
    if (t.name?.startsWith('pq_')) { const P = planOf(); P.quiz = { ...(P.quiz || {}), [t.name.slice(3)]: Number(t.value) }; touchPlan(); save(); render(); }
    if (t.id === 'planFija' || t.id === 'planDiv') {
      const P = planOf(), f = Number($('#planFija').value);
      P.target = f; P.targetDiv = Math.min(Number($('#planDiv').value), 100 - f); touchPlan(); save(); render();
    }
    if (t.id === 'planEmerg') { const v = parseNum(t.value); planOf().emergencyGoal = v > 0 ? v : null; touchPlan(); save(); render(); }
    if (t.dataset?.planClass) { const P = planOf(); P.classes = { ...(P.classes || {}), [t.dataset.planClass]: t.value }; touchPlan(); save(); render(); }
    if (t.dataset?.planStep) { const s = (planOf().steps || []).find((x) => x.id === t.dataset.planStep); if (s) { s.done = t.checked; touchPlan(); save(); render(); } }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'planStepNew') { e.preventDefault(); ACTIONS.planStepAdd(); } });

  // Lo mismo para la pantalla y para la hoja de una sección
  for (const content of [$('#content'), $('#sheet')]) {
  content.addEventListener('click', (e) => {
    if (e.target.closest('[data-sheet-close]')) return $('#sheetDlg').close();
    const el = e.target.closest('[data-action]');
    if (!el) return;
    e.preventDefault();
    ACTIONS[el.dataset.action]?.(el.dataset.id, el);
  });
  // El plan se recalcula en vivo mientras movés la meta de ahorro
  content.addEventListener('input', (e) => {
    if (e.target.id !== 'goalRange' || !lastAnalysis) return;
    S.settings.savingsGoal = Number(e.target.value);
    $('#goalVal').textContent = e.target.value + '%';
    $('#planBox').innerHTML = planHTML(lastAnalysis);
  });
  content.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'txMonth') { S.settings.txMonth = t.value; save(false); render(); }
    if (t.id === 'txAccount') { S.settings.txAccount = t.value; save(false); render(); }
    if (t.id === 'anPeriod') { S.settings.anPeriod = Number(t.value); save(false); render(); }
    if (t.id === 'repFrom' || t.id === 'repTo') { S.settings[t.id] = t.value; save(false); }
    if (t.id === 'goalRange') save(false);
    if (t.id === 'setLocal') { S.settings.localCurrency = t.value; save(); render(); refreshAll({ silent: true }); }
    if (t.id === 'setArsType') { S.settings.arsRateType = t.value; save(); refreshAll(); }
    // Casilla "se repite" de la lista de fijos
    if (t.dataset.repeat) {
      const r = S.recurring.find((x) => x.id === t.dataset.repeat);
      if (r) {
        const turnOn = t.checked && !repeats(r);
        r.active = t.checked;
        // Al volver a activarlo, no se cobran los meses que estuvo apagado
        if (turnOn) r.startMonth = r.day && r.day < new Date().getDate() ? addMonths(currentMonth(), 1) : currentMonth();
        processRecurring(); save(); render();
        toast(t.checked ? `${r.name}: se repite todos los meses` : `${r.name}: guardado, ya no se repite`);
      }
    }
    if (t.id === 'setBobType') { S.settings.bobRateType = t.value; save(); refreshAll(); }
    if (t.id === 'setDefAcc') { S.settings.defaultAccountId = t.value; save(); toast('Cuenta por defecto guardada.'); }
    if (t.id === 'setAutoRates') { S.settings.autoRates = t.checked; save(); render(); }
    if (t.dataset.rate) {
      const n = parseNum(t.value);
      if (n > 0) { S.settings.rates[t.dataset.rate] = n; save(); render(); toast(`Tipo de cambio de ${t.dataset.rate} guardado.`); }
      else toast('Ingresá un número mayor a 0.');
    }
    if (t.id === 'restoreFile' && t.files[0]) restore(t.files[0]);
  });
  }

  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => {
    drawCharts();
    if (sheetView && $('#sheetDlg').open) drawCharts(sheetView);
  }, 150); });
  window.addEventListener('storage', (e) => { if (e.key === STORE_KEY) { load(); render(); } });
  // Si cerrás o cambiás de pestaña con un guardado pendiente, se escribe ya
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (FileSync.timer) FileSync.write();
      stopMic({ keepResult: true }); // al salir de la app, iOS corta el micrófono: lo dejamos listo para la vuelta
      if (CloudSync.timer) CloudSync.push();
      // Tapa los saldos antes de que el iPhone saque la "foto" del selector de apps
      Lock.hiddenAt = Date.now();
      if (Lock.enabled()) document.body.classList.add('veiled');
      return;
    }
    if (Lock.enabled() && !Lock.locked && Date.now() - Lock.hiddenAt > LOCK_AFTER_MS) Lock.show();
    else if (!Lock.locked) document.body.classList.remove('veiled');
    // Al volver: traer lo que hayas cargado en el otro dispositivo
    // (no mientras tengas un formulario abierto: se sincroniza al cerrarlo, con el próximo cambio)
    const formOpen = !!document.querySelector('dialog[open]:not(#sheetDlg)');
    const newDay = dayOpened !== todayISO();
    // Si la app quedó abierta de un día para otro: intereses, fijos del día (ej. el sueldo del 12) y "Hoy podés gastar" se actualizan
    const daily = () => {
      if (dayOpened === todayISO() || document.querySelector('dialog[open]:not(#sheetDlg)')) return;
      dayOpened = todayISO();
      if (accrueInterest()) save(false);
      processRecurring();
      render();
      maybeMonthClose();
    };
    if (CloudSync.enabled() && !formOpen && Date.now() - CloudSync.lastPull > 30000) CloudSync.sync().then(() => { processRecurring(); daily(); });
    else if (newDay) daily();
    if (newDay && Date.now() - (Date.parse(S.settings.lastRefresh || 0) || 0) > 10 * 60 * 1000) refreshAll({ silent: true });
  });
}

function welcome() {
  openForm({
    title: '¡Bienvenido a MyFinance!',
    fields: [
      { type: 'html', html: `<p style="margin:0;color:var(--text-2)">La app empieza vacía. Para arrancar: cargá tu efectivo y cuentas en <b>Cuentas</b>, y lo que entra o sale todos los meses (sueldo, alquiler, luz…) en <b>Más → Fijos</b>.</p>` },
      { name: 'localCurrency', label: '¿Cuál es tu moneda local?', type: 'select', value: 'BOB', full: true,
        options: CURRENCIES.filter(([c]) => !USD_PEGGED.has(c)).map(([c, n]) => [c, `${c} — ${n}`]) },
      { type: 'html', html: `<div class="small muted">¿Ya usás MyFinance en otro dispositivo?
        <button type="button" class="btn sm" id="welcomeOpen" style="margin-left:6px">Traer mis datos</button></div>` },
    ],
    submitLabel: 'Empezar',
    onSubmit: (v) => {
      const old = S.settings.localCurrency;
      S.settings.localCurrency = v.localCurrency;
      for (const a of S.accounts) if (a.currency === old) a.currency = v.localCurrency;
      save(); render();
      refreshAll({ silent: true });
      setTimeout(() => toast('Tip: tocá − Gasto o + Ingreso para registrar. En Más → Respaldo podés activar la sincronización automática.', 6000), 2800);
    },
  });
  $('#welcomeOpen')?.addEventListener('click', () => { $('#dlg').close(); cloudConnectForm(); });
}

/* ---------------- Inicio ---------------- */

(async function init() {
  // Instalable en el iPhone y funciona sin conexión (sólo cuando se abre desde una web, no como archivo)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.storage?.persist?.().catch(() => {});
  const existed = load();
  if (Lock.enabled()) Lock.show();
  bindEvents();
  render();
  // Primero se compara con el archivo vinculado y con GitHub, así nunca se pisa una versión más nueva
  try { await FileSync.init(); } catch (e) { console.warn(e); }
  if (CloudSync.enabled()) await CloudSync.sync();
  dayOpened = todayISO();
  // Intereses del día y fijos que ya vencieron (ej. el sueldo del 12)
  if (accrueInterest()) save(false);
  processRecurring();
  render();
  setTimeout(() => syncPriceHistory(), 4000); // historial de precios de cripto y oro que falte
  if (!existed && !FileSync.handle && !CloudSync.enabled()) { save(false); Lock.then(welcome); refreshAll({ silent: true }); return; }
  maybeMonthClose();
  const last = S.settings.lastRefresh ? Date.parse(S.settings.lastRefresh) : 0;
  if (Date.now() - last > 10 * 60 * 1000) refreshAll({ silent: true });
  else { snapshot(); save(false); }
})();
