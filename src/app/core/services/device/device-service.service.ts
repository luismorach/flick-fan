import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

@Injectable({
  providedIn: 'root'
})

export class DeviceService {
  private breakpointObserver = inject(BreakpointObserver);

  private readonly breakpoints = toSignal(
    this.breakpointObserver.observe([
      '(max-width: 599px)',
      '(min-width: 600px) and (max-width: 1023px)',
      '(min-width: 1024px)',
    ]).pipe(
      map(({ breakpoints }): DeviceType => {
        if (breakpoints['(max-width: 599px)']) {
          return 'mobile';
        }

        if (
          breakpoints[
            '(min-width: 600px) and (max-width: 1023px)'
          ]
        ) {
          return 'tablet';
        }

        return 'desktop';
      })
    ),
    { initialValue: 'desktop' as DeviceType }
  );

  readonly device = computed(() => this.breakpoints());

  readonly isMobile = computed(() => this.device() === 'mobile');
  readonly isTablet = computed(() => this.device() === 'tablet');
  readonly isDesktop = computed(() => this.device() === 'desktop');
}






