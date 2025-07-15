import { Component, computed, input, Signal } from '@angular/core';
import { DisplayDurationPipe } from '../../../pipes/display-duration.pipe';

@Component({
  selector: 'app-duration-vs-estimate',
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
export class DurationVsEstimateComponent {

  duration = input<number>();
  estimate = input<number>();

  formatDuration: Signal<string> = computed(() => {
    const pipe = new DisplayDurationPipe();
    const estimate = this.estimate();

    let result = pipe.transform(this.duration());
    result = result + ` / ~${pipe.transform(estimate)}`
    return result;
  })
}
