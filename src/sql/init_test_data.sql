INSERT INTO entries
(entry_id, parent, "path", "nesting", start_timestamp, end_timestamp, "text", show_todo, is_done, estimated_duration)
VALUES
(1, NULL, '/1/', 0, DATETIME('2025-03-11 07:42:42'), DATETIME('2025-03-12 09:30:42'), 'Root', 0, 0, NULL),
(2, 1, '/1/2/', 1, DATETIME('2025-03-11 07:42:42'), DATETIME('2025-03-11 07:43:07'), 'First block', 0, 0, NULL),
(3, 2, '/1/2/3/', 2, DATETIME('2025-03-11 07:42:50'), DATETIME('2025-03-11 07:43:02'), 'Sub block 1', 0, 0, NULL),
(4, 2, '/1/2/4/', 2, DATETIME('2025-03-11 07:43:02'), DATETIME('2025-03-11 07:43:07'), 'Sub block 2', 0, 0, NULL),
(5, 2, '/1/2/5/', 2, DATETIME('2025-03-11 07:43:07'), DATETIME('2025-03-11 07:43:07'), 'Sub block 3', 0, 0, NULL),
(6, 2, '/1/6/', 2, DATETIME('2025-03-11 07:43:07'), DATETIME('2025-03-11 07:47:22'), 'Sub block 3', 0, 0, NULL),
(7, 1, '/1/7/', 1, DATETIME('2025-03-11 07:47:22'), DATETIME('2025-03-12 09:30:42'), 'Second block', 0, 0, NULL),
(8, 7, '/1/7/8/', 2, DATETIME('2025-03-11 07:47:40'), DATETIME('2025-03-11 07:47:56'), 'Another sub block 1', 0, 0, NULL),
(9, 7, '/1/7/9/', 2, DATETIME('2025-03-11 07:47:56'), DATETIME('2025-03-11 07:48:30'), 'Another sub block 2', 0, 0, NULL),
(10, 9, '/1/7/9/10/', 3, DATETIME('2025-03-11 07:48:00'), DATETIME('2025-03-11 07:48:30'), 'More nesting!', 0, 0, NULL),
(11, 7, '/1/7/11/', 3, DATETIME('2025-03-11 07:48:30'), DATETIME('2025-03-12 09:30:42'), 'Another sub block 3', 0, 0, NULL),
(12, NULL, '/12/', 0, DATETIME('2025-03-12 09:30:42'), NULL, 'Root second day', 0, 0, NULL),
(13, 12, '/12/13/', 1, DATETIME('2025-03-12 09:30:42'), NULL, 'First block', 0, 0, NULL),
(14, 13, '/12/13/14/', 2, DATETIME('2025-03-12 09:30:50'), NULL, 'Sub block 1', 0, 0, NULL);

INSERT INTO tags
(tag_id, name, archived)
VALUES
(1, '#work', 0),
(2, '#personal', 0),
(3, '#planning', 0);

INSERT INTO tagged_entries
(tagged_id, entry_fk, tag_fk)
VALUES
(1, 2, 1),
(2, 2, 3),
(3, 6, 1),
(4, 12, 2);
