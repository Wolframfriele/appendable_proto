UPDATE entries
SET end_timestamp = '2025-03-11 10:09:20'
WHERE entries.nesting >= 1 AND entries.end_timestamp IS NULL;

INSERT INTO entries
(parent, "path", "nesting", start_timestamp, end_timestamp, "text", show_todo, is_done, estimated_duration)
VALUES
(NULL, '/1/7/', 2, DATETIME('2025-03-11 10:09:20'), NULL, 'New entry', 0, 0, NULL);
