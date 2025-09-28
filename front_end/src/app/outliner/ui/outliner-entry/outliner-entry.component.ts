import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  Signal,
  ViewChild,
} from "@angular/core";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { FormsModule } from "@angular/forms";
import { ContenteditableDirective } from "../../../model/contenteditable.model";
import { Entry } from "../../../model/entry.model";
import { EntryService } from "../../data/entry.service";
import { KeyboardService } from "../../../shared/data/keyboard.service";
import { Command, CommandService } from "../../../shared/data/command.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, filter } from "rxjs";
import { OutlinerStateService } from "../../data/outliner-state.service";
import { ViewportScroller } from "@angular/common";

@Component({
  selector: "app-outliner-entry",
  standalone: true,
  imports: [CheckboxComponent, FormsModule, ContenteditableDirective],
  template: `
    <li>
      <div
        class="text-elements-container"
        (click)="focusEntry()"
        [class.active]="displayActive()"
      >
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
                  @if (entryModel().showTodo) {
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

        <div class="text-container" [style.max-width]="textWidth()">
          @if (entry().showTodo) {
            <app-checkbox
              class="checkbox"
              [checked]="entryModel().isDone"
              (checkedToggle)="onCheckboxToggled($event)"
            />
          }
          <div
            #textBox
            [id]="entry().id"
            class="text"
            [class.done]="entry().isDone"
            [contentEditable]="true"
            [(ngModel)]="entryModel().text"
            contenteditableModel
          ></div>
        </div>
      </div>
    </li>
  `,
  styles: `
    .text-elements-container {
      display: flex;
      justify-content: flex-start;
      align-items: stretch;
      gap: 0.5rem;
      border-radius: 5px;

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
        min-height: 1.75rem;
        border-radius: 5px;

        .duration-component {
          margin-right: 0.5rem;
        }

        .text {
          min-height: 1.25rem;
          outline: none;
          display: inline list-item;
        }
      }
    }

    .done {
      text-decoration: line-through;
    }
  `,
})
export class OutlinerEntryComponent {
  @ViewChild("textBox") textBox!: ElementRef<HTMLDivElement>;

  viewportScroller = inject(ViewportScroller);

  entryService = inject(EntryService);
  keyboardService = inject(KeyboardService);
  commandService = inject(CommandService);
  outlinerState = inject(OutlinerStateService);

  entry = input.required<Entry>();
  blockIdx = input.required<number>();
  idx = input.required<number>();
  isActive = input.required<boolean>();

  entryModel = model<Entry>({
    id: 0,
    parent: 0,
    nesting: 0,
    text: "",
    showTodo: false,
    isDone: false,
  });

  isMultiLine = signal(false);

  isDotHovered = signal(false);
  isMenuHovered = signal(false);
  isMenuOpen = computed(() => this.isDotHovered() || this.isMenuHovered());
  displayActive = computed(
    () => this.isActive() && !this.keyboardService.isInsertMode(),
  );

  indentArray: Signal<number[]> = computed(() => {
    return Array(this.entryModel().nesting)
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
      this.entryModel.set({
        id: this.entry().id,
        parent: this.entry().parent,
        nesting: this.entry().nesting,
        text: this.entry().text,
        showTodo: this.entry().showTodo,
        isDone: this.entry().isDone,
      }),
    );

    effect(() => {
      if (this.isActive() && !this.entryIsOnScreen()) {
        this.viewportScroller.setOffset([0, 70]);
        this.viewportScroller.scrollToAnchor(`${this.entry().id}`);

        // it seems that scrollToAnchor gives some elements focus
        (document.activeElement as HTMLElement).blur();
      }
    });

    effect(() => {
      if (this.isActive() && this.keyboardService.isInsertMode()) {
        this.focusEntry();
      }
    });

    // Should also happen when going out of insert mode and the entry was active
    toObservable(this.isActive)
      .pipe(
        distinctUntilChanged(),
        filter((value) => value === false),
      )
      .subscribe(() => this.updateEntryWhenDirty());

    this.commandService.executed$
      .pipe(takeUntilDestroyed())
      .subscribe((command) => {
        switch (command) {
          case Command.ADD_NEW_ENTRY:
            return this.handleAddEntry();
          case Command.INDENT_ENTRY:
            return this.indentEntry();
          case Command.OUTDENT_ENTRY:
            return this.outdentEntry();
          case Command.TOGGLE_TODO:
            return this.toggleTodo();
          case Command.TOGGLE_DONE:
            return this.toggleDone();
        }
      });
  }

  get entryDirty(): boolean {
    return JSON.stringify(this.entry()) !== JSON.stringify(this.entryModel());
  }

  focusEntry() {
    setTimeout(() => {
      this.textBox.nativeElement.focus();
    });
    if (!this.keyboardService.isInsertMode()) {
      this.commandService.execute(Command.SWITCH_TO_INSERT_MODE);
    }
    if (this.outlinerState.activeBlockIdx() !== this.blockIdx()) {
      this.outlinerState.activeBlockIdx.set(this.blockIdx());
    }
    if (this.outlinerState.activeEntryIdx() !== this.idx()) {
      this.outlinerState.activeEntryIdx.set(this.idx());
    }
  }

  updateEntryWhenDirty() {
    if (this.entryDirty) {
      this.entryService.edit(this.entryModel());
    }
  }

  onCheckboxToggled(newValue: boolean) {
    this.entryModel.update((entry) => ({ ...entry, isDone: newValue }));
    this.entryService.edit(this.entryModel());
  }

  onTodoToggled() {
    this.entryModel.update((entry) => ({
      ...entry,
      showTodo: !entry.showTodo,
    }));
    this.entryService.edit(this.entryModel());
  }

  onDeleteEntry() {
    this.entryService.remove(this.entry().id);
  }

  indentEntry() {
    if (this.isActive()) {
      this.entryModel.update((entry) => ({
        ...entry,
        nesting: entry.nesting + 1,
      }));
    }
  }

  outdentEntry() {
    if (this.isActive() && this.entryModel().nesting > 0) {
      this.entryModel.update((entry) => ({
        ...entry,
        nesting: entry.nesting - 1,
      }));
    }
  }

  handleAddEntry() {
    if (this.isActive()) {
      this.updateEntryWhenDirty();
    }
  }

  toggleTodo() {
    if (this.isActive()) {
      this.onTodoToggled();
    }
  }

  toggleDone() {
    if (this.isActive()) {
      this.onCheckboxToggled(!this.entryModel().isDone);
    }
  }

  entryIsOnScreen(): boolean {
    if (this.textBox) {
      const rect = this.textBox.nativeElement.getBoundingClientRect();
      const topShown = rect.top >= 0;
      const bottomShown = rect.bottom <= window.innerHeight;
      return topShown && bottomShown;
    }
    return false;
  }
}
