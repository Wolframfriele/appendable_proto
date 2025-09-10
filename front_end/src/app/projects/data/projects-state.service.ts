import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ProjectsStateService {
  activeProjectIdx = signal(0);
  constructor() {}
}
