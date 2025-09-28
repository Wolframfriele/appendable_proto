import { inject, Injectable, signal } from "@angular/core";
import { fromEvent } from "rxjs";
import { Command, CommandService } from "./command.service";
import { NormalModeMap } from "./keymaps/normal-mode.map";
import { CommandModeMap } from "./keymaps/command-mode.map";
import { VisualModeMap } from "./keymaps/visual-mode.map";
import { InsertModeMap } from "./keymaps/insert-mode.map";

export enum ControlMode {
  NORMAL_MODE = "Normal",
  INSERT_MODE = "Insert",
  VISUAL_MODE = "Visual",
  COMMAND_MODE = "Command",
  DEFAULT_MODE = "Default",
}

@Injectable({
  providedIn: "root",
})
export class KeyboardService {
  private commandService = inject(CommandService);

  readonly activeControlMode = signal<ControlMode>(ControlMode.NORMAL_MODE);

  private keyboard$ = fromEvent<KeyboardEvent>(document, "keydown").pipe();

  constructor() {
    this.commandService.executed$.subscribe((command) => {
      console.log(command);
      switch (command) {
        case Command.SWITCH_TO_NORMAL_MODE:
          (document.activeElement as HTMLElement).blur();
          this.activeControlMode.set(ControlMode.NORMAL_MODE);
          break;
        case Command.SWITCH_TO_INSERT_MODE:
          this.activeControlMode.set(ControlMode.INSERT_MODE);
          break;
        case Command.SWITCH_TO_VISUAL_MODE:
          (document.activeElement as HTMLElement).blur();
          this.activeControlMode.set(ControlMode.VISUAL_MODE);
          break;
        case Command.SWITCH_TO_COMMAND_MODE:
          (document.activeElement as HTMLElement).blur();
          this.activeControlMode.set(ControlMode.COMMAND_MODE);
          break;
        case Command.SWITCH_TO_DEFAULT_MODE:
          this.activeControlMode.set(ControlMode.DEFAULT_MODE);
          break;
      }
    });

    this.keyboard$.subscribe((keyEvent) => {
      const keyCombo = this.keyComboStringFromKeyEvent(keyEvent);
      // console.log(keyCombo);
      switch (this.activeControlMode()) {
        case ControlMode.NORMAL_MODE:
          const normalKeymapping = NormalModeMap.get(keyCombo);
          if (normalKeymapping) {
            keyEvent.preventDefault();
            this.commandService.execute(normalKeymapping);
          }
          break;

        case ControlMode.INSERT_MODE:
          const insertKeymapping = InsertModeMap.get(keyCombo);
          if (insertKeymapping) {
            keyEvent.preventDefault();
            this.commandService.execute(insertKeymapping);
          }
          break;

        case ControlMode.VISUAL_MODE:
          const visualKeymapping = VisualModeMap.get(keyCombo);
          if (visualKeymapping) {
            keyEvent.preventDefault();
            this.commandService.execute(visualKeymapping);
          }
          break;

        case ControlMode.COMMAND_MODE:
          const commandKeymapping = CommandModeMap.get(keyCombo);
          if (commandKeymapping) {
            keyEvent.preventDefault();
            this.commandService.execute(commandKeymapping);
          }
          break;
      }
    });
  }

  private keyComboStringFromKeyEvent(keyEvent: KeyboardEvent): string {
    let result = "";
    if (keyEvent.metaKey) {
      result = result.concat("Meta+");
    }
    if (keyEvent.shiftKey) {
      result = result.concat("Shift+");
    }
    if (keyEvent.ctrlKey) {
      result = result.concat("Ctrl+");
    }
    if (keyEvent.altKey) {
      result = result.concat("Alt+");
    }
    return result.concat(keyEvent.key);
  }

  public isInsertMode(): boolean {
    return this.activeControlMode() === ControlMode.INSERT_MODE;
  }

  public isCommandMode(): boolean {
    return this.activeControlMode() === ControlMode.COMMAND_MODE;
  }
}
