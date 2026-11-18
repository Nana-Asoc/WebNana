#!/usr/bin/env python3
"""Genera sitemap.xml con todas las páginas de la web que pueden salir en Google.

Incluye:
  - las páginas .html que no llevan «noindex» (las de gestionar y privacidad no salen),
  - la ficha de cada recurso de productos.js, en castellano y en catalán,
  - los juegos que viven dentro de la web (juegos/<nombre>/index.html).
Cada página lleva sus versiones en castellano y catalán (hreflang), igual que en el propio HTML.

Ejecútalo desde la carpeta de la web cada vez que añadas una página o un recurso:

    python3 herramientas/actualizar-sitemap.py

La fecha de cada página es la de su último cambio en git (o la de hoy si aún no está guardada).
"""
import datetime, glob, json, os, re, subprocess

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
BASE = "https://webnana.org/"
HOY = datetime.date.today().isoformat()


def fecha(*rutas):
    fechas = []
    for r in rutas:
        try:
            f = subprocess.run(["git", "log", "-1", "--format=%cs", "--", r], cwd=RAIZ,
                               capture_output=True, text=True).stdout.strip()
        except OSError:
            f = ""
        fechas.append(f or HOY)
    return max(fechas)


def url(pagina):
    return BASE if pagina == "index.html" else BASE + pagina


def entrada(loc, mod, alternas):
    lineas = [f"  <url>", f"    <loc>{loc}</loc>", f"    <lastmod>{mod}</lastmod>"]
    for lang, href in alternas:
        lineas.append(f'    <xhtml:link rel="alternate" hreflang="{lang}" href="{href}"/>')
    lineas.append("  </url>")
    return "\n".join(lineas)


def main():
    entradas = []
    for ruta in sorted(glob.glob(os.path.join(RAIZ, "*.html"))):
        nombre = os.path.basename(ruta)
        html = open(ruta, encoding="utf-8").read()
        if re.search(r'<meta name="robots" content="[^"]*noindex', html):
            continue
        if nombre in ("producto.html", "producte.html"):
            continue  # se añaden abajo, una por recurso
        alternas = re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">', html)
        entradas.append(entrada(url(nombre), fecha(nombre), alternas))

    # Fichas de los recursos (productos.js es JavaScript: se lee la lista que contiene)
    js = open(os.path.join(RAIZ, "productos.js"), encoding="utf-8").read()
    lista = json.loads(re.search(r"var NANA_PRODUCTOS = (\[.*?\]);", js, re.S).group(1))
    mod = fecha("productos.js")
    for p in lista:
        q = "?id=" + p["id"]
        alternas = [("es", BASE + "producto.html" + q), ("ca", BASE + "producte.html" + q),
                    ("x-default", BASE + "producto.html" + q)]
        entradas.append(entrada(BASE + "producto.html" + q, mod, alternas))
        entradas.append(entrada(BASE + "producte.html" + q, mod, alternas))

    # Juegos dentro de la web
    for ruta in sorted(glob.glob(os.path.join(RAIZ, "juegos", "*", "index.html"))):
        carpeta = os.path.relpath(os.path.dirname(ruta), RAIZ).replace(os.sep, "/")
        entradas.append(entrada(BASE + carpeta + "/", fecha(carpeta), []))

    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
           'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
           + "\n".join(entradas) + "\n</urlset>\n")
    with open(os.path.join(RAIZ, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
        f.write(xml)
    print(f"sitemap.xml: {len(entradas)} direcciones")


if __name__ == "__main__":
    main()
