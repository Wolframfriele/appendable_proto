import { Component, computed, input } from '@angular/core';
import { OutlinerEntryComponent } from '../outliner-entry/outliner-entry.component';
import { DisplayDatePipe } from '../../../pipes/display-date.pipe';
import { DisplayDurationPipe } from '../../../pipes/display-duration.pipe';
import { Entry } from '../../../model/entry.model';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [OutlinerEntryComponent, DisplayDatePipe, DisplayDurationPipe],
  template: `
    <div class="view">
      <div class="group-titel">
        <h1 class="titel">{{ date() | displayDate }}</h1>

        <span class="total-duration">{{ sumDuration() | displayDuration }}</span>
      </div>
      <ul>
        @for (entry of viewEntries(); track $index; let idx = $index) {
            <app-outliner-entry [entry]="entry" [hasChildren]="hasChildren(idx)"/>
        }
        @if (viewEntries().length === 0) {
            <app-outliner-entry [entry]="emptyEntry" [hasChildren]="false" />
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

  dateString = input.required<string>();
  viewEntries = input.required<Entry[]>();
  date = computed(() => new Date(this.dateString()));

  emptyEntry: Entry = {
    id: 0,
    parent: undefined,
    path: '/',
    nesting: 0,
    startTimestamp: new Date(),
    endTimestamp: undefined,
    text: '',
    showTodo: false,
    isDone: false,
    estimatedDuration: 0,
    tags: []
  };

  hasChildren(idx: number): boolean {
    let nextIdx = idx + 1;
    if (nextIdx >= this.viewEntries().length) {
      return false;
    }

    return this.viewEntries()[nextIdx].nesting > this.viewEntries()[idx].nesting;
  }

  sumDuration() {
    if (this.viewEntries().length > 0) {
      return Math.floor(this.viewEntries().map(entry => {
        if (entry.endTimestamp) {
          return entry.endTimestamp.getTime() - entry.startTimestamp.getTime();
        } else {
          return 0;
        }
      }).reduce((sum, p) => sum + p) / 1000000);
    }
    return 0;
  }
}
