import { Component, LOCALE_ID, inject } from '@angular/core';
import { ApiService } from '../shared/services/api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  date=new Date()
  api=inject(ApiService)

  constructor(){}

  ngOnInit(){
    console.log(LOCALE_ID)
    this.api.getNowPlaying().subscribe(res=>console.log(res))
  }

}
