"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

import {
  recipeHasAllergen,
  isBlockedByDiet,
  computeIngredientMatch,
  scoreRecipe,
  rankRecipe,
  rankKeys,
} from "@/lib/recommendSearch";
import { DIET_BONUS_MAP } from "@/constants/constants";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .trim();
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const ingredientsQ = searchParams.get("malzemeler");
  console.log({ ingredientsQ });
  const { isUserLoggedIn, profile } = useAuth();

  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [error, setError] = useState(null);

  // (like/rating kısmını şimdilik aynı bıraktım)
  const [recipeRatings, setRecipeRatings] = useState({});
  const [likedRecipes, setLikedRecipes] = useState([]);
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

  useEffect(() => {
    const savedRatings = JSON.parse(
      localStorage.getItem("recipeRatings") || "{}"
    );
    setRecipeRatings(savedRatings);

    const savedLikes = JSON.parse(localStorage.getItem("likedRecipes") || "[]");
    setLikedRecipes(savedLikes);
  }, []);

  const getAverageRating = (recipeId) => {
    const ratings = recipeRatings[recipeId] || [];
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  };

  const handleLike = (recipeId, e) => {
    e.preventDefault();
    if (!isUserLoggedIn) {
      alert("Beğenmek için giriş yapmalısınız.");
      return;
    }

    const newLikedRecipes = likedRecipes.includes(recipeId)
      ? likedRecipes.filter((id) => id !== recipeId)
      : [...likedRecipes, recipeId];

    localStorage.setItem("likedRecipes", JSON.stringify(newLikedRecipes));
    setLikedRecipes(newLikedRecipes);
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

        // ✅ DB’den tarifleri çek (school project: geniş çek + client-side skorla)
        const { data, error } = await supabase.rpc("search_recipes_by_terms", {
          terms: searchTerms, // normalize edilmiş ["domates","patlıcan","soğan"]
          lim: 150,
          off: 0,
        });

        console.log({ data });
        if (error) throw error;

        const ranked = (data ?? [])
          .map((r) => {
            const { personal, popularity } = rankKeys(r, profile);
            return { ...r, _personal: personal, _pop: popularity };
          })
          .sort((a, b) => {
            if (b.match_count !== a.match_count)
              return b.match_count - a.match_count;
            if (b._personal !== a._personal) return b._personal - a._personal;
            return b._pop - a._pop;
          });

        console.log({ ranked });
        setFilteredRecipes(ranked);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError("Tarifler yüklenirken bir hata oluştu");
        setIsLoading(false);
      }
    };

    run();
  }, [searchTerms.join(","), profile]); // profile gelince yeniden sıralasın

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">
            <p>{error}</p>
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
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
            </div>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Bu malzemelerle yapılabilecek tarif bulunamadı.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
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
                    onClick={(e) => handleLike(recipe.id, e)}
                    className={`absolute top-2 right-2 transition-colors duration-500 ${
                      likedRecipes.includes(recipe.id)
                        ? "text-red-600"
                        : "text-white hover:text-red-600"
                    }`}
                    title={
                      likedRecipes.includes(recipe.id) ? "Beğendiniz" : "Beğen"
                    }
                    aria-label="Beğen"
                  >
                    {likedRecipes.includes(recipe.id) ? (
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
                        {recipe.missingIngredients.map((ingredient, index) => (
                          <span
                            key={index}
                            className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full border capitalize border-red-100"
                          >
                            {ingredient?.ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
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
