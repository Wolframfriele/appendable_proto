import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  ViewChild,
} from "@angular/core";
import { Project } from "../../../model/project.model";
import { ContenteditableDirective } from "../../../model/contenteditable.model";
import { FormsModule } from "@angular/forms";
import { CheckboxComponent } from "../../../outliner/ui/checkbox/checkbox.component";
import { ProjectService } from "../../../outliner/data/project.service";
import { Command, CommandService } from "../../../shared/data/command.service";
import { ProjectsStateService } from "../../data/projects-state.service";
import { KeyboardService } from "../../../shared/data/keyboard.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, filter } from "rxjs";

@Component({
  standalone: true,
  selector: "app-project",
  imports: [ContenteditableDirective, FormsModule, CheckboxComponent],
  template: `
    <tr [class.active]="this.displayActive()">
      <td>{{ project().id }}</td>
      <td
        #textBox
        [id]="project().id"
        [style.color]="projectColor()"
        [contentEditable]="true"
        [(ngModel)]="projectModel().name"
        contenteditableModel
      ></td>
      <td>
        {{ project().color }}
      </td>
      <td>
        <app-checkbox
          [checked]="project().archived"
          (checkedToggle)="onArchivedToggled($event)"
        />
      </td>
    </tr>
  `,
  styles: `
    :host {
      display: contents;
    }

    tr {
      padding: 0.5rem;
      border-radius: 5px;
    }

    td {
      padding: 0.5rem;
      outline: none;
    }
  `,
})
export class ProjectComponent {
  project = input.required<Project>();
  projectColor = input.required<string>();
  idx = input.required<number>();

  isActive = computed(
    () => this.projectState.activeProjectIdx() === this.idx(),
  );
  displayActive = computed(
    () => this.isActive() && !this.keyboardService.isInsertMode(),
  );

  @ViewChild("textBox")
  textBox!: ElementRef<HTMLDivElement>;

  projectModel = model<Project>({
    id: 0,
    name: "",
    color: undefined,
    archived: false,
  });

  projectService = inject(ProjectService);
  projectState = inject(ProjectsStateService);
  commandService = inject(CommandService);
  keyboardService = inject(KeyboardService);

  constructor() {
    effect(() =>
      this.projectModel.set({
        id: this.project().id,
        name: this.project().name,
        color: this.project().color,
        archived: this.project().archived,
      }),
    );

    effect(() => {
      if (this.isActive() && this.keyboardService.isInsertMode()) {
        this.focusProject();
      }
    });

    toObservable(this.isActive)
      .pipe(
        distinctUntilChanged(),
        filter((value) => value === false),
      )
      .subscribe(() => this.updateProjectWhenDirty());
  }

  get projectDirty(): boolean {
    return (
      JSON.stringify(this.project()) !== JSON.stringify(this.projectModel())
    );
  }

  onArchivedToggled(newValue: boolean) {
    if (newValue == true) {
      this.projectService.archive(this.project().id);
    } else {
      this.projectService.unarchive(this.project().id);
    }
  }

  focusProject() {
    setTimeout(() => {
      this.textBox.nativeElement.focus();
    });
    if (!this.keyboardService.isInsertMode()) {
      this.commandService.executeCommand$.next(Command.SWITCH_TO_INSERT_MODE);
    }
    if (this.projectState.activeProjectIdx() !== this.idx()) {
      this.projectState.activeProjectIdx.set(this.idx());
    }
  }

  updateProjectWhenDirty() {
    if (this.projectDirty) {
      this.projectService.edit(this.projectModel());
    }
  }
}
