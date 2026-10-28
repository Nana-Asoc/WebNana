# web Nana

Web de N.A.N.A. – Núcleo de Acompañamiento y Necesidades del Autismo y familias neurodivergentes (Sant Boi de Llobregat).

| Castellano | Catalán | |
|---|---|---|
| `index.html` | `index-ca.html` | página principal (estilos y script incluidos en el propio archivo) |
| `privacidad.html` | `privacitat.html` | aviso legal y privacidad |

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

## Pendiente de completar (en los dos idiomas)

- Foto de la portada
- Eventos en `eventos.js`
- NIF, nº de registro, domicilio social y fecha en el pie y en las páginas de privacidad
