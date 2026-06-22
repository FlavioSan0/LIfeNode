"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { mainNavItems, secondaryNavItems } from "@/constants/nav";
import { cn, initialsFromEmail } from "@/lib/utils";

export function Sidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-life-line bg-life-card/90 backdrop-blur lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-life-line px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-life-line bg-life-bg">
          <Network className="h-5 w-5 text-life-cyan" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-tight">LifeNode</p>
          <p className="text-xs text-life-muted">Central pessoal</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {mainNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-life-muted transition hover:bg-life-bg hover:text-life-text",
                active && "bg-life-bg text-life-text ring-1 ring-life-line"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-life-cyan")} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 h-px bg-life-line" />

        {secondaryNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-life-muted transition hover:bg-life-bg hover:text-life-text",
                active && "bg-life-bg text-life-text ring-1 ring-life-line"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-life-cyan")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-life-line p-4">
        <div className="mb-3 flex items-center gap-3 rounded-md border border-life-line bg-life-bg/70 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-life-blue text-sm font-semibold">
            {initialsFromEmail(userEmail)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Conta ativa</p>
            <p className="truncate text-xs text-life-muted">{userEmail}</p>
          </div>
        </div>
        <LogoutButton className="w-full justify-start gap-2" />
      </div>
    </aside>
  );
}
