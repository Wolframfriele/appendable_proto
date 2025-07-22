import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'urlDatetime'
})
export class UrlDatetimePipe implements PipeTransform {

  transform(value: Date): unknown {
    return formatDate(value, 'yyyy-MM-ddTHH:mm:ss', 'en-gb');
  }

}
