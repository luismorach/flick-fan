import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { CommonModule } from '@angular/common';
import { fade } from '../shared/animations/animations';
import { BannerSeriesComponent } from '../shared/components/banner-series/banner-series.component';
import { SkeletonComponent } from '../shared/components/banner-series/skeleton/skeleton.component';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SerieList } from '../core/interfaces/serie/serie.interface';
import { forkJoin } from 'rxjs';
import { DataLoaderManager } from '../shared/utils/data-loader-manager';
import { EmptyComponent } from '../shared/components/empty/empty.component';
import { SeriesGridComponent } from '../shared/components/cards-grid/series-grid/series-grid.component';

@Component({
  selector: 'app-series',
  imports: [BannerSeriesComponent,
    SkeletonComponent,
    CommonModule,
    BackgroundNavScrollDirective,
    EmptyComponent,
    SeriesGridComponent,
  ],
   providers:[DataLoaderManager],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css',
  animations: [fade]
})

export default class SeriesComponent {
  private readonly api = inject(ApiService);
  readonly onTheAir = signal<SerieList | undefined>(undefined);
  readonly popularSeries = signal<SerieList | undefined>(undefined);

  constructor() {
    this.loadInitialData();
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
