import { AppProvider } from "@/contexts/AppContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProvEx - Sistema de Provas Inteligentes",
  description: "Plataforma inteligente para criação, aplicação e correção automática de provas acadêmicas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className + " w-full min-h-screen"}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
