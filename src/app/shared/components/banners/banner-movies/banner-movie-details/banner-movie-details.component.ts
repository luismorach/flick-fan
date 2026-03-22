import { Component, computed, effect, ElementRef, inject, input, output, untracked, viewChild } from '@angular/core';
import { IconComponent } from '../../../../icon/icon.component';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { RatingComponent } from '../../../rating/rating.component';
import { Movie } from '../../../../../core/interfaces/movie/movie.interface';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { MinutesToTimePipe } from '../../../../pipes/minutes-to-time/minutes-to-time.pipe';
import { RouterLink } from '@angular/router';
import { getKeyTrailer } from '../../../../utils/helpers';
import { FloatTrailerService } from '../../../../../core/services/float-trailer/float-trailer.service';
import { style, animate, AnimationBuilder } from '@angular/animations';

@Component({
  selector: 'app-banner-movie-details',
  imports: [IconComponent, NgOptimizedImage, RatingComponent, AutoImagePipe, MinutesToTimePipe, DatePipe, RouterLink],
  templateUrl: './banner-movie-details.component.html',
  styleUrl: './banner-movie-details.component.css',
})
export class BannerDetailComponent {

  readonly movie = input.required<Movie>()
  readonly activeIndex = input.required<number>()
  readonly cardIndex = input<number>()
  readonly onPlayTailer = output<void>()

  private readonly floatTrailer = inject(FloatTrailerService);
  private readonly builder = inject(AnimationBuilder);

  private readonly metadata = viewChild.required<ElementRef<HTMLElement>>('metadata')
  private readonly overview = viewChild.required<ElementRef<HTMLElement>>('overview')
  private readonly buttons = viewChild.required<ElementRef<HTMLElement>>('buttons')

  readonly currentTrailerKey = computed(() =>
    getKeyTrailer(this.movie().videos)
  );

  changeMovie = effect(() => {
    if (this.cardIndex() === this.activeIndex())
      this.animateIn()
  })

  constructor(){
   // this.floatTrailer.setupVideo(this.movie)
  }
  playTrailer(): void {
    this.onPlayTailer.emit()
    //this.floatTrailer.playTest(this.movie)
    //this.floatTrailer.playFloatTrailer(this.currentTrailerKey())
  }

  private animateIn() {
    let animation = this.builder.build([
      style({ opacity: 0, transform: 'translateX(-60%)' }),
      animate('300ms 300ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
    ]);
    let player = animation.create(this.metadata().nativeElement);
    player.play();

    animation = this.builder.build([
      style({ opacity: 0, transform: 'translateY(100%)' }),
      animate('500ms 500ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
    ]);
    player = animation.create(this.overview().nativeElement);
    player.play();

    animation = this.builder.build([
      style({ opacity: 0, transform: 'translateY(3%)' }),
      animate('700ms 700ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
    ]);
    player = animation.create(this.buttons().nativeElement);
    player.play();

  }
}
