import { Component, computed, input, Signal } from '@angular/core';
import { DisplayDurationPipe } from '../../../pipes/display-duration.pipe';

@Component({
  selector: 'app-duration-estimate',
  standalone: true,
  imports: [],
  template: `
    <div class="duration">{{ formatDuration() }} </div>
  `,
  styles: `
    .duration {
        color: var(--secondary-text);
        font-size: 0.95rem;
        font-style: italic;
        display: inline-block;
    }
  `
})
export class DurationEstimateComponent {
  startTime = input<Date>();
  endTime = input<Date>();
  estimate = input<number>();
  // displayDuration = output<boolean>();

  duration: Signal<number> = computed(() => this.calculateDuration(this.startTime(), this.endTime()));

  //calculateDisplayDuration: Signal<boolean> computed(() => {
  //  return (this.duration() !== 0 || this.estimate() !== 0);
  //});

  formatDuration: Signal<string> = computed(() => {
    const pipe = new DisplayDurationPipe();
    const estimate = this.estimate();

    let result = pipe.transform(this.calculateDuration(this.startTime(), this.endTime()));
    result = result + ` / ~${pipe.transform(estimate)}`
    return result;
  })

  private calculateDuration(startTime: Date | undefined, endTime: Date | undefined) {
    if (endTime !== undefined && startTime !== undefined) {
      return Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    }
    return 0;
  }
}
