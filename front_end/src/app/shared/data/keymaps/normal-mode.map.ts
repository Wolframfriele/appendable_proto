import { Command } from "../command.service";

export const NormalModeMap = new Map<string, Command>([
  ["i", Command.SWITCH_TO_INSERT_MODE],
  ["v", Command.SWITCH_TO_VISUAL_MODE],
  [":", Command.SWITCH_TO_COMMAND_MODE],
  ["n", Command.ADD_NEW_BLOCK],
  ["{", Command.MOVE_TO_PREVIOUS_CONTAINER],
  ["}", Command.MOVE_TO_NEXT_CONTAINER],
  ["Delete", Command.DELETE_SELECTED_BLOCK],
  ["o", Command.ADD_NEW_ENTRY],
  ["ArrowUp", Command.MOVE_TO_PREVIOUS_ELEMENT],
  ["ArrowDown", Command.MOVE_TO_NEXT_ELEMENT],
]);
