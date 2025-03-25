use crate::models::{Entry, Todo};
use anyhow::Result;
use axum::extract::{Extension, Path};
use axum::Json;
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
