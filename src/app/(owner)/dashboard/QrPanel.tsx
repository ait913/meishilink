"use client";

type Props = {
  publicUrl: string;
  pngDataUrl: string;
  svgString: string;
};

export function QrPanel({ publicUrl, pngDataUrl, svgString }: Props) {
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

  return (
    <section className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60">
      <div>
        <p className="text-sm text-neutral-500">公開 URL</p>
        <p className="mt-2 break-all text-lg font-medium text-neutral-950">{publicUrl}</p>
      </div>
      <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5">
        <img alt="MeishiLink QR code" className="mx-auto h-56 w-56 rounded-2xl" src={pngDataUrl} />
      </div>
      <div className="flex flex-wrap gap-3">
        <a className="inline-flex min-h-11 items-center rounded-2xl bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800" download="meishilink-qr.png" href={pngDataUrl}>
          PNG をダウンロード
        </a>
        <a className="inline-flex min-h-11 items-center rounded-2xl border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50" download="meishilink-qr.svg" href={svgUrl}>
          SVG をダウンロード
        </a>
      </div>
    </section>
  );
}

