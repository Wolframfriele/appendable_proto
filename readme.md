# Back-end for the track application

requires a sqlite database, to create a new one run the following command:

```bash
sqlite3 appendable.db "VACUUM;"
```

Then enable WAL mode by executing:
```bash
sqlite3 appendable.db "PRAGMA journal_mode=WAL;"
```
