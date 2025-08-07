import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: true,
  name: "displayDate",
})
export class DisplayDatePipe implements PipeTransform {
  transform(date: Date): string {
    return date.toDateString();
  }
}
