use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use sqlx::migrate::MigrateError;

#[derive(Debug)]
pub enum AppError {
    BadRequest,
    NotFound,
    InvalidToken,
    WrongCredentials,
    InternalServer,
    MissingCredentials,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::BadRequest => (StatusCode::BAD_REQUEST, "Bad request"),
            AppError::InvalidToken => (StatusCode::BAD_REQUEST, "Invalid token"),
            AppError::MissingCredentials => (StatusCode::BAD_REQUEST, "Missing credentials"),
            AppError::WrongCredentials => (StatusCode::UNAUTHORIZED, "Wrong credentials"),
            AppError::NotFound => (StatusCode::NOT_FOUND, "Resource not found"),
            AppError::InternalServer => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error")
            }
        };
        tracing::warn!("{} {}", status, error_message);
        let body = Json(json!({
            "error": error_message,
        }));
        (status, body).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(value: sqlx::Error) -> Self {
        match value {
            sqlx::Error::RowNotFound => AppError::NotFound,
            _ => AppError::InternalServer,
        }
    }
}

impl From<anyhow::Error> for AppError {
    fn from(_: anyhow::Error) -> Self {
        AppError::InternalServer
    }
}

impl From<MigrateError> for AppError {
    fn from(_: MigrateError) -> Self {
        AppError::InternalServer
    }
}
