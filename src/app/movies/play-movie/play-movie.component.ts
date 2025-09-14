import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, } from '@angular/router';
import { concatAll, map, Subscription} from 'rxjs';
import {  DOCUMENT, NgOptimizedImage, } from '@angular/common';
import { fade } from '../../shared/animations/animations';
import { CarouselSkeletonComponent } from '../../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { carouselComponent } from '../../shared/components/carousel/carousel.component';
import { UrlSafePipe } from '../../shared/pipes/url-safe.pipe';
import { ApiService } from '../../core/services/API/api.service';
import { ComunicatorService } from '../../core/services/comunicator/comunicator.service';
import { MovieList } from '../../core/interfaces/movie/movie.interface';


@Component({
  selector: 'app-play-movie',
  imports: [UrlSafePipe, NgOptimizedImage,carouselComponent, CarouselSkeletonComponent],
  templateUrl: './play-movie.component.html',
  styleUrl: './play-movie.component.css',
  animations: [fade]
})

export default class PlayMovieComponent {
  movie: WritableSignal<any | undefined> = signal(undefined)
  url_movie = signal('https://vidsrc.to/embed/movie/')
  similarMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  recomendedMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  subscription: Subscription[] = []
  doc = inject(DOCUMENT)
  id_movie=0

  constructor(private rutaActiva: ActivatedRoute, public API: ApiService,
    private comunicatorService: ComunicatorService) {

    this.comunicatorService.setBackgroundNav(true)
    this.getUrlMovie()
    this.getSimilarMovies()
    this.getRecomendedMovies()
  }

  getUrlMovie() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => {
        this.id_movie=params['id_movie']
        return this.API.getDetailsMovie(params['id_movie'])
      }), concatAll())
      .subscribe((movie: any) => {
        this.doc.scrollingElement?.scrollTo(0, 0)
        this.url_movie.set('https://vidsrc.to/embed/movie/' + movie.imdb_id)
        this.movie.set(movie)
      }))
  }

  getSimilarMovies() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getSimilarMovies(1,params['id_movie'])), concatAll())
      .subscribe((movies: any) => {
        if (movies.results.length > 0) {
          this.similarMovies.set(movies)
        }
      }))
  }

  getRecomendedMovies() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getRecomendedMovies(1,params['id_movie'])), concatAll())
      .subscribe((movies: any) => {
        if (movies.results.length > 0) {
          this.recomendedMovies.set(movies)
        }
      }))
  }


  

  /* togglePlay() {
    if (this.video?.paused) {
      this.video.play();
      document.querySelector('.control-btn').textContent = '⏸ Pausar';
    } else {
      video.pause();
      document.querySelector('.control-btn').textContent = '▶ Reproducir';
    }
  }

  toggleFullscreen() {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  }

  toggleMute() {
    video.muted = !video.muted;
    const btn = document.querySelectorAll('.control-btn')[2];
    btn.textContent = video.muted ? '🔇 Activar Audio' : '🔊 Silenciar';
  } */

// Efectos de interacción
/* document.addEventListener('mousemove', (e) => {
  const videoContainer = document.querySelector('.video-container');
  const rect = videoContainer.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
    const rotateX = (y - 0.5) * 10;
    const rotateY = (x - 0.5) * 10;
    videoContainer.style.transform = `rotateX(${2 - rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }
}); */

// Animación de carga
/* window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.8s ease';
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
}); */

ngOndestroy() {
  console.log('destroing')
  this.subscription.forEach(subscription => {
    subscription.unsubscribe()
  })
}
}
