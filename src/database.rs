use crate::models::{Entry, EntryAndTags, NextDataResponse, ResultEntry};
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

pub async fn insert_new_entry(db: &Database, entry: Entry) -> Result<Entry> {
    update_end_timestamps_of_unclosed_entries(db, &entry).await?;
    let new_entry_id = insert_entry(db, &entry).await?;
    Ok(select_entry(db, new_entry_id).await?)
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

pub async fn update_entry(db: &Database, entry: Entry) -> Result<Entry> {
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
    .await?;

    select_entry(db, entry.entry_id).await
}

pub async fn delete_entry(db: &Database, entry_id: i64, with_children: bool) -> bool {
    if with_children {
        let _ = sqlx::query(
            "
    DELETE FROM entries WHERE path LIKE (
        SELECT CONCAT(path, ?1, '/', '%') FROM entries WHERE entry_id = ?1
    );
            ",
        )
        .bind(entry_id)
        .execute(&db.pool)
        .await;
    }

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

// Should probably add a maximum amount of time between the start and end timestamp?
// How would I handle this time being breached?
async fn update_end_timestamps_of_unclosed_entries(db: &Database, entry: &Entry) -> Result<()> {
    sqlx::query(
        "
    UPDATE entries
    SET end_timestamp = DATETIME(?1)
    WHERE nesting >= ?2 AND end_timestamp IS NULL;
       ",
    )
    .bind(entry.start_timestamp)
    .bind(entry.nesting)
    .execute(&db.pool)
    .await?;

    Ok(())
}

async fn insert_entry(db: &Database, entry: &Entry) -> Result<i64> {
    let new_entry_id = sqlx::query_as::<_, ResultEntry>(
        "
    INSERT INTO entries (
        parent, 
        path, 
        nesting, 
        start_timestamp, 
        text, 
        show_todo, 
        is_done, 
        estimated_duration 
    ) VALUES (
        ?1,
        ?2,
        ?3,
        DATETIME(?4),
        ?5,
        ?6,
        ?7,
        ?8
    ) RETURNING entry_id;
        ",
    )
    .bind(entry.parent)
    .bind(&entry.path)
    .bind(entry.nesting)
    .bind(entry.start_timestamp)
    .bind(&entry.text)
    .bind(entry.show_todo)
    .bind(entry.is_done)
    .bind(entry.estimated_duration)
    .fetch_one(&db.pool)
    .await?;
    Ok(new_entry_id.entry_id)
}

pub async fn select_earlier_timestamp(
    db: &Database,
    timestamp: &NaiveDateTime,
) -> Result<NextDataResponse> {
    let next_data = sqlx::query_as::<_, NextDataResponse>(
        "
    SELECT start_timestamp AS entry_timestamp FROM entries 
    WHERE start_timestamp < DATETIME(?1)
    ORDER BY entry_timestamp DESC LIMIT 1;
        ",
    )
    .bind(timestamp)
    .fetch_one(&db.pool)
    .await?;
    Ok(next_data)
}

//async fn get_parent_path_and_nesting(db: &Database, entry: &Entry) -> Result<(String, i64)> {
//    let (parent_path, parent_id) = if entry.parent.is_some() {
//        sqlx::query_as::<_, (String, i64)>(
//            "
//SELECT entries.path, entries.nesting FROM entries
//WHERE entries.entry_id = ?3;
//       ",
//        )
//        .bind(entry.end_timestamp)
//        .bind(entry.nesting)
//        .bind(entry.parent)
//        .fetch_one(&db.pool)
//        .await?
//    } else {
//        (String::from("/"), 0)
//    };
//
//    Ok((parent_path, parent_id))
//}
