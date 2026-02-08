import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {fadeTooltip } from '../../../animations/animations';

@Component({
  selector: 'app-tooltip',
  imports: [],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush,
  animations:[fadeTooltip]
})
export class TooltipComponent {
  text = '';
}
