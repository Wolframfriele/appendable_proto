import { Component, inject, signal } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from "@angular/router";
import { KeyboardService } from "../data/keyboard.service";
import { Command, CommandService } from "../data/command.service";
import { HeaderComponent } from "../ui/header/header.component";
import { FuzzySearchFieldComponent } from "../ui/fuzzy-search-field/fuzzy-search-field.component";
import { StatusBarComponent } from "../../outliner/ui/status-bar/status-bar.component";

@Component({
  standalone: true,
  selector: "app-page-layout",
  imports: [
    RouterOutlet,
    HeaderComponent,
    FuzzySearchFieldComponent,
    StatusBarComponent,
  ],
  template: `
    @if (!hideHeader()) {
      <app-header />
    }

    @if (isCommandModeActive) {
      <app-fuzzy-search-field
        [searchableOptions]="commandService.possibleCommands"
        [setFocus]="isCommandModeActive"
        placeholder="enter commands"
        [switchToInputMode]="false"
        (selected)="executeCommand($event)"
      />
    }

    @if (fullWidthLayout()) {
      <router-outlet></router-outlet>
    } @else {
      <div class="wrapper">
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </div>
    }

    @if (!hideFooter()) {
      <app-status-bar />
    }
  `,
  styles: `
    app-fuzzy-search-field {
      position: fixed;
      top: 40%;
      left: 50%;
      transform: translate(-50%, 0);
      --search-box-width: 30rem;
    }

    .wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    @media (min-width: 52rem) {
      .content {
        width: 50rem;
      }
    }
  `,
})
export class PageLayoutComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private keyboardService = inject(KeyboardService);
  commandService = inject(CommandService);

  hideHeader = signal(false);
  hideFooter = signal(false);
  fullWidthLayout = signal(false);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideHeader.set(
          this.activatedRoute.firstChild?.snapshot.data["hideHeader"] == true,
        );
        this.hideFooter.set(
          this.activatedRoute.firstChild?.snapshot.data["hideFooter"] == true,
        );
        this.fullWidthLayout.set(
          this.activatedRoute.firstChild?.snapshot.data["fullWidthLayout"] ==
            true,
        );
      }
    });
  }

  get isCommandModeActive() {
    return this.keyboardService.isCommandMode();
  }

  executeCommand(commandValue: string) {
    this.commandService.execute(Command.SWITCH_TO_NORMAL_MODE);
    this.commandService.executeFromValue(commandValue);
  }
}
