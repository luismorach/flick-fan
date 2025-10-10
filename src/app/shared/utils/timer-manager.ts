import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimerManager {
  private timeouts = new Set<number>();
  private animationFrames = new Set<number>();

  addTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(() => {
      try {
        callback();
      } finally {
        this.timeouts.delete(id);
      }
    }, delay);
    this.timeouts.add(id);
    return id;
  }

  addAnimationFrame(callback: () => void): number {
    const id = window.requestAnimationFrame(() => {
      try {
        callback();
      } finally {
        this.animationFrames.delete(id);
      }
    });
    this.animationFrames.add(id);
    return id;
  }

  clearTimeout(id: number): void {
    if (this.timeouts.has(id)) {
      window.clearTimeout(id);
      this.timeouts.delete(id);
    }
  }

  clearAnimationFrame(id: number): void {
    if (this.animationFrames.has(id)) {
      window.cancelAnimationFrame(id);
      this.animationFrames.delete(id);
    }
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

  ngOnDestroy(): void {
    this.clearAll();
  }
}