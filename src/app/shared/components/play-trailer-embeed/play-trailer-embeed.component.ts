import { NgClass } from '@angular/common';
import { Component, input, output, signal, ViewChild, WritableSignal } from '@angular/core';
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
  size = input.required<number[]>()
  isMovie = input.required<boolean>()
  id = 0
  videoID: WritableSignal<string> = signal('')
  isEnded = output<void>()
  playerVars: YT.PlayerVars = {
    controls: 0,
    autoplay: 1,
    iv_load_policy: 3,
    mute: 1,
    showinfo: 0,  
    modestbranding: 1,
    cc_load_policy: 0,
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

  setPlayerVideoData(videoId: string, id: number) {
    this.videoID.set(videoId)
    this.id = id
    this.mutedState = true
    console.log('qactivqaknkdo', this.videoID())

  }

  onStateChange(event: any) {
    console.log('sftqafte change', event)
    if (event.data == YT.PlayerState.ENDED) {
      this.isEnded.emit()
    }
  }

  onReady(event: any) {
    console.log('ya esta ready', event)
  }

  destroy() {
    this.videoID.set('')
    this.mutedState = true
  }

  redirect() {
    (this.isMovie()) ? this.redirectDetailsMovie(this.id) : this.redirectDetailsSerie(this.id)
  }

  redirectDetailsMovie(id: number) {
    this.router.navigate(['/details-movie/' + id])
  }
  
  redirectDetailsSerie(id: number) {
    this.router.navigate(['/details-serie/' + id])
  }

}
