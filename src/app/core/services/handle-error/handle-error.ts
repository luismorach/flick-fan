import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environment/environment';

interface ErrorLog {
  timestamp: Date;
  url: string;
  status: number;
  message: string;
  error: any;
}

/**
 * Servicio centralizado para manejo de errores HTTP.
 * Procesa errores, los registra y notifica al usuario.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private errorLogs: ErrorLog[] = [];
  private readonly MAX_LOGS = 50;

  /**
   * Maneja un error HTTP de forma centralizada
   */
  handleError(error: HttpErrorResponse, url: string): void {
    const errorMessage = this.getErrorMessage(error);
    
    // Log del error
    this.logError(error, url, errorMessage);

    // Mostrar notificación al usuario
    this.notifyUser(error, errorMessage);

    // Log en consola solo en desarrollo
    if (!environment.production) {
      console.error('HTTP Error:', {
        url,
        status: error.status,
        message: errorMessage,
        error,
      });
    }
  }

  /**
   * Obtiene un mensaje de error amigable según el código de estado
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      return `Error de red: ${error.error.message}`;
    }

    // Error del servidor
    switch (error.status) {
      case 0:
        return 'Sin conexión a internet. Verifica tu conexión.';
      case 400:
        return 'Solicitud inválida. Verifica los datos enviados.';
      case 401:
        return 'No autorizado. Token inválido o expirado.';
      case 403:
        return 'Acceso denegado. No tienes permisos.';
      case 404:
        return 'Recurso no encontrado.';
      case 429:
        return 'Demasiadas solicitudes. Intenta más tarde.';
      case 500:
        return 'Error del servidor. Intenta más tarde.';
      case 502:
      case 503:
        return 'Servicio no disponible. Intenta más tarde.';
      case 504:
        return 'Tiempo de espera agotado. Intenta nuevamente.';
      default:
        return error.error?.status_message || 
               error.message || 
               'Error desconocido. Intenta nuevamente.';
    }
  }

  /**
   * Determina si se debe mostrar notificación al usuario
   */
  private notifyUser(error: HttpErrorResponse, message: string): void {
    // No mostrar notificación para ciertos errores
    const silentErrors = [401]; // Ej: 401 se maneja con redirección
    
    if (silentErrors.includes(error.status)) {
      return;
    }

  }

  private logError(error: HttpErrorResponse, url: string, message: string): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      url,
      status: error.status,
      message,
      error: {
        statusText: error.statusText,
        body: error.error,
      },
    };

    this.errorLogs.unshift(errorLog);

    // Mantener solo los últimos N logs
    if (this.errorLogs.length > this.MAX_LOGS) {
      this.errorLogs = this.errorLogs.slice(0, this.MAX_LOGS);
    }
  }

  /**
   * Obtiene los logs de errores (útil para debugging)
   */
  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  /**
   * Limpia los logs de errores
   */
  clearErrorLogs(): void {
    this.errorLogs = [];
  }

 
}