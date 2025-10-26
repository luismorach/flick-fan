import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ScrollConfigService {
  readonly SCROLL_CONFIG = {
    distance: 2,
    throttle: 300,
  } as const;
}