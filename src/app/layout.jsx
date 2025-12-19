import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Providers from "./providers";

export const metadata = {
  title: "Pişir Gitsin",
  description: "Yemek tarifleri platformu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Providers>
        <body className={`flex flex-col antialiased bg-white`}>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster position="top-center" />
        </body>
      </Providers>
    </html>
  );
}
