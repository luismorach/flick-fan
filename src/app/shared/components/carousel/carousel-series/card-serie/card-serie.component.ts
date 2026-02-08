import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { getKeyTrailer } from '../../../../utils/helpers';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Serie } from '../../../../../core/interfaces/serie/serie.interface';
import { TimerManager } from '../../../../utils/timer-manager';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { IconComponent } from "../../../../icon/icon.component";
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { SlidesInfoHook } from '../../../../utils/use-slides-info';
import { HoverSerieExpandDirective } from "../../../../../core/directives/hover-serie-expand/hover-serie-expand.directive";

@Component({
  selector: 'app-card-serie',
  imports: [NgOptimizedImage, DecimalPipe, RouterLink, AutoImagePipe,
    IconComponent, CdkPortalOutlet, HoverSerieExpandDirective],
  providers: [TimerManager],
  templateUrl: './card-serie.component.html',
  styleUrls: ['./card-serie.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardSerieComponent {

  readonly serie = input.required<Serie>();
  readonly slideInfo = input.required<SlidesInfoHook>()
  readonly cardIndex = input<number>()
  readonly activeIndex = input<number>()

  readonly hoverEnter = output<HTMLElement>();
  readonly hoverLeave = output<HTMLElement>();

}
