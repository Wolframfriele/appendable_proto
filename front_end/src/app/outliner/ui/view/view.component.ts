import { Component, input } from '@angular/core';
import { OutlinerEntryComponent } from '../outliner-entry/outliner-entry.component';
import { Entry } from '../../../model/entry.model';
import { DurationVsEstimateComponent } from '../../../shared/ui/duration-vs-estimate/duration-vs-estimate.component';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [OutlinerEntryComponent, DurationVsEstimateComponent],
  template: `
    <div class="view">
      <div class="group-titel">
        <h1 class="titel">{{ titel() }}</h1>

        <app-duration-vs-estimate
          [duration]="sumDuration()"
          [estimate]="0"
        ></app-duration-vs-estimate>
      </div>
      <ul>
        @for (entry of viewEntries(); track $index; let idx = $index) {
            <app-outliner-entry [entry]="entry" [idx]="idx" [hasChildren]="hasChildren(idx)"/>
        }
      </ul>
    </div>
  `,
  styles: `
    .group-titel {
      margin: 3rem 0 0rem 0;
      padding: 0;
    }

    .titel {
      display: inline-block;
      margin: 0 1rem 0 0;
      padding: 0;
      line-height: 4rem;
    }

    .total-duration {
      display: inline-block;
      color: var(--secondary-text);
      font-style: italic;
      font-size: 0.95rem;
    }

    ul {
      margin-top: 0;
      list-style: none;
      padding: 0;
    }

    .view {
      margin: 0.8rem;
    }

    @media only screen and (min-width: 1150px) {
      .view {
        width: 50rem;
      }
    }
  `
})
export class ViewComponent {

  titel = input.required<string>();
  viewEntries = input.required<Entry[]>();

  hasChildren(idx: number): boolean {
    let nextIdx = idx + 1;
    if (nextIdx >= this.viewEntries().length) {
      return false;
    }

    return this.viewEntries()[nextIdx].nesting > this.viewEntries()[idx].nesting;
  }

  sumDuration() {
    if (this.viewEntries().length > 0) {
      const summed = this.viewEntries().map(entry => {
        if (entry.nesting === 0 && entry.endTimestamp) {
          return entry.endTimestamp.getTime() - entry.startTimestamp.getTime();
        } else {
          return 0;
        }
      }).reduce((sum, p) => sum + p);
      return Math.floor(summed / 1000);
    }
    return 0;
  }
}
