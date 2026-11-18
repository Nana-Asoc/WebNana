// Productos de la tienda de N.A.N.A. (salen en tienda.html / botiga.html y en producto.html / producte.html).
//
// La forma más fácil de cambiarlos es la página gestionar.html, que guarda este archivo y sube las fotos.
// Si lo editas a mano: cada producto tiene
//   id:         nombre corto sin espacios ni acentos; sale en la dirección de la página del producto
//   categoria:  una de las de NANA_CATEGORIAS
//   tipo:       "material" (se vende en Wallapop), "app" o "herramienta" (herramienta online, con enlace web)
//   fotos:      lista de fotos (la primera sale primero); vacía = dibujo de la categoría
//   precio:     en euros con punto decimal (12.5); null = «Próximamente»
//   wallapop:   enlace al anuncio en Wallapop
//   web:        solo para las herramientas online: dirección https:// o página de esta web (p. ej. juegos/mis-viajes/)
//   appStore / googlePlay: solo para las apps
//   agotado:    true si no queda stock
//   es / ca:    nombre, resumen, descripcion (párrafos) y paraQue (lista) en castellano y en catalán
//
// Categorías: icono = app, corazon, ondas, reloj o juego; color = fondo del dibujo cuando no hay foto.
// Las herramientas de la categoría «juegos» salen como «Juego web» y con el botón «Jugar ahora».

var NANA_CATEGORIAS = [
  {
    "id": "apps",
    "icono": "app",
    "color": "#DCE9F1",
    "es": "Aplicaciones",
    "ca": "Aplicacions"
  },
  {
    "id": "emociones",
    "icono": "corazon",
    "color": "#FCE7DF",
    "es": "Emociones y comunicación",
    "ca": "Emocions i comunicació"
  },
  {
    "id": "sensorial",
    "icono": "ondas",
    "color": "#E3F6F4",
    "es": "Sensorial y calma",
    "ca": "Sensorial i calma"
  },
  {
    "id": "rutinas",
    "icono": "reloj",
    "color": "#FFF3D6",
    "es": "Rutinas y organización",
    "ca": "Rutines i organització"
  },
  {
    "id": "juegos",
    "icono": "juego",
    "color": "#E6F0F6",
    "es": "Juegos",
    "ca": "Jocs"
  }
];

var NANA_PRODUCTOS = [
  {
    "id": "mis-viajes",
    "categoria": "juegos",
    "tipo": "herramienta",
    "fotos": [
      "img/tienda/mis-viajes-portada.jpg",
      "img/tienda/mis-viajes-1.jpg",
      "img/tienda/mis-viajes-2.jpg",
      "img/tienda/mis-viajes-3.jpg",
      "img/tienda/mis-viajes-4.jpg",
      "img/tienda/mis-viajes-5.jpg"
    ],
    "precio": null,
    "web": "juegos/mis-viajes/",
    "es": {
      "nombre": "Mis Viajes",
      "resumen": "Juego web gratuito: agenda visual con pictogramas, viaje en calma y juegos tranquilos.",
      "descripcion": [
        "Mis Viajes es un juego web que hemos creado desde N.A.N.A. para niños y niñas con autismo y sus familias. Funciona en el móvil, la tablet y el ordenador, sin instalar nada, sin anuncios y sin registro.",
        "El niño o la niña elige en qué viajar (tren, coche, barco o avión) y encuentra cuatro estaciones: «El tren de mi día», una agenda visual con pictogramas de ARASAAC para anticipar lo que va a pasar; el «Viaje en calma», con paisajes de cada estación del año, música suave y respiración guiada; y dos juegos tranquilos para clasificar cosas y colores.",
        "Las familias pueden preparar el día escribiéndolo con sus palabras («nos levantamos, desayunamos y vamos al cole…») y los pictogramas aparecen solos. Todo se guarda solo en el dispositivo."
      ],
      "paraQue": [
        "Anticipar el día paso a paso con pictogramas",
        "Bajar el nivel de nervios con el viaje en calma y la respiración",
        "Practicar clasificar y reconocer colores sin presión",
        "Preparar la agenda en un minuto escribiendo el día"
      ]
    },
    "ca": {
      "nombre": "Els meus viatges",
      "resumen": "Joc web gratuït: agenda visual amb pictogrames, viatge en calma i jocs tranquils.",
      "descripcion": [
        "Mis Viajes (Els meus viatges) és un joc web que hem creat des de N.A.N.A. per a nens i nenes amb autisme i les seves famílies. Funciona al mòbil, a la tauleta i a l’ordinador, sense instal·lar res, sense anuncis i sense registre.",
        "El nen o la nena tria en què viatjar (tren, cotxe, vaixell o avió) i troba quatre estacions: una agenda visual amb pictogrames d’ARASAAC per anticipar què passarà, el viatge en calma amb paisatges de cada estació de l’any, música suau i respiració guiada, i dos jocs tranquils per classificar coses i colors.",
        "Les famílies poden preparar el dia escrivint-lo amb les seves paraules i els pictogrames apareixen sols. El joc, de moment, està en castellà. Tot es desa només al dispositiu."
      ],
      "paraQue": [
        "Anticipar el dia pas a pas amb pictogrames",
        "Rebaixar els nervis amb el viatge en calma i la respiració",
        "Practicar a classificar i reconèixer colors sense pressió",
        "Preparar l’agenda en un minut escrivint el dia"
      ]
    }
  },
  {
    "id": "juegos-movimiento",
    "categoria": "juegos",
    "tipo": "herramienta",
    "fotos": [
      "img/tienda/juegos-movimiento-portada.jpg",
      "img/tienda/juegos-movimiento-1.jpg",
      "img/tienda/juegos-movimiento-2.jpg"
    ],
    "precio": null,
    "web": "https://kentogd.github.io/Dancewithyou/",
    "es": {
      "nombre": "Juegos de Movimiento",
      "resumen": "Juego web gratuito: tres juegos para moverse delante de la cámara con las manos y el cuerpo.",
      "descripcion": [
        "Juegos de Movimiento son tres juegos para jugar moviéndose delante de la cámara del móvil, la tablet o el ordenador, sin instalar nada, sin anuncios y sin registro.",
        "En «Rompe Muñecos» se rompen con la mano abierta los muñecos que caen y, con el puño cerrado, rebotan. En «Machaca Topos» salen topos por los bordes de la pantalla y se machacan con las manos y los pies; se puede jugar de uno o de dos. En «Lee y Atrapa» aparece una palabra y hay que tocar el dibujo que corresponde, sin tiempo ni puntos, con listas de palabras propias.",
        "La cámara no graba nada: la imagen se analiza en tiempo real solo en el dispositivo, no se guarda ni se envía a ningún servidor, y se apaga al volver al menú."
      ],
      "paraQue": [
        "Moverse y descargar energía jugando",
        "Trabajar la coordinación ojo-mano",
        "Practicar la lectura de palabras con dibujos, sin presión",
        "Jugar en familia, de uno o de dos"
      ]
    },
    "ca": {
      "nombre": "Jocs de Moviment",
      "resumen": "Joc web gratuït: tres jocs per moure’s davant de la càmera amb les mans i el cos.",
      "descripcion": [
        "Jocs de Moviment són tres jocs per jugar movent-se davant de la càmera del mòbil, la tauleta o l’ordinador, sense instal·lar res, sense anuncis i sense registre.",
        "A «Rompe Muñecos» es trenquen amb la mà oberta els ninots que cauen i, amb el puny tancat, reboten. A «Machaca Topos» surten talps per les vores de la pantalla i s’aixafen amb les mans i els peus; s’hi pot jugar d’un o de dos. A «Lee y Atrapa» apareix una paraula i cal tocar el dibuix que hi correspon, sense temps ni punts, amb llistes de paraules pròpies. El joc, de moment, està en castellà.",
        "La càmera no grava res: la imatge s’analitza en temps real només al dispositiu, no es desa ni s’envia a cap servidor, i s’apaga en tornar al menú."
      ],
      "paraQue": [
        "Moure’s i descarregar energia jugant",
        "Treballar la coordinació ull-mà",
        "Practicar la lectura de paraules amb dibuixos, sense pressió",
        "Jugar en família, d’un o de dos"
      ]
    }
  },
  {
    "id": "volumen-seguro",
    "categoria": "apps",
    "tipo": "app",
    "fotos": [],
    "precio": null,
    "appStore": "",
    "googlePlay": "",
    "es": {
      "nombre": "Volumen Seguro",
      "resumen": "App para controlar el volumen de los auriculares.",
      "descripcion": [
        "Volumen Seguro es una aplicación que estamos desarrollando desde N.A.N.A. para proteger los oídos de niños y niñas con hipersensibilidad auditiva.",
        "Vigila el volumen de los auriculares y avisa de forma clara y tranquila cuando está demasiado alto, para que aprendan a regularlo sin depender siempre de un adulto."
      ],
      "paraQue": [
        "Cuidar la audición en el día a día",
        "Fomentar la autonomía con avisos visuales",
        "Dar tranquilidad a las familias"
      ]
    },
    "ca": {
      "nombre": "Volum Segur",
      "resumen": "App controla el volum dels auriculars.",
      "descripcion": [
        "Volum Segur és una aplicació que estem desenvolupant des de N.A.N.A. per protegir les orelles de nens i nenes amb hipersensibilitat auditiva.",
        "Vigila el volum dels auriculars i avisa de manera clara i tranquil·la quan és massa alt, perquè aprenguin a regular-lo sense dependre sempre d’un adult."
      ],
      "paraQue": [
        "Tenir cura de l’oïda en el dia a dia",
        "Fomentar l’autonomia amb avisos visuals",
        "Donar tranquil·litat a les famílies"
      ]
    }
  },
  {
    "id": "cartas-emociones",
    "categoria": "emociones",
    "tipo": "material",
    "fotos": [],
    "precio": null,
    "wallapop": "",
    "es": {
      "nombre": "Cartas de las emociones",
      "resumen": "Baraja con pictogramas para reconocer y nombrar las emociones.",
      "descripcion": [
        "Una baraja pensada para trabajar las emociones de forma visual: cada carta muestra una emoción con un pictograma claro y su nombre.",
        "Se puede usar como juego, para hablar de cómo ha ido el día o como apoyo cuando cuesta explicar lo que se siente."
      ],
      "paraQue": [
        "Reconocer emociones en uno mismo y en los demás",
        "Ampliar el vocabulario emocional",
        "Usar en casa, en terapia o en la escuela"
      ]
    },
    "ca": {
      "nombre": "Cartes de les emocions",
      "resumen": "Baralla amb pictogrames per reconèixer i anomenar les emocions.",
      "descripcion": [
        "Una baralla pensada per treballar les emocions de manera visual: cada carta mostra una emoció amb un pictograma clar i el seu nom.",
        "Es pot fer servir com a joc, per parlar de com ha anat el dia o com a suport quan costa explicar el que se sent."
      ],
      "paraQue": [
        "Reconèixer emocions en un mateix i en els altres",
        "Ampliar el vocabulari emocional",
        "Fer-les servir a casa, a teràpia o a l’escola"
      ]
    }
  },
  {
    "id": "pelotas-sensoriales",
    "categoria": "sensorial",
    "tipo": "material",
    "fotos": [],
    "precio": null,
    "wallapop": "",
    "es": {
      "nombre": "Pelotas sensoriales",
      "resumen": "Pelotas con distintas texturas para calmarse y concentrarse.",
      "descripcion": [
        "Un conjunto de pelotas con texturas diferentes para explorar el tacto y ayudar a regularse.",
        "Caben en la mano o en la mochila, así que se pueden llevar a la escuela, al médico o de viaje."
      ],
      "paraQue": [
        "Calmarse en momentos de nervios",
        "Mantener la atención en clase o en casa",
        "Explorar texturas y estímulos táctiles"
      ]
    },
    "ca": {
      "nombre": "Pilotes sensorials",
      "resumen": "Pilotes amb diferents textures per calmar-se i concentrar-se.",
      "descripcion": [
        "Un conjunt de pilotes amb textures diferents per explorar el tacte i ajudar a regular-se.",
        "Caben a la mà o a la motxilla, així que es poden portar a l’escola, al metge o de viatge."
      ],
      "paraQue": [
        "Calmar-se en moments de nervis",
        "Mantenir l’atenció a classe o a casa",
        "Explorar textures i estímuls tàctils"
      ]
    }
  },
  {
    "id": "agenda-visual",
    "categoria": "rutinas",
    "tipo": "material",
    "fotos": [],
    "precio": null,
    "wallapop": "",
    "es": {
      "nombre": "Agenda visual con pictogramas",
      "resumen": "Para anticipar el día paso a paso con imágenes.",
      "descripcion": [
        "Una agenda para colocar los pictogramas de las actividades del día en orden, de forma que el niño o la niña sepa qué viene después.",
        "Anticipar los cambios reduce la ansiedad y ayuda a vivir las rutinas con más tranquilidad."
      ],
      "paraQue": [
        "Anticipar las actividades del día",
        "Preparar cambios de rutina",
        "Ganar autonomía en tareas como vestirse o lavarse"
      ]
    },
    "ca": {
      "nombre": "Agenda visual amb pictogrames",
      "resumen": "Per anticipar el dia pas a pas amb imatges.",
      "descripcion": [
        "Una agenda per col·locar els pictogrames de les activitats del dia en ordre, de manera que el nen o la nena sàpiga què ve després.",
        "Anticipar els canvis redueix l’ansietat i ajuda a viure les rutines amb més tranquil·litat."
      ],
      "paraQue": [
        "Anticipar les activitats del dia",
        "Preparar canvis de rutina",
        "Guanyar autonomia en tasques com vestir-se o rentar-se"
      ]
    }
  },
  {
    "id": "auriculares-antirruido",
    "categoria": "sensorial",
    "tipo": "material",
    "fotos": [],
    "precio": null,
    "wallapop": "",
    "es": {
      "nombre": "Auriculares antirruido",
      "resumen": "Reducen el ruido en sitios con mucho jaleo.",
      "descripcion": [
        "Auriculares de protección auditiva de talla infantil para lugares ruidosos: fiestas, comedores, centros comerciales o la calle.",
        "Ayudan a evitar la sobrecarga sensorial y hacen más llevaderas las salidas."
      ],
      "paraQue": [
        "Prevenir la sobrecarga por ruido",
        "Acompañar en salidas y celebraciones",
        "Descansar del ruido cuando hace falta"
      ]
    },
    "ca": {
      "nombre": "Auriculars antisoroll",
      "resumen": "Redueixen el soroll en llocs amb molt enrenou.",
      "descripcion": [
        "Auriculars de protecció auditiva de talla infantil per a llocs sorollosos: festes, menjadors, centres comercials o el carrer.",
        "Ajuden a evitar la sobrecàrrega sensorial i fan més suportables les sortides."
      ],
      "paraQue": [
        "Prevenir la sobrecàrrega per soroll",
        "Acompanyar en sortides i celebracions",
        "Descansar del soroll quan cal"
      ]
    }
  },
  {
    "id": "temporizador-visual",
    "categoria": "rutinas",
    "tipo": "material",
    "fotos": [],
    "precio": null,
    "wallapop": "",
    "es": {
      "nombre": "Temporizador visual",
      "resumen": "Muestra con colores cuánto tiempo queda.",
      "descripcion": [
        "Un reloj que muestra el tiempo que queda con un disco de color que se va haciendo pequeño, sin necesidad de saber leer la hora.",
        "Facilita las transiciones entre actividades: se ve cuándo se acaba el juego o cuánto falta para salir."
      ],
      "paraQue": [
        "Hacer visible el paso del tiempo",
        "Facilitar las transiciones entre actividades",
        "Organizar deberes, juego y descansos"
      ]
    },
    "ca": {
      "nombre": "Temporitzador visual",
      "resumen": "Mostra amb colors quant de temps queda.",
      "descripcion": [
        "Un rellotge que mostra el temps que queda amb un disc de color que es va fent petit, sense necessitat de saber llegir l’hora.",
        "Facilita les transicions entre activitats: es veu quan s’acaba el joc o quant falta per sortir."
      ],
      "paraQue": [
        "Fer visible el pas del temps",
        "Facilitar les transicions entre activitats",
        "Organitzar deures, joc i descansos"
      ]
    }
  }
];
