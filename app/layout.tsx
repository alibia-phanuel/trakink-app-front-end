// app/layout.tsx
import { ClientLayout } from "./ClientLayout";
import { AuthProvider } from "@/app/context/authContext";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon App",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900 ">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
