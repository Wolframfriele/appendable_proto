INSERT INTO projects
(project_id, name, archived, color)
VALUES
(1, 'Integration-Testing', 0, 1),
(2, 'Appendable', 1, 1),
(3, 'Refinement', 0, 2),
(4, 'Planning', 0, 3),
(5, 'Review', 0, 4),
(6, 'PMDEV-4560-fix-ukvc-localhost-blinking', 0, 1);

INSERT INTO blocks
(block_id, text, project, start, end, duration)
VALUES
(1, 'Planning', 4, DATETIME('2025-08-02T07:42:42'), DATETIME('2025-08-02T09:30:42'), 6480),
(2, 'Set up framework', 1, DATETIME('2025-08-02T09:30:42'), DATETIME('2025-08-02T12:05:42'), 9300),
(3, 'Bugfix', 6, DATETIME('2025-08-02T12:05:42'), DATETIME('2025-08-02T13:05:42'), 3600),
(4, 'Review', 5, DATETIME('2025-08-03T13:05:30'), DATETIME('2025-08-03T13:35:30'), 1800),
(5, 'Refinement', 3, DATETIME('2025-08-03T15:35:30'), DATETIME('2025-08-03T16:45:30'), 3000),
(6, 'Planning', 2, DATETIME('2025-08-04T10:02:30'), DATETIME('2025-08-04T10:28:05'), 1200),
(7, 'Designing', 2, DATETIME('2025-08-04T10:28:05'), DATETIME('2025-08-04T12:02:05'), 5640),
(8, 'Coding', 2, DATETIME('2025-08-04T13:05:30'), DATETIME('2025-08-04T13:58:30'), 3180),
(9, 'Bumping my head against timing issues', 1, DATETIME('2025-08-05T15:35:30'), NULL, 0);

INSERT INTO entries
(entry_id, parent, "nesting", "text", show_todo, is_done)
VALUES
(1, 1, 0, 'US-01-Integration testing', 0, 0),
(2, 1, 1, 'Use case 01.1 inserting new blocks', 1, 1),
(3, 1, 1, 'Use case 01.2 inserting new entries', 1, 1),
(4, 1, 1, 'Use case 01.3 adding tags', 1, 0),
(5, 1, 1, 'Use case 01.4 linking blocks', 1, 0),
(6, 2, 0, 'Ran into a problem with setting up the integration tests.', 0, 0),
(7, 2, 0, 'When clicking anywhere over the full width of an empty line in logseq, it starts editing that line. This is functionality Im missing, so when the content is empty it is almost impossible to start typing in it.', 0, 0),
(8, 2, 1, 'Integration testing is very difficult, the timing between all the services is hard to manage, and you are far removed from the thing you are testing. But it has also been really helpful in actually finding problems', 0, 0),
(9, 2, 2, 'Got all the integration tests to work! (imagine)', 0, 0),
(10, 4, 0, 'If only this code was rust, I would still not understand it', 0, 0),
(11, 6, 0, 'Fill in hours', 1, 0),
(12, 6, 0, 'Do that thing', 1, 0),
(13, 7, 0, 'Trying to figure out in what order I should display blocks', 0, 0),
(14, 7, 1, 'Option 1: Older lower, newer on the top', 0, 0),
(15, 7, 1, 'Option 2: Normal writing direction, so oldest at the bottom', 0, 0),
(16, 7, 2, 'This would feel weird with scrolling, but normal with reading', 0, 0),
(17, 8, 0, 'Playing around with quoridor', 0, 0),
(18, 8, 1, 'I want to build a system to quickly play quoridor against', 0, 0),
(19, 9, 0, 'Argh why are integration tests so incredibly difficult to get correctly. I thought I figured them out, but there are still flaky tests. I am not entirely sure where the problem is.', 0, 0);

INSERT INTO tags
(tag_id, name, archived)
VALUES
(1, '#work', 0),
(2, '#personal', 0),
(3, '#planning', 0),
(4, '#important', 0);

INSERT INTO tagged_blocks
(tagged_id, block_fk, tag_fk)
VALUES
(1, 1, 1),
(2, 1, 3),
(3, 2, 1),
(4, 3, 3),
(5, 4, 1),
(6, 5, 1),
(7, 4, 4),
(8, 1, 4),
(9, 6, 2),
(10, 7, 2),
(11, 8, 2),
(12, 9, 1);
