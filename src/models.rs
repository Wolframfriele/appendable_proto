use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqliteRow, FromRow, Row};

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Entry {
    pub entry_id: i64,
    pub parent: Option<i64>,
    pub path: String,
    pub nesting: i64,
    pub start_timestamp: DateTime<Utc>,
    pub end_timestamp: Option<DateTime<Utc>>,
    pub text: String,
    pub show_todo: bool,
    pub is_done: bool,
    pub estimated_duration: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EntryAndTags {
    pub entry_id: i64,
    pub parent: Option<i64>,
    pub path: String,
    pub nesting: i64,
    pub start_timestamp: DateTime<Utc>,
    pub end_timestamp: Option<DateTime<Utc>>,
    pub text: String,
    pub show_todo: bool,
    pub is_done: bool,
    pub estimated_duration: i64,
    pub tags: Vec<String>,
}

impl<'r> FromRow<'r, SqliteRow> for EntryAndTags {
    fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
        let entry_id = row.try_get("entry_id")?;
        let parent = row.try_get("parent")?;
        let path = row.try_get("path")?;
        let nesting = row.try_get("nesting")?;
        let start_timestamp = row.try_get("start_timestamp")?;
        let end_timestamp = row.try_get("end_timestamp")?;
        let text = row.try_get("text")?;
        let show_todo = row.try_get("show_todo")?;
        let is_done = row.try_get("is_done")?;
        let estimated_duration = row.try_get("estimated_duration")?;
        let tags: Vec<String> = row
            .try_get::<&str, &str>("tags")?
            .split(", ")
            .map(str::to_string)
            .collect();
        Ok(EntryAndTags {
            entry_id,
            parent,
            path,
            nesting,
            start_timestamp,
            end_timestamp,
            text,
            show_todo,
            is_done,
            estimated_duration,
            tags,
        })
    }
}

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Tag {
    pub tag_id: i64,
    pub name: String,
    pub archived: bool,
}

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct ResultEntry {
    pub entry_id: i64,
}
