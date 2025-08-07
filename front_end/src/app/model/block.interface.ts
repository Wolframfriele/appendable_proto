export interface BlockJson {
  block_id: number;
  text: string;
  project: number | undefined;
  project_name: string | undefined;
  start: string;
  end: string | undefined;
  duration: number;
  tags: string[];
}
