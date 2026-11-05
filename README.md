# web Nana

Web de N.A.N.A. – Núcleo de Acompañamiento y Necesidades del Autismo y familias neurodivergentes (Sant Boi de Llobregat).

| Castellano | Catalán | |
|---|---|---|
| `index.html` | `index-ca.html` | página principal (estilos y script incluidos en el propio archivo) |
| `privacidad.html` | `privacitat.html` | aviso legal y privacidad |
| `tienda.html` | `botiga.html` | tienda solidaria (estilos en `tienda.css`, lógica en `tienda.js`) |

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

Los productos se editan en un solo archivo, `productos.js`, y salen en las dos versiones de la tienda:

1. Guarda la foto en `img/tienda/` (mejor cuadrada). Sin foto sale un dibujo genérico.
2. En `productos.js`, copia un bloque y rellénalo. Mientras `precio` sea `null`, el producto sale como «Próximamente» y no se puede pedir. Pon `agotado: true` cuando no quede stock.
3. Las apps (`tipo: 'app'`) no se compran desde la web: enlazan a App Store y Google Play (`appStore`, `googlePlay`).

Cómo funciona un pedido: la familia llena la cesta y envía el formulario (no paga nada en la web). El pedido llega al correo por Web3Forms, con los productos, el total, la forma de entrega y la aportación solidaria. Desde la asociación se confirma por email y se indica cómo pagar (Bizum o transferencia). Mientras ningún producto tenga precio, el formulario de pedido no aparece.

Antes de poner precios, revisad con la gestoría:
- Que la venta de productos esté prevista en los estatutos como actividad económica para financiar los fines de la asociación.
- IVA y facturas: los productos se venden con IVA aunque la asociación no tenga ánimo de lucro; los precios de la web son con impuestos incluidos.
- Si se fabrican productos propios (por ejemplo, las cartas de emociones), la normativa de seguridad de juguetes (marcado CE) si van dirigidos a menores de 14 años.
- El NIF y el domicilio social en las condiciones de la tienda.

## Pendiente de completar (en los dos idiomas)

- Foto de la portada
- Eventos en `eventos.js`
- NIF, nº de registro, domicilio social y fecha en el pie y en las páginas de privacidad
- NIF y domicilio social en las condiciones de la tienda; precios y fotos en `productos.js`
