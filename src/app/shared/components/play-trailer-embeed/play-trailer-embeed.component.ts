import { NgClass } from '@angular/common';
import { Component, effect, input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-play-trailer-embeed',
  imports: [NgClass],
  templateUrl: './play-trailer-embeed.component.html',
  styleUrl: './play-trailer-embeed.component.css'
})
export class PlayTrailerEmbeedComponent {
  
  player: any
  mutedState=true
  playerState:number=-1;
  title = input.required<string>()
  id= input.required<number>()
  index= input.required<number>()
  hoverState= input.required<boolean>()

  constructor(private router: Router){
    effect(()=>{
      console.log(this.id())
    })
  }
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
   
    (this.mutedState) ? this.player.mute() : this.player.unMute();
     this.mutedState = !this.mutedState
     event.stopPropagation()
  }

  createPlayer(index: number, videoId: string) {
    console.log(this.index(),videoId,this.title(),this.id(),this.hoverState())
    this.player = new YT.Player(`${this.title()}${index}`, {
      height: '192',
      width: '316',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        loop: 1,
        showinfo: 1,
        iv_load_policy: 3,
        mute: 1,
      },
      events: {
        'onStateChange': (event) => this.onStateChange(event, index),
      }
     
    });
     console.log(this.player)
  }

  onStateChange(event: any, index: number) {
    this.playerState = event.data;
    if (event.data == YT.PlayerState.ENDED) {
      this.player.destroy();
    }
  }

  redirectDetailsMovie(id:number) {
    this.router.navigate(['/details-movie/' + id])
  }
}
