FROM messense/rust-musl-cross:x86_64-musl AS builder

ENV SQLX_OFFLINE=true
WORKDIR /app

COPY . .

RUN cargo build --release --target x86_64-unknown-linux-musl

FROM scratch
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/appendable_proto /appendable_proto

ENTRYPOINT ["/appendable_proto"]
EXPOSE 3000
