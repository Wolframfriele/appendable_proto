import { Component, inject } from "@angular/core";
import { ProjectService } from "../outliner/data/project.service";
import { ProjectsStateService } from "./data/projects-state.service";
import { Command, CommandService } from "../shared/data/command.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ColorService } from "../shared/data/color.service";
import { ProjectComponent } from "./ui/project/project.component";

@Component({
  standalone: true,
  selector: "app-projects",
  imports: [ProjectComponent],
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
          <app-project
            [project]="project"
            [projectColor]="this.colorForProject(project.color)"
            [idx]="idx"
          />
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
      width: 100%;
      text-align: center;
      border-radius: 5px;
      margin-top: 2rem;
    }

    th {
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
    this.commandService.executed$
      .pipe(takeUntilDestroyed())
      .subscribe((command) => {
        switch (command) {
          case Command.ADD_NEW:
            return this.addNewProject();
          case Command.ARCHIVE_PROJECT:
            return this.archiveProject();
          case Command.UNARCHIVE_PROJECT:
            return this.unarchiveProject();
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

  get activeProject() {
    return this.projects[this.state.activeProjectIdx()];
  }

  colorForProject(colorId: number | undefined): string {
    if (!colorId) {
      return this.colorService.noColor;
    }
    return this.colorService.getColorCode(colorId);
  }

  addNewProject() {
    this.projectService.add("").subscribe((projects) => {
      // Find way to set new project as active
      // If I could get the ID of the new project
      // I am returning that on creation, I just don't have access to that part of the stream
      // In the entries, I'm just assuming that a new entry will always be the last element, but
      // for projects that might not be the case (If I allow the user to click on datatable headers to change sorting)
      this.state.activeProjectIdx.set(projects.length - 1);
      this.commandService.execute(Command.SWITCH_TO_INSERT_MODE);
    });
  }

  archiveProject() {
    this.projectService.archive(this.activeProject.id);
  }

  unarchiveProject() {
    this.projectService.unarchive(this.activeProject.id);
  }

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
}
