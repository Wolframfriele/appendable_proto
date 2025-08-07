import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: true,
  name: "roundDate",
})
export class RoundDatePipe implements PipeTransform {
  transform(value: Date): string {
    return value.toISOString().split("T")[0];
  }
}
