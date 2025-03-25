use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Todo {
    pub description: String,
    pub done: bool,
}

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Entry {
    pub entry_id: i64,
    pub parent: i64,
    pub path: String,
    pub nesting: i64,
    pub start_timestamp: DateTime<Utc>,
    pub end_timestamp: DateTime<Utc>,
    pub text: String,
    pub show_todo: bool,
    pub is_done: bool,
    pub estimated_duration: i64,
}
