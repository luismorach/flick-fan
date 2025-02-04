import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AllMovies } from '../interfaces/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  http=inject(HttpClient)

  getVideos(){
    this.http.get('https://api.themoviedb.org/3/movie/3/videos')
  }
  getNowPlaying(){
    return this.http.get('https://api.themoviedb.org/3/movie/now_playing?language=es-VE&page=1')
  }
  getPopular(){
    return this.http.get(' https://api.themoviedb.org/3/movie/popular?language=es-VE&page=1')
  }
  getDetailsMovie(id:number){
   
    return this.http.get(' https://api.themoviedb.org/3/movie/'+id+'?append_to_response=videos&language=es-VE')
  }

  getGenres(){
    return this.http.get(' https://api.themoviedb.org/3/genre/movie/list?language=es-VE')
    
  }
 
}
