import { Component, inject } from "@angular/core";
import { DateRangeService } from "./data/date-range.service";
import { HeaderComponent } from "../shared/ui/header/header.component";
import { DisplayDatePipe } from "../pipes/display-date.pipe";
import { StatusBarComponent } from "./ui/status-bar/status-bar.component";
import { BlockService } from "./data/block.service";
import { OutlinerBlockComponent } from "./ui/outliner-block/outliner-block.component";
import { ControlMode, KeyboardService } from "../shared/data/keyboard.service";
import { Command, CommandService } from "../shared/data/command.service";
import { FuzzySearchFieldComponent } from "../shared/ui/fuzzy-search-field/fuzzy-search-field.component";

@Component({
  selector: "app-outliner",
  standalone: true,
  imports: [
    HeaderComponent,
    StatusBarComponent,
    OutlinerBlockComponent,
    DisplayDatePipe,
    FuzzySearchFieldComponent,
  ],
  template: `
    <app-header />

    @if (isCommandModeActive) {
      <app-fuzzy-search-field
        [searchableOptions]="commandService.possibleCommands"
        [setFocus]="isCommandModeActive"
        placeholder="enter commands"
        [switchToInputMode]="false"
        (selected)="executeCommand($event)"
      />
    }

    <div class="blocks-container">
      @for (block of getBlocks; track idx; let idx = $index) {
        @if (isPreviousBlockDifferentDate(idx)) {
          <h1>{{ block.start | displayDate }}</h1>
        }

        <app-outliner-block [block]="block" [active]="isActive(idx)" />
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
    </div>

    <app-status-bar />
  `,
  styles: `
    .blocks-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    app-fuzzy-search-field {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, 0);
      --search-box-width: 30rem;
    }
  `,
})
export default class OutlinerComponent {
  dateRangeService = inject(DateRangeService);
  blockService = inject(BlockService);
  keyboardService = inject(KeyboardService);
  commandService = inject(CommandService);

  get getBlocks() {
    return this.blockService.blocks();
  }

  isPreviousBlockDifferentDate(idx: number) {
    if (idx > 0) {
      const currentBlockDate = this.roundDate(this.getBlocks[idx].start);
      const previousBlockDate = this.roundDate(this.getBlocks[idx - 1].start);
      return currentBlockDate !== previousBlockDate;
    }
    return true;
  }

  isActive(idx: number): boolean {
    if (idx === this.blockService.activeIdx()) {
      return true;
    }
    return false;
  }

  private roundDate(value: Date): string {
    return value.toISOString().split("T")[0];
  }

  get isCommandModeActive() {
    return (
      this.keyboardService.activeControlMode() === ControlMode.COMMAND_MODE
    );
  }

  executeCommand(commandValue: string) {
    this.commandService.executeCommand$.next(Command.SWITCH_TO_NORMAL_MODE);
    this.commandService.executeCommandFromValue(commandValue);
  }
}
