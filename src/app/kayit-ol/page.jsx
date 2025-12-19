"use client";
import { useState } from "react";
import Link from "next/link";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      setLoading(false);
      return;
    }

    try {
      const data = await signUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      });

      if (data) {
        setIsSuccess(true);
        setLoading(false);
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      setError("Kayıt oluşturulamadı!");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative bg-white rounded-lg shadow-sm p-6">
            <div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Kaydınız Başarıyla Oluşturuldu!
                </h2>

                <Link
                  href="/giris-yap"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Giriş Yap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative bg-white rounded-lg shadow-sm p-6">
          <div>
            <div className="flex items-center space-x-5 justify-center">
              <img src="assets/logo.png" alt="logo" className="h-16" />
            </div>
            <form
              className="w-full flex flex-col gap-y-4"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-y-1">
                <label
                  className="font-semibold text-sm text-gray-600 pb-1 block"
                  htmlFor="full_name"
                >
                  Ad Soyad
                </label>
                <input
                  className="border rounded-lg px-3 py-2    text-sm w-full"
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <label
                  className="font-semibold text-sm text-gray-600 pb-1 block"
                  htmlFor="email"
                >
                  E-posta
                </label>
                <input
                  className="border rounded-lg px-3 py-2    text-sm w-full"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <label
                  className="font-semibold text-sm text-gray-600 pb-1 block"
                  htmlFor="password"
                >
                  Şifre
                </label>
                <div className="relative">
                  <input
                    className="border rounded-lg px-3 py-2    text-sm w-full"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
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
              <div className="flex flex-col gap-y-1">
                <label
                  className="font-semibold text-sm text-gray-600 pb-1 block"
                  htmlFor="confirmPassword"
                >
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <input
                    className="border rounded-lg px-3 py-2    text-sm w-full"
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[50%]  -translate-y-[50%]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <IconEye strokeWidth={1.5} className="text-gray-700" />
                    ) : (
                      <IconEyeOff strokeWidth={1.5} className="text-gray-700" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm mb-4 text-center">
                  {error}
                </div>
              )}

              <div className="mt-5">
                <button
                  disabled={loading}
                  className="h-10 px-4 flex items-center justify-center bg-green-600 hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                  type="submit"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    "Kayıt Ol"
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                <Link
                  className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline"
                  href="/giris-yap"
                >
                  veya giriş yap
                </Link>
                <span className="w-1/5 border-b dark:border-gray-400 md:w-1/4"></span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
