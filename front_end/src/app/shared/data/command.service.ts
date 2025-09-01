import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export enum Command {
  SWITCH_TO_NORMAL_MODE = "navigation: switch to normal mode",
  SWITCH_TO_INSERT_MODE = "navigation: switch to insert mode",
  SWITCH_TO_VISUAL_MODE = "navigation: switch to visual mode",
  SWITCH_TO_COMMAND_MODE = "navigation: switch to command mode",
  SWITCH_TO_DEFAULT_MODE = "navigation: switch to default mode",

  GO_TO_OUTLINER = "navigation: go to outliner",
  GO_TO_PROJECTS = "navigation: go to projects",

  MOVE_TO_PREVIOUS_CONTAINER = "navigation: move to previous container",
  MOVE_TO_NEXT_CONTAINER = "navigation: move to next container",
  MOVE_TO_PREVIOUS_ELEMENT = "navigation: move to previous element",
  MOVE_TO_NEXT_ELEMENT = "navigation: move to next element",

  ADD_NEW = "crud: add new element",
  DELETE_SELECTED_BLOCK = "crud: delete selected block",
  END_SELECTED_BLOCK = "crud: end selected block",

  ADD_NEW_ENTRY = "crud: add new entry",
  ADD_NEW_CHILD_ENTRY = "crud: add new child entry",
  DELETE_ELEMENT = "crud: delete active entry",
  INDENT_ENTRY = "crud: indent entry",
  OUTDENT_ENTRY = "crud: outdent entry",
  TOGGLE_TODO = "crud: toggle todo",
  TOGGLE_DONE = "crud: toggle done",

  LOGOUT = "auth: logout",
}

@Injectable({
  providedIn: "root",
})
export class CommandService {
  // Option to call commands
  executeCommand$ = new Subject<Command>();

  public get possibleCommands(): string[] {
    return Object.values(Command);
  }

  public executeCommandFromValue(commandValue: string) {
    const command = Object.values(Command).find(
      (value) => value == commandValue,
    ) as Command | undefined;
    if (command) {
      this.executeCommand$.next(command);
    }
  }
}
