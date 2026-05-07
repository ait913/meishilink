import { cookies } from "next/headers";

import { SavedClient } from "@/app/(viewer)/saved/SavedClient";

export default async function SavedPage() {
  const cookieStore = await cookies();
  void cookieStore;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <SavedClient />
    </main>
  );
}

