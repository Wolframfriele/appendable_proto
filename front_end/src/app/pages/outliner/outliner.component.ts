import { Component } from '@angular/core';
import { ViewComponent } from '../../components/view/view.component';

@Component({
  selector: 'app-outliner',
  imports: [ViewComponent],
  templateUrl: './outliner.component.html',
  styleUrl: './outliner.component.scss'
})
export class OutlinerComponent {
  dates = ['Friday 14 Februari', 'Saturday 15 Februari'];
}
