import { Component, input } from '@angular/core';
import { DisplayTimePipe } from '../../../pipes/display-time.pipe';
import { DurationEstimateComponent } from '../duration-estimate/duration-estimate.component';
import { DisplayTagsComponent } from '../display-tags/display-tags.component';
import { Entry } from '../../../model/entry.model';

@Component({
  selector: 'app-entry-info',
  imports: [DisplayTimePipe, DurationEstimateComponent, DisplayTagsComponent],
  template: `
    <div class="entry-info">
      <time>{{entry().startTimestamp| displayTime}}</time>

      <app-duration-estimate
        class="duration-component"
        [startTime]="entry().startTimestamp"
        [endTime]="entry().endTimestamp"
        [estimate]="entry().estimatedDuration"
      />

      <app-display-tags
        [tags]="entry().tags"
      />
    </div>
  `,
  styles: `
    .entry-info {
      width: 100%;
      margin: 0.5rem 0 0.2rem 0;
      display: flex;
      align-items: center;

      time {
        font-family: var(--font-family);
        color: var(--secondary-text);
        font-weight: 600;
        font-size: 1rem;
        margin-right: 1rem;
        transform: translateY(0.05rem);
      }

      .duration-component {
        margin-right: 1rem;
        display: inline-block;
      }
    }
  `
})
export class EntryInfoComponent {
  entry = input.required<Entry>();
}
