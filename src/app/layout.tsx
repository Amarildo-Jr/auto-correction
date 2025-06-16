import { AppProvider } from "@/contexts/AppContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Provas Online",
  description: "Plataforma para realização de provas online com monitoramento avançado",
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
