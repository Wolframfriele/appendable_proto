import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class OutlinerStateService {
  activeBlockIdx = signal(0);
  activeEntryIdx = signal(0);
}
