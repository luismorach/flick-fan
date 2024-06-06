import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  http=inject(HttpClient)

  getVideos(){
    this.http.get('https://api.themoviedb.org/3/movie/3/videos')
  }
  getNowPlaying(){
    return this.http.get('https://api.themoviedb.org/3/movie/now_playing?language=es-VE&page=3')
  }
}
