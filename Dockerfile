ARG BUILD_SOURCE_CONTAINER="x86_64-musl"
ARG BUILD_TARGET="x86_64-unknown-linux-musl"

FROM messense/rust-musl-cross:${BUILD_SOURCE_CONTAINER} AS builder
ARG BUILD_TARGET

ENV SQLX_OFFLINE=true
WORKDIR /app

COPY . .

RUN cargo build --release --target ${BUILD_TARGET}

FROM scratch
ARG BUILD_TARGET

COPY --from=builder /app/target/${BUILD_TARGET}/release/appendable_proto /appendable_proto

ENTRYPOINT ["/appendable_proto"]
EXPOSE 3000
