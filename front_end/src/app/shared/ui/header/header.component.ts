import { Component } from '@angular/core';
import { FilterComponent } from '../filter/filter.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FilterComponent],
  template: `
    <div class="header">
      <app-filter class="filter" />
    </div>
  `,
  styles: `
    .header {
      display: flex;
      justify-content: end;
      position: sticky;
      top: 0;
    }

    .filter {
      margin: 0.3rem 0.3rem;
    }
  `
})
export class HeaderComponent {

}
