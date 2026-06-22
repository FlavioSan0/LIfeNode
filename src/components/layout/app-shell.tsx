import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";

type AppShellProps = {
  children: React.ReactNode;
  userEmail?: string | null;
};

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-life-bg surface-grid">
      <Sidebar userEmail={userEmail} />
      <div className="min-h-screen lg:pl-72">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
