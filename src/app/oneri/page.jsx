"use client";
import { useAuth } from "@/context/AuthContext";
import { generateAndRankAllCandidates } from "@/lib/suggesterPipeline";
import { supabase } from "@/lib/supabase";

import React, { useState } from "react";

export async function buildRecipeMetaByIdFromProfile(profile) {
  const recipeIds = Array.from(
    new Set([
      ...(profile?.favorite_recipe_ids ?? []),
      ...(profile?.saved_recipe_ids ?? []),
      ...(profile?.recent_viewed_recipe_ids ?? []),
    ])
  );

  if (recipeIds.length === 0) return {};

  // ⚡ sadece ihtiyacımız olan alanlar
  const { data, error } = await supabase
    .from("recipe")
    .select("id, main_category, sub_categories")
    .in("id", recipeIds);

  if (error) {
    console.error("recipe meta fetch error:", error);
    return {};
  }

  // ID → meta map
  const map = {};
  for (const r of data) {
    map[r.id] = {
      id: r.id,
      main_category: r.main_category,
      sub_categories: r.sub_categories ?? [],
    };
  }

  return map;
}

const CATEGORY_OPTIONS = [
  { id: "SOUP", label: "Çorbalar" },
  {
    id: "LEGUME_DISH",
    label: "Bakliyat Yemekleri",
  },
  {
    id: "VEGETABLE_DISH",
    label: "Sebze Yemekleri",
  },
  { id: "MEAT_DISH", label: "Et Yemekleri" },
  {
    id: "CHICKEN_DISH",
    label: "Tavuk Yemekleri",
  },
  { id: "PASTA", label: "Makarna" },
  {
    id: "SEAFOOD_DISH",
    label: "Deniz Ürünleri",
  },
  {
    id: "MILK_DESSERT",
    label: "Sütlü Tatlılar",
  },
  { id: "PASTRY", label: "Hamur İşleri" },
];

const RecipeSuggester = () => {
  const { profile, user, isUserLoggedIn } = useAuth();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(["SOUP"]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState();
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

  const handleGenerate = async () => {
    if (!ingredients.length) return setResults([]);

    // history meta map: fav/saved/view id'leri için {id, main_category, sub_categories}
    const recipeMetaById = await buildRecipeMetaByIdFromProfile(profile);
    // (bunu sen supabase'den 1 query ile çekiyorsun)

    const { results } = generateAndRankAllCandidates({
      profile,
      recipeMetaById,
      userIngredients: ingredients,
      selectedCategoryIds,
      limit: 30,
    });

    console.log({ results });

    setResults(results);
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
        {results.map((r, idx) => (
          <div
            key={r.id ?? idx}
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
                gap: "1rem",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{r.name}</h3>

              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  textAlign: "right",
                }}
              >
                Kategori: {r.main_category}
                {Array.isArray(r.sub_categories) && r.sub_categories.length > 0
                  ? ` • ${r.sub_categories.join(" / ")}`
                  : ""}
              </span>
            </div>

            {/* Skor (debug istersen) */}
            <div
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                marginBottom: "0.6rem",
              }}
            >
              score: {Number(r._score ?? 0).toFixed(2)} • stage:{" "}
              {Number(r._stage ?? 0).toFixed(2)}
            </div>

            {/* Malzemeler */}
            <div style={{ marginBottom: "0.75rem" }}>
              <strong>Gereken malzemeler:</strong>
              {Array.isArray(r.required_ingredients) &&
              r.required_ingredients.length ? (
                <ul style={{ margin: "0.25rem 0 0 1.1rem", padding: 0 }}>
                  {r.required_ingredients.map((ing) => (
                    <li key={`req-${ing}`} style={{ fontSize: "0.9rem" }}>
                      {ing}
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    marginTop: "0.25rem",
                  }}
                >
                  (Bu öneri için required listesi boş görünüyor — builder’da
                  used_ingredients eksik olabilir.)
                </div>
              )}
            </div>

            {/* Eksikler */}
            {r.missing_required?.length || r.missing_base?.length ? (
              <div style={{ marginBottom: "0.75rem" }}>
                <strong>Eksik malzemeler:</strong>
                <ul style={{ margin: "0.25rem 0 0 1.1rem", padding: 0 }}>
                  {Array.isArray(r.missing_required) &&
                    r.missing_required.map((x) => (
                      <li key={`miss-req-${x}`} style={{ fontSize: "0.9rem" }}>
                        {x} <span style={{ color: "#ef4444" }}>(gerekli)</span>
                      </li>
                    ))}
                  {Array.isArray(r.missing_base) &&
                    r.missing_base.map((x) => (
                      <li key={`miss-base-${x}`} style={{ fontSize: "0.9rem" }}>
                        {x}
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}

            {/* Yapılış */}
            {Array.isArray(r.instructions) && r.instructions.length ? (
              <div>
                <strong>Yapılışı:</strong>
                <ol style={{ margin: "0.25rem 0 0 1.1rem", padding: 0 }}>
                  {r.instructions.map((step, i) => (
                    <li
                      key={`step-${i}`}
                      style={{ fontSize: "0.9rem", marginBottom: "0.15rem" }}
                    >
                      {step}
                    </li>
                  ))}
                </ol>

                {r.time?.prepMin || r.time?.cookMin ? (
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginTop: "0.5rem",
                    }}
                  >
                    Süre:{" "}
                    {r.time?.prepMin ? `Hazırlık ${r.time.prepMin} dk` : ""}
                    {r.time?.cookMin
                      ? `${r.time?.prepMin ? " • " : ""}Pişirme ${
                          r.time.cookMin
                        } dk`
                      : ""}
                  </div>
                ) : null}

                {Array.isArray(r.tips) && r.tips.length ? (
                  <div style={{ marginTop: "0.5rem" }}>
                    <strong>İpuçları:</strong>
                    <ul style={{ margin: "0.25rem 0 0 1.1rem", padding: 0 }}>
                      {r.tips.map((t, i) => (
                        <li key={`tip-${i}`} style={{ fontSize: "0.9rem" }}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
};

export default RecipeSuggester;
