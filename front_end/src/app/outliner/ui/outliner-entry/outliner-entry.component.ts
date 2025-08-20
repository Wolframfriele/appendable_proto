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
import { FormsModule } from "@angular/forms";
import { ContenteditableDirective } from "../../../model/contenteditable.model";
import { Entry } from "../../../model/entry.model";
import { EntryService } from "../../data/entry.service";
import { RoundDatePipe } from "../../../pipes/round-date.pipe";
import {
  ControlMode,
  KeyboardService,
} from "../../../shared/data/keyboard.service";
import { Command, CommandService } from "../../../shared/data/command.service";
import { BlockService } from "../../data/block.service";

@Component({
  selector: "app-outliner-entry",
  standalone: true,
  imports: [CheckboxComponent, FormsModule, ContenteditableDirective],
  template: `
    <li>
      <div class="text-elements-container" (click)="focusEntry()">
        @for (number of indentArray(); track $index) {
          <span class="leading-line"></span>
        }

        <span class="line" class="hidden"></span>

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
                <li (click)="onTodoToggled()">
                  @if (updatedEntry().showTodo) {
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

        <div
          class="text-container"
          [class.active]="isActive()"
          [style.max-width]="textWidth()"
        >
          @if (entry().showTodo) {
            <app-checkbox
              class="checkbox"
              [checked]="updatedEntry().isDone"
              (checkedToggle)="onCheckboxToggled($event)"
            />
          }
          <div
            [id]="entry().id"
            class="text"
            [class.done]="entry().isDone"
            [contentEditable]="true"
            [(ngModel)]="updatedEntry().text"
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

      .dot-container {
        width: 0.5rem;
        margin: 0 0.4rem;
      }

      .dot {
        display: block;
        height: 0.4rem;
        width: 0.4rem;
        background-color: var(--secondary-text);
        border-radius: 50%;
        margin-top: 0.75rem;
      }

      .dot::before {
        content: "";
        position: relative;
        inset-block: -0.5rem;
        inset-inline: -0.3rem;
        width: 1.2rem;
        height: 1.2rem;
        display: inline-block;
      }

      .dot:hover {
        background-color: white;
      }

      .menu {
        background-color: var(--lighter-black);
        position: absolute;
        z-index: 1;
        transform: translate(0.4rem, 0.1rem);
        border-radius: 5px;
        box-shadow: 0px 5px 8px 0px rgba(0, 0, 0, 0.05);
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
        border-left: 1px solid var(--lighter-black);
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
        padding: 0.1rem 0.1rem;
        min-height: 1.5rem;
        border-radius: 5px;

        .duration-component {
          margin-right: 0.5rem;
        }

        .text {
          display: inline;
          outline: none;
        }
      }
    }

    .done {
      text-decoration: line-through;
    }
  `,
})
export class OutlinerEntryComponent {
  entryService = inject(EntryService);
  blockService = inject(BlockService);
  keyboardService = inject(KeyboardService);
  commandService = inject(CommandService);

  toRoundDate = new RoundDatePipe();

  entry = input.required<Entry>();
  updatedEntry = model<Entry>({
    id: 0,
    parent: 0,
    nesting: 0,
    text: "",
    showTodo: false,
    isDone: false,
  });

  idx = input.required<number>();

  isMultiLine = signal(false);

  isDotHovered = signal(false);
  isMenuHovered = signal(false);
  isMenuOpen = computed(() => this.isDotHovered() || this.isMenuHovered());
  isActive = computed(() => {
    const isIdxActive = this.idx() === this.entryService.activeIdx();
    const isParentBlockActive =
      this.entry().parent === this.blockService.active.id;
    return (
      isIdxActive &&
      isParentBlockActive &&
      this.keyboardService.activeControlMode() !== ControlMode.INSERT_MODE
    );
  });

  indentArray: Signal<number[]> = computed(() => {
    return Array(this.entry().nesting)
      .fill(0)
      .map((_, i) => i);
  });

  textWidth: Signal<string> = computed(() => {
    let startWidth = 40;
    startWidth = startWidth - this.entry().nesting * 1.5;
    return `${startWidth}rem`;
  });

  constructor() {
    effect(() =>
      this.updatedEntry.set({
        id: this.entry().id,
        parent: this.entry().parent,
        nesting: this.entry().nesting,
        text: this.entry().text,
        showTodo: this.entry().showTodo,
        isDone: this.entry().isDone,
      }),
    );
  }

  focusEntry() {
    const textBox = document.getElementById(this.entry().id.toString());
    textBox?.focus();
    this.commandService.executeCommand$.next(Command.SWITCH_TO_INSERT_MODE);
    // this.entryService.activateEntryById(this.entry().id);
  }

  // figure out how to get an onBecomesActive event and
  // onLosesActive event
  // Then move the logic in onFocusOut to onLosesActive
  //

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
    console.log(`Toggle checkbox or entry ${this.entry().id} to ${newValue}`);
    this.updatedEntry.update((entry) => ({ ...entry, isDone: newValue }));
    this.entryService.edit$.next(this.updatedEntry());
  }

  onTodoToggled() {
    console.log(`Toggle todo for entry: ${this.entry().id}`);
    this.updatedEntry.update((entry) => ({
      ...entry,
      showTodo: !entry.showTodo,
    }));
    this.entryService.edit$.next(this.updatedEntry());
  }

  onDeleteEntry() {
    console.log(`Deleting entry: ${this.entry().id}`);
    this.entryService.remove$.next({ id: this.entry().id });
  }
}
