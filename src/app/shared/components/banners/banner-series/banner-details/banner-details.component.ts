import { DatePipe} from '@angular/common';
import { Component, input } from '@angular/core';
import { Serie } from '../../../../../core/interfaces/serie/serie.interface';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { RatingComponent } from '../../../rating/rating.component';
import { IconComponent } from '../../../../icon/icon.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner-details',
  imports: [AutoImagePipe,RatingComponent,IconComponent,DatePipe,RouterLink],
  templateUrl: './banner-details.component.html',
  styleUrl: './banner-details.component.css'
})
export class BannerDetailsComponent {
  readonly serie = input.required<Serie>()
}
