fn main() {
    let cli_dist = std::path::Path::new("../../cli/dist");
    if !cli_dist.exists() {
        let _ = std::fs::create_dir_all(cli_dist);
    }
    tauri_build::build()
}
