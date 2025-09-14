import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { ApiService } from '../shared/services/API/api.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { listSeries, Serie } from '../shared/interfaces/interfaces';
import { fade } from '../shared/animations/animations';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { calculateNumSlides, createChunks, handleCardHover, resetCardHover, scrollToTop } from '../shared/utils/helpers';
import { CardSerieComponent } from '../shared/components/carousel-series/card-serie/card-serie.component';
import { CardSerieSkeletonComponent } from '../shared/components/carousel-series/card-serie-skeleton/card-serie-skeleton.component';
import { CarouselSeriesSkeletonComponent } from '../shared/components/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { BannerSeriesComponent } from '../shared/components/banner-series/banner-series.component';
import { SkeletonComponent } from '../shared/components/banner-series/skeleton/skeleton.component';
import { BackgroundNavScrollDirective } from '../shared/directives/background-nav-scroll.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-series',
  imports: [BannerSeriesComponent,
    SkeletonComponent,
    InfiniteScrollDirective,
    CardSerieComponent,
    CardSerieSkeletonComponent,
    CarouselSeriesSkeletonComponent,
    CommonModule,
    BackgroundNavScrollDirective
  ],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css',
  animations: [fade]
})

export default class SeriesComponent {
  api = inject(ApiService)
  doc = inject(DOCUMENT)
  airingToday: WritableSignal<listSeries | undefined> = signal(undefined)
  onTheAir: WritableSignal<listSeries | undefined> = signal(undefined)
  popularSeries: WritableSignal<listSeries | undefined> = signal(undefined)
  chunkSize = 0
  chunkSkeletons: number[] = []
  isLoading: WritableSignal<boolean> = signal(false)
  spaceBetween = 42
  chunks = computed(() => {
    const data = this.popularSeries()?.results ?? [];
    return createChunks(data, this.chunkSize);
  });

  constructor() {
    scrollToTop()
    this.api.getPopularSeries(1).pipe(takeUntilDestroyed())
      .subscribe(data => this.popularSeries.set(data));

    this.api.getOnTheAirSeries(1).pipe(takeUntilDestroyed())
      .subscribe(data => this.onTheAir.set(data));
  }

  ngOnInit() {
    effect(() => {
      if (this.popularSeries() !== undefined) {
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewInit() {
    this.chunkSize = calculateNumSlides(this.doc.scrollingElement?.scrollWidth ?? 0, 336)
    this.chunkSkeletons = Array.from({ length: this.chunkSize }, (_, i) => i)
  }

  loadMoreOnScroll() {
    if (this.isLoading()) return
    let page = this.popularSeries()?.page ?? 0;
    let total_pages = this.popularSeries()?.total_pages ?? 0;
    if (page >= total_pages) {
      this.isLoading.set(false)
      return
    }
    this.isLoading.set(true)
    this.api.getMoreData(this.api.getPopularSeries.bind(this.api), this.popularSeries)
  }

  handleMouseEnterCardSerie(event: MouseEvent, index: number) {
    handleCardHover(event,index,this.spaceBetween)
  }

  handleMouseLeaveCardSerie(event: MouseEvent) {
    resetCardHover(event)
  }

}
