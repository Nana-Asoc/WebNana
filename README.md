# web Nana

Web de N.A.N.A. – Núcleo de Acompañamiento y Necesidades del Autismo y familias neurodivergentes (Sant Boi de Llobregat).

## Dominio

La web se publica con GitHub Pages (rama `main`, carpeta raíz) en **https://webnana.org**. El archivo `CNAME` guarda ese dominio: no lo borréis. La dirección antigua, `nana-asoc.github.io/WebNana/`, redirige sola a la nueva, así que los enlaces y el código QR antiguos siguen funcionando.

Los dominios están registrados en Nominalia: `webnana.org`, que es el principal, y `webnana.es` y `webnana.cat`, que redirigen a él. Registros DNS de `webnana.org` en Nominalia:

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `nana-asoc.github.io` |

Si algún día hay que mover la web a otro sitio, se cambian estos registros y el dominio en Settings → Pages del repositorio. Las direcciones completas de las páginas (enlaces canónicos, imágenes para redes sociales y `sitemap.xml`) usan `https://webnana.org/`.

**webnana.es y webnana.cat** se publican desde dos repositorios pequeños de GitHub Pages, [KentoGD/webnana-es](https://github.com/KentoGD/webnana-es) y [KentoGD/webnana-cat](https://github.com/KentoGD/webnana-cat). Su única página redirige a `https://webnana.org` conservando la página pedida: `webnana.es/tienda.html` lleva a `webnana.org/tienda.html`, y la portada de `webnana.cat` lleva a `index-ca.html`. En Nominalia, cada uno tiene los mismos 4 registros A que `webnana.org` y un CNAME de `www` a `kentogd.github.io`. Sus registros de correo (MX, SPF, DKIM…) no se han tocado. Se pueden transferir a la organización Nana-Asoc cuando alguien la administre; entonces el CNAME de `www` pasaría a `nana-asoc.github.io`.

La web tiene una página para cada apartado del menú, en castellano y catalán:

| Castellano | Catalán | |
|---|---|---|
| `index.html` | `index-ca.html` | inicio: presentación y colabora |
| `quienes-somos.html` | `qui-som.html` | quiénes somos: familias, educación infantil y educación especial |
| `primeros-pasos.html` | `primers-passos.html` | primeros pasos tras el diagnóstico |
| `ayudas.html` | `ajuts.html` | ayudas y trámites |
| `que-hacemos.html` | `que-fem.html` | qué hacemos, actividades para tod@s y encuesta de actividades |
| `eventos.html` | `esdeveniments.html` | eventos: próximos y pasados (se gestionan en `gestionar-eventos.html`) |
| `colabora.html` | `col-labora.html` | hazte socio, voluntariado, donativos y tienda |
| `contacto.html` | `contacte.html` | formulario de contacto |
| `privacidad.html` | `privacitat.html` | aviso legal y privacidad |
| `tienda.html` | `botiga.html` | recursos: materiales, apps y herramientas online (ver más abajo) |

Cada página lleva su propia cabecera, menú y pie (estilos y script incluidos en el propio archivo). **Si cambias el menú, la cabecera o el pie, cámbialo en todas las páginas.** En el móvil y en pantallas medianas (hasta 1240 px), el menú se abre con el botón ☰ de la cabecera.

Las ilustraciones de cada página están en `img/secciones/` (`quienes-somos.jpg`, `primeros-pasos.jpg`, `ayudas.jpg`, `que-hacemos.jpg`, `eventos.jpg`, `colabora-manos.jpg`, `contacto.jpg`); la de la portada es `img/portada.jpg`; se comparten entre castellano y catalán. Para cambiar una, sustituye el archivo manteniendo el nombre.

- El botón ES/CA lleva a la misma página en el otro idioma.
- `contacto.html?motivo=socio` abre el formulario con el motivo ya elegido (`diagnostico`, `ayuda`, `socio`, `actividades` u `otra`).
- Los enlaces antiguos de la web de una sola página (por ejemplo `index.html#ayudas`) redirigen solos a la página nueva.

- `img/logo-nana.jpg` — logotipo completo; `img/logo-nana-marca.jpg` — símbolo + NANA (cabecera)

## Eventos

Los eventos salen en `eventos.html` / `esdeveniments.html` (próximos y pasados, según la fecha) y el más cercano aparece también en la portada.

La forma fácil de gestionarlos es **`gestionar-eventos.html`** (por ejemplo `https://webnana.org/gestionar-eventos.html`), que no sale en el menú ni en los buscadores. Usa la misma clave de acceso de GitHub que `gestionar.html` (la tienda) y permite:

- Añadir, cambiar, duplicar y borrar eventos (título en castellano y catalán, fecha, hora, lugar, descripción, enlace a Instagram u otra página).
- Subir la foto del evento desde el móvil o el ordenador (se reduce sola y se guarda en `img/eventos/`).
- Cambiar el perfil de Instagram del botón «Síguenos».

Al guardar, la página escribe `eventos.js` en GitHub y la web se actualiza en uno o dos minutos. En los navegadores donde un responsable ha guardado su clave, el pie de la web muestra los enlaces «Gestionar la tienda» y «Gestionar los eventos». También se puede editar `eventos.js` a mano: el formato está explicado al principio del archivo.

## Tienda solidaria

| Castellano | Catalán | |
|---|---|---|
| `tienda.html` | `botiga.html` | lista de productos con buscador y categorías |
| `producto.html?id=…` | `producte.html?id=…` | página de cada producto (fotos, descripción, «Para qué sirve») |

Estilos en `tienda.css` y funcionamiento en `tienda.js` (sirven para las cuatro páginas). Los productos y las categorías están en un solo archivo, `productos.js`.

### Gestionar los productos sin tocar código: `gestionar.html`

En la web, abrid **`gestionar.html`** (por ejemplo `https://webnana.org/gestionar.html`). No sale en el menú ni en los buscadores. Desde ahí se puede:

- Añadir un producto, cambiarlo o borrarlo.
- Subir fotos desde el móvil o el ordenador (se reducen solas), ordenarlas y quitarlas.
- Poner el precio y el enlace del anuncio de Wallapop.
- Cambiar el orden en el que salen los productos.

Al pulsar «Guardar y publicar», la página guarda los cambios en GitHub y la web se actualiza en uno o dos minutos.

La primera vez pide una **clave de acceso de GitHub** (la página explica cómo crearla): una clave «fine-grained» con *Resource owner* Nana-Asoc, solo el repositorio WebNana y el permiso *Contents: Read and write*. Cada persona que gestione la tienda necesita su propia cuenta de GitHub con acceso al repositorio y su propia clave. Si la organización pide aprobar las claves, se aprueban en Nana-Asoc → Settings → Personal access tokens → Pending requests. La clave se guarda solo en el navegador de ese dispositivo; con «Desconectar» se borra. Si una clave se pierde o se filtra, borradla en GitHub (Settings → Developer settings → Personal access tokens).

Las categorías no se cambian desde `gestionar.html`: se editan a mano en `productos.js`.

**Si la web se pasa a otro repositorio** (por ejemplo, para el dominio propio), cambiad `REPO` (y `RAMA` si no es `main`) al principio de `gestionar.js`. Si solo se cambia el dominio y el repositorio sigue siendo el mismo, no hay que tocar nada; eso sí, cada responsable tiene que volver a pegar su clave la primera vez que entre por el dominio nuevo.

### Editar `productos.js` a mano

Si preferís hacerlo a mano:

1. Guarda las fotos en `img/tienda/` (mejor cuadradas, unos 1000 × 1000 px). En la tienda y en la página del producto se deslizan con el dedo o con las flechas. Sin fotos sale un dibujo de la categoría.
2. Copia un bloque de `productos.js` y rellénalo: categoría, fotos, precio, enlace del anuncio de Wallapop y textos en castellano y catalán.
3. Mientras falte el precio o el enlace de Wallapop, sale «Muy pronto en Wallapop» y no se puede comprar. Pon `agotado: true` cuando no quede stock.
4. Las apps (`tipo: 'app'`) enlazan a App Store y Google Play (`appStore`, `googlePlay`).
5. Las herramientas online (`tipo: 'herramienta'`) llevan su enlace en `web`. Puede ser una dirección `https://` (se abre en otra pestaña) o una página de esta web, como `juegos/mis-viajes/` (se abre en la misma pestaña).

### Juegos web

Los juegos de N.A.N.A. viven dentro de la web, en `juegos/` (por ejemplo `juegos/mis-viajes/`), así que funcionan igual con `nana-asoc.github.io` que con el dominio propio. En `productos.js` son herramientas de la categoría `juegos`: en Recursos salen con el filtro «Juegos» / «Jocs», la etiqueta «Juego web» / «Joc web», «Gratis» y el botón «Jugar ahora».

- **Mis Viajes** (`juegos/mis-viajes/`): agenda visual con pictogramas de ARASAAC, viaje en calma, clasificar y colores. Usa las letras de `fonts/` y solo se conecta con ARASAAC para los pictogramas. Lo que guarda cada familia (agenda, ajustes) se queda en su navegador. Se puede abrir directamente en una pantalla: `?pantalla=dia`, `?pantalla=calma&escena=primavera`, `?pantalla=cosas`, `?pantalla=colores`, y con `&vehiculo=barco` (o `tren`, `coche`, `avion`).
- Las fotos de su ficha están en `img/tienda/`: primero `mis-viajes-portada.jpg` (portada con ilustración hecha en Canva) y después las capturas `mis-viajes-1.jpg` a `mis-viajes-5.jpg`.
- **Juegos de Movimiento** (Rompe Muñecos, Machaca Topos y Lee y Atrapa): juegos con la cámara que viven fuera de esta web, en su propio repositorio ([KentoGD/Dancewithyou](https://github.com/KentoGD/Dancewithyou)), y se publican en `https://kentogd.github.io/Dancewithyou/`; la ficha enlaza ahí y se abre en otra pestaña. La cámara no graba: la imagen se procesa solo en el dispositivo. Fotos de la ficha: `img/tienda/juegos-movimiento-portada.jpg` (portada, con ilustración hecha en Canva) y las capturas `juegos-movimiento-1.jpg` y `-2.jpg`.

La compra se hace en Wallapop: el botón «Comprar en Wallapop» abre el anuncio del producto. Con envío, Wallapop cobra al comprador y paga a la asociación cuando le llega el producto; en mano se cobra al entregarlo.

Los textos de los productos de ejemplo (agenda visual, auriculares, temporizador…) son orientativos: cambiadlos o borrad los productos que no vayáis a vender.

Antes de poner precios, revisad con la gestoría:
- Que la venta de productos esté prevista en los estatutos como actividad económica para financiar los fines de la asociación.
- IVA y facturas: los productos se venden con IVA aunque la asociación no tenga ánimo de lucro; los precios son con impuestos incluidos.
- Wallapop: una asociación que vende de forma habitual debería usar un perfil profesional (Wallapop PRO) y no una cuenta particular.
- Si se fabrican productos propios (por ejemplo, las cartas de emociones), la normativa de seguridad de juguetes (marcado CE) si van dirigidos a menores de 14 años.

## Pendiente de completar (en los dos idiomas)

- Foto de la portada
- Eventos en `eventos.js`
- NIF, nº de registro, domicilio social y fecha en el pie y en las páginas de privacidad
- NIF y domicilio social en las condiciones de la tienda; precios, fotos y enlaces de Wallapop en `productos.js`

## Buscadores (SEO)

- **Títulos**: cada página tiene un `<title>` con lo que buscan las familias (autismo, Sant Boi, ayudas…), de unos 60 caracteres como mucho, que es lo que Google enseña entero.
- **Idiomas**: cada página enlaza su versión en castellano y en catalán con `hreflang` y direcciones completas (`https://webnana.org/…`), más `x-default` (la castellana). Si creas una página nueva, copia ese bloque.
- **Datos estructurados** (`<script type="application/ld+json">`, no hace falta actualizar la CSP por ellos): la portada describe la asociación (NGO) y la web; cada sección lleva sus migas (Inicio › Sección). Las fichas de recursos (`tienda.js`) y los próximos eventos (`eventos-web.js`) los generan solos. Se pueden comprobar con la [prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results).
- **`sitemap.xml`** se genera con **`python3 herramientas/actualizar-sitemap.py`**: incluye las páginas que no llevan `noindex`, la ficha de cada recurso de `productos.js` en los dos idiomas y los juegos de `juegos/`. Ejecútalo al añadir páginas o recursos (los recursos que se añaden desde `gestionar.html` también los encuentra Google desde Recursos, pero así llegan antes).
- **`robots.txt`** deja rastrear toda la web menos las páginas de gestión e indica dónde está el sitemap.

## Seguridad

- **Política de seguridad (CSP)** en cada página: solo se ejecutan los scripts de la propia web y los que están escritos dentro de cada página tal como están ahora. **Si cambias un `<script>` escrito dentro de una página, ejecuta `python3 herramientas/actualizar-csp.py`**; si no, ese script dejará de funcionar.
- `seguridad.js` impide que otra web muestre estas páginas dentro de un marco (clickjacking).
- Los tipos de letra están en `fonts/` (no se conecta con Google Fonts).
- Los enlaces y fotos de los eventos y de la tienda solo aceptan direcciones `https://` o fotos de `img/`.
- Formularios: campo trampa contra robots y límites de longitud.
- Las páginas de gestión no salen en buscadores y usan claves de GitHub con permiso solo sobre este repositorio. Recomendado: activar la verificación en dos pasos en las cuentas de GitHub de quien gestione la web, poner fecha de caducidad a las claves y, en Web3Forms, limitar el formulario al dominio de la web.
