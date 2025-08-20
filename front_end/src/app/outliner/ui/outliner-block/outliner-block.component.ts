import { Component, effect, inject, input, model } from "@angular/core";
import { Block } from "../../../model/block.model";
import { BlockInfoComponent } from "../block-info/block-info.component";
import { RouterLink } from "@angular/router";
import { EntryService } from "../../data/entry.service";
import { OutlinerEntryComponent } from "../outliner-entry/outliner-entry.component";
import { DisplayTimePipe } from "../../../pipes/display-time.pipe";
import { Project } from "../../../model/project.model";
import { BlockService } from "../../data/block.service";
import { Command, CommandService } from "../../../shared/data/command.service";

@Component({
  standalone: true,
  selector: "app-outliner-block",
  imports: [
    BlockInfoComponent,
    OutlinerEntryComponent,
    RouterLink,
    DisplayTimePipe,
  ],
  host: {
    "[class.active]": "active()",
  },
  template: `
    <div class="block-elements-container">
      <span class="line" [class.hidden]="hasNoEntries"></span>
      <span class="dot"></span>
      <div class="block-text">
        <app-block-info
          [projectName]="blockModel().projectName"
          [duration]="blockModel().duration"
          [tags]="blockModel().tags"
          (projectSelected)="onProjectSelected($event)"
        />
        @if (findEntriesForBlock() !== undefined) {
          <ul class="entries-list">
            @for (entry of findEntriesForBlock(); track idx; let idx = $index) {
              <app-outliner-entry [entry]="entry" [idx]="idx" />
            }
          </ul>
        }
      </div>
    </div>
    <time>{{ block().start | displayTime }}</time>
  `,
  styles: `
    :host {
      width: 50rem;
      margin-bottom: 1rem;
      background: var(--background-deep);
      border-left: 5px solid var(--background-deep);
      border-radius: 5px;
      padding: 0.5rem;
    }

    :host(.active) {
      border-left: 5px solid var(--active-color);
    }

    .block-text {
      width: 45rem;
    }

    .block-title {
      margin: 0.4rem;
    }

    .block-elements-container {
      display: flex;
      flex-wrap: wrap;
      align-items: stretch;
      gap: 0.5rem;
    }

    .line {
      border-left: 1px solid var(--secondary-text);
      margin-top: 1rem;
      margin-left: 1.3rem;
      margin-bottom: 1rem;
    }

    .dot {
      height: 0.5rem;
      width: 0.5rem;
      background-color: var(--secondary-text);
      border-radius: 50%;
      margin-left: -0.75rem;
      margin-top: 0.75rem;
      margin-right: 0.5rem;
      margin-bottom: 1rem;
      align-self: end;
    }

    time {
      font-family: var(--font-family);
      color: var(--secondary-text);
      font-weight: 600;
      font-size: 1rem;
      transform: translateY(0.05rem);
    }

    ul {
      list-style: none;
      padding: 0;
    }
  `,
})
export class OutlinerBlockComponent {
  block = input.required<Block>();
  active = input<boolean>(false);

  blockService = inject(BlockService);
  entryService = inject(EntryService);

  blockModel = model<Block>({
    id: 0,
    start: new Date(),
    end: undefined,
    duration: 0,
    text: "",
    project: undefined,
    projectName: undefined,
    tags: [],
  });

  constructor() {
    effect(() =>
      this.blockModel.set({
        id: this.block().id,
        start: this.block().start,
        end: this.block().end,
        duration: this.block().duration,
        text: this.block().text,
        project: this.block().project,
        projectName: this.block().projectName,
        tags: this.block().tags,
      }),
    );
  }

  onProjectSelected(selectedProject: Project) {
    this.blockModel.update((block) => ({
      ...block,
      project: selectedProject.id,
      projectName: selectedProject.name,
    }));
    if (this.blockModel() !== this.block()) {
      this.blockService.edit$.next(this.blockModel());
    }
  }

  findEntriesForBlock() {
    return this.entryService.entries().get(this.block().id);
  }

  get hasNoEntries() {
    if (this.findEntriesForBlock()) {
      return false;
    }
    return true;
  }
}
