import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum Command {
  SWITCH_TO_NORMAL_MODE = 'keyboard: switch to normal mode',
  SWITCH_TO_INSERT_MODE = 'keyboard: switch to insert mode',
  SWITCH_TO_VISUAL_MODE = 'keyboard: switch to visual mode',
  SWITCH_TO_COMMAND_MODE = 'keyboard: switch to command mode',
}

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  // Option to call commands

  executeCommand$ = new Subject<Command>();

  // Also has an output stream of executed commands with arguments

  constructor() { }
}
