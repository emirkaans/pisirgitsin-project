 
export const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .trim();

export const normalizeList = (arr = []) => arr.map(norm).filter(Boolean);

export const has = (ings, x) => new Set(ings.map(norm)).has(norm(x));

export const hasAny = (ings, list = []) => list.some((x) => has(ings, x));

export const pickPresent = (ings, list = []) =>
  list.filter((x) => has(ings, x));

export const pickFirstPresent = (ings, list = []) =>
  list.find((x) => has(ings, x)) || null;

export const countPresent = (ings, list = []) => pickPresent(ings, list).length;

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function detectAllergens(candidate, profile) {
  const allergens = Array.isArray(profile?.allergens) ? profile.allergens : [];
  const list =
    candidate.required_ingredients ?? candidate.used_ingredients ?? [];

  const a = allergens.map(norm).filter(Boolean);
  const l = (list ?? []).map(norm).filter(Boolean);

  const hits = [];
  for (const al of a) {
    if (l.some((x) => x.includes(al) || al.includes(x))) hits.push(al);
  }
  return hits;  
}

function collectAllIngredients(ingredient) {
  if (typeof ingredient === "string") {
    return [ingredient];
  }

  if (Array.isArray(ingredient)) {
    return ingredient.flatMap(collectAllIngredients);
  }

  if (typeof ingredient === "object" && ingredient !== null) {
    return Object.values(ingredient).flatMap(collectAllIngredients);
  }

  return [];
}

export const BASE_PANTRY = {
  common: ["tuz", "karabiber"],

  soup: ["su", "soğan", "sarımsak"],
  saute: ["soğan", "sarımsak"],
  tomato: ["salça"],

  pasta: ["tuz", "su"],
};

export const INGREDIENTS = {
  pasta: ["makarna"],
  legumes: ["mercimek", "nohut", "fasulye", "börülce"],

  vegetables: {
    main: [
      "kabak",
      "brokoli",
      "karnabahar",
      "patates",
      "havuç",
      "ıspanak",
      "kereviz",
      "mantar",
      "patlıcan",
      "bezelye",
    ],
    aromatic: ["soğan", "domates", "biber", "sarımsak"],
  },

  sauces: {
    creamy: ["krema", "süt", "yoğurt"],
    tomato: ["domates", "salça"],
  },

  dairy: ["süt", "yoğurt", "krema"],

  proteins: {
    meat: ["et", "kıyma"],
    chicken: ["tavuk"],
    seafood: [
      "balık",
      "somon",
      "ton balığı",
      "levrek",
      "çipura",
      "karides",
      "kalamar",
      "midye",
      "ahtapot",
    ],
  },

  styles: {
    tomato: ["domates", "salça"],
    oliveOil: ["zeytinyağı"],
  },

  baking: {
     
    doughBases: ["yufka", "hamur", "lavaş"],

     
    flour: ["un"],
    waffleBase: ["waffle", "waffle hamuru"],

     
    eggs: ["yumurta"],
    leavening: ["kabartma tozu", "maya", "karbonat"],

     
    dairy: ["süt", "yoğurt", "tereyağı", "krema"],

     
    fillingsSavory: [
      "peynir",
      "patates",
      "ıspanak",
      "kıyma",
      "mantarlı",
      "mantar",
    ],
    fillingsSweet: ["çikolata", "kakao", "bal", "reçel"],
  },
  fruits: {
    fresh: [
      "çilek",
      "muz",
      "kivi",
      "elma",
      "armut",
      "yaban mersini",
      "böğürtlen",
      "ahududu",
    ],
  },
  desserts: {
    milkRequired: ["süt"],

    thickeners: ["nişasta", "pirinç", "irmik"],
    flavors: ["vanilya"],
    chocolate: ["kakao", "çikolata"],

    sweeteners: ["şeker", "bal"],

    toppings: ["tarçın", "fındık", "ceviz"],
  },
};

export const allIngredients = [...new Set(collectAllIngredients(INGREDIENTS))];

export function buildSoupCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

  const mainVeg = pickPresent(I, INGREDIENTS.vegetables.main);
  const hasCream = hasAny(I, INGREDIENTS.sauces.creamy);
  const hasChicken = hasAny(I, INGREDIENTS.proteins.chicken);

  if (mainVeg.length === 0) return [];

  const base = {
    main_category: "Çorbalar",
    required_ingredients: [...mainVeg],
    base_ingredients: ["su", "soğan", "sarımsak", "tuz", "karabiber"],
  };

  const candidates = [];

   
  const pushCandidate = (c) => {
    const key = `${c.main_category}|${c.name}|${(
      c.required_ingredients ?? []
    ).join(",")}`;
    if (!pushCandidate._seen) pushCandidate._seen = new Set();
    if (pushCandidate._seen.has(key)) return;
    pushCandidate._seen.add(key);
    candidates.push(c);
  };

  


  if (mainVeg.length === 1) {
    const v = mainVeg[0];
    const capV = capitalize(v);

     
    pushCandidate({
      ...base,
      name: `${capV} Çorbası`,
      sub_categories: ["Sebze", capV],
      required_ingredients: [v],
    });

     
    if (hasCream) {
      pushCandidate({
        ...base,
        name: `Kremalı ${capV} Çorbası`,
        sub_categories: ["Sebze", capV, "Kremalı"],
        required_ingredients: [v, "krema"],
      });
    }

     
    if (hasChicken) {
      pushCandidate({
        ...base,
        name: `Tavuklu ${capV} Çorbası`,
        sub_categories: ["Sebze", capV, "Tavuklu"],
        required_ingredients: [v, "tavuk"],
      });

       
      if (hasCream) {
        pushCandidate({
          ...base,
          name: `Kremalı Tavuklu ${capV} Çorbası`,
          sub_categories: ["Sebze", capV, "Tavuklu", "Kremalı"],
          required_ingredients: [v, "tavuk", "krema"],
        });
      }
    }

    return candidates;
  }

  


   
  pushCandidate({
    ...base,
    name: "Sebze Çorbası",
    sub_categories: ["Sebze", "Karışık"],
    required_ingredients: [...mainVeg],
  });

   
  if (hasCream) {
    pushCandidate({
      ...base,
      name: "Kremalı Sebze Çorbası",
      sub_categories: ["Sebze", "Karışık", "Kremalı"],
      required_ingredients: [...mainVeg, "krema"],
    });
  }

   
  if (hasChicken) {
    pushCandidate({
      ...base,
      name: "Tavuklu Sebze Çorbası",
      sub_categories: ["Sebze", "Karışık", "Tavuklu"],
      required_ingredients: [...mainVeg, "tavuk"],
    });

     
    if (hasCream) {
      pushCandidate({
        ...base,
        name: "Kremalı Tavuklu Sebze Çorbası",
        sub_categories: ["Sebze", "Karışık", "Tavuklu", "Kremalı"],
        required_ingredients: [...mainVeg, "tavuk", "krema"],
      });
    }
  }

  return candidates;
}

export function buildPastaCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

   
  if (!has(I, INGREDIENTS.pasta[0])) return [];

  const vegs = pickPresent(I, INGREDIENTS.vegetables.main);
  const hasCream = hasAny(I, INGREDIENTS.sauces.creamy);
  const hasTomato = hasAny(I, INGREDIENTS.sauces.tomato);

  const candidates = [
    {
      id: "gen:PASTA_PLAIN",
      name: "Makarna",
      main_category: "Makarna",
      sub_categories: ["Klasik"],
      used_ingredients: ["makarna"],
    },
  ];

   
  if (vegs.length === 1) {
    const v = vegs[0];

    candidates.push({
      id: `gen:PASTA_${v.toUpperCase()}`,
      name: `${capitalize(v)}li Makarna`,
      main_category: "Makarna",
      sub_categories: ["Sebzeli", capitalize(v)],
      used_ingredients: ["makarna", v],
    });

    if (hasCream) {
      candidates.push({
        id: `gen:PASTA_${v.toUpperCase()}_CREAM`,
        name: `Kremalı ${capitalize(v)}li Makarna`,
        main_category: "Makarna",
        sub_categories: ["Sebzeli", capitalize(v), "Kremalı"],
        used_ingredients: ["makarna", v, "krema"],
      });
    }

    if (hasTomato) {
      candidates.push({
        id: `gen:PASTA_${v.toUpperCase()}_TOMATO`,
        name: `Domatesli ${capitalize(v)}li Makarna`,
        main_category: "Makarna",
        sub_categories: ["Sebzeli", capitalize(v), "Domatesli"],
        used_ingredients: ["makarna", v, "domates"],
      });
    }
  }

   
  if (vegs.length > 1) {
    candidates.push({
      id: "gen:PASTA_VEG_MIX",
      name: "Sebzeli Makarna",
      main_category: "Makarna",
      sub_categories: ["Sebzeli", "Karışık"],
      used_ingredients: ["makarna", ...vegs],
    });

    if (hasCream) {
      candidates.push({
        id: "gen:PASTA_VEG_MIX_CREAM",
        name: "Kremalı Sebzeli Makarna",
        main_category: "Makarna",
        sub_categories: ["Sebzeli", "Karışık", "Kremalı"],
        used_ingredients: ["makarna", ...vegs, "krema"],
      });
    }

    if (hasTomato) {
      candidates.push({
        id: "gen:PASTA_VEG_MIX_TOMATO",
        name: "Domatesli Sebzeli Makarna",
        main_category: "Makarna",
        sub_categories: ["Sebzeli", "Karışık", "Domatesli"],
        used_ingredients: ["makarna", ...vegs, "domates"],
      });
    }
  }

  return candidates;
}

export function buildLegumeCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

   
  const legumesPresent = pickPresent(I, INGREDIENTS.legumes);
  if (legumesPresent.length === 0) return [];

  const hasMeat = hasAny(I, INGREDIENTS.proteins.meat);
  const hasChicken = hasAny(I, INGREDIENTS.proteins.chicken);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);
  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);

  const candidates = [];

  for (const legume of legumesPresent) {
    const cap = capitalize(legume);

    


    candidates.push({
      id: `gen:LEGUME_${legume.toUpperCase()}`,
      name: `${cap} Yemeği`,
      main_category: "Bakliyat Yemekleri",
      sub_categories: [cap],
      used_ingredients: [legume],
    });

    


    if (hasTomato) {
      candidates.push({
        id: `gen:LEGUME_${legume.toUpperCase()}_TOMATO`,
        name: `${cap} Yemeği (Salçalı)`,
        main_category: "Bakliyat Yemekleri",
        sub_categories: [cap, "Salçalı"],
        used_ingredients: [legume, "salça"],
      });
    }

    


    if (hasOliveOil) {
      candidates.push({
        id: `gen:LEGUME_${legume.toUpperCase()}_OLIVE`,
        name: `Zeytinyağlı ${cap}`,
        main_category: "Bakliyat Yemekleri",
        sub_categories: [cap, "Zeytinyağlı"],
        used_ingredients: [legume, "zeytinyağı"],
      });
    }

    


    if (hasMeat) {
      candidates.push({
        id: `gen:LEGUME_${legume.toUpperCase()}_MEAT`,
        name: `Etli ${cap} Yemeği`,
        main_category: "Bakliyat Yemekleri",
        sub_categories: [cap, "Etli"],
        used_ingredients: [legume, "et"],
      });
    }

    


    if (hasChicken) {
      candidates.push({
        id: `gen:LEGUME_${legume.toUpperCase()}_CHICKEN`,
        name: `Tavuklu ${cap} Yemeği`,
        main_category: "Bakliyat Yemekleri",
        sub_categories: [cap, "Tavuklu"],
        used_ingredients: [legume, "tavuk"],
      });
    }
  }

  return candidates;
}

export function buildVegetableDishCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

   
  const mains = pickPresent(I, INGREDIENTS.vegetables.main);
  if (mains.length === 0) return [];  

  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);

  const candidates = [];

   
  const pushWithStyles = (base) => {
    candidates.push(base);

    if (hasOliveOil) {
      candidates.push({
        ...base,
        id: `${base.id}_OLIVE`,
        name: `Zeytinyağlı ${base.name}`,
        sub_categories: [...base.sub_categories, "Zeytinyağlı"],
        used_ingredients: [...base.used_ingredients, "zeytinyağı"],
      });
    }

    if (hasTomato) {
      candidates.push({
        ...base,
        id: `${base.id}_TOMATO`,
        name: `${base.name} (Salçalı)`,
        sub_categories: [...base.sub_categories, "Salçalı"],
        used_ingredients: [...base.used_ingredients, "salça"],
      });
    }

     
    candidates.push({
      ...base,
      id: `${base.id}_OVEN`,
      name: `Fırında ${base.name}`,
      sub_categories: [...base.sub_categories, "Fırında"],
    });
  };

  


  if (mains.length === 1) {
    const v = mains[0];
    const cap = capitalize(v);

    const base = {
      id: `gen:VEG_${v.toUpperCase()}`,
      name: `${cap} Yemeği`,
      main_category: "Sebze Yemekleri",
      sub_categories: [cap],
      used_ingredients: [v],
    };

    pushWithStyles(base);
    return candidates;
  }

  


  const baseMix = {
    id: "gen:VEG_MIX",
    name: "Karışık Sebze Yemeği",
    main_category: "Sebze Yemekleri",
    sub_categories: ["Karışık"],
    used_ingredients: mains,
  };

  pushWithStyles(baseMix);
  return candidates;
}

export function buildMeatDishCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

   
  const meats = pickPresent(I, INGREDIENTS.proteins.meat);
  if (meats.length === 0) return [];

  const mains = pickPresent(I, INGREDIENTS.vegetables.main);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);
  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);

  const candidates = [];

   
  const pushWithStyles = (base) => {
    candidates.push(base);

    if (hasTomato) {
      candidates.push({
        ...base,
        id: `${base.id}_TOMATO`,
        name: `${base.name} (Salçalı)`,
        sub_categories: [...base.sub_categories, "Salçalı"],
        used_ingredients: [...base.used_ingredients, "salça"],
      });
    }

    candidates.push({
      ...base,
      id: `${base.id}_OVEN`,
      name: `Fırında ${base.name}`,
      sub_categories: [...base.sub_categories, "Fırında"],
    });
  };

  


  if (mains.length === 1) {
    const v = mains[0];
    const cap = capitalize(v);

    const base = {
      id: `gen:MEAT_${v.toUpperCase()}`,
      name: `Etli ${cap}`,
      main_category: "Et Yemekleri",
      sub_categories: ["Etli", cap],
      used_ingredients: ["et", v],
    };

    pushWithStyles(base);
    return candidates;
  }

  


  if (mains.length >= 2) {
    const base = {
      id: "gen:MEAT_MIX",
      name: "Etli Karışık Sebze",
      main_category: "Et Yemekleri",
      sub_categories: ["Etli", "Karışık"],
      used_ingredients: ["et", ...mains],
    };

    pushWithStyles(base);
    return candidates;
  }

  


  const base = {
    id: "gen:MEAT_PLAIN",
    name: "Et Yemeği",
    main_category: "Et Yemekleri",
    sub_categories: ["Etli"],
    used_ingredients: ["et"],
  };

  pushWithStyles(base);
  return candidates;
}

export function buildChickenDishCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

   
  const chickens = pickPresent(I, INGREDIENTS.proteins.chicken);
  if (chickens.length === 0) return [];

  const mains = pickPresent(I, INGREDIENTS.vegetables.main);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);
  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);

  const candidates = [];

   
  const pushWithStyles = (base) => {
    candidates.push(base);

    if (hasTomato) {
      candidates.push({
        ...base,
        id: `${base.id}_TOMATO`,
        name: `${base.name} (Salçalı)`,
        sub_categories: [...base.sub_categories, "Salçalı"],
        used_ingredients: [...base.used_ingredients, "salça"],
      });
    }

    candidates.push({
      ...base,
      id: `${base.id}_OVEN`,
      name: `Fırında ${base.name}`,
      sub_categories: [...base.sub_categories, "Fırında"],
    });
  };

  


  if (mains.length === 1) {
    const v = mains[0];
    const cap = capitalize(v);

    const base = {
      id: `gen:CHICKEN_${v.toUpperCase()}`,
      name: `Tavuklu ${cap}`,
      main_category: "Tavuk Yemekleri",
      sub_categories: ["Tavuklu", cap],
      used_ingredients: ["tavuk", v],
    };

    pushWithStyles(base);
    return candidates;
  }

  


  if (mains.length >= 2) {
    const base = {
      id: "gen:CHICKEN_MIX",
      name: "Tavuklu Karışık Sebze",
      main_category: "Tavuk Yemekleri",
      sub_categories: ["Tavuklu", "Karışık"],
      used_ingredients: ["tavuk", ...mains],
    };

    pushWithStyles(base);
    return candidates;
  }

  


  const base = {
    id: "gen:CHICKEN_PLAIN",
    name: "Tavuk Yemeği",
    main_category: "Tavuk Yemekleri",
    sub_categories: ["Tavuklu"],
    used_ingredients: ["tavuk"],
  };

  pushWithStyles(base);
  return candidates;
}

export function buildSeafoodDishCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

   
  const seafoods = pickPresent(I, INGREDIENTS.proteins.seafood);
  if (seafoods.length === 0) return [];

  const mains = pickPresent(I, INGREDIENTS.vegetables.main);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);
  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);

  const candidates = [];

   
  const pushWithStyles = (base) => {
    candidates.push(base);

    if (hasTomato) {
      candidates.push({
        ...base,
        id: `${base.id}_TOMATO`,
        name: `${base.name} (Salçalı)`,
        sub_categories: [...base.sub_categories, "Salçalı"],
        used_ingredients: [...base.used_ingredients, "salça"],
      });
    }

    if (hasOliveOil) {
      candidates.push({
        ...base,
        id: `${base.id}_OLIVE`,
        name: `Zeytinyağlı ${base.name}`,
        sub_categories: [...base.sub_categories, "Zeytinyağlı"],
        used_ingredients: [...base.used_ingredients, "zeytinyağı"],
      });
    }

    candidates.push({
      ...base,
      id: `${base.id}_OVEN`,
      name: `Fırında ${base.name}`,
      sub_categories: [...base.sub_categories, "Fırında"],
    });
  };

   
  if (mains.length === 1) {
    const v = mains[0];
    const cap = capitalize(v);

    const base = {
      id: `gen:SEAFOOD_${v.toUpperCase()}`,
      name: `Deniz Ürünlü ${cap}`,
      main_category: "Deniz Ürünleri",
      sub_categories: ["Deniz Ürünlü", cap],
      used_ingredients: ["deniz ürünü", v],
      required_ingredients: ["deniz ürünü", v],
    };

    pushWithStyles(base);
    return candidates;
  }

   
  if (mains.length >= 2) {
    const base = {
      id: "gen:SEAFOOD_MIX",
      name: "Deniz Ürünlü Karışık Sebze",
      main_category: "Deniz Ürünleri",
      sub_categories: ["Deniz Ürünlü", "Karışık"],
      used_ingredients: ["deniz ürünü", ...mains],
      required_ingredients: ["deniz ürünü", ...mains],
    };

    pushWithStyles(base);
    return candidates;
  }

   
  const base = {
    id: "gen:SEAFOOD_PLAIN",
    name: "Deniz Ürünü Yemeği",
    main_category: "Deniz Ürünleri",
    sub_categories: ["Deniz Ürünlü"],
    used_ingredients: ["deniz ürünü"],
    required_ingredients: ["deniz ürünü"],
  };

  pushWithStyles(base);
  return candidates;
}

export function buildPastryCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);
  const candidates = [];

  const hasYufkaBase = hasAny(I, INGREDIENTS.baking.doughBases);
  const hasFlour = hasAny(I, INGREDIENTS.baking.flour);

  const savoryFillings = pickPresent(I, INGREDIENTS.baking.fillingsSavory);
  const sweetFillings = pickPresent(I, INGREDIENTS.baking.fillingsSweet);

   
  const hasWaffleBase = hasAny(I, INGREDIENTS.baking.waffleBase);
  const fruits = pickPresent(I, INGREDIENTS.fruits.fresh);

  


  if (hasYufkaBase) {
     
    const makeBorek = (label, usedExtra = []) => ({
      id: `gen:PASTRY_BOREK_${label.toUpperCase()}`,
      name: `${label} Börek`,
      main_category: "Hamur İşleri",
      sub_categories: ["Börek", label],
      used_ingredients: ["yufka", ...usedExtra],
    });

    if (savoryFillings.length > 0) {
       
      const tops = savoryFillings.slice(0, 2);
      for (const fill of tops) {
        const label =
          fill === "ıspanak"
            ? "Ispanaklı"
            : fill === "peynir"
            ? "Peynirli"
            : fill === "patates"
            ? "Patatesli"
            : fill === "kıyma"
            ? "Kıymalı"
            : fill === "mantar" || fill === "mantarlı"
            ? "Mantarlı"
            : `${capitalize(fill)}lı`;

        candidates.push(makeBorek(label, [fill]));
      }
    } else {
       
      candidates.push({
        id: "gen:PASTRY_BOREK_PLAIN",
        name: "Sade Börek",
        main_category: "Hamur İşleri",
        sub_categories: ["Börek", "Sade"],
        used_ingredients: ["yufka"],
      });
    }
  }

  



  if (hasYufkaBase) {
    const hasTomato = hasAny(I, ["domates", "salça"]);
    const hasCheese = has(I, "peynir");

     
    candidates.push({
      id: "gen:PASTRY_PIZZA_BASE",
      name: "Ev Usulü Pizza",
      main_category: "Hamur İşleri",
      sub_categories: ["Pizza"],
      used_ingredients: ["hamur"],
    });

    if (hasTomato) {
      candidates.push({
        id: "gen:PASTRY_PIZZA_TOMATO",
        name: "Domates Soslu Pizza",
        main_category: "Hamur İşleri",
        sub_categories: ["Pizza", "Domates Soslu"],
        used_ingredients: ["hamur", "domates"],
      });
    }

    if (hasCheese) {
      candidates.push({
        id: "gen:PASTRY_PIZZA_CHEESE",
        name: "Peynirli Pizza",
        main_category: "Hamur İşleri",
        sub_categories: ["Pizza", "Peynirli"],
        used_ingredients: ["hamur", "peynir"],
      });
    }
  }

  



  if (hasFlour) {
    const hasEgg = hasAny(I, INGREDIENTS.baking.eggs);
    const hasLeaven = hasAny(I, INGREDIENTS.baking.leavening);
    const hasMilk = hasAny(I, ["süt"]);
    const hasButter = hasAny(I, ["tereyağı"]);
    const hasYogurt = hasAny(I, ["yoğurt"]);

     
    if (hasEgg || hasLeaven) {
      candidates.push({
        id: "gen:PASTRY_CAKE_BASE",
        name: "Kek",
        main_category: "Hamur İşleri",
        sub_categories: ["Kek"],
        used_ingredients: [
          "un",
          ...(hasEgg ? ["yumurta"] : []),
          ...(hasLeaven ? ["kabartma tozu"] : []),
        ],
      });

      if (
        sweetFillings.includes("kakao") ||
        sweetFillings.includes("çikolata")
      ) {
        candidates.push({
          id: "gen:PASTRY_CAKE_CHOC",
          name: "Çikolatalı Kek",
          main_category: "Hamur İşleri",
          sub_categories: ["Kek", "Çikolatalı"],
          used_ingredients: ["un", "kakao"],
        });
      }
    }

     
    if (hasButter || hasAny(I, ["yağ"])) {
      candidates.push({
        id: "gen:PASTRY_COOKIE",
        name: "Kurabiye",
        main_category: "Hamur İşleri",
        sub_categories: ["Kurabiye"],
        used_ingredients: ["un", ...(hasButter ? ["tereyağı"] : ["yağ"])],
      });
    }

     
    if (hasMilk && hasEgg) {
      candidates.push({
        id: "gen:PASTRY_PANCAKE",
        name: "Pankek",
        main_category: "Hamur İşleri",
        sub_categories: ["Pankek"],
        used_ingredients: ["un", "süt", "yumurta"],
      });
    }

    if (hasWaffleBase || (hasFlour && hasMilk && hasEgg)) {
      candidates.push({
        id: "gen:PASTRY_WAFFLE",
        name: "Waffle",
        main_category: "Hamur İşleri",
        sub_categories: ["Waffle", ...(fruits.length ? ["Meyveli"] : [])],
        used_ingredients: [
          ...(hasWaffleBase ? ["waffle hamuru"] : ["un", "süt", "yumurta"]),
          ...fruits,
        ],
      });
    }
  }

  return candidates;
}

export function buildMilkDessertCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

   
  if (!hasAny(I, INGREDIENTS.desserts.milkRequired)) return [];

  const hasCocoa = hasAny(I, INGREDIENTS.desserts.chocolate);
  const hasVanilla = hasAny(I, INGREDIENTS.desserts.flavors);
  const thickeners = pickPresent(I, INGREDIENTS.desserts.thickeners);

  const hasStarch = has(I, "nişasta");
  const hasRice = has(I, "pirinç");
  const hasSemolina = has(I, "irmik");

  const candidates = [];

  



  candidates.push({
    id: "gen:MILK_DESSERT_BASE",
    name: "Sütlü Tatlı",
    main_category: "Sütlü Tatlılar",
    sub_categories: ["Temel"],
    used_ingredients: ["süt"],
  });

  


  if (hasStarch) {
    candidates.push({
      id: "gen:MILK_DESSERT_MUHALLEBI",
      name: "Muhallebi",
      main_category: "Sütlü Tatlılar",
      sub_categories: ["Muhallebi"],
      used_ingredients: ["süt", "nişasta"],
    });

    if (hasVanilla) {
      candidates.push({
        id: "gen:MILK_DESSERT_MUHALLEBI_VANILLA",
        name: "Vanilyalı Muhallebi",
        main_category: "Sütlü Tatlılar",
        sub_categories: ["Muhallebi", "Vanilyalı"],
        used_ingredients: ["süt", "nişasta", "vanilya"],
      });
    }

    if (hasCocoa) {
      candidates.push({
        id: "gen:MILK_DESSERT_PUDDING_COCOA",
        name: "Kakaolu Puding",
        main_category: "Sütlü Tatlılar",
        sub_categories: ["Puding", "Kakaolu"],
        used_ingredients: ["süt", "nişasta", "kakao"],
      });
    }
  }

  


  if (hasRice) {
    candidates.push({
      id: "gen:MILK_DESSERT_SUTLAC",
      name: "Sütlaç",
      main_category: "Sütlü Tatlılar",
      sub_categories: ["Sütlaç"],
      used_ingredients: ["süt", "pirinç"],
    });

     
    candidates.push({
      id: "gen:MILK_DESSERT_SUTLAC_OVEN",
      name: "Fırın Sütlaç",
      main_category: "Sütlü Tatlılar",
      sub_categories: ["Sütlaç", "Fırında"],
      used_ingredients: ["süt", "pirinç"],
    });
  }

  


  if (hasSemolina) {
    candidates.push({
      id: "gen:MILK_DESSERT_SEMOLINA",
      name: "İrmik Tatlısı",
      main_category: "Sütlü Tatlılar",
      sub_categories: ["İrmik"],
      used_ingredients: ["süt", "irmik"],
    });

    if (hasCocoa) {
      candidates.push({
        id: "gen:MILK_DESSERT_SEMOLINA_COCOA",
        name: "Kakaolu İrmik Tatlısı",
        main_category: "Sütlü Tatlılar",
        sub_categories: ["İrmik", "Kakaolu"],
        used_ingredients: ["süt", "irmik", "kakao"],
      });
    }
  }

  return candidates;
}
