import { Component } from "@angular/core";

@Component({
  standalone: true,
  selector: "app-page-not-found",
  imports: [],
  template: `
    <h1>404</h1>
    <p>The requested page does not exists</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `,
})
export class PageNotFoundComponent {}
