"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import recipes from "./../../lib/api.json";
import { useAuth } from "@/context/AuthContext";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

const LikedRecipes = () => {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [recipeRatings, setRecipeRatings] = useState({});
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

  const likedRecipeDetails = recipes.filter((recipe) =>
    likedRecipes.includes(recipe.id)
  );

  if (!isUserLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-medium text-gray-900 mb-4">
            Beğenilen Tarifler
          </h1>
          <p className="text-gray-600 mb-4">
            Beğenilen tarifleri görmek için giriş yapmalısınız.
          </p>
          <Link
            href="/giris"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex border-b justify-between items-center mb-8">
          <h1 className="text-3xl font-medium text-gray-900">
            Beğenilen Tarifler
          </h1>
          <Link href="/" className="text-green-600 hover:text-green-700">
            ← Ana Sayfaya Dön
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {likedRecipeDetails.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/tarif/${recipe.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={recipe.resim}
                  alt={recipe.isim}
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
                  {recipe.isim}
                </h2>
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
                    {recipe.malzemeler.slice(0, 3).map((malzeme, index) => (
                      <li key={index}>{malzeme}</li>
                    ))}
                    {recipe.malzemeler.length > 3 && (
                      <li className="text-gray-500">
                        ve {recipe.malzemeler.length - 3} malzeme daha...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {likedRecipeDetails.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Henüz beğendiğiniz tarif bulunmamaktadır.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedRecipes;
