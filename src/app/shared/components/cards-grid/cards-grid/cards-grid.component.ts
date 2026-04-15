import {
  ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, model,
  signal, untracked, viewChild,
  WritableSignal
} from '@angular/core';
import { Movie, MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { fade } from '../../../animations/animations';
import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { AutoImagePipe } from '../../../pipes/autoimage/auto-image.pipe';
import { EmptyComponent } from '../../empty/empty.component';
import { ApiService } from '../../../../core/services/API/api.service';
import { hasAutoFill, withAutoFillViewport } from '../../../utils/data-loaders/enhancers/with-auto-fill-viewport';
import { canFilter, withFilter } from '../../../utils/data-loaders/enhancers/with-filter';
import { hasInfiniteScroll, withInfiniteScroll } from '../../../utils/data-loaders/enhancers/with-infinite-scroll';
import { Genre } from '../../../../core/interfaces/shared/genre.interface';
import { useSlidesInfo } from '../../../utils/use-slides-info';
import { slidesConfig } from '../../../../core/interfaces/shared/carousel-interface';
import { hasPagination } from '../../../utils/data-loaders/enhancers/with-pagination';
import { Serie, SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { OptionCategory } from '../../../../core/interfaces/shared/option_category';
import { ParamsApi } from '../../../../core/interfaces/shared/params-http.interface';

@Component({
  selector: 'app-cards-grid',
  imports: [NgClass, NgOptimizedImage, DatePipe, AutoImagePipe, EmptyComponent],
  providers: [],
  templateUrl: './cards-grid.component.html',
  styleUrl: './cards-grid.component.css',
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsGridComponent {

  readonly mediaTypeSelected = input<String>()
  readonly selectedCategory = input<OptionCategory>()
  readonly selectedGenre = input<Genre>()
  readonly selectedItem = model.required<Movie | Serie | undefined>()

  readonly api = inject(ApiService);

  readonly data = signal<MovieList | SerieList | undefined>(undefined);
  readonly currentGenre: WritableSignal<Genre | undefined> = signal(undefined)
  selectedIndex = signal(0)

  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport')
  private readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel')

  readonly loader = useDataLoader<MovieList | SerieList, 'results'>('results', this.data).pipe(
    withFilter,
    withInfiniteScroll,
    withAutoFillViewport
  )

  changeGenreFilter = effect(() => {
    const filter = this.selectedGenre()
    if (!filter) return
    untracked(() => {
      this.filterByGenre(filter)
      this.selectedItem.set(undefined)
    })
  })

  changeCategory = effect(() => {
    const option = this.selectedCategory()
    if (!option) return
    untracked(() => this.filterByCategory(option))
  })

  changeDataLength = effect(() => {
    const dataLength = this.currentData().length
    if (dataLength === 0 || this.currentGenre() === this.selectedGenre()) return

    this.selectItem(this.currentData()[0], 0)
    this.currentGenre.set(this.selectedGenre())
  })

  readonly currentData = computed(() => {
    if (canFilter(this.loader)) return this.loader.filteredData()
    return this.loader.data()
  })

  readonly slidesConfig: slidesConfig = {
    slidesPerView: 3,
    spaceBetween: 16,
    peek: 24,
    breakpoints: {
      640: { slidesPerView: 4 },
      740: { slidesPerView: 5 },
      1024: { slidesPerView: 4 },
      1280: { slidesPerView: 5 },
    }
  }

  readonly slidesInfo = useSlidesInfo(this.viewport, this.slidesConfig)

  constructor() {
    if (hasAutoFill(this.loader)) {
      this.loader.setupAutoFill(this.sentinel)
    }
    if (hasInfiniteScroll(this.loader)) {
      this.loader.setupInfiniteScroll(this.sentinel)
    }
  }

  async selectItem(item: Movie | Serie, index: number) {
    if (item.id === this.selectedItem()?.id) return
    this.selectedIndex.set(index)
    const details = await this.api.getDetails<Movie | Serie>({ dataId: item.id, type: this.data()?.type })
    this.selectedItem.set(details)
  }

  filterByCategory(option: OptionCategory) {
    const apiMethod = this.api.methodMap[option.value]
    if (!apiMethod) throw new Error(`Unknown data type: ${option.value}`);

    const params = this.selectedCategory()?.params
    apiMethod(params).subscribe((data: MovieList | SerieList) => {
      this.data.set(data)
      requestAnimationFrame(() => this.selectItem(this.currentData()[0], 0))
    })
  }

  filterByGenre(genre: Genre) {
    if (!canFilter(this.loader)) return
    let genrePredicate = null
    let selectedGenres = [genre]

    if (genre.id !== 0) {
      genrePredicate = (movie: Movie | Serie) => {
        const genres = movie.genre_ids;
        return selectedGenres.some(genre => genres.includes(genre.id));
      };
    }

    this.loader.setFilterPredicate(genrePredicate)
  }

  canLoadMore() {
    return hasPagination(this.loader) && (this.loader.canLoadMore() || this.loader.isFetchingMoreData())
  }

  test() {
    const x = {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
      type: ''
    }
    this.data.set(x as MovieList)
  }


}


