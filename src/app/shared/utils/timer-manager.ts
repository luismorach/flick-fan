import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimerManager {
  private timeouts = new Set<number>();
  private animationFrames = new Set<number>();

  addTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(() => {
      callback();
      this.timeouts.delete(id);
    }, delay);
    this.timeouts.add(id);
    return id;
  }

  addAnimationFrame(callback: () => void): number {
    const id = window.requestAnimationFrame(() => {
      callback();
      this.animationFrames.delete(id);
    });
    this.animationFrames.add(id);
    return id;
  }

  clearTimeout(id: number): void {
    window.clearTimeout(id);
    this.timeouts.delete(id);
  }

  clearAnimationFrame(id: number): void {
    window.cancelAnimationFrame(id);
    this.animationFrames.delete(id);
  }

  clearAllTimeouts(): void {
    this.timeouts.forEach(id => window.clearTimeout(id));
    this.timeouts.clear();
  }

  clearAllAnimationFrames(): void {
    this.animationFrames.forEach(id => window.cancelAnimationFrame(id));
    this.animationFrames.clear();
  }

  clearAll(): void {
    this.clearAllTimeouts();
    this.clearAllAnimationFrames();
  }
}