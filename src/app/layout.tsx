import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Versent FC",
  description: "FIFA-style squad builder for a small work football tournament.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
