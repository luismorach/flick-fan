import { EffectRef, ElementRef, Renderer2 } from "@angular/core";

type EventCallback<T = Event> = (event: T) => void

export class ListenerManager {

  constructor(private renderer: Renderer2) { }

  private cleanups: (() => void)[] = [];

  listen<T extends Event = Event>(
    element: HTMLElement | Element | ElementRef<HTMLElement>,
    eventName: string,
    callback: EventCallback<T>
  ): () => void {

    const targetElement = element instanceof ElementRef ? element.nativeElement : element;

    if (!targetElement) {
      throw new Error('[ListenerManager] Element is required');
    }

    if (!eventName) {
      throw new Error('[ListenerManager] Event name is required');
    }
    const cleanup = this.renderer.listen(targetElement, eventName, callback);
    this.cleanups.push(cleanup);
    return cleanup
  }

  cleanupAll(): void {
    const errors: Error[] = [];

    for (const fn of this.cleanups) {
      try {
        fn();
      } catch (err) {
        errors.push(err instanceof Error ? err : new Error(String(err)));
      }
    }

    this.cleanups = [];

    if (errors.length > 0) {
      console.error('[ListenerManager] Errors during cleanup:', errors);
    }
  }
}