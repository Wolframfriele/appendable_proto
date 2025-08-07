PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
	project_id INTEGER PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	archived BOOLEAN NOT NULL
);

DROP TABLE IF EXISTS blocks;
CREATE TABLE blocks (
    block_id INTEGER PRIMARY KEY,
    block_text VARCHAR(255) NOT NULL,
    project INTEGER,
    start DATETIME NOT NULL,
    end DATETIME,
    duration INTEGER,

    FOREIGN KEY (project) REFERENCES projects(project_id)
    	ON UPDATE CASCADE
);

DROP TABLE IF EXISTS entries;
CREATE TABLE entries (
	entry_id INTEGER PRIMARY KEY,
	parent INTEGER,
  	nesting INTEGER,
  	entry_text TEXT,
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

DROP TABLE IF EXISTS tagged_entries;
CREATE TABLE tagged_entries (
	tagged_id INTEGER PRIMARY KEY,
	block_fk INTEGER NOT NULL,
	tag_fk INTEGER NOT NULL,

    FOREIGN KEY (block_fk) REFERENCES blocks(block_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_fk) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE INDEX idx_blocks_start ON blocks(start);

-- SQLite specific option to turn on foreign key constraints checking
PRAGMA foreign_keys = ON;
