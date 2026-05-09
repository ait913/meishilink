"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { Button } from "@/components/ui/Button";
import { db } from "@/lib/dexie";

export function SavedClient() {
  const [sort, setSort] = useState<"savedAt" | "fullName">("savedAt");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const contacts = useLiveQuery(() => db.contacts.orderBy("savedAt").reverse().toArray(), []);

  const base = contacts ?? [];
  const keyword = deferredQuery.trim().toLowerCase();
  const next = keyword
    ? base.filter((entry) =>
        [entry.fullName, entry.company, entry.jobTitle, entry.email, entry.handle]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword),
      )
    : base;
  const filtered =
    sort === "fullName" ? [...next].sort((a, b) => a.fullName.localeCompare(b.fullName, "ja")) : next;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-lg shadow-neutral-200/60 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-neutral-500">閲覧者ローカル保存</p>
            <h1 className="text-3xl font-semibold">保存した連絡先 ({filtered.length})</h1>
          </div>
          <div className="grid gap-3 md:grid-cols-[12rem_1fr]">
            <label className="flex flex-col gap-2 text-sm text-neutral-700">
              <span className="font-medium">並び替え</span>
              <select
                className="min-h-11 rounded-2xl border border-neutral-300 bg-white px-4"
                onChange={(event) => setSort(event.target.value as "savedAt" | "fullName")}
                value={sort}
              >
                <option value="savedAt">新しい順</option>
                <option value="fullName">氏名順</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-neutral-700">
              <span className="font-medium">検索</span>
              <input
                className="min-h-11 rounded-2xl border border-neutral-300 bg-white px-4"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="氏名、会社名、メール"
                value={query}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((contact) => (
          <article className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-md shadow-neutral-200/50" key={contact.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-semibold">{contact.fullName}</h2>
                  <p className="text-neutral-500">{[contact.company, contact.jobTitle].filter(Boolean).join(" / ")}</p>
                </div>
                <div className="grid gap-1 text-sm text-neutral-700">
                  {contact.phone ? <p>TEL {contact.phone}</p> : null}
                  {contact.email ? <p>Mail {contact.email}</p> : null}
                  {contact.websiteUrl ? <p>Site {contact.websiteUrl}</p> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="inline-flex min-h-11 items-center rounded-2xl border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50" href={contact.sourceUrl} target="_blank">
                  元ページ
                </Link>
                <a className="inline-flex min-h-11 items-center rounded-2xl border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50" download href={`${contact.sourceUrl}/vcard`}>
                  vCard
                </a>
                <Button onClick={() => db.contacts.delete(contact.id)} variant="ghost">
                  削除
                </Button>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white/60 p-10 text-center text-neutral-500">
            まだ保存した連絡先がありません。
          </div>
        ) : null}
      </div>
    </section>
  );
}
