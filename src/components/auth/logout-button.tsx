"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => signOut({ redirectTo: "/login" })}
    >
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
}
