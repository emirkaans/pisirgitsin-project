"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSaves } from "@/context/SavesContext";
import {
  IconTrash,
  IconShoppingCart,
  IconCheck,
  IconCopy,
} from "@tabler/icons-react";
import { toast } from "sonner";

const UNIT_REGEX = /^\d+\s+(?:adet|su bardağı|yemek kaşığı|çay kaşığı|gram)\s+/;

function ingredientToString(ing) {
  // ing: { amount: { unit, value }, ingredient }
  const v = ing?.amount?.value;
  const u = ing?.amount?.unit;
  const name = ing?.ingredient;

  const left = [v, u].filter(Boolean).join(" ");
  return [left, name].filter(Boolean).join(" ").trim();
}

function baseIngredientName(s) {
  return String(s || "")
    .replace(UNIT_REGEX, "")
    .trim();
}

const MenuPage = () => {
  const router = useRouter();
  const { isUserLoggedIn } = useAuth();

  const {
    savedIds,
    loading: savesLoading,
    saving: savesSaving,
    error: savesError,
    fetchSaveRecipes,
    savedRecipes,
    toggleSave,
  } = useSaves();

  const [menuItems, setMenuItems] = useState([]); // recipe objects
  const [selectedRecipes, setSelectedRecipes] = useState([]); // recipe ids
  const [shoppingList, setShoppingList] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // login guard
  useEffect(() => {
    if (!isUserLoggedIn) {
      router.push("/giris-yap");
    }
  }, [isUserLoggedIn, router]);

  // local ingredient availability (bunu db’ye taşımaya gerek yok şimdilik)
  useEffect(() => {
    const savedAvailableIngredients = JSON.parse(
      localStorage.getItem("availableIngredients") || "[]"
    );
    setAvailableIngredients(savedAvailableIngredients);
  }, []);

  // savedIds değiştikçe tarifleri çek
  useEffect(() => {
    if (!isUserLoggedIn) return;

    // Provider’da savedRecipes state’i var; ama burada net olsun diye fetch çağırıyoruz
    fetchSaveRecipes();
  }, [isUserLoggedIn, savedIds, fetchSaveRecipes]);

  // Provider'dan gelen savedRecipes'i MenuPage'in menuItems'ına bağla
  useEffect(() => {
    setMenuItems(Array.isArray(savedRecipes) ? savedRecipes : []);
  }, [savedRecipes]);

  const handleRecipeSelect = useCallback((recipeId) => {
    setSelectedRecipes((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  }, []);

  const handleRemoveFromMenu = useCallback(
    async (recipeId) => {
      try {
        await toggleSave(recipeId); // ✅ kaydetmeyi kaldırır (RPC + saves_count)
        toast.success("Menüden çıkarıldı.");
        // selected listesinde varsa çıkar
        setSelectedRecipes((prev) => prev.filter((id) => id !== recipeId));
      } catch (e) {
        console.error(e);
        toast.error("Menüden çıkarılamadı.");
      }
    },
    [toggleSave]
  );

  const generateShoppingList = useCallback(() => {
    const selectedRecipesData = menuItems.filter((r) =>
      selectedRecipes.includes(r.id)
    );

    if (selectedRecipesData.length === 0) {
      toast.info("Önce listeden tarif seçmelisiniz.");
      return;
    }

    const quantityMap = {};

    selectedRecipesData.forEach((recipe) => {
      (recipe.ingredients ?? []).forEach((ing) => {
        const full = ingredientToString(ing);
        if (!full) return;

        // Basit birleştirme: "2 adet yumurta" gibi
        // Aynı malzeme + aynı unit birikirse toplar
        const match = full.match(
          /^(\d+)\s+((?:adet|su bardağı|yemek kaşığı|çay kaşığı|gram)\s+)?(.+)$/
        );

        if (match) {
          const quantity = parseInt(match[1], 10);
          const unit = (match[2] || "").trim(); // "adet" gibi
          const ingredientName = (match[3] || "").trim();

          const key = unit ? `${unit} ${ingredientName}` : ingredientName;
          quantityMap[key] =
            (quantityMap[key] || 0) +
            (Number.isFinite(quantity) ? quantity : 1);
        } else {
          quantityMap[full] = (quantityMap[full] || 0) + 1;
        }
      });
    });

    const ingredientsWithQuantities = Object.entries(quantityMap).map(
      ([key, quantity]) => {
        // key = "adet yumurta" gibi olabilir
        // zaten "adet ..." ise quantity ile birleştir
        const hasUnit = key.match(
          /^(adet|su bardağı|yemek kaşığı|çay kaşığı|gram)\s+/
        );
        if (hasUnit) return `${quantity} ${key}`;
        return key;
      }
    );

    setShoppingList(ingredientsWithQuantities);
    setShowShoppingList(true);
  }, [menuItems, selectedRecipes]);

  const toggleIngredientAvailability = useCallback((ingredientLine) => {
    const base = baseIngredientName(ingredientLine);

    setAvailableIngredients((prev) => {
      const newList = prev.includes(base)
        ? prev.filter((item) => item !== base)
        : [...prev, base];

      localStorage.setItem("availableIngredients", JSON.stringify(newList));
      return newList;
    });
  }, []);

  const toggleShoppingList = useCallback(() => {
    setShowShoppingList((v) => !v);
  }, []);

  const getNeededIngredients = useCallback(() => {
    if (!shoppingList || shoppingList.length === 0) return [];

    return shoppingList.filter((line) => {
      const base = baseIngredientName(line);
      return !availableIngredients.includes(base);
    });
  }, [shoppingList, availableIngredients]);

  const handleCopyToClipboard = useCallback(() => {
    const needed = getNeededIngredients();
    if (needed.length === 0) {
      toast.info("Kopyalanacak eksik malzeme bulunmuyor.");
      return;
    }
    navigator.clipboard.writeText(needed.join("\n"));
    toast.success("Eksik malzemeler kopyalandı.");
  }, [getNeededIngredients]);

  const pageLoading = savesLoading || savesSaving;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center border-b pb-2 justify-between mb-8">
            <h1 className="text-3xl font-medium text-gray-900">Menüm</h1>

            {menuItems.length > 0 && (
              <button
                onClick={generateShoppingList}
                disabled={selectedRecipes.length === 0}
                className={`flex items-center gap-2 h-9 justify-center px-4 rounded-lg font-medium transition-all duration-200 ${
                  selectedRecipes.length === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                }`}
              >
                <IconShoppingCart size={20} />
                Alışveriş Listesi Oluştur
              </button>
            )}
          </div>

          {/* Error */}
          {savesError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
              Bir hata oluştu: {savesError.message || String(savesError)}
            </div>
          )}

          {/* Loading */}
          {pageLoading && (
            <div className="mb-6 text-sm text-gray-500">Yükleniyor...</div>
          )}

          {menuItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600 mb-4 text-lg">
                Henüz menünüze tarif eklemediniz.
              </p>
              <Link
                href="/listeler/populer-tarifler"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                Popüler Tariflere Göz At
                <span className="text-xl">→</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 divide-x md:grid-cols-2">
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Menüdeki Tarifler
                </h2>

                <div className="space-y-3">
                  {menuItems.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedRecipes.includes(recipe.id)}
                          onChange={() => handleRecipeSelect(recipe.id)}
                          className="w-5 h-5 accent-orange-900 rounded-lg border-gray-300 focus:ring-orange-500"
                        />
                        <Link
                          href={`/tarif/${recipe.id}`}
                          className="text-gray-900 hover:text-green-600 font-medium"
                        >
                          {recipe.name}
                        </Link>
                      </div>

                      <button
                        onClick={() => handleRemoveFromMenu(recipe.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Menüden Çıkar"
                      >
                        <IconTrash size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {showShoppingList && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Malzeme Listesi
                    </h2>
                    <button
                      onClick={toggleShoppingList}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Tüm Malzemeler
                      </h3>

                      <ul className="space-y-2">
                        {shoppingList.map((ingredient, index) => {
                          const base = baseIngredientName(ingredient);
                          const isAvailable =
                            availableIngredients.includes(base);

                          return (
                            <li
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                                isAvailable
                                  ? "bg-green-50 border border-green-200"
                                  : "hover:bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    isAvailable ? "bg-green-500" : "bg-gray-400"
                                  }`}
                                ></span>
                                <span
                                  className={`font-medium ${
                                    isAvailable
                                      ? "text-green-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {ingredient}
                                </span>
                              </div>

                              <button
                                onClick={() =>
                                  toggleIngredientAvailability(ingredient)
                                }
                                className={`p-2 rounded-lg transition-colors duration-200 ${
                                  isAvailable
                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
                                }`}
                                title={isAvailable ? "Evde Var" : "Evde Yok"}
                              >
                                <IconCheck size={18} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {getNeededIngredients().length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            Alınacak Malzemeler
                          </h3>
                          <button
                            onClick={handleCopyToClipboard}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                          >
                            <IconCopy size={18} />
                          </button>
                        </div>

                        <ul className="space-y-2">
                          {getNeededIngredients().map((ingredient, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                            >
                              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                              <span className="text-red-700 font-medium">
                                {ingredient}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
