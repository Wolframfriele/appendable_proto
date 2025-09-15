import { Component, effect, inject, input, model } from "@angular/core";
import { Block } from "../../../model/block.model";
import { BlockInfoComponent } from "../block-info/block-info.component";
import { EntryService } from "../../data/entry.service";
import { OutlinerEntryComponent } from "../outliner-entry/outliner-entry.component";
import { DisplayTimePipe } from "../../../pipes/display-time.pipe";
import { Project } from "../../../model/project.model";
import { BlockService } from "../../data/block.service";
import { Entry } from "../../../model/entry.model";

@Component({
  standalone: true,
  selector: "app-outliner-block",
  imports: [BlockInfoComponent, OutlinerEntryComponent, DisplayTimePipe],
  host: {
    "[class.active]": "active()",
  },
  template: `
    <div class="block-elements-container">
      <span class="line" [class.hidden]="!hasEntries"></span>
      <span class="dot"></span>
      <div class="block-text">
        <app-block-info
          [projectName]="blockModel().projectName"
          [duration]="blockModel().duration"
          [tags]="blockModel().tags"
          (projectSelected)="onProjectSelected($event)"
        />
        @if (hasEntries) {
          <ul class="entries-list">
            @for (entry of entriesForBlock(); track idx; let idx = $index) {
              <app-outliner-entry
                [entry]="entry"
                [blockIdx]="blockIdx()"
                [idx]="idx"
                [isActive]="entryIsActive(idx)"
              />
            }
          </ul>
        }
      </div>
    </div>
    <time>{{ block().start | displayTime }}</time>
  `,
  styles: `
    :host {
      width: 90%;
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
      width: 90%;
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
      display: none;
      border-left: 1px solid var(--secondary-text);
      margin-top: 1rem;
      margin-left: 1.3rem;
      margin-bottom: 1rem;
    }

    .dot {
      display: none;
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

    @media (min-width: 29rem) {
      .line {
        display: block;
      }

      .dot {
        display: block;
      }
    }
  `,
})
export class OutlinerBlockComponent {
  block = input.required<Block>();
  blockIdx = input.required<number>();
  entriesForBlock = input<Entry[] | undefined>(undefined);
  active = input(false);
  activeEntry = input<number>(0);

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

  get hasEntries() {
    if (this.entriesForBlock()) {
      return true;
    }
    return false;
  }

  entryIsActive(idx: number): boolean {
    if (this.active() && this.activeEntry() === idx) {
      return true;
    }
    return false;
  }
}
