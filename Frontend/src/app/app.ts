import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importamos los 4 componentes hijos
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CardProductoComponent } from './components/card-producto/card-producto.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { ToastComponent } from './components/toast/toast.component';
import { ModalConfirmacionComponent } from './components/modal-confirmacion/modal-confirmacion.component';

// Importamos los servicios para llamar a la API
import { LocalidadesService, Localidad } from './services/localidades.service';
import { ProductosService, Producto } from './services/productos.service';
import { AdicionalesService, Adicional } from './services/adicionales.service';

// Importamos la interfaz compartida del carrito
import { ItemCarrito } from './models/item-carrito.model';

/**
 * App (Componente Raíz / Padre)
 * 
 * Es el coordinador central de la aplicación.
 * - Almacena todos los datos (productos, carrito, localidades, adicionales)
 * - Contiene toda la lógica de negocio (validaciones, auto-combo, cálculos)
 * - Llama a los servicios HTTP para obtener datos de la API
 * - Pasa datos a los hijos con @Input y escucha sus eventos con @Output
 * 
 * Los componentes hijos (Sidebar, CardProducto, Carrito) solo se encargan
 * de mostrar datos y emitir eventos. No tienen lógica de negocio.
 */
@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    SidebarComponent,       // <app-sidebar>
    CardProductoComponent,  // <app-card-producto>
    CarritoComponent,       // <app-carrito>
    ToastComponent,              // <app-toast> - notificaciones en vez de alert()
    ModalConfirmacionComponent   // <app-modal-confirmacion> - confirmaciones en vez de confirm()
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  // --- Referencias a componentes de UI ---
  @ViewChild('toast') toast!: ToastComponent;
  @ViewChild('modalConfirmacion') modalConfirmacion!: ModalConfirmacionComponent;

  // --- Datos principales ---
  localidades: Localidad[] = [];                       // Localidades de Argentina
  productos: Producto[] = [];                          // Productos filtrados por disponibilidad
  adicionales: { [key: string]: Adicional[] } = {};    // Adicionales agrupados por tipo
  carrito: ItemCarrito[] = [];                         // Items en el carrito

  // --- Estado de la UI ---
  modoOscuro: boolean = false;                         // Toggle modo claro/oscuro
  localidadSeleccionada: Localidad | null = null;      // Localidad elegida
  tabActivo: string = 'Combo';                         // Tab activo (Combo, Tv, Internet)
  carritoAbierto: boolean = false;                     // Si el carrito está visible
  cargandoLocalidades: boolean = false;                // Indicador de carga localidades
  cargandoProductos: boolean = false;                  // Indicador de carga productos
  mensajeError: string = '';                           // Mensaje de error visible al usuario

  // --- Inyección de servicios ---
  constructor(
    private localidadesService: LocalidadesService,
    private productosService: ProductosService,
    private adicionalesService: AdicionalesService,
    private cdr: ChangeDetectorRef // Para forzar la actualización de la vista
  ) {}

  // --- Se ejecuta al iniciar el componente ---
  ngOnInit(): void {
    this.cargarLocalidades();
    this.cargarCarritoDesdeStorage();
  }

  // ================================================================
  // MÉTODOS QUE RESPONDEN A EVENTOS DEL SIDEBAR
  // ================================================================

  /**
   * Alterna entre modo claro y modo oscuro.
   * Se llama cuando el sidebar emite (alToggleModoOscuro).
   */
  toggleModoOscuro(): void {
    this.modoOscuro = !this.modoOscuro;
  }

  /**
   * Carga las localidades de Argentina desde el backend.
   * Muestra un indicador de carga mientras se descargan.
   */
  cargarLocalidades(): void {
    this.cargandoLocalidades = true;
    this.mensajeError = '';
    this.localidadesService.obtenerLocalidades().subscribe({
      next: (datos) => {
        this.localidades = datos;
        this.cargandoLocalidades = false;
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (error) => {
        console.error('Error al cargar localidades:', error);
        this.cargandoLocalidades = false;
        this.mensajeError = 'Error al cargar localidades. Verifique que el servidor esté corriendo.';
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Almacena la localidad seleccionada por el usuario.
   * Se llama cuando el sidebar emite (alSeleccionarLocalidad).
   */
  seleccionarLocalidad(localidad: Localidad): void {
    this.localidadSeleccionada = localidad;
  }

  /**
   * Filtra productos según la disponibilidad de la localidad seleccionada.
   * Si la disponibilidad cambió respecto a los productos actuales, vacía el carrito
   * para evitar que queden items de una zona distinta.
   * Se llama cuando el sidebar emite (alTraerOferta).
   */
  traerOferta(): void {
    if (!this.localidadSeleccionada) {
      this.toast.mostrar('Seleccione una localidad.', 'advertencia');
      return;
    }

    const disponibilidad = this.localidadSeleccionada.disponibilidad;

    // Si la disponibilidad cambió respecto a los productos actuales O a la zona guardada
    // en localStorage (caso recarga), vaciar el carrito para evitar inconsistencias
    const zonaGuardada = localStorage.getItem('carrito_zona');
    const zonaCambio = (this.productos.length > 0 && this.productos[0].disponibilidad !== disponibilidad)
                    || (zonaGuardada && zonaGuardada !== disponibilidad);

    if (zonaCambio && this.carrito.length > 0) {
      this.carrito = [];
      this.guardarCarritoEnStorage();
      this.toast.mostrar('El carrito se vació porque cambiaste de zona.', 'info');
    }

    this.cargandoProductos = true;
    this.mensajeError = '';

    this.productosService.obtenerProductosPorDisponibilidad(disponibilidad).subscribe({
      next: (datos) => {
        this.productos = datos;
        this.cargandoProductos = false;
        this.cdr.detectChanges(); // Forzar actualización de la vista
        this.cargarAdicionales();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.cargandoProductos = false;
        this.mensajeError = 'Error al cargar productos. Intente nuevamente.';
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Carga los adicionales para cada tipo de producto (Tv, Internet, Combo).
   */
  cargarAdicionales(): void {
    const tipos = ['Tv', 'Internet', 'Combo'];
    tipos.forEach(tipo => {
      this.adicionalesService.obtenerAdicionalesPorTipo(tipo).subscribe({
        next: (datos) => {
          this.adicionales[tipo] = datos;
          this.cdr.detectChanges(); // Forzar actualización de la vista
        },
        error: (error) => {
          console.error(`Error al cargar adicionales de ${tipo}:`, error);
          this.mensajeError = 'Error al cargar adicionales. Intente nuevamente.';
          this.cdr.detectChanges();
        }
      });
    });
  }

  /**
   * Limpia todo: productos, carrito, adicionales y selección.
   * Pide confirmación al usuario con un modal antes de ejecutar la acción destructiva.
   * Se llama cuando el sidebar emite (alBorrarTodo).
   */
  async borrarTodo(): Promise<void> {
    // Si no hay nada que borrar, no pedimos confirmación
    if (this.productos.length === 0 && this.carrito.length === 0) {
      this.localidadSeleccionada = null;
      return;
    }

    // Pedimos confirmación con el modal personalizado
    const confirmo = await this.modalConfirmacion.mostrar(
      '¿Estás seguro de que querés borrar todo? Se eliminarán las ofertas y el carrito.'
    );
    if (!confirmo) return;

    this.productos = [];
    this.carrito = [];
    this.adicionales = {};
    this.localidadSeleccionada = null;
    this.mensajeError = '';
    this.guardarCarritoEnStorage();
  }

  // ================================================================
  // MÉTODOS DE FILTRADO Y CONSULTA
  // ================================================================

  /**
   * Filtra productos por tipo para mostrar en el tab correspondiente.
   */
  obtenerProductosPorTipo(tipo: string): Producto[] {
    return this.productos.filter(p => p.tipo === tipo);
  }

  /**
   * Obtiene adicionales compatibles según el tipo de producto.
   * Combo muestra todos los adicionales, Tv e Internet solo los suyos.
   */
  obtenerAdicionalesParaProducto(tipoProducto: string): Adicional[] {
    if (tipoProducto === 'Combo') {
      return this.adicionales['Combo'] || [];
    }
    return this.adicionales[tipoProducto] || [];
  }

  /**
   * Verifica si un producto ya está en el carrito (por su id).
   */
  productoEnCarrito(productoId: number): boolean {
    return this.carrito.some(item => item.tipo === 'producto' && item.id === productoId);
  }

  /**
   * Devuelve un array con los IDs de adicionales que ya están en el carrito.
   * Se pasa como @Input al CardProductoComponent para que sepa cuáles deshabilitar.
   */
  obtenerIdsAdicionalesEnCarrito(): number[] {
    return this.carrito
      .filter(item => item.tipo === 'adicional')
      .map(item => item.id);
  }

  // ================================================================
  // LÓGICA DE NEGOCIO DEL CARRITO
  // ================================================================

  /**
   * Extrae la velocidad en MB del nombre de un producto.
   * Ejemplo: "Internet 100 MB" → "100 MB"
   * Se usa para matchear el combo correcto al hacer auto-combo.
   */
  extraerVelocidadMB(nombre: string): string | null {
    const match = nombre.match(/(\d+)\s*MB/i);
    return match ? match[1] + ' MB' : null;
  }

  /**
   * Agrega un producto al carrito con las siguientes validaciones:
   * 1. No permite duplicados (mismo producto)
   * 2. Solo permite un producto por tipo (un Internet, un Tv o un Combo)
   * 3. Si hay Tv en carrito y agregás Internet (o viceversa) → busca un Combo que coincida en velocidad MB
   * 4. Convierte precios a número para evitar concatenación de strings
   */
  agregarProductoAlCarrito(producto: Producto): void {
    // 1. No permitir duplicados
    if (this.productoEnCarrito(producto.id)) {
      this.toast.mostrar('Este producto ya está en el carrito.', 'advertencia');
      return;
    }

    // 2. Solo un producto por tipo
    const productoMismoTipo = this.carrito.find(item =>
      item.tipo === 'producto' && item.tipoProducto === producto.tipo
    );
    if (productoMismoTipo) {
      this.toast.mostrar(`Ya tenés "${productoMismoTipo.nombre}" en el carrito. Eliminalo primero para agregar otro de tipo ${producto.tipo}.`, 'advertencia');
      return;
    }

    // 3. Auto-combo: Tv + Internet = Combo
    const tipoComplementario = producto.tipo === 'Tv' ? 'Internet' : producto.tipo === 'Internet' ? 'Tv' : null;

    if (tipoComplementario) {
      const productoComplementario = this.carrito.find(item =>
        item.tipo === 'producto' && item.tipoProducto === tipoComplementario
      );

      if (productoComplementario) {
        // Determinar la velocidad MB del producto Internet
        const productoInternet = producto.tipo === 'Internet' ? producto : null;
        const internetEnCarrito = productoComplementario.tipoProducto === 'Internet' ? productoComplementario : null;

        const nombreInternet = productoInternet ? productoInternet.nombre : (internetEnCarrito ? internetEnCarrito.nombre : '');
        const velocidadMB = this.extraerVelocidadMB(nombreInternet);

        // Buscar un Combo que coincida en velocidad MB
        let combo: Producto | undefined;
        if (velocidadMB) {
          combo = this.productos.find(p => p.tipo === 'Combo' && p.nombre.includes(velocidadMB));
        }

        // Fallback: primer combo disponible
        if (!combo) {
          combo = this.productos.find(p => p.tipo === 'Combo');
        }

        if (combo) {
          const indice = this.carrito.indexOf(productoComplementario);
          this.carrito.splice(indice, 1);

          const itemCombo: ItemCarrito = {
            id: combo.id,
            nombre: combo.nombre,
            precio_lista: Number(combo.precio_lista),
            precio_final: Number(combo.precio_final),
            tipo: 'producto',
            tipoProducto: 'Combo'
          };
          this.carrito.push(itemCombo);
          this.guardarCarritoEnStorage();

          this.toast.mostrar(`Auto-combo: se reemplazó "${productoComplementario.nombre}" + "${producto.nombre}" por "${combo.nombre}".`, 'exito');
          return;
        }
      }
    }

    // 4. Combo y Tv/Internet son mutuamente excluyentes
    const hayCombo = this.carrito.some(item =>
      item.tipo === 'producto' && item.tipoProducto === 'Combo'
    );
    const hayTvOInternet = this.carrito.some(item =>
      item.tipo === 'producto' && (item.tipoProducto === 'Tv' || item.tipoProducto === 'Internet')
    );

    // Si ya hay un Combo, no agregar Tv o Internet sueltos
    if (hayCombo && (producto.tipo === 'Tv' || producto.tipo === 'Internet')) {
      this.toast.mostrar('Ya tenés un Combo en el carrito que incluye Tv + Internet.', 'advertencia');
      return;
    }

    // Si ya hay un Tv o Internet, no agregar un Combo
    if (hayTvOInternet && producto.tipo === 'Combo') {
      this.toast.mostrar('Ya tenés un producto de Tv o Internet en el carrito. Eliminalo primero para agregar un Combo.', 'advertencia');
      return;
    }

    // 5. Agregar normalmente
    const item: ItemCarrito = {
      id: producto.id,
      nombre: producto.nombre,
      precio_lista: Number(producto.precio_lista),
      precio_final: Number(producto.precio_final),
      tipo: 'producto',
      tipoProducto: producto.tipo
    };
    this.carrito.push(item);
    this.guardarCarritoEnStorage();
    this.toast.mostrar(`"${producto.nombre}" agregado al carrito.`, 'exito');
  }

  /**
   * Agrega un adicional al carrito solo si:
   * 1. No está duplicado
   * 2. Hay un producto compatible en el carrito (Tv, Internet o Combo)
   */
  agregarAdicionalAlCarrito(adicional: Adicional): void {
    // Verificar duplicado
    const yaEsta = this.carrito.some(item => item.tipo === 'adicional' && item.id === adicional.id);
    if (yaEsta) {
      this.toast.mostrar('Este adicional ya está en el carrito.', 'advertencia');
      return;
    }

    // Verificar compatibilidad
    const tipoAdicional = adicional.tipo_compatible;
    const hayProductoCompatible = this.carrito.some(item =>
      item.tipo === 'producto' &&
      (item.tipoProducto === tipoAdicional || item.tipoProducto === 'Combo')
    );

    if (!hayProductoCompatible) {
      this.toast.mostrar(`Para agregar este adicional necesitás un producto de tipo "${tipoAdicional}" o "Combo" en el carrito.`, 'info');
      return;
    }

    const item: ItemCarrito = {
      id: adicional.id,
      nombre: adicional.nombre,
      precio_lista: Number(adicional.precio_lista),
      precio_final: Number(adicional.precio_final),
      tipo: 'adicional',
      tipoAdicional: adicional.tipo_compatible // Guardamos 'Tv' o 'Internet' para mostrar en el carrito
    };
    this.carrito.push(item);
    this.guardarCarritoEnStorage();
    this.toast.mostrar(`Adicional "${adicional.nombre}" agregado al carrito.`, 'exito');
  }

  // ================================================================
  // MÉTODOS QUE RESPONDEN A EVENTOS DEL CARRITO
  // ================================================================

  /**
   * Elimina un item del carrito por su índice.
   * Si se elimina un producto, también elimina los adicionales huérfanos
   * que dependían de ese producto (para no dejar items incompatibles).
   * Se llama cuando el carrito emite (alEliminarItem).
   */
  eliminarDelCarrito(indice: number): void {
    const itemEliminado = this.carrito[indice];
    this.carrito.splice(indice, 1);

    // Si se eliminó un producto, verificar si quedan adicionales huérfanos
    if (itemEliminado.tipo === 'producto') {
      this.eliminarAdicionalesHuerfanos();
    }

    this.guardarCarritoEnStorage();
  }

  /**
   * Elimina del carrito los adicionales que ya no tienen un producto compatible.
   * Ejemplo: si eliminás el producto Tv, los adicionales de tipo "Tv" se eliminan
   * (a menos que haya un Combo en el carrito, que es compatible con todo).
   */
  eliminarAdicionalesHuerfanos(): void {
    // Verificamos si queda un Combo (compatible con todos los adicionales)
    const hayCombo = this.carrito.some(item =>
      item.tipo === 'producto' && item.tipoProducto === 'Combo'
    );

    // Si hay un Combo, todos los adicionales son compatibles → no eliminamos nada
    if (hayCombo) return;

    // Obtenemos los tipos de productos que quedan en el carrito
    const tiposProductosEnCarrito = this.carrito
      .filter(item => item.tipo === 'producto')
      .map(item => item.tipoProducto);

    // Filtramos: solo quedan los adicionales cuyo tipoAdicional tiene un producto compatible
    const carritoLimpio = this.carrito.filter(item => {
      // Los productos siempre se quedan
      if (item.tipo === 'producto') return true;

      // Los adicionales solo se quedan si hay un producto de su tipo
      return tiposProductosEnCarrito.includes(item.tipoAdicional);
    });

    // Si se eliminaron adicionales, avisamos al usuario
    const eliminados = this.carrito.length - carritoLimpio.length;
    if (eliminados > 0) {
      this.carrito = carritoLimpio;
      this.toast.mostrar(`Se eliminaron ${eliminados} adicional(es) sin producto compatible.`, 'info');
    }
  }

  /**
   * Vacía el carrito completamente.
   * Pide confirmación al usuario con un modal antes de ejecutar la acción destructiva.
   * Se llama cuando el carrito emite (alVaciarCarrito).
   */
  async vaciarCarrito(): Promise<void> {
    if (this.carrito.length === 0) return;

    // Pedimos confirmación con el modal personalizado
    const confirmo = await this.modalConfirmacion.mostrar(
      '¿Estás seguro de que querés vaciar el carrito?'
    );
    if (!confirmo) return;

    this.carrito = [];
    this.guardarCarritoEnStorage();
  }

  // ================================================================
  // PERSISTENCIA EN LOCALSTORAGE
  // ================================================================

  /**
   * Guarda el carrito actual en localStorage para que persista
   * si el usuario recarga la página.
   * También guarda la disponibilidad de la zona actual para poder
   * validar la compatibilidad al recargar.
   */
  guardarCarritoEnStorage(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
    // Guardamos la disponibilidad de la zona para validar al recargar
    if (this.productos.length > 0) {
      localStorage.setItem('carrito_zona', this.productos[0].disponibilidad);
    }
  }

  /**
   * Carga el carrito guardado desde localStorage al iniciar la app.
   * Si no hay datos guardados o son inválidos, el carrito queda vacío.
   * El carrito se limpiará automáticamente si la zona cambia al traer ofertas.
   */
  cargarCarritoDesdeStorage(): void {
    try {
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        this.carrito = JSON.parse(carritoGuardado);
      }
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
      this.carrito = [];
    }
  }

  // ================================================================
  // CÁLCULOS
  // ================================================================

  /**
   * Calcula la suma de precios de lista (sin promoción) del carrito.
   */
  calcularPrecioListaTotal(): number {
    return this.carrito.reduce((total, item) => total + Number(item.precio_lista), 0);
  }

  /**
   * Calcula la Primera Factura (suma de precios finales / con promoción).
   */
  calcularPrimeraFactura(): number {
    return this.carrito.reduce((total, item) => total + Number(item.precio_final), 0);
  }

  /**
   * Calcula el Ahorro Total (diferencia entre precio lista y precio final).
   */
  calcularAhorroTotal(): number {
    return this.carrito.reduce((total, item) => total + (Number(item.precio_lista) - Number(item.precio_final)), 0);
  }
}
