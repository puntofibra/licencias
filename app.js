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
  if (c.classList.contains('tilt')) c.style.transform = `perspective(900px) rotateX(${(.5 - y) * 5}deg) rotateY(${(x - .5) * 6}deg) translateY(-3px)`;
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
function estadoDe(l) {
  if (l.ef === 'bloqueada') return { k:'bloqueadas', t:'Bloqueada', c:'c-mal', col:'var(--mal)' };
  if (l.ef === 'vencida') return { k:'vencidas', t:'Vencida', c:'c-mal', col:'var(--mal)' };
  if (l.enGracia) return { k:'vencer', t:'En gracia', c:'c-warn', col:'var(--warn)' };
  if (l.dias != null && l.dias <= 7) return { k:'vencer', t:l.dias === 0 ? 'Vence hoy' : 'Vence en ' + l.dias + ' d', c:'c-warn', col:'var(--warn)' };
  return { k:'activas', t:'Activa', c:'c-ok', col:'var(--ok)' };
}
function enlacePago(imp) { const n = num(imp, 0), b = 'https://mypos.com/@' + D.cfg.tag; return n > 0 ? b + '/' + (n % 1 ? n.toFixed(2) : n) : b; }
function waCliente(l) { let t = String(l.telefono || '').replace(/\D/g, ''); if (t.length === 9) t = '34' + t; const a = appDe(l.app);
  const txt = estadoDe(l).k === 'activas' ? `Hola ${l.cliente}, te escribo por tu licencia de ${a.nombre}.`
    : `Hola ${l.cliente}, tu licencia de ${a.nombre} ${l.dias != null && l.dias < 0 ? 'venció' : 'vence'} el ${fecha(l.vence)}. Puedes renovarla aquí (${eur(l.precio)}): ${enlacePago(l.precio)}\nAl pagar, escribe en el motivo del pago tu código ${l.codigo} y se renovará sola en unos minutos.`;
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
async function entrar(t) { TOKEN = t; localStorage.setItem('lic_token', t); bip(660); setTimeout(() => bip(990), 90); const r = await api('datos'); if (r.ok) { $('#login').hidden = true; $('#app').hidden = false; ir('inicio'); } else verLogin(); }
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
  $('#lgCuerpo').innerHTML = `<div class="cen">${NFC_HTML}<p id="nfcMsg" style="color:var(--sua);margin:10px 0 14px;font-size:13px">Pulsa el botón y acerca tu llave NFC</p><button class="btn pri w" id="bPasar">ACTIVAR LLAVE</button></div>`;
  $('#bPasar').onclick = () => { if (!('NDEFReader' in window)) { $('#nfcMsg').textContent = 'Este navegador no lee NFC. Usa Chrome en Android.'; return; }
    $('#bPasar').hidden = true; $('#nfcMsg').textContent = 'Acerca la llave a la parte trasera del móvil';
    leeNfc(async s => { $('#nfcMsg').textContent = 'Comprobando…'; const r = await api('parAutorizar', { codigo:cod, llave:s });
      if (r.ok) { paraNfc(); $('#nfcMsg').innerHTML = '<b class="c-ok">Llave correcta.</b> Ya puedes cerrar esta pestaña.'; bip(990); } else $('#nfcMsg').textContent = r.error; }, m => { $('#nfcMsg').textContent = m; $('#bPasar').hidden = false; }); };
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
const VISTAS = [['inicio', 'Inicio', 'inicio'], ['licencias', 'Licencias', 'lic'], ['apps', 'Apps', 'apps'], ['pagos', 'Pagos', 'pagos'], ['actividad', 'Actividad', 'act'], ['ajustes', 'Ajustes', 'aj']];
function ir(v) { vista = v; pinta(); $('#main').scrollTop = 0; }
function pinta() {
  const malas = D.lics.filter(l => l.ef !== 'activa').length; const sinA = (D.mypos || []).filter(g => g.estado === 'sin asignar').length;
  $('#nav').innerHTML = `<div class="logo">${ESCUDO}<div><b>LICENCIAS</b><small>FUTURMOVIL</small></div></div>`
    + VISTAS.map(v => `<button class="nb ${vista === v[0] ? 'on' : ''}" data-v="${v[0]}">${ic(v[2])}<span>${v[1]}</span>${v[0] === 'licencias' && malas ? `<em>${malas}</em>` : ''}${v[0] === 'pagos' && sinA ? `<em>${sinA}</em>` : ''}</button>`).join('')
    + `<button class="nb fin" id="nSalir">${ic('sal')}<span>Cerrar sesión</span></button>`;
  $('#nav').querySelectorAll('[data-v]').forEach(b => b.onclick = () => { bip(520, .04); ir(b.dataset.v); });
  $('#nSalir').onclick = () => salir();
  ({ inicio:vInicio, licencias:vLics, apps:vApps, pagos:vPagos, actividad:vAct, ajustes:vAjustes })[vista]();
  $('#main').querySelectorAll('[data-n]').forEach(cuenta);
  const b = $('#bRec'); if (b) b.onclick = async () => { const r = await api('datos'); if (r.ok) { pinta(); toast('Actualizado'); } };
}
const cab = (t, sub, extra) => `<div class="cab"><h2>${t}</h2><span class="sp"></span>${extra || ''}<button class="btn min" id="bRec" title="Actualizar">${ic('rec')}</button>${sub ? `<p>${sub}</p>` : ''}</div>`;
const bNueva = id => `<button class="btn pri min" id="${id}" style="font-size:12px;padding:9px 14px">${ic('mas')}NUEVA</button>`;

/* ---------- inicio ---------- */
function vInicio() {
  const L = D.lics, act = L.filter(l => l.ef === 'activa'), pv = L.filter(l => estadoDe(l).k === 'vencer'), mal = L.filter(l => l.ef !== 'activa');
  const mrr = act.reduce((s, l) => s + num(l.precio, 0), 0), mes = D.hoy.slice(0, 7), pm = D.pagos.filter(p => p.fecha.slice(0, 7) === mes), cob = pm.reduce((s, p) => s + num(p.importe, 0), 0);
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
  const cuentas = { todas:D.lics.length, activas:0, vencer:0, vencidas:0, bloqueadas:0 }; D.lics.forEach(l => cuentas[estadoDe(l).k]++);
  const q = busca.toLowerCase();
  const lista = D.lics.filter(l => (filtro === 'todas' || estadoDe(l).k === filtro) && (!fApp || idsDe(l.app).includes(fApp)) && (!q || (l.cliente + ' ' + l.codigo + ' ' + l.telefono + ' ' + l.email + ' ' + appDe(l.app).nombre + ' ' + idsDe(l.app).map(i => app1(i).nombre).join(' ')).toLowerCase().includes(q)))
    .sort((a, b) => (a.vence || '9999').localeCompare(b.vence || '9999'));
  $('#main').innerHTML = `<div class="vista">${cab('LICENCIAS', '', bNueva('bNueva'))}
  <div class="barra"><input class="in" id="iBusca" placeholder="Buscar cliente, código, teléfono…" value="${esc(busca)}"><select class="in" id="sApp"><option value="">Todas las apps</option>${D.apps.map(a => `<option value="${a.id}" ${fApp === a.id ? 'selected' : ''}>${esc(a.nombre)}</option>`).join('')}</select></div>
  <div class="filtros">${[['todas', 'Todas'], ['activas', 'Activas'], ['vencer', 'Por vencer'], ['vencidas', 'Vencidas'], ['bloqueadas', 'Bloqueadas']].map(f => `<button class="${filtro === f[0] ? 'on' : ''}" data-f="${f[0]}">${f[1]}<i>${cuentas[f[0]]}</i></button>`).join('')}</div>
  <div class="grid">${lista.map(tarjetaLic).join('')}</div>
  ${lista.length ? '' : `<div class="vacio">${ic('lic')}${D.lics.length ? 'Nada con ese filtro' : D.apps.length ? 'Crea tu primera licencia con el botón NUEVA' : 'Primero da de alta una aplicación en la pestaña Apps'}</div>`}</div>`;
  $('#bNueva').onclick = () => { if (D.apps.length) editaLic(); else { toast('Primero crea una aplicación', true); ir('apps'); } };
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
  <div class="meta"><span>Vence <b>${l.vence ? fecha(l.vence) : 'nunca'}</b></span><span><b>${eur(l.precio)}</b>/mes</span><span>Disp. <b>${nd}${mx ? '/' + mx : ''}</b></span></div>
  <div class="acc"><button class="sw ${l.estado !== 'bloqueada' ? 'on' : ''}" title="Activar / bloquear"></button><span class="sp"></span>
  ${l.telefono ? `<a class="btn min" href="${waCliente(l)}" target="_blank" rel="noopener" title="WhatsApp">${ic('wa')}</a>` : ''}<button class="btn min ok bRen">${ic('rec')}+1 mes</button></div></div>`; }
async function renueva(k, meses, x, y) { const r = await api('licRenovar', { codigo:k, meses });
  if (r.ok) { chispas(x || innerWidth / 2, y || innerHeight / 2); bip(660); setTimeout(() => bip(880), 100); setTimeout(() => bip(1320), 200); toast('Renovada hasta el ' + fecha(D.lics.find(l => l.codigo === k).vence)); pinta(); } else toast(r.error, true); return r; }

function editaLic(k) {
  const l = k ? D.lics.find(x => x.codigo === k) : { app:fApp || D.apps[0].id, cliente:'', telefono:'', email:'', precio:'', vence:'', maxDisp:'', gracia:'', notas:'' };
  const d1 = new Date(); d1.setMonth(d1.getMonth() + 1); const def = d1.getFullYear() + '-' + String(d1.getMonth() + 1).padStart(2, '0') + '-' + String(d1.getDate()).padStart(2, '0');
  const h = modal(`<h3>${k ? 'Editar licencia' : 'Nueva licencia'}<button class="x">✕</button></h3><p class="ds">${k ? 'Código ' + k : 'El código se genera solo al guardar.'}</p>
  <form id="fLic"><div class="campo"><label>Aplicaciones <b id="pkInfo"></b></label><div class="pick" id="pkApps">${D.apps.map(a => `<button type="button" data-id="${a.id}">${ic(a.tipo === 'script' ? 'scr' : 'web')}${esc(a.nombre)}</button>`).join('')}</div>
  <p class="ds" style="margin:8px 0 0">Marca una sola, o varias para hacer un <b>pack</b>: un único pago y vencimiento para todas; si no paga se bloquean todas a la vez.</p><input type="hidden" name="app"></div>
  <div class="campo"><label>Cliente</label><input class="in" name="cliente" value="${esc(l.cliente)}" required placeholder="Nombre del cliente"></div>
  <div class="par"><div class="campo"><label>Teléfono</label><input class="in" name="telefono" inputmode="tel" value="${esc(l.telefono)}"></div><div class="campo"><label>Correo</label><input class="in" name="email" type="email" value="${esc(l.email)}"></div></div>
  <div class="par"><div class="campo"><label>Mensualidad (€)</label><input class="in" name="precio" inputmode="decimal" value="${esc(l.precio)}"></div><div class="campo"><label>Vence el</label><input class="in" name="vence" type="date" value="${esc(k ? l.vence : def)}"></div></div>
  <div class="par"><div class="campo"><label>Máx. dispositivos</label><input class="in" name="maxDisp" inputmode="numeric" value="${esc(l.maxDisp)}" placeholder="${esc(D.cfg.maxDisp)} (por defecto)"></div><div class="campo"><label>Días de gracia</label><input class="in" name="gracia" inputmode="numeric" value="${esc(l.gracia)}" placeholder="${esc(D.cfg.gracia)} (por defecto)"></div></div>
  <div class="campo"><label>Notas</label><input class="in" name="notas" value="${esc(l.notas)}"></div>
  <p class="ds" style="margin:0 0 12px">Sin fecha de vencimiento la licencia no caduca nunca. Dispositivos a 0 = sin límite.</p>
  <button class="btn pri w" type="submit">GUARDAR</button></form>`);
  const f = h.querySelector('#fLic'); let sel = idsDe(l.app).filter(i => D.apps.some(a => a.id === i)), tocado = !!k;
  const pon = () => { f.elements.app.value = sel.join(','); h.querySelectorAll('#pkApps button').forEach(b => b.classList.toggle('on', sel.includes(b.dataset.id)));
    h.querySelector('#pkInfo').textContent = sel.length > 1 ? '· PACK DE ' + sel.length : ''; if (!tocado) f.elements.precio.value = appDe(sel.join(',')).precio || ''; };
  h.querySelectorAll('#pkApps button').forEach(b => b.onclick = () => { const id = b.dataset.id; sel = sel.includes(id) ? sel.filter(x => x !== id) : sel.concat(id); bip(520, .04); pon(); });
  f.elements.precio.oninput = () => { tocado = true; }; pon();
  f.onsubmit = async e => { e.preventDefault(); const lic = Object.fromEntries(new FormData(f)); if (k) lic.codigo = k; if (!sel.length) return toast('Elige al menos una aplicación', true);
    const r = await api('licGuardar', { lic }); if (r.ok) { cierra(); toast(k ? 'Licencia guardada' : 'Licencia creada'); vista = 'licencias'; pinta(); if (!k) ficha(r.codigo); } else toast(r.error, true); };
}

function ficha(k) {
  const l = D.lics.find(x => x.codigo === k); if (!l) return; const e = estadoDe(l), a = appDe(l.app), ds = D.disp.filter(d => d.codigo === k), pg = D.pagos.filter(p => p.codigo === k), mx = maxDe(l), blo = l.estado === 'bloqueada';
  const h = modal(`<h3>${esc(l.cliente)}<span class="chip ${e.c}" style="font-size:9px">${e.t}</span><button class="x">✕</button></h3>
  <p class="ds">${esc(a.nombre)} · ${eur(l.precio)}/mes · vence ${l.vence ? fecha(l.vence) : 'nunca'}${l.ultimoUso ? ' · último uso ' + fecha(l.ultimoUso) + ' ' + l.ultimoUso.slice(11, 16) : ' · sin usar todavía'}${l.notas ? '<br>' + esc(l.notas) : ''}</p>
  <button class="cod" id="fCod"><span>${k}</span>${ic('copia')}</button>
  <h5>Renovar (apunta el pago)</h5><div class="bts"><button class="btn ok" data-m="1">+1 mes</button><button class="btn ok" data-m="3">+3 meses</button><button class="btn ok" data-m="12">+1 año</button></div>
  <h5>Acciones</h5><div class="bts"><button class="btn ${blo ? 'ok' : 'mal'}" id="fBlo">${blo ? 'Activar' : 'Bloquear'}</button>${l.telefono ? `<a class="btn" href="${waCliente(l)}" target="_blank" rel="noopener">${ic('wa')}WhatsApp</a>` : ''}<button class="btn" id="fCobro">${ic('pagos')}Enlace de pago</button><button class="btn" id="fEd">Editar</button></div>
  <h5>Instalación${a.pack ? ' · una por cada app del pack' : ''}</h5><div class="bts">${(a.pack || [a]).map(x => `<button class="btn" data-ins="${esc(x.id)}">${ic(x.tipo === 'script' ? 'scr' : 'web')}${a.pack ? esc(x.nombre) : x.tipo === 'script' ? 'Generar loader de Tampermonkey' : 'Ver código de integración'}</button>`).join('')}</div>
  <h5>Dispositivos (${a.pack ? ds.length + (mx ? ' · máx. ' + mx + ' por app' : '') : ds.length + (mx ? '/' + mx : '')})</h5>
  ${ds.length ? ds.map(d => `<div class="fila"><div class="g"><b>${esc(nombreDisp(d.info))}</b><small>${a.pack && d.app ? esc(app1(d.app).nombre) + ' · ' : ''}Desde ${fecha(d.primero)} · último ${fecha(d.ultimo)} ${d.ultimo.slice(11, 16)}</small></div><button class="btn min mal" data-d="${esc(d.disp)}">Liberar</button></div>`).join('') : '<p class="ds" style="margin:0">Ningún dispositivo registrado todavía.</p>'}
  ${pg.length ? `<h5>Pagos (${eur(pg.reduce((s, p) => s + num(p.importe, 0), 0))})</h5>` + pg.slice(-5).reverse().map(p => `<div class="fila"><div class="g"><b>${eur(p.importe)}</b><small>${fecha(p.fecha)} · ${p.meses} mes${p.meses == 1 ? '' : 'es'}</small></div></div>`).join('') : ''}
  <h5>Zona peligrosa</h5><button class="btn mal min" id="fDel">Eliminar licencia</button>`);
  h.querySelector('#fCod').onclick = () => copia(k, 'Código copiado');
  h.querySelectorAll('[data-m]').forEach(b => b.onclick = async () => { const rc = b.getBoundingClientRect(); const r = await renueva(k, +b.dataset.m, rc.left + rc.width / 2, rc.top); if (r.ok) ficha(k); });
  h.querySelector('#fBlo').onclick = async () => { const r = await api('licEstado', { codigo:k, estado:blo ? 'activa' : 'bloqueada' }); if (r.ok) { toast(blo ? 'Licencia activada' : 'Licencia bloqueada', !blo); pinta(); ficha(k); } else toast(r.error, true); };
  h.querySelector('#fCobro').onclick = () => copia(enlacePago(l.precio), 'Enlace de pago copiado');
  h.querySelector('#fEd').onclick = () => editaLic(k);
  h.querySelectorAll('[data-ins]').forEach(b => b.onclick = () => integra(l, app1(b.dataset.ins)));
  h.querySelectorAll('[data-d]').forEach(b => b.onclick = async () => { const r = await api('dispLiberar', { codigo:k, disp:b.dataset.d }); if (r.ok) { toast('Dispositivo liberado'); pinta(); ficha(k); } });
  h.querySelector('#fDel').onclick = async () => { if (await confirma('Eliminar licencia', 'Se borrará la licencia de ' + l.cliente + ' y dejará de poder usar ' + a.nombre + '. No se puede deshacer.')) { const r = await api('licBorrar', { codigo:k }); if (r.ok) { toast('Licencia eliminada'); pinta(); } } };
}
function nombreDisp(ua) { ua = String(ua || ''); if (!ua) return 'Dispositivo'; const so = /android/i.test(ua) ? 'Android' : /iphone|ipad/i.test(ua) ? 'iPhone/iPad' : /windows/i.test(ua) ? 'Windows' : /mac os/i.test(ua) ? 'Mac' : /linux/i.test(ua) ? 'Linux' : 'Dispositivo';
  const nv = /edg\//i.test(ua) ? 'Edge' : /firefox/i.test(ua) ? 'Firefox' : /chrome/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : ''; return so + (nv ? ' · ' + nv : ''); }

/* ---------- integración ---------- */
// Loader de Tampermonkey: guarda el código del script y solo pregunta al servidor cada REVISA horas,
// así arranca al instante y no llama al servidor en cada página que abre el cliente.
const REVISA_H = 3;
function loader(l, a) {
  const m = urlsDe(a.url), gr = ['GM_xmlhttpRequest', 'GM_getValue', 'GM_setValue', 'GM_deleteValue', 'GM_listValues', 'GM_addStyle', 'GM_openInTab', 'GM_setClipboard', 'GM_notification', 'GM_registerMenuCommand', 'unsafeWindow'];
  return ['// ==UserScript==', '// @name         ' + a.nombre, '// @namespace    futurmovil', '// @version      2.0', '// @description  ' + a.nombre,
  ...(m.length ? m : ['*://*/*']).map(u => '// @match        ' + u), ...gr.map(g => '// @grant        ' + g),
  '// @connect      script.google.com', '// @connect      script.googleusercontent.com', '// @run-at       document-start', '// ==/UserScript==', ''].join('\n') + String.raw`
(function () {
  'use strict';
  var API = '${API}', APP = '${a.id}', LIC = '${l.codigo}';
  var REVISA = ${REVISA_H} * 3600000;   // comprueba la licencia cada ${REVISA_H} horas
  var SIN_RED = 3 * 86400000;         // sin conexión con el servidor, sigue funcionando 3 días
  var NOMBRES = ['${gr.join("', '")}'];
  var VALORES = [${gr.join(', ')}];
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
  function lanza(c) {
    if (lanzado || !c || !c.code) return; lanzado = true;
    cuando(c.run, function () { try { Function.apply(null, NOMBRES.concat(c.code)).apply(null, VALORES); } catch (e) { console.error('[' + APP + ']', e); } });
  }
  function aviso(r) {
    cuando('document-end', function () {
      var d = document.createElement('div');
      d.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#000;color:#17ff5f;border:1px solid #17ff5f;box-shadow:0 0 24px rgba(23,255,95,.45);font:13px/1.5 monospace;padding:16px 18px;border-radius:10px;max-width:320px;text-shadow:0 0 6px rgba(23,255,95,.6)';
      var h = '<b style="font-size:15px">💀 ' + (r.app || APP) + '</b><br>' + (r.msg || 'Licencia no válida') + '<br>';
      if (r.pago && (r.estado === 'vencida' || r.estado === 'bloqueada')) h += '<a href="' + r.pago + '" target="_blank" style="display:inline-block;margin:10px 8px 0 0;padding:7px 12px;background:#17ff5f;color:#000;text-decoration:none;font-weight:bold;border-radius:6px;text-shadow:none">PAGAR ' + (r.importe ? r.importe + ' €' : '') + '</a>';
      if (r.soporte) h += '<a href="' + r.soporte + '" target="_blank" style="display:inline-block;margin-top:10px;padding:7px 12px;border:1px solid #17ff5f;color:#17ff5f;text-decoration:none;border-radius:6px">SOPORTE</a>';
      d.innerHTML = h; document.body.appendChild(d);
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
  if (!c && no && no.lic === LIC && Date.now() - no.t < 600000) return aviso(no.r);   // bloqueada: vuelve a preguntar a los 10 min

  GM_xmlhttpRequest({
    method: 'GET', url: API + '?a=script&k=' + LIC + '&app=' + APP + '&d=' + dev + '&ua=' + encodeURIComponent(navigator.userAgent), timeout: 25000,
    onload: function (x) {
      var r; try { r = JSON.parse(x.responseText); } catch (e) { return; }
      if (r.ok && r.code) { var n = { t: Date.now(), lic: LIC, code: r.code, run: runAt(r.code) }; GM_setValue('lic_cache', JSON.stringify(n)); GM_setValue('lic_no', ''); lanza(n); }
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
function vApps() {
  $('#main').innerHTML = `<div class="vista">${cab('APLICACIONES', 'Cada app, juego o script que vendes con licencia', bNueva('bNApp'))}
  <div class="grid">${D.apps.map((a, i) => { const ls = D.lics.filter(l => idsDe(l.app).includes(a.id)), act = ls.filter(l => l.ef === 'activa'), kb = D.scripts[a.id];
    return `<div class="card appc tilt st" style="--i:${i}" data-a="${a.id}"><div class="brillo"></div><div class="ico">${ic(a.tipo === 'script' ? 'scr' : 'web')}</div><h4>${esc(a.nombre)}</h4>
    <span style="font-size:11.5px;color:var(--sua)">${a.tipo === 'script' ? 'Script Tampermonkey' : 'Aplicación web'} · id <span style="font-family:var(--mono);color:var(--cian)">${a.id}</span></span>
    <div class="meta" style="margin-top:14px"><span>Licencias <b>${ls.length}</b></span><span>Activas <b class="c-ok">${act.length}</b></span><span>Mensual <b>${eur(act.reduce((s, l) => s + num(l.precio, 0), 0))}</b></span></div>
    ${a.tipo === 'script' ? `<div class="meta" style="margin-top:8px"><span>Código: <b class="${kb ? 'c-ok' : 'c-warn'}">${kb ? Math.round(kb / 102.4) / 10 + ' KB subido' : 'sin subir'}</b></span></div>` : ''}</div>`; }).join('')}</div>
  ${D.apps.length ? '' : `<div class="vacio">${ic('caja')}Da de alta tu primera app o script con el botón NUEVA</div>`}</div>`;
  $('#bNApp').onclick = () => editaApp(); $('#main').querySelectorAll('[data-a]').forEach(c => c.onclick = () => editaApp(c.dataset.a));
}
const urlsDe = v => String(v || '').split(/[\s,]+/).filter(Boolean);
function editaApp(id) {
  const a = id ? appDe(id) : { nombre:'', tipo:'web', precio:'', url:'', notas:'' };
  const h = modal(`<h3>${id ? esc(a.nombre) : 'Nueva aplicación'}<button class="x">✕</button></h3><p class="ds">${id ? 'Identificador: ' + id : 'Una app o juego que vendes a clientes, o un script de Tampermonkey.'}</p>
  <form id="fApp"><div class="campo"><label>Nombre</label><input class="in" name="nombre" value="${esc(a.nombre)}" required placeholder="Ej. Panel Puntofibra"></div>
  <div class="par"><div class="campo"><label>Tipo</label><select class="in" name="tipo"><option value="web" ${a.tipo !== 'script' ? 'selected' : ''}>Aplicación web</option><option value="script" ${a.tipo === 'script' ? 'selected' : ''}>Script Tampermonkey</option></select></div>
  <div class="campo"><label>Mensualidad (€)</label><input class="in" name="precio" inputmode="decimal" value="${esc(a.precio)}"></div></div>
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
  const pon = () => { const s = esScr(); h.querySelector('#lUrl').textContent = s ? 'Dónde se ejecuta (@match)' : 'URL de la app (opcional)';
    if (!s) [...lst.children].slice(1).forEach(d => d.remove()); marca(); const z = h.querySelector('#zScr'); if (z) z.hidden = !s; };
  pon(); tipo.onchange = pon;
  f.onsubmit = async e => { e.preventDefault(); f.elements.url.value = [...lst.querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean).join(' ');
    const app = Object.fromEntries(new FormData(f)); if (id) app.id = id; const r = await api('appGuardar', { app }); if (r.ok) { cierra(); toast('Aplicación guardada'); pinta(); } else toast(r.error, true); };
  if (!id) return;
  const t = h.querySelector('#tScr'), listo = () => t.placeholder = '// pega aquí el código del script';
  if (a.tipo === 'script') api('scriptLeer', { id }).then(r => { t.value = r.code || ''; listo(); }); else listo();
  h.querySelector('#bScr').onclick = async () => { const r = await api('scriptGuardar', { id, code:t.value }); if (r.ok) { toast('Código subido'); pinta(); } else toast(r.error, true); };
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
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) fuera(); });
(async function () {
  const par = new URLSearchParams(location.search).get('par');
  if (par) return modoPasarLlave(par);
  if (TOKEN) { const r = await api('datos'); if (r.ok) { $('#app').hidden = false; ir('inicio'); return; } if (!$('#login').hidden) return; }
  verLogin();
})();
