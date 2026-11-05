// Lógica de la tienda: lista de productos (tienda.html / botiga.html) y página de cada producto
// (producto.html / producte.html). Los productos y las categorías están en productos.js.
// Los textos que dependen del idioma están en T. Si cambias uno, cámbialo en los dos idiomas.
(function(){
  var L=document.documentElement.lang==='ca'?'ca':'es';
  var T={
    es:{pronto:'Próximamente',agotado:'Agotado',todo:'Todo',todos:'Todos los productos',
      producto:'producto',productos:'productos',
      wallapop:'Comprar en Wallapop',wallapopPronto:'Muy pronto en Wallapop',canalWallapop:'En Wallapop',canalApp:'App',
      appStore:'Descargar en App Store',googlePlay:'Descargar en Google Play',appPronto:'Próximamente en App Store y Google Play',
      preguntar:'Preguntar por este producto',anterior:'Foto anterior',siguiente:'Foto siguiente',foto:'Foto',de:'de',
      sinResultados:'No hemos encontrado nada con «%s».',tienda:'tienda.html',ficha:'producto.html',
      contacto:'index.html#contacto',titulo:' – Tienda N.A.N.A.'},
    ca:{pronto:'Properament',agotado:'Esgotat',todo:'Tot',todos:'Tots els productes',
      producto:'producte',productos:'productes',
      wallapop:'Comprar a Wallapop',wallapopPronto:'Molt aviat a Wallapop',canalWallapop:'A Wallapop',canalApp:'App',
      appStore:'Descarregar a l’App Store',googlePlay:'Descarregar a Google Play',appPronto:'Properament a l’App Store i Google Play',
      preguntar:'Preguntar per aquest producte',anterior:'Foto anterior',siguiente:'Foto següent',foto:'Foto',de:'de',
      sinResultados:'No hem trobat res amb «%s».',tienda:'botiga.html',ficha:'producte.html',
      contacto:'index-ca.html#contacte',titulo:' – Botiga N.A.N.A.'}
  }[L];

  var productos=window.NANA_PRODUCTOS||[],categorias=window.NANA_CATEGORIAS||[],cats={};
  categorias.forEach(function(c){cats[c.id]=c;});
  function txt(p){return p[L]||p.es;}
  function euros(n){return n.toLocaleString(L==='ca'?'ca-ES':'es-ES',{style:'currency',currency:'EUR'});}
  function el(tag,cls,t){var e=document.createElement(tag);if(cls)e.className=cls;if(t!=null)e.textContent=t;return e;}
  function normal(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
  function enlaceFicha(p){return T.ficha+'?id='+encodeURIComponent(p.id);}
  function comprable(p){return p.tipo!=='app'&&p.wallapop&&typeof p.precio==='number'&&!p.agotado;}

  var svg='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">';
  var ICONOS={
    app:svg+'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/><path d="M9.5 9.5a3.5 3.5 0 0 1 5 0M8 7a6 6 0 0 1 8 0"/></svg>',
    corazon:svg+'<path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6z"/></svg>',
    ondas:svg+'<circle cx="12" cy="12" r="3"/><path d="M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18" opacity=".5"/><circle cx="12" cy="12" r="6.5"/></svg>',
    reloj:svg+'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>',
    izq:svg+'<path d="m15 18-6-6 6-6"/></svg>',
    der:svg+'<path d="m9 18 6-6-6-6"/></svg>',
    bolsa:svg+'<path d="M6 7h12l1 14H5L6 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>'
  };

  // Carrusel de fotos: se desliza con el dedo (scroll-snap) y con flechas en ordenador
  function carrusel(p,opts){
    opts=opts||{};
    var fotos=p.fotos&&p.fotos.length?p.fotos:[null],c=cats[p.categoria]||{},nombre=txt(p).nombre;
    var caja=el('div','carrusel'+(opts.grande?' carrusel-grande':'')),pista=el('div','pista');
    if(fotos.length>1){pista.tabIndex=opts.grande?0:-1;pista.setAttribute('aria-label',nombre);}
    fotos.forEach(function(f,i){
      var d=el(opts.href?'a':'div','diapo');
      if(opts.href){d.href=opts.href;d.tabIndex=-1;d.setAttribute('aria-hidden','true');}
      if(f){var img=el('img');img.src=f;img.alt=fotos.length>1?nombre+' ('+T.foto+' '+(i+1)+' '+T.de+' '+fotos.length+')':nombre;
        img.loading=(i===0&&opts.grande)?'eager':'lazy';img.draggable=false;d.appendChild(img);}
      else{d.classList.add('sin-foto');d.style.background=c.color||'#DCE9F1';d.innerHTML=ICONOS[c.icono]||ICONOS.app;}
      pista.appendChild(d);
    });
    caja.appendChild(pista);
    var puntos=[],escuchas=[];
    function actual(){return Math.round(pista.scrollLeft/Math.max(1,pista.clientWidth));}
    function ir(i){i=Math.max(0,Math.min(fotos.length-1,i));pista.scrollTo({left:i*pista.clientWidth,behavior:'smooth'});}
    if(fotos.length>1){
      var a=el('button','flecha flecha-izq');a.type='button';a.setAttribute('aria-label',T.anterior);a.innerHTML=ICONOS.izq;
      var b=el('button','flecha flecha-der');b.type='button';b.setAttribute('aria-label',T.siguiente);b.innerHTML=ICONOS.der;
      a.addEventListener('click',function(e){e.preventDefault();ir(actual()-1);});
      b.addEventListener('click',function(e){e.preventDefault();ir(actual()+1);});
      caja.appendChild(a);caja.appendChild(b);
      var pts=el('div','puntos');pts.setAttribute('aria-hidden','true');
      fotos.forEach(function(){var s=el('span');pts.appendChild(s);puntos.push(s);});
      caja.appendChild(pts);
      var ultimo=-1;
      function marcar(){var i=actual();if(i===ultimo)return;ultimo=i;
        puntos.forEach(function(s,k){s.className=k===i?'activo':'';});
        a.disabled=i===0;b.disabled=i===fotos.length-1;
        escuchas.forEach(function(f){f(i);});}
      pista.addEventListener('scroll',function(){window.requestAnimationFrame(marcar);},{passive:true});
      pista.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();ir(actual()-1);}if(e.key==='ArrowRight'){e.preventDefault();ir(actual()+1);}});
      setTimeout(marcar,0);
    }
    return {el:caja,ir:ir,alCambiar:function(f){escuchas.push(f);},fotos:fotos};
  }

  function precio(p,cls){
    if(p.tipo==='app')return el('span',cls+' '+cls+'-suave',typeof p.precio==='number'?euros(p.precio):(p.appStore||p.googlePlay?'':T.pronto));
    if(typeof p.precio!=='number')return el('span',cls+' '+cls+'-suave',T.pronto);
    var s=el('span',cls,euros(p.precio));
    if(p.agotado){s.classList.add('tachado');}
    return s;
  }

  function tarjeta(p){
    var t=txt(p),art=el('article','tarjeta'),href=enlaceFicha(p);
    art.appendChild(carrusel(p,{href:href}).el);
    var cu=el('div','tarjeta-cuerpo');
    var a=el('a','tarjeta-titulo',t.nombre);a.href=href;cu.appendChild(a);
    cu.appendChild(el('p','tarjeta-resumen',t.resumen));
    var pie=el('div','tarjeta-pie');
    pie.appendChild(precio(p,'tarjeta-precio'));
    if(p.agotado)pie.appendChild(el('span','canal canal-agotado',T.agotado));
    else if(p.tipo==='app')pie.appendChild(el('span','canal canal-app',T.canalApp));
    else if(comprable(p))pie.appendChild(el('span','canal',T.canalWallapop));
    cu.appendChild(pie);art.appendChild(cu);
    return art;
  }

  // El botón ES/CA conserva el producto, la categoría o la búsqueda
  function enlazarIdioma(){
    document.querySelectorAll('[data-idioma]').forEach(function(a){
      a.href=a.getAttribute('href').split('?')[0]+location.search;
    });
  }

  // ---------- Lista de productos ----------
  var cat=document.getElementById('catalogo');
  if(cat){
    var params=new URLSearchParams(location.search),estado={cat:params.get('cat')||'',q:params.get('q')||''};
    if(estado.cat&&!cats[estado.cat])estado.cat='';
    var chips=document.getElementById('categorias'),buscar=document.getElementById('buscar'),
        titulo=document.getElementById('titulo-lista'),contador=document.getElementById('contador'),vacio=document.getElementById('sin-resultados');
    buscar.value=estado.q;
    var usadas=categorias.filter(function(c){return productos.some(function(p){return p.categoria===c.id;});});
    var botones=[];
    [{id:'',nombre:T.todo}].concat(usadas.map(function(c){return {id:c.id,nombre:c[L]||c.es,icono:c.icono};})).forEach(function(c){
      var b=el('button','chip-cat');b.type='button';
      if(c.icono)b.innerHTML=ICONOS[c.icono];
      b.appendChild(document.createTextNode(c.nombre));
      b.addEventListener('click',function(){estado.cat=c.id;pintar();b.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});});
      b.dataset.cat=c.id;chips.appendChild(b);botones.push(b);
    });
    function pintar(){
      var q=normal(estado.q.trim());
      var lista=productos.filter(function(p){
        if(estado.cat&&p.categoria!==estado.cat)return false;
        if(!q)return true;
        var t=txt(p),c=cats[p.categoria]||{};
        return normal([t.nombre,t.resumen,(t.descripcion||[]).join(' '),(t.paraQue||[]).join(' '),c[L],c.es,c.ca,p.es.nombre,p.ca&&p.ca.nombre].join(' ')).indexOf(q)>=0;
      });
      botones.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.cat===estado.cat));});
      titulo.textContent=estado.cat?(cats[estado.cat][L]||cats[estado.cat].es):T.todos;
      contador.textContent=lista.length+' '+(lista.length===1?T.producto:T.productos);
      cat.innerHTML='';lista.forEach(function(p){cat.appendChild(tarjeta(p));});
      vacio.hidden=!!lista.length;
      vacio.querySelector('span').textContent=T.sinResultados.replace('%s',estado.q.trim());
      var u=new URLSearchParams();if(estado.cat)u.set('cat',estado.cat);if(estado.q.trim())u.set('q',estado.q.trim());
      var s=u.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+location.hash);
      enlazarIdioma();
    }
    buscar.addEventListener('input',function(){estado.q=buscar.value;pintar();});
    document.getElementById('form-buscar').addEventListener('submit',function(e){
      e.preventDefault();buscar.blur();
      document.getElementById('lista').scrollIntoView({behavior:'smooth'});
    });
    document.getElementById('limpiar').addEventListener('click',function(){estado.q='';estado.cat='';buscar.value='';pintar();});
    pintar();
    // El enlace «Condiciones de la tienda» de las fichas abre el desplegable
    var cond=document.querySelector('details.condiciones');
    if(cond&&/^#condici/.test(location.hash))cond.open=true;
  }

  // ---------- Página de un producto ----------
  var ficha=document.getElementById('producto');
  if(ficha){
    var id=new URLSearchParams(location.search).get('id'),p=productos.filter(function(x){return x.id===id;})[0];
    enlazarIdioma();
    if(!p){document.getElementById('no-encontrado').hidden=false;return;}
    var t=txt(p),c=cats[p.categoria]||{};
    ficha.hidden=false;
    document.title=t.nombre+T.titulo;

    var mc=document.getElementById('miga-cat');mc.textContent=c[L]||c.es||'';mc.href=T.tienda+'?cat='+encodeURIComponent(p.categoria);
    var fc=document.getElementById('ficha-cat');fc.innerHTML=ICONOS[c.icono]||'';fc.appendChild(document.createTextNode(c[L]||c.es||''));fc.href=mc.href;
    document.getElementById('ficha-nombre').textContent=t.nombre;
    document.getElementById('ficha-resumen').textContent=t.resumen;

    // Galería con miniaturas
    var gal=document.getElementById('galeria'),car=carrusel(p,{grande:true});
    gal.appendChild(car.el);
    if(car.fotos.length>1){
      var minis=el('div','miniaturas'),mb=[];
      car.fotos.forEach(function(f,i){
        var b=el('button','mini');b.type='button';b.setAttribute('aria-label',T.foto+' '+(i+1));
        var img=el('img');img.src=f;img.alt='';img.loading='lazy';b.appendChild(img);
        b.addEventListener('click',function(){car.ir(i);});minis.appendChild(b);mb.push(b);
      });
      car.alCambiar(function(i){mb.forEach(function(b,k){b.setAttribute('aria-current',String(k===i));});});
      gal.appendChild(minis);
    }

    // Precio y botones de compra
    var zp=document.getElementById('ficha-precio');zp.appendChild(precio(p,'precio-grande'));
    if(p.agotado)zp.appendChild(el('span','canal canal-agotado',T.agotado));
    var zb=document.getElementById('ficha-botones'),principal;
    function boton(href,texto,cls){var a=el('a','btn '+(cls||''));a.href=href;a.target='_blank';a.rel='noopener';a.innerHTML=ICONOS.bolsa;a.appendChild(document.createTextNode(texto));return a;}
    if(p.tipo==='app'){
      if(p.appStore)zb.appendChild(principal=boton(p.appStore,T.appStore));
      if(p.googlePlay){var g=boton(p.googlePlay,T.googlePlay,principal?'btn-borde':'');zb.appendChild(g);principal=principal||g;}
      if(!principal)zb.appendChild(principal=el('span','btn btn-apagado',T.appPronto));
      document.getElementById('garantias').hidden=true;
    }else if(comprable(p)){
      zb.appendChild(principal=boton(p.wallapop,T.wallapop,'btn-wallapop'));
    }else{
      zb.appendChild(principal=el('span','btn btn-apagado',p.agotado?T.agotado:T.wallapopPronto));
    }
    var preg=el('a','btn btn-borde',T.preguntar);preg.href=T.contacto;zb.appendChild(preg);

    // Barra fija abajo en el móvil
    var barra=document.getElementById('barra-compra');
    // (solo cuando se puede comprar o descargar)
    if(principal.tagName==='A'){
      barra.appendChild(precio(p,'precio-barra'));barra.appendChild(principal.cloneNode(true));barra.hidden=false;
      document.body.classList.add('con-barra');
    }

    // Descripción
    var desc=document.getElementById('ficha-descripcion');
    (t.descripcion||[]).forEach(function(par){desc.appendChild(el('p',null,par));});
    var pq=document.getElementById('ficha-paraque');
    (t.paraQue||[]).forEach(function(x){pq.appendChild(el('li',null,x));});
    if(!(t.paraQue||[]).length)document.getElementById('bloque-paraque').hidden=true;

    // Productos relacionados: primero los de la misma categoría
    var rel=productos.filter(function(x){return x.id!==p.id&&x.categoria===p.categoria;})
      .concat(productos.filter(function(x){return x.id!==p.id&&x.categoria!==p.categoria;})).slice(0,4);
    var zr=document.getElementById('relacionados');
    rel.forEach(function(x){zr.appendChild(tarjeta(x));});
    if(!rel.length)document.getElementById('bloque-relacionados').hidden=true;
  }
})();
