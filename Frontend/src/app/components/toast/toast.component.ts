import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para definir un mensaje toast (notificación temporal).
 */
export interface MensajeToast {
  texto: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
}

/**
 * Componente Toast: muestra notificaciones temporales en la esquina inferior derecha.
 * Aparece con animación, dura unos segundos y se cierra solo (o el usuario puede cerrarlo).
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let msg of mensajes; let i = index"
        class="toast"
        [class.toast-exito]="msg.tipo === 'exito'"
        [class.toast-error]="msg.tipo === 'error'"
        [class.toast-info]="msg.tipo === 'info'"
        [class.toast-advertencia]="msg.tipo === 'advertencia'">
        <span class="toast-icono">
          {{ msg.tipo === 'exito' ? '✅' : msg.tipo === 'error' ? '❌' : msg.tipo === 'advertencia' ? '⚠️' : 'ℹ️' }}
        </span>
        <span class="toast-texto">{{ msg.texto }}</span>
        <button class="toast-cerrar" (click)="cerrar(i)">✕</button>
      </div>
    </div>
  `,
  styles: [`
    /* Contenedor fijo en la esquina inferior derecha */
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column-reverse;
      gap: 10px;
      max-width: 420px;
    }

    /* Estilo base del toast */
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      font-size: 0.9rem;
      animation: slideIn 0.3s ease-out;
      min-width: 280px;
    }

    /* Animación de entrada */
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Variantes de color según el tipo */
    .toast-exito {
      background-color: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .toast-error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .toast-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }

    .toast-advertencia {
      background-color: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }

    .toast-icono {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .toast-texto {
      flex: 1;
      line-height: 1.4;
    }

    .toast-cerrar {
      background: transparent;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      opacity: 0.6;
      padding: 0 4px;
      flex-shrink: 0;
    }

    .toast-cerrar:hover {
      opacity: 1;
    }

    /* ========== MODO OSCURO ========== */
    :host-context(.modo-oscuro) .toast-exito {
      background-color: #1a3a2a;
      color: #81c995;
      border-left-color: #4caf50;
    }

    :host-context(.modo-oscuro) .toast-error {
      background-color: #3a1a1a;
      color: #ff8a80;
      border-left-color: #ef5350;
    }

    :host-context(.modo-oscuro) .toast-info {
      background-color: #1a2a3a;
      color: #80cbc4;
      border-left-color: #26c6da;
    }

    :host-context(.modo-oscuro) .toast-advertencia {
      background-color: #3a3000;
      color: #ffd54f;
      border-left-color: #ffb300;
    }

    :host-context(.modo-oscuro) .toast-cerrar {
      color: #ccc;
    }
  `]
})
export class ToastComponent {
  /** Array de mensajes activos que se muestran en pantalla */
  mensajes: MensajeToast[] = [];

  /**
   * Muestra un toast con un mensaje y tipo.
   * Se auto-elimina después de 4 segundos.
   * @param texto - Texto del mensaje a mostrar
   * @param tipo - Tipo de toast: 'exito', 'error', 'info' o 'advertencia'
   */
  mostrar(texto: string, tipo: MensajeToast['tipo'] = 'info'): void {
    const mensaje: MensajeToast = { texto, tipo };
    this.mensajes.push(mensaje);

    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
      const indice = this.mensajes.indexOf(mensaje);
      if (indice > -1) {
        this.mensajes.splice(indice, 1);
      }
    }, 4000);
  }

  /**
   * Cierra un toast manualmente por su índice.
   */
  cerrar(indice: number): void {
    this.mensajes.splice(indice, 1);
  }
}
