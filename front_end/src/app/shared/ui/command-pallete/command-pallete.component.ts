import { Component, inject } from "@angular/core";
import { ControlMode, KeyboardService } from "../../data/keyboard.service";
import { FuzzySearchFieldComponent } from "../fuzzy-search-field/fuzzy-search-field.component";
import { Command, CommandService } from "../../data/command.service";

@Component({
  standalone: true,
  selector: "app-command-pallete",
  imports: [FuzzySearchFieldComponent],
  template: `
    @if (isCommandModeActive) {
      <div class="command-pallete-container">
        <app-fuzzy-search-field
          [searchableOptions]="commandService.possibleCommands"
          [setFocus]="isCommandModeActive"
          placeholder="enter commands"
          (selected)="executeCommand($event)"
        />
      </div>
    }
  `,
  styles: `
    .command-pallete-container {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, 0);
      width: 30rem;
    }
  `,
})
export class CommandPalleteComponent {
  keyboardService = inject(KeyboardService);
  commandService = inject(CommandService);

  get isCommandModeActive() {
    return (
      this.keyboardService.activeControlMode() === ControlMode.COMMAND_MODE
    );
  }

  executeCommand(commandValue: string) {
    this.commandService.executeCommand$.next(Command.SWITCH_TO_NORMAL_MODE);
    this.commandService.executeCommandFromValue(commandValue);
  }
}
