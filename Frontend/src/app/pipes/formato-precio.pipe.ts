import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado para formatear precios al estilo argentino.
 * Ejemplo: 14500 → "$14.500,00"
 * 
 * Uso en el HTML: {{ producto.precio_final | formatoPrecio }}
 */
@Pipe({
  name: 'formatoPrecio',
  standalone: true
})
export class FormatoPrecioPipe implements PipeTransform {

  /**
   * Recibe un número y lo devuelve formateado como precio argentino.
   * @param valor - El número a formatear (ej: 14500)
   * @returns String formateado (ej: "$14.500,00")
   */
  transform(valor: number | string): string {
    // Convertimos a número por si viene como string de la DB
    const numero = Number(valor);

    // Si no es un número válido, devolvemos $0,00
    if (isNaN(numero)) {
      return '$0,00';
    }

    // Formateamos con separador de miles (.) y decimal (,)
    // toLocaleString('es-AR') hace esto automáticamente para Argentina
    const formateado = numero.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `$${formateado}`;
  }
}
