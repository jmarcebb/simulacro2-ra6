"""Pruebas del informe de préstamos."""

import unittest
from datetime import date

from informe import dias_retraso, generar_informe, prestamos_con_retraso

PRESTAMOS = [
    {"socio": "S-1", "libro": "A tiempo", "fecha": "2026-11-10", "devuelto": None},
    {"socio": "S-2", "libro": "Con retraso", "fecha": "2026-10-20", "devuelto": None},
    {"socio": "S-3", "libro": "Devuelto", "fecha": "2026-09-01", "devuelto": "2026-09-10"},
]
CORTE = date(2026, 11, 18)


class PruebasInforme(unittest.TestCase):
    def test_dias_retraso_cuenta_desde_la_fecha_limite(self):
        self.assertEqual(dias_retraso("2026-10-20", CORTE), 14)

    def test_dias_retraso_es_cero_dentro_del_plazo(self):
        self.assertEqual(dias_retraso("2026-11-10", CORTE), 0)

    def test_solo_salen_los_pendientes_con_retraso(self):
        self.assertEqual(prestamos_con_retraso(PRESTAMOS, CORTE), [["S-2", "Con retraso", 14]])

    def test_informe_lleva_el_nombre_de_la_biblioteca(self):
        texto = generar_informe(PRESTAMOS, CORTE, "Biblioteca de prueba")
        self.assertIn("# Informe de préstamos · Biblioteca de prueba", texto)
        self.assertIn("## Préstamos con retraso", texto)
        self.assertIn("Préstamos sin devolver: 2", texto)


if __name__ == "__main__":
    unittest.main()
