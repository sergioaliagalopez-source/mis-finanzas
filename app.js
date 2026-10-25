'use strict';

/* ============================================================
   Mis Finanzas — finanzas personales e inversiones
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
  efectivo: { label: 'Efectivo', icon: '💵' },
  banco: { label: 'Cuenta bancaria', icon: '🏦' },
  billetera: { label: 'Billetera virtual', icon: '📱' },
  exchange: { label: 'Saldo en exchange / broker', icon: '🔁' },
  debito: { label: 'Tarjeta de débito', icon: '💳' },
  credito: { label: 'Tarjeta de crédito', icon: '💳' },
};

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

const CAT_GASTO = ['Supermercado', 'Comida y salidas', 'Transporte', 'Vivienda / alquiler', 'Servicios', 'Salud', 'Educación',
  'Ocio', 'Compras', 'Suscripciones', 'Viajes', 'Impuestos', 'Pago de tarjeta (intereses)', 'Otros gastos'];
const CAT_INGRESO = ['Sueldo', 'Freelance', 'Dividendos', 'Intereses', 'Venta de algo', 'Regalo', 'Otros ingresos'];

const ARS_TYPES = [['oficial', 'Oficial'], ['bolsa', 'MEP'], ['blue', 'Blue'], ['contadoconliqui', 'CCL'], ['cripto', 'Cripto'], ['tarjeta', 'Tarjeta']];

const VIEWS = { resumen: 'Resumen', inversiones: 'Inversiones', cuentas: 'Cuentas', movimientos: 'Movimientos', analisis: 'Análisis', ajustes: 'Ajustes' };

/* ---------------- Estado ---------------- */

function defaultState() {
  const acc = (name, type, institution, currency) => ({ id: uid(), name, type, institution, currency, balance: 0, last4: '', creditLimit: 0, closingDay: '', dueDay: '', notes: '' });
  const h = (symbol, name, assetType, platform, coingeckoId = '') => ({
    id: uid(), symbol, name, assetType, platform, quantity: 0, avgCost: 0, price: 0,
    change24h: null, priceUpdated: null, priceSource: '', coingeckoId, trades: [],
  });
  return {
    version: 1,
    settings: {
      localCurrency: 'ARS', displayCurrency: 'USD', arsRateType: 'bolsa', autoRates: true,
      rates: { USD: 1 }, ratesUpdated: null, finnhubKey: '', lastRefresh: null,
      lastBackup: null, privacy: false, view: 'resumen', txMonth: '', txAccount: '',
    },
    accounts: [
      acc('Efectivo en dólares', 'efectivo', '', 'USD'),
      acc('Efectivo en pesos', 'efectivo', '', 'ARS'),
      acc('Meru', 'billetera', 'Meru', 'USD'),
      acc('Tarjeta 1', 'credito', '', 'ARS'),
      acc('Tarjeta 2', 'credito', '', 'ARS'),
      acc('Tarjeta 3', 'credito', '', 'ARS'),
    ],
    holdings: [
      h('VOO', 'Vanguard S&P 500 ETF', 'etf', ''),
      h('PAXG', 'PAX Gold (oro tokenizado)', 'oro', 'Binance', 'pax-gold'),
      h('BTC', 'Bitcoin', 'cripto', '', 'bitcoin'),
      h('ETH', 'Ethereum', 'cripto', '', 'ethereum'),
      h('NVDA', 'NVIDIA', 'accion', ''),
      h('GOOGL', 'Alphabet (Google)', 'accion', ''),
    ],
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
  for (const k of ['accounts', 'holdings', 'transactions', 'history']) if (!Array.isArray(s[k])) s[k] = [];
  if (!s.budgets || typeof s.budgets !== 'object' || Array.isArray(s.budgets)) s.budgets = {};
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { S = migrate(JSON.parse(raw)); return true; }
  } catch (e) { console.warn(e); }
  S = defaultState();
  return false;
}

// edit=false para cambios que no son datos tuyos (precios, vista, filtros): no cuentan como "última edición"
function save(edit = true) {
  if (edit) S.editedAt = new Date().toISOString();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('⚠ No se pudo guardar en el navegador. Exportá un respaldo en Ajustes.'); }
  FileSync.schedule();
}

/* ---------------- Monedas ---------------- */

function rate(cur) {
  if (USD_PEGGED.has(cur)) return 1;
  const r = S.settings.rates[cur];
  return r > 0 ? r : null;
}
const toUSD = (amount, cur) => { const r = rate(cur); return r ? (Number(amount) || 0) / r : 0; };
const fromUSD = (usd, cur) => usd * (rate(cur) || 1);
const dispCur = () => (S.settings.displayCurrency === 'LOCAL' ? S.settings.localCurrency : 'USD');

function fmtIn(amount, cur, { sign = false, decimals } = {}) {
  const v = Number(amount) || 0;
  const big = Math.abs(v) >= 100000;
  const opts = { minimumFractionDigits: decimals ?? (big ? 0 : 2), maximumFractionDigits: decimals ?? (big ? 0 : 2) };
  if (sign) opts.signDisplay = 'exceptZero';
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
  return { liquid, debt, inv, cost, invWithCost, netWorth: liquid + inv - debt, alloc };
}

function txUSD(t) {
  const acc = S.accounts.find((a) => a.id === t.accountId);
  return toUSD(t.amount, acc?.currency || t.currency || 'USD');
}

function monthStats(month, txs = S.transactions) {
  let income = 0, expense = 0;
  const byCat = {}, incomeCats = {};
  for (const t of txs) {
    if (!t.date?.startsWith(month) || t.investment || t.type === 'transferencia') continue;
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
        for (const [code] of CURRENCIES) if (j.rates[code] && !USD_PEGGED.has(code)) S.settings.rates[code] = j.rates[code];
        S.settings.ratesUpdated = now;
      }
    } catch (e) { notes.push('tipos de cambio no disponibles'); }
    if (S.settings.localCurrency === 'ARS' || S.accounts.some((a) => a.currency === 'ARS')) {
      try {
        const d = await getJSON(`https://dolarapi.com/v1/dolares/${S.settings.arsRateType || 'bolsa'}`);
        if (d && d.venta > 0) { S.settings.rates.ARS = d.venta; S.settings.ratesUpdated = now; }
      } catch (e) { notes.push('dólar ARS no disponible'); }
    }
  }

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
function toast(msg, ms = 2600) {
  const el = $('#toast');
  el.textContent = msg;
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
  return (cur === 'USD' ? 'US$' : '$') + n.replace('.', ',');
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
  const ms = monthStats(currentMonth());
  const monthName = new Date().toLocaleDateString('es-AR', { month: 'long' });
  const prev = [...S.history].reverse().find((r) => r.date < todayISO());
  const delta = prev ? t.netWorth - prev.netWorth : null;
  const gp = t.invWithCost - t.cost;
  const missing = missingRates();
  const stale = FileSync.status === 'none' && hasData();
  const syncDays = S.settings.lastSync ? (Date.now() - Date.parse(S.settings.lastSync)) / 864e5 : Infinity;
  const phoneStale = FileSync.status === 'unsupported' && hasData() && syncDays > 3;

  const holdings = [...S.holdings].sort((a, b) => holdingValue(b) - holdingValue(a));
  const accounts = [...S.accounts].sort((a, b) => Math.abs(toUSD(b.balance, b.currency)) - Math.abs(toUSD(a.balance, a.currency)));

  return `
  ${missing.length ? `<div class="banner">Falta el tipo de cambio de ${missing.join(', ')}. Tocá <b>Actualizar</b> o cargalo en <a href="#" data-action="go" data-id="ajustes">Ajustes</a>.</div>` : ''}
  ${stale ? `<div class="banner">Tus datos viven sólo en este navegador. <a href="#" data-action="fileLink">Activá el guardado automático en OneDrive</a> para no perderlos.</div>` : ''}
  ${phoneStale ? `<div class="banner">${S.settings.lastSync ? `Hace ${Math.floor(syncDays)} días que no guardás en OneDrive.` : 'Todavía no guardaste tus datos en OneDrive.'} <a href="#" data-action="syncPush">Guardar ahora</a></div>` : ''}
  <section class="card hero">
    <div class="label">Patrimonio neto</div>
    <div class="hero-value money">${fmtMoney(t.netWorth)}</div>
    <div class="sub"><span class="money">≈ ${fmtMoney(t.netWorth, { cur: other })}</span>
      ${delta != null ? ` · <span class="${cls(delta)} money">${arrow(delta)}${fmtMoney(delta, { sign: true })}</span> desde el ${fmtDate(prev.date)}` : ''}</div>
  </section>
  <div class="tiles">
    ${tile('Liquidez', fmtMoney(t.liquid), 'Efectivo, bancos y billeteras')}
    ${tile('Inversiones', fmtMoney(t.inv), t.cost > 0 ? `<span class="${cls(gp)}">${arrow(gp)}${fmtMoney(gp, { sign: true })} (${fmtPct((gp / t.cost) * 100)})</span>` : `${S.holdings.length} activos`)}
    ${tile('Deuda de tarjetas', fmtMoney(t.debt), `${S.accounts.filter((a) => a.type === 'credito').length} tarjeta(s) de crédito`)}
    ${tile(`Gastos de ${monthName}`, fmtMoney(ms.expense), `Ingresos: <span class="money">${fmtMoney(ms.income)}</span>`)}
  </div>
  <div class="grid-2">
    <section class="card"><div class="card-head"><h2>Distribución de tu patrimonio</h2></div>${allocChart(t)}</section>
    <section class="card"><div class="card-head"><h2>Evolución del patrimonio</h2><span class="muted small">${dispCur()}</span></div><div id="nwChart" class="line-chart"></div></section>
  </div>
  <div class="grid-2">
    <section class="card"><div class="card-head"><h2>Posiciones</h2><a href="#" data-action="go" data-id="inversiones" class="small">Ver todo</a></div>
      <div class="list">${holdings.map((h) => `
        <div class="list-row">
          <div class="grow"><div class="name">${esc(h.symbol)} <span class="muted small">${esc(h.name)}</span></div>
          <div class="meta">${fmtNum(h.quantity)} · ${h.change24h != null ? `<span class="${cls(h.change24h)}">${fmtPct(h.change24h)} 24h</span>` : 'sin variación'}</div></div>
          <div class="val"><div class="money">${fmtMoney(holdingValue(h))}</div><div class="meta">${t.inv ? fmtPct((holdingValue(h) / t.inv) * 100, false) : '—'}</div></div>
        </div>`).join('') || '<div class="empty">Sin inversiones</div>'}</div></section>
    <section class="card"><div class="card-head"><h2>Cuentas</h2><a href="#" data-action="go" data-id="cuentas" class="small">Ver todo</a></div>
      <div class="list">${accounts.map((a) => `
        <div class="list-row">
          <span>${ACCOUNT_TYPES[a.type]?.icon || '•'}</span>
          <div class="grow"><div class="name">${esc(a.name)}</div><div class="meta">${esc(ACCOUNT_TYPES[a.type]?.label)}${a.institution ? ' · ' + esc(a.institution) : ''}</div></div>
          <div class="val"><div class="money ${a.type === 'credito' && Number(a.balance) > 0 ? 'down' : ''}">${a.type === 'credito' && Number(a.balance) > 0 ? '−' : ''}${fmtIn(a.balance, a.currency)}</div>
          ${a.currency !== dispCur() ? `<div class="meta money">≈ ${fmtMoney(toUSD(a.balance, a.currency))}</div>` : ''}</div>
        </div>`).join('') || '<div class="empty">Sin cuentas</div>'}</div></section>
  </div>`;
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
      <div class="acc-top"><div class="acc-ico">${ACCOUNT_TYPES[a.type]?.icon || '•'}</div>
        <div style="flex:1;min-width:0"><div class="name" style="font-weight:600">${esc(a.name)}</div>
        <div class="muted small">${esc(a.institution || 'Sin entidad')}${a.last4 ? ' · •••• ' + esc(a.last4) : ''} · ${esc(a.currency)}</div></div></div>
      <div><div class="muted small">${isCredit ? 'Deuda actual' : 'Saldo'}</div>
        <div class="acc-bal money ${isCredit && bal > 0 ? 'down' : ''}">${fmtIn(bal, a.currency)}</div>${usdEq}</div>
      ${extra}
      ${a.notes ? `<div class="muted small">${esc(a.notes)}</div>` : ''}
      <div class="row-actions" style="justify-content:flex-start">
        <button class="btn sm" data-action="setBalance" data-id="${a.id}">${isCredit ? 'Actualizar deuda' : 'Actualizar saldo'}</button>
        ${isCredit ? `<button class="btn sm" data-action="payCard" data-id="${a.id}">Pagar</button>` : ''}
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
  <div class="toolbar"><span class="muted small">Por seguridad guardá sólo los últimos 4 dígitos de cada tarjeta.</span><span class="spacer"></span>
    <button class="btn primary" data-action="addAccount">+ Agregar cuenta o tarjeta</button></div>
  ${groups.map(([k, info, list]) => `<div class="acc-group"><h3>${info.label}</h3><div class="acc-grid">${list.map(card).join('')}</div></div>`).join('')
    || '<div class="empty">No tenés cuentas cargadas.</div>'}`;
}

function viewMovimientos() {
  const month = S.settings.txMonth || currentMonth();
  const accFilter = S.settings.txAccount || '';
  const ms = monthStats(month);
  const cats = Object.entries(ms.byCat).sort((a, b) => b[1] - a[1]);
  const list = S.transactions
    .filter((t) => t.date?.startsWith(month) && (!accFilter || t.accountId === accFilter || t.toAccountId === accFilter))
    .sort((a, b) => (b.date + b.created).localeCompare(a.date + a.created));
  const accName = (id) => esc(S.accounts.find((a) => a.id === id)?.name || '(cuenta eliminada)');
  const accCur = (id) => S.accounts.find((a) => a.id === id)?.currency || 'USD';
  const bal = ms.income - ms.expense;
  return `
  <div class="toolbar">
    <input type="month" id="txMonth" value="${month}">
    <select id="txAccount"><option value="">Todas las cuentas</option>${S.accounts.map((a) => `<option value="${a.id}" ${a.id === accFilter ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>
    <span class="spacer"></span>
    <button class="btn" data-action="addTx" data-id="ingreso">+ Ingreso</button>
    <button class="btn" data-action="addTx" data-id="transferencia">⇄ Transferencia</button>
    <button class="btn primary" data-action="addTx" data-id="gasto">+ Gasto</button>
  </div>
  <div class="tiles">
    ${tile('Ingresos del mes', fmtMoney(ms.income))}
    ${tile('Gastos del mes', fmtMoney(ms.expense))}
    ${tile('Ahorro del mes', `<span class="${cls(bal)}">${fmtMoney(bal, { sign: true })}</span>`, ms.income ? `Tasa de ahorro ${fmtPct((bal / ms.income) * 100, false)}` : '')}
    ${tile('Movimientos', String(list.length), 'En el período')}
  </div>
  <div class="grid-2">
    <section class="card"><div class="card-head"><h2>Gastos por categoría</h2></div>${hbars(cats, ms.expense)}</section>
    <section class="card"><div class="card-head"><h2>Cómo funciona</h2><a href="#" data-action="go" data-id="analisis" class="small">Ver análisis y sugerencias →</a></div>
      <div class="small" style="color:var(--text-2)">
      <p style="margin-top:0">Cada movimiento ajusta el saldo de la cuenta automáticamente.</p>
      <p>• Un <b>gasto con tarjeta de crédito</b> suma a la deuda de esa tarjeta.<br>
      • Para <b>pagar la tarjeta</b>, usá “Pagar” en Cuentas (o una transferencia de tu banco a la tarjeta).<br>
      • Las compras/ventas de inversiones no cuentan como gasto ni ingreso.<br>
      • Los montos de otras monedas se convierten con el tipo de cambio actual.</p></div></section>
  </div>
  <section class="card"><div class="card-head"><h2>Movimientos</h2></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Detalle</th><th>Cuenta</th><th>Categoría</th><th class="num">Monto</th><th></th></tr></thead>
      <tbody>${list.map((t) => {
        const sign = t.type === 'ingreso' ? 1 : t.type === 'gasto' ? -1 : 0;
        const cur = accCur(t.accountId);
        return `<tr>
          <td>${fmtDate(t.date)}</td>
          <td>${esc(t.note || (t.type === 'transferencia' ? 'Transferencia' : t.category))}${t.investment ? ' <span class="tag">inversión</span>' : ''}</td>
          <td>${accName(t.accountId)}${t.type === 'transferencia' ? ` → ${accName(t.toAccountId)}` : ''}</td>
          <td>${t.type === 'transferencia' ? '<span class="tag">Transferencia</span>' : esc(t.category || '')}</td>
          <td class="num money ${sign > 0 ? 'up' : ''}">${sign > 0 ? '+' : sign < 0 ? '−' : ''}${fmtIn(t.amount, cur)}</td>
          <td><div class="row-actions"><button class="btn sm ghost" data-action="editTx" data-id="${t.id}">Editar</button>
          <button class="btn sm ghost danger" data-action="delTx" data-id="${t.id}" title="Eliminar">✕</button></div></td></tr>`;
      }).join('') || `<tr><td colspan="6" class="empty">No hay movimientos en este período.</td></tr>`}</tbody>
    </table></div></section>`;
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
  return `
  <div class="settings-grid">
    <section class="card" id="respaldo">
      <h2 style="margin-bottom:8px">${FileSync.supported ? 'Guardado automático en OneDrive' : 'Sincronizar con OneDrive'}</h2>
      <div id="fileSync">${fileSyncHTML()}</div>
      <hr style="border:0;border-top:1px solid var(--grid);margin:18px 0">
      <h2 style="margin-bottom:8px">Respaldo manual</h2>
      <p class="small" style="color:var(--text-2);margin-top:0">Todo se guarda solo en este navegador mientras usás la app. Además podés descargar una copia con fecha cuando quieras.</p>
      <p class="small">Último respaldo manual: <b>${fmtDateTime(s.lastBackup)}</b></p>
      <div class="toolbar">
        <button class="btn primary" data-action="backup">Exportar respaldo (.json)</button>
        <label class="btn">Restaurar respaldo<input type="file" id="restoreFile" accept=".json,application/json" hidden></label>
      </div>
      <hr style="border:0;border-top:1px solid var(--grid);margin:18px 0">
      <h2 style="margin-bottom:8px">Zona peligrosa</h2>
      <button class="btn danger" data-action="resetAll">Borrar todos los datos</button>
    </section>
    <section class="card">
      <h2 style="margin-bottom:14px">Monedas</h2>
      <div class="form-row"><label for="setLocal">Tu moneda local</label>
        <select id="setLocal">${CURRENCIES.filter(([c]) => !USD_PEGGED.has(c)).map(([c, n]) => `<option value="${c}" ${c === s.localCurrency ? 'selected' : ''}>${c} — ${n}</option>`).join('')}</select></div>
      ${used.includes('ARS') ? `<div class="form-row"><label for="setArsType">Dólar para convertir pesos argentinos</label>
        <select id="setArsType">${ARS_TYPES.map(([v, l]) => `<option value="${v}" ${v === s.arsRateType ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <span class="hint">Se toma el valor de venta de dolarapi.com.</span></div>` : ''}
      <div class="form-row"><label><input type="checkbox" id="setAutoRates" ${s.autoRates ? 'checked' : ''}> Actualizar tipos de cambio automáticamente</label>
        <span class="hint">Desactivalo si preferís cargarlos a mano. Última actualización: ${fmtDateTime(s.ratesUpdated)}</span></div>
      <table class="rates-table"><thead><tr><th>Moneda</th><th class="num">Unidades por 1 USD</th></tr></thead><tbody>
        ${used.map((c) => `<tr><td>${c}</td><td class="num"><input type="text" inputmode="decimal" data-rate="${c}" value="${numInput(s.rates[c])}" placeholder="ej. 1250"></td></tr>`).join('') || '<tr><td colspan="2" class="muted">Sólo usás dólares.</td></tr>'}
      </tbody></table>
    </section>

    <section class="card">
      <h2 style="margin-bottom:14px">Precios automáticos</h2>
      <p class="small" style="color:var(--text-2);margin-top:0">Cripto y oro tokenizado (BTC, ETH, PAXG…) se actualizan solos con CoinGecko.
      Para acciones y ETF (VOO, NVDA, GOOGL) necesitás una clave gratuita de <b>Finnhub</b>:</p>
      <ol class="small" style="color:var(--text-2);padding-left:18px">
        <li>Entrá a <a href="https://finnhub.io/register" target="_blank" rel="noopener">finnhub.io/register</a> y creá una cuenta gratis.</li>
        <li>Copiá tu “API key” del panel.</li><li>Pegala acá y tocá Guardar.</li></ol>
      <div class="form-row"><label for="setFinnhub">Clave de Finnhub</label>
        <input type="password" id="setFinnhub" value="${esc(s.finnhubKey)}" placeholder="Pegá tu API key" autocomplete="off">
        <span class="hint">Se guarda sólo en este navegador.</span></div>
      <button class="btn primary" data-action="saveKey">Guardar clave</button>
    </section>

    <section class="card" id="importar">
      <h2 style="margin-bottom:8px">Importar mi portafolio desde mi chat</h2>
      <p class="small" style="color:var(--text-2);margin-top:0">1. Copiá este pedido y pegalo en el chat donde tenés la info de tu portafolio.<br>
      2. Pegá abajo el JSON que te devuelva y tocá Importar. Actualiza los activos que ya existen y agrega los nuevos.</p>
      <div class="prompt-box" id="chatPrompt">${esc(CHAT_PROMPT)}</div>
      <div class="toolbar" style="margin:10px 0 14px"><button class="btn" data-action="copyPrompt">Copiar pedido</button></div>
      <textarea id="importText" placeholder='[{"symbol":"VOO","quantity":1.5,"avgCost":480,"platform":"broker"}]'></textarea>
      <div class="toolbar" style="margin-top:10px"><button class="btn primary" data-action="importHoldings">Importar</button></div>
    </section>
  </div>`;
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
    if (t.type !== 'gasto' || t.investment || !months.some((m) => t.date?.startsWith(m))) continue;
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
  const hasReal = S.transactions.some((t) => !t.investment && t.type !== 'transferencia');
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

/* ---------------- Render ---------------- */

function render() {
  const v = VIEWS[S.settings.view] ? S.settings.view : 'resumen';
  $$('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
  $('#viewTitle').textContent = VIEWS[v];
  document.title = `${VIEWS[v]} · Mis Finanzas`;
  const content = $('#content');
  content.innerHTML = fileBannerHTML() + { resumen: viewResumen, inversiones: viewInversiones, cuentas: viewCuentas, movimientos: viewMovimientos, analisis: viewAnalisis, ajustes: viewAjustes }[v]();
  if (v === 'resumen') drawLine($('#nwChart'), S.history);
  if (v === 'analisis' && lastAnalysis) drawBars($('#barsChart'), lastAnalysis.per);
  $('#curLocalBtn').textContent = S.settings.localCurrency;
  $$('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.cur === S.settings.displayCurrency));
  document.body.classList.toggle('privado', !!S.settings.privacy);
  $('#lastRefresh').innerHTML = footHTML();
  $('#tip').hidden = true;
}

function go(view, anchor) {
  S.settings.view = view;
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
      if (v.side === 'compra') {
        const newQ = q + v.qty;
        h.avgCost = ((q * (Number(h.avgCost) || 0)) + v.qty * v.price) / newQ;
        h.quantity = newQ;
      } else {
        h.quantity = Math.max(0, q - v.qty);
      }
      h.trades = h.trades || [];
      h.trades.push({ date: v.date, side: v.side, qty: v.qty, price: v.price });
      if (v.accountId) {
        const acc = S.accounts.find((a) => a.id === v.accountId);
        const amount = round2(fromUSD(v.qty * v.price, acc.currency));
        const tx = {
          id: uid(), created: new Date().toISOString(), date: v.date, type: v.side === 'compra' ? 'gasto' : 'ingreso',
          accountId: acc.id, amount, category: v.side === 'compra' ? 'Compra de inversión' : 'Venta de inversión',
          note: `${v.side === 'compra' ? 'Compra' : 'Venta'} ${fmtNum(v.qty)} ${h.symbol}`, investment: true,
        };
        S.transactions.push(tx);
        applyTx(tx, 1);
      }
      snapshot(); save(); render();
      toast(`${v.side === 'compra' ? 'Compra' : 'Venta'} de ${h.symbol} registrada.`);
    },
  });
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
      { name: 'notes', label: 'Notas', value: a.notes, full: true, placeholder: 'Opcional' },
    ],
    onSubmit: (v) => {
      if (v.last4 && !/^\d{4}$/.test(v.last4)) return 'Los últimos dígitos tienen que ser exactamente 4 números.';
      const changes = {
        type: v.type, name: v.name, institution: v.institution, currency: v.currency,
        balance: (v.type === 'credito' ? v.debt : v.balance) || 0,
        last4: isCard(v) ? v.last4 : '', creditLimit: v.type === 'credito' ? (v.creditLimit || 0) : 0,
        closingDay: v.type === 'credito' ? v.closingDay : '', dueDay: v.type === 'credito' ? v.dueDay : '', notes: v.notes,
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
  t = t || { type, date: todayISO(), accountId: S.settings.txAccount || accs[0].id, toAccountId: '', amount: '', toAmount: '', category: '', note: '' };
  const accOpts = accs.map((a) => [a.id, `${a.name} (${a.currency})`]);
  const curOf = (id) => accs.find((a) => a.id === id)?.currency;
  const titles = { ingreso: 'ingreso', gasto: 'gasto', transferencia: 'transferencia' };
  openForm({
    title: `${isNew ? 'Nuevo' : 'Editar'} ${titles[t.type]}`,
    fields: [
      { name: 'type', label: 'Tipo', type: 'select', value: t.type, options: [['gasto', 'Gasto'], ['ingreso', 'Ingreso'], ['transferencia', 'Transferencia / pago de tarjeta']] },
      { name: 'date', label: 'Fecha', type: 'date', value: t.date },
      { name: 'accountId', label: 'Cuenta', type: 'select', value: t.accountId, options: accOpts },
      { name: 'toAccountId', label: 'Hacia la cuenta', type: 'select', value: t.toAccountId || accs.find((a) => a.id !== t.accountId)?.id, options: accOpts, showIf: (v) => v.type === 'transferencia' },
      { name: 'amount', label: 'Monto', type: 'number', value: t.amount, required: true },
      { name: 'toAmount', label: 'Monto que llega', type: 'number', value: t.toAmount, hint: 'Las cuentas tienen distinta moneda.',
        showIf: (v) => v.type === 'transferencia' && curOf(v.accountId) !== curOf(v.toAccountId) },
      { name: 'catGasto', label: 'Categoría', type: 'select', value: t.category, options: CAT_GASTO.map((c) => [c, c]), showIf: (v) => v.type === 'gasto' },
      { name: 'catIngreso', label: 'Categoría', type: 'select', value: t.category, options: CAT_INGRESO.map((c) => [c, c]), showIf: (v) => v.type === 'ingreso' },
      { name: 'note', label: 'Detalle', value: t.note, full: true, placeholder: 'ej. Supermercado Coto, sueldo octubre…' },
    ],
    onInput: (form, v, changed) => {
      if (!['amount', 'accountId', 'toAccountId', 'type'].includes(changed)) return;
      const c1 = curOf(v.accountId), c2 = curOf(v.toAccountId);
      if (v.type === 'transferencia' && c1 !== c2 && v.amount > 0) form.elements.toAmount.value = numInput(round2(fromUSD(toUSD(v.amount, c1), c2)));
    },
    onSubmit: (v) => {
      if (!(v.amount > 0)) return 'El monto tiene que ser mayor a 0.';
      if (v.type === 'transferencia' && v.accountId === v.toAccountId) return 'Elegí dos cuentas distintas.';
      const sameCur = curOf(v.accountId) === curOf(v.toAccountId);
      const next = {
        type: v.type, date: v.date || todayISO(), accountId: v.accountId, amount: v.amount,
        toAccountId: v.type === 'transferencia' ? v.toAccountId : '',
        toAmount: v.type === 'transferencia' && !sameCur ? (v.toAmount || 0) : '',
        category: v.type === 'gasto' ? v.catGasto : v.type === 'ingreso' ? v.catIngreso : '', note: v.note,
      };
      if (isNew) {
        const tx = { id: uid(), created: new Date().toISOString(), ...next };
        S.transactions.push(tx); applyTx(tx, 1);
      } else {
        applyTx(t, -1); Object.assign(t, next); applyTx(t, 1);
      }
      S.settings.txMonth = next.date.slice(0, 7);
      snapshot(); save(); render();
    },
  });
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
      const paid = round2(fromUSD(toUSD(v.amount, card.currency), from.currency));
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
    navigator.share({ files: [file], title: 'Mis Finanzas' }).then(done).catch((e) => {
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
    try { data = JSON.parse(r.result); } catch (e) { return toast('Ese archivo no es de Mis Finanzas.'); }
    if (!isValidData(data)) return toast('Ese archivo no es de Mis Finanzas.');
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
    } catch (e) { toast('El archivo no es un respaldo válido de Mis Finanzas.'); }
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

const FILE_TYPES = [{ description: 'Datos de Mis Finanzas', accept: { 'application/json': ['.json'] } }];
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
        `<b>${esc(h.name)}</b> ya tiene datos de Mis Finanzas (última edición: ${fmtDateTime(data.editedAt)}). ¿Qué querés hacer?`,
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
      if (!isValidData(data)) return toast('Ese archivo no es de Mis Finanzas.');
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
  return `Precios: ${fmtDateTime(S.settings.lastRefresh)}<br>${file}`;
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
      S.holdings = S.holdings.filter((x) => x !== h); snapshot(); save(); render();
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
      S.accounts = S.accounts.filter((x) => x !== a); snapshot(); save(); render();
    }
  },
  addTx: (type) => txForm(type),
  editTx: (id) => txForm(null, byId(S.transactions, id)),
  delTx: async (id) => {
    const t = byId(S.transactions, id);
    if (await confirmDlg('Eliminar movimiento', 'Se va a revertir su efecto en el saldo de la cuenta.')) {
      applyTx(t, -1); S.transactions = S.transactions.filter((x) => x !== t); snapshot(); save(); render();
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
      S = defaultState(); save(false); render(); welcome();
    }
  },
};

function bindEvents() {
  $$('.nav-btn').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
  $$('.seg button').forEach((b) => b.addEventListener('click', () => { S.settings.displayCurrency = b.dataset.cur; save(false); render(); }));
  $('#privacyBtn').addEventListener('click', () => { S.settings.privacy = !S.settings.privacy; save(false); render(); });
  $('#refreshBtn').addEventListener('click', () => refreshAll());
  $('#syncBtn').addEventListener('click', () => {
    if (FileSync.status === 'unsupported') syncDialog();
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
    if (S.settings.view === 'resumen') drawLine($('#nwChart'), S.history);
    if (S.settings.view === 'analisis' && lastAnalysis) drawBars($('#barsChart'), lastAnalysis.per);
  }, 150); });
  window.addEventListener('storage', (e) => { if (e.key === STORE_KEY) { load(); render(); } });
  // Si cerrás o cambiás de pestaña con un guardado pendiente, se escribe ya
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && FileSync.timer) FileSync.write(); });
}

function welcome() {
  openForm({
    title: '¡Bienvenido a Mis Finanzas!',
    fields: [
      { type: 'html', html: `<p style="margin:0;color:var(--text-2)">Ya cargué tu portafolio (<b>VOO, PAXG, BTC, ETH, NVDA, GOOGL</b>), efectivo, Meru y 3 tarjetas de ejemplo. Sólo falta que pongas cantidades y saldos.</p>` },
      { name: 'localCurrency', label: '¿Cuál es tu moneda local?', type: 'select', value: 'ARS', full: true,
        options: CURRENCIES.filter(([c]) => !USD_PEGGED.has(c)).map(([c, n]) => [c, `${c} — ${n}`]) },
      { type: 'html', html: `<div class="small muted">¿Ya usás Mis Finanzas en otro dispositivo?
        <button type="button" class="btn sm" id="welcomeOpen" style="margin-left:6px">${FileSync.supported ? 'Abrir mi archivo' : 'Traer mis datos de OneDrive'}</button></div>` },
    ],
    submitLabel: 'Empezar',
    onSubmit: (v) => {
      const old = S.settings.localCurrency;
      S.settings.localCurrency = v.localCurrency;
      for (const a of S.accounts) if (a.currency === old) a.currency = v.localCurrency;
      const cashLocal = S.accounts.find((a) => a.name === 'Efectivo en pesos');
      if (cashLocal && !['ARS', 'MXN', 'COP', 'CLP', 'UYU'].includes(v.localCurrency)) cashLocal.name = `Efectivo en ${v.localCurrency}`;
      save(); render();
      refreshAll({ silent: true });
      setTimeout(() => toast('Tip: en Ajustes podés activar el guardado en OneDrive e importar tus cantidades desde tu chat.', 6000), 2800);
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
  bindEvents();
  render();
  // Primero se compara con el archivo vinculado, así nunca se pisa una versión más nueva
  try { await FileSync.init(); } catch (e) { console.warn(e); }
  render();
  if (!existed && !FileSync.handle) { save(false); welcome(); return; }
  const last = S.settings.lastRefresh ? Date.parse(S.settings.lastRefresh) : 0;
  if (Date.now() - last > 10 * 60 * 1000) refreshAll({ silent: true });
  else { snapshot(); save(false); }
})();
