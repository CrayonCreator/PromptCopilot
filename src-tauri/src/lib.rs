mod database;
mod commands;

use database::Database;
use commands::*;
use tauri::{Manager, menu::{MenuBuilder, MenuItem}};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
            
            let db_path = app_dir.join("prompts.db");
            let database = Database::new(db_path).expect("Failed to initialize database");
            
            app.manage(database);

            let window = app.get_webview_window("main").unwrap();
            let window_clone = window.clone();

            // 创建系统托盘菜单
            let show_item = MenuItem::with_id(app, "show", "显示", true, None::<&str>)?;
            let hide_item = MenuItem::with_id(app, "hide", "隐藏", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = MenuBuilder::new(app)
                .items(&[&show_item, &hide_item, &quit_item])
                .build()?;

            // 获取系统托盘并设置菜单和事件处理
            if let Some(tray) = app.tray_by_id("main") {
                tray.set_menu(Some(menu))?;
                
                // 设置托盘图标点击事件
                let window_for_tray = window.clone();
                tray.on_tray_icon_event(move |_tray, event| {
                    if let tauri::tray::TrayIconEvent::Click { button: tauri::tray::MouseButton::Left, .. } = event {
                        if window_for_tray.is_visible().unwrap_or(false) {
                            let _ = window_for_tray.hide();
                        } else {
                            let _ = window_for_tray.show();
                            let _ = window_for_tray.set_focus();
                        }
                    }
                });
                
                // 设置菜单点击事件
                tray.on_menu_event(move |app, event| {
                    match event.id().as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "hide" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.hide();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                });
            }

            // 注册全局快捷键插件
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};
                
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_shortcuts(["ctrl+shift+p"])?
                        .with_handler(move |_app, shortcut, event| {
                            if event.state == ShortcutState::Pressed {
                                if shortcut.matches(Modifiers::CONTROL | Modifiers::SHIFT, Code::KeyP) {
                                    if window_clone.is_visible().unwrap_or(false) {
                                        let _ = window_clone.hide();
                                    } else {
                                        let _ = window_clone.show();
                                        let _ = window_clone.set_focus();
                                    }
                                }
                            }
                        })
                        .build(),
                )?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_prompts,
            search_prompts,
            save_prompt,
            update_prompt,
            delete_prompt,
            update_last_used,
            paste_to_clipboard,
            reorder_prompts
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
