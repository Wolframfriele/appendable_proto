PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS colors;
CREATE TABLE colors (
    color_id INTEGER PRIMARY key,
    hex_value VARCHAR(6)
);

DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
	project_id INTEGER PRIMARY key,
	name VARCHAR(255) NOT NULL,
	archived BOOLEAN NOT NULL,
	color INTEGER,

	FOREIGN KEY (color) REFERENCES colors(color_id)
	    ON DELETE SET NULL
);


DROP TABLE IF EXISTS blocks;
CREATE TABLE blocks (
    block_id INTEGER PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    project INTEGER,
    start DATETIME NOT NULL,
    end DATETIME,
    duration INTEGER,

    FOREIGN KEY (project) REFERENCES projects(project_id)
    	ON DELETE SET NULL
);

DROP TABLE IF EXISTS entries;
CREATE TABLE entries (
	entry_id INTEGER PRIMARY KEY,
	parent INTEGER,
  	nesting INTEGER,
  	text TEXT,
  	show_todo BOOLEAN NOT NULL,
  	is_done BOOLEAN NOT NULL,

  	FOREIGN KEY (parent) REFERENCES blocks(block_id)
    	ON DELETE CASCADE
);

DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
	tag_id INTEGER PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	archived BOOLEAN NOT NULL
);

DROP TABLE IF EXISTS tagged_blocks;
CREATE TABLE tagged_blocks (
	tagged_id INTEGER PRIMARY KEY,
	block_fk INTEGER NOT NULL,
	tag_fk INTEGER NOT NULL,

    FOREIGN KEY (block_fk) REFERENCES blocks(block_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_fk) REFERENCES tags(tag_id) ON DELETE CASCADE
);

INSERT INTO colors
(color_id, hex_value)
VALUES
(1, '2dc7c4'),
(2, '5ae0df'),
(3, 'ee5396'),
(4, 'be95ff'),
(5, '25be6a'),
(6, 'fae3b0'),
(7, 'ff7eb6'),
(8, '33b1ff'),
(9, '78a9ff');
