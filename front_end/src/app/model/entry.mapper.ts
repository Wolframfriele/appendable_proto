import { EntryJson, EntryWithTagJson } from "./entry.interface"
import { Entry } from "./entry.model";

export function mapToEntry(json: EntryWithTagJson): Entry {
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

export function mapToEntries(jsonArray: EntryWithTagJson[]): Entry[] {
  return jsonArray.map(mapToEntry);
}

function mapToOpionalDate(optionalDate: string | undefined): Date | undefined {
  if (optionalDate) {
    return new Date(optionalDate);
  }
  return undefined;
}

export function mapToJsonEntry(entry: Entry): EntryJson {
  return {
    entry_id: entry.id,
    parent: entry.parent,
    path: entry.path,
    nesting: entry.nesting,
    start_timestamp: entry.startTimestamp.toISOString(),
    end_timestamp: mapToNullableDate(entry.endTimestamp),
    text: entry.text,
    show_todo: entry.showTodo,
    is_done: entry.isDone,
    estimated_duration: entry.estimatedDuration,
  }
}

function mapToNullableDate(optionalDate: Date | undefined): string | undefined {
  if (optionalDate) {
    return optionalDate.toISOString();
  }
  return undefined;
}

