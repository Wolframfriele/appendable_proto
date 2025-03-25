use axum::{
    extract::{Extension, Path},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, put},
    Json, Router,
};

use anyhow::Result;
use std::sync::Arc;

use track_be_proto_1::models::Entry;

use track_be_proto_1::database::{add_todo, select_entry, set_done, todos, Database};

#[tokio::main]
async fn main() -> Result<()> {
    println!("Started track server on http://localhost:3000");

    let state = Arc::new(Database::new().await?);

    let app = Router::new()
        .route("/api/entries/{id}", get(get_entry))
        .route("/api/todos", get(todos).post(add_todo))
        .route("/api/todos/{id}", put(set_done))
        .fallback(handler_404)
        .layer(Extension(state));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

async fn handler_404() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "nothing to see here")
}

async fn get_entry(
    Path(entry_id): Path<i64>,
    Extension(db): Extension<Arc<Database>>,
) -> impl IntoResponse {
    let result = select_entry(&db, entry_id).await;
    match result {
        Ok(result) => (StatusCode::OK, Json(result)).into_response(),
        Err(err) => {
            println!("Error getting the entry for {entry_id}, with error {err}");
            (StatusCode::NOT_FOUND, "Entry not found").into_response()
        }
    }
}
