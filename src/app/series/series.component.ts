import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { fade } from '../shared/animations/animations';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { createChunks, hasNextPage, scrollToTop } from '../shared/utils/helpers';
import { CardSerieComponent } from '../shared/components/carousel-series/card-serie/card-serie.component';
import { CardSerieSkeletonComponent } from '../shared/components/carousel-series/card-serie-skeleton/card-serie-skeleton.component';
import { CarouselSeriesSkeletonComponent } from '../shared/components/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { BannerSeriesComponent } from '../shared/components/banner-series/banner-series.component';
import { SkeletonComponent } from '../shared/components/banner-series/skeleton/skeleton.component';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SerieList } from '../core/interfaces/serie/serie.interface';
import { SkeletonSlidesHook, useSkeletonSlides } from '../shared/utils/use-skeleton-slides';
import { HandleCardSeries } from '../shared/utils/handle-card-series';

@Component({
  selector: 'app-series',
  imports: [BannerSeriesComponent,
    SkeletonComponent,
    InfiniteScrollDirective,
    CardSerieComponent,
    CardSerieSkeletonComponent,
    CarouselSeriesSkeletonComponent,
    CommonModule,
    BackgroundNavScrollDirective,

  ],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css',
  animations: [fade]
})

export default class SeriesComponent {
  api = inject(ApiService)
  onTheAir: WritableSignal<SerieList | undefined> = signal(undefined)
  popularSeries: WritableSignal<SerieList | undefined> = signal(undefined)
  isLoading: WritableSignal<boolean> = signal(false)
  slides: SkeletonSlidesHook = useSkeletonSlides(288);
  chunks = computed(() => {
    const data = this.popularSeries()?.results ?? [];
    return createChunks(data, this.slides.slidesPerView());
  });

  constructor(private handleCardSeries: HandleCardSeries) {
    scrollToTop()
    this.api.getPopularSeries(1).pipe(takeUntilDestroyed())
      .subscribe(data => this.popularSeries.set(data));

    this.api.getOnTheAirSeries(1).pipe(takeUntilDestroyed())
      .subscribe(data => this.onTheAir.set(data));

    effect(() => {
      if (this.popularSeries() !== undefined) {
        this.isLoading.set(false);
      }
    });
  }

  loadMoreOnScroll() {
    const canFetchNext = hasNextPage(this.popularSeries());

    if (!canFetchNext || this.isLoading()) return;

    this.isLoading.set(true);
    this.api.getMoreData(this.api.getPopularSeries.bind(this.api), this.popularSeries);
  }

  onSlideExpandHover(card: HTMLElement) {
    this.handleCardSeries.handleCardHover(card, this.slides.spaceBetween())
  }

  onSlideCollapseHover(card: HTMLElement) {
    this.handleCardSeries.resetCardHover(card)
  }

}
