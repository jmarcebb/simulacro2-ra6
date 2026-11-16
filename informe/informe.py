"""Informe de préstamos de la biblioteca en Markdown.

Lee los préstamos de ``datos/prestamos.json``, busca los que siguen sin
devolver y llevan retraso en la fecha de corte, y escribe el informe en
``salida/informe.md``.

Configuración (variables de entorno o archivo ``.env``):

- ``BIBLIOTECA``: nombre de la biblioteca, que aparece en el título.
- ``BIBLIO_API_KEY``: clave de la API del catálogo. El informe solo
  comprueba si existe; nunca la muestra.

Dependencias externas: ``python-dotenv`` y ``tabulate``.
"""

import json
import os
from datetime import date, timedelta
from pathlib import Path

from dotenv import load_dotenv
from tabulate import tabulate

RAIZ = Path(__file__).resolve().parent.parent
ARCHIVO_PRESTAMOS = RAIZ / "datos" / "prestamos.json"
ARCHIVO_INFORME = RAIZ / "salida" / "informe.md"
DIAS_PRESTAMO = 15


def leer_fecha(texto):
    """Convierte un texto con formato AAAA-MM-DD en una fecha.

    :param texto: Fecha en formato AAAA-MM-DD.
    :return: Objeto ``date`` correspondiente.
    :raises ValueError: Si el texto no es una fecha válida.
    """
    return date.fromisoformat(texto)


def dias_retraso(fecha_prestamo, fecha_corte, dias_prestamo=DIAS_PRESTAMO):
    limite = leer_fecha(fecha_prestamo) + timedelta(days=dias_prestamo)
    return max(0, (fecha_corte - limite).days)


def prestamos_con_retraso(prestamos, fecha_corte):
    """Selecciona los préstamos sin devolver que llevan retraso.

    :param prestamos: Lista de diccionarios con ``socio``, ``libro``,
        ``fecha`` y ``devuelto``.
    :param fecha_corte: Fecha (``date``) en la que se hace el informe.
    :return: Lista de filas ``[socio, libro, días de retraso]``, de más
        a menos retraso.
    """
    filas = []
    for prestamo in prestamos:
        if prestamo["devuelto"] is None:
            retraso = dias_retraso(prestamo["fecha"], fecha_corte)
            if retraso > 0:
                filas.append([prestamo["socio"], prestamo["libro"], retraso])
    return sorted(filas, key=lambda fila: fila[2], reverse=True)


def generar_informe(prestamos, fecha_corte, biblioteca):
    """Genera el texto del informe en Markdown.

    :param prestamos: Lista de préstamos (ver :func:`prestamos_con_retraso`).
    :param fecha_corte: Fecha (``date``) en la que se hace el informe.
    :param biblioteca: Nombre de la biblioteca para el título.
    :return: Informe completo en Markdown.
    """
    pendientes = sum(1 for prestamo in prestamos if prestamo["devuelto"] is None)
    filas = prestamos_con_retraso(prestamos, fecha_corte)
    lineas = [
        f"# Informe de préstamos · {biblioteca}",
        "",
        f"- Fecha de corte: {fecha_corte.isoformat()}",
        f"- Préstamos sin devolver: {pendientes}",
        "",
        "## Préstamos con retraso",
        "",
    ]
    if filas:
        lineas.append(tabulate(filas, headers=["Socio", "Libro", "Días de retraso"], tablefmt="github"))
    else:
        lineas.append("No hay préstamos con retraso.")
    return "\n".join(lineas) + "\n"


def main():
    """Carga la configuración, genera el informe y lo guarda en ``salida/``."""
    load_dotenv(RAIZ / ".env")
    biblioteca = os.getenv("BIBLIOTECA", "Biblioteca sin nombre")
    datos = json.loads(ARCHIVO_PRESTAMOS.read_text(encoding="utf-8"))
    texto = generar_informe(datos["prestamos"], leer_fecha(datos["fecha_corte"]), biblioteca)
    ARCHIVO_INFORME.parent.mkdir(exist_ok=True)
    ARCHIVO_INFORME.write_text(texto, encoding="utf-8")
    print(f"Clave de la API configurada: {'sí' if os.getenv('BIBLIO_API_KEY') else 'no'}")
    print(f"Informe guardado en {ARCHIVO_INFORME.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
