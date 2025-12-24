// normalize + temel kontroller
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
  return hits; // ["susam", "tahin"] gibi
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
    // tabanlar (bunlardan biri yoksa börek/pizza gibi şeyleri üretmeyiz)
    doughBases: ["yufka", "hamur", "lavaş"],

    // un bazlı hamur (kek/pankek/kurabiye)
    flour: ["un"],

    // bağlayıcılar
    eggs: ["yumurta"],
    leavening: ["kabartma tozu", "maya", "karbonat"],

    // süt ürünleri (hamur işinde opsiyonel ama bazı tariflerde gerekli)
    dairy: ["süt", "yoğurt", "tereyağı", "krema"],

    // iç malzemeler (sade yaklaşım: genişletilebilir)
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

  if (mainVeg.length === 0) return [];

  const base = {
    main_category: "Çorbalar",
    sub_categories: [
      "Sebze",
      mainVeg.length > 1 ? "Karışık" : capitalize(mainVeg[0]),
    ],
    required_ingredients: [...mainVeg],
    base_ingredients: ["su", "soğan", "sarımsak", "tuz", "karabiber"],
  };

  if (mainVeg.length === 1) {
    const v = mainVeg[0];
    const candidates = [
      {
        ...base,
        name: `${capitalize(v)} Çorbası`,
        sub_categories: ["Sebze", capitalize(v)],
      },
    ];

    if (hasCream) {
      candidates.push({
        ...base,
        name: `Kremalı ${capitalize(v)} Çorbası`,
        sub_categories: ["Sebze", capitalize(v), "Kremalı"],
        required_ingredients: [v, "krema"],
        base_ingredients: ["su", "soğan", "sarımsak", "tuz", "karabiber"],
      });
    }
    return candidates;
  }

  // 2+ sebze
  return [
    {
      ...base,
      name: hasCream ? "Kremalı Sebze Çorbası" : "Sebze Çorbası",
      sub_categories: ["Sebze", "Karışık", ...(hasCream ? ["Kremalı"] : [])],
      required_ingredients: hasCream ? [...mainVeg, "krema"] : [...mainVeg],
    },
  ];
}

export function buildPastaCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

  // HARD REQUIRED: makarna yoksa makarna önerme
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

  // tek sebze -> brokolili makarna, kremalı brokolili makarna, domatesli brokolili makarna
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

  // 2+ sebze -> sebzeli makarna, kremalı sebzeli makarna, domatesli sebzeli makarna
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

  // ❌ HARD REQUIRED: hiç bakliyat yok
  const legumesPresent = pickPresent(I, INGREDIENTS.legumes);
  if (legumesPresent.length === 0) return [];

  const hasMeat = hasAny(I, INGREDIENTS.proteins.meat);
  const hasChicken = hasAny(I, INGREDIENTS.proteins.chicken);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);
  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);

  const candidates = [];

  for (const legume of legumesPresent) {
    const cap = capitalize(legume);

    /* -----------------------------------
       1️⃣ BASE
    ----------------------------------- */
    candidates.push({
      id: `gen:LEGUME_${legume.toUpperCase()}`,
      name: `${cap} Yemeği`,
      main_category: "Bakliyat Yemekleri",
      sub_categories: [cap],
      used_ingredients: [legume],
    });

    /* -----------------------------------
       2️⃣ SALÇALI
    ----------------------------------- */
    if (hasTomato) {
      candidates.push({
        id: `gen:LEGUME_${legume.toUpperCase()}_TOMATO`,
        name: `${cap} Yemeği (Salçalı)`,
        main_category: "Bakliyat Yemekleri",
        sub_categories: [cap, "Salçalı"],
        used_ingredients: [legume, "salça"],
      });
    }

    /* -----------------------------------
       3️⃣ ZEYTİNYAĞLI
    ----------------------------------- */
    if (hasOliveOil) {
      candidates.push({
        id: `gen:LEGUME_${legume.toUpperCase()}_OLIVE`,
        name: `Zeytinyağlı ${cap}`,
        main_category: "Bakliyat Yemekleri",
        sub_categories: [cap, "Zeytinyağlı"],
        used_ingredients: [legume, "zeytinyağı"],
      });
    }

    /* -----------------------------------
       4️⃣ ETLİ
    ----------------------------------- */
    if (hasMeat) {
      candidates.push({
        id: `gen:LEGUME_${legume.toUpperCase()}_MEAT`,
        name: `Etli ${cap} Yemeği`,
        main_category: "Bakliyat Yemekleri",
        sub_categories: [cap, "Etli"],
        used_ingredients: [legume, "et"],
      });
    }

    /* -----------------------------------
       5️⃣ TAVUKLU
    ----------------------------------- */
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

  // Ana sebzeleri bul
  const mains = pickPresent(I, INGREDIENTS.vegetables.main);
  if (mains.length === 0) return []; // ❌ hard required

  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);

  const candidates = [];

  // Yardımcı: stil varyantları ekle
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

    // Fırında varyant (opsiyonel, donanım sinyali yoksa da üretilebilir)
    candidates.push({
      ...base,
      id: `${base.id}_OVEN`,
      name: `Fırında ${base.name}`,
      sub_categories: [...base.sub_categories, "Fırında"],
    });
  };

  /* --------------------------------------------------
     1️⃣ TEK ANA SEBZE
  -------------------------------------------------- */
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

  /* --------------------------------------------------
     2️⃣ 2+ ANA SEBZE → KARIŞIK
  -------------------------------------------------- */
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

  // ❌ HARD REQUIRED: et yok
  const meats = pickPresent(I, INGREDIENTS.proteins.meat);
  if (meats.length === 0) return [];

  const mains = pickPresent(I, INGREDIENTS.vegetables.main);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);
  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);

  const candidates = [];

  // stil varyant ekleyici
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

  /* --------------------------------------------------
     1️⃣ ET + TEK ANA SEBZE
  -------------------------------------------------- */
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

  /* --------------------------------------------------
     2️⃣ ET + 2+ ANA SEBZE → KARIŞIK
  -------------------------------------------------- */
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

  /* --------------------------------------------------
     3️⃣ SADE ET (SEBZE YOK)
  -------------------------------------------------- */
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

  // ❌ HARD REQUIRED: tavuk yok
  const chickens = pickPresent(I, INGREDIENTS.proteins.chicken);
  if (chickens.length === 0) return [];

  const mains = pickPresent(I, INGREDIENTS.vegetables.main);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);
  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);

  const candidates = [];

  // stil varyant ekleyici
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

  /* --------------------------------------------------
     1️⃣ TAVUK + TEK ANA SEBZE
  -------------------------------------------------- */
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

  /* --------------------------------------------------
     2️⃣ TAVUK + 2+ ANA SEBZE → KARIŞIK
  -------------------------------------------------- */
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

  /* --------------------------------------------------
     3️⃣ SADE TAVUK (SEBZE YOK)
  -------------------------------------------------- */
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

  // ❌ HARD REQUIRED: deniz ürünü yoksa önerme
  const seafoods = pickPresent(I, INGREDIENTS.proteins.seafood);
  if (seafoods.length === 0) return [];

  const mains = pickPresent(I, INGREDIENTS.vegetables.main);
  const hasTomato = hasAny(I, INGREDIENTS.styles.tomato);
  const hasOliveOil = hasAny(I, INGREDIENTS.styles.oliveOil);

  const candidates = [];

  // stil varyant ekleyici (meat/chicken ile aynı)
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

  // 1️⃣ Deniz ürünü + tek ana sebze
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

  // 2️⃣ Deniz ürünü + 2+ ana sebze → karışık
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

  // 3️⃣ Sade deniz ürünü (sebze yok)
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

  /* --------------------------------------------------
     1) BÖREK (HARD: yufka/hamur/lavaş)
  -------------------------------------------------- */
  if (hasYufkaBase) {
    // içe göre varyant
    const makeBorek = (label, usedExtra = []) => ({
      id: `gen:PASTRY_BOREK_${label.toUpperCase()}`,
      name: `${label} Börek`,
      main_category: "Hamur İşleri",
      sub_categories: ["Börek", label],
      used_ingredients: ["yufka", ...usedExtra],
    });

    if (savoryFillings.length > 0) {
      // en fazla 2 iç ile sınırlayalım (liste patlamasın)
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
      // iç yoksa sade börek
      candidates.push({
        id: "gen:PASTRY_BOREK_PLAIN",
        name: "Sade Börek",
        main_category: "Hamur İşleri",
        sub_categories: ["Börek", "Sade"],
        used_ingredients: ["yufka"],
      });
    }
  }

  /* --------------------------------------------------
     2) PİDE / PİZZA (HARD: hamur/lavaş)
     (çok sıkı required yapmıyoruz, kullanıcıda sadece hamur+peynir olabilir)
  -------------------------------------------------- */
  if (hasYufkaBase) {
    const hasTomato = hasAny(I, ["domates", "salça"]);
    const hasCheese = has(I, "peynir");

    // pizza tarzı
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

  /* --------------------------------------------------
     3) UN BAZLI (HARD: un)
     Kek / Kurabiye / Pankek
  -------------------------------------------------- */
  if (hasFlour) {
    const hasEgg = hasAny(I, INGREDIENTS.baking.eggs);
    const hasLeaven = hasAny(I, INGREDIENTS.baking.leavening);
    const hasMilk = hasAny(I, ["süt"]);
    const hasButter = hasAny(I, ["tereyağı"]);
    const hasYogurt = hasAny(I, ["yoğurt"]);

    // KEK: un + (yumurta veya kabartma) + (süt/yoğurt opsiyonel)
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

    // KURABİYE: un + (tereyağı veya yağ) (yumurta opsiyonel)
    if (hasButter || hasAny(I, ["yağ"])) {
      candidates.push({
        id: "gen:PASTRY_COOKIE",
        name: "Kurabiye",
        main_category: "Hamur İşleri",
        sub_categories: ["Kurabiye"],
        used_ingredients: ["un", ...(hasButter ? ["tereyağı"] : ["yağ"])],
      });
    }

    // PANKEK: un + süt + yumurta (daha net required)
    if (hasMilk && hasEgg) {
      candidates.push({
        id: "gen:PASTRY_PANCAKE",
        name: "Pankek",
        main_category: "Hamur İşleri",
        sub_categories: ["Pankek"],
        used_ingredients: ["un", "süt", "yumurta"],
      });
    }
  }

  return candidates;
}

export function buildMilkDessertCandidates(rawIngredients) {
  const I = normalizeList(rawIngredients);

  // ❌ HARD REQUIRED: süt yoksa sütlü tatlı yok
  if (!hasAny(I, INGREDIENTS.desserts.milkRequired)) return [];

  const hasCocoa = hasAny(I, INGREDIENTS.desserts.chocolate);
  const hasVanilla = hasAny(I, INGREDIENTS.desserts.flavors);
  const thickeners = pickPresent(I, INGREDIENTS.desserts.thickeners);

  const hasStarch = has(I, "nişasta");
  const hasRice = has(I, "pirinç");
  const hasSemolina = has(I, "irmik");

  const candidates = [];

  /* --------------------------------------------------
     1) BASE: “Sütlü Tatlı”
     (süt var ama diğer sinyaller yoksa bile en az 1 öneri çıkar)
  -------------------------------------------------- */
  candidates.push({
    id: "gen:MILK_DESSERT_BASE",
    name: "Sütlü Tatlı",
    main_category: "Sütlü Tatlılar",
    sub_categories: ["Temel"],
    used_ingredients: ["süt"],
  });

  /* --------------------------------------------------
     2) MUHALLEBİ / PUDİNG: nişasta varsa anlamlı
  -------------------------------------------------- */
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

  /* --------------------------------------------------
     3) SÜTLAÇ: pirinç varsa
  -------------------------------------------------- */
  if (hasRice) {
    candidates.push({
      id: "gen:MILK_DESSERT_SUTLAC",
      name: "Sütlaç",
      main_category: "Sütlü Tatlılar",
      sub_categories: ["Sütlaç"],
      used_ingredients: ["süt", "pirinç"],
    });

    // opsiyonel: fırında sütlaç varyantı
    candidates.push({
      id: "gen:MILK_DESSERT_SUTLAC_OVEN",
      name: "Fırın Sütlaç",
      main_category: "Sütlü Tatlılar",
      sub_categories: ["Sütlaç", "Fırında"],
      used_ingredients: ["süt", "pirinç"],
    });
  }

  /* --------------------------------------------------
     4) İRMİK TATLISI: irmik varsa
  -------------------------------------------------- */
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
