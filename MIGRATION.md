# GitHub Pages 搬遷準備（2026-11-08）
尚未建立 GitHub 儲存庫、上傳或發布。原 ChatGPT Sites 保留。

## 上傳與發布
1. 登入 imqingstone，在 GitHub 建立名為 guanyi 的 Public 儲存庫（此步驟會公開原始碼，請先確認）。
2. 解壓縮 ZIP，將內部 docs、dist 及其餘檔案上傳到儲存庫根目錄；不要只上傳 ZIP，也不要多包一層資料夾。
3. 選 Add file → Upload files，提交至 main。
4. Settings → Pages → Build and deployment → Source 選 Deploy from a branch。
5. Branch 選 main，資料夾選 /docs，按 Save。
6. 等待 Pages 部署成功，再開啟 https://imqingstone.github.io/guanyi/。
7. 以 iPhone Safari 測試並重新整理，確認收藏與查詢；部署成功前，上述網址只是預定網址。

## 保留與相依性
原程式保留在 dist；docs 是逐檔相同的發布副本，另加 .nojekyll。SHA256 清單可核對內容。
沒有改寫網站介面、內容與功能；沒有搬入 Sites 主機設定或登入憑證。
程式不需 ChatGPT、付費 API 或後端。所有圖片為本地 SVG、內嵌 SVG 或 CSS 插圖。
網站與原始碼公開後任何人可閱讀與下載；瀏覽者的本機紀錄不包含在備份內。
換網域不會自動搬移 localStorage。觀易請於舊站匯出，再於新站匯入；一念原收藏留在舊站。

## 驗證範圍
本次：發布副本與原程式雜湊一致；JavaScript 語法檢查。
觀易本次程式化測試：64 卦對照、384 爻、4096 種六爻組合、乾坤特殊用辭、10 單元、備份格式均通過。
尚未：GitHub Pages 上線測試、實體 iPhone Safari 測試。前次瀏覽器測試請見觀易 TESTS.md；不冒充本次結果。
