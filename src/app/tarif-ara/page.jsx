"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SearchPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const router = useRouter();

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (ingredientToRemove) => {
    setIngredients(
      ingredients.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  };

  const handleSearch = () => {
    if (ingredients.length === 0) return;

    const queryString = encodeURIComponent(ingredients.join(","));
    router.push(`/tarif-ara/sonuclar?malzemeler=${queryString}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center  mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Malzemelerinizle Tarif Bulun
          </h1>
          <p className="text-gray-600">
            Elinizdeki malzemeleri ekleyin, size uygun tarifleri bulalım
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleAddIngredient} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Malzeme ekle (örn: domates)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
              >
                Ekle
              </button>
            </div>
          </form>

          {ingredients.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">
                Eklenen Malzemeler
              </h2>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span className="text-gray-700">{ingredient}</span>
                    <button
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={ingredients.length === 0}
            className={`w-full h-9 flex items-center justify-center rounded-lg text-white font-medium ${
              ingredients.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Tarifleri Bul
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
