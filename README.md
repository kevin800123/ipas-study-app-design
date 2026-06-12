# iPAS AI 應用規劃師 備考 App

離線可用的靜態 PWA，協助準備 iPAS「AI 應用規劃師」能力鑑定：整合圖文重點摘要、線上測驗自動計分與錯題本。

- 線上版：部署於 GitHub Pages（見 repo 的 Pages 設定）。
- 技術：React + Vite + TypeScript + Tailwind CSS v4、React Router、Vitest、vite-plugin-pwa。

## 目前範圍（Phase 1）

初級 2 科：人工智慧基礎概論、生成式 AI 應用與規劃。每科題庫含 114 年第四梯次公告試題與 114.09 樣題。

## 本機開發

```bash
cd ipas-study-app
npm install
npm run dev      # 開發預覽
npm run test     # 單元測試
npm run build    # 產出 dist/
```

## 結構

- `ipas-study-app/` — 前端 App（題庫與摘要為 `src/data/` 下的 JSON）
- `scripts/` — 由官方 PDF 抽取題庫的 Python 腳本（PyMuPDF / pdfplumber）
- `docs/superpowers/` — 設計文件與實作計畫

> 題庫與摘要為協助個人備考之整理，著作權屬 iPAS 與原始來源；請勿移作商業用途。
