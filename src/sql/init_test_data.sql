INSERT INTO projects
(project_id, name, archived)
VALUES
(1, 'Integration-Testing', 0);

INSERT INTO blocks
(block_id, block_text, project, start, end, duration)
VALUES
(1, 'Planning', NULL, DATETIME('2025-08-02T07:42:42+00:00'), DATETIME('2025-08-02T09:30:42+00:00'), 6480),
(2, 'Setting up Integration tests', 1, DATETIME('2025-08-02T09:30:42+00:00'), DATETIME('2025-08-02T12:05:42+00:00'), 9300),
(3, 'Lunch', NULL, DATETIME('2025-08-02T12:05:42+00:00'), DATETIME('2025-08-02T13:05:42+00:00'), 3600),
(4, 'Review', NULL, DATETIME('2025-08-03T13:05:30.367+00:00'), DATETIME('2025-08-03T13:35:30.367+00:00'), 1800),
(5, 'Planning', NULL, DATETIME('2025-08-03T08:35:30.367+00:00'), NULL, 0);

INSERT INTO entries
(entry_id, parent, nesting, entry_text, show_todo, is_done)
VALUES
(1, 1, 0, 'US-01-Integration testing', 0, 0),
(2, 1, 1, 'Use case 01.1 inserting new blocks', 1, 1),
(3, 1, 1, 'Use case 01.2 inserting new entries', 1, 1),
(4, 1, 1, 'Use case 01.3 adding tags', 1, 0),
(5, 1, 1, 'Use case 01.4 linking blocks', 1, 0),
(6, 2, 0, 'Ran into a problem with setting up the integration tests.', 0, 0),
(7, 2, 1, 'When clicking anywhere over the full width of an empty line in logseq, it starts editing that line. This is functionality Im missing, so when the content is empty it is almost impossible to start typing in it.', 0, 0),
(8, 2, 1, 'Integration testing is very difficult, the timing between all the services is hard to manage, and you are far removed from the thing you are testing. But it has also been really helpful in actually finding problems', 0, 0),
(9, 2, 2, 'Got all the integration tests to work! (imagine)', 0, 0),
(10, 4, 2, 'If only this code was rust, I would still not understand it', 0, 0),
(11, 5, 0, 'Fill in hours', 1, 0),
(12, 5, 1, 'Do that thing', 1, 0);

INSERT INTO tags
(tag_id, name, archived)
VALUES
(1, '#work', 0),
(2, '#personal', 0),
(3, '#planning', 0),
(4, '#important', 0);

INSERT INTO tagged_entries
(tagged_id, block_fk, tag_fk)
VALUES
(1, 1, 1),
(2, 1, 3),
(3, 2, 1),
(4, 4, 1),
(5, 5, 1),
(6, 4, 4),
(7, 1, 4);
