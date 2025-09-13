import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ComunicatorService } from '../shared/services/comunicator/comunicator.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
    selector: 'app-nav-bar',
    imports: [NgClass,RouterLink,FormsModule],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  show:boolean=false
  wordSearch:string=''
  constructor(public comunicatorService: ComunicatorService,private router:Router) {
    console.log(comunicatorService.getBackgroundNav()())
  }

  search(event:any){
    if(event.key==='Enter' && this.wordSearch!=='')
       this.router.navigate(['/search/'+this.wordSearch])
    console.log(event,this.wordSearch)
  }
}
