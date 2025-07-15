export interface EntryWithTagJson {
  entry_id: number;
  parent: number | undefined;
  path: string;
  nesting: number;
  start_timestamp: string;
  end_timestamp: string | undefined;
  text: string;
  show_todo: boolean;
  is_done: boolean;
  estimated_duration: number | undefined;
  tags: string[];
}

export interface EntryJson {
  entry_id: number;
  parent: number | undefined;
  path: string;
  nesting: number;
  start_timestamp: string;
  end_timestamp: string | undefined;
  text: string;
  show_todo: boolean;
  is_done: boolean;
  estimated_duration: number | undefined;
}
