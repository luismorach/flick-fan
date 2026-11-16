import { Injectable } from '@angular/core';

@Injectable()
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

  clearTimeout(id: number): void {
    if (this.timeouts.has(id)) {
      window.clearTimeout(id);
      this.timeouts.delete(id);
    }
  }

  clearAllTimeouts(): void {
    this.timeouts.forEach(id => window.clearTimeout(id));
    this.timeouts.clear();
  }

  ngOnDestroy(): void {
    this.clearAllTimeouts()
  }
}