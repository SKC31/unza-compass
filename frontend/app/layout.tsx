import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNZA Compass — Navigate university with confidence",
  description:
    "An independent student-built AI prototype that helps University of Zambia students find university information quickly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
