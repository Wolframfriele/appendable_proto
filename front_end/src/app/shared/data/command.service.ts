import { Injectable, signal } from "@angular/core";
import { Observable, Subject } from "rxjs";

export enum Command {
  SWITCH_TO_NORMAL_MODE = "navigation: switch to normal mode",
  SWITCH_TO_INSERT_MODE = "navigation: switch to insert mode",
  SWITCH_TO_VISUAL_MODE = "navigation: switch to visual mode",
  SWITCH_TO_COMMAND_MODE = "navigation: switch to command mode",
  SWITCH_TO_DEFAULT_MODE = "navigation: switch to default mode",

  GO_TO_JOURNAL = "navigation: go to journal",
  GO_TO_PROJECTS = "navigation: go to projects",

  MOVE_TO_PREVIOUS_CONTAINER = "navigation: move to previous container",
  MOVE_TO_NEXT_CONTAINER = "navigation: move to next container",
  MOVE_TO_PREVIOUS_ELEMENT = "navigation: move to previous element",
  MOVE_TO_NEXT_ELEMENT = "navigation: move to next element",

  ADD_NEW_ENTRY = "crud: add new entry",
  ADD_NEW_CHILD_ENTRY = "crud: add new child entry",
  DELETE_ELEMENT = "crud: delete active element",
  INDENT_ENTRY = "crud: indent entry",
  OUTDENT_ENTRY = "crud: outdent entry",
  TOGGLE_TODO = "crud: toggle todo",
  TOGGLE_DONE = "crud: toggle done",
  ARCHIVE_PROJECT = "crud: archive project",
  UNARCHIVE_PROJECT = "crud: unarchive project",

  ADD_NEW = "crud: add new element",
  DELETE_SELECTED_BLOCK = "crud: delete selected block",
  END_SELECTED_BLOCK = "crud: end selected block",

  LOGOUT = "auth: logout",
}

@Injectable({
  providedIn: "root",
})
export class CommandService {
  private executedCommands$ = new Subject<Command>();

  public get executed$(): Observable<Command> {
    return this.executedCommands$;
  }

  public get possibleCommands(): string[] {
    return Object.values(Command);
  }

  public execute(command: Command) {
    this.executedCommands$.next(command);
  }

  public executeFromValue(commandValue: string) {
    const command = Object.values(Command).find(
      (value) => value == commandValue,
    ) as Command | undefined;
    if (command) {
      this.executedCommands$.next(command);
    }
  }
}
