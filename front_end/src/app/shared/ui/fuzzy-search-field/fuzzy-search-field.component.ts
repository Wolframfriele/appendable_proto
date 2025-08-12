import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  standalone: true,
  selector: "app-fuzzy-search-field",
  imports: [FormsModule],
  template: `
    <div class="search-component">
      <input
        #searchBox
        class="fuzzy-search-field"
        type="text"
        [placeholder]="placeholder()"
        [(ngModel)]="searchInput"
        (keydown)="handleKeyboardInput($event)"
        autofocus
      />
      <hr class="divider" />
      <ul class="searchable-options">
        @for (selectable of filterdOptions(); let idx = $index; track idx) {
          <li [class.active]="isActive(idx)">{{ selectable }}</li>
        }
      </ul>
    </div>
  `,
  styles: `
    .search-component {
      background: var(--background);
      border: solid 1px var(--secondary-text);
      border-radius: 5px;
      padding: 0.3rem;
    }

    .fuzzy-search-field {
      width: 100%;
      height: 2rem;
      background: none;
      color: var(--text-color);
      font-size: 1.25rem;
      border: none;
    }

    .fuzzy-search-field::placeholder {
      color: var(--secondary-text);
    }

    .fuzzy-search-field:focus {
      outline: none;
    }

    .divider {
      width: 100%;
      margin: 0.3rem 0;
      padding: 0;
    }

    .searchable-options {
      display: relative;
      list-style: none;
      padding: 0;
      margin: 0;
      z-index: 1;
    }

    .active {
      background: var(--active-color);
      border-radius: 5px;
    }

    li {
      padding: 0.2rem;
    }
  `,
})
export class FuzzySearchFieldComponent {
  searchableOptions = input.required<string[]>();
  placeholder = input.required<string>();
  setFocus = input<boolean>(false);
  selected = output<string>();

  selectedIdx = signal(0);
  searchInput = model<string>("");
  searchBox = viewChild.required<ElementRef<HTMLInputElement>>("searchBox");

  filterdOptions = computed(() =>
    this.searchableOptions().filter((option) =>
      option.includes(this.searchInput()),
    ),
  );

  constructor() {
    effect(() => {
      if (this.setFocus()) {
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
        this.selected.emit(this.filterdOptions()[this.selectedIdx()]);
        break;
    }
  }
}
