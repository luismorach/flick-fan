import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { CardMoviePreviewComponent } from '../../../shared/components/carousel/carousel-movies/card-movie-preview/card-movie-preview.component';
import { Movie } from '../../interfaces/movie/movie.interface';
import { CarouselService } from '../test/carousel/carousel-service';

@Injectable({
  providedIn: 'root'
})
export class FloatCardService {
  private overlay = inject(Overlay);
  private ref?: OverlayRef;
  private openTimer?: ReturnType<typeof setTimeout>;
  private closeTimer?: ReturnType<typeof setTimeout>;

  show(origin: HTMLElement, movie: Movie, originExpand: 'start' | 'center' | 'end', carouselService: CarouselService<any, any>) {
    // sin hover real (táctil) no hacemos nada
    if (!matchMedia('(hover: hover)').matches) return;

    clearTimeout(this.closeTimer);
    clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => this.open(origin, movie, originExpand, carouselService), 120);
  }

  scheduleClose() {
    clearTimeout(this.openTimer);
    this.closeTimer = setTimeout(() => this.close(), 120);
  }

  cancelClose() {
    clearTimeout(this.closeTimer);
  }

  close() {
    this.ref?.dispose();
    this.ref = undefined;
  }

  private open(origin: HTMLElement, movie: Movie, originExpand: 'start' | 'center' | 'end', carouselService: CarouselService<any, any>) {
    this.close();
    const width = origin.getBoundingClientRect().width * 1.5;
    console.log('width', width, 'originExpand', originExpand, 'origin', origin.getBoundingClientRect());

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions([
        { originX: originExpand, originY: 'top', overlayX: originExpand, overlayY: 'top' },
      ])
      .withDefaultOffsetY(-48)
      .withViewportMargin(16)
      .withPush(false)
      .withFlexibleDimensions(false);

    this.ref = this.overlay.create({ positionStrategy, scrollStrategy: this.overlay.scrollStrategies.reposition(), width });
    const cmp = this.ref.attach(new ComponentPortal(CardMoviePreviewComponent));
    cmp.setInput('movie', movie);
    cmp.setInput('width', width);

    // si el mouse entra a la tarjeta flotante, no la cierres
    const el = this.ref.overlayElement;
    el.addEventListener('mouseenter', () => {
      this.cancelClose()
      carouselService.state().onPreviewMouseEnter()
    });
    el.addEventListener('mouseleave', () => {
      this.scheduleClose()
      carouselService.state().onPreviewMouseLeave()
    });
  }
}
