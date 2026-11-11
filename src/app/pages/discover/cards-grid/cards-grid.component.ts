import {
  ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, model,
  signal, untracked, viewChild,
} from '@angular/core';
import { Movie, MovieList } from '../../../core/interfaces/movie/movie.interface';
import { fade } from '../../../shared/animations/animations';
import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { useDataLoader } from '../../../shared/utils/data-loaders/use-data-loader';
import { EmptyComponent } from '../../../shared/components/customs-elements/empty/empty.component';
import { ApiService } from '../../../core/services/API/api.service';
import { withAutoFillViewport } from '../../../shared/utils/data-loaders/enhancers/with-auto-fill-viewport';
import { canFilter, withFilter } from '../../../shared/utils/data-loaders/enhancers/with-filter';
import { withInfiniteScroll } from '../../../shared/utils/data-loaders/enhancers/with-infinite-scroll';
import { Genre } from '../../../core/interfaces/shared/genre.interface';
import { slidesConfig } from '../../../core/interfaces/shared/carousel-interface';
import { Serie, SerieList } from '../../../core/interfaces/serie/serie.interface';
import { OptionCategory } from '../../../core/interfaces/shared/option_category';
import { useSlidesInfo } from '../../../core/services/carousel/util/use-slides-info';
import { InViewDirective } from '../../../core/directives/in-view/in-view.directive';

@Component({
  selector: 'app-cards-grid',
  imports: [NgClass, NgOptimizedImage, DatePipe, EmptyComponent, InViewDirective],
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
  private readonly inView = viewChild<InViewDirective>(InViewDirective)

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
      this.selectItem(this.currentData()[0], 0)
    })
  })

  changeCategory = effect(() => {
    const option = this.selectedCategory()
    if (!option) return
    untracked(() => {
      this.filterByCategory(option)
    })
  })

  init = effect(() => {
    if (!this.loader.isInitialized()) return
    untracked(() => {
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

  protected slidesInfo = useSlidesInfo(undefined, {})


  constructor() {
    // this.loader.setupAutoFill(this.sentinels)
  }
  async cargar() {
    console.log('cargar', document.querySelector('html')?.scrollTop)
    await this.loader.loadMoreData()
    this.inView()?.checkVisibility()
    console.log('termino decargar', this.inView())
  }

  initSlidesInfo = effect(() => {
    const container = this.viewport()
    if (!container) return
    untracked(() => {
      this.slidesInfo = useSlidesInfo(container, this.slidesConfig)
    })
  })

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

  async filterByCategory(option: OptionCategory) {
    const apiMethod = this.api.methodMap[option.value]
    if (!apiMethod) throw new Error(`Unknown data type: ${option.value}`);

    const params = this.selectedCategory()?.params
    apiMethod(params).subscribe({
      next: (data: MovieList | SerieList) => this.data.set(data),
      complete: () => this.selectItem(this.currentData()[0], 0)
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
}


