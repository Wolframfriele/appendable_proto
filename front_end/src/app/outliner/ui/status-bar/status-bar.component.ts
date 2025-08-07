import { Component } from "@angular/core";
import { ControlModeComponent } from "./control-mode/control-mode.component";

@Component({
  standalone: true,
  selector: "app-status-bar",
  imports: [ControlModeComponent],
  template: `
    <div class="status-bar-container">
      <app-control-mode />
    </div>
  `,
  styles: `
    .status-bar-container {
      justify-content: start;
      position: fixed;
      bottom: 0;
    }

    .filter {
      margin: 0.3rem 0.3rem;
    }
  `,
})
export class StatusBarComponent {}
