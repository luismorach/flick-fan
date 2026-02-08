import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy
} from '@angular/core';

import {
  Overlay,
  OverlayRef
} from '@angular/cdk/overlay';

import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipComponent } from '../../../shared/components/elements/tooltip/tooltip.component';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {

  @Input('appTooltip') text = '';

  private overlayRef?: OverlayRef;

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef
  ) { }

  @HostListener('mouseenter')
  show() {
    if (this.overlayRef) return;

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -12
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    const tooltipPortal = new ComponentPortal(TooltipComponent);
    const tooltipRef = this.overlayRef.attach(tooltipPortal);
    tooltipRef.instance.text = this.text;
  }

  @HostListener('mouseleave')
  hide() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
  }
}
