import { Component, computed, effect, input } from '@angular/core';
import { Movie } from '../../../core/interfaces/movie/movie.interface';
import { Serie } from '../../../core/interfaces/serie/serie.interface';
import { emptyState } from '../../animations/animations';
import { ArrayKey, LoaderCore } from '../../utils/data-loaders/types';
import { canFilter } from '../../utils/data-loaders/enhancers/with-filter';

@Component({
  selector: 'app-empty',
  imports: [],
  templateUrl: './empty.component.html',
  styleUrl: './empty.component.css',
  animations: [emptyState]
})
export class EmptyComponent<T extends Object, R extends ArrayKey<T>> {

  title = input.required<string>()
  subtitle = input<string>()
  loaders = input.required<LoaderCore<T, R>[]>();

  readonly isEmpty = computed(() => {
    const loaders = this.loaders();
    const isInitialized= loaders.some((loader) => loader.isInitialized())

    if (!isInitialized) return false

    console.log('loadders', loaders.length)
    // Verificar que todos existan Y estén vacíos
    return loaders.length > 0 &&
      loaders.every(loader => {
        if (canFilter(loader)) return loader.filteredData().length < 1
        return !loader.hasData()
      });
  });
}
