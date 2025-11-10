import { ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import { getKeyTrailer } from '../../../../utils/helpers';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Serie } from '../../../../../core/interfaces/serie/serie.interface';
import { TimerManager } from '../../../../utils/timer-manager';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { IconComponent } from "../../../../icon/icon.component";
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { SkeletonSlidesHook } from '../../../../utils/use-skeleton-slides';
import { HoverSerieExpandDirective } from "../../../../../core/directives/hover-serie-expand/hover-serie-expand.directive";

@Component({
  selector: 'app-card-serie',
  imports: [NgOptimizedImage, DecimalPipe, RouterLink, AutoImagePipe,
    IconComponent, CdkPortalOutlet, HoverSerieExpandDirective],
  providers:[TimerManager],
  templateUrl: './card-serie.component.html',
  styleUrls: ['./card-serie.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardSerieComponent {

  readonly serie = input.required<Serie>();
  readonly slideInfo = input.required<SkeletonSlidesHook>()
  readonly videoKey = computed(() => getKeyTrailer(this.serie()))
 
  readonly hoverEnter = output<HTMLElement>();
  readonly hoverLeave = output<HTMLElement>();

}
