import { Component, ChangeDetectionStrategy, inject, viewChild, HostListener, signal } from '@angular/core';
import { RouterOutlet, provideRouter } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import BannerComponent from './components/banner/banner.component';
import { carrouselComponent } from '../shared/components/carrousel/carrousel.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { listMovies, listSeries, playerTrailer } from '../shared/interfaces/interfaces';
import { ApiService } from '../shared/services/API/api.service';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { BannerSeriesComponent } from './components/banner-series/banner-series.component';
import { CarouselSeriesComponent } from '../shared/components/carousel-series/carousel-series.component';

@Component({
    selector: 'app-inicio',
    imports: [RouterOutlet, NavBarComponent, BannerComponent, carrouselComponent,
        PlayTrailerComponent, BannerSeriesComponent, CarouselSeriesComponent
    ],
    templateUrl: './inicio.component.html',
    styleUrl: './inicio.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class InicioComponent {

    API = inject(ApiService)
    playTrailerComponent = viewChild(PlayTrailerComponent)
    popularMovies = toSignal(this.API.getPopular() as Observable<listMovies>)
    upcomingMovies = toSignal(this.API.getUpcoming() as Observable<listMovies>)
    nowPlaying = toSignal(this.API.getNowPlaying() as Observable<listMovies>)
    airingToday = toSignal(this.API.getAiringTodaySeries() as Observable<listSeries>)
    player: playerTrailer = { videoId: signal(''), isPlaying: false }

    playTrailer(player: playerTrailer) {
        this.player = player
        if (player.isPlaying)
            this.playTrailerComponent()?.openTrailer()
    }

}
