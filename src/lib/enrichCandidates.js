 
import { norm } from "@/lib/builders";  





function toArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : Array.from(v);  
}

function uniq(arr) {
  return Array.from(new Set(toArray(arr).map(norm))).filter(Boolean);
}

function has(list, item) {
  const set = new Set(toArray(list).map(norm));
  return set.has(norm(item));
}

function hasAny(list, items) {
  return toArray(items).some((x) => has(list, x));
}

function diffMissing(available, needed) {
  const a = new Set(toArray(available).map(norm));
  return toArray(needed)
    .map(norm)
    .filter((x) => !a.has(x));
}

function joinNice(arr) {
  const a = toArray(arr).filter(Boolean);
  if (a.length === 0) return "";
  if (a.length === 1) return a[0];
  return a.slice(0, -1).join(", ") + " ve " + a[a.length - 1];
}

function capTR(s) {
  const t = String(s || "");
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function getCandidateCategoryKey(candidate) {
   
  return (
    candidate.category_id ??
    candidate.category ??
    candidate.main_category ??
    candidate.mainCategory ??
    null
  );
}

function buildGenericInstructions(ings) {
  const shown = ings.slice(0, 6);
  return [
    `Malzemeleri hazırla: ${shown.join(", ")}${ings.length > 6 ? "..." : ""}`,
    "Uygun bir pişirme yöntemi seç (sote/haşlama/fırın) ve ana malzemeyi pişirmeye başla.",
    "Baharat ve sosları ekle, kıvam ve tuzu ayarla.",
    "Servis et.",
  ];
}





const BASE_BY_CATEGORY = {
  Çorbalar: ["su", "soğan", "sarımsak", "tuz", "karabiber"],
  Makarna: ["su", "tuz", "zeytinyağı"],
  "Bakliyat Yemekleri": ["soğan", "sarımsak", "tuz", "karabiber"],
  "Sebze Yemekleri": ["soğan", "sarımsak", "tuz", "karabiber"],
  "Et Yemekleri": ["soğan", "sarımsak", "tuz", "karabiber"],
  "Tavuk Yemekleri": ["soğan", "sarımsak", "tuz", "karabiber"],
  "Hamur İşleri": ["tuz"],
  "Sütlü Tatlılar": ["şeker"],
};

const CREAMY_ITEMS = ["krema", "süt", "yoğurt"].map(norm);
const TOMATO_ITEMS = ["domates", "salça"].map(norm);





function buildSoupInstructions(c) {
  const req = c.required_ingredients ?? [];
  const base = c.base_ingredients ?? [];

  const creamy = hasAny(req, ["krema", "süt", "yoğurt"]);
  const vegs = req.filter((x) => !CREAMY_ITEMS.includes(norm(x)));

  const steps = [];
  if (has(base, "soğan")) steps.push("Soğanı küçük küçük doğra.");
  if (has(base, "sarımsak")) steps.push("Sarımsağı ez veya ince kıy.");

  if (vegs.length) {
    steps.push(`${joinNice(vegs.map(capTR))} malzemelerini doğra.`);
  }

  steps.push("Tencerede soğan/sarımsağı kısa süre kavur (isteğe bağlı).");
  if (vegs.length) steps.push("Sebzeleri ekleyip 2-3 dakika çevir.");
  steps.push(
    "Üzerini geçecek kadar su ekle ve sebzeler yumuşayana kadar pişir."
  );
  steps.push("Blender ile pürüzsüz hale getir.");
  if (creamy)
    steps.push("Krema/süt/yoğurt ekleyip 2-3 dakika daha ısıt (kaynatmadan).");
  steps.push("Tuz-karabiber ile tatlandır, sıcak servis et.");

  return {
    time: { prepMin: 10, cookMin: 20 },
    tips: [
      "Kıvamı ayarlamak için suyu kontrollü ekle.",
      "Yoğurt eklersen kesilmemesi için ılıştırarak ekle.",
    ],
    instructions: steps,
  };
}

function buildPastaInstructions(c) {
  const req = c.required_ingredients ?? [];
  const creamy = hasAny(req, ["krema", "süt", "yoğurt"]);
  const tomato = hasAny(req, ["domates", "salça"]);

  const vegs = req.filter(
    (x) =>
      !["makarna", "krema", "süt", "yoğurt", "domates", "salça"]
        .map(norm)
        .includes(norm(x))
  );

  const steps = [];
  steps.push("Bir tencerede suyu kaynat, tuz ekle.");
  steps.push("Makarnayı ekle ve al dente kıvamda haşla.");

   
  if (vegs.length) {
    steps.push(`${joinNice(vegs.map(capTR))} malzemelerini tavada sotele.`);
  }

  steps.push("Sosu oluşturmak için tavaya biraz zeytinyağı ekle.");
  if (tomato) steps.push("Domates/salça ekleyip 2-3 dakika pişir.");
  if (creamy) steps.push("Krema/süt/yoğurt ekleyip kısık ateşte sosu bağla.");
  steps.push("Makarnayı süzüp tavaya al, sosla iyice karıştır.");
  steps.push("Sıcak servis et.");

  return {
    time: { prepMin: 10, cookMin: 15 },
    tips: [
      "Sosu bağlamak için haşlama suyundan 1 kepçe ekleyebilirsin.",
      "Kremalıysa kaynatma; kısık ateş daha iyi.",
    ],
    instructions: steps,
  };
}

function buildLegumeInstructions(c) {
  const req = c.required_ingredients ?? [];
  const base = c.base_ingredients ?? [];

  const hasMeat = hasAny(req, ["et", "kıyma"]);
  const hasChicken = has(req, "tavuk");
  const tomato = hasAny(req, ["domates", "salça"]);
  const olive = has(req, "zeytinyağı");

  const excluded = [
    "et",
    "kıyma",
    "tavuk",
    "salça",
    "domates",
    "zeytinyağı",
  ].map(norm);
  const legume = req.find((x) => !excluded.includes(norm(x)));  

  const steps = [];
  if (has(base, "soğan")) steps.push("Soğanı doğra.");
  if (has(base, "sarımsak")) steps.push("Sarımsağı ince kıy.");

  if (hasMeat)
    steps.push("Eti/kıymayı tencerede suyunu salıp çekene kadar kavur.");
  else if (hasChicken) steps.push("Tavuğu küp doğrayıp hafifçe sotele.");

  if (has(base, "soğan")) steps.push("Soğanı ekleyip pembeleştir.");
  if (tomato) steps.push("Salça/domates ekleyip 1-2 dakika kavur.");

   
  if (legume) {
    steps.push(
      `${capTR(legume)} ekle (önceden ıslatılması gerekiyorsa ıslat).`
    );
  } else {
    steps.push("Bakliyatı ekle (önceden ıslatılması gerekiyorsa ıslat).");
  }

  steps.push("Üzerini geçecek kadar su ekle ve kısık ateşte pişir.");
  if (olive) steps.push("Zeytinyağı ile son dokunuş yap (servisten önce).");
  steps.push("Tuz-karabiber ile tatlandır, dinlendirip servis et.");

  return {
    time: { prepMin: 10, cookMin: 35 },
    tips: [
      "Nohut/fasulye için önceden ıslatma lezzet ve süreyi iyileştirir.",
      "Kıvam koyulaşınca su ekleyerek ayarlayabilirsin.",
    ],
    instructions: steps,
  };
}

function buildVegetableDishInstructions(c) {
  const req = c.required_ingredients ?? [];
  const base = c.base_ingredients ?? [];

  const tomato = hasAny(req, ["domates", "salça"]);
  const olive = has(req, "zeytinyağı");
  const oven = (c.sub_categories ?? []).some((x) => norm(x) === "fırında");

  const mains = req.filter(
    (x) => !["salça", "domates", "zeytinyağı"].map(norm).includes(norm(x))
  );

  const steps = [];
  if (has(base, "soğan")) steps.push("Soğanı doğra.");
  if (has(base, "sarımsak")) steps.push("Sarımsağı ince kıy.");
  if (mains.length)
    steps.push(`${joinNice(mains.map(capTR))} malzemelerini hazırla (doğra).`);

  steps.push("Tencerede soğan/sarımsağı kavur.");
  if (tomato) steps.push("Salça/domates ekleyip 1-2 dakika pişir.");
  if (mains.length) steps.push("Sebzeleri ekleyip birkaç dakika çevir.");
  if (olive) steps.push("Zeytinyağı ekle.");

  if (oven) {
    steps.push(
      "Fırın kabına al, az su ekle ve 180°C’de sebzeler yumuşayana kadar pişir."
    );
  } else {
    steps.push("Az su ekleyip kapağı kapalı şekilde yumuşayana kadar pişir.");
  }

  steps.push("Tuz-karabiber ile tatlandır, servis et.");

  return {
    time: { prepMin: 15, cookMin: oven ? 35 : 25 },
    tips: ["Fırında versiyonda üzerine çok az zeytinyağı gezdirebilirsin."],
    instructions: steps,
  };
}

function buildMeatDishInstructions(c) {
  const req = c.required_ingredients ?? [];
  const base = c.base_ingredients ?? [];

  const tomato = hasAny(req, ["domates", "salça"]);
  const oven = (c.sub_categories ?? []).some((x) => norm(x) === "fırında");
  const hasMeat = hasAny(req, ["et", "kıyma"]);

  const vegs = req.filter(
    (x) => !["et", "kıyma", "salça", "domates"].map(norm).includes(norm(x))
  );

  const steps = [];
  if (hasMeat)
    steps.push("Eti (veya kıymayı) tencerede suyunu salıp çekene kadar kavur.");
  if (has(base, "soğan")) steps.push("Soğanı ekleyip pembeleştir.");
  if (has(base, "sarımsak"))
    steps.push("Sarımsağı ekleyip kokusu çıkana kadar çevir.");
  if (tomato) steps.push("Salça/domates ekleyip 1-2 dakika kavur.");
  if (vegs.length)
    steps.push(`${joinNice(vegs.map(capTR))} ekleyip birkaç dakika çevir.`);

  if (oven) {
    steps.push("Fırın kabına al, az su ekle ve 180°C’de pişir.");
  } else {
    steps.push("Az su ekleyip kısık ateşte et yumuşayana kadar pişir.");
  }

  steps.push("Tuz-karabiber ile tatlandır, dinlendirip servis et.");

  return {
    time: { prepMin: 15, cookMin: oven ? 50 : 45 },
    tips: ["Etin daha yumuşak olması için kısık ateş ve sabır 👌"],
    instructions: steps,
  };
}

function buildChickenDishInstructions(c) {
  const req = c.required_ingredients ?? [];
  const base = c.base_ingredients ?? [];

  const tomato = hasAny(req, ["domates", "salça"]);
  const oven = (c.sub_categories ?? []).some((x) => norm(x) === "fırında");

  const vegs = req.filter(
    (x) => !["tavuk", "salça", "domates"].map(norm).includes(norm(x))
  );

  const steps = [];
  steps.push("Tavuğu doğra ve tavada hafifçe mühürle.");
  if (has(base, "soğan")) steps.push("Soğanı ekleyip sotele.");
  if (has(base, "sarımsak")) steps.push("Sarımsağı ekleyip 30 sn çevir.");
  if (tomato) steps.push("Salça/domates ekleyip 1-2 dakika pişir.");
  if (vegs.length)
    steps.push(`${joinNice(vegs.map(capTR))} ekleyip birkaç dakika çevir.`);

  if (oven) {
    steps.push("Fırın kabına alıp 190°C’de pişir.");
  } else {
    steps.push("Az su ekleyip kapağı kapalı şekilde pişir.");
  }

  steps.push("Tuz-karabiber ile tatlandır, servis et.");

  return {
    time: { prepMin: 12, cookMin: oven ? 35 : 25 },
    tips: ["Tavuk çabuk kurur; yüksek ateşte uzun süre bırakma."],
    instructions: steps,
  };
}

function buildPastryInstructions(c) {
  const isBorek = (c.sub_categories ?? []).some((x) => norm(x) === "börek");
  const isPizza = (c.sub_categories ?? []).some((x) => norm(x) === "pizza");
  const isCake = (c.sub_categories ?? []).some((x) => norm(x) === "kek");
  const isCookie = (c.sub_categories ?? []).some((x) => norm(x) === "kurabiye");
  const isPancake = (c.sub_categories ?? []).some((x) => norm(x) === "pankek");
  const isWaffle = (c.sub_categories ?? []).some((x) => norm(x) === "waffle");

  console.log({ isWaffle });
  if (isBorek) {
    const steps = [
      "İç harcı hazırla (peynir/patates/ıspanak vb.).",
      "Yufkayı ser, içi yerleştir ve rulo/sigara şeklinde sar.",
      "Üzerine az yağ sür.",
      "180°C fırında üzeri kızarana kadar pişir.",
    ];
    return {
      time: { prepMin: 20, cookMin: 30 },
      tips: ["İç harcı sulu olmasın."],
      instructions: steps,
    };
  }

  if (isPizza) {
    const steps = [
      "Hamuru aç ve tepsiye yerleştir.",
      "Domates sosu (varsa) sür, peynir ve diğer malzemeleri ekle.",
      "200°C fırında kenarlar kızarana kadar pişir.",
      "Dilimleyip servis et.",
    ];
    return {
      time: { prepMin: 20, cookMin: 15 },
      tips: ["Fırını önceden ısıt."],
      instructions: steps,
    };
  }

  if (isCake) {
    const steps = [
      "Kuru malzemeleri (un + kabartma) ayrı karıştır.",
      "Yumurta (varsa) ve sıvıları karıştırıp kuru karışıma ekle.",
      "Kalıba dök.",
      "170°C fırında pişir (kürdan testi yap).",
    ];
    return {
      time: { prepMin: 15, cookMin: 35 },
      tips: ["Karışımı fazla çırpma; kabarıklık azalır."],
      instructions: steps,
    };
  }

  if (isCookie) {
    const steps = [
      "Un ve yağı/tereyağını karıştırıp hamur yap.",
      "İstersen tatlandırıcı ekle (şeker/bal).",
      "Şekil verip tepsiye diz.",
      "170°C fırında hafif pembeleşene kadar pişir.",
    ];
    return {
      time: { prepMin: 15, cookMin: 15 },
      tips: ["Fırından çıkınca 5 dk tepside dinlendir."],
      instructions: steps,
    };
  }

  if (isPancake) {
    const steps = [
      "Un, süt ve yumurtayı çırp.",
      "Tavayı hafif yağla ve ısıt.",
      "Hamuru kepçeyle dök, iki yüzünü pişir.",
      "Sıcak servis et.",
    ];
    return {
      time: { prepMin: 10, cookMin: 10 },
      tips: ["Tava çok kızgın olmasın; dışı yanar."],
      instructions: steps,
    };
  }

  if (isWaffle) {
    const steps = [
      "Waffle hamurunu hazırla (un + süt + yumurta; kabartma tozu varsa ekle).",
      "Waffle makinesini ısıt ve çok az yağla.",
      "Hamuru dök, kapağı kapat ve altın rengi olana kadar pişir.",
      "Üzerine meyve (muz/çilek vb.) ve istersen çikolata/bal ekleyip servis et.",
    ];
    return {
      time: { prepMin: 10, cookMin: 8 },
      tips: [
        "Makine tam ısınmadan hamuru dökme; yapışabilir.",
        "Hamuru fazla koyma; taşar.",
      ],
      instructions: steps,
    };
  }

  return {
    time: { prepMin: 15, cookMin: 25 },
    tips: ["Temel hamur tekniği ile ilerleyebilirsin."],
    instructions: [
      "Malzemeleri hazırla.",
      "Hamuru oluştur.",
      "Pişir ve servis et.",
    ],
  };
}

export function buildSeafoodDishInstructions(ingredients = []) {
  const hasTomato = ingredients.some((i) => ["domates", "salça"].includes(i));
  const hasOliveOil = ingredients.includes("zeytinyağı");
  const hasOnion = ingredients.includes("soğan");
  const hasGarlic = ingredients.includes("sarımsak");

  const steps = [];

  steps.push("Deniz ürünlerini temizleyip yıkayın, fazla suyunu süzdürün.");

  if (hasOliveOil) {
    steps.push("Geniş bir tavada zeytinyağını ısıtın.");
  } else {
    steps.push("Geniş bir tavayı orta ateşte ısıtın.");
  }

  if (hasOnion) {
    steps.push("Soğanı doğrayıp tavada yumuşayana kadar kavurun.");
  }

  if (hasGarlic) {
    steps.push("Sarımsağı ekleyip kokusu çıkana kadar kısa süre çevirin.");
  }

  if (hasTomato) {
    steps.push(
      "Domates veya salçayı ekleyip birkaç dakika pişirerek sosu hazırlayın."
    );
  }

  steps.push(
    "Deniz ürünlerini tavaya ekleyin ve yüksek ateşte kısa süre pişirin."
  );
  steps.push(
    "Tuz ve baharatları ekleyip karıştırın, fazla pişirmeden ocaktan alın."
  );
  steps.push("Sıcak olarak servis edin.");

  return steps;
}

function buildMilkDessertInstructions(c) {
  const req = c.required_ingredients ?? [];

  const hasStarch = has(req, "nişasta");
  const hasRice = has(req, "pirinç");
  const hasSemolina = has(req, "irmik");
  const cocoa = hasAny(req, ["kakao", "çikolata"]);

  if (hasRice) {
    const steps = [
      "Pirinçleri yıkayıp az suyla yumuşayana kadar haşla.",
      "Sütü ekle ve kısık ateşte karıştırarak pişir.",
      "Şeker ekleyip 5 dk daha pişir.",
      "Kaselere al, soğutup servis et (istersen fırınla üzerini kızart).",
    ];
    return {
      time: { prepMin: 10, cookMin: 35 },
      tips: ["Dibi tutmaması için ara ara karıştır."],
      instructions: steps,
    };
  }

  if (hasSemolina) {
    const steps = [
      "Sütü tencereye al ve ısıt.",
      "İrmiği ekleyip sürekli karıştırarak koyulaştır.",
      "Şeker ekleyip 2-3 dk daha pişir.",
      "Kaselere al, soğutup servis et.",
    ];
    if (cocoa)
      steps.splice(2, 0, "Kakao ekleyip topak kalmayacak şekilde karıştır.");
    return {
      time: { prepMin: 5, cookMin: 15 },
      tips: ["Topaklanmayı önlemek için sürekli karıştır."],
      instructions: steps,
    };
  }

  if (hasStarch) {
    const steps = [
      "Sütü tencereye al.",
      "Nişastayı az sütle açıp tencereye ekle.",
      "Kısık ateşte sürekli karıştırarak koyulaştır.",
      "Şeker ekleyip 2-3 dk daha pişir.",
      "Kaselere al, soğutup servis et.",
    ];
    if (cocoa) steps.splice(2, 0, "Kakao ekleyip iyice karıştır.");
    return {
      time: { prepMin: 5, cookMin: 12 },
      tips: ["Sürekli karıştırmak dibi tutmayı önler."],
      instructions: steps,
    };
  }

  return {
    time: { prepMin: 5, cookMin: 10 },
    tips: ["Elindeki kıvam vericilere göre muhallebi/puding’e çevirebilirsin."],
    instructions: [
      "Sütü ısıt.",
      "Tatlandırıcı ekle (şeker/bal).",
      "Kıvam verici varsa ekleyip koyulaştır.",
      "Soğutup servis et.",
    ],
  };
}





function buildInstructionsByCategory(candidate) {
  const catRaw = candidate.main_category;
  const cat = norm(catRaw);

   
  if (cat === norm("Çorbalar")) return buildSoupInstructions(candidate);
  if (cat === norm("Makarna")) return buildPastaInstructions(candidate);
  if (cat === norm("Bakliyat Yemekleri"))
    return buildLegumeInstructions(candidate);
  if (cat === norm("Sebze Yemekleri"))
    return buildVegetableDishInstructions(candidate);
  if (cat === norm("Et Yemekleri")) return buildMeatDishInstructions(candidate);
  if (cat === norm("Tavuk Yemekleri"))
    return buildChickenDishInstructions(candidate);
  if (cat === norm("Hamur İşleri")) return buildPastryInstructions(candidate);
  if (cat === norm("Sütlü Tatlılar"))
    return buildMilkDessertInstructions(candidate);

  return {
    time: { prepMin: 10, cookMin: 20 },
    tips: [],
    instructions: ["Malzemeleri hazırla.", "Pişir.", "Servis et."],
  };
}

export const INSTRUCTION_BUILDERS = {
  SOUP: buildSoupInstructions,
  PASTA: buildPastaInstructions,
  MEAT_DISH: buildMeatDishInstructions,
  CHICKEN_DISH: buildChickenDishInstructions,
  LEGUME_DISH: buildLegumeInstructions,
  VEGETABLE_DISH: buildVegetableDishInstructions,
  SEAFOOD_DISH: buildSeafoodDishInstructions,
  PASTRY: buildPastryInstructions,
  MILK_DESSERT: buildMilkDessertInstructions,
};

export function enrichCandidate(candidate, userIngredients = []) {
  const available = uniq(userIngredients);

  const required = uniq(
    candidate.required_ingredients ?? candidate.used_ingredients ?? []
  );
  const base = uniq(
    candidate.base_ingredients ??
      BASE_BY_CATEGORY[candidate.main_category] ??
      []
  );
  const optional = uniq(candidate.optional_ingredients ?? []);

  const insPack = buildInstructionsByCategory({
    ...candidate,
    required_ingredients: required,
    base_ingredients: base,
    optional_ingredients: optional,
  });

  return {
    ...candidate,
    available_ingredients: available,
    required_ingredients: required,
    base_ingredients: base,
    optional_ingredients: optional,
    missing_required: diffMissing(available, required),
    missing_base: diffMissing(available, base),
    instructions: insPack.instructions,
    tips: insPack.tips ?? [],
    time: insPack.time ?? null,
  };
}
