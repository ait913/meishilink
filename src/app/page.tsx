import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { MeishiLogo } from "@/components/icons/MeishiLogo";
import { auth } from "@/auth";

const useCases = [
  {
    image: "/lp/usecase-out-of-cards.png",
    label: "01",
    title: "名刺を切らした、忘れた。",
    body: "QR を見せるだけで連絡先を渡せる。スーツの内ポケットを探す代わりに、画面を見せる。受け取った相手はその場で連絡先アプリに保存できます。",
    keyword: "QR",
  },
  {
    image: "/lp/usecase-event.png",
    label: "02",
    title: "交流会・イベントで一発交換。",
    body: "名刺の束をめくらず、スマホを向け合うだけ。1 タップで相手の URL を開いて、その場で「ローカルに保存」。後で誰だっけがなくなる。",
    keyword: "Networking",
  },
  {
    image: "/lp/usecase-manage.png",
    label: "03",
    title: "受け取った名刺を、スマホに集約。",
    body: "MeishiLink で受け取った相手の情報は、登録不要でスマホ内に保存。会社名や役職で検索、vCard で連絡先アプリに直接書き出しもできる。",
    keyword: "Manage",
  },
];

const features = [
  {
    title: "QR コードで渡す",
    body: "公開 URL から自動生成。名刺裏に印刷しても、ロック画面のウィジェットに置いてもいい。",
  },
  {
    title: "vCard で連絡先に直接保存",
    body: "閲覧側は登録不要。タップ一つで iPhone/Android の連絡先アプリに名前・会社・電話・メールが書き込まれます。",
  },
  {
    title: "5 種類のテンプレート",
    body: "ミニマル、モノクロ、ウォーム、ネイビー、さくら。フォントとアクセント色も切り替え可能。",
  },
  {
    title: "受け取った名刺をスマホ内に保存",
    body: "閲覧者として開いた名刺をスマホ内に保存し、会社名や名前で検索。自分用の名刺帳になります。",
  },
  {
    title: "アクセス統計",
    body: "誰がいつ見たかは分からないけれど、何回見られたかは分かる。記事の反応みたいに。",
  },
  {
    title: "印刷もできる",
    body: "紙名刺としても出力できます。A4 シート (10 面) や 1 枚単位でブラウザから直接プリント。",
  },
];

const steps = [
  { n: "01", title: "メールでログイン", body: "ご利用のメールアドレスでサインアップ。Google アカウントでも始められます。" },
  { n: "02", title: "名刺情報を入力", body: "氏名・会社・連絡先・SNS リンクなど。後からいつでも編集できます。" },
  { n: "03", title: "URL と QR をシェア", body: "あなた専用の公開 URL が完成。QR を保存して、名刺裏や SNS プロフィールに置きましょう。" },
];

const faqs = [
  {
    q: "紙の名刺はもう要らなくなりますか?",
    a: "場面によります。年配の取引先や保守的な業界では紙の方がスムーズなことも。MeishiLink は紙名刺と併用しやすいよう、QR を紙に印刷したり A4 で量産したりも一気通貫でできます。",
  },
  {
    q: "閲覧する人はアカウント登録が必要ですか?",
    a: "不要です。URL を開くだけで名刺を見て、vCard でダウンロードできます。スマホ内に「保存」してリスト管理する時もアカウントは要りません (端末内 IndexedDB に保存)。",
  },
  {
    q: "電話番号やメールはそのまま公開されてしまいますか?",
    a: "公開した情報は公開 URL を知っている人なら閲覧できます。社外秘の項目は登録しないか、公開ページとは別の「もっと見る」モーダル領域 (ポエム / プロフィール / SNS) を使い分けてください。",
  },
  {
    q: "料金はかかりますか?",
    a: "現在 β 版として、すべての機能を無料で公開中です。今後の料金プランについては、ユーザー登録時にメールでお知らせします。",
  },
];

export default async function Page() {
  const session = await auth();
  const startHref = session?.user ? "/dashboard" : "/login";
  const operatorUrl = process.env.OPERATOR_INFO_URL ?? "";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Header */}
      <header className="mb-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MeishiLogo />
          <div>
            <p className="text-sm text-neutral-500">Web business card</p>
            <h1 className="text-xl font-semibold">MeishiLink</h1>
          </div>
        </div>
        <Link
          className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white/70"
          href={startHref}
        >
          {session?.user ? "ダッシュボード" : "ログイン"}
        </Link>
      </header>

      {/* Hero */}
      <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-neutral-300 bg-white/70 px-4 py-1 text-sm text-neutral-600">
              QR で共有、vCard で保存、閲覧者登録不要
            </p>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-5xl font-semibold tracking-tight text-neutral-950 md:text-6xl">
                紙名刺をデジタルに。
                <span className="block text-neutral-500">あなたの URL で名刺を渡そう。</span>
              </h2>
              <p className="max-w-2xl text-lg text-neutral-600">
                MeishiLink は、あなた専用の公開 URL、QR、vCard、ローカル保存を一つの導線にまとめた Web 名刺です。
                忘れた、切らした、束を持ち歩きたくない。そんな名刺の煩わしさを、スマホ一台に置き換えます。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              className="rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
              href={startHref}
            >
              無料ではじめる
            </Link>
            <Link
              className="rounded-2xl border border-neutral-300 bg-white/80 px-6 py-3 text-sm font-medium hover:bg-white"
              href="/saved"
            >
              保存一覧を見る
            </Link>
          </div>
          <div className="grid gap-3 text-sm text-neutral-700 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-sm">QR で交換</div>
            <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-sm">vCard で保存</div>
            <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-sm">連絡先ローカル管理</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-neutral-200/80 backdrop-blur">
          <div className="flex aspect-[55/91] w-full max-w-[20rem] mx-auto flex-col gap-4 rounded-[1.25rem] bg-[linear-gradient(160deg,#0f172a,#1e293b)] px-6 py-7 text-white">
            <p className="text-[10px] tracking-[0.32em] text-white/65">代表取締役 社長</p>
            <div className="space-y-1">
              <h3 className="text-[1.45rem] font-semibold leading-tight">山田 太郎</h3>
              <p className="text-[10px] tracking-[0.28em] text-white/60">YAMADA TARO</p>
            </div>
            <div className="space-y-1.5 text-[11px] leading-relaxed text-white/85">
              <p className="font-medium">株式会社 MeishiLink</p>
              <p className="text-white/65">プロダクト開発部</p>
              <p>tel. 03-xxxx-xxxx</p>
              <p>mail. hello@example.com</p>
              <p>example.com</p>
            </div>
            <div className="mt-auto text-[10px] tracking-[0.2em] text-white/55">@taro</div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="mt-32 space-y-12">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Use cases</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">こういう瞬間に、 役立ちます。</h2>
          <p className="text-neutral-600">
            紙の名刺だと「持ってない」「切らしてる」「あの人どこの誰だっけ」が日常的に起こります。
            MeishiLink は、その小さなストレスを 3 つの場面で解決します。
          </p>
        </div>

        <div className="space-y-20">
          {useCases.map((u, i) => (
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
              key={u.label}
            >
              <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/40 shadow-xl shadow-neutral-200/60">
                <Image
                  alt={u.title}
                  className="aspect-square w-full object-cover"
                  height={1024}
                  src={u.image}
                  width={1024}
                  unoptimized
                />
              </div>
              <div className="space-y-4">
                <p className="text-xs tracking-[0.32em] text-neutral-500">{u.label} / {u.keyword}</p>
                <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{u.title}</h3>
                <p className="text-neutral-600 md:text-lg">{u.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-32 space-y-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Features</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">必要なものだけ、揃えました。</h2>
          <p className="text-neutral-600">
            派手な機能はありません。Web 名刺をスマホで届けて、相手のスマホに残るところまで。
            それを少しだけ綺麗に、少しだけ早くやれるようにしています。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm transition hover:bg-white"
              key={f.title}
            >
              <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mt-32 space-y-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Get started</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">3 ステップで使えます。</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <li
              className="flex flex-col gap-2 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm"
              key={s.n}
            >
              <span className="text-xs tracking-[0.32em] text-neutral-500">STEP {s.n}</span>
              <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="text-sm text-neutral-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-32 space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">FAQ</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">よくある質問</h2>
        </div>
        <div className="grid gap-4">
          {faqs.map((f) => (
            <details
              className="group rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-sm transition open:bg-white"
              key={f.q}
            >
              <summary className="flex cursor-pointer items-center justify-between text-base font-semibold tracking-tight">
                {f.q}
                <span className="ml-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-sm transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-32 mb-16 rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#0f172a,#1e293b)] px-8 py-14 text-white shadow-xl shadow-neutral-300/40">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">あなた専用の URL を、今すぐ。</h2>
          <p className="text-white/75">
            β 版公開中、登録は無料。 5 分で公開 URL と QR が手に入ります。
          </p>
          <div className="flex justify-center">
            <Link
              className="rounded-2xl bg-white px-6 py-3 text-sm font-medium text-neutral-950 hover:bg-neutral-100"
              href={startHref}
            >
              無料ではじめる
            </Link>
          </div>
        </div>
      </section>

      <Footer operatorUrl={operatorUrl} />
    </main>
  );
}
