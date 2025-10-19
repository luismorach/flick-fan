import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../environment/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.tmdb.API_URL;
  const apiKey = environment.tmdb.API_KEY;

  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  if (!apiKey) {
    console.error('⚠️ Token de TMDB no configurado');
    return throwError(() => new Error('TMDB Token missing'));
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  
  return next(authReq)
};
