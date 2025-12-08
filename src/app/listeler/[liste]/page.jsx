"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import recipes from "@/lib/api.json";
import { IconArrowLeft } from "@tabler/icons-react";
import { useState, useEffect } from "react";

const ListeSayfasi = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [listedRecipes, setListedRecipes] = useState([]);
  const router = useRouter();
  const liste = decodeURIComponent(params.liste);

  const getListedRecipes = () => {
    switch (liste) {
      case "kolay-tarifler":
        return recipes.filter((recipe) => recipe.zorluk === "Kolay");
      case "yeni-tarifler":
        return [...recipes].sort((a, b) => b.id - a.id).slice(0, 6);
      case "ozel-tarifler":
        return recipes.filter((recipe) => recipe.öne_çıkar);
      case "populer-tarifler":
        return recipes.filter((recipe) => recipe.popüler);
      default:
        return [];
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const recipes = getListedRecipes();
    setTimeout(() => {
      setListedRecipes(recipes);
      setIsLoading(false);
    }, 500);
  }, [liste]);

  const getListeBilgisi = () => {
    switch (liste) {
      case "kolay-tarifler":
        return {
          baslik: "Kolay Tarifler",
          aciklama: "Pratik ve lezzetli tariflerle mutfağınızı şenlendirin",
        };
      case "yeni-tarifler":
        return {
          baslik: "Yeni Tarifler",
          aciklama: "En son eklediğimiz lezzetli tarifler",
        };
      case "ozel-tarifler":
        return {
          baslik: "Özel Tarifler",
          aciklama: "Sizin için özenle seçtiğimiz özel tarifler",
        };
      case "populer-tarifler":
        return {
          baslik: "Popüler Tarifler",
          aciklama: "En çok beğenilen tarifler",
        };
      default:
        return {
          baslik: "Tarifler",
          aciklama: "",
        };
    }
  };

  const handleBack = () => {
    router.back();
  };

  const { baslik, aciklama } = getListeBilgisi();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-green-600 hover:text-green-700"
          >
            <IconArrowLeft size={20} className="mr-2" />
            Geri Dön
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{baslik}</h1>
          <p className="text-lg text-gray-600">{aciklama}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
            </div>
          </div>
        ) : listedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Bu listede henüz tarif bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listedRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/tarif/${recipe.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={recipe.resim}
                    alt={recipe.isim}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {recipe.isim}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {recipe.zorluk}
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {recipe.süre}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recipe.etiketler.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeSayfasi;
