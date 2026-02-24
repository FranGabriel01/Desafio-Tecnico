import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz que define la estructura de un adicional
export interface Adicional {
  id: number;
  tipo_compatible: string; // 'Tv' o 'Internet'
  nombre: string;
  precio_lista: number;
  promo: string | null;
  id_promo: string | null;
  precio_final: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdicionalesService {
  private apiUrl = 'http://localhost:3001/api/adicionales';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene adicionales filtrados por tipo de producto
   * @param tipoProducto - 'Tv', 'Internet' o 'Combo'
   * @returns Observable con el array de adicionales
   */
  obtenerAdicionalesPorTipo(tipoProducto: string): Observable<Adicional[]> {
    return this.http.get<Adicional[]>(`${this.apiUrl}?tipoProducto=${tipoProducto}`);
  }
}
