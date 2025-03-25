import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayTime'
})
export class DisplayTimePipe implements PipeTransform {

  transform(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

}
