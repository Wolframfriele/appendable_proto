import { Component, effect, inject, input } from "@angular/core";
import { DisplayTagsComponent } from "../display-tags/display-tags.component";
import { DurationVsEstimateComponent } from "../../../shared/ui/duration-vs-estimate/duration-vs-estimate.component";
import { ProjectService } from "../../data/project.service";

@Component({
  standalone: true,
  selector: "app-block-info",
  imports: [DurationVsEstimateComponent, DisplayTagsComponent],
  template: `
    <div class="block-info">
      <p class="block-title">
        @if (projectName()) {
          <a routerLink="/projects/" class="project-link">{{
            projectName()
          }}</a>
        } @else {
          <input
            type="text"
            placeholder="@project"
            id=""
            class="project-selector"
          />
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
    .block-info {
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

      .project-selector {
        background: var(--background);
        border: none;
        color: var(--deep-cyan);
        font-size: 1.25rem;
        width: 12rem;
      }

      .project-selector::placeholder {
        color: var(--secondary-text);
      }

      .project-selector:focus {
        outline: none;
      }
    }
  `,
})
export class BlockInfoComponent {
  projectName = input<string | undefined>(undefined);
  projectId = input<number | undefined>(undefined);
  duration = input<number>(0);
  estimate = input<number | undefined>(undefined);
  tags = input<string[]>([]);

  projectService = inject(ProjectService);
}
