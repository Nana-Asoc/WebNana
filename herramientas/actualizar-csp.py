#!/usr/bin/env python3
"""Actualiza la política de seguridad (Content-Security-Policy) de todas las páginas de la web.

La política solo deja ejecutar los scripts de la propia web y los scripts escritos dentro de cada
página tal como están ahora (por su huella sha256). Si cambias un <script> escrito dentro de una
página, vuelve a ejecutar este archivo desde la carpeta de la web:

    python3 herramientas/actualizar-csp.py

Si no lo haces, ese script dejará de funcionar en el navegador (por seguridad).
"""
import base64, glob, hashlib, os, re

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
ADMIN = {"gestionar.html", "gestionar-eventos.html"}


def politica(nombre, html):
    huellas = []
    for codigo in re.findall(r"<script>(.*?)</script>", html, re.S):
        h = base64.b64encode(hashlib.sha256(codigo.encode("utf-8")).digest()).decode()
        huellas.append(f"'sha256-{h}'")
    admin = nombre in ADMIN
    script = " ".join(["'self'"] + sorted(set(huellas)) + (["'unsafe-eval'"] if admin else []))
    conectar = "'self' https://api.github.com" if admin else "'self' https://api.web3forms.com"
    return ("default-src 'self'; "
            f"script-src {script}; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob: https:; "
            "font-src 'self'; "
            f"connect-src {conectar}; "
            "form-action 'self' https://api.web3forms.com; "
            "base-uri 'self'; object-src 'none'; frame-src 'none'; "
            "upgrade-insecure-requests")


def main():
    for ruta in sorted(glob.glob(os.path.join(RAIZ, "*.html"))):
        nombre = os.path.basename(ruta)
        html = open(ruta, encoding="utf-8").read()
        meta = f'<meta http-equiv="Content-Security-Policy" content="{politica(nombre, html)}">'
        if 'http-equiv="Content-Security-Policy"' in html:
            nuevo = re.sub(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">', lambda m: meta, html, count=1)
        else:
            nuevo = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + meta, 1)
        if nuevo != html:
            open(ruta, "w", encoding="utf-8").write(nuevo)
            print("actualizada", nombre)


if __name__ == "__main__":
    main()
