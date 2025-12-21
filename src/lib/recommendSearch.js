import { DIET_BONUS_MAP, DIET_BLOCK_MAP } from "@/constants/constants";

function isBlockedByDiet(recipe, diets) {
  const ds = (diets ?? []).map(norm).filter(Boolean);
  if (ds.length === 0) return false;

  const tagSet = getTagSet(recipe);
  const blockedTags = ds.flatMap((d) => DIET_BLOCK_MAP?.[d] ?? []).map(norm);

  return blockedTags.some((t) => tagSet.has(t));
}

const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .trim();

function getTagSet(recipe) {
  const set = new Set();
  if (recipe?.main_category) set.add(norm(recipe.main_category));

  const subs = Array.isArray(recipe?.sub_categories)
    ? recipe.sub_categories
    : [];
  for (const sc of subs) set.add(norm(sc));

  return set;
}

function recipeHasAllergen(recipe, allergens) {
  const a = (allergens ?? []).map(norm).filter(Boolean);
  if (a.length === 0) return false;

  // ingredients JSON içinde ingredient alanına bakıyoruz
  const ings = (recipe?.ingredients ?? [])
    .map((x) => norm(x?.ingredient))
    .filter(Boolean);

  // basit contains
  return ings.some((ing) => a.some((al) => ing.includes(al)));
}

function popularityScore(r) {
  const saves = Number(r?.saves_count ?? 0);
  const likes = Number(r?.likes_count ?? 0);
  const views = Number(r?.views_count ?? 0);
  return saves * 2 + likes * 1 + views * 0.05;
}

/**
 * match_count HARİÇ sadece kişisel skor üretir.
 * match_count grupları arasında asla yarışmaz.
 */
export function personalScore(recipe, profile) {
  if (!profile) return 0;

  let score = 0;

  const savedIds = Array.isArray(profile?.saved_recipe_ids)
    ? profile.saved_recipe_ids
    : [];
  const favIds = Array.isArray(profile?.favorite_recipe_ids)
    ? profile.favorite_recipe_ids
    : [];

  if (savedIds.includes(recipe.id)) score += 1.0;
  if (favIds.includes(recipe.id)) score += 0.7;

  const userCats = Array.isArray(profile?.categories) ? profile.categories : [];
  const tagSet = getTagSet(recipe);
  if (userCats.some((c) => tagSet.has(norm(c)))) score += 0.3;

  const diets = Array.isArray(profile?.diets) ? profile.diets.map(norm) : [];
  const dietBonusTags = diets.flatMap((d) => DIET_BONUS_MAP?.[d] ?? []);
  if (dietBonusTags.some((t) => tagSet.has(norm(t)))) score += 0.25;

  // ✅ yeni: diet block penalty (vejetaryen -> Et/Tavuk/Deniz)
  if (isBlockedByDiet(recipe, diets)) score -= 1.2; // soft, ayarlanabilir

  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];
  if (recipeHasAllergen(recipe, allergens)) score -= 2.0;

  return score;
}

/**
 * Grup içi sıralama için kullanılacak comparator key'leri üretir
 */
export function rankKeys(recipe, profile) {
  const pScore = personalScore(recipe, profile);

  const pop = popularityScore(recipe);

  return { personal: pScore, popularity: pop };
}
