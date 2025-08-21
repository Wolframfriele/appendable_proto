import { Component } from "@angular/core";
import { FilterComponent } from "../filter/filter.component";
import { NavigationComponent } from "../navigation/navigation.component";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [NavigationComponent, FilterComponent],
  template: `
    <app-navigation />
    <app-filter class="filter" />
  `,
  styles: `
    :host {
      display: flex;
      position: sticky;
      top: 0;
      justify-content: space-between;
    }

    .filter {
      margin: 0.3rem 0.3rem;
    }
  `,
})
export class HeaderComponent {}
