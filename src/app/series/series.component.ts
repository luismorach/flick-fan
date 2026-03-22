import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { Serie, SerieList, SeriesCategory } from '../core/interfaces/serie/serie.interface';
import { Genre } from '../core/interfaces/shared/genre.interface';
import { CustomSelectComponent } from "../shared/components/elements/custom-select/custom-select.component";
import { IconComponent } from "../shared/icon/icon.component";

@Component({
  selector: 'app-series',
  imports: [
    BackgroundNavScrollDirective,
    CustomSelectComponent,
    IconComponent
],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css',
})

export default class SeriesComponent {
  readonly api = inject(ApiService);
  readonly series = signal<SerieList | undefined>(undefined);
  selectedSerie = signal<Serie| undefined>(undefined)

  seriesCategories: SeriesCategory[] = [
    { name: 'Emitiendo hoy', id: 0, value: 'airing_today_series' },
    { name: 'En el aire', id: 1, value: 'on_the_air_series' },
    { name: 'Populares', id: 2, value: 'popular_series' },
    { name: 'Mejores valorados', id: 3, value: 'top_rated_series' },
  ]

  optionsGenre: Genre[] = [
    { name: 'Todos los géneros', id: 0 },
    ...this.api.seriesGenres()
  ]

  categorieSelected: WritableSignal<SeriesCategory> = signal(this.seriesCategories[0])
  selectedGenre: WritableSignal<Genre> = signal(this.optionsGenre[0])
}
