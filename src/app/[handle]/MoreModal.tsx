"use client";

import { Modal } from "@/components/ui/Modal";

export function MoreModal({
  onClose,
  open,
  poem,
  profile,
  snsLinks,
}: {
  open: boolean;
  onClose: () => void;
  poem?: string | null;
  profile?: string | null;
  snsLinks: Array<{ label: string; url: string }>;
}) {
  return (
    <Modal onClose={onClose} open={open} title="もっと見る">
      <div className="space-y-6">
        {poem ? (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-neutral-500">ポエム</h3>
            <p className="whitespace-pre-wrap text-neutral-900">{poem}</p>
          </section>
        ) : null}
        {profile ? (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-neutral-500">プロフィール</h3>
            <p className="whitespace-pre-wrap text-neutral-900">{profile}</p>
          </section>
        ) : null}
        {snsLinks.length > 0 ? (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-neutral-500">SNS リンク</h3>
            <div className="grid gap-2">
              {snsLinks.map((link) => (
                <a className="rounded-2xl border border-neutral-200 px-4 py-3 hover:bg-neutral-50" href={link.url} key={`${link.label}:${link.url}`} rel="noreferrer" target="_blank">
                  <span className="font-medium">{link.label}</span>
                  <span className="ml-2 break-all text-sm text-neutral-500">{link.url}</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </Modal>
  );
}

