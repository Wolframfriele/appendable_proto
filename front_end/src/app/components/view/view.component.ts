import { Component, inject, input, OnInit, signal } from '@angular/core';
import { OutlinerEntryComponent } from '../outliner-entry/outliner-entry.component';
import { EntryService } from '../../services/entry.service';
import { EntryModel } from '../../../model/entry.model';
import { catchError } from 'rxjs';
import { DisplayDatePipe } from '../../../model/pipes/display-date.pipe';

@Component({
  selector: 'app-view',
  imports: [OutlinerEntryComponent, DisplayDatePipe],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent implements OnInit {
  date = input.required<Date>();
  entryService = inject(EntryService);
  viewEntries = signal<EntryModel[]>([]);
  emptyEntry: EntryModel = {
    id: 0,
    parent: undefined,
    path: '/',
    nesting: 0,
    startTimestamp: new Date(),
    endTimestamp: undefined,
    text: '              ',
    showTodo: false,
    isDone: false,
    estimatedDuration: 0,
    tags: []
  };

  ngOnInit(): void {
    this.entryService.getEntries(this.date())
      .pipe(
        catchError((err) => {
          console.log(err);
          throw err;
        })
      ).subscribe((entries) => {
        this.viewEntries.set(entries);
      })
  }
}
