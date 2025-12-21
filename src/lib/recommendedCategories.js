import {
  ALLERGEN_BLOCK_KEYWORDS,
  CATEGORY_OPTIONS,
  DEFAULT_TOP,
  DIET_BLOCK_MAP,
  DIET_BONUS_MAP,
} from "@/constants/constants";

function normalizeStr(s) {
  return String(s || "")
    .trim()
    .toLowerCase();
}

function includesAny(haystack, needles) {
  const h = normalizeStr(haystack);
  return needles.some((n) => h.includes(normalizeStr(n)));
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

// favoriteRecipes: [{ id, main_category, sub_categories: [] }]
export function getTopCategories({
  profile,
  favoriteRecipes = [],
  now = new Date(),
  limit = 4,
  allCategories = CATEGORY_OPTIONS,
} = {}) {
  const userCategories = Array.isArray(profile?.categories)
    ? profile.categories
    : [];
  const diets = Array.isArray(profile?.diets) ? profile.diets : [];
  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];

  const normalizedUserCategories = userCategories
    .map((c) => c?.trim())
    .filter(Boolean);
  const normalizedDiets = diets.map(normalizeStr).filter(Boolean);
  const normalizedAllergens = allergens.map(normalizeStr).filter(Boolean);

  // 1) Block set
  const blocked = new Set();

  // diet block
  for (const d of normalizedDiets) {
    const blocks = DIET_BLOCK_MAP[d];
    if (Array.isArray(blocks)) blocks.forEach((c) => blocked.add(c));
  }

  // allergen block (keyword -> category)
  for (const a of normalizedAllergens) {
    for (const rule of ALLERGEN_BLOCK_KEYWORDS) {
      if (includesAny(a, rule.keywords)) {
        rule.block.forEach((c) => blocked.add(c));
      }
    }
  }

  // 2) Score map
  const score = new Map(allCategories.map((c) => [c, 0]));

  // Helper: safe add score
  const add = (category, points) => {
    if (!score.has(category)) return;
    score.set(category, (score.get(category) || 0) + points);
  };

  // 3) User selected categories (strongest signal)
  for (const c of normalizedUserCategories) {
    if (score.has(c)) add(c, 100);
  }

  // 4) Diet bonuses
  for (const d of normalizedDiets) {
    const bonusCats = DIET_BONUS_MAP[d];
    if (!Array.isArray(bonusCats)) continue;
    bonusCats.forEach((c) => add(c, 30));
  }

  // 5) Favorite recipes -> category votes
  // main_category + sub_categories üzerinden puan
  for (const r of favoriteRecipes || []) {
    const main = r?.main_category;
    const subs = Array.isArray(r?.sub_categories) ? r.sub_categories : [];

    if (main && score.has(main)) add(main, 25);

    for (const sc of subs) {
      if (sc && score.has(sc)) add(sc, 15);
    }
  }

  // 6) Context fallback (time / season)
  const hour = now.getHours();
  const month = now.getMonth() + 1; // 1-12

  if (hour >= 5 && hour <= 11) add("Kahvaltılıklar", 15);

  const isSummer = month >= 6 && month <= 9;
  if (isSummer) {
    add("Salatalar", 15);
    add("Zeytinyağlılar", 15);
  }

  // 7) Sort candidates (remove blocked)
  const ranked = allCategories
    .filter((c) => !blocked.has(c))
    .map((c) => ({ c, s: score.get(c) || 0 }))
    .sort((a, b) => b.s - a.s);

  // 8) pick top (but avoid showing 0-score categories too early if user has data)
  const hasAnySignal =
    normalizedUserCategories.length > 0 ||
    normalizedDiets.length > 0 ||
    (favoriteRecipes?.length ?? 0) > 0 ||
    normalizedAllergens.length > 0;

  let picked = [];

  if (hasAnySignal) {
    // önce skoru > 0 olanlardan doldur
    picked = ranked
      .filter((x) => x.s > 0)
      .slice(0, limit)
      .map((x) => x.c);
  } else {
    // hiç sinyal yoksa context + default
    picked = ranked.slice(0, limit).map((x) => x.c);
  }

  // 9) still not enough -> fill with DEFAULT_TOP then remaining ranked
  if (picked.length < limit) {
    for (const c of DEFAULT_TOP) {
      if (blocked.has(c)) continue;
      if (!picked.includes(c)) picked.push(c);
      if (picked.length === limit) break;
    }
  }

  if (picked.length < limit) {
    for (const x of ranked) {
      if (!picked.includes(x.c)) picked.push(x.c);
      if (picked.length === limit) break;
    }
  }

  return picked.slice(0, limit);
}
