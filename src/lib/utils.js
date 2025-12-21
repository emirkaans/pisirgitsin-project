import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAIN_CATEGORIES } from "./data";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const INGREDIENT_GROUPS = {
  vegetables: [
    "kabak",
    "patates",
    "havuç",
    "brokoli",
    "karnabahar",
    "biber",
    "domates",
    "soğan",
    "ıspanak",
  ],
  legumes: [
    "mercimek",
    "kırmızı mercimek",
    "yeşil mercimek",
    "nohut",
    "bezelye",
    "kuru fasulye",
    "barbunya",
  ],
  meats: ["dana eti", "kuzu eti", "kuşbaşı et", "kıyma", "et"],
  poultry: ["tavuk", "tavuk göğsü", "tavuk but", "tavuk suyu"],
  seafood: ["balık", "somon", "levrek", "karides", "midye", "kalamar"],
  dairy: [
    "süt",
    "krema",
    "yoğurt",
    "tereyağı",
    "peynir",
    "mozzarella",
    "kaşar",
  ],
  grains: ["pirinç", "bulgur"],
  pasta: ["makarna", "spagetti", "penne", "fusilli", "fettuccine"],
  spices: [
    "tuz",
    "karabiber",
    "pul biber",
    "kimyon",
    "kekik",
    "nane",
    "muskat",
    "biberiye",
  ],
  fats: ["zeytinyağı", "ayçiçek yağı"],
  liquids: ["su", "et suyu", "sebze suyu", "tavuk suyu", "balık suyu"],
  sweeteners: ["şeker", "bal"],
  baking: ["un", "nişasta", "kabartma tozu", "maya"],
  sauces: ["domates sosu", "pesto", "kakao", "çikolata"],
  pastryBases: ["yufka"],
};

function normalizeIngredient(name) {
  return name.toLowerCase().trim();
}

export function findAllergenMatches(recipe, allergens) {
  const a = (allergens ?? []).map(normalizeIngredient).filter(Boolean);
  if (a.length === 0) return [];

  const ings = (recipe?.ingredients ?? [])
    .map((x) => normalizeIngredient(x?.ingredient))
    .filter(Boolean);

  return a.filter((al) => ings.some((ing) => ing.includes(al)));
}

function getIngredientGroup(ingredientName) {
  const name = normalizeIngredient(ingredientName);
  for (const [groupKey, list] of Object.entries(INGREDIENT_GROUPS)) {
    if (list.includes(name)) return groupKey;
  }
  return "other";
}

function buildFinalIngredients(baseRecipe, usedIngredients) {
  const cleanedUsed = usedIngredients.filter(Boolean).map(normalizeIngredient);

  return Array.from(new Set([...baseRecipe.baseIngredients, ...cleanedUsed]));
}

function splitIngredientsByGroup(ingredients) {
  const result = {
    vegetables: [],
    legumes: [],
    meats: [],
    poultry: [],
    seafood: [],
    dairy: [],
    grains: [],
    pasta: [],
    spices: [],
    fats: [],
    liquids: [],
    sweeteners: [],
    baking: [],
    sauces: [],
    pastryBases: [],
    other: [],
  };
  ingredients.forEach((raw) => {
    const name = normalizeIngredient(raw);
    const group = getIngredientGroup(name);
    if (!result[group]) {
      result.other.push(name);
    } else {
      result[group].push(name);
    }
  });
  return result;
}

function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function getRecipesBySubcategory(categoryId) {
  const cat = MAIN_CATEGORIES.find((c) => c.id === categoryId);
  const subs = cat?.subcategories || [];
  return subs.reduce((acc, sc) => {
    if (sc.recipe) {
      acc[sc.id] = sc.recipe;
    }
    return acc;
  }, {});
}

export const SOUP_RECIPES_BY_SUBCATEGORY = getRecipesBySubcategory("SOUP");
const LEGUME_DISH_RECIPES_BY_SUBCATEGORY =
  getRecipesBySubcategory("LEGUME_DISH");
const VEGETABLE_DISH_RECIPES_BY_SUBCATEGORY =
  getRecipesBySubcategory("VEGETABLE_DISH");
const MEAT_DISH_RECIPES_BY_SUBCATEGORY = getRecipesBySubcategory("MEAT_DISH");
const CHICKEN_DISH_RECIPES_BY_SUBCATEGORY =
  getRecipesBySubcategory("CHICKEN_DISH");
const PASTA_RECIPES_BY_SUBCATEGORY = getRecipesBySubcategory("PASTA");
const SEAFOOD_DISH_RECIPES_BY_SUBCATEGORY =
  getRecipesBySubcategory("SEAFOOD_DISH");
const MILK_DESSERT_RECIPES_BY_SUBCATEGORY =
  getRecipesBySubcategory("MILK_DESSERT");
const PASTRY_RECIPES_BY_SUBCATEGORY = getRecipesBySubcategory("PASTRY");

function decideSoupSubCategory(grouped) {
  if (grouped.seafood.length > 0) return "SEAFOOD_SOUP";
  if (grouped.poultry.length > 0) return "CHICKEN_SOUP";
  if (grouped.meats.length > 0) return "MEAT_SOUP";
  if (grouped.legumes.length > 0) return "LEGUME_SOUP";
  if (grouped.vegetables.length > 0) return "VEGETABLE_SOUP";
  return null;
}

function buildSoupName({ subCategoryId, mainIngredients, hasCream }) {
  const primary = mainIngredients[0];
  const cap = capitalize(primary);
  switch (subCategoryId) {
    case "VEGETABLE_SOUP":
      if (mainIngredients.length > 1) {
        return hasCream ? "Kremalı Sebze Çorbası" : "Sebze Çorbası";
      }
      return hasCream ? `Kremalı ${cap} Çorbası` : `${cap} Çorbası`;
    case "LEGUME_SOUP":
      return `${cap} Çorbası`;
    case "CHICKEN_SOUP":
      return "Tavuk Çorbası";
    case "MEAT_SOUP":
      return cap ? `${cap} Çorbası` : "Etli Çorba";
    case "SEAFOOD_SOUP":
      return cap ? `${cap} Çorbası` : "Deniz Ürünlü Çorba";
    default:
      return "Çorba";
  }
}

export function buildSoupRecipe(rawIngredients) {
  const cleaned = rawIngredients
    .map(normalizeIngredient)
    .filter((i) => i.length > 0);
  if (!cleaned.length) return null;
  const grouped = splitIngredientsByGroup(cleaned);
  const subCategoryId = decideSoupSubCategory(grouped);
  if (!subCategoryId) return null;
  const baseRecipe = SOUP_RECIPES_BY_SUBCATEGORY[subCategoryId];
  if (!baseRecipe) return null;
  let mainIngredients = [];
  if (subCategoryId === "VEGETABLE_SOUP") mainIngredients = grouped.vegetables;
  else if (subCategoryId === "LEGUME_SOUP") mainIngredients = grouped.legumes;
  else if (subCategoryId === "CHICKEN_SOUP") mainIngredients = grouped.poultry;
  else if (subCategoryId === "MEAT_SOUP") mainIngredients = grouped.meats;
  else if (subCategoryId === "SEAFOOD_SOUP") mainIngredients = grouped.seafood;
  if (!mainIngredients.length) return null;
  const hasCream = grouped.dairy.includes("krema");
  const name = buildSoupName({ subCategoryId, mainIngredients, hasCream });
  let mainIngredientForSteps = mainIngredients[0];
  if (subCategoryId === "VEGETABLE_SOUP" && mainIngredients.length > 1) {
    mainIngredientForSteps = "sebzeler";
  } else if (subCategoryId === "LEGUME_SOUP" && mainIngredients.length > 1) {
    mainIngredientForSteps = "bakliyatlar";
  }
  const contextForSteps = { mainIngredient: mainIngredientForSteps, hasCream };
  const steps =
    typeof baseRecipe.steps === "function"
      ? baseRecipe.steps(contextForSteps)
      : [];
  const ingredients = buildFinalIngredients(baseRecipe, [
    mainIngredientForSteps,
    hasCream ? "krema" : null,
  ]);
  return {
    category: "SOUP",
    subCategoryId,
    name,
    ingredients,
    steps,
  };
}

function decideLegumeDishSubCategory(grouped) {
  if (!grouped.legumes.length) return null;
  if (grouped.meats.length > 0) return "MEATY_LEGUME_DISH";
  if (grouped.poultry.length > 0) return "CHICKEN_LEGUME_DISH";
  return "PLAIN_LEGUME_DISH";
}

function buildLegumeDishName({ subCategoryId, mainIngredients }) {
  const primary = mainIngredients[0];
  const cap = capitalize(primary);
  if (subCategoryId === "PLAIN_LEGUME_DISH") return `${cap} Yemeği`;
  if (subCategoryId === "MEATY_LEGUME_DISH") return `Etli ${cap} Yemeği`;
  if (subCategoryId === "CHICKEN_LEGUME_DISH") return `Tavuklu ${cap} Yemeği`;
  return `${cap} Yemeği`;
}

export function buildLegumeDishRecipe(rawIngredients) {
  const cleaned = rawIngredients
    .map(normalizeIngredient)
    .filter((i) => i.length > 0);
  if (!cleaned.length) return null;
  const grouped = splitIngredientsByGroup(cleaned);
  const subCategoryId = decideLegumeDishSubCategory(grouped);
  if (!subCategoryId) return null;
  const baseRecipe = LEGUME_DISH_RECIPES_BY_SUBCATEGORY[subCategoryId];
  if (!baseRecipe) return null;
  const mainIngredients = grouped.legumes || [];
  if (!mainIngredients.length) return null;
  const name = buildLegumeDishName({ subCategoryId, mainIngredients });
  let mainIngredientForSteps = mainIngredients[0];
  if (mainIngredients.length > 1) mainIngredientForSteps = "bakliyatlar";
  const contextForSteps = { mainIngredient: mainIngredientForSteps };
  const steps =
    typeof baseRecipe.steps === "function"
      ? baseRecipe.steps(contextForSteps)
      : [];
  const ingredients = buildFinalIngredients(baseRecipe, [
    mainIngredientForSteps,
  ]);
  return {
    category: "LEGUME_DISH",
    subCategoryId,
    name,
    ingredients,
    steps,
  };
}

function decideVegetableDishSubCategory(grouped) {
  if (!grouped.vegetables.length) return null;
  if (grouped.meats.length > 0) return "MEATY_VEGETABLE_DISH";
  if (grouped.poultry.length > 0) return "CHICKEN_VEGETABLE_DISH";
  if (grouped.dairy.includes("kaşar") || grouped.dairy.includes("mozzarella"))
    return "BAKED_VEGETABLE_DISH";
  return "PLAIN_VEGETABLE_DISH";
}

function buildVegetableDishName({ subCategoryId, mainIngredients }) {
  const primary = mainIngredients[0];
  const cap = capitalize(primary);
  if (subCategoryId === "PLAIN_VEGETABLE_DISH") return `${cap} Yemeği`;
  if (subCategoryId === "MEATY_VEGETABLE_DISH") return `Etli ${cap} Yemeği`;
  if (subCategoryId === "CHICKEN_VEGETABLE_DISH")
    return `Tavuklu ${cap} Yemeği`;
  if (subCategoryId === "BAKED_VEGETABLE_DISH") return `Fırında ${cap}`;
  return `${cap} Yemeği`;
}

export function buildVegetableDishRecipe(rawIngredients) {
  const cleaned = rawIngredients
    .map(normalizeIngredient)
    .filter((i) => i.length > 0);
  if (!cleaned.length) return null;
  const grouped = splitIngredientsByGroup(cleaned);
  const subCategoryId = decideVegetableDishSubCategory(grouped);
  if (!subCategoryId) return null;
  const baseRecipe = VEGETABLE_DISH_RECIPES_BY_SUBCATEGORY[subCategoryId];
  if (!baseRecipe) return null;
  const mainIngredients = grouped.vegetables || [];
  if (!mainIngredients.length) return null;
  const name = buildVegetableDishName({ subCategoryId, mainIngredients });
  let mainIngredientForSteps = mainIngredients[0];
  if (mainIngredients.length > 1) mainIngredientForSteps = "sebzeler";
  const contextForSteps = { mainIngredient: mainIngredientForSteps };
  const steps =
    typeof baseRecipe.steps === "function"
      ? baseRecipe.steps(contextForSteps)
      : [];
  const ingredients = buildFinalIngredients(baseRecipe, [
    mainIngredientForSteps,
  ]);
  return {
    category: "VEGETABLE_DISH",
    subCategoryId,
    name,
    ingredients,
    steps,
  };
}

function decideMeatDishSubCategory(grouped) {
  if (!grouped.meats.length) return null;
  if (grouped.liquids.length > 0 || grouped.vegetables.length > 0)
    return "MEAT_STEW";
  return "GRILLED_MEAT";
}

function buildMeatDishName({ subCategoryId, mainIngredients }) {
  const primary = mainIngredients[0] || "Et";
  const cap = capitalize(primary);
  if (subCategoryId === "MEAT_STEW") return `${cap} Yahnisi`;
  if (subCategoryId === "GRILLED_MEAT") return `Izgara ${cap}`;
  return `${cap} Yemeği`;
}

export function buildMeatDishRecipe(rawIngredients) {
  const cleaned = rawIngredients
    .map(normalizeIngredient)
    .filter((i) => i.length > 0);
  if (!cleaned.length) return null;
  const grouped = splitIngredientsByGroup(cleaned);
  const subCategoryId = decideMeatDishSubCategory(grouped);
  if (!subCategoryId) return null;
  const baseRecipe = MEAT_DISH_RECIPES_BY_SUBCATEGORY[subCategoryId];
  if (!baseRecipe) return null;
  const mainIngredients = grouped.meats || [];
  if (!mainIngredients.length) return null;
  const name = buildMeatDishName({ subCategoryId, mainIngredients });
  const mainIngredientForSteps = mainIngredients[0];
  const contextForSteps = { mainIngredient: mainIngredientForSteps };
  const steps =
    typeof baseRecipe.steps === "function"
      ? baseRecipe.steps(contextForSteps)
      : [];
  const ingredients = buildFinalIngredients(baseRecipe, [
    mainIngredientForSteps,
  ]);
  return {
    category: "MEAT_DISH",
    subCategoryId,
    name,
    ingredients,
    steps,
  };
}

function decideChickenDishSubCategory(grouped) {
  if (!grouped.poultry.length) return null;
  if (grouped.liquids.length > 0) return "CHICKEN_STEW";
  if (grouped.vegetables.length > 0) return "SAUTEED_CHICKEN";
  return "OVEN_CHICKEN";
}

function buildChickenDishName({ subCategoryId, mainIngredients }) {
  const primary = mainIngredients[0] || "Tavuk";
  const cap = capitalize(primary);
  if (subCategoryId === "CHICKEN_STEW") return `${cap} Yahnisi`;
  if (subCategoryId === "OVEN_CHICKEN") return `Fırında ${cap}`;
  if (subCategoryId === "SAUTEED_CHICKEN") return `${cap} Sote`;
  return `${cap} Yemeği`;
}

export function buildChickenDishRecipe(rawIngredients) {
  const cleaned = rawIngredients
    .map(normalizeIngredient)
    .filter((i) => i.length > 0);
  if (!cleaned.length) return null;
  const grouped = splitIngredientsByGroup(cleaned);
  const subCategoryId = decideChickenDishSubCategory(grouped);
  if (!subCategoryId) return null;
  const baseRecipe = CHICKEN_DISH_RECIPES_BY_SUBCATEGORY[subCategoryId];
  if (!baseRecipe) return null;
  const mainIngredients = grouped.poultry || [];
  if (!mainIngredients.length) return null;
  const name = buildChickenDishName({ subCategoryId, mainIngredients });
  const mainIngredientForSteps = mainIngredients[0];
  const contextForSteps = { mainIngredient: mainIngredientForSteps };
  const steps =
    typeof baseRecipe.steps === "function"
      ? baseRecipe.steps(contextForSteps)
      : [];
  const ingredients = buildFinalIngredients(baseRecipe, [
    mainIngredientForSteps,
  ]);
  return {
    category: "CHICKEN_DISH",
    subCategoryId,
    name,
    ingredients,
    steps,
  };
}

function decidePastaSubCategory(grouped) {
  if (!grouped.pasta.length) return null;
  if (grouped.seafood.length > 0) return "PASTA_SEAFOOD";
  if (grouped.meats.length > 0) return "PASTA_MEAT";
  if (grouped.poultry.length > 0) return "PASTA_CHICKEN";
  if (grouped.vegetables.length > 0) return "PASTA_VEGETARIAN";
  return "PASTA_PLAIN";
}

function buildPastaName({ subCategoryId, mainIngredients }) {
  const primary = mainIngredients[0];
  const cap = primary ? capitalize(primary) : "Makarna";
  if (subCategoryId === "PASTA_PLAIN") return "Sade Makarna";
  if (subCategoryId === "PASTA_VEGETARIAN") return `${cap}li Makarna`;
  if (subCategoryId === "PASTA_MEAT") return `${cap}lı Makarna`;
  if (subCategoryId === "PASTA_CHICKEN") return `${cap}lu Makarna`;
  if (subCategoryId === "PASTA_SEAFOOD") return `${cap}li Makarna`;
  return "Makarna";
}

export function buildPastaRecipe(rawIngredients) {
  const cleaned = rawIngredients
    .map(normalizeIngredient)
    .filter((i) => i.length > 0);
  if (!cleaned.length) return null;

  const grouped = splitIngredientsByGroup(cleaned);
  const subCategoryId = decidePastaSubCategory(grouped);
  if (!subCategoryId) return null;

  const baseRecipe = PASTA_RECIPES_BY_SUBCATEGORY[subCategoryId];
  if (!baseRecipe) return null;

  let mainIngredients = [];
  if (subCategoryId === "PASTA_SEAFOOD") mainIngredients = grouped.seafood;
  else if (subCategoryId === "PASTA_MEAT") mainIngredients = grouped.meats;
  else if (subCategoryId === "PASTA_CHICKEN") mainIngredients = grouped.poultry;
  else if (subCategoryId === "PASTA_VEGETARIAN")
    mainIngredients = grouped.vegetables;
  else mainIngredients = grouped.pasta;

  const name = buildPastaName({ subCategoryId, mainIngredients });
  const mainIngredientForSteps = mainIngredients[0] || "makarna";
  const contextForSteps = { mainIngredient: mainIngredientForSteps };
  const steps =
    typeof baseRecipe.steps === "function"
      ? baseRecipe.steps(contextForSteps)
      : [];

  const mainGroup =
    subCategoryId === "PASTA_VEGETARIAN"
      ? "vegetables"
      : subCategoryId === "PASTA_MEAT"
      ? "meats"
      : subCategoryId === "PASTA_CHICKEN"
      ? "poultry"
      : subCategoryId === "PASTA_SEAFOOD"
      ? "seafood"
      : "pasta";

  const extra = cleaned.filter((ing) => {
    if (baseRecipe.baseIngredients.includes(ing)) return false;
    const g = getIngredientGroup(ing);
    if (g === "pasta") return true;
    if (g === mainGroup) return true;
    return false;
  });

  const ingredients = buildFinalIngredients(baseRecipe, [
    mainIngredientForSteps,
  ]);

  return {
    category: "PASTA",
    subCategoryId,
    name,
    ingredients,
    steps,
  };
}

function decideSeafoodDishSubCategory(grouped) {
  if (!grouped.seafood.length) return null;
  if (grouped.liquids.length > 0 || grouped.vegetables.length > 0)
    return "SEAFOOD_STEW";
  return "GRILLED_SEAFOOD";
}

function buildSeafoodDishName({ subCategoryId, mainIngredients }) {
  const primary = mainIngredients[0] || "Deniz Ürünü";
  const cap = capitalize(primary);
  if (subCategoryId === "GRILLED_SEAFOOD") return `Izgara ${cap}`;
  if (subCategoryId === "SEAFOOD_STEW") return `${cap} Güveç`;
  return `${cap} Yemeği`;
}

export function buildSeafoodDishRecipe(rawIngredients) {
  const cleaned = rawIngredients
    .map(normalizeIngredient)
    .filter((i) => i.length > 0);
  if (!cleaned.length) return null;
  const grouped = splitIngredientsByGroup(cleaned);
  const subCategoryId = decideSeafoodDishSubCategory(grouped);
  if (!subCategoryId) return null;
  const baseRecipe = SEAFOOD_DISH_RECIPES_BY_SUBCATEGORY[subCategoryId];
  if (!baseRecipe) return null;
  const mainIngredients = grouped.seafood || [];
  if (!mainIngredients.length) return null;
  const name = buildSeafoodDishName({ subCategoryId, mainIngredients });
  const mainIngredientForSteps = mainIngredients[0];
  const contextForSteps = { mainIngredient: mainIngredientForSteps };
  const steps =
    typeof baseRecipe.steps === "function"
      ? baseRecipe.steps(contextForSteps)
      : [];
  const ingredients = buildFinalIngredients(baseRecipe, [
    mainIngredientForSteps,
  ]);
  return {
    category: "SEAFOOD_DISH",
    subCategoryId,
    name,
    ingredients,
    steps,
  };
}

function decideMilkDessertSubCategory(cleaned) {
  if (cleaned.includes("pirinç")) return "SUTLAC";
  if (cleaned.includes("kakao") || cleaned.includes("çikolata"))
    return "PUDDING";
  if (cleaned.includes("un") || cleaned.includes("nişasta")) return "MUHALLEBI";
  return "PUDDING";
}

function buildMilkDessertName({ subCategoryId, mainIngredient }) {
  if (subCategoryId === "SUTLAC") return "Sütlaç";
  if (subCategoryId === "MUHALLEBI") return "Muhallebi";
  if (subCategoryId === "PUDDING") {
    if (!mainIngredient) return "Puding";
    const cap = capitalize(mainIngredient);
    return `${cap} Puding`;
  }
  return "Tatlı";
}

export function buildMilkDessertRecipe(rawIngredients) {
  const cleaned = rawIngredients
    .map(normalizeIngredient)
    .filter((i) => i.length > 0);
  if (!cleaned.length) return null;
  const subCategoryId = decideMilkDessertSubCategory(cleaned);
  const baseRecipe = MILK_DESSERT_RECIPES_BY_SUBCATEGORY[subCategoryId];
  if (!baseRecipe) return null;
  let mainIngredient = null;
  if (subCategoryId === "PUDDING") {
    if (cleaned.includes("kakao")) mainIngredient = "kakao";
    else if (cleaned.includes("çikolata")) mainIngredient = "çikolata";
  }
  const name = buildMilkDessertName({ subCategoryId, mainIngredient });
  const contextForSteps = { mainIngredient };
  const steps =
    typeof baseRecipe.steps === "function"
      ? baseRecipe.steps(contextForSteps)
      : [];
  const mainIngredientForSteps = mainIngredient ?? "malzemeler";
  const ingredients = buildFinalIngredients(baseRecipe, [
    mainIngredientForSteps,
  ]);
  return {
    category: "MILK_DESSERT",
    subCategoryId,
    name,
    ingredients,
    steps,
  };
}

function decidePastrySubCategory(cleaned) {
  if (cleaned.includes("yufka")) return "BOREK";
  if (cleaned.includes("domates sosu") || cleaned.includes("mozzarella"))
    return "PIZZA";
  if (cleaned.includes("maya") || cleaned.includes("kabartma tozu"))
    return "POGACA";
  return "POGACA";
}

function buildPastryName({ subCategoryId, mainIngredient }) {
  if (subCategoryId === "BOREK") {
    if (!mainIngredient) return "Börek";
    const cap = capitalize(mainIngredient);
    return `${cap}lı Börek`;
  }
  if (subCategoryId === "POGACA") {
    if (!mainIngredient) return "Poğaça";
    const cap = capitalize(mainIngredient);
    return `${cap}lı Poğaça`;
  }
  if (subCategoryId === "PIZZA") {
    if (!mainIngredient) return "Pizza";
    const cap = capitalize(mainIngredient);
    return `${cap} Pizza`;
  }
  return "Hamur İşi";
}

export function buildPastryRecipe(rawIngredients) {
  const cleaned = rawIngredients
    .map(normalizeIngredient)
    .filter((i) => i.length > 0);
  if (!cleaned.length) return null;
  const subCategoryId = decidePastrySubCategory(cleaned);
  const baseRecipe = PASTRY_RECIPES_BY_SUBCATEGORY[subCategoryId];
  if (!baseRecipe) return null;
  let mainIngredient = null;
  if (subCategoryId === "BOREK") {
    if (cleaned.includes("peynir")) mainIngredient = "peynir";
    else if (cleaned.includes("patates")) mainIngredient = "patates";
    else if (cleaned.includes("ıspanak")) mainIngredient = "ıspanak";
  }
  if (subCategoryId === "POGACA") {
    if (cleaned.includes("peynir")) mainIngredient = "peynir";
    else if (cleaned.includes("zeytin")) mainIngredient = "zeytin";
  }
  if (subCategoryId === "PIZZA") {
    if (cleaned.includes("sucuk")) mainIngredient = "sucuk";
    else if (cleaned.includes("mantar")) mainIngredient = "mantar";
  }
  const name = buildPastryName({ subCategoryId, mainIngredient });
  const contextForSteps = { mainIngredient };
  const steps =
    typeof baseRecipe.steps === "function"
      ? baseRecipe.steps(contextForSteps)
      : [];
  const mainIngredientForSteps = mainIngredient ?? "malzemeler";

  const ingredients = buildFinalIngredients(baseRecipe, [
    mainIngredientForSteps,
  ]);
  return {
    category: "PASTRY",
    subCategoryId,
    name,
    ingredients,
    steps,
  };
}
