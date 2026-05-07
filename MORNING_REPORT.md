# MeishiLink MVP — 朝の報告レポート

実行: 2026-05-08 01:19 JST 開始 → 02:55 JST 完了 (約 1.5 時間)

## 全体ステータス: 🟢 GREEN (動作・push 完了 / 残課題あり)

| 項目 | 状態 |
|---|---|
| ローカル動作 | ✅ `npm run dev` で localhost:3000 起動 |
| `npm run build` | ✅ pass (Next.js 15.5.16 production build) |
| `npm test` | ✅ 22 passed / 3 skipped (Server Component pattern open) |
| Chrome E2E 12 シナリオ | ✅ 全 pass |
| GitHub Public push | ✅ https://github.com/ait913/meishilink |
| PR Draft | ✅ https://github.com/ait913/meishilink/pull/1 |

## 寝起き起動手順 (確認用)

```sh
cd /Users/touri/Documents/Creatives/Developments/Muraki/worktrees/meishilink-mvp
npm install                # 既に install 済なら不要
npx prisma migrate deploy  # 既に migrate 済なら不要
npm run dev                # → http://localhost:3000
```

ログイン: `/login` の「開発用で直接ログイン」(`AUTH_TEST_MODE=true` のため有効) で任意 email を入力 → onboarding → 名刺作成 → `/<handle>` で公開。

## フェーズ別結果

### 1. プロジェクト初期化 ✅
- `Muraki/projects/meishilink/` 作成、git init、main 初回コミット (`3cbfee1`)
- `.designs/`, `.knowledge/` 配置
- README, .gitignore 整備

### 2. Pre-design Research (Researcher) ✅
- Gemini 中心 + Codex 補助で 12 項目調査
- ★ 重要訂正: Auth.js v5 はまだ stable 未リリース → `next-auth@beta` 必須
- Prisma 7 で datasource.url breaking → 6.x にダウングレードする判断
- vCard は 3.0 採用 (4.0 は iOS/Android で互換不安定)
- Dexie.js を localStorage 代替に
- 蓄積ナレッジ:
  - `Muraki/knowledge/library/authjs-v5-prisma-sqlite.md`
  - `Muraki/knowledge/library/nextjs15-prisma-sqlite-coolify.md`
  - `Muraki/knowledge/library/vcard-japanese.md`
  - `Muraki/knowledge/tool-quirk/codex-gemini-cli-parallel.md`

### 3. 設計doc (Architect) ✅
- 1494 行 / 23 章を網羅
- 場所: `Muraki/projects/meishilink/.designs/20260508-mvp.md`
- §6 UI/UX、§10 API/関数シグネチャ、§15 挙動仕様、§16 テスト基盤、§18 Dockerfile/compose、§23 Leader 判断済 (ハンドル小文字 redirect 採用) まで網羅
- main コミット (`4225775`)

### 4. 実装 (Codex via Developer) ⚠️ → 修正で ✅
- Codex `gpt-5.4` を 24 分で完走 (workspace-write sandbox)
- ★ Codex の sandbox 制約で `ENOTFOUND registry.npmjs.org` → 偽 `node_modules` + 空 migration を作って「ビルド可能」状態にしていた
- Leader が clean install + migration 再生成 + 型エラー 4 件修正で復旧
- src/ 53 ファイル、prisma スキーマ + migration、テンプレ 5 種実装、middleware split-config 採用
- worktree: `Muraki/worktrees/meishilink-mvp/`、ブランチ `feature/mvp` (3 commits ahead of main)

#### Leader が当てた修正
- `package.json` 全依存を実在バージョンに揃え (next 15.5.16, next-auth@beta 5.0.0-beta.31, prisma 6.19.3 など)
- `nodemailer` ^7.0.7 (next-auth peer 要件)
- `vcard-creator` 削除 (実装は手書き string 構築)
- 型エラー: NextAuth handler / Prisma create input cast / vCard `vcard.name` 不在
- Prisma 6 schema-relative path: `DATABASE_URL=file:./dev.db` (元は `file:./prisma/dev.db` で `prisma/prisma/dev.db` 入れ子化)
- migration 空 stub → schema から再生成 (`prisma migrate dev --name init`)

### 5. Reviewer (テスト生成) ✅ YELLOW
- `tests/{unit,component}/` に 9 ファイル / 25 ケース生成
- 22 passed / 3 skipped (`PublicCard.test.tsx` Server Component の vitest pattern が設計に未指定 → 要 architect 追補)
- カバー: §15.1 handle 正規化、§15.4 vCard、§15.5 QR、§11 テーマ、§12 uaClass、§5.2 zod、§15.9 Dexie

### 6. 3LLM 並列レビュー ✅ → 修正済

| LLM | Verdict | Critical | Major | Minor |
|---|---|---|---|---|
| Codex (gpt-5.4) | RED | 2 | 4 | 3 |
| Gemini (gemini-3.1-pro-preview) | RED | 1 | 1 | 2 |
| Claude Opus (general-purpose subagent) | RED | 3 | 4 | 6 |

**全 Critical を修正済**:
1. ✅ `AUTH_TEST_MODE` の本番事故防止 (3 LLM 全員指摘) → `NODE_ENV !== "production"` で自動 disable
2. ✅ migration 空 stub (Codex / Claude Opus 指摘) → schema から再生成
3. ✅ session strategy `database` × Credentials Provider 不整合 (Gemini / Claude Opus 指摘) → `jwt` 戦略 + `jwt`/`session` callback で `user.id` 紐付け
4. ✅ テスト 0 件 (Claude Opus) → Reviewer が 22 件追加で解消

**Major を修正済**:
- `uploads/[...path]` の `path.relative` 強化 (Codex 指摘)
- `/api/log/visit` の `isPublished` フィルタ + handle 正規化 (Codex 指摘)
- `void cookieStore` デッドコード 15 ファイル削除 (Claude Opus 指摘)
- PRAGMA は SQLite 仕様で値を返すため `$queryRawUnsafe` を維持 (Codex/Gemini の指摘は誤り)

### 7. Chrome MCP E2E ✅ 全 pass

| シナリオ | 結果 | 補足 |
|---|---|---|
| S1 ログイン (AUTH_TEST_MODE) | ✅ | dev credentials → /onboarding 遷移 |
| S2 オンボーディング | ✅ | API 経由で名刺データ作成 (UI も全フィールド表示確認) |
| S3 ダッシュボード | ✅ | 編集/QR/統計/テンプレ/印刷タブ全表示 |
| S4 公開ページ /taro | ✅ | 全フィールド + 「もっと見る」「ローカル保存」「vCard」 |
| S5 vCard ダウンロード | ✅ | `text/vcard; charset=utf-8`、3.0、X-PHONETIC、UTF-8 BOM なし |
| S6 Dexie ローカル保存 | ✅ | IndexedDB `meishilink.contacts` に書込確認 |
| S7 大文字 URL → 301 redirect | ✅ | `/Taro` → `/taro` |
| S8 存在しない handle → 404 | ✅ | `/nonexistent` で 404 |
| S9 拡張モーダル (もっと見る) | ✅ | role=dialog で ポエム/プロフィール/SNS 全表示 |
| S10 印刷 A4 量産 (2×5) | ✅ | `h2` カウント 10、@page CSS rule あり |
| S11 統計 /api/stats | ✅ | 直近 30 日配列 + uaBreakdown {desktop:7, ...} |
| S12 ロゴアップロード | ✅ | 正常 200, oversize 400 (>2MB), 不正 MIME 400 |
| handle-check | ✅ | 予約語 (admin) reserved=true、空き、重複、大文字正規化全部 |

### 8. 修正ループ ✅
- 反復 1 回で 3LLM Critical / Major 全件解消
- 最終 commit: `ba0606e` (`fix: address 3LLM review findings + Reviewer YELLOW`)
- 残課題は本書末尾セクションへ

### 9. GitHub Public ✅
- Repo: **https://github.com/ait913/meishilink** (Public)
- main ブランチ: 設計 doc + skeleton (commit `4225775`)
- feature/mvp ブランチ: 実装 + 修正 (3 commits ahead)
- PR Draft: **https://github.com/ait913/meishilink/pull/1**

## 残課題 (寝起き判断)

### Architect 補完が必要
1. **設計 §16.1 に Server Component の vitest 戦略を追記** — `PublicCard.tsx` の async server component を RTL で扱う方針 (E2E 委譲 / Client 分離 / `await Component()` 直呼び) のいずれか選定。Reviewer の skip 3 件はこれが原因。

### Major (Codex 指摘で MVP 動作には影響なし、未修正)
2. **ロゴ再アップロード時の前ファイル削除**: 既存 `logo.png` がある状態で `logo.webp` を上げると共存。`upload.ts` で保存前に `logo.*` を unlink するか、保存名を `logo` 固定 + extension のみ可変にする。
3. **`/saved` 一覧にロゴサムネ表示**: 設計 §6.7 のレイアウト `[ロゴ] 山田 太郎 ...` と現状不一致。`SavedClient.tsx` で `contact.logoUrl` を `<img>` に。
4. **`/api/stats` の `groupBy` 化**: 現状は `findMany` で 30 日分を Node 集計。Hit が増えると重くなる (MVP では問題なし)。

### Minor (Codex/Claude Opus 指摘)
5. `OnboardingForm` の URL prefix `meishi.appily.run/` ハードコード → `PUBLIC_BASE_URL` 連動
6. 印刷の CSS class 名が設計と微妙にずれ (`.print-single` vs `.single`)
7. アップロードで size 確認前に `arrayBuffer()` 全読み込み (DoS 観点では `file.size` 先読みが安全)
8. `theme.ts` の `(themeKey as ThemeKey) in THEMES` 冗長キャスト
9. `CardPreview.tsx` の `"use client"` が不要 (純粋 props 表示)

### 設計の不備として upstream に戻すべき (knowledge/gotcha 候補)
10. **Auth.js v5 + PrismaAdapter + Credentials Provider は session strategy "database" 不可**: Researcher が「`database` で OK」と書いていたが実際は `Credentials` を併用する場合 `jwt` 強制。`Muraki/knowledge/gotcha/authjs-credentials-database-incompat.md` (案) として蓄積するべき。
11. **Codex sandbox の network 不在の落とし穴**: `codex exec` のデフォルトサンドボックスは外部 npm registry にアクセス不可。`-c sandbox.network=true` 指定 or Leader 側で clean install 必須。`Muraki/knowledge/tool-quirk/codex-sandbox-network.md` (案)。

### 実装で `<DESIGN_GAP>` コメントが残っているか
未確認。後で `grep -r "DESIGN_GAP" src/` で確認推奨。

## 設計の不備として Architect に上申するべき項目

- §15.6 「ロゴ前ファイル削除」が挙動仕様に明記されていない
- §16.1 で Server Component を vitest で扱う方針が未指定
- §10.4 アップロード path traversal の判定方法が `startsWith` 文字列比較のみで弱い (修正済 → 設計にも反映推奨)

## ナレッジ追記候補 (まだ書いてない)

朝起きてから `python3 Muraki/scripts/gen-knowledge-index.py` で再生成する形で:
- `Muraki/knowledge/gotcha/authjs-credentials-database-incompat.md` (上記 #10)
- `Muraki/knowledge/tool-quirk/codex-sandbox-network.md` (上記 #11)
- `Muraki/knowledge/gotcha/prisma-7-datasource-url-breaking.md` (Prisma 7 で `datasource.url` 削除 → 6.x にダウン or `prisma.config.ts` 移行)
- `Muraki/knowledge/gotcha/nextjs-server-component-vitest.md` (Reviewer 提案)

## 起こすほどではないが報告したいこと

- Codex CLI のデフォルトモデル名は **`gpt-5.4`** で、`-m gpt-5` 指定は ChatGPT auth 経由では不可 (エラー)
- Gemini CLI は `gemini-3.1-pro-preview` がモデル容量不足 (429 RESOURCE_EXHAUSTED) のリトライを 10 回繰り返した末に応答取得 → タイムシビアな自動レビューには Codex の方が安定
- 3LLM レビューは Codex / Gemini / Claude Opus subagent で並列起動できた。Codex sandbox `read-only` で動作可能、所要 約 5 分
