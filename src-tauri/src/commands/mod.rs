use tauri::State;
use crate::database::{Database, models::{Prompt, PromptInput}};
use clipboard::{ClipboardProvider, ClipboardContext};

#[tauri::command]
pub fn get_all_prompts(db: State<Database>) -> Result<Vec<Prompt>, String> {
    db.get_all_prompts().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn search_prompts(query: String, db: State<Database>) -> Result<Vec<Prompt>, String> {
    db.search_prompts(&query).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_prompt(prompt: PromptInput, db: State<Database>) -> Result<(), String> {
    db.save_prompt(&prompt).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_prompt(id: i64, prompt: PromptInput, db: State<Database>) -> Result<(), String> {
    db.update_prompt(id, &prompt).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_prompt(id: i64, db: State<Database>) -> Result<(), String> {
    db.delete_prompt(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_last_used(id: i64, db: State<Database>) -> Result<(), String> {
    db.update_last_used(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn paste_to_clipboard(content: String) -> Result<String, String> {
    let mut ctx: ClipboardContext = ClipboardProvider::new()
        .map_err(|e| format!("Failed to access clipboard: {}", e))?;
    
    ctx.set_contents(content)
        .map_err(|e| format!("Failed to set clipboard content: {}", e))?;
    
    Ok("Prompt copied to clipboard!".to_string())
}
