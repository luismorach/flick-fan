import { Component, computed, input} from '@angular/core';
import { Movie} from '../../../core/interfaces/movie/movie.interface';
import { Serie} from '../../../core/interfaces/serie/serie.interface';
import { emptyState } from '../../animations/animations';
import { DataLoaderManager } from '../../utils/data-loader-manager';

@Component({
  selector: 'app-empty',
  imports: [],
  templateUrl: './empty.component.html',
  styleUrl: './empty.component.css',
  animations: [emptyState]
})
export class EmptyComponent {

  title = input.required<string>()
  subtitle = input<string>()
  loaders = input.required<DataLoaderManager<Movie | Serie> []>();

  readonly isEmpty = computed(() => {
    const loaders = this.loaders();
    const isInitialLoading = loaders.some((loader)=>loader.isInitialLoading())

    if (isInitialLoading) return false

    // Verificar que todos existan Y estén vacíos
    return loaders.length > 0 &&
      loaders.every(loader => {
        return !loader.hasData()
      });
  });
}
