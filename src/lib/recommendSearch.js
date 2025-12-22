import { DIET_BONUS_MAP, DIET_BLOCK_MAP } from "@/constants/constants";

const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .trim();
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;

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

  const ings = (recipe?.ingredients ?? [])
    .map((x) => norm(x?.ingredient))
    .filter(Boolean);

  return ings.some((ing) => a.some((al) => ing.includes(al)));
}

function popularityScore(r) {
  const saves = Number(r?.saves_count ?? 0);
  const likes = Number(r?.likes_count ?? 0);
  const views = Number(r?.views_count ?? 0);
  return saves * 2 + likes * 1 + views * 0.05;
}

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

// recipeMetaById: { [id]: { id, main_category, sub_categories } }
export function buildRankContext(profile, recipeMetaById = {}, opts = {}) {
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

  // 1) Tag profile: Map<tag, weight>
  const tagProfile = new Map();

  const addTags = (recipe, w) => {
    if (!recipe) return;
    const tags = getTagSet(recipe);
    for (const t of tags) tagProfile.set(t, (tagProfile.get(t) || 0) + w);
  };

  // Favorites / Saved güçlü sinyal
  for (const id of favIds) addTags(recipeMetaById[id], 3.0);
  for (const id of savedIds) addTags(recipeMetaById[id], 2.0);

  // Viewed: en yeni -> en eski (en yeni daha güçlü)
  const n = viewIds.length;
  for (let i = 0; i < n; i++) {
    const id = viewIds[i]; // i=0 en yeni
    const r = recipeMetaById[id];
    if (!r) continue;

    const t = n <= 1 ? 1 : 1 - i / (n - 1); // en yeni 1, en eski 0
    const w = lerp(0.6, 1.6, t);
    addTags(r, w);
  }

  // Cold-start sinyalleri (onboarding)
  const userCats = Array.isArray(profile?.categories)
    ? profile.categories.map(norm).filter(Boolean)
    : [];
  const onboardingCatSet = new Set(userCats);

  const diets = Array.isArray(profile?.diets)
    ? profile.diets.map(norm).filter(Boolean)
    : [];
  const dietBonusTags = new Set(
    diets.flatMap((d) => DIET_BONUS_MAP?.[d] ?? []).map(norm)
  );
  const dietBlockTags = new Set(
    diets.flatMap((d) => DIET_BLOCK_MAP?.[d] ?? []).map(norm)
  );

  // Ağırlıklar (popüler fonksiyondaki mantığın aynısı)
  const W = {
    // history uyumu
    affinity: lerp(40, 90, stage),

    // cold yardımları (zamanla söner)
    onboardingCat: lerp(1.2, 0.1, stage),
    dietBonus: lerp(0.8, 0.0, stage),

    // diyet penalty: cold’da çok güçlü, mature’da 0
    dietPenalty: lerp(9999, 0.0, stage),

    // popülerlik ile kişisel skor harmanı
    wPersonal: lerp(1.0, 0.7, stage),
    wPop: lerp(0.2, 0.6, stage),
  };

  return {
    stage,
    tagProfile,
    onboardingCatSet,
    dietBonusTags,
    dietBlockTags,
    W,
  };
}

function affinityFromProfile(recipe, tagProfile) {
  if (!tagProfile || tagProfile.size === 0) return 0;
  const tags = getTagSet(recipe);
  let s = 0;
  for (const t of tags) s += tagProfile.get(t) || 0;
  return s;
}

export function personalScore(recipe, profile, ctx) {
  if (!profile || !ctx) return 0;

  const { tagProfile, onboardingCatSet, dietBonusTags, dietBlockTags, W } = ctx;

  let score = 0;

  // 1) History-based affinity (asıl sinyal)
  const aff = affinityFromProfile(recipe, tagProfile);
  score += aff * W.affinity;

  // 2) Cold-start boosts (zamanla söner)
  const tags = getTagSet(recipe);

  const profileCatHit =
    onboardingCatSet && [...onboardingCatSet].some((c) => tags.has(c)) ? 1 : 0;
  const dietBonusHit =
    dietBonusTags && [...dietBonusTags].some((t) => tags.has(t)) ? 1 : 0;
  const dietBlocked =
    dietBlockTags && [...dietBlockTags].some((t) => tags.has(t)) ? 1 : 0;

  score += profileCatHit * W.onboardingCat;
  score += dietBonusHit * W.dietBonus;
  score -= dietBlocked * W.dietPenalty;

  // 3) Allergens (sabit güçlü ceza)
  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];
  if (recipeHasAllergen(recipe, allergens)) score -= 9999; // veya -2 değil, gerçek “hard’a yakın”
  // Eğer "hard filter" istiyorsan: bunu burada yapma; caller tarafında filtrele.

  return score;
}

export function rankKeys(recipe, profile, ctx) {
  const p = personalScore(recipe, profile, ctx);
  const pop = popularityScore(recipe);

  // stage ile harman
  const blended = p * ctx.W.wPersonal + pop * ctx.W.wPop;

  return { personal: p, popularity: pop, blended, stage: ctx.stage };
}
