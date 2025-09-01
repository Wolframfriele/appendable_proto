import { Component, effect, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../data/auth.service";
import { Command, CommandService } from "../../shared/data/command.service";
import { Router } from "@angular/router";

@Component({
  standalone: true,
  selector: "app-login",
  imports: [ReactiveFormsModule],
  template: `
    <div class="card">
      <form [formGroup]="form">
        <legend>Login</legend>
        <div class="form-field">
          <input
            name="username"
            formControlName="username"
            type="email"
            class="input-field"
            placeholder="email"
            autofocus
          />
        </div>
        <div class="form-field">
          <input
            #passwordField
            name="password"
            formControlName="password"
            type="password"
            class="input-field"
            placeholder="password"
          />
        </div>
        @if (this.authService.error()) {
          <div class="form-fiels">
            <p class="error">{{ this.authService.error() }}</p>
          </div>
        }
        <div class="form-buttons">
          <button class="button button-primary" (click)="login()">Login</button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, 0);
    }

    .card {
      width: 30rem;
      height: 15rem;
      background: var(--background-deep);
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    legend {
      margin: 2rem 0;
      font-size: 1.5rem;
    }

    button {
      width: 100%;
      margin: 1rem 0 4rem 0;
      height: 2rem;
    }

    .input-field {
      width: var(--search-box-width, 20rem);
      height: 2rem;
      background: var(--background);
      color: var(--text-color);
      font-size: 1.25rem;
      border: solid 1px var(--secondary-text);
      border-radius: 5px;
      padding: 0.2rem;
      margin-top: 0.5rem;
    }

    .input-field::placeholder {
      color: var(--secondary-text);
    }

    .input-field:focus {
      outline: none;
    }

    .error {
      color: var(--red);
      margin: 0;
    }
  `,
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  commandService = inject(CommandService);
  router = inject(Router);

  form = this.fb.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });

  login() {
    const val = this.form.value;
    if (val.password && val.username) {
      this.authService.login(val.username, val.password);
    }
  }
}
