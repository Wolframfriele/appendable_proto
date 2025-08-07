import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  Renderer2,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Directive({
  standalone: true,
  selector: "[contenteditableModel]",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContenteditableDirective),
      multi: true,
    },
  ],
})
export class ContenteditableDirective implements ControlValueAccessor {
  @Input() contenteditableModel: any;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  @HostListener("input", ["$event"])
  onInput(): void {
    const value = this.el.nativeElement.innerText;
    this.onChange(value);
  }

  @HostListener("blur")
  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: any): void {
    if (value !== this.el.nativeElement.innerText) {
      this.renderer.setProperty(
        this.el.nativeElement,
        "innerText",
        value ?? "",
      );
    }
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.renderer.setProperty(
      this.el.nativeElement,
      "contentEditable",
      !isDisabled,
    );
  }
}
