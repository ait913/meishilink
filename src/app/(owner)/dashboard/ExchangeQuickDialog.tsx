"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { humanizeError } from "@/lib/error-messages";

type Props = {
  baseUrl: string;
  handle: string;
  isPrivate: boolean;
  open: boolean;
  onClose: () => void;
};

type Token = { token: string; disabled: boolean; label: string | null };

export function ExchangeQuickDialog({ baseUrl, handle, isPrivate, open, onClose }: Props) {
  const toast = useToast();
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [qrPng, setQrPng] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusLine, setStatusLine] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!isPrivate) {
      setActiveToken(null);
      setActiveLabel(null);
      setStatusLine("通常モード: URL を知る人なら誰でも閲覧できます");
      return;
    }
    setLoading(true);
    setStatusLine("プライバシーモード: 交換トークンを準備中...");
    void (async () => {
      try {
        const res = await fetch("/api/tokens", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as { tokens?: Token[] };
        const found = (data.tokens ?? []).find((t) => !t.disabled);
        if (found) {
          setActiveToken(found.token);
          setActiveLabel(found.label);
          setStatusLine(`プライバシーモード ON: 「${found.label || "(ラベルなし)"}」 を使用中`);
          return;
        }
        const issued = await fetch("/api/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: "即時交換" }),
        });
        const issuedData = (await issued.json().catch(() => ({}))) as {
          token?: string;
          label?: string | null;
          error?: string;
        };
        if (!issued.ok || !issuedData.token) {
          throw new Error(issuedData.error ?? "issue failed");
        }
        setActiveToken(issuedData.token);
        setActiveLabel(issuedData.label ?? "即時交換");
        setStatusLine("プライバシーモード ON: 新しいトークン「即時交換」を発行しました");
      } catch (e) {
        toast.push(humanizeError((e as Error).message, "トークン取得に失敗しました"), "error");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [open, isPrivate, onClose, toast]);

  const url = isPrivate
    ? activeToken
      ? `${baseUrl}/${handle}?t=${encodeURIComponent(activeToken)}`
      : ""
    : `${baseUrl}/${handle}`;

  useEffect(() => {
    if (!url) {
      setQrPng(null);
      return;
    }
    let cancel = false;
    QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 1, scale: 8 })
      .then((d) => {
        if (!cancel) setQrPng(d);
      })
      .catch(() => {
        if (!cancel) setQrPng(null);
      });
    return () => {
      cancel = true;
    };
  }, [url]);

  if (!open) return null;

  return (
    <div
      aria-label="交換用 QR コード"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="w-full max-w-md space-y-4 rounded-[2rem] bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className={`text-sm ${
            isPrivate ? "text-amber-700" : "text-neutral-500"
          }`}
        >
          {statusLine}
        </p>
        {qrPng ? (
          <img
            alt="QR code"
            className="mx-auto aspect-square w-full max-w-[18rem] rounded-2xl"
            src={qrPng}
          />
        ) : (
          <div className="mx-auto flex aspect-square w-full max-w-[18rem] animate-pulse items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
            {loading ? "準備中..." : "生成中..."}
          </div>
        )}
        <p className="break-all rounded-2xl bg-neutral-50 px-3 py-2 text-xs text-neutral-700">{url}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {qrPng ? (
            <a
              className="inline-flex min-h-11 items-center rounded-2xl bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800"
              download={`meishilink-${handle}${activeLabel ? `-${activeLabel}` : ""}.png`}
              href={qrPng}
            >
              PNG をダウンロード
            </a>
          ) : null}
          <Button onClick={onClose} variant="secondary">
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}
