export type EntryModel = {
    id: number;
    startTime: Date;
    endTime: Date | undefined;
    text: String;
    showTodo: boolean;
    isDone: boolean;
    estimate: number | undefined;
    tags: string[];
    indent: number;
}