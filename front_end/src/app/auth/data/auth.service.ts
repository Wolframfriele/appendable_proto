import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { Command, CommandService } from "../../shared/data/command.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

interface AuthState {
  isAuthenticated: boolean;
  error: string | null;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  router = inject(Router);
  commandService = inject(CommandService);

  state = signal<AuthState>({
    isAuthenticated: false,
    error: null,
  });

  isAuthenticated = computed(() => this.state().isAuthenticated);
  error = computed(() => this.state().error);

  login$ = new Subject<string>();

  constructor() {
    this.login$.subscribe((password) => {
      if (password === "test") {
        this.state.set({
          isAuthenticated: true,
          error: null,
        });
        this.commandService.executeCommand$.next(Command.SWITCH_TO_NORMAL_MODE);
        this.router.navigateByUrl("/");
      } else {
        this.state.set({
          isAuthenticated: false,
          error: "Incorrect password",
        });
      }
    });

    this.commandService.executeCommand$
      .pipe(takeUntilDestroyed())
      .subscribe((command) => {
        switch (command) {
          case Command.LOGOUT:
            return this.logout();
        }
      });
  }

  logout() {
    this.state.set({
      isAuthenticated: false,
      error: null,
    });
    this.router.navigateByUrl("/login");
  }
}
