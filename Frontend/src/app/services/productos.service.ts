import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz que define la estructura de un producto
export interface Producto {
  id: number;
  disponibilidad: string;
  tipo: string;       // 'Tv', 'Internet' o 'Combo'
  nombre: string;
  precio_lista: number;
  promo: string | null;
  id_promo: string | null;
  precio_final: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = 'http://localhost:3001/api/productos';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene productos filtrados por disponibilidad
   * @param disponibilidad - 'CABA' o 'Resto Pais'
   * @returns Observable con el array de productos
   */
  obtenerProductosPorDisponibilidad(disponibilidad: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}?disponibilidad=${disponibilidad}`);
  }
}
