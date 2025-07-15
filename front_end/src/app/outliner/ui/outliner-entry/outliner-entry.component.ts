import {
  Component,
  computed,
  effect,
  input,
  model,
  signal,
  Signal,
} from "@angular/core";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { NgStyle } from "@angular/common";
import { DurationEstimateComponent } from "../duration-estimate/duration-estimate.component";
import { FormsModule } from '@angular/forms';
import { ContenteditableDirective } from "../../../model/contenteditable.model";
import { Entry } from "../../../model/entry.model";
import { EntryInfoComponent } from "../entry-info/entry-info.component";

@Component({
  selector: "app-outliner-entry",
  standalone: true,
  imports: [
    CheckboxComponent,
    DurationEstimateComponent,
    NgStyle,
    FormsModule,
    ContenteditableDirective,
    EntryInfoComponent
  ],
  template: `
    <li [id]="entry().id">
      @if (entry().parent === null) {
        <app-entry-info [entry]="entry()"></app-entry-info>
      }

      <div
        class="text-elements-container"
        (mouseover)="entryIsHovered.set(true)"
        (mouseleave)="entryIsHovered.set(false)"
      >
        @for (number of indentArray(); track $index) {
          <span class="leading-line"></span>
        }

        <span
          class="line"
          [ngStyle]="{ opacity: displayLineUnderBullet() ? '100' : '0' }"
        ></span>

        <span class="dot"></span>

        <div class="text-container" [ngStyle]="{ 'max-width': textWidth() }">
          @if (entry().showTodo) {
            <app-checkbox
              class="checkbox"
              [checked]="entry().isDone"
              (checkedToggle)="onCheckboxToggled($event)"
            />

            <app-duration-estimate
              class="duration-component"
              [startTime]="entry().startTimestamp"
              [endTime]="entry().endTimestamp"
              [estimate]="entry().estimatedDuration"
            />
          }
          <div
            class="text"
            [contentEditable]="true"
            [(ngModel)]="textModel"
            [ngStyle]="{ 'text-decoration': entry().isDone ? 'line-through' : '' }"
            (focusout)="onFocusOut($event)"
            contenteditableModel
          ></div>
        </div>
      </div>
    </li>
  `,
  styles: `
   .text-elements-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: stretch;
      gap: 0.5rem;

      .line {
        border-left: 1px solid var(--secondary-text);
        margin-top: 1rem;
        margin-left: 1rem;
      }

      .dot {
        height: 0.5rem;
        width: 0.5rem;
        background-color: var(--secondary-text);
        border-radius: 50%;
        margin-left: -0.75rem;
        margin-top: 0.75rem;
        margin-right: 0.5rem;
        float: left;
      }

      .leading-line {
        border-left: 1px solid var(--secondary-text);
        margin-left: 1rem;
      }

      .bullet {
        height: 100%;
      }

      .checkbox {
        transform: translateY(0.15rem);
        margin-right: 0.5rem;
      }

      .text-container {
        padding: 0;
        padding: 3px 0.5rem;
        width: 100%;
        min-height: 1.5rem;

        .duration-component {
          margin-right: 0.5rem;
        }

        .text {
          display: inline;
          outline: none;
        }
      }

      .text-container:hover {
        background-color: var(--lighter-black);
        border-radius: 5px;
      }
    }
  `,
})
export class OutlinerEntryComponent {
  entry = input.required<Entry>();
  textModel = model<string>('Basic text');

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

  constructor() {
    effect(() => this.textModel.set(this.entry().text));
  }

  onContentChange(event: Event) {
    const div = event.target as HTMLElement;
    this.textModel.set(div.textContent || '');
  }

  onFocusOut(event: FocusEvent) {
    if (this.textModel() != this.entry().text) {
      console.log(`id: ${this.entry().id} changed txt to: ${this.textModel()}`);
    }
  }

  onCheckboxToggled(value: boolean) {
    console.log(`Toggle checkbox for entry ${this.entry().id} to ${value}`);
  }

  // calculateIsMultiLine() {
  //   const textBox = document.getElementById(this.entry().id.toString());
  //   if (textBox !== undefined && textBox !== null) {
  //     const textBoxHeight: number = +textBox.offsetHeight;
  //     if (textBoxHeight > 50) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // ngAfterViewInit(): void {
  //   this.isMultiLine.set(this.calculateIsMultiLine());
  // }
}
