"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function DateFilter({ defaultDate }: { defaultDate: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="rounded-lg border border-life-line bg-life-card p-3">
      <Input
        type="date"
        defaultValue={searchParams.get("date") ?? defaultDate}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("date", event.target.value);
          router.replace(`/agenda?${params.toString()}`);
        }}
      />
    </div>
  );
}
