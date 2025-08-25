import { Component } from "@angular/core";
import { PageLayoutComponent } from "./shared/page-layout/page-layout.component";

@Component({
  standalone: true,
  selector: "app-root",
  imports: [PageLayoutComponent],
  template: ` <app-page-layout /> `,
  styles: [],
})
export class AppComponent {
  title = "track_proto_1";
}
