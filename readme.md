# Back-end for the track application

requires a sqlite database, to create a new one run the following command:

```bash
sqlite3 appendable.db "VACUUM;"
```

Then enable WAL mode by executing:
```bash
sqlite3 appendable.db "PRAGMA journal_mode=WAL;"
```

Then create wal files, this avoids a problem where docker compose does not find the files and mounts volumes instead, breaking the database:
```bash
touch appendable.db-shm appendable.db-wal
```

then start the service with:
```bash
docker compose up -d
```
