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
import { ActiveEntryService } from "../../data/active-entry.service";
import { RoundDatePipe } from "../../../pipes/round-date.pipe";

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
          [startTime]="updatedEntry().startTimestamp"
          [duration]="duration()"
          [estimate]="updatedEntry().estimatedDuration"
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

        <div class="dot-container">
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
                <li
                  (click)="onTodoToggled()"
                >
                  @if(updatedEntry().showTodo) {
                    Hide todo
                  } @else {
                    Make todo
                  }
                </li>
                <li (click)="onDeleteEntry()">Delete entry</li>
              </ul>
            </div>
          }
        </div>

        <div class="text-container" [class.entry-active]="isActive()" [ngStyle]="{ 'max-width': textWidth() }">
          @if (entry().showTodo) {
            <app-checkbox
              class="checkbox"
              [checked]="updatedEntry().isDone"
              (checkedToggle)="onCheckboxToggled($event)"
            />

            <app-duration-vs-estimate
              class="duration-component"
              [duration]="duration()"
              [estimate]="updatedEntry().estimatedDuration"
            />
          }
          <div
            [id]="entry().id"
            class="text"
            [contentEditable]="true"
            [(ngModel)]="updatedEntry().text"
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

     .dot-container {
        width: 1rem;
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

      .dot::before {
        content: "";
        position: relative;
        inset-block: -0.5rem;
        inset-inline: -0.3rem;
        width: 1.2rem;
        height: 1.2rem;
        display: inline-block
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

      .entry-active {
        background-color: var(--lighter-black);
        border-radius: 5px;
     }

      /*.text-container:hover {*/
      /*  background-color: var(--lighter-black);*/
      /*  border-radius: 5px;*/
      /*}*/
    }
  `,
})
export class OutlinerEntryComponent {
  entryService = inject(EntryService);
  activeEntryService = inject(ActiveEntryService);

  toRoundDate = new RoundDatePipe();

  entry = input.required<Entry>();
  updatedEntry = model<Entry>({
    id: 0,
    parent: undefined,
    path: '',
    nesting: 0,
    startTimestamp: new Date(),
    endTimestamp: undefined,
    text: '',
    showTodo: false,
    isDone: false,
    estimatedDuration: 0,
    tags: [],
  });

  idx = input.required<number>();

  hasChildren = input.required<boolean>();
  isMultiLine = signal(false);

  isDotHovered = signal(false);
  isMenuHovered = signal(false);
  isMenuOpen = computed(() => this.isDotHovered() || this.isMenuHovered());
  isActive = computed(() => {
    const idxMatchesActive = this.idx() === this.activeEntryService.activeEntryIdx();
    const dayMatchesActive = this.toRoundDate.transform(this.entry().startTimestamp) === this.activeEntryService.activeDay();
    return idxMatchesActive && dayMatchesActive
  });

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
      .map((_, i) => i);
  });

  textWidth: Signal<string> = computed(() => {
    let startWidth = 45;
    startWidth = startWidth - this.entry().nesting * 1.5;
    return `${startWidth}rem`;
  });

  constructor() {
    effect(() => this.updatedEntry.set({
      id: this.entry().id,
      parent: this.entry().parent,
      path: this.entry().path,
      nesting: this.entry().nesting,
      startTimestamp: this.entry().startTimestamp,
      endTimestamp: this.entry().endTimestamp,
      text: this.entry().text,
      showTodo: this.entry().showTodo,
      isDone: this.entry().isDone,
      estimatedDuration: this.entry().estimatedDuration,
      tags: this.entry().tags,
    }))
  }

  focusEntry() {
    const textBox = document.getElementById(this.entry().id.toString());
    textBox?.focus();
  }

  onFocusOut() {
    if (this.entry() !== this.updatedEntry()) {
      if (this.updatedEntry().id === 0) {
        this.entryService.add$.next(this.updatedEntry());
      } else {
        this.entryService.edit$.next(this.updatedEntry());
      }
    }
  }

  onCheckboxToggled(newValue: boolean) {
    console.log(`Toggle checkbox for entry ${this.entry().id} to ${newValue}`);
    this.updatedEntry.update((entry) => ({ ...entry, isDone: newValue }));
    this.entryService.edit$.next(this.updatedEntry());
  }

  onTodoToggled() {
    console.log(`Toggle todo for entry: ${this.entry().id}`);
    this.updatedEntry.update((entry) => ({ ...entry, showTodo: !entry.showTodo }));
    this.entryService.edit$.next(this.updatedEntry());
  }

  onDeleteEntry() {
    console.log(`Deleting entry: ${this.entry().id}`);
    this.entryService.remove$.next({ id: this.entry().id, withChildren: true });
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
