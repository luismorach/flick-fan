import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AllMovies, Movie } from '../../interfaces/interfaces';
import { map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  http=inject(HttpClient)
  API='https://api.themoviedb.org/3/'

  getVideos(){
    this.http.get(this.API+'videos')
  }
  getNowPlaying(){
    return this.http.get(this.API+'movie/now_playing?language=es-VE&page=1') 
  }
  getPopular(){
    return this.http.get(this.API+'movie/popular?language=es-VE&page=1')
  }
  getDetailsMovie(movie_id:number){
    
    return this.http.get(this.API+'movie/'+movie_id+'?append_to_response=videos&language=es-VE') 
  }

  getGenres(){
    return this.http.get(' https://api.themoviedb.org/3/genre/movie/list?language=es-VE')
    
  }
  getSimilarMovies(movie_id:number){
    return this.http.get(this.API+'movie/'+movie_id+'/similar?language=es-VE')
  }
 
}
