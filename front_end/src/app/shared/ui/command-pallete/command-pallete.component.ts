import { Component, inject } from "@angular/core";
import { ControlMode, KeyboardService } from "../../data/keyboard.service";

@Component({
  standalone: true,
  selector: "app-command-pallete",
  imports: [],
  template: `
    @if (isCommandModeActive) {
      <div class="command-pallete-container">
        <input
          id="command-input"
          type="text"
          placeholder="enter commands"
          autofocus
        />
      </div>
    }
  `,
  styles: `
    .command-pallete-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    #command-input {
      width: 25rem;
      height: 2rem;
    }
  `,
})
export class CommandPalleteComponent {
  keyboardService = inject(KeyboardService);

  get isCommandModeActive() {
    return (
      this.keyboardService.activeControlMode() === ControlMode.COMMAND_MODE
    );
  }
}
