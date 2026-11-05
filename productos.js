// Productos de la tienda de N.A.N.A. (salen en la tienda y en la página de cada producto, en castellano y en catalán).
//
// Para añadir un producto:
//   1. Guarda las fotos en la carpeta img/tienda/ (mejor cuadradas, unos 1000 × 1000 px).
//      La primera foto de la lista es la que sale primero en la tienda.
//   2. Copia uno de los bloques de abajo y rellénalo. Se muestran en el orden de la lista.
//
//   id:         nombre corto sin espacios ni acentos; sale en la dirección de la página del producto
//               (no lo cambies una vez publicado)
//   categoria:  una de las de NANA_CATEGORIAS (más abajo)
//   tipo:       'material' o 'app'
//   fotos:      lista de fotos; si se deja vacía, sale un dibujo de la categoría
//   precio:     en euros, con punto para los decimales (por ejemplo 12.5). Si es null, sale «Próximamente»
//   wallapop:   enlace al anuncio en Wallapop (en la app: «Compartir» → «Copiar enlace»)
//   appStore / googlePlay: solo para las apps
//   agotado:    true si no queda stock
//   es / ca:    textos en castellano y en catalán
//      nombre:      nombre del producto
//      resumen:     una frase; sale en la tienda debajo del nombre
//      descripcion: párrafos de la página del producto
//      paraQue:     lista «Para qué sirve» de la página del producto

// Categorías. icono: app, corazon, ondas o reloj. color: fondo del dibujo cuando no hay foto.
var NANA_CATEGORIAS = [
  { id: 'apps',      icono: 'app',     color: '#DCE9F1', es: 'Aplicaciones',             ca: 'Aplicacions' },
  { id: 'emociones', icono: 'corazon', color: '#FCE7DF', es: 'Emociones y comunicación', ca: 'Emocions i comunicació' },
  { id: 'sensorial', icono: 'ondas',   color: '#E3F6F4', es: 'Sensorial y calma',        ca: 'Sensorial i calma' },
  { id: 'rutinas',   icono: 'reloj',   color: '#FFF3D6', es: 'Rutinas y organización',   ca: 'Rutines i organització' }
];

var NANA_PRODUCTOS = [
  {
    id: 'volumen-seguro',
    categoria: 'apps',
    tipo: 'app',
    fotos: [],
    precio: null,
    appStore: '',
    googlePlay: '',
    es: {
      nombre: 'Volumen Seguro',
      resumen: 'App que avisa cuando el volumen de los auriculares es demasiado alto.',
      descripcion: [
        'Volumen Seguro es una aplicación que estamos desarrollando desde N.A.N.A. para proteger los oídos de niños y niñas con hipersensibilidad auditiva.',
        'Vigila el volumen de los auriculares y avisa de forma clara y tranquila cuando está demasiado alto, para que aprendan a regularlo sin depender siempre de un adulto.'
      ],
      paraQue: ['Cuidar la audición en el día a día', 'Fomentar la autonomía con avisos visuales', 'Dar tranquilidad a las familias']
    },
    ca: {
      nombre: 'Volum Segur',
      resumen: 'App que avisa quan el volum dels auriculars és massa alt.',
      descripcion: [
        'Volum Segur és una aplicació que estem desenvolupant des de N.A.N.A. per protegir les orelles de nens i nenes amb hipersensibilitat auditiva.',
        'Vigila el volum dels auriculars i avisa de manera clara i tranquil·la quan és massa alt, perquè aprenguin a regular-lo sense dependre sempre d’un adult.'
      ],
      paraQue: ['Tenir cura de l’oïda en el dia a dia', 'Fomentar l’autonomia amb avisos visuals', 'Donar tranquil·litat a les famílies']
    }
  },
  {
    id: 'cartas-emociones',
    categoria: 'emociones',
    tipo: 'material',
    fotos: [],
    precio: null,
    wallapop: '',
    es: {
      nombre: 'Cartas de las emociones',
      resumen: 'Baraja con pictogramas para reconocer y nombrar las emociones.',
      descripcion: [
        'Una baraja pensada para trabajar las emociones de forma visual: cada carta muestra una emoción con un pictograma claro y su nombre.',
        'Se puede usar como juego, para hablar de cómo ha ido el día o como apoyo cuando cuesta explicar lo que se siente.'
      ],
      paraQue: ['Reconocer emociones en uno mismo y en los demás', 'Ampliar el vocabulario emocional', 'Usar en casa, en terapia o en la escuela']
    },
    ca: {
      nombre: 'Cartes de les emocions',
      resumen: 'Baralla amb pictogrames per reconèixer i anomenar les emocions.',
      descripcion: [
        'Una baralla pensada per treballar les emocions de manera visual: cada carta mostra una emoció amb un pictograma clar i el seu nom.',
        'Es pot fer servir com a joc, per parlar de com ha anat el dia o com a suport quan costa explicar el que se sent.'
      ],
      paraQue: ['Reconèixer emocions en un mateix i en els altres', 'Ampliar el vocabulari emocional', 'Fer-les servir a casa, a teràpia o a l’escola']
    }
  },
  {
    id: 'pelotas-sensoriales',
    categoria: 'sensorial',
    tipo: 'material',
    fotos: [],
    precio: null,
    wallapop: '',
    es: {
      nombre: 'Pelotas sensoriales',
      resumen: 'Pelotas con distintas texturas para calmarse y concentrarse.',
      descripcion: [
        'Un conjunto de pelotas con texturas diferentes para explorar el tacto y ayudar a regularse.',
        'Caben en la mano o en la mochila, así que se pueden llevar a la escuela, al médico o de viaje.'
      ],
      paraQue: ['Calmarse en momentos de nervios', 'Mantener la atención en clase o en casa', 'Explorar texturas y estímulos táctiles']
    },
    ca: {
      nombre: 'Pilotes sensorials',
      resumen: 'Pilotes amb diferents textures per calmar-se i concentrar-se.',
      descripcion: [
        'Un conjunt de pilotes amb textures diferents per explorar el tacte i ajudar a regular-se.',
        'Caben a la mà o a la motxilla, així que es poden portar a l’escola, al metge o de viatge.'
      ],
      paraQue: ['Calmar-se en moments de nervis', 'Mantenir l’atenció a classe o a casa', 'Explorar textures i estímuls tàctils']
    }
  },
  {
    id: 'agenda-visual',
    categoria: 'rutinas',
    tipo: 'material',
    fotos: [],
    precio: null,
    wallapop: '',
    es: {
      nombre: 'Agenda visual con pictogramas',
      resumen: 'Para anticipar el día paso a paso con imágenes.',
      descripcion: [
        'Una agenda para colocar los pictogramas de las actividades del día en orden, de forma que el niño o la niña sepa qué viene después.',
        'Anticipar los cambios reduce la ansiedad y ayuda a vivir las rutinas con más tranquilidad.'
      ],
      paraQue: ['Anticipar las actividades del día', 'Preparar cambios de rutina', 'Ganar autonomía en tareas como vestirse o lavarse']
    },
    ca: {
      nombre: 'Agenda visual amb pictogrames',
      resumen: 'Per anticipar el dia pas a pas amb imatges.',
      descripcion: [
        'Una agenda per col·locar els pictogrames de les activitats del dia en ordre, de manera que el nen o la nena sàpiga què ve després.',
        'Anticipar els canvis redueix l’ansietat i ajuda a viure les rutines amb més tranquil·litat.'
      ],
      paraQue: ['Anticipar les activitats del dia', 'Preparar canvis de rutina', 'Guanyar autonomia en tasques com vestir-se o rentar-se']
    }
  },
  {
    id: 'auriculares-antirruido',
    categoria: 'sensorial',
    tipo: 'material',
    fotos: [],
    precio: null,
    wallapop: '',
    es: {
      nombre: 'Auriculares antirruido',
      resumen: 'Reducen el ruido en sitios con mucho jaleo.',
      descripcion: [
        'Auriculares de protección auditiva de talla infantil para lugares ruidosos: fiestas, comedores, centros comerciales o la calle.',
        'Ayudan a evitar la sobrecarga sensorial y hacen más llevaderas las salidas.'
      ],
      paraQue: ['Prevenir la sobrecarga por ruido', 'Acompañar en salidas y celebraciones', 'Descansar del ruido cuando hace falta']
    },
    ca: {
      nombre: 'Auriculars antisoroll',
      resumen: 'Redueixen el soroll en llocs amb molt enrenou.',
      descripcion: [
        'Auriculars de protecció auditiva de talla infantil per a llocs sorollosos: festes, menjadors, centres comercials o el carrer.',
        'Ajuden a evitar la sobrecàrrega sensorial i fan més suportables les sortides.'
      ],
      paraQue: ['Prevenir la sobrecàrrega per soroll', 'Acompanyar en sortides i celebracions', 'Descansar del soroll quan cal']
    }
  },
  {
    id: 'temporizador-visual',
    categoria: 'rutinas',
    tipo: 'material',
    fotos: [],
    precio: null,
    wallapop: '',
    es: {
      nombre: 'Temporizador visual',
      resumen: 'Muestra con colores cuánto tiempo queda.',
      descripcion: [
        'Un reloj que muestra el tiempo que queda con un disco de color que se va haciendo pequeño, sin necesidad de saber leer la hora.',
        'Facilita las transiciones entre actividades: se ve cuándo se acaba el juego o cuánto falta para salir.'
      ],
      paraQue: ['Hacer visible el paso del tiempo', 'Facilitar las transiciones entre actividades', 'Organizar deberes, juego y descansos']
    },
    ca: {
      nombre: 'Temporitzador visual',
      resumen: 'Mostra amb colors quant de temps queda.',
      descripcion: [
        'Un rellotge que mostra el temps que queda amb un disc de color que es va fent petit, sense necessitat de saber llegir l’hora.',
        'Facilita les transicions entre activitats: es veu quan s’acaba el joc o quant falta per sortir.'
      ],
      paraQue: ['Fer visible el pas del temps', 'Facilitar les transicions entre activitats', 'Organitzar deures, joc i descansos']
    }
  }
];
