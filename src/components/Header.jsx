"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  IconChevronDown,
  IconClipboard,
  IconHeart,
  IconHeartFilled,
  IconLogout,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Header = () => {
  const { isUserLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      toast.loading("Çıkış yapılıyor...");
      // Simulate a small delay for logout process
      await new Promise((resolve) => setTimeout(resolve, 800));
      await logout();
      toast.dismiss(); // Tüm toast mesajlarını temizle
      toast.success("Başarıyla çıkış yapıldı!");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.dismiss(); // Hata durumunda da toast mesajlarını temizle
      toast.error("Çıkış yapılırken bir hata oluştu!");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-gray-800 hover:text-gray-600"
            >
              <img src="/assets/logo.png" className="h-14 lg:h-16" />
            </Link>
          </div>

          <div className="flex items-center gap-x-3">
            <Link
              href="/"
              className="text-gray-700 h-11 hover:text-gray-900 px-3 py-2 rounded-md text-sm lg:text-base font-medium hover:bg-gray-100"
            >
              Ana Sayfa
            </Link>

            <Link
              href="/tarif-ara"
              className="text-gray-700 h-11 hover:text-gray-900 px-3 py-2 rounded-md text-sm lg:text-base font-medium hover:bg-gray-100"
            >
              Malzemeyle Ara
            </Link>

            <Link
              href="/listeler"
              className="text-gray-700 h-11 hover:text-gray-900 px-3 py-2 rounded-md text-sm lg:text-base font-medium hover:bg-gray-100"
            >
              Listeler
            </Link>

            <div className="flex-1 max-w-xl mx-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tarif ara..."
                  className="max-w-64 w-full h-9 pl-8 pr-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <IconSearch size={20} />
                </div>
              </div>
            </div>

            {isUserLoggedIn ? (
              <>
                <HoverCard openDelay={100}>
                  <HoverCardTrigger className="flex h-11 text-gray-700 hover:text-gray-900 text-sm lg:text-base px-3  rounded-md hover:bg-gray-100 font-medium items-center gap-2 cursor-pointer">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>EK</AvatarFallback>
                    </Avatar>
                    <p> {user.name}</p>
                    <IconChevronDown size={18} />
                  </HoverCardTrigger>
                  <HoverCardContent className="flex flex-col p-1">
                    <Link
                      href="/begenilerim"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm lg:text-base flex items-center gap-2 font-medium hover:bg-gray-100"
                    >
                      <IconHeart size={18} /> Beğenilerim
                    </Link>
                    <Link
                      href="/menum"
                      className="text-gray-700 h-11 hover:text-gray-900 px-3 py-2 rounded-md text-sm lg:text-base flex items-center gap-2 font-medium hover:bg-gray-100"
                    >
                      <IconClipboard size={18} /> Menüm
                    </Link>
                    <Link
                      href="/ayarlarim"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm lg:text-base flex items-center gap-2 font-medium hover:bg-gray-100"
                    >
                      <IconSettings size={18} /> Ayarlarım
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm lg:text-base font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          Çıkış Yapılıyor...
                        </>
                      ) : (
                        <>
                          <IconLogout size={18} />
                          Çıkış Yap
                        </>
                      )}
                    </button>
                  </HoverCardContent>
                </HoverCard>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/giris-yap"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm lg:text-base font-medium hover:bg-gray-100"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit-ol"
                  className="bg-orange-500 transition-all duration-500 text-white px-4 py-2 rounded  text-sm lg:text-base font-medium hover:bg-orange-700"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
