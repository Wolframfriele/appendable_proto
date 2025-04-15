import { Component } from '@angular/core';
import { ViewComponent } from '../../components/view/view.component';

@Component({
  selector: 'app-outliner',
  imports: [ViewComponent],
  templateUrl: './outliner.component.html',
  styleUrl: './outliner.component.scss'
})
export class OutlinerComponent {
  dates: Date[] = [new Date(), new Date("2025-03-11")];
}
