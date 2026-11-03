import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { getKeyTrailer } from '../../../../utils/helpers';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Serie } from '../../../../../core/interfaces/serie/serie.interface';
import { TimerManager } from '../../../../utils/timer-manager';
import { IconComponent } from "../../../../icon/icon.component";
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { SlidesInfoHook } from '../../../../utils/use-slides-info';
import { HoverSerieExpandDirective } from "../../../../../core/directives/hover-serie-expand/hover-serie-expand.directive";
import { CarouselService } from '../../../../../core/services/test/carousel/carousel-service';
import { useSlideExpansion } from '../../../../utils/use-slide-expansion';

@Component({
  selector: 'app-card-serie',
  imports: [NgOptimizedImage, DecimalPipe, RouterLink,
    IconComponent, CdkPortalOutlet, HoverSerieExpandDirective],
  providers: [TimerManager],
  templateUrl: './card-serie.component.html',
  styleUrls: ['./card-serie.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardSerieComponent {

  readonly serie = input.required<Serie>();
  readonly cardIndex = input<number>()
  readonly carouselService = input.required<CarouselService<any,any>>()

  slideExpansion = useSlideExpansion()

  readonly hoverEnter = output<HTMLElement>();
  readonly hoverLeave = output<HTMLElement>(); 

  onHoverEnter(element:HTMLElement | null){
   const slide = element?.parentElement
    const position = this.carouselService().state().currentPosition?.()

    if (!slide || position === undefined) return

    console.log('expaddiennddo', slide,position)

    this.slideExpansion.adjustTranslateForExpandedSlide( slide,this.carouselService()) 
  }
  onHoverLeave(element:HTMLElement){
    console.log('colapsando')
    this.slideExpansion.restoreBaseTranslate() 
  }
}
