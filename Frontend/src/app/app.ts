import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LocalidadesService, Localidad } from './services/localidades.service';
import { ProductosService, Producto } from './services/productos.service';
import { AdicionalesService, Adicional } from './services/adicionales.service';

// Interfaz para los items del carrito (puede ser producto o adicional)
interface ItemCarrito {
  id: number;
  nombre: string;
  precio_lista: number;
  precio_final: number;
  tipo: string;           // 'producto' o 'adicional'
  tipoProducto?: string;  // 'Tv', 'Internet' o 'Combo' - para validar adicionales compatibles
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  // --- Datos ---
  localidades: Localidad[] = [];          // Lista completa de localidades
  productos: Producto[] = [];             // Productos obtenidos del backend
  adicionales: { [key: string]: Adicional[] } = {}; // Adicionales por tipo de producto
  carrito: ItemCarrito[] = [];            // Items en el carrito

  // --- Estado de la UI ---
  modoOscuro: boolean = false;             // Toggle modo claro/oscuro
  localidadSeleccionada: Localidad | null = null; // Localidad elegida en el dropdown
  tabActivo: string = 'Combo';           // Tab activo (Combo, Tv, Internet)
  carritoAbierto: boolean = false;       // Si el panel del carrito está abierto
  adicionalesAbiertos: { [key: number]: boolean } = {}; // Control de desplegables por producto

  // --- Inyección de servicios ---
  constructor(
    private localidadesService: LocalidadesService,
    private productosService: ProductosService,
    private adicionalesService: AdicionalesService
  ) {}

  // --- Se ejecuta al iniciar el componente ---
  ngOnInit(): void {
    this.cargarLocalidades();
  }

  /**
   * Alterna entre modo claro y modo oscuro
   */
  toggleModoOscuro(): void {
    this.modoOscuro = !this.modoOscuro;
  }

  /**
   * Carga las localidades de Argentina desde el backend
   */
  cargarLocalidades(): void {
    this.localidadesService.obtenerLocalidades().subscribe({
      next: (datos) => {
        this.localidades = datos;
      },
      error: (error) => {
        console.error('Error al cargar localidades:', error);
      }
    });
  }

  /**
   * Se ejecuta al presionar "Traer Oferta"
   * Filtra productos según la disponibilidad de la localidad seleccionada
   */
  traerOferta(): void {
    if (!this.localidadSeleccionada) {
      alert('Seleccione una localidad');
      return;
    }

    const disponibilidad = this.localidadSeleccionada.disponibilidad;

    this.productosService.obtenerProductosPorDisponibilidad(disponibilidad).subscribe({
      next: (datos) => {
        this.productos = datos;
        // Cargar adicionales para cada tipo de producto
        this.cargarAdicionales();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  /**
   * Carga los adicionales para cada tipo de producto (Tv, Internet, Combo)
   */
  cargarAdicionales(): void {
    const tipos = ['Tv', 'Internet', 'Combo'];
    tipos.forEach(tipo => {
      this.adicionalesService.obtenerAdicionalesPorTipo(tipo).subscribe({
        next: (datos) => {
          this.adicionales[tipo] = datos;
        },
        error: (error) => {
          console.error(`Error al cargar adicionales de ${tipo}:`, error);
        }
      });
    });
  }

  /**
   * Limpia todo: productos, carrito y selección
   */
  borrarTodo(): void {
    this.productos = [];
    this.carrito = [];
    this.adicionales = {};
    this.localidadSeleccionada = null;
    this.adicionalesAbiertos = {};
  }

  /**
   * Filtra productos por tipo para cada tab
   */
  obtenerProductosPorTipo(tipo: string): Producto[] {
    return this.productos.filter(p => p.tipo === tipo);
  }

  /**
   * Obtiene adicionales compatibles según el tipo de producto
   */
  obtenerAdicionalesParaProducto(tipoProducto: string): Adicional[] {
    if (tipoProducto === 'Combo') {
      // Combo muestra todos los adicionales
      return this.adicionales['Combo'] || [];
    }
    return this.adicionales[tipoProducto] || [];
  }

  /**
   * Abre/cierra el desplegable de adicionales de un producto
   */
  toggleAdicionales(productoId: number): void {
    this.adicionalesAbiertos[productoId] = !this.adicionalesAbiertos[productoId];
  }

  /**
   * Verifica si un producto ya está en el carrito (por su id)
   */
  productoEnCarrito(productoId: number): boolean {
    return this.carrito.some(item => item.tipo === 'producto' && item.id === productoId);
  }

  /**
   * Agrega un producto al carrito con las siguientes validaciones:
   * 1. No permite duplicados (mismo producto)
   * 2. Si hay Tv en carrito y agregás Internet (o viceversa) → agrega un Combo automáticamente
   * 3. Convierte precios a número para evitar concatenación de strings
   */
  agregarProductoAlCarrito(producto: Producto): void {
    // Verificar si el producto ya está en el carrito
    if (this.productoEnCarrito(producto.id)) {
      alert('Este producto ya está en el carrito.');
      return;
    }

    // Buscar si hay un producto del tipo complementario en el carrito
    // Tv + Internet = Combo
    const tipoComplementario = producto.tipo === 'Tv' ? 'Internet' : producto.tipo === 'Internet' ? 'Tv' : null;

    if (tipoComplementario) {
      const productoComplementario = this.carrito.find(item =>
        item.tipo === 'producto' && item.tipoProducto === tipoComplementario
      );

      if (productoComplementario) {
        // Buscar el primer Combo disponible en la lista de productos
        const combo = this.productos.find(p => p.tipo === 'Combo');

        if (combo) {
          // Quitar el producto complementario del carrito
          const indice = this.carrito.indexOf(productoComplementario);
          this.carrito.splice(indice, 1);

          // Agregar el Combo en su lugar
          const itemCombo: ItemCarrito = {
            id: combo.id,
            nombre: combo.nombre,
            precio_lista: Number(combo.precio_lista),
            precio_final: Number(combo.precio_final),
            tipo: 'producto',
            tipoProducto: 'Combo'
          };
          this.carrito.push(itemCombo);

          alert(`Se reemplazó "${productoComplementario.nombre}" + "${producto.nombre}" por el Combo "${combo.nombre}".`);
          return;
        }
      }
    }

    // Si ya hay un Combo en el carrito, no dejar agregar Tv o Internet sueltos
    const hayCombo = this.carrito.some(item =>
      item.tipo === 'producto' && item.tipoProducto === 'Combo'
    );
    if (hayCombo && (producto.tipo === 'Tv' || producto.tipo === 'Internet')) {
      alert('Ya tenés un Combo en el carrito que incluye Tv + Internet.');
      return;
    }

    // Agregar el producto normalmente
    const item: ItemCarrito = {
      id: producto.id,
      nombre: producto.nombre,
      precio_lista: Number(producto.precio_lista),
      precio_final: Number(producto.precio_final),
      tipo: 'producto',
      tipoProducto: producto.tipo
    };
    this.carrito.push(item);
  }

  /**
   * Verifica si un adicional ya está en el carrito
   */
  adicionalEnCarrito(adicionalId: number): boolean {
    return this.carrito.some(item => item.tipo === 'adicional' && item.id === adicionalId);
  }

  /**
   * Agrega un adicional al carrito solo si:
   * 1. No está duplicado
   * 2. Hay un producto compatible en el carrito
   * Tv adicional -> requiere producto Tv o Combo en el carrito
   * Internet adicional -> requiere producto Internet o Combo en el carrito
   */
  agregarAdicionalAlCarrito(adicional: Adicional): void {
    // Verificar si ya está en el carrito
    if (this.adicionalEnCarrito(adicional.id)) {
      alert('Este adicional ya está en el carrito.');
      return;
    }

    // Verificar si hay un producto compatible en el carrito
    const tipoAdicional = adicional.tipo_compatible; // 'Tv' o 'Internet'
    const hayProductoCompatible = this.carrito.some(item =>
      item.tipo === 'producto' &&
      (item.tipoProducto === tipoAdicional || item.tipoProducto === 'Combo')
    );

    if (!hayProductoCompatible) {
      alert(`Para agregar este adicional necesitás un producto de tipo "${tipoAdicional}" o "Combo" en el carrito.`);
      return;
    }

    const item: ItemCarrito = {
      id: adicional.id,
      nombre: adicional.nombre,
      precio_lista: Number(adicional.precio_lista),
      precio_final: Number(adicional.precio_final),
      tipo: 'adicional'
    };
    this.carrito.push(item);
  }

  /**
   * Elimina un item del carrito por su índice
   */
  eliminarDelCarrito(indice: number): void {
    this.carrito.splice(indice, 1);
  }

  /**
   * Vacía el carrito completamente
   */
  vaciarCarrito(): void {
    this.carrito = [];
  }

  /**
   * Calcula la Primera Factura (suma de precios finales)
   * Usa Number() para asegurar que los valores sean numéricos
   */
  calcularPrimeraFactura(): number {
    return this.carrito.reduce((total, item) => total + Number(item.precio_final), 0);
  }

  /**
   * Calcula el Ahorro Total (diferencia entre precio lista y precio final)
   * Usa Number() para asegurar que los valores sean numéricos
   */
  calcularAhorroTotal(): number {
    return this.carrito.reduce((total, item) => total + (Number(item.precio_lista) - Number(item.precio_final)), 0);
  }
}
