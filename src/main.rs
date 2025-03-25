use axum::{
    extract::{Extension, Path},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, put},
    Json, Router,
};

use anyhow::Error;
use std::sync::Arc;

use track_proto::models::Entry;

use track_proto::database::{add_todo, select_entry, set_done, todos, Database};

#[tokio::main]
async fn main() {
    println!("Started track server on http://localhost:3000");

    let state = Arc::new(Database::new().await.unwrap());

    let app = Router::new()
        .route("/api/entries/{id}", get(get_entry))
        .route("/api/todos", get(todos).post(add_todo))
        .route("/api/todos/{id}", put(set_done))
        .fallback(handler_404)
        .layer(Extension(state));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_entry(
    Path(entry_id): Path<i64>,
    Extension(db): Extension<Arc<Database>>,
) -> Result<Json<Entry>, NotFountError> {
    Ok(Json(select_entry(&db, entry_id).await?))
}

// Error handling
struct NotFountError(Error);

impl IntoResponse for NotFountError {
    fn into_response(self) -> Response {
        (StatusCode::NOT_FOUND, format!("Not found: {}", self.0)).into_response()
    }
}

// convert anyhow error into NotFoundError for fucntions that return `Result<_, Error>`
impl<E> From<E> for NotFountError
where
    E: Into<Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

async fn handler_404() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "nothing to see here")
}
