import { inject } from "@angular/core";
import { TimerManager } from "./timer-manager";
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HandleCardSeries{
    timerManager: TimerManager = inject(TimerManager)
    handleCardHover(
        event: MouseEvent,
        index: number,
        spaceBetween: number,
        timeoutDelay: number = 300
    ) {

        const child = event.target as HTMLElement;
        const parent = child.parentElement as HTMLElement;
        if (!child || !parent) return;

        this.timerManager.addTimeout(() => {
            if (index > 1) {
                parent.scrollLeft = (child.offsetLeft + Math.floor(child.offsetWidth * 2.8))
                    - parent.clientWidth - spaceBetween;
            }
        }, timeoutDelay);
    }

    resetCardHover(event: MouseEvent) {
        this.timerManager.clearAllTimeouts();
        const child = event.target as HTMLElement;
        const parent = child.parentElement as HTMLElement;
        if (!child || !parent) return;
        parent.scrollLeft = 0;
    }

}