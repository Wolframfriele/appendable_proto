import { Component, inject } from "@angular/core";
import { DateRangeService } from "./data/date-range.service";
import { HeaderComponent } from "../shared/ui/header/header.component";
import { DisplayDatePipe } from "../pipes/display-date.pipe";
import { StatusBarComponent } from "./ui/status-bar/status-bar.component";
import { CommandPalleteComponent } from "../shared/ui/command-pallete/command-pallete.component";
import { BlockService } from "./data/block.service";
import { OutlinerBlockComponent } from "./ui/outliner-block/outliner-block.component";

@Component({
  selector: "app-outliner",
  standalone: true,
  imports: [
    HeaderComponent,
    StatusBarComponent,
    OutlinerBlockComponent,
    DisplayDatePipe,
    CommandPalleteComponent,
  ],
  template: `
    <app-header />

    <app-command-pallete />

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
  `,
})
export default class OutlinerComponent {
  dateRangeService = inject(DateRangeService);
  blockService = inject(BlockService);

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

  convertToDate(dateStr: string): Date {
    return new Date(dateStr);
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
}
