import { Injectable } from "@angular/core";
import { EntryModel } from "../../model/entry.model";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class EntryService {
  getEntries(): Observable<EntryModel[]> {
    return of([
      {
        id: 1,
        startTime: new Date("2025-01-01T10:24:00"),
        endTime: new Date("2025-01-01T10:56:00"),
        text: "Sketching out stuff for the track application, with a longer sentence to see the effect of that. But it still needs to be longer to go past the edge, at this point Im just typing",
        showTodo: true,
        isDone: false,
        estimate: 90,
        tags: ["#personal", "#track", "#coding"],
        indent: 0,
      },
      {
        id: 2,
        startTime: new Date("2025-01-01T10:56:00"),
        endTime: new Date("2025-01-01T11:25:00"),
        text: "I need more text in this thing to check the effect of long text. Planning out my week to have more room for deep work sessions so that I can build more cool stuff, and spend the rest of the time on other nice things",
        showTodo: false,
        isDone: false,
        estimate: undefined,
        tags: ["#personal"],
        indent: 1,
      },
      {
        id: 3,
        startTime: new Date("2025-01-01T12:02:30"),
        endTime: undefined,
        text: "This project still requires a lot of tweaking to make it work and look good and this one also needs a boatload more text, cause otherwise I dont know what to do with it to be honest, and the line",
        showTodo: true,
        isDone: false,
        estimate: 180,
        tags: [],
        indent: 2,
      },
      {
        id: 4,
        startTime: new Date("2025-01-01T12:03:00"),
        endTime: undefined,
        text: "This is an entry without duration and estimate",
        showTodo: false,
        isDone: false,
        estimate: undefined,
        tags: ["#work"],
        indent: 0,
      },
      {
        id: 5,
        startTime: new Date("2025-01-01T17:30:00"),
        endTime: undefined,
        text: "This is an entry with only an estimate",
        showTodo: true,
        isDone: false,
        estimate: 45,
        tags: ["#work"],
        indent: 0,
      },
    ]);
  }
}
