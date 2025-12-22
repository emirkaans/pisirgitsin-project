import { DIET_BONUS_MAP, DIET_BLOCK_MAP } from "@/constants/constants";

export const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .trim();

export function buildSuggestedTagSet(resultItem) {
  const set = new Set();

  // main + categoryLabel
  if (resultItem?.main_category) set.add(norm(resultItem.main_category));
  if (resultItem?.categoryLabel) set.add(norm(resultItem.categoryLabel));

  // sub cats / tags
  for (const t of resultItem?.sub_categories ?? []) set.add(norm(t));
  for (const t of resultItem?.sub_tags ?? []) set.add(norm(t));

  return set;
}

export function ingredientsContainAny(ings, needles) {
  const list = (ings ?? []).map(norm).filter(Boolean);
  const ns = (needles ?? []).map(norm).filter(Boolean);
  if (!list.length || !ns.length) return false;
  return list.some((ing) => ns.some((n) => ing.includes(n) || n.includes(ing)));
}

export function ingredientCoverageScore(recipeIngredients, userIngredients) {
  const r = new Set((recipeIngredients ?? []).map(norm).filter(Boolean));
  const u = new Set((userIngredients ?? []).map(norm).filter(Boolean));

  if (!r.size) return -0.4; // ✅ ingredients yoksa küçük ceza

  let hit = 0;
  for (const x of u) if (r.has(x)) hit++;
  const coverage = u.size ? hit / u.size : 0;
  return 2.0 * coverage; // 0..2
}

export function buildRecentTagWeights(lastViewedMeta) {
  const w = new Map();
  lastViewedMeta.forEach((r, idx) => {
    const recency = Math.max(0.2, 1 - idx * 0.08);

    const tags = [];
    if (r?.main_category) tags.push(r.main_category);
    for (const t of r?.sub_categories ?? []) tags.push(t);

    for (const tag of tags.map(norm).filter(Boolean)) {
      w.set(tag, (w.get(tag) ?? 0) + recency);
    }
  });
  return w;
}

function recentAffinityScore(tagSet, recentTagWeights) {
  if (!tagSet?.size || !recentTagWeights) return 0;
  let sum = 0;
  for (const t of tagSet) sum += recentTagWeights.get(t) ?? 0;
  return sum;
}

export function personalScore(resultItem, profile, ctx) {
  if (!profile) return 0;

  const diets = Array.isArray(profile?.diets) ? profile.diets.map(norm) : [];
  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];
  const userCats = Array.isArray(profile?.categories) ? profile.categories : [];

  const tagSet = buildSuggestedTagSet(resultItem);

  // 1) Allergen: hard
  if (ingredientsContainAny(resultItem?.ingredients, allergens)) return -999;

  // 2) Diet block tags: hard
  const blockedTags = diets.flatMap((d) => DIET_BLOCK_MAP?.[d] ?? []).map(norm);
  const blockedSet = new Set(blockedTags);
  for (const t of tagSet) if (blockedSet.has(t)) return -999;

  // 3) Vejetaryen içerik filtresi: hard
  // (Bunu kesin öneririm, yoksa tavuk çorbası çıkar.)
  if (diets.includes("vejetaryen")) {
    const MEAT_WORDS = [
      "dana",
      "kıyma",
      "et",
      "tavuk",
      "balık",
      "hindi",
      "sucuk",
      "salam",
      "pastırma",
      "kuzu",
    ];
    if (ingredientsContainAny(resultItem?.ingredients, MEAT_WORDS)) return -999;
  }

  let score = 0;

  // A) Ingredient match (kullanıcının girdiği malzemeler)
  score += ingredientCoverageScore(
    resultItem?.ingredients,
    ctx?.userIngredients
  );

  // B) Onboarding category (Çorbalar/Tatlılar gibi)
  const userCatSet = new Set(userCats.map(norm));
  for (const t of tagSet) {
    if (userCatSet.has(t)) {
      score += 1.0;
      break;
    }
  }

  // C) Diet bonus
  const dietBonusTags = diets
    .flatMap((d) => DIET_BONUS_MAP?.[d] ?? [])
    .map(norm);
  const bonusSet = new Set(dietBonusTags);
  for (const t of tagSet) {
    if (bonusSet.has(t)) {
      score += 0.4;
      break;
    }
  }

  // D) Recent affinity (et gezmişse etkisi daha görünür olsun)
  // 0.25 küçük kalıyorsa 0.45 yap
  score += 0.45 * recentAffinityScore(tagSet, ctx?.recentTagWeights);

  return score;
}
