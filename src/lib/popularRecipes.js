import { DIET_BLOCK_MAP, DIET_BONUS_MAP } from "@/constants/constants";
import { supabase } from "@/lib/supabase";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .trim();
}

function popularityScore(r) {
  const saves = Number(r?.saves_count ?? 0);
  const likes = Number(r?.likes_count ?? 0);
  const views = Number(r?.views_count ?? 0);
  return saves * 5 + likes * 2 + views * 0.1;
}

function recipeHasAllergen(recipe, allergens) {
  const a = (allergens ?? []).map(normalize).filter(Boolean);
  if (a.length === 0) return false;

  const ingredients = (recipe?.ingredients ?? []).map((x) =>
    normalize(x?.ingredient)
  );
  return ingredients.some((ing) =>
    a.some((al) => ing.includes(al) || al.includes(ing))
  );
}

function uniq(arr) {
  return Array.from(new Set(arr));
}
function normCat(s) {
  return String(s || "")
    .toLowerCase()
    .trim();
}

function getRecipeCategorySet(recipe) {
  const set = new Set();
  if (recipe?.main_category) set.add(normCat(recipe.main_category));

  const subs = Array.isArray(recipe?.sub_categories)
    ? recipe.sub_categories
    : [];
  for (const sc of subs) set.add(normCat(sc));

  return set; // normalized
}

function hasAnyCategory(recipe, categories) {
  const catSet = getRecipeCategorySet(recipe);
  const list = (categories ?? []).map(normCat);
  return list.some((c) => catSet.has(c));
}

function isBlockedByDiet(recipe, blockedCategories) {
  return hasAnyCategory(recipe, blockedCategories);
}

export async function getTopRecipes({ profile, limit = 3 } = {}) {
  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];
  const favoriteIds = Array.isArray(profile?.favorite_recipe_ids)
    ? profile.favorite_recipe_ids
    : [];
  const userCategories = Array.isArray(profile?.categories)
    ? profile.categories
    : [];
  const diets = Array.isArray(profile?.diets)
    ? profile.diets.map(normalize)
    : [];

  const dietCategories = uniq(diets.flatMap((d) => DIET_BONUS_MAP[d] ?? []));
  const blockedCategories = uniq(diets.flatMap((d) => DIET_BLOCK_MAP[d] ?? []));

  const blockedSet = new Set(blockedCategories.map(normCat));
  console.log({
    allergens,
    favoriteIds,
    userCategories,
    dietCategories,
    blockedCategories,
    diets,
  });
  const selected = [];

  const addUnique = (arr) => {
    for (const r of arr) {
      if (!r?.id) continue;
      if (selected.some((x) => x.id === r.id)) continue;
      if (recipeHasAllergen(r, allergens)) continue;

      // ✅ diet block kategorileri ele (ör: vejetaryen -> tavuk)
      if (isBlockedByDiet(r, blockedCategories)) continue;

      selected.push(r);
      if (selected.length === limit) break;
    }
  };

  // 1) Favoriler >= 3 ise: favorilerin içinden en iyi 3
  if (favoriteIds.length >= limit) {
    const { data, error } = await supabase
      .from("recipe")
      .select(
        "id,name,image_url,main_category,sub_categories,ingredients,likes_count,saves_count,views_count,time_in_minutes"
      )
      .in("id", favoriteIds);

    if (error) throw error;

    const filtered = (data ?? []).filter(
      (r) => !recipeHasAllergen(r, allergens)
    );
    filtered.sort((a, b) => popularityScore(b) - popularityScore(a));
    return filtered.slice(0, limit);
  }

  // 2) Favoriler < 3 ise: favorileri ekle
  if (favoriteIds.length > 0) {
    const { data, error } = await supabase
      .from("recipe")
      .select(
        "id,name,image_url,main_category,sub_categories,ingredients,likes_count,saves_count,views_count,time_in_minutes"
      )
      .in("id", favoriteIds);

    if (error) throw error;

    const sortedFavs = (data ?? []).sort(
      (a, b) => popularityScore(b) - popularityScore(a)
    );
    addUnique(sortedFavs);
  }

  // 3) Kategori havuzu ile tamamla (user categories + diet categories)

  const poolCategories = uniq([
    ...(userCategories ?? []),
    ...(dietCategories ?? []),
  ])
    .filter(Boolean)
    .filter((c) => !blockedSet.has(normCat(c)));

  if (selected.length < limit && poolCategories.length > 0) {
    // Basit yaklaşım: bu kategorilerdeki tariflerden popülerleri çek
    // (DB’de main_category string match)
    const { data, error } = await supabase
      .from("recipe")
      .select(
        "id,name,image_url,main_category,sub_categories,ingredients,likes_count,saves_count,views_count,time_in_minutes"
      )
      .order("saves_count", { ascending: false })
      .order("likes_count", { ascending: false })
      .order("views_count", { ascending: false })
      .limit(80); // biraz daha geniş çekiyoruz

    if (error) throw error;

    // ✅ poolCategories main veya sub match ediyorsa al
    const poolMatched = (data ?? []).filter((r) =>
      hasAnyCategory(r, poolCategories)
    );

    addUnique(poolMatched);
  }

  // 4) Hala dolmadıysa: genel popüler ile tamamla
  if (selected.length < limit) {
    const { data, error } = await supabase
      .from("recipe")
      .select(
        "id,name,image_url,main_category,sub_categories,ingredients,likes_count,saves_count,views_count,time_in_minutes"
      )
      .order("saves_count", { ascending: false })
      .order("likes_count", { ascending: false })
      .order("views_count", { ascending: false })
      .limit(50);

    if (error) throw error;

    addUnique(data ?? []);
  }

  return selected.slice(0, limit);
}
