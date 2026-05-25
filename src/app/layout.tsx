import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MidiaBox",
  description: "Plataforma de gestão de social media",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/instagram-sans" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
