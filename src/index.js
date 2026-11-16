'use strict';

/**
 * Muestra en la terminal el estado de todos los préstamos.
 * @module index
 */

const fs = require('node:fs');
const path = require('node:path');
const { resumenPrestamo } = require('./prestamos');

const archivo = path.join(__dirname, '..', 'datos', 'prestamos.json');
const datos = JSON.parse(fs.readFileSync(archivo, 'utf8'));

console.log(`Estado de los préstamos a ${datos.fecha_corte}`);
console.table(datos.prestamos.map((prestamo) => resumenPrestamo(prestamo, datos.fecha_corte)));
