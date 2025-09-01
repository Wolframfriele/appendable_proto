import { inject, Injectable, signal } from "@angular/core";
import { AuthService } from "../../auth/data/auth.service";
import { HttpClient } from "@angular/common/http";
import { catchError, EMPTY } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProtectedService {
  http = inject(HttpClient);
  authService = inject(AuthService);

  protectedResponse = signal("");
  error = signal("");

  constructor() {
    this.http
      .get<string>(`/api/protected`)
      .pipe(catchError((err) => this.handleError(err)))
      .subscribe((response) => this.protectedResponse.set(response));
  }

  private handleError(err: any) {
    this.error.set(err);
    return EMPTY;
  }
}
