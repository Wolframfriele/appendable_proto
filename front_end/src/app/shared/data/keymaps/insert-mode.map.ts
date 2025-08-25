import { Command } from "../command.service";

export const InsertModeMap = new Map<string, Command>([
  ["Escape", Command.SWITCH_TO_NORMAL_MODE],
  ["Enter", Command.ADD_NEW_ENTRY],
  ["Tab", Command.INDENT_ENTRY],
  ["Shift+Tab", Command.OUTDENT_ENTRY],
]);
