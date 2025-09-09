use anyhow::{anyhow, Error};
use axum::{
    extract::{MatchedPath, Path, Query, State},
    http::{Request, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, get_service, post, put},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::Deserialize;
use std::sync::Arc;
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};
use tracing::info_span;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use appendable_proto::{
    auth::{get_session, login, logout, Claims},
    database::{
        delete_blocks, insert_new_block, insert_new_project, select_blocks, select_entries,
        select_projects, update_block,
    },
    models::{Block, Entry, NextDataResponse, Project},
};

use appendable_proto::database::{
    delete_entry, insert_new_entry, select_earlier_timestamp, update_entry, Database,
};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!(
                    "{}=info,tower_http=info,axum::rejection=trace",
                    env!("CARGO_CRATE_NAME")
                )
                .into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = Arc::new(Database::new().await.unwrap());

    let app = Router::new()
        .route("/api/login", post(login))
        .route("/api/session", get(get_session))
        .route("/api/logout", get(logout))
        .route("/api/blocks", get(get_blocks).post(post_block))
        .route(
            "/api/blocks/{block_id}",
            put(put_block).delete(delete_block_api),
        )
        .route("/api/entries", get(get_entries).post(post_entry))
        .route(
            "/api/entries/{entry_id}",
            put(put_entry).delete(delete_entry_api),
        )
        .route("/api/projects", get(get_projects))
        .route("/api/projects/{project_id}", post(post_projects))
        .route(
            "/api/earlier_blocks/{last_data}",
            get(get_first_block_timestamp_before),
        )
        .layer(
            TraceLayer::new_for_http().make_span_with(|request: &Request<_>| {
                let matched_path = request
                    .extensions()
                    .get::<MatchedPath>()
                    .map(MatchedPath::as_str);

                info_span!(
                    "http_request",
                    method = ?request.method(),
                    matched_path,
                )
            }),
        )
        .with_state(state)
        .fallback_service(get_service(
            ServeDir::new("front_end/dist/appendable_fe/browser")
                .append_index_html_on_directories(false)
                .fallback(ServeFile::new(
                    "front_end/dist/appendable_fe/browser/index.html",
                )),
        ));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("server listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

#[derive(Deserialize)]
struct RangeParams {
    start: Option<DateTime<Utc>>,
    end: Option<DateTime<Utc>>,
}

async fn get_blocks(
    _: Claims,
    params: Query<RangeParams>,
    db: State<Arc<Database>>,
) -> Result<Json<Vec<Block>>, NotFoundError> {
    println!(
        "Getting blocks between: {:?} and {:?}",
        params.start, params.end
    );
    Ok(Json(
        select_blocks(
            &db,
            params.start.unwrap_or(day_start()).naive_utc(),
            params.end.unwrap_or(day_end()).naive_utc(),
        )
        .await,
    ))
}

async fn delete_block_api(
    _: Claims,
    Path(block_id): Path<i64>,
    db: State<Arc<Database>>,
) -> impl IntoResponse {
    println!("Delete block: {}", block_id);
    if delete_blocks(&db, block_id).await {
        (StatusCode::NO_CONTENT, "Block deleted")
    } else {
        (StatusCode::CONFLICT, "The block could not be deleted")
    }
}

async fn post_block(
    _: Claims,
    db: State<Arc<Database>>,
    axum::extract::Json(payload): axum::extract::Json<Block>,
) -> Result<Json<Block>, BadRequestError> {
    Ok(Json(insert_new_block(&db, payload).await?))
}

async fn put_block(
    _: Claims,
    Path(block_id): Path<i64>,
    db: State<Arc<Database>>,
    axum::extract::Json(payload): axum::extract::Json<Block>,
) -> Result<Json<Block>, BadRequestError> {
    if block_id != payload.block_id {
        BadRequestError(anyhow!(
            "The entry_id in the URL does not match the entry_id in the request body"
        ));
    }
    println!("Put block: {:?}", block_id);
    Ok(Json(update_block(&db, payload).await?))
}

async fn get_entries(
    _: Claims,
    params: Query<RangeParams>,
    db: State<Arc<Database>>,
) -> Result<Json<Vec<Entry>>, NotFoundError> {
    println!(
        "Getting entries between: {:?} and {:?}",
        params.start, params.end
    );
    Ok(Json(
        select_entries(
            &db,
            params.start.unwrap_or(day_start()).naive_utc(),
            params.end.unwrap_or(day_end()).naive_utc(),
        )
        .await,
    ))
}

async fn post_entry(
    _: Claims,
    db: State<Arc<Database>>,
    axum::extract::Json(payload): axum::extract::Json<Entry>,
) -> Result<Json<Entry>, BadRequestError> {
    Ok(Json(insert_new_entry(&db, payload).await?))
}

async fn put_entry(
    _: Claims,
    Path(entry_id): Path<i64>,
    db: State<Arc<Database>>,
    axum::extract::Json(payload): axum::extract::Json<Entry>,
) -> Result<Json<Entry>, BadRequestError> {
    if entry_id != payload.entry_id {
        BadRequestError(anyhow!(
            "The entry_id in the URL does not match the entry_id in the request body"
        ));
    }
    println!("Put entry: {:?}", entry_id);
    Ok(Json(update_entry(&db, payload).await?))
}

#[derive(Deserialize)]
struct DeleteEntriesParams {
    with_children: Option<bool>,
}

async fn delete_entry_api(
    _: Claims,
    Path(entry_id): Path<i64>,
    params: Query<DeleteEntriesParams>,
    db: State<Arc<Database>>,
) -> impl IntoResponse {
    println!(
        "Delete entry: {} with_children: {:?}",
        entry_id, params.with_children
    );
    if delete_entry(&db, entry_id, params.with_children.unwrap_or(false)).await {
        (StatusCode::NO_CONTENT, "Entry deleted")
    } else {
        (StatusCode::CONFLICT, "The entry could not be deleted")
    }
}

async fn get_first_block_timestamp_before(
    _: Claims,
    Path(last_data): Path<DateTime<Utc>>,
    db: State<Arc<Database>>,
) -> Result<Json<NextDataResponse>, BadRequestError> {
    println!("Get next entry before: {last_data}");
    Ok(Json(
        select_earlier_timestamp(&db, &last_data.naive_utc()).await?,
    ))
}

async fn get_projects(
    _: Claims,
    db: State<Arc<Database>>,
) -> Result<Json<Vec<Project>>, BadRequestError> {
    println!("Get projects");
    Ok(Json(select_projects(&db).await?))
}

async fn post_projects(
    _: Claims,
    db: State<Arc<Database>>,
    axum::extract::Json(payload): axum::extract::Json<Project>,
) -> Result<Json<Project>, BadRequestError> {
    println!("Post new project: {:?}", payload);
    Ok(Json(insert_new_project(&db, payload).await?))
}

// Error handling
struct NotFoundError(Error);

impl IntoResponse for NotFoundError {
    fn into_response(self) -> Response {
        (StatusCode::NOT_FOUND, format!("Not found: {}", self.0)).into_response()
    }
}

// convert anyhow error into NotFoundError for fucntions that return `Result<_, Error>`
impl<E> From<E> for NotFoundError
where
    E: Into<Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

struct BadRequestError(Error);

impl IntoResponse for BadRequestError {
    fn into_response(self) -> Response {
        (StatusCode::BAD_REQUEST, format!("Bad request: {}", self.0)).into_response()
    }
}

// convert anyhow error into NotFoundError for fucntions that return `Result<_, Error>`
impl<E> From<E> for BadRequestError
where
    E: Into<Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
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
