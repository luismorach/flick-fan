import { CommonModule, NgSwitch } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css'
})
export class IconComponent {
  @Input() name: string = '';         // nombre del icono
  @Input() size: string = 'w-5 h-5';  // clases de Tailwind para tamaño
  @Input() color: string = 'text-white'; // color del icono
  @Input() backgroundColor:string = 'bg-transparent'
}
