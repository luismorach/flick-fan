import { Component, ChangeDetectionStrategy} from '@angular/core';
import { RouterOutlet, provideRouter } from '@angular/router';
import { routes } from './inicio.routes';


@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InicioComponent {
  

}
