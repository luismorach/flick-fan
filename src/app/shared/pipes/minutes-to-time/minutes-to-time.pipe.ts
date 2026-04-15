import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minutesToTime'
})
export class MinutesToTimePipe implements PipeTransform {

  transform(value: number | undefined): string {
    if (value == null || isNaN(value) || value == undefined) return '0h 0m';

    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    if (hours > 0)
      return `${hours}h ${minutes}m`;
    else
      return `${minutes}m`;
  }
}
