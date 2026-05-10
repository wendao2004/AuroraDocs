use tauri::{command, generate_handler};
use serde::{Deserialize, Serialize};

// 通用响应体（和前端TS对齐）
#[derive(Serialize, Deserialize)]
pub struct BaseResponse<T> {
    pub code: i32,
    pub msg: String,
    pub data: T,
}

// Tauri 通信命令
#[command]
fn greet(name: &str) -> BaseResponse<String> {
    BaseResponse {
        code: 0,
        msg: "success".to_string(),
        data: format!("Hello, {}! 来自Rust", name),
    }
}

// Rust 程序入口（必须有！）
fn main() {
    tauri::Builder::default()
        .invoke_handler(generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("启动失败");
}