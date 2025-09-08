import { Component, inject } from "@angular/core";
import { ProjectService } from "../outliner/data/project.service";

@Component({
  standalone: true,
  selector: "app-projects",
  imports: [],
  template: `
    <ul>
      @for (project of projects; track idx; let idx = $index) {
        <li>{{ project.name }}</li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `,
})
export class ProjectsComponent {
  projectService = inject(ProjectService);

  get projects() {
    return this.projectService.projects();
  }
}
