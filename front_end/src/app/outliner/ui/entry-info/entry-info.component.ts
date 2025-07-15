import { Component, input } from '@angular/core';
import { DisplayTimePipe } from '../../../pipes/display-time.pipe';
import { DisplayTagsComponent } from '../display-tags/display-tags.component';
import { DurationVsEstimateComponent } from '../../../shared/ui/duration-vs-estimate/duration-vs-estimate.component';

@Component({
  selector: 'app-entry-info',
  imports: [DisplayTimePipe, DurationVsEstimateComponent, DisplayTagsComponent],
  template: `
    <div class="entry-info">
      <time>{{ startTime() | displayTime }}</time>

      <app-duration-vs-estimate
        class="duration-component"
        [duration]="duration()"
        [estimate]="estimate()"
      />

      <app-display-tags
        [tags]="tags()"
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
  startTime = input.required<Date>();
  duration = input.required<number>();
  estimate = input.required<number | undefined>();
  tags = input.required<string[]>();
}
