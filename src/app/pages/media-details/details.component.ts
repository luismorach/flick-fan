import { Component, effect, inject} from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { HeroComponent } from "./hero/hero.component";
import { AboutComponent } from "./about/about.component";
import { RecomendedComponent } from "./recomended/recomended.component";
import { DetailsEpisodesComponent } from '../../shared/components/series/details-episodes/details-episodes.component';
import { Movie } from '../../core/interfaces/movie/movie.interface';
import { Serie } from '../../core/interfaces/serie/serie.interface';
import { ApiService } from '../../core/services/API/api.service';
import { isMovie } from '../../shared/utils/helpers';

@Component({
  selector: 'app-details',
  imports: [HeroComponent, AboutComponent, RecomendedComponent, DetailsEpisodesComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export default class DetailsComponent {

  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  isMovie = isMovie
  protected type = toSignal(this.route.params.pipe(
    map(params => params['type'] as 'movie' | 'serie'),
    tap(type => console.log('Type from route params:', type))
  ));

  private id = toSignal(this.route.params.pipe(
    map(params => params['id'] as number),
    tap(id => console.log('ID from route params:', id))),
    { initialValue: undefined }
  );

  media = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => this.api.getDetails<Movie | Serie>({ dataId: id, type: this.type() }))),
    { initialValue: undefined }
  );

  

}
