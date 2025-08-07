import { EntryJson } from "./entry.interface";
import { Entry } from "./entry.model";
import { mapToOpionalDate, mapToOptionalDateStr } from "./helper.mapper";

export function mapToEntry(json: EntryJson): Entry {
  return {
    id: json.entry_id,
    parent: json.parent,
    nesting: json.nesting,
    text: json.text,
    showTodo: json.show_todo,
    isDone: json.is_done,
  };
}

export function mapToEntries(jsonArray: EntryJson[]): Entry[] {
  return jsonArray.map(mapToEntry);
}

export function mapToJsonEntry(entry: Entry): EntryJson {
  return {
    entry_id: entry.id,
    parent: entry.parent,
    nesting: entry.nesting,
    text: entry.text,
    show_todo: entry.showTodo,
    is_done: entry.isDone,
  };
}
