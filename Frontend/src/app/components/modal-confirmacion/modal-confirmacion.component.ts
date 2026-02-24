import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ModalConfirmacionComponent
 * 
 * Modal reutilizable para pedir confirmación al usuario antes de acciones destructivas.
 * Reemplaza el confirm() nativo del navegador con un diseño personalizado.
 * 
 * Se controla desde el componente padre mediante el método mostrar(), que devuelve
 * una Promise<boolean> (true si confirma, false si cancela).
 * 
 * Ejemplo de uso desde el padre:
 *   const confirmo = await this.modal.mostrar('¿Estás seguro?');
 *   if (confirmo) { ... }
 */
@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Fondo oscuro semi-transparente que cubre toda la pantalla -->
    <div class="modal-overlay" *ngIf="visible" (click)="cancelar()">
      <!-- Caja del modal (click.stop evita que se cierre al clickear dentro) -->
      <div class="modal-caja" (click)="$event.stopPropagation()">
        <div class="modal-icono">⚠️</div>
        <p class="modal-mensaje">{{ mensaje }}</p>
        <div class="modal-botones">
          <button class="btn-cancelar" (click)="cancelar()">Cancelar</button>
          <button class="btn-confirmar" (click)="confirmar()">Confirmar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Fondo oscuro que cubre toda la pantalla */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Caja central del modal */
    .modal-caja {
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      animation: scaleIn 0.2s ease-out;
    }

    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-icono {
      font-size: 2.5rem;
      margin-bottom: 12px;
    }

    .modal-mensaje {
      font-size: 1rem;
      color: #333;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    /* Contenedor de botones */
    .modal-botones {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .btn-cancelar, .btn-confirmar {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
    }

    .btn-cancelar {
      background-color: #e0e0e0;
      color: #333;
    }

    .btn-cancelar:hover {
      background-color: #d0d0d0;
    }

    .btn-confirmar {
      background-color: #e17055;
      color: white;
    }

    .btn-confirmar:hover {
      background-color: #d15045;
    }

    .btn-cancelar:active, .btn-confirmar:active {
      transform: scale(0.97);
    }

    /* ========== MODO OSCURO ========== */
    :host-context(.modo-oscuro) .modal-caja {
      background: #2a2a3e;
    }

    :host-context(.modo-oscuro) .modal-mensaje {
      color: #e0e0e0;
    }

    :host-context(.modo-oscuro) .btn-cancelar {
      background-color: #444;
      color: #e0e0e0;
    }

    :host-context(.modo-oscuro) .btn-cancelar:hover {
      background-color: #555;
    }
  `]
})
export class ModalConfirmacionComponent {
  /** Controla si el modal se muestra o no */
  visible: boolean = false;

  /** Texto que se muestra en el modal */
  mensaje: string = '';

  /** Función que resuelve la Promise cuando el usuario elige */
  private resolver: ((valor: boolean) => void) | null = null;

  /**
   * Muestra el modal con un mensaje y devuelve una Promise.
   * La Promise se resuelve con `true` si confirma, `false` si cancela.
   * 
   * @param mensaje - Texto a mostrar en el modal
   * @returns Promise<boolean> - resultado de la confirmación
   */
  mostrar(mensaje: string): Promise<boolean> {
    this.mensaje = mensaje;
    this.visible = true;

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  /** El usuario presionó "Confirmar" */
  confirmar(): void {
    this.visible = false;
    if (this.resolver) {
      this.resolver(true);
      this.resolver = null;
    }
  }

  /** El usuario presionó "Cancelar" o clickeó fuera del modal */
  cancelar(): void {
    this.visible = false;
    if (this.resolver) {
      this.resolver(false);
      this.resolver = null;
    }
  }
}
