import { Component, inject, input, OnInit, signal } from '@angular/core';
import { OutlinerEntryComponent } from '../outliner-entry/outliner-entry.component';
import { EntryService } from '../../services/entry.service';
import { EntryModel } from '../../../model/entry.model';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-view',
  imports: [OutlinerEntryComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent implements OnInit {
  title = input.required<string | Date>();
  entryService = inject(EntryService);
  viewEntries = signal<EntryModel[]>([]);

  ngOnInit(): void {
    this.entryService.getEntries()
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
