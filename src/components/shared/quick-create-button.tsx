import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickCreateButton() {
  return (
    <Button asChild className="gap-2">
      <Link href="/entrada-rapida">
        <Plus className="h-4 w-4" />
        Nova entrada
      </Link>
    </Button>
  );
}
