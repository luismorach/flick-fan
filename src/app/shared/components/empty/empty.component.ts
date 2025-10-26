import { Component, computed, input, Signal, WritableSignal } from '@angular/core';
import { MovieList } from '../../../core/interfaces/movie/movie.interface';
import { SerieList } from '../../../core/interfaces/serie/serie.interface';
import { emptyState } from '../../animations/animations';

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
  signals = input.required<WritableSignal<MovieList | SerieList | undefined>[]>();

  readonly isEmpty = computed(() => {
    const signalsList = this.signals();

    const allSignalsLoaded = signalsList.every(signal =>
      signal() !== undefined && signal() !== null
    );

    if (!allSignalsLoaded) return false

    // Verificar que todos existan Y estén vacíos
    return signalsList.length > 0 &&
      signalsList.every(signal => {
        const data = signal();
        return data && (data.results?.length ?? 0) === 0;
      });
  });
}
