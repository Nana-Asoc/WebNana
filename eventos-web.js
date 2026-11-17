// Pinta los eventos de eventos.js en eventos.html / esdeveniments.html y el próximo evento en la portada.
(function(){
  var ca=(document.documentElement.lang||'es').indexOf('ca')===0,L=ca?'ca':'es';
  var T=ca?{
    ver:'Més informació',ig:'Veure a Instagram',sinProx:'Ara mateix no hi ha cap esdeveniment programat. Segueix-nos a Instagram per assabentar-te de les properes activitats.',
    sinPas:'Aquí apareixeran els esdeveniments que ja hem fet.',todos:'Veure tots els esdeveniments →',proximo:'Proper esdeveniment'
  }:{
    ver:'Más información',ig:'Ver en Instagram',sinProx:'Ahora mismo no hay ningún evento programado. Síguenos en Instagram para enterarte de las próximas actividades.',
    sinPas:'Aquí aparecerán los eventos que ya hemos hecho.',todos:'Ver todos los eventos →',proximo:'Próximo evento'
  };
  var lista=(window.NANA_EVENTOS||[]).filter(function(e){return e&&e.fecha;});
  var hoy=new Date();hoy.setHours(0,0,0,0);
  function fechaDe(e){var p=String(e.fecha).split('-');return new Date(+p[0],(+p[1]||1)-1,+p[2]||1);}
  function txt(e,c){var o=e[L]||{},b=e.es||{};if(typeof o==='string')o={titulo:o};if(typeof b==='string')b={titulo:b};return o[c]||b[c]||'';}
  // Solo se aceptan enlaces web normales y fotos de la propia web o https (nunca javascript:, data:, etc.)
  function urlSegura(u){u=String(u||'').trim();return /^https?:\/\//i.test(u)?u:'';}
  function fotoSegura(u){u=String(u||'').trim();return /^img\/[\w\/.-]+$/.test(u)||/^https:\/\//i.test(u)?u:'';}
  function el(tag,cls,t){var x=document.createElement(tag);if(cls)x.className=cls;if(t)x.textContent=t;return x;}
  function fechaLarga(e){return fechaDe(e).toLocaleDateString(ca?'ca-ES':'es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
  var proximos=lista.filter(function(e){return fechaDe(e)>=hoy;}).sort(function(a,b){return fechaDe(a)-fechaDe(b);});
  var pasados=lista.filter(function(e){return fechaDe(e)<hoy;}).sort(function(a,b){return fechaDe(b)-fechaDe(a);});

  function tarjeta(e,pasado){
    var c=el('article','evento'+(pasado?' pasado':''));
    var foto=el('div','evento-foto');
    var src=fotoSegura(e.foto||e.imagen);
    if(src){var im=el('img');im.src=src;im.alt='';im.loading='lazy';foto.appendChild(im);}
    else{foto.classList.add('sin-foto');}
    var d=fechaDe(e),dia=el('div','evento-dia');
    dia.appendChild(el('strong','',String(d.getDate())));
    dia.appendChild(el('span','',d.toLocaleDateString(ca?'ca-ES':'es-ES',{month:'short'}).replace('.','')));
    foto.appendChild(dia);c.appendChild(foto);
    var cu=el('div','evento-cuerpo');
    cu.appendChild(el('span','evento-fecha',fechaLarga(e)+(e.hora?' · '+e.hora:'')));
    cu.appendChild(el('h3','',txt(e,'titulo')));
    if(e.lugar)cu.appendChild(el('span','evento-lugar','📍 '+e.lugar));
    var desc=txt(e,'descripcion');
    if(desc)desc.split(/\n\s*\n/).forEach(function(p){cu.appendChild(el('p','',p.trim()));});
    var enlace=urlSegura(e.enlace);
    if(enlace){var a=el('a','evento-enlace',/^https:\/\/(www\.)?instagram\.com\//i.test(enlace)?T.ig:T.ver);a.href=enlace;a.target='_blank';a.rel='noopener';cu.appendChild(a);}
    c.appendChild(cu);return c;
  }
  function pintar(id,arr,vacio,pasado){
    var cont=document.getElementById(id);if(!cont)return;
    cont.innerHTML='';
    if(!arr.length){cont.appendChild(el('p','eventos-vacio',vacio));return;}
    arr.forEach(function(e){cont.appendChild(tarjeta(e,pasado));});
  }
  pintar('lista-proximos',proximos,T.sinProx,false);
  pintar('lista-pasados',pasados,T.sinPas,true);
  var bloquePasados=document.getElementById('bloque-pasados');
  if(bloquePasados&&!pasados.length)bloquePasados.hidden=true;

  // Botón de Instagram
  document.querySelectorAll('.enlace-instagram').forEach(function(a){
    var ig=urlSegura(window.NANA_INSTAGRAM);if(ig){a.href=ig;a.hidden=false;}
  });

  // Portada: el próximo evento, si lo hay
  var p=document.getElementById('proximo-evento');
  if(p&&proximos.length){
    var e=proximos[0];
    p.querySelector('.pe-badge').textContent=T.proximo;
    p.querySelector('.pe-titulo').textContent=txt(e,'titulo');
    p.querySelector('.pe-fecha').textContent=fechaLarga(e)+(e.hora?' · '+e.hora:'')+(e.lugar?' · '+e.lugar:'');
    p.hidden=false;
  }
})();
