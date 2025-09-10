import { Component, input } from "@angular/core";
import { Project } from "../../model/project.model";
import { CheckboxComponent } from "../../outliner/ui/checkbox/checkbox.component";

@Component({
  standalone: true,
  selector: "app-project",
  imports: [CheckboxComponent],
  template: `
    <li>
      {{ project().name }}
      <span class="archived">archived:</span>
      <app-checkbox [checked]="project().archived" />
    </li>
  `,
  styles: `
    li {
      background: var(--background-deep);
      border-left: 5px solid var(--background-deep);
      border-radius: 5px;
      padding: 0.5rem;
      width: 50rem;
    }

    .archived {
      color: var(--secondary-text);
    }
  `,
})
export class ProjectComponent {
  project = input.required<Project>();
}
