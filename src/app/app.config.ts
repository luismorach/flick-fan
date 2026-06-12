import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { IMAGE_LOADER, ImageLoaderConfig, registerLocaleData } from '@angular/common';
import localeVE from '@angular/common/locales/es-VE'
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';
import { apiInterceptor } from './core/interceptors/api/api.interceptor';
/* import { LocalStorageStrategy } from './core/services/local-storage-strategy/local-storage-strategy.service';
import { GlobalCacheConfig } from 'ngx-cacheable'; */
import { ApiService } from './core/services/API/api.service';
import { lastValueFrom } from 'rxjs';

registerLocaleData(localeVE, 'es-VE')

/* GlobalCacheConfig.storageStrategy = LocalStorageStrategy;
// (opcional) TTL global por defecto (ngx-cacheable usará maxAge en @Cacheable si se define)
GlobalCacheConfig.maxCacheCount = 200;
GlobalCacheConfig.maxAge = 15 * 60 *1000 */
export const appConfig: ApplicationConfig = {

  providers: [
    { provide: LOCALE_ID, useValue: 'es-VE' },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeGenres,
      deps: [ApiService],
      multi: true,
    },
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        const type = config.loaderParams?.['type'];
        if (config.src === 'fallback') {

          switch (type) {

            case 'poster':
              return '/assets/images/poster-default.webp';

            case 'backdrop':
              return '/assets/images/backdrop-default.webp';

            case 'backdrop-square':
              return '/assets/images/backdrop-square-default.webp';

            default:
              return '/assets/images/default-placeholder.webp';
          }
        }
        // 2. Si no hay ancho definido (src base), usamos 'original' o 'w500'
        const width = config.width && config.width <= 1920 ? `w${config.width}` : 'original';


        // 3. Retornar la URL construida para TMDB
        return `https://image.tmdb.org/t/p/${width}${config.src}`;
      }
    },
    provideRouter(routes), provideClientHydration(),
    provideAnimations(),
    provideHttpClient(withInterceptors([apiInterceptor, errorInterceptor]), withFetch()),
    /*  LocalStorageStrategy, */

  ]
};

export function initializeGenres(apiService: ApiService) {
  return () =>
    lastValueFrom(apiService.getGenres()).then((genres) => {
      apiService.allGenres.set(genres);
      console.log('✅ Géneros cargados al inicio:', genres);
    });
}
