pub mod models;

use rusqlite::{Connection, Result, params};
use chrono::Utc;
use std::path::Path;
use std::sync::Mutex;
use crate::database::models::{Prompt, PromptInput};

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new<P: AsRef<Path>>(db_path: P) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let db = Database { conn: Mutex::new(conn) };
        db.create_tables()?;
        Ok(db)
    }

    fn create_tables(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS prompts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                last_used TEXT,
                sort_order INTEGER DEFAULT 0
            )",
            [],
        )?;
        
        let table_info: Vec<String> = conn.prepare("PRAGMA table_info(prompts)")?
            .query_map([], |row| Ok(row.get::<_, String>(1)?))?
            .collect::<Result<Vec<_>, _>>()?;
        
        if !table_info.contains(&"sort_order".to_string()) {
            conn.execute("ALTER TABLE prompts ADD COLUMN sort_order INTEGER DEFAULT 0", [])?;
        }
        
        Ok(())
    }

    pub fn get_all_prompts(&self) -> Result<Vec<Prompt>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, content, tags, created_at, updated_at, last_used, sort_order 
             FROM prompts ORDER BY sort_order ASC, last_used DESC, created_at DESC"
        )?;

        let prompt_iter = stmt.query_map([], |row| {
            let tags_str: String = row.get(3)?;
            let tags: Vec<String> = if tags_str.is_empty() {
                Vec::new()
            } else {
                tags_str.split_whitespace().map(|s| s.to_string()).collect()
            };

            let created_at_str: String = row.get(4)?;
            let updated_at_str: String = row.get(5)?;
            let last_used_str: Option<String> = row.get(6)?;

            Ok(Prompt {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                tags,
                created_at: created_at_str.parse().map_err(|_| rusqlite::Error::InvalidColumnType(4, "created_at".to_string(), rusqlite::types::Type::Text))?,
                updated_at: updated_at_str.parse().map_err(|_| rusqlite::Error::InvalidColumnType(5, "updated_at".to_string(), rusqlite::types::Type::Text))?,
                last_used: last_used_str.map(|s| s.parse()).transpose().map_err(|_| rusqlite::Error::InvalidColumnType(6, "last_used".to_string(), rusqlite::types::Type::Text))?,
                sort_order: row.get(7).ok(),
            })
        })?;

        let mut prompts = Vec::new();
        for prompt in prompt_iter {
            prompts.push(prompt?);
        }
        Ok(prompts)
    }

    pub fn search_prompts(&self, query: &str) -> Result<Vec<Prompt>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, content, tags, created_at, updated_at, last_used, sort_order 
             FROM prompts 
             WHERE title LIKE ?1 OR content LIKE ?1 OR tags LIKE ?1
             ORDER BY sort_order ASC, last_used DESC, created_at DESC"
        )?;

        let search_term = format!("%{}%", query);
        let prompt_iter = stmt.query_map(params![search_term], |row| {
            let tags_str: String = row.get(3)?;
            let tags: Vec<String> = if tags_str.is_empty() {
                Vec::new()
            } else {
                tags_str.split_whitespace().map(|s| s.to_string()).collect()
            };

            let created_at_str: String = row.get(4)?;
            let updated_at_str: String = row.get(5)?;
            let last_used_str: Option<String> = row.get(6)?;

            Ok(Prompt {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                tags,
                created_at: created_at_str.parse().map_err(|_| rusqlite::Error::InvalidColumnType(4, "created_at".to_string(), rusqlite::types::Type::Text))?,
                updated_at: updated_at_str.parse().map_err(|_| rusqlite::Error::InvalidColumnType(5, "updated_at".to_string(), rusqlite::types::Type::Text))?,
                last_used: last_used_str.map(|s| s.parse()).transpose().map_err(|_| rusqlite::Error::InvalidColumnType(6, "last_used".to_string(), rusqlite::types::Type::Text))?,
                sort_order: row.get(7).ok(),
            })
        })?;

        let mut prompts = Vec::new();
        for prompt in prompt_iter {
            prompts.push(prompt?);
        }
        Ok(prompts)
    }

    pub fn save_prompt(&self, prompt_input: &PromptInput) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO prompts (title, content, tags, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                prompt_input.title,
                prompt_input.content,
                prompt_input.tags,
                now,
                now
            ],
        )?;
        Ok(())
    }

    pub fn update_prompt(&self, id: i64, prompt_input: &PromptInput) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = Utc::now().to_rfc3339();
        conn.execute(
            "UPDATE prompts SET title = ?1, content = ?2, tags = ?3, updated_at = ?4 WHERE id = ?5",
            params![
                prompt_input.title,
                prompt_input.content,
                prompt_input.tags,
                now,
                id
            ],
        )?;
        Ok(())
    }

    pub fn delete_prompt(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM prompts WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn update_last_used(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = Utc::now().to_rfc3339();
        conn.execute(
            "UPDATE prompts SET last_used = ?1 WHERE id = ?2",
            params![now, id],
        )?;
        Ok(())
    }

    pub fn reorder_prompts(&self, prompt_ids: &[i64]) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let tx = conn.unchecked_transaction()?;
        
        for (index, &prompt_id) in prompt_ids.iter().enumerate() {
            tx.execute(
                "UPDATE prompts SET sort_order = ?1 WHERE id = ?2",
                params![index as i64, prompt_id],
            )?;
        }
        
        tx.commit()?;
        Ok(())
    }
}
