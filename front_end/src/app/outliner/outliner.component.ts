import { Component, inject, signal } from "@angular/core";
import { DateRangeService } from "./data/date-range.service";
import { DisplayDatePipe } from "../pipes/display-date.pipe";
import { BlockService } from "./data/block.service";
import { OutlinerBlockComponent } from "./ui/outliner-block/outliner-block.component";
import { Command, CommandService } from "../shared/data/command.service";
import { Block } from "../model/block.model";
import { EntryService } from "./data/entry.service";
import { OutlinerStateService } from "./data/outliner-state.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Entry } from "../model/entry.model";

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
        [blockIdx]="idx"
        [entriesForBlock]="findEntriesForBlock(block)"
        [active]="blockIsActive(idx)"
        [activeEntry]="state.activeEntryIdx()"
      />
    }

    @if (!blockService.loaded()) {
      <div>loading</div>
    }
    @if (blockService.error()) {
      <p>Problem loading entries</p>
    }
    @if (!dateRangeService.error()) {
      <button (click)="dateRangeService.expand$.next(undefined)">
        Load more entries
      </button>
    }
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
  state = inject(OutlinerStateService);

  constructor() {
    this.commandService.executeCommand$
      .pipe(takeUntilDestroyed())
      .subscribe((command) => {
        switch (command) {
          case Command.ADD_NEW:
            return this.addNewBlock();
          case Command.DELETE_SELECTED_BLOCK:
            return this.deleteActiveBlock();
          case Command.END_SELECTED_BLOCK:
            return this.endActiveBlock();
          case Command.ADD_NEW_ENTRY:
            return this.addNewEntry();
          case Command.DELETE_ELEMENT:
            return this.deleteActiveEntry();
          case Command.MOVE_TO_PREVIOUS_ELEMENT:
            return this.activatePreviousEntry();
          case Command.MOVE_TO_NEXT_ELEMENT:
            return this.activateNextEntry();
          case Command.MOVE_TO_PREVIOUS_CONTAINER:
            this.activatePreviousBlock();
            return this.state.activeEntryIdx.set(0);
          case Command.MOVE_TO_NEXT_CONTAINER:
            this.activateNextBlock();
            return this.state.activeEntryIdx.set(0);
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
    return this.blocks[this.state.activeBlockIdx()];
  }

  get activeEntry(): Entry | undefined {
    const entriesForActiveBlock = this.entries.get(this.activeBlock.id);
    if (entriesForActiveBlock) {
      return entriesForActiveBlock[this.state.activeEntryIdx()];
    }
    return undefined;
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
    if (idx === this.state.activeBlockIdx()) {
      return true;
    }
    return false;
  }

  private roundDate(value: Date): string {
    return value.toISOString().split("T")[0];
  }

  setActiveBlock(idx: number) {
    if (idx >= 0 && idx <= this.blocks.length) {
      this.state.activeBlockIdx.set(idx);
    }
  }

  activatePreviousBlock(): boolean {
    if (this.state.activeBlockIdx() > 0) {
      this.state.activeBlockIdx.update((current) => current - 1);
      return true;
    }
    return false;
  }

  activateNextBlock(): boolean {
    if (this.state.activeBlockIdx() < this.blocks.length - 1) {
      this.state.activeBlockIdx.update((current) => current + 1);
      return true;
    } else {
      this.dateRangeService.expand$.next(undefined);
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
    this.setActiveBlock(0);
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
    this.entryService
      .awaitAdd({
        id: 0,
        parent: this.activeBlock.id,
        nesting: 0,
        text: "",
        showTodo: false,
        isDone: false,
      })
      .subscribe(() => {
        const entriesInBlock = this.entries.get(this.activeBlock.id);
        if (entriesInBlock && entriesInBlock.length > 0) {
          this.state.activeEntryIdx.set(entriesInBlock.length - 1);
        }
        this.commandService.executeCommand$.next(Command.SWITCH_TO_INSERT_MODE);
      });
  }

  private deleteActiveEntry() {
    const activeEntry = this.activeEntry;
    const entriesInBlock = this.entries.get(this.activeBlock.id);
    let activeEntryIsLastInBlock = false;
    if (
      entriesInBlock &&
      this.state.activeEntryIdx() === entriesInBlock.length - 1
    ) {
      activeEntryIsLastInBlock = true;
    }
    if (activeEntry) {
      this.entryService.remove$.next({ id: activeEntry.id });
      if (activeEntryIsLastInBlock) {
        this.state.activeEntryIdx.update((current) => current - 1);
      }
    }
  }

  private activatePreviousEntry() {
    if (this.state.activeEntryIdx() > 0) {
      this.state.activeEntryIdx.update((current) => current - 1);
    } else {
      if (this.activatePreviousBlock()) {
        this.state.activeEntryIdx.set(this.getLastEntryIdxOfBlock());
      }
    }
  }

  private activateNextEntry() {
    const amountOfEntriesForBlock = this.entries.get(
      this.activeBlock.id,
    )?.length;
    if (
      amountOfEntriesForBlock &&
      this.state.activeEntryIdx() < amountOfEntriesForBlock - 1
    ) {
      this.state.activeEntryIdx.update((current) => current + 1);
    } else {
      if (this.activateNextBlock()) {
        this.state.activeEntryIdx.set(0);
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
