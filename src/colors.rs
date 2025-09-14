use std::sync::Arc;

use axum::{extract::State, routing::get, Json, Router};

use crate::{auth::Claims, database::Database, errors::AppError, models::Color};

pub fn colors_router() -> Router<Arc<Database>> {
    Router::new().route("/", get(get_colors))
}

async fn get_colors(_: Claims, db: State<Arc<Database>>) -> Result<Json<Vec<Color>>, AppError> {
    tracing::info!("Get colors");
    Ok(Json(
        sqlx::query_as::<_, Color>(
            "
    SELECT
        color_id,
        hex_value
    FROM colors
        ",
        )
        .fetch_all(&db.pool)
        .await?,
    ))
}
