import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, model,
   signal, untracked, viewChild} from '@angular/core';
import { Movie, MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { fade } from '../../../animations/animations';
import { DatePipe, NgClass, NgOptimizedImage} from '@angular/common';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { AutoImagePipe } from '../../../pipes/autoimage/auto-image.pipe';
import { EmptyComponent } from '../../empty/empty.component';
import { ApiService } from '../../../../core/services/API/api.service';
import { hasAutoFill, withAutoFillViewport } from '../../../utils/data-loaders/enhancers/with-auto-fill-viewport';
import { canFilter, withFilter } from '../../../utils/data-loaders/enhancers/with-filter';
import { hasInfiniteScroll, withInfiniteScroll } from '../../../utils/data-loaders/enhancers/with-infinite-scroll';
import { Genre } from '../../../../core/interfaces/shared/genre.interface';

@Component({
  selector: 'app-movies-grid',
  imports: [NgClass, NgOptimizedImage, DatePipe, AutoImagePipe, EmptyComponent],
  providers: [],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css',
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesGridComponent {

  readonly movies = input.required<MovieList | undefined>();
  readonly filter = input<Genre>()
  readonly selectedMovie = model.required<Movie | undefined>()

  readonly api = inject(ApiService);
  selectedIndex = signal(0)

  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport')
  private readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel')

  readonly loader = useDataLoader<MovieList, 'results'>('results', this.movies).pipe(
    withFilter,
    withInfiniteScroll,
    withAutoFillViewport
  )

  changeFilter = effect(() => {
    const filter = this.filter()
    if (!filter) return
    untracked(() => {
      if (this.data().length === 0) return
      this.filterByGenre(filter)
      this.selectMovie(this.data()[0], 0)
    })
  })

  readonly data = computed(() => {
    if (canFilter(this.loader)) return this.loader.filteredData()
    return this.loader.data()
  })

  selectMovie(movie: Movie, index: number) {
    if (movie.id === this.selectedMovie()?.id) return
    this.selectedIndex.set(index)
    this.api.getDetailsMovie({ dataId: movie.id }).subscribe((movie) =>  this.selectedMovie.set(movie))
  }

  filterByGenre(genre: Genre) {
    if (!canFilter(this.loader)) return
    let genrePredicate = null
    let selectedGenres = [genre]

    if (genre.id !== 0) {
      genrePredicate = (movie: Movie) => {
        const genres = movie.genre_ids;
        return selectedGenres.some(genre => genres.includes(genre.id));
      };
    }

    this.loader.setFilterPredicate(genrePredicate)
  }

  constructor() {
    if (hasAutoFill(this.loader)) {
      this.loader.setupAutoFill(this.viewport, this.sentinel)
    }
    if (hasInfiniteScroll(this.loader)) {
      this.loader.setupInfiniteScroll(this.viewport, this.sentinel)
    }
  }
}


