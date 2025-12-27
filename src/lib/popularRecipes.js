import { DIET_BONUS_MAP, DIET_BLOCK_MAP } from "@/constants/constants";
import { supabase, withRetry } from "@/lib/supabase";

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

// viewIds: [en yeni ... en eski]
function buildCategoryProfileFromHistory({
  favMeta,
  savedMeta,
  viewMeta,
  viewIds,
}) {
  const counts = new Map(); // tag -> weight

  const addTags = (recipe, w) => {
    const tags = getTagSet(recipe);
    for (const t of tags) counts.set(t, (counts.get(t) || 0) + w);
  };

  // fav ve saved: güçlü sinyal
  for (const r of favMeta) addTags(r, 3.0);
  for (const r of savedMeta) addTags(r, 2.0);

  // viewed: recency ile ağırlık (en yeni en güçlü)
  const n = viewMeta.length;
  for (let i = 0; i < viewIds.length; i++) {
    const id = viewIds[i]; // i=0 en yeni
    const r = viewMeta.find((x) => x.id === id);
    if (!r) continue;

    const t = n <= 1 ? 1 : 1 - i / (n - 1); // en yeni:1, en eski:0
    const w = lerp(0.6, 1.6, t); // en yeni 1.6, en eski 0.6
    addTags(r, w);
  }

  return counts;
}

function affinityFromProfile(recipe, tagWeightMap) {
  if (!tagWeightMap || tagWeightMap.size === 0) return 0;
  const tags = getTagSet(recipe);
  let s = 0;
  for (const t of tags) s += tagWeightMap.get(t) || 0;
  return s;
}

export async function getPopularRecipes({
  profile,
  limit = 6,
  poolLimit = 250,
  coldStartEnd = 6,
  matureStart = 20,

  excludeKnown = true,
} = {}) {
  if (!profile) {
    const poolResult = await withRetry(
      () =>
        supabase
          .from("recipe")
          .select(
            "id,name,image_url,main_category,sub_categories,ingredients,saves_count,likes_count,views_count,time_in_minutes,difficulty"
          )
          .order("saves_count", { ascending: false })
          .order("likes_count", { ascending: false })
          .order("views_count", { ascending: false })
          .limit(limit),
      2,
      300,
      5000
    );

    if (poolResult.error) throw poolResult.error;
    return poolResult.data ?? [];
  }

  const stage = getStage(profile, coldStartEnd, matureStart);

  const favIds = Array.isArray(profile?.favorite_recipe_ids)
    ? profile.favorite_recipe_ids
    : [];
  const savedIds = Array.isArray(profile?.saved_recipe_ids)
    ? profile.saved_recipe_ids
    : [];
  const viewIds = Array.isArray(profile?.recent_viewed_recipe_ids)
    ? profile.recent_viewed_recipe_ids
    : [];

  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];
  const diets = Array.isArray(profile?.diets)
    ? profile.diets.map(norm).filter(Boolean)
    : [];
  const userCats = Array.isArray(profile?.categories)
    ? profile.categories.map(norm).filter(Boolean)
    : [];

  const excludeIds = new Set(
    excludeKnown ? [...favIds, ...savedIds, ...viewIds] : []
  );

  // --- 1) History meta çek (fav/saved/view) - optimize: daha az ID, daha hızlı ---
  const historyIds = Array.from(
    new Set([...favIds, ...savedIds, ...viewIds])
  ).slice(0, 50); // 200'den 50'ye düşürdük - yeterli

  // --- 2) Paralel istekler: history meta ve pool aynı anda çek ---
  const [historyResult, poolResult] = await Promise.all([
    // History meta (eğer varsa)
    historyIds.length > 0
      ? withRetry(
          () =>
            supabase
              .from("recipe")
              .select("id,main_category,sub_categories")
              .in("id", historyIds),
          2,
          300, // Daha hızlı retry
          5000 // Daha kısa timeout
        )
      : Promise.resolve({ data: [], error: null }),
    // Global popüler havuzu
    withRetry(
      () =>
        supabase
          .from("recipe")
          .select(
            "id,name,image_url,main_category,sub_categories,ingredients,saves_count,likes_count,views_count,time_in_minutes,difficulty"
          )
          .order("saves_count", { ascending: false })
          .order("likes_count", { ascending: false })
          .order("views_count", { ascending: false })
          .limit(Math.min(poolLimit, 100)), // 250'den 100'e düşürdük - yeterli
      2,
      300,
      5000
    ),
  ]);
  console.log({ historyResult });

  if (historyResult.error) throw historyResult.error;
  if (poolResult.error) throw poolResult.error;

  const historyMeta = historyResult.data ?? [];
  const pool = poolResult.data ?? [];

  const favMeta = historyMeta.filter((r) => favIds.includes(r.id));
  const savedMeta = historyMeta.filter((r) => savedIds.includes(r.id));
  const viewMeta = historyMeta.filter((r) => viewIds.includes(r.id));

  // --- 3) Kategori profili oluştur (asıl kişiselleştirme burada) ---
  const tagProfile = buildCategoryProfileFromHistory({
    favMeta,
    savedMeta,
    viewMeta,
    viewIds, // en yeni -> en eski
  });

  // --- 4) Cold'ta onboarding + diet küçük katkı; mature'da sıfıra yaklaşır ---
  const W = {
    profileCats: lerp(1.2, 0.1, stage), // cold güçlü, mature çok zayıf
    dietBonus: lerp(0.8, 0.0, stage), // diyet zamanla unutulsun
    dietPenalty: lerp(9999, 0.0, stage), // cold'ta neredeyse block, mature'da 0
    affinity: lerp(40, 90, stage), // mature'da kişisel uyum daha baskın
  };

  const dietBonusTags = diets
    .flatMap((d) => DIET_BONUS_MAP?.[d] ?? [])
    .map(norm);
  const dietBlockTags = diets
    .flatMap((d) => DIET_BLOCK_MAP?.[d] ?? [])
    .map(norm);

  // --- 5) Skorla ---
  const scored = [];

  for (const r of pool ?? []) {
    if (!r?.id) continue;
    if (excludeIds.has(r.id)) continue;
    if (recipeHasAllergen(r, allergens)) continue;

    const pop = popularityScore(r);

    // kişisel kategori profili ile uyum
    const aff = affinityFromProfile(r, tagProfile);

    // cold yardımları
    const tags = getTagSet(r);

    const profileCatHit = userCats.some((c) => tags.has(c)) ? 1 : 0;
    const dietBonusHit = dietBonusTags.some((t) => tags.has(t)) ? 1 : 0;
    const dietBlocked = dietBlockTags.some((t) => tags.has(t)) ? 1 : 0;

    // final = pop + aff*W.affinity + coldBoost - dietPenalty
    const final =
      pop +
      aff * W.affinity +
      profileCatHit * W.profileCats +
      dietBonusHit * W.dietBonus -
      dietBlocked * W.dietPenalty;

    scored.push({ r, s: final });
  }

  scored.sort((a, b) => b.s - a.s);

  return scored.slice(0, limit).map((x) => x.r);
}
