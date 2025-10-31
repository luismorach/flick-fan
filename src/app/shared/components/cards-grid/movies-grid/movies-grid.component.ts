import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Movie, MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { GridHelperService } from '../../../../core/services/grid-helper/grid-helper.service';
import { ScrollConfigService } from '../../../../core/services/scroll-config/scroll-config.service';
import { useSkeletonSlides } from '../../../utils/use-skeleton-slides';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardMovieComponent } from '../../carousel/carousel-movies/card-movie/card-movie.component';
import { CarouselSkeletonComponent } from '../../carousel/carousel-movies/carousel-skeleton/carousel-skeleton.component';
import { fade } from '../../../animations/animations';
import { NgTemplateOutlet } from '@angular/common';

/**
 * @component
 * @description
 * Grilla infinita de películas con carga progresiva.
 *
 * @input data - **Valor actual** de la lista inicial (no signal).
 *               Se pasa como `movieListSignal()` en el template.
 *
 * @internal
 * - `this.data` es un **signal** internamente.
 * - `setupLocalData(this.data)` pasa el **signal completo** al manager.
 * - `DataLoaderManager` usa `effect` internamente para reactividad.
 * 
 */

@Component({
  selector: 'app-movies-grid',
  imports: [InfiniteScrollDirective, CardMovieComponent, CarouselSkeletonComponent,NgTemplateOutlet],
  providers:[DataLoaderManager],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css',
  animations:[fade],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class MoviesGridComponent {
  /** Ancho fijo para skeletons (en píxeles) */
  private readonly SKELETON_SLIDE_WIDTH = 320;

  /**
   * Datos iniciales de películas.
   *
   * @input
   * @required
   * @type {MovieList | undefined}
   * @example
   * ```html
   * <app-movies-grid [data]="movieListSignal()" />
   * ```
   */
  readonly data = input.required<MovieList | undefined>()

  /** Gestor de datos con efecto interno para reactividad */
  readonly dataLoaderManager = inject(DataLoaderManager<Movie>);
  readonly scrollConfig = inject(ScrollConfigService);
  readonly gridHelper = inject(GridHelperService);
  readonly slides = useSkeletonSlides(this.SKELETON_SLIDE_WIDTH);

  /**
   * Clases CSS dinámicas para cada tarjeta.
   *
   * @type {Signal<string[]>}
   * @description
   * Devuelto por `gridHelper.cardClassesMovies()` → es un `computed` que se actualiza
   * automáticamente cuando cambia `dataLoaderManager.data()`.
   */
  readonly cardClasses = this.gridHelper.cardClassesMovies(this.dataLoaderManager.data, this.slides)
  
  constructor() {
    /**
     * Pasa el signal completo (no el valor) para que DataLoaderManager
     * use `effect(() => signal())` y reaccione a cambios.
     */
    this.dataLoaderManager.setupLocalData(this.data)
  }
}
