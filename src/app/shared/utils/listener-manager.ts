import { EffectRef, Renderer2 } from "@angular/core";

export class ListenerManager {

  constructor(protected renderer: Renderer2) { }

  private cleanups: (() => void)[] = [];
  private effectRefs: EffectRef[] = [];

  listen(element: any, eventName: string, callback: (event: any) => void) {
    const cleanup = this.renderer.listen(element, eventName, callback);
    this.cleanups.push(cleanup);
  }

  cleanupAll() {
    for (const fn of this.cleanups) {
      try { fn(); } catch (err) { console.error(err); }
    }
    this.cleanups = [];
  }

  addEffectRef(effectRef: EffectRef) {
    this.effectRefs.push(effectRef)
  }

  destroyEffectRef() {
    this.effectRefs.forEach(ref => ref.destroy());
    this.effectRefs = [];
  }
}