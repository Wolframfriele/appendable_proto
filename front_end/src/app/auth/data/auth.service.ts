import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, merge, EMPTY, Subject, of, timer } from "rxjs";
import {
  catchError,
  filter,
  map,
  shareReplay,
  skip,
  startWith,
  switchMap,
  take,
  tap,
} from "rxjs/operators";
import {
  AuthResponse,
  AuthResponseJson,
  toOptionalAuthResponse,
} from "../../auth/data/auth-response.model";
import {
  AuthPayload,
  mapToAuthPayloadJson,
} from "../../auth/data/auth-payload.model";
import { Command, CommandService } from "../../shared/data/command.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  redirectUrl: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);
  private commandService = inject(CommandService);

  readonly session = signal<AuthResponse | null>(null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly error = signal<string | null>(null);

  private checkSession$ = new Subject<void>();
  private login$ = new Subject<AuthPayload>();
  private logout$ = new Subject<void>();
  private sessionEnded$ = new Subject<void>();

  private session$: Observable<AuthResponse | null> = merge(
    this.checkSession$.pipe(
      startWith(undefined),
      switchMap(() =>
        this.http
          .get<AuthResponseJson>("/api/session")
          .pipe(catchError(() => of(null))),
      ),
      map(toOptionalAuthResponse),
    ),
    this.login$.pipe(
      switchMap((authPayload) =>
        this.http
          .post<AuthResponseJson>(
            "/api/login",
            mapToAuthPayloadJson(authPayload),
          )
          .pipe(
            catchError((err) => {
              this.error.set(err.error.error);
              return of(null);
            }),
          ),
      ),
      map(toOptionalAuthResponse),
    ),
    merge(
      this.logout$,
      this.commandService.executeCommand$.pipe(
        filter((c) => c === Command.LOGOUT),
        map(() => null),
      ),
    ).pipe(
      switchMap(() =>
        this.http
          .get<AuthResponseJson>("/api/logout")
          // return EMPTY to not update the current session, since the logout did not succeed
          // this also avoids the redirects
          .pipe(catchError(() => EMPTY)),
      ),
      map(() => null),
    ),
    this.sessionEnded$.pipe(map(() => null)),
  ).pipe(
    tap((auth) => {
      if (auth) {
        // emit sessionEnded on ended when expires date reached
        timer(auth.expires).subscribe(() => this.sessionEnded$.next());
        this.commandService.executeCommand$.next(Command.SWITCH_TO_NORMAL_MODE);
        if (this.redirectUrl) {
          this.router.navigateByUrl(this.redirectUrl);
        } else {
          this.router.navigateByUrl("/");
        }
        this.error.set(null);
      } else {
        this.commandService.executeCommand$.next(
          Command.SWITCH_TO_DEFAULT_MODE,
        );
        this.router.navigateByUrl("/login");
      }
      return auth;
    }),
    shareReplay(1),
  );

  constructor() {
    this.session$.subscribe(this.session.set);
  }

  login(username: string, password: string) {
    this.login$.next({ clientId: username, clientSecret: password });
    // why does this method seem to return two events? Or where is the second log coming from?
    return this.session$.pipe(skip(1), take(1));
  }

  logout() {
    this.logout$.next();
    return this.session$.pipe(skip(1), take(1));
  }
}
