import { Component } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { octFilter } from "@ng-icons/octicons";

@Component({
  standalone: true,
  selector: "app-filter",
  imports: [NgIcon],
  template: `
    <div class="custom-filters">
      filters:
      <ul class="filter-options">
        <li class="active-filter">Personal</li>
        <li>Work</li>
        <li>Not Done</li>
        <li>+</li>
      </ul>
    </div>
    <button class="icon">
      <ng-icon name="octFilter" />
    </button>
  `,
  styles: `
    :host {
      display: flex;
      gap: 1rem;
      align-items: center;
      color: var(--secondary-text);
    }

    .custom-filters {
      display: none;
      align-items: center;
    }

    .filter-options {
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
      }

      .active-filter {
        background-color: var(--active-color);
        color: var(--active-text);
      }
    }

    .icon {
      /*display: none;*/
      margin: 0.5rem;
      background-color: var(--lighter-black);
      color: var(--secondary-text);
      padding: 0.4rem 0.6rem;
      border: none;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .icon:hover {
      color: var(--text-color);
    }

    @media (min-width: 52rem) {
      .custom-filters {
        display: flex;
      }
    }
  `,
  viewProviders: [provideIcons({ octFilter })],
})
export class FilterComponent {}
