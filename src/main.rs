use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, put},
    Json, Router,
};

use anyhow::Error;
use chrono::{Local, NaiveDate};
use serde::Deserialize;
use std::sync::Arc;

use track_proto::{
    database::select_entries,
    models::{Entry, EntryAndTags},
};

use track_proto::database::{delete_entry, select_entry, update_entry, Database};

#[tokio::main]
async fn main() {
    println!("Started track server on http://localhost:3000");

    let state = Arc::new(Database::new().await.unwrap());

    let app = Router::new()
        .route("/api/entries", get(get_entries))
        .route("/api/entries/{entry_id}", get(get_entry).put(put_entry))
        .fallback(handler_404)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_entry(
    Path(entry_id): Path<i64>,
    db: State<Arc<Database>>,
) -> Result<Json<Entry>, NotFountError> {
    Ok(Json(select_entry(&db, entry_id).await?))
}

#[derive(Deserialize)]
struct GetEntriesParams {
    date: Option<NaiveDate>,
}

async fn get_entries(
    params: Query<GetEntriesParams>,
    db: State<Arc<Database>>,
) -> Result<Json<Vec<EntryAndTags>>, NotFountError> {
    Ok(Json(
        select_entries(&db, params.date.unwrap_or(Local::now().date_naive())).await,
    ))
}

async fn put_entry(
    Path(entry_id): Path<i64>,
    db: State<Arc<Database>>,
    axum::extract::Json(payload): axum::extract::Json<Entry>,
) -> impl IntoResponse {
    if entry_id != payload.entry_id {
        let error = "The entry_id in the URL does not match the entry_id in the request body";
        println!("{error}");
        return (StatusCode::BAD_REQUEST, error);
    }
    update_entry(&db, payload).await;
    (StatusCode::ACCEPTED, "Entry updated")
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
