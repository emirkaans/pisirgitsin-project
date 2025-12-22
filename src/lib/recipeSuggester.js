import { DIET_BONUS_MAP, DIET_BLOCK_MAP } from "@/constants/constants";

const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .trim();

function hasAnyTag(tagSet, arr) {
  return (arr ?? []).some((x) => tagSet.has(norm(x)));
}

function ingredientsContainAllergen(ings, allergens) {
  const a = (allergens ?? []).map(norm).filter(Boolean);
  if (!a.length) return false;

  const list = (ings ?? []).map(norm).filter(Boolean);
  return list.some((ing) =>
    a.some((al) => ing.includes(al) || al.includes(ing))
  );
}

function buildSuggestedTagSet(resultItem) {
  // Bu sayfada “recipe” yok; resultItem içinde categoryLabel var.
  // İstersen builder çıktına sub_tags da ekleyebiliriz.
  const set = new Set();
  if (resultItem?.categoryLabel) set.add(norm(resultItem.categoryLabel));
  return set;
}

export function suggestedPersonalScore(resultItem, profile) {
  if (!profile) return 0;

  const tagSet = buildSuggestedTagSet(resultItem);

  const userCats = Array.isArray(profile?.categories) ? profile.categories : [];
  const diets = Array.isArray(profile?.diets) ? profile.diets.map(norm) : [];
  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];

  // 1) kategori uyumu
  let score = 0;
  if (hasAnyTag(tagSet, userCats)) score += 1.0;

  // 2) diyet bonus
  const dietBonusTags = diets.flatMap((d) => DIET_BONUS_MAP?.[d] ?? []);
  if (hasAnyTag(tagSet, dietBonusTags)) score += 0.6;

  // 3) diyet çelişkisi (block map) -> aşağı it
  const blockedTags = diets.flatMap((d) => DIET_BLOCK_MAP?.[d] ?? []);
  if (hasAnyTag(tagSet, blockedTags)) score -= 1.2;

  // 4) alerjen -> aşağı it
  if (ingredientsContainAllergen(resultItem?.ingredients, allergens))
    score -= 1.5;

  return score;
}
