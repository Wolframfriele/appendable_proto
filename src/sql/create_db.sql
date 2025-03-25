-- SQLite specific option to turn on foreign key constraints checking
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS entries;
CREATE TABLE entries (
	entry_id INTEGER PRIMARY KEY,
	parent INTEGER,
  	path VARCHAR(255) NOT NULL,
  	nesting INTEGER,
  	start_timestamp DATETIME NOT NULL,
  	end_timestamp DATETIME,
  	text TEXT,
  	show_todo BOOLEAN NOT NULL,
  	is_done BOOLEAN NOT NULL,
  	estimated_duration INTEGER,
  
  	FOREIGN KEY (parent) REFERENCES entries (entry_id)
    	ON UPDATE CASCADE
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
	entry_fk INTEGER NOT NULL,
	tag_fk INTEGER NOT NULL,
	
    FOREIGN KEY (entry_fk) REFERENCES entries(entry_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_fk) REFERENCES tags(tag_id) ON DELETE CASCADE
);
