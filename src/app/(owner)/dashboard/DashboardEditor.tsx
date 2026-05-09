"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";

import { CardPreview } from "@/components/card/CardPreview";
import type { PublicCardViewModel } from "@/components/card/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { QrPanel } from "@/app/(owner)/dashboard/QrPanel";
import { StatsPanel } from "@/app/(owner)/dashboard/StatsPanel";
import { updateCardAction } from "@/app/(owner)/dashboard/actions";
import type { StatsResponse } from "@/lib/stats";
import { CardInputSchema, type CardInput } from "@/lib/zod-schemas";

type Props = {
  card: PublicCardViewModel;
  stats: StatsResponse;
  publicUrl: string;
  qrPngDataUrl: string;
  qrSvgString: string;
};

type TabKey = "edit" | "qr" | "stats";

export function DashboardEditor({ card, publicUrl, qrPngDataUrl, qrSvgString, stats }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("edit");
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [logoPath, setLogoPath] = useState(card.logoPath ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<CardInput>({
    resolver: zodResolver(CardInputSchema),
    defaultValues: {
      lastName: card.lastName,
      firstName: card.firstName,
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
      fontKey: (card.fontKey as CardInput["fontKey"]) ?? "sans",
      accentColor: card.accentColor,
      isPublished: card.isPublished,
    },
  });
  const snsLinks = useFieldArray({ control: form.control, name: "snsLinks" });

  const previewCard: PublicCardViewModel = {
    ...card,
    ...form.watch(),
    logoPath,
    snsLinks: form.watch("snsLinks") ?? [],
  };

  async function onSave(values: CardInput) {
    setSaveMessage("");
    const result = await updateCardAction(values);
    if (!result.ok) {
      setSaveMessage(result.error);
      return;
    }
    setSaveMessage("保存しました");
    router.refresh();
  }

  async function uploadLogo() {
    if (!logoFile) {
      setUploadMessage("ファイルを選択してください");
      return;
    }

    const formData = new FormData();
    formData.append("file", logoFile);
    const response = await fetch("/api/card/logo", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json().catch(() => ({ error: "アップロードに失敗しました" }))) as {
      logoPath?: string;
      error?: string;
    };
    if (!response.ok || !data.logoPath) {
      setUploadMessage(data.error ?? "アップロードに失敗しました");
      return;
    }

    setLogoPath(data.logoPath);
    setUploadMessage("ロゴを更新しました");
    router.refresh();
  }

  const tabs = [
    { key: "edit" as const, label: "編集" },
    { key: "qr" as const, label: "QR" },
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
          <form className="space-y-5 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60" onSubmit={form.handleSubmit((values) => startTransition(() => void onSave(values)))}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input error={form.formState.errors.lastName?.message} label="氏名 (姓)" {...form.register("lastName")} />
              <Input error={form.formState.errors.firstName?.message} label="氏名 (名)" {...form.register("firstName")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input error={form.formState.errors.lastNameKana?.message} label="振り仮名 (姓)" {...form.register("lastNameKana")} />
              <Input error={form.formState.errors.firstNameKana?.message} label="振り仮名 (名)" {...form.register("firstNameKana")} />
            </div>
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

            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm text-neutral-700">
                <span className="font-medium">テンプレート</span>
                <select className="min-h-11 rounded-2xl border border-neutral-300 bg-white px-4" {...form.register("themeKey")}>
                  <option value="minimal">minimal</option>
                  <option value="mono">mono</option>
                  <option value="warm">warm</option>
                  <option value="navy">navy</option>
                  <option value="sakura">sakura</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-neutral-700">
                <span className="font-medium">フォント</span>
                <select className="min-h-11 rounded-2xl border border-neutral-300 bg-white px-4" {...form.register("fontKey")}>
                  <option value="sans">sans</option>
                  <option value="serif">serif</option>
                  <option value="mincho">mincho</option>
                  <option value="gothic">gothic</option>
                  <option value="round">round</option>
                </select>
              </label>
              <Input error={form.formState.errors.accentColor?.message} label="アクセント色" type="color" {...form.register("accentColor")} />
            </div>

            <label className="flex items-center gap-3 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <input className="h-4 w-4" type="checkbox" {...form.register("isPublished")} />
              公開状態にする
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
                <Button onClick={() => void uploadLogo()} type="button" variant="secondary">
                  ロゴをアップロード
                </Button>
              </div>
              {uploadMessage ? <p className="text-sm text-neutral-600">{uploadMessage}</p> : null}
            </div>

            {saveMessage ? <p className="text-sm text-neutral-600">{saveMessage}</p> : null}
            <Button fullWidth type="submit">
              保存
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

      {tab === "qr" ? <QrPanel pngDataUrl={qrPngDataUrl} publicUrl={publicUrl} svgString={qrSvgString} /> : null}
      {tab === "stats" ? <StatsPanel stats={stats} /> : null}
    </div>
  );
}

