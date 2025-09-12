use std::env;

use axum::{
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json, RequestPartsExt,
};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use chrono::Utc;
use cookie::{time::Duration, SameSite};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use once_cell::sync::Lazy;
use rand::distr::{Alphanumeric, SampleString};
use serde::{Deserialize, Serialize};
use serde_json::json;

static KEYS: Lazy<Keys> = Lazy::new(|| {
    let secret = Alphanumeric.sample_string(&mut rand::rng(), 60);
    Keys::new(secret.as_bytes())
});

struct Keys {
    encoding: EncodingKey,
    decoding: DecodingKey,
}

impl Keys {
    fn new(secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(secret),
            decoding: DecodingKey::from_secret(secret),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct AuthPayload {
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    client_id: String,
    exp: usize,
}

impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
{
    type Rejection = AuthError;

    async fn from_request_parts(parts: &mut Parts, _: &S) -> Result<Self, Self::Rejection> {
        let jar = parts
            .extract::<CookieJar>()
            .await
            .map_err(|_| AuthError::InvalidToken)?;
        let cookie = jar.get("accessToken").ok_or(AuthError::InvalidToken)?;
        let token_data = decode::<Claims>(cookie.value(), &KEYS.decoding, &Validation::default())
            .map_err(|_| AuthError::InvalidToken)?;
        let current = Utc::now().naive_utc().and_utc().timestamp() as usize;
        if current > token_data.claims.exp {
            return Err(AuthError::InvalidToken);
        }

        Ok(token_data.claims)
    }
}

pub async fn login(
    jar: CookieJar,
    Json(payload): Json<AuthPayload>,
) -> Result<impl IntoResponse, AuthError> {
    tracing::info!("Request to login endpoint");
    if payload.client_id.is_empty() || payload.client_secret.is_empty() {
        return Err(AuthError::MissingCredentials);
    }

    if payload.client_id
        != env::var("CLIENT_ID").expect("An environment variable: 'CLIENT_ID' needs to be set")
        || payload.client_secret
            != env::var("CLIENT_SECRET")
                .expect("An environment variable: 'CLIENT_SECRET' needs to be set")
    {
        return Err(AuthError::WrongCredentials);
    }

    let claims = Claims {
        client_id: payload.client_id,
        exp: (Utc::now().naive_utc() + chrono::Duration::hours(1))
            .and_utc()
            .timestamp() as usize,
    };
    let token = encode(&Header::default(), &claims, &KEYS.encoding)
        .map_err(|_| AuthError::TokenCreation)?;
    let cookie = Cookie::build(("accessToken", token))
        .http_only(true)
        .max_age(Duration::hours(1))
        //.secure(true) // Only over HTTPS
        .same_site(SameSite::Strict)
        .path("/") // Send for all paths
        .build();

    Ok((jar.add(cookie), Json(claims)))
}

pub async fn get_session(claims: Claims) -> Json<Claims> {
    tracing::info!("User: {} expires: {}", claims.client_id, claims.exp);
    Json(claims)
}

pub async fn logout(jar: CookieJar, claims: Claims) -> impl IntoResponse {
    tracing::info!("User: {} logged out", claims.client_id);
    let removal = Cookie::build(("accessToken", ""))
        .path("/")
        .http_only(true)
        .max_age(Duration::seconds(0))
        .build();

    jar.remove(removal)
}

pub enum AuthError {
    InvalidToken,
    WrongCredentials,
    TokenCreation,
    MissingCredentials,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AuthError::WrongCredentials => (StatusCode::UNAUTHORIZED, "Wrong credentials"),
            AuthError::MissingCredentials => (StatusCode::BAD_REQUEST, "Missing credentials"),
            AuthError::TokenCreation => (StatusCode::INTERNAL_SERVER_ERROR, "Token creation error"),
            AuthError::InvalidToken => (StatusCode::BAD_REQUEST, "Invalid token"),
        };
        tracing::warn!("{} {}", status, error_message);
        let body = Json(json!({
            "error": error_message,
        }));
        (status, body).into_response()
    }
}
