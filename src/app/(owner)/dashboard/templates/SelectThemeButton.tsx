"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";

export function SelectThemeButton({ active }: { active: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button loading={pending} type="submit" variant={active ? "primary" : "secondary"}>
      {active ? "選択中" : pending ? "切替中..." : "このテーマにする"}
    </Button>
  );
}
