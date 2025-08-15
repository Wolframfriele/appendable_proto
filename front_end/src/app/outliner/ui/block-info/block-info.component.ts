import {
  Component,
  effect,
  inject,
  input,
  output,
  Output,
} from "@angular/core";
import { DisplayTagsComponent } from "../display-tags/display-tags.component";
import { DurationVsEstimateComponent } from "../../../shared/ui/duration-vs-estimate/duration-vs-estimate.component";
import { ProjectService } from "../../data/project.service";
import { FuzzySearchFieldComponent } from "../../../shared/ui/fuzzy-search-field/fuzzy-search-field.component";
import { Project } from "../../../model/project.model";

@Component({
  standalone: true,
  selector: "app-block-info",
  imports: [
    FuzzySearchFieldComponent,
    DurationVsEstimateComponent,
    DisplayTagsComponent,
  ],
  template: `
    @if (projectName()) {
      <a routerLink="/projects/" class="project-link">{{ projectName() }}</a>
    } @else {
      <app-fuzzy-search-field
        [searchableOptions]="projectNames"
        placeholder="@project"
        [setFocus]="true"
        (selected)="onProjectSelected($event)"
      />
    }

    <app-duration-vs-estimate
      class="duration-component"
      [duration]="duration()"
      [estimate]="estimate()"
    />

    <app-display-tags [tags]="tags()" />
  `,
  styles: `
    :host {
      width: 100%;
      margin: 0.5rem 0 0.2rem 0;
      display: flex;
      align-items: center;

      app-fuzzy-search-field {
        --search-box-width: 45rem;
      }

      .duration-component {
        margin: 0 1rem;
        display: inline-block;
      }

      .project-link {
        display: inline-block;
        color: var(--deep-cyan);
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
  projectSelected = output<Project>();

  projectService = inject(ProjectService);

  get projectNames(): string[] {
    return this.projectService.projects().map((project) => project.name);
  }

  onProjectSelected(projectName: string) {
    const project = this.projectService.resolveProjectFromName(projectName);
    if (project) {
      this.projectSelected.emit(project);
    } else {
      // Create a new project. Also requires me to make it possible to return
      // unknown values from the fuzzy selector component
    }
  }
}
