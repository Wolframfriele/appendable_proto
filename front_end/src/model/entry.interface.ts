export interface EntryJson {
  entry_id: number;
  parent: number | undefined;
  path: string;
  nesting: number;
  start_timestamp: string;
  end_timestamp: string | undefined;
  text: String;
  show_todo: boolean;
  is_done: boolean;
  estimated_duration: number | undefined;
  tags: string[];
}
