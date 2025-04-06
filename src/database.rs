use crate::models::{Entry, EntryAndTags};
use anyhow::Result;
use chrono::{Days, NaiveDate};
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use tracing::debug;

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new() -> Result<Database> {
        let pool = SqlitePoolOptions::new()
            .connect("sqlite://entries.db")
            .await?;
        Ok(Self { pool })
    }
}

pub async fn select_entry(db: &Database, entry_id: i64) -> Result<Entry> {
    debug!("Selecting entry: {:?}", entry_id);
    Ok(sqlx::query_as::<_, Entry>(
        "
SELECT 
    entry_id, 
    parent, 
    path, 
    nesting, 
    start_timestamp, 
    end_timestamp, 
    text, 
    show_todo, 
    is_done, 
    estimated_duration 
FROM entries 
WHERE entries.entry_id = ?1;
            ",
    )
    .bind(entry_id)
    .fetch_one(&db.pool)
    .await?)
}

pub async fn select_entries(db: &Database, date: NaiveDate) -> Vec<EntryAndTags> {
    println!("Selecting entries for: {:?}", date);
    sqlx::query_as::<_, EntryAndTags>(
        "
SELECT 
	entries.entry_id, 
	entries.parent, 
	entries.path, 
	entries.nesting, 
	entries.start_timestamp, 
	entries.end_timestamp, 
	entries.text, 
	entries.show_todo, 
	entries.is_done, 
	entries.estimated_duration , 
	COALESCE(GROUP_CONCAT(tags.name, ', '), '') AS tags FROM entries
FULL OUTER JOIN tagged_entries ON entries.entry_id = tagged_entries.entry_fk
FULL OUTER JOIN tags ON tagged_entries.tag_fk  = tags.tag_id
WHERE entries.start_timestamp > ?1 AND entries.start_timestamp < ?2
GROUP BY entries.entry_id;
            ",
    )
    .bind(date)
    .bind(
        date.checked_add_days(Days::new(1))
            .expect("Could not add a day to the input date"),
    )
    .fetch_all(&db.pool)
    .await
    .unwrap()
}

pub async fn add_entry(db: &Database, entry: Entry) {
    println!("Inserting new entry: {:?}", entry);
    sqlx::query(
        "
UPDATE entries
SET end_timestamp = '2025-03-11 10:09:20'
WHERE entries.nesting >= 1 AND entries.end_timestamp IS NULL;

INSERT INTO entries
(parent, path, nesting, start_timestamp, end_timestamp, text, show_todo, is_done, estimated_duration)
VALUES
(NULL, '/1/7/', 2, DATETIME('2025-03-11 10:09:20'), NULL, 'New entry', 0, 0, NULL);
        "
    )
        .execute(&db.pool)
        .await.unwrap();
}

pub async fn update_entry(db: &Database, entry: Entry) {
    println!("Update entry: {:?}", entry);
    sqlx::query(
        "
UPDATE entries
SET parent=?2, 
    path=?3, 
    nesting=?4, 
    start_timestamp=?5, 
    end_timestamp=?6, 
    text=?7, 
    show_todo=?8, 
    is_done=?9, 
    estimated_duration=?10
WHERE entry_id=?1;
        ",
    )
    .bind(entry.entry_id)
    .bind(entry.parent)
    .bind(entry.path)
    .bind(entry.nesting)
    .bind(entry.start_timestamp)
    .bind(entry.end_timestamp)
    .bind(entry.text)
    .bind(entry.show_todo)
    .bind(entry.is_done)
    .bind(entry.estimated_duration)
    .execute(&db.pool)
    .await
    .unwrap();
}

pub async fn delete_entry(db: &Database, entry_id: i64, with_children: bool) -> bool {
    if with_children {
        println!("Deleting with children for entry: {entry_id}");
        sqlx::query(
            "
DELETE FROM entries WHERE path LIKE (
    SELECT CONCAT(path, '%') FROM entries WHERE entry_id = ?1
);
            ",
        )
        .bind(entry_id)
        .execute(&db.pool)
        .await
        .is_ok()
    } else {
        println!("Safe deleting entry: {entry_id}");
        sqlx::query(
            "
DELETE FROM entries WHERE entry_id = ?1;
            ",
        )
        .bind(entry_id)
        .execute(&db.pool)
        .await
        .is_ok()
    }
}
