import {
  AfterViewInit,
  Component,
  computed,
  input,
  signal,
  Signal,
} from "@angular/core";
import { EntryModel } from "../../../model/entry.model";
import { DisplayTimePipe } from "../../pipes/display-time.pipe";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { NgStyle } from "@angular/common";
import { DurationEstimateComponent } from "../duration-estimate/duration-estimate.component";
import { DisplayTagsComponent } from "../display-tags/display-tags.component";

@Component({
  selector: "app-outliner-entry",
  imports: [
    CheckboxComponent,
    DurationEstimateComponent,
    DisplayTagsComponent,
    DisplayTimePipe,
    NgStyle,
  ],
  templateUrl: "./outliner-entry.component.html",
  styleUrl: "./outliner-entry.component.scss",
})
export class OutlinerEntryComponent implements AfterViewInit {
  entry = input.required<EntryModel>();
  hasChildren = input.required<boolean>();
  entryIsHovered = signal(false);
  isMultiLine = signal(false);

  displayLineUnderBullet: Signal<boolean> = computed(() => {
    return this.hasChildren() || this.isMultiLine()
  })

  displayTime: Signal<boolean> = computed(() => {
    if (this.entry().nesting === 0 || this.entryIsHovered()) {
      return true;
    }
    return false;
  });

  indentArray: Signal<number[]> = computed(() => {
    return Array(this.entry().nesting)
      .fill(0)
      .map((x, i) => i);
  });

  textWidth: Signal<string> = computed(() => {
    let startWidth = 45;
    startWidth = startWidth - this.entry().nesting * 1.5;
    return `${startWidth}rem`;
  });

  onCheckboxToggled(value: boolean) {
    console.log(`Toggle checkbox for entry ${this.entry().id} to ${value}`);
  }

  calculateIsMultiLine() {
    const textBox = document.getElementById(this.entry().id.toString());
    if (textBox !== undefined && textBox !== null) {
      const textBoxHeight: number = +textBox.offsetHeight;
      if (textBoxHeight > 50) {
        return true;
      }
    }
    return false;
  }

  ngAfterViewInit(): void {
    this.isMultiLine.set(this.calculateIsMultiLine());
  }
}
