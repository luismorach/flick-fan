import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ComunicatorService } from '../core/services/comunicator/comunicator.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule} from '@angular/forms';

@Component({
    selector: 'app-nav-bar',
    imports: [NgClass,RouterLink,FormsModule],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  isMenuOpen:boolean=false
  searchQuery:string=''

  constructor(public comunicatorService: ComunicatorService,private router:Router) {
    console.log(comunicatorService.getBackgroundNav()())
  }

  onSearch(){
    if(this.searchQuery!=='')
       this.router.navigate(['/search/'+this.searchQuery])
    console.log(this.searchQuery)
  }
}
