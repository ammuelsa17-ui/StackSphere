import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";

export const metadata: Metadata = {
  title: "StackSphere",
  description: "A professional community Q&A and social space platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <NextAuthSessionProvider>
          <I18nProvider>
            <Navbar />
            <div className="flex-1 flex pt-16">
              <Sidebar />
              <main className="flex-1 md:pl-64 flex flex-col min-h-[calc(100vh-4rem)] pb-16 md:pb-0">
                <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
                  {children}
                </div>
              </main>
            </div>
          </I18nProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
