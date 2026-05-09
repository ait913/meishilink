"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { humanizeError } from "@/lib/error-messages";
import { defaultCardInput, type CardInput, CardInputSchema } from "@/lib/zod-schemas";

type HandleStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function OnboardingForm({ baseHost = "meishilink.appily.run" }: { baseHost?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [handleValue, setHandleValue] = useState("");
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [handleMessage, setHandleMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const form = useForm<CardInput>({
    resolver: zodResolver(CardInputSchema),
    defaultValues: defaultCardInput,
  });

  const snsLinks = useFieldArray({
    control: form.control,
    name: "snsLinks",
  });

  async function checkHandle() {
    if (!handleValue.trim()) {
      setHandleStatus("invalid");
      setHandleMessage("handle を入力してください");
      return;
    }

    setHandleStatus("checking");
    const response = await fetch(`/api/card/handle-check?h=${encodeURIComponent(handleValue)}`);
    const data = (await response.json()) as {
      normalized: string;
      valid: boolean;
      reserved: boolean;
      available: boolean;
      reason?: string;
    };

    if (!data.valid) {
      setHandleStatus("invalid");
      setHandleMessage(data.reason ?? "形式が不正です");
      return;
    }

    if (!data.available) {
      setHandleStatus("taken");
      setHandleMessage(data.reserved ? "予約語です" : "既に使われています");
      return;
    }

    setHandleStatus("available");
    setHandleMessage(`使えます: ${data.normalized}`);
    setHandleValue(data.normalized);
  }

  function onSubmit(values: CardInput) {
    setSubmitError("");
    startTransition(async () => {
      const response = await fetch("/api/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: handleValue,
          ...values,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const data = (await response.json().catch(() => ({ error: "create failed" }))) as { error?: string };
      setSubmitError(humanizeError(data.error, "保存に失敗しました。時間をおいてもう一度お試しください。"));
    });
  }

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/70">
      <div className="mb-6 space-y-2">
        <p className="text-sm text-neutral-500">MeishiLink へようこそ</p>
        <h1 className="text-3xl font-semibold">あなたの URL を決めましょう</h1>
        <p className="text-sm text-neutral-500">handle は変更不可です。</p>
      </div>

      <div className="mb-6 space-y-3 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
        <label className="flex flex-col gap-2 text-sm text-neutral-700">
          <span className="font-medium">公開 URL</span>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex min-h-11 items-center rounded-2xl border border-neutral-200 bg-white px-4 text-neutral-500">
              {baseHost}/
            </div>
            <input
              className="min-h-11 flex-1 rounded-2xl border border-neutral-300 bg-white px-4 text-neutral-950"
              onChange={(event) => {
                setHandleValue(event.target.value);
                setHandleStatus("idle");
                setHandleMessage("");
              }}
              placeholder="yamada-taro"
              value={handleValue}
            />
            <Button disabled={pending} onClick={() => void checkHandle()} type="button" variant="secondary">
              空きを確認
            </Button>
          </div>
        </label>
        {handleStatus !== "idle" ? (
          <p className={`text-sm ${handleStatus === "available" ? "text-emerald-600" : handleStatus === "checking" ? "text-neutral-500" : "text-red-600"}`}>
            {handleStatus === "checking" ? "確認中..." : handleMessage}
          </p>
        ) : null}
      </div>

      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
            <Button
              onClick={() => snsLinks.append({ label: "", url: "" })}
              type="button"
              variant="secondary"
            >
              追加
            </Button>
          </div>
          <div className="grid gap-3">
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

        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
        <Button disabled={pending || handleStatus !== "available"} fullWidth type="submit">
          {pending ? "作成中..." : "名刺を作成"}
        </Button>
      </form>
    </div>
  );
}

