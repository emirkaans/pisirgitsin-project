"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { getTopCategories } from "@/lib/recommendedCategories";
import { categoriesSet } from "@/constants/constants";
import { getPopularRecipes } from "@/lib/popularRecipes";

export default function Home() {
  const { profile, loading: authLoading } = useAuth();
  const { favoriteRecipes, fetchFavoriteRecipes } = useFavorites();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [recipesError, setRecipesError] = useState(null);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  useEffect(() => {
    // ✅ AuthContext henüz yükleniyorsa bekle
    if (authLoading) {
      return;
    }

    if (!profile) {
      try {
        const top4 = getTopCategories({
          profile: null,
          favoriteRecipes: [],
          now: new Date(),
        });

        const userCategories = categoriesSet.filter((cat) =>
          top4.includes(cat.name)
        );

        setCategories(userCategories);
      } catch (err) {
        console.error("Guest category error:", err);
        setCategories([]);
      }

      // popüler tarifler yine gelsin istiyorsan:
      setIsLoadingRecipes(true);
      getPopularRecipes({ limit: 3 })
        .then(setRecipes)
        .catch(() => setRecipes([]))
        .finally(() => setIsLoadingRecipes(false));

      return;
    }

    // Paralel istekler: favori tarifler ve popüler tarifler aynı anda çek
    setIsLoadingRecipes(true);
    setRecipesError(null);

    Promise.allSettled([
      fetchFavoriteRecipes(),
      getPopularRecipes({ profile, limit: 3 }),
    ])
      .then(([favoritesResult, recipesResult]) => {
        // Favori tarifler sonucu
        const favRecipes =
          favoritesResult.status === "fulfilled" ? favoritesResult.value : [];

        if (favoritesResult.status === "rejected") {
          console.error(
            "Error fetching favorite recipes:",
            favoritesResult.reason
          );
        }

        // Kategorileri hesapla
        try {
          const top4 = getTopCategories({
            profile,
            favoriteRecipes: favRecipes,
            now: new Date(),
          });

          const userCategories = categoriesSet.filter((cat) =>
            top4.includes(cat.name)
          );

          setCategories(userCategories);
        } catch (err) {
          console.error("Error getting top categories:", err);
          setCategories([]);
        }

        // Popüler tarifler sonucu
        if (recipesResult.status === "fulfilled") {
          setRecipes(recipesResult.value);
          setIsLoadingRecipes(false);
        } else {
          console.error("Error loading popular recipes:", recipesResult.reason);
          setRecipesError(
            recipesResult.reason?.message ||
              "Popüler tarifler yüklenirken bir hata oluştu"
          );
          setRecipes([]);
          setIsLoadingRecipes(false);
        }
      })
      .catch((err) => {
        console.error("Unexpected error:", err);
        setRecipesError("Beklenmeyen bir hata oluştu");
        setRecipes([]);
        setIsLoadingRecipes(false);
      });
  }, [profile, fetchFavoriteRecipes, authLoading]);

  const heroSlides = [
    {
      image: "/assets/hero-bg-3.jpg",
      title: "Kolay Tarifler",
      subtitle: "Pratik ve lezzetli tariflerle mutfağınızı şenlendirin",
      link: "/listeler/kolay-tarifler",
    },
    {
      image: "/assets/hero-bg-4.jpg",
      title: "Yeni Tarifler",
      subtitle: "En son eklediğimiz lezzetli tarifler",
      link: "/listeler/yeni-tarifler",
    },
    {
      image: "/assets/hero-bg-6.jpg",
      title: "Özel Tarifler",
      subtitle: "Sizin için özenle seçtiğimiz özel tarifler",
      link: "/listeler/ozel-tarifler",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative h-[500px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out
              ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black opacity-40"></div>
          </div>
        ))}

        <div className="relative max-w-7xl pl-16 mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4 transition-transform duration-500 transform">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl mb-8 transition-transform duration-500 transform">
              {heroSlides[currentSlide].subtitle}
            </p>
            <Link
              href={heroSlides[currentSlide].link}
              className="bg-orange-700 text-white px-8 py-3 rounded-lg text-lg font-semibold 
                hover:bg-orange-800 transition duration-300"
            >
              Tarifleri Keşfet
            </Link>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 
                ${
                  index === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentSlide((prev) =>
              prev === 0 ? heroSlides.length - 1 : prev - 1
            )
          }
          className="absolute left-4 top-1/2 transform -translate-y-1/2 
            bg-black/30 hover:bg-black/50 text-white p-2 rounded-full 
            transition duration-300"
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
          }
          className="absolute right-4 top-1/2 transform -translate-y-1/2 
            bg-black/30 hover:bg-black/50 text-white p-2 rounded-full 
            transition duration-300"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </section>

      <section className="  bg-orange-50 ">
        <div className="max-w-7xl flex items-center w-full gap-4 flex-col mx-auto px-4 py-16">
          <h2 className="text-3xl text-orange-950 font-bold mb-4">
            Kategoriler
          </h2>
          <div className="grid  w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/kategoriler/${category.id}`}
                className="group relative h-48 rounded-lg overflow-hidden"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-50 transition duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-semibold">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
          <Button
            onClick={() => router.push("/kategoriler")}
            variant={"secondary"}
          >
            Tüm Kategoriler Görüntüle
          </Button>
        </div>
      </section>

      <section className="bg-white  py-16">
        <div className="max-w-7xl flex flex-col gap-y-8 mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl  text-orange-950 font-bold ">
              Popüler Tarifler
            </h2>{" "}
            <Link
              href={"/listeler/populer-tarifler"}
              className="hover:underline duration-300 transition-all text-sm  text-orange-950 bg-white hover:bg-inherit shadow-none"
            >
              Listeyi Görüntüle →
            </Link>
          </div>

          {isLoadingRecipes ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="relative mb-4">
                <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
              </div>
              <p className="text-gray-600 text-sm">
                Popüler tarifler yükleniyor...
              </p>
            </div>
          ) : recipesError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{recipesError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Henüz popüler tarif bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe) => {
                return (
                  <Link
                    key={recipe.id}
                    href={`/tarif/${recipe.id}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300"
                  >
                    <div className="relative h-48">
                      <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl text-stone-900 font-semibold mb-2">
                        {recipe.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-3">
                          ⏱ {recipe.time_in_minutes} dk
                        </span>
                        <span>💪 {recipe.difficulty}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {!profile && (
        <section className="bg-orange-950 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Aramıza Katılın</h2>
            <p className="text-xl mb-8">
              Favori tariflerinizi kaydedin, beğenin ve kendi tarif defterinizi
              oluşturmak için ilk adımı atın.
            </p>
            <Link
              href="/kayit-ol"
              className="inline-block bg-white text-orange-950 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition duration-300"
            >
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
