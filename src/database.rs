use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};

use crate::errors::AppError;

pub struct Database {
    pub pool: SqlitePool,
}

impl Database {
    pub async fn new() -> Result<Database, AppError> {
        let database_url = dotenvy::var("DATABASE_URL")
            .expect("An environment variable DATABASE_URL needs to be set");
        tracing::info!("Database url: {}", database_url);
        let pool = SqlitePoolOptions::new().connect(&database_url).await?;
        sqlx::migrate!().run(&pool).await?;
        Ok(Self { pool })
    }
}
