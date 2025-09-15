import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Command, CommandService } from "../../data/command.service";

@Component({
  standalone: true,
  selector: "app-navigation",
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="custom-filters">
      <ul class="pages">
        <li
          routerLink="/"
          routerLinkActive="active-link"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          Journal
        </li>
        <li
          routerLink="/projects"
          routerLinkActive="active-link"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          Projects
        </li>
      </ul>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      gap: 1rem;
      align-items: center;
      color: var(--secondary-text);
    }

    .custom-filters {
      display: flex;
      align-items: center;
    }
    .pages {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      list-style: none;
      margin: 0.2rem;
      padding-left: 0.2rem;

      li {
        background-color: var(--lighter-black);
        padding: 0 0.6rem;
        border-radius: 5px;
        font-size: 0.9rem;
        margin: 0;
      }
      li:hover {
        color: var(--hover-text);
        cursor: pointer;
      }

      .active-link {
        background-color: var(--active-color);
        color: var(--active-text);
      }
    }
  `,
})
export class NavigationComponent {
  commandService = inject(CommandService);
  router = inject(Router);

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
}
