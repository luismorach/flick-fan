import { Component, effect, input } from '@angular/core';
import { UrlSafePipe } from '../../../shared/pipes/url-safe.pipe';
import { Movie } from '../../../shared/interfaces/interfaces';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-top-rated',
  imports: [UrlSafePipe, YouTubePlayer],
  templateUrl: './top-rated.component.html',
  styleUrl: './top-rated.component.css'
})


export class TopRatedComponent {
  movies = input.required<Movie[] | undefined>()

  player: any
  initApiYoutube() {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

  }
  constructor() { }

  ngOnInit() {
    this.initApiYoutube();
    /* 
         window['onYouTubeIframeAPIReady'] = () => {
          console.log('api ready');
          this.player = new window['YT'].Player('trailer', {
            height: '390',
            width: '640',
            videoId: 'TBd2xLdeNdk',
            events: {
              'onReady': (event) => this.onReady(event),
              'onStateChange': (event) => this.onStateChange(event, 0),
            }
          });
        }  */

  }


  onReady(event: any) {

    console.log('onReady', this.player);

  }
  mouseEnter(index: number) {
    let movie:any=this.movies();
    if (movie !== undefined) {
      console.log(movie[index].videos?.results)
    }
    console.log(this.getUrlTrailer(index), index)
    this.player = new window['YT'].Player(`trailer${index}`, {
      height: '390',
      width: '640',
      videoId: this.getUrlTrailer(index),
      playerVars: {
        autoplay: 1,
        controls: 0,
        loop: 1,
        mute: 1,
      },
      events: {
        'onReady': (event) => this.onReady(event),
        'onStateChange': (event) => this.onStateChange(event, 0),
      }
    });

    console.log('mouseEnter', this.player);

  }
  mouseLeave() {
    this.player.destroy();
  }

  onStateChange(event: any, index: number) {
    console.log('onStateChange', event.data);
    if(event.data == YT.PlayerState.ENDED){
      this.player.destroy();
    }
  }
  getUrlTrailer(index: number): string {
    let key: string | undefined;
    let movie:any = this.movies();
    if (movie !== undefined) {
      movie[index].videos?.results.forEach((element: any) => {
        if (element.type === 'Trailer') {
          console.log('key', element.key)
          key = element.key;
        }
      });
    }
    console.log(key)
    return key ? key : '';
    return key ? `https://www.youtube.com/embed/${key}?enablejsapi=1` : '';
  }
}
