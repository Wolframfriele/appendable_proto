use std::sync::Arc;

use anyhow::Result;
use axum::{
    extract::State,
    routing::{get, put},
    Json, Router,
};

use crate::{
    auth::Claims,
    database::Database,
    errors::AppError,
    models::{InsertResult, Project},
};

pub fn projects_router() -> Router<Arc<Database>> {
    Router::new()
        .route("/", get(get_projects).post(post_project))
        .route("/{project_id}", put(put_project))
}

async fn get_projects(_: Claims, db: State<Arc<Database>>) -> Result<Json<Vec<Project>>, AppError> {
    Ok(Json(
        sqlx::query_as::<_, Project>(
            "
        SELECT
            project_id,
            name,
            archived,
            color
        FROM projects;
            ",
        )
        .fetch_all(&db.pool)
        .await?,
    ))
}

async fn post_project(
    _: Claims,
    db: State<Arc<Database>>,
    axum::extract::Json(project): axum::extract::Json<Project>,
) -> Result<Json<Project>, AppError> {
    tracing::info!("Post new project: {:?}", project);
    let new_project_id = insert_project(&db, &project).await?;
    Ok(select_project(&db, new_project_id).await?)
}

async fn select_project(db: &Database, project_id: i64) -> Result<Json<Project>, AppError> {
    Ok(Json(
        sqlx::query_as::<_, Project>(
            "
    SELECT
        project_id,
        name,
        archived,
        color
    FROM projects WHERE project_id = ?1;
        ",
        )
        .bind(project_id)
        .fetch_one(&db.pool)
        .await?,
    ))
}

async fn insert_project(db: &Database, project: &Project) -> Result<i64> {
    let new_project_id = sqlx::query_as::<_, InsertResult>(
        "
    INSERT INTO projects (
        name,
        archived,
        color
    ) VALUES (
        ?1,
        ?2,
        ?3
    ) RETURNING project_id AS id;
        ",
    )
    .bind(&project.name)
    .bind(project.archived)
    .bind(&project.color)
    .fetch_one(&db.pool)
    .await?;
    Ok(new_project_id.id)
}

async fn put_project(
    _: Claims,
    db: State<Arc<Database>>,
    axum::extract::Json(project): axum::extract::Json<Project>,
) -> Result<Json<Project>, AppError> {
    sqlx::query(
        "
    UPDATE projects SET
        name=?2,
        archived=?3,
        color=?4
    WHERE project_id=?1;
        ",
    )
    .bind(project.project_id)
    .bind(project.name)
    .bind(project.archived)
    .bind(project.color)
    .execute(&db.pool)
    .await?;

    select_project(&db, project.project_id).await
}
