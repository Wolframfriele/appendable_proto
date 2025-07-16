import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayDuration'
})
export class DisplayDurationPipe implements PipeTransform {

  /**
   * Convert a duration in seconds to a string of the format 2d 5h 42m.
   * If a unit is zero it is ignored
   * @param seconds The duration in seconds
   * @returns a string representing the duration
   */
  transform(seconds: number | undefined): string {
    if (seconds === undefined) {
      return '';
    }

    const days = Math.floor(seconds / 86400);
    const days_remainder = seconds % 86400
    const hours = Math.floor(days_remainder / 3600);
    const hours_remainder = days_remainder % 3600
    const minutes = Math.floor(hours_remainder / 60);

    var result = '';
    if (days > 0) {
      result = result + `${days}d `;
    }
    if (hours > 0) {
      result = result + `${hours}h `;
    }
    if (minutes > 0) {
      result = result + `${minutes}m `;
    }
    if (result === '') {
      return '0m';
    }

    return result.trim();
  }
}
