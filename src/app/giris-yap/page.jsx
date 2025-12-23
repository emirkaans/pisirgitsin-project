"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  console.log({ user });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("Lütfen e-posta ve şifre alanlarını doldurun");
      setLoading(false);
      return;
    }

    try {
      const data = await login({ email, password });

      if (data) {
        toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
        setLoading(false);
        // 3 saniye beklemek yerine hemen yönlendir
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      
      // Daha detaylı hata mesajları
      let errorMessage = "Giriş yapılamadı. Lütfen tekrar deneyin.";
      
      if (error?.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Geçersiz e-posta veya şifre!";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "E-posta adresinizi doğrulamanız gerekiyor.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Çok fazla deneme yaptınız. Lütfen bir süre sonra tekrar deneyin.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative bg-white rounded-lg shadow-sm p-6">
          <div className="">
            <div className="flex items-center gap-x-5 justify-center">
              <img src="assets/logo.png" alt="logo" className="h-16" />
            </div>
            <form
              className="w-full flex flex-col gap-y-4"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-y-1">
                <label
                  className="font-semibold text-sm text-gray-600 pb-1 block"
                  htmlFor="login"
                >
                  E-posta
                </label>
                <input
                  className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
                  type="text"
                  id="login"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <label
                  className="font-semibold text-sm text-gray-600 pb-1 block"
                  htmlFor="password"
                >
                  Şifre
                </label>
                <div className="relative ">
                  <input
                    className="border rounded-lg px-3 py-2    text-sm w-full"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[50%]  -translate-y-[50%]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <IconEye strokeWidth={1.5} className="text-gray-700" />
                    ) : (
                      <IconEyeOff strokeWidth={1.5} className="text-gray-700" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-600"
                  >
                    Beni hatırla
                  </label>
                </div>
                <a
                  className="text-xs font-display font-semibold text-gray-500 hover:text-gray-600 cursor-pointer"
                  href="#"
                >
                  Şifremi unuttum?
                </a>
              </div>

              <div className="mt-5">
                <button
                  disabled={loading}
                  className=" h-10 px-4 flex items-center justify-center bg-green-600 hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow border border-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                  type="submit"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    "Giriş Yap"
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                <a
                  className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline"
                  href="#"
                >
                  veya kayıt ol
                </a>
                <span className="w-1/5 border-b dark:border-gray-400 md:w-1/4"></span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
