import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Command, CommandService } from "../../data/command.service";

@Component({
  standalone: true,
  selector: "app-fuzzy-search-field",
  imports: [FormsModule],
  template: `
    <input
      #searchBox
      class="fuzzy-search-field"
      type="text"
      [placeholder]="placeholder()"
      [(ngModel)]="searchInput"
      (keydown)="handleKeyboardInput($event)"
      autofocus
    />
    <ul class="searchable-options">
      @for (selectable of filterdOptions(); let idx = $index; track idx) {
        <li [class.active]="isActive(idx)">{{ selectable }}</li>
      }
    </ul>
  `,
  styles: `
    :host {
      width: var(--search-box-width, 20rem);
    }

    .fuzzy-search-field {
      width: var(--search-box-width, 20rem);
      height: 2rem;
      background: var(--background);
      color: var(--text-color);
      font-size: 1.25rem;
      border: solid 1px var(--secondary-text);
      border-radius: 5px 5px 0 0;
      padding: 0.2rem;
    }

    .fuzzy-search-field::placeholder {
      color: var(--secondary-text);
    }

    .fuzzy-search-field:focus {
      outline: none;
    }

    .searchable-options {
      width: var(--search-box-width, 20rem);
      background: var(--background-deep);
      position: fixed;
      list-style: none;
      border: solid 1px var(--secondary-text);
      border-radius: 0 0 5px 5px;
      padding: 0.2rem;
      margin: 0;
      z-index: 1;
    }

    li {
      padding: 0.2rem;
      border-radius: 5px;
    }
  `,
})
export class FuzzySearchFieldComponent {
  commandService = inject(CommandService);
  searchableOptions = input.required<string[]>();
  placeholder = input.required<string>();
  setFocus = input<boolean>(false);
  switchToInputMode = input<boolean>(true);
  selected = output<string>();

  selectedIdx = signal(0);
  searchInput = model<string>("");
  searchBox = viewChild.required<ElementRef<HTMLInputElement>>("searchBox");

  filterdOptions = computed(() =>
    this.searchableOptions().filter((option) =>
      option.toLowerCase().includes(this.searchInput().toLowerCase()),
    ),
  );

  constructor() {
    effect(() => {
      if (this.setFocus()) {
        if (this.switchToInputMode()) {
          this.commandService.executeCommand$.next(
            Command.SWITCH_TO_INSERT_MODE,
          );
        }
        this.searchBox().nativeElement.focus();
      }
    });
  }

  isActive(idx: number): boolean {
    if (idx === this.selectedIdx()) {
      return true;
    }
    return false;
  }

  handleKeyboardInput(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowUp":
        if (this.selectedIdx() > 0) {
          this.selectedIdx.update((current) => current - 1);
        }
        break;
      case "ArrowDown":
        if (this.selectedIdx() < this.filterdOptions().length - 1) {
          this.selectedIdx.update((current) => current + 1);
        }
        break;
      case "Enter":
        this.commandService.executeCommand$.next(Command.SWITCH_TO_NORMAL_MODE);
        this.selected.emit(this.filterdOptions()[this.selectedIdx()]);
        break;
    }
  }
}
