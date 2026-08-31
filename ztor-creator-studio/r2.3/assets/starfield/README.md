# 星空背景：可調整原始碼與烘圖流程

`shared.css` 上線用的星空是四張平鋪 PNG，不是即時算出來的 CSS 漸層。
這個資料夾放的是「星空真正的原始碼」與把它烘成圖的腳本。

## 檔案

### starfield-gradients.css

四層星空的可調整原始碼，也是唯一真相源。
內容與 shared.css 原本的四段規則逐字相同（background-image / -size / -position / animation）。

這份檔案**沒有被任何頁面載入**，改它不會直接影響畫面，要跑 `bake.py` 重烘圖才會。

### bake.py

讀 `starfield-gradients.css`，重新產出四張 PNG 到 `site/r2.3/images/`。
只用 Python 標準函式庫加 Pillow，可重複執行、同樣輸入永遠產出同樣的位元組。

### 產出的四張圖

| 檔案 | 對應的 CSS 選擇器 | tile | PNG 實際像素 | 星點數 |
|---|---|---|---|---|
| `images/starfield-a.png` | `html[data-nav-mode="sidebar"]::before` | 620px | 1240 x 1240 | 68 |
| `images/starfield-b.png` | `html[data-nav-mode="sidebar"]::after` | 680px | 1360 x 1360 | 62 |
| `images/starfield-c.png` | `html[data-nav-mode="sidebar"] body::before` | 740px | 1480 x 1480 | 66 |
| `images/starfield-d.png` | `html[data-nav-mode="sidebar"] body::after` | 810px | 1620 x 1620 | 64 |

## 怎麼調整星空

1. 改 `starfield-gradients.css`
   要改亮度就改 `radial-gradient(rgb(255 255 255 / A%) ...)` 裡的 `A`
   要改星點大小就改後面的 `Rpx`（兩處要同時改，前後數值必須一樣，那是硬邊圓點的寫法）
   要改位置或增減星點就改 `background-position` 的座標串，並讓 `background-image` 的漸層數與 `background-size` 的重複數同步
2. 在這個資料夾跑：
   ```
   python3 bake.py
   ```
3. 重新整理頁面即可看到效果
4. 只有在改了 tile 尺寸（`background-size`）時，才需要回頭改 `shared.css` 對應那層的 `background-size`

`bake.py` 會在解析不一致時直接報錯（例如漸層數與座標數對不上），不會默默產出壞圖。

## 為什麼要烘成圖

四層加起來是 260 個 `radial-gradient`。瀏覽器每次換頁都得把這 260 個漸層重新光柵化一次，
成本落在首次繪製（FCP，畫面第一次出現內容的時間）之前，所以每一頁都慢。

實測（1440x900，dev server，同一台機器）：

| 版本 | e-shop FCP | orders FCP |
|---|---|---|
| r2.2（沒有星空） | 216ms | — |
| r2.3 純 CSS 漸層星空 | 800-980ms（本輪同場複測 564-572ms） | 980ms（本輪同場複測 544-556ms） |
| 把星空整個拿掉 | 92-156ms | — |
| r2.3 烘圖版（現行） | 264-284ms | 88-116ms |

玻璃層（backdrop-filter）大約只佔 130ms，不是主因；星空才是。
換成 PNG 之後，光栅化變成解碼四張十幾 KB 的小圖，而且瀏覽器會快取，第二頁起幾乎零成本。

## 烘圖的三個正確性重點

這三件事做錯的話畫面會走樣，改腳本時要留意：

1. **2 倍解析度**
   PNG 實際像素是 tile 的兩倍，CSS 端 `background-size` 仍寫原本的 tile px。
   使用者螢幕 `devicePixelRatio` 是 2，不烘 2 倍星點會糊掉。
2. **圓心位置**
   CSS 的 `radial-gradient` 預設圓心在自己 tile 的正中央，`background-position` 是整個圖層的位移，
   所以實際圓心是 `((X + tile/2) mod tile, (Y + tile/2) mod tile)`。
3. **邊緣環繞**
   靠近 tile 邊界的星點必須在對邊也補畫（±tile 的九宮格），否則平鋪會出現接縫。

另外，抗鋸齒用的是面積覆蓋率（每顆星在自己的小方框內超取樣 16 倍再做 BOX 面積平均），
這正是瀏覽器畫硬邊圓形的做法。試過 LANCZOS，它在硬邊會過衝，整體亮度比解析解多約 19%，星點會偏亮，所以不用。
現行做法的峰值 alpha 與 CSS 寫的百分比完全吻合，總亮度與解析解差約 3%。

## 怎麼切回純 CSS 版

把 `starfield-gradients.css` 裡那四段規則的內容，貼回 `shared.css` 對應的四個選擇器（取代現在的
`background-image: url(...)` / `background-size` / `background-repeat` 三行）即可。
`animation`、`@keyframes ztu-star-*`、清單頁的 mask 漸消、`prefers-reduced-motion` 的凍結都不在這四段裡，
兩個版本共用，切換時不必動它們。
