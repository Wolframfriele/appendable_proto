import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OutlinerComponent } from './pages/outliner/outliner.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, OutlinerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'track_proto_1';
}
