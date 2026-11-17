// Eventos de N.A.N.A. Salen en eventos.html / esdeveniments.html y, el próximo, en la portada.
//
// La forma más fácil de cambiarlos es la página gestionar-eventos.html, que guarda este archivo y sube las fotos.
// Si lo editas a mano, cada evento tiene:
//   id:      nombre corto sin espacios ni acentos
//   fecha:   AAAA-MM-DD (los de hoy en adelante salen como «Próximos»; los anteriores, como «Pasados»)
//   hora:    texto libre, por ejemplo '17:00' o '10:00 a 13:00' (opcional)
//   lugar:   texto libre (opcional)
//   foto:    ruta de la foto en img/eventos/ (opcional)
//   enlace:  publicación de Instagram o página con más información (opcional)
//   es / ca: titulo y descripcion en castellano y en catalán (si falta el catalán, se usa el castellano)

// Perfil de Instagram de la asociación. Si se deja vacío, no se muestra el botón «Síguenos».
var NANA_INSTAGRAM = "https://www.instagram.com/nuclinana/";

var NANA_EVENTOS = [];
