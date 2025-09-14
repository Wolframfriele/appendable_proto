use axum::{extract::MatchedPath, http::Request, routing::get_service, Router};
use std::sync::Arc;
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};
use tracing::info_span;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use appendable_proto::{
    auth::auth_router, blocks::blocks_router, colors::colors_router, entries::entries_router,
    projects::projects_router,
};

use appendable_proto::database::Database;

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
        .nest("/api/blocks", blocks_router())
        .nest("/api/entries", entries_router())
        .nest("/api/projects", projects_router())
        .nest("/api/colors", colors_router())
        .with_state(state)
        .nest("/api/auth", auth_router())
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
        .fallback_service(get_service(
            ServeDir::new("/front_end/dist/appendable_fe/browser")
                .append_index_html_on_directories(false)
                .fallback(ServeFile::new(
                    "/front_end/dist/appendable_fe/browser/index.html",
                )),
        ));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("server listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
