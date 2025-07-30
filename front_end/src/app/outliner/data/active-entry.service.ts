import { computed, inject, Injectable, signal } from '@angular/core';
import { Entry } from '../../model/entry.model';
import { Command, CommandService } from '../../shared/data/command.service';
import { filter, map, merge, Subject } from 'rxjs';
import { EntryService } from './entry.service';
import { RoundDatePipe } from '../../pipes/round-date.pipe';


interface ActiveEntryState {
  activeDay: string,
  activeEntryIdx: number,
  // activeEntryId: Entry["id"] | undefined,
}

@Injectable({
  providedIn: 'root'
})
export class ActiveEntryService {
  commandService = inject(CommandService);
  entryService = inject(EntryService);

  roundDatePipe = new RoundDatePipe();

  changeActiveEntryCommands = [Command.MOVE_TO_NEXT_ENTRY, Command.MOVE_TO_PREVIOUS_ENTRY]

  // sources
  setActive$ = new Subject<Entry["id"]>();


  // listen to relevant command
  // and update the active when relevant commands happen

  // state
  state = signal<ActiveEntryState>({
    activeDay: this.roundDatePipe.transform(new Date()),
    activeEntryIdx: 0,
  });

  // selectors
  activeDay = computed(() => this.state().activeDay);
  activeEntryIdx = computed(() => this.state().activeEntryIdx);

  // How will I handle new entries? their ID is 0, and will later get a correct ID.
  //
  // I clearly did not think about new entries enough:
  //
  // Using the index of an entry is really helpful since this is what I need to operate on.
  // But since I'm setting new entries in the view those are not known in my arrays
  //
  // I probably need to find a way to set everything in the entry service.

  constructor() {
    console.log('Active entry service created')
    this.commandService.executeCommand$.subscribe(
      (command) => {
        switch (command) {
          case Command.MOVE_TO_PREVIOUS_ENTRY:
            this.moveToPreviousEntry();
            break;
          case Command.MOVE_TO_NEXT_ENTRY:
            this.moveToNextEntry();
            break;
        }
      }
    )
  }

  private moveToPreviousEntry() {
    // arrow up
    if (this.state().activeEntryIdx > 0) {
      this.state.update((state) =>
        ({ ...state, activeEntryIdx: state.activeEntryIdx - 1 })
      );
    } else {
      const previousDay = this.previousDay();
      if (previousDay) {
        const amountOfEntriesInPreviousDay = this.entryService.entries().get(previousDay)?.length;

        if (amountOfEntriesInPreviousDay) {
          this.state.update((state) =>
            ({ ...state, activeEntryIdx: amountOfEntriesInPreviousDay - 1, activeDay: previousDay })
          );
        }
      }
    }
    console.log(this.state());
  }

  private moveToNextEntry() {
    // arrow down

    const amountOfEntriesInCurrentDay = this.entryService.entries().get(this.state().activeDay)?.length;
    if (amountOfEntriesInCurrentDay && this.state().activeEntryIdx < (amountOfEntriesInCurrentDay - 1)) {
      this.state.update((state) =>
        ({ ...state, activeEntryIdx: state.activeEntryIdx + 1 })
      );
    } else {
      const nextDay = this.nextDay();
      console.log(nextDay);

      if (nextDay) {
        if (this.entryService.entries().has(nextDay)) {
          this.state.update((state) =>
            ({ ...state, activeEntryIdx: 0, activeDay: nextDay })
          );
        }
      }
    }
    console.log(this.state());
  }

  // needs to not be next day, but next possible day with entries
  private previousDay(): string | undefined {
    const loadedDays = Array.from(this.entryService.entries().keys());
    loadedDays.sort().reverse();

    const currentDayIdx = loadedDays.indexOf(this.activeDay());
    console.log(`Current day index: ${currentDayIdx}`);
    if (currentDayIdx > 0) {
      return loadedDays[currentDayIdx - 1];
    }
    return undefined;
  }

  private nextDay() {
    const loadedDays = Array.from(this.entryService.entries().keys());
    loadedDays.sort().reverse();

    const currentDayIdx = loadedDays.indexOf(this.activeDay());
    console.log(`Current day index: ${currentDayIdx}`);

    if (currentDayIdx >= 0 && currentDayIdx < loadedDays.length) {
      return loadedDays[currentDayIdx + 1];
    }
    return undefined;
  }
}
