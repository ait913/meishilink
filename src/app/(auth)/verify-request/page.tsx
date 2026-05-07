import Link from "next/link";

export default async function VerifyRequestPage() {  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-12">
      <div className="w-full rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl shadow-neutral-200/70 backdrop-blur">
        <p className="text-sm text-neutral-500">メールを送信しました</p>
        <h1 className="mt-2 text-3xl font-semibold">受信トレイを確認してください</h1>
        <p className="mt-4 text-neutral-600">
          Magic Link をクリックするとログインできます。開発環境でメール設定がない場合は、サーバログに URL が出力されます。
        </p>
        <Link className="mt-6 inline-flex rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50" href="/login">
          ログインに戻る
        </Link>
      </div>
    </main>
  );
}

