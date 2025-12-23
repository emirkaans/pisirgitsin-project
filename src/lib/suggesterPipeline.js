// src/lib/suggesterPipeline.js
import {
  buildSoupCandidates,
  buildPastaCandidates,
  buildLegumeCandidates,
  buildVegetableDishCandidates,
  buildMeatDishCandidates,
  buildChickenDishCandidates,
  buildPastryCandidates,
  buildMilkDessertCandidates,
} from "@/lib/builders";
import { enrichCandidate } from "@/lib/enrichCandidates";

// ---------- core helpers ----------
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .trim();
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;

function getStage(profile, coldStartEnd = 6, matureStart = 20) {
  const fav = Array.isArray(profile?.favorite_recipe_ids)
    ? profile.favorite_recipe_ids
    : [];
  const saved = Array.isArray(profile?.saved_recipe_ids)
    ? profile.saved_recipe_ids
    : [];
  const engagement = fav.length + saved.length;
  return clamp01((engagement - coldStartEnd) / (matureStart - coldStartEnd));
}

function recipeHasAllergenByStrings(ingredientStrings, allergens) {
  const a = (allergens ?? []).map(norm).filter(Boolean);
  if (!a.length) return false;

  const list = (ingredientStrings ?? []).map(norm).filter(Boolean);
  return list.some((ing) =>
    a.some((al) => ing.includes(al) || al.includes(ing))
  );
}

function tagSetFromCandidate(c) {
  const set = new Set();
  if (c?.main_category) set.add(norm(c.main_category));
  (c?.sub_categories ?? []).forEach((x) => set.add(norm(x)));
  return set;
}

function affinityFromProfile(tagSet, tagProfile) {
  if (!tagProfile || tagProfile.size === 0) return 0;
  let s = 0;
  for (const t of tagSet) s += tagProfile.get(t) || 0;
  return s;
}

export function enrichCandidateWithInstructions(candidate) {
  const c = {
    ...candidate,
    required_ingredients: uniq(
      candidate.required_ingredients ?? candidate.used_ingredients ?? []
    ),
    base_ingredients: uniq(candidate.base_ingredients ?? []),
    optional_ingredients: uniq(candidate.optional_ingredients ?? []),
  };

  if (c.main_category === "Çorbalar")
    return { ...c, ...buildSoupInstructions(c) };
  if (c.main_category === "Makarna")
    return { ...c, ...buildPastaInstructions(c) };

  // fallback
  return {
    ...c,
    time: { prepMin: 10, cookMin: 20 },
    tips: [
      "Malzemeleri hazırlayıp pişirme adımlarını kategoriye göre uygulayın.",
    ],
    instructions: [
      "Malzemeleri hazırla.",
      "Uygun pişirme tekniğini uygula.",
      "Tatlandırıp servis et.",
    ],
  };
}

/**
 * recipeMetaById: { [id]: { id, main_category, sub_categories } }
 */
export function buildSuggestContext(profile, recipeMetaById = {}, opts = {}) {
  const stage = getStage(
    profile,
    opts.coldStartEnd ?? 6,
    opts.matureStart ?? 20
  );

  const favIds = Array.isArray(profile?.favorite_recipe_ids)
    ? profile.favorite_recipe_ids
    : [];
  const savedIds = Array.isArray(profile?.saved_recipe_ids)
    ? profile.saved_recipe_ids
    : [];
  const viewIds = Array.isArray(profile?.recent_viewed_recipe_ids)
    ? profile.recent_viewed_recipe_ids
    : [];

  const tagProfile = new Map();

  const addMeta = (meta, w) => {
    if (!meta) return;
    const set = new Set();
    if (meta.main_category) set.add(norm(meta.main_category));
    (meta.sub_categories ?? []).forEach((x) => set.add(norm(x)));
    for (const t of set) tagProfile.set(t, (tagProfile.get(t) || 0) + w);
  };

  // fav > saved > viewed(recency)
  favIds.forEach((id) => addMeta(recipeMetaById[id], 3.0));
  savedIds.forEach((id) => addMeta(recipeMetaById[id], 2.0));

  const n = viewIds.length;
  for (let i = 0; i < n; i++) {
    const id = viewIds[i]; // en yeni -> en eski
    const meta = recipeMetaById[id];
    if (!meta) continue;
    const t = n <= 1 ? 1 : 1 - i / (n - 1);
    const w = lerp(0.6, 1.6, t);
    addMeta(meta, w);
  }

  const onboardingCats = Array.isArray(profile?.categories)
    ? profile.categories.map(norm).filter(Boolean)
    : [];
  const onboardingSet = new Set(onboardingCats);

  // skor ölçeği küçük ve anlaşılır
  const W = {
    affinity: lerp(1.0, 2.8, stage), // mature'da history baskın
    onboarding: lerp(1.4, 0.1, stage), // cold'da onboarding baskın
    ingredient: 0.25, // tie-break
  };

  return { stage, tagProfile, onboardingSet, W };
}

function ingredientCoverageScore(candidate, userIngredients) {
  const user = new Set((userIngredients ?? []).map(norm));
  if (user.size === 0) return 0;

  const used = new Set(
    (candidate.used_ingredients ?? candidate.ingredients ?? []).map(norm)
  );
  let hit = 0;
  for (const u of user) if (used.has(u)) hit++;
  return hit / user.size; // 0..1
}

export function scoreCandidate(candidate, profile, ctx, userIngredients) {
  // allergen hard filter
  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];
  if (recipeHasAllergenByStrings(candidate.ingredients, allergens))
    return -9999;

  const tags = tagSetFromCandidate(candidate);
  const aff = affinityFromProfile(tags, ctx.tagProfile);

  const onboardingHit = [...ctx.onboardingSet].some((c) => tags.has(c)) ? 1 : 0;
  const cov = ingredientCoverageScore(candidate, userIngredients);

  return (
    aff * ctx.W.affinity +
    onboardingHit * ctx.W.onboarding +
    cov * ctx.W.ingredient
  );
}

// ---------- mapping: UI selectedCategoryIds -> builders ----------
const CATEGORY_TO_BUILDER = {
  SOUP: buildSoupCandidates,
  PASTA: buildPastaCandidates,
  LEGUME_DISH: buildLegumeCandidates,
  VEGETABLE_DISH: buildVegetableDishCandidates,
  MEAT_DISH: buildMeatDishCandidates,
  CHICKEN_DISH: buildChickenDishCandidates,
  PASTRY: buildPastryCandidates,
  MILK_DESSERT: buildMilkDessertCandidates,
};

function diffMissing(available, needed) {
  const a = new Set((available ?? []).map(norm));
  return (needed ?? []).map(norm).filter((x) => !a.has(x));
}

/**
 * Tek giriş noktası:
 * - candidates havuzunu oluşturur
 * - cold→mature skora göre sıralar
 */

export function generateAndRankAllCandidates({
  profile,
  recipeMetaById = {},
  userIngredients = [],
  selectedCategoryIds = [],
  limit = 30,
} = {}) {
  const ctx = buildSuggestContext(profile, recipeMetaById);

  const pool = [];

  for (const catId of selectedCategoryIds) {
    const builder = CATEGORY_TO_BUILDER[catId];
    if (!builder) continue;

    const items = builder(userIngredients) || [];

    for (const it of items) {
      const enriched = enrichCandidate(it, userIngredients);
      pool.push(enriched);
    }
  }

  const ranked = pool
    .map((c) => ({
      ...c,
      _score: scoreCandidate(c, profile, ctx, userIngredients),
      _stage: ctx.stage,
    }))
    .filter((c) => c._score > -9990)
    .sort((a, b) => b._score - a._score);

  return { ctx, results: ranked.slice(0, limit) };
}
