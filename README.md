# Prompt Copilot

轻量级本地 Prompt 管理工具，帮助 AI 用户高效管理和复用 Prompt。

## 特性

- 全局快捷键（Ctrl+Shift+P）
- 智能搜索和标签过滤
- 本地存储，保护隐私
- 极速响应，键盘优先

## 开发

```bash
# 安装依赖
bun install

# 开发模式
bun run tauri dev

# 构建应用
bun run tauri build
```

## 使用

1. `Ctrl+Shift+P` 唤出应用
2. 输入关键词搜索 Prompt
3. `Enter` 选择并使用
4. `Esc` 隐藏窗口

## 技术栈

- 前端: React + TypeScript + Vite
- 后端: Rust + Tauri
- 数据库: SQLite
