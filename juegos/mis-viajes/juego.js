/* =========================================================
   Mis Viajes — lógica del juego
   ========================================================= */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const azar = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
function mezclar(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- Guardado (solo en este dispositivo) ---------- */
function guardar(k, v) { try { localStorage.setItem('tt_' + k, JSON.stringify(v)); } catch (e) { /* sin guardado */ } }
function cargar(k, def) { try { const v = localStorage.getItem('tt_' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } }

/* ---------- Ajustes ---------- */
const prefiereQuieto = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const ajustes = Object.assign(
  { sonido: true, musica: true, voz: true, animaciones: !prefiereQuieto, colores: 3, piezas: 6, porVagon: 3, eventosSiempre: false, cumple: '', nombre: '', vehiculo: 'tren' },
  cargar('ajustes', {})
);
function aplicarAjustes() {
  document.body.classList.toggle('sin-animaciones', !ajustes.animaciones);
  guardar('ajustes', ajustes);
}

/* ---------- Vehículo elegible: tren, coche, barco o avión ---------- */
const VEHICULOS = {
  tren: { icono: '🚂', n: 'tren', v: 'vagón', vs: 'vagones', la: 'el' },
  coche: { icono: '🚗', n: 'coche', v: 'remolque', vs: 'remolques', la: 'el' },
  barco: { icono: '🚢', n: 'barco', v: 'barca', vs: 'barcas', la: 'la' },
  avion: { icono: '✈️', n: 'avión', v: 'caja', vs: 'cajas', la: 'la' },
};
const V = () => VEHICULOS[ajustes.vehiculo] || VEHICULOS.tren;
const mayus = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const losVs = () => (V().la === 'la' ? 'las ' : 'los ') + V().vs;   // "los vagones", "las barcas"

/* =========================================================
   SONIDO — todo generado, suave y sin sobresaltos
   ========================================================= */
let ctx = null, master = null, ruido = null, musica = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tono(freq, dur = 0.6, vol = 0.12, tipo = 'sine', retraso = 0) {
  if (!ajustes.sonido) return;
  const a = audio(); if (!a) return;
  const t = a.currentTime + retraso;
  const o = a.createOscillator(), g = a.createGain();
  o.type = tipo; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.05);
}
// Motor suave para coche, barco y avión
function motor(dur) {
  if (!ajustes.sonido) return;
  const a = audio(); if (!a) return;
  const base = ajustes.vehiculo === 'avion' ? 196 : 98;
  [base, base * 1.5].forEach((f, k) => {
    const t = a.currentTime, o = a.createOscillator(), g = a.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(f * .9, t); o.frequency.linearRampToValueAtTime(f, t + dur * .6);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(k ? .02 : .035, t + .3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
  });
}
// Sonido de marcha: "chu-chu" para el tren, motor para los demás
function chuchu(veces = 4, intervalo = 0.36) {
  if (!ajustes.sonido) return;
  if (ajustes.vehiculo && ajustes.vehiculo !== 'tren') { motor(Math.max(.9, veces * intervalo)); return; }
  const a = audio(); if (!a) return;
  if (!ruido) {
    ruido = a.createBuffer(1, Math.floor(a.sampleRate * 0.3), a.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  for (let i = 0; i < veces; i++) {
    const t = a.currentTime + i * intervalo;
    const s = a.createBufferSource(); s.buffer = ruido;
    const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 650;
    const g = a.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.1, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.3);
  }
}
const sonidos = {
  toque() { tono(660, 0.25, 0.06); },
  bien() { tono(523.25, 0.5, 0.08); tono(659.25, 0.5, 0.08, 'sine', 0.12); tono(783.99, 0.8, 0.08, 'sine', 0.24); },
  neutro() { tono(392, 0.35, 0.05); },              // intento no correcto: sin "error"
  // Silbato del tren, claxon suave del coche, sirena grave del barco, "din-don" del avión
  silbato() {
    const v = ajustes.vehiculo;
    if (v === 'coche') { tono(440, .2, .05, 'triangle'); tono(554, .2, .04, 'triangle'); tono(440, .25, .05, 'triangle', .28); tono(554, .25, .04, 'triangle', .28); }
    else if (v === 'barco') { tono(147, 1.4, .07, 'triangle'); tono(220, 1.4, .035, 'triangle'); }
    else if (v === 'avion') { tono(659.25, .9, .06); tono(523.25, 1.2, .06, 'sine', .45); }
    else { tono(587, 1, 0.045, 'triangle'); tono(740, 1, 0.035, 'triangle'); }
  },
};

function iniciarMusica() {
  if (!ajustes.musica || musica) return;
  const a = audio(); if (!a) return;
  const g = a.createGain();
  g.gain.setValueAtTime(0, a.currentTime);
  g.gain.linearRampToValueAtTime(0.07, a.currentTime + 4);
  g.connect(master);
  const acordes = [[261.63, 329.63, 392.0], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66]];
  const oscs = [0, 1, 2].map(() => {
    const o = a.createOscillator(); o.type = 'sine';
    const og = a.createGain(); og.gain.value = 0.33;
    o.connect(og); og.connect(g); o.start();
    return o;
  });
  let i = 0;
  const cambiar = () => {
    const ac = acordes[i++ % acordes.length];
    oscs.forEach((o, k) => o.frequency.setTargetAtTime(ac[k], a.currentTime, 1.5));
  };
  cambiar();
  musica = { g, oscs, id: setInterval(cambiar, 9000) };
}
function pararMusica() {
  if (!musica || !ctx) return;
  const m = musica; musica = null;
  clearInterval(m.id);
  m.g.gain.cancelScheduledValues(ctx.currentTime);
  m.g.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  setTimeout(() => m.oscs.forEach(o => { try { o.stop(); } catch (e) { } }), 2500);
}

/* ---------- Voz ---------- */
let vozES = null;
function elegirVoz() {
  const vs = speechSynthesis.getVoices();
  vozES = vs.find(v => v.lang === 'es-ES') || vs.find(v => v.lang && v.lang.startsWith('es')) || null;
}
if ('speechSynthesis' in window) { elegirVoz(); speechSynthesis.onvoiceschanged = elegirVoz; }
function decir(txt) {
  if (!ajustes.voz || !('speechSynthesis' in window) || !txt) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(txt);
  u.lang = 'es-ES'; if (vozES) u.voice = vozES;
  u.rate = 0.85; u.pitch = 1.05;
  speechSynthesis.speak(u);
}

/* =========================================================
   UTILIDADES DE INTERFAZ
   ========================================================= */
/* Aviso flotante breve (por ejemplo: "mantén pulsado") */
let tAviso = null;
function avisar(texto, cerca) {
  const el = $('#aviso');
  el.textContent = texto;
  el.classList.remove('oculto');
  el.style.top = el.style.left = '';   // sin botón de referencia: arriba en el centro
  if (cerca) {
    // Debajo del botón, sin salirse de la pantalla
    const r = cerca.getBoundingClientRect(), mitad = el.offsetWidth / 2;
    el.style.top = Math.min(innerHeight - 60, r.bottom + 10) + 'px';
    el.style.left = Math.max(12 + mitad, Math.min(innerWidth - 12 - mitad, r.left + r.width / 2)) + 'px';
  }
  clearTimeout(tAviso);
  tAviso = setTimeout(() => el.classList.add('oculto'), 2600);
}

// Botones solo para adultos: hay que mantenerlos pulsados un momento
const MANTENER_MS = 1000;
function mantenerPulsado(boton, accion) {
  let t = null, inicio = 0;
  const terminar = () => { if (t) { clearTimeout(t); t = null; } boton.classList.remove('cargando'); };
  boton.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button > 0) return;
    e.preventDefault();
    try { boton.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
    inicio = Date.now();
    boton.classList.add('cargando');
    t = setTimeout(() => { t = null; boton.classList.remove('cargando'); $('#aviso').classList.add('oculto'); sonidos.toque(); accion(); }, MANTENER_MS);
  });
  boton.addEventListener('pointerup', () => {
    const fueToque = t && Date.now() - inicio < MANTENER_MS;
    terminar();
    if (fueToque) avisar('Para adultos: mantén pulsado ⏳', boton);
  });
  boton.addEventListener('pointercancel', terminar);
  boton.addEventListener('lostpointercapture', terminar);
  boton.addEventListener('contextmenu', e => e.preventDefault());
  // Con teclado: Mayúsculas + Enter
  boton.addEventListener('keydown', e => { if (e.key === 'Enter' && e.shiftKey) accion(); });
}

function abrirModal(sel) { $(sel).classList.remove('oculto'); }
function cerrarModal(sel) { $(sel).classList.add('oculto'); }
function celebrar(texto, botones) {
  $('#celebra-texto').textContent = texto;
  const cont = $('#celebra-botones'); cont.innerHTML = '';
  botones.forEach(b => {
    const el = document.createElement('button');
    el.className = 'btn' + (b.sec ? ' btn-sec' : '');
    el.textContent = b.txt;
    el.addEventListener('click', () => { sonidos.toque(); cerrarModal('#celebra'); b.fn(); });
    cont.appendChild(el);
  });
  abrirModal('#celebra');
}

// Cabeza del vehículo (mira a la derecha). Los "vagones" van detrás, a la izquierda.
function locomotoraSVG() {
  const abre = `<svg class="locomotora" viewBox="0 0 170 120" aria-hidden="true">`;
  const v = ajustes.vehiculo;
  if (v === 'coche') return abre + `
    <path d="M30 64 L52 34 Q56 28 64 28 L112 28 Q120 28 125 34 L148 64 Z" fill="#2F5F80"/>
    <path d="M44 64 L60 40 L84 40 L84 64 Z M92 64 L92 40 L114 40 L132 64 Z" fill="#DDEFFF"/>
    <rect x="4" y="60" width="162" height="40" rx="15" fill="#407295"/>
    <rect x="2" y="70" width="7" height="12" rx="3" fill="#E57368"/>
    <circle cx="160" cy="76" r="6" fill="#FFE29A"/>
    <g fill="#3d4352"><circle cx="44" cy="100" r="16"/><circle cx="128" cy="100" r="16"/></g>
    <g fill="#c9cfdb"><circle cx="44" cy="100" r="6"/><circle cx="128" cy="100" r="6"/></g>
  </svg>`;
  if (v === 'barco') return abre + `
    <rect x="104" y="14" width="22" height="54" rx="4" fill="#2F5F80"/>
    <rect x="104" y="22" width="22" height="8" fill="#E57368"/>
    <rect x="28" y="34" width="74" height="36" rx="8" fill="#F6F9FA" stroke="#2F5F80" stroke-width="3"/>
    <g fill="#9CC3DE"><circle cx="47" cy="52" r="7"/><circle cx="65" cy="52" r="7"/><circle cx="83" cy="52" r="7"/></g>
    <path d="M2 66 L168 66 L150 110 Q148 114 142 114 L24 114 Q18 114 16 110 Z" fill="#407295"/>
    <rect x="8" y="73" width="152" height="6" rx="3" fill="#FFFFFF" opacity=".8"/>
    <circle cx="157" cy="58" r="6" fill="#FFE29A"/>
  </svg>`;
  if (v === 'avion') return abre + `
    <path d="M4 28 L28 28 L46 60 L14 60 Z" fill="#2F5F80"/>
    <path d="M90 52 L120 52 L102 22 Z" fill="#2F5F80"/>
    <ellipse cx="88" cy="66" rx="82" ry="22" fill="#F6F9FA" stroke="#2F5F80" stroke-width="3"/>
    <rect x="14" y="70" width="148" height="6" rx="3" fill="#407295"/>
    <g fill="#9CC3DE"><circle cx="58" cy="60" r="5"/><circle cx="74" cy="60" r="5"/><circle cx="90" cy="60" r="5"/><circle cx="106" cy="60" r="5"/><circle cx="122" cy="60" r="5"/></g>
    <path d="M144 54 Q160 56 166 64 L144 64 Z" fill="#9CC3DE"/>
    <path d="M70 72 L118 72 L94 110 L76 110 Z" fill="#407295"/>
    <circle cx="168" cy="68" r="4" fill="#FFE29A"/>
  </svg>`;
  return abre + `
    <rect x="4" y="86" width="160" height="9" rx="3" fill="#2F5F80"/>
    <rect x="8" y="22" width="70" height="68" rx="9" fill="#407295"/>
    <rect x="2" y="14" width="82" height="14" rx="6" fill="#2F5F80"/>
    <rect x="20" y="36" width="46" height="30" rx="6" fill="#DDEFFF"/>
    <rect x="74" y="46" width="88" height="44" rx="14" fill="#36668A"/>
    <rect x="118" y="18" width="20" height="32" rx="4" fill="#2F5F80"/>
    <rect x="112" y="12" width="32" height="10" rx="4" fill="#2F5F80"/>
    <circle cx="160" cy="62" r="7" fill="#FFE29A"/>
    <g fill="#3d4352"><circle cx="38" cy="98" r="17"/><circle cx="100" cy="102" r="13"/><circle cx="142" cy="102" r="13"/></g>
    <g fill="#c9cfdb"><circle cx="38" cy="98" r="5"/><circle cx="100" cy="102" r="4"/><circle cx="142" cy="102" r="4"/></g>
  </svg>`;
}

// Pone el vehículo elegido en toda la página (textos, cabeza del menú, estilos)
function aplicarVehiculo() {
  const v = V(), un = v.la === 'el' ? 'un' : 'una';
  document.body.dataset.vehiculo = VEHICULOS[ajustes.vehiculo] ? ajustes.vehiculo : 'tren';
  const T = {
    'mi-dia': `El ${v.n} de mi día`, 'vs-hoy': `${mayus(v.vs)} de hoy`,
    anadir: `Añadir ${un} ${v.v}`, vaciar: `Vaciar ${v.n}`,
  };
  $$('[data-v]').forEach(el => { if (T[el.dataset.v]) el.textContent = T[el.dataset.v]; });
  const paseo = $('.tren-paseo');
  $$('.locomotora', paseo).forEach(x => x.remove());
  paseo.insertAdjacentHTML('beforeend', locomotoraSVG());
}

/* =========================================================
   NAVEGACIÓN
   ========================================================= */
let pantallaActual = 'menu';
let temporizadores = [];
function despues(ms, fn) { temporizadores.push(setTimeout(fn, ms)); }
function limpiarTemporizadores() { temporizadores.forEach(clearTimeout); temporizadores = []; }

function irA(nombre) {
  limpiarTemporizadores();
  cerrarModal('#buscador');
  if (pantallaActual === 'calma' && nombre !== 'calma') Calma.parar();
  cerrarModal('#celebra');
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  $$('.pantalla').forEach(p => p.classList.toggle('activa', p.id === 'pantalla-' + nombre));
  pantallaActual = nombre;
  if (nombre === 'calma') Calma.iniciar();
  else if (nombre === 'colores') Colores.iniciar();
  else if (nombre === 'cosas') iniciarCosas();
  else if (nombre === 'dia') Dia.iniciar();
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-ir]');
  if (!b) return;
  audio(); sonidos.toque();
  irA(b.dataset.ir);
});

/* =========================================================
   1) VIAJE EN CALMA
   Un paisaje por cada estación del año + paisajes de fiesta
   que aparecen solos cuando llega su fecha.
   ========================================================= */
// capas: [color, altura base (fracción de pantalla), amplitud, escala, paralaje]
const CAPAS_VERDES = [['#B9DEC4', .52, 28, 230, .12], ['#96CBA4', .62, 20, 170, .3], ['#7DB88C', .72, 12, 120, .6]];
const ESCENAS = {
  primavera: { nombre: 'Primavera', icono: '🌸', cielo: ['#BFE3F5', '#F3F9EC'], astro: 'sol', nubes: true,
    arbol: 'flor', deco: 'flores', aire: 'mariposas', parts: 'petalos', suelo: '#7DB86F',
    capas: [['#C4E5B5', .52, 28, 230, .12], ['#A6D795', .62, 20, 170, .3], ['#8CC97A', .72, 12, 120, .6]] },
  verano: { nombre: 'Verano', icono: '☀️', cielo: ['#9FD3F2', '#FFF0D2'], astro: 'sol-fuerte', nubes: true, mar: true,
    arbol: 'palmera', suelo: '#E9D3A2',
    capas: [['#F2DFB4', .74, 6, 90, .6]] },
  otono: { nombre: 'Otoño', icono: '🍂', cielo: ['#A9CBE3', '#F6E2C6'], astro: 'sol-palido', nubes: true,
    arbol: 'otono', parts: 'hojas', suelo: '#A9794A',
    capas: [['#E3B57C', .52, 28, 230, .12], ['#D39457', .62, 20, 170, .3], ['#BF7F45', .72, 12, 120, .6]] },
  invierno: { nombre: 'Invierno', icono: '❄️', cielo: ['#AFC5DD', '#E6EEF7'], astro: 'sol-palido', nubes: true,
    parts: 'copos', arbol: 'pino-nieve', suelo: '#F4F7FB',
    capas: [['#DCE5EF', .5, 34, 240, .12], ['#EAF0F7', .6, 22, 170, .3], ['#FBFCFE', .71, 10, 120, .6]] },
  noche: { nombre: 'Noche', icono: '🌙', cielo: ['#1C2747', '#3A4877'], astro: 'luna', estrellas: true, noche: true,
    arbol: 'pino-noche', suelo: '#1B2542',
    capas: [['#2E3B62', .52, 28, 230, .12], ['#27345A', .62, 20, 170, .3], ['#202C4D', .72, 12, 120, .6]] },

  // ---- Fiestas ----
  navidad: { nombre: 'Navidad', icono: '🎄', evento: true, cielo: ['#22305A', '#4E5E8E'], astro: 'luna', estrellas: true, noche: true,
    parts: 'copos', arbol: 'pino-navidad', suelo: '#E9EEF6', carga: 'regalos', vagones: ['#E07A6F', '#6DAA7A', '#E9C46A'],
    capas: [['#7F8DB4', .5, 34, 240, .12], ['#A3B0D2', .6, 22, 170, .3], ['#DCE3F0', .71, 10, 120, .6]] },
  halloween: { nombre: 'Halloween', icono: '🎃', evento: true, cielo: ['#3B2A5A', '#E39A6C'], astro: 'luna-naranja', noche: true,
    arbol: 'pelado', deco: 'calabazas', aire: 'murcielagos', suelo: '#2A2140', carga: 'calabazas', vagones: ['#F0A868', '#A88BD3', '#7CC189'],
    capas: [['#5A4778', .54, 26, 230, .12], ['#45365F', .63, 18, 170, .3], ['#33284A', .72, 12, 120, .6]] },
  carnaval: { nombre: 'Carnaval', icono: '🎭', evento: true, cielo: ['#BDE3F7', '#FDF1DC'], astro: 'sol', nubes: true,
    arbol: 'redondo', parts: 'confeti', banderines: true, suelo: '#7DB88C', carga: 'globos', vagones: ['#E57368', '#6FA3D9', '#F2C94C'],
    capas: CAPAS_VERDES },
  cumple: { nombre: 'Cumpleaños', icono: '🎂', evento: true, cielo: ['#BFE3F5', '#FFEFF4'], astro: 'sol', nubes: true,
    arbol: 'redondo', deco: 'flores', banderines: true, suelo: '#7DB88C', carga: 'globos', vagones: ['#F4A6B8', '#9CC9EE', '#F2D27A'],
    capas: CAPAS_VERDES },
};
const ESTACIONES_ANIO = ['primavera', 'verano', 'otono', 'invierno'];
const ALIAS_ESCENA = { bosque: 'primavera', nieve: 'invierno', mar: 'verano' };   // nombres de la versión anterior

// ---- Calendario ----
function estacionActual(f = new Date()) {
  const md = (f.getMonth() + 1) * 100 + f.getDate();
  if (md >= 321 && md < 621) return 'primavera';
  if (md >= 621 && md < 923) return 'verano';
  if (md >= 923 && md < 1221) return 'otono';
  return 'invierno';
}
function domingoDePascua(y) {   // algoritmo de Meeus/Jones/Butcher
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}
const soloDia = f => new Date(f.getFullYear(), f.getMonth(), f.getDate());
const diasEntre = (a, b) => Math.round((soloDia(a) - soloDia(b)) / 864e5);
const EVENTOS = [
  { id: 'navidad', activo: f => f.getMonth() === 11 || (f.getMonth() === 0 && f.getDate() <= 7) },        // 1 dic – 7 ene
  { id: 'halloween', activo: f => (f.getMonth() === 9 && f.getDate() >= 20) || (f.getMonth() === 10 && f.getDate() <= 2) }, // 20 oct – 2 nov
  { id: 'carnaval', activo: f => {                                                                        // la semana de carnaval
    const martes = domingoDePascua(f.getFullYear()); martes.setDate(martes.getDate() - 47);
    const d = diasEntre(f, martes); return d >= -6 && d <= 1;
  } },
  { id: 'cumple', activo: f => {                                                                          // 3 días antes y después
    if (!ajustes.cumple) return false;
    const [, m, d] = ajustes.cumple.split('-').map(Number);
    if (!m || !d) return false;
    return [-1, 0, 1].some(dy => Math.abs(diasEntre(f, new Date(f.getFullYear() + dy, m - 1, d))) <= 3);
  } },
];
const eventosDeHoy = (f = new Date()) => EVENTOS.filter(ev => ev.activo(f)).map(ev => ev.id);
const felicitacion = () => '¡Feliz cumpleaños' + (ajustes.nombre ? ', ' + ajustes.nombre : '') + '!';

const Calma = (() => {
  const cv = $('#calma-canvas'), g = cv.getContext('2d');
  const circulo = $('#respira-circulo'), texto = $('#respira-texto');
  let W = 0, H = 0, off = 0, tiempo = 0, ultimo = 0, velocidad = 45, corriendo = false, raf = 0;
  let humo = [], parts = [], estrellas = [], tHumo = 0, chimenea = { x: 0, y: 0 };
  let escena = (() => { const e = cargar('escena', null); return ALIAS_ESCENA[e] || e; })();
  let respirando = false, tResp = 0, fase = '', brillo = 0;

  const TAU = Math.PI * 2;
  const circ = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
  const elip = (x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill(); };
  const tri = (x1, y1, x2, y2, x3, y3) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.closePath(); g.fill(); };
  const rr = (x, y, w, h, r, c) => { g.fillStyle = c; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); };
  const suave = t => .5 - .5 * Math.cos(Math.PI * t);
  const elegir = (lista, i) => lista[Math.floor(azar(i) * lista.length) % lista.length];
  const escala = () => Math.max(.5, Math.min(1.25, H / 650, W / 680));

  function tam() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    estrellas = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H * .5, r: Math.random() * 1.6 + .4, f: Math.random() * 6 }));
    crearParts();
  }

  /* ---------- Partículas: nieve, hojas, pétalos, confeti ---------- */
  function nuevaPart(t, alInicio) {
    const p = { t, x: Math.random() * (W + 40), y: alInicio ? Math.random() * H : -12, rot: Math.random() * 6, vr: (Math.random() - .5) * 2, c: '#fff', r: 2, v: 12 };
    if (t === 'copos') { p.r = Math.random() * 2.5 + 1; p.v = Math.random() * 14 + 10; }
    if (t === 'hojas') { p.r = Math.random() * 4 + 5; p.v = Math.random() * 14 + 16; p.c = elegir(['#E58E3B', '#D9653B', '#E8B33E', '#C7562F'], Math.random() * 99); }
    if (t === 'petalos') { p.r = Math.random() * 2 + 3; p.v = Math.random() * 10 + 10; p.c = elegir(['#F6B8C8', '#FAD4DE', '#FFFFFF'], Math.random() * 99); }
    if (t === 'confeti') { p.r = Math.random() * 2 + 3; p.v = Math.random() * 15 + 18; p.c = elegir(['#E57368', '#6FA3D9', '#F2C94C', '#7CC189', '#B79BDB'], Math.random() * 99); }
    return p;
  }
  function crearParts() {
    const t = ESCENAS[escena] && ESCENAS[escena].parts;
    const n = { copos: 60, hojas: 22, petalos: 18, confeti: 45 }[t] || 0;
    parts = Array.from({ length: n }, () => nuevaPart(t, true));
  }
  function dibujarParts(dt) {
    parts.forEach((p, i) => {
      p.y += p.v * dt;
      p.x -= (velocidad * .3 + Math.sin(tiempo * .8 + i) * (p.t === 'copos' ? 8 : 14)) * dt;
      p.rot += p.vr * dt;
      if (p.y > H + 12 || p.x < -24) Object.assign(p, nuevaPart(p.t, false));
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
      if (p.t === 'copos') { g.fillStyle = 'rgba(255,255,255,.9)'; circ(0, 0, p.r); }
      else if (p.t === 'confeti') { g.fillStyle = p.c; g.fillRect(-p.r / 2, -p.r, p.r, p.r * 2); }
      else { g.fillStyle = p.c; elip(0, 0, p.r, p.r * .55); }
      g.restore();
    });
  }

  function altura(wx, base, amp, esc) { return base + Math.sin(wx / esc) * amp + Math.sin(wx / (esc * .37) + 1.3) * amp * .35; }

  /* ---------- Cielo ---------- */
  function cielo(E) {
    const gr = g.createLinearGradient(0, 0, 0, H * .8);
    gr.addColorStop(0, E.cielo[0]); gr.addColorStop(1, E.cielo[1]);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (E.estrellas) {
      g.fillStyle = '#FFF8E0';
      estrellas.forEach(s => { g.globalAlpha = .45 + .4 * Math.sin(tiempo * .7 + s.f); circ(s.x, s.y, s.r); });
      g.globalAlpha = 1;
    }
    const ax = W * .8, ay = H * .2, ar = Math.max(26, Math.min(50, H * .06));
    if (E.astro === 'luna') {
      g.fillStyle = 'rgba(255,248,214,.12)'; circ(ax, ay, ar * 1.9);
      g.fillStyle = '#F6F0CF'; circ(ax, ay, ar);
      g.fillStyle = 'rgba(200,195,160,.35)'; circ(ax - ar * .3, ay - ar * .2, ar * .2); circ(ax + ar * .25, ay + ar * .3, ar * .14);
    } else if (E.astro === 'luna-naranja') {
      g.fillStyle = 'rgba(246,193,119,.18)'; circ(ax, ay + ar * .4, ar * 2.3);
      g.fillStyle = '#F6C177'; circ(ax, ay + ar * .4, ar * 1.35);
    } else {
      const palido = E.astro === 'sol-palido', fuerte = E.astro === 'sol-fuerte';
      g.fillStyle = palido ? 'rgba(255,250,230,.5)' : 'rgba(255,230,150,.35)'; circ(ax, ay, ar * (fuerte ? 2.2 : 1.7));
      g.fillStyle = palido ? '#FFF6DA' : fuerte ? '#FFD86B' : '#FFE08A'; circ(ax, ay, ar * (fuerte ? 1.15 : 1));
    }
    if (E.nubes) {
      g.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 4; i++) {
        const span = W + 320;
        const x = ((i * span / 4 - off * .06) % span + span) % span - 160;
        const y = H * (.1 + azar(i + 2) * .18), s = .7 + azar(i + 9) * .6;
        circ(x, y, 26 * s); circ(x + 30 * s, y - 12 * s, 30 * s); circ(x + 62 * s, y, 24 * s);
        g.fillRect(x, y, 62 * s, 22 * s);
      }
    }
  }

  function banderines() {
    const d = off * .25, esp = 420, y0 = Math.max(H * .1, 100), caida = 60;
    const cols = ['#E57368', '#F2C94C', '#6FA3D9', '#7CC189', '#B79BDB'];
    for (let i = Math.floor(d / esp) - 1; i <= Math.ceil((d + W) / esp); i++) {
      const x0 = i * esp - d, x1 = x0 + esp, xm = (x0 + x1) / 2;
      g.strokeStyle = 'rgba(90,90,110,.45)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(xm, y0 + caida, x1, y0); g.stroke();
      for (let k = 1; k < 10; k++) {
        const t = k / 10, u = 1 - t;
        const x = u * u * x0 + 2 * u * t * xm + t * t * x1;
        const y = u * u * y0 + 2 * u * t * (y0 + caida) + t * t * y0;
        g.fillStyle = cols[((k + i * 3) % 5 + 5) % 5];
        tri(x - 9, y, x + 9, y, x, y + 20);
      }
    }
  }

  function aire(tipo, s) {
    const span = W + 160;
    for (let i = 0; i < 3; i++) {
      if (tipo === 'murcielagos') {
        const x = ((i * span / 3 + tiempo * (16 + i * 5)) % span) - 80;
        const y = H * (.14 + .07 * i) + Math.sin(tiempo * .9 + i * 2) * 12;
        const a = Math.sin(tiempo * 5 + i * 1.7);
        g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#2A2140';
        circ(0, 0, 5);
        [-1, 1].forEach(lado => {
          g.beginPath(); g.moveTo(0, 0);
          g.quadraticCurveTo(lado * 10, -10 - a * 8, lado * 20, -2 - a * 4);
          g.quadraticCurveTo(lado * 11, -1, 0, 4); g.fill();
        });
        g.restore();
      } else if (tipo === 'mariposas') {
        const x = (((i * span / 3 - tiempo * 12) % span) + span) % span - 80;
        const y = H * (.6 + .05 * i) + Math.sin(tiempo * 1.3 + i * 2) * 16;
        const ab = .25 + .75 * Math.abs(Math.sin(tiempo * 7 + i));
        g.save(); g.translate(x, y); g.scale(s * 1.7, s * 1.7);
        g.fillStyle = ['#F2C94C', '#B79BDB', '#F28C8C'][i];
        elip(-7 * ab, -3, 7 * ab, 8); elip(7 * ab, -3, 7 * ab, 8);
        elip(-5 * ab, 5, 5 * ab, 5); elip(5 * ab, 5, 5 * ab, 5);
        g.fillStyle = '#4A3B34'; elip(0, 0, 1.6, 7);
        g.restore();
      }
    }
  }

  function mar() {
    const top = H * .56, bot = H * .8;
    const gr = g.createLinearGradient(0, top, 0, bot);
    gr.addColorStop(0, '#7FC0E6'); gr.addColorStop(1, '#5FA8D6');
    g.fillStyle = gr; g.fillRect(0, top, W, bot - top);
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2;
    for (let f = 0; f < 4; f++) {
      const y = top + 14 + f * (bot - top - 30) / 4;
      const d = (off * (.05 + f * .05) + f * 37) % 90;
      for (let x = -d; x < W + 40; x += 90) { g.beginPath(); g.arc(x + 20, y + 8, 10, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    }
    const bx = W + 100 - ((off * .1) % (W + 240)), by = top + 26 + Math.sin(tiempo * 1.2) * 2;
    g.fillStyle = '#C4785A'; g.beginPath(); g.moveTo(bx - 34, by); g.lineTo(bx + 34, by); g.lineTo(bx + 24, by + 12); g.lineTo(bx - 24, by + 12); g.closePath(); g.fill();
    g.fillStyle = '#FFFFFF'; tri(bx, by - 50, bx, by - 4, bx + 30, by - 4);
    g.fillStyle = '#F2C94C'; tri(bx - 3, by - 42, bx - 3, by - 4, bx - 24, by - 4);
  }

  function capa(c) {
    const [color, bf, amp, esc, par] = c;
    const base = H * bf, d = off * par;
    g.fillStyle = color; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W + 12; x += 12) g.lineTo(x, altura(x + d, base, amp, esc));
    g.lineTo(W, H); g.closePath(); g.fill();
    return { base, amp, esc, d };
  }

  /* ---------- Árboles ---------- */
  function pino(x, y, t, col, nieve) {
    for (let k = 0; k < 3; k++) {
      const ty = y - 18 * t - k * 20 * t, w = (30 - k * 7) * t;
      g.fillStyle = col; tri(x, ty - 30 * t, x - w, ty, x + w, ty);
      if (nieve) { g.fillStyle = '#FFFFFF'; tri(x, ty - 30 * t, x - w * .46, ty - 16 * t, x + w * .46, ty - 16 * t); }
    }
  }
  function arbol(tipo, x, y, t, i) {
    const tronco = tipo === 'pino-noche' ? '#151d33' : tipo === 'pelado' ? '#2E2440' : '#8B6B4A';
    if (tipo === 'palmera') {
      g.strokeStyle = '#A57A4F'; g.lineWidth = 7 * t; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4 * t, y - 40 * t, x + 14 * t, y - 76 * t); g.stroke();
      const cx = x + 14 * t, cy = y - 78 * t;
      g.fillStyle = '#5FA36A';
      [-2.6, -2.0, -1.2, -.6, 0].forEach(a => elip(cx + Math.cos(a) * 20 * t, cy + Math.sin(a) * 9 * t + 6 * t, 24 * t, 7 * t, a));
      g.fillStyle = '#8B5E3C'; circ(cx - 3 * t, cy + 6 * t, 4 * t); circ(cx + 4 * t, cy + 7 * t, 4 * t);
      return;
    }
    if (tipo === 'pelado') {
      g.fillStyle = tronco; g.fillRect(x - 4 * t, y - 40 * t, 8 * t, 42 * t);
      g.strokeStyle = tronco; g.lineWidth = 3.5 * t; g.lineCap = 'round';
      [[-16, -58, -30], [18, -62, -34], [3, -70, -38]].forEach(([dx, dy, from]) => { g.beginPath(); g.moveTo(x, y + from * t); g.lineTo(x + dx * t, y + dy * t); g.stroke(); });
      return;
    }
    g.fillStyle = tronco; g.fillRect(x - 4 * t, y - 24 * t, 8 * t, 26 * t);
    if (tipo === 'redondo' || tipo === 'flor' || tipo === 'otono') {
      const copa = tipo === 'flor' ? ['#F4B6C8', '#F9D3DE'] : tipo === 'otono' ? elegir([['#E58E3B', '#F0A868'], ['#D9653B', '#E88A5E'], ['#E8B33E', '#F2CD6B']], i) : ['#5E9E6B', '#74B27F'];
      g.fillStyle = copa[0]; circ(x, y - 44 * t, 26 * t);
      g.fillStyle = copa[1]; circ(x - 8 * t, y - 52 * t, 13 * t);
      if (tipo === 'flor') { g.fillStyle = '#FFFFFF'; for (let k = 0; k < 5; k++) circ(x + (azar(i + k) - .5) * 36 * t, y - 44 * t + (azar(i + k + 9) - .5) * 30 * t, 2.6 * t); }
      return;
    }
    if (tipo === 'pino-navidad') {
      pino(x, y, t, '#3F6E5A', true);
      const cols = ['#F26B6B', '#F2C94C', '#6FA3D9', '#7CC189'];
      for (let k = 0; k < 3; k++) {
        const ty = y - 18 * t - k * 20 * t - 4 * t, w = (30 - k * 7) * t;
        [-.55, 0, .55].forEach((j, n) => {
          g.globalAlpha = .55 + .45 * Math.sin(tiempo * 1.2 + i + k * 2 + n * 2.5);
          g.fillStyle = cols[(k + n + i) % 4]; circ(x + j * w, ty, 3 * t);
        });
      }
      g.globalAlpha = 1;
      const sy = y - 88 * t;
      g.fillStyle = '#F2C94C';
      g.beginPath();
      for (let k = 0; k < 10; k++) { const r = (k % 2 ? 4 : 9) * t, a = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(x + Math.cos(a) * r, sy + Math.sin(a) * r); }
      g.closePath(); g.fill();
      return;
    }
    pino(x, y, t, tipo === 'pino-noche' ? '#18223D' : '#5F8F7C', tipo === 'pino-nieve');
  }
  function arboles(tipo, c, s) {
    const esp = 150, hueco = tipo === 'palmera' ? .62 : tipo === 'otono' || tipo === 'flor' ? .2 : .35;
    const i0 = Math.floor(c.d / esp) - 1, i1 = Math.ceil((c.d + W) / esp) + 1;
    for (let i = i0; i <= i1; i++) {
      if (azar(i) < hueco) continue;
      const wx = i * esp + azar(i + 7) * 70;
      arbol(tipo, wx - c.d, altura(wx, c.base, c.amp, c.esc) + 8, s * (.7 + azar(i + 3) * .6), i);
    }
  }

  /* ---------- Decoración del suelo: flores, calabazas ---------- */
  function calabaza(x, y, t) {
    g.fillStyle = 'rgba(255,170,90,.18)'; circ(x, y, 24 * t);
    g.fillStyle = '#E9792F'; elip(x - 8 * t, y, 10 * t, 12 * t); elip(x + 8 * t, y, 10 * t, 12 * t);
    g.fillStyle = '#F08A3C'; elip(x, y, 12 * t, 13 * t);
    g.fillStyle = '#5C7A3A'; g.fillRect(x - 2 * t, y - 17 * t, 4 * t, 6 * t);
    g.fillStyle = '#5A2E12'; circ(x - 5 * t, y - 3 * t, 2 * t); circ(x + 5 * t, y - 3 * t, 2 * t);
    g.strokeStyle = '#5A2E12'; g.lineWidth = 1.6 * t; g.beginPath(); g.arc(x, y + 1 * t, 5 * t, .2 * Math.PI, .8 * Math.PI); g.stroke();
  }
  function deco(tipo, c, s) {
    const esp = tipo === 'flores' ? 46 : 230, salta = tipo === 'flores' ? .35 : .45;
    const cols = ['#F28C8C', '#F2C94C', '#B79BDB', '#FFFFFF', '#6FA3D9'];
    const i0 = Math.floor(c.d / esp) - 1, i1 = Math.ceil((c.d + W) / esp) + 1;
    for (let i = i0; i <= i1; i++) {
      if (azar(i * 3.1) < salta) continue;
      const wx = i * esp + azar(i + 11) * 30, x = wx - c.d;
      const y = altura(wx, c.base, c.amp, c.esc) + (tipo === 'flores' ? (14 + azar(i + 5) * 34) : 30) * s;
      if (tipo === 'flores') {
        const f = s * 1.5;
        g.strokeStyle = '#5E9E5B'; g.lineWidth = 1.8 * f; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 10 * f); g.stroke();
        g.fillStyle = elegir(cols, i); [0, 1, 2, 3, 4].forEach(k => circ(x + Math.cos(k * 1.257) * 3.5 * f, y - 10 * f + Math.sin(k * 1.257) * 3.5 * f, 2.8 * f));
        g.fillStyle = '#F2C94C'; circ(x, y - 10 * f, 1.8 * f);
      } else calabaza(x, y, s * (.8 + azar(i) * .4));
    }
  }

  // Suelo según el vehículo: vías, carretera, agua o nada (el avión vuela)
  function via(E) {
    const y = H * .82, veh = ajustes.vehiculo;
    g.fillStyle = E.suelo; g.fillRect(0, y, W, H - y);
    if (veh === 'coche') {
      g.fillStyle = E.noche ? '#4A5368' : '#7A8590'; g.fillRect(0, y, W, 32);
      g.fillStyle = E.noche ? '#6B7590' : '#95A0AA'; g.fillRect(0, y, W, 3); g.fillRect(0, y + 29, W, 3);
      g.fillStyle = 'rgba(255,255,255,.85)';
      const esp = 70, d = off % esp;
      for (let x = -d; x < W + esp; x += esp) g.fillRect(x, y + 14, 34, 4);
    } else if (veh === 'barco') {
      const gr = g.createLinearGradient(0, y - 8, 0, H);
      gr.addColorStop(0, E.noche ? '#3C5A8A' : '#8CC4E4'); gr.addColorStop(1, E.noche ? '#2A4570' : '#5FA8D6');
      g.fillStyle = gr; g.fillRect(0, y - 8, W, H - y + 8);
    } else if (veh !== 'avion') {
      g.fillStyle = E.noche ? '#3A4462' : '#9C7B5B';
      const esp = 34, d = off % esp;
      for (let x = -d; x < W + esp; x += esp) g.fillRect(x, y + 4, 20, 9);
      g.fillStyle = E.noche ? '#8790AA' : '#7D8597'; g.fillRect(0, y, W, 5);
    }
    return y;
  }
  // Olas por delante del barco, para que parezca que flota
  function olasDelante(y, E) {
    g.fillStyle = E.noche ? 'rgba(60,90,138,.6)' : 'rgba(111,176,216,.6)';
    g.fillRect(0, y + 4, W, 14);
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2;
    const d = (off * 1.1) % 60;
    for (let x = -d; x < W + 60; x += 60) { g.beginPath(); g.arc(x + 20, y + 12, 9, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  }
  function haz(fx, fy, E) {
    const luz = E.noche ? .3 + brillo * .3 : brillo * .25;
    if (luz <= .01) return;
    const gr = g.createLinearGradient(fx, 0, fx + 280, 0);
    gr.addColorStop(0, `rgba(255,240,180,${luz})`); gr.addColorStop(1, 'rgba(255,240,180,0)');
    g.fillStyle = gr; tri(fx, fy - 6, fx + 280, fy - 60, fx + 280, fy + 50);
  }
  function luzDelantera(fx, fy, r = 8) {
    g.fillStyle = `rgba(255,236,160,${.25 + brillo * .45})`; circ(fx, fy, r + 2 + brillo * 10);
    g.fillStyle = '#FFE9A8'; circ(fx, fy, r);
  }
  const coloresVagones = E => E.vagones || ['#E8907F', '#F2C94C', '#7CC189'];
  const ventana = E => E.noche ? '#FFE7A3' : '#DDEFFF';

  function dibujarVehiculo(y, s, E) {
    const v = ajustes.vehiculo;
    if (v === 'coche') dibujarCoche(y + 22, s, E);
    else if (v === 'barco') { dibujarBarco(y + 8, s, E); olasDelante(y, E); }
    else if (v === 'avion') dibujarAvion(H * .5, s, E);
    else dibujarTren(y, s, E);
  }

  function dibujarCoche(base, s, E) {
    const ang = off / 13, bob = ajustes.animaciones ? Math.sin(tiempo * 7) * .8 : 0;
    g.save(); g.translate(W / 2, base); g.scale(s, s);
    let x = -215;
    coloresVagones(E).forEach((c, i) => {
      if (E.carga) cargaVagon(E.carga, x - 5, -64 + bob, i);
      rr(x, -64 + bob, 110, 46, 10, c);
      rr(x + 10, -56 + bob, 90, 8, 4, 'rgba(255,255,255,.45)');
      rueda(x + 24, -13, 13, ang); rueda(x + 86, -13, 13, ang);
      g.fillStyle = '#55607a'; g.fillRect(x + 110, -26, 16, 4);
      x += 126;
    });
    const fx = x + 164, fy = -40 + bob;
    haz(fx, fy, E);
    g.fillStyle = '#2F5F80';
    g.beginPath(); g.moveTo(x + 26, -50 + bob); g.lineTo(x + 50, -86 + bob); g.quadraticCurveTo(x + 54, -92 + bob, x + 62, -92 + bob);
    g.lineTo(x + 110, -92 + bob); g.quadraticCurveTo(x + 118, -92 + bob, x + 123, -86 + bob); g.lineTo(x + 146, -50 + bob); g.closePath(); g.fill();
    g.fillStyle = ventana(E);
    g.beginPath(); g.moveTo(x + 42, -52 + bob); g.lineTo(x + 58, -82 + bob); g.lineTo(x + 82, -82 + bob); g.lineTo(x + 82, -52 + bob); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x + 90, -52 + bob); g.lineTo(x + 90, -82 + bob); g.lineTo(x + 112, -82 + bob); g.lineTo(x + 130, -52 + bob); g.closePath(); g.fill();
    rr(x, -56 + bob, 168, 42, 16, '#407295');
    rr(x - 2, -46 + bob, 6, 10, 2, '#E57368');
    if (escena === 'navidad') { g.fillStyle = '#E07A6F'; tri(x + 60, -92 + bob, x + 112, -92 + bob, x + 96, -112 + bob); g.fillStyle = '#FFFFFF'; circ(x + 96, -112 + bob, 5); }
    luzDelantera(fx, fy, 7);
    rueda(x + 40, -16, 17, ang); rueda(x + 128, -16, 17, ang);
    g.restore();
    chimenea = null;   // el coche no echa humo
  }

  function dibujarBarco(base, s, E) {
    const ola = i => ajustes.animaciones ? Math.sin(tiempo * 1.6 + i * .9) * 3 : 0;
    g.save(); g.translate(W / 2, base); g.scale(s, s);
    let x = -232;
    coloresVagones(E).forEach((c, i) => {
      const b = ola(i);
      if (E.carga) cargaVagon(E.carga, x - 5, -66 + b, i);
      rr(x + 8, -66 + b, 94, 32, 6, c);
      rr(x + 16, -60 + b, 78, 8, 4, 'rgba(255,255,255,.45)');
      g.fillStyle = '#2F5F80';
      g.beginPath(); g.moveTo(x, -36 + b); g.lineTo(x + 110, -36 + b); g.lineTo(x + 100, -4 + b); g.lineTo(x + 10, -4 + b); g.closePath(); g.fill();
      g.strokeStyle = '#A57A4F'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x + 108, -28 + b); g.lineTo(x + 128, -28 + ola(i + 1)); g.stroke();
      x += 126;
    });
    const b = ola(4), fx = x + 158, fy = -52 + b;
    haz(fx, fy, E);
    rr(x + 106, -104 + b, 22, 62, 4, '#2F5F80');
    rr(x + 106, -96 + b, 22, 8, 0, '#E57368');
    rr(x + 28, -82 + b, 74, 38, 8, '#F6F9FA');
    g.fillStyle = E.noche ? '#FFE7A3' : '#9CC3DE'; circ(x + 47, -63 + b, 7); circ(x + 65, -63 + b, 7); circ(x + 83, -63 + b, 7);
    g.fillStyle = '#407295';
    g.beginPath(); g.moveTo(x, -46 + b); g.lineTo(x + 168, -46 + b); g.lineTo(x + 150, -2 + b); g.lineTo(x + 18, -2 + b); g.closePath(); g.fill();
    rr(x + 8, -40 + b, 152, 6, 3, 'rgba(255,255,255,.8)');
    if (escena === 'navidad') { g.fillStyle = '#E07A6F'; tri(x + 34, -82 + b, x + 96, -82 + b, x + 80, -104 + b); g.fillStyle = '#FFFFFF'; circ(x + 80, -104 + b, 5); }
    luzDelantera(fx, fy, 6);
    g.restore();
    chimenea = { x: W / 2 + (x + 117) * s, y: base + (-106 + b) * s };
  }

  function dibujarAvion(alto, s, E) {
    const flota = i => ajustes.animaciones ? Math.sin(tiempo * 1.2 + i * .8) * 5 : 0;
    g.save(); g.translate(W / 2, alto); g.scale(s, s);
    let x = -258;
    const cols = coloresVagones(E);
    cols.forEach((c, i) => {
      const b = flota(i);
      if (E.carga) cargaVagon(E.carga, x - 12, -46 + b, i);
      rr(x, -46 + b, 96, 40, 12, c);
      rr(x + 10, -38 + b, 76, 8, 4, 'rgba(255,255,255,.5)');
      g.strokeStyle = '#9FB4C2'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x + 96, -26 + b); g.lineTo(x + 114, -26 + (i + 1 < cols.length ? flota(i + 1) : flota(9))); g.stroke();
      x += 114;
    });
    const b = flota(9), fx = x + 170, fy = -28 + b;
    haz(fx, fy, E);
    g.fillStyle = '#2F5F80';
    g.beginPath(); g.moveTo(x + 4, -60 + b); g.lineTo(x + 28, -60 + b); g.lineTo(x + 46, -30 + b); g.lineTo(x + 14, -30 + b); g.closePath(); g.fill();
    tri(x + 90, -38 + b, x + 120, -38 + b, x + 102, -66 + b);
    g.fillStyle = '#F6F9FA'; elip(x + 88, -26 + b, 82, 22);
    g.strokeStyle = '#2F5F80'; g.lineWidth = 3; g.beginPath(); g.ellipse(x + 88, -26 + b, 82, 22, 0, 0, TAU); g.stroke();
    rr(x + 14, -22 + b, 148, 6, 3, '#407295');
    g.fillStyle = E.noche ? '#FFE7A3' : '#9CC3DE';
    [58, 74, 90, 106, 122].forEach(d => circ(x + d, -32 + b, 5));
    g.beginPath(); g.moveTo(x + 144, -38 + b); g.quadraticCurveTo(x + 160, -36 + b, x + 166, -28 + b); g.lineTo(x + 144, -28 + b); g.closePath(); g.fill();
    g.fillStyle = '#407295';
    g.beginPath(); g.moveTo(x + 70, -20 + b); g.lineTo(x + 118, -20 + b); g.lineTo(x + 94, 18 + b); g.lineTo(x + 76, 18 + b); g.closePath(); g.fill();
    if (escena === 'navidad') { g.fillStyle = '#E07A6F'; tri(x + 120, -44 + b, x + 150, -42 + b, x + 140, -62 + b); g.fillStyle = '#FFFFFF'; circ(x + 140, -62 + b, 4); }
    luzDelantera(fx, fy, 4);
    g.restore();
    chimenea = { x: W / 2 + (x + 4) * s, y: alto + (-28 + b) * s };   // estela detrás de la cola
  }

  /* ---------- Tren ---------- */
  function rueda(cx, cy, r, ang) {
    g.fillStyle = '#3d4352'; circ(cx, cy, r);
    g.strokeStyle = '#9aa3b5'; g.lineWidth = 2;
    for (let k = 0; k < 3; k++) {
      const a = ang + k * Math.PI / 3;
      g.beginPath();
      g.moveTo(cx - Math.cos(a) * r * .72, cy - Math.sin(a) * r * .72);
      g.lineTo(cx + Math.cos(a) * r * .72, cy + Math.sin(a) * r * .72);
      g.stroke();
    }
    g.fillStyle = '#c9cfdb'; circ(cx, cy, r * .25);
  }
  function cargaVagon(tipo, x, y, i) {
    if (tipo === 'regalos') {
      const cajas = [[16, 34, 26, '#F2C94C', '#E07A6F'], [60, 28, 20, '#6FA3D9', '#FFFFFF'], [88, 20, 16, '#E07A6F', '#F2C94C']];
      cajas.forEach(([dx, w, h, c, cinta], k) => {
        if ((k + i) % 3 === 2 && i === 1) return;
        rr(x + dx, y - h, w, h, 3, c);
        g.fillStyle = cinta; g.fillRect(x + dx + w / 2 - 2.5, y - h, 5, h); g.fillRect(x + dx, y - h / 2 - 2.5, w, 5);
      });
    } else if (tipo === 'globos') {
      const cols = ['#E57368', '#6FA3D9', '#F2C94C', '#7CC189', '#B79BDB'];
      [30, 84].forEach((dx, k) => {
        const bx = x + dx + Math.sin(tiempo * 1.4 + i + k) * 5, by = y - 70 - k * 14 + Math.sin(tiempo * 1.1 + i * 2 + k) * 3;
        g.strokeStyle = 'rgba(80,80,100,.5)'; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(x + dx, y); g.quadraticCurveTo(x + dx + 6, y - 30, bx, by + 20); g.stroke();
        g.fillStyle = cols[(i * 2 + k) % cols.length]; elip(bx, by, 15, 19);
        g.fillStyle = 'rgba(255,255,255,.45)'; elip(bx - 5, by - 7, 4, 6);
      });
    } else if (tipo === 'calabazas') {
      calabaza(x + 60, y - 13, .95);
    }
  }
  function dibujarTren(base, s, E) {
    const ang = off / 15;
    const bob = ajustes.animaciones ? Math.sin(tiempo * 9) * 1.1 : 0;
    g.save(); g.translate(W / 2, base); g.scale(s, s);
    let x = -286;
    (E.vagones || ['#E8907F', '#F2C94C', '#7CC189']).forEach((c, i) => {
      const by = i % 2 ? bob : -bob;
      if (E.carga) cargaVagon(E.carga, x, -95 + by, i);
      rr(x, -95 + by, 120, 70, 12, c);
      rr(x + 12, -83 + by, 96, 26, 8, E.noche ? '#FFE7A3' : 'rgba(255,255,255,.6)');
      rueda(x + 28, -18, 15, ang); rueda(x + 92, -18, 15, ang);
      g.fillStyle = '#55607a'; g.fillRect(x + 120, -42, 14, 6);
      x += 134;
    });
    const fx = x + 160, fy = -62 + bob;
    haz(fx, fy, E);
    rr(x, -125 + bob, 70, 100, 10, '#407295');
    rr(x - 4, -133 + bob, 78, 14, 6, '#2F5F80');
    rr(x + 12, -112 + bob, 46, 32, 6, ventana(E));
    rr(x + 66, -85 + bob, 92, 60, 14, '#36668A');
    rr(x + 112, -118 + bob, 20, 36, 4, '#2F5F80');
    rr(x + 106, -124 + bob, 32, 10, 4, '#2F5F80');
    if (escena === 'navidad') { g.fillStyle = '#E07A6F'; tri(x - 2, -133 + bob, x + 76, -133 + bob, x + 52, -158 + bob); g.fillStyle = '#FFFFFF'; rr(x - 4, -137 + bob, 82, 7, 3, '#FFFFFF'); circ(x + 52, -158 + bob, 6); }
    luzDelantera(fx, fy, 8);
    rueda(x + 30, -20, 20, ang); rueda(x + 92, -17, 16, ang); rueda(x + 136, -17, 16, ang);
    g.restore();
    chimenea = { x: W / 2 + (x + 122) * s, y: base + (-126 + bob) * s };
  }

  function humoPaso(dt, s, E) {
    tHumo -= dt;
    if (tHumo <= 0 && chimenea) { tHumo = ajustes.animaciones ? .55 : 1.2; humo.push({ x: chimenea.x, y: chimenea.y, r: 7 * s, a: .55 }); }
    humo.forEach(p => { p.y -= 22 * dt * s; p.x -= velocidad * dt * .5; p.r += 7 * dt * s; p.a -= .16 * dt; });
    humo = humo.filter(p => p.a > 0);
    humo.forEach(p => { g.fillStyle = E.noche ? `rgba(200,210,235,${p.a})` : `rgba(255,255,255,${p.a})`; circ(p.x, p.y, p.r); });
  }

  function respiracion(dt) {
    tResp += dt;
    const c = tResp % 10;
    let f, esc;
    if (c < 4) { f = 'Coge aire'; esc = .6 + .4 * suave(c / 4); }
    else if (c < 5) { f = 'Aguanta'; esc = 1; }
    else if (c < 9) { f = 'Suelta aire'; esc = 1 - .4 * suave((c - 5) / 4); }
    else { f = 'Descansa'; esc = .6; }
    brillo = (esc - .6) / .4;
    circulo.style.transform = `scale(${esc})`;
    if (f !== fase) {
      fase = f; texto.textContent = f;
      if (f === 'Coge aire') tono(330, 1.4, .035);
      if (f === 'Suelta aire') tono(262, 1.4, .035);
    }
  }

  function cuadro(ts) {
    if (!corriendo) return;
    const dt = Math.min(.05, Math.max(0, (ts - ultimo) / 1000));
    ultimo = ts; tiempo += dt;
    velocidad = ajustes.animaciones ? 45 : 22;
    off += velocidad * dt;
    const E = ESCENAS[escena], s = escala();
    cielo(E);
    if (E.banderines) banderines();
    if (E.aire === 'murcielagos') aire('murcielagos', s);
    if (E.mar) mar();
    let ultima = null;
    E.capas.forEach(c => { ultima = capa(c); });
    if (E.arbol && ultima) arboles(E.arbol, ultima, s);
    if (E.deco && ultima) deco(E.deco, ultima, s);
    if (E.aire === 'mariposas') aire('mariposas', s);
    const y = via(E);
    if (respirando) respiracion(dt); else brillo = Math.max(0, brillo - dt);
    humoPaso(dt, s, E);
    dibujarVehiculo(y, s, E);
    if (E.parts) dibujarParts(dt);
    dibujarMagia(dt);
    raf = requestAnimationFrame(cuadro);
  }

  /* ---------- Botones de paisaje ---------- */
  function disponibles() {
    const hoyEv = eventosDeHoy();
    return [...ESTACIONES_ANIO, 'noche', ...EVENTOS.map(ev => ev.id).filter(id => ajustes.eventosSiempre || hoyEv.includes(id))];
  }
  function pintarBotones() {
    const actual = estacionActual();
    $('#calma-escenas').innerHTML = disponibles().map(id => {
      const E = ESCENAS[id];
      const etiqueta = E.nombre + (id === actual ? ' (estamos en esta estación)' : '');
      return `<button class="btn-redondo escena ${E.evento ? 'especial' : ''} ${id === actual ? 'hoy' : ''}" data-escena="${id}" aria-label="${etiqueta}" title="${etiqueta}">${E.icono}</button>`;
    }).join('');
    marcarEscena();
  }
  function marcarEscena() { $$('#calma-escenas .escena').forEach(b => b.classList.toggle('elegido', b.dataset.escena === escena)); }
  function cambiarEscena(id) {
    escena = id; guardar('escena', escena);
    crearParts(); humo = []; marcarEscena();
  }

  $('#calma-escenas').addEventListener('click', e => {
    const b = e.target.closest('.escena'); if (!b) return;
    cambiarEscena(b.dataset.escena); sonidos.toque();
    decir(escena === 'cumple' ? felicitacion() : ESCENAS[escena].nombre);
  });

  $('#btn-respirar').addEventListener('click', () => {
    respirando = !respirando; tResp = 0; fase = '';
    $('#respira').classList.toggle('oculto', !respirando);
    $('#btn-respirar').classList.toggle('elegido', respirando);
    decir(respirando ? `Vamos a respirar despacio con el ${V().n}` : '');
  });

  /* ---------- Toques mágicos: al tocar o deslizar el dedo salen formas que flotan ----------
     Cada paisaje tiene su forma, y cada toque suena con una nota suave
     (escala pentatónica: nunca desafina, toque donde toque). */
  const MAGIA = {
    primavera: { f: 'flor', c: ['#F6B8C8', '#FFFFFF', '#F9D776', '#FAD4DE'] },
    verano: { f: 'burbuja', c: ['#FFFFFF'] },
    otono: { f: 'hoja', c: ['#E58E3B', '#D9653B', '#E8B33E', '#C7562F'] },
    invierno: { f: 'copo', c: ['#FFFFFF', '#E6F2FF'] },
    noche: { f: 'estrella', c: ['#FFE9A8', '#FFF6D8', '#FFD86B'] },
    navidad: { f: 'estrella', c: ['#FFD86B', '#FFE9A8', '#F6F0CF'] },
    halloween: { f: 'luciernaga', c: ['#FFC86B', '#C6F28C', '#FFE29A'] },
    carnaval: { f: 'estrella', c: ['#E57368', '#6FA3D9', '#F2C94C', '#7CC189', '#B79BDB'] },
    cumple: { f: 'corazon', c: ['#F4A6B8', '#E57368', '#B79BDB', '#9CC9EE'] },
  };
  const NOTAS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];
  let magia = [], ondas = [], ultNota = -1, tNota = 0, ultPunto = null, pistaDada = false;

  function nota(x) {
    const i = Math.max(0, Math.min(NOTAS.length - 1, Math.floor(x / W * NOTAS.length)));
    const ahora = performance.now();
    if (i === ultNota && ahora - tNota < 260) return;   // al deslizar, no repetir la misma nota seguida
    if (ahora - tNota < 110) return;                     // ni sonar demasiado a menudo
    ultNota = i; tNota = ahora;
    tono(NOTAS[i], 1.6, .05); tono(NOTAS[i] * 2, 1, .012, 'sine', .01);   // campanita suave
  }
  function soltarMagia(x, y, n) {
    const M = MAGIA[escena] || MAGIA.noche, s = escala();
    for (let k = 0; k < n; k++) {
      const ang = Math.random() * TAU, vel = 10 + Math.random() * 30;
      const chispa = Math.random() < .35;   // chispitas brillantes mezcladas con las formas
      magia.push({
        x, y, f: chispa ? 'chispa' : M.f, c: chispa ? '#FFFFFF' : M.c[Math.floor(Math.random() * M.c.length)],
        vx: Math.cos(ang) * vel * 1.6, vy: Math.sin(ang) * vel * 1.6 - 22,
        r: (chispa ? 6 + Math.random() * 6 : 13 + Math.random() * 13) * s, rot: Math.random() * TAU, vr: (Math.random() - .5) * 1.2,
        vida: 0, dura: 2.6 + Math.random() * 1.8, fase: Math.random() * TAU,
      });
    }
    if (magia.length > 300) magia.splice(0, magia.length - 300);
  }
  function estrella5(r) {
    g.beginPath();
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? r * .45 : r; g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
    g.closePath(); g.fill();
  }
  function dibujarForma(p) {
    const r = p.r;
    if (p.f !== 'luciernaga' && p.f !== 'burbuja') {   // brillo suave detrás de cada forma
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 2);
      gr.addColorStop(0, 'rgba(255,255,240,.55)'); gr.addColorStop(1, 'rgba(255,255,240,0)');
      g.fillStyle = gr; circ(0, 0, r * 2);
    }
    g.fillStyle = p.c; g.strokeStyle = p.c;
    if (p.f === 'chispa') {
      g.beginPath();
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, q = k % 2 ? r * .22 : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
      g.closePath(); g.fill();
    } else if (p.f === 'flor') {
      for (let k = 0; k < 5; k++) circ(Math.cos(k * TAU / 5) * r * .55, Math.sin(k * TAU / 5) * r * .55, r * .45);
      g.fillStyle = '#F2C94C'; circ(0, 0, r * .3);
    } else if (p.f === 'burbuja') {
      g.fillStyle = 'rgba(200,235,255,.18)'; circ(0, 0, r * 1.3);
      g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(0, 0, r * 1.3, 0, TAU); g.stroke();
      g.strokeStyle = 'rgba(183,155,219,.5)'; g.beginPath(); g.arc(0, 0, r * 1.15, .3, 1.6); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.85)'; elip(-r * .45, -r * .5, r * .28, r * .16, -.6);
    } else if (p.f === 'hoja') {
      elip(0, 0, r, r * .5);
      g.strokeStyle = 'rgba(120,60,20,.4)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.stroke();
    } else if (p.f === 'copo') {
      g.lineWidth = Math.max(1.5, r * .16); g.lineCap = 'round';
      for (let k = 0; k < 6; k++) {
        const a = k * TAU / 6, cx = Math.cos(a), cy = Math.sin(a);
        g.beginPath(); g.moveTo(0, 0); g.lineTo(cx * r, cy * r);
        g.moveTo(cx * r * .55, cy * r * .55); g.lineTo(cx * r * .55 + Math.cos(a + .7) * r * .3, cy * r * .55 + Math.sin(a + .7) * r * .3);
        g.moveTo(cx * r * .55, cy * r * .55); g.lineTo(cx * r * .55 + Math.cos(a - .7) * r * .3, cy * r * .55 + Math.sin(a - .7) * r * .3);
        g.stroke();
      }
    } else if (p.f === 'luciernaga') {
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.6);
      gr.addColorStop(0, p.c); gr.addColorStop(1, 'rgba(255,220,120,0)');
      g.fillStyle = gr; circ(0, 0, r * 1.6);
      g.fillStyle = '#FFFBEA'; circ(0, 0, r * .3);
    } else if (p.f === 'corazon') {
      g.beginPath(); g.moveTo(0, r * .8);
      g.bezierCurveTo(-r * 1.3, -r * .1, -r * .6, -r * 1.1, 0, -r * .4);
      g.bezierCurveTo(r * .6, -r * 1.1, r * 1.3, -r * .1, 0, r * .8); g.fill();
    } else {
      estrella5(r);
    }
  }
  function dibujarMagia(dt) {
    ondas.forEach(o => {
      o.t += dt;
      const k = o.t / 1.4;
      g.strokeStyle = `rgba(255,255,255,${.8 * (1 - k)})`; g.lineWidth = 5 * (1 - k) + .5;
      g.beginPath(); g.arc(o.x, o.y, 10 + k * 110 * escala(), 0, TAU); g.stroke();
      g.lineWidth = 2.5 * (1 - k) + .3;
      g.beginPath(); g.arc(o.x, o.y, 6 + k * 60 * escala(), 0, TAU); g.stroke();
    });
    ondas = ondas.filter(o => o.t < 1.4);
    const lento = ajustes.animaciones ? 1 : .5;
    magia.forEach(p => {
      p.vida += dt;
      p.vx *= 1 - 1.6 * dt; p.vy = p.vy * (1 - 1.2 * dt) - 6 * dt;   // frenan y suben despacio
      p.x += (p.vx + Math.sin(tiempo * 1.5 + p.fase) * 8) * dt * lento;
      p.y += p.vy * dt * lento;
      p.rot += p.vr * dt * lento;
      const k = p.vida / p.dura;
      const a = k < .15 ? k / .15 : 1 - suave((k - .15) / .85);           // aparece y se apaga suave
      const crece = .5 + .5 * Math.min(1, k / .15);
      const parpadeo = p.f === 'luciernaga' || p.f === 'estrella' ? .75 + .25 * Math.sin(tiempo * 3 + p.fase) : 1;
      g.save(); g.globalAlpha = Math.max(0, a * parpadeo);
      g.translate(p.x, p.y); g.rotate(p.f === 'burbuja' ? 0 : p.rot); g.scale(crece, crece);
      dibujarForma(p);
      g.restore();
    });
    magia = magia.filter(p => p.vida < p.dura);
  }

  function puntoDe(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  cv.addEventListener('pointerdown', e => {
    audio();
    const { x, y } = puntoDe(e);
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
    ultPunto = { x, y };
    // Tocar el vehículo: pita suave y echa humo
    if (y > H * .62) {
      sonidos.silbato();
      const s = escala();
      if (chimenea) for (let i = 0; i < 3; i++) humo.push({ x: chimenea.x + i * 6, y: chimenea.y - i * 10, r: (9 + i * 3) * s, a: .7 });
      return;
    }
    // Tocar el cielo: magia + nota
    ondas.push({ x, y, t: 0 });
    soltarMagia(x, y, 14);
    ultNota = -1; nota(x);
  });
  cv.addEventListener('pointermove', e => {
    if (!ultPunto) return;
    const { x, y } = puntoDe(e);
    const d = Math.hypot(x - ultPunto.x, y - ultPunto.y);
    if (d < 14) return;
    ultPunto = { x, y };
    soltarMagia(x, Math.min(y, H * .8), 3);   // estela al deslizar el dedo
    nota(x);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => cv.addEventListener(t, () => { ultPunto = null; }));

  window.addEventListener('resize', () => { if (corriendo) tam(); });

  return {
    iniciar() {
      const lista = disponibles();
      if (!ESCENAS[escena] || !lista.includes(escena)) escena = estacionActual();
      pintarBotones();
      tam();
      corriendo = true; ultimo = performance.now();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(cuadro);
      iniciarMusica(); chuchu(3);
      const fiesta = eventosDeHoy()[0];
      if (fiesta === 'cumple') decir('Viaje en calma. ' + felicitacion());
      else if (fiesta) decir(`Viaje en calma. ¡Ya es ${ESCENAS[fiesta].nombre}!`);
      else decir('Viaje en calma. Estamos en ' + ESCENAS[estacionActual()].nombre.toLowerCase());
      magia = []; ondas = [];
      if (!pistaDada) { pistaDada = true; despues(2500, () => avisar('Toca o desliza el dedo por el cielo ✨')); }
    },
    parar() {
      corriendo = false; cancelAnimationFrame(raf); pararMusica();
      respirando = false; $('#respira').classList.add('oculto'); $('#btn-respirar').classList.remove('elegido');
    },
    pintarBotones,
  };
})();

/* =========================================================
   PICTOGRAMAS DE ARASAAC
   Autor: Sergio Palao · Propiedad: Gobierno de Aragón · CC BY-NC-SA
   ========================================================= */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const urlPicto = id => `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
const capitalizar = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
function pictoHTML(it) {
  if (it && it.p) return `<img class="picto" src="${urlPicto(it.p)}" alt="${esc(it.n)}" draggable="false" loading="lazy">`;
  return `<span class="picto picto-emoji">${it && it.e ? it.e : '❓'}</span>`;
}
function pide(texto, valor) { const r = prompt(texto, valor); return r == null ? null : r.trim(); }

/* Buscador de pictogramas (consulta directamente la web de ARASAAC) */
const Buscador = (() => {
  const inp = $('#busca-texto'), est = $('#busca-estado'), res = $('#busca-resultados');
  const conf = $('#busca-confirmar'), nom = $('#busca-nombre');
  let op = null, elegido = null, termino = '', peticion = 0;

  async function buscar() {
    const q = inp.value.trim(); if (!q) return;
    termino = q; const mia = ++peticion;
    est.textContent = 'Buscando…'; res.innerHTML = ''; conf.classList.add('oculto'); elegido = null;
    try {
      const r = await fetch('https://api.arasaac.org/v1/pictograms/es/search/' + encodeURIComponent(q));
      if (mia !== peticion) return;
      if (r.status === 404) { est.textContent = 'No hay pictogramas con esa palabra. Prueba con otra.'; return; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      if (mia !== peticion) return;
      if (!d.length) { est.textContent = 'No hay pictogramas con esa palabra. Prueba con otra.'; return; }
      const lista = d.slice(0, 60);
      est.textContent = lista.length === 1 ? '1 pictograma. Tócalo para usarlo.' : `${lista.length} pictogramas. Toca el que quieras.`;
      res.innerHTML = lista.map(x => {
        const k = (x.keywords && x.keywords[0] && x.keywords[0].keyword) || q;
        return `<button type="button" data-id="${x._id}" data-k="${esc(k)}" aria-label="${esc(k)}"><img src="${urlPicto(x._id)}" alt="" loading="lazy" draggable="false"></button>`;
      }).join('');
      res.scrollTop = 0;
    } catch (e) {
      if (mia === peticion) est.textContent = 'No se ha podido conectar con ARASAAC. Revisa la conexión a internet.';
    }
  }

  function usar() {
    if (!elegido || !op) return;
    const n = nom.value.trim() || capitalizar(termino);
    op.alElegir({ n, p: elegido });
    sonidos.toque();
    if (op.seguir) {
      est.textContent = `✓ Añadido: ${n}. Puedes elegir más o cerrar.`;
      conf.classList.add('oculto'); elegido = null;
      $$('button.elegido', res).forEach(x => x.classList.remove('elegido'));
    } else cerrar();
  }
  function cerrar() { cerrarModal('#buscador'); op = null; }

  $('#busca-form').addEventListener('submit', e => { e.preventDefault(); inp.blur(); buscar(); });
  res.addEventListener('click', e => {
    const b = e.target.closest('button[data-id]'); if (!b) return;
    $$('button.elegido', res).forEach(x => x.classList.remove('elegido'));
    b.classList.add('elegido');
    elegido = +b.dataset.id;
    nom.value = capitalizar(b.dataset.k);
    conf.classList.remove('oculto');
    conf.scrollIntoView({ block: 'nearest' });
  });
  $('#busca-usar').addEventListener('click', usar);
  nom.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); usar(); } });
  $('#busca-cerrar').addEventListener('click', cerrar);

  return {
    abrir(opciones) {
      op = opciones; elegido = null; peticion++;
      $('#busca-titulo').textContent = op.titulo || 'Buscar pictograma';
      conf.classList.add('oculto'); res.innerHTML = '';
      inp.value = op.sugerencia || '';
      est.textContent = 'Escribe una palabra y pulsa 🔍';
      abrirModal('#buscador');
      if (op.sugerencia) buscar(); else setTimeout(() => inp.focus(), 60);
    },
  };
})();

/* =========================================================
   MOTOR DE CLASIFICAR (lo usan la estación de colores y la de cosas)
   cfg.generar() devuelve { vagones:[{key,nombre,html}], piezas:[{key,nombre,html,mini}], filas }
   Cada vagón lleva la clase .vagon-obj y dentro un .deposito donde se acumula la carga.
   ========================================================= */
const texto = x => typeof x === 'function' ? x() : x;
function crearClasificador(cfg) {
  const tren = $(cfg.tren), anden = $(cfg.anden), estrellas = $(cfg.estrellas);
  const S = { restantes: 0, seleccion: null, ocupado: false, piezas: [], nombres: {} };
  const vagones = () => $$('.vagon-obj', tren);

  function nuevaRonda(primera) {
    S.ocupado = false; S.seleccion = null;
    tren.classList.remove('sale');
    const d = cfg.generar();
    if (!d) {
      tren.innerHTML = locomotoraSVG(); S.piezas = []; S.restantes = 0;
      anden.innerHTML = `<p class="vacio">${texto(cfg.textoVacio)}</p>`;
      return;
    }
    S.piezas = d.piezas;
    S.nombres = Object.fromEntries(d.vagones.map(v => [v.key, v.nombre]));
    tren.style.setProperty('--n', d.vagones.length);
    tren.style.setProperty('--filas', d.filas || 2);
    tren.innerHTML = d.vagones.map(v => v.html).join('') + locomotoraSVG();
    tren.classList.add('fuera'); void tren.offsetWidth; tren.classList.remove('fuera');
    chuchu(5);

    anden.innerHTML = '';
    d.piezas.forEach((p, i) => {
      const hueco = document.createElement('div'); hueco.className = 'hueco';
      const el = document.createElement('div');
      el.className = 'pieza'; el.dataset.i = i;
      el.setAttribute('role', 'button'); el.setAttribute('aria-label', p.nombre);
      el.innerHTML = p.html;
      hueco.appendChild(el); anden.appendChild(hueco);
      arrastrable(el);
    });
    S.restantes = d.piezas.length;
    despues(primera ? 700 : 1600, () => decir(primera ? texto(cfg.instruccion) : `¡Llega otro ${V().n}!`));
  }

  function seleccionar(el) {
    if (S.seleccion === el) { deseleccionar(); return; }
    deseleccionar();
    S.seleccion = el; el.classList.add('elegida');
    sonidos.toque(); decir(S.piezas[+el.dataset.i].nombre);
  }
  function deseleccionar() {
    if (S.seleccion) S.seleccion.classList.remove('elegida');
    S.seleccion = null;
  }

  // Busca un vagón cerca del dedo (con margen generoso para manos pequeñas)
  function vagonEn(x, y) {
    const M = 30;
    return vagones().find(v => {
      const r = v.getBoundingClientRect();
      return x >= r.left - M / 2 && x <= r.right + M / 2 && y >= r.top - M * 2 && y <= r.bottom + M;
    }) || null;
  }

  function arrastrable(el) {
    el.addEventListener('pointerdown', e => {
      if (S.ocupado || el._volviendo || (e.button !== undefined && e.button > 0)) return;
      e.preventDefault(); audio();
      const r = el.getBoundingClientRect();
      const ox = e.clientX - r.left, oy = e.clientY - r.top, sx = e.clientX, sy = e.clientY;
      let movido = false, sobre = null;
      const mover = ev => {
        if (ev.pointerId !== e.pointerId) return;
        if (!movido && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
          movido = true; deseleccionar();
          el.style.width = r.width + 'px'; el.style.height = r.height + 'px';
          el.style.left = r.left + 'px'; el.style.top = r.top + 'px';
          el.classList.add('arrastrando');
        }
        if (!movido) return;
        el.style.left = (ev.clientX - ox) + 'px'; el.style.top = (ev.clientY - oy) + 'px';
        const v = vagonEn(ev.clientX, ev.clientY);
        if (v !== sobre) { if (sobre) sobre.classList.remove('encima'); sobre = v; if (sobre) sobre.classList.add('encima'); }
      };
      const fin = ev => {
        if (ev.pointerId !== e.pointerId) return;
        window.removeEventListener('pointermove', mover);
        window.removeEventListener('pointerup', fin);
        window.removeEventListener('pointercancel', fin);
        if (sobre) sobre.classList.remove('encima');
        if (movido) soltar(el, ev.type === 'pointercancel' ? null : sobre);
        else seleccionar(el);
      };
      window.addEventListener('pointermove', mover);
      window.addEventListener('pointerup', fin);
      window.addEventListener('pointercancel', fin);
    });
  }

  function soltar(pieza, vagon) {
    deseleccionar();
    if (!vagon) { devolver(pieza); return; }
    const p = S.piezas[+pieza.dataset.i];
    if (p.key === vagon.dataset.key) {
      $('.deposito', vagon).insertAdjacentHTML('beforeend', p.mini);
      pieza.remove();
      sonidos.bien(); decir(p.nombre);
      vagon.classList.remove('salta'); void vagon.offsetWidth; vagon.classList.add('salta');
      if (--S.restantes === 0) salida();
    } else {
      // Sin "error": la pieza vuelve a su sitio y el vagón correcto brilla como pista
      sonidos.neutro();
      devolver(pieza);
      const bueno = vagones().find(v => v.dataset.key === p.key);
      if (bueno) { bueno.classList.remove('pista'); void bueno.offsetWidth; bueno.classList.add('pista'); }
    }
  }

  function devolver(p) {
    const limpiar = () => { p.classList.remove('arrastrando'); p.style.cssText = ''; p._volviendo = false; };
    if (!p.classList.contains('arrastrando') || !ajustes.animaciones) { limpiar(); return; }
    const h = p.parentElement.getBoundingClientRect();
    p._volviendo = true;
    p.style.transition = 'left .3s ease, top .3s ease';
    p.style.left = h.left + 'px'; p.style.top = h.top + 'px';
    setTimeout(limpiar, 320);
  }

  function salida() {
    S.ocupado = true;
    despues(800, () => { sonidos.silbato(); chuchu(7, .38); tren.classList.add('sale'); });
    despues(3700, () => {
      estrellas.insertAdjacentHTML('beforeend', '<span>⭐</span>');
      while (estrellas.children.length > 8) estrellas.firstElementChild.remove();
      decir(`¡Muy bien! El ${V().n} se va de viaje`);
      celebrar(`¡Muy bien! El ${V().n} se va de viaje ${V().icono}`, [
        { txt: `🔁 Otro ${V().n}`, fn: () => nuevaRonda(false) },
        { txt: '🏠 Inicio', sec: true, fn: () => irA('menu') },
      ]);
    });
  }

  tren.addEventListener('click', e => {
    const v = e.target.closest('.vagon-obj');
    if (!v || S.ocupado) return;
    if (S.seleccion) soltar(S.seleccion, v);
    else { sonidos.toque(); decir(S.nombres[v.dataset.key]); }
  });

  return {
    iniciar() { estrellas.innerHTML = ''; nuevaRonda(true); },
    nuevaRonda,
    repetir() { decir(texto(cfg.instruccion)); },
  };
}

/* =========================================================
   2) ESTACIÓN DE LOS COLORES
   ========================================================= */
const COLORES = [
  { id: 'rojo', nombre: 'Rojo', hex: '#E57368' },
  { id: 'azul', nombre: 'Azul', hex: '#5E9BD6' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#F2C94C' },
  { id: 'verde', nombre: 'Verde', hex: '#6DBB74' },
  { id: 'morado', nombre: 'Morado', hex: '#A88BD3' },
];
const BORDE = 'stroke="rgba(0,0,0,.14)" stroke-width="4" stroke-linejoin="round"';
const FORMAS = {
  circulo: c => `<circle cx="50" cy="50" r="38" fill="${c}" ${BORDE}/>`,
  estrella: c => `<polygon points="50,8 61,38 93,38 67,57 77,88 50,69 23,88 33,57 7,38 39,38" fill="${c}" ${BORDE}/>`,
  corazon: c => `<path d="M50 86 C20 63 8 46 8 31 A21 21 0 0 1 50 24 A21 21 0 0 1 92 31 C92 46 80 63 50 86Z" fill="${c}" ${BORDE}/>`,
  cuadrado: c => `<rect x="14" y="14" width="72" height="72" rx="12" fill="${c}" ${BORDE}/>`,
  triangulo: c => `<polygon points="50,10 91,86 9,86" fill="${c}" ${BORDE}/>`,
};
const formaSVG = (forma, hex, clase = '') => `<svg class="${clase}" viewBox="0 0 100 100" aria-hidden="true">${FORMAS[forma](hex)}</svg>`;

const Colores = crearClasificador({
  tren: '#colores-tren', anden: '#colores-anden', estrellas: '#colores-estrellas',
  instruccion: () => `Pon cada cosa en ${V().la} ${V().v} de su color`,
  textoVacio: '',
  generar() {
    const cols = COLORES.slice(0, Math.min(ajustes.colores, COLORES.length));
    const total = Math.max(ajustes.piezas, cols.length);
    const formas = Object.keys(FORMAS);
    const piezas = [];
    for (let i = 0; i < total; i++) {
      const c = cols[i % cols.length], f = formas[Math.floor(Math.random() * formas.length)];
      piezas.push({ key: c.id, nombre: c.nombre, html: formaSVG(f, c.hex), mini: formaSVG(f, c.hex, 'mini') });
    }
    return {
      vagones: cols.map(c => ({
        key: c.id, nombre: c.nombre,
        html: `<div class="vagon vagon-obj" data-key="${c.id}" style="--c:${c.hex}" role="button" aria-label="${mayus(V().v)} ${c.nombre}"><div class="carga deposito"></div></div>`,
      })),
      piezas: mezclar(piezas),
    };
  },
});
$('#colores-repetir').addEventListener('click', () => Colores.repetir());

/* =========================================================
   3) ESTACIÓN DE CLASIFICAR (grupos configurables)
   ========================================================= */
const CATS_BASE = [
  ['insectos', 'Insectos', 7134, [['Mariposa', 2465], ['Abeja', 2239], ['Hormiga', 2425], ['Mariquita', 2924], ['Mosca', 2478], ['Saltamontes', 2805], ['Libélula', 9066], ['Grillo', 25147]]],
  ['mamiferos', 'Mamíferos', 7777, [['Perro', 2517], ['Gato', 2406], ['Vaca', 2609], ['Caballo', 2294], ['León', 2449], ['Elefante', 2372], ['Conejo', 2351], ['Oso', 2488]]],
  ['aves', 'Aves', 6923, [['Pájaro', 2490], ['Gallina', 2403], ['Pato', 2563], ['Loro', 2934], ['Búho', 2671], ['Pingüino', 3243], ['Águila', 2638], ['Cigüeña', 3015]]],
  ['mar', 'Animales del mar', 35853, [['Pez', 2520], ['Pulpo', 3379], ['Ballena', 2268], ['Delfín', 2732], ['Cangrejo', 2312], ['Tiburón', 2589], ['Estrella de mar', 3310], ['Medusa', 2920]]],
  ['bano', 'Cosas del baño', 5921, [['Cepillo de dientes', 2694], ['Pasta de dientes', 2858], ['Jabón', 2964], ['Toalla', 2593], ['Champú', 2699], ['Peine', 2852], ['Papel higiénico', 2862], ['Esponja', 2749]]],
  ['cocina', 'Cosas de la cocina', 2341, [['Plato', 2532], ['Vaso', 2610], ['Tenedor', 2588], ['Cuchara', 2362], ['Cuchillo', 3237], ['Sartén', 2558], ['Olla', 9086], ['Frigorífico', 3272]]],
  ['ropa', 'Ropa', 7233, [['Camiseta', 2309], ['Pantalón', 2565], ['Zapatos', 2622], ['Calcetines', 2298], ['Chaqueta', 4872], ['Gorro', 2412], ['Vestido', 2613], ['Bufanda', 2290]]],
  ['frutas', 'Frutas', 4653, [['Manzana', 2462], ['Plátano', 2530], ['Naranja', 2483], ['Fresa', 2400], ['Pera', 2561], ['Uvas', 3247], ['Sandía', 2557], ['Cereza', 8303]]],
  ['verduras', 'Verduras', 29131, [['Zanahoria', 2619], ['Tomate', 2594], ['Lechuga', 2446], ['Patata', 2503], ['Brócoli', 23853], ['Pimiento', 2838], ['Cebolla', 2323], ['Pepino', 2847]]],
  ['transportes', 'Transportes', 10351, [['Coche', 2339], ['Autobús', 2262], ['Tren', 2603], ['Avión', 2264], ['Barco', 2273], ['Bicicleta', 2277], ['Moto', 2480], ['Camión', 2306]]],
  ['juguetes', 'Juguetes', 9813, [['Pelota', 3241], ['Muñeca', 2482], ['Peluche', 4945], ['Puzle', 26403], ['Cometa', 2350], ['Tambor', 2578], ['Construcciones', 4935]]],
  ['cole', 'Material escolar', 34153, [['Lápiz', 2440], ['Goma de borrar', 28577], ['Tijeras', 2591], ['Mochila', 2475], ['Libro', 2450], ['Cuaderno', 2359], ['Pegamento', 2510], ['Regla', 2815]]],
];
const ACTIVAS_INICIO = ['insectos', 'mamiferos', 'bano', 'cocina'];
const MAX_GRUPOS = 6;
const categoriasIniciales = () => CATS_BASE.map(([id, n, p, items]) => ({ id, n, p, activa: ACTIVAS_INICIO.includes(id), items: items.map(([n, p]) => ({ n, p })) }));
let categorias = cargar('categorias', null) || categoriasIniciales();
const guardarCategorias = () => guardar('categorias', categorias);

const COLORES_VAGON = ['#E8907F', '#F2C94C', '#7CC189', '#6FA3D9', '#B79BDB', '#F0A868', '#6CC4C0'];
const colorVagon = i => COLORES_VAGON[i % COLORES_VAGON.length];

const Cosas = crearClasificador({
  tren: '#cosas-tren', anden: '#cosas-anden', estrellas: '#cosas-estrellas',
  instruccion: () => `Lleva cada cosa a su ${V().v}`,
  textoVacio: () => `No hay grupos en el ${V().n}.<br>Un adulto puede elegirlos manteniendo pulsado ✏️`,
  generar() {
    const act = categorias.filter(c => c.activa && c.items.length).slice(0, MAX_GRUPOS);
    if (!act.length) return null;
    const k = ajustes.porVagon || 3;
    const piezas = [];
    let max = 0;
    act.forEach(c => {
      const elegidas = mezclar(c.items.slice()).slice(0, k);
      max = Math.max(max, elegidas.length);
      elegidas.forEach(it => piezas.push({
        key: c.id, nombre: it.n,
        html: `<div class="carta">${pictoHTML(it)}<span>${esc(it.n)}</span></div>`,
        mini: `<div class="mini-picto">${pictoHTML(it)}</div>`,
      }));
    });
    return {
      vagones: act.map((c, i) => ({
        key: c.id, nombre: c.n,
        html: `<div class="vagon-obj vagon-cosas" data-key="${esc(c.id)}" style="--c:${colorVagon(i)}" role="button" aria-label="${mayus(V().v)} ${esc(c.n)}">
                 <div class="pila deposito"></div>
                 <div class="cuerpo"><div class="placa">${pictoHTML(c)}<span>${esc(c.n)}</span></div></div>
               </div>`,
      })),
      piezas: mezclar(piezas),
      filas: Math.ceil(max / 2),
    };
  },
});

function iniciarCosas() {
  $('#cosas-editar').classList.add('oculto');
  $('#cosas-juego').classList.remove('oculto');
  $('#cosas-preparar').classList.remove('oculto');
  Cosas.iniciar();
}
$('#cosas-repetir').addEventListener('click', () => Cosas.repetir());

/* ----- Configuración de grupos (adultos) ----- */
const EditorCosas = {
  cat: null,
  abrir() {
    limpiarTemporizadores(); cerrarModal('#celebra');
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.cat = null;
    $('#cosas-juego').classList.add('oculto');
    $('#cosas-preparar').classList.add('oculto');
    $('#cosas-editar').classList.remove('oculto');
    this.pintar();
  },
  activas() { return categorias.filter(c => c.activa).length; },
  pintar() {
    const ed = $('#cosas-editar');
    ed.innerHTML = this.cat == null ? this.htmlGrupos() : this.htmlGrupo(categorias[this.cat]);
    ed.scrollTop = 0;
  },
  htmlGrupos() {
    const k = ajustes.porVagon || 3;
    return `
      <h2>Grupos del tren</h2>
      <p class="ayuda">Toca un grupo para meterlo o sacarlo del tren (máximo ${MAX_GRUPOS} vagones). Con ✏️ cambias sus cosas.</p>
      <div class="grid-grupos">
        ${categorias.map((c, i) => `
          <div class="grupo-card ${c.activa ? 'activa' : ''}">
            <button class="grupo-toggle" data-acc="toggle" data-i="${i}">
              ${pictoHTML(c)}<span>${esc(c.n)}</span><small>${c.items.length} cosas</small>
            </button>
            ${c.activa ? '<i class="ok">✓</i>' : ''}
            <button class="grupo-editar" data-acc="editar" data-i="${i}" aria-label="Editar ${esc(c.n)}">✏️</button>
          </div>`).join('')}
        <button class="grupo-card nuevo" data-acc="nuevo">➕<span>Nuevo grupo</span></button>
      </div>
      <div class="grupo">
        <span>Cosas de cada grupo en cada tren</span>
        <div class="opciones">${[2, 3, 4].map(v => `<button data-acc="porvagon" data-v="${v}" class="${v === k ? 'elegido' : ''}">${v}</button>`).join('')}</div>
      </div>
      <div class="acciones">
        <button class="btn btn-sec" data-acc="restaurar">Restaurar grupos originales</button>
        <button class="btn" data-acc="listo">✔ Listo</button>
      </div>`;
  },
  htmlGrupo(c) {
    return `
      <div class="acciones" style="justify-content:flex-start"><button class="btn btn-sec" data-acc="volver">◀ Volver a los grupos</button></div>
      <div class="cat-info">
        ${pictoHTML(c)}
        <h2>${esc(c.n)}</h2>
        <div class="ctrl">
          <button data-acc="renombrar-cat">✏️ Nombre</button>
          <button data-acc="picto-cat">🖼️ Pictograma</button>
          <button data-acc="borrar-cat">🗑️ Borrar grupo</button>
        </div>
      </div>
      <div class="grid-cosas">
        ${c.items.map((it, j) => `
          <div class="cosa-card">
            ${pictoHTML(it)}<span>${esc(it.n)}</span>
            <div class="ctrl">
              <button data-acc="renombrar-item" data-j="${j}" aria-label="Cambiar nombre">✏️</button>
              <button data-acc="quitar-item" data-j="${j}" aria-label="Quitar">✕</button>
            </div>
          </div>`).join('')}
        <button class="cosa-card nuevo" data-acc="anadir-item">➕<span>Añadir desde ARASAAC</span></button>
      </div>
      <div class="acciones"><button class="btn" data-acc="volver">✔ Hecho</button></div>`;
  },
};

$('#cosas-editar').addEventListener('click', e => {
  const b = e.target.closest('[data-acc]'); if (!b) return;
  const E = EditorCosas, acc = b.dataset.acc, i = +b.dataset.i, c = categorias[E.cat];
  sonidos.toque();
  switch (acc) {
    case 'toggle': {
      const cat = categorias[i];
      if (!cat.activa && E.activas() >= MAX_GRUPOS) { alert(`Como máximo ${MAX_GRUPOS} grupos en el ${V().n}. Quita uno antes.`); return; }
      if (!cat.activa && !cat.items.length) { alert('Este grupo no tiene cosas todavía. Añade alguna con ✏️.'); return; }
      cat.activa = !cat.activa; break;
    }
    case 'editar': E.cat = i; break;
    case 'nuevo':
      Buscador.abrir({
        titulo: 'Pictograma del nuevo grupo (ej.: animales, colegio…)',
        alElegir: it => {
          categorias.push({ id: 'u' + Date.now(), n: it.n, p: it.p, activa: false, items: [] });
          E.cat = categorias.length - 1; guardarCategorias(); E.pintar();
        },
      });
      return;
    case 'porvagon': ajustes.porVagon = +b.dataset.v; aplicarAjustes(); break;
    case 'restaurar':
      if (!confirm('¿Volver a los grupos originales? Se perderán los cambios.')) return;
      categorias = categoriasIniciales(); break;
    case 'listo': guardarCategorias(); iniciarCosas(); return;
    case 'volver': E.cat = null; break;
    case 'renombrar-cat': { const n = pide('Nombre del grupo:', c.n); if (n) c.n = n; break; }
    case 'picto-cat':
      Buscador.abrir({ titulo: 'Nuevo pictograma para «' + c.n + '»', sugerencia: c.n, alElegir: it => { c.p = it.p; guardarCategorias(); E.pintar(); } });
      return;
    case 'borrar-cat':
      if (!confirm(`¿Borrar el grupo «${c.n}» y todas sus cosas?`)) return;
      categorias.splice(E.cat, 1); E.cat = null; break;
    case 'renombrar-item': { const it = c.items[+b.dataset.j]; const n = pide('Nombre (lo que dirá la voz):', it.n); if (n) it.n = n; break; }
    case 'quitar-item':
      c.items.splice(+b.dataset.j, 1);
      if (!c.items.length) c.activa = false;
      break;
    case 'anadir-item':
      Buscador.abrir({
        titulo: 'Añadir cosas a «' + c.n + '»', seguir: true,
        alElegir: it => { c.items.push(it); guardarCategorias(); E.pintar(); },
      });
      return;
  }
  guardarCategorias(); E.pintar();
});
mantenerPulsado($('#cosas-preparar'), () => EditorCosas.abrir());

/* =========================================================
   4) EL TREN DE MI DÍA (agenda visual)
   ========================================================= */
const ACT_BIBLIO = [
  ['Despertar', 8988], ['Ir al baño', 27541], ['Lavarse las manos', 10384], ['Lavarse los dientes', 26744],
  ['Ducharse', 27529], ['Bañarse', 2271], ['Peinarse', 2512], ['Vestirse', 2781], ['Ponerse el pijama', 2522],
  ['Desayunar', 4625], ['Comer', 2349], ['Merendar', 4694], ['Cenar', 4593],
  ['Colegio', 3082], ['Recreo', 6204], ['Casa', 2317], ['Coche', 2339], ['Autobús', 2262], ['Tren', 2603],
  ['Terapia', 24679], ['Logopeda', 2454], ['Médico', 2467], ['Hacer la compra', 8985],
  ['Parque', 2859], ['Pasear', 8649], ['Jugar', 2439], ['Pintar', 2348], ['Leer', 7141], ['Música', 11311],
  ['Televisión', 25498], ['Tablet', 9165], ['Piscina', 3142], ['Abuelos', 2244], ['Cumpleaños', 3087],
  ['Esperar', 8109], ['Descansar', 3299], ['Cuento', 2364], ['Dormir', 2369],
].map(([n, p]) => ({ n, p }));
const AGENDA_INICIO = ['Despertar', 'Ir al baño', 'Vestirse', 'Desayunar', 'Colegio', 'Comer', 'Parque', 'Bañarse', 'Cenar', 'Cuento', 'Dormir'];
const agendaInicial = () => AGENDA_INICIO.map(n => ({ ...ACT_BIBLIO.find(a => a.n === n) }));
const MAX_VAGONES_DIA = 20;
const hoy = () => new Date().toDateString();

const Dia = {
  agenda: cargar('agenda2', null) || agendaInicial(),
  paso: 0,

  iniciar() {
    const p = cargar('progreso2', null);
    this.paso = (p && p.fecha === hoy()) ? Math.min(p.paso, this.agenda.length) : 0;
    this.mostrarViajar();
    const it = this.agenda[this.paso];
    despues(900, () => decir(it ? 'Ahora toca: ' + it.n : `El ${V().n} de mi día`));
  },
  guardarPaso() { guardar('progreso2', { fecha: hoy(), paso: this.paso }); },
  guardarAgenda() { guardar('agenda2', this.agenda); },
  viajando() { return pantallaActual === 'dia' && !$('#dia-viajar').classList.contains('oculto'); },

  mostrarViajar() {
    $('#dia-editar').classList.add('oculto');
    $('#dia-viajar').classList.remove('oculto');
    $('#dia-preparar').classList.remove('oculto');
    $('#btn-escribe-dia').classList.remove('oculto');
    this.construir();
    this.actualizar();
    this.mover('llegar');
  },

  // El vehículo avanza hacia la derecha: el primer vagón va pegado a la cabeza y los siguientes
  // se ponen a la cola (a la izquierda). El que toca ahora se para en el centro.
  construir() {
    const vag = this.agenda.map((it, i) => `
      <div class="vagon-dia" data-i="${i}" style="--c:${colorVagon(i)}" role="button" aria-label="${esc(it.n)}">
        <div class="tarjeta-picto">${pictoHTML(it)}</div>
        <button class="alt-dia alt-arriba" data-i="${i}" data-dir="-1" aria-label="Otro pictograma para ${esc(it.n)}">▲</button>
        <button class="alt-dia alt-abajo" data-i="${i}" data-dir="1" aria-label="Otro pictograma para ${esc(it.n)}">▼</button>
        <i class="ok">✓</i>
        <span class="globo g-ahora">AHORA</span><span class="globo g-despues">DESPUÉS</span>
      </div>`).reverse().join('');
    $('#dia-tren').innerHTML = vag + locomotoraSVG();
  },

  actualizar() {
    const n = this.agenda.length, nombre = $('#dia-nombre'), btn = $('#dia-hecho');
    $$('#dia-tren .vagon-dia').forEach(v => {
      const i = +v.dataset.i;
      v.classList.toggle('hecho', i < this.paso);
      v.classList.toggle('actual', i === this.paso);
      v.classList.toggle('siguiente', i === this.paso + 1);
    });
    $('#dia-atras').disabled = this.paso === 0;
    btn.classList.toggle('oculto', n === 0);
    if (n === 0) {
      nombre.innerHTML = `<small>EL ${V().n.toUpperCase()} ESTÁ VACÍO</small>Un adulto puede prepararlo con ✏️`;
    } else if (this.paso >= n) {
      nombre.innerHTML = '<small>¡FIN DEL VIAJE!</small>🌟 ¡Muy bien! 🌟';
      btn.textContent = '🔁 Empezar otra vez';
    } else {
      nombre.innerHTML = `<small>AHORA</small>${esc(this.agenda[this.paso].n)}`;
      btn.textContent = '✔ ¡Hecho!';
    }
  },

  // modo: 'llegar' (entra desde la izquierda), 'animar' (avanza) o 'fijo' (sin animación)
  mover(modo) {
    const escen = $('#dia-escenario'), tren = $('#dia-tren'), n = this.agenda.length;
    let x;
    if (n && this.paso < n) {
      const v = $(`.vagon-dia[data-i="${this.paso}"]`, tren);
      x = escen.clientWidth / 2 - (v.offsetLeft + v.offsetWidth / 2);
    } else if (n) {
      x = escen.clientWidth + 40;                        // ya se ha ido por la derecha
    } else {
      x = (escen.clientWidth - tren.offsetWidth) / 2;    // solo la locomotora, esperando
    }
    if (modo === 'llegar') {
      tren.style.transition = 'none';
      tren.style.transform = `translateX(${-tren.offsetWidth - 40}px)`;   // entra por la izquierda
      void tren.offsetWidth;
    }
    tren.style.transition = modo === 'fijo' ? 'none' : `transform ${modo === 'llegar' ? 2.6 : 1.6}s cubic-bezier(.45,.05,.3,1)`;
    tren.style.transform = `translateX(${x}px)`;
  },

  hecho() {
    const n = this.agenda.length;
    if (!n) return;
    if (this.paso >= n) {
      this.paso = 0; this.guardarPaso();
      this.actualizar(); this.mover('llegar'); chuchu(5);
      despues(1200, () => decir('Ahora toca: ' + this.agenda[0].n));
      return;
    }
    this.paso++; this.guardarPaso();
    sonidos.bien(); chuchu(4);
    this.actualizar(); this.mover('animar');
    if (this.paso < n) decir('¡Hecho! Ahora toca: ' + this.agenda[this.paso].n);
    else { despues(500, () => sonidos.silbato()); decir('¡Muy bien! Has terminado el viaje de hoy'); }
  },

  atras() {
    if (this.paso === 0) return;
    this.paso--; this.guardarPaso();
    sonidos.neutro(); this.actualizar(); this.mover('animar');
  },

  /* ----- Preparar (adultos) ----- */
  abrirEditor() {
    limpiarTemporizadores();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    $('#dia-viajar').classList.add('oculto');
    $('#dia-preparar').classList.add('oculto');
    $('#btn-escribe-dia').classList.add('oculto');
    $('#dia-editar').classList.remove('oculto');
    if (!$('#dia-paleta').children.length) {
      $('#dia-paleta').innerHTML = ACT_BIBLIO.map((a, i) => `<button data-b="${i}">${pictoHTML(a)}${esc(a.n)}</button>`).join('');
    }
    this.pintarLista();
    $('#dia-editar').scrollTop = 0;
  },
  pintarLista() {
    const n = this.agenda.length;
    $('#dia-lista').innerHTML = n ? this.agenda.map((it, i) => `
      <div class="item-editar" style="--c:${colorVagon(i)}">
        <span class="num">${i + 1}</span>${pictoHTML(it)}<span class="nombre">${esc(it.n)}</span>
        <span class="ctrl">
          <button data-acc="subir" data-i="${i}" aria-label="Mover antes" ${i === 0 ? 'disabled' : ''}>▲</button>
          <button data-acc="bajar" data-i="${i}" aria-label="Mover después" ${i === n - 1 ? 'disabled' : ''}>▼</button>
          <button data-acc="renombrar" data-i="${i}" aria-label="Cambiar nombre">✏️</button>
          <button data-acc="cambiar" data-i="${i}" aria-label="Cambiar pictograma">🖼️</button>
          <button data-acc="quitar" data-i="${i}" aria-label="Quitar">✕</button>
        </span>
      </div>`).join('') : `<p class="vacio">El ${V().n} está vacío. Añade ${V().vs} abajo 👇</p>`;
    if (this.alPintar) this.alPintar();
  },
  alPintar: null,
  anadir(it) {
    if (this.agenda.length >= MAX_VAGONES_DIA) { alert(`Como máximo ${MAX_VAGONES_DIA} ${V().vs}.`); return; }
    this.agenda.push({ n: it.n, p: it.p, a: true });   // a: añadido a mano
    this.guardarAgenda(); this.pintarLista();
  },
};

$('#dia-hecho').addEventListener('click', () => Dia.hecho());
$('#dia-atras').addEventListener('click', () => Dia.atras());
$('#dia-tren').addEventListener('click', async e => {
  // Flechas ▲▼: cambiar el pictograma ahí mismo, sin entrar en ✏️
  const b = e.target.closest('button.alt-dia');
  if (b) {
    e.stopPropagation();
    const i = +b.dataset.i, vag = b.closest('.vagon-dia'), n = Dia.agenda[i] && Dia.agenda[i].n;
    const r = await EscribeDia.cambiarPicto(i, +b.dataset.dir, vag);
    if (!r) { if (n) avisar(`No hay más pictogramas para «${n}»`, b); return; }
    $('.tarjeta-picto', vag).innerHTML = pictoHTML(Dia.agenda[i]);
    vag.classList.remove('cambia'); void vag.offsetWidth; vag.classList.add('cambia');
    avisar(`${r.n}: ${r.pos} de ${r.total}`, b);
    return;
  }
  const v = e.target.closest('.vagon-dia'); if (!v) return;
  sonidos.toque(); decir(Dia.agenda[+v.dataset.i].n);
});
$('#dia-nombre').addEventListener('click', () => { const it = Dia.agenda[Dia.paso]; if (it) decir(it.n); });
mantenerPulsado($('#dia-preparar'), () => Dia.abrirEditor());

$('#dia-lista').addEventListener('click', e => {
  const b = e.target.closest('button[data-acc]'); if (!b) return;
  const i = +b.dataset.i, ag = Dia.agenda;
  switch (b.dataset.acc) {
    case 'subir': if (i > 0) [ag[i - 1], ag[i]] = [ag[i], ag[i - 1]]; break;
    case 'bajar': if (i < ag.length - 1) [ag[i + 1], ag[i]] = [ag[i], ag[i + 1]]; break;
    case 'quitar': ag.splice(i, 1); break;
    case 'renombrar': { const n = pide('Nombre (lo que dirá la voz):', ag[i].n); if (n) ag[i].n = n; break; }
    case 'cambiar':
      Buscador.abrir({ titulo: 'Cambiar pictograma de «' + ag[i].n + '»', sugerencia: ag[i].n, alElegir: it => { ag[i].p = it.p; Dia.guardarAgenda(); Dia.pintarLista(); } });
      return;
  }
  sonidos.toque(); Dia.guardarAgenda(); Dia.pintarLista();
});
$('#dia-paleta').addEventListener('click', e => {
  const b = e.target.closest('button[data-b]'); if (!b) return;
  sonidos.toque(); Dia.anadir(ACT_BIBLIO[+b.dataset.b]);
  const l = $('#dia-lista'); if (l.lastElementChild) l.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
$('#dia-buscar').addEventListener('click', () => Buscador.abrir({ titulo: `Añadir ${V().vs} desde ARASAAC`, seguir: true, alElegir: it => Dia.anadir(it) }));
$('#dia-vaciar').addEventListener('click', () => {
  if (confirm(`¿Quitar todos ${losVs()}?`)) {
    Dia.agenda = []; Dia.guardarAgenda();
    $('#dia-texto').value = ''; guardar('diaTexto', ''); $('#dia-texto-estado').textContent = '';
    guardar('diaQuitados', []);
    Dia.pintarLista();
  }
});
$('#dia-vaciar-mini').addEventListener('click', () => $('#dia-vaciar').click());
$('#dia-listo-mini').addEventListener('click', () => $('#dia-listo').click());
$('#dia-listo').addEventListener('click', () => {
  Dia.paso = 0; Dia.guardarPaso(); Dia.guardarAgenda();
  Dia.mostrarViajar(); chuchu(5);
  const it = Dia.agenda[0];
  despues(1200, () => decir(it ? `¡El ${V().n} está listo! Primero: ` + it.n : ''));
});

window.addEventListener('resize', () => { if (Dia.viajando()) Dia.mover('fijo'); });

/* ---------------------------------------------------------
   Escribir el día con palabras
   El adulto escribe de forma natural ("nos levantamos, desayunamos y vamos al cole…").
   El texto se parte en pasos, cada paso busca su pictograma (primero en la
   biblioteca propia, luego en ARASAAC) y el vehículo se va llenando solo.
   --------------------------------------------------------- */
const EscribeDia = (() => {
  const ta = $('#dia-texto'), est = $('#dia-texto-estado'), caja = $('#dia-mini');
  const sinTildes = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const clave = s => sinTildes(String(s).toLowerCase()).replace(/[^a-zñ0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const cache = cargar('pictoCache', {});
  let token = 0, tEspera = null, vistos = new Set();

  /* --- 1) Diccionario propio: palabras habituales → pictogramas de la biblioteca --- */
  const ACT = n => ACT_BIBLIO.find(a => a.n === n);
  const FRASES = [   // se mira en la frase entera, antes de limpiarla
    [/\b(ir|vamos|voy|va|vas) al (bano|wc|servicio|aseo)\b|\b(pis|pipi|caca|vater|orinal|wc)\b/, 'Ir al baño'],
    [/\bdientes\b/, 'Lavarse los dientes'],
    [/\bmanos\b/, 'Lavarse las manos'],
    [/\bpijama\b/, 'Ponerse el pijama'],
    [/\b(hacer|hacemos|ir|vamos a) (la )?compra\b|\bsupermercado\b|\bsuper\b/, 'Hacer la compra'],
  ];
  const PALABRAS = [
    [/^(despert|levant)/, 'Despertar'], [/^duch/, 'Ducharse'], [/^(ban(o|ar|amos|arse|arnos|era)?)$/, 'Bañarse'],
    [/^pein/, 'Peinarse'], [/^(vest|ropa)/, 'Vestirse'], [/^desayun/, 'Desayunar'],
    [/^(comer|comemos|comida|almuerz|almorz)/, 'Comer'], [/^meriend|^merendar/, 'Merendar'], [/^cen(a|ar|amos)$/, 'Cenar'],
    [/^(cole|colegio|escuela|clase|guarde|instituto)/, 'Colegio'], [/^recreo$/, 'Recreo'], [/^casa$/, 'Casa'],
    [/^coche$/, 'Coche'], [/^(autobus|bus)$/, 'Autobús'], [/^tren$/, 'Tren'],
    [/^(terapia|terapeuta|psicolog)/, 'Terapia'], [/^logoped/, 'Logopeda'], [/^(medic|pediatra|doctor)/, 'Médico'],
    [/^parque$/, 'Parque'], [/^pase/, 'Pasear'], [/^jug/, 'Jugar'], [/^pint/, 'Pintar'], [/^(leer|leemos|lectura)$/, 'Leer'],
    [/^musica$/, 'Música'], [/^(tele|television|dibujos)$/, 'Televisión'], [/^(tablet|tableta|ipad)$/, 'Tablet'],
    [/^(piscina|nadar|natacion)$/, 'Piscina'], [/^(abuel|yay)/, 'Abuelos'], [/^cumple/, 'Cumpleaños'],
    [/^esper/, 'Esperar'], [/^(descans|siesta)/, 'Descansar'], [/^cuento/, 'Cuento'],
    [/^(dormir|dormimos|cama|acost)/, 'Dormir'],
  ];
  function delDiccionario(k) {
    for (const [re, n] of FRASES) if (re.test(k)) return ACT(n);
    for (const w of k.split(' ')) for (const [re, n] of PALABRAS) if (re.test(w)) return ACT(n);
    return null;
  }

  /* --- 2) Partir el texto en pasos y dejar cada paso limpio --- */
  const UNION = /\s+(?:y\s+|e\s+)?(?:luego|despu[eé]s|m[aá]s tarde|a continuaci[oó]n|entonces|por [uú]ltimo|finalmente|al final)\s+|\s+y\s+|\s+e\s+(?=[ií])/gi;
  const INICIO = /^(?:y|e|primero|primeramente|luego|despu[eé]s(?: de eso)?|entonces|hoy|ma[nñ]ana|por la (?:ma[nñ]ana|tarde|noche)|a\s?mediod[ií]a|al mediod[ií]a|de noche|antes de nada|al final|finalmente|por [uú]ltimo|m[aá]s tarde|a continuaci[oó]n|cuando (?:volvamos|lleguemos|acabemos)|vamos a|vamos al|vamos|iremos a|iremos al|nos vamos a|nos vamos al|ir a|ir al|voy a|voy al|tenemos que|tengo que|hay que|nos toca|toca|tenemos|tengo|hacemos|hago|el|la|los|las|un|una|unos|unas|al|a)(?=\s|$)\s*/i;
  const HORA = /\s*\b(?:a|sobre|hacia) (?:las?|eso de las) (?:\d{1,2}(?:[:.]\d{2})?|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)(?: y (?:media|cuarto))?(?: de la (?:ma[nñ]ana|tarde|noche))?\b/gi;
  const FINAL = /\s+(?:por la (?:ma[nñ]ana|tarde|noche)|hoy|un rato|un ratito)$/i;
  const NO_VERBO = new Set(['ramos', 'damos']);

  function limpiar(trozo) {
    if (/\b(?:ir|vamos|voy|va|vas|vais)\s+al\s+(?:ba[nñ]o|wc|servicio|aseo|v[aá]ter)(?![a-zñ])/i.test(trozo)) return 'Ir al baño';
    let t = trozo.replace(/[¡!¿?"«»()]/g, ' ').replace(/\s+/g, ' ').trim();
    let antes;
    do { antes = t; t = t.replace(INICIO, '').replace(FINAL, '').trim(); } while (t !== antes && t);
    let reflexivo = false;
    if (/^nos\s/i.test(t)) { reflexivo = true; t = t.slice(4).trim(); }
    // "desayunamos" → "desayunar", "jugamos con los primos" → "jugar con los primos"
    t = t.replace(/^(\p{L}+)(amos|emos|imos)(?=\s|$)/u, (m, raiz, fin) =>
      NO_VERBO.has(m.toLowerCase()) ? m : raiz + { amos: 'ar', emos: 'er', imos: 'ir' }[fin.toLowerCase()] + (reflexivo ? 'se' : ''));
    return capitalizar(t.replace(/[.,;:]+$/, '').trim());
  }
  // "la piscina después de comer" → Comer, Piscina · "el parque antes de cenar" → Parque, Cenar
  function partir(texto) {
    const salida = [];
    texto.replace(HORA, ' ').split(/[\n.;:!?]+/).forEach(frase => {
      const f = frase.replace(/despu[eé]s de eso/gi, '|')
        .replace(/\s*\bdespu[eé]s de\s+/gi, '|§D ')
        .replace(/\s*\bantes de\s+/gi, '|§A ')
        .replace(/,/g, '|').replace(UNION, '|');
      const trozos = [];
      const poner = (t, pos) => { const n = limpiar(t); if (n && n.length > 1) pos == null ? trozos.push(n) : trozos.splice(pos, 0, n); };
      f.split('|').forEach(t => {
        const txt = t.trim(), marca = txt.slice(0, 3);
        if (marca !== '§D ' && marca !== '§A ') { poner(txt); return; }
        // "después de desayunar vamos al cole": separa "desayunar" de "vamos al cole"
        const [x, ...resto] = txt.slice(3).split(/\s+(?=(?:vamos|iremos|nos vamos|toca|nos toca|tenemos|hay que|hacemos)\b)/i);
        const sigue = resto.join(' ');
        if (marca === '§D ') {
          if (sigue) { poner(x); poner(sigue); }                 // "después de X, Y" → X, Y
          else poner(x, trozos.length ? trozos.length - 1 : null); // "Y después de X" → X, Y
        } else {
          if (sigue) { poner(sigue); poner(x); }                 // "antes de X, Y" → Y, X
          else poner(x);                                          // "Y antes de X" → Y, X
        }
      });
      salida.push(...trozos);
    });
    return salida;
  }

  /* --- 3) Buscar en ARASAAC lo que no está en el diccionario --- */
  const VACIAS = new Set(['con', 'de', 'del', 'para', 'por', 'los', 'las', 'una', 'unos', 'unas', 'hacer', 'ir', 'estar', 'ver', 'mis', 'sus', 'que', 'muy', 'otra', 'otro', 'vez', 'rato', 'tambien']);
  async function pedir(ruta, q) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 7000);
    try {
      const r = await fetch(`https://api.arasaac.org/v1/pictograms/es/${ruta}/` + encodeURIComponent(q), { signal: ctl.signal });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      return d && d.length ? d[0]._id : null;
    } finally { clearTimeout(t); }
  }
  async function deArasaac(nombre) {
    const k = clave(nombre);
    if (k in cache) return cache[k];
    const frase = nombre.toLowerCase();
    const palabras = frase.split(/\s+/).filter(w => w.length > 2 && !VACIAS.has(clave(w))).sort((a, b) => b.length - a.length);
    let id = await pedir('bestsearch', frase);
    for (const w of palabras) { if (id) break; id = await pedir('bestsearch', w); }
    if (!id) id = await pedir('search', frase);
    cache[k] = id || null;
    guardar('pictoCache', cache);
    return id;
  }

  /* --- 4) Escribir → el vehículo se llena --- */
  function procesar() {
    const mio = ++token;
    // Pasos quitados con 🗑️: no vuelven mientras sigan escritos. Si se borran del texto, se olvidan.
    const escritos = partir(ta.value), enTexto = new Set(escritos.map(clave));
    const quitadosLista = cargar('diaQuitados', []).filter(k => enTexto.has(k));
    guardar('diaQuitados', quitadosLista);
    const quitados = new Set(quitadosLista);
    const todos = escritos.filter(n => !quitados.has(clave(n))), pasos = todos.slice(0, MAX_VAGONES_DIA);
    sel = -1;
    if (!pasos.length) { est.textContent = ''; return; }
    // Si un paso ya existía (quizá con un pictograma elegido a mano), se respeta
    const previos = new Map(Dia.agenda.filter(it => it.p).map(it => [clave(it.n), it.p]));
    // Lo que se añadió a mano (desde la paleta o ARASAAC) no se pierde: va detrás de lo escrito
    const claves = new Set(pasos.map(clave));
    const aMano = Dia.agenda.filter(it => it.a && !claves.has(clave(it.n)));
    const pendientes = [];
    Dia.agenda = pasos.map((n, i) => {
      const k = clave(n), d = delDiccionario(k);
      const p = previos.get(k) || (d && d.p) || cache[k];
      if (p) return { n, p };
      if (cache[k] === null) return { n, e: '❓' };
      pendientes.push(i);
      return { n, e: '⏳' };
    }).concat(aMano).slice(0, MAX_VAGONES_DIA);
    Dia.guardarAgenda(); Dia.pintarLista();
    const sobran = todos.length - pasos.length;
    const resumen = () => {
      const dudas = Dia.agenda.filter(it => !it.p).length;
      est.textContent = `✓ ${Dia.agenda.length} ${Dia.agenda.length === 1 ? V().v : V().vs} en el ${V().n}` +
        (dudas ? ` · ${dudas} sin pictograma: tócalo con 🖼️ abajo para elegirlo` : '') +
        (sobran > 0 ? ` · Caben ${MAX_VAGONES_DIA} como máximo` : '');
    };
    if (!pendientes.length) { resumen(); return; }
    est.textContent = '🔍 Buscando pictogramas…';
    let sinRed = false;
    Promise.all(pendientes.map(async i => {
      const n = Dia.agenda[i].n;
      let p = null;
      try { p = await deArasaac(n); } catch (e) { sinRed = true; }
      if (mio !== token) return;
      Dia.agenda[i] = p ? { n, p } : { n, e: '❓' };
      Dia.guardarAgenda(); Dia.pintarLista();
    })).then(() => {
      if (mio !== token) return;
      resumen();
      if (sinRed) est.textContent += ' · Sin conexión con ARASAAC: algunos pictogramas no se han podido buscar';
    });
  }

  /* --- 5) Flechas ▲▼: probar otros pictogramas parecidos (p. ej. otra ducha que el niño reconozca) --- */
  const alternativas = new Map();   // nombre → lista de ids de ARASAAC
  async function todos(q) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 7000);
    try {
      const r = await fetch('https://api.arasaac.org/v1/pictograms/es/search/' + encodeURIComponent(q), { signal: ctl.signal });
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d.map(x => x._id) : [];
    } catch (e) { return []; } finally { clearTimeout(t); }
  }
  async function buscarAlternativas(it) {
    const k = clave(it.n);
    if (alternativas.has(k)) return alternativas.get(k);
    // Se busca con el nombre y con palabras relacionadas: "Ducharse" → ducharse, duchar, ducha
    const consultas = [it.n.toLowerCase()];
    const d = delDiccionario(k); if (d) consultas.push(d.n.toLowerCase());
    it.n.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !VACIAS.has(clave(w))).sort((a, b) => b.length - a.length)
      .forEach(w => { consultas.push(w); if (/rse$/.test(w)) consultas.push(w.slice(0, -2), w.slice(0, -3)); });
    const ids = [];
    for (const q of [...new Set(consultas)].slice(0, 6)) {
      (await todos(q)).forEach(id => { if (!ids.includes(id)) ids.push(id); });
      if (ids.length >= 40) break;
    }
    if (it.p && !ids.includes(it.p)) ids.unshift(it.p);
    alternativas.set(k, ids.slice(0, 40));
    return alternativas.get(k);
  }
  // Cambia el pictograma del paso i por el anterior (-1) o el siguiente (+1) parecido.
  // Devuelve { n, pos, total } o null si no hay alternativas. Lo usan el dibujo y el viaje.
  async function cambiarPicto(i, dir, tarjeta) {
    const it = Dia.agenda[i]; if (!it) return null;
    if (tarjeta) tarjeta.classList.add('buscando');
    const ids = await buscarAlternativas(it);
    if (tarjeta) tarjeta.classList.remove('buscando');
    if (!ids.length || Dia.agenda[i] !== it) return null;   // sin parecidos, o la lista cambió mientras se buscaba
    const pos = Math.max(0, ids.indexOf(it.p));
    const nuevo = ids[(pos + dir + ids.length) % ids.length];
    Dia.agenda[i] = { ...it, p: nuevo }; delete Dia.agenda[i].e;
    sonidos.toque();
    Dia.guardarAgenda();
    return { n: it.n, pos: ids.indexOf(nuevo) + 1, total: ids.length };
  }
  // Tocar una tarjeta la selecciona (para quitarla con 🗑️)
  let sel = -1;
  const btnQuitar = $('#dia-quitar-mini');
  caja.addEventListener('click', e => {
    if (e.target.closest('button.alt')) return;
    const t = e.target.closest('.mini-vagon'); if (!t) return;
    const i = +t.dataset.i;
    sel = sel === i ? -1 : i;
    sonidos.toque(); pintarMini();
    if (sel >= 0) est.textContent = `«${Dia.agenda[sel].n}» seleccionado. Pulsa 🗑️ Quitar para borrarlo.`;
  });
  btnQuitar.addEventListener('click', () => {
    const it = Dia.agenda[sel]; if (!it) return;
    // Si salió del texto, se recuerda para que no vuelva a aparecer al seguir escribiendo
    const q = cargar('diaQuitados', []); if (!it.a && !q.includes(clave(it.n))) { q.push(clave(it.n)); guardar('diaQuitados', q); }
    Dia.agenda.splice(sel, 1); sel = -1;
    sonidos.neutro(); Dia.guardarAgenda(); Dia.pintarLista();
    est.textContent = `«${it.n}» quitado. Quedan ${Dia.agenda.length} ${Dia.agenda.length === 1 ? V().v : V().vs}.`;
  });
  caja.addEventListener('click', async e => {
    const b = e.target.closest('button.alt'); if (!b) return;
    const i = +b.dataset.i, n = Dia.agenda[i] && Dia.agenda[i].n;
    const r = await cambiarPicto(i, +b.dataset.dir, b.closest('.mini-vagon'));
    if (!r) { if (n) est.textContent = `No hay más pictogramas para «${n}». Prueba con 🖼️ en la lista.`; return; }
    Dia.pintarLista();
    est.textContent = `«${r.n}»: pictograma ${r.pos} de ${r.total}. Usa ▲▼ para ver más.`;
  });

  let ultLargo = -1;
  function pintarMini() {
    const scrollGuardado = caja.scrollLeft;
    if (Dia.agenda.length !== ultLargo) { sel = -1; ultLargo = Dia.agenda.length; }
    const ag = Dia.agenda, antes = vistos;
    vistos = new Set(ag.map(it => clave(it.n) + (it.p || it.e)));
    let hayNuevo = false;
    caja.innerHTML = locomotoraSVG() + (ag.length ? ag.map((it, i) => {
      const nuevo = !antes.has(clave(it.n) + (it.p || it.e));
      if (nuevo && it.p) hayNuevo = true;
      return `<div class="mini-vagon ${nuevo ? 'entra' : ''} ${it.e === '⏳' ? 'buscando' : ''} ${i === sel ? 'elegida' : ''}" data-i="${i}" style="--c:${colorVagon(i)}">
        <button class="alt alt-arriba" data-i="${i}" data-dir="-1" aria-label="Otro pictograma para ${esc(it.n)}">▲</button>
        ${pictoHTML(it)}<span>${esc(it.n)}</span>
        <button class="alt alt-abajo" data-i="${i}" data-dir="1" aria-label="Otro pictograma para ${esc(it.n)}">▼</button>
      </div>`;
    }).join('') : `<div class="mini-vacio">Escribe arriba y verás cómo se llena el ${V().n} 👆</div>`);
    caja.scrollLeft = scrollGuardado;
    if (sel >= ag.length) sel = -1;
    btnQuitar.disabled = sel < 0;
    const ult = $$('.mini-vagon.entra', caja).pop();
    if (ult && document.activeElement === ta) ult.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (hayNuevo && document.activeElement === ta) sonidos.toque();
  }

  ta.value = cargar('diaTexto', '');
  ta.addEventListener('input', () => {
    guardar('diaTexto', ta.value);
    clearTimeout(tEspera);
    if (ta.value.trim()) est.textContent = '✍️ Escribiendo…';
    tEspera = setTimeout(procesar, 650);
  });
  Dia.alPintar = pintarMini;
  return { partir, procesar, cambiarPicto };
})();

/* =========================================================
   AJUSTES E INICIO
   ========================================================= */
function prepararAjustes() {
  $$('#ajustes [data-ajuste]').forEach(inp => {
    const k = inp.dataset.ajuste;
    inp.checked = !!ajustes[k];
    inp.addEventListener('change', () => {
      ajustes[k] = inp.checked; aplicarAjustes();
      if (k === 'musica' && !inp.checked) pararMusica();
      if (k === 'voz' && !inp.checked && 'speechSynthesis' in window) speechSynthesis.cancel();
      if (inp.checked) sonidos.toque();
    });
  });
  $$('#ajustes [data-ajuste-num]').forEach(grupo => {
    const k = grupo.dataset.ajusteNum;
    const marcar = () => $$('button', grupo).forEach(b => b.classList.toggle('elegido', +b.dataset.v === ajustes[k]));
    marcar();
    grupo.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      ajustes[k] = +b.dataset.v; aplicarAjustes(); marcar(); sonidos.toque();
    });
  });
  const cumple = $('#aj-cumple'), nombre = $('#aj-nombre');
  cumple.value = ajustes.cumple || '';
  nombre.value = ajustes.nombre || '';
  cumple.addEventListener('change', () => { ajustes.cumple = cumple.value; aplicarAjustes(); });
  nombre.addEventListener('input', () => { ajustes.nombre = nombre.value.trim(); aplicarAjustes(); });

  // Vehículo: se elige en la portada (para el niño) o en ⚙️; los dos selectores van a la par
  const gruposVeh = [$('#aj-vehiculo'), $('#menu-vehiculo')];
  const marcarVeh = () => gruposVeh.forEach(g => $$('button', g).forEach(b => b.classList.toggle('elegido', b.dataset.vh === ajustes.vehiculo)));
  marcarVeh();
  gruposVeh.forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button[data-vh]'); if (!b) return;
    ajustes.vehiculo = b.dataset.vh; aplicarAjustes(); aplicarVehiculo(); marcarVeh();
    b.classList.remove('salta'); void b.offsetWidth; b.classList.add('salta');
    sonidos.silbato(); decir(mayus(V().n));
  }));

  mantenerPulsado($('#btn-ajustes'), () => abrirModal('#ajustes'));
  $('#ajustes-cerrar').addEventListener('click', () => cerrarModal('#ajustes'));
}

aplicarVehiculo();
prepararAjustes();
aplicarAjustes();

// Botón normal en la pantalla de Mi día: abre directamente "Escribe el día"
$('#btn-escribe-dia').addEventListener('click', () => {
  sonidos.toque();
  Dia.abrirEditor();
  const ta = $('#dia-texto');
  setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 50);
});

// Enlaces directos: ?pantalla=calma|cosas|colores|dia · &escena=noche… · &vehiculo=tren|coche|barco|avion
(() => {
  const q = new URLSearchParams(location.search);
  const veh = q.get('vehiculo'), escena = q.get('escena'), pantalla = q.get('pantalla');
  if (veh && VEHICULOS[veh]) { ajustes.vehiculo = veh; aplicarAjustes(); aplicarVehiculo(); }
  if (['calma', 'cosas', 'colores', 'dia'].includes(pantalla)) irA(pantalla);
  if (pantalla === 'calma' && escena) { const b = $(`#calma-escenas [data-escena="${escena}"]`); if (b) b.click(); }
})();
