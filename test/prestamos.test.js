'use strict';

const test = require('node:test');
const assert = require('node:assert');
const {
  leerFecha,
  fechaDevolucion,
  diasRetraso,
  calcularMulta,
  resumenPrestamo,
} = require('../src/prestamos');

test('leerFecha rechaza una fecha mal escrita', () => {
  assert.throws(() => leerFecha('18/11/2026'), Error);
});

test('fechaDevolucion suma 15 días por defecto', () => {
  assert.strictEqual(fechaDevolucion('2026-11-02'), '2026-11-17');
});

test('fechaDevolucion cambia de mes', () => {
  assert.strictEqual(fechaDevolucion('2026-10-25', 10), '2026-11-04');
});

test('fechaDevolucion rechaza 0 días', () => {
  assert.throws(() => fechaDevolucion('2026-11-02', 0), RangeError);
});

test('diasRetraso cuenta los días pasados de la fecha límite', () => {
  assert.strictEqual(diasRetraso('2026-11-17', '2026-11-20'), 3);
});

test('diasRetraso devuelve 0 si se entrega a tiempo', () => {
  assert.strictEqual(diasRetraso('2026-11-17', '2026-11-10'), 0);
});

test('calcularMulta cobra 0,50 € por día', () => {
  assert.strictEqual(calcularMulta(4), 2);
});

test('calcularMulta rechaza días negativos', () => {
  assert.throws(() => calcularMulta(-1), RangeError);
});

test('resumenPrestamo marca un préstamo pendiente con retraso', () => {
  const resumen = resumenPrestamo(
    { socio: 'S-900', libro: 'Prueba', fecha: '2026-11-01', devuelto: null },
    '2026-11-20',
  );
  assert.strictEqual(resumen.estado, 'con retraso');
  assert.strictEqual(resumen.retraso, 4);
});
