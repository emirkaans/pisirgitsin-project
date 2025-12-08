"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import recipes from "./../../../lib/api.json";
import { useAuth } from "@/context/AuthContext";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

function ResultsContent() {
  const searchParams = useSearchParams();
  const ingredients = searchParams.get("ingredients");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [recipeRatings, setRecipeRatings] = useState({});
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isUserLoggedIn } = useAuth();

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

  const extractIngredientName = (ingredient) => {
    return ingredient
      .replace(
        /^\d+(?:[.,]\d+)?\s*(adet|su bardağı|çay bardağı|yemek kaşığı|tatlı kaşığı|çay kaşığı|gram|kg|ml|lt|dilim|demet|bağ|tutam|fincan|kâse|kase|parça|dilim|küp|küçük|orta|iri|büyük|küçük boy|orta boy|iri boy|küçük boyda|orta boyda|iri boyda|küçük boyutlu|orta boyutlu|iri boyutlu|küçük parça|orta parça|iri parça|küçük doğranmış|orta doğranmış|iri doğranmış|küçük halka|orta halka|iri halka|küçük küp|orta küp|iri küp|küçük dilim|orta dilim|iri dilim|küçük parçalar|orta parçalar|iri parçalar|küçük doğranmış|orta doğranmış|iri doğranmış|küçük halkalar|orta halkalar|iri halkalar|küçük küpler|orta küpler|iri küpler|küçük dilimler|orta dilimler|iri dilimler)\s*/gi,
        ""
      )
      .replace(/^\d+(?:[.,]\d+)?\s*/, "")
      .trim();
  };

  useEffect(() => {
    try {
      setIsLoading(true);
      if (ingredients) {
        const searchTerms = ingredients
          .split(",")
          .map((term) => term.trim().toLowerCase());

        const filtered = recipes
          .map((recipe) => {
            const missingIngredients = recipe.ingredients.filter(
              (ingredient) => {
                ingredient = ingredient?.ingredient.toLowerCase();
                return !searchTerms.some((term) => ingredient.includes(term));
              }
            );

            return {
              ...recipe,
              missingIngredients,
            };
          })
          .filter((recipe) => {
            const recipeIngredients = recipe.ingredients.map((ingredient) =>
              ingredient?.ingredient.toLowerCase()
            );
            return searchTerms.some((term) =>
              recipeIngredients.some((ing) => ing.includes(term))
            );
          });

        setTimeout(() => {
          setFilteredRecipes(filtered);
          setIsLoading(false);
        }, 500);
      }
    } catch (err) {
      setError("Tarifler yüklenirken bir hata oluştu");
      console.error(err);
      setIsLoading(false);
    }
  }, [ingredients]);

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
          {ingredients.split(",").join(", ")} ile Yapılabilecek Tarifler
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
                    Kategori: {recipe.kategori}
                  </p>
                  {/* Rating Display */}
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
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      Malzemeler:
                    </h3>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>
                          {ingredient?.amount?.value} {ingredient?.amount?.unit}{" "}
                          {ingredient?.ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {recipe.missingIngredients.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        Eksik Malzemeler:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recipe.missingIngredients.map((malzeme, index) => (
                          <span
                            key={index}
                            className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full border capitalize border-red-100"
                          >
                            {extractIngredientName(malzeme)}
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
