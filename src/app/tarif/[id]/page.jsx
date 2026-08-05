"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { supabase, withRetry } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  IconHeart,
  IconHeartFilled,
  IconClipboardCheck,
  IconClipboardPlus,
} from "@tabler/icons-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useSaves } from "@/context/SavesContext";
import { findAllergenMatches } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function safeJsonArray(v) {
   
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

const RecipeDetail = () => {
  const params = useParams();
  const router = useRouter();

  const recipeId = useMemo(() => {
    const raw = params?.id;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const { isUserLoggedIn, profile } = useAuth();

  const { favoriteIds, toggleFavorite } = useFavorites();
  const { savedIds, toggleSave } = useSaves();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const isLiked = recipeId != null && favoriteIds.includes(recipeId);
  const isInMenu = recipeId != null && savedIds.includes(recipeId);
  const allergenMatches = findAllergenMatches(recipe, profile?.allergens);

  useEffect(() => {
    if (recipeId == null) {
      setIsLoading(false);
      setError("Geçersiz tarif ID");
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    console.log(`📥 Loading recipe ${recipeId}...`);

    (async () => {
      try {
         
        if (!supabase) {
          throw new Error("Supabase bağlantısı kurulamadı");
        }

         
        console.log(`🔍 Fetching recipe ${recipeId} from database...`);
        const startTime = Date.now();
        
        const { data, error: fetchError } = await withRetry(
          () =>
            supabase
              .from("recipe")
              .select(
                "id,name,image_url,main_category,sub_categories,ingredients,instructions,labels,time_in_minutes,difficulty,likes_count,saves_count,views_count"
              )
              .eq("id", recipeId)
              .single(),
          3,  
          500,  
          20000  
        );

        const duration = Date.now() - startTime;
        console.log(`⏱️ Recipe fetch completed in ${duration}ms`);

        if (!mounted) {
          console.log("⚠️ Component unmounted, ignoring result");
          return;
        }

        if (fetchError) {
          console.error("❌ Recipe fetch error:", fetchError);
          setError(
            fetchError.message ||
              "Tarif yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
          );
          setRecipe(null);
          setIsLoading(false);
          return;
        }

        if (!data) {
          console.warn(`⚠️ Recipe ${recipeId} not found`);
          setError("Tarif bulunamadı.");
          setRecipe(null);
          setIsLoading(false);
          return;
        }

        console.log(`✅ Recipe ${recipeId} loaded successfully`);

         
        const normalized = {
          ...data,
          sub_categories: safeJsonArray(data?.sub_categories),
          ingredients: safeJsonArray(data?.ingredients),
          instructions: safeJsonArray(data?.instructions),
          labels: safeJsonArray(data?.labels),
        };

        setRecipe(normalized);

         
        try {
          const savedRatings = JSON.parse(
            localStorage.getItem("recipeRatings") || "{}"
          );
          const recipeRatings = savedRatings[recipeId] || [];
          if (recipeRatings.length > 0) {
            const avg =
              recipeRatings.reduce((a, b) => a + b, 0) / recipeRatings.length;
            setAverageRating(avg);
            setTotalRatings(recipeRatings.length);
          } else {
            setAverageRating(0);
            setTotalRatings(0);
          }

          if (isUserLoggedIn) {
            const userRatings = JSON.parse(
              localStorage.getItem("userRatings") || "{}"
            );
            setUserRating(userRatings[recipeId] || 0);
          } else {
            setUserRating(0);
          }
        } catch (localStorageError) {
          console.error("localStorage error:", localStorageError);
           
        }

        setIsLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error("Unexpected error:", err);
        setError(
          err.message ||
            "Tarif yüklenirken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin."
        );
        setRecipe(null);
        setIsLoading(false);
      }
    })();

    return () => {
      console.log(`🧹 Cleaning up recipe ${recipeId} effect`);
      mounted = false;
    };
  }, [recipeId]);  

  const handleRating = (rating) => {
    if (!isUserLoggedIn) {
      alert("Değerlendirme yapmak için giriş yapmalısınız.");
      return;
    }
    if (recipeId == null) return;

    const savedRatings = JSON.parse(
      localStorage.getItem("recipeRatings") || "{}"
    );
    const userRatings = JSON.parse(localStorage.getItem("userRatings") || "{}");

    if (!savedRatings[recipeId]) savedRatings[recipeId] = [];
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

  const handleLike = async () => {
    if (!isUserLoggedIn) {
      alert("Beğenmek için giriş yapmalısınız.");
      return;
    }
    if (recipeId == null) return;

    await toggleFavorite(recipeId);
  };

  const handleAddToMenu = async () => {
    if (!isUserLoggedIn) {
      alert("Menüye eklemek için giriş yapmalısınız.");
      return;
    }
    if (recipeId == null) return;

    await toggleSave(recipeId);
  };

  const handleView = async () => {
    try {
      await withRetry(
        () => supabase.rpc("track_view", { p_recipe_id: recipeId, p_limit: 20 }),
        2,  
        300,
        10000
      );
    } catch (error) {
       
      console.warn("View tracking failed:", error);
    }
  };

  useEffect(() => {
    if (!isLoading && recipe) handleView();
  }, [isLoading, recipe]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-600 text-sm">Tarif yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Tarif bulunamadı"}
          </h1>
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                 
                const currentId = recipeId;
                 
                window.location.reload();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => router.back()}
              className="text-green-600 hover:text-green-700"
            >
              ← Geri Dön
            </button>
          </div>
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
                <h1 className="text-[30px] font-bold text-gray-900 ">
                  {recipe.name}
                </h1>

                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    ⏱{" "}
                    <span>
                      {recipe.time_in_minutes
                        ? `${recipe.time_in_minutes} dk`
                        : "Süre belirtilmemiş"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    💪{" "}
                    <span>{recipe.difficulty || "Zorluk belirtilmemiş"}</span>
                  </div>

                  {allergenMatches.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {allergenMatches.map((m) => (
                        <Badge key={m} variant="destructive">
                          ⚠️ {m}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center ml-auto gap-2">
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
                    )}
                  </button>

                  <button
                    onClick={handleLike}
                    className={`transition-colors duration-500 ${
                      isLiked
                        ? "text-red-600"
                        : "text-gray-400 hover:text-red-600"
                    }`}
                    title={isLiked ? "Favorilerde" : "Favorilere ekle"}
                  >
                    {isLiked ? (
                      <IconHeartFilled size={28} />
                    ) : (
                      <IconHeart size={28} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(recipe.sub_categories ?? []).map((kategori, index) => {
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

                   
                  const cls = `inline-block px-3 py-1 rounded-full text-sm font-medium transition-colors ${pastelColors[colorIndex]}`;

                  return categoryId ? (
                    <Link
                      key={index}
                      href={`/kategoriler/${categoryId}`}
                      className={cls}
                    >
                      {kategori}
                    </Link>
                  ) : (
                    <span key={index} className={cls}>
                      {kategori}
                    </span>
                  );
                })}
              </div>

              <div className="flex gap-2 flex-wrap">
                {(recipe.labels ?? []).map((label, i) => (
                  <Link
                    href={`/etiketler/${encodeURIComponent(label)}`}
                    key={i}
                    className="text-xs px-2 py-1 border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition"
                  >
                    #{label}
                  </Link>
                ))}
              </div>
            </div>

             
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
                {(recipe.ingredients ?? []).map((ingredient, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {ingredient?.amount?.value} {ingredient?.amount?.unit}{" "}
                    {ingredient?.ingredient}
                  </li>
                ))}
              </ul>
            </div>

             
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Hazırlanış
              </h2>
              <div className="space-y-4">
                {(recipe.instructions ?? []).map((adım, index) => (
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
