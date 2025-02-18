import { AnimationBuilder, AnimationFactory, animate, style } from '@angular/animations';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationsService {

  constructor() { }
  _builder= inject(AnimationBuilder)

  moveX(duration: string, delay: string, start: string, end:string): AnimationFactory {
      return this._builder.build([
        style({ transform: `translateX(${start})` }),
        animate(duration + ' ' + delay+' ease', style({ transform: `translateX(${end})`}))
      ])
    }
  
    moveY(duration: string, delay: string, start: string,end:string): AnimationFactory {
      return this._builder.build([
        style({ transform: `translateY(${start})`, opacity: '0' }),
        animate(duration + ' ' + delay+' ease', style({ transform: `translateY(${end})`, opacity: '1' }))
      ])
    }
    changeX(duration: string, delay: string, start: string, end:string): AnimationFactory {
      return this._builder.build([
        style({ left: start }),
        animate(duration + ' ' + delay+' ease', style({ left:end}))
      ])
    }
    changeY(duration: string, delay: string, start: string, end:string): AnimationFactory {
      return this._builder.build([
        style({ top: start }),
        animate(duration + ' ' + delay+' ease', style({ top:end}))
      ])
    }

    changeSize(duration: string, delay: string, startWidth: string,startHeight:string,
      endWidth:string,endHeight:string){
      return this._builder.build([
        style({ width: startWidth, height: startHeight}),
        animate(duration + ' ' + delay+' ease', style({ width:endWidth, height: endHeight}))
      ])
    }

    minimizedTrailer(duration: string, delay: string, startWidth: string,startHeight:string,
      endWidth:string,endHeight:string){
      return this._builder.build([
        style({ width: startWidth, height: startHeight,top:'0%',left:'0%' }),
        animate(duration + ' ' + delay, style({ width:endWidth, height: endHeight,top:'70%',left:'60%'  }))
      ])
    }
    maximizedTrailer(duration: string, delay: string, startWidth: string,startHeight:string,
      endWidth:string,endHeight:string){
      return this._builder.build([
        style({ width: startWidth, height: startHeight,bottom:'0%',right:'0%' }),
        animate(duration + ' ' + delay, style({ width:endWidth, height: endHeight,bottom:'100%',right:'100%'  }))
      ])
    }
}
