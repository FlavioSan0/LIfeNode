import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LifeNode",
    template: "%s | LifeNode"
  },
  description: "Painel pessoal de comando para tarefas, agenda, clientes, projetos e áreas.",
  applicationName: "LifeNode",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020617"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-life-bg text-life-text")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
