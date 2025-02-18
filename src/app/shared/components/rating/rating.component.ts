import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rating',
  imports: [NgClass],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css'
})
export class RatingComponent {
  @Input() rating: number = 0
  
  calculatePercent = (index:number) => {
    let base=index*2
    if(this.rating-base>=2)
      return {'from-100% to-100%':true}
    else if (this.rating-base<=0)
      return {'from-0% to-0%':true}
    else{
      let percent=(100/(2/(this.rating-base))).toFixed(2)
      let nameClass='from-['+percent+'%] to-['+percent+'%]'
      return { nameClass:true}
    }
  }
  
}
