import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { Command, CommandService } from "../../shared/data/command.service";

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
      console.log("Login");
      console.log(password);
      if (password === "welkom") {
        console.log("approved");
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
  }
}
