import { Component, inject } from "@angular/core";
import { ProjectService } from "../outliner/data/project.service";
import { ProjectsStateService } from "./data/projects-state.service";
import { Command, CommandService } from "../shared/data/command.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ColorService } from "../shared/data/color.service";

@Component({
  standalone: true,
  selector: "app-projects",
  imports: [],
  template: `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Color</th>
          <th>Archived</th>
        </tr>
      </thead>
      <tbody>
        @for (project of projects; track idx; let idx = $index) {
          <tr [class.active]="this.isActive(idx)">
            <td>{{ project.id }}</td>
            <td [style.color]="this.colorForProject(project.color)">
              {{ project.name }}
            </td>
            <td>
              {{ project.color }}
            </td>
            <td>
              {{ project.archived }}
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    table {
      background: var(--background-deep);
      border-spacing: 0 1rem;
      width: 50rem;
      text-align: center;
      border-radius: 5px;
      margin-top: 2rem;
    }

    tr {
      padding: 0.5rem;
      border-radius: 5px;
    }

    th {
      /*background: var(--darker-black);*/
      padding: 0.5rem;
    }

    td {
      padding: 0.5rem;
    }
  `,
})
export class ProjectsComponent {
  state = inject(ProjectsStateService);
  projectService = inject(ProjectService);
  commandService = inject(CommandService);
  colorService = inject(ColorService);

  constructor() {
    this.commandService.executeCommand$
      .pipe(takeUntilDestroyed())
      .subscribe((command) => {
        switch (command) {
          case Command.ADD_NEW:
            return this.addNewProject();
          case Command.DELETE_ELEMENT:
            return this.archiveProject();
          case Command.MOVE_TO_PREVIOUS_ELEMENT:
            return this.activatePreviousProject();
          case Command.MOVE_TO_NEXT_ELEMENT:
            return this.activateNextProject();
        }
      });
  }

  get projects() {
    return this.projectService.projects();
  }

  colorForProject(colorId: number | undefined): string {
    if (!colorId) {
      return this.colorService.defaultColor;
    }
    return this.colorService.getColorCode(colorId);
  }

  addNewProject() {
    console.log("new project");
  }

  archiveProject() {}

  activatePreviousProject() {
    if (this.state.activeProjectIdx() > 0) {
      this.state.activeProjectIdx.update((currentId) => currentId - 1);
    }
  }

  activateNextProject() {
    if (this.state.activeProjectIdx() < this.projects.length - 1) {
      this.state.activeProjectIdx.update((currentId) => currentId + 1);
    }
  }

  isActive(idx: number): boolean {
    return this.state.activeProjectIdx() === idx;
  }
}
