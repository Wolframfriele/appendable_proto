import { Component, computed, input, Signal, signal } from '@angular/core';

@Component({
  selector: 'app-display-tags',
  imports: [],
  templateUrl: './display-tags.component.html',
  styleUrl: './display-tags.component.scss'
})
export class DisplayTagsComponent {
  tags = input.required<string[]>();

  // compactTags: Signal<string[]> = computed(() => {
  //   if (this.tags().length > 1) {
  //     return [this.tags()[0], '...'];
  //   }
  //   return this.tags();
  // })
}
