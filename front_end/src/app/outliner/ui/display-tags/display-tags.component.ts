import { Component, computed, input, signal, Signal } from '@angular/core';

@Component({
  selector: 'app-display-tags',
  imports: [],
  standalone: true,
  template: `
    <div class="tags">
        @for (tag of displayTags(); track $index) {
            <div class="tag">{{ tag }}</div>
        }
        @if (tags().length > MAXIMUM_TAGS_BEFORE_COMPACTING && compacted()) {
            <div
              class="tag"
              (click)="compacted.set(!this.compacted())"
            >...</div>
        }
    </div>
  `,
  styles: `
    .tags {
      display: inline;

      .tag {
        background-color: var(--lighter-black);

        padding: 0 0.6rem;
        border-radius: 5px;
        margin-right: 0.4rem;
        display: inline-block;
        color: var(--secondary-text);
        font-size: 0.9rem;
      }

      .tag:hover {
        color: var(--text-color);
      }
    }
  `
})
export class DisplayTagsComponent {
  MAXIMUM_TAGS_BEFORE_COMPACTING = 5;
  tags = input.required<string[]>();

  compacted = signal<boolean>(true);

  displayTags: Signal<string[]> = computed(() => {
    if (this.tags().length > this.MAXIMUM_TAGS_BEFORE_COMPACTING && this.compacted()) {
      return this.tags().slice(0, this.MAXIMUM_TAGS_BEFORE_COMPACTING);
    }
    return this.tags();
  })
}
