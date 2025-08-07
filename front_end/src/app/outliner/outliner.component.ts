import { Component, inject } from "@angular/core";
import { DateRangeService } from "./data/date-range.service";
import { EntryService } from "./data/entry.service";
import { ViewComponent } from "./ui/view/view.component";
import { HeaderComponent } from "../shared/ui/header/header.component";
import { DisplayDatePipe } from "../pipes/display-date.pipe";
import { StatusBarComponent } from "./ui/status-bar/status-bar.component";
import { CommandPalleteComponent } from "../shared/ui/command-pallete/command-pallete.component";
import { BlockService } from "./data/block.service";
import { OutlinerBlockComponent } from "./ui/outliner-block/outliner-block.component";
import { RoundDatePipe } from "../pipes/round-date.pipe";

@Component({
  selector: "app-outliner",
  standalone: true,
  imports: [
    HeaderComponent,
    StatusBarComponent,
    OutlinerBlockComponent,
    DisplayDatePipe,
    RoundDatePipe,
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

        <app-outliner-block [block]="block" />
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

  roundDate = new RoundDatePipe();

  get getBlocks() {
    return this.blockService.blocks();
  }

  isPreviousBlockDifferentDate(idx: number) {
    if (idx > 0) {
      const currentBlockDate = this.roundDate.transform(
        this.getBlocks[idx].start,
      );
      const previousBlockDate = this.roundDate.transform(
        this.getBlocks[idx - 1].start,
      );
      return currentBlockDate !== previousBlockDate;
    }
    return true;
  }

  convertToDate(dateStr: string): Date {
    return new Date(dateStr);
  }
}
