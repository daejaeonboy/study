import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_KR } from "next/font/google";

import { LibraryProvider } from "@/components/providers/library-provider";
import { SiteShell } from "@/components/site-shell";

import "./globals.css";

const bodyFont = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700", "800"],
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "지능형 지식 라이브러리",
  description: "이어지는 학습 경로를 설계하는 범용 지식 학습 플랫폼 MVP",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${bodyFont.variable} ${monoFont.variable}`}>
        <LibraryProvider>
          <SiteShell>{children}</SiteShell>
        </LibraryProvider>
      </body>
    </html>
  );
}
