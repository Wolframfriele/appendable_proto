import { Component, inject, signal } from "@angular/core";
import { DateRangeService } from "./data/date-range.service";
import { DisplayDatePipe } from "../pipes/display-date.pipe";
import { BlockService } from "./data/block.service";
import { OutlinerBlockComponent } from "./ui/outliner-block/outliner-block.component";
import { Command, CommandService } from "../shared/data/command.service";
import { Block } from "../model/block.model";
import { EntryService } from "./data/entry.service";

@Component({
  selector: "app-outliner",
  standalone: true,
  imports: [OutlinerBlockComponent, DisplayDatePipe],
  template: `
    @for (block of blocks; track idx; let idx = $index) {
      @if (previousBlockIsDifferentDate(idx)) {
        <h1>{{ block.start | displayDate }}</h1>
      }

      <app-outliner-block
        [block]="block"
        [entriesForBlock]="findEntriesForBlock(block)"
        [active]="blockIsActive(idx)"
        [activeEntry]="activeEntryIdx()"
      />
    }

    @if (!blockService.loaded()) {
      <div>loading</div>
    }
    @if (blockService.error()) {
      <p>Problem loading entries</p>
    }
    <button (click)="dateRangeService.expand$.next(undefined)">
      Load more entries
    </button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `,
})
export default class OutlinerComponent {
  dateRangeService = inject(DateRangeService);
  blockService = inject(BlockService);
  entryService = inject(EntryService);
  commandService = inject(CommandService);

  activeBlockIdx = signal(0);
  activeEntryIdx = signal(0);

  constructor() {
    this.commandService.executeCommand$.subscribe((command) => {
      switch (command) {
        case Command.ADD_NEW:
          this.addNewBlock();
          break;
        case Command.DELETE_SELECTED_BLOCK:
          this.deleteActiveBlock();
          break;
        case Command.END_SELECTED_BLOCK:
          this.endActiveBlock();
          break;
        case Command.ADD_NEW_ENTRY:
          this.addNewEntry();
          break;
        case Command.MOVE_TO_PREVIOUS_ELEMENT:
          this.activatePreviousEntry();
          break;
        case Command.MOVE_TO_NEXT_ELEMENT:
          this.activateNextEntry();
          break;
        case Command.MOVE_TO_PREVIOUS_CONTAINER:
          this.activatePreviousBlock();
          this.activeEntryIdx.set(0);
          break;
        case Command.MOVE_TO_NEXT_CONTAINER:
          this.activateNextBlock();
          this.activeEntryIdx.set(0);
          break;
      }
    });
  }

  get blocks() {
    return this.blockService.blocks();
  }

  get entries() {
    return this.entryService.entries();
  }

  get activeBlock(): Block {
    return this.blocks[this.activeBlockIdx()];
  }

  previousBlockIsDifferentDate(idx: number) {
    if (idx > 0) {
      const currentBlockDate = this.roundDate(this.blocks[idx].start);
      const previousBlockDate = this.roundDate(this.blocks[idx - 1].start);
      return currentBlockDate !== previousBlockDate;
    }
    return true;
  }

  blockIsActive(idx: number): boolean {
    if (idx === this.activeBlockIdx()) {
      return true;
    }
    return false;
  }

  private roundDate(value: Date): string {
    return value.toISOString().split("T")[0];
  }

  setActive(idx: number) {
    if (idx >= 0 && idx <= this.blocks.length) {
      this.activeBlockIdx.set(idx);
    }
  }

  activatePreviousBlock(): boolean {
    if (this.activeBlockIdx() > 0) {
      this.activeBlockIdx.update((current) => current - 1);
      return true;
    }
    return false;
  }

  activateNextBlock(): boolean {
    if (this.activeBlockIdx() < this.blocks.length - 1) {
      this.activeBlockIdx.update((current) => current + 1);
      return true;
    }
    return false;
  }

  private addNewBlock() {
    this.blockService.add$.next({
      id: 0,
      text: "",
      project: undefined,
      projectName: undefined,
      start: new Date(),
      end: undefined,
      duration: 0,
      tags: [],
    });
    this.setActive(0);
  }

  private deleteActiveBlock() {
    this.blockService.remove$.next({ id: this.activeBlock.id });
  }

  private endActiveBlock() {
    let activeBlock = this.activeBlock;
    activeBlock.end = new Date();
    this.blockService.edit$.next(activeBlock);
  }

  private addNewEntry() {
    this.entryService.add$.next({
      id: 0,
      parent: this.activeBlock.id,
      nesting: 0,
      text: "",
      showTodo: false,
      isDone: false,
    });
  }

  private activatePreviousEntry() {
    if (this.activeEntryIdx() > 0) {
      this.activeEntryIdx.update((current) => current - 1);
    } else {
      if (this.activatePreviousBlock()) {
        this.activeEntryIdx.set(this.getLastEntryIdxOfBlock());
      }
    }
  }

  private activateNextEntry() {
    const amountOfEntriesForBlock = this.entries.get(
      this.activeBlock.id,
    )?.length;
    if (
      amountOfEntriesForBlock &&
      this.activeEntryIdx() < amountOfEntriesForBlock - 1
    ) {
      this.activeEntryIdx.update((current) => current + 1);
    } else {
      if (this.activateNextBlock()) {
        this.activeEntryIdx.set(0);
      }
    }
  }

  private getLastEntryIdxOfBlock(): number {
    const entriesOfPreviousBlock = this.entries.get(this.activeBlock.id);
    if (entriesOfPreviousBlock) {
      return entriesOfPreviousBlock.length - 1;
    }
    return 0;
  }

  findEntriesForBlock(block: Block) {
    return this.entryService.entries().get(block.id);
  }
}
