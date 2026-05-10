# MeishiLink Phase 4 — データ漏洩レビュー指摘の修正設計

feature-slug: `phase4-data-leak`
date: 2026-05-10
status: draft (要ユーザー承認)
target worktree: `Muraki/worktrees/meishilink-mvp/`

---

## 0. 目的

Codex データ漏洩レビュー (Phase 4) で指摘された **High 3 件 + Medium 3 件** を一括是正し、MVP デプロイ前に「公開すべきでないデータが公開される」「token を DB から漏らせば全 private card が抜ける」「Account レコードに OAuth トークンが残る」の 3 系統を塞ぐ。同時に EXIF 除去・handle enumeration 対策も入れる。

軽量志向。新規ライブラリは `sharp` のみ追加。Redis 等の追加インフラは入れない。

---

## 1. スコープ (A〜F)

| # | 区分 | 概要 |
|---|---|---|
| A | High | private card のロゴ等 asset 配信を認可化 (URL に userId 露出を解消) |
| B | High | `ExchangeToken.token` を SHA-256 ハッシュ化して保存 (生 token は発行時のみ平文返却) |
| C | High | `Account` モデルから OAuth `refresh_token` / `access_token` / `id_token` を削除 (JWT セッション固定なので不要) |
| D | Medium | アップロード画像を sharp で再エンコードして EXIF/メタデータを除去 |
| E | Medium | `/api/card/handle-check` を要認証化 + rate limit (handle 列挙攻撃の抑止) |
| F | Medium | A の URL 構造変更に合わせて vCard PHOTO・dashboard・public page の参照経路を整合 |

Out of scope:
- Account モデルの campaign migration (既存行を残したまま新カラムへ写すパターン) — MVP デプロイ直後想定なので採用しない。理由は「不採用案」へ。
- handle-check の captcha 化 — rate limit + 認証で十分。
- private asset 配信のための CDN 署名 URL 化 — 単一 Coolify インスタンスなので過剰。

---

## 2. 全体方針 (URL 設計の刷新)

### 2.1 ロゴ配信パスの変更 (A の核)

| 変更前 | 変更後 |
|---|---|
| 公開 URL: `/uploads/<userId>/logo.<ext>` | 公開 URL: `/u/<handle>/logo` (handle ベース、認可ロジック内蔵) |
| DB 保存値 (`Card.logoPath`): `/uploads/<userId>/logo.webp` | DB 保存値 (`Card.logoPath`): ファイル名のみ `logo.webp` (後述。空文字 or null は「なし」) |
| ファイル実体: `<UPLOAD_DIR>/<userId>/logo.<ext>` | ファイル実体: `<UPLOAD_DIR>/<userId>/logo.webp` (D により ext 固定) |

**ポイント**:
- `Card.logoPath` の意味を「ブラウザが叩く絶対パス」から「ファイル名 (ext 含む)」に変える。HTML/Image src に直接渡せない → 全参照箇所を `/u/<handle>/logo` に書き換える。
- `userId` は URL から完全に消える。`handle` は元々公開情報なので OK。
- 認可は `/u/[handle]/logo/route.ts` で `resolvePublicCard(handle, token)` を再利用。public card は誰でも、private card は valid token があれば配信。それ以外は 404。
- 旧パス `/uploads/[...path]` は **完全削除** (route handler を消す)。互換維持しない。MVP 未公開なので外部リンクは存在しない。

### 2.2 vCard PHOTO の扱い (設計判断 1)

**採用**: 外部 URL (`PHOTO;VALUE=URI:https://<host>/u/<handle>/logo[?t=<token>]`) を維持。

理由:
- inline base64 (`PHOTO;ENCODING=b;TYPE=WEBP:....`) は vCard サイズが画像サイズの ~1.4 倍に膨張し、2MB 上限のロゴだと 2.7MB の .vcf になる。AirDrop/メール添付で詰まる端末 (古い iOS Contacts) があり、互換性を悪化させる。
- 外部 URL なら token-aware で配信時に再認可できる (token 失効後はロゴも 404)。
- private card の vCard に埋め込まれた URL に token が含まれる件は既に Phase 3 で「`Cache-Control: private, no-store`」で対応済みなので追加リスクなし。

副次効果: `Card.isPrivate` で token 有効期限切れ後にロゴも自動的に取得不可になる (同じ `resolvePublicCard` を使うため)。

### 2.3 ExchangeToken のハッシュ化 (B)

- 平文 `token` カラムを廃止し `tokenHash` (SHA-256 hex 64 文字) を `@unique` で持つ。
- 発行時: `randomBytes(24).toString("base64url")` で平文生成 → SHA-256 hash → `tokenHash` を DB 保存 → **平文を一度だけ POST レスポンスで返却**。
- 照合時: クエリの `?t=<plain>` を SHA-256 → `findUnique({ where: { tokenHash } })`。timingSafeEqual 不要 (DB B-tree lookup の固定時間性で十分)。
- 既存 token の扱い: schema migration で `token` カラム DROP → 既存 ExchangeToken 行は token 列が消えるため、新カラム `tokenHash` は NOT NULL DEFAULT で追加できない。**マイグレ手順は §6 で詳述** (既存 token 行を全削除して全リセット)。
- 既存 token URL を持つユーザーへの影響: MVP 未公開なので発行済 token は dev/staging データのみ。失効告知不要。

### 2.4 Account モデルの secret 削減 (C)

- `auth.config.ts` に `account()` callback を追加して Google provider が返すトークンフィールドを **DB に書く前に剥がす**。
- 順序が重要: 「コードで剥がす → DB migration で DROP」の順でやらないと、新規 Google ログインが `Unknown argument 'access_token'` で落ちる。詳細 §6。

### 2.5 handle-check の保護 (E)

- `auth()` セッション必須 (未ログインは 401)。
- rate limit: 同一 user id ごとに 60 秒で 30 リクエスト (タイピング途中のサジェスト相当を許容しつつ列挙は抑制)。
- レスポンスは現状維持 (reason を返す)。設計判断 2 で詳述。

### 2.6 handle-check `available: false` の reason 表示 (設計判断 2)

**採用**: 現状のまま reason (`format` / `reserved` / 取り済み) を返す。`taken` だけ reason を伏せず、明示的に `available: false` と返す。

理由:
- handle は登録後に公開ページ `/<handle>` に出るので、taken かどうかは外部から `GET /<handle>` で 200/404 判定できてしまう (元々秘密ではない)。
- UX 上、ユーザーが「予約語」「取り済み」を区別できないと困る (どう直せばよいか分からない)。
- 認証 + rate limit で列挙コストは十分上がる。

---

## 3. 個別修正設計

### A. Private Asset 配信の認可化

#### 変更対象

| ファイル | 変更内容 |
|---|---|
| `src/app/uploads/[...path]/route.ts` | **削除** |
| `src/app/u/[handle]/logo/route.ts` | **新規** (下記シグネチャ) |
| `src/lib/upload.ts:78` (`saveLogo` 戻り値) | `/uploads/<userId>/logo.<ext>` → `logo.webp` (ファイル名のみ) |
| `src/app/api/card/logo/route.ts:29-34` | `saveLogo` の戻り値が変わるので、API レスポンスは `{ logoUrl: "/u/<handle>/logo?v=<unix>" }` に変更 (`?v=<unix>` は cache busting) |
| `src/app/[handle]/page.tsx:106,141` | `card.logoPath` から URL 生成: `card.logoPath ? \`/u/${card.handle}/logo${tokenSuffix}\` : null` |
| `src/app/[handle]/vcard/route.ts:45` | `logoUrl` 生成を `/u/<handle>/logo[?t=...]` に |
| `src/components/card/CardPreview.tsx:31-33` | `card.logoPath` を直接 `<Image src>` に渡しているので、props を `logoUrl: string \| null` に変える (呼び出し側で URL を組む) |
| `src/components/card/types.ts` | `PublicCardViewModel.logoPath` → `logoUrl` に rename |
| `src/app/(owner)/dashboard/DashboardEditor.tsx:47,92,122,125,130` | state 名 `logoPath` → `logoUrl`、API レスポンスのキー `logoPath` → `logoUrl` に追従 |
| `src/app/(owner)/dashboard/page.tsx:63` | 同上 |
| `src/app/(owner)/dashboard/print/page.tsx` | 同上 (logoPath → logoUrl 変換し view model に詰める) |

#### 新規 route: `src/app/u/[handle]/logo/route.ts`

```ts
export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string }> },
): Promise<Response>
```

- `params.handle` を `normalizeHandle` し、無効なら 404。
- `URL.searchParams.get("t")` を取り、`resolvePublicCard(normalized, token)` で card を取得。null なら 404。
- card の owner userId と `card.logoPath` (= ファイル名 `logo.webp` または null) を取り出す。
- `card.logoPath` が null/空なら 404。
- ファイル実体を `path.join(getUploadDir(), card.userId, card.logoPath)` で読む (path traversal は logoPath が `logo.webp` 固定なので発生しない。defensive に `/^logo\.(webp|png|jpg|jpeg)$/` で validate して escape)。
- 読めれば下記レスポンス:

```
Content-Type: image/webp (拡張子から決定)
Cache-Control:
  - public card → "public, max-age=3600, immutable" (cache busting は ?v=)
  - private card → "private, no-store, no-cache, must-revalidate"
X-Content-Type-Options: nosniff
```

- 読めなければ (ENOENT 等) 404。

#### 挙動仕様

- public card (`isPrivate=false`) のロゴを GET → 200 + バイナリ
- public card で handle 末尾大文字 (`/u/Foo/logo`) → `permanentRedirect` で正規化先に飛ばす (page.tsx と同じパターン)
- private card で `?t=<valid token>` → 200 + `Cache-Control: private, no-store`
- private card で token なし → 404
- private card で `?t=<wrong>` → 404
- private card で `?t=<expired>` → 404
- private card で `?t=<disabled>` → 404
- 存在しない handle → 404
- 存在する handle だが `isPublished=false` → 404
- card.logoPath が null → 404
- ファイル実体が消えている (storage 削除等) → 404
- 旧 URL `/uploads/<userId>/logo.png` → route 削除済なので **404** (Next.js のデフォルト)

#### 不採用案 (A)

- **(a) `/uploads/[...path]` を残して内部で認可**: パスから `userId` を抽出して owner card を引いて認可する。動くが URL に userId が残る (副作用としてキャッシュ汚染・SNS スクレイプで userId が露出)。Phase 4 の主目的を満たさない。
- **(b) handle ではなく cardId で配信** (`/u/<cardId>/logo`): handle と cardId のどちらでも認可できるが、cardId は internal な ID で URL に出すと安定リンク前提になりリファクタしづらい。handle ベースが自然。
- **(c) signed URL (HMAC + expiry)**: CDN 配信前提なら有効だが、Coolify standalone で sharp 済バイナリを node から直接出すだけなので過剰設計。
- **(d) base64 を DB に格納し API で返す**: SQLite に画像を入れるとレプリケーション/バックアップが重くなる。filesystem のままで十分。

---

### B. ExchangeToken ハッシュ化

#### 変更対象

| ファイル | 変更内容 |
|---|---|
| `prisma/schema.prisma:90-103` | `token String @unique` を **削除** し `tokenHash String @unique` を追加 |
| `src/lib/exchange-token.ts:1-47` | `generateTokenString` 維持。新規 `hashToken(plain): string` を追加。`resolvePublicCard` の token 照合を `tokenHash` lookup に書き換え |
| `src/app/api/tokens/route.ts:71-89` | `create` 時に `{ tokenHash: hashToken(plain) }` で保存し、レスポンスでは `token` フィールドに **平文** をセットして返す |
| `src/app/api/tokens/route.ts:31-44` | `GET /api/tokens` の select から `token` を除外 (DB に平文がないため返せない)。代わりに `tokenHash` も返さない (発行済 token は再表示不可。フロント側は最新発行分のみ表示する仕様 = 既に発行直後の dialog で完結している) |
| `src/app/api/tokens/[id]/route.ts` | DELETE は token 文字列を扱わないので変更なし |
| `src/app/(owner)/dashboard/ExchangeQuickDialog.tsx` (確認のみ) | 発行直後のレスポンス `token` をそのまま QR/URL に使うフローなら無修正でよい。GET で過去 token を再取得して URL を組み立てる箇所があれば「再発行」UI に変更する |

#### 新規関数

```ts
// src/lib/exchange-token.ts
import { createHash } from "node:crypto";

export function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex"); // 64 chars
}
```

#### `resolvePublicCard` の修正

```ts
export async function resolvePublicCard(handle: string, token?: string | null) {
  const card = await prisma.card.findUnique({ where: { handle } });
  if (!card || !card.isPublished) return null;
  if (!card.isPrivate) return card;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const exchange = await prisma.exchangeToken.findUnique({
    where: { tokenHash },
    select: { id: true, cardId: true, disabled: true, expiresAt: true },
  });
  if (!exchange || exchange.cardId !== card.id) return null;
  if (exchange.disabled) return null;
  if (exchange.expiresAt && exchange.expiresAt.getTime() < Date.now()) return null;

  prisma.exchangeToken.update({ /* 既存と同じ usage 加算 */ }).catch(() => undefined);
  return card;
}
```

#### 挙動仕様

- 発行 API `POST /api/tokens` レスポンス: `{ id, token: "<plain base64url>", label, expiresAt, ... }` (`tokenHash` は返さない)
- 一覧 API `GET /api/tokens` レスポンス: `{ tokens: [{ id, label, expiresAt, disabled, usageCount, lastUsedAt, createdAt }, ...] }` (token / tokenHash どちらも返さない)
- 同じ平文 token は別 ID で発行しても DB 上は同じ tokenHash → ユニーク制約衝突 (確率 2^-192 = 実質ゼロ。ただし衝突時は 500 で良い)
- 公開ページに `?t=<plain>` でアクセス → hash して照合 → 一致すれば 200
- DB から `tokenHash` を抜き取られても元の `<plain>` は復元不可 (SHA-256 一方向)
- migrate 後は **既存 ExchangeToken 行が全消去される** (§6 で詳述)。MVP 未公開なので影響なし

#### 不採用案 (B)

- **bcrypt / argon2 ハッシュ**: token 自体が 192bit エントロピーなので、辞書攻撃が物理的に成立しない。bcrypt は handshake コストだけ増えて意味が薄い (1 リクエストあたり 50ms 増は public card 表示で許容できない)。SHA-256 で十分。
- **timingSafeEqual で線形比較**: DB lookup を `findUnique` で投げているので、比較時間は B-tree 探索時間 (lookup 失敗/成功で実質定数オーダー)。timing attack は成立しない。
- **平文 + hash の hybrid 期間 (段階移行)**: MVP デプロイ直後想定で発行済 token は社内・dev 限り。段階移行のコストの方が高い。一気に切り替える。
- **token に prefix (`mxl_xxx`) を付ける**: GitHub 風の prefix は流出時の grep 検出に便利だが MVP では過剰。Phase 5 以降で検討余地。

---

### C. Account モデル secret 削減

#### 変更対象

| ファイル | 変更内容 |
|---|---|
| `src/auth.config.ts:8-12` (Google provider 設定) | `account()` callback を追加してトークン系を返さない |
| `prisma/schema.prisma:22-37` | `refresh_token` / `access_token` / `id_token` の 3 カラムを削除 |
| migration | 既存行のトークンカラムを NULL 化してから DROP |

#### Google provider の修正

```ts
Google({
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
  account(account) {
    // PrismaAdapter の linkAccount に渡す前にトークン系を剥がす
    return {
      providerAccountId: account.providerAccountId,
      type: account.type,
      provider: account.provider,
      expires_at: account.expires_at,
      token_type: account.token_type,
      scope: account.scope,
      session_state: account.session_state,
    };
  },
}),
```

#### Schema 変更後

```prisma
model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  expires_at        Int?
  token_type        String?
  scope             String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}
```

#### 挙動仕様

- 既存 Google ユーザーは再ログイン不要 (Account 行は残り、Session は JWT なので影響なし)
- 新規 Google ログイン → `linkAccount` → トークン系フィールドが Account row に書かれない (空)
- DB を抜かれても OAuth refresh が成立しない (元々 JWT セッションなので refresh も呼んでない)
- email-link (Nodemailer) 経路は Account を作らないので影響なし
- credentials (test mode) 経路も影響なし

#### 不採用案 (C)

- **トークンを暗号化して保存**: 復号鍵が同じサーバーにあるので意味薄い。そもそも使ってないので消すのが正解。
- **セッション戦略を database に変える**: 既に jwt 確定で全機能が動いている。変更コストの方が高い。
- **Account レコード自体を作らない (PrismaAdapter を捨てる)**: Magic Link が VerificationToken を必要とするので adapter は外せない。

---

### D. EXIF 除去 (sharp 導入)

#### 変更対象

| ファイル | 変更内容 |
|---|---|
| `package.json` | `dependencies` に `"sharp": "^0.34.0"` を追加 |
| `src/lib/upload.ts:38-80` (`saveLogo`) | sharp で再エンコード。出力は `.webp` 固定 (quality 80, rotate で EXIF orientation を pixel に焼き込んでから strip) |
| `src/lib/upload.ts:4-8` (`MIME_TO_EXT`) | 入力受付は引き続き png/jpg/webp。出力は webp 固定 |
| `Dockerfile` | 変更不要 (alpine の musl prebuilt が `npm ci` 時に自動取得) |

#### 修正後 `saveLogo` 仕様

```ts
export async function saveLogo(userId: string, file: File): Promise<string>
// 戻り値: ファイル名 "logo.webp" のみ (DB 保存用)
```

処理:
1. size early-check (現行と同じ。> 2MB は throw "too large")
2. MIME と magic bytes 一致確認 (現行と同じ)
3. `sharp(buffer).rotate().webp({ quality: 80 }).toBuffer()` で再エンコード
   - `.rotate()` は引数なしで EXIF Orientation を読み pixel を回転 → metadata は strip
   - `.webp()` の出力は metadata を持たない (sharp デフォルト)
4. アップロード dir 配下の旧 `logo.*` を全削除 (現行と同じ)
5. `<userId>/logo.webp` で書き込み
6. **戻り値はファイル名のみ** (`"logo.webp"`)

#### 挙動仕様

- PNG (EXIF なし) アップロード → webp 再エンコードされ保存される
- JPEG (EXIF GPS 付き) アップロード → 出力 webp に GPS 残らない
- JPEG (EXIF Orientation=6 横向き) → pixel が縦向きに焼き込まれて保存される
- WebP アップロード → 別の WebP として再エンコード (metadata strip)
- SVG アップロード → magic bytes チェックで弾かれる (`unsupported mime`)
- 2MB 超 → `too large`
- sharp エラー (corrupt image 等) → 500 / "upload failed"
- 出力ファイル名は常に `logo.webp` (拡張子は webp 固定)

#### 不採用案 (D)

- **入力 MIME に応じて出力 ext を維持**: webp 固定の方がシンプルで、MIME マップを最小化できる。視認上のロゴ品質は webp 80 で十分。
- **sharp の `withMetadata({ exif: false })`**: 明示的にも書けるが、sharp デフォルトで encode 系は metadata を strip するので冗長。`.rotate()` だけ呼んでおけば十分。
- **SVG 受付追加**: SVG は XML ベースで JS 埋め込み (XSS) のリスクがあり、sanitize ライブラリ追加が必要。ロゴ用途は raster で足りる。
- **client-side EXIF 除去 (canvas で再描画)**: 信頼境界が逆 (悪意あるクライアントが bypass できる)。サーバ側で必ずやる。

---

### E. Handle Enumeration 対策

#### 変更対象

| ファイル | 変更内容 |
|---|---|
| `src/app/api/card/handle-check/route.ts` | `auth()` を呼び未ログインなら 401。session.user.id でレート制限 |

#### 修正後ハンドラ

```ts
export async function GET(req: Request): Promise<Response> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // 60 秒で 30 件 (タイピング途中のサジェストを許容)
  if (!rateLimit(`handle-check:${userId}`, { limit: 30, windowMs: 60_000 })) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  // 以下、既存ロジックそのまま (input 取得・normalize・validate・lookup)
}
```

#### 挙動仕様

- 未ログイン → 401 `{ error: "unauthorized" }`
- ログイン済 + 30 req/min 以内 → 既存と同じ JSON レスポンス
- ログイン済 + 31 req/min 目 → 429 `{ error: "too many requests" }`
- `?h=` 欠落 (現行と同じ) → 400
- 異なる userId 同士はレート別カウント
- (rate-limit は in-memory なので process restart でリセット = MVP 仕様の許容範囲)

#### 不採用案 (E)

- **CAPTCHA (hCaptcha 等) 導入**: UX 悪化、外部依存追加。認証 + rate limit で十分。
- **`available: false` の reason を全部 "unavailable" に統一**: ユーザーが「予約語だから」「format 違反だから」を区別できないと修正できない。設計判断 2 参照。
- **`tokenBucket` を Redis 化**: Coolify standalone なので不要。Phase 5 でスケールさせる時に検討。
- **handle suggestion を返す**: 機能として欲しいが Phase 4 のスコープ外。

---

### F. URL 構造変更の追従 (vCard / dashboard / print)

A の `Card.logoPath` セマンティクス変更に伴い、以下を一括書き換え。

#### 変更対象

| ファイル | 変更後の参照 |
|---|---|
| `src/app/[handle]/vcard/route.ts:45` | `logoUrl: card.logoPath ? \`${baseUrl}/u/${card.handle}/logo${token ? \`?t=${encodeURIComponent(token)}\` : ""}\` : null` |
| `src/app/[handle]/page.tsx:106-117,141` | `card.logoPath` を `card.logoUrl` (= 上記計算結果) に置き換え |
| `src/components/card/CardPreview.tsx:31-33` | props を `logoUrl: string \| null` に変える。`<Image src={logoUrl}>` |
| `src/components/card/types.ts` | `PublicCardViewModel.logoPath` を削除し `logoUrl: string \| null` を追加 |
| `src/app/(owner)/dashboard/DashboardEditor.tsx` | server から渡される `card.logoUrl` を state にし、アップロード API レスポンスの `logoUrl` で更新。preview component に `logoUrl` を渡す |
| `src/app/(owner)/dashboard/page.tsx:63` | `logoUrl: card.logoPath ? \`/u/${card.handle}/logo?v=${card.updatedAt.getTime()}\` : null` を組み立てて渡す |
| `src/app/(owner)/dashboard/print/page.tsx` | 同上 |

#### 挙動仕様 (整合性)

- public card のロゴ: HTML / vCard / dashboard / print いずれも `/u/<handle>/logo?v=<timestamp>` を参照
- private card のロゴ: HTML / vCard ともに `/u/<handle>/logo?t=<token>` を参照 (cache busting `?v=` は付けない。private card は no-store なので不要)
- ロゴ更新後: dashboard で `?v=<新しい updatedAt>` になり、ブラウザキャッシュをすり抜ける
- ロゴなし: `logoUrl` が null になり `<Image>` レンダリングされない (= 既存と同じ)

---

## 4. データモデル

### 4.1 Schema diff

```diff
 model Account {
   userId            String
   type              String
   provider          String
   providerAccountId String
-  refresh_token     String?
-  access_token      String?
   expires_at        Int?
   token_type        String?
   scope             String?
-  id_token          String?
   session_state     String?
   user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

   @@id([provider, providerAccountId])
 }

 model ExchangeToken {
   id         String    @id @default(cuid())
   cardId     String
   card       Card      @relation(fields: [cardId], references: [id], onDelete: Cascade)
-  token      String    @unique
+  tokenHash  String    @unique
   label      String?
   expiresAt  DateTime?
   disabled   Boolean   @default(false)
   usageCount Int       @default(0)
   lastUsedAt DateTime?
   createdAt  DateTime  @default(now())

   @@index([cardId])
 }
```

`Card.logoPath` のカラム自体は変更なし。意味だけ「絶対パス」→「ファイル名」に変える (string 値の解釈変更)。**migration 不要だが既存行 (dev DB) は値が `/uploads/<userId>/logo.png` のままなので、§6 でデータ書き換え or リセット**。

### 4.2 マイグレーション SQL の中身

`prisma migrate dev --name phase4_data_leak` 1 本にまとめる:

```sql
-- 1. ExchangeToken: 既存行を全削除 (tokenHash を後付けできないので NOT NULL UNIQUE を満たすため)
DELETE FROM "ExchangeToken";
ALTER TABLE "ExchangeToken" DROP COLUMN "token";
ALTER TABLE "ExchangeToken" ADD COLUMN "tokenHash" TEXT NOT NULL DEFAULT '';
-- SQLite の特性: DEFAULT '' にしないと既存行 (上で DELETE 済) との整合が ALTER 時に取れない処理系がある
CREATE UNIQUE INDEX "ExchangeToken_tokenHash_key" ON "ExchangeToken"("tokenHash");

-- 2. Account: トークン系を NULL 化 (念のため) してから DROP
UPDATE "Account" SET "refresh_token" = NULL, "access_token" = NULL, "id_token" = NULL;
ALTER TABLE "Account" DROP COLUMN "refresh_token";
ALTER TABLE "Account" DROP COLUMN "access_token";
ALTER TABLE "Account" DROP COLUMN "id_token";

-- 3. Card.logoPath: 旧 "/uploads/<userId>/logo.<ext>" 値を "logo.webp" に正規化 (D で webp 固定なので)
--    実ファイルは旧 ext のままなので app 起動前に手動で webp に変換するか、ユーザーに再アップロードを要求
UPDATE "Card"
SET "logoPath" = 'logo.webp'
WHERE "logoPath" IS NOT NULL AND "logoPath" != '';
```

**注意**: SQLite の `DROP COLUMN` は SQLite 3.35+ が必須。Prisma 6 + better-sqlite3 11 は対応済み。

---

## 5. 実装手順 (developer 向けの順序)

依存があるため**この順序で**実装。

1. **D (sharp) を先に入れる** (他の変更と独立)
   - `npm install sharp`
   - `src/lib/upload.ts` を書き換え (戻り値はまだ `/uploads/<userId>/logo.webp` で OK = 旧仕様維持)
   - 既存テストが通る範囲で動作確認

2. **C (auth) を先に: コード → migration**
   - `src/auth.config.ts` に `account()` callback 追加
   - 一度 `npm run dev` で Google ログインが動くことを手動で確認 (新規 Account row にトークン系が入らないこと)
   - その後 schema から DROP + `npm run db:migrate`
   - 既存 dev DB の Account 行は migration の `UPDATE ... NULL` で先に NULL 化されるので DROP 時に整合する

3. **B (token hash): schema migration → コード書き換え**
   - schema 変更 + `npm run db:migrate` (既存 ExchangeToken 行は全削除される)
   - `src/lib/exchange-token.ts` に `hashToken` 追加
   - `resolvePublicCard` を hash lookup に変更
   - `POST /api/tokens` で `hashToken` して保存し平文返却
   - `GET /api/tokens` のレスポンスから token を除外
   - dashboard 側: 発行直後の dialog に表示する token は POST レスポンスの平文を使う (既に同 flow 想定)

4. **A + F (URL 構造) を一括変更**
   - `saveLogo` の戻り値を `"logo.webp"` (ファイル名のみ) に変更
   - `Card.logoPath` の意味変更を伴うので、§4.2 の `UPDATE` を migration に含める (D の migration と一緒で OK、または手動でも可)
   - `src/app/u/[handle]/logo/route.ts` を新規追加
   - `src/app/uploads/[...path]/route.ts` を **削除**
   - `src/app/api/card/logo/route.ts` のレスポンスキーを `logoPath` → `logoUrl` に変更し、`/u/<handle>/logo?v=<unix>` を組み立てて返す (handle は session.user.id から card を引いて取得)
   - `PublicCardViewModel.logoPath` → `logoUrl` rename
   - `CardPreview` / `[handle]/page.tsx` / `vcard/route.ts` / `dashboard/page.tsx` / `dashboard/print/page.tsx` / `DashboardEditor.tsx` を全部書き換え

5. **E (handle-check 認証)**
   - 単独で完結。最後でよい

6. **テスト追加** (§7 参照)

7. **dev DB クリーンアップ** (任意)
   - 旧 `<UPLOAD_DIR>/<userId>/logo.png` 等の旧拡張子ファイルが残っていれば手動削除 (新規アップロードで自動上書きされるので必須ではない)

---

## 6. デプロイ手順 (Coolify 本番反映時)

1. PR マージ → Coolify が `docker build` 実行
2. builder で `npm ci` が走り sharp の musl prebuilt が install される
3. コンテナ起動時 `entrypoint.sh` の `prisma migrate deploy` が走り、Phase 4 migration が適用される
   - ExchangeToken 行が全削除される → **既存発行済 token の URL は全て 404 になる** (MVP 未公開なので影響軽微)
   - Account のトークンカラムが消える → 既存 Google ユーザーは JWT セッション継続なので再ログイン不要
   - Card.logoPath が `"logo.webp"` に書き換わる
4. 既存ロゴファイルの拡張子が `.png/.jpg` のままなら、初回 `/u/<handle>/logo` アクセスは 404 になる
   - 対処: ユーザーにダッシュボードから再アップロードを依頼 (sharp で webp 化される)
   - or: deploy 前に `<UPLOAD_DIR>/*/logo.{png,jpg,jpeg,webp}` を sharp で webp 一括変換するスクリプトを 1 度だけ走らせる (任意。MVP デプロイ前なので未アップロードなら不要)
5. デプロイ後の手動確認:
   - 新規 Magic Link ログイン
   - 新規 Google ログイン (Account row にトークン系が空)
   - public card のロゴ表示
   - private card 用 token を新規発行 → URL でアクセス → 200
   - 同じ URL から平文 token を抜いて `tokenHash` を DB で grep しても hex しか見えない
   - `/uploads/...` アクセスが 404
   - 未ログインで `/api/card/handle-check?h=foo` が 401

---

## 7. テスト基盤と追加観点

### 7.1 既存テスト基盤

- フレームワーク: **Vitest 4 + jsdom** (`vitest.config.ts`)
- 配置: `tests/unit/*.test.ts`, `tests/component/*.test.tsx`
- セットアップ: `tests/setup.ts` (`@testing-library/jest-dom/vitest` のみ)
- 既存ファイル: `vcard.test.ts`, `log.test.ts`, `handle.test.ts`, `qr.test.ts`, `theme.test.ts`, `zod-schemas.test.ts`, `SavedClient.test.tsx`, `PublicCard.test.tsx`

### 7.2 Phase 4 で追加すべきテスト (Reviewer がここからテスト生成)

#### `tests/unit/exchange-token.test.ts` (新規)

- `hashToken("abc")` が SHA-256 hex 64 文字を返す
- `hashToken(plain)` が同じ入力に対して同じ hex を返す (idempotent)
- `hashToken("abc")` と `hashToken("abd")` が異なる
- (resolvePublicCard は prisma mock 必要なので unit には入れず、E2E or 手動確認に回す)

#### `tests/unit/upload-sharp.test.ts` (新規)

- sharp で再エンコードした webp バッファに EXIF が含まれない (sharp の `metadata()` で確認、または `exif` プロパティが undefined)
- EXIF Orientation=6 の JPEG (横向きで撮影、回転 metadata 付き) を `saveLogo` 通すと、出力 webp の縦横が orientation 適用後になる
- 出力ファイル拡張子が `.webp` で固定
- magic bytes が webp 形式 (`RIFF....WEBP`)
- (storage 書き込みは fs を temp dir に向けるか、`writeFile` を vitest mock)

#### `tests/unit/handle-check-auth.test.ts` (新規 / 統合寄り)

- `auth()` が null を返すモック → GET /api/card/handle-check が 401
- `auth()` が user を返し rateLimit が true → 200 + JSON
- 同じ user で 31 回連続呼び → 31 回目が 429
- 別の user は別カウント (1 回目から 200)
- (auth と prisma を mock)

#### `tests/unit/vcard-logo-url.test.ts` (vcard.test.ts に追加でも可)

- public card で logoPath が `"logo.webp"` のとき `PHOTO;VALUE=URI:` 行に `https://<host>/u/<handle>/logo` が含まれる
- private card + token のとき `PHOTO;VALUE=URI:` に `?t=<token>` が含まれる
- logoPath が null のとき `PHOTO` 行が出ない

#### E2E or 手動 (Reviewer 判断)

以下は prisma + filesystem に依存するので chrome-devtools MCP での E2E、または手動で確認:

- `GET /uploads/...` が 404 (route 削除確認)
- 公開 card で `/u/<handle>/logo` が 200 + `Cache-Control: public, max-age=3600`
- private card で token なし → `/u/<handle>/logo` が 404
- private card で valid token → 200 + `Cache-Control: private, no-store`
- 同じ token を **disabled=true** にしてから `/u/<handle>/logo?t=...` → 404
- DB で `SELECT * FROM ExchangeToken` しても `token` カラムが存在せず `tokenHash` のみ
- DB で `SELECT * FROM Account` しても `refresh_token` / `access_token` / `id_token` カラムが存在しない
- Google 新規ログイン後、Account row のトークン系カラムが NULL (= スキーマから消えている)
- アップロードした JPEG (EXIF GPS 付きサンプル) を sharp 通した結果、`exiftool` で見て GPS が消えている
- 未ログインで `/api/card/handle-check?h=foo` → 401
- ログイン済で 31 連発 → 31 件目が 429

---

## 8. 設計判断ポイント (再掲)

| # | 論点 | 採用 | 理由 |
|---|---|---|---|
| 1 | vCard PHOTO は外部 URL or inline base64 | **外部 URL** | サイズ膨張回避、token 失効と連動可能 |
| 2 | handle-check の reason 詳細を返すか | **返す** (現状維持) | handle は元々公開、UX 上必要、認証 + rate limit で抑制十分 |
| 3 | logo URL は handle ベース or cardId ベース | **handle ベース** (`/u/<handle>/logo`) | URL から userId/cardId を排除、SEO リダイレクトと整合 |
| 4 | logo 出力 ext を入力 MIME に揃えるか | **webp 固定** | シンプル、品質十分、ロゴ用途に最適 |
| 5 | ExchangeToken hash は SHA-256 or bcrypt | **SHA-256** | token の高エントロピー (192bit) で十分、bcrypt は overhead だけ |
| 6 | token 移行は段階 or 一括リセット | **一括** | MVP 未公開、段階移行コストの方が高い |
| 7 | `/uploads/...` route を残すか削除か | **削除** | 互換不要、攻撃面を増やさない |

---

## 9. リスクと監視

- **既存ロゴファイルの拡張子問題**: 本番デプロイ時に dev からデータ移行する場合、`<userId>/logo.png` が残ったままだと `/u/<handle>/logo` が 404 になる。MVP 未公開のため再アップロード依頼でカバー。
- **sharp の OS 差分**: macOS dev では darwin prebuilt、Coolify alpine では musl prebuilt が必要。`npm install` 時に `--include=optional` で両方入れるか、`docker build` 内で再 install されるので普通は問題なし。CI 等が macOS で動く場合のみ要注意。
- **rate-limit の in-memory**: process restart で reset、複数 instance 化すると効かない。Coolify standalone 単一 instance 前提。Phase 5 でスケール時に Redis 化検討。

---

## 10. 不採用案まとめ (再検討ループ防止)

§3 の各セクション末尾にも書いたが、グローバルにここでも整理:

1. **ExchangeToken を bcrypt/argon2 ハッシュ**: token エントロピーが既に 192bit。辞書攻撃が物理不可能。SHA-256 で十分。
2. **vCard PHOTO inline base64**: vCard サイズ膨張 (1.4 倍)、token 失効連動不可。外部 URL を採用。
3. **SVG ロゴ受付追加**: XSS リスク、sanitize ライブラリ追加が必要。Phase 4 スコープ外。
4. **Token 平文 + tokenHash の hybrid 移行**: MVP 未公開、段階移行コストの方が高い。一括切り替え。
5. **Account レコード暗号化保存**: 復号鍵が同一サーバー、意味薄い。使ってないので消す。
6. **`/uploads/` route を残して内部認可**: URL から userId が消えない、Phase 4 主目的を満たさない。route ごと削除。
7. **logo URL を cardId ベース**: internal ID の URL 露出は不安定。handle ベースが自然。
8. **handle-check に CAPTCHA**: UX 悪化、外部依存追加。認証 + rate limit で十分。
9. **rate-limit を Redis 化**: Coolify standalone 単一 instance 前提。Phase 5 で検討。
10. **client-side EXIF 除去**: 信頼境界が逆。サーバ側で必ずやる。
