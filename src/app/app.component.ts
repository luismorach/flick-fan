import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import InicioComponent from './inicio/inicio.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet,InicioComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'flick-fan';
}
