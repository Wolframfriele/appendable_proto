import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Color, ColorJson, mapToColors } from "../../model/color.model";
import { catchError, EMPTY, map } from "rxjs";

// This service breaks the pattern, since it is a fetch once and then forget about it
// In the future it will be possible to change the colors in the palatte, but that is
// pretty low prio
@Injectable({
  providedIn: "root",
})
export class ColorService {
  http = inject(HttpClient);

  private colors = signal(new Map<number, string>());
  readonly noColor = "var(--title-color)";
  readonly error = signal<string | null>(null);

  private colors$ = this.http.get<ColorJson[]>(`/api/colors`).pipe(
    catchError((err) => this.handleError(err)),
    map((response) => mapToColors(response)),
    map((colors) => this.convertToColorMap(colors)),
  );

  constructor() {
    this.colors$.subscribe((response) => this.colors.set(response));
  }

  get defaultColor() {
    return 1;
  }

  private handleError(err: any) {
    this.error.set(err);
    return EMPTY;
  }

  private convertToColorMap(colors: Color[]): Map<number, string> {
    const result = new Map<number, string>();
    colors.forEach((color) => result.set(color.id, color.hexValue));
    return result;
  }

  public getColorCode(reference: number | undefined): string {
    if (!reference) {
      return this.noColor;
    }
    const foundColor = this.colors().get(reference);
    if (!foundColor) {
      // maybe return the default color when that mechanism exists?
      return this.noColor;
    }
    return "#" + foundColor;
  }
}
