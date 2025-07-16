import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  Signal,
} from "@angular/core";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { NgStyle } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { ContenteditableDirective } from "../../../model/contenteditable.model";
import { Entry } from "../../../model/entry.model";
import { EntryInfoComponent } from "../entry-info/entry-info.component";
import { DurationVsEstimateComponent } from "../../../shared/ui/duration-vs-estimate/duration-vs-estimate.component";
import { EntryService } from "../../data/entry.service";

@Component({
  selector: "app-outliner-entry",
  standalone: true,
  imports: [
    CheckboxComponent,
    DurationVsEstimateComponent,
    NgStyle,
    FormsModule,
    ContenteditableDirective,
    EntryInfoComponent
  ],
  template: `
    <li>
      @if (entry().parent === null) {
        <app-entry-info
          [startTime]="entry().startTimestamp"
          [duration]="duration()"
          [estimate]="entry().estimatedDuration"
          [tags]="entry().tags"
        ></app-entry-info>
      }

      <div
        class="text-elements-container"
        (click)="focusEntry()"
      >
        @for (number of indentArray(); track $index) {
          <span class="leading-line"></span>
        }

        <span
          class="line"
          [ngStyle]="{ opacity: displayLineUnderBullet() ? '100' : '0' }"
        ></span>

        <div>
        <span
          class="dot"
          (mouseover)="isDotHovered.set(true)"
          (mouseleave)="isDotHovered.set(false)"
        ></span>

        @if (isMenuOpen()) {
          <div
            class="menu"
            (mouseover)="isMenuHovered.set(true)"
            (mouseleave)="isMenuHovered.set(false)"
          >
            <ul class="menu-items">
              <li>Make todo</li>
              <li>Delete entry</li>
            </ul>
          </div>
        }
        </div>

        <div class="text-container" [ngStyle]="{ 'max-width': textWidth() }">
          @if (entry().showTodo) {
            <app-checkbox
              class="checkbox"
              [checked]="entry().isDone"
              (checkedToggle)="onCheckboxToggled($event)"
            />

            <app-duration-vs-estimate
              class="duration-component"
              [duration]="duration()"
              [estimate]="entry().estimatedDuration"
            />
          }
          <div
            [id]="entry().id"
            class="text"
            [contentEditable]="true"
            [(ngModel)]="textModel"
            [ngStyle]="{ 'text-decoration': entry().isDone ? 'line-through' : '' }"
            (focusout)="onFocusOut()"
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

      .dot:hover  {
        background-color: white;
      }

      .menu {
        background-color: var(--lighter-black);
        position: absolute;
        z-index: 1;
        transform: translate(-0.3rem, 0.9rem);
        border-radius: 5px;
        box-shadow: 0px 5px 8px 0px rgba(0,0,0,0.05);
        font-size: 0.9rem;
        ul {
          padding: 0;
          list-style-type: none;
          li {
            border-radius: 5px;
            padding: 0.5rem 1rem;
          }
          li:hover {
            background-color: var(--active-color);
            color: var(--hover-text);
          }
        }
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
  entryService = inject(EntryService);

  entry = input.required<Entry>();
  textModel = model<string>('Basic text');

  hasChildren = input.required<boolean>();
  entryIsHovered = signal(false);
  isMultiLine = signal(false);

  isDotHovered = signal(false);
  isMenuHovered = signal(false);
  isMenuOpen = computed(() => this.isDotHovered() || this.isMenuHovered());

  duration: Signal<number> = computed(() => {
    let startTime = this.entry().startTimestamp;
    let endTime = this.entry().endTimestamp;

    if (endTime !== undefined && startTime !== undefined) {
      return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    }
    return 0;
  })

  displayLineUnderBullet: Signal<boolean> = computed(() => {
    return this.hasChildren() || this.isMultiLine()
  })


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

  focusEntry() {
    const textBox = document.getElementById(this.entry().id.toString());
    textBox?.focus();
  }

  onFocusOut() {
    if (this.textModel() != this.entry().text) {
      const newEntry: Entry = {
        id: this.entry().id,
        parent: this.entry().parent,
        path: this.entry().path,
        nesting: this.entry().nesting,
        startTimestamp: this.entry().startTimestamp,
        endTimestamp: this.entry().endTimestamp,
        text: this.textModel(),
        showTodo: this.entry().showTodo,
        isDone: this.entry().isDone,
        estimatedDuration: this.entry().estimatedDuration,
        tags: [],
      }
      if (newEntry.id === 0) {
        this.entryService.add$.next(newEntry);
      } else {
        this.entryService.edit$.next(newEntry);
      }
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
