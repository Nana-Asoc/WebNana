// Lógica de la tienda (tienda.html y botiga.html). Los productos están en productos.js.
// Los textos que dependen del idioma están en T, abajo. Si cambias uno, cámbialo en los dos idiomas.
(function(){
  var L=document.documentElement.lang==='ca'?'ca':'es';
  var T={
    es:{pronto:'Próximamente',agotado:'Agotado',anadir:'Añadir a la cesta',enCesta:'En la cesta',quitar:'Quitar',menos:'Uno menos',mas:'Uno más',
      cestaVacia:'La cesta está vacía. Añadid los productos que os interesen.',total:'Total',aportacion:'Aportación solidaria',
      appStore:'App Store',googlePlay:'Google Play',appPronto:'Próximamente en App Store y Google Play',
      enviando:'Enviando…',enviar:'Enviar pedido',ok:'¡Gracias! Hemos recibido vuestro pedido. Os escribiremos para confirmarlo y deciros cómo pagar.',
      error:'No se ha podido enviar. Probad de nuevo o escribidnos a nucli.nana@gmail.com.',sinProductos:'Añadid al menos un producto a la cesta.',
      envio:'Envío a domicilio',ud:'ud.'},
    ca:{pronto:'Properament',agotado:'Esgotat',anadir:'Afegir a la cistella',enCesta:'A la cistella',quitar:'Treure',menos:'Un menys',mas:'Un més',
      cestaVacia:'La cistella és buida. Afegiu-hi els productes que us interessin.',total:'Total',aportacion:'Aportació solidària',
      appStore:'App Store',googlePlay:'Google Play',appPronto:'Properament a l’App Store i Google Play',
      enviando:'Enviant…',enviar:'Enviar la comanda',ok:'Gràcies! Hem rebut la vostra comanda. Us escriurem per confirmar-la i dir-vos com pagar.',
      error:'No s’ha pogut enviar. Torneu-ho a provar o escriviu-nos a nucli.nana@gmail.com.',sinProductos:'Afegiu almenys un producte a la cistella.',
      envio:'Enviament a domicili',ud:'u.'}
  }[L];

  var productos=window.NANA_PRODUCTOS||[];
  var porId={};productos.forEach(function(p){porId[p.id]=p;});
  function sePuedePedir(p){return p.tipo!=='app'&&typeof p.precio==='number'&&!p.agotado;}
  function euros(n){return n.toLocaleString(L==='ca'?'ca-ES':'es-ES',{style:'currency',currency:'EUR'});}
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}

  // Cesta: se guarda en el navegador para no perderla al cambiar de idioma o recargar
  var cesta={};
  try{cesta=JSON.parse(localStorage.getItem('nana-cesta'))||{};}catch(e){cesta={};}
  Object.keys(cesta).forEach(function(id){if(!porId[id]||!sePuedePedir(porId[id])||!(cesta[id]>0))delete cesta[id];});
  function guardar(){try{localStorage.setItem('nana-cesta',JSON.stringify(cesta));}catch(e){}}

  var icono='<svg aria-hidden="true" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">';
  var dibujos={
    app:icono+'<rect x="6" y="2" width="12" height="20" rx="3"></rect><path d="M11 18h2"></path><path d="M9.5 9.5a3.5 3.5 0 0 1 5 0M8 7a6 6 0 0 1 8 0"></path></svg>',
    material:icono+'<path d="M20 12v9H4v-9"></path><path d="M2 7h20v5H2z"></path><path d="M12 21V7"></path><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>'
  };

  // Catálogo
  var cat=document.getElementById('catalogo');
  function pintarCatalogo(){
    cat.innerHTML='';
    productos.forEach(function(p){
      var t=p[L]||p.es,art=el('article','producto');
      var fig=el('div','producto-img');
      if(p.imagen){var img=el('img');img.src=p.imagen;img.alt=t.nombre;img.loading='lazy';fig.appendChild(img);}
      else{fig.innerHTML=dibujos[p.tipo==='app'?'app':'material'];fig.classList.add('sin-foto');}
      art.appendChild(fig);
      var c=el('div','producto-cuerpo');
      c.appendChild(el('span','producto-cat',t.categoria));
      c.appendChild(el('h3',null,t.nombre));
      c.appendChild(el('p',null,t.descripcion));
      var pie=el('div','producto-pie');
      if(p.tipo==='app'){
        if(p.appStore||p.googlePlay){
          [['appStore',T.appStore],['googlePlay',T.googlePlay]].forEach(function(x){
            if(!p[x[0]])return;var a=el('a','btn btn-borde',x[1]);a.href=p[x[0]];a.target='_blank';a.rel='noopener';pie.appendChild(a);
          });
        }else pie.appendChild(el('span','etiqueta',T.appPronto));
      }else if(typeof p.precio!=='number'){
        pie.appendChild(el('span','etiqueta',T.pronto));
      }else{
        pie.appendChild(el('strong','precio',euros(p.precio)));
        if(p.agotado)pie.appendChild(el('span','etiqueta',T.agotado));
        else{
          var b=el('button','btn',cesta[p.id]?T.enCesta+' ('+cesta[p.id]+')':T.anadir);b.type='button';
          b.addEventListener('click',function(){cesta[p.id]=(cesta[p.id]||0)+1;cambio();});
          pie.appendChild(b);
        }
      }
      c.appendChild(pie);art.appendChild(c);cat.appendChild(art);
    });
  }

  // Cesta y formulario de pedido
  var lista=document.getElementById('cesta-lista'),totalEl=document.getElementById('cesta-total'),
      f=document.getElementById('form-pedido'),b=document.getElementById('btn-pedido'),s=document.getElementById('pedido-estado'),
      apor=document.getElementById('aportacion'),dir=document.getElementById('campo-direccion');
  function aportacion(){return apor?parseFloat(apor.value)||0:0;}
  function pintarCesta(){
    lista.innerHTML='';var total=0,ids=Object.keys(cesta);
    if(!ids.length)lista.appendChild(el('li','vacia',T.cestaVacia));
    ids.forEach(function(id){
      var p=porId[id],n=cesta[id],li=el('li','linea');total+=p.precio*n;
      li.appendChild(el('span','linea-nombre',(p[L]||p.es).nombre));
      var ctr=el('span','linea-ctr');
      var m=el('button','mini','−');m.type='button';m.setAttribute('aria-label',T.menos);
      m.addEventListener('click',function(){cesta[id]--;if(cesta[id]<1)delete cesta[id];cambio();});
      var mas=el('button','mini','+');mas.type='button';mas.setAttribute('aria-label',T.mas);
      mas.addEventListener('click',function(){cesta[id]++;cambio();});
      ctr.appendChild(m);ctr.appendChild(el('span','linea-n',String(n)));ctr.appendChild(mas);
      li.appendChild(ctr);li.appendChild(el('span','linea-precio',euros(p.precio*n)));lista.appendChild(li);
    });
    totalEl.textContent=euros(total+(ids.length?aportacion():0));
  }
  function cambio(){guardar();pintarCatalogo();pintarCesta();}
  if(apor)apor.addEventListener('change',pintarCesta);

  // La dirección solo se pide si eligen envío a domicilio
  function entrega(){
    var envio=f.querySelector('input[name="entrega"]:checked');envio=envio&&envio.value===T.envio;
    dir.hidden=!envio;dir.querySelector('textarea').required=envio;
  }
  f.querySelectorAll('input[name="entrega"]').forEach(function(r){r.addEventListener('change',entrega);});

  f.addEventListener('submit',function(e){
    e.preventDefault();
    var ids=Object.keys(cesta);
    if(!ids.length){s.style.color='#A3352B';s.textContent=T.sinProductos;return;}
    var total=0,lineas=ids.map(function(id){var p=porId[id];total+=p.precio*cesta[id];return cesta[id]+' '+T.ud+' × '+p.es.nombre+' ('+euros(p.precio)+') = '+euros(p.precio*cesta[id]);});
    if(aportacion())lineas.push(T.aportacion+': '+euros(aportacion()));
    total+=aportacion();
    var datos=new FormData(f);
    datos.set('pedido',lineas.join('\n'));datos.set('total',euros(total));
    b.disabled=true;b.textContent=T.enviando;s.textContent='';
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Accept':'application/json'},body:datos})
      .then(function(r){return r.json();})
      .then(function(d){
        if(!d.success)throw new Error(d.message);
        cesta={};f.reset();entrega();cambio();
        s.style.color='#1D5F5B';s.textContent=T.ok;
      })
      .catch(function(){s.style.color='#A3352B';s.textContent=T.error;})
      .finally(function(){b.disabled=false;b.textContent=T.enviar;});
  });

  // Si no hay nada que se pueda pedir todavía, se oculta el bloque de pedido
  var hayPedibles=productos.some(sePuedePedir);
  document.getElementById('pedido').hidden=!hayPedibles;
  document.getElementById('aviso-pronto').hidden=hayPedibles;

  entrega();cambio();
})();
