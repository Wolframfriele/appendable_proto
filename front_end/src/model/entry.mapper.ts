import { EntryModel } from "./entry.model"
import { EntryJson } from "./entry.interface"

export function mapToEntry(json: EntryJson): EntryModel {
  return {
    id: json.entry_id,
    parent: json.parent,
    path: json.path,
    nesting: json.nesting,
    startTimestamp: new Date(json.start_timestamp),
    endTimestamp: mapToOpionalDate(json.end_timestamp),
    text: json.text,
    showTodo: json.show_todo,
    isDone: json.is_done,
    estimatedDuration: json.estimated_duration,
    tags: json.tags,
  }
}

export function mapToEntries(jsonArray: EntryJson[]): EntryModel[] {
  return jsonArray.map(mapToEntry);
}

function mapToOpionalDate(optionalDate: string | undefined): Date | undefined {
  if (optionalDate !== undefined) {
    return new Date(optionalDate);
  }
  return undefined;
}
