import { Component, inject, signal, viewChild } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { BannerSeriesComponent } from '../shared/components/banners/banner-series/banner-series.component';
import { SkeletonComponent } from '../shared/components/banners/banner-series/skeleton/skeleton.component';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Serie, SerieList } from '../core/interfaces/serie/serie.interface';
import { forkJoin } from 'rxjs';
import { EmptyComponent } from '../shared/components/empty/empty.component';
import { SeriesGridComponent } from '../shared/components/cards-grid/series-grid/series-grid.component';
import { DataLoaderManager } from '../shared/utils/data-loader-manager';

@Component({
  selector: 'app-series',
  imports: [
    BannerSeriesComponent,
    BackgroundNavScrollDirective,
    EmptyComponent,
    SeriesGridComponent,
  ],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css',
})

export default class SeriesComponent {
  private readonly api = inject(ApiService);
  readonly onTheAir = signal<SerieList | undefined>(undefined);
  readonly popularSeries = signal<SerieList | undefined>(undefined);

  private readonly seriesGrid = viewChild.required<SeriesGridComponent>(SeriesGridComponent)
  private readonly bannerSeries = viewChild.required<BannerSeriesComponent>(BannerSeriesComponent)

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    forkJoin({
      onTheAir: this.api.getOnTheAirSeries({page:1}),
      popularSeries: this.api.getPopularSeries({page:1})
    }).pipe(
      takeUntilDestroyed(),
    ).subscribe(({ onTheAir, popularSeries }) => {
      this.onTheAir.set(onTheAir);
      this.popularSeries.set(popularSeries);
    });
  }
  getDataLoaders() {
      const loaders: DataLoaderManager<Serie>[] = [];
  
      loaders.push(this.seriesGrid().dataLoaderManager);
      loaders.push(this.bannerSeries().swiperHelper.dataLoaderManager);
      return loaders;
    }
}
