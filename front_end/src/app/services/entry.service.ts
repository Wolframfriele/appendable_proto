import { inject, Injectable } from "@angular/core";
import { EntryModel } from "../../model/entry.model";
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { mapToEntries } from "../../model/entry.mapper";
import { EntryJson } from "../../model/entry.interface";

@Injectable({
  providedIn: "root",
})
export class EntryService {
  http = inject(HttpClient);

  getEntries(): Observable<EntryModel[]> {
    return this.http.get<EntryJson[]>(`/api/entries?date=2025-03-11`).pipe(
      map((json: EntryJson[]) => mapToEntries(json))
    );
  }
}
