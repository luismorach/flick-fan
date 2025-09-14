import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeVE from '@angular/common/locales/es-VE'
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

registerLocaleData(localeVE,'es-VE')

export const appConfig: ApplicationConfig = {
  
  providers: [
    {provide:LOCALE_ID,useValue:'es-VE'},
    provideRouter(routes), provideClientHydration(),
    provideAnimations(),
    provideHttpClient(withInterceptors([apiInterceptor]),withFetch())
  ]
};
