use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, put},
    Json, Router,
};

use crate::{
    auth::Claims,
    database::Database,
    errors::AppError,
    models::{Entry, InsertResult, RangeParams},
};

pub fn entries_router() -> Router<Arc<Database>> {
    Router::new()
        .route("/", get(get_entries).post(post_entry))
        .route("/{entry_id}", put(put_entry).delete(delete_entry_api))
}

async fn get_entries(
    _: Claims,
    params: Query<RangeParams>,
    db: State<Arc<Database>>,
) -> Result<Json<Vec<Entry>>, AppError> {
    tracing::info!(
        "Getting entries between: {:?} and {:?}",
        params.get_start(),
        params.get_end()
    );
    Ok(Json(
        sqlx::query_as::<_, Entry>(
            "
        WITH entries_for_range AS (
            SELECT
                blocks.block_id as parent,
                entries.entry_id,
                entries.nesting,
                entries.text,
                entries.show_todo,
                entries.is_done
            FROM blocks

            LEFT JOIN entries ON entries.parent = blocks.block_id

            WHERE blocks.start > DATETIME(?1) AND blocks.start < DATETIME(?2)

            GROUP BY
                blocks.block_id,
                entries.entry_id
            ORDER BY
                blocks.block_id,
                entries.entry_id
        )
    	SELECT * FROM entries_for_range
    	WHERE entries_for_range.entry_id IS NOT NULL;
            ",
        )
        .bind(params.get_start())
        .bind(params.get_end())
        .fetch_all(&db.pool)
        .await?,
    ))
}

async fn post_entry(
    _: Claims,
    db: State<Arc<Database>>,
    axum::extract::Json(entry): axum::extract::Json<Entry>,
) -> Result<Json<Entry>, AppError> {
    tracing::info!("Inserting new entry");
    let new_entry_id = insert_entry(&db, &entry).await?;
    select_entry(&db, new_entry_id).await
}

async fn put_entry(
    _: Claims,
    Path(entry_id): Path<i64>,
    db: State<Arc<Database>>,
    axum::extract::Json(entry): axum::extract::Json<Entry>,
) -> Result<Json<Entry>, AppError> {
    if entry_id != entry.entry_id {
        return Err(AppError::BadRequest);
    }
    tracing::info!("Put entry: {:?}", entry_id);
    sqlx::query(
        "
    UPDATE entries SET
        parent=?2,
        nesting=?3,
        text=?4,
        show_todo=?5,
        is_done=?6
    WHERE entry_id=?1;
            ",
    )
    .bind(entry.entry_id)
    .bind(entry.parent)
    .bind(entry.nesting)
    .bind(entry.text)
    .bind(entry.show_todo)
    .bind(entry.is_done)
    .execute(&db.pool)
    .await?;

    select_entry(&db, entry.entry_id).await
}

async fn delete_entry_api(
    _: Claims,
    Path(entry_id): Path<i64>,
    db: State<Arc<Database>>,
) -> impl IntoResponse {
    tracing::info!("Delete entry: {}", entry_id);
    if sqlx::query(
        "
        DELETE FROM entries WHERE entry_id = ?1;
            ",
    )
    .bind(entry_id)
    .execute(&db.pool)
    .await
    .is_ok()
    {
        (StatusCode::NO_CONTENT, "Entry deleted")
    } else {
        (StatusCode::CONFLICT, "The entry could not be deleted")
    }
}

async fn select_entry(db: &Database, entry_id: i64) -> Result<Json<Entry>, AppError> {
    Ok(Json(
        sqlx::query_as::<_, Entry>(
            "
    SELECT
        entry_id,
        parent,
        nesting,
        text,
        show_todo,
        is_done
    FROM entries
    WHERE entries.entry_id = ?1;
        ",
        )
        .bind(entry_id)
        .fetch_one(&db.pool)
        .await?,
    ))
}

async fn insert_entry(db: &Database, entry: &Entry) -> Result<i64, AppError> {
    let new_entry_id = sqlx::query_as::<_, InsertResult>(
        "
    INSERT INTO entries (
        parent,
        nesting,
        text,
        show_todo,
        is_done
    ) VALUES (
        ?1,
        ?2,
        ?3,
        ?4,
        ?5
    ) RETURNING entry_id AS id;
        ",
    )
    .bind(entry.parent)
    .bind(entry.nesting)
    .bind(&entry.text)
    .bind(entry.show_todo)
    .bind(entry.is_done)
    .fetch_one(&db.pool)
    .await?;
    Ok(new_entry_id.id)
}
