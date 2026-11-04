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
const accIcon = (a) => icon(ACCOUNT_TYPES[a?.type]?.icon || 'wallet', 18);

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
  'Ocio', 'Compras', 'Suscripciones', 'Viajes', 'Impuestos', 'Pago de tarjeta (intereses)', 'Otros gastos'];
const CAT_INGRESO = ['Sueldo', 'Mesada / familia', 'Freelance', 'Dividendos', 'Intereses', 'Venta de algo', 'Regalo', 'Otros ingresos'];

const ARS_TYPES = [['oficial', 'Oficial'], ['bolsa', 'MEP'], ['blue', 'Blue'], ['contadoconliqui', 'CCL'], ['cripto', 'Cripto'], ['tarjeta', 'Tarjeta']];
const BOB_TYPES = [['oficial', 'Oficial del BCB (el que usan los bancos)'], ['binance', 'Binance (USDT/BOB)'], ['manual', 'El de mi banco (lo cargo yo)']];

// Blend: el protocolo DeFi (Stellar) donde Meru invierte tus USDC. Fuente: DefiLlama.
const BLEND_USDC_POOL = 'ecf788e3-d2ef-4fdd-9ece-8a2d96226ddf';

const VIEWS = { resumen: 'Inicio', movimientos: 'Movimientos', plan: 'Plan', inversiones: 'Inversiones', cuentas: 'Cuentas', ajustes: 'Ajustes' };
// Metas y Análisis ahora viven dentro de Plan
const VIEW_ALIAS = { metas: 'plan', analisis: 'plan' };

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
    history: [],
  };
}

let S;

function migrate(s) {
  const d = defaultState();
  s.settings = { ...d.settings, ...(s.settings || {}) };
  s.settings.rates = { USD: 1, ...(s.settings.rates || {}) };
  for (const k of ['accounts', 'holdings', 'transactions', 'history', 'recurring', 'scheduled', 'goals', 'loans', 'checkins', 'rateLog', 'deleted']) if (!Array.isArray(s[k])) s[k] = [];
  if (!s.budgets || typeof s.budgets !== 'object' || Array.isArray(s.budgets)) s.budgets = {};
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
  // Tus fijos de siempre (se cargan una sola vez; después los editás en Movimientos)
  if (!s.settings.seededRecurring) {
    s.settings.seededRecurring = true;
    const accFor = (cur) => (s.accounts.find((a) => a.currency === cur && a.type === 'efectivo')
      || s.accounts.find((a) => a.type !== 'credito'))?.id || '';
    const month = currentMonth();
    s.recurring.push(
      { id: uid(), type: 'ingreso', name: 'Sueldo de pasantía', amount: 500, currency: 'BOB', accountId: accFor('BOB'), category: 'Sueldo', day: 12, startMonth: month },
      { id: uid(), type: 'ingreso', name: 'Mesada de papá', amount: 100, currency: 'USD', accountId: accFor('USD'), category: 'Mesada / familia', day: null, startMonth: month },
      { id: uid(), type: 'gasto', name: 'Gimnasio', amount: 300, currency: 'BOB', accountId: accFor('BOB'), category: 'Gimnasio / deporte', day: null, startMonth: month },
    );
  }
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { S = migrate(JSON.parse(raw)); return true; }
  } catch (e) { console.warn(e); }
  S = migrate(defaultState());
  return false;
}

// edit=false para cambios que no son datos tuyos (precios, vista, filtros): no cuentan como "última edición"
function save(edit = true) {
  if (edit) S.editedAt = new Date().toISOString();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('⚠ No se pudo guardar en el navegador. Exportá un respaldo en Ajustes.'); }
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
const nonFlow = (t) => !!(t.investment || t.loan);

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

function snapshot() {
  const t = totals();
  if (!S.accounts.some((a) => Number(a.balance)) && !S.holdings.some((h) => Number(h.quantity))) return;
  const d = todayISO();
  const row = { date: d, netWorth: t.netWorth, inv: t.inv, liquid: t.liquid, debt: t.debt };
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
async function refreshAll({ silent = false } = {}) {
  if (refreshing) return;
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
    const key = S.settings.finnhubKey.trim();
    if (!key) notes.push('acciones/ETF sin precio automático (falta clave de Finnhub)');
    else {
      await Promise.all(stocks.map(async (h) => {
        try {
          const q = await getJSON(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(h.symbol.trim().toUpperCase())}&token=${encodeURIComponent(key)}`);
          if (q && q.c > 0) { Object.assign(h, { price: q.c, change24h: q.dp ?? null, priceUpdated: now, priceSource: 'Finnhub' }); updated++; }
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
  if (!silent || notes.length) toast(`Actualizado: ${updated} precio(s).` + (notes.length ? ' ' + notes.slice(0, 3).join(' · ') : ''), notes.length ? 6000 : 2500);
}

/* ---------------- UI helpers ---------------- */

let toastTimer;
// action = { label, fn }: agrega un botón (ej. "Deshacer") al aviso
function toast(msg, ms = 2600, action) {
  const el = $('#toast');
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
  const tip = $('#tip');
  if (!t) { if (!tip.dataset.owner) tip.hidden = true; return; }
  tip.dataset.owner = '';
  tip.innerHTML = t.dataset.tip;
  tip.hidden = false;
  placeTip(e.clientX, e.clientY);
});
function placeTip(x, y) {
  const tip = $('#tip');
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
        return `<div class="field check ${f.full ? 'full' : ''}" data-field="${f.name}"><input type="checkbox" id="${id}" name="${f.name}" ${val ? 'checked' : ''}><label for="${id}">${esc(f.label)}</label></div>`;
      case 'number':
        input = `<input type="text" inputmode="decimal" autocomplete="off" id="${id}" name="${f.name}" value="${esc(val === 0 && f.blankZero ? '' : numInput(val))}" placeholder="${esc(f.placeholder || '0')}">`; break;
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
      vals[f.name] = f.type === 'checkbox' ? el.checked : f.type === 'number' ? parseNum(el.value) : el.value.trim();
    }
    return vals;
  };
  const update = (e) => {
    if (e && onInput) onInput(form, read(), e.target?.name);
    const vals = read();
    for (const f of fields) if (f.showIf) { const el = form.querySelector(`[data-field="${f.name}"]`); if (el) el.hidden = !f.showIf(vals); }
  };
  form.oninput = update; form.onchange = update; update();

  let done = false;
  form.onsubmit = (e) => {
    e.preventDefault();
    const vals = read();
    for (const f of fields) {
      const visible = !f.showIf || f.showIf(vals);
      if (!visible) continue;
      if (f.required && (vals[f.name] === '' || vals[f.name] == null)) return showErr(`Completá "${f.label}".`);
      if (f.type === 'number' && Number.isNaN(vals[f.name])) return showErr(`"${f.label}" no es un número válido.`);
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
  const svg = el.querySelector('svg'), xh = svg.querySelector('.xh'), dot = svg.querySelector('.dot'), tip = $('#tip');
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
  const pend = upcomingItems(7).slice(0, 3);
  const holdings = [...S.holdings].sort((a, b) => holdingValue(b) - holdingValue(a));
  const accounts = [...S.accounts].sort((a, b) => Math.abs(toUSD(b.balance, b.currency)) - Math.abs(toUSD(a.balance, a.currency)));

  return `
  ${missing.length ? `<div class="banner">Falta el tipo de cambio de ${missing.join(', ')}. Tocá <b>Actualizar</b> o cargalo en <a href="#" data-action="go" data-id="ajustes">Ajustes</a>.</div>` : ''}
  ${stale ? `<div class="banner">Tus datos viven sólo en este dispositivo. <a href="#" data-action="go" data-id="ajustes" data-anchor="respaldo">Activá la sincronización automática</a> para no perderlos.</div>` : ''}
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

  ${pend.length ? `<section class="card"><div class="card-head" style="margin-bottom:4px"><h2>Pendientes</h2><a href="#" data-action="go" data-id="movimientos" class="small">Ver fijos</a></div>
    <div class="list">${pend.map((it) => `<div class="list-row act">
      <span class="acc-ico sm ${it.type === 'ingreso' ? 'in' : ''}">${icon(it.kind === 'Tarjeta' ? 'card' : it.kind === 'Préstamo' ? 'handshake' : 'calendar', 16)}</span>
      <div class="grow"><div class="name">${esc(it.name)}</div><div class="meta">${it.undated ? 'Este mes' : daysUntil(it.date)}</div></div>
      <span class="money ${it.type === 'ingreso' ? 'up' : ''}">${it.type === 'ingreso' ? '+' : '−'}${fmtIn(it.amount, it.currency)}</span>
      ${it.recId ? `<button class="btn sm" data-action="payRecurring" data-id="${it.recId}">${it.type === 'ingreso' ? 'Ya entró' : 'Ya pagué'}</button>`
        : it.accId ? `<button class="btn sm" data-action="payCard" data-id="${it.accId}">Pagar</button>`
        : it.loanId ? `<button class="btn sm" data-action="loanPay" data-id="${it.loanId}">Registrar</button>`
        : it.schedId ? `<button class="btn sm" data-action="paySched" data-id="${it.schedId}">Ya pagué</button>` : ''}
    </div>`).join('')}</div></section>` : ''}

  <section class="card"><div class="card-head" style="margin-bottom:4px"><h2>Últimos movimientos</h2><a href="#" data-action="go" data-id="movimientos" class="small">Ver todos</a></div>
    ${txListHTML(recent)}</section>

  ${S.goals.length ? (() => { const P = planNumbers(); return `<section class="card"><div class="card-head" style="margin-bottom:8px"><h2>Metas</h2><a href="#" data-action="go" data-id="metas" class="small">Ver plan</a></div>
    ${S.goals.map((g) => { const M = goalMath(g, P); return `<div class="goal-mini"><div class="budget-top"><b>${esc(g.name)}</b><span class="spacer"></span><b class="small">${fmtNum(M.pct, 0)}%</b></div>
      <div class="meter"><div style="width:${M.pct}%"></div></div></div>`; }).join('')}</section>`; })() : ''}

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
        <button class="btn sm ghost" data-action="editHolding" data-id="${h.id}">Editar</button>
        <button class="btn sm ghost danger" data-action="delHolding" data-id="${h.id}" title="Eliminar">✕</button>
      </div></td></tr>`;
  }).join('');
  const gp = t.invWithCost - t.cost;
  return `
  ${noKey ? `<div class="banner">Bitcoin, Ethereum y PAXG se actualizan solos. Para que <b>VOO, NVDA y GOOGL</b> también se actualicen, pegá una clave gratuita de Finnhub en <a href="#" data-action="go" data-id="ajustes">Ajustes</a>. Mientras tanto podés cargar el precio a mano con “Editar”.</div>` : ''}
  <div class="tiles">
    ${tile('Valor del portafolio', fmtMoney(t.inv), `${S.holdings.length} activos`)}
    ${tile('Costo cargado', t.cost ? fmtMoney(t.cost) : '—', 'Según tu precio promedio de compra')}
    ${tile('Ganancia / pérdida', t.cost ? `<span class="${cls(gp)}">${fmtMoney(gp, { sign: true })}</span>` : '—', t.cost ? fmtPct((gp / t.cost) * 100) : 'Cargá el precio promedio para verla')}
    ${tile('Precios actualizados', `<span style="font-size:16px">${fmtDateTime(S.settings.lastRefresh)}</span>`, 'Tocá Actualizar para refrescar')}
  </div>
  <section class="card">
    <div class="card-head"><h2>Mis posiciones</h2>
      <div class="toolbar"><button class="btn" data-action="go" data-id="ajustes" data-anchor="importar">Importar desde mi chat</button>
      <button class="btn primary" data-action="addHolding">+ Agregar activo</button></div></div>
    <div class="table-wrap"><table>
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
  ${loansHTML()}`;
}

/* ---------------- Ingresos y gastos fijos ----------------
   Con día fijo (ej. sueldo el 12): se registran solos ese día.
   Sin día (ej. la mesada o el gym): quedan "pendientes" hasta que tocás "Ya entró" / "Ya pagué". */

const daysInMonth = (ym) => new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0).getDate();
// Un fijo con "Se repite todos los meses" desmarcado queda guardado en la lista, pero no se registra ni se espera solo
const repeats = (r) => r.active !== false;
// Ingresos fijos que elegiste no contar (ej. una mesada que no sabés si llega) quedan fuera de "Hoy podés gastar"
const countsInPlan = (r) => r.countInPlan !== false;
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
    setTimeout(() => toast(`Registré automáticamente: ${done.join(', ')}.`, 4500), 600);
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
      <div class="meta">${on ? (r.day ? `Todos los ${r.day}` : 'Cada mes, sin día fijo') : 'No se repite'}${r.type === 'ingreso' && on && !countsInPlan(r) ? ' · no se cuenta' : ''} · ${esc(acc?.name || 'sin cuenta')}</div></div>
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
  return `<div class="small muted" style="margin-bottom:6px">Marcá la casilla de los que se repiten todos los meses. Los desmarcados quedan guardados acá para registrarlos cuando pasen.</div>
    <div class="list">${on.map((r) => recurringRowHTML(r, month)).join('') || '<div class="empty">Ninguno marcado para repetirse.</div>'}</div>
    ${on.length ? `<div class="small muted" style="margin-top:10px">Cada mes: entran <b class="money">${fmtMoney(inc)}</b>, salen <b class="money">${fmtMoney(out)}</b> → quedan <b class="money">${fmtMoney(inc - out)}</b> para el día a día y el ahorro.</div>` : ''}
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
      { name: 'catGasto', label: 'Categoría', type: 'select', value: r.category, options: CAT_GASTO.map((c) => [c, c]), showIf: (v) => v.type === 'gasto' },
      { name: 'catIngreso', label: 'Categoría', type: 'select', value: r.category, options: CAT_INGRESO.map((c) => [c, c]), showIf: (v) => v.type === 'ingreso' },
      { name: 'day', label: 'Día del mes', value: r.day || '', placeholder: 'Vacío = sin día fijo', hint: 'Con día: se registra solo. Sin día: te queda pendiente para marcar cuando pase.' },
      { name: 'active', label: 'Se repite todos los meses', type: 'checkbox', value: repeats(r), full: true, hint: 'Desmarcalo si no es todos los meses: queda guardado para registrarlo cuando pase.' },
      { name: 'countInPlan', label: 'Contarlo en "Hoy podés gastar" (apagalo si no sabés si va a llegar)', type: 'checkbox', value: r.countInPlan !== false, full: true, showIf: (v) => v.type === 'ingreso' },
      ...(isNew ? [] : [{ name: 'remove', label: 'Eliminar este fijo (los movimientos ya registrados quedan)', type: 'checkbox', full: true }]),
    ],
    onSubmit: (v) => {
      if (v.remove) { S.recurring = S.recurring.filter((x) => x !== r); tombstone(r.id); save(); render(); return; }
      const day = v.day ? Number(v.day) : null;
      if (day != null && !(day >= 1 && day <= 31)) return 'El día tiene que ser un número del 1 al 31.';
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      const next = { type: v.type, name: v.name, amount: v.amount, currency: v.currency, accountId: v.accountId,
        category: v.type === 'gasto' ? v.catGasto : v.catIngreso, day, countInPlan: v.type === 'ingreso' ? !!v.countInPlan : true, active: !!v.active };
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
      { name: 'amount', label: 'Monto (en la moneda de la cuenta)', type: 'number', value: recurringAmountFor(r, acc), required: true },
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
      { name: 'amount', label: 'Monto', type: 'number', value: s.amount, required: true, hint: 'Si varía (ej. 280 a 300), poné el más alto.' },
      { name: 'currency', label: 'Moneda', type: 'select', value: s.currency, options: CURRENCIES.map(([c, n]) => [c, `${curLabel(c)} — ${n}`]) },
      { name: 'accountId', label: 'Lo pagás desde', type: 'select', value: s.accountId, options: S.accounts.map((a) => [a.id, `${a.name} (${curLabel(a.currency)})`]) },
      { name: 'category', label: 'Categoría', type: 'select', value: s.category, options: CAT_GASTO.map((c) => [c, c]), full: true },
      ...(isNew ? [] : [{ name: 'remove', label: 'Eliminar (si ya lo pagaste, el movimiento queda)', type: 'checkbox', full: true }]),
    ],
    submitLabel: isNew ? 'Programar' : 'Guardar',
    onSubmit: (v) => {
      if (v.remove) { S.scheduled = S.scheduled.filter((x) => x !== s); tombstone(s.id); save(); render(); return; }
      if (!v.date) return 'Elegí la fecha.';
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      const next = { name: v.name, date: v.date, amount: v.amount, currency: v.currency, accountId: v.accountId, category: v.category };
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
      { name: 'amount', label: 'Cuánto pagaste (en la moneda de la cuenta)', type: 'number', value: amountIn(acc) ?? '', required: true },
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
      toast(`${s.name}: pagado ✓`, 7000, { label: 'Programar el próximo', fn: () => scheduledForm(null, { name: s.name, amount: s.amount, currency: s.currency, accountId: s.accountId, category: s.category }) });
    },
  });
}

function schedRowHTML(s) {
  const tx = schedTx(s);
  const acc = S.accounts.find((a) => a.id === s.accountId);
  const late = !tx && s.date < todayISO();
  const soon = !tx && !late && Math.round((Date.parse(s.date) - Date.parse(todayISO())) / 864e5) <= 3;
  const status = tx ? `<span class="status good">${icon('check', 14)} Pagado el ${fmtDate(tx.date).slice(0, 5)}</span>`
    : `<button class="btn sm ${late || soon ? 'primary' : ''}" data-action="paySched" data-id="${s.id}">Ya pagué</button>`;
  return `<div class="list-row act rec-row ${tx ? 'off' : ''}">
    <span class="acc-ico sm">${icon('calendar', 16)}</span>
    <div class="grow"><div class="name">${esc(s.name)}</div>
      <div class="meta">${fmtDay(s.date)}${tx ? '' : ` · <b class="${late || soon ? 'warn-text' : ''}">${daysUntil(s.date)}</b>`} · ${esc(acc?.name || 'sin cuenta')}</div></div>
    <div class="val"><div class="money">−${fmtIn(tx ? tx.amount : s.amount, tx ? (S.accounts.find((a) => a.id === tx.accountId)?.currency || s.currency) : s.currency)}</div></div>
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
  const tip = $('#tip');
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

  <details class="more-box" id="fijos" ${pendN || !S.recurring.length ? 'open' : ''}>
    <summary>Ingresos y gastos fijos${pendN ? ` <span class="tag warn">${pendN} pendiente${pendN > 1 ? 's' : ''}</span>` : ''}</summary>
    <div class="more-inner"><section class="card"><div class="card-head"><span class="muted small">Sueldo, mesada, gym…: se tienen en cuenta todos los meses</span><button class="btn sm" data-action="addRecurring">+ Fijo</button></div>
      ${recurringHTML(month)}</section></div>
  </details>

  <details class="more-box" id="programados" ${schedPending().length ? 'open' : ''}>
    <summary>Gastos programados${schedPending().length ? ` <span class="tag">${schedPending().length}</span>` : ''}</summary>
    <div class="more-inner"><section class="card"><div class="card-head"><span class="muted small">De una sola vez, con fecha: turnos, matrícula, cumpleaños…</span><button class="btn sm" data-action="addSched">+ Programar</button></div>
      ${schedHTML()}</section></div>
  </details>

  <details class="more-box" ${S.settings.movChartsOpen ? 'open' : ''} data-pref="movChartsOpen">
    <summary>Gráficos: ${isCur ? 'este mes' : ml} vs. meses anteriores</summary>
    <div class="more-inner"><div class="grid-2">
      <section class="card"><div class="card-head"><h2>Gastos por mes</h2></div><div id="monthlyChart" class="line-chart" style="height:200px"></div></section>
      <section class="card"><div class="card-head"><h2>Por categoría</h2><a href="#" data-action="go" data-id="analisis" class="small">Ver análisis</a></div>${categoryCompareHTML(month)}</section>
    </div></div>
  </details>`;
}

const CHAT_PROMPT = `Con toda la información que tenés de mi portafolio, devolveme SOLO un bloque JSON (sin texto extra) con este formato exacto:
[
  {"symbol": "VOO", "quantity": 0, "avgCost": 0, "platform": "broker"},
  {"symbol": "PAXG", "quantity": 0, "avgCost": 0, "platform": "Binance"}
]
- symbol: ticker (VOO, PAXG, BTC, ETH, NVDA, GOOGL, etc.)
- quantity: cantidad de unidades/acciones/monedas que tengo
- avgCost: precio promedio de compra por unidad en USD (0 si no lo sabés)
- platform: dónde lo tengo (Binance, broker, etc.)`;

function viewAjustes() {
  const s = S.settings;
  const used = [...new Set([s.localCurrency, ...S.accounts.map((a) => a.currency)])].filter((c) => !USD_PEGGED.has(c));
  const hr = '<hr style="border:0;border-top:1px solid var(--grid);margin:18px 0">';
  const manualBOB = used.includes('BOB') && s.bobRateType === 'manual';
  return `
  <div class="settings-grid">
    <section class="card" id="respaldo">
      <h2 style="margin-bottom:8px">${icon('sync', 18)} Tus datos en iPhone y PC</h2>
      <div id="cloudSync">${cloudSyncHTML()}</div>
      ${hr}
      <h2 style="margin-bottom:8px">Copia de seguridad</h2>
      <p class="small" style="color:var(--text-2);margin-top:0">Un archivo con todos tus datos, por si acaso. Última copia: <b>${fmtDateTime(s.lastBackup)}</b></p>
      <div class="toolbar">
        <button class="btn" data-action="backup">Descargar copia</button>
        <label class="btn">Restaurar copia<input type="file" id="restoreFile" accept=".json,application/json" hidden></label>
      </div>
    </section>

    <section class="card" id="bloqueo">
      <h2 style="margin-bottom:8px">${icon('lock', 18)} Bloqueo con Face ID o PIN</h2>
      ${lockSettingsHTML()}
    </section>

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
  </div>

  <details class="more-box" ${s.settingsAdvOpen ? 'open' : ''} data-pref="settingsAdvOpen">
    <summary>Avanzado</summary>
    <div class="more-inner"><div class="settings-grid">
      <section class="card">
        <h2 style="margin-bottom:8px">${icon('flame', 18)} Recordatorio diario (con el iPhone)</h2>
        <ol class="small" style="color:var(--text-2);padding-left:18px;margin:0">
          <li>App <b>Atajos</b> → <b>Automatización</b> → <b>+</b> → <b>Hora del día</b>.</li>
          <li><b>21:00</b>, <b>Diariamente</b>, <b>Ejecutar inmediatamente</b>.</li>
          <li>Acción <b>Mostrar notificación</b>: "¿Registraste tus gastos de hoy?".</li></ol>
        <p class="small" style="color:var(--text-2);margin-bottom:0">Con la voz: <i>"Oye Siri, abrir MyFinance"</i>.</p>
      </section>

      <section class="card">
        <h2 style="margin-bottom:14px">Tipos de cambio</h2>
        <div class="form-row"><label><input type="checkbox" id="setAutoRates" ${s.autoRates ? 'checked' : ''}> Actualizar automáticamente</label>
          <span class="hint">Última actualización: ${fmtDateTime(s.ratesUpdated)}</span></div>
        <table class="rates-table"><thead><tr><th>Moneda</th><th class="num">Unidades por 1 USD</th></tr></thead><tbody>
          ${used.map((c) => `<tr><td>${curLabel(c)}</td><td class="num"><input type="text" inputmode="decimal" data-rate="${c}" value="${numInput(s.rates[c])}"></td></tr>`).join('') || '<tr><td colspan="2" class="muted">Sólo usás dólares.</td></tr>'}
        </tbody></table>
      </section>

      <section class="card">
        <h2 style="margin-bottom:8px">Guardado en OneDrive</h2>
        <div id="fileSync">${fileSyncHTML()}</div>
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

      <section class="card">
        <h2 style="margin-bottom:8px">Zona peligrosa</h2>
        <button class="btn danger" data-action="resetAll">Borrar todos los datos</button>
      </section>
    </div></div>
  </details>`;
}
/* ---------------- Análisis ---------------- */

// Necesidades (regla 50/30/20). Todo lo demás cuenta como "gustos".
const NEEDS = new Set(['Supermercado', 'Transporte', 'Vivienda / alquiler', 'Servicios', 'Salud', 'Educación', 'Impuestos', 'Pago de tarjeta (intereses)']);
const INTEREST = 'Pago de tarjeta (intereses)';
const FIXED = new Set(['Vivienda / alquiler', 'Servicios', 'Suscripciones', 'Impuestos', 'Educación', INTEREST]);

// [cuánto se puede recortar como máximo, consejo concreto]
const CUT_GUIDE = {
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

let analysisDemo = false;
let lastAnalysis = null;

function addMonths(ym, k) {
  const d = new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1 + k, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
const monthLabel = (ym, month = 'short') => new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1, 1).toLocaleDateString('es-AR', { month }).replace('.', '');

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
    if (usd > 0 && usd <= 10) { small.count++; small.total += usd; }
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
  if (a.small.count >= 8) out.push(['🐜', `Hacés unos ${Math.round(a.small.count)} gastos chicos por mes`, `Compras de menos de US$ 10 que suman ${fm(a.small.total)} por mes (${fm(a.small.total * 12)} al año). Los "gastos hormiga" son los más fáciles de recortar.`]);
  if (!analysisDemo && a.expense > 0) {
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

// Datos de muestra para ver el análisis antes de tener movimientos propios (no se guardan)
function demoTxs() {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const out = [];
  const end = currentMonth();
  for (let i = 11; i >= 0; i--) {
    const m = addMonths(end, -i);
    const last = i === 0 ? new Date().getDate() : 28;
    const add = (type, category, amount, d) => {
      if (d <= last && amount > 0) out.push({ id: 'demo' + out.length, type, category, amount: round2(amount), date: `${m}-${String(d).padStart(2, '0')}`, currency: 'USD', accountId: '', note: category });
    };
    add('ingreso', 'Sueldo', 1800, 1);
    if (rnd() > 0.55) add('ingreso', 'Freelance', 150 + rnd() * 250, 15);
    add('gasto', 'Vivienda / alquiler', 450, 2);
    add('gasto', 'Servicios', 70 + rnd() * 30, 8);
    add('gasto', 'Suscripciones', 38, 5);
    add('gasto', INTEREST, 15 + rnd() * 25, 10);
    for (let w = 0; w < 4; w++) { add('gasto', 'Supermercado', 60 + rnd() * 40, 3 + w * 7); add('gasto', 'Transporte', 18 + rnd() * 10, 4 + w * 7); }
    for (let j = 0; j < 14; j++) add('gasto', 'Comida y salidas', 5 + rnd() * 20, 1 + Math.floor(rnd() * 27));
    add('gasto', 'Ocio', 40 + rnd() * 60, 20);
    add('gasto', 'Compras', (60 + rnd() * 120) * (1 + (11 - i) * 0.06), 18);
    if (rnd() > 0.6) add('gasto', 'Salud', 60, 12);
  }
  return out;
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
  const tip = $('#tip');
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
  return `<div class="goal-row"><label for="goalRange">Quiero ahorrar <b id="goalVal">${pct}%</b> más de mis ingresos</label>
    <input type="range" id="goalRange" min="1" max="20" step="1" value="${pct}"></div>`;
}

function planHTML(a) {
  const p = planFor(a, Number(S.settings.savingsGoal) || 5);
  if (!p) return '<div class="empty">Registrá tus ingresos para armar el plan.</div>';
  if (!p.rows.length) return '<div class="empty">No encontré gastos recortables en el período.</div>';
  return `<p style="margin:6px 0 14px">Para ahorrar <b class="money">${fmtMoney(p.target)}</b> más por mes, tu tasa de ahorro pasaría de
      <b>${a.rate != null ? fmtPct(a.rate, false) : '—'}</b> a <b class="up">${fmtPct(p.newRate, false)}</b>. Así:</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Categoría</th><th class="num">Hoy / mes</th><th class="num">Meta / mes</th><th class="num">Recorte</th><th>Cómo</th></tr></thead>
      <tbody>${p.rows.map((r) => `<tr>
        <td><b>${esc(r.c)}</b></td>
        <td class="num money">${fmtMoney(r.v)}</td>
        <td class="num money">${fmtMoney(r.newV)}</td>
        <td class="num money up">−${fmtMoney(r.cut)}<div class="small muted">−${fmtNum(r.pct, 0)}%</div></td>
        <td class="small" style="color:var(--text-2);min-width:220px">${esc(r.tip)}</td></tr>`).join('')}
      </tbody></table></div>
    ${p.remaining > 0.01 ? `<div class="banner" style="margin-top:12px">Con recortes razonables llegás a ${fmtMoney(p.achieved)} por mes. Los ${fmtMoney(p.remaining)} restantes tendrían que salir de aumentar tus ingresos (mirá las ideas más abajo).</div>` : ''}
    <div class="toolbar" style="margin-top:14px"><span class="muted small">En 12 meses serían <b class="money">${fmtMoney(p.achieved * 12)}</b> extra.</span><span class="spacer"></span>
      ${analysisDemo ? '' : `<button class="btn primary" data-action="applyPlan">Usar estas metas como presupuesto mensual</button>`}</div>`;
}

function budgetHTML(txs) {
  const month = currentMonth();
  const ms = monthStats(month, txs);
  const now = new Date();
  const day = now.getDate(), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const entries = Object.entries(S.budgets).filter(([, b]) => Number(b.amount) > 0);
  if (!entries.length) {
    return `<div class="empty">Todavía no tenés presupuestos. Ponele un tope mensual a una categoría o usá el plan de ahorro de arriba.</div>`;
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
        <span class="money small">${fmtIn(fromUSD(spent, b.currency), b.currency)} de ${fmtIn(b.amount, b.currency)}</span>
        <button class="btn sm ghost" data-action="editBudget" data-id="${esc(c)}">Editar</button></div>
      <div class="meter"><div class="${st.tone}" style="width:${used}%"></div></div>
      <div class="muted small money">${spent >= lim ? `Te pasaste ${fmtIn(fromUSD(spent - lim, b.currency), b.currency)}.` : `Te quedan ${fmtIn(fromUSD(lim - spent, b.currency), b.currency)}.`}
        ${FIXED.has(c) ? '' : `A este ritmo terminás el mes en ${fmtIn(fromUSD(proj, b.currency), b.currency)}.`}</div>
    </div>`;
  }).join('')}</div>`;
}

function rule503020(a) {
  if (!(a.income > 0)) return '<div class="empty">Registrá tus ingresos para comparar con la regla 50/30/20.</div>';
  const needs = a.byCat.filter(([c]) => NEEDS.has(c)).reduce((s, [, v]) => s + v, 0);
  const wants = a.expense - needs;
  const rows = [
    ['Necesidades', needs, 50, 'máx.', 'Vivienda, súper, transporte, servicios, salud…'],
    ['Gustos', wants, 30, 'máx.', 'Salidas, compras, ocio, suscripciones, viajes…'],
    ['Ahorro', Math.max(0, a.saving), 20, 'mín.', 'Lo que te queda después de gastar'],
  ];
  return `<div class="rule">${rows.map(([label, v, target, kind, hint]) => {
    const pct = (v / a.income) * 100;
    const ok = kind === 'máx.' ? pct <= target : pct >= target;
    const st = ok ? { tone: 'good', icon: '✓', label: 'OK' } : { tone: 'warning', icon: '⚠', label: kind === 'máx.' ? 'Alto' : 'Bajo' };
    return `<div class="rule-row">
      <div class="budget-top"><b>${label}</b> ${statusPill(st)}<span class="spacer"></span><b>${fmtPct(pct, false)}</b><span class="muted small">&nbsp;· meta ${kind} ${target}%</span></div>
      <div class="rule-track"><div class="rule-bar" style="width:${Math.min(100, pct)}%"></div><div class="rule-mark" style="left:${target}%"></div></div>
      <div class="muted small">${hint} · <span class="money">${fmtMoney(v)}</span> por mes</div></div>`;
  }).join('')}</div>`;
}

function viewAnalisis() {
  const n = Number(S.settings.anPeriod) || 3;
  const hasReal = S.transactions.some((t) => !nonFlow(t) && t.type !== 'transferencia');
  if (!analysisDemo && !hasReal) {
    lastAnalysis = null;
    return `<section class="card" style="text-align:center;padding:36px 20px">
      <h2 style="font-size:18px;margin-bottom:8px">Todavía no hay movimientos para analizar</h2>
      <p style="color:var(--text-2);max-width:520px;margin:0 auto 18px">Cargá tus ingresos y gastos en <b>Movimientos</b> y acá vas a ver en qué gastás más, cuánto ahorrás,
      un plan para ahorrar más y sugerencias. ¿Querés ver cómo queda con datos de ejemplo?</p>
      <div class="toolbar" style="justify-content:center"><button class="btn primary" data-action="demoOn">Ver con datos de ejemplo</button>
      <button class="btn" data-action="go" data-id="movimientos">Cargar movimientos</button></div></section>`;
  }
  const txs = analysisDemo ? demoTxs() : S.transactions;
  const a = analyze(n, txs);
  lastAnalysis = a;
  const st = savingsStatus(a.rate);
  const periodTxt = n === 1 ? 'este mes' : `los últimos ${n} meses`;
  return `
  ${analysisDemo ? `<div class="banner">Estás viendo <b>datos de EJEMPLO</b>, no los tuyos. <a href="#" data-action="demoOff">Volver a mis datos</a></div>` : ''}
  <div class="toolbar">
    <select id="anPeriod">${[[1, 'Este mes'], [3, 'Últimos 3 meses'], [6, 'Últimos 6 meses'], [12, 'Últimos 12 meses']].map(([v, l]) => `<option value="${v}" ${v === n ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <span class="muted small">Promedios mensuales de ${periodTxt}${a.k < n ? ` (${a.k} mes${a.k > 1 ? 'es' : ''} con datos)` : ''}.</span>
    <span class="spacer"></span>
    ${analysisDemo ? '' : `<button class="btn sm" data-action="monthClose" data-id="${addMonths(currentMonth(), -1)}">${icon('calendar', 14)} Cierre de ${monthLabel(addMonths(currentMonth(), -1), 'long')}</button>`}
  </div>
  <div class="tiles">
    ${tile('Ingreso promedio', fmtMoney(a.income), 'por mes')}
    ${tile('Gasto promedio', fmtMoney(a.expense), a.income ? `${fmtPct((a.expense / a.income) * 100, false)} de tus ingresos` : 'por mes')}
    ${tile('Ahorro promedio', `<span class="${cls(a.saving)}">${fmtMoney(a.saving, { sign: true })}</span>`, 'por mes')}
    ${tile('Tasa de ahorro', a.rate != null ? fmtPct(a.rate, false) : '—', statusPill(st) || 'Faltan ingresos')}
  </div>
  <div class="grid-2">
    <section class="card"><div class="card-head"><h2>¿Gastás más de lo que ingresás?</h2>
      <div class="legend"><span><i class="swatch" style="background:var(--c1)"></i>Ingresos</span><span><i class="swatch" style="background:var(--c2)"></i>Gastos</span></div></div>
      <div id="barsChart" class="line-chart"></div></section>
    <section class="card"><div class="card-head"><h2>¿En qué gastás más?</h2><span class="muted small">por mes</span></div>
      ${a.byCat.length ? `<div class="hbars">${a.byCat.map(([c, v]) => {
        const prev = a.prevByCat[c];
        const ch = a.prevK > 0 && prev > 0 ? (v / prev - 1) * 100 : null;
        const tip = esc(`<b>${esc(c)}</b><br>${fmtMoney(v)} por mes · ${fmtPct((v / a.expense) * 100, false)} de tus gastos${ch != null ? `<br>${fmtPct(ch)} vs. período anterior` : ''}`);
        return `<div class="hbar cat" data-tip="${tip}"><span class="lbl">${esc(c)}</span>
          <div class="track"><div class="bar" style="width:${(v / a.byCat[0][1]) * 100}%"></div></div>
          <span class="v"><span class="money">${fmtMoney(v)}</span> <span class="muted small">${fmtPct((v / a.expense) * 100, false)}</span></span></div>`;
      }).join('')}</div>` : '<div class="empty">Sin gastos en el período.</div>'}
    </section>
  </div>
  <div class="grid-2">
    <section class="card"><div class="card-head"><h2>Lo que veo en tus números</h2></div>
      <div class="insights">${insightsFor(a).map(([ico, title, text]) => `<div class="insight"><span class="ins-ico">${ico}</span><div><b>${title}</b><div class="small" style="color:var(--text-2)">${text}</div></div></div>`).join('')}</div></section>
    <section class="card"><div class="card-head"><h2>Regla 50/30/20</h2><span class="muted small">% de tus ingresos</span></div>${rule503020(a)}</section>
  </div>
  <section class="card"><div class="card-head"><h2>Plan para ahorrar más</h2></div>${goalSlider()}<div id="planBox">${planHTML(a)}</div></section>
  <div class="grid-2">
    <section class="card"><div class="card-head"><h2>Presupuesto de ${monthLabel(currentMonth(), 'long')}</h2>
      ${analysisDemo ? '' : '<button class="btn sm" data-action="addBudget">+ Presupuesto</button>'}</div>${analysisDemo ? '<div class="empty">Disponible con tus datos reales.</div>' : budgetHTML(txs)}</section>
    <section class="card"><div class="card-head"><h2>Ideas para aumentar tus ingresos</h2></div>
      <div class="insights">${incomeIdeas(a).map(([ico, title, text]) => `<div class="insight"><span class="ins-ico">${ico}</span><div><b>${title}</b><div class="small" style="color:var(--text-2)">${text}</div></div></div>`).join('')}</div></section>
  </div>
  <p class="muted small" style="margin:0">Son sugerencias generales de presupuesto calculadas con tus datos, no asesoramiento financiero profesional. Los montos en otras monedas se convierten con el tipo de cambio actual.</p>`;
}

const roundNice = (v) => (v >= 1000 ? Math.round(v / 100) * 100 : Math.round(v));

function budgetForm(cat) {
  const cur = S.settings.localCurrency;
  const b = cat ? S.budgets[cat] : null;
  const used = new Set(Object.keys(S.budgets));
  openForm({
    title: cat ? `Presupuesto: ${cat}` : 'Nuevo presupuesto mensual',
    fields: [
      cat ? { type: 'html', html: '' } : { name: 'cat', label: 'Categoría', type: 'select', full: true, options: CAT_GASTO.filter((c) => !used.has(c)).map((c) => [c, c]) },
      { name: 'amount', label: `Tope por mes (${cur})`, type: 'number', full: true, required: true,
        value: b ? round2(fromUSD(toUSD(b.amount, b.currency), cur)) : '', hint: cat ? 'Poné 0 para eliminar este presupuesto.' : '' },
    ],
    onSubmit: (v) => {
      const c = cat || v.cat;
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
      <div><span class="muted small">A tu ritmo (${fmtMoney(P.projectedSaving)}/mes) llegás en</span><b>${etaLabel(M.etaMonths)}</b></div>
    </div>
    ${M.needed != null ? `<div class="small ${onTrack ? 'up' : 'down'}" style="margin:8px 0">${onTrack ? '✓ A tu ritmo actual llegás a tiempo.' : `⚠ A tu ritmo actual no llegás: necesitás ${fmtMoney(M.needed - P.projectedSaving)} más por mes.`}</div>` : ''}
    <div class="small muted">Lo que podés gastar por día ya tiene en cuenta esta meta (arriba, en "Hoy podés gastar").</div>
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
  const svg = el.querySelector('svg'), xh = svg.querySelector('.xh'), tip = $('#tip');
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
    <p class="muted" style="margin:0 auto 14px;max-width:460px">Poné una meta (un monto y, si querés, una fecha) y te digo cuánto ahorrar por mes y cuánto podés gastar como máximo para llegar.</p>
    <button class="btn primary" data-action="addGoal">${icon('target', 16)} Crear mi meta</button></section>`}
  ${S.goals.length ? '<div class="toolbar"><span class="spacer"></span><button class="btn" data-action="addGoal">+ Otra meta</button></div>' : ''}
  <details class="more-box" ${S.settings.planProjOpen ? 'open' : ''} data-pref="planProjOpen">
  <summary>Proyección y récord de ahorro</summary>
  <div class="more-inner">
  <div class="tiles">
    ${tile('Ahorro máximo posible', fmtMoney(P.maxSaving) + '<span class="t-unit">/mes</span>', 'Ingresos fijos + intereses − gastos fijos')}
    ${tile('Ahorro de este mes', `<span class="${cls(thisMonth.income - thisMonth.expense)}">${fmtMoney(thisMonth.income - thisMonth.expense, { sign: true })}</span>`, 'Lo que va del mes')}
    ${tile('Tu récord mensual', T.best ? fmtMoney(T.best.real) : '—', T.best ? `${monthLabel(T.best.m, 'long')} ${T.best.m.slice(0, 4)}` : 'Todavía sin meses completos')}
    ${tile('Proyección a 12 meses', `<span class="${cls(P.projectedSaving)}">${fmtMoney(P.projectedSaving * 12, { sign: true })}</span>`, `A tu ritmo: ${fmtMoney(P.projectedSaving)}/mes`)}
  </div>
  <section class="card"><div class="card-head"><h2>Proyección${g0 ? `: ${esc(g0.name)}` : ' de tu ahorro'}</h2>
    <div class="legend"><span><i class="swatch" style="background:var(--c1)"></i>A tu ritmo</span>${M0?.needed != null ? '<span><i class="swatch" style="background:var(--c2)"></i>Lo necesario</span>' : ''}</div></div>
    <div id="projChart" class="line-chart" style="height:240px"></div>
    <p class="small muted" style="margin:8px 0 0">"A tu ritmo" = ingresos fijos (${fmtMoney(P.recInc)}) + intereses (${fmtMoney(P.interest)}) + ingresos extra promedio (${fmtMoney(P.avgExtra)}) − gastos fijos (${fmtMoney(P.recOut)}) − gasto variable promedio (${fmtMoney(P.avgVariable)}), por mes.</p></section>
  <section class="card"><div class="card-head"><h2>Ahorro máximo vs. ahorro real</h2><span class="muted small">por mes</span></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Mes</th><th class="num">Ingresos</th><th class="num">Gastos fijos</th><th class="num">Ahorro máximo</th><th class="num">Gastos variables</th><th class="num">Ahorro real</th><th class="num">% del máximo</th><th class="num">Acumulado</th></tr></thead>
      <tbody>${T.rows.map((r) => `<tr class="${r.proj ? 'proj' : ''} ${T.best && r.m === T.best.m && !r.proj ? 'best' : ''}">
        <td>${monthLabel(r.m, 'long')} ${r.m.slice(2, 4)}${r.proj ? ' <span class="tag">proyección</span>' : ''}${T.best && r.m === T.best.m && !r.proj ? ' <span class="tag good">récord</span>' : ''}</td>
        <td class="num money">${fmtMoney(r.inc)}</td><td class="num money">${fmtMoney(r.fixed)}</td>
        <td class="num money"><b>${fmtMoney(r.max)}</b></td><td class="num money">${fmtMoney(r.variable)}</td>
        <td class="num money ${cls(r.real)}"><b>${fmtMoney(r.real, { sign: true })}</b></td>
        <td class="num">${r.max > 0 ? fmtPct((r.real / r.max) * 100, false) : '—'}</td>
        <td class="num money">${fmtMoney(r.acc)}</td></tr>`).join('') || '<tr><td colspan="8" class="empty">Registrá movimientos para ver la tabla.</td></tr>'}</tbody>
    </table></div>
    <p class="small muted" style="margin:8px 0 0"><b>Ahorro máximo</b> = lo que te quedaría si sólo pagaras los gastos fijos. <b>% del máximo</b> = cuánto de ese máximo lograste ahorrar de verdad.</p></section>
  </div></details>`;
}

// Plan = metas + análisis en un solo lugar: arriba tu meta y cuánto podés gastar, abajo el detalle
function viewPlan() {
  return `
  ${spendCardHTML()}
  ${viewMetas()}
  <details class="more-box" ${S.settings.planAnalysisOpen ? 'open' : ''} data-pref="planAnalysisOpen">
    <summary>En qué gastás y cómo ahorrar más</summary>
    <div class="more-inner">${viewAnalisis()}</div>
  </details>`;
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
  ['Comida y salidas', 'almuerzo almorce cena cene desayuno desayune comida comi restaurante resto cafe cafecito pizza hamburguesa saltena saltenas tucumana pollo pollito delivery pedidosya snack helado bebida cerveza chela trago bar salchipapa api anticucho sandwich empanada gaseosa coca refresco jugo merienda'],
  ['Supermercado', 'super supermercado mercado hipermaxi fidalga ketal icnorte viveres verdura verduras fruta frutas abarrotes despensa'],
  ['Transporte', 'taxi uber yango indriver micro trufi minibus bus colectivo pasaje pasajes gasolina combustible nafta diesel teleferico parqueo estacionamiento peaje'],
  ['Servicios', 'luz agua internet wifi celular credito megas recarga telefono gas cable entel tigo viva'],
  ['Salud', 'farmacia medico doctor remedio medicamento pastillas dentista consulta clinica analisis'],
  ['Gimnasio / deporte', 'gym gimnasio deporte futbol cancha crossfit natacion piscina proteina'],
  ['Educación', 'universidad uni facultad curso libro libros fotocopias fotocopia colegio matricula clase clases udemy'],
  ['Suscripciones', 'netflix spotify youtube premium icloud chatgpt claude suscripcion disney hbo prime apple music'],
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
    const words = isIncome ? INC_WORDS : CAT_WORDS;
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
    const cats = type === 'ingreso' ? CAT_INGRESO : CAT_GASTO;
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
- categoria (gastos): ${CAT_GASTO.join(', ')}
- categoria (ingresos): ${CAT_INGRESO.join(', ')}
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
  const catOpts = (type, sel) => (type === 'ingreso' ? CAT_INGRESO : CAT_GASTO).map((c) => `<option ${c === sel ? 'selected' : ''}>${esc(c)}</option>`).join('');
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
  const key = await deriveKey(pass, salt);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(S)));
  // editedAt va sin cifrar: sólo una fecha, para saber qué versión es más nueva sin descifrar
  return JSON.stringify({ app: 'mis-finanzas', v: 1, editedAt: S.editedAt || '', kdf: 'PBKDF2-SHA256-250000', salt: bufToB64(salt), iv: bufToB64(iv), data: bufToB64(data) });
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
function mergeRemote(R) {
  const dead = new Set([...(S.deleted || []), ...(R.deleted || [])]);
  const remoteDead = new Set(R.deleted || []);
  for (const t of S.transactions) if (remoteDead.has(t.id)) applyTx(t, -1);
  S.transactions = S.transactions.filter((t) => !dead.has(t.id));
  const have = new Set(S.transactions.map((t) => t.id));
  for (const t of R.transactions || []) {
    if (have.has(t.id) || dead.has(t.id)) continue;
    // El mismo fijo registrado solo en los dos dispositivos: queda uno
    if (t.recurringId && S.transactions.some((x) => x.recurringId === t.recurringId && x.date?.slice(0, 7) === t.date?.slice(0, 7))) { dead.add(t.id); continue; }
    if (t.scheduledId && S.transactions.some((x) => x.scheduledId === t.scheduledId)) { dead.add(t.id); continue; }
    S.transactions.push(t);
    applyTx(t, 1); // sólo afecta cuentas que ya existían acá; las cuentas nuevas traen su saldo
    // Compras/ventas hechas en el otro dispositivo también mueven la cantidad
    const h = t.tradeId && S.holdings.find((x) => x.id === t.holdingId);
    const tr = h && (R.holdings || []).find((x) => x.id === h.id)?.trades?.find((x) => x.id === t.tradeId);
    if (tr && !(h.trades || []).some((x) => x.id === tr.id)) {
      const q = Number(h.quantity) || 0;
      if (tr.side === 'compra') { h.avgCost = (q * (Number(h.avgCost) || 0) + tr.qty * tr.price) / (q + tr.qty); h.quantity = q + tr.qty; }
      else h.quantity = Math.max(0, q - tr.qty);
      (h.trades = h.trades || []).push(tr);
    }
  }
  for (const k of ['accounts', 'holdings', 'recurring', 'scheduled', 'goals', 'loans']) {
    S[k] = (S[k] || []).filter((x) => !dead.has(x.id));
    const ids = new Set(S[k].map((x) => x.id));
    for (const x of R[k] || []) if (!ids.has(x.id) && !dead.has(x.id)) S[k].push(x);
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
    const content = await encryptState(c.pass);
    await gh(`/gists/${c.gistId}`, { method: 'PATCH', body: JSON.stringify({ files: { [CLOUD_FILE]: { content } } }) });
    setCloudCfg({ ...cloudCfg(), base: S.editedAt || '' });
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
        const localChanged = (S.editedAt || '') > base;
        const remoteChanged = remote && (remote.editedAt || '') > base;
        if (!remote) await this.upload();
        else if (remoteChanged && (!localChanged || !hasData())) {
          const data = await decryptPayload(remote, c.pass);
          closeDialogs();
          S = migrate(data);
          S.editedAt = remote.editedAt || S.editedAt;
          setCloudCfg({ ...cloudCfg(), base: remote.editedAt || '' });
          save(false);
          render();
          toast('Datos actualizados desde tu otro dispositivo ✓');
        } else if (remoteChanged && localChanged) {
          const data = await decryptPayload(remote, c.pass);
          closeDialogs();
          mergeRemote(migrate(data));
          S.editedAt = new Date().toISOString();
          snapshot();
          save(false);
          await this.upload();
          render();
          toast('Uní los cambios de tus dos dispositivos ✓');
        } else if (localChanged) await this.upload();
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
          S = migrate(data);
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
        const g = await gh('/gists', { method: 'POST', body: JSON.stringify({ description: 'MyFinance — datos cifrados', public: false, files: { [CLOUD_FILE]: { content: await encryptState(pass) } } }) }, token);
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
        ${CloudSync.enabled() ? 'Tus datos siguen guardados en GitHub y vuelven cuando reactives la sincronización.' : 'Si no tenés respaldo ni sincronización, se pierden.'}</p>` }],
      submitLabel: 'Borrar datos de este dispositivo', danger: true,
      onSubmit: () => {
        try { localStorage.removeItem(STORE_KEY); } catch (e) { /* nada */ }
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
        tus ${fmtIn(local, cur)} ${lost > 0 ? `valen <b class="money down">US$ ${n2(lost)} menos</b>` : `valen <b class="money up">US$ ${n2(-lost)} más</b>`} que entonces.<br>` : 'La app va guardando el tipo de cambio cada día para mostrarte cómo cambia tu poder de compra.<br>'}
    </div>
    <p class="muted small" style="margin:8px 0 0">Sólo informativo: muestra cuánto de tu plata depende del tipo de cambio.</p></section>`;
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
      const btn = it.recId ? `<button class="btn sm" data-action="payRecurring" data-id="${it.recId}">${it.type === 'ingreso' ? 'Ya entró' : 'Ya pagué'}</button>`
        : it.accId ? `<button class="btn sm" data-action="payCard" data-id="${it.accId}">Pagar</button>`
        : it.loanId ? `<button class="btn sm" data-action="loanPay" data-id="${it.loanId}">Registrar</button>`
        : it.schedId ? `<button class="btn sm" data-action="paySched" data-id="${it.schedId}">Ya pagué</button>` : '';
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
  if (record != null) lines.push(saving > record ? ['★', `¡Nuevo récord! Superaste tu mejor mes (${fmtMoney(record)}).`] : ['🏁', `Tu récord sigue siendo ${fmtMoney(record)}: te faltaron ${fmtMoney(record - saving)}.`]);
  if (prev.income || prev.expense) lines.push([saving >= prevSaving ? '📈' : '📉', `Ahorraste ${fmtMoney(Math.abs(saving - prevSaving))} ${saving >= prevSaving ? 'más' : 'menos'} que el mes anterior.`]);
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

/* ---------------- Registro rápido: − Gasto / + Ingreso ----------------
   Una sola pantalla: monto, categoría con un toque y listo. La cuenta viene elegida
   (la última que usaste) y sólo la cambiás si querés. */

const CAT_ICON = {
  'Supermercado': 'cart', 'Comida y salidas': 'food', 'Transporte': 'bus', 'Vivienda / alquiler': 'home', 'Servicios': 'bolt',
  'Salud': 'heart', 'Gimnasio / deporte': 'dumbbell', 'Educación': 'book', 'Ocio': 'ticket', 'Compras': 'bag',
  'Suscripciones': 'play', 'Viajes': 'plane', 'Impuestos': 'receipt', 'Pago de tarjeta (intereses)': 'card', 'Otros gastos': 'more',
  'Sueldo': 'briefcase', 'Mesada / familia': 'users', 'Freelance': 'laptop', 'Dividendos': 'trending', 'Intereses': 'percent',
  'Venta de algo': 'tag', 'Regalo': 'gift', 'Otros ingresos': 'plus',
  'Compra de inversión': 'trending', 'Venta de inversión': 'trending',
};
const CAT_SHORT = {
  'Comida y salidas': 'Comida', 'Vivienda / alquiler': 'Vivienda', 'Gimnasio / deporte': 'Gym', 'Pago de tarjeta (intereses)': 'Intereses tarjeta',
  'Otros gastos': 'Otros', 'Mesada / familia': 'Mesada', 'Venta de algo': 'Venta', 'Otros ingresos': 'Otros', 'Suscripciones': 'Suscrip.',
};
const catIcon = (c, size = 18) => icon(CAT_ICON[c] || 'more', size);
const shortCat = (c) => CAT_SHORT[c] || c;

// Categorías ordenadas por cuánto las usás (las más usadas primero)
function catsByUse(type) {
  const base = type === 'ingreso' ? CAT_INGRESO : CAT_GASTO;
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

function quickEntry(type = 'gasto', t = null) {
  if (!S.accounts.length) return toast('Primero agregá una cuenta en Cuentas.');
  const st = {
    type: t?.type || type, amount: t ? t.amount : '', category: t?.category || '', note: t?.note && t.note !== t.category ? t.note : '',
    accountId: t?.accountId || lastAccountFor(t?.type || type), date: t?.date || todayISO(), time: t?.time || nowTime(), showAcc: false, showWhen: false,
  };
  const dlg = $('#quickDlg');
  const read = () => {
    const a = $('#qAmount'), n = $('#qNote'), d = $('#qDate'), h = $('#qTime');
    if (a) st.amount = a.value;
    if (n) st.note = n.value.trim();
    if (d && d.value) st.date = d.value;
    if (h) st.time = h.value;
  };
  const paint = (focus) => {
    const acc = S.accounts.find((a) => a.id === st.accountId);
    const accs = S.accounts.filter((a) => st.type === 'gasto' || a.type !== 'credito');
    const out = st.type === 'gasto';
    dlg.innerHTML = `<form class="quick ${st.type}" novalidate>
      <div class="q-top">
        <div class="q-seg"><button type="button" data-q-type="gasto" class="${out ? 'on' : ''}">${icon('minus', 16)} Gasto</button>
          <button type="button" data-q-type="ingreso" class="${out ? '' : 'on'}">${icon('plus', 16)} Ingreso</button></div>
        <button type="button" class="q-icon" data-q="mic" aria-label="Dictar">${icon('mic', 20)}</button>
        <button type="button" class="q-icon" data-q="close" aria-label="Cerrar">${icon('x', 20)}</button>
      </div>
      
      ${t ? '' : favChipsHTML(st.type, 'data-q-fav')}
      <label class="q-amount"><span class="q-sign">${out ? '−' : '+'}</span><span class="q-cur">${curLabel(acc?.currency || '')}</span>
        <input id="qAmount" inputmode="decimal" autocomplete="off" placeholder="0" value="${esc(st.amount === '' ? '' : numInput(st.amount))}"></label>
      <div class="q-cats">${catsByUse(st.type).map((c) => `<button type="button" class="q-cat ${c === st.category ? 'on' : ''}" data-q-cat="${esc(c)}">
        <span class="q-cat-ico">${catIcon(c, 20)}</span><span class="q-cat-name">${esc(shortCat(c))}</span></button>`).join('')}</div>
      <input id="qNote" class="q-note" placeholder="Detalle (opcional): ej. almuerzo con amigos" value="${esc(st.note)}" autocomplete="off">
      <div class="q-chips">
        <button type="button" class="q-chip" data-q="acc">${accIcon(acc)}<span>${out ? 'Sale de' : 'Entra a'} <b>${esc(acc?.name || '—')}</b></span>${icon('chevron', 14)}</button>
        <button type="button" class="q-chip" data-q="when">${icon('calendar', 16)}<span>${whenLabel(st.date, st.time)}</span>${icon('chevron', 14)}</button>
      </div>
      <div class="q-accs" ${st.showAcc ? '' : 'hidden'}>${accs.map((a) => `<button type="button" class="q-acc ${a.id === st.accountId ? 'on' : ''}" data-q-acc="${a.id}">
        ${accIcon(a)}<span>${esc(a.name)}<small>${fmtIn(a.balance, a.currency)}${a.type === 'credito' ? ' de deuda' : ''}</small></span></button>`).join('')}</div>
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
      if (st.type === 'ingreso' && acc?.type === 'credito') st.accountId = lastAccountFor('ingreso');
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
    if (q === 'mic') { dlg.close(); openChat({ listen: true }); }
    if (q === 'acc') { st.showAcc = !st.showAcc; st.showWhen = false; paint(false); }
    if (q === 'when') { st.showWhen = !st.showWhen; st.showAcc = false; paint(false); }
    if (q === 'del') { dlg.close(); ACTIONS.delTx(t.id); }
  };
  dlg.onsubmit = (e) => {
    e.preventDefault();
    read();
    const amount = parseNum(st.amount);
    if (!(amount > 0)) return err('Escribí el monto.');
    const acc = S.accounts.find((a) => a.id === st.accountId);
    if (!acc) return err('Elegí la cuenta.');
    const category = st.category || (st.type === 'ingreso' ? 'Otros ingresos' : 'Otros gastos');
    const next = { type: st.type, amount: round2(amount), category, note: st.note || category, accountId: acc.id, date: st.date || todayISO(), time: st.time || '' };
    S.settings.lastAccount = { ...(S.settings.lastAccount || {}), [st.type]: acc.id };
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
    toast(t ? 'Cambios guardados ✓' : `${st.type === 'gasto' ? 'Gasto' : 'Ingreso'} guardado ✓ · ${esc(acc.name)}: ${fmtIn(acc.balance, acc.currency)}`);
  };
  paint(true);
  dlg.showModal();
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
    : `${esc(shortCat(t.category || ''))} · ${esc(acc?.name || 'cuenta eliminada')}`;
  return `<button class="tx-row" data-action="editTx" data-id="${t.id}">
    <span class="tx-ico ${t.type}">${ico}</span>
    <span class="tx-main"><span class="tx-title">${esc(title)}${t.recurringId ? ' <span class="tag">fijo</span>' : t.scheduledId ? ' <span class="tag">programado</span>' : ''}</span><span class="tx-meta">${meta}${t.time ? ` · ${esc(t.time)}` : ''}</span></span>
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
  <button class="qa out" data-action="quick" data-id="gasto">${icon('minus', 20)}<span>Gasto</span></button>
  <button class="qa in" data-action="quick" data-id="ingreso">${icon('plus', 20)}<span>Ingreso</span></button>
  <button class="qa mic" data-action="openChat" aria-label="Registrar hablando">${icon('mic', 20)}</button>
</div>`;

function monthSummaryHTML(month) {
  const ms = monthStats(month);
  const left = ms.income - ms.expense;
  return `<div class="month-sum">
    <div><span>Gastaste</span><b class="money">${fmtMoney(ms.expense)}</b></div>
    <div><span>Entró</span><b class="money up">${fmtMoney(ms.income)}</b></div>
    <div><span>${left >= 0 ? 'Te queda' : 'Te pasaste'}</span><b class="money ${left >= 0 ? '' : 'down'}">${fmtMoney(Math.abs(left))}</b></div>
  </div>`;
}

/* ---------------- "Hoy podés gastar" ----------------
   Ingresos del mes (lo que ya entró + los fijos que faltan) − gastos fijos − lo que querés ahorrar
   = plata para el día a día. Se reparte entre los días que quedan del mes. */

function spendPlan() {
  const P = planNumbers();
  const month = currentMonth(), today = todayISO();
  const txs = S.transactions.filter((t) => t.date?.startsWith(month) && !nonFlow(t));
  const sum = (list) => list.reduce((s, t) => s + txUSD(t), 0);
  const pendingRules = (type) => S.recurring.filter((r) => repeats(r) && r.type === type && !recurringTx(r, month) && !(r.skip || []).includes(month));
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

function spendCardHTML() {
  const p = spendPlan();
  const cur = S.settings.localCurrency;
  const L = (usd) => fmtIn(fromUSD(usd, cur), cur);
  const n = streak(), doneToday = activeDays().has(todayISO());
  const pct = p.budget > 0 ? Math.min(100, (p.spent / p.budget) * 100) : 100;
  const tone = p.budget <= 0 || p.todayLeft < 0 ? 'critical' : p.todayLeft < p.perDay * 0.3 ? 'warning' : 'good';
  // El número grande siempre responde "¿cuánto puedo gastar hoy?": si te pasaste es Bs 0,
  // y el detalle de cuánto te pasaste se ve al tocar la tarjeta
  const overMonth = p.monthLeft < 0, overToday = !overMonth && p.todayLeft < 0;
  const why = overMonth ? 'Te pasaste del presupuesto del mes · tocá para ver' : overToday ? 'Hoy gastaste más de lo del día · tocá para ver' : '';
  const big = p.budget <= 0 ? '' : `<button class="spend-main" data-action="spendInfo">
      <div class="label">Hoy podés gastar</div>
      <div class="spend-value money ${tone}">${L(Math.max(0, p.todayLeft))}</div>
      ${why ? `<div class="over-note">${why}</div>` : ''}
    </button>`;
  return `<section class="card spend-card">
    <div class="card-head" style="margin-bottom:4px"><span class="muted small">${monthLabel(currentMonth(), 'long').replace(/^\w/, (c) => c.toUpperCase())}</span>
      <span class="streak ${doneToday ? 'done' : ''}">${icon('flame', 15)} ${n} ${n === 1 ? 'día' : 'días'}</span></div>
    ${p.budget <= 0 && p.income <= 0 && !S.recurring.length ? `<div class="label">¿Cuánto podés gastar por día?</div>
      <div class="small muted" style="margin:4px 0 8px">Agregá lo que te entra y sale todos los meses (sueldo, alquiler, luz…) y la app te lo calcula.</div>
      <button class="btn sm primary" data-action="go" data-id="movimientos" data-anchor="fijos" style="margin-bottom:8px">Agregar mis fijos</button>`
    : p.budget <= 0 ? `<div class="label">Este mes no queda para gastos del día a día</div>
      <div class="small muted" style="margin:4px 0 8px">Tus ingresos (${L(p.income)}) no cubren tus fijos más el ahorro. Revisá tu meta o tus fijos.</div>` : big}
    <div class="meter"><div class="${tone}" style="width:${pct}%"></div></div>
    <div class="small muted money" style="margin-top:6px">Gastaste ${L(p.spent)} de ${L(Math.max(0, p.budget))} del mes · ${p.daysLeft === 1 ? 'último día' : `quedan ${p.daysLeft} días`}${p.budget > 0 && p.perDay > 0 ? ` (${L(p.perDay)}/día)` : ''}</div>
    ${S.recurring.some((r) => repeats(r) && r.type === "ingreso" && !countsInPlan(r)) ? `<div class="small muted" style="margin-top:4px">Sin contar: ${S.recurring.filter((r) => repeats(r) && r.type === "ingreso" && !countsInPlan(r)).map((r) => esc(r.name)).join(", ")}</div>` : ""}
    <div class="spend-foot">
      <button class="link-btn" data-action="spendInfo">Cómo se calcula · elegir ingresos</button>
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
  openForm({
    title: '¿Cómo se calcula?',
    fields: [
      ...(incomes.length ? [{ type: 'html', html: `<div class="calc-sub"><b>¿Qué ingresos fijos contás?</b><br><span class="muted small">Apagá los que no sabés si van a llegar. Lo que ya te entró siempre cuenta.</span></div>` }] : []),
      ...incomes.map((r) => ({
        name: `inc_${r.id}`, type: 'checkbox', full: true, value: countsInPlan(r),
        label: `${r.name} · ${fmtIn(r.amount, r.currency)}${recurringTx(r, currentMonth()) ? ' (ya entró este mes)' : ''}`,
      })),
      { type: 'html', html: `<div class="calc">
        ${row('Ingresos del mes (lo que entró + los fijos que contás)', L(p.income))}
        ${row('− Gastos fijos (gym, alquiler…)', L(p.fixed))}
        ${p.sched > 0 ? row(`− Gastos programados (${esc(schedDueThisMonth().map((s) => s.name).join(', ') || 'ya pagados')})`, L(p.sched)) : ''}
        ${row(p.goal ? `− Ahorro para tu meta "${esc(p.goal.name)}"` : `− Ahorro (${p.rate}% de tus ingresos)`, L(p.save))}
        ${row('= Para el día a día este mes', L(p.budget), 'total')}
        ${p.monthLeft < 0 || p.perDay < 0 ? `
        ${row('− Ya gastaste este mes', L(p.spent))}
        ${row('= Te pasaste del mes', L(-p.monthLeft), 'total over')}
        ${row('Hoy podés gastar', L(0), 'total')}` : `
        ${row('− Ya gastaste antes de hoy', L(p.spentBefore))}
        ${row(`÷ ${p.daysLeft} días que quedan`, `${L(p.perDay)} por día`, 'total')}
        ${row('− Gastaste hoy', L(p.spentToday))}
        ${p.todayLeft < 0 ? `${row('= Te pasaste hoy', L(-p.todayLeft), 'total over')}
        ${row('Hoy podés gastar', L(0), 'total')}
        <div class="small muted">Mañana el monto por día se recalcula con lo que te queda del mes (${L(Math.max(0, p.monthLeft))}).</div>`
        : row('= Hoy podés gastar', L(p.todayLeft), 'total')}`}
      </div>` },
      ...(p.goal ? [{ type: 'html', html: '<p class="small muted" style="margin:0">El ahorro sale de tu meta (Plan). Si no tenés meta, se usa el porcentaje de abajo.</p>' }] : []),
      { name: 'saveRate', label: 'Si no tenés meta, ¿qué % de tus ingresos querés ahorrar?', type: 'number', value: p.rate, full: true },
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

function render() {
  if (VIEW_ALIAS[S.settings.view]) S.settings.view = VIEW_ALIAS[S.settings.view];
  const v = VIEWS[S.settings.view] ? S.settings.view : 'resumen';
  $$('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
  $('#viewTitle').textContent = VIEWS[v];
  document.title = `${VIEWS[v]} · MyFinance`;
  const content = $('#content');
  content.innerHTML = fileBannerHTML() + { resumen: viewResumen, inversiones: viewInversiones, cuentas: viewCuentas, movimientos: viewMovimientos, plan: viewPlan, ajustes: viewAjustes }[v]();
  drawCharts();
  $('#curLocalBtn').textContent = curLabel(S.settings.localCurrency);
  $$('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.cur === S.settings.displayCurrency));
  document.body.classList.toggle('privado', !!S.settings.privacy);
  $('#privacyBtn').innerHTML = icon(S.settings.privacy ? 'eyeOff' : 'eye');
  $('#moreBtn').classList.toggle('active', ['inversiones', 'cuentas', 'ajustes'].includes(v));
  $('#lastRefresh').innerHTML = footHTML();
  $('#tip').hidden = true;
}

// Los gráficos se dibujan después de insertar el HTML (necesitan el ancho real)
function drawCharts() {
  const v = S.settings.view;
  if (v === 'resumen') drawLine($('#nwChart'), S.history);
  if (v === 'plan' && lastAnalysis) drawBars($('#barsChart'), lastAnalysis.per);
  if (v === 'movimientos' && lastMonthly) drawMonthly($('#monthlyChart'), lastMonthly);
  if (v === 'plan' && lastProjection) drawProjection($('#projChart'), lastProjection);
}

function go(view, anchor) {
  $('#moreMenu').hidden = true;
  S.settings.view = VIEW_ALIAS[view] || view;
  save(false);
  render();
  window.scrollTo(0, 0);
  if (anchor) $('#' + anchor)?.scrollIntoView({ block: 'start' });
}

/* ---------------- Acciones: inversiones ---------------- */

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
      { name: 'quantity', label: 'Cantidad', type: 'number', value: h.quantity, hint: 'Acciones, unidades o monedas' },
      { name: 'avgCost', label: 'Precio promedio de compra (USD)', type: 'number', value: h.avgCost, blankZero: true, placeholder: 'Opcional' },
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
      if (isNew) S.holdings.push({ id: uid(), change24h: null, priceUpdated: null, priceSource: '', trades: [], price: 0, ...changes });
      else Object.assign(h, changes);
      snapshot(); save(); render();
      if (changes.coingeckoId && !(Number(changes.price) || Number(h.price))) refreshAll({ silent: true });
    },
  });
}

function tradeForm(h) {
  const accOpts = [['', '— No mover dinero de ninguna cuenta —'], ...S.accounts.filter((a) => a.type !== 'credito').map((a) => [a.id, `${a.name} (${a.currency})`])];
  openForm({
    title: `Compra / venta de ${h.symbol}`,
    fields: [
      { name: 'side', label: 'Operación', type: 'select', value: 'compra', options: [['compra', 'Compra'], ['venta', 'Venta']] },
      { name: 'date', label: 'Fecha', type: 'date', value: todayISO() },
      { name: 'qty', label: 'Cantidad', type: 'number', required: true, placeholder: 'ej. 0,5' },
      { name: 'price', label: 'Precio por unidad (USD)', type: 'number', value: h.price || '', required: true },
      { name: 'accountId', label: 'Cuenta de donde sale / a donde entra el dinero', type: 'select', options: accOpts, full: true,
        hint: 'Opcional. Si elegís una, se descuenta (compra) o acredita (venta) en esa cuenta.' },
    ],
    submitLabel: 'Registrar',
    onSubmit: (v) => {
      if (!(v.qty > 0)) return 'La cantidad tiene que ser mayor a 0.';
      if (!(v.price > 0)) return 'El precio tiene que ser mayor a 0.';
      const q = Number(h.quantity) || 0;
      if (v.side === 'venta' && v.qty > q + 1e-12) return `Sólo tenés ${fmtNum(q)} ${h.symbol}.`;
      const acc = v.accountId ? S.accounts.find((a) => a.id === v.accountId) : null;
      const amount = acc ? convert(v.qty * v.price, 'USD', acc.currency) : null;
      if (acc && amount == null) return NO_RATE;
      const prevAvg = Number(h.avgCost) || 0;
      if (v.side === 'compra') {
        const newQ = Math.round((q + v.qty) * 1e10) / 1e10;
        h.avgCost = ((q * (Number(h.avgCost) || 0)) + v.qty * v.price) / newQ;
        h.quantity = newQ;
      } else {
        h.quantity = Math.round(Math.max(0, q - v.qty) * 1e10) / 1e10;
      }
      h.trades = h.trades || [];
      const tradeId = uid();
      h.trades.push({ id: tradeId, date: v.date, side: v.side, qty: v.qty, price: v.price, prevAvg: prevAvg });
      if (acc) {
        const tx = {
          id: uid(), created: new Date().toISOString(), date: v.date, type: v.side === 'compra' ? 'gasto' : 'ingreso',
          accountId: acc.id, amount, category: v.side === 'compra' ? 'Compra de inversión' : 'Venta de inversión',
          note: `${v.side === 'compra' ? 'Compra' : 'Venta'} ${fmtNum(v.qty)} ${h.symbol}`, investment: true, holdingId: h.id, tradeId,
        };
        S.transactions.push(tx);
        applyTx(tx, 1);
      }
      snapshot(); save(); render();
      toast(`${v.side === 'compra' ? 'Compra' : 'Venta'} de ${h.symbol} registrada.`);
    },
  });
}

// Deshace una compra/venta (al borrar su movimiento): devuelve la cantidad y el precio promedio de antes
function undoTrade(h, tradeId) {
  const i = (h.trades || []).findIndex((x) => x.id === tradeId);
  if (i < 0) return;
  const tr = h.trades[i];
  const q = Number(h.quantity) || 0;
  const r10 = (x) => Math.round(x * 1e10) / 1e10; // evita 0,0099999… por la aritmética de decimales
  if (tr.side === 'compra') { h.quantity = r10(Math.max(0, q - tr.qty)); h.avgCost = tr.prevAvg ?? h.avgCost; }
  else h.quantity = r10(q + tr.qty);
  h.trades.splice(i, 1);
}

function importHoldings(text) {
  let data;
  const m = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  try { data = JSON.parse(m ? m[0] : text); } catch (e) { return toast('No pude leer el JSON. Revisá que esté completo.'); }
  if (!Array.isArray(data)) data = data.holdings || data.portfolio || data.portafolio || [];
  let added = 0, updated = 0;
  for (const r of data) {
    const symbol = String(r.symbol || r.ticker || '').toUpperCase().trim();
    if (!symbol) continue;
    const qty = parseNum(r.quantity ?? r.cantidad ?? 0) || 0;
    const avg = parseNum(r.avgCost ?? r.precioPromedio ?? r.avg_cost ?? 0) || 0;
    const platform = String(r.platform || r.plataforma || '').trim();
    let h = S.holdings.find((x) => x.symbol === symbol && (!platform || !x.platform || x.platform === platform));
    if (h) {
      h.quantity = qty;
      if (avg) h.avgCost = avg;
      if (platform) h.platform = platform;
      updated++;
    } else {
      const cg = CG_IDS[symbol] || '';
      S.holdings.push({
        id: uid(), symbol, name: r.name || r.nombre || '', assetType: cg ? (cg.includes('gold') ? 'oro' : 'cripto') : (r.type || 'accion'),
        platform, quantity: qty, avgCost: avg, price: 0, change24h: null, priceUpdated: null, priceSource: '', coingeckoId: cg, trades: [],
      });
      added++;
    }
  }
  if (!added && !updated) return toast('No encontré activos en el texto.');
  save();
  toast(`Importado: ${updated} actualizado(s), ${added} nuevo(s).`);
  go('inversiones');
  refreshAll({ silent: true });
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
  openForm({
    title: `${isCredit ? 'Deuda' : 'Saldo'} de ${a.name}`,
    fields: [
      { name: 'balance', label: `${isCredit ? 'Deuda actual' : 'Saldo actual'} (${a.currency})`, type: 'number', value: a.balance, full: true,
        hint: 'Usalo para corregir el saldo y que coincida con tu banco/app.' },
    ],
    onSubmit: (v) => { a.balance = v.balance || 0; snapshot(); save(); render(); },
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
      { name: 'catGasto', label: 'Categoría', type: 'select', value: t.category, options: CAT_GASTO.map((c) => [c, c]), showIf: (v) => v.type === 'gasto' },
      { name: 'catIngreso', label: 'Categoría', type: 'select', value: t.category, options: CAT_INGRESO.map((c) => [c, c]), showIf: (v) => v.type === 'ingreso' },
      { name: 'note', label: 'Detalle', value: t.note, full: true, placeholder: 'ej. Almuerzo, pasaje, sueldo octubre…' },
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
      const sameCur = curOf(v.accountId) === curOf(v.toAccountId);
      const next = {
        type: v.type, date: v.date || todayISO(), time: v.time || '', accountId: v.accountId, amount: v.amount,
        toAccountId: v.type === 'transferencia' ? v.toAccountId : '',
        toAmount: v.type === 'transferencia' && !sameCur ? (v.toAmount || 0) : '',
        category: v.type === 'gasto' ? v.catGasto : v.type === 'ingreso' ? v.catIngreso : '', note: v.note,
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
  const rateFor = (a, b) => S.settings.lastFx?.[pairKey(a, b)] || marketFx(curOf(a), curOf(b));
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
      if (changed === 'from' || changed === 'to') {
        form.querySelector('[data-field="amount"] label').textContent = `Monto que sale (${curLabel(c1)})`;
        form.querySelector('[data-field="rate"] label').textContent = `Tipo de cambio que te dieron (${P.label})`;
        const r = rateFor(v.from, v.to);
        if (c1 !== c2 && r) { form.elements.rate.value = numInput(round2(r)); v.rate = round2(r); }
      }
      if (c1 === c2) { $('#fxHint').innerHTML = ''; return; }
      // Escribiste lo que te llegó → calculo el tipo de cambio; si no, calculo lo que llega
      if (changed === 'got' && v.amount > 0 && v.got > 0) { v.rate = P.rate(v.amount, v.got); form.elements.rate.value = numInput(round2(v.rate)); }
      else if (v.amount > 0 && v.rate > 0) { v.got = round2(P.out(v.amount, v.rate)); form.elements.got.value = numInput(v.got); }
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
        toAmount: same ? '' : got, fxRate: same ? null : round2(rate), category: '', note: v.note };
      if (t) { applyTx(t, -1); Object.assign(t, next); applyTx(t, 1); }
      else { const tx = { id: uid(), created: new Date().toISOString(), ...next }; S.transactions.push(tx); applyTx(tx, 1); }
      snapshot(); save(); render();
      const to = S.accounts.find((a) => a.id === v.to);
      toast(`Listo ✓ ${esc(to.name)}: ${fmtIn(to.balance, to.currency)}`);
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

/* ---------------- Sincronizar a mano (iPhone y navegadores sin acceso a archivos) ----------------
   iOS no deja que una página escriba sola en OneDrive, así que son dos pasos:
   "Traer" elige mis-finanzas.json desde Archivos > OneDrive; "Guardar" lo comparte a Archivos > OneDrive. */

const SYNC_FILE = 'mis-finanzas.json';

// Tiene que llamarse directo desde un toque: iOS sólo abre "Compartir" en respuesta a uno.
function syncPush() {
  S.settings.lastSync = new Date().toISOString();
  save(false);
  const json = JSON.stringify(S, null, 2);
  const file = new File([json], SYNC_FILE, { type: 'application/json' });
  const done = () => { render(); toast('Listo. Si OneDrive preguntó, elegí "Reemplazar".', 4000); };
  if (navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file], title: 'MyFinance' }).then(done).catch((e) => {
      if (e.name !== 'AbortError') { downloadJSON(SYNC_FILE, json); done(); }
    });
  } else { downloadJSON(SYNC_FILE, json); done(); }
}

function syncPull() {
  const input = document.createElement('input');
  input.type = 'file'; // sin filtro "accept": iOS a veces bloquea los .json si se filtra
  input.onchange = () => { if (input.files[0]) pullFromFile(input.files[0]); };
  input.click();
}

function pullFromFile(file) {
  const r = new FileReader();
  r.onload = () => {
    let data;
    try { data = JSON.parse(r.result); } catch (e) { return toast('Ese archivo no es de MyFinance.'); }
    if (!isValidData(data)) return toast('Ese archivo no es de MyFinance.');
    const fileTime = data.editedAt || '', localTime = S.editedAt || '';
    if (!hasData() || fileTime > localTime) {
      S = migrate(data);
      S.settings.lastSync = new Date().toISOString();
      save(false); render();
      return toast(`Datos actualizados desde OneDrive (editados el ${fmtDateTime(data.editedAt)}).`, 4000);
    }
    if (fileTime === localTime) {
      S.settings.lastSync = new Date().toISOString();
      save(false); render();
      return toast('Ya estabas al día ✓');
    }
    // Lo de este teléfono es más nuevo que el archivo
    openForm({
      title: 'Tus datos de acá son más nuevos',
      fields: [
        { type: 'html', html: `<p style="margin:0">Este dispositivo tiene cambios del <b>${fmtDateTime(S.editedAt)}</b> y el archivo es del <b>${fmtDateTime(data.editedAt)}</b>.<br><br>
          Te conviene <b>guardar en OneDrive</b> lo de este dispositivo para que tu computadora también lo tenga.</p>` },
        { name: 'choice', label: '¿Qué hacemos?', type: 'select', full: true, value: 'push',
          options: [['push', 'Guardar lo de este dispositivo en OneDrive'], ['pull', 'Usar igual los datos del archivo (se pierden los cambios de acá)']] },
      ],
      submitLabel: 'Continuar',
      onSubmit: (v) => {
        if (v.choice === 'push') { syncPush(); return; }
        S = migrate(data);
        S.settings.lastSync = new Date().toISOString();
        save(false); render();
        toast('Datos reemplazados por los del archivo.');
      },
    });
  };
  r.readAsText(file);
}

function phoneSyncHTML() {
  return `<p class="small" style="color:var(--text-2);margin-top:0">En el iPhone la sincronización con OneDrive es en dos pasos (iOS no deja que la app escriba sola en OneDrive).
    Usá siempre el mismo archivo: <b>${SYNC_FILE}</b>.</p>
    <div class="sync-steps">
      <button class="btn" data-action="syncPull">⬇&nbsp; <span><b>Traer de OneDrive</b><small>Antes de usar la app: elegí ${SYNC_FILE} en Archivos → OneDrive</small></span></button>
      <button class="btn primary" data-action="syncPush">⬆&nbsp; <span><b>Guardar en OneDrive</b><small>Después de cargar cosas: "Guardar en Archivos" → OneDrive → Reemplazar</small></span></button>
    </div>
    <p class="hint">Última sincronización: ${fmtDateTime(S.settings.lastSync)}</p>`;
}

function syncDialog() {
  openForm({
    title: 'Sincronizar con OneDrive',
    fields: [{ type: 'html', html: phoneSyncHTML() }],
    submitLabel: 'Cerrar',
    onSubmit: () => {},
  });
  $('#dlgForm [data-close]').style.display = 'none';
  $$('#dlgForm [data-action]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    $('#dlg').close();
    (b.dataset.action === 'syncPush' ? syncPush : syncPull)();
  }));
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
      return phoneSyncHTML();
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
  if (FileSync.status === 'error') return `<div class="banner">⚠ No se pudo guardar en tu archivo. <a href="#" data-action="go" data-id="ajustes" data-anchor="respaldo">Ver detalle</a></div>`;
  return '';
}

function footHTML() {
  const f = FileSync;
  const file = f.status === 'ok' ? `✓ Guardado en ${esc(f.handle.name)}${f.lastSaved ? ' · ' + fmtDateTime(f.lastSaved).split(', ').pop() : ''}`
    : f.status === 'paused' ? '⏸ Guardado en archivo en pausa'
    : f.status === 'error' ? '⚠ Error al guardar en archivo'
    : f.status === 'unsupported' ? `OneDrive: ${S.settings.lastSync ? 'sincronizado ' + fmtDateTime(S.settings.lastSync) : 'sin sincronizar'}`
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
  go: (id, el) => go(id, el.dataset.anchor),
  addHolding: () => holdingForm(),
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
    if (t.loanId) return go('cuentas', 'prestamos');
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
    if (t.investment && !h) return toast('Es una compra/venta de inversión: corregí la cantidad desde Inversiones → Editar.', 4500);
    if (await confirmDlg('Eliminar movimiento', `Se va a revertir su efecto en el saldo de la cuenta${h ? ` y en tu cantidad de ${esc(h.symbol)}` : ''}.`)) {
      if (h) undoTrade(h, t.tradeId);
      // Un fijo borrado no se vuelve a registrar solo ese mes
      const r = t.recurringId && S.recurring.find((x) => x.id === t.recurringId);
      if (r) r.skip = [...new Set([...(r.skip || []), t.date.slice(0, 7)])];
      applyTx(t, -1); S.transactions = S.transactions.filter((x) => x !== t); tombstone(t.id); snapshot(); save(); render();
    }
  },
  saveKey: () => { S.settings.finnhubKey = $('#setFinnhub').value.trim(); save(); toast('Clave guardada.'); refreshAll(); },
  copyPrompt: async () => {
    try { await navigator.clipboard.writeText(CHAT_PROMPT); toast('Pedido copiado. Pegalo en tu chat.'); }
    catch (e) { const r = document.createRange(); r.selectNodeContents($('#chatPrompt')); getSelection().removeAllRanges(); getSelection().addRange(r); toast('Seleccionado: copialo con Ctrl+C.'); }
  },
  importHoldings: () => importHoldings($('#importText').value),
  backup: () => backup(),
  demoOn: () => { analysisDemo = true; render(); },
  demoOff: () => { analysisDemo = false; render(); },
  addBudget: () => budgetForm(),
  editBudget: (cat) => budgetForm(cat),
  applyPlan: () => {
    const p = lastAnalysis && planFor(lastAnalysis, Number(S.settings.savingsGoal) || 5);
    if (!p?.rows.length) return;
    const cur = S.settings.localCurrency;
    // Una meta de 0 (ej. intereses) no es un presupuesto: es "no pagar más"
    for (const r of p.rows) if (r.newV > 0.5) S.budgets[r.c] = { amount: roundNice(fromUSD(r.newV, cur)), currency: cur };
    save(); render();
    $('#planBox')?.closest('section')?.nextElementSibling?.scrollIntoView({ block: 'start' });
    toast('Listo: tus metas quedaron como presupuesto mensual.');
  },
  openChat: () => openChat({ listen: true }),
  cloudConnect: () => cloudConnectForm(),
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
  editSched: (id) => scheduledForm(byId(S.scheduled, id)),
  paySched: (id) => paySchedForm(byId(S.scheduled, id)),
  addGoal: () => goalForm(),
  editGoal: (id) => goalForm(byId(S.goals, id)),
  syncPush: () => syncPush(),
  syncPull: () => syncPull(),
  fileLink: () => FileSync.link(),
  fileOpen: () => FileSync.openExisting(),
  fileReconnect: () => FileSync.reconnect(),
  fileUnlink: async () => {
    if (await confirmDlg('Desvincular archivo', 'La app deja de escribir en el archivo (el archivo no se borra). Tus datos siguen en este navegador.', 'Desvincular')) FileSync.unlink();
  },
  resetAll: async () => {
    if (await confirmDlg('Borrar todo', 'Se van a borrar <b>todas</b> tus cuentas, inversiones y movimientos de este navegador. Si tenés un archivo vinculado, se desvincula pero <b>no se borra</b>.', 'Borrar todo')) {
      await FileSync.unlink();
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* nada */ }
      S = migrate(defaultState()); save(false); render(); welcome();
    }
  },
};

function bindEvents() {
  paintIcons();
  $$('.nav-btn[data-view]').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
  // En el celular, Inversiones / Cuentas / Ajustes van dentro de "Más"
  $('#moreBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const m = $('#moreMenu');
    m.innerHTML = ['inversiones', 'cuentas', 'ajustes'].map((v) => `<button data-view="${v}">${icon({ inversiones: 'trending', cuentas: 'wallet', ajustes: 'settings' }[v])}<span>${VIEWS[v]}</span></button>`).join('');
    m.hidden = !m.hidden;
    $$('button', m).forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#moreMenu')) $('#moreMenu').hidden = true; });
  $('#fabBtn').addEventListener('click', () => quickEntry('gasto'));
  // Las secciones "Ver más" recuerdan si las dejaste abiertas y dibujan sus gráficos al abrirse
  $('#content').addEventListener('toggle', (e) => {
    const d = e.target;
    if (d.dataset?.pref) { S.settings[d.dataset.pref] = d.open; save(false); }
    if (d.open) drawCharts();
  }, true);
  // iOS ignora user-scalable=no en Safari: se bloquea el pellizco a mano
  ['gesturestart', 'gesturechange'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  $$('.seg button').forEach((b) => b.addEventListener('click', () => { S.settings.displayCurrency = b.dataset.cur; save(false); render(); }));
  $('#privacyBtn').addEventListener('click', () => { S.settings.privacy = !S.settings.privacy; save(false); render(); });
  $('#refreshBtn').addEventListener('click', () => refreshAll());
  $('#syncBtn').addEventListener('click', () => {
    if (CloudSync.enabled()) CloudSync.sync({ quiet: false }).then(() => toast(CloudSync.status === 'error' ? CloudSync.error : 'Sincronizado ✓'));
    else if (FileSync.status === 'unsupported') syncDialog();
    else if (FileSync.status === 'paused') FileSync.reconnect();
    else go('ajustes', 'respaldo');
  });
  // En pantallas táctiles el tooltip no tiene "mouseleave": se oculta al desplazar
  window.addEventListener('scroll', () => { const tip = $('#tip'); tip.dataset.owner = ''; tip.hidden = true; }, { passive: true });

  const content = $('#content');
  content.addEventListener('click', (e) => {
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

  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => {
    drawCharts();
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
    if (CloudSync.enabled() && !document.querySelector('dialog[open]') && Date.now() - CloudSync.lastPull > 30000) CloudSync.sync().then(() => { processRecurring(); });
  });
}

function welcome() {
  openForm({
    title: '¡Bienvenido a MyFinance!',
    fields: [
      { type: 'html', html: `<p style="margin:0;color:var(--text-2)">La app empieza vacía. Para arrancar: cargá tu efectivo y cuentas en <b>Cuentas</b>, y lo que entra o sale todos los meses (sueldo, alquiler, luz…) en <b>Movimientos → Ingresos y gastos fijos</b>.</p>` },
      { name: 'localCurrency', label: '¿Cuál es tu moneda local?', type: 'select', value: 'BOB', full: true,
        options: CURRENCIES.filter(([c]) => !USD_PEGGED.has(c)).map(([c, n]) => [c, `${c} — ${n}`]) },
      { type: 'html', html: `<div class="small muted">¿Ya usás MyFinance en otro dispositivo?
        <button type="button" class="btn sm" id="welcomeOpen" style="margin-left:6px">${FileSync.supported ? 'Abrir mi archivo' : 'Traer mis datos de OneDrive'}</button></div>` },
    ],
    submitLabel: 'Empezar',
    onSubmit: (v) => {
      const old = S.settings.localCurrency;
      S.settings.localCurrency = v.localCurrency;
      for (const a of S.accounts) if (a.currency === old) a.currency = v.localCurrency;
      save(); render();
      refreshAll({ silent: true });
      setTimeout(() => toast('Tip: tocá − Gasto o + Ingreso para registrar. En Ajustes podés activar la sincronización automática.', 6000), 2800);
    },
  });
  $('#welcomeOpen')?.addEventListener('click', () => { $('#dlg').close(); FileSync.supported ? FileSync.openExisting() : syncPull(); });
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
  // Intereses del día y fijos que ya vencieron (ej. el sueldo del 12)
  if (accrueInterest()) save(false);
  processRecurring();
  render();
  if (!existed && !FileSync.handle && !CloudSync.enabled()) { save(false); Lock.then(welcome); refreshAll({ silent: true }); return; }
  maybeMonthClose();
  const last = S.settings.lastRefresh ? Date.parse(S.settings.lastRefresh) : 0;
  if (Date.now() - last > 10 * 60 * 1000) refreshAll({ silent: true });
  else { snapshot(); save(false); }
})();
