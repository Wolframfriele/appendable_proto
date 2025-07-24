import { computed, inject, Injectable, signal } from '@angular/core';
import { fromEvent, map } from 'rxjs';
import { Command, CommandService } from './command.service';
import { NormalModeMap } from './keymaps/normal-mode.map';
import { CommandModeMap } from './keymaps/command-mode.map';
import { VisualModeMap } from './keymaps/visual-mode.map';
import { InsertModeMap } from './keymaps/insert-mode.map';

export enum ControlMode {
  NORMAL_MODE = "Normal",
  INSERT_MODE = "Insert",
  VISUAL_MODE = "Visual",
  COMMAND_MODE = "Command",
}

interface State {
  activeControlMode: ControlMode,
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  commandService = inject(CommandService);

  private state = signal<State>({
    activeControlMode: ControlMode.NORMAL_MODE,
  })

  // selectors
  activeControlMode = computed(() => this.state().activeControlMode);

  keyboard$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
    map((key) => key.key),
  )

  constructor() {
    this.commandService.executeCommand$.subscribe(
      (command) => {
        switch (command) {
          case Command.SWITCH_TO_NORMAL_MODE:
            this.state.set({ activeControlMode: ControlMode.NORMAL_MODE });
            break;
          case Command.SWITCH_TO_INSERT_MODE:
            this.state.set({ activeControlMode: ControlMode.INSERT_MODE });
            break;
          case Command.SWITCH_TO_VISUAL_MODE:
            this.state.set({ activeControlMode: ControlMode.VISUAL_MODE });
            break;
          case Command.SWITCH_TO_COMMAND_MODE:
            this.state.set({ activeControlMode: ControlMode.COMMAND_MODE });
            break;
        }
      }
    )

    this.keyboard$.subscribe(
      (key) => {
        console.log(key);
        switch (this.activeControlMode()) {
          case ControlMode.NORMAL_MODE:
            const normalKeymapping = NormalModeMap.get(key);
            if (normalKeymapping) {
              this.commandService.executeCommand$.next(normalKeymapping);
            }
            break;

          case ControlMode.INSERT_MODE:
            const insertKeymapping = InsertModeMap.get(key);
            if (insertKeymapping) {
              this.commandService.executeCommand$.next(insertKeymapping);
            }
            break;

          case ControlMode.VISUAL_MODE:
            const visualKeymapping = VisualModeMap.get(key);
            if (visualKeymapping) {
              this.commandService.executeCommand$.next(visualKeymapping);
            }
            break

          case ControlMode.COMMAND_MODE:
            const commandKeymapping = CommandModeMap.get(key);
            if (commandKeymapping) {
              this.commandService.executeCommand$.next(commandKeymapping);
            }
            break
        }
      });
  }
}
