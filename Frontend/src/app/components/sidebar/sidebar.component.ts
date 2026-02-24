import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Localidad } from '../../services/localidades.service';

/**
 * SidebarComponent
 * 
 * Componente hijo que muestra la barra lateral con:
 * - Selector de localidad (dropdown)
 * - Botones "Traer Oferta" y "Borrar Todo"
 * - Toggle de modo oscuro
 * 
 * No tiene lógica de negocio: solo recibe datos (@Input) y emite eventos (@Output)
 * para que el padre (App) ejecute las acciones.
 */
@Component({
  selector: 'app-sidebar',               // Así se usa en el HTML: <app-sidebar>
  standalone: true,                       // Componente independiente (no necesita un módulo)
  imports: [CommonModule, FormsModule],   // Módulos que necesita (ngIf, ngFor, ngModel)
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  // ========== @Input() - Datos que RECIBE del padre ==========

  /** Lista de localidades para mostrar en el dropdown */
  @Input() localidades: Localidad[] = [];

  /** Indica si las localidades se están cargando (para mostrar "Cargando...") */
  @Input() cargandoLocalidades: boolean = false;

  /** Estado actual del modo oscuro (para cambiar el ícono ☀️/🌙) */
  @Input() modoOscuro: boolean = false;

  // ========== @Output() - Eventos que EMITE al padre ==========

  /** Se emite cuando el usuario selecciona una localidad en el dropdown */
  @Output() alSeleccionarLocalidad = new EventEmitter<Localidad>();

  /** Se emite cuando el usuario presiona "Traer Oferta" */
  @Output() alTraerOferta = new EventEmitter<void>();

  /** Se emite cuando el usuario presiona "Borrar Todo" */
  @Output() alBorrarTodo = new EventEmitter<void>();

  /** Se emite cuando el usuario presiona el botón de modo oscuro */
  @Output() alToggleModoOscuro = new EventEmitter<void>();

  // ========== @Input() adicional para controlar el dropdown desde el padre ==========

  /** 
   * Localidad seleccionada, controlada por el padre.
   * El padre la pone en null cuando confirma "Borrar Todo",
   * así el dropdown se limpia SOLO después de la confirmación.
   */
  @Input() localidadSeleccionada: Localidad | null = null;

  /**
   * Se ejecuta cuando el usuario cambia la selección en el dropdown.
   * Emite la localidad seleccionada al padre para que la almacene.
   */
  alCambiarLocalidad(): void {
    if (this.localidadSeleccionada) {
      this.alSeleccionarLocalidad.emit(this.localidadSeleccionada);
    }
  }

  /**
   * Se ejecuta al presionar "Traer Oferta".
   * Simplemente emite el evento, el padre decide qué hacer.
   */
  traerOferta(): void {
    this.alTraerOferta.emit();
  }

  /**
   * Se ejecuta al presionar "Borrar Todo".
   * Solo emite el evento. NO limpia el dropdown acá.
   * El padre decide si confirmar y recién ahí pone localidadSeleccionada = null.
   */
  borrarTodo(): void {
    this.alBorrarTodo.emit();
  }

  /**
   * Se ejecuta al presionar el ícono de modo oscuro.
   * Emite el evento, el padre se encarga de cambiar el estado global.
   */
  toggleModoOscuro(): void {
    this.alToggleModoOscuro.emit();
  }
}
