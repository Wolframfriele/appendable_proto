# ARG BUILD_SOURCE_CONTAINER="x86_64-musl"
# ARG BUILD_TARGET="x86_64-unknown-linux-musl"

# ========================================================================
# Stage 1: Build the front-end
# ========================================================================
FROM node:24-alpine AS front_end_builder
WORKDIR /app

COPY /front_end/package.json /front_end/package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY front_end ./

RUN npm run build

# ========================================================================
# Stage 2: Setup cargo-chef
# ========================================================================
FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
RUN cargo install sccache
ENV RUSTC_WRAPPER=sccache SCCACHE_DIR=/sccache
WORKDIR /app

# ========================================================================
# Stage 3: Prepare recipe
# ========================================================================
FROM chef AS planner
COPY . .
RUN --mount=type=cache,target=$SCCACHE_DIR,sharing=locked \
    cargo chef prepare --recipe-path recipe.json

# ========================================================================
# Stage 4: Build the back-end
# ========================================================================
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN --mount=type=cache,target=$SCCACHE_DIR,sharing=locked \
    cargo chef cook --release --recipe-path recipe.json
# Build application
COPY . .
COPY --from=front_end_builder /app/dist/appendable_fe/browser /front_end/dist/appendable_fe/browser
RUN --mount=type=cache,target=$SCCACHE_DIR,sharing=locked \
    cargo build --release --bin appendable_proto

# ========================================================================
# Stage 5: Runable container
# ========================================================================
FROM debian:bookworm-slim AS runtime
COPY --from=builder /app/target/release/appendable_proto /appendable_proto
COPY --from=front_end_builder /app/dist/appendable_fe/browser /front_end/dist/appendable_fe/browser
ENTRYPOINT ["/appendable_proto"]
EXPOSE 3000

# ========================================================================
# Stage 2: Build the back-end
# ========================================================================
# FROM messense/rust-musl-cross:${BUILD_SOURCE_CONTAINER} AS builder
# ARG BUILD_TARGET

# ENV SQLX_OFFLINE=true
# WORKDIR /app

# COPY . .
# COPY --from=front_end_builder /app/dist/appendable_fe/browser front_end/dist/appendable_fe/browser

# RUN cargo build --release --target ${BUILD_TARGET}

# ========================================================================
# Stage 3: Copy over to empty and start application
# ========================================================================
# FROM scratch
# ARG BUILD_TARGET

# COPY --from=front_end_builder /app/dist/appendable_fe/browser /front_end/dist/appendable_fe/browser
# COPY --from=builder /app/target/${BUILD_TARGET}/release/appendable_proto /appendable_proto

# ENTRYPOINT ["/appendable_proto"]
# EXPOSE 3000
