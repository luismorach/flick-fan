import { DestroyRef, inject, Injectable, Injector, signal } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import PlayTrailerComponent from '../../../shared/components/play-trailer/play-trailer.component';
import { ComponentPortal } from '@angular/cdk/portal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


const OVERLAY_CONFIG = {
  POSITION: {
    BOTTOM: '20px',
    RIGHT: '20px'
  },
  CLASSES: {
    NORMAL: 'player-frame--normal',
    MINI: 'player-frame--mini',
    BASE: 'trailer-overlay',
    BACKDROP: 'cdk-overlay-dark-backdrop',
    BACKDROP_HIDDEN: 'backdrop-hidden'
  }
} as const;

@Injectable({
  providedIn: 'root'
})

export class FloatTrailerService {

  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private overlayRef?: OverlayRef;

  readonly videoKey = signal('')
  readonly minimized = signal(false);

  showTrailer(videoKey: string |undefined) {
    if (!videoKey) return;
    if (this.overlayRef) return;

    this.videoKey.set(videoKey)
    this.overlayRef = this.createOverlay()
    const portal = new ComponentPortal(PlayTrailerComponent, null, this.injector);
    this.overlayRef.attach(portal);
    this.overlayRef.addPanelClass(OVERLAY_CONFIG.CLASSES.NORMAL);

    this.overlayRef.backdropClick()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.minimize());
  }

  private createOverlay(): OverlayRef {
    return this.overlay.create({
      positionStrategy: this.getCenteredPositionStrategy(),
      hasBackdrop: true,
      backdropClass: OVERLAY_CONFIG.CLASSES.BACKDROP,
      scrollStrategy: this.overlay.scrollStrategies.noop(), // permanece fijo con scroll
      panelClass: [OVERLAY_CONFIG.CLASSES.BASE],
    });
  }

  private minimize(): void {
    this.overlayRef?.updatePositionStrategy(this.getMinimizedPositionStrategy());
    this.setSize(true);
  }

  maximize(): void {
    this.overlayRef?.updatePositionStrategy(this.getCenteredPositionStrategy());
    this.setSize(false);
  }

  private setSize(isMinimized: boolean): void {
    if (!this.overlayRef?.backdropElement) return;

    const backdrop = this.overlayRef.backdropElement;
    const ref = this.overlayRef;
    const { NORMAL, MINI, BACKDROP_HIDDEN } = OVERLAY_CONFIG.CLASSES;
    ref.removePanelClass(NORMAL);
    ref.removePanelClass(MINI);
    ref.addPanelClass(isMinimized ? MINI : NORMAL);
    backdrop.classList.toggle(BACKDROP_HIDDEN, isMinimized);
    this.minimized.set(isMinimized)
  }

  private getMinimizedPositionStrategy() {
    return this.overlay.position().global()
      .bottom(OVERLAY_CONFIG.POSITION.BOTTOM) // Corresponde aproximadamente a bottom-5 de Tailwind
      .right(OVERLAY_CONFIG.POSITION.RIGHT); // Corresponde aproximadamente a right-5 de Tailwind
  }

  private getCenteredPositionStrategy() {
    return this.overlay.position().global()
      .centerHorizontally().centerVertically();
  }

  setVideoKey(videoKey: string | undefined): void {
    if (!videoKey) return;
    this.videoKey.set(videoKey)
  }

  hideTrailer(): void {
    if (!this.overlayRef) return;

    this.overlayRef.dispose();
    this.overlayRef = undefined;
    this.minimized.set(false);
    this.videoKey.set('');
  }
}
