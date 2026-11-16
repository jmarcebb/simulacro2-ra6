'use strict';

/**
 * Fechas de devolución, retrasos y multas de los préstamos de la biblioteca.
 * @module prestamos
 */

/** Días que dura un préstamo si no se indica otra cosa. */
const DIAS_PRESTAMO = 15;

/** Euros de multa por cada día de retraso. */
const PRECIO_DIA = 0.5;

/** Multa máxima que se cobra por un préstamo, en euros. */
const MULTA_MAXIMA = 6;

const MS_DIA = 24 * 60 * 60 * 1000;

/**
 * Convierte un texto con formato AAAA-MM-DD en una fecha (00:00 UTC).
 * @param {string} texto - Fecha en formato AAAA-MM-DD.
 * @returns {Date} Fecha correspondiente.
 * @throws {Error} Si el texto no es una fecha válida.
 * @example
 * leerFecha('2026-11-18'); // Date 2026-11-18T00:00:00.000Z
 */
function leerFecha(texto) {
  const fecha = new Date(`${texto}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto) || Number.isNaN(fecha.getTime())) {
    throw new Error(`Fecha no válida: ${texto}`);
  }
  return fecha;
}

/**
 * Convierte una fecha en un texto con formato AAAA-MM-DD.
 * @param {Date} fecha - Fecha que se quiere escribir.
 * @returns {string} Fecha en formato AAAA-MM-DD.
 */
function escribirFecha(fecha) {
  return fecha.toISOString().slice(0, 10);
}

/**
 * Calcula la fecha en la que hay que devolver un libro.
 * @param {string} fechaPrestamo - Fecha del préstamo (AAAA-MM-DD).
 * @param {number} [dias=15] - Días que dura el préstamo.
 * @returns {string} Fecha de devolución (AAAA-MM-DD).
 * @example
 * fechaDevolucion('2026-11-02'); // '2026-11-17'
 */
function fechaDevolucion(fechaPrestamo, dias = DIAS_PRESTAMO) {
  if (!Number.isInteger(dias) || dias <= 0) {
    throw new RangeError('Los días de préstamo deben ser un entero mayor que 0');
  }
  const inicio = leerFecha(fechaPrestamo);
  return escribirFecha(new Date(inicio.getTime() + dias * MS_DIA));
}

/**
 * Cuenta los días de retraso de una devolución.
 * @param {string} fechaLimite - Fecha en la que había que devolver el libro (AAAA-MM-DD).
 * @param {string} fechaEntrega - Fecha en la que se devolvió o fecha de corte (AAAA-MM-DD).
 * @example
 * diasRetraso('2026-11-17', '2026-11-20'); // 3
 * diasRetraso('2026-11-17', '2026-11-10'); // 0
 */
function diasRetraso(fechaLimite, fechaEntrega) {
  const diferencia = leerFecha(fechaEntrega) - leerFecha(fechaLimite);
  return Math.max(0, Math.round(diferencia / MS_DIA));
}

/**
 * Calcula la multa de un préstamo devuelto con retraso.
 * @param {number} dias - Días de retraso.
 * @param {number} [precioDia=0.5] - Euros por cada día de retraso.
 * @returns {number} Multa en euros, como máximo MULTA_MAXIMA (6 €).
 * @throws {RangeError} Si los días de retraso son negativos.
 * @example
 * calcularMulta(4); // 2
 */
function calcularMulta(dias, precioDia = PRECIO_DIA) {
  if (dias < 0) {
    throw new RangeError('Los días de retraso no pueden ser negativos');
  }
  return dias * precioDia;
}

/**
 * Resume el estado de un préstamo en una fecha de corte.
 * @param {Object} prestamo - Préstamo tal y como aparece en datos/prestamos.json.
 * @param {string} prestamo.socio - Código del socio.
 * @param {string} prestamo.libro - Título del libro.
 * @param {string} prestamo.fecha - Fecha del préstamo (AAAA-MM-DD).
 * @param {?string} prestamo.devuelto - Fecha de devolución, o null si no se ha devuelto.
 * @param {string} fechaCorte - Fecha en la que se hace el resumen (AAAA-MM-DD).
 * @returns {{socio: string, libro: string, limite: string, retraso: number, multa: number, estado: string}}
 *   Resumen del préstamo. El estado es «devuelto», «pendiente» o «con retraso».
 */
function resumenPrestamo(prestamo, fechaCorte) {
  const limite = fechaDevolucion(prestamo.fecha);
  const retraso = diasRetraso(limite, prestamo.devuelto ?? fechaCorte);
  let estado = 'pendiente';
  if (prestamo.devuelto) {
    estado = 'devuelto';
  } else if (retraso > 0) {
    estado = 'con retraso';
  }
  return {
    socio: prestamo.socio,
    libro: prestamo.libro,
    limite,
    retraso,
    multa: calcularMulta(retraso),
    estado,
  };
}

module.exports = {
  DIAS_PRESTAMO,
  PRECIO_DIA,
  MULTA_MAXIMA,
  leerFecha,
  escribirFecha,
  fechaDevolucion,
  diasRetraso,
  calcularMulta,
  resumenPrestamo,
};
