"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase, withRetry } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  IconClipboardCheck,
  IconClipboardPlus,
  IconHeart,
  IconHeartFilled,
} from "@tabler/icons-react";
import { useSaves } from "@/context/SavesContext";

import {
  recipeHasAllergen,
  rankKeys,
  buildRankContext,
} from "@/lib/recommendSearch";
import { useFavorites } from "@/context/FavoritesContext";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .trim();
}

function getHistoryRecipeIds(profile) {
  const fav = profile?.favorite_recipe_ids ?? [];
  const saved = profile?.saved_recipe_ids ?? [];
  const viewed = profile?.recent_viewed_recipe_ids ?? [];

  // tekrarları temizle
  return Array.from(new Set([...fav, ...saved, ...viewed]));
}

async function fetchRecipeMetaByIds(ids, supabase) {
  if (!ids || ids.length === 0) return {};

  const { data, error } = await withRetry(
    () =>
      supabase
        .from("recipe")
        .select("id, main_category, sub_categories")
        .in("id", ids),
    2,
    500,
    8000
  );

  if (error) throw error;

  // map'e çevir
  const map = {};
  for (const r of data ?? []) {
    map[r.id] = {
      id: r.id,
      main_category: r.main_category,
      sub_categories: r.sub_categories ?? [],
    };
  }

  return map;
}

async function buildRecipeMetaById(profile, supabase) {
  const ids = getHistoryRecipeIds(profile);
  return await fetchRecipeMetaByIds(ids, supabase);
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const ingredientsQ = searchParams.get("malzemeler");
  const { profile } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { savedIds } = useSaves();

  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [error, setError] = useState(null);

  const [recipeRatings, setRecipeRatings] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const ingredientList = useMemo(() => {
    return ingredientsQ
      ? ingredientsQ
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
  }, [ingredientsQ]);

  const searchTerms = useMemo(
    () => ingredientList.map(normalize).filter(Boolean),
    [ingredientList]
  );

  const getAverageRating = (recipeId) => {
    const ratings = recipeRatings[recipeId] || [];
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  };

  const handleAddToMenu = async () => {
    if (!isUserLoggedIn) {
      alert("Menüye eklemek için giriş yapmalısınız.");
      return;
    }
    if (recipeId == null) return;

    await toggleSave(recipeId);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (searchTerms.length === 0) {
          setFilteredRecipes([]);
          setIsLoading(false);
          return;
        }

        // Paralel istekler: arama ve meta aynı anda çek
        const [searchResult, metaResult] = await Promise.all([
          withRetry(
            () =>
              supabase.rpc("search_recipes_by_terms", {
                terms: searchTerms,
                lim: 100, // 150'den 100'e düşürdük
                off: 0,
              }),
            2,
            300,
            5000
          ),
          buildRecipeMetaById(profile, supabase),
        ]);

        const { data, error } = searchResult;

        if (error) throw error;

        const recipeMetaById = metaResult;

        const ctx = buildRankContext(profile, recipeMetaById);

        const ranked = data
          .map((r) => ({
            recipe: r,
            keys: rankKeys(r, profile, ctx, searchTerms),
          }))
          .sort(
            (a, b) =>
              b.keys.matchCount - a.keys.matchCount ||
              b.keys.blended - a.keys.blended
          )
          .map((x) => ({ ...x.recipe, ...x.keys }));

        setFilteredRecipes(ranked);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            "Tarifler yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
        );
        setIsLoading(false);
      }
    };

    run();
  }, [searchTerms.join(","), profile]); // profile gelince yeniden sıralasın

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl border-b font-medium text-gray-900 mb-8">
          {ingredientList.length > 0
            ? ingredientList.join(", ")
            : "Seçili malzeme yok"}{" "}
          ile Yapılabilecek Tarifler
        </h1>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-600 text-sm">Tarifler yükleniyor...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Bu malzemelerle yapılabilecek tarif bulunamadı.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const isInMenu = savedIds.includes(recipe.id);

              return (
                <Link
                  key={recipe.id}
                  href={`/tarif/${recipe.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleAddToMenu}
                      className={`absolute top-2 right-8 transition-colors duration-500 ${
                        isInMenu
                          ? "text-red-600"
                          : "text-white hover:text-red-600"
                      }`}
                      title={isInMenu ? "Menümden çıkar" : "Menüme ekle"}
                      aria-label="Menüme ekle veya çıkar"
                    >
                      {isInMenu ? (
                        <IconClipboardCheck
                          size={24}
                          className="text-green-600"
                        />
                      ) : (
                        <IconClipboardPlus size={24} />
                      )}
                    </button>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await toggleFavorite(recipe.id);
                        } catch (err) {
                          console.error(err);
                          alert("Favori güncellenemedi.");
                        }
                      }}
                      className={`absolute top-2 right-2 transition-colors duration-500 ${
                        favoriteIds.includes(recipe.id)
                          ? "text-red-600"
                          : "text-white hover:text-red-600"
                      }`}
                      title={
                        favoriteIds.includes(recipe.id) ? "Beğendiniz" : "Beğen"
                      }
                      aria-label="Beğen"
                    >
                      {favoriteIds.includes(recipe.id) ? (
                        <IconHeartFilled size={24} />
                      ) : (
                        <IconHeart size={24} />
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {recipe.name}
                    </h2>

                    <p className="text-sm text-gray-600 mb-2">
                      Kategori: {recipe.main_category}
                    </p>

                    {/* Rating Display (senin mevcut local rating mantığın) */}
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= getAverageRating(recipe.id)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {getAverageRating(recipe.id) > 0
                          ? `${getAverageRating(recipe.id).toFixed(1)} (${
                              recipeRatings[recipe.id]?.length || 0
                            } değerlendirme)`
                          : "Henüz değerlendirme yok"}
                      </span>
                    </div>

                    {recipe.missingIngredients?.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          Eksik Malzemeler:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {recipe.missingIngredients.map(
                            (ingredient, index) => (
                              <span
                                key={index}
                                className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full border capitalize border-red-100"
                              >
                                {ingredient?.ingredient}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
