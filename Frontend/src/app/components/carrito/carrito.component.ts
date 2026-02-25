import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemCarrito } from '../../models/item-carrito.model';
import { FormatoPrecioPipe } from '../../pipes/formato-precio.pipe';

/**
 * CarritoComponent
 * 
 * Componente hijo que muestra el panel lateral del carrito de compras.
 * 
 * Incluye:
 * - Lista de items agregados (productos y adicionales)
 * - Cálculos de Primera Factura y Ahorro Total
 * - Botones para eliminar items individuales o vaciar todo
 * 
 * Recibe los datos ya calculados del padre. No hace cálculos propios
 * porque el carrito es un dato compartido que el padre administra.
 */
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormatoPrecioPipe],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {

  // ========== @Input() - Datos que RECIBE del padre ==========

  /** Array con todos los items del carrito */
  @Input() carrito: ItemCarrito[] = [];

  /** Suma de precios de lista (sin promoción) - calculado por el padre */
  @Input() precioListaTotal: number = 0;

  /** Monto total de la primera factura / con promoción (calculado por el padre) */
  @Input() primeraFactura: number = 0;

  /** Monto total del ahorro (calculado por el padre) */
  @Input() ahorroTotal: number = 0;

  // ========== @Output() - Eventos que EMITE al padre ==========

  /** Se emite cuando el usuario quiere cerrar el panel del carrito */
  @Output() alCerrar = new EventEmitter<void>();

  /** Se emite cuando el usuario quiere eliminar un item (envía el índice) */
  @Output() alEliminarItem = new EventEmitter<number>();

  /** Se emite cuando el usuario quiere vaciar el carrito completo */
  @Output() alVaciarCarrito = new EventEmitter<void>();

  /**
   * Cierra el panel del carrito avisándole al padre.
   */
  cerrarCarrito(): void {
    this.alCerrar.emit();
  }

  /**
   * Emite el índice del item a eliminar.
   * El padre recibe el índice y hace splice en su array.
   */
  eliminarItem(indice: number): void {
    this.alEliminarItem.emit(indice);
  }

  /**
   * Emite el evento para vaciar todo el carrito.
   */
  vaciarCarrito(): void {
    this.alVaciarCarrito.emit();
  }
}
