// Página para gestionar la tienda (gestionar.html).
// Lee y guarda productos.js y las fotos de img/tienda/ directamente en GitHub con la clave de acceso
// de quien la usa. Cada vez que se guarda se hace un commit en la rama principal y GitHub Pages
// vuelve a publicar la web.
(function(){
  var REPO='Nana-Asoc/WebNana',RAMA='main',API='https://api.github.com',
      RAW='https://raw.githubusercontent.com/'+REPO+'/'+RAMA+'/',CLAVE='nana-gh-token',
      LADO_MAX=1200;

  var CABECERA=[
    '// Productos de la tienda de N.A.N.A. (salen en tienda.html / botiga.html y en producto.html / producte.html).',
    '//',
    '// La forma más fácil de cambiarlos es la página gestionar.html, que guarda este archivo y sube las fotos.',
    '// Si lo editas a mano: cada producto tiene',
    '//   id:         nombre corto sin espacios ni acentos; sale en la dirección de la página del producto',
    '//   categoria:  una de las de NANA_CATEGORIAS',
    '//   tipo:       "material" (se vende en Wallapop) o "app"',
    '//   fotos:      lista de fotos (la primera sale primero); vacía = dibujo de la categoría',
    '//   precio:     en euros con punto decimal (12.5); null = «Próximamente»',
    '//   wallapop:   enlace al anuncio en Wallapop',
    '//   appStore / googlePlay: solo para las apps',
    '//   agotado:    true si no queda stock',
    '//   es / ca:    nombre, resumen, descripcion (párrafos) y paraQue (lista) en castellano y en catalán',
    '//',
    '// Categorías: icono = app, corazon, ondas o reloj; color = fondo del dibujo cuando no hay foto.',
    ''].join('\n');

  // ---------- Utilidades ----------
  function $(id){return document.getElementById(id);}
  function el(tag,cls,t){var e=document.createElement(tag);if(cls)e.className=cls;if(t!=null)e.textContent=t;return e;}
  function aviso(id,tipo,texto){var p=$(id);p.hidden=!texto;p.className='estado '+(tipo||'info');p.textContent=texto||'';}
  function euros(n){return n.toLocaleString('es-ES',{style:'currency',currency:'EUR'});}
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50)||'producto';}
  function b64aTexto(b){var bin=atob(b.replace(/\s/g,'')),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new TextDecoder('utf-8').decode(u);}
  function srcFoto(f){return /^https?:/.test(f)?f:f;}

  var token='',estado=null; // estado = {categorias, productos}

  function guardarClave(t,recordar){
    try{localStorage.removeItem(CLAVE);sessionStorage.removeItem(CLAVE);(recordar?localStorage:sessionStorage).setItem(CLAVE,t);}catch(e){}
  }
  function leerClave(){try{return localStorage.getItem(CLAVE)||sessionStorage.getItem(CLAVE)||'';}catch(e){return '';}}
  function borrarClave(){try{localStorage.removeItem(CLAVE);sessionStorage.removeItem(CLAVE);}catch(e){}}

  // ---------- GitHub ----------
  function gh(ruta,metodo,cuerpo){
    var h={'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'};
    if(cuerpo)h['Content-Type']='application/json';
    return fetch(API+ruta,{method:metodo||'GET',headers:h,body:cuerpo?JSON.stringify(cuerpo):undefined,cache:'no-store'})
      .then(function(r){
        return r.text().then(function(t){
          var d=null;try{d=t?JSON.parse(t):null;}catch(e){}
          if(!r.ok){var e=new Error((d&&d.message)||('Error '+r.status));e.status=r.status;throw e;}
          return d;
        });
      });
  }
  function explicar(e){
    if(e.status===401)return 'La clave no es válida o ha caducado. Cread una nueva y volved a conectar.';
    if(e.status===403||e.status===404)return 'La clave no tiene permiso para el repositorio WebNana. Revisad que en «Resource owner» esté Nana-Asoc, que esté elegido WebNana y que «Contents» sea «Read and write». Si la organización pide aprobar las claves, aprobadla en GitHub (Nana-Asoc → Settings → Personal access tokens → Pending requests). Detalle: '+e.message;
    if(e instanceof TypeError)return 'No hay conexión con GitHub. Comprobad la conexión a internet y probad de nuevo.';
    return 'Ha fallado algo: '+e.message;
  }

  // Lee productos.js tal como está ahora en GitHub
  function leer(){
    return gh('/repos/'+REPO+'/git/ref/heads/'+RAMA).then(function(ref){
      var commit=ref.object.sha;
      return gh('/repos/'+REPO+'/contents/productos.js?ref='+commit).then(function(f){
        var texto=b64aTexto(f.content);
        var d=new Function(texto+'\n;return {categorias:typeof NANA_CATEGORIAS!=="undefined"?NANA_CATEGORIAS:[],productos:typeof NANA_PRODUCTOS!=="undefined"?NANA_PRODUCTOS:[]};')();
        return {commit:commit,datos:d};
      });
    });
  }

  function limpiar(p){
    var o={id:p.id,categoria:p.categoria,tipo:p.tipo==='app'?'app':'material',fotos:(p.fotos||[]).slice(),precio:typeof p.precio==='number'?p.precio:null};
    if(o.tipo==='app'){o.appStore=p.appStore||'';o.googlePlay=p.googlePlay||'';}
    else o.wallapop=p.wallapop||'';
    if(p.agotado)o.agotado=true;
    ['es','ca'].forEach(function(l){var t=p[l]||{};o[l]={nombre:t.nombre||'',resumen:t.resumen||'',descripcion:(t.descripcion||[]).slice(),paraQue:(t.paraQue||[]).slice()};});
    return o;
  }
  function serializar(d){
    return CABECERA+'\nvar NANA_CATEGORIAS = '+JSON.stringify(d.categorias,null,2)+';\n\nvar NANA_PRODUCTOS = '+JSON.stringify(d.productos.map(limpiar),null,2)+';\n';
  }
  function fotosDe(d){var s={};d.productos.forEach(function(p){(p.fotos||[]).forEach(function(f){s[f]=1;});});return s;}

  // Aplica un cambio sobre la versión más reciente y lo guarda en un solo commit (con las fotos nuevas)
  function guardar(cambio,fotosNuevas,mensaje,intento){
    intento=intento||1;
    return leer().then(function(r){
      var antes=fotosDe(r.datos);
      cambio(r.datos);
      var despues=fotosDe(r.datos);
      // Fotos de img/tienda/ que ya no usa ningún producto: se borran del repositorio
      var borrar=Object.keys(antes).filter(function(f){return !despues[f]&&f.indexOf('img/tienda/')===0;});
      return gh('/repos/'+REPO+'/git/commits/'+r.commit).then(function(c){
        return Promise.all((fotosNuevas||[]).map(function(f){
          return gh('/repos/'+REPO+'/git/blobs','POST',{content:f.base64,encoding:'base64'}).then(function(b){return {path:f.path,mode:'100644',type:'blob',sha:b.sha};});
        })).then(function(entradas){
          entradas.push({path:'productos.js',mode:'100644',type:'blob',content:serializar(r.datos)});
          borrar.forEach(function(f){entradas.push({path:f,mode:'100644',type:'blob',sha:null});});
          return gh('/repos/'+REPO+'/git/trees','POST',{base_tree:c.tree.sha,tree:entradas});
        }).then(function(arbol){
          return gh('/repos/'+REPO+'/git/commits','POST',{message:mensaje,tree:arbol.sha,parents:[r.commit]});
        }).then(function(nuevo){
          return gh('/repos/'+REPO+'/git/refs/heads/'+RAMA,'PATCH',{sha:nuevo.sha,force:false});
        }).then(function(){estado=r.datos;return r.datos;});
      });
    }).catch(function(e){
      // Si alguien ha guardado otra cosa a la vez, se vuelve a intentar sobre la versión nueva
      if(e.status===422&&intento<3)return guardar(cambio,fotosNuevas,mensaje,intento+1);
      throw e;
    });
  }

  // ---------- Conectar ----------
  function mostrar(paso){['paso-conectar','paso-lista','paso-editar'].forEach(function(p){$(p).hidden=p!==paso;});window.scrollTo(0,0);}
  function conectar(t,recordar){
    token=t.trim();
    if(!token){aviso('estado-conectar','error','Pegad la clave de acceso.');return;}
    $('btn-conectar').disabled=true;aviso('estado-conectar','info','Conectando…');
    gh('/user').then(function(u){
      $('usuario').textContent='Conectado como '+u.login;
      return leer();
    }).then(function(r){
      estado=r.datos;guardarClave(token,recordar);
      aviso('estado-conectar');aviso('estado-lista');
      pintarLista();mostrar('paso-lista');
    }).catch(function(e){
      aviso('estado-conectar','error',explicar(e));
      if(e.status===401)borrarClave();
    }).finally(function(){$('btn-conectar').disabled=false;});
  }
  $('btn-conectar').addEventListener('click',function(){conectar($('token').value,$('recordar').checked);});
  $('token').addEventListener('keydown',function(e){if(e.key==='Enter')conectar($('token').value,$('recordar').checked);});
  $('btn-salir').addEventListener('click',function(){borrarClave();token='';estado=null;$('token').value='';mostrar('paso-conectar');});
  $('btn-recargar').addEventListener('click',function(){
    aviso('estado-lista','info','Cargando…');
    leer().then(function(r){estado=r.datos;pintarLista();aviso('estado-lista');}).catch(function(e){aviso('estado-lista','error',explicar(e));});
  });

  // ---------- Lista ----------
  var ocupado=false;
  function nombreCat(id){var c=(estado.categorias||[]).filter(function(x){return x.id===id;})[0];return c?c.es:id||'Sin categoría';}
  function pintarLista(){
    var ul=$('lista-admin');ul.innerHTML='';
    if(!estado.productos.length)ul.appendChild(el('li','item-datos','Todavía no hay productos.'));
    estado.productos.forEach(function(p,i){
      var li=el('li','item'),f=el('div','item-foto');
      if(p.fotos&&p.fotos.length){var img=el('img');img.alt='';img.src=srcFoto(p.fotos[0]);img.onerror=function(){if(img.src.indexOf(RAW)<0)img.src=RAW+p.fotos[0];};f.appendChild(img);}
      else f.textContent=((p.es&&p.es.nombre)||'?').charAt(0);
      li.appendChild(f);
      var info=el('div');info.appendChild(el('div','item-nombre',(p.es&&p.es.nombre)||p.id));
      var d=el('div','item-datos');
      d.appendChild(el('span',null,nombreCat(p.categoria)));
      d.appendChild(el('span',null,typeof p.precio==='number'?euros(p.precio):'Sin precio'));
      if(p.tipo==='app')d.appendChild(el('span',null,'Aplicación'));
      else d.appendChild(el('span',p.wallapop?'ok-txt':'falta-txt',p.wallapop?'✓ Enlace de Wallapop':'Falta el enlace de Wallapop'));
      d.appendChild(el('span',null,(p.fotos||[]).length+' foto'+((p.fotos||[]).length===1?'':'s')));
      if(p.agotado)d.appendChild(el('span','falta-txt','Agotado'));
      info.appendChild(d);li.appendChild(info);
      var acc=el('div','item-acciones');
      function boton(txt,titulo,fn,dis,cls){var b=el('button',cls||'icono',txt);b.type='button';b.title=titulo;b.setAttribute('aria-label',titulo);b.disabled=!!dis||ocupado;b.addEventListener('click',fn);acc.appendChild(b);return b;}
      boton('↑','Subir',function(){mover(p.id,-1);},i===0);
      boton('↓','Bajar',function(){mover(p.id,1);},i===estado.productos.length-1);
      boton('Editar','Editar '+((p.es&&p.es.nombre)||''),function(){editar(p);},false,'btn btn-borde btn-peq');
      boton('Borrar','Borrar '+((p.es&&p.es.nombre)||''),function(){borrarProducto(p);},false,'btn btn-peligro btn-peq');
      li.appendChild(acc);ul.appendChild(li);
    });
  }
  function accionLista(cambio,mensaje,ok){
    ocupado=true;pintarLista();aviso('estado-lista','info','Guardando…');
    guardar(cambio,[],mensaje).then(function(){aviso('estado-lista','ok',ok);})
      .catch(function(e){aviso('estado-lista','error',explicar(e));})
      .finally(function(){ocupado=false;pintarLista();});
  }
  function mover(id,dir){
    accionLista(function(d){
      var i=d.productos.findIndex(function(x){return x.id===id;}),j=i+dir;
      if(i<0||j<0||j>=d.productos.length)return;
      var t=d.productos[i];d.productos[i]=d.productos[j];d.productos[j]=t;
    },'Tienda: cambia el orden de los productos','Orden guardado. La web se actualiza en uno o dos minutos.');
  }
  function borrarProducto(p){
    var n=(p.es&&p.es.nombre)||p.id;
    if(!confirm('¿Borrar «'+n+'» de la tienda? También se borrarán sus fotos.'))return;
    accionLista(function(d){d.productos=d.productos.filter(function(x){return x.id!==p.id;});},
      'Tienda: borra «'+n+'»','«'+n+'» se ha borrado. La web se actualiza en uno o dos minutos.');
  }

  // ---------- Editor ----------
  var actual=null,fotos=[],cambiado=false;
  $('btn-nuevo').addEventListener('click',function(){editar(null);});
  $('btn-cancelar').addEventListener('click',function(){
    if(cambiado&&!confirm('Hay cambios sin guardar. ¿Salir igualmente?'))return;
    cambiado=false;mostrar('paso-lista');
  });
  $('form-producto').addEventListener('input',function(){cambiado=true;});
  window.addEventListener('beforeunload',function(e){if(cambiado&&!$('paso-editar').hidden){e.preventDefault();e.returnValue='';}});
  $('f-tipo').addEventListener('change',tipoCambiado);
  function tipoCambiado(){var app=$('f-tipo').value==='app';$('campos-app').hidden=!app;$('campo-wallapop').hidden=app;}

  function editar(p){
    actual=p;cambiado=false;aviso('estado-editar');
    $('titulo-editar').textContent=p?'Editar «'+((p.es&&p.es.nombre)||p.id)+'»':'Nuevo producto';
    var sel=$('f-categoria');sel.innerHTML='';
    (estado.categorias||[]).forEach(function(c){var o=el('option',null,c.es);o.value=c.id;sel.appendChild(o);});
    p=p||{tipo:'material',es:{},ca:{},fotos:[]};
    var es=p.es||{},ca=p.ca||{};
    $('f-nombre-es').value=es.nombre||'';$('f-nombre-ca').value=ca.nombre||'';
    sel.value=p.categoria||(estado.categorias[0]&&estado.categorias[0].id)||'';
    $('f-tipo').value=p.tipo==='app'?'app':'material';tipoCambiado();
    $('f-precio').value=typeof p.precio==='number'?String(p.precio).replace('.',','):'';
    $('f-wallapop').value=p.wallapop||'';$('f-appstore').value=p.appStore||'';$('f-googleplay').value=p.googlePlay||'';
    $('f-agotado').checked=!!p.agotado;
    $('f-resumen-es').value=es.resumen||'';$('f-resumen-ca').value=ca.resumen||'';
    $('f-desc-es').value=(es.descripcion||[]).join('\n\n');$('f-desc-ca').value=(ca.descripcion||[]).join('\n\n');
    $('f-para-es').value=(es.paraQue||[]).join('\n');$('f-para-ca').value=(ca.paraQue||[]).join('\n');
    fotos=(p.fotos||[]).map(function(f){return {path:f};});
    pintarFotos();mostrar('paso-editar');
  }

  function pintarFotos(){
    var c=$('fotos');c.innerHTML='';
    fotos.forEach(function(f,i){
      var d=el('div','foto-admin'),img=el('img');img.alt='Foto '+(i+1);
      if(f.nueva)img.src=f.preview;
      else{img.src=srcFoto(f.path);img.onerror=function(){if(img.src.indexOf(RAW)<0)img.src=RAW+f.path;};}
      d.appendChild(img);
      if(f.nueva)d.appendChild(el('span','nueva','Nueva'));else if(i===0)d.appendChild(el('span','primera','Principal'));
      var a=el('div','acciones');
      function b(t,titulo,fn,dis){var x=el('button','icono',t);x.type='button';x.title=titulo;x.setAttribute('aria-label',titulo);x.disabled=!!dis;x.addEventListener('click',fn);a.appendChild(x);}
      b('←','Mover a la izquierda',function(){var t=fotos[i-1];fotos[i-1]=fotos[i];fotos[i]=t;cambiado=true;pintarFotos();},i===0);
      b('✕','Quitar foto',function(){fotos.splice(i,1);cambiado=true;pintarFotos();});
      b('→','Mover a la derecha',function(){var t=fotos[i+1];fotos[i+1]=fotos[i];fotos[i]=t;cambiado=true;pintarFotos();},i===fotos.length-1);
      d.appendChild(a);c.appendChild(d);
    });
    var s=el('label','subir');
    s.appendChild(el('span',null,'＋'));s.appendChild(el('span',null,'Añadir fotos'));
    var inp=el('input');inp.type='file';inp.accept='image/*';inp.multiple=true;
    inp.addEventListener('change',function(){anadirFotos(inp.files);});
    s.appendChild(inp);c.appendChild(s);
  }

  // Reduce cada foto a un máximo de 1200 px y la convierte a JPG
  function preparar(file){
    return new Promise(function(ok,ko){
      var url=URL.createObjectURL(file),img=new Image();
      img.onload=function(){
        var k=Math.min(1,LADO_MAX/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.round(img.naturalWidth*k),h=Math.round(img.naturalHeight*k);
        var cv=document.createElement('canvas');cv.width=w;cv.height=h;
        var cx=cv.getContext('2d');cx.fillStyle='#FFFFFF';cx.fillRect(0,0,w,h);cx.drawImage(img,0,0,w,h);
        URL.revokeObjectURL(url);
        cv.toBlob(function(bl){
          if(!bl){ko(new Error(file.name));return;}
          var fr=new FileReader();
          fr.onload=function(){ok({nueva:true,preview:URL.createObjectURL(bl),base64:String(fr.result).split(',')[1]});};
          fr.onerror=function(){ko(new Error(file.name));};
          fr.readAsDataURL(bl);
        },'image/jpeg',0.85);
      };
      img.onerror=function(){URL.revokeObjectURL(url);ko(new Error(file.name));};
      img.src=url;
    });
  }
  function anadirFotos(lista){
    var arr=Array.prototype.slice.call(lista||[]);if(!arr.length)return;
    aviso('estado-editar','info','Preparando '+arr.length+' foto'+(arr.length>1?'s':'')+'…');
    var fallos=[];
    arr.reduce(function(pr,f){return pr.then(function(){return preparar(f).then(function(x){fotos.push(x);cambiado=true;}).catch(function(){fallos.push(f.name);});});},Promise.resolve())
      .then(function(){
        pintarFotos();
        if(fallos.length)aviso('estado-editar','error','No se han podido leer estas fotos: '+fallos.join(', ')+'. Probad a guardarlas como JPG o PNG.');
        else aviso('estado-editar');
      });
  }

  function lineas(s){return (s||'').split('\n').map(function(x){return x.trim();}).filter(Boolean);}
  function parrafos(s){return (s||'').split(/\n\s*\n/).map(function(x){return x.replace(/\s*\n\s*/g,' ').trim();}).filter(Boolean);}

  $('form-producto').addEventListener('submit',function(e){
    e.preventDefault();
    var nombre=$('f-nombre-es').value.trim();
    if(!nombre){aviso('estado-editar','error','Falta el nombre en castellano.');$('f-nombre-es').focus();return;}
    var precio=null,pt=$('f-precio').value.trim().replace(/€/g,'').replace(/\s/g,'');
    if(pt){
      if(/,\d{1,2}$/.test(pt))pt=pt.replace(/\./g,'').replace(',','.');else pt=pt.replace(/,/g,'');
      precio=Number(pt);
      if(!isFinite(precio)||precio<0){aviso('estado-editar','error','El precio no es válido. Escribidlo así: 12,50');$('f-precio').focus();return;}
      precio=Math.round(precio*100)/100;
    }
    var tipo=$('f-tipo').value,wall=$('f-wallapop').value.trim(),aps=$('f-appstore').value.trim(),gp=$('f-googleplay').value.trim();
    var malos=[[wall,'Wallapop'],[aps,'App Store'],[gp,'Google Play']].filter(function(x){return x[0]&&!/^https?:\/\/\S+$/.test(x[0]);});
    if(malos.length){aviso('estado-editar','error','El enlace de '+malos[0][1]+' no es válido: tiene que empezar por https://');return;}
    if(tipo!=='app'&&wall&&!/wallapop/i.test(wall)&&!confirm('El enlace no parece de Wallapop. ¿Guardarlo igualmente?'))return;

    var id=actual?actual.id:slug(nombre);
    if(!actual){var base=id,n=2;while(estado.productos.some(function(x){return x.id===id;}))id=base+'-'+(n++);}
    var marca=Date.now().toString(36),nuevas=[];
    var lista=fotos.map(function(f,i){
      if(!f.nueva)return f.path;
      var path='img/tienda/'+id+'-'+marca+'-'+(i+1)+'.jpg';nuevas.push({path:path,base64:f.base64});return path;
    });
    var prod={id:id,categoria:$('f-categoria').value,tipo:tipo,fotos:lista,precio:precio,
      wallapop:wall,appStore:aps,googlePlay:gp,agotado:$('f-agotado').checked,
      es:{nombre:nombre,resumen:$('f-resumen-es').value.trim(),descripcion:parrafos($('f-desc-es').value),paraQue:lineas($('f-para-es').value)},
      ca:{nombre:$('f-nombre-ca').value.trim(),resumen:$('f-resumen-ca').value.trim(),descripcion:parrafos($('f-desc-ca').value),paraQue:lineas($('f-para-ca').value)}};
    var esNuevo=!actual;
    $('btn-guardar').disabled=true;$('btn-cancelar').disabled=true;
    aviso('estado-editar','info',nuevas.length?'Subiendo fotos y guardando…':'Guardando…');
    guardar(function(d){
      var i=d.productos.findIndex(function(x){return x.id===id;});
      if(i>=0)d.productos[i]=prod;
      else if(esNuevo)d.productos.push(prod);
      else throw new Error('Este producto se ha borrado mientras lo editabais.');
    },nuevas,(esNuevo?'Tienda: añade «':'Tienda: cambia «')+nombre+'»').then(function(){
      cambiado=false;pintarLista();mostrar('paso-lista');
      var st=$('estado-lista');st.hidden=false;st.className='estado ok';st.textContent='';
      st.appendChild(document.createTextNode('«'+nombre+'» guardado. La web se actualiza en uno o dos minutos: '));
      var a=el('a',null,'ver el producto');a.href='producto.html?id='+encodeURIComponent(id);a.target='_blank';a.rel='noopener';st.appendChild(a);
      st.appendChild(document.createTextNode('.'));
    }).catch(function(e){aviso('estado-editar','error',explicar(e));})
      .finally(function(){$('btn-guardar').disabled=false;$('btn-cancelar').disabled=false;});
  });

  // Si la clave está guardada en este dispositivo, se conecta sola
  var guardada=leerClave();
  if(guardada){$('token').value=guardada;conectar(guardada,(function(){try{return !!localStorage.getItem(CLAVE);}catch(e){return false;}})());}
})();
