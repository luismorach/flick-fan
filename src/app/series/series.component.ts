import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { CommonModule } from '@angular/common';
import { fade } from '../shared/animations/animations';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardSerieComponent } from '../shared/components/carousel-series/card-serie/card-serie.component';
import { CarouselSeriesSkeletonComponent } from '../shared/components/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { BannerSeriesComponent } from '../shared/components/banner-series/banner-series.component';
import { SkeletonComponent } from '../shared/components/banner-series/skeleton/skeleton.component';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SerieList } from '../core/interfaces/serie/serie.interface';
import { useSkeletonSlides } from '../shared/utils/use-skeleton-slides';
import { forkJoin } from 'rxjs';
import { DataLoaderManager } from '../shared/utils/data-loader-manager';
import { EmptyComponent } from '../shared/components/empty/empty.component';
import { GridHelperService } from '../core/services/grid-helper/grid-helper.service';
import { ScrollConfigService } from '../core/services/scroll-config/scroll-config.service';

@Component({
  selector: 'app-series',
  imports: [BannerSeriesComponent,
    SkeletonComponent,
    InfiniteScrollDirective,
    CardSerieComponent,
    CarouselSeriesSkeletonComponent,
    CommonModule,
    BackgroundNavScrollDirective,
    EmptyComponent,
  ],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css',
  animations: [fade]
})

export default class SeriesComponent {
  private readonly api = inject(ApiService)
  readonly scrollConfig = inject(ScrollConfigService)
  readonly gridHelper = inject(GridHelperService)
  readonly dataLoaderManager = inject(DataLoaderManager)
  readonly onTheAir = signal<SerieList | undefined>(undefined)
  readonly popularSeries = signal<SerieList | undefined>(undefined)
  readonly slides = useSkeletonSlides(288);

  constructor() {
    this.dataLoaderManager.setupSignalMonitoring(this.popularSeries)
    this.loadInitialData()
  }

  private loadInitialData(): void {
    forkJoin({
      onTheAir: this.api.getOnTheAirSeries(1),
      popularSeries: this.api.getPopularSeries(1)
    }).pipe(
      takeUntilDestroyed(),
    ).subscribe(({ onTheAir, popularSeries }) => {
      this.onTheAir.set(onTheAir);
      this.popularSeries.set(popularSeries);
    });
  }

}
