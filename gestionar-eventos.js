// Página para gestionar los eventos (gestionar-eventos.html).
// Lee y guarda eventos.js y las fotos de img/eventos/ directamente en GitHub con la clave de acceso
// de quien la usa (la misma que la de la tienda). Cada vez que se guarda se hace un commit en la rama
// principal y GitHub Pages vuelve a publicar la web en uno o dos minutos.
(function(){
  var REPO='Nana-Asoc/WebNana',RAMA='main',API='https://api.github.com',CLAVE='nana-gh-token',LADO_MAX=1400;

  var CABECERA=[
    '// Eventos de N.A.N.A. Salen en eventos.html / esdeveniments.html y, el próximo, en la portada.',
    '//',
    '// La forma más fácil de cambiarlos es la página gestionar-eventos.html, que guarda este archivo y sube las fotos.',
    '// Si lo editas a mano, cada evento tiene:',
    '//   id:      nombre corto sin espacios ni acentos',
    '//   fecha:   AAAA-MM-DD (los de hoy en adelante salen como «Próximos»; los anteriores, como «Pasados»)',
    "//   hora:    texto libre, por ejemplo '17:00' o '10:00 a 13:00' (opcional)",
    '//   lugar:   texto libre (opcional)',
    '//   foto:    ruta de la foto en img/eventos/ (opcional)',
    '//   enlace:  publicación de Instagram o página con más información (opcional)',
    '//   es / ca: titulo y descripcion en castellano y en catalán (si falta el catalán, se usa el castellano)',
    ''].join('\n');

  // ---------- Utilidades ----------
  function $(id){return document.getElementById(id);}
  function el(tag,cls,t){var e=document.createElement(tag);if(cls)e.className=cls;if(t!=null)e.textContent=t;return e;}
  function aviso(id,tipo,texto){var p=$(id);p.hidden=!texto;p.className='estado '+(tipo||'info');p.textContent=texto||'';}
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'evento';}
  function b64aTexto(b){var bin=atob(b.replace(/\s/g,'')),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new TextDecoder('utf-8').decode(u);}
  function hoyISO(){var d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}
  function fechaBonita(f){var p=String(f).split('-');return new Date(+p[0],(+p[1]||1)-1,+p[2]||1).toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'long',year:'numeric'});}

  var token='',estado=null; // estado = {instagram, eventos}

  function guardarClave(t,recordar){try{localStorage.removeItem(CLAVE);sessionStorage.removeItem(CLAVE);(recordar?localStorage:sessionStorage).setItem(CLAVE,t);}catch(e){}}
  function leerClave(){try{return localStorage.getItem(CLAVE)||sessionStorage.getItem(CLAVE)||'';}catch(e){return '';}}
  function borrarClave(){try{localStorage.removeItem(CLAVE);sessionStorage.removeItem(CLAVE);}catch(e){}}

  // ---------- GitHub ----------
  function gh(ruta,metodo,cuerpo){
    var h={'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'};
    if(cuerpo)h['Content-Type']='application/json';
    return fetch(API+ruta,{method:metodo||'GET',headers:h,body:cuerpo?JSON.stringify(cuerpo):undefined,cache:'no-store'})
      .then(function(r){return r.text().then(function(t){
        var d=null;try{d=t?JSON.parse(t):null;}catch(e){}
        if(!r.ok){var e=new Error((d&&d.message)||('Error '+r.status));e.status=r.status;throw e;}
        return d;
      });});
  }
  function explicar(e){
    if(e.status===401)return 'La clave no es válida o ha caducado. Cread una nueva y volved a conectar.';
    if(e.status===403||e.status===404)return 'La clave no tiene permiso para el repositorio WebNana. Revisad que en «Resource owner» esté Nana-Asoc, que esté elegido WebNana y que «Contents» sea «Read and write». Detalle: '+e.message;
    if(e instanceof TypeError)return 'No hay conexión con GitHub. Comprobad la conexión a internet y probad de nuevo.';
    return 'Ha fallado algo: '+e.message;
  }

  function leer(){
    return gh('/repos/'+REPO+'/git/ref/heads/'+RAMA).then(function(ref){
      var commit=ref.object.sha;
      return gh('/repos/'+REPO+'/contents/eventos.js?ref='+commit).then(function(f){
        var texto=b64aTexto(f.content);
        var d=new Function(texto+'\n;return {instagram:typeof NANA_INSTAGRAM!=="undefined"?NANA_INSTAGRAM:"",eventos:typeof NANA_EVENTOS!=="undefined"?NANA_EVENTOS:[]};')();
        d.eventos=(d.eventos||[]).map(normalizar);
        return {commit:commit,datos:d};
      });
    });
  }
  // Acepta también el formato antiguo (imagen, es/ca como texto)
  function normalizar(e){
    function t(x){return typeof x==='string'?{titulo:x,descripcion:''}:{titulo:(x&&x.titulo)||'',descripcion:(x&&x.descripcion)||''};}
    return {id:e.id||slug(e.es&&e.es.titulo||e.es)+'-'+(e.fecha||''),fecha:e.fecha||'',hora:e.hora||'',lugar:e.lugar||'',foto:e.foto||e.imagen||'',enlace:e.enlace||'',es:t(e.es),ca:t(e.ca)};
  }
  function ordenar(lista){return lista.slice().sort(function(a,b){return a.fecha<b.fecha?1:a.fecha>b.fecha?-1:0;});}
  function serializar(d){
    var ev=ordenar(d.eventos).map(function(e){
      var o={id:e.id,fecha:e.fecha};
      if(e.hora)o.hora=e.hora;if(e.lugar)o.lugar=e.lugar;if(e.foto)o.foto=e.foto;if(e.enlace)o.enlace=e.enlace;
      o.es={titulo:e.es.titulo,descripcion:e.es.descripcion};o.ca={titulo:e.ca.titulo,descripcion:e.ca.descripcion};
      return o;
    });
    return CABECERA+"\n// Perfil de Instagram de la asociación. Si se deja vacío, no se muestra el botón «Síguenos».\nvar NANA_INSTAGRAM = "+JSON.stringify(d.instagram||'')+";\n\nvar NANA_EVENTOS = "+JSON.stringify(ev,null,2)+";\n";
  }
  function fotosDe(d){var s={};d.eventos.forEach(function(e){if(e.foto)s[e.foto]=1;});return s;}

  function guardar(cambio,fotoNueva,mensaje,intento){
    intento=intento||1;
    return leer().then(function(r){
      var antes=fotosDe(r.datos);cambio(r.datos);var despues=fotosDe(r.datos);
      var borrar=Object.keys(antes).filter(function(f){return !despues[f]&&f.indexOf('img/eventos/')===0;});
      return gh('/repos/'+REPO+'/git/commits/'+r.commit).then(function(c){
        var pasos=fotoNueva?gh('/repos/'+REPO+'/git/blobs','POST',{content:fotoNueva.base64,encoding:'base64'}).then(function(b){return [{path:fotoNueva.path,mode:'100644',type:'blob',sha:b.sha}];}):Promise.resolve([]);
        return pasos.then(function(entradas){
          entradas.push({path:'eventos.js',mode:'100644',type:'blob',content:serializar(r.datos)});
          borrar.forEach(function(f){entradas.push({path:f,mode:'100644',type:'blob',sha:null});});
          return gh('/repos/'+REPO+'/git/trees','POST',{base_tree:c.tree.sha,tree:entradas});
        }).then(function(arbol){
          return gh('/repos/'+REPO+'/git/commits','POST',{message:mensaje,tree:arbol.sha,parents:[r.commit]});
        }).then(function(nuevo){
          return gh('/repos/'+REPO+'/git/refs/heads/'+RAMA,'PATCH',{sha:nuevo.sha,force:false});
        }).then(function(){estado=r.datos;return r.datos;});
      });
    }).catch(function(e){
      if(e.status===422&&intento<3)return guardar(cambio,fotoNueva,mensaje,intento+1);
      throw e;
    });
  }

  // ---------- Pantallas ----------
  function mostrar(paso){['paso-conectar','paso-lista','paso-editar'].forEach(function(p){$(p).hidden=p!==paso;});window.scrollTo(0,0);}
  function conectar(t,recordar){
    token=t.trim();
    if(!token){aviso('estado-conectar','error','Pegad la clave de acceso.');return;}
    $('btn-conectar').disabled=true;aviso('estado-conectar','info','Conectando…');
    gh('/user').then(function(u){$('usuario').textContent='Conectado como '+u.login;return leer();})
      .then(function(r){estado=r.datos;guardarClave(token,recordar);aviso('estado-conectar');aviso('estado-lista');pintarLista();mostrar('paso-lista');})
      .catch(function(e){aviso('estado-conectar','error',explicar(e));if(e.status===401)borrarClave();})
      .finally(function(){$('btn-conectar').disabled=false;});
  }

  var ocupado=false;
  function pintarLista(){
    var hoy=hoyISO(),ul=$('lista-admin');ul.innerHTML='';
    $('f-instagram').value=estado.instagram||'';
    var lista=ordenar(estado.eventos);
    var prox=lista.filter(function(e){return e.fecha>=hoy;}).reverse(),pas=lista.filter(function(e){return e.fecha<hoy;});
    if(!lista.length){ul.appendChild(el('li','item-datos','Todavía no hay eventos. Pulsad «+ Añadir evento» para crear el primero.'));return;}
    function grupo(tit,arr){
      if(!arr.length)return;
      ul.appendChild(el('li','grupo-tit',tit));
      arr.forEach(function(e){
        var li=el('li','item'),f=el('div','item-foto');
        if(e.foto){var im=el('img');im.src=e.foto+'?v='+Date.now();im.alt='';f.appendChild(im);}else f.textContent=String(+e.fecha.slice(8,10)||'·');
        var info=el('div');info.appendChild(el('div','item-nombre',e.es.titulo||'(sin título)'));
        var datos=el('div','item-datos');datos.appendChild(el('span','',fechaBonita(e.fecha)+(e.hora?' · '+e.hora:'')));
        if(e.lugar)datos.appendChild(el('span','','📍 '+e.lugar));
        if(!e.ca.titulo)datos.appendChild(el('span','falta-txt','Falta el catalán'));
        info.appendChild(datos);
        var acc=el('div','item-acciones');
        function boton(txt,titulo,fn,cls){var b=el('button',cls||'icono',txt);b.type='button';b.title=titulo;b.setAttribute('aria-label',titulo);b.disabled=ocupado;b.addEventListener('click',fn);acc.appendChild(b);}
        boton('✎','Editar',function(){editar(e);});
        boton('⧉','Duplicar (por ejemplo, para un evento que se repite)',function(){var c=JSON.parse(JSON.stringify(e));c.id='';c.fecha='';editar(c,true);});
        boton('🗑','Borrar',function(){borrarEvento(e);});
        li.appendChild(f);li.appendChild(info);li.appendChild(acc);ul.appendChild(li);
      });
    }
    grupo('Próximos',prox);grupo('Pasados',pas);
  }

  function borrarEvento(e){
    if(!confirm('¿Borrar el evento «'+(e.es.titulo||'')+'»? No se puede deshacer.'))return;
    ocupado=true;pintarLista();aviso('estado-lista','info','Borrando…');
    guardar(function(d){d.eventos=d.eventos.filter(function(x){return x.id!==e.id;});},null,'Eventos: borrar «'+e.es.titulo+'»')
      .then(function(){aviso('estado-lista','ok','Evento borrado. La web se actualiza en uno o dos minutos.');})
      .catch(function(err){aviso('estado-lista','error',explicar(err));})
      .finally(function(){ocupado=false;pintarLista();});
  }

  // ---------- Editar ----------
  var actual=null,foto=null,cambiado=false; // foto = {path, preview, base64, nueva} o {path} o null
  function editar(e,copia){
    actual=e&&!copia?e:null;cambiado=!!copia;
    var x=e||{es:{},ca:{}};
    $('titulo-editar').textContent=actual?'Editar evento':'Nuevo evento';
    $('f-titulo-es').value=x.es.titulo||'';$('f-titulo-ca').value=x.ca.titulo||'';
    $('f-fecha').value=x.fecha||'';$('f-hora').value=x.hora||'';$('f-lugar').value=x.lugar||'';
    $('f-desc-es').value=x.es.descripcion||'';$('f-desc-ca').value=x.ca.descripcion||'';$('f-enlace').value=x.enlace||'';
    foto=x.foto?{path:x.foto,preview:x.foto}:null;
    pintarFoto();aviso('estado-editar');mostrar('paso-editar');$('f-titulo-es').focus();
  }
  function pintarFoto(){
    var c=$('foto');c.innerHTML='';
    if(foto){
      var d=el('div','foto-admin'),im=el('img');im.src=foto.preview;im.alt='';d.appendChild(im);
      if(foto.nueva)d.appendChild(el('span','nueva','Nueva'));
      var a=el('div','acciones'),b=el('button','icono','✕');b.type='button';b.title='Quitar la foto';b.setAttribute('aria-label','Quitar la foto');
      b.addEventListener('click',function(){foto=null;cambiado=true;pintarFoto();});a.appendChild(b);d.appendChild(a);c.appendChild(d);
    }
    var s=el('label','subir');s.appendChild(el('span','',foto?'Cambiar la foto':'+ Subir foto'));s.appendChild(el('small','','Desde el móvil o el ordenador'));
    var inp=el('input');inp.type='file';inp.accept='image/*';inp.addEventListener('change',function(){if(inp.files[0])subir(inp.files[0]);});
    s.appendChild(inp);c.appendChild(s);
  }
  function subir(file){
    aviso('estado-editar','info','Preparando la foto…');
    var url=URL.createObjectURL(file),img=new Image();
    img.onload=function(){
      var k=Math.min(1,LADO_MAX/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.round(img.naturalWidth*k),h=Math.round(img.naturalHeight*k);
      var cv=document.createElement('canvas');cv.width=w;cv.height=h;var cx=cv.getContext('2d');cx.fillStyle='#FFFFFF';cx.fillRect(0,0,w,h);cx.drawImage(img,0,0,w,h);
      URL.revokeObjectURL(url);
      cv.toBlob(function(bl){
        var fr=new FileReader();
        fr.onload=function(){foto={nueva:true,preview:URL.createObjectURL(bl),base64:String(fr.result).split(',')[1]};cambiado=true;pintarFoto();aviso('estado-editar');};
        fr.readAsDataURL(bl);
      },'image/jpeg',0.85);
    };
    img.onerror=function(){URL.revokeObjectURL(url);aviso('estado-editar','error','No se ha podido leer la foto. Probad con otra (JPG o PNG).');};
    img.src=url;
  }

  $('form-evento').addEventListener('submit',function(ev){
    ev.preventDefault();
    var tit=$('f-titulo-es').value.trim(),fecha=$('f-fecha').value;
    if(!tit){aviso('estado-editar','error','Poned el título en castellano.');$('f-titulo-es').focus();return;}
    if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha)){aviso('estado-editar','error','Poned la fecha del evento.');$('f-fecha').focus();return;}
    var enlace=$('f-enlace').value.trim();
    if(enlace&&!/^https?:\/\//.test(enlace))enlace='https://'+enlace;
    var id=actual?actual.id:slug(tit)+'-'+fecha;
    var e={id:id,fecha:fecha,hora:$('f-hora').value.trim(),lugar:$('f-lugar').value.trim(),foto:'',enlace:enlace,
      es:{titulo:tit,descripcion:$('f-desc-es').value.trim()},ca:{titulo:$('f-titulo-ca').value.trim(),descripcion:$('f-desc-ca').value.trim()}};
    var nueva=null;
    if(foto&&foto.nueva){e.foto='img/eventos/'+id+'-'+Date.now().toString(36)+'.jpg';nueva={path:e.foto,base64:foto.base64};}
    else if(foto)e.foto=foto.path;
    $('btn-guardar').disabled=true;aviso('estado-editar','info','Guardando y publicando…');
    guardar(function(d){
      var i=-1;d.eventos.forEach(function(x,k){if(x.id===id)i=k;});
      if(i>=0)d.eventos[i]=e;else{if(!actual&&d.eventos.some(function(x){return x.id===id;}))e.id=id+'-2';d.eventos.push(e);}
    },nueva,(actual?'Eventos: cambiar «':'Eventos: añadir «')+tit+'»')
      .then(function(){cambiado=false;aviso('estado-lista','ok','Guardado. La web se actualiza en uno o dos minutos.');pintarLista();mostrar('paso-lista');})
      .catch(function(err){aviso('estado-editar','error',explicar(err));})
      .finally(function(){$('btn-guardar').disabled=false;});
  });
  $('btn-cancelar').addEventListener('click',function(){if(cambiado&&!confirm('Hay cambios sin guardar. ¿Salir igualmente?'))return;cambiado=false;mostrar('paso-lista');});
  $('form-evento').addEventListener('input',function(){cambiado=true;});
  window.addEventListener('beforeunload',function(e){if(cambiado&&!$('paso-editar').hidden){e.preventDefault();e.returnValue='';}});

  $('btn-instagram').addEventListener('click',function(){
    var v=$('f-instagram').value.trim();if(v&&!/^https?:\/\//.test(v))v='https://'+v;
    $('btn-instagram').disabled=true;aviso('estado-lista','info','Guardando…');
    guardar(function(d){d.instagram=v;},null,'Eventos: perfil de Instagram')
      .then(function(){aviso('estado-lista','ok','Perfil de Instagram guardado.');pintarLista();})
      .catch(function(err){aviso('estado-lista','error',explicar(err));})
      .finally(function(){$('btn-instagram').disabled=false;});
  });

  $('btn-nuevo').addEventListener('click',function(){editar(null);});
  $('btn-conectar').addEventListener('click',function(){conectar($('token').value,$('recordar').checked);});
  $('token').addEventListener('keydown',function(e){if(e.key==='Enter')conectar($('token').value,$('recordar').checked);});
  $('btn-salir').addEventListener('click',function(){borrarClave();token='';estado=null;$('token').value='';mostrar('paso-conectar');});
  $('btn-recargar').addEventListener('click',function(){
    aviso('estado-lista','info','Recargando…');
    leer().then(function(r){estado=r.datos;aviso('estado-lista');pintarLista();}).catch(function(e){aviso('estado-lista','error',explicar(e));});
  });

  var guardada=leerClave();
  if(guardada){$('token').value=guardada;conectar(guardada,!!(function(){try{return localStorage.getItem(CLAVE);}catch(e){return null;}})());}
})();
