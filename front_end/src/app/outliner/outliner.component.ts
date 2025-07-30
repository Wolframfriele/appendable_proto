import { Component, inject } from '@angular/core';
import { DateRangeService } from './data/date-range.service';
import { EntryService } from './data/entry.service';
import { ViewComponent } from './ui/view/view.component';
import { HeaderComponent } from '../shared/ui/header/header.component';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import { StatusBarComponent } from './ui/status-bar/status-bar.component';
import { CommandPalleteComponent } from "../shared/ui/command-pallete/command-pallete.component";

@Component({
  selector: 'app-outliner',
  standalone: true,
  imports: [HeaderComponent, ViewComponent, StatusBarComponent, DisplayDatePipe, CommandPalleteComponent],
  template: `
    <app-header />

    <app-command-pallete />

    <div class="view-container">
      @for (day of getDays ; track $index) {
        <app-view [titel]="convertToDate(day) | displayDate" [viewEntries]="getEntries(day)"></app-view>
      }

      @if (!entryService.loaded()) {
        <div>loading</div>
      }
      @if (entryService.error()) {
        <p>Problem loading entries</p>
      }
      <button
        (click)="dateRangeService.expand$.next(undefined)">
          Load more entries
      </button>
    </div>

    <app-status-bar />
  `,
  styles: `
    .view-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
`
})
export default class OutlinerComponent {
  dateRangeService = inject(DateRangeService);
  entryService = inject(EntryService);

  get getDays() {
    return Array.from(this.entryService.entries().keys()).reverse();
  }

  getEntries(day: string) {
    if (this.entryService.entries().has(day)) {
      return this.entryService.entries().get(day)!;
    }
    return [];
  }

  convertToDate(dateStr: string): Date {
    return new Date(dateStr);
  }
}
