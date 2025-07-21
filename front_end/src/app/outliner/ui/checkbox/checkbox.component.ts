import { NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  imports: [NgStyle],
  standalone: true,
  template: `
    <span
      class="checkbox"
      (click)="onClick()"
      [ngStyle]="{'background-color': checked() ? 'var(--secondary-text)' : ''}"
    >
      <span
        class="checkmark"
        [ngStyle]="{'opacity': checked() ? '100' : '0'}"
      ></span>
    </span>
  `,
  styles: `
    .checkbox{
        height: 1rem;
        width: 1rem;
        border-radius: 3px;
        border: 0.2rem solid var(--secondary-text);
        display: inline-block;
        transform: translate(0, 0.3rem);
        margin: 0 0.1rem;
    }

    .checkmark {
        height: 0.9rem;
        width: 0.9rem;
        background-color: var(--text-color);
        border-radius: 2px;
        display: inline-block;
        transform: translate(0.05rem, -0.35rem);
        clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
    }
  `
})
export class CheckboxComponent {
  checked = input.required<boolean>();
  checkedToggle = output<boolean>();

  onClick() {
    this.checkedToggle.emit(!this.checked());
  }
}
