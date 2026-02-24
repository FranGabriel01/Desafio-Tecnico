/**
 * Interfaz que representa un item dentro del carrito de compras.
 * Puede ser un producto o un adicional.
 * Se usa en el componente padre (App) y en el CarritoComponent.
 */
export interface ItemCarrito {
  id: number;
  nombre: string;
  precio_lista: number;
  precio_final: number;
  tipo: string;            // 'producto' o 'adicional'
  tipoProducto?: string;   // 'Tv', 'Internet' o 'Combo' - solo para productos
  tipoAdicional?: string;  // 'Tv' o 'Internet' - solo para adicionales (para mostrar en el carrito)
}
