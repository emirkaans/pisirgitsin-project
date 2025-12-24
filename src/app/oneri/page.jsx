"use client";
import { useAuth } from "@/context/AuthContext";
import { generateAndRankAllCandidates } from "@/lib/suggesterPipeline";
import { supabase } from "@/lib/supabase";
import { allIngredients } from "@/lib/builders";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import React, { useMemo, useState, useEffect } from "react";

// -----------------------------
// ✅ 0) Turkish Normalization (script.js’den)
// -----------------------------
function normalizeTurkishCharacters(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/i̇/g, "i");
}

// ----------------------------------
// ✅ 1) Levenshtein Distance (script.js’den, debugger kaldırıldı)
// ----------------------------------
function calculateLevenshteinDistance(source, target) {
  source = source.toLowerCase();
  target = target.toLowerCase();

  const sourceLength = source.length;
  const targetLength = target.length;

  const distanceRow = new Array(targetLength + 1);
  for (let j = 0; j <= targetLength; j++) distanceRow[j] = j;

  for (let i = 1; i <= sourceLength; i++) {
    let previousDiagonal = distanceRow[0];
    distanceRow[0] = i;

    for (let j = 1; j <= targetLength; j++) {
      const previousRowSameColumn = distanceRow[j];
      const substitutionCost = source[i - 1] === target[j - 1] ? 0 : 1;

      distanceRow[j] = Math.min(
        distanceRow[j] + 1,
        distanceRow[j - 1] + 1,
        previousDiagonal + substitutionCost
      );

      previousDiagonal = previousRowSameColumn;
    }
  }

  return distanceRow[targetLength];
}

// ----------------------
// ✅ 2) BK-Tree (script.js’den)
// ----------------------
class BKTreeNode {
  constructor(originalTerm) {
    this.originalTerm = originalTerm;
    this.normalizedTerm = normalizeTurkishCharacters(originalTerm);
    this.children = new Map();
  }
}

class BKTree {
  constructor(distanceFunction) {
    this.distanceFunction = distanceFunction;
    this.rootNode = null;
  }

  addTerm(originalTerm) {
    if (!originalTerm) return;

    const normalizedTerm = normalizeTurkishCharacters(originalTerm);

    if (!this.rootNode) {
      this.rootNode = new BKTreeNode(originalTerm);
      return;
    }

    let currentNode = this.rootNode;

    while (true) {
      const distance = this.distanceFunction(
        normalizedTerm,
        currentNode.normalizedTerm
      );
      const childNode = currentNode.children.get(distance);

      if (!childNode) {
        currentNode.children.set(distance, new BKTreeNode(originalTerm));
        return;
      }

      currentNode = childNode;
    }
  }

  searchSimilarTerms(query, maxAllowedDistance = 2) {
    if (!this.rootNode) return [];

    const normalizedQuery = normalizeTurkishCharacters(query);

    const results = [];
    const nodesToVisit = [this.rootNode];

    while (nodesToVisit.length > 0) {
      const node = nodesToVisit.pop();
      const distance = this.distanceFunction(
        normalizedQuery,
        node.normalizedTerm
      );

      if (distance <= maxAllowedDistance) {
        results.push({ term: node.originalTerm, distance });
      }

      const minEdgeDistance = distance - maxAllowedDistance;
      const maxEdgeDistance = distance + maxAllowedDistance;

      for (const [edgeDistance, childNode] of node.children) {
        if (
          edgeDistance >= minEdgeDistance &&
          edgeDistance <= maxEdgeDistance
        ) {
          nodesToVisit.push(childNode);
        }
      }
    }

    return results.sort(
      (a, b) => a.distance - b.distance || a.term.localeCompare(b.term, "tr")
    );
  }
}

// ----------------------
// ✅ 3) Ingredient Dataset (script.js’den)
// İstersen bunu ileride DB’den de besleyebiliriz.
// ----------------------

// ✅ 5) Suggestion API (script.js’den)
function getIngredientSuggestions(
  userInput,
  { maxDistance = 2, maxSuggestions = 3, minimumInputLength = 2 } = {},
  ingredientSearchTree
) {
  const rawInput = userInput.trim();
  if (!rawInput || rawInput.length < minimumInputLength) {
    return { isExactMatch: false, suggestions: [] };
  }

  const lowerRawInput = rawInput.toLocaleLowerCase("tr");
  const isExactMatch = allIngredients.some(
    (ingredient) => ingredient.toLocaleLowerCase("tr") === lowerRawInput
  );

  if (isExactMatch) {
    return { isExactMatch: true, suggestions: [] };
  }

  const matches = ingredientSearchTree.searchSimilarTerms(
    rawInput,
    maxDistance
  );

  return {
    isExactMatch: false,
    suggestions: matches.slice(0, maxSuggestions),
  };
}

export async function buildRecipeMetaByIdFromProfile(profile) {
  const recipeIds = Array.from(
    new Set([
      ...(profile?.favorite_recipe_ids ?? []),
      ...(profile?.saved_recipe_ids ?? []),
      ...(profile?.recent_viewed_recipe_ids ?? []),
    ])
  );

  if (recipeIds.length === 0) return {};

  const { data, error } = await supabase
    .from("recipe")
    .select("id, main_category, sub_categories")
    .in("id", recipeIds);

  if (error) {
    console.error("recipe meta fetch error:", error);
    return {};
  }

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
  { id: "LEGUME_DISH", label: "Bakliyat Yemekleri" },
  { id: "VEGETABLE_DISH", label: "Sebze Yemekleri" },
  { id: "MEAT_DISH", label: "Et Yemekleri" },
  { id: "CHICKEN_DISH", label: "Tavuk Yemekleri" },
  { id: "PASTA", label: "Makarna" },
  { id: "SEAFOOD_DISH", label: "Deniz Ürünleri" },
  { id: "MILK_DESSERT", label: "Sütlü Tatlılar" },
  { id: "PASTRY", label: "Hamur İşleri" },
];

const RecipeSuggester = () => {
  const { profile } = useAuth();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState(["SOUP"]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [results, setResults] = useState([]);

  // ✅ Did-you-mean UI state
  const [dyStatus, setDyStatus] = useState("");
  const [dySuggestions, setDySuggestions] = useState([]);

  // ✅ BK-Tree’yi bir kez kur (re-render’da tekrar build etme)
  const ingredientSearchTree = useMemo(() => {
    const tree = new BKTree(calculateLevenshteinDistance);
    for (const ingredient of allIngredients) tree.addTerm(ingredient);
    return tree;
  }, []);

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

    // ✅ input boşalınca önerileri temizle
    setDyStatus("Bir malzeme yazınca öneriler burada görünecek.");
    setDySuggestions([]);
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

    const recipeMetaById = await buildRecipeMetaByIdFromProfile(profile);

    const { results: newResults } = generateAndRankAllCandidates({
      profile,
      recipeMetaById,
      userIngredients: ingredients,
      selectedCategoryIds,
      limit: 30,
      opts: { cookForOthers: true },
    });

    setResults(newResults);
  };

  // ✅ input değiştikçe “did you mean” güncelle (script.js UI wiring’in React karşılığı)
  useEffect(() => {
    const input = ingredientInput.trim();

    if (!input) {
      setDyStatus("Bir malzeme yazınca öneriler burada görünecek.");
      setDySuggestions([]);
      return;
    }

    const { isExactMatch, suggestions } = getIngredientSuggestions(
      input,
      { maxDistance: 2, maxSuggestions: 3, minimumInputLength: 2 },
      ingredientSearchTree
    );

    if (isExactMatch) {
      setDyStatus(`✅ "${input}" veri setinde bulundu.`);
      setDySuggestions([]);
      return;
    }

    if (!suggestions.length) {
      setDyStatus(`❌ "${input}" için yakın bir öneri bulunamadı.`);
      setDySuggestions([]);
      return;
    }

    const best = suggestions[0];
    if (best.distance === 0) {
      setDyStatus(`🔤 Türkçe karakter düzeltmesi: Bunu mu demek istediniz?`);
    } else {
      setDyStatus(`🤔 Bunu mu demek istediniz?`);
    }

    setDySuggestions(suggestions);
  }, [ingredientInput, ingredientSearchTree]);

  const applySuggestion = (term) => {
    setIngredientInput(term);
    // effect zaten status/suggestions’ı güncelleyecek
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
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

        {/* ✅ Did you mean? UI (JSX) */}
        <div
          style={{
            marginTop: "-0.25rem",
            marginBottom: "0.75rem",
            padding: "0.65rem 0.75rem",
            border: "1px solid #eee",
            borderRadius: "8px",
            background: "#fafafa",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#374151" }}>{dyStatus}</div>

          {dySuggestions.length > 0 && (
            <ul
              style={{
                marginTop: "0.5rem",
                paddingLeft: 0,
                listStyle: "none",
                display: "grid",
                gap: "0.35rem",
              }}
            >
              {dySuggestions.map((s) => (
                <li
                  key={s.term}
                  onClick={() => applySuggestion(s.term)}
                  title="Seçmek için tıkla"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    background: "white",
                  }}
                >
                  <span style={{ fontSize: "0.95rem" }}>{s.term}</span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      color: "#6b7280",
                    }}
                  ></span>
                </li>
              ))}
            </ul>
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

      {/* Generate + Results bölümlerin aynen kalıyor */}
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

      <section>
        {results.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            Henüz öneri yok. Malzeme ekleyip “Tarif Önerisi Getir”e bas.
          </p>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3 öb-6"
          >
            {results.map((r, idx) => (
              <AccordionItem
                key={r.id ?? idx}
                value={String(r.id ?? idx)}
                className="border rounded-lg px-3 last:border-b"
              >
                <AccordionTrigger className="no-underline hover:no-underline ">
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="text-left">
                      <div className="font-medium">{r.name}</div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  {/* Malzemeler */}
                  <div className="mt-2">
                    <div className="font-semibold text-sm">
                      Gereken malzemeler
                    </div>
                    {Array.isArray(r.required_ingredients) &&
                    r.required_ingredients.length ? (
                      <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
                        {r.required_ingredients.map((ing) => (
                          <li key={`req-${ing}`}>{ing}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground">
                        (Bu öneri için required listesi boş görünüyor.)
                      </div>
                    )}
                  </div>

                  {/* Eksikler */}
                  {r.missing_required?.length || r.missing_base?.length ? (
                    <div className="mt-4">
                      <div className="font-semibold text-sm">
                        Eksik malzemeler
                      </div>
                      <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
                        {Array.isArray(r.missing_required) &&
                          r.missing_required.map((x) => (
                            <li key={`miss-req-${x}`}>
                              {x}{" "}
                              <span className="text-destructive">
                                (gerekli)
                              </span>
                            </li>
                          ))}
                        {Array.isArray(r.missing_base) &&
                          r.missing_base.map((x) => (
                            <li key={`miss-base-${x}`}>{x}</li>
                          ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Yapılış */}
                  {Array.isArray(r.instructions) && r.instructions.length ? (
                    <div className="mt-4">
                      <div className="font-semibold text-sm">Yapılışı</div>
                      <ol className="mt-2 ml-5 list-decimal space-y-1 text-sm">
                        {r.instructions.map((step, i) => (
                          <li key={`step-${i}`}>{step}</li>
                        ))}
                      </ol>

                      {(r.time?.prepMin || r.time?.cookMin) && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          Süre:{" "}
                          {r.time?.prepMin
                            ? `Hazırlık ${r.time.prepMin} dk`
                            : ""}
                          {r.time?.cookMin
                            ? `${r.time?.prepMin ? " • " : ""}Pişirme ${
                                r.time.cookMin
                              } dk`
                            : ""}
                        </div>
                      )}

                      {Array.isArray(r.tips) && r.tips.length ? (
                        <div className="mt-4">
                          <div className="font-semibold text-sm">İpuçları</div>
                          <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
                            {r.tips.map((t, i) => (
                              <li key={`tip-${i}`}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </div>
  );
};

export default RecipeSuggester;
