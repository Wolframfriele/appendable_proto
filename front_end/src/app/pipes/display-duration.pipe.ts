import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayDuration'
})
export class DisplayDurationPipe implements PipeTransform {

  /**
   * Convert a duration in minutes to a string of the format 2d 5h 42m.
   * If a unit is zero it is ignored
   * @param minutes The duration in minutes
   * @returns a string representing the duration
   */
  transform(minutes: number | undefined): string {
    if (minutes === undefined) {
      return '0';
    }

    const days = Math.floor(minutes / 3600);
    const hours = Math.floor(minutes / 60);
    const minutesRemainder = minutes % 60;

    var result = '';
    if (days > 0) {
      result = result + `${days}d `;
    }
    if (hours > 0) {
      result = result + `${hours}h `;
    }
    if (minutes > 0) {
      result = result + `${minutesRemainder}m `;
    }
    if (result === '') {
      return '0m';
    }
    return result.trim();
  }
}
