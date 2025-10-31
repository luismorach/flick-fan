// src/app/core/services/swiper-registry.service.ts
import { Injectable } from '@angular/core';
import { register } from 'swiper/element/bundle';

@Injectable({ providedIn: 'root' })
export class SwiperRegistryService {
  private registered = false;

  registerOnce(): void {
    if (!this.registered) {
      register();
      this.registered = true;
      console.log('Swiper registered globally (once)');
    }
  }
}