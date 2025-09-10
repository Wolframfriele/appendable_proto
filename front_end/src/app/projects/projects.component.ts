import { Component, inject } from "@angular/core";
import { ProjectService } from "../outliner/data/project.service";
import { ProjectComponent } from "./project/project.component";
import { ProjectsStateService } from "./data/projects-state.service";
import { Command, CommandService } from "../shared/data/command.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: "app-projects",
  imports: [ProjectComponent],
  template: `
    <ul>
      @for (project of projects; track idx; let idx = $index) {
        <app-project [project]="project" />
      }
    </ul>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    ul {
      list-style: none;
    }
  `,
})
export class ProjectsComponent {
  state = inject(ProjectsStateService);
  projectService = inject(ProjectService);
  commandService = inject(CommandService);

  constructor() {
    this.commandService.executeCommand$
      .pipe(takeUntilDestroyed())
      .subscribe((command) => {
        switch (command) {
          case Command.ADD_NEW:
            return this.addNewProject();
          case Command.DELETE_ELEMENT:
            return this.deleteActiveProject();
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

  addNewProject() {
    console.log("new project");
  }

  deleteActiveProject() {}

  activatePreviousProject() {}

  activateNextProject() {}
}
