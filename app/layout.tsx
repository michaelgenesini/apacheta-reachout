import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReachOut — A contact form that respects everyone involved",
  description:
    "For freelancers and independents who want to be reachable — without surveillance, dark patterns, or unnecessary complexity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
