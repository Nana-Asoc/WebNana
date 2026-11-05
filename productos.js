// Productos de la tienda de N.A.N.A. (salen en tienda.html y botiga.html).
//
// Para añadir o cambiar un producto:
//   1. Guarda la foto en la carpeta img/tienda/ (mejor cuadrada, unos 800 × 800 px).
//   2. Copia uno de los bloques de abajo y rellénalo. Se muestran en el orden de la lista.
//
//   id:      nombre corto sin espacios ni acentos (no lo cambies una vez publicado)
//   tipo:    'material' (se puede pedir desde la web) o 'app' (enlaza a las tiendas de apps)
//   imagen:  ruta de la foto; si se deja vacía, sale un dibujo genérico
//   precio:  en euros, con punto para los decimales (por ejemplo 12.5).
//            Si se deja en null, el producto sale como «Próximamente» y no se puede pedir.
//   agotado: true si no queda stock (sale «Agotado» y no se puede pedir)
//   es / ca: nombre y descripción en castellano y en catalán
//   appStore / googlePlay: solo para las apps; enlaces a las tiendas (vacío = «Próximamente»)

var NANA_PRODUCTOS = [
  {
    id: 'volumen-seguro',
    tipo: 'app',
    imagen: '',
    appStore: '',
    googlePlay: '',
    es: { nombre: 'Volumen Seguro', categoria: 'Aplicación', descripcion: 'App que avisa cuando el volumen de los auriculares es demasiado alto, para proteger los oídos de niños y niñas con hipersensibilidad auditiva.' },
    ca: { nombre: 'Volum Segur', categoria: 'Aplicació', descripcion: 'App que avisa quan el volum dels auriculars és massa alt, per protegir les orelles de nens i nenes amb hipersensibilitat auditiva.' }
  },
  {
    id: 'cartas-emociones',
    tipo: 'material',
    imagen: '',
    precio: null,
    es: { nombre: 'Cartas de las emociones', categoria: 'Aprender', descripcion: 'Baraja con pictogramas para reconocer, nombrar y hablar de las emociones en casa y en la escuela.' },
    ca: { nombre: 'Cartes de les emocions', categoria: 'Aprendre', descripcion: 'Baralla amb pictogrames per reconèixer, anomenar i parlar de les emocions a casa i a l’escola.' }
  },
  {
    id: 'pelotas-sensoriales',
    tipo: 'material',
    imagen: '',
    precio: null,
    es: { nombre: 'Pelotas sensoriales', categoria: 'Regulación sensorial', descripcion: 'Pelotas con distintas texturas para calmarse, concentrarse y explorar el tacto.' },
    ca: { nombre: 'Pilotes sensorials', categoria: 'Regulació sensorial', descripcion: 'Pilotes amb diferents textures per calmar-se, concentrar-se i explorar el tacte.' }
  }
];
