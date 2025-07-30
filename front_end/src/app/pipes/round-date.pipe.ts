import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundDate'
})
export class RoundDatePipe implements PipeTransform {

  transform(value: Date): string {
    return value.toISOString().split('T')[0];
  }
}
