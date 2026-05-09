"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";

import { CardPreview } from "@/components/card/CardPreview";
import type { PublicCardViewModel } from "@/components/card/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { ExchangeQuickDialog } from "@/app/(owner)/dashboard/ExchangeQuickDialog";
import { StatsPanel } from "@/app/(owner)/dashboard/StatsPanel";
import { updateCardAction } from "@/app/(owner)/dashboard/actions";
import { humanizeError } from "@/lib/error-messages";
import type { StatsResponse } from "@/lib/stats";
import { THEMES, getTheme } from "@/lib/theme";
import { CardInputSchema, type CardInput, getDisplayName } from "@/lib/zod-schemas";

type Props = {
  card: PublicCardViewModel & { isPrivate: boolean };
  stats: StatsResponse;
  publicUrl: string;
  baseUrl: string;
};

type TabKey = "edit" | "stats";

export function DashboardEditor({ card, publicUrl, baseUrl, stats }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const initialTab: TabKey = (() => {
    const t = searchParams.get("tab");
    if (t === "exchange") {
      // 旧 deep link は新クイック交換モーダルで開く
      return "edit";
    }
    if (t === "stats") return t;
    return "edit";
  })();
  const openExchangeOnMount = searchParams.get("tab") === "exchange";
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [savePending, startSaveTransition] = useTransition();
  const [uploadPending, startUploadTransition] = useTransition();
  const [logoPath, setLogoPath] = useState(card.logoPath ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [exchangeOpen, setExchangeOpen] = useState(openExchangeOnMount);

  const form = useForm<CardInput>({
    resolver: zodResolver(CardInputSchema),
    defaultValues: {
      displayName: card.displayName ?? "",
      lastName: card.lastName ?? "",
      firstName: card.firstName ?? "",
      lastNameKana: card.lastNameKana ?? "",
      firstNameKana: card.firstNameKana ?? "",
      company: card.company ?? "",
      department: card.department ?? "",
      jobTitle: card.jobTitle ?? "",
      phone: card.phone ?? "",
      email: card.email ?? "",
      postalCode: card.postalCode ?? "",
      address: card.address ?? "",
      websiteUrl: card.websiteUrl ?? "",
      poem: card.poem ?? "",
      profile: card.profile ?? "",
      snsLinks: card.snsLinks,
      themeKey: (card.themeKey as CardInput["themeKey"]) ?? "minimal",
      paletteKey: card.paletteKey ?? "",
      fontKey: (card.fontKey as CardInput["fontKey"]) ?? "sans",
      accentColor: card.accentColor,
      isPublished: card.isPublished,
      isPrivate: card.isPrivate,
    },
  });
  const snsLinks = useFieldArray({ control: form.control, name: "snsLinks" });

  const watched = form.watch();
  // テーマ切替時にパレット未一致なら最初のパレットへ自動リセット
  const currentTheme = getTheme(watched.themeKey ?? "minimal");
  const palettesAvailable = currentTheme.palettes;
  const selectedPaletteKey =
    palettesAvailable.find((p) => p.key === watched.paletteKey)?.key ?? palettesAvailable[0].key;

  const previewCard: PublicCardViewModel = {
    ...card,
    ...watched,
    fullName: getDisplayName(watched) || card.handle,
    paletteKey: selectedPaletteKey,
    logoPath,
    snsLinks: watched.snsLinks ?? [],
  };

  function onSave(values: CardInput) {
    startSaveTransition(async () => {
      const result = await updateCardAction(values);
      if (!result.ok) {
        toast.push(humanizeError(result.error, "保存に失敗しました。"), "error");
        return;
      }
      toast.push("保存しました", "success");
      router.refresh();
    });
  }

  function uploadLogo() {
    if (!logoFile) {
      toast.push("ファイルを選択してください", "info");
      return;
    }

    startUploadTransition(async () => {
      const formData = new FormData();
      formData.append("file", logoFile);
      const response = await fetch("/api/card/logo", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({ error: "upload failed" }))) as {
        logoPath?: string;
        error?: string;
      };
      if (!response.ok || !data.logoPath) {
        toast.push(humanizeError(data.error, "アップロードに失敗しました。"), "error");
        return;
      }

      setLogoPath(data.logoPath);
      toast.push("ロゴを更新しました", "success");
      router.refresh();
    });
  }

  const tabs = [
    { key: "edit" as const, label: "編集" },
    { key: "stats" as const, label: "統計" },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-lg shadow-neutral-200/60 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-neutral-500">MeishiLink</p>
            <h1 className="text-3xl font-semibold">/{card.handle}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setExchangeOpen(true)}>🔁 交換する</Button>
            {tabs.map((item) => (
              <Button key={item.key} onClick={() => setTab(item.key)} variant={tab === item.key ? "primary" : "secondary"}>
                {item.label}
              </Button>
            ))}
            <a className="inline-flex min-h-11 items-center rounded-2xl border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50" href="/dashboard/templates">
              テンプレ
            </a>
            <a className="inline-flex min-h-11 items-center rounded-2xl border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50" href="/dashboard/print">
              印刷
            </a>
          </div>
        </div>
      </header>

      {tab === "edit" ? (
        <div className="dashboard-grid">
          <form className="space-y-5 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60" onSubmit={form.handleSubmit(onSave)}>
            <Input
              error={form.formState.errors.displayName?.message}
              label="表示名 (必須) ─ ニックネーム / 氏名 / 屋号"
              placeholder="例: 山田 太郎、tanaka、@kosen"
              {...form.register("displayName")}
            />
            <details className="rounded-2xl border border-neutral-200 bg-white/60 p-4">
              <summary className="cursor-pointer text-sm font-medium text-neutral-700">
                氏名 (姓・名) を分けて入力する (任意 — vCard で姓名フィールドに分割保存されます)
              </summary>
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input error={form.formState.errors.lastName?.message} label="氏名 (姓)" {...form.register("lastName")} />
                  <Input error={form.formState.errors.firstName?.message} label="氏名 (名)" {...form.register("firstName")} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input error={form.formState.errors.lastNameKana?.message} label="振り仮名 (姓)" {...form.register("lastNameKana")} />
                  <Input error={form.formState.errors.firstNameKana?.message} label="振り仮名 (名)" {...form.register("firstNameKana")} />
                </div>
              </div>
            </details>
            <Input error={form.formState.errors.company?.message} label="会社名" {...form.register("company")} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input error={form.formState.errors.department?.message} label="部署" {...form.register("department")} />
              <Input error={form.formState.errors.jobTitle?.message} label="役職" {...form.register("jobTitle")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input error={form.formState.errors.phone?.message} label="TEL" {...form.register("phone")} />
              <Input error={form.formState.errors.email?.message} label="Email" {...form.register("email")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input error={form.formState.errors.postalCode?.message} label="郵便番号" {...form.register("postalCode")} />
              <Input error={form.formState.errors.websiteUrl?.message} label="サイトリンク" {...form.register("websiteUrl")} />
            </div>
            <Textarea error={form.formState.errors.address?.message} label="住所" rows={3} {...form.register("address")} />
            <Textarea error={form.formState.errors.poem?.message} label="ポエム" rows={3} {...form.register("poem")} />
            <Textarea error={form.formState.errors.profile?.message} label="プロフィール" rows={4} {...form.register("profile")} />

            <div className="space-y-3 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-neutral-900">SNS リンク</p>
                  <p className="text-sm text-neutral-500">最大 10 件</p>
                </div>
                <Button onClick={() => snsLinks.append({ label: "", url: "" })} type="button" variant="secondary">
                  追加
                </Button>
              </div>
              {snsLinks.fields.map((field, index) => (
                <div className="grid gap-3 md:grid-cols-[11rem_1fr_auto]" key={field.id}>
                  <Input label="ラベル" {...form.register(`snsLinks.${index}.label`)} />
                  <Input label="URL" {...form.register(`snsLinks.${index}.url`)} />
                  <div className="flex items-end">
                    <Button onClick={() => snsLinks.remove(index)} type="button" variant="ghost">
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-neutral-700">
                  <span className="font-medium">テンプレート</span>
                  <select className="min-h-11 rounded-2xl border border-neutral-300 bg-white px-4" {...form.register("themeKey")}>
                    {Object.values(THEMES).map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-neutral-700">
                  <span className="font-medium">フォント</span>
                  <select className="min-h-11 rounded-2xl border border-neutral-300 bg-white px-4" {...form.register("fontKey")}>
                    <option value="sans">sans (現代)</option>
                    <option value="serif">serif (明朝)</option>
                    <option value="mincho">mincho (明朝)</option>
                    <option value="gothic">gothic (ゴシック)</option>
                    <option value="round">round (丸ゴ)</option>
                    <option value="display">display (Cormorant)</option>
                    <option value="mono">mono (JetBrains Mono)</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-2 text-sm text-neutral-700">
                <span className="font-medium">カラーパレット</span>
                <div className="flex flex-wrap gap-2">
                  {palettesAvailable.map((p) => {
                    const active = p.key === selectedPaletteKey;
                    return (
                      <button
                        aria-label={p.label}
                        className={`flex flex-col items-center gap-1 rounded-2xl border p-2 transition ${
                          active
                            ? "border-neutral-950 bg-white shadow-sm"
                            : "border-neutral-200 bg-white/60 hover:border-neutral-400"
                        }`}
                        key={p.key}
                        onClick={() => form.setValue("paletteKey", p.key, { shouldDirty: true })}
                        title={p.label}
                        type="button"
                      >
                        <span
                          className="flex h-10 w-16 items-center justify-center rounded-xl border"
                          style={{ backgroundColor: p.bg, borderColor: p.border }}
                        >
                          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: p.accent }} />
                        </span>
                        <span className="text-[11px] text-neutral-700">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input error={form.formState.errors.accentColor?.message} label="アクセント色 (パレットを上書き)" type="color" {...form.register("accentColor")} />
            </div>

            <label className="flex items-center gap-3 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <input className="h-4 w-4" type="checkbox" {...form.register("isPublished")} />
              公開状態にする
            </label>

            <label className="flex flex-col gap-2 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-neutral-800">
              <span className="flex items-center gap-3">
                <input className="h-4 w-4" type="checkbox" {...form.register("isPrivate")} />
                <span className="font-medium">プライバシーモードを ON</span>
              </span>
              <span className="text-xs text-neutral-600">
                ON にすると公開 URL に交換用トークンが必要になり、トークン無しのアクセスは 404 になります。
                対面で会った人とだけ共有したいときに。「交換する」タブからトークン発行・QR 表示できます。
              </span>
            </label>

            <div className="space-y-3 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <label className="flex-1 text-sm text-neutral-700">
                  <span className="mb-2 block font-medium">ロゴ画像</span>
                  <input
                    accept="image/png,image/jpeg,image/webp"
                    className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3"
                    onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                    type="file"
                  />
                </label>
                <Button loading={uploadPending} onClick={uploadLogo} type="button" variant="secondary">
                  ロゴをアップロード
                </Button>
              </div>
            </div>

            <Button fullWidth loading={savePending} type="submit">
              {savePending ? "保存中..." : "保存"}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60">
              <p className="mb-4 text-sm text-neutral-500">プレビュー</p>
              <CardPreview card={previewCard} />
            </div>
          </div>
        </div>
      ) : null}

      {tab === "stats" ? <StatsPanel stats={stats} /> : null}

      <ExchangeQuickDialog
        baseUrl={baseUrl}
        handle={card.handle}
        isPrivate={Boolean(watched.isPrivate ?? card.isPrivate)}
        onClose={() => setExchangeOpen(false)}
        open={exchangeOpen}
      />
    </div>
  );
}

