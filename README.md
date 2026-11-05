# web Nana

Web de N.A.N.A. – Núcleo de Acompañamiento y Necesidades del Autismo y familias neurodivergentes (Sant Boi de Llobregat).

| Castellano | Catalán | |
|---|---|---|
| `index.html` | `index-ca.html` | página principal (estilos y script incluidos en el propio archivo) |
| `privacidad.html` | `privacitat.html` | aviso legal y privacidad |
| `tienda.html` | `botiga.html` | tienda solidaria (ver más abajo) |

- `img/logo-nana.jpg` — logotipo completo; `img/logo-nana-marca.jpg` — símbolo + NANA (cabecera)
- `img/sant-boi-ermita.jpg` — foto de la sección «N.A.N.A. en Sant Boi» (Diego Eiras, CC BY-SA 4.0, Wikimedia Commons: hay que mantener la atribución que aparece debajo)

## Añadir eventos de Instagram

Los eventos de la sección «N.A.N.A. en Sant Boi» se editan en un solo archivo, `eventos.js`, y salen en las dos versiones de la web:

1. Guarda la foto del evento en `img/eventos/` (mejor cuadrada).
2. En `eventos.js`, copia la línea de ejemplo, quítale las `//` del principio y rellena la foto, el enlace de la publicación de Instagram, la fecha y el título en castellano (`es`) y catalán (`ca`).
3. Pon el perfil de Instagram en `NANA_INSTAGRAM` para que aparezca el botón «Síguenos en Instagram».

Mientras la lista esté vacía, se muestran tres recuadros de «Próximamente».
- El botón ES/CA de la cabecera enlaza cada página con su versión en el otro idioma. En la página principal conserva la sección en la que estaba el visitante (por ejemplo, `#contacto` ↔ `#contacte`).
- **Si cambias un texto, cámbialo en los dos idiomas.**

Para verla, abre `index.html` en el navegador.

## Tienda solidaria

| Castellano | Catalán | |
|---|---|---|
| `tienda.html` | `botiga.html` | lista de productos con buscador y categorías |
| `producto.html?id=…` | `producte.html?id=…` | página de cada producto (fotos, descripción, «Para qué sirve») |

Estilos en `tienda.css` y funcionamiento en `tienda.js` (sirven para las cuatro páginas). Los productos y las categorías se editan en un solo archivo, `productos.js`:

1. Guarda las fotos en `img/tienda/` (mejor cuadradas, unos 1000 × 1000 px). En la tienda y en la página del producto se deslizan con el dedo o con las flechas. Sin fotos sale un dibujo de la categoría.
2. Copia un bloque de `productos.js` y rellénalo: categoría, fotos, precio, enlace del anuncio de Wallapop y textos en castellano y catalán.
3. Mientras falte el precio o el enlace de Wallapop, sale «Muy pronto en Wallapop» y no se puede comprar. Pon `agotado: true` cuando no quede stock.
4. Las apps (`tipo: 'app'`) enlazan a App Store y Google Play (`appStore`, `googlePlay`).

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
