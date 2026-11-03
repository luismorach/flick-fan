import { Component, effect, inject} from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { ApiService } from '../core/services/API/api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { Movie } from '../core/interfaces/movie/movie.interface';
import { Serie } from '../core/interfaces/serie/serie.interface';
import { HeroComponent } from "./hero/hero.component";
import { AboutComponent } from "./about/about.component";
import { RecomendedComponent } from "./recomended/recomended.component";
import { CarouselMediaComponent } from "../shared/components/carousel/carousel-media/carousel-media.component";
import { ParamsApi } from '../core/interfaces/shared/params-http.interface';

@Component({
  selector: 'app-details',
  imports: [HeroComponent, AboutComponent, RecomendedComponent, CarouselMediaComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export default class DetailsComponent {

  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  private type = toSignal(this.route.params.pipe(
    map(params => params['type'] as 'movies' | 'series'),
    tap(type => console.log('Type from route params:', type))
  ));

  private id = toSignal(this.route.params.pipe(
    map(params => params['id'] as number),
    tap(id => console.log('ID from route params:', id))),
    { initialValue: undefined }
  );

  details = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => this.api.getDetails<Movie | Serie>({ dataId: id, type: this.type() }))),
    { initialValue: undefined }
  );

  recomended = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => this.api.getRecomendedMovies({ dataId: id }))
    ),
    { initialValue: undefined }
  );

  paramsApi: ParamsApi = { dataId: this.id()}

  x = effect(() => {
    console.log(this.details());
  })


}
