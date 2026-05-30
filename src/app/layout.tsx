import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAIL DIAGNOSIS - AIによる爪の美しさ・健康診断",
  description: "写真を撮るだけ。AIがあなたの爪の形・色ツヤ・健康状態を診断します。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

