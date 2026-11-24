'use strict';
const API = window.LICENCIAS_API || '';
const URL_PANEL = 'https://puntofibra.github.io/licencias/';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
let TOKEN = localStorage.getItem('lic_token') || '';
let D = null, vista = 'inicio', filtro = 'todas', busca = '', fApp = '';

/* ---------- iconos ---------- */
const P = {
  inicio:'<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>', lic:'<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3M14 9l2 2"/>',
  apps:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  pagos:'<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6 15h4"/>', act:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  aj:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.5a7 7 0 0 0-2.2 1.3l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.2 1.3L10 21h4l.4-2.5a7 7 0 0 0 2.2-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z"/>',
  mas:'<path d="M12 5v14M5 12h14"/>', bor:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', copia:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>', wa:'<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.3 3.2z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/>',
  rec:'<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>', sal:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  juego:'<path d="M7 9h10a4 4 0 0 1 4 4v1.5a2.5 2.5 0 0 1-4.6 1.4L15 14H9l-1.4 1.9A2.5 2.5 0 0 1 3 14.5V13a4 4 0 0 1 4-4z"/><path d="M8 11.5v3M6.5 13h3"/><circle cx="15.5" cy="12.5" r=".6"/><circle cx="17.5" cy="13.8" r=".6"/>',
  web:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>', scr:'<path d="m8 8-5 4 5 4M16 8l5 4-5 4M13.5 5l-3 14"/>',
  inst:'<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>', comp:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 11 7.6-3.9M8.2 13l7.6 3.9"/>',
  nfc:'<path d="M6 8.5a8 8 0 0 1 0 7M10 6a12 12 0 0 1 0 12M14 3.5a16 16 0 0 1 0 17"/>', caja:'<path d="M3 8 12 3l9 5v8l-9 5-9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  hoja:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>'
};
const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;
const ESCUDO = '<svg viewBox="0 0 24 24" fill="none" stroke="#3df5ff" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6z"/><circle cx="12" cy="10.5" r="2.2"/><path d="M12 12.7V16"/></svg>';

/* ---------- API ---------- */
let cargas = 0;
async function api(a, d) {
  cargas++; $('#carga').hidden = false;
  try {
    const r = await fetch(API, { method:'POST', redirect:'follow', headers:{ 'Content-Type':'text/plain;charset=utf-8' }, body:JSON.stringify(Object.assign({ a, t:TOKEN }, d || {})) });
    const j = await r.json();
    if (j.sesion === false) salir(true);
    if (j.datos) D = j.datos;
    return j;
  } catch (e) { return { ok:false, error:'Sin conexión con el servidor' }; }
  finally { if (--cargas <= 0) { cargas = 0; $('#carga').hidden = true; } }
}

/* ---------- efectos ---------- */
function toast(t, mal) { const d = document.createElement('div'); d.className = 'toast' + (mal ? ' mal' : ''); d.textContent = t; $('#toasts').appendChild(d); setTimeout(() => d.remove(), 3000); bip(mal ? 220 : 880); }
let actx;
function bip(f, dur) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime; dur = dur || .09; o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + dur); g.gain.setValueAtTime(.035, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .05); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + .2); } catch (e) {} }
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('.btn'); if (!b) return;
  const r = b.getBoundingClientRect(), s = document.createElement('span'), z = Math.max(r.width, r.height);
  s.className = 'rip'; s.style.cssText = `width:${z}px;height:${z}px;left:${e.clientX - r.left - z / 2}px;top:${e.clientY - r.top - z / 2}px`;
  b.appendChild(s); setTimeout(() => s.remove(), 600);
});
document.addEventListener('pointermove', e => {
  const c = e.target.closest && e.target.closest('.card'); if (!c || e.pointerType !== 'mouse') return;
  const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
  if (c.classList.contains('tilt') && !c.classList.contains('coge')) c.style.transform = `perspective(900px) rotateX(${(.5 - y) * 5}deg) rotateY(${(x - .5) * 6}deg) translateY(-3px)`;
});
document.addEventListener('pointerout', e => { const c = e.target.closest && e.target.closest('.card.tilt'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
function chispas(x, y, col) {
  col = col || '#2bff9a';
  for (let i = 0; i < 22; i++) { const s = document.createElement('i'); s.className = 'chispa'; const a = Math.random() * 6.28, d = 40 + Math.random() * 90;
    s.style.cssText = `left:${x}px;top:${y}px;background:${col};box-shadow:0 0 10px ${col}`; document.body.appendChild(s);
    s.animate([{ transform:'translate(0,0) scale(1)', opacity:1 }, { transform:`translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(0)`, opacity:0 }], { duration:650 + Math.random() * 350, easing:'cubic-bezier(.1,.8,.3,1)' }).onfinish = () => s.remove(); }
}
function cuenta(el) { const fin = +el.dataset.n, dec = el.dataset.d ? 2 : 0, suf = el.dataset.s || '', t0 = performance.now();
  (function p(t) { const k = Math.min(1, (t - t0) / 900), v = fin * (1 - Math.pow(1 - k, 3)); el.textContent = (dec ? v.toFixed(2).replace('.', ',') : Math.round(v)) + suf; if (k < 1) requestAnimationFrame(p); })(t0); }
(function fondo() {
  const c = $('#fx'), x = c.getContext('2d'); let W, H, ps = [];
  const rs = () => { W = c.width = innerWidth; H = c.height = innerHeight; const n = Math.min(70, Math.round(W * H / 22000)); ps = Array.from({ length:n }, () => ({ x:Math.random() * W, y:Math.random() * H, vx:(Math.random() - .5) * .25, vy:(Math.random() - .5) * .25, r:Math.random() * 1.6 + .4 })); };
  rs(); addEventListener('resize', rs);
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  (function f() { if (!document.hidden) { x.clearRect(0, 0, W, H);
    for (const p of ps) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; x.fillStyle = 'rgba(125,249,255,.7)'; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.28); x.fill(); }
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { const a = ps[i], b = ps[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 130) { x.strokeStyle = `rgba(125,249,255,${.13 * (1 - d / 130)})`; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); } } }
    requestAnimationFrame(f); })();
})();

/* ---------- modal ---------- */
function modal(html) { cierra(); const m = $('#modal'); m.innerHTML = `<div class="hoja">${html}</div>`; m.hidden = false; modal.sucio = false; m.oninput = () => { modal.sucio = true; };
  m.onclick = e => { if (e.target.closest('.x')) return cierra(); if (e.target === m) return fuera(); if (e.target.closest('form')) modal.sucio = true; }; return m.firstElementChild; }
// pinchar fuera (o Escape) no cierra una ventana en la que ya has empezado a escribir
function fuera() { if (!modal.sucio) return cierra(); const h = $('#modal .hoja');
  if (h) h.animate([{ transform:'translateX(0)' }, { transform:'translateX(-9px)' }, { transform:'translateX(9px)' }, { transform:'translateX(0)' }], { duration:300 });
  toast('Tienes cambios sin guardar. Pulsa ✕ para salir sin guardar', true); }
function cierra() { $('#modal').hidden = true; $('#modal').innerHTML = ''; if (cierra.fn) { const f = cierra.fn; cierra.fn = null; f(); } }
function confirma(tit, txt, boton) { return new Promise(res => { const h = modal(`<h3>${esc(tit)}<button class="x">✕</button></h3><p class="ds">${esc(txt)}</p><div class="bts"><button class="btn" id="cNo">Cancelar</button><button class="btn mal" id="cSi">${esc(boton || 'Eliminar')}</button></div>`);
  let hecho = false; cierra.fn = () => { if (!hecho) res(false); };
  h.querySelector('#cNo').onclick = () => cierra(); h.querySelector('#cSi').onclick = () => { hecho = true; cierra(); res(true); }; }); }
async function copia(t, msg) { try { await navigator.clipboard.writeText(t); } catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); } toast(msg || 'Copiado'); }
function qrHtml(t) { const q = qrcode(0, 'M'); q.addData(t); q.make(); return `<div class="qr">${q.createSvgTag({ cellSize:4, margin:0, scalable:true })}</div>`; }
function baja(nombre, txt) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type:'text/javascript' })); a.download = nombre; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }

/* ---------- formato ---------- */
const eur = n => (Math.round((+n || 0) * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits:(+n % 1) ? 2 : 0, maximumFractionDigits:2 }) + ' €';
const fecha = f => f ? f.slice(0, 10).split('-').reverse().join('/') : '—';
const num = (v, d) => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? d : n; };
const idsDe = v => String(v || '').split(',').map(x => x.trim()).filter(Boolean);
const app1 = id => D.apps.find(a => a.id === id) || { id, nombre:id, tipo:'web', precio:0, url:'' };
// una licencia puede ser de una app o un pack (varias apps con un solo pago y vencimiento)
const appDe = v => { const ids = idsDe(v); if (ids.length < 2) return app1(ids[0] || ''); const as = ids.map(app1);
  return { id:ids.join(','), nombre:'Pack · ' + ids.length + ' apps', tipo:'pack', precio:as.reduce((t, a) => t + num(a.precio, 0), 0), url:'', pack:as }; };
const dispN = l => { const ds = D.disp.filter(d => d.codigo === l.codigo), ids = idsDe(l.app); return ids.length < 2 ? ds.length : Math.max(0, ...ids.map(i => ds.filter(d => d.app === i).length)); };
const maxDe = l => num(l.maxDisp, num(D.cfg.maxDisp, 0));
// categoría de cada app: script de Tampermonkey, juego o aplicación web
const catDe = a => a.tipo === 'script' ? 'script' : a.tipo === 'juego' ? 'juego' : 'web';
const CAT = { script:{ v:'scripts', t:'Script Tampermonkey', ic:'scr' }, web:{ v:'aplicaciones', t:'Aplicación web', ic:'web' }, juego:{ v:'juegos', t:'Juego', ic:'juego' } };
const vitalicia = l => l.tipo === 'vitalicia';
// descuento opcional: precio = lo que se cobra; real = precio + descuento (solo se enseña si hay descuento)
const dto = l => Math.max(0, num(l.descuento, 0));
const pReal = l => Math.round((num(l.precio, 0) + dto(l)) * 100) / 100;
const precioH = l => `<b>${eur(l.precio)}</b>${dto(l) ? ` <s class="dto">${eur(pReal(l))}</s>` : ''}`;
// categoría de una licencia según sus apps: si lleva alguna app web es de Aplicaciones; si todas son juegos, de Juegos; si no, de Scripts
const catLic = l => { const cs = idsDe(l.app).map(i => catDe(app1(i))); return cs.includes('web') ? 'web' : cs.length && cs.every(c => c === 'juego') ? 'juego' : cs.includes('script') ? 'script' : 'web'; };
function estadoDe(l) {
  if (l.ef === 'pendiente') return { k:'pendientes', t:'Pendiente de pago', c:'c-warn', col:'var(--warn)' };
  if (l.ef === 'bloqueada') return { k:'bloqueadas', t:'Bloqueada', c:'c-mal', col:'var(--mal)' };
  if (l.ef === 'vencida') return { k:'vencidas', t:'Vencida', c:'c-mal', col:'var(--mal)' };
  if (l.enGracia) return { k:'vencer', t:'En gracia', c:'c-warn', col:'var(--warn)' };
  if (l.dias != null && l.dias <= 7) return { k:'vencer', t:l.dias === 0 ? 'Vence hoy' : 'Vence en ' + l.dias + ' d', c:'c-warn', col:'var(--warn)' };
  return { k:'activas', t:vitalicia(l) ? 'Vitalicia' : 'Activa', c:'c-ok', col:'var(--ok)' };
}
function enlacePago(imp) { const n = num(imp, 0), b = 'https://mypos.com/@' + D.cfg.tag; return n > 0 ? b + '/' + (n % 1 ? n.toFixed(2) : n) : b; }
function waCliente(l) { let t = String(l.telefono || '').replace(/\D/g, ''); if (t.length === 9) t = '34' + t; const a = appDe(l.app);
  const txt = estadoDe(l).k === 'activas' ? `Hola ${l.cliente}, te escribo por tu licencia de ${a.nombre}.`
    : `Hola ${l.cliente}, tu licencia de ${a.nombre} ${l.dias != null && l.dias < 0 ? 'venció' : 'vence'} el ${fecha(l.vence)}. Puedes renovarla aquí (${dto(l) ? eur(pReal(l)) + ' → ' + eur(l.precio) + ' con tu descuento de ' + eur(dto(l)) : eur(l.precio)}): ${enlacePago(l.precio)}\nAl pagar, escribe en el motivo del pago tu código ${l.codigo} y se renovará sola en unos minutos.`;
  return 'https://wa.me/' + t + '?text=' + encodeURIComponent(txt); }

/* ---------- login ---------- */
let cfgInfo = { totp:false };
async function verLogin() {
  $('#app').hidden = true; $('#login').hidden = false;
  if (!API) { $('#lgCuerpo').innerHTML = '<p class="err">Falta configurar la URL del servidor en config.js</p>'; return; }
  $('#lgCuerpo').innerHTML = '<p class="sub">Conectando…</p>';
  const r = await api('info'); if (r.ok) cfgInfo = r;
  pintaLogin();
}
function pintaLogin() {
  const tt = !!cfgInfo.totp;
  $('#lgCuerpo').innerHTML = `<form id="fLogin" autocomplete="off">
    ${tt ? '<div class="campo"><input class="in codigo6" id="lgCod" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="Código de 6 dígitos"></div>' : `<div class="cen">${NFC_HTML}</div>`}
    <div class="err" id="lgErr"></div>
    <button class="btn pri w" id="bEntrar" type="submit">${tt ? 'ENTRAR' : 'USAR LLAVE NFC'}<span class="hold"></span></button>
    </form>
    <span style="font-size:10.5px;color:var(--sua);display:inline-block;margin-top:14px">${tt ? 'Código de Google Authenticator · mantén pulsado ENTRAR 3 s para usar la llave NFC' : 'Entra con tu llave NFC'}</span>`;
  const f = $('#fLogin'), b = $('#bEntrar'); let timer = null, largo = false;
  const suelta = () => { clearTimeout(timer); b.classList.remove('aguanta'); };
  if (tt) { b.onpointerdown = () => { largo = false; b.classList.add('aguanta'); timer = setTimeout(() => { largo = true; suelta(); if (navigator.vibrate) navigator.vibrate(60); abrirLlave(); }, 3000); };
    b.onpointerup = b.onpointerleave = b.onpointercancel = suelta; b.oncontextmenu = e => e.preventDefault(); }
  f.onsubmit = async e => { e.preventDefault(); if (largo) { largo = false; return; }
    if (!tt) return abrirLlave();
    const v = $('#lgCod').value.trim(); if (!v) return;
    b.disabled = true; const r = await api('login', { totp:v }); b.disabled = false;
    if (r.ok) entrar(r.t); else { $('#lgErr').textContent = r.error || 'No se pudo entrar'; bip(200); $('.caja').animate([{ transform:'translateX(0)' }, { transform:'translateX(-9px)' }, { transform:'translateX(9px)' }, { transform:'translateX(0)' }], { duration:300 }); } };
}
async function entrar(t) { TOKEN = t; localStorage.setItem('lic_token', t); bip(660); setTimeout(() => bip(990), 90); const r = await api('datos'); if (r.ok) { $('#login').hidden = true; $('#app').hidden = false; ir('inicio'); refrescaEnlaces(); } else verLogin(); }
function salir(caducada) { TOKEN = ''; localStorage.removeItem('lic_token'); D = null; cierra(); verLogin(); if (caducada === true) toast('Sesión caducada', true); }

/* ---------- llave NFC ---------- */
let nfcAbort = null;
async function leeNfc(alLeer, alFallar) {
  try { const l = new NDEFReader(); nfcAbort = new AbortController(); await l.scan({ signal:nfcAbort.signal });
    l.onreading = ev => { const s = String(ev.serialNumber || ''); if (s) alLeer(s); }; l.onreadingerror = () => alFallar('No se ha podido leer, acércala de nuevo');
  } catch (e) { alFallar(e.name === 'NotAllowedError' ? 'Permite el NFC para leer la llave' : 'Enciende el NFC del móvil'); }
}
function paraNfc() { if (nfcAbort) { nfcAbort.abort(); nfcAbort = null; } }
const NFC_HTML = `<div class="nfc"><i></i><i></i><i></i>${ic('nfc')}</div>`;
async function abrirLlave() {
  let poll = null;
  if ('NDEFReader' in window) {
    const h = modal(`<h3>Llave NFC<button class="x">✕</button></h3><div class="cen">${NFC_HTML}<p class="ds" id="nfcMsg">Acerca tu llave a la parte trasera del móvil</p></div>`);
    cierra.fn = paraNfc; const msg = h.querySelector('#nfcMsg');
    leeNfc(async s => { msg.textContent = 'Comprobando llave…'; const r = await api('login', { llave:s }); if (r.ok) { cierra(); entrar(r.t); } else msg.textContent = r.error; }, m => msg.textContent = m);
  } else {
    const h = modal(`<h3>Llave NFC<button class="x">✕</button></h3><div class="cen"><p class="ds">Escanea este QR con un móvil Android y acerca la llave.</p><div id="qrPar"><p class="ds">Generando…</p></div></div>`);
    cierra.fn = () => clearInterval(poll); const caja = h.querySelector('#qrPar');
    const r = await api('parCrear'); if (!r.ok) { caja.innerHTML = `<p class="err">${esc(r.error)}</p>`; return; }
    caja.innerHTML = qrHtml(URL_PANEL + '?par=' + r.codigo);
    poll = setInterval(async () => { const e = await fetch(API + '?a=parEstado&codigo=' + r.codigo).then(x => x.json()).catch(() => ({}));
      if (e.t) { clearInterval(poll); cierra(); entrar(e.t); } else if (e.ok === false) { clearInterval(poll); caja.innerHTML = '<p class="err">El QR ha caducado. Ciérralo y vuelve a intentarlo.</p>'; } }, 2500);
  }
}
function modoPasarLlave(cod) {
  $('#login').hidden = false; $('.pie').hidden = true;
  $('#lgCuerpo').innerHTML = `<div class="cen">${NFC_HTML}<p id="nfcMsg" style="color:var(--sua);margin:10px 0 14px;font-size:13px">Preparando el lector NFC…</p><button class="btn pri w" id="bPasar" hidden>ACTIVAR LLAVE</button></div>`;
  const arranca = () => { if (!('NDEFReader' in window)) { $('#nfcMsg').textContent = 'Este navegador no lee NFC. Usa Chrome en Android.'; $('#bPasar').hidden = true; return; }
    $('#bPasar').hidden = true; $('#nfcMsg').textContent = 'Acerca la llave a la parte trasera del móvil';
    leeNfc(async s => { $('#nfcMsg').textContent = 'Comprobando…'; const r = await api('parAutorizar', { codigo:cod, llave:s });
      if (r.ok) { paraNfc(); $('#nfcMsg').innerHTML = '<b class="c-ok">Llave correcta.</b> Ya puedes cerrar esta pestaña.'; bip(990); } else $('#nfcMsg').textContent = r.error; }, m => { $('#nfcMsg').textContent = m; $('#bPasar').hidden = false; }); };
  const boton = () => { $('#nfcMsg').textContent = 'Pulsa el botón una vez para dar permiso al NFC (las próximas veces se activará solo)'; $('#bPasar').hidden = false; };
  $('#bPasar').onclick = arranca;
  // al abrir el QR se queda esperando la llave sin pulsar nada (si el NFC ya tiene permiso en este móvil)
  if (!('NDEFReader' in window)) return arranca();
  if (navigator.permissions && navigator.permissions.query) navigator.permissions.query({ name:'nfc' }).then(p => p.state === 'granted' ? arranca() : boton()).catch(arranca);
  else arranca();
}

/* ---------- instalar / compartir ---------- */
let promptInst = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptInst = e; });
$('#bInstalar').innerHTML = ic('inst') + 'Instalar'; $('#bCompartir').innerHTML = ic('comp') + 'Compartir';
function instalar() {
  if (promptInst) { promptInst.prompt(); promptInst = null; return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  modal(`<h3>Instalar LICENCIAS<button class="x">✕</button></h3><p class="ds">${ios ? 'En iPhone: abre esta página en <b>Safari</b>, pulsa el botón <b>Compartir</b> (el cuadrado con la flecha) y elige <b>«Añadir a pantalla de inicio»</b>.'
    : 'Abre el menú del navegador (⋮) y elige <b>«Instalar aplicación»</b> o <b>«Añadir a pantalla de inicio»</b>. Si ya está instalada, ábrela desde su icono.'}</p>`);
}
function compartir() { const d = { title:'LICENCIAS · FuturMovil', text:'Panel de licencias de FuturMovil', url:URL_PANEL }; if (navigator.share) navigator.share(d).catch(() => {}); else copia(URL_PANEL, 'Enlace copiado'); }
$('#bInstalar').onclick = instalar; $('#bCompartir').onclick = compartir;

/* ---------- navegación ---------- */
const VISTAS = [['inicio', 'Inicio', 'inicio'], ['licencias', 'Licencias', 'lic'], ['scripts', 'Scripts', 'scr'], ['aplicaciones', 'Aplicaciones', 'web'], ['juegos', 'Juegos', 'juego'], ['pagos', 'Pagos', 'pagos'], ['actividad', 'Actividad', 'act'], ['ajustes', 'Ajustes', 'aj']];
function ir(v) { vista = v; pinta(); $('#main').scrollTop = 0; }
function pinta() {
  const malas = D.lics.filter(l => l.ef !== 'activa').length; const sinA = (D.mypos || []).filter(g => g.estado === 'sin asignar').length;
  $('#nav').innerHTML = `<div class="logo">${ESCUDO}<div><b>LICENCIAS</b><small>FUTURMOVIL</small></div></div>`
    + VISTAS.map(v => `<button class="nb ${vista === v[0] ? 'on' : ''}" data-v="${v[0]}">${ic(v[2])}<span>${v[1]}</span>${v[0] === 'licencias' && malas ? `<em>${malas}</em>` : ''}${v[0] === 'pagos' && sinA ? `<em>${sinA}</em>` : ''}</button>`).join('')
    + `<button class="nb fin" id="nSalir">${ic('sal')}<span>Cerrar sesión</span></button>`;
  $('#nav').querySelectorAll('[data-v]').forEach(b => b.onclick = () => { bip(520, .04); ir(b.dataset.v); });
  $('#nSalir').onclick = () => salir();
  ({ inicio:vInicio, licencias:vLics, scripts:() => vApps('script'), aplicaciones:() => vApps('web'), juegos:() => vApps('juego'), apps:() => vApps('web'), pagos:vPagos, actividad:vAct, ajustes:vAjustes })[vista]();
  $('#main').querySelectorAll('[data-n]').forEach(cuenta);
  const b = $('#bRec'); if (b) b.onclick = async () => { const r = await api('datos'); if (r.ok) { pinta(); toast('Actualizado'); } };
}
const cab = (t, sub, extra) => `<div class="cab"><h2>${t}</h2><span class="sp"></span>${extra || ''}<button class="btn min" id="bRec" title="Actualizar">${ic('rec')}</button>${sub ? `<p>${sub}</p>` : ''}</div>`;
const bNueva = id => `<button class="btn pri min" id="${id}" style="font-size:12px;padding:9px 14px">${ic('mas')}NUEVA</button>`;

/* ---------- inicio ---------- */
function vInicio() {
  const L = D.lics, act = L.filter(l => l.ef === 'activa'), pv = L.filter(l => estadoDe(l).k === 'vencer'), mal = L.filter(l => l.ef !== 'activa');
  const mrr = act.filter(l => !vitalicia(l)).reduce((s, l) => s + num(l.precio, 0), 0), mes = D.hoy.slice(0, 7), pm = D.pagos.filter(p => p.fecha.slice(0, 7) === mes), cob = pm.reduce((s, p) => s + num(p.importe, 0), 0);
  const meses = [], ym = D.hoy.split('-').map(Number);
  for (let i = 5; i >= 0; i--) { const d = new Date(ym[0], ym[1] - 1 - i, 1), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); meses.push({ n:d.toLocaleDateString('es-ES', { month:'short' }).replace('.', ''), v:D.pagos.filter(p => p.fecha.slice(0, 7) === k).reduce((s, p) => s + num(p.importe, 0), 0) }); }
  const mx = Math.max(1, ...meses.map(x => x.v));
  const prox = L.filter(l => l.vence && l.ef !== 'bloqueada').sort((a, b) => a.vence.localeCompare(b.vence)).slice(0, 6);
  const kpi = (i, c, t, n, sub, e) => `<div class="card kpi tilt st" style="--i:${i}"><div class="brillo"></div><span class="${c}">${e ? '' : '<i class="pt"></i>'}${t}</span><b data-n="${n}" ${e ? 'data-s=" €"' + (n % 1 ? ' data-d="1"' : '') : ''}>0</b><small>${sub}</small></div>`;
  $('#main').innerHTML = `<div class="vista">${cab('PANEL DE CONTROL', new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' }))}
  <div class="kpis">${kpi(0, 'c-ok', 'Activas', act.length, 'de ' + L.length + ' licencias')}${kpi(1, 'c-warn', 'Por vencer', pv.length, 'próximos 7 días')}${kpi(2, 'c-mal', 'Bloqueadas', mal.length, 'vencidas o bloqueadas')}${kpi(3, 'c-cian', 'Ingreso mensual', mrr, 'recurrente activo', 1)}${kpi(4, 'c-vio', 'Cobrado este mes', cob, pm.length + ' pagos', 1)}</div>
  <div class="dos">
    <div class="card bloque st" style="--i:5"><h3>Cobros · últimos 6 meses</h3><div class="barras">${meses.map(x => `<div><b>${x.v ? eur(x.v) : ''}</b><i data-h="${Math.round(x.v / mx * 100)}"></i><small>${x.n}</small></div>`).join('')}</div></div>
    <div class="card bloque st" style="--i:6"><h3>Próximos vencimientos</h3>${prox.length ? prox.map(l => { const e = estadoDe(l); return `<div class="fila" data-lic="${l.codigo}" style="cursor:pointer"><i class="pt ${e.c}"></i><div class="g"><b>${esc(l.cliente)}</b><small>${esc(appDe(l.app).nombre)} · ${fecha(l.vence)}</small></div><span class="chip ${e.c}">${e.t}</span></div>`; }).join('') : '<div class="vacio">Sin vencimientos a la vista</div>'}</div>
  </div>
  <div class="card bloque st" style="--i:7"><h3>Última actividad</h3>${D.log.length ? D.log.slice(0, 8).map(filaLog).join('') : '<div class="vacio">Todavía no hay actividad</div>'}</div></div>`;
  setTimeout(() => $('#main').querySelectorAll('[data-h]').forEach(i => i.style.height = i.dataset.h + '%'), 80);
  $('#main').querySelectorAll('[data-lic]').forEach(f => f.onclick = () => ficha(f.dataset.lic));
}
function filaLog(g) { const l = D.lics.find(x => x.codigo === g.codigo), malo = /denegado|limite|bloqueada/.test(g.resultado);
  return `<div class="fila"><i class="pt ${malo ? 'c-mal' : 'c-cian'}" style="animation:none"></i><div class="g"><b>${esc(g.resultado)}</b><small>${esc(l ? l.cliente : g.codigo)} · ${esc(appDe(g.app).nombre)}</small></div><span class="hora">${fecha(g.fecha)} ${g.fecha.slice(11, 16)}</span></div>`; }

/* ---------- licencias ---------- */
function vLics() {
  const cuentas = { todas:D.lics.length, activas:0, pendientes:0, vencer:0, vencidas:0, bloqueadas:0 }; D.lics.forEach(l => cuentas[estadoDe(l).k]++);
  const q = busca.toLowerCase();
  const lista = D.lics.filter(l => (filtro === 'todas' || estadoDe(l).k === filtro) && (!fApp || idsDe(l.app).includes(fApp)) && (!q || (l.cliente + ' ' + l.codigo + ' ' + l.telefono + ' ' + l.email + ' ' + appDe(l.app).nombre + ' ' + idsDe(l.app).map(i => app1(i).nombre).join(' ')).toLowerCase().includes(q)))
    .sort((a, b) => (a.vence || '9999').localeCompare(b.vence || '9999'));
  $('#main').innerHTML = `<div class="vista">${cab('LICENCIAS', '', bNueva('bNueva'))}
  <div class="barra"><input class="in" id="iBusca" placeholder="Buscar cliente, código, teléfono…" value="${esc(busca)}"><select class="in" id="sApp"><option value="">Todas las apps</option>${D.apps.map(a => `<option value="${a.id}" ${fApp === a.id ? 'selected' : ''}>${esc(a.nombre)}</option>`).join('')}</select></div>
  <div class="filtros">${[['todas', 'Todas'], ['activas', 'Activas']].concat(cuentas.pendientes ? [['pendientes', 'Pendientes de pago']] : []).concat([['vencer', 'Por vencer'], ['vencidas', 'Vencidas'], ['bloqueadas', 'Bloqueadas']]).map(f => `<button class="${filtro === f[0] ? 'on' : ''}" data-f="${f[0]}">${f[1]}<i>${cuentas[f[0]]}</i></button>`).join('')}</div>
  ${[['web', 'Aplicaciones', 'web'], ['script', 'Scripts de Tampermonkey', 'scr'], ['juego', 'Juegos', 'juego']].map(([c, t, ico]) => { const g = lista.filter(l => catLic(l) === c);
    return g.length ? `<h5 class="grupo">${ic(ico)}${t}<i>${g.length}</i></h5><div class="grid">${g.map(tarjetaLic).join('')}</div>` : ''; }).join('')}
  ${lista.length ? '' : `<div class="vacio">${ic('lic')}${D.lics.length ? 'Nada con ese filtro' : D.apps.length ? 'Crea tu primera licencia con el botón NUEVA' : 'Primero da de alta una aplicación, un juego o un script'}</div>`}</div>`;
  $('#bNueva').onclick = () => { if (D.apps.length) editaLic(); else { toast('Primero crea una aplicación', true); ir('aplicaciones'); } };
  $('#iBusca').oninput = e => { busca = e.target.value; clearTimeout(vLics.t); vLics.t = setTimeout(() => { pinta(); const i = $('#iBusca'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 300); };
  $('#sApp').onchange = e => { fApp = e.target.value; pinta(); };
  $('#main').querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filtro = b.dataset.f; pinta(); });
  $('#main').querySelectorAll('.lic').forEach(c => c.onclick = async e => { const k = c.dataset.k, l = D.lics.find(x => x.codigo === k);
    if (e.target.closest('.cod')) return copia(k, 'Código copiado');
    if (e.target.closest('.sw')) { const on = l.estado !== 'bloqueada'; e.target.closest('.sw').classList.toggle('on', !on); const r = await api('licEstado', { codigo:k, estado:on ? 'bloqueada' : 'activa' }); if (r.ok) { toast(on ? 'Licencia bloqueada' : 'Licencia activada', on); pinta(); } else toast(r.error, true); return; }
    if (e.target.closest('.bRen')) { const rc = e.target.closest('.bRen').getBoundingClientRect(); return renueva(k, 1, rc.left + rc.width / 2, rc.top); }
    if (e.target.closest('a')) return;
    ficha(k); });
}
function tarjetaLic(l, i) { const e = estadoDe(l), a = appDe(l.app), nd = dispN(l), mx = maxDe(l);
  return `<div class="card lic tilt st" style="--i:${Math.min(i, 14)};--col:${e.col}" data-k="${l.codigo}"><div class="brillo"></div>
  <div class="top"><div><h4>${esc(l.cliente)}</h4><span class="ap">${esc(a.nombre)}</span></div><span class="chip ${e.c}"><i class="pt"></i>${e.t}</span></div>
  ${a.pack ? `<div class="packl">${a.pack.map(x => `<i>${esc(x.nombre)}</i>`).join('')}</div>` : ''}<button class="cod"><span>${l.codigo}</span>${ic('copia')}</button>
  <div class="meta">${vitalicia(l) ? `<span>Licencia <b>vitalicia</b></span><span>${num(l.precio, 0) ? precioH(l) + ' pago único' : '<b>Sin coste</b>'}</span>${l.origen === 'juego' ? '<span>Creada por el <b>juego</b></span>' : ''}` : `<span>Vence <b>${l.vence ? fecha(l.vence) : 'nunca'}</b></span><span>${precioH(l)}/mes${dto(l) ? ` <i class="dtoTag">-${eur(dto(l))}</i>` : ''}</span><span>Disp. <b>${nd}${mx ? '/' + mx : ''}</b></span>`}</div>
  <div class="acc"><button class="sw ${l.estado !== 'bloqueada' ? 'on' : ''}" title="Activar / bloquear"></button><span class="sp"></span>
  ${l.telefono ? `<a class="btn min" href="${waCliente(l)}" target="_blank" rel="noopener" title="WhatsApp">${ic('wa')}</a>` : ''}${vitalicia(l) ? (l.ef === 'pendiente' ? `<button class="btn min ok bRen">${ic('rec')}Marcar pagada</button>` : '') : `<button class="btn min ok bRen">${ic('rec')}+1 mes</button>`}</div></div>`; }
async function renueva(k, meses, x, y) { const r = await api('licRenovar', { codigo:k, meses });
  if (r.ok) { chispas(x || innerWidth / 2, y || innerHeight / 2); bip(660); setTimeout(() => bip(880), 100); setTimeout(() => bip(1320), 200); const lk = D.lics.find(l => l.codigo === k); toast(vitalicia(lk) ? 'Licencia vitalicia activada' : 'Renovada hasta el ' + fecha(lk.vence)); pinta(); } else toast(r.error, true); return r; }

function editaLic(k) {
  const l = k ? D.lics.find(x => x.codigo === k) : { app:fApp || '', cliente:'', telefono:'', email:'', precio:'', vence:'', maxDisp:'', gracia:'', notas:'' };
  const d1 = new Date(); d1.setMonth(d1.getMonth() + 1); const def = d1.getFullYear() + '-' + String(d1.getMonth() + 1).padStart(2, '0') + '-' + String(d1.getDate()).padStart(2, '0');
  const h = modal(`<h3>${k ? 'Editar licencia' : 'Nueva licencia'}<button class="x">✕</button></h3><p class="ds">${k ? 'Código ' + k : 'El código se genera solo al guardar.'}</p>
  <form id="fLic"><div class="campo"><label>Aplicaciones <b id="pkInfo"></b></label>${D.apps.length > 4 ? '<input class="in pkbus" id="pkBus" placeholder="Buscar aplicación…" autocomplete="off" spellcheck="false">' : ''}<div class="pick" id="pkApps">${D.apps.map(a => `<button type="button" data-id="${a.id}">${ic(a.tipo === 'script' ? 'scr' : 'web')}${esc(a.nombre)}</button>`).join('')}</div>
  <p class="ds" style="margin:8px 0 0">Marca una sola, o varias para hacer un <b>pack</b>: un único pago y vencimiento para todas; si no paga se bloquean todas a la vez.</p><input type="hidden" name="app"></div>
  <div class="campo"><label>Cliente</label><input class="in" name="cliente" value="${esc(l.cliente)}" required placeholder="Nombre del cliente"></div>
  <div class="par"><div class="campo"><label>Teléfono</label><input class="in" name="telefono" inputmode="tel" value="${esc(l.telefono)}"></div><div class="campo"><label>Correo</label><input class="in" name="email" type="email" value="${esc(l.email)}"></div></div>
  <div class="campo"><div style="display:flex;align-items:center;gap:12px"><button type="button" class="sw ${vitalicia(l) ? 'on' : ''}" id="vitSw" title="Vitalicia / mensual"></button><div><b id="vitTit">${vitalicia(l) ? 'Licencia vitalicia' : 'Licencia mensual'}</b><p class="ds" id="vitDs" style="margin:2px 0 0">${vitalicia(l) ? 'No caduca nunca y no paga mensualidades. Puedes volver a pasarla a mensual cuando quieras.' : 'Paga cada mes. Actívalo para hacerla vitalicia (sin mensualidades).'}</p></div></div></div>
  <div class="par"><div class="campo"><label id="lPrecio">${vitalicia(l) ? 'Precio (€, pago único)' : 'Mensualidad (€)'}</label><input class="in" name="precio" inputmode="decimal" value="${esc(k && dto(l) ? pReal(l) : l.precio)}"></div><div class="campo"><label>Descuento (€)</label><input class="in" name="descuento" inputmode="decimal" value="${esc(k && dto(l) ? dto(l) : '')}" placeholder="Opcional"></div></div>
  <p class="ds" id="dtoInfo" style="margin:-4px 0 12px"></p>
  <div class="campo" id="cVence"${vitalicia(l) ? ' style="display:none"' : ''}><label>Vence el</label><input class="in" name="vence" type="date" value="${esc(k && l.vence ? l.vence : def)}"></div>
  <div class="par"><div class="campo"><label>Máx. dispositivos</label><input class="in" name="maxDisp" inputmode="numeric" value="${esc(l.maxDisp)}" placeholder="${esc(D.cfg.maxDisp)} (por defecto)"></div><div class="campo"><label>Días de gracia</label><input class="in" name="gracia" inputmode="numeric" value="${esc(l.gracia)}" placeholder="${esc(D.cfg.gracia)} (por defecto)"></div></div>
  <div class="campo"><label>Notas</label><input class="in" name="notas" value="${esc(l.notas)}"></div>
  <p class="ds" style="margin:0 0 12px">Sin fecha de vencimiento la licencia no caduca nunca. Dispositivos a 0 = sin límite.</p>
  <button class="btn pri w" type="submit">GUARDAR</button></form>`);
  const f = h.querySelector('#fLic'); let sel = idsDe(l.app).filter(i => D.apps.some(a => a.id === i)), tocado = !!k;
  let pon = () => { f.elements.app.value = sel.join(','); h.querySelectorAll('#pkApps button').forEach(b => b.classList.toggle('on', sel.includes(b.dataset.id)));
    h.querySelector('#pkInfo').textContent = sel.length > 1 ? '· PACK DE ' + sel.length : ''; if (!tocado) f.elements.precio.value = appDe(sel.join(',')).precio || ''; };
  const sinTil = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const bus = h.querySelector('#pkBus');
  // buscador: filtra por nombre (sin importar tildes ni mayúsculas); las marcadas se ven siempre
  const filtra = () => { const q = sinTil(bus ? bus.value : '').trim(); let n = 0;
    h.querySelectorAll('#pkApps button').forEach(b => { const ver = !q || sel.includes(b.dataset.id) || sinTil(b.textContent).includes(q); b.hidden = !ver; if (ver) n++; });
    let v = h.querySelector('#pkVacio'); if (!n && q) { if (!v) { v = document.createElement('span'); v.id = 'pkVacio'; v.className = 'ds'; h.querySelector('#pkApps').appendChild(v); } v.textContent = 'Ninguna aplicación coincide'; } else if (v) v.remove(); };
  if (bus) { bus.oninput = filtra;
    bus.onkeydown = e => { if (e.key !== 'Enter') return; e.preventDefault();
      const vis = [...h.querySelectorAll('#pkApps button')].filter(b => !b.hidden && !sel.includes(b.dataset.id)); if (vis.length === 1) { vis[0].click(); bus.value = ''; filtra(); } }; }
  h.querySelectorAll('#pkApps button').forEach(b => b.onclick = () => { const id = b.dataset.id; sel = sel.includes(id) ? sel.filter(x => x !== id) : sel.concat(id); bip(520, .04); pon(); });
  const dInfo = () => { const P = num(f.elements.precio.value, 0), Dd = num(f.elements.descuento.value, 0);
    h.querySelector('#dtoInfo').innerHTML = Dd > 0 ? (Dd < P ? `El cliente verá <s>${eur(P)}</s> y pagará <b class="c-ok">${eur(Math.round((P - Dd) * 100) / 100)}</b>` : '<span class="c-mal">El descuento tiene que ser menor que el precio</span>') : ''; };
  f.elements.precio.oninput = () => { tocado = true; dInfo(); }; f.elements.descuento.oninput = dInfo;
  const pon0 = pon; pon = () => { pon0(); dInfo(); }; pon();
  // vitalicia o mensual (se puede cambiar cuando quiera)
  let vit = vitalicia(l); const vSw = h.querySelector('#vitSw');
  vSw.onclick = () => { vit = !vit; vSw.classList.toggle('on', vit); bip(vit ? 880 : 520, .04);
    h.querySelector('#vitTit').textContent = vit ? 'Licencia vitalicia' : 'Licencia mensual';
    h.querySelector('#vitDs').textContent = vit ? 'No caduca nunca y no paga mensualidades. Puedes volver a pasarla a mensual cuando quieras.' : 'Paga cada mes. Actívalo para hacerla vitalicia (sin mensualidades).';
    h.querySelector('#lPrecio').textContent = vit ? 'Precio (€, pago único)' : 'Mensualidad (€)';
    h.querySelector('#cVence').style.display = vit ? 'none' : ''; };
  f.onsubmit = async e => { e.preventDefault(); const lic = Object.fromEntries(new FormData(f)); if (k) lic.codigo = k; if (!sel.length) return toast('Elige al menos una aplicación', true);
    lic.tipo = vit ? 'vitalicia' : ''; if (vit) lic.vence = ''; else if (!lic.vence) lic.vence = def;
    { const P = num(lic.precio, 0), Dd = num(lic.descuento, 0); if (Dd > 0) { if (Dd >= P) return toast('El descuento tiene que ser menor que el precio', true); lic.precio = String(Math.round((P - Dd) * 100) / 100); lic.descuento = String(Dd); } else lic.descuento = ''; }
    const r = await api('licGuardar', { lic }); if (r.ok) { cierra(); toast(k ? 'Licencia guardada' : 'Licencia creada'); vista = 'licencias'; pinta(); if (!k) ficha(r.codigo); } else toast(r.error, true); };
}

function ficha(k) {
  const l = D.lics.find(x => x.codigo === k); if (!l) return; const e = estadoDe(l), a = appDe(l.app), ds = D.disp.filter(d => d.codigo === k), pg = D.pagos.filter(p => p.codigo === k), mx = maxDe(l), blo = l.estado === 'bloqueada';
  const h = modal(`<h3>${esc(l.cliente)}<span class="chip ${e.c}" style="font-size:9px">${e.t}</span><button class="x">✕</button></h3>
  <p class="ds">${esc(a.nombre)} · ${dto(l) ? '<s>' + eur(pReal(l)) + '</s> ' : ''}${vitalicia(l) ? eur(l.precio) + ' pago único · licencia vitalicia' + (l.origen === 'juego' ? ' · creada por el juego' : '') : eur(l.precio) + '/mes · vence ' + (l.vence ? fecha(l.vence) : 'nunca')}${dto(l) ? ' · descuento ' + eur(dto(l)) : ''}${l.ultimoUso ? ' · último uso ' + fecha(l.ultimoUso) + ' ' + l.ultimoUso.slice(11, 16) : ' · sin usar todavía'}${l.notas ? '<br>' + esc(l.notas) : ''}</p>
  <button class="cod" id="fCod"><span>${k}</span>${ic('copia')}</button>
  ${vitalicia(l) ? (l.ef === 'pendiente' ? `<h5>Pago pendiente</h5><p class="ds" style="margin-bottom:8px">El jugador tiene que pagar ${eur(l.precio)} con este código en el motivo; se activará sola al llegar el pago. Si ya te ha pagado sin el código, márcala tú.</p><div class="bts"><button class="btn ok" data-m="1">Marcar como pagada</button></div>` : '') : `<h5>Renovar (apunta el pago)</h5><div class="bts"><button class="btn ok" data-m="1">+1 mes</button><button class="btn ok" data-m="3">+3 meses</button><button class="btn ok" data-m="12">+1 año</button></div>`}
  <h5>Acciones</h5><div class="bts"><button class="btn ${blo ? 'ok' : 'mal'}" id="fBlo">${blo ? 'Activar' : 'Bloquear'}</button>${l.telefono ? `<a class="btn" href="${waCliente(l)}" target="_blank" rel="noopener">${ic('wa')}WhatsApp</a>` : ''}<button class="btn" id="fCobro">${ic('pagos')}Enlace de pago</button><button class="btn" id="fEd">Editar</button></div>
  <h5>Instalación${a.pack ? ' · una por cada app del pack' : ''}<span class="ayuda">★ entregado · 🔔 avisos de pago</span></h5>${(a.pack || [a]).some(x => x.tipo === 'script') ? `<button class="enlbtn" id="fEnl"><span class="ei">${ic('comp')}</span><span class="et"><b>Enlace de instalación</b><small>Un solo enlace: el cliente lo abre y pulsa Instalar. Sin copiar ni descargar.</small></span><span class="ef">›</span></button>` : ''}<div class="insl">${(a.pack || [a]).map(x => `<div class="insf"><button class="estrella ${idsDe(l.entregados).includes(x.id) ? 'on' : ''}" data-ent="${esc(x.id)}" title="Marcar como entregado al cliente">${ESTRELLA}</button>${x.tipo === 'script' ? `<button class="campana ${idsDe(l.silenciados).includes(x.id) ? 'on' : ''}" data-sil="${esc(x.id)}" title="${idsDe(l.silenciados).includes(x.id) ? AV_OFF : AV_ON}">${idsDe(l.silenciados).includes(x.id) ? CAMPANA_NO : CAMPANA}</button>` : ''}<button class="btn" data-ins="${esc(x.id)}">${ic(x.tipo === 'script' ? 'scr' : 'web')}${a.pack ? esc(x.nombre) : x.tipo === 'script' ? 'Generar loader de Tampermonkey' : 'Ver código de integración'}</button></div>`).join('')}</div>
  <h5>Dispositivos (${a.pack ? ds.length + (mx ? ' · máx. ' + mx + ' por app' : '') : ds.length + (mx ? '/' + mx : '')})</h5>
  ${ds.length ? numDisp(ds, !!a.pack).map(d => `<div class="fila"><div class="g"><b>Dispositivo ${d.n}${a.pack && d.app ? ' · ' + esc(app1(d.app).nombre) : ''}</b><small>${esc(nombreDisp(d.info))} · desde ${fecha(d.primero)} · último uso ${fecha(d.ultimo)} ${d.ultimo.slice(11, 16)}</small></div><button class="btn min mal" data-d="${esc(d.disp)}">Liberar</button></div>`).join('') : '<p class="ds" style="margin:0">Ningún dispositivo registrado todavía.</p>'}
  ${pg.length ? `<h5>Pagos (${eur(pg.reduce((s, p) => s + num(p.importe, 0), 0))})</h5>` + pg.slice(-5).reverse().map(p => `<div class="fila"><div class="g"><b>${eur(p.importe)}</b><small>${fecha(p.fecha)} · ${p.meses} mes${p.meses == 1 ? '' : 'es'}</small></div></div>`).join('') : ''}
  <h5>Zona peligrosa</h5><button class="btn mal min" id="fDel">Eliminar licencia</button>`);
  h.querySelector('#fCod').onclick = () => copia(k, 'Código copiado');
  h.querySelectorAll('[data-m]').forEach(b => b.onclick = async () => { const rc = b.getBoundingClientRect(); const r = await renueva(k, +b.dataset.m, rc.left + rc.width / 2, rc.top); if (r.ok) ficha(k); });
  h.querySelector('#fBlo').onclick = async () => { const r = await api('licEstado', { codigo:k, estado:blo ? 'activa' : 'bloqueada' }); if (r.ok) { toast(blo ? 'Licencia activada' : 'Licencia bloqueada', !blo); pinta(); ficha(k); } else toast(r.error, true); };
  h.querySelector('#fCobro').onclick = () => copia(enlacePago(l.precio), 'Enlace de pago copiado');
  h.querySelector('#fEd').onclick = () => editaLic(k);
  h.querySelectorAll('[data-ins]').forEach(b => b.onclick = () => integra(l, app1(b.dataset.ins)));
  if (h.querySelector('#fEnl')) h.querySelector('#fEnl').onclick = () => enlaceInst(l, (a.pack || [a]).filter(x => x.tipo === 'script'));
  h.querySelectorAll('[data-ent]').forEach(b => b.onclick = async () => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); bip(on ? 880 : 420, .04);
    const r = await api('licEntregado', { codigo:k, app:b.dataset.ent, on }); if (r.ok) toast(on ? 'Marcado como entregado' : 'Quitado de entregados'); else { b.classList.toggle('on', !on); toast(r.error || 'No se ha podido guardar', true); } });
  h.querySelectorAll('[data-sil]').forEach(b => b.onclick = async () => { const on = !b.classList.contains('on'); const pon = v => { b.classList.toggle('on', v); b.innerHTML = v ? CAMPANA_NO : CAMPANA; b.title = v ? AV_OFF : AV_ON; }; pon(on); bip(on ? 420 : 880, .04);
    const r = await api('licSilencio', { codigo:k, app:b.dataset.sil, on }); if (r.ok) toast(on ? 'Avisos silenciados: si no paga, este script se para sin enseñar cartel' : 'Avisos activados para este script'); else { pon(!on); toast(r.error || 'No se ha podido guardar', true); } });
  h.querySelectorAll('[data-d]').forEach(b => b.onclick = async () => { const r = await api('dispLiberar', { codigo:k, disp:b.dataset.d }); if (r.ok) { toast('Dispositivo liberado'); pinta(); ficha(k); } });
  h.querySelector('#fDel').onclick = async () => { if (await confirma('Eliminar licencia', 'Se borrará la licencia de ' + l.cliente + ' y dejará de poder usar ' + a.nombre + '. No se puede deshacer.')) { const r = await api('licBorrar', { codigo:k }); if (r.ok) { toast('Licencia eliminada'); pinta(); } } };
}
async function enlaceInst(l, lista) {
  const r = await api('enlacesCrear', { codigo:l.codigo, lista:lista.map(x => ({ app:x.id, texto:loader(l, x) })) });
  if (!r.ok) return toast(r.error || 'No se ha podido crear el enlace', true);
  const url = URL_PANEL + 'instalar.html?k=' + r.token, n = lista.length, que = n === 1 ? 'tu script ' + lista[0].nombre.replace(/^\s*\d+\s*[-–·.]\s*/, '') : 'tus ' + n + ' scripts';
  const msg = `Hola ${l.cliente}, aquí tienes la instalación de ${que} de FuturMovil 👇\n${url}\n\nÁbrelo en el ordenador con Google Chrome y sigue los 3 pasos (menos de un minuto). Si tienes cualquier duda, escríbeme por aquí.`;
  let t = String(l.telefono || '').replace(/\D/g, ''); if (t.length === 9) t = '34' + t;
  const falta = lista.filter(x => !D.scripts[x.id]);
  const h = modal(`<h3>Enlace de instalación<button class="x">✕</button></h3>
  <p class="ds">Envíaselo a <b>${esc(l.cliente)}</b>. Al abrirlo verá una página guiada con ${n === 1 ? 'su script' : 'sus ' + n + ' scripts'} y un botón <b>Instalar</b> en cada uno: Tampermonkey se abre solo.</p>
  <button class="cod enl" id="eU"><span>${esc(url)}</span>${ic('copia')}</button>
  <div class="bts"><button class="btn" id="eC">${ic('copia')}Copiar mensaje</button>${t ? `<a class="btn ok" href="https://wa.me/${t}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" id="eW">${ic('wa')}Enviar por WhatsApp</a>` : ''}<a class="btn" href="${url}" target="_blank" rel="noopener">${ic('web')}Ver página</a></div>
  ${falta.length ? `<p class="ds c-warn" style="margin-top:12px">Ojo: aún no has subido el código de ${falta.map(x => esc(x.nombre)).join(', ')}. Se instalará igual y empezará a funcionar en cuanto lo subas.</p>` : ''}
  <p class="ds" style="margin-top:12px">El enlace de este cliente es siempre el mismo. Si añades o quitas scripts de su licencia, pulsa aquí otra vez y se actualiza solo.</p>`);
  h.querySelector('#eU').onclick = () => copia(url, 'Enlace copiado');
  h.querySelector('#eC').onclick = () => copia(msg, 'Mensaje copiado');
  if (h.querySelector('#eW')) h.querySelector('#eW').onclick = () => toast('Abriendo WhatsApp…');
}
// numera los dispositivos por orden de llegada (Dispositivo 1, 2, 3…); en los packs, por cada script
function numDisp(ds, pack) {
  const c = {};
  return ds.slice().sort((x, y) => (pack ? String(x.app).localeCompare(String(y.app)) : 0) || String(x.primero).localeCompare(String(y.primero)))
    .map(d => { const g = pack ? d.app || '' : ''; c[g] = (c[g] || 0) + 1; return Object.assign({}, d, { n: c[g] }); });
}
const AV_ON = 'Avisos activos: si la licencia vence o se bloquea, este script enseña el cartel de pago. Pulsa para silenciarlo';
const AV_OFF = 'Avisos silenciados: si la licencia vence o se bloquea, este script se para sin enseñar ningún cartel. Pulsa para activarlos';
const CAMPANA = '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>';
const CAMPANA_NO = '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l1.5 2h-15"/><path d="M10 20.5a2 2 0 0 0 4 0M4 4l16 16"/></svg>';
const ESTRELLA = '<svg viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.1 6.4 20l1.1-6.2L2.9 9.4l6.3-.9z"/></svg>';
function nombreDisp(ua) { ua = String(ua || ''); if (!ua) return 'Dispositivo'; const so = /android/i.test(ua) ? 'Android' : /iphone|ipad/i.test(ua) ? 'iPhone/iPad' : /windows/i.test(ua) ? 'Windows' : /mac os/i.test(ua) ? 'Mac' : /linux/i.test(ua) ? 'Linux' : 'Dispositivo';
  const nv = /edg\//i.test(ua) ? 'Edge' : /firefox/i.test(ua) ? 'Firefox' : /chrome/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : ''; return so + (nv ? ' · ' + nv : ''); }

/* ---------- integración ---------- */
// Loader de Tampermonkey: guarda el código del script y solo pregunta al servidor cada REVISA horas,
// así arranca al instante y no llama al servidor en cada página que abre el cliente.
const REVISA_H = 3;
// versión del loader: al subirla, el panel actualiza los enlaces guardados y Tampermonkey se lo baja solo a los clientes
const LOADER_V = '2.7';
async function refrescaEnlaces() {
  try {
    if (!D || !D.inst || localStorage.getItem('loader_v') === LOADER_V) return;
    for (const k of D.inst) {
      const l = D.lics.find(x => x.codigo === k); if (!l) continue;
      const a = appDe(l.app), lista = (a.pack || [a]).filter(x => x.tipo === 'script');
      if (lista.length) await api('enlacesCrear', { codigo:l.codigo, lista:lista.map(x => ({ app:x.id, texto:loader(l, x) })) });
    }
    localStorage.setItem('loader_v', LOADER_V);
  } catch (e) {}
}
function loader(l, a) {
  const ver = LOADER_V + '.' + new Date().toISOString().replace(/\D/g, '').slice(0, 12);
  const m = urlsDe(a.url), gr = ['GM_xmlhttpRequest', 'GM_getValue', 'GM_setValue', 'GM_deleteValue', 'GM_listValues', 'GM_addStyle', 'GM_openInTab', 'GM_setClipboard', 'GM_notification', 'GM_registerMenuCommand', 'unsafeWindow'];
  return ['// ==UserScript==', '// @name         ' + a.nombre, '// @namespace    futurmovil', '// @version      ' + ver, '// @description  ' + a.nombre,
  ...(m.length ? m : ['*://*/*']).concat(URL_PANEL + 'instalar.html*').map(u => '// @match        ' + u), ...gr.map(g => '// @grant        ' + g),
  '// @connect      script.google.com', '// @connect      script.googleusercontent.com', '// @run-at       document-start', '// ==/UserScript==', ''].join('\n') + String.raw`
(function () {
  'use strict';
  var API = '${API}', APP = '${a.id}', LIC = '${l.codigo}';
  var REVISA = ${REVISA_H} * 3600000;   // comprueba la licencia cada ${REVISA_H} horas
  var SIN_RED = 3 * 86400000;         // sin conexión con el servidor, sigue funcionando 3 días
  var NOMBRES = ['${gr.join("', '")}'];
  var VALORES = [${gr.join(', ')}];
  // en la página de instalación solo avisa de que está instalado en este navegador (y con qué versión); no hace nada más
  if (location.href.indexOf('${URL_PANEL}instalar.html') === 0) {
    var marca = function () { try { document.documentElement.setAttribute('data-fm-' + APP, LIC + '|${ver}'); } catch (e) {} };
    if (document.documentElement) marca(); else document.addEventListener('readystatechange', marca);
    return;
  }
  var dev = GM_getValue('lic_dev', '');
  if (!dev) { dev = 'tm-' + Math.random().toString(36).slice(2) + Date.now().toString(36); GM_setValue('lic_dev', dev); }

  // respeta el @run-at del script original
  function cuando(run, fn) {
    if (run === 'document-start') return fn();
    if (document.readyState !== 'loading') return run === 'document-idle' ? setTimeout(fn, 0) : fn();
    document.addEventListener('DOMContentLoaded', function () { run === 'document-idle' ? setTimeout(fn, 0) : fn(); }, { once: true });
  }
  function runAt(code) { var r = /\/\/\s*@run-at\s+(document-(?:start|end|idle|body))/.exec(code); return r ? (r[1] === 'document-body' ? 'document-end' : r[1]) : 'document-idle'; }
  var lanzado = false;
  // respeta las direcciones del propio script (@match / @include / @exclude de su cabecera),
  // aunque el loader esté en todas las webs: así cada script solo funciona donde tiene que funcionar
  function reglas(code) {
    var cab = (String(code || '').match(/==UserScript==([\s\S]*?)==\/UserScript==/) || [])[1] || '', r = { inc: [], exc: [] };
    cab.replace(/@(match|include|exclude)[ \t]+(\S+)/g, function (x, k, p) { (k === 'exclude' ? r.exc : r.inc).push(p); return x; });
    return r;
  }
  function patron(p) {
    if (p.length > 2 && p.charAt(0) === '/' && p.charAt(p.length - 1) === '/') { try { return new RegExp(p.slice(1, -1)); } catch (e) { return /^$/; } }
    if (p === '<all_urls>') return /^(https?|file):/;
    var s = p.replace(/[.+?^$(){}|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/^\.\*:\/\//, 'https?://');
    return new RegExp('^' + s + '$');
  }
  function tocaR(r) {
    var u = location.href, ok = function (p) { return patron(p).test(u); };
    if (!r || r.exc.some(ok)) return !r;
    return !r.inc.length || r.inc.some(ok);
  }
  // aviso entre scripts de la misma licencia en esta web: "el servidor ya ha confirmado que está pagada"
  var CLAVE_OK = 'fmx_ok_' + String(LIC).replace(/[^A-Za-z0-9]/g, '');
  function okVisto() { try { return +(localStorage.getItem(CLAVE_OK) || 0); } catch (e) { return 0; } }
  function okConfirmado() {
    try { localStorage.setItem(CLAVE_OK, String(Date.now())); } catch (e) {}
    var c = document.getElementById('fmx-lic-' + String(LIC).replace(/[^A-Za-z0-9]/g, '')); if (c) c.remove();
  }
  function guardadas() { try { return JSON.parse(GM_getValue('lic_m', '') || 'null'); } catch (e) { return null; } }
  // scripts con "@grant none" (o sin @grant): en Tampermonkey se ejecutan en la propia página y usan sus
  // variables (jQuery $, funciones de la web...). Se ejecutan igual: dentro de la página, no en el sandbox.
  function sinGrants(code) {
    var cab = (String(code || '').match(/==UserScript==([\s\S]*?)==\/UserScript==/) || [])[1] || '', g = [];
    cab.replace(/@grant[ \t]+(\S+)/g, function (x, v) { g.push(v); return x; });
    return g.every(function (v) { return v === 'none'; });
  }
  function enPagina(code) {
    var id = 'fmx_run_' + Math.random().toString(36).slice(2);
    try {
      var s = document.createElement('script');
      s.textContent = 'window[' + JSON.stringify(id) + ']=1;try{' + code + '\n}catch(e){console.error(' + JSON.stringify('[' + APP + ']') + ',e)}';
      (document.head || document.documentElement).appendChild(s); s.remove();
      if (unsafeWindow[id]) { try { delete unsafeWindow[id]; } catch (e) {} return true; }
    } catch (e) {}
    return false;   // la web no deja meter scripts (CSP): se usa el plan B
  }
  function lanza(c) {
    if (lanzado || !c || !c.code) return; lanzado = true;
    if (!tocaR(reglas(c.code))) return;
    cuando(c.run, function () {
      try {
        if (!sinGrants(c.code)) return Function.apply(null, NOMBRES.concat(c.code)).apply(null, VALORES);
        if (enPagina(c.code)) return;
        Function.apply(null, NOMBRES.concat('with (unsafeWindow) {\n' + c.code + '\n}')).apply(null, VALORES);
      } catch (e) { console.error('[' + APP + ']', e); }
    });
  }
  function aviso(r) {
    // los avisos solo salen en las webs donde funciona este script
    var g = guardadas(); if (g && !tocaR(g)) return;
    // avisos silenciados desde el panel para este script: no enseña ningún cartel, simplemente no funciona
    if (r.silencio) return;
    if (r.estado === 'apagada') return errorConexion();
    cuando('document-end', function () {
      // un solo cartel por licencia: si otro script del mismo pack ya lo ha puesto en esta página, no se repite
      var id = 'fmx-lic-' + String(LIC).replace(/[^A-Za-z0-9]/g, '');
      if (document.getElementById(id)) return;
      var pack = +r.pack > 1, cobro = r.pago && (r.estado === 'vencida' || r.estado === 'bloqueada');
      var d = document.createElement('div'); d.id = id;
      d.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#000;color:#17ff5f;border:1px solid #17ff5f;box-shadow:0 0 24px rgba(23,255,95,.45);font:13px/1.5 monospace;padding:16px 18px;border-radius:10px;max-width:330px;text-shadow:0 0 6px rgba(23,255,95,.6)';
      var ICO = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#17ff5f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px;margin-right:7px;filter:drop-shadow(0 0 4px rgba(23,255,95,.7))"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><circle cx="8.5" cy="11" r="2.3"/><path d="M5 16.5c.7-1.7 2-2.6 3.5-2.6s2.8.9 3.5 2.6M14.5 9.5h4.5M14.5 13h3"/></svg>';
      var h = '<button title="Cerrar" style="position:absolute;top:6px;right:8px;background:none;border:0;color:#17ff5f;font:16px monospace;cursor:pointer;opacity:.7">✕</button>';
      if (pack && cobro) {
        // pack: un solo mensaje que deja claro que es un único pago para todas las aplicaciones
        var f = String(r.vence || '').split('-').reverse().join('/');
        h += '<b style="font-size:15px">' + ICO + 'Licencia de tu pack de aplicaciones de FuturMovil</b><br>'
          + (r.estado === 'bloqueada' ? 'La licencia de tu pack está suspendida' : 'La licencia de tu pack venció' + (f ? ' el ' + f : ''))
          + ' y sus <b>' + r.pack + ' aplicaciones</b> se han detenido.'
          + '<div style="margin-top:8px;padding:7px 9px;border:1px dashed rgba(23,255,95,.5);border-radius:6px">Es <b>un único pago</b>' + (r.importe ? ' de <b>' + r.importe + ' €</b>' : '') + ' que reactiva <b>todo el pack</b> a la vez. No tienes que pagar cada aplicación por separado.</div>'
          + (r.codigo ? '<div style="margin-top:8px">Al pagar, escribe en el motivo del pago tu código <b>' + r.codigo + '</b> y el pack se reactivará solo en unos minutos.</div>' : '');
      } else h += '<b style="font-size:15px">' + ICO + (r.app || APP) + '</b><br>' + (r.msg || 'Licencia no válida') + '<br>';
      if (cobro) h += '<a href="' + r.pago + '" target="_blank" style="display:inline-block;margin:10px 8px 0 0;padding:7px 12px;background:#17ff5f;color:#000;text-decoration:none;font-weight:bold;border-radius:6px;text-shadow:none">PAGAR ' + (r.importe ? r.importe + ' €' : '') + (pack ? ' · PACK COMPLETO' : '') + '</a>';
      if (r.soporte) h += '<a href="' + r.soporte + '" target="_blank" style="display:inline-block;margin-top:10px;padding:7px 12px;border:1px solid #17ff5f;color:#17ff5f;text-decoration:none;border-radius:6px">SOPORTE</a>';
      d.innerHTML = h; document.body.appendChild(d);
      d.querySelector('button').onclick = function () { d.remove(); };
    });
  }

  // si la app está apagada se enseña como un fallo de conexión (como mucho una vez cada 10 minutos)
  function errorConexion() {
    if (Date.now() - (+GM_getValue('lic_err', 0) || 0) < 600000) return;
    if (document.getElementById('fmx-err')) return;
    GM_setValue('lic_err', Date.now());
    cuando('document-end', function () {
      var st = document.createElement('style');
      st.textContent = '#fmx-err{position:fixed;right:18px;bottom:18px;z-index:2147483647;width:340px;max-width:calc(100vw - 36px);background:rgba(12,14,22,.94);backdrop-filter:blur(10px);border:1px solid rgba(255,90,90,.35);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.04) inset;font:13px/1.5 system-ui,Segoe UI,Roboto,sans-serif;color:#e8ecf5;padding:16px 16px 14px;overflow:hidden;animation:fmxIn .45s cubic-bezier(.2,1.4,.4,1)}'
        + '#fmx-err:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 3px);pointer-events:none}'
        + '@keyframes fmxIn{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:1;transform:none}}'
        + '#fmx-err .t{display:flex;align-items:center;gap:11px;margin-bottom:6px}'
        + '#fmx-err .i{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:rgba(255,90,90,.12);border:1px solid rgba(255,90,90,.35);animation:fmxPulso 1.6s ease-in-out infinite;flex:none}'
        + '@keyframes fmxPulso{50%{box-shadow:0 0 0 7px rgba(255,90,90,0)}0%,100%{box-shadow:0 0 0 0 rgba(255,90,90,.35)}}'
        + '#fmx-err .i svg{width:20px;height:20px;stroke:#ff6b6b;fill:none;stroke-width:2;stroke-linecap:round}'
        + '#fmx-err b{font-size:15px;letter-spacing:.02em;animation:fmxGlitch 3s infinite}'
        + '@keyframes fmxGlitch{0%,92%,100%{text-shadow:none;transform:none}93%{text-shadow:2px 0 #ff3b6b,-2px 0 #3bd5ff;transform:translateX(1px)}95%{text-shadow:-2px 0 #ff3b6b,2px 0 #3bd5ff;transform:translateX(-1px)}}'
        + '#fmx-err p{margin:0 0 10px;color:#a9b1c4}'
        + '#fmx-err code{display:block;font:11px/1.4 ui-monospace,Consolas,monospace;color:#ff8a8a;opacity:.85;margin-bottom:10px}'
        + '#fmx-err .bar{height:3px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden}'
        + '#fmx-err .bar i{display:block;height:100%;width:40%;background:linear-gradient(90deg,transparent,#ff6b6b,transparent);animation:fmxBar 1.3s linear infinite}'
        + '@keyframes fmxBar{from{transform:translateX(-100%)}to{transform:translateX(250%)}}'
        + '#fmx-err .r{display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:11.5px;color:#7d869b}'
        + '#fmx-err .x{position:absolute;top:10px;right:12px;background:none;border:0;color:#7d869b;font-size:16px;cursor:pointer;padding:2px 4px}#fmx-err .x:hover{color:#fff}'
        + '#fmx-err .fz{margin-top:12px;width:100%;padding:9px 12px;border-radius:10px;border:1px solid rgba(255,107,107,.45);background:rgba(255,107,107,.1);color:#ffd0d0;font:600 12.5px system-ui,Segoe UI,sans-serif;letter-spacing:.04em;cursor:pointer;transition:.2s}'
        + '#fmx-err .fz:hover{background:rgba(255,107,107,.2);color:#fff}#fmx-err .fz:disabled{opacity:.6;cursor:wait}'
        + '#fmx-err.ok{border-color:rgba(43,255,154,.45)}#fmx-err.ok .i{background:rgba(43,255,154,.12);border-color:rgba(43,255,154,.45);animation:none}#fmx-err.ok .i svg{stroke:#2bff9a}#fmx-err.ok .bar i{background:linear-gradient(90deg,transparent,#2bff9a,transparent)}#fmx-err.ok b{animation:none;color:#2bff9a}'
        + '@keyframes fmxNo{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'
        + '#fmx-err .ay{margin-top:12px;font-size:11.5px;line-height:1.45;color:#8a93a8}#fmx-err .ay b{font-size:11.5px;color:#cfd5e2;animation:none}';
      document.head.appendChild(st);
      var d = document.createElement('div'); d.id = 'fmx-err';
      var n = 500 + Math.floor(Math.random() * 4);
      d.innerHTML = '<button class="x" title="Cerrar">&times;</button><div class="t"><div class="i"><svg viewBox="0 0 24 24"><path d="M2 8.8a15 15 0 0 1 20 0M5 12.6a10 10 0 0 1 14 0M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M3 3l18 18"/></svg></div><b>Error de conexión</b></div>'
        + '<p>No hemos podido establecer conexión con el servidor. Puede deberse a un mantenimiento o a una incidencia temporal de la red.</p><code>ERR_CONNECTION_TIMED_OUT · HTTP ' + n + '</code>'
        + '<div class="bar"><i></i></div><div class="r"><span class="rs">Reintentando automáticamente…</span><span>' + new Date().toLocaleTimeString().slice(0, 5) + '</span></div>'
        + '<div class="ay">Pulsa <b>Forzar conexión</b> para volver a intentarlo ahora mismo (como máximo una vez por minuto). Si el problema continúa, se reintentará solo en unos minutos.</div><button class="fz">FORZAR CONEXIÓN</button>';
      document.body.appendChild(d);
      var fuera = function () { d.style.transition = 'opacity .4s, transform .4s'; d.style.opacity = '0'; d.style.transform = 'translateY(16px)'; setTimeout(function () { d.remove(); st.remove(); }, 450); };
      var tm = setTimeout(fuera, 20000);
      d.onmouseenter = function () { clearTimeout(tm); };
      d.querySelector('.x').onclick = fuera;
      // FORZAR CONEXIÓN: pregunta al servidor ahora mismo; si ya está encendida, guarda el script y lo arranca
      var fz = d.querySelector('.fz'), rs = d.querySelector('.rs'), etq = 'FORZAR CONEXIÓN';
      // como mucho una petición por minuto, aunque pulse muchas veces
      var espera = function () { if (!d.isConnected || !fz.isConnected) return;
        var q = 60000 - (Date.now() - (+GM_getValue('lic_fz', 0) || 0));
        if (q <= 0) { fz.disabled = false; fz.textContent = etq; return; }
        fz.disabled = true; fz.textContent = 'DISPONIBLE EN ' + Math.ceil(q / 1000) + ' S'; setTimeout(espera, 1000); };
      espera();
      var falla = function () { etq = 'VOLVER A INTENTARLO'; espera(); rs.textContent = 'El servidor sigue sin responder · ' + new Date().toLocaleTimeString().slice(0, 5);
        d.querySelector('p').textContent = 'El servicio continúa sin estar disponible en este momento. Inténtalo de nuevo en unos minutos.'; d.style.animation = 'fmxNo .35s'; setTimeout(function () { d.style.animation = ''; }, 400); };
      fz.onclick = function () {
        if (Date.now() - (+GM_getValue('lic_fz', 0) || 0) < 60000) return espera();
        GM_setValue('lic_fz', Date.now());
        clearTimeout(tm); fz.disabled = true; fz.textContent = 'CONECTANDO…'; rs.textContent = 'Estableciendo conexión segura…';
        GM_xmlhttpRequest({
          method: 'GET', url: API + '?a=script&k=' + LIC + '&app=' + APP + '&d=' + dev + '&ua=' + encodeURIComponent(navigator.userAgent), timeout: 25000,
          onload: function (x) {
            var r = null; try { r = JSON.parse(x.responseText); } catch (e) {}
            if (r && r.ok && r.code) {
              var nn = { t: Date.now(), lic: LIC, code: r.code, run: runAt(r.code) };
              GM_setValue('lic_cache', JSON.stringify(nn)); GM_setValue('lic_m', JSON.stringify(reglas(r.code))); GM_setValue('lic_no', ''); GM_setValue('lic_err', 0); okConfirmado();
              d.className = 'ok'; d.querySelector('b').textContent = 'Conexión restablecida';
              d.querySelector('svg').innerHTML = '<path d="M20 6 9 17l-5-5"/>';
              d.querySelector('p').textContent = 'Conexión verificada correctamente. El servicio vuelve a estar activo y ya puedes seguir trabajando.'; d.querySelector('code').textContent = 'HTTP 200 · OK · conexión cifrada';
              rs.textContent = 'Conectado · ' + new Date().toLocaleTimeString().slice(0, 5); fz.remove(); var ay = d.querySelector('.ay'); if (ay) ay.remove(); lanza(nn); setTimeout(fuera, 3500);
            } else if (r && !r.ok && r.estado !== 'apagada') {
              GM_setValue('lic_no', JSON.stringify({ t: Date.now(), lic: LIC, r: r })); fuera(); aviso(r);
            } else {
              if (r) GM_setValue('lic_no', JSON.stringify({ t: Date.now(), lic: LIC, r: r }));
              falla();
            }
          },
          onerror: falla, ontimeout: falla
        });
      };
    });
  }

  var c = null;
  try { c = JSON.parse(GM_getValue('lic_cache', '') || 'null'); } catch (e) {}
  if (c && c.lic !== LIC) c = null;
  var edad = c ? Date.now() - c.t : Infinity;
  if (c && edad < SIN_RED) lanza(c);       // arranca al instante con la copia guardada
  if (c && edad < REVISA) return;          // comprobada hace poco: no se llama al servidor
  var no = null;
  try { no = JSON.parse(GM_getValue('lic_no', '') || 'null'); } catch (e) {}
  // si otro script de la licencia ya ha visto que está pagada después de este "sin pagar", se descarta y se pregunta al servidor
  if (!c && no && no.lic === LIC && Date.now() - no.t < 600000 && okVisto() < no.t) return aviso(no.r);   // bloqueada: vuelve a preguntar a los 10 min

  GM_xmlhttpRequest({
    method: 'GET', url: API + '?a=script&k=' + LIC + '&app=' + APP + '&d=' + dev + '&ua=' + encodeURIComponent(navigator.userAgent), timeout: 25000,
    onload: function (x) {
      var r; try { r = JSON.parse(x.responseText); } catch (e) { return; }
      if (r.ok && r.code) { var n = { t: Date.now(), lic: LIC, code: r.code, run: runAt(r.code) }; GM_setValue('lic_cache', JSON.stringify(n)); GM_setValue('lic_m', JSON.stringify(reglas(r.code))); GM_setValue('lic_no', ''); okConfirmado(); lanza(n); }
      // licencia al día pero el script aún sin código: queda en espera, sin avisos, y vuelve a mirar a las 3 horas
      else if (r.estado === 'sincodigo') { GM_setValue('lic_cache', JSON.stringify({ t: Date.now(), lic: LIC, code: '', run: 'document-idle' })); GM_setValue('lic_no', ''); }
      else { GM_setValue('lic_cache', ''); GM_setValue('lic_no', JSON.stringify({ t: Date.now(), lic: LIC, r: r })); aviso(r); }
    },
    onerror: function () {}, ontimeout: function () {}
  });
})();
`;
}
function integra(l, a) {
  if (a.tipo === 'script') { const txt = loader(l, a), nom = a.id + '-' + l.codigo.slice(0, 4).toLowerCase() + '.user.js';
    const h = modal(`<h3>Loader de ${esc(l.cliente)}<button class="x">✕</button></h3><p class="ds">Este es el archivo que instala el cliente en Tampermonkey. Lleva su licencia dentro, guarda el script real y comprueba el pago cada ${REVISA_H} horas: si deja de pagar, se bloquea en la siguiente comprobación. ${D.scripts[a.id] ? '' : '<b class="c-warn">Ojo: todavía no has subido el código del script (pestaña Apps).</b>'}</p><pre class="code">${esc(txt)}</pre><div class="bts"><button class="btn" id="iC">${ic('copia')}Copiar</button><button class="btn pri" id="iD">${ic('inst')}DESCARGAR</button></div>`);
    h.querySelector('#iC').onclick = () => copia(txt, 'Loader copiado'); h.querySelector('#iD').onclick = () => baja(nom, txt); return; }
  const s1 = `<script src="${URL_PANEL}licencia.js" data-app="${a.id}" data-licencia="${l.codigo}"><\/script>`;
  const s2 = `// Pega esto en el Code.gs de la app del cliente\nfunction licenciaOK_() {\n  var c = CacheService.getScriptCache(), v = c.get('licencia');\n  if (!v) {\n    try {\n      v = UrlFetchApp.fetch('${API}?a=check&k=${l.codigo}&app=${a.id}&d=servidor', { muteHttpExceptions: true }).getContentText();\n      c.put('licencia', v, 600);\n    } catch (e) { return { ok: true }; }\n  }\n  try { return JSON.parse(v); } catch (e) { return { ok: true }; }\n}\n\n// Y al principio de doGet / de cada función del servidor:\n//   var lic = licenciaOK_();\n//   if (!lic.ok) return ContentService.createTextOutput(JSON.stringify({ ok: false, licencia: lic }));`;
  const h = modal(`<h3>Integrar en ${esc(a.nombre)}<button class="x">✕</button></h3><p class="ds">Licencia de ${esc(l.cliente)}. Elige según cómo esté hecha la app (o pon las dos).</p>
  <h5>A · En el index.html (GitHub Pages)</h5><p class="ds" style="margin-bottom:8px">Pega esta línea dentro del &lt;head&gt;. Muestra la pantalla de bloqueo con el botón de pago si no está al día.</p><pre class="code">${esc(s1)}</pre><button class="btn min" id="i1">${ic('copia')}Copiar</button>
  <h5>B · En su Apps Script (más seguro)</h5><p class="ds" style="margin-bottom:8px">La comprobación la hace el servidor, así que el cliente no puede saltársela.</p><pre class="code">${esc(s2)}</pre><button class="btn min" id="i2">${ic('copia')}Copiar</button>`);
  h.querySelector('#i1').onclick = () => copia(s1, 'Línea copiada'); h.querySelector('#i2').onclick = () => copia(s2, 'Código copiado');
}

/* ---------- apps ---------- */
function vApps(cat) {
  const juego = cat === 'juego';
  const tarjeta = (a, i) => { const ls = D.lics.filter(l => idsDe(l.app).includes(a.id)), act = ls.filter(l => l.ef === 'activa'), pend = ls.filter(l => l.ef === 'pendiente'), kb = D.scripts[a.id];
    const off = a.estado === 'apagada', c = catDe(a);
    return `<div class="card appc tilt st ${off ? 'apagada' : ''}" style="--i:${i}" data-a="${a.id}"><div class="brillo"></div><div class="atop"><div class="ico">${ic(CAT[c].ic)}</div>${off ? '<span class="chip c-mal">Apagada</span>' : ''}<button class="sw ${off ? '' : 'on'}" title="Encender / apagar para todos los clientes"></button></div><h4>${esc(a.nombre)}</h4>
    <span style="font-size:11.5px;color:var(--sua)">${CAT[c].t} · id <span style="font-family:var(--mono);color:var(--cian)">${a.id}</span></span>
    ${c === 'juego' ? `<div class="meta" style="margin-top:14px"><span>Pagadas <b class="c-ok">${act.length}</b></span><span>Pendientes <b class="c-warn">${pend.length}</b></span><span>Total <b>${eur(act.reduce((s, l) => s + num(l.precio, 0), 0))}</b></span></div>
    <div class="meta" style="margin-top:8px"><span>Precio <b>${eur(a.precio)}</b> · pago único</span></div>`
    : `<div class="meta" style="margin-top:14px"><span>Licencias <b>${ls.length}</b></span><span>Activas <b class="c-ok">${act.length}</b></span><span>Mensual <b>${eur(act.reduce((s, l) => s + num(l.precio, 0), 0))}</b></span></div>`}
    ${c === 'script' ? `<div class="meta" style="margin-top:8px"><span>Código: <b class="${kb ? 'c-ok' : 'c-warn'}">${kb ? Math.round(kb / 102.4) / 10 + ' KB subido' : 'sin subir'}</b></span></div>` : ''}</div>`; };
  const lista = D.apps.filter(a => catDe(a) === cat);
  const tit = { script:['SCRIPTS', 'Scripts de Tampermonkey que vendes con licencia'], web:['APLICACIONES', 'Aplicaciones web que vendes con licencia'], juego:['JUEGOS', 'Juegos con licencia vitalicia: la crea el propio juego cuando el jugador pulsa pagar'] }[cat];
  $('#main').innerHTML = `<div class="vista">${cab(tit[0], tit[1] + (lista.length > 1 ? ' · mantén pulsada una tarjeta para moverla' : ''), bNueva('bNApp'))}
  ${lista.length ? `<div class="grid gapp">${lista.map(tarjeta).join('')}</div>` : `<div class="vacio">${ic(CAT[cat].ic)}${juego ? 'Aún no hay juegos. Se crean solos cuando un juego conectado pide su primera licencia, o puedes darlos de alta con NUEVA' : 'Aún no hay nada aquí. Da de alta el primero con el botón NUEVA'}</div>`}</div>`;
  $('#bNApp').onclick = () => editaApp(null, cat);
  // el orden se guarda para todas las apps: las de esta sección en el orden nuevo y las demás donde estaban
  const todas = () => { const sec = [...$('#main').querySelectorAll('[data-a]')].map(c => c.dataset.a); let k = 0; return D.apps.map(a => catDe(a) === cat ? sec[k++] : a.id); };
  $('#main').querySelectorAll('.gapp').forEach(g => ordenable(g, '[data-a]', 'a', todas, ids => api('appsOrden', { ids }), (id, e) => e && e.target.closest('.sw') ? onOffApp(id) : editaApp(id)));
}
async function onOffApp(id) { const a = app1(id), off = a.estado !== 'apagada';
  if (off && !await confirma('Apagar ' + a.nombre, (catDe(a) === 'script' ? 'Dejará de funcionar para todos los clientes que lo usan, aunque tengan la licencia pagada, en su próxima comprobación (como mucho 3 horas). Les saldrá un aviso de «Error de conexión». El resto de scripts de su licencia seguirán funcionando.' : 'Dejará de funcionar para todos los clientes que la usan, aunque tengan la licencia pagada, en cuanto vuelva a comprobar la licencia. Les saldrá el aviso de que está desactivada temporalmente.'), 'Apagar')) return;
  const r = await api('appEstado', { id, estado: off ? 'apagada' : '' }); if (r.ok) { toast(off ? 'Aplicación apagada' : 'Aplicación encendida', off); pinta(); } else toast(r.error || 'No se ha podido cambiar', true);
}
// Mantener pulsada una tarjeta medio segundo la coge; se arrastra y al soltarla se guarda el orden
function ordenable(grid, sel, key, leer, guardar, abrir) {
  let timer = null, sx = 0, sy = 0, gx = 0, gy = 0, card = null, arrastra = false, ini = '';
  // la tarjeta cogida va pegada al ratón o al dedo
  const sigue = (c, x, y) => { const g = grid.getBoundingClientRect();
    c.style.setProperty('transform', `translate(${x - gx - g.left - c.offsetLeft}px,${y - gy - g.top - c.offsetTop}px) scale(1.05)`, 'important'); };
  const fin = async () => { clearTimeout(timer); const c = card; card = null; if (!c || !arrastra) return;
    arrastra = false; c.style.removeProperty('transform'); c.classList.remove('coge'); grid.classList.remove('ordenando'); document.body.classList.remove('sinsel');
    const ids = leer(); if (ids.join() === ini) return;
    const r = await guardar(ids); if (r && r.ok) toast('Orden guardado'); else { toast((r && r.error) || 'No se ha podido guardar el orden', true); pinta(); } };
  grid.querySelectorAll(sel).forEach(c => {
    c.onclick = e => { if (c.dataset.movido) { delete c.dataset.movido; return; } abrir(c.dataset[key], e); };
    c.oncontextmenu = e => e.preventDefault();
    c.onpointerdown = e => { if (e.button > 0) return; card = c; sx = e.clientX; sy = e.clientY; ini = leer().join(); clearTimeout(timer);
      timer = setTimeout(() => { if (card !== c) return; arrastra = true; c.dataset.movido = '1'; const r0 = c.getBoundingClientRect(); gx = sx - r0.left; gy = sy - r0.top; c.classList.add('coge'); sigue(c, sx, sy); grid.classList.add('ordenando'); document.body.classList.add('sinsel');
        if (navigator.vibrate) navigator.vibrate(40); bip(520, .04); try { c.setPointerCapture(e.pointerId); } catch (x) {} }, 450); };
    c.onpointermove = e => { if (card !== c) return;
      if (!arrastra) { if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 10) { clearTimeout(timer); card = null; } return; }
      e.preventDefault();
      const otro = document.elementsFromPoint(e.clientX, e.clientY).map(el => el.closest && el.closest(sel)).find(el => el && el !== c && el.parentNode === grid);
      if (otro) { const r = otro.getBoundingClientRect(), antes = [...grid.children].indexOf(otro) < [...grid.children].indexOf(c);
        if (antes ? e.clientX < r.right - r.width * .35 || e.clientY < r.top + r.height * .35 : e.clientX > r.left + r.width * .35 || e.clientY > r.bottom - r.height * .35)
          grid.insertBefore(c, antes ? otro : otro.nextSibling); }
      sigue(c, e.clientX, e.clientY); };
    c.onpointerup = c.onpointercancel = fin;
  });
}
document.addEventListener('touchmove', e => { if (document.body.classList.contains('sinsel')) e.preventDefault(); }, { passive:false });
const urlsDe = v => String(v || '').split(/[\s,]+/).filter(Boolean);
function editaApp(id, cat) {
  const a = id ? appDe(id) : { nombre:'', tipo:cat || 'web', precio:'', url:'', notas:'' };
  const h = modal(`<h3>${id ? esc(a.nombre) : 'Nueva aplicación'}<button class="x">✕</button></h3><p class="ds">${id ? 'Identificador: ' + id : 'Una aplicación web, un juego o un script de Tampermonkey. Se guarda en su sección.'}</p>
  <form id="fApp"><div class="campo"><label>Nombre</label><input class="in" name="nombre" value="${esc(a.nombre)}" required placeholder="Ej. Panel Puntofibra"></div>
  <div class="par"><div class="campo"><label>Tipo</label><select class="in" name="tipo"><option value="web" ${catDe(a) === 'web' ? 'selected' : ''}>Aplicación web</option><option value="juego" ${catDe(a) === 'juego' ? 'selected' : ''}>Juego</option><option value="script" ${catDe(a) === 'script' ? 'selected' : ''}>Script Tampermonkey</option></select></div>
  <div class="campo"><label id="lPre">Mensualidad sugerida (€)</label><input class="in" name="precio" inputmode="decimal" value="${esc(a.precio)}" placeholder="Solo de referencia"></div></div>
  <div class="campo"><label id="lUrl"></label><div id="lstUrl"></div><button class="btn min w" type="button" id="bUrl" style="margin-top:6px">${ic('mas')}Añadir otra dirección</button><input type="hidden" name="url"></div>
  <div class="campo"><label>Notas</label><input class="in" name="notas" value="${esc(a.notas)}"></div>
  <button class="btn pri w" type="submit">GUARDAR</button></form>
  ${id ? `<div id="zScr"><h5>Código real del script</h5><p class="ds" style="margin-bottom:8px">Pega aquí el script completo. Se guarda en tu Sheet y solo se entrega a los clientes con la licencia al día.</p><textarea class="in" id="tScr" placeholder="Cargando…" style="min-height:150px"></textarea><button class="btn ok w" id="bScr" style="margin-top:8px">Subir código</button></div>
  <h5>Zona peligrosa</h5><button class="btn mal min" id="aDel">Eliminar aplicación</button>` : ''}`);
  const f = h.querySelector('#fApp'), tipo = f.elements.tipo;
  const lst = h.querySelector('#lstUrl'), esScr = () => tipo.value === 'script';
  const fila = v => { const d = document.createElement('div'); d.className = 'murl';
    d.innerHTML = `<input class="in" value="${esc(v || '')}" placeholder="${esScr() ? 'https://www.ejemplo.com/*' : 'https://…'}" spellcheck="false"><button class="btn min mal" type="button" title="Quitar">${ic('bor')}</button>`;
    d.querySelector('button').onclick = () => { if (lst.children.length > 1) d.remove(); else d.querySelector('input').value = ''; marca(); };
    lst.appendChild(d); return d.querySelector('input'); };
  const marca = () => { const s = esScr(), n = lst.children.length; lst.classList.toggle('una', n < 2); h.querySelector('#bUrl').hidden = !s;
    lst.querySelectorAll('input').forEach(i => i.placeholder = s ? 'https://www.ejemplo.com/*' : 'https://…'); };
  (urlsDe(a.url).length ? urlsDe(a.url) : ['']).forEach(fila);
  h.querySelector('#bUrl').onclick = () => { fila('').focus(); marca(); };
  const pon = () => { const s = esScr(), j = tipo.value === 'juego'; h.querySelector('#lUrl').textContent = s ? 'Dónde se ejecuta (@match)' : j ? 'URL del juego (opcional)' : 'URL de la app (opcional)';
    h.querySelector('#lPre').textContent = j ? 'Precio de la licencia (€, pago único)' : 'Mensualidad sugerida (€)'; f.elements.precio.placeholder = j ? 'Lo que paga el jugador' : 'Solo de referencia';
    if (!s) [...lst.children].slice(1).forEach(d => d.remove()); marca(); const z = h.querySelector('#zScr'); if (z) z.hidden = !s; };
  pon(); tipo.onchange = pon;
  f.onsubmit = async e => { e.preventDefault(); f.elements.url.value = [...lst.querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean).join(' ');
    const app = Object.fromEntries(new FormData(f)); if (id) app.id = id; const r = await api('appGuardar', { app }); if (!r.ok) return toast(r.error, true);
    cierra(); const dest = CAT[catDe(app)].v; toast(dest === vista ? 'Guardada' : 'Guardada en ' + dest.charAt(0).toUpperCase() + dest.slice(1)); if (dest !== vista && /^(scripts|aplicaciones|juegos|apps)$/.test(vista)) ir(dest); else pinta(); };
  if (!id) return;
  const t = h.querySelector('#tScr'), bS = h.querySelector('#bScr');
  // mientras se carga el código guardado no se puede pegar, para que la carga no borre lo que pegas
  const listo = () => { t.readOnly = false; bS.disabled = false; t.placeholder = '// pega aquí el código del script'; };
  t.readOnly = true; bS.disabled = true;
  if (a.tipo === 'script') api('scriptLeer', { id }).then(r => { if (!t.value) t.value = r.code || ''; listo(); }).catch(listo); else listo();
  bS.onclick = async () => { const code = t.value;
    if (!code.trim()) return toast('Pega primero el código del script', true);
    bS.disabled = true; bS.textContent = 'Subiendo…';
    const r = await api('scriptGuardar', { id, code });
    bS.disabled = false; bS.textContent = 'Subir código';
    if (r.ok && D.scripts[id] === code.length) { toast('Código subido (' + code.length.toLocaleString('es-ES') + ' caracteres)'); modal.sucio = false; pinta(); }
    else toast(r.ok ? 'No se ha guardado entero. Vuelve a darle a Subir código' : (r.error || 'No se ha podido subir'), true); };
  h.querySelector('#aDel').onclick = async () => { if (await confirma('Eliminar aplicación', 'Se borrará ' + a.nombre + ' del panel.')) { const r = await api('appBorrar', { id }); if (r.ok) { toast('Aplicación eliminada'); pinta(); } else toast(r.error, true); } };
}

/* ---------- pagos / actividad ---------- */
function vPagos() { const ps = D.pagos.slice().reverse(), tot = ps.reduce((s, p) => s + num(p.importe, 0), 0);
  $('#main').innerHTML = `<div class="vista">${cab('PAGOS', ps.length + ' pagos apuntados · ' + eur(tot) + ' en total')}
  ${tarjetaMypos()}<div class="card st" style="margin-top:14px">${ps.length ? `<div class="scrollx"><table class="tabla"><tr><th>Fecha</th><th>Cliente</th><th>App</th><th>Meses</th><th>Importe</th><th></th></tr>${ps.map(p => `<tr><td class="m">${fecha(p.fecha)}</td><td>${esc(p.cliente)}</td><td>${esc(appDe(p.app).nombre)}</td><td class="m">${esc(p.meses)}</td><td class="m c-ok">${eur(p.importe)}</td><td><button class="btn min mal" data-p="${p.id}">✕</button></td></tr>`).join('')}</table></div>` : `<div class="vacio">${ic('pagos')}Los pagos se apuntan solos cada vez que renuevas una licencia</div>`}</div></div>`;
  eventosMypos();
  $('#main').querySelectorAll('[data-p]').forEach(b => b.onclick = async () => { if (await confirma('Borrar pago', 'Se quita este pago del registro. La fecha de vencimiento de la licencia no cambia.', 'Borrar')) { const r = await api('pagoBorrar', { id:b.dataset.p }); if (r.ok) { toast('Pago borrado'); pinta(); } } }); }
// pagos que llegan por myPOS (los lee el servidor de tu Gmail cada 10 minutos)
const horaDe = f => fecha(f) + ' ' + String(f || '').slice(11, 16);
function tarjetaMypos() {
  const mp = D.mypos || [], sin = mp.filter(g => g.estado === 'sin asignar'), hechos = mp.filter(g => g.estado !== 'sin asignar').slice(0, 8);
  const opc = imp => D.lics.slice().sort((a, b) => (num(b.precio, 0) === num(imp, -1)) - (num(a.precio, 0) === num(imp, -1)) || String(a.cliente).localeCompare(String(b.cliente)))
    .map(l => `<option value="${esc(l.codigo)}">${num(l.precio, 0) === num(imp, -1) ? '★ ' : ''}${esc(l.cliente)} · ${esc(appDe(l.app).nombre)} · ${eur(l.precio)}</option>`).join('');
  return `<div class="card bloque st mpos"><h3>${ic('pagos')}Pagos myPOS automáticos<span class="chip ${D.myposOn ? 'c-ok' : 'c-warn'}" style="margin-left:auto">${D.myposOn ? 'Activo' : 'Sin activar'}</span></h3>
  <p class="ds">${D.myposOn ? 'Cada 10 minutos se leen los avisos de pago de myPOS de tu Gmail y se renueva sola la licencia: por el código que el cliente escribe en el motivo o, si no lo pone, por el importe cuando solo hay una licencia pendiente con ese precio.' + (D.myposUlt ? ' Última revisión: ' + horaDe(D.myposUlt) + '.' : '') : 'Todavía no está activado en el servidor.'}</p>
  ${sin.length ? `<h5 class="c-warn">Sin asignar (${sin.length})</h5>` + sin.map(g => `<div class="mp"><div class="g"><b>${eur(g.importe)} · ${esc(g.de || 'Sin nombre')}</b><small>${horaDe(g.fecha)} · motivo: «${esc(g.motivo || '—')}»</small><small class="c-warn">${esc(g.nota)}</small></div>
    <div class="acc"><select class="in" data-sel="${esc(g.id)}"><option value="">Elige la licencia…</option>${opc(g.importe)}</select><button class="btn min ok" data-as="${esc(g.id)}">Asignar</button><button class="btn min" data-ig="${esc(g.id)}">Ignorar</button></div></div>`).join('') : ''}
  ${hechos.length ? `<h5>Últimos pagos</h5>` + hechos.map(g => { const l = D.lics.find(x => x.codigo === g.codigo);
    return `<div class="fila"><i class="pt ${g.estado === 'asignado' ? 'c-ok' : 'c-mal'}" style="animation:none"></i><div class="g"><b>${eur(g.importe)} · ${esc(l ? l.cliente : g.de || '—')}</b><small>${horaDe(g.fecha)} · ${esc(g.estado === 'asignado' ? '+' + (g.meses || 1) + ' mes' + (g.meses > 1 ? 'es' : '') + ' · ' + g.nota : g.nota)}</small></div></div>`; }).join('') : ''}
  ${D.myposOn ? `<div class="bts" style="margin-top:12px"><button class="btn" id="bMp">${ic('rec')}Revisar correos ahora</button></div>` : ''}</div>`;
}
function eventosMypos() {
  const b = $('#bMp');
  if (b) b.onclick = async () => { b.disabled = true; b.textContent = 'Revisando…'; const r = await api('myposRevisar');
    if (r.ok) toast(r.nuevos ? r.nuevos + (r.nuevos === 1 ? ' pago nuevo' : ' pagos nuevos') : 'No hay pagos nuevos'); else toast(r.error || 'No se ha podido revisar', true); pinta(); };
  $('#main').querySelectorAll('[data-as]').forEach(x => x.onclick = async () => { const id = x.dataset.as, k = $(`[data-sel="${id}"]`).value;
    if (!k) return toast('Elige la licencia de este pago', true);
    const r = await api('myposAsignar', { id, codigo:k }); if (r.ok) { chispas(innerWidth / 2, innerHeight / 2); toast('Pago asignado y licencia renovada'); pinta(); } else toast(r.error, true); });
  $('#main').querySelectorAll('[data-ig]').forEach(x => x.onclick = async () => {
    if (await confirma('Ignorar pago', 'Este pago no renovará ninguna licencia. Úsalo para cobros que no son de licencias.', 'Ignorar')) { const r = await api('myposIgnorar', { id:x.dataset.ig }); if (r.ok) { toast('Pago ignorado'); pinta(); } else toast(r.error, true); } });
}
function vAct() { $('#main').innerHTML = `<div class="vista">${cab('ACTIVIDAD', 'Altas, renovaciones, bloqueos y accesos denegados')}<div class="card bloque st">${D.log.length ? D.log.map(filaLog).join('') : `<div class="vacio">${ic('act')}Todavía no hay actividad</div>`}</div></div>`; }

/* ---------- ajustes ---------- */
const normLlave = v => String(v || '').replace(/[^0-9a-f]/gi, '').toUpperCase();
const listaLlaves = t => [...new Set(String(t || '').split(',').map(normLlave).filter(Boolean))];
async function guardaLlaves(lista, msg) { const c = D.cfg;
  const r = await api('cfgGuardar', { cfg:{ tag:c.tag, whatsapp:c.whatsapp, gracia:c.gracia, maxDisp:c.maxDisp, aviso:c.aviso, llaves:lista.join(',') } });
  if (r.ok) { if (!r.datos) await api('datos'); toast(msg); pinta(); } else toast(r.error, true); }
function vAjustes() { const c = D.cfg, ks = listaLlaves(c.llaves);
  $('#main').innerHTML = `<div class="vista">${cab('AJUSTES', '')}<div class="aj">
  <div class="card bloque st" style="--i:0"><h3>Cobro, soporte y reglas</h3><form id="fCfg"><div class="campo"><label>Tag de myPOS</label><input class="in" name="tag" value="${esc(c.tag)}"></div><div class="campo"><label>WhatsApp de soporte (con 34)</label><input class="in" name="whatsapp" inputmode="tel" value="${esc(c.whatsapp)}"></div>
  <div class="par"><div class="campo"><label>Días de gracia</label><input class="in" name="gracia" inputmode="numeric" value="${esc(c.gracia)}"></div><div class="campo"><label>Dispositivos / licencia</label><input class="in" name="maxDisp" inputmode="numeric" value="${esc(c.maxDisp)}"></div></div>
  <div class="campo"><label>Avisar al cliente (días antes)</label><input class="in" name="aviso" inputmode="numeric" value="${esc(c.aviso)}"></div>
  <input type="hidden" name="llaves" value="${esc(c.llaves)}"><button class="btn pri w" type="submit">GUARDAR</button></form></div>
  <div class="card bloque st" style="--i:1"><h3>Llaves NFC</h3><p>${ks.length ? 'Estas llaves abren el panel. Borra la que ya no uses o hayas perdido.' : 'No hay ninguna llave dada de alta.'}</p>
  ${ks.map((k, n) => `<div class="fila llave"><span class="lico">${ic('nfc')}</span><div class="g"><b>Llave ${n + 1}</b><small>${esc(k)}</small></div><button class="btn min mal" data-k="${esc(k)}" title="Borrar llave">${ic('bor')}</button></div>`).join('')}
  <button class="btn w ok" id="bLlave" style="margin-top:12px">${ic('mas')}Añadir llave</button></div>
  <div class="card bloque st" style="--i:2"><h3>Google Authenticator</h3><p>${D.totp ? '<b class="c-ok">Activado.</b> Puedes entrar solo con el código de 6 dígitos.' : 'Actívalo para entrar al panel solo con el código de 6 dígitos.'}</p><button class="btn w ${D.totp ? 'mal' : 'ok'}" id="bTotp">${D.totp ? 'Desactivar' : 'Activar Authenticator'}</button></div>
  <div class="card bloque st" style="--i:3"><h3>Datos y sesión</h3><p>Todo se guarda en tu Sheet «licencias». La sesión se cierra sola cada día a las 00:00.</p><div class="bts"><a class="btn" href="${esc(D.hoja)}" target="_blank" rel="noopener">${ic('hoja')}Abrir Sheet</a><button class="btn" id="aInst">${ic('inst')}Instalar</button><button class="btn" id="aComp">${ic('comp')}Compartir</button><button class="btn mal" id="aSal">${ic('sal')}Cerrar sesión</button></div></div></div></div>`;
  $('#fCfg').onsubmit = async e => { e.preventDefault(); const r = await api('cfgGuardar', { cfg:Object.fromEntries(new FormData(e.target)) }); if (r.ok) { toast('Ajustes guardados'); pinta(); } else toast(r.error, true); };
  $('#main').querySelectorAll('[data-k]').forEach(b => b.onclick = async () => { const k = b.dataset.k;
    if (ks.length === 1 && !D.totp) return toast('Es tu única llave: activa antes Google Authenticator', true);
    if (await confirma('Borrar llave', 'La llave ' + k + ' dejará de abrir el panel' + (ks.length === 1 ? '. Es la última: solo podrás entrar con Google Authenticator.' : '.'), 'Borrar')) guardaLlaves(ks.filter(x => x !== k), 'Llave borrada'); });
  $('#bLlave').onclick = () => { const nfc = 'NDEFReader' in window;
    const h = modal(`<h3>Añadir llave<button class="x">✕</button></h3><div class="cen">${nfc ? NFC_HTML + '<p class="ds" id="nfcMsg">Acerca la llave nueva a la parte trasera del móvil</p>' : '<p class="ds">Abre el panel en un móvil Android para leerla por NFC, o escribe aquí su número de serie.</p>'}
    <input class="in" id="kSer" placeholder="Número de serie" autocapitalize="characters" style="font-family:var(--mono);text-align:center;margin-bottom:10px"><button class="btn pri w" id="kOk">AÑADIR</button></div>`);
    const alta = v => { const k = normLlave(v); if (k.length < 8) return toast('Número de serie no válido', true); if (ks.includes(k)) return toast('Esa llave ya está dada de alta', true); paraNfc(); cierra(); guardaLlaves(ks.concat(k), 'Llave añadida'); };
    h.querySelector('#kOk').onclick = () => alta(h.querySelector('#kSer').value);
    if (nfc) { cierra.fn = paraNfc; leeNfc(s => { if (navigator.vibrate) navigator.vibrate(60); alta(s); }, m => { const e = h.querySelector('#nfcMsg'); if (e) e.textContent = m; }); } };
  $('#bTotp').onclick = async () => { if (D.totp) { if (await confirma('Desactivar Authenticator', 'Ya no podrás entrar con el código de 6 dígitos.', 'Desactivar')) { await api('totpQuitar'); await api('datos'); toast('Authenticator desactivado'); pinta(); } return; }
    const r = await api('totpNuevo'); if (!r.ok) return toast(r.error, true);
    const h = modal(`<h3>Google Authenticator<button class="x">✕</button></h3><div class="cen"><p class="ds">Escanea el QR con la app Google Authenticator y escribe el código que te salga.</p>${qrHtml(r.uri)}<button class="cod" id="tSec"><span style="font-size:10.5px;word-break:break-all">${r.secreto}</span>${ic('copia')}</button>
    <input class="in codigo6" id="tCod" inputmode="numeric" maxlength="6" placeholder="Código de 6 dígitos" style="margin-bottom:10px"><button class="btn pri w" id="tOk">CONFIRMAR</button></div>`);
    h.querySelector('#tSec').onclick = () => copia(r.secreto, 'Clave copiada');
    h.querySelector('#tOk').onclick = async () => { const x = await api('totpConfirmar', { codigo:h.querySelector('#tCod').value }); if (x.ok) { await api('datos'); cierra(); toast('Authenticator activado'); pinta(); } else toast(x.error, true); }; };
  $('#aInst').onclick = instalar; $('#aComp').onclick = compartir; $('#aSal').onclick = () => salir();
}

/* ---------- arranque ---------- */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
// actualización automática: si cambia el programa en GitHub, se recarga solo (sin pillarte a medias con una ficha abierta)
(function () {
  const FIL = ['index.html', 'app.js', 'estilos.css', 'config.js', 'sw.js'];
  let base = null, yendo = false;
  const firma = () => Promise.all(FIL.map(f => fetch(f + '?v=' + Date.now(), { method: 'HEAD', cache: 'no-store' })
    .then(r => r.ok ? (r.headers.get('etag') || r.headers.get('last-modified') || '-') : '').catch(() => '')));
  async function mira() {
    if (yendo || document.hidden) return;
    const fs = await firma(); if (fs.some(x => !x)) return;   // sin conexión: se mira en la próxima
    const k = fs.join('|'); if (base === null) { base = k; return; }
    if (k !== base) actualiza();
  }
  function actualiza() {
    yendo = true;
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:99999;display:flex;align-items:center;gap:12px;padding:12px 18px;border-radius:16px;background:rgba(10,14,30,.92);border:1px solid rgba(61,245,255,.45);box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 24px rgba(61,245,255,.18);color:#e8eefc;font:600 13px system-ui,sans-serif;backdrop-filter:blur(10px)';
    d.innerHTML = '<span style="width:16px;height:16px;border-radius:50%;border:2px solid rgba(61,245,255,.3);border-top-color:#3df5ff;animation:fmxGira .8s linear infinite"></span><span id="fmxAct">Nueva versión del programa · actualizando…</span><style>@keyframes fmxGira{to{transform:rotate(360deg)}}</style>';
    document.body.appendChild(d);
    let n = 4; const t = setInterval(() => {
      const ficha = !$('#modal').hidden;   // con una ficha abierta espera a que la cierres o guardes
      d.querySelector('#fmxAct').textContent = ficha ? 'Nueva versión lista · se actualizará al cerrar esta ventana' : 'Nueva versión del programa · actualizando en ' + Math.max(0, n) + ' s';
      if (ficha) return; if (n-- <= 0) { clearInterval(t); location.reload(); }
    }, 1000);
  }
  setTimeout(mira, 4000); setInterval(mira, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) mira(); });
})();
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) fuera(); });
(async function () {
  const par = new URLSearchParams(location.search).get('par');
  if (par) return modoPasarLlave(par);
  if (TOKEN) { const r = await api('datos'); if (r.ok) { $('#app').hidden = false; ir('inicio'); refrescaEnlaces(); return; } if (!$('#login').hidden) return; }
  verLogin();
})();
