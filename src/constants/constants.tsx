export const categoriesSet = [
  { id: 1, name: "Ana Yemekler", image: "/assets/main-dishes.webp" },
  { id: 2, name: "Tatlılar", image: "/assets/desserts.webp" },
  { id: 3, name: "Salatalar", image: "/assets/salads.webp" },
  { id: 4, name: "Çorbalar", image: "/assets/soups.webp" },
  { id: 5, name: "Kahvaltılıklar", image: "/assets/breakfast.webp" },
  { id: 8, name: "Hamur İşleri", image: "/assets/pastries.webp" },
  { id: 9, name: "Vejetaryen", image: "/assets/vegetarian.webp" },
  { id: 11, name: "Glutensiz", image: "/assets/gluten-free.webp" },
  { id: 12, name: "Diyet Yemekler", image: "/assets/diet.webp" },
  { id: 14, name: "Deniz Ürünleri", image: "/assets/seafood.webp" },
  { id: 15, name: "Et Yemekleri", image: "/assets/meat-dishes.webp" },
  { id: 16, name: "Dünya Mutfağı", image: "/assets/world-cuisine.webp" },
  { id: 17, name: "Tavuk Yemekleri", image: "/assets/chicken-dishes.webp" },
  { id: 18, name: "Zeytinyağlılar", image: "/assets/olive-oil-dishes.webp" },
  { id: 19, name: "Atıştırmalıklar", image: "/assets/snacks.webp" },
  { id: 20, name: "Baklagil Yemekleri", image: "/assets/legumes.webp" },
];

export const CATEGORY_OPTIONS = [
  "Çorbalar",
  "Zeytinyağlılar",
  "Ana Yemekler",
  "Tatlılar",
  "Salatalar",
  "Atıştırmalıklar",
  "Et Yemekleri",
  "Tavuk Yemekleri",
  "Hamur İşleri",
  "Baklagil Yemekleri",
  "Kahvaltılıklar",
  "Diyet Yemekler",
  "Dünya Mutfağı",
  "Glutensiz",
  "Vejetaryen",
  "Deniz Ürünleri",
];

export const DEFAULT_TOP = [
  "Ana Yemekler",
  "Çorbalar",
  "Tatlılar",
  "Atıştırmalıklar",
];

export const DIET_BONUS_MAP = {
  vegan: [
    "Vejetaryen",
    "Diyet Yemekler",
    "Zeytinyağlılar",
    "Salatalar",
    "Baklagil Yemekleri",
    "Çorbalar",
  ],
  vejetaryen: [
    "Vejetaryen",
    "Diyet Yemekler",
    "Zeytinyağlılar",
    "Salatalar",
    "Baklagil Yemekleri",
    "Çorbalar",
  ],
  glütensiz: [
    "Glutensiz",
    "Diyet Yemekler",
    "Çorbalar",
    "Ana Yemekler",
    "Salatalar",
    "Zeytinyağlılar",
  ],
  laktozsuz: ["Diyet Yemekler", "Ana Yemekler", "Salatalar", "Çorbalar"],
  ketojenik: ["Et Yemekleri", "Tavuk Yemekleri", "Salatalar", "Ana Yemekler"],
};

// Diyet -> “çelişen” kategoriler (göstermeyelim)
export const DIET_BLOCK_MAP = {
  vegan: ["Et Yemekleri", "Tavuk Yemekleri", "Deniz Ürünleri"],
  vejetaryen: ["Et Yemekleri", "Tavuk Yemekleri", "Deniz Ürünleri"],
  glütensiz: ["Hamur İşleri"],
  ketojenik: ["Tatlılar", "Hamur İşleri"],
};

// Alerjen -> kategori bloklama (minimal)
// (Senin category listende spesifik “Deniz ürünleri” yok; o yüzden çok hafif tutuyoruz.)
export const ALLERGEN_BLOCK_KEYWORDS = [
  {
    keywords: ["balık", "somon", "karides", "midye", "kalamar"],
    block: ["Deniz Ürünleri"],
  }, // şimdilik kategori blok yok
  { keywords: ["gluten", "buğday", "un"], block: ["Hamur İşleri"] }, // intolerans varsa hamur işi düşsün
];

export const ALLERGEN_OPTIONS = [
  "süt",
  "yoğurt",
  "peynir",
  "tereyağı",
  "krema",
  "yumurta",
  "fındık",
  "ceviz",
  "badem",
  "fıstık",
  "kaju",
  "susam",
  "tahin",
  "balık",
  "karides",
  "midye",
  "kalamar",
];

export const DIET_OPTIONS = [
  "vegan",
  "vejetaryen",
  "glütensiz",
  "laktozsuz",
  "ketojenik",
];
