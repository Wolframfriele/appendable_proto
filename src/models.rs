use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqliteRow, FromRow, Row};

#[derive(Serialize, Deserialize, Debug)]
pub struct Block {
    pub block_id: i64,
    pub text: String,
    pub project: Option<i64>,
    pub project_name: Option<String>,
    pub start: DateTime<Utc>,
    pub end: Option<DateTime<Utc>>,
    pub duration: i64,
    pub tags: Vec<String>,
}

impl<'r> FromRow<'r, SqliteRow> for Block {
    fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
        let block_id = row.try_get("block_id")?;
        let text = row.try_get("text")?;
        let project = row.try_get("project")?;
        let project_name = row.try_get("project_name")?;
        let start = row.try_get("start")?;
        let end = row.try_get("end")?;
        let duration = row.try_get("duration")?;
        let tags: Vec<String> = row
            .try_get::<&str, &str>("tags")?
            .split(",")
            .filter(|s| !s.is_empty())
            .map(str::to_string)
            .collect();
        Ok(Block {
            block_id,
            text,
            project,
            project_name,
            start,
            end,
            duration,
            tags,
        })
    }
}

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Entry {
    pub entry_id: i64,
    pub parent: Option<i64>,
    pub nesting: i64,
    pub text: String,
    pub show_todo: bool,
    pub is_done: bool,
}

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Project {
    pub project_id: i64,
    pub name: String,
    pub archived: bool,
    pub color: Option<i64>,
}

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Color {
    pub color_id: i64,
    pub hex_value: String,
}

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Tag {
    pub tag_id: i64,
    pub name: String,
    pub archived: bool,
}

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct InsertResult {
    pub id: i64,
}

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct NextDataResponse {
    pub block_timestamp: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct RangeParams {
    start: Option<DateTime<Utc>>,
    end: Option<DateTime<Utc>>,
}

impl RangeParams {
    pub fn get_start(&self) -> NaiveDateTime {
        self.start.unwrap_or(day_start()).naive_utc()
    }

    pub fn get_end(&self) -> NaiveDateTime {
        self.end.unwrap_or(day_end()).naive_utc()
    }
}

fn day_start() -> DateTime<Utc> {
    let now = Utc::now();
    now.date_naive()
        .and_hms_opt(0, 0, 0)
        .unwrap()
        .and_local_timezone(Utc)
        .unwrap()
}

fn day_end() -> DateTime<Utc> {
    let now = Utc::now();
    now.date_naive()
        .and_hms_opt(23, 59, 59)
        .unwrap()
        .and_local_timezone(Utc)
        .unwrap()
}
