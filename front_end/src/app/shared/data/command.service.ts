import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export enum Command {
  SWITCH_TO_NORMAL_MODE = "keyboard: switch to normal mode",
  SWITCH_TO_INSERT_MODE = "keyboard: switch to insert mode",
  SWITCH_TO_VISUAL_MODE = "keyboard: switch to visual mode",
  SWITCH_TO_COMMAND_MODE = "keyboard: switch to command mode",

  ADD_NEW_BLOCK = "outliner: add new block",

  ADD_NEW_ENTRY = "outliner: add new entry",
  ADD_NEW_CHILD_ENTRY = "outliner: add new child entry",
  MOVE_TO_PREVIOUS_ENTRY = "outliner: move to previous entry",
  MOVE_TO_NEXT_ENTRY = "outliner: move to next entry",
}

@Injectable({
  providedIn: "root",
})
export class CommandService {
  // Option to call commands
  executeCommand$ = new Subject<Command>();

  // Also has an output stream of executed commands with arguments

  constructor() {}
}
