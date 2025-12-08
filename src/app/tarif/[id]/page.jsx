"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import recipes from "./../../../lib/api.json";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconHeart,
  IconHeartFilled,
  IconPlus,
  IconClipboardCheck,
  IconClipboardPlus,
} from "@tabler/icons-react";

const RecipeDetail = () => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const recipeId = parseInt(params.id);
  const recipe = recipes.find((r) => r.id === recipeId);
  const { isUserLoggedIn } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [previousPath, setPreviousPath] = useState("");
  const [isInMenu, setIsInMenu] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const savedRatings = JSON.parse(
      localStorage.getItem("recipeRatings") || "{}"
    );
    const recipeRatings = savedRatings[recipeId] || [];

    if (recipeRatings.length > 0) {
      const avg =
        recipeRatings.reduce((a, b) => a + b, 0) / recipeRatings.length;
      setAverageRating(avg);
      setTotalRatings(recipeRatings.length);
    }

    if (isUserLoggedIn) {
      const userRatings = JSON.parse(
        localStorage.getItem("userRatings") || "{}"
      );
      setUserRating(userRatings[recipeId] || 0);
    }

    const likedRecipes = JSON.parse(
      localStorage.getItem("likedRecipes") || "[]"
    );
    setIsLiked(likedRecipes.includes(recipeId));

    const prevPath = sessionStorage.getItem("previousPath") || "/";
    setPreviousPath(prevPath);

    sessionStorage.setItem("previousPath", pathname);

    const menuItems = JSON.parse(localStorage.getItem("menuItems") || "[]");
    setIsInMenu(menuItems.includes(recipeId));

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [recipeId, isUserLoggedIn, pathname]);

  const handleRating = (rating) => {
    if (!isUserLoggedIn) {
      alert("Değerlendirme yapmak için giriş yapmalısınız.");
      return;
    }

    const savedRatings = JSON.parse(
      localStorage.getItem("recipeRatings") || "{}"
    );
    const userRatings = JSON.parse(localStorage.getItem("userRatings") || "{}");

    if (!savedRatings[recipeId]) {
      savedRatings[recipeId] = [];
    }
    savedRatings[recipeId].push(rating);

    userRatings[recipeId] = rating;

    localStorage.setItem("recipeRatings", JSON.stringify(savedRatings));
    localStorage.setItem("userRatings", JSON.stringify(userRatings));

    setUserRating(rating);
    const avg =
      savedRatings[recipeId].reduce((a, b) => a + b, 0) /
      savedRatings[recipeId].length;
    setAverageRating(avg);
    setTotalRatings(savedRatings[recipeId].length);
  };

  const handleLike = () => {
    if (!isUserLoggedIn) {
      alert("Beğenmek için giriş yapmalısınız.");
      return;
    }

    const likedRecipes = JSON.parse(
      localStorage.getItem("likedRecipes") || "[]"
    );

    if (isLiked) {
      const updatedLikes = likedRecipes.filter((id) => id !== recipeId);
      localStorage.setItem("likedRecipes", JSON.stringify(updatedLikes));
      setIsLiked(false);
    } else {
      likedRecipes.push(recipeId);
      localStorage.setItem("likedRecipes", JSON.stringify(likedRecipes));
      setIsLiked(true);
    }
  };

  const handleAddToMenu = () => {
    if (!isUserLoggedIn) {
      alert("Menüye eklemek için giriş yapmalısınız.");
      return;
    }

    const menuItems = JSON.parse(localStorage.getItem("menuItems") || "[]");

    if (isInMenu) {
      const updatedMenu = menuItems.filter((id) => id !== recipeId);
      localStorage.setItem("menuItems", JSON.stringify(updatedMenu));
      setIsInMenu(false);
    } else {
      menuItems.push(recipeId);
      localStorage.setItem("menuItems", JSON.stringify(menuItems));
      setIsInMenu(true);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tarif bulunamadı
          </h1>
          <button
            onClick={() => router.back()}
            className="text-green-600 hover:text-green-700"
          >
            ← Geri Dön
          </button>
        </div>
      </div>
    );
  }

  if (!recipe.instructions || !Array.isArray(recipe.instructions)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tarif verisi eksik
          </h1>
          <button
            onClick={() => router.back()}
            className="text-green-600 hover:text-green-700"
          >
            ← Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-block cursor-pointer mb-4 text-sm text-green-700 hover:text-green-900"
        >
          ← Geri Dön
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-96">
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 flex flex-col gap-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 justify-between">
                {" "}
                <h1 className="text-[30px] font-bold text-gray-900 ">
                  {recipe.name}
                </h1>{" "}
                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    ⏱ <span>{recipe.time_in_minutes || "Süre belirtilmemiş"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    💪 <span>{recipe.difficulty || "Zorluk belirtilmemiş"}</span>
                  </div>
                </div>
                <div className="flex items-center ml-auto  gap-2">
                  {/* <button
                    onClick={handleAddToMenu}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                      isInMenu
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                    title={isInMenu ? "Menüden Çıkar" : "Menüme Ekle"}
                  >
                    <IconPlus size={20} />
                    {isInMenu ? "Menüde" : "Menüme Ekle"}
                  </button> */}

                  <button
                    onClick={handleAddToMenu}
                    className="transition-colors text-gray-400 hover:text-green-600"
                    title={isInMenu ? "Menümden çıkar" : "Menüme ekle"}
                    aria-label="Menüme ekle veya çıkar"
                  >
                    {isInMenu ? (
                      <IconClipboardCheck
                        size={28}
                        className="text-green-600"
                      />
                    ) : (
                      <IconClipboardPlus size={28} />
                    )}{" "}
                  </button>

                  <button
                    onClick={handleLike}
                    className={`transition-colors duration-500 ${
                      isLiked
                        ? "text-red-600"
                        : "text-gray-400 hover:text-red-600"
                    }`}
                    title={isLiked ? "Beğendiniz" : "Beğen"}
                  >
                    {isLiked ? (
                      <IconHeartFilled size={28} />
                    ) : (
                      <IconHeart size={28} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {recipe.sub_categories.map((kategori, index) => {
                    const categoryMap = {
                      "Ana Yemekler": 1,
                      Tatlılar: 2,
                      Salatalar: 3,
                      Çorbalar: 4,
                      Kahvaltılıklar: 5,
                      "Hamur İşleri": 8,
                      Vejetaryen: 9,
                      Glutensiz: 11,
                      "Diyet Yemekler": 12,
                      "Deniz Ürünleri": 14,
                      "Et Yemekleri": 15,
                      "Dünya Mutfağı": 16,
                      "Tavuk Yemekleri": 17,
                      Zeytinyağlılar: 18,
                      Atıştırmalıklar: 19,
                      "Baklagil Yemekleri": 20,
                    };

                    const pastelColors = [
                      "bg-pink-100 text-pink-800 hover:bg-pink-200",
                      "bg-blue-100 text-blue-800 hover:bg-blue-200",
                      "bg-green-100 text-green-800 hover:bg-green-200",
                      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                      "bg-purple-100 text-purple-800 hover:bg-purple-200",
                      "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
                      "bg-red-100 text-red-800 hover:bg-red-200",
                      "bg-teal-100 text-teal-800 hover:bg-teal-200",
                    ];

                    const colorIndex = index % pastelColors.length;
                    const categoryId = categoryMap[kategori];

                    return (
                      <Link
                        key={index}
                        href={`/kategoriler/${categoryId}`}
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium transition-colors ${pastelColors[colorIndex]}`}
                      >
                        {kategori}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {recipe.labels?.map((etiket, i) => (
                  <Link
                    href={`/etiketler/${encodeURIComponent(etiket)}`}
                    key={i}
                    className="text-xs px-2 py-1 border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition"
                  >
                    #{etiket}
                  </Link>
                ))}
              </div>
            </div>

            {/* Rating Section */}
            <div className="">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`text-2xl transition-colors ${
                        star <= (hoverRating || userRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } hover:text-yellow-400`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="text-gray-600 ">
                  {averageRating > 0 ? (
                    <span>
                      {averageRating.toFixed(1)} ({totalRatings} değerlendirme)
                    </span>
                  ) : (
                    <span className="text-xs">
                      Henüz değerlendirme yapılmamış
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Malzemeler
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recipe.ingredients.map((malzeme, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {malzeme}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Hazırlanış
              </h2>
              <div className="space-y-4">
                {recipe.instructions.map((adım, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-700">{adım}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
