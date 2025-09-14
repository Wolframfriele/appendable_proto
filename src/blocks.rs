use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, put},
    Json, Router,
};
use chrono::{DateTime, Utc};

use crate::{
    auth::Claims,
    database::Database,
    errors::AppError,
    models::{Block, InsertResult, NextDataResponse, RangeParams},
};

pub fn blocks_router() -> Router<Arc<Database>> {
    Router::new()
        .route("/", get(get_blocks).post(post_block))
        .route("/{block_id}", put(put_block).delete(delete_block_api))
        .route("/next_before/{last_data}", get(get_timestamp_next_block))
}

async fn get_blocks(
    _: Claims,
    params: Query<RangeParams>,
    db: State<Arc<Database>>,
) -> Result<Json<Vec<Block>>, AppError> {
    tracing::info!(
        "Getting blocks between: {:?} and {:?}",
        params.get_start(),
        params.get_end()
    );
    Ok(Json(
        sqlx::query_as::<_, Block>(
            "
        SELECT
        	blocks.block_id,
        	blocks.text,
        	blocks.project,
        	projects.name AS project_name,
        	blocks.start,
        	blocks.end,
        	blocks.duration,
        	COALESCE(GROUP_CONCAT(DISTINCT tags.name), '') AS tags
        FROM blocks

        LEFT OUTER JOIN projects ON blocks.project = projects.project_id
        LEFT JOIN tagged_blocks ON blocks.block_id = tagged_blocks.block_fk
        LEFT JOIN tags ON tagged_blocks.tag_fk = tags.tag_id

        WHERE blocks.start > DATETIME(?1) AND blocks.start < DATETIME(?2)
        GROUP BY blocks.block_id
        ORDER BY blocks.start;
            ",
        )
        .bind(params.get_start())
        .bind(params.get_end())
        .fetch_all(&db.pool)
        .await?,
    ))
}

async fn post_block(
    _: Claims,
    db: State<Arc<Database>>,
    axum::extract::Json(block): axum::extract::Json<Block>,
) -> Result<Json<Block>, AppError> {
    tracing::info!("Inserting new block");
    update_end_timestamps_of_unclosed_blocks(&db, &block).await?;
    let new_block_id = insert_block(&db, block).await?;
    select_block(&db, new_block_id).await
}

async fn put_block(
    _: Claims,
    Path(block_id): Path<i64>,
    db: State<Arc<Database>>,
    axum::extract::Json(block): axum::extract::Json<Block>,
) -> Result<Json<Block>, AppError> {
    if block_id != block.block_id {
        return Err(AppError::BadRequest);
    }
    tracing::info!("Put block: {:?}", block_id);
    sqlx::query(
        "
        UPDATE blocks SET
            project=?2,
            start=DATETIME(?3),
            end=DATETIME(?4),
            duration=STRFTIME('%s', DATETIME(?4)) - STRFTIME('%s', ?3),
            text=?5
        WHERE block_id=?1;
            ",
    )
    .bind(block.block_id)
    .bind(block.project)
    .bind(block.start)
    .bind(block.end)
    .bind(block.text)
    .execute(&db.pool)
    .await?;

    select_block(&db, block.block_id).await
}

async fn delete_block_api(
    _: Claims,
    Path(block_id): Path<i64>,
    db: State<Arc<Database>>,
) -> impl IntoResponse {
    tracing::info!("Delete block: {}", block_id);
    if sqlx::query(
        "
        DELETE FROM blocks WHERE block_id = ?1;
            ",
    )
    .bind(block_id)
    .execute(&db.pool)
    .await
    .is_ok()
    {
        (StatusCode::NO_CONTENT, "Block deleted")
    } else {
        (StatusCode::CONFLICT, "The block could not be deleted")
    }
}

async fn update_end_timestamps_of_unclosed_blocks(
    db: &Database,
    block: &Block,
) -> Result<(), AppError> {
    sqlx::query(
        "
    UPDATE blocks
    SET
        end = DATETIME(?1),
        duration = STRFTIME('%s', DATETIME(?1)) - STRFTIME('%s', blocks.start)
    WHERE end IS NULL;
       ",
    )
    .bind(block.start)
    .execute(&db.pool)
    .await?;
    Ok(())
}

async fn insert_block(db: &Database, block: Block) -> Result<i64, AppError> {
    let new_block_id = sqlx::query_as::<_, InsertResult>(
        "
        INSERT INTO blocks (
            text,
            project,
            start,
            duration
        ) VALUES (
            ?1,
            ?2,
            DATETIME(?3),
            0
        ) RETURNING block_id AS id;
            ",
    )
    .bind(block.text)
    .bind(block.project)
    .bind(block.start)
    .fetch_one(&db.pool)
    .await?;
    Ok(new_block_id.id)
}

async fn select_block(db: &Database, block_id: i64) -> Result<Json<Block>, AppError> {
    Ok(Json(
        sqlx::query_as::<_, Block>(
            "
    SELECT
        blocks.block_id,
       	blocks.text,
       	blocks.project,
       	projects.name AS project_name,
       	blocks.start,
       	blocks.end,
       	blocks.duration,
        COALESCE(GROUP_CONCAT(DISTINCT tags.name), '') AS tags
    FROM blocks

    LEFT OUTER JOIN projects ON blocks.project = projects.project_id
    LEFT JOIN tagged_blocks ON blocks.block_id = tagged_blocks.block_fk
    LEFT JOIN tags ON tagged_blocks.tag_fk = tags.tag_id
    WHERE blocks.block_id = ?1
    GROUP BY blocks.block_id;
        ",
        )
        .bind(block_id)
        .fetch_one(&db.pool)
        .await?,
    ))
}

async fn get_timestamp_next_block(
    _: Claims,
    Path(last_data): Path<DateTime<Utc>>,
    db: State<Arc<Database>>,
) -> Result<Json<NextDataResponse>, AppError> {
    println!("Get next entry before: {last_data}");
    let next_data = sqlx::query_as::<_, NextDataResponse>(
        "
        SELECT start AS block_timestamp FROM blocks
        WHERE start < DATETIME(?1)
        ORDER BY block_timestamp DESC LIMIT 1;
            ",
    )
    .bind(&last_data.naive_utc())
    .fetch_one(&db.pool)
    .await?;
    Ok(Json(next_data))
}
