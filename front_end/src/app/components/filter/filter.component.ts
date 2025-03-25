import { Component } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { octFilter } from "@ng-icons/octicons";

@Component({
  selector: "app-filter",
  imports: [NgIcon],
  templateUrl: "./filter.component.html",
  styleUrl: "./filter.component.scss",
  viewProviders: [provideIcons({ octFilter })],
})
export class FilterComponent {}
