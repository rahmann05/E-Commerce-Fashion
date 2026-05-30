import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/shared/styles/globals.css";
import { AuthProvider } from "@/core/providers/AuthContext";
import { CartProvider } from "@/core/providers/CartContext";
import { ProfileDataProvider } from "@/core/providers/ProfileDataContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Novarium | Essentialized Daily Wear",
  description:
    "Discover reimagined modern casual clothing for men. Premium neumorphism 3D e-commerce experience with immersive motion design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <AuthProvider>
          <ProfileDataProvider>
            <CartProvider>{children}</CartProvider>
          </ProfileDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
