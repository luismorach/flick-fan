import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, ElementRef, inject, input } from '@angular/core';
import { Movie } from '../../../../../core/interfaces/movie/movie.interface';
import { IconComponent } from '../../../../icon/icon.component';
import { CarouselService } from '../../../../../core/services/test/carousel/carousel-service';
import { useSlideExpansion } from '../../../../utils/use-slide-expansion';
import { FloatCardService } from '../../../../../core/services/float-card/float-card.service';

@Component({
  selector: 'app-card-movie',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule, DatePipe, IconComponent,],
  templateUrl: './card-movie.component.html',
  styleUrls: ['./card-movie.component.css']
})
export class CardMovieComponent {
  //inputs
  readonly movie = input.required<Movie>();
  readonly carouselService = input.required<CarouselService<any, any>>()
  readonly index = input<number>(0)

  //dependencies
  private readonly floatCard = inject(FloatCardService)
  private card = inject(ElementRef<HTMLElement>);

  readonly slideExpansion = useSlideExpansion()

  //global variables
  readonly originExpand = this.slideExpansion.cardClassMovies(this.index, this.carouselService)

  //computed signals
  readonly canExpand = computed(() => {
    const activeIndex = this.carouselService().state().activeIndex?.() ?? 0
    const cardIndex = this.index()
    const slidesPerView = this.carouselService().state().slidesInfo.layout().slidesPerView
    return this.slideExpansion.canExpand(activeIndex, cardIndex, slidesPerView)
  })

  protected readonly hasGenres = computed(() =>
    (this.movie().genres?.length ?? 0) > 0
  );
  protected readonly primaryGenre = computed(() =>
    this.movie().genres?.[0]?.name ?? ''
  );

  handleMouseEnterCard() {
    this.floatCard.show(this.card.nativeElement, this.movie(), this.originExpand(),this.carouselService())
  }

  handleMouseLeaveCard() {
    this.floatCard.scheduleClose()
  }

}
