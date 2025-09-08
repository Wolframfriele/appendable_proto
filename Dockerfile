ARG BUILD_SOURCE_CONTAINER="x86_64-musl"
ARG BUILD_TARGET="x86_64-unknown-linux-musl"


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
# Stage 2: Build the back-end
# ========================================================================
FROM messense/rust-musl-cross:${BUILD_SOURCE_CONTAINER} AS builder
ARG BUILD_TARGET

ENV SQLX_OFFLINE=true
WORKDIR /app

COPY . .
COPY --from=front_end_builder /app/dist/appendable_fe/browser front_end/dist/appendable_fe/browser

RUN cargo build --release --target ${BUILD_TARGET}

# ========================================================================
# Stage 3: Copy over to empty and start application
# ========================================================================
FROM scratch
ARG BUILD_TARGET

COPY --from=builder /app/target/${BUILD_TARGET}/release/appendable_proto /appendable_proto

ENTRYPOINT ["/appendable_proto"]
EXPOSE 3000
