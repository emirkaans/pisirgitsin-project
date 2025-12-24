import {
  ALLERGEN_BLOCK_KEYWORDS,
  CATEGORY_OPTIONS,
  DEFAULT_TOP,
  DIET_BLOCK_MAP,
  DIET_BONUS_MAP,
} from "@/constants/constants";

// ---------- helpers ----------
function normalizeStr(s) {
  return String(s || "")
    .trim()
    .toLowerCase();
}
function includesAny(haystack, needles) {
  const h = normalizeStr(haystack);
  return needles.some((n) => h.includes(normalizeStr(n)));
}
function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// favoriteRecipes: [{ id, main_category, sub_categories: [] }]
// recipesById: { [id]: { main_category, sub_categories: [] } }  // recent_viewed için
export function getTopCategories({
  profile,
  favoriteRecipes = [],
  recipesById = null,

  now = new Date(),
  limit = 4,
  allCategories = CATEGORY_OPTIONS,

  // cold start -> mature geçiş ayarları
  coldStartEnd = 6, // fav+saved bu değerin altındaysa onboarding/diet daha etkili
  matureStart = 20, // fav+saved bu değere gelince “mature”
} = {}) {
  console.log({ favoriteRecipes, profile });
  // --------- normalize profile ----------
  const userCategories = Array.isArray(profile?.categories)
    ? profile.categories
    : [];
  const diets = Array.isArray(profile?.diets) ? profile.diets : [];
  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];

  const favoriteIds = Array.isArray(profile?.favorite_recipe_ids)
    ? profile.favorite_recipe_ids
    : [];
  const savedIds = Array.isArray(profile?.saved_recipe_ids)
    ? profile.saved_recipe_ids
    : [];
  const recentViewedIds = Array.isArray(profile?.recent_viewed_recipe_ids)
    ? profile.recent_viewed_recipe_ids
    : [];

  const normalizedUserCategories = userCategories
    .map((c) => c?.trim())
    .filter(Boolean);
  const normalizedDiets = diets.map(normalizeStr).filter(Boolean);
  const normalizedAllergens = allergens.map(normalizeStr).filter(Boolean);

  // --------- 1) Hard blocks: ONLY allergens ----------
  // Alerji: kullanıcı değiştirmedikçe güvenlik gereği "hard block" kalsın
  const hardBlocked = new Set();

  for (const a of normalizedAllergens) {
    for (const rule of ALLERGEN_BLOCK_KEYWORDS) {
      if (includesAny(a, rule.keywords)) {
        rule.block.forEach((c) => hardBlocked.add(c));
      }
    }
  }

  // --------- 2) Stage: cold -> mature ----------
  // Etkileşim arttıkça onboarding (categories/diet) etkisi azalacak.
  const engagement = (favoriteIds.length || 0) + (savedIds.length || 0);
  const stage = clamp01(
    (engagement - coldStartEnd) / (matureStart - coldStartEnd)
  );
  // stage=0 => cold, stage=1 => mature

  // --------- 3) Score map ----------
  const score = new Map(allCategories.map((c) => [c, 0]));
  const add = (category, points) => {
    if (!score.has(category)) return;
    score.set(category, (score.get(category) || 0) + points);
  };

  // --------- 4) Weights (stage ile kayar) ----------
  const W = {
    // onboarding sinyalleri: zamanla zayıflasın
    onboardingCat: lerp(100, 10, stage), // istersen mature’da 0 yap: lerp(100, 0, stage)
    dietBonus: lerp(30, 0, stage), // diyet bonusu tamamen kaybolsun dedin

    // davranış sinyalleri: zamanla güçlensin
    favMain: lerp(25, 45, stage),
    favSub: lerp(15, 30, stage),

    viewMainBase: lerp(10, 60, stage),
    viewSubBase: lerp(5, 35, stage),
  };

  // --------- 5) Onboarding categories ----------
  for (const c of normalizedUserCategories) {
    if (score.has(c)) add(c, W.onboardingCat);
  }

  // --------- 6) Diet BLOCK artık geçici (soft penalty) ----------
  // Cold’da neredeyse “blok” gibi çalışır; mature’da tamamen sıfırlanır.
  const dietBlockPenalty = lerp(-999, 0, stage);

  for (const d of normalizedDiets) {
    const blocks = DIET_BLOCK_MAP[d];
    if (!Array.isArray(blocks)) continue;
    for (const c of blocks) add(c, dietBlockPenalty);
  }

  // --------- 7) Diet bonus (geçici) ----------
  for (const d of normalizedDiets) {
    const bonusCats = DIET_BONUS_MAP[d];
    if (!Array.isArray(bonusCats)) continue;
    bonusCats.forEach((c) => add(c, W.dietBonus));
  }

  // --------- 8) Favorites -> category votes ----------
  for (const r of favoriteRecipes || []) {
    const main = r?.main_category;
    const subs = Array.isArray(r?.sub_categories) ? r.sub_categories : [];

    if (main && score.has(main)) add(main, W.favMain);
    for (const sc of subs) {
      if (sc && score.has(sc)) add(sc, W.favSub);
    }
  }

  // --------- 9) Recent viewed -> recency decay ----------
  // Varsayım: recentViewedIds dizisi [eski ... yeni]
  // Eğer API [yeni ... eski] dönüyorsa aşağıdaki recency hesabını ters çevir.
  if (recipesById && recentViewedIds.length) {
    const n = recentViewedIds.length;

    for (let i = 0; i < n; i++) {
      const id = recentViewedIds[i];
      const meta = recipesById[id];
      if (!meta) continue;

      // en yeniye daha yüksek ağırlık
      const t = n === 1 ? 1 : i / (n - 1); // 0..1 (eski->yeni)
      const recency = lerp(0.3, 1.0, t);

      const main = meta?.main_category;
      const subs = Array.isArray(meta?.sub_categories)
        ? meta.sub_categories
        : [];

      if (main && score.has(main)) add(main, W.viewMainBase * recency);
      for (const sc of subs) {
        if (sc && score.has(sc)) add(sc, W.viewSubBase * recency);
      }
    }
  }

  // --------- 10) Context fallback (zayıf, her zaman) ----------
  const hour = now.getHours();
  const month = now.getMonth() + 1;

  if (hour >= 5 && hour <= 11) add("Kahvaltılıklar", 15);

  const isSummer = month >= 6 && month <= 9;
  if (isSummer) {
    add("Salatalar", 15);
    add("Zeytinyağlılar", 15);
  }

  // --------- 11) Rank (hard block = allergens only) ----------
  const ranked = allCategories
    .filter((c) => !hardBlocked.has(c))
    .map((c) => ({ c, s: score.get(c) || 0 }))
    .sort((a, b) => b.s - a.s);

  // --------- 12) Pick ----------
  const hasAnySignal =
    normalizedUserCategories.length > 0 ||
    normalizedDiets.length > 0 ||
    (favoriteRecipes?.length ?? 0) > 0 ||
    recentViewedIds.length > 0 ||
    normalizedAllergens.length > 0;

  let picked = [];

  if (hasAnySignal) {
    picked = ranked
      .filter((x) => x.s > 0)
      .slice(0, limit)
      .map((x) => x.c);
  } else {
    picked = ranked.slice(0, limit).map((x) => x.c);
  }

  // --------- 13) Fill ----------
  if (picked.length < limit) {
    for (const c of DEFAULT_TOP) {
      if (hardBlocked.has(c)) continue;
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
