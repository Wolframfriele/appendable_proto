import { Component, inject } from "@angular/core";
import { KeyboardService } from "../../../../shared/data/keyboard.service";

@Component({
  selector: "app-control-mode",
  standalone: true,
  imports: [],
  template: `
    <span class="control-mode">
      <strong>{{ keyboardService.activeControlMode() }}</strong>
    </span>
  `,
  styles: `
    .control-mode {
      margin: 0.5rem;
    }
  `,
})
export class ControlModeComponent {
  keyboardService = inject(KeyboardService);
}
