// Protección básica de N.A.N.A.: impide que otra web muestre estas páginas dentro de un marco
// (clickjacking). Si la página está dentro de un marco, se oculta y se intenta abrir a pantalla completa.
(function(){
  if(window.top!==window.self){
    document.documentElement.style.display='none';
    try{window.top.location.replace(window.self.location.href);}catch(e){}
  }
})();
