import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../services/productos.service';
import { Adicional } from '../../services/adicionales.service';
import { FormatoPrecioPipe } from '../../pipes/formato-precio.pipe';

/**
 * CardProductoComponent
 * 
 * Componente hijo que muestra UNA card individual de producto.
 * Se usa dentro de un *ngFor en el padre, así se repite por cada producto.
 * 
 * Incluye:
 * - Logo, nombre, promo, precios
 * - Botón para agregar al carrito
 * - Panel desplegable de adicionales compatibles
 * 
 * Tiene lógica mínima de UI (abrir/cerrar adicionales).
 * La lógica de negocio (validaciones, agregar al carrito) la maneja el padre.
 */
@Component({
  selector: 'app-card-producto',
  standalone: true,
  imports: [CommonModule, FormatoPrecioPipe],
  templateUrl: './card-producto.component.html',
  styleUrl: './card-producto.component.css'
})
export class CardProductoComponent {

  // ========== @Input() - Datos que RECIBE del padre ==========

  /** El producto a mostrar en esta card */
  @Input() producto!: Producto;
  // El "!" le dice a TypeScript "confía, el padre siempre lo va a pasar"

  /** Lista de adicionales compatibles con este producto */
  @Input() adicionales: Adicional[] = [];

  /** Si este producto ya está en el carrito (para deshabilitar el botón) */
  @Input() estaEnCarrito: boolean = false;

  /** Array con los IDs de adicionales que ya están en el carrito */
  @Input() adicionalesEnCarrito: number[] = [];

  // ========== @Output() - Eventos que EMITE al padre ==========

  /** Se emite cuando el usuario quiere agregar este producto al carrito */
  @Output() alAgregarProducto = new EventEmitter<Producto>();

  /** Se emite cuando el usuario quiere agregar un adicional al carrito */
  @Output() alAgregarAdicional = new EventEmitter<Adicional>();

  // ========== Estado local de UI ==========

  /** Controla si el panel de adicionales está abierto o cerrado */
  adicionalesAbiertos: boolean = false;

  /**
   * Abre o cierra el panel de adicionales.
   * Esta es lógica de UI pura, no de negocio, por eso vive en el componente hijo.
   */
  toggleAdicionales(): void {
    this.adicionalesAbiertos = !this.adicionalesAbiertos;
  }

  /**
   * Verifica si un adicional específico ya está en el carrito.
   * Busca el ID del adicional en el array que le pasó el padre.
   */
  verificarAdicionalEnCarrito(adicionalId: number): boolean {
    return this.adicionalesEnCarrito.includes(adicionalId);
  }

  /**
   * Emite el evento para agregar el producto al carrito.
   * El padre recibe el producto y ejecuta la lógica de validación.
   */
  agregarProducto(): void {
    this.alAgregarProducto.emit(this.producto);
  }

  /**
   * Emite el evento para agregar un adicional al carrito.
   * El padre recibe el adicional y ejecuta la lógica de validación.
   */
  agregarAdicional(adicional: Adicional): void {
    this.alAgregarAdicional.emit(adicional);
  }
}
