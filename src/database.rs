use crate::models::{Entry, EntryAndTags, Todo};
use anyhow::Result;
use axum::extract::{Extension, Path};
use axum::Json;
use chrono::{Days, NaiveDate};
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use tracing::debug;
use std::sync::Arc;

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
    Ok(
        sqlx::query_as::<_, Entry>(        
            "
SELECT entry_id, parent, path, nesting, start_timestamp, end_timestamp, text, show_todo, is_done, estimated_duration FROM entries WHERE entries.entry_id = ?1;
            "
        )
        .bind(entry_id)
        .fetch_one(&db.pool)
        .await?
    )
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

            "
        )
        .bind(date)
        .bind(date.checked_add_days(Days::new(1)).expect("Could not add a day to the input date"))
        .fetch_all(&db.pool)
        .await.unwrap()
} 

pub async fn add_todo(Extension(db): Extension<Arc<Database>>, Json(todo): Json<Todo>) {
    println!("Adding todo: {:?}", todo);
    sqlx::query("INSERT INTO todos (description) VALUES (?);")
        .bind(todo.description)
        .execute(&db.pool)
        .await
        .unwrap();
}

pub async fn todos(Extension(db): Extension<Arc<Database>>) -> Json<Vec<Todo>> {
    println!("Getting all todos");
    Json(
        sqlx::query_as::<_, Todo>("SELECT description, done FROM todos")
            .fetch_all(&db.pool)
            .await
            .unwrap(),
    )
}

pub async fn set_done(Path(id): Path<i64>, Extension(db): Extension<Arc<Database>>) {
    println!("Setting todo: {id} to done");
    sqlx::query("UPDATE todos SET done = TRUE WHERE id = ?")
        .bind(id)
        .execute(&db.pool)
        .await
        .unwrap();
}
