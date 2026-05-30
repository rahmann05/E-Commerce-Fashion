import React from "react";
import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import { ColorProvider } from "@/core/providers/ColorContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ColorProvider>
      <Navbar />
      <div className="flex-1 w-full flex flex-col min-h-screen">
        {children}
      </div>
      <Footer />
    </ColorProvider>
  );
}
