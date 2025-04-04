import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import InicioComponent from './inicio/inicio.component';
import { register, SwiperContainer } from 'swiper/element/bundle'
register()
@Component({
    selector: 'app-root',
    imports: [RouterOutlet,InicioComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
     schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  title = 'flick-fan';
}
