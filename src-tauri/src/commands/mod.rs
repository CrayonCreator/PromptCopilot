use tauri::State;
use crate::database::{Database, models::{Prompt, PromptInput}};
use clipboard::{ClipboardProvider, ClipboardContext};

#[cfg(target_os = "windows")]
use winreg::{RegKey, enums::*};

#[cfg(target_os = "windows")]
const AUTOSTART_KEY: &str = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run";
#[cfg(target_os = "windows")]
const APP_NAME: &str = "PromptCopilot";

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

#[tauri::command]
pub fn reorder_prompts(prompt_ids: Vec<i64>, db: State<Database>) -> Result<(), String> {
    db.reorder_prompts(&prompt_ids).map_err(|e| e.to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn get_autostart_status() -> Result<bool, String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let run_key = hkcu
        .open_subkey(AUTOSTART_KEY)
        .map_err(|e| format!("Failed to open registry key: {}", e))?;
    
    match run_key.get_value::<String, _>(APP_NAME) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
pub fn get_autostart_status() -> Result<bool, String> {
    // macOS 和 Linux 的实现可以在这里添加
    Ok(false)
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn set_autostart(enable: bool) -> Result<(), String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let run_key = hkcu
        .open_subkey_with_flags(AUTOSTART_KEY, KEY_SET_VALUE)
        .map_err(|e| format!("Failed to open registry key: {}", e))?;
    
    if enable {
        // 获取当前执行文件路径
        let exe_path = std::env::current_exe()
            .map_err(|e| format!("Failed to get executable path: {}", e))?;
        let exe_path_str = exe_path
            .to_str()
            .ok_or("Failed to convert path to string")?;
        
        run_key
            .set_value(APP_NAME, &exe_path_str)
            .map_err(|e| format!("Failed to set registry value: {}", e))?;
    } else {
        run_key
            .delete_value(APP_NAME)
            .map_err(|e| format!("Failed to delete registry value: {}", e))?;
    }
    
    Ok(())
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
pub fn set_autostart(_enable: bool) -> Result<(), String> {
    // macOS 和 Linux 的实现可以在这里添加
    Err("Autostart is not implemented for this platform".to_string())
}
