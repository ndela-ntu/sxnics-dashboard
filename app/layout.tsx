import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Montserrat } from "next/font/google";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Sxnics Admin",
  description: "Sxnics admin portal",
};

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className={`${montserrat.className} bg-black text-white`}>
        <ErrorBoundary>
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
