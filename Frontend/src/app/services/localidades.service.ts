import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz que define la estructura de una localidad
export interface Localidad {
  id: number;
  nombre: string;
  provincia: string;
  disponibilidad: string; // 'CABA' o 'Resto Pais'
}

@Injectable({
  providedIn: 'root'
})
export class LocalidadesService {
  // URL base del backend
  private apiUrl = 'http://localhost:3001/api/localidades';

  // Inyectamos HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las localidades de Argentina
   * @returns Observable con el array de localidades
   */
  obtenerLocalidades(): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(this.apiUrl);
  }
}
