import { NgClass } from '@angular/common';
import { Component, effect, output, signal, ViewChild, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-play-trailer-embeed',
  imports: [NgClass, YouTubePlayer],
  templateUrl: './play-trailer-embeed.component.html',
  styleUrl: './play-trailer-embeed.component.css'
})
export class PlayTrailerEmbeedComponent {

  @ViewChild(YouTubePlayer) youtubePlayer!: YouTubePlayer;
  mutedState = true
  id = 0
  videoID = signal<string>('')
  isEnded=output<void>()
  playerVars: YT.PlayerVars = {
    autoplay:1,
    controls: 0,
    loop: 1,
    showinfo: 1,
    iv_load_policy: 3,
    mute: 1,
  }
  constructor(private router: Router) { }

  ngOnInit() {
    this.initApiYoutube()
  }

  initApiYoutube() {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

  }

  changeMuted(event: any) {
    this.mutedState = !this.mutedState;
    (this.mutedState) ? this.youtubePlayer.mute() : this.youtubePlayer.unMute();

    event.stopPropagation()
  }

  createPlayer(videoId: string) {
    this.videoID.set(videoId)
    this.mutedState=true
  }

  onStateChange(event: any) {
    console.log('changing',event.data)
    
      
    if (event.data == YT.PlayerState.ENDED) {
      
      console.log('tferminado')
      this.isEnded.emit()
      
    }
  }

  destroy() {
    this.videoID.set('')
    this.mutedState = true
  }

  redirectDetailsMovie(id: number) {
    this.router.navigate(['/details-movie/' + id])
  }
}
