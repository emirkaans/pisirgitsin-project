"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase, withRetry } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useFavorites } from "@/context/FavoritesContext";

const categories = [
  { id: 1, name: "Ana Yemekler" },
  { id: 2, name: "Tatlılar" },
  { id: 3, name: "Salatalar" },
  { id: 4, name: "Çorbalar" },
  { id: 5, name: "Kahvaltılıklar" },
  { id: 8, name: "Hamur İşleri" },
  { id: 9, name: "Vejetaryen" },
  { id: 11, name: "Glutensiz" },
  { id: 12, name: "Diyet Yemekler" },
  { id: 14, name: "Deniz Ürünleri" },
  { id: 15, name: "Et Yemekleri" },
  { id: 16, name: "Dünya Mutfağı" },
  { id: 17, name: "Tavuk Yemekleri" },
  { id: 18, name: "Zeytinyağlılar" },
  { id: 19, name: "Atıştırmalıklar" },
  { id: 20, name: "Baklagil Yemekleri" },
];

const CategoryRecipes = () => {
  const params = useParams();
  const categoryId = Number(params.id);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [categoryRecipes, setCategoryRecipes] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const { isUserLoggedIn } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const category = categories.find((c) => c.id === categoryId);
      setCategoryName(category?.name ?? "");

      if (!category?.name) {
        setCategoryRecipes([]);
        setIsLoading(false);
        return;
      }

      try {
        const json = JSON.stringify([category.name]);

        const { data, error: fetchError } = await withRetry(
          () =>
            supabase
              .from("recipe")
              .select(
                "id,name,image_url,ingredients,main_category,sub_categories,time_in_minutes"
              )
              .or(`main_category.eq.${category.name},sub_categories.cs.${json}`),
          2,
          500,
          8000
        );

        if (cancelled) return;

        if (fetchError) {
          console.error("category recipes error:", fetchError);
          setError(
            fetchError.message ||
              "Tarifler yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
          );
          setCategoryRecipes([]);
        } else {
          setCategoryRecipes(data ?? []);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Unexpected error:", err);
        setError(
          err.message ||
            "Tarifler yüklenirken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin."
        );
        setCategoryRecipes([]);
      }

      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-600 text-sm">Tarifler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <>
            <div className="flex border-b justify-between items-center mb-8">
              <h1 className="text-3xl font-medium text-gray-900">
                {categoryName}
              </h1>
              <Link
                href="/kategoriler"
                className="text-green-600 hover:text-green-700"
              >
                ← Kategorilere Dön
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryRecipes.map((recipe) => (
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

                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        Malzemeler:
                      </h3>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {(recipe.ingredients ?? [])
                          .slice(0, 3)
                          .map((ingredient, index) => (
                            <li key={index}>
                              {ingredient?.amount?.value}{" "}
                              {ingredient?.amount?.unit}{" "}
                              {ingredient?.ingredient}
                            </li>
                          ))}
                        {(recipe.ingredients ?? []).length > 3 && (
                          <li className="text-gray-500">
                            ve {(recipe.ingredients ?? []).length - 3} malzeme
                            daha...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {categoryRecipes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  Bu kategoride henüz tarif bulunmamaktadır.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryRecipes;
