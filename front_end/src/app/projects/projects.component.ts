import { Component, inject } from "@angular/core";
import { ProjectService } from "../outliner/data/project.service";
import { ProtectedService } from "../shared/data/protected.service";

@Component({
  standalone: true,
  selector: "app-projects",
  imports: [],
  template: `
    <p>{{ protectedService.protectedResponse() }}</p>

    <p>{{ protectedService.error() }}</p>
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
  protectedService = inject(ProtectedService);

  get projects() {
    return this.projectService.projects();
  }
}
