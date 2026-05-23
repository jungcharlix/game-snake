# 🐍 貪食蛇 · Snake

經典街機重製，行動裝置優先的 HTML 貪食蛇遊戲。
原生 React + Babel inline 編譯，無建置流程，雙擊 HTML 即玩。

![Tech](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![No Build](https://img.shields.io/badge/build-none-success)
![Mobile First](https://img.shields.io/badge/design-mobile_first-blueviolet)
🔗 https://jungcharlix.github.io/game-snake/
---

## ✨ 特色

### 核心玩法
- 經典貪食蛇玩法，吃食物變長
- **晉級系統**：每 5 顆食物升一級，速度循序加快
- **金幣系統**：棋盤上隨機出現金幣（$）+5、升級獎勵 +10
- **★ 金幣狂歡關卡**：吃到星星進入 10 秒狂歡 — 棋盤撒滿金幣、撞牆穿越、不會撞到自己

### 自訂選項
- **3 種主題**：Cream（暖奶油）／ Midnight（霓虹深色）／ Paper（紙感）
- **3 種棋盤大小**：S 12×14 ／ M 15×18 ／ L 18×22
- **4 種難度**：簡單／一般／困難／超困難
- **2 種模式**：漸進加速（每級變快）／固定速度
- **17 款蛇皮膚包裝**：經典、薄荷、櫻花、海洋、薰衣草、莓果、蜜桃、烈焰、苔蘚、寒冰、寶石、極光、霓虹、黃金、星河、彩虹⋯⋯

### 多人檔案
- 多位玩家獨立保存進度（最高分、金幣、皮膚）
- 切換玩家、新增、命名、刪除
- 匯入／匯出存檔（base64 字串）
- 自動從舊版單檔資料移轉

---

## 🎮 操作

| 動作 | 控制方式 |
|---|---|
| 移動 | 方向鍵 `← ↑ → ↓` / `WASD` / 螢幕 D-pad / 棋盤滑動 |
| 暫停 | `Space` / 右上 ⏸ 按鈕 |
| 開始狂歡 | 吃到 ★（吃完 5 顆食物後有機率出現） |

---

## 🚀 啟動

```bash
# 1. 解壓縮專案
# 2. 在瀏覽器中開啟
open "Snake Game.html"
```

或用任何靜態伺服器：
```bash
python3 -m http.server 8080
# 然後瀏覽 http://localhost:8080/Snake%20Game.html
```

**注意**：需透過 `file://` 或本機 server 開啟。Babel 在瀏覽器即時編譯 JSX。

---

## 📁 檔案結構

```
.
├── Snake Game.html        # 入口 HTML
├── snake-game.jsx         # 遊戲主體（引擎、HUD、商店、畫面）
├── snake-profiles.jsx     # 多人檔案系統
├── ios-frame.jsx          # iOS 裝置外框
├── tweaks-panel.jsx       # 開發用 Tweaks 控制面板
└── README.md
```

---

## 🛠 技術細節

- **無建置流程**：React 18 + Babel Standalone 在瀏覽器內 inline 轉譯
- **狀態管理**：純 React hooks，無外部 store
- **遊戲迴圈**：`setInterval` 驅動，速度隨等級調整（50ms ~ 280ms）
- **持久化**：`localStorage` 儲存玩家檔案，自動移轉舊版鍵值
- **無依賴**：所有資源皆 CDN，無 npm install

---

## 📜 授權

僅供個人使用與學習交流。

