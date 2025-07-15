import { Component, inject } from '@angular/core';
import { DateRangeService } from './data/date-range.service';
import { EntryService } from './data/entry.service';
import { ViewComponent } from './ui/view/view.component';
import { HeaderComponent } from '../shared/ui/header/header.component';

@Component({
  selector: 'app-outliner',
  standalone: true,
  imports: [HeaderComponent, ViewComponent],
  template: `
    <app-header></app-header>

    <div class="view-container">
      @for (day of getDays ; track $index) {
        <app-view [dateString]="day" [viewEntries]="getEntries(day)"></app-view>
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

  public getEntries(day: string) {
    if (this.entryService.entries().has(day)) {
      return this.entryService.entries().get(day)!;
    }
    return [];
  }
}
