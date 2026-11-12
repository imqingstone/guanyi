# 觀易・六十四卦
將 dist/ 內全部檔案上傳至任一 HTTPS 靜態主機即可使用。首頁為 index.html，毋須建置、後端、API 金鑰或網站帳號。網址使用 # 分頁，不需主機設定路由。於 iPhone 以 Safari 開啟網站網址；檔案預覽器可能只顯示靜態內容。
 
dist/hexagrams.json 為完整六十四卦經文與解說，dist/lessons.json 為十課與練習。data.js 是兩份 JSON 的執行時副本；修改 JSON 後執行 python3 build.py 同步。engine.js 處理六爻計算與備份驗證，app.js 處理導覽及本機手記。style.css 與 mountains.svg 含所有美術素材。
 
以 node tests/verify.js 重跑資料及全部 4096 組六爻的驗算。tests/reference.json 是另頁 8×8 對照表。見 TESTS.md 了解實際測試範圍。
 
手記包括日期、問題、心得、六爻、收藏與進度，保存在目前瀏覽器與網址。搬家請先在舊站匯出 JSON，再於新站選「我的手記 → 匯入備份」還原。還原將取代目前紀錄。備份包只含網站與教材，不含個人手記。
 
古典經傳屬公有領域；維基文庫繁體整理本的固定版本連結列於每卦 source，文庫整理依 CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)。本版收錄《大象》。白話與現代延伸為本站編寫的入門讀法。

## 版權

© 2026 觀易。白話解說、現代延伸、入門學堂與各類別建議為本站原創，未經同意請勿轉載、改作或用於商業用途。古典經傳原文屬公有領域；維基文庫整理本依其 CC BY-SA 4.0 條款使用，不受本聲明限制。原始碼公開僅供參考，不代表授權使用。
