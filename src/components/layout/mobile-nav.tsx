"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavItems } from "@/constants/nav";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-life-line bg-life-card/95 px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {mainNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-life-muted transition",
                active && "bg-life-bg text-life-text ring-1 ring-life-line",
                item.href === "/entrada-rapida" && "bg-life-blue text-white shadow-sm",
                active && item.href === "/entrada-rapida" && "ring-life-cyan"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
