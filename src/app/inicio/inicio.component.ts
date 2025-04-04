import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, provideRouter } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import BannerComponent from './components/banner/banner.component';
import { carrouselComponent } from '../shared/components/carrousel/carrousel.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { AllMovies, Movie } from '../shared/interfaces/interfaces';
import { ApiService } from '../shared/services/API/api.service';
import { TopRatedComponent } from './components/top-rated/top-rated.component';


@Component({
    selector: 'app-inicio',
    imports: [RouterOutlet, NavBarComponent, BannerComponent, carrouselComponent,TopRatedComponent],
    templateUrl: './inicio.component.html',
    styleUrl: './inicio.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class InicioComponent {
    API = inject(ApiService)
    popularMovies = toSignal(this.API.getPopular() as Observable<Movie[]>)

}
