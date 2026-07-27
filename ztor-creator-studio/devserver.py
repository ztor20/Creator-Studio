#!/usr/bin/env python3
"""本機預覽用 dev server —— 跟 `python3 -m http.server` 一樣，但強制送 no-store。

用法:
    python3 devserver.py [port] [directory]
    python3 devserver.py 4325 r2.1

為什麼需要這支（2026-07-26）:
    站上每個資產連結原本都掛 `?v=<日期字母>` 來打掉瀏覽器快取，改一次 CSS 就要用
    bump_ver 把全站 40 頁、1000 多條連結的版本字串全部改一遍。那讓「每次調樣式」
    都變成「動到每一個檔」——兩個人並行時，每個檔都會在版本號那一行相撞。

    但線上其實不需要它：Vercel 預設就送 `cache-control: public, max-age=0,
    must-revalidate` ＋ ETag，瀏覽器每次都會回頭驗證，內容變了就拿新的。
    真正會吃到舊檔的只有本機——`python3 -m http.server` 只送 Last-Modified、
    不送 Cache-Control，瀏覽器就用「啟發式快取」自己決定要不要重抓。

    所以正解是把 no-store 補在本機這一端，而不是在原始碼裡塞版本字串。
    版本字串因此固定成 `?v=r2.1` 不再變動；真的要強制清快取時，仍可手動跑一次
    `bump_ver.py <site-dir> <新字串>`。

純 stdlib、跨平台。
"""
import functools
import http.server
import socketserver
import sys


class NoStoreHandler(http.server.SimpleHTTPRequestHandler):
    """一般靜態檔服務，但每個回應都標明「別留快取」。"""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # 預設每個請求印一行，開發時噪音太大；只留錯誤
        if not str(args[1] if len(args) > 1 else "").startswith(("2", "3")):
            super().log_message(fmt, *args)


class ReusableServer(socketserver.ThreadingTCPServer):
    """多執行緒：一個卡住的連線不能拖垮整台 server。

    2026-07-27：原本繼承 TCPServer（單執行緒），一次只服務一個連線。瀏覽器同時
    開好幾條連線抓 css/js，只要其中一條沒收完（分頁卡住、預覽面板沒回應），
    後面全部排隊等它 —— 表現出來就是「port 明明在 LISTENING，但頁面永遠載不完」。
    改成 ThreadingTCPServer 後各連線互不影響；daemon_threads 讓 Ctrl+C 能直接收工。
    """

    allow_reuse_address = True   # 重啟時不用等 TIME_WAIT 過期
    daemon_threads = True


def main() -> int:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4325
    directory = sys.argv[2] if len(sys.argv) > 2 else "."
    handler = functools.partial(NoStoreHandler, directory=directory)
    with ReusableServer(("", port), handler) as httpd:
        print(f"serving {directory} on http://localhost:{port}  (Cache-Control: no-store)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nbye")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
