import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
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
    <app-header />

    @if (isCommandModeActive) {
      <app-fuzzy-search-field
        [searchableOptions]="commandService.possibleCommands"
        [setFocus]="isCommandModeActive"
        placeholder="enter commands"
        [switchToInputMode]="false"
        (selected)="executeCommand($event)"
      />
    }

    <router-outlet></router-outlet>

    <app-status-bar />
  `,
  styles: `
    app-fuzzy-search-field {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, 0);
      --search-box-width: 30rem;
    }
  `,
})
export class PageLayoutComponent {
  keyboardService = inject(KeyboardService);
  commandService = inject(CommandService);

  get isCommandModeActive() {
    return this.keyboardService.isCommandMode();
  }

  executeCommand(commandValue: string) {
    this.commandService.executeCommand$.next(Command.SWITCH_TO_NORMAL_MODE);
    this.commandService.executeCommandFromValue(commandValue);
  }
}
