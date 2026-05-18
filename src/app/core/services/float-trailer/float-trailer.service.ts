import { ComponentRef, DestroyRef, effect, EffectRef, inject, Injectable, INJECTOR, runInInjectionContext, Signal, signal, untracked } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import TrailerComponent from '../../../shared/components/trailer/trailer.component';
import { getKeyTrailer } from '../../../shared/utils/helpers';
import { Videos } from '../../interfaces/media/videos.interface';

const OVERLAY_CONFIG = {
  CLASSES: {
    BASE: 'trailer-overlay',
    BACKDROP: 'cdk-overlay-dark-backdrop',
    BACKDROP_HIDDEN: 'backdrop-hidden'
  }
} as const;

/**
 * Service for managing floating and embedded YouTube trailer players.
 *
 * Handles the creation and lifecycle of trailer overlays in two modes:
 * - **Float**: Centered overlay with backdrop that can be minimized to a draggable mini-player.
 * - **Embed**: Inline player attached to a portal outlet with fade animations.
 *
 * The service manages a single shared {@link ComponentPortal} for efficiency.
 * The floating trailer supports:
 * - Minimization (hides backdrop for navigation)
 * - Maximization via button on mini-player
 * - Live video ID updates via signal reactivity
 * - Backdrop click to minimize (only when maximized)
 *
 * @example
 * ```typescript
 * // Show floating trailer
 * floatTrailerService.showTrailer('dQw4w9WgXcQ');
 *
 * // Show embedded trailer
 * floatTrailerService.showTrailerEmbed('dQw4w9WgXcQ', portalOutlet);
 *
 * // Hide floating trailer
 * floatTrailerService.hideFloatTrailer();
 * ```
 */
@Injectable({
  providedIn: 'root'
})

export class FloatTrailerService {

  private readonly overlay = inject(Overlay);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(INJECTOR)
  private overlayRef?: OverlayRef;
  private attachedRef?: ComponentRef<TrailerComponent>
  private activeOutlet?: CdkPortalOutlet;
  private readonly portal: ComponentPortal<TrailerComponent>
  private currentEffect?: EffectRef
  private currentOwner?: object;

  /** Signal containing the current video key */
  private readonly videoKey = signal('')

  /** Signal indicating whether the floating trailer is minimized */
  private readonly _isMinimized = signal(false);
  readonly isMinimized = this._isMinimized.asReadonly()

  constructor() {
    this.portal = new ComponentPortal(TrailerComponent);

  }

  /**
   * Displays the trailer in a floating overlay centered on the screen
   * 
   * Creates a modal overlay with backdrop that can be minimized to bottom-right corner.
   * If an overlay is already active, this method does nothing.
   * 
   * @param videoKey - YouTube video ID (e.g., 'dQw4w9WgXcQ')
   * @returns void
   * 
   * @example
   * ```typescript
   * floatTrailerService.showTrailer('dQw4w9WgXcQ');
   * ```
   */
  playFloatTrailer(videoKey: string | undefined) {
    if (!videoKey?.trim()) return;
    if (this.overlayRef) return;

    this.videoKey.set(videoKey)
    this.overlayRef = this.createOverlay()
    const attachedRef = this.overlayRef.attach(this.portal);
    attachedRef.instance.videoKey = this.videoKey
    attachedRef.instance.mode.set('float')
    this.setupBackdropInteraction()
  }

  register<T extends { videos: Videos }>(owner: object, media: Signal<T | undefined>) {
    if (this.currentOwner === owner) return

    this.currentEffect?.destroy();

    this.currentOwner = owner;

    runInInjectionContext(this.injector, () => {
      this.currentEffect = effect(() => {
        const mediaRef = media()
        if (!mediaRef) return
        const videos = mediaRef.videos
        console.log('videos', videos)
        untracked(() => {
          const keyTrailer = getKeyTrailer(videos)
          if (!this.overlayRef || !this.attachedRef) {
            this.overlayRef = this.createOverlay()
            this.attachedRef = this.overlayRef.attach(this.portal);
          }

          if (!keyTrailer) {
            console.log('trailer key', keyTrailer)
            this.attachedRef?.instance.hasError.set(true)
          } else {
            this.attachedRef?.instance.hasError.set(false)
            this.videoKey.set(keyTrailer)
            this.attachedRef.instance.videoKey = this.videoKey
            this.attachedRef.instance.mode.set('float')
            this.setupBackdropInteraction()
          }
        })
      })
    })
  }

  /**
   * Displays the trailer embedded inline in a portal outlet with fade animation
   * 
   * Attaches the trailer component to the provided outlet and applies fade-in
   * animations to both the video player and control button. Automatically closes
   * when the video ends.
   * 
   * @param videoKey - YouTube video ID (e.g., 'dQw4w9WgXcQ')
   * @param outlet - CDK portal outlet where the component will be rendered
   * @returns void
   * 
   * @example
   * ```typescript
   * floatTrailerService.showTrailerEmbed('dQw4w9WgXcQ', this.portalOutlet);
   * ```
   */
  playTrailerEmbed(videoKey: string | undefined, outlet: CdkPortalOutlet) {
    if (!videoKey?.trim()) return;

    this.activeOutlet = outlet;
    const attachedRef = outlet.attachComponentPortal(this.portal)
    attachedRef.instance.videoKey.set(videoKey)
    attachedRef.instance.mode.set('embed')
  }

  /**
   * Sets up backdrop click interaction to minimize the floating trailer.
   *
   * Only active when the trailer is maximized.
   * When minimized, the backdrop is hidden and does not interfere with navigation.
   *
   * @internal
   */
  private setupBackdropInteraction(): void {
    if (!this.overlayRef) return;

    this.overlayRef.backdropClick()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.minimizeFloatTrailer());
  }

  /**
  * Detaches the embedded trailer from its portal outlet
  * 
  * Removes the trailer component from the active outlet and clears the reference.
  * Safe to call even if no trailer is currently embedded.
  * 
  * @returns void
  * 
  * @example
  * ```typescript
  * floatTrailerService.detachTrailerEmbed();
  * ```
  */
  detachTrailerEmbed() {
    if (!this.activeOutlet) return
    this.activeOutlet.detach();
    this.activeOutlet = undefined;
  }

  private createOverlay(): OverlayRef {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: OVERLAY_CONFIG.CLASSES.BACKDROP,
      scrollStrategy: this.overlay.scrollStrategies.noop(), // permanece fijo con scroll
      panelClass: [OVERLAY_CONFIG.CLASSES.BASE],
    });
  }

  private minimizeFloatTrailer(): void {
    this._isMinimized.set(true)
    this.hideBackdrop(true)
  }

  maximizeFloatTrailer(): void {
    this._isMinimized.set(false)
    this.hideBackdrop(false)
  }

  private hideBackdrop(isMinimized: boolean) {
    if (!this.overlayRef?.backdropElement) return;

    const backdrop = this.overlayRef.backdropElement;
    const { BACKDROP_HIDDEN } = OVERLAY_CONFIG.CLASSES;
    backdrop.classList.toggle(BACKDROP_HIDDEN, isMinimized);
  }

  hideFloatTrailer(): void {
    if (!this.overlayRef) return;

    this.overlayRef.dispose();
    this.overlayRef = undefined;
    this._isMinimized.set(false);
    this.videoKey.set('');
    this.currentEffect?.destroy()
    this.currentOwner=undefined
  }

  hasTrailer(): boolean {
    return this.videoKey() !== '';
  }
  
}
