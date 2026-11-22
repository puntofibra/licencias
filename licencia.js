/* =====================================================================
   licencia.js · FuturMovil
   Pega en el <head> de la app del cliente:
   <script src="https://puntofibra.github.io/licencias/licencia.js" data-app="ID_APP" data-licencia="XXXX-XXXX-XXXX"></script>
   Si la licencia no está al día, tapa la app con una pantalla de bloqueo
   con botón de pago (myPOS) y de soporte (WhatsApp).
   ===================================================================== */
(function () {
  'use strict';
  var API = 'URL_API_LICENCIAS';
  var yo = document.currentScript || document.querySelector('script[data-licencia]');
  var APP = (yo && yo.getAttribute('data-app')) || '';
  var LIC = (yo && yo.getAttribute('data-licencia')) || '';
  var CLAVE = 'fmlic_' + APP;

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var dev = ls('fmlic_dev');
  if (!dev) { dev = 'w-' + Math.random().toString(36).slice(2) + Date.now().toString(36); ls('fmlic_dev', dev); }

  // Tapa la app desde el primer momento si la última comprobación fue negativa
  var previo = null;
  try { previo = JSON.parse(ls(CLAVE) || 'null'); } catch (e) {}
  if (previo && previo.r && !previo.r.ok) bloquear(previo.r);

  function jsonp(params, cb) {
    var n = 'fmlic_cb' + Math.random().toString(36).slice(2), s = document.createElement('script'), fin = false;
    window[n] = function (d) { fin = true; delete window[n]; s.remove(); cb(d); };
    s.onerror = function () { if (!fin) { delete window[n]; s.remove(); cb(null); } };
    var q = []; for (var k in params) q.push(k + '=' + encodeURIComponent(params[k]));
    s.src = API + '?' + q.join('&') + '&callback=' + n;
    (document.head || document.documentElement).appendChild(s);
    setTimeout(function () { if (!fin) { fin = true; delete window[n]; s.remove(); cb(null); } }, 20000);
  }

  function comprobar() {
    if (!LIC) return bloquear({ estado: 'noexiste', msg: 'Falta el código de licencia de esta aplicación.' });
    jsonp({ a: 'check', k: LIC, app: APP, d: dev, ua: navigator.userAgent.slice(0, 120) }, function (r) {
      if (!r) {   // sin conexión: se respeta la última respuesta durante 3 días
        if (previo && previo.r && previo.r.ok && Date.now() - previo.t < 259200000) return;
        if (!previo) return;   // nunca comprobada y sin red: no se bloquea
        return;
      }
      ls(CLAVE, JSON.stringify({ t: Date.now(), r: r }));
      if (r.ok) { quitar(); if (r.dias != null && r.dias >= 0 && r.dias <= r.aviso) aviso(r); else if (r.enGracia) aviso(r); }
      else bloquear(r);
    });
  }

  var CSS = '#fmlic{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 30% 20%,rgba(139,92,255,.35),transparent 55%),radial-gradient(circle at 75% 80%,rgba(61,245,255,.22),transparent 55%),#05070f;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e8eefc;animation:fmlicIn .4s ease}'
    + '@keyframes fmlicIn{from{opacity:0}}#fmlic .c{width:min(400px,100%);text-align:center;background:rgba(16,22,42,.75);border:1px solid rgba(125,249,255,.22);border-radius:24px;padding:34px 26px;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 50px rgba(61,245,255,.12)}'
    + '#fmlic .i{width:78px;height:78px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;background:rgba(255,77,109,.12);border:1px solid rgba(255,77,109,.45);box-shadow:0 0 30px rgba(255,77,109,.35);animation:fmlicP 2s infinite}'
    + '@keyframes fmlicP{50%{box-shadow:0 0 50px rgba(255,77,109,.6)}}#fmlic .i svg{width:38px;height:38px}#fmlic h2{font-size:21px;margin:0 0 6px;letter-spacing:.02em}#fmlic .a{color:#3df5ff;font-size:13px;margin-bottom:14px;font-weight:600}'
    + '#fmlic p{color:#a7b1cf;font-size:14px;line-height:1.55;margin:0 0 22px}#fmlic a{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:14px;font-weight:700;font-size:15px;text-decoration:none;margin-top:10px}'
    + '#fmlic .p{background:linear-gradient(100deg,#3df5ff,#8b5cff);color:#04060e;box-shadow:0 10px 30px rgba(61,245,255,.3)}#fmlic .s{border:1px solid rgba(43,255,154,.45);color:#2bff9a;background:rgba(43,255,154,.08)}'
    + '#fmlic .r{background:none;border:0;color:#8b96b8;font-size:12px;margin-top:16px;text-decoration:underline;cursor:pointer}#fmlic small{display:block;color:#5d6788;font-size:11px;margin-top:14px;font-family:monospace;letter-spacing:.08em}'
    + '#fmlicAv{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483646;background:rgba(10,14,28,.96);border:1px solid #ffc53d;color:#e8eefc;padding:11px 14px 11px 16px;border-radius:30px;font:13px system-ui,sans-serif;display:flex;gap:10px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 20px rgba(255,197,61,.25);max-width:94vw}'
    + '#fmlicAv a{color:#04060e;background:#ffc53d;padding:6px 12px;border-radius:20px;text-decoration:none;font-weight:700;white-space:nowrap}#fmlicAv button{background:none;border:0;color:#8b96b8;font-size:16px;cursor:pointer}';
  function estilo() { if (document.getElementById('fmlicCss')) return; var s = document.createElement('style'); s.id = 'fmlicCss'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s); }
  function cuando(fn) { if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function e(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function bloquear(r) {
    cuando(function () {
      estilo();
      var d = document.getElementById('fmlic') || document.createElement('div');
      d.id = 'fmlic';
      var tit = r.estado === 'vencida' ? 'Licencia vencida' : r.estado === 'bloqueada' ? 'Licencia bloqueada' : r.estado === 'dispositivos' ? 'Límite de dispositivos' : 'Licencia no válida';
      var pagar = r.pago && (r.estado === 'vencida' || r.estado === 'bloqueada');
      d.innerHTML = '<div class="c"><div class="i"><svg viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/></svg></div>'
        + '<h2>' + tit + '</h2>' + (r.app ? '<div class="a">' + e(r.app) + '</div>' : '') + '<p>' + e(r.msg || 'Esta aplicación no tiene una licencia activa.') + '</p>'
        + (pagar ? '<a class="p" href="' + e(r.pago) + '" target="_blank" rel="noopener">Pagar ' + (r.importe ? e(String(r.importe).replace('.', ',')) + ' €' : '') + '</a>' : '')
        + (r.soporte ? '<a class="s" href="' + e(r.soporte) + '" target="_blank" rel="noopener">Hablar con soporte</a>' : '')
        + '<button class="r" id="fmlicRe">Ya he pagado · comprobar de nuevo</button><small>' + e(LIC) + '</small></div>';
      if (!d.parentNode) document.body.appendChild(d);
      document.documentElement.style.overflow = 'hidden';
      document.getElementById('fmlicRe').onclick = function () { this.textContent = 'Comprobando…'; previo = null; comprobar(); setTimeout(function () { var b = document.getElementById('fmlicRe'); if (b) b.textContent = 'Todavía no está activa · reintentar'; }, 4000); };
    });
  }
  function quitar() { var d = document.getElementById('fmlic'); if (d) { d.remove(); document.documentElement.style.overflow = ''; } }
  function aviso(r) {
    if (sessionStorage.getItem('fmlicAv')) return;
    cuando(function () {
      estilo();
      var d = document.createElement('div'); d.id = 'fmlicAv';
      var t = r.enGracia ? 'Tu licencia ha vencido. Renueva para no perder el acceso.' : r.dias === 0 ? 'Tu licencia vence hoy.' : 'Tu licencia vence en ' + r.dias + ' día' + (r.dias === 1 ? '' : 's') + '.';
      d.innerHTML = '<span>' + t + '</span>' + (r.pago ? '<a href="' + e(r.pago) + '" target="_blank" rel="noopener">Renovar</a>' : '') + '<button aria-label="Cerrar">✕</button>';
      d.querySelector('button').onclick = function () { d.remove(); try { sessionStorage.setItem('fmlicAv', '1'); } catch (x) {} };
      document.body.appendChild(d);
    });
  }

  comprobar();
  setInterval(comprobar, 1800000);   // vuelve a comprobar cada 30 minutos
  window.FMLicencia = { comprobar: comprobar };
})();
