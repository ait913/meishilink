"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { humanizeError } from "@/lib/error-messages";

type Token = {
  id: string;
  token: string;
  label: string | null;
  expiresAt: string | null;
  disabled: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
};

type Props = {
  baseUrl: string;
  handle: string;
  isPrivate: boolean;
  initialTokens: Token[];
};

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("ja-JP", { hour12: false }) : "—";

function buildShareUrl(baseUrl: string, handle: string, token?: string | null) {
  return token ? `${baseUrl}/${handle}?t=${encodeURIComponent(token)}` : `${baseUrl}/${handle}`;
}

export function ExchangePanel({ baseUrl, handle, isPrivate, initialTokens }: Props) {
  const toast = useToast();
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [activeTokenId, setActiveTokenId] = useState<string | null>(initialTokens.find((t) => !t.disabled)?.id ?? null);
  const [labelInput, setLabelInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [qrPng, setQrPng] = useState<string | null>(null);

  const activeToken = useMemo(() => tokens.find((t) => t.id === activeTokenId) ?? null, [tokens, activeTokenId]);
  const shareUrl = isPrivate
    ? buildShareUrl(baseUrl, handle, activeToken?.token)
    : buildShareUrl(baseUrl, handle);

  useEffect(() => {
    if (!shareUrl) {
      setQrPng(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(shareUrl, { errorCorrectionLevel: "M", margin: 1, scale: 8 })
      .then((dataUrl) => {
        if (!cancelled) setQrPng(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrPng(null);
      });
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  async function refresh() {
    const res = await fetch("/api/tokens", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { tokens: Token[] };
    setTokens(data.tokens);
  }

  function issueToken(label?: string) {
    startTransition(async () => {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label ?? "" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string } & Token;
      if (!res.ok) {
        toast.push(humanizeError(data.error, "トークン発行に失敗しました。"), "error");
        return;
      }
      setTokens((prev) => [data as Token, ...prev]);
      setActiveTokenId((data as Token).id);
      setLabelInput("");
      setModalOpen(true);
      toast.push("交換トークンを発行しました", "success");
    });
  }

  function disableToken(id: string) {
    if (!confirm("このトークンを失効させますか? 失効後は再有効化できません。")) return;
    startTransition(async () => {
      const res = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.push("失効に失敗しました。", "error");
        return;
      }
      await refresh();
      if (activeTokenId === id) setActiveTokenId(null);
      toast.push("トークンを失効しました", "success");
    });
  }

  return (
    <section className="space-y-5 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60">
      {/* 大きい「交換する」ボタン */}
      <Button
        fullWidth
        onClick={() => {
          if (isPrivate && !activeToken) {
            issueToken();
          } else {
            setModalOpen(true);
          }
        }}
      >
        {isPrivate && !activeToken ? "交換用トークンを発行して QR を表示" : "🔁 交換する (QR を表示)"}
      </Button>

      <div className="grid gap-2 text-sm text-neutral-700">
        <p className="text-neutral-500">公開 URL</p>
        <p className="break-all font-medium text-neutral-950">{shareUrl}</p>
        {isPrivate ? (
          <p className="text-xs text-amber-700">
            プライバシーモード ON: 上記 URL は **トークン付きで共有された人だけ** 閲覧できます。
          </p>
        ) : (
          <p className="text-xs text-neutral-500">通常モード: URL を知る人なら誰でも閲覧できます。</p>
        )}
      </div>

      {isPrivate ? (
        <div className="space-y-3 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-end gap-2">
            <Input
              label="新しい交換トークン"
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="例: tech-meetup-2026 / 8月オフ会"
              value={labelInput}
            />
            <Button loading={pending} onClick={() => issueToken(labelInput)} variant="secondary">
              発行
            </Button>
          </div>

          {tokens.length > 0 ? (
            <ul className="divide-y divide-neutral-200">
              {tokens.map((t) => (
                <li className="flex flex-wrap items-center gap-3 py-2 text-sm" key={t.id}>
                  <button
                    className={`inline-flex flex-1 flex-col items-start rounded-xl px-3 py-2 text-left transition ${
                      activeTokenId === t.id ? "bg-neutral-100" : "hover:bg-neutral-100/60"
                    } ${t.disabled ? "opacity-50" : ""}`}
                    disabled={t.disabled}
                    onClick={() => setActiveTokenId(t.id)}
                    type="button"
                  >
                    <span className="font-medium text-neutral-950">
                      {t.label || "(ラベルなし)"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      使用 {t.usageCount} 回 · {formatDateTime(t.createdAt)}
                      {t.disabled ? " · 失効済" : ""}
                    </span>
                  </button>
                  {!t.disabled ? (
                    <Button onClick={() => disableToken(t.id)} variant="ghost">
                      失効
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-neutral-500">まだトークンがありません。「発行」を押して 1 つ作ると、その QR を共有できます。</p>
          )}
        </div>
      ) : null}


      {/* QR モーダル */}
      {modalOpen ? (
        <div
          aria-label="交換用 QR コード"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setModalOpen(false)}
          role="dialog"
        >
          <div
            className="w-full max-w-md space-y-4 rounded-[2rem] bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-neutral-500">
              {isPrivate ? `交換トークン: ${activeToken?.label || "(ラベルなし)"}` : "公開 URL の QR"}
            </p>
            {qrPng ? (
              <img alt="QR code" className="mx-auto aspect-square w-full max-w-[18rem] rounded-2xl" src={qrPng} />
            ) : (
              <div className="flex aspect-square w-full max-w-[18rem] mx-auto items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                生成中...
              </div>
            )}
            <p className="break-all text-xs text-neutral-500">{shareUrl}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {qrPng ? (
                <a
                  className="inline-flex min-h-11 items-center rounded-2xl bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800"
                  download={`meishilink-${handle}${activeToken ? `-${activeToken.label || activeToken.id}` : ""}.png`}
                  href={qrPng}
                >
                  PNG をダウンロード
                </a>
              ) : null}
              <Button onClick={() => setModalOpen(false)} variant="secondary">
                閉じる
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
