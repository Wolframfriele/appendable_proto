use crate::models::{Block, Entry, NextDataResponse, Project, ResultBlock, ResultEntry};
use anyhow::Result;
use chrono::NaiveDateTime;
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new() -> Result<Database> {
        let pool = SqlitePoolOptions::new()
            .connect("sqlite://entries.db")
            .await?;
        Ok(Self { pool })
    }
}

pub async fn insert_new_block(db: &Database, block: Block) -> Result<Block> {
    update_end_timestamps_of_unclosed_blocks(db, &block).await?;
    let new_block_id = insert_block(db, block).await?;
    Ok(select_block(db, new_block_id).await?)
}

async fn update_end_timestamps_of_unclosed_blocks(db: &Database, block: &Block) -> Result<()> {
    println!("updating time of old entries");
    // First
    sqlx::query(
        "
    UPDATE blocks
    SET
        end = DATETIME(?1),
        duration = STRFTIME('%s', DATETIME(?1)) - STRFTIME('%s', blocks.start)
    WHERE end IS NULL;
       ",
    )
    .bind(block.start)
    .execute(&db.pool)
    .await?;

    Ok(())
}

async fn insert_block(db: &Database, block: Block) -> Result<i64> {
    println!("inserting new block");
    let new_block_id = sqlx::query_as::<_, ResultBlock>(
        "
        INSERT INTO blocks (
            text,
            project,
            start,
            duration
        ) VALUES (
            ?1,
            ?2,
            DATETIME(?3),
            0
        ) RETURNING block_id;
            ",
    )
    .bind(block.text)
    .bind(block.project)
    .bind(block.start)
    .fetch_one(&db.pool)
    .await?;
    Ok(new_block_id.block_id)
}

pub async fn select_block(db: &Database, block_id: i64) -> Result<Block> {
    println!("getting the newly inserted block");
    Ok(sqlx::query_as::<_, Block>(
        "
    SELECT
        blocks.block_id,
       	blocks.text,
       	blocks.project,
       	projects.name AS project_name,
       	blocks.start,
       	blocks.end,
       	blocks.duration,
        COALESCE(GROUP_CONCAT(DISTINCT tags.name), '') AS tags
    FROM blocks

    LEFT OUTER JOIN projects ON blocks.project = projects.project_id
    LEFT JOIN tagged_blocks ON blocks.block_id = tagged_blocks.block_fk
    LEFT JOIN tags ON tagged_blocks.tag_fk = tags.tag_id
    WHERE blocks.block_id = ?1
    GROUP BY blocks.block_id;
        ",
    )
    .bind(block_id)
    .fetch_one(&db.pool)
    .await?)
}

pub async fn select_blocks(db: &Database, start: NaiveDateTime, end: NaiveDateTime) -> Vec<Block> {
    sqlx::query_as::<_, Block>(
        "
    SELECT
    	blocks.block_id,
    	blocks.text,
    	blocks.project,
    	projects.name AS project_name,
    	blocks.start,
    	blocks.end,
    	blocks.duration,
    	COALESCE(GROUP_CONCAT(DISTINCT tags.name), '') AS tags
    FROM blocks

    LEFT OUTER JOIN projects ON blocks.project = projects.project_id
    LEFT JOIN tagged_blocks ON blocks.block_id = tagged_blocks.block_fk
    LEFT JOIN tags ON tagged_blocks.tag_fk = tags.tag_id

    WHERE blocks.start > DATETIME(?1) AND blocks.start < DATETIME(?2)
    GROUP BY blocks.block_id
    ORDER BY blocks.start;
        ",
    )
    .bind(start)
    .bind(end)
    .fetch_all(&db.pool)
    .await
    .unwrap()
}

pub async fn delete_blocks(db: &Database, block_id: i64) -> bool {
    sqlx::query(
        "
    DELETE FROM blocks WHERE block_id = ?1;
        ",
    )
    .bind(block_id)
    .execute(&db.pool)
    .await
    .is_ok()
}

pub async fn insert_new_entry(db: &Database, entry: Entry) -> Result<Entry> {
    let new_entry_id = insert_entry(db, &entry).await?;
    Ok(select_entry(db, new_entry_id).await?)
}

pub async fn select_entry(db: &Database, entry_id: i64) -> Result<Entry> {
    Ok(sqlx::query_as::<_, Entry>(
        "
    SELECT
        entry_id,
        parent,
        nesting,
        text,
        show_todo,
        is_done,
    FROM entries
    WHERE entries.entry_id = ?1;
            ",
    )
    .bind(entry_id)
    .fetch_one(&db.pool)
    .await?)
}

pub async fn select_entries(db: &Database, start: NaiveDateTime, end: NaiveDateTime) -> Vec<Entry> {
    sqlx::query_as::<_, Entry>(
        "
    WITH entries_for_range AS (
        SELECT
            blocks.block_id as parent,
            entries.entry_id,
            entries.nesting,
            entries.text,
            entries.show_todo,
            entries.is_done
        FROM blocks

        LEFT JOIN entries ON entries.parent = blocks.block_id

        WHERE blocks.start > DATETIME(?1) AND blocks.start < DATETIME(?2)

        GROUP BY
            blocks.block_id,
            entries.entry_id
        ORDER BY
            blocks.block_id,
            entries.entry_id
    )
	SELECT * FROM entries_for_range
	WHERE entries_for_range.entry_id IS NOT NULL;
        ",
    )
    .bind(start)
    .bind(end)
    .fetch_all(&db.pool)
    .await
    .unwrap()
}

pub async fn update_entry(db: &Database, entry: Entry) -> Result<Entry> {
    sqlx::query(
        "
    UPDATE entries SET
        parent=?2,
        nesting=?3,
        text=?4,
        show_todo=?5,
        is_done=?6,
    WHERE entry_id=?1;
        ",
    )
    .bind(entry.entry_id)
    .bind(entry.parent)
    .bind(entry.nesting)
    .bind(entry.text)
    .bind(entry.show_todo)
    .bind(entry.is_done)
    .execute(&db.pool)
    .await?;

    select_entry(db, entry.entry_id).await
}

pub async fn delete_entry(db: &Database, entry_id: i64, with_children: bool) -> bool {
    if with_children {
        let _ = sqlx::query(
            "
    DELETE FROM entries WHERE path LIKE (
        SELECT CONCAT(path, ?1, '/', '%') FROM entries WHERE entry_id = ?1
    );
            ",
        )
        .bind(entry_id)
        .execute(&db.pool)
        .await;
    }

    sqlx::query(
        "
    DELETE FROM entries WHERE entry_id = ?1;
        ",
    )
    .bind(entry_id)
    .execute(&db.pool)
    .await
    .is_ok()
}

async fn insert_entry(db: &Database, entry: &Entry) -> Result<i64> {
    let new_entry_id = sqlx::query_as::<_, ResultEntry>(
        "
    INSERT INTO entries (
        parent,
        nesting,
        text,
        show_todo,
        is_done,
    ) VALUES (
        ?1,
        ?2,
        ?3,
        ?4,
        ?5
    ) RETURNING entry_id;
        ",
    )
    .bind(entry.parent)
    .bind(entry.nesting)
    .bind(&entry.text)
    .bind(entry.show_todo)
    .bind(entry.is_done)
    .fetch_one(&db.pool)
    .await?;
    Ok(new_entry_id.entry_id)
}

pub async fn select_earlier_timestamp(
    db: &Database,
    timestamp: &NaiveDateTime,
) -> Result<NextDataResponse> {
    let next_data = sqlx::query_as::<_, NextDataResponse>(
        "
    SELECT start AS block_timestamp FROM blocks
    WHERE start < DATETIME(?1)
    ORDER BY block_timestamp DESC LIMIT 1;
        ",
    )
    .bind(timestamp)
    .fetch_one(&db.pool)
    .await?;
    Ok(next_data)
}

pub async fn select_projects(db: &Database) -> Result<Vec<Project>> {
    Ok(sqlx::query_as::<_, Project>(
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
    .await?)
}
