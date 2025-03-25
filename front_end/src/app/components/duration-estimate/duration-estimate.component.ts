import { Component, computed, input, Signal } from '@angular/core';
import { DisplayDurationPipe } from '../../pipes/display-duration.pipe';

@Component({
  selector: 'app-duration-estimate',
  imports: [],
  templateUrl: './duration-estimate.component.html',
  styleUrl: './duration-estimate.component.scss'
})
export class DurationEstimateComponent {
  startTime = input<Date>();
  endTime = input<Date>();
  estimate = input<number>();

  displayDuration: Signal<string> = computed(() => {
    const pipe = new DisplayDurationPipe();
    const estimate = this.estimate();
    let result = pipe.transform(this.calculateDuration(this.startTime(), this.endTime()));
    if (estimate != undefined) {
      if (result === '') {
        result = '0m';
      }
      result = result + ` / ~${pipe.transform(estimate)}`
    }
    return result;
  })

  private calculateDuration(startTime: Date | undefined, endTime: Date | undefined) {
    if (endTime !== undefined && startTime !== undefined) {
      return Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    } 
    return 0;
  }

}
