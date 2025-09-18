import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Command, CommandService } from "../../data/command.service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { octThreeBars } from "@ng-icons/octicons";

@Component({
  standalone: true,
  selector: "app-navigation",
  imports: [RouterLink, RouterLinkActive, NgIcon],
  template: `
    <button class="icon" (click)="onMenuClicked()">
      <ng-icon name="octThreeBars" />
    </button>
    <div class="menu" [class.show]="menuOpen()">
      <div class="links-container">
        <a
          class="link"
          routerLink="/"
          routerLinkActive="active-link"
          [class.displayed]="menuOpen()"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="onLinkClicked()"
        >
          Journal
        </a>
        <a
          class="link"
          routerLink="/projects"
          routerLinkActive="active-link"
          [class.displayed]="menuOpen()"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="onLinkClicked()"
        >
          Projects
        </a>
      </div>
    </div>
  `,
  styles: `
    .menu {
      display: inline;
    }

    .links-container {
      display: flex;
      align-items: center;
    }

    .link {
      background-color: var(--lighter-black);
      color: var(--secondary-text);
      padding: 0.4rem 0.6rem;
      border-radius: 5px;
      font-size: 0.9rem;
      text-decoration: none;
      margin: 0.5rem;
    }

    .link:hover,
    .icon:hover {
      color: var(--hover-text);
      cursor: pointer;
    }

    .active-link {
      background-color: var(--active-color);
      color: var(--active-text);
    }

    .icon {
      display: none;
      margin: 0.5rem;
      background-color: var(--lighter-black);
      color: var(--secondary-text);
      padding: 0.4rem 0.6rem;
      border: none;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    @media (max-width: 27rem) {
      .icon {
        display: inline;
      }

      .links-container {
        flex-direction: column;
        align-items: start;
        gap: 0.5rem;
      }

      .link {
        margin: 0;
      }

      .menu {
        display: none;
        position: absolute;
        top: 3rem;
        left: 0.5rem;
      }

      .show {
        display: inline-block;
      }
    }
  `,
  viewProviders: [provideIcons({ octThreeBars })],
})
export class NavigationComponent {
  commandService = inject(CommandService);
  router = inject(Router);
  menuOpen = signal(false);

  constructor() {
    this.commandService.executeCommand$.subscribe((command) => {
      switch (command) {
        case Command.GO_TO_JOURNAL:
          this.router.navigate(["/"]);
          break;
        case Command.GO_TO_PROJECTS:
          this.router.navigate(["/projects"]);
          break;
      }
    });
  }

  onMenuClicked() {
    this.menuOpen.update((state) => !state);
  }

  onLinkClicked() {
    this.menuOpen.set(false);
  }
}
