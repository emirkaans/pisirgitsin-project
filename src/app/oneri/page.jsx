"use client";
import {
  buildChickenDishRecipe,
  buildLegumeDishRecipe,
  buildMeatDishRecipe,
  buildMilkDessertRecipe,
  buildPastaRecipe,
  buildPastryRecipe,
  buildSeafoodDishRecipe,
  buildSoupRecipe,
  buildVegetableDishRecipe,
  SOUP_RECIPES_BY_SUBCATEGORY,
} from "@/lib/utils";
import React, { useState } from "react";

const CATEGORY_OPTIONS = [
  { id: "SOUP", label: "Çorbalar", builder: buildSoupRecipe },
  {
    id: "LEGUME_DISH",
    label: "Bakliyat Yemekleri",
    builder: buildLegumeDishRecipe,
  },
  {
    id: "VEGETABLE_DISH",
    label: "Sebze Yemekleri",
    builder: buildVegetableDishRecipe,
  },
  { id: "MEAT_DISH", label: "Et Yemekleri", builder: buildMeatDishRecipe },
  {
    id: "CHICKEN_DISH",
    label: "Tavuk Yemekleri",
    builder: buildChickenDishRecipe,
  },
  { id: "PASTA", label: "Makarna", builder: buildPastaRecipe },
  {
    id: "SEAFOOD_DISH",
    label: "Deniz Ürünleri",
    builder: buildSeafoodDishRecipe,
  },
  {
    id: "MILK_DESSERT",
    label: "Sütlü Tatlılar",
    builder: buildMilkDessertRecipe,
  },
  { id: "PASTRY", label: "Hamur İşleri", builder: buildPastryRecipe },
];

const RecipeSuggester = () => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(["SOUP"]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [results, setResults] = useState([]);

  const handleToggleCategory = (id) => {
    setResults([]);
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (!trimmed) return;
    if (!ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setIngredientInput("");
    setResults([]);
  };

  const handleIngredientKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (name) => {
    setIngredients((prev) => prev.filter((ing) => ing !== name));
    setResults([]);
  };

  const handleClearIngredients = () => {
    setIngredients([]);
    setResults([]);
  };

  const handleGenerate = () => {
    console.log("SOUP MAP", SOUP_RECIPES_BY_SUBCATEGORY);
    console.log(
      "Soup test",
      buildSoupRecipe(["brokoli", "süt", "mantar", "krema", "patates", "havuç"])
    );

    console.log({ ingredients, selectedCategoryIds });
    if (!ingredients.length) {
      setResults([]);
      return;
    }

    const newResults = [];

    selectedCategoryIds.forEach((catId) => {
      const option = CATEGORY_OPTIONS.find((c) => c.id === catId);
      if (!option || typeof option.builder !== "function") return;
      console.log({ option });
      const recipe = option.builder(ingredients);
      if (recipe) {
        newResults.push({
          categoryId: catId,
          categoryLabel: option.label,
          ...recipe,
        });
      }
    });

    console.log({ newResults });

    setResults(newResults);
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "1.5rem",
      }}
    >
      <h1 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>
        Akıllı Tarif Önerici
      </h1>

      <section
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          1. Öneri almak istediğin kategorileri seç:
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {CATEGORY_OPTIONS.map((cat) => (
            <label
              key={cat.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.35rem 0.7rem",
                borderRadius: "999px",
                border: selectedCategoryIds.includes(cat.id)
                  ? "1px solid #2563eb"
                  : "1px solid #ccc",
                backgroundColor: selectedCategoryIds.includes(cat.id)
                  ? "#eff4ff"
                  : "#fff",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(cat.id)}
                onChange={() => handleToggleCategory(cat.id)}
              />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          2. Elindeki malzemeleri yaz:
        </h2>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Örn: brokoli, krema, makarna..."
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={handleIngredientKeyDown}
            style={{
              flex: "1",
              minWidth: "180px",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "0.95rem",
            }}
          />
          <button
            type="button"
            onClick={handleAddIngredient}
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "white",
              cursor: "pointer",
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
            }}
          >
            Ekle
          </button>
          {ingredients.length > 0 && (
            <button
              type="button"
              onClick={handleClearIngredients}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                cursor: "pointer",
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
              }}
            >
              Tümünü Temizle
            </button>
          )}
        </div>

        {ingredients.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {ingredients.map((ing) => (
              <span
                key={ing}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "999px",
                  backgroundColor: "#f3f4f6",
                  fontSize: "0.85rem",
                }}
              >
                {ing}
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(ing)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Henüz malzeme eklemedin.
          </p>
        )}
      </section>

      {/* Öneri butonu */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!ingredients.length || !selectedCategoryIds.length}
          style={{
            padding: "0.7rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor:
              !ingredients.length || !selectedCategoryIds.length
                ? "#9ca3af"
                : "#16a34a",
            color: "white",
            cursor:
              !ingredients.length || !selectedCategoryIds.length
                ? "not-allowed"
                : "pointer",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          Tarif Önerisi Getir
        </button>
      </div>

      {/* Sonuçlar */}
      <section>
        {results.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            Henüz öneri yok. Kategori seçip malzeme ekledikten sonra “Tarif
            Önerisi Getir”e bas.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {results.map((r, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "0.3rem",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{r.name}</h3>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    Kategori: {r.categoryLabel}
                  </span>
                </div>

                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Malzemeler:</strong>
                  <ul style={{ margin: "0.25rem 0 0 1.1rem", padding: 0 }}>
                    {r.ingredients.map((ing) => (
                      <li key={ing} style={{ fontSize: "0.9rem" }}>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong>Yapılışı:</strong>
                  <ol style={{ margin: "0.25rem 0 0 1.1rem", padding: 0 }}>
                    {r.steps.map((step, i) => (
                      <li
                        key={i}
                        style={{ fontSize: "0.9rem", marginBottom: "0.15rem" }}
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RecipeSuggester;
