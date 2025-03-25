import { Component } from '@angular/core';
import { FilterComponent } from '../filter/filter.component';

@Component({
  selector: 'app-header',
  imports: [FilterComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
