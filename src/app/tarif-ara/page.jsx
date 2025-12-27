"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { allRecipeIngredients } from "@/lib/searchIngredients";
import {
  calculateLevenshteinDistance,
  BKTree,
  getIngredientSuggestions,
} from "@/lib/didYouMean";

const SearchPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isExactMatch, setIsExactMatch] = useState(false);

  const router = useRouter();

  const ingredientSearchTree = useMemo(() => {
    const tree = new BKTree(calculateLevenshteinDistance);
    for (const term of allRecipeIngredients) tree.addTerm(term);
    return tree;
  }, []);

  const handleInputChange = (value) => {
    setNewIngredient(value);

    const { isExactMatch, suggestions } = getIngredientSuggestions(
      value,
      { maxDistance: 2, maxSuggestions: 5, minimumInputLength: 2 },
      ingredientSearchTree
    );

    setIsExactMatch(isExactMatch);
    setSuggestions(suggestions);
  };

  const handlePickSuggestion = (term) => {
    setNewIngredient(term);

    setIsExactMatch(true);
    setSuggestions([]);
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();

    const trimmed = newIngredient.trim();
    if (!trimmed) return;

    const check = getIngredientSuggestions(
      trimmed,
      { maxDistance: 2, maxSuggestions: 5, minimumInputLength: 2 },
      ingredientSearchTree
    );

    if (!check.isExactMatch) {
      setIsExactMatch(false);
      setSuggestions(check.suggestions);
      return;
    }

    if (!ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
    }

    setNewIngredient("");
    setSuggestions([]);
    setIsExactMatch(false);
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

  const showDidYouMean =
    newIngredient.trim().length >= 2 && !isExactMatch && suggestions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
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
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Malzeme ekle (örn: domates)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />

                {/* 3) Did you mean UI */}
                {showDidYouMean && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-md p-2">
                    <div className="flex flex-col">
                      {suggestions.map((sug) => (
                        <button
                          key={`${sug.term}-${sug.distance}`}
                          type="button"
                          onClick={() => handlePickSuggestion(sug.term)}
                          className="text-left px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                          <span className="text-gray-900">{sug.term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
              >
                Ekle
              </button>
            </div>

            {newIngredient.trim().length >= 2 &&
              !isExactMatch &&
              suggestions.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Malzeme listede bulunamadı. Önerilerden birini seçebilirsiniz.
                </p>
              )}
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
                      type="button"
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
