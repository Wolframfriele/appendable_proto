import { Component, computed, inject, input, output } from "@angular/core";
import { DisplayTagsComponent } from "../display-tags/display-tags.component";
import { DurationVsEstimateComponent } from "../../../shared/ui/duration-vs-estimate/duration-vs-estimate.component";
import { ProjectService } from "../../data/project.service";
import { FuzzySearchFieldComponent } from "../../../shared/ui/fuzzy-search-field/fuzzy-search-field.component";
import { Project } from "../../../model/project.model";
import { ColorService } from "../../../shared/data/color.service";

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
      <a
        routerLink="/projects"
        class="project-link"
        [style.color]="this.projectColor()"
        >{{ projectName() }}</a
      >
    } @else {
      <app-fuzzy-search-field
        [searchableOptions]="projectNames"
        placeholder="@project"
        [setFocus]="true"
        [allowCreation]="true"
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
  duration = input<number>(0);
  estimate = input<number | undefined>(undefined);
  tags = input<string[]>([]);
  projectSelected = output<Project>();
  projectColor = computed(() => {
    const projectName = this.projectName();
    if (!projectName) {
      return this.colorService.defaultColor;
    }
    const project = this.projectService.resolveFromName(projectName);
    if (!project || !project.color) {
      return this.colorService.defaultColor;
    }
    return this.colorService.getColorCode(project.color);
  });

  projectService = inject(ProjectService);
  colorService = inject(ColorService);

  get projectNames(): string[] {
    return this.projectService
      .unarchivedProjects()
      .map((project) => project.name);
  }

  onProjectSelected(projectName: string) {
    const project = this.projectService.resolveFromName(projectName);
    if (project) {
      this.projectSelected.emit(project);
    } else {
      this.projectService.add$.next({
        id: 0,
        name: projectName,
        color: undefined,
        archived: false,
      });

      // await until the resolveFromName manages to resolve then emit the projectSelected
      const newProject = this.projectService.resolveFromName(projectName);
      if (newProject) {
        this.projectSelected.emit(newProject);
      }
    }
  }
}
