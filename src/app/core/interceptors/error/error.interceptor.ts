import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../services/handle-error/handle-error';

/**
 * Interceptor global para manejo de errores HTTP.
 * Captura todos los errores de requests y los procesa de forma centralizada.
 */

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      errorHandler.handleError(error, req.url);
      return throwError(() => error);
    })
  );
};