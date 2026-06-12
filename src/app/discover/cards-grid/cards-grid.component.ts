import {
  ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, model,
  signal, untracked, viewChild,
  viewChildren,
} from '@angular/core';
import { Movie, MovieList } from '../../core/interfaces/movie/movie.interface';
import { fade } from '../../shared/animations/animations';
import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { useDataLoader } from '../../shared/utils/data-loaders/use-data-loader';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { ApiService } from '../../core/services/API/api.service';
import { withAutoFillViewport } from '../../shared/utils/data-loaders/enhancers/with-auto-fill-viewport';
import { canFilter, withFilter } from '../../shared/utils/data-loaders/enhancers/with-filter';
import { withInfiniteScroll } from '../../shared/utils/data-loaders/enhancers/with-infinite-scroll';
import { Genre } from '../../core/interfaces/shared/genre.interface';
import { useSlidesInfo } from '../../shared/utils/use-slides-info';
import { slidesConfig } from '../../core/interfaces/shared/carousel-interface';
import { Serie, SerieList } from '../../core/interfaces/serie/serie.interface';
import { OptionCategory } from '../../core/interfaces/shared/option_category';

@Component({
  selector: 'app-cards-grid',
  imports: [NgClass, NgOptimizedImage, DatePipe, EmptyComponent],
  providers: [],
  templateUrl: './cards-grid.component.html',
  styleUrl: './cards-grid.component.css',
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsGridComponent {

  readonly mediaTypeSelected = input<string>()
  readonly selectedCategory = input<OptionCategory>()
  readonly selectedGenre = input<Genre>()
  readonly selectedItem = model.required<Movie | Serie | undefined>()

  readonly api = inject(ApiService);

  readonly data = signal<MovieList | SerieList | undefined>(undefined);
  selectedIndex = signal(0)

  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport')
  private readonly sentinels = viewChildren<ElementRef<HTMLElement>>('sentinels')

  test = signal({
    page: 1,
    results: [],
    total_pages: 0,
    total_results: 0,
    type: ''
  })
  readonly loader = useDataLoader<MovieList | SerieList, 'results'>('results', this.data)
    .with(withFilter)
    .with(withInfiniteScroll)
    .with(withAutoFillViewport)
    .build();

  changeGenreFilter = effect(() => {
    const filter = this.selectedGenre()

    if (!filter) return
    untracked(() => {
      this.filterByGenre(filter)
    })
  })

  changeCategory = effect(() => {
    const option = this.selectedCategory()
    if (!option) return
    untracked(() => this.filterByCategory(option))
  })

  changeDataLength = effect(() => {
    const dataLength = this.currentData().length
    untracked(() => {
      if (dataLength === 0 ) return
      this.selectItem(this.currentData()[0], 0)
    })
  })

  readonly currentData = computed(() => this.loader.filteredData())

  readonly slidesConfig: slidesConfig = {
    slidesPerView: 3,
    slidesOffsetBefore: 4,
    slidesOffsetAfter: 4,
    spaceBetween: 10,
    breakpoints: {
      640: { slidesPerView: 4 },
      740: { slidesPerView: 5 },
      1024: { slidesPerView: 4 },
      1280: { slidesPerView: 5 },
    }
  }

  readonly slidesInfo = useSlidesInfo(this.viewport, this.slidesConfig)

  constructor() {
    this.loader.setupAutoFill(this.sentinels)
    this.loader.setupInfiniteScroll(this.sentinels)
  }

  async selectItem(item: Movie | Serie | undefined, index: number) {
    if (!item) {
      this.selectedItem.set(undefined);
      return
    }
    if (item.id === this.selectedItem()?.id) return

    this.selectedIndex.set(index)
    const details = await this.api.getDetails<Movie | Serie>({ dataId: item.id, type: this.data()?.type })
    this.selectedItem.set(details)
  }

  filterByCategory(option: OptionCategory) {
    const apiMethod = this.api.methodMap[option.value]
    if (!apiMethod) throw new Error(`Unknown data type: ${option.value}`);

    const params = this.selectedCategory()?.params
    apiMethod(params).subscribe((data: MovieList | SerieList) =>  this.data.set(data) )
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
}


