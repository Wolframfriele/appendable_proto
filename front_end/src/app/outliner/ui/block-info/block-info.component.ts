import { Component, input } from "@angular/core";
import { DisplayTimePipe } from "../../../pipes/display-time.pipe";
import { DisplayTagsComponent } from "../display-tags/display-tags.component";
import { DurationVsEstimateComponent } from "../../../shared/ui/duration-vs-estimate/duration-vs-estimate.component";

@Component({
  standalone: true,
  selector: "app-block-info",
  imports: [DisplayTimePipe, DurationVsEstimateComponent, DisplayTagsComponent],
  template: `
    <div class="entry-info">
      <p class="block-title">
        {{ text() }}
        @if (projectName()) {
          <a routerLink="/projects/" class="project-link">{{
            projectName()
          }}</a>
        }
      </p>
      <app-duration-vs-estimate
        class="duration-component"
        [duration]="duration()"
        [estimate]="estimate()"
      />

      <app-display-tags [tags]="tags()" />
    </div>
  `,
  styles: `
    .entry-info {
      width: 100%;
      margin: 0.5rem 0 0.2rem 0;
      display: flex;
      align-items: center;

      .duration-component {
        margin: 0 1rem;
        display: inline-block;
      }

      .project-link {
        display: inline-block;
        color: var(--deep-cyan);
      }

      .block-title {
        margin: 0.3rem;
      }
    }
  `,
})
export class BlockInfoComponent {
  text = input<string>("");
  projectName = input<string | undefined>(undefined);
  duration = input<number>(0);
  estimate = input<number | undefined>(undefined);
  tags = input<string[]>([]);
}
