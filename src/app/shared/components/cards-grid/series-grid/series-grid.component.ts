import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { GridHelperService } from '../../../../core/services/grid-helper/grid-helper.service';
import { ScrollConfigService } from '../../../../core/services/scroll-config/scroll-config.service';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { useSkeletonSlides } from '../../../utils/use-skeleton-slides';
import { Serie, SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardSerieComponent } from '../../carousel/carousel-series/card-serie/card-serie.component';
import { CarouselSeriesSkeletonComponent } from '../../carousel/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { fade } from '../../../animations/animations';
import { NgTemplateOutlet } from '@angular/common';

/**
 * @component
 * @description
 * Grilla infinita de series con chunking horizontal y hover expand.
 *
 * @input data - **Valor actual** de la lista inicial (no signal).
 *               Se pasa como `serieListSignal()` en el template.
 *
 * @internal
 * - `this.data` es un **signal** internamente.
 * - `setupLocalData(this.data)` pasa el **signal completo** al manager.
 * - `gridHelper.createChunks()` devuelve un `computed` reactivo.
 */
@Component({
  selector: 'app-series-grid',
  imports: [InfiniteScrollDirective, CardSerieComponent,CarouselSeriesSkeletonComponent,NgTemplateOutlet],
  providers:[DataLoaderManager],
  templateUrl: './series-grid.component.html',
  styleUrl: './series-grid.component.css',
  animations:[fade],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class SeriesGridComponent {
  /** Ancho fijo para skeletons de series */
  private readonly SKELETON_SLIDE_WIDTH = 288;

  /**
   * Datos iniciales de series.
   *
   * @input
   * @required
   * @type {SerieList | undefined}
   * @example
   * ```html
   * <app-series-grid [data]="serieListSignal()" />
   * ```
   */
  readonly data = input.required<SerieList | undefined>()

  /** Gestor de datos con efecto interno para reactividad */
  readonly dataLoaderManager = inject(DataLoaderManager<Serie>);
  readonly scrollConfig = inject(ScrollConfigService);
  readonly gridHelper = inject(GridHelperService);
  readonly slides = useSkeletonSlides(this.SKELETON_SLIDE_WIDTH);

  /**
   * Chunks horizontales de series.
   *
   * @type {Signal<Serie[][]>}
   * @description
   * Devuelto por `gridHelper.createChunks()` → `computed` que se actualiza
   * cuando cambia `dataLoaderManager.data()` o `slides.slidesPerView()`.
   */
  readonly chunks = this.gridHelper.createChunks<Serie>(this.dataLoaderManager.data, this.slides.slidesPerView())

  constructor() {
    /**
     * Pasa el signal completo para que DataLoaderManager
     * use `effect(() => signal())` y reaccione a cambios.
     */
    this.dataLoaderManager.setupLocalData(this.data)
  }
}
