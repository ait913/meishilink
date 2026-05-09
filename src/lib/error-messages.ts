const MESSAGES: Record<string, string> = {
  unauthorized: "セッションの有効期限が切れました。もう一度ログインしてください。",
  "card already exists": "すでに名刺が登録されています。",
  "card not found, do onboarding": "名刺が未登録です。最初に作成してください。",
  invalid: "入力内容を確認してください。",
  "handle taken": "そのハンドルは使えません。別の文字列を試してください。",
  "create failed": "保存に失敗しました。時間をおいてもう一度お試しください。",
  "update failed": "更新に失敗しました。時間をおいてもう一度お試しください。",
  "too large": "ファイルサイズが大きすぎます。2MB 以下の画像を選んでください。",
  "unsupported mime": "対応していないファイル形式です。PNG/JPG/WebP のいずれかをアップロードしてください。",
  "upload failed": "アップロードに失敗しました。時間をおいてもう一度お試しください。",
  "no file": "ファイルが選択されていません。",
};

export function humanizeError(code?: string | null, fallback = "エラーが発生しました。時間をおいてもう一度お試しください。"): string {
  if (!code) return fallback;
  return MESSAGES[code] ?? fallback;
}
