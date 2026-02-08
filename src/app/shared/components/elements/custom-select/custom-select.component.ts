import { Component, effect, ElementRef, HostListener, input, model, output, Signal, signal, untracked, ViewChild, WritableSignal } from '@angular/core';
import { CdkOverlayOrigin, OverlayModule } from "@angular/cdk/overlay";

@Component({
  selector: 'app-custom-select',
  imports: [OverlayModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.css'
})
export class CustomSelectComponent<T extends { name: string, id: number }> {

  options = input.required<T[]>()
  selectedOption = model.required<T>()
  @ViewChild('panel') panel?: ElementRef<HTMLElement>;
  @ViewChild('origin', { read: ElementRef }) trigger?: ElementRef<HTMLElement>;

  isOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.isOpen()) return;

    const target = event.target as Node;

    const clickedTrigger = this.trigger?.nativeElement.contains(target);
    const clickedPanel = this.panel?.nativeElement.contains(target);

    if (!clickedTrigger && !clickedPanel) {
      this.isOpen.set(false);
    }
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  selectOption(option: T) {
    this.selectedOption.set(option)
    this.isOpen.set(false)
  }

}
