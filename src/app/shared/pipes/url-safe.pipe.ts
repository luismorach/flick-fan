import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'urlSafe',
  standalone: true
})
export class UrlSafePipe implements PipeTransform {
  satinizer = inject(DomSanitizer)
  transform(value: string): SafeResourceUrl{
    console.log(value)
    return this.satinizer.bypassSecurityTrustResourceUrl(value)
  }

}
