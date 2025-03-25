import { NgStyle } from '@angular/common';
import { Component, computed, HostBinding, input, output, Signal } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  imports: [NgStyle],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss'
})
export class CheckboxComponent {
  checked = input.required<boolean>();
  checkedToggle = output<boolean>();

  onClick() {
    this.checkedToggle.emit(!this.checked)
  }
}
