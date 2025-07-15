use crate::models::{Entry, EntryAndTags, ResultEntry};
use anyhow::Result;
use chrono::NaiveDateTime;
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};

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

pub async fn insert_entry(db: &Database, entry: Entry) -> Result<Entry> {
    println!("Inserting new entry: {:?}", entry);

    let parent_entry = if entry.parent.is_some() {
        sqlx::query_as::<_, (String, i64)>(
            "
UPDATE entries
SET end_timestamp = DATETIME(?1)
WHERE entries.nesting >= ?2 AND entries.end_timestamp IS NULL;

SELECT entries.path, entries.nesting FROM entries
WHERE entries.entry_id = ?3;
       ",
        )
        .bind(entry.end_timestamp)
        .bind(entry.nesting)
        .bind(entry.parent)
        .fetch_one(&db.pool)
        .await?
    } else {
        (String::from("/"), 0)
    };
    println!("{:?}", parent_entry);

    let new_entry_id = sqlx::query_as::<_, ResultEntry>(
        "
INSERT INTO entries (
        parent,
        path,
        start_timestamp,
        text,
        show_todo,
        is_done,
        estimated_duration
    ) VALUES (
        ?1,
        '',
        DATETIME(?2),
        '',
        0,
        0,
        0
    ) RETURNING entry_id;
        ",
    )
    .bind(entry.parent)
    .bind(entry.start_timestamp)
    .fetch_one(&db.pool)
    .await?;

    println!("{:?}", new_entry_id);

    Ok(sqlx::query_as::<_, Entry>(
        "
UPDATE entries SET
    parent=?2, 
    path=?3, 
    nesting=?4, 
    start_timestamp=DATETIME(?5), 
    end_timestamp=DATETIME(?6), 
    text=?7, 
    show_todo=?8, 
    is_done=?9, 
    estimated_duration=?10
WHERE entry_id=?1;

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
FROM entries WHERE entry_id = ?1;
        ",
    )
    .bind(new_entry_id.entry_id)
    .bind(entry.parent)
    .bind(update_path(&parent_entry.0, parent_entry.1))
    .bind(parent_entry.1)
    .bind(entry.start_timestamp)
    .bind(entry.end_timestamp)
    .bind(entry.text)
    .bind(entry.show_todo)
    .bind(entry.is_done)
    .bind(entry.estimated_duration)
    .fetch_one(&db.pool)
    .await?)
}

pub async fn select_entry(db: &Database, entry_id: i64) -> Result<Entry> {
    println!("Selecting entry: {:?}", entry_id);
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

pub async fn select_entries(
    db: &Database,
    start: NaiveDateTime,
    end: NaiveDateTime,
) -> Vec<EntryAndTags> {
    println!("Selecting between: {:?} and {:?}", start, end);
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
WHERE entries.start_timestamp > DATETIME(?1) AND entries.start_timestamp < DATETIME(?2)
GROUP BY entries.entry_id;
            ",
    )
    .bind(start)
    .bind(end)
    .fetch_all(&db.pool)
    .await
    .unwrap()
}

pub async fn update_entry(db: &Database, entry: Entry) {
    println!("Update entry: {:?}", entry);
    sqlx::query(
        "
UPDATE entries SET 
    parent=?2, 
    path=?3, 
    nesting=?4, 
    start_timestamp=DATETIME(?5), 
    end_timestamp=DATETIME(?6), 
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

fn update_path(parent_path: &str, parent_id: i64) -> String {
    if parent_id == 0 {
        return String::from("/");
    }
    format!("{}/{}/", parent_path, parent_id)
}
