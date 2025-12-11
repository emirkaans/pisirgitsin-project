export const MAIN_CATEGORIES = [
  {
    id: "SOUP",
    label: "Çorbalar",
    subcategories: [
      {
        id: "VEGETABLE_SOUP",
        label: "Sebze Çorbaları",
        recipe: {
          id: "base_vegetable_soup",
          mainCategory: "SOUP",
          subCategory: "VEGETABLE_SOUP",
          displayName: "Base Sebze Çorbası",
          nameTemplate: ({ mainIngredient, hasCream }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return (hasCream ? "Kremalı " : "") + cap + " Çorbası";
          },
          baseIngredients: ["soğan", "sıvı yağ", "tuz", "karabiber", "su"],
          steps: ({ mainIngredient, hasCream }) => {
            const steps = [
              `${mainIngredient} küçük parçalar halinde doğranır.`,
              "Soğan yemeklik doğranır.",
              "Tencereye sıvı yağ alınır, soğanlar pembeleşene kadar kavrulur.",
              `${mainIngredient} eklenir ve birkaç dakika kavrulur.`,
              "Üzerini geçecek kadar su eklenir ve sebzeler yumuşayana kadar pişirilir.",
            ];
            if (hasCream) steps.push("Krema eklenir ve karıştırılır.");
            steps.push("Tuz ve karabiber eklenir, blenderdan geçirilebilir.");
            steps.push("Sıcak servis edilir.");
            return steps;
          },
        },
      },
      {
        id: "LEGUME_SOUP",
        label: "Bakliyat Çorbaları",
        recipe: {
          id: "base_legume_soup",
          mainCategory: "SOUP",
          subCategory: "LEGUME_SOUP",
          displayName: "Base Bakliyat Çorbası",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Çorbası";
          },
          baseIngredients: ["soğan", "sıvı yağ", "tuz", "karabiber", "su"],
          steps: ({ mainIngredient }) => [
            `${mainIngredient} yıkanır ve süzülür.`,
            "Soğan doğranır ve yağda kavrulur.",
            `${mainIngredient} eklenir, birkaç dakika kavrulur.`,
            "Üzerini geçecek kadar su eklenir, bakliyatlar yumuşayana kadar pişirilir.",
            "Tuz ve karabiber eklenir.",
            "İsteğe göre blenderdan geçirilir.",
            "Servis edilir.",
          ],
        },
      },
      {
        id: "CHICKEN_SOUP",
        label: "Tavuklu Çorbalar",
        recipe: {
          id: "base_chicken_soup",
          mainCategory: "SOUP",
          subCategory: "CHICKEN_SOUP",
          displayName: "Base Tavuk Çorbası",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Tavuk Çorbası";
          },
          baseIngredients: ["tavuk suyu", "tuz", "karabiber", "un"],
          steps: ({ mainIngredient }) => [
            `${mainIngredient} doğranır.`,
            "Tencereye tavuk suyu alınır.",
            `${mainIngredient} eklenir ve pişirilir.`,
            "Un ile terbiye hazırlanır, çorbaya eklenir.",
            "Tuz ve karabiber ile tatlandırılır.",
            "Servis edilir.",
          ],
        },
      },
      {
        id: "MEAT_SOUP",
        label: "Etli Çorbalar",
        recipe: {
          id: "base_meat_soup",
          mainCategory: "SOUP",
          subCategory: "MEAT_SOUP",
          displayName: "Base Etli Çorba",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Çorbası";
          },
          baseIngredients: [
            "kuşbaşı et",
            "soğan",
            "sıvı yağ",
            "tuz",
            "karabiber",
            "su",
          ],
          steps: ({ mainIngredient }) => [
            `${mainIngredient} küçük parçalara doğranır.`,
            "Soğan yemeklik doğranır.",
            "Tencereye yağ alınır, soğan kavrulur.",
            `${mainIngredient} eklenir ve rengi dönene kadar kavrulur.`,
            "Üzerini geçecek kadar su eklenir.",
            "Etler yumuşayana kadar pişirilir.",
            "Tuz ve karabiber eklenir.",
            "Dilerseniz erişte veya şehriye eklenebilir.",
            "Servis edilir.",
          ],
        },
      },
      {
        id: "SEAFOOD_SOUP",
        label: "Deniz Ürünlü Çorbalar",
        recipe: {
          id: "base_seafood_soup",
          mainCategory: "SOUP",
          subCategory: "SEAFOOD_SOUP",
          displayName: "Base Deniz Ürünlü Çorba",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Çorbası";
          },
          baseIngredients: [
            "soğan",
            "kereviz",
            "havuç",
            "tereyağı",
            "tuz",
            "karabiber",
            "balık suyu",
          ],
          steps: ({ mainIngredient }) => [
            "Soğan, kereviz ve havuç küçük doğranır.",
            "Tereyağı eritilir ve sebzeler kavrulur.",
            `${mainIngredient} eklenir ve birkaç dakika pişirilir.`,
            "Balık suyu eklenir ve kaynamaya bırakılır.",
            "Tuz ve karabiber eklenir.",
            "Dilerseniz krema eklenerek çorba zenginleştirilebilir.",
            "Servis edilir.",
          ],
        },
      },
    ],
  },
  {
    id: "LEGUME_DISH",
    label: "Bakliyat Yemekleri",
    subcategories: [
      {
        id: "PLAIN_LEGUME_DISH",
        label: "Etsiz Bakliyat Yemekleri",
        recipe: {
          id: "base_plain_legume_dish",
          mainCategory: "LEGUME_DISH",
          subCategory: "PLAIN_LEGUME_DISH",
          displayName: "Base Etsiz Bakliyat Yemeği",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Yemeği";
          },

          baseIngredients: [
            "soğan",
            "zeytinyağı",
            "salça",
            "tuz",
            "karabiber",
            "su",
          ],

          steps: ({ mainIngredient }) => [
            "Soğan yemeklik doğranır.",
            "Tencereye zeytinyağı alınır ve soğanlar pembeleşene kadar kavrulur.",
            "Salça eklenir, kokusu çıkana kadar karıştırılır.",
            `${mainIngredient} yıkanır ve tencereye eklenir.`,
            "Bir süre kavrulduktan sonra su eklenir.",
            "Bakliyatlar yumuşayana kadar kısık ateşte pişirilir.",
            "Tuz ve karabiber eklenir.",
            "Bir süre dinlendirilip servis edilir.",
          ],
        },
      },
      {
        id: "MEATY_LEGUME_DISH",
        label: "Etli Bakliyat Yemekleri",
        recipe: {
          id: "base_meaty_legume_dish",
          mainCategory: "LEGUME_DISH",
          subCategory: "MEATY_LEGUME_DISH",
          displayName: "Base Etli Bakliyat Yemeği",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return "Etli " + cap + " Yemeği";
          },

          baseIngredients: [
            "kuşbaşı et",
            "soğan",
            "sıvı yağ",
            "salça",
            "tuz",
            "karabiber",
            "su",
          ],

          steps: ({ mainIngredient }) => [
            "Soğan doğranır ve tencerede yağ ile kavrulur.",
            "Kuşbaşı et eklenir ve rengi dönene kadar kavrulur.",
            "Salça eklenir, birkaç dakika karıştırılır.",
            `${mainIngredient} yıkanarak tencereye eklenir.`,
            "Malzemelerin üzerine su eklenir.",
            "Et ve bakliyatlar tamamen yumuşayana kadar pişirilir.",
            "Tuz ve karabiber eklenir.",
            "Dinlendirilerek servis edilir.",
          ],
        },
      },
      {
        id: "CHICKEN_LEGUME_DISH",
        label: "Tavuklu Bakliyat Yemekleri",
        recipe: {
          id: "base_chicken_legume_dish",
          mainCategory: "LEGUME_DISH",
          subCategory: "CHICKEN_LEGUME_DISH",
          displayName: "Base Tavuklu Bakliyat Yemeği",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return "Tavuklu " + cap + " Yemeği";
          },

          baseIngredients: [
            "tavuk eti",
            "soğan",
            "sıvı yağ",
            "salça",
            "tuz",
            "karabiber",
            "su",
          ],

          steps: ({ mainIngredient }) => [
            "Soğan yemeklik doğranır ve yağ ile kavrulur.",
            "Tavuk eti eklenir ve rengi dönene kadar kavrulur.",
            "Salça eklenir ve karıştırılır.",
            `${mainIngredient} yıkanarak eklenir.`,
            "Üzerine su eklenir ve tüm malzemeler yumuşayana kadar pişirilir.",
            "Tuz ve karabiber ile tatlandırılır.",
            "Dinlendirilerek servis edilir.",
          ],
        },
      },
    ],
  },
  {
    id: "VEGETABLE_DISH",
    label: "Sebze Yemekleri",
    subcategories: [
      {
        id: "PLAIN_VEGETABLE_DISH",
        label: "Sebzeli (Etsiz) Yemekler",
        recipe: {
          id: "base_plain_vegetable_dish",
          mainCategory: "VEGETABLE_DISH",
          subCategory: "PLAIN_VEGETABLE_DISH",
          displayName: "Base Etsiz Sebze Yemeği",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Yemeği";
          },
          baseIngredients: [
            "soğan",
            "zeytinyağı",
            "salça",
            "tuz",
            "karabiber",
            "su",
          ],
          steps: ({ mainIngredient }) => [
            "Soğan yemeklik doğranır.",
            "Tencereye zeytinyağı alınır ve soğanlar pembeleşene kadar kavrulur.",
            "Salça eklenir, kokusu çıkana kadar karıştırılır.",
            `${mainIngredient} doğranarak tencereye eklenir.`,
            "Kısa süre kavrulduktan sonra su eklenir.",
            "Sebzeler yumuşayana kadar kısık ateşte pişirilir.",
            "Tuz ve karabiber eklenir.",
            "Dinlendirilerek servis edilir.",
          ],
        },
      },
      {
        id: "MEATY_VEGETABLE_DISH",
        label: "Etli Sebze Yemekleri",
        recipe: {
          id: "base_meaty_vegetable_dish",
          mainCategory: "VEGETABLE_DISH",
          subCategory: "MEATY_VEGETABLE_DISH",
          displayName: "Base Etli Sebze Yemeği",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return "Etli " + cap + " Yemeği";
          },
          baseIngredients: [
            "kuşbaşı et",
            "soğan",
            "sıvı yağ",
            "salça",
            "tuz",
            "karabiber",
            "su",
          ],
          steps: ({ mainIngredient }) => [
            "Soğan yemeklik doğranır.",
            "Tencereye yağ alınır, soğanlar pembeleşene kadar kavrulur.",
            "Kuşbaşı et eklenir ve rengi dönene kadar kavrulur.",
            "Salça eklenir ve birkaç dakika daha kavrulur.",
            `${mainIngredient} doğranarak tencereye eklenir.`,
            "Kısa süre karıştırılır ve üzerine su eklenir.",
            "Et ve sebzeler yumuşayana kadar kısık ateşte pişirilir.",
            "Tuz ve karabiber eklenir.",
            "Dinlendirildikten sonra servis edilir.",
          ],
        },
      },
      {
        id: "CHICKEN_VEGETABLE_DISH",
        label: "Tavuklu Sebze Yemekleri",
        recipe: {
          id: "base_chicken_vegetable_dish",
          mainCategory: "VEGETABLE_DISH",
          subCategory: "CHICKEN_VEGETABLE_DISH",
          displayName: "Base Tavuklu Sebze Yemeği",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return "Tavuklu " + cap + " Yemeği";
          },
          baseIngredients: [
            "tavuk eti",
            "soğan",
            "sıvı yağ",
            "salça",
            "tuz",
            "karabiber",
            "su",
          ],
          steps: ({ mainIngredient }) => [
            "Soğan yemeklik doğranır.",
            "Tencereye yağ alınır, soğanlar kavrulur.",
            "Doğranmış tavuk eti eklenir ve rengi dönene kadar kavrulur.",
            "Salça eklenir ve birkaç dakika karıştırılır.",
            `${mainIngredient} doğranarak tencereye eklenir.`,
            "Kısaca kavrulduktan sonra su eklenir.",
            "Tavuk ve sebzeler yumuşayana kadar pişirilir.",
            "Tuz ve karabiber ile tatlandırılır.",
            "Dinlendirilerek servis edilir.",
          ],
        },
      },
      {
        id: "BAKED_VEGETABLE_DISH",
        label: "Fırın Sebze / Gratin",
        recipe: {
          id: "base_baked_vegetable_dish",
          mainCategory: "VEGETABLE_DISH",
          subCategory: "BAKED_VEGETABLE_DISH",
          displayName: "Base Fırın Sebze Yemeği",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return "Fırında " + cap;
          },
          baseIngredients: [
            "zeytinyağı",
            "tuz",
            "karabiber",
            "isteğe bağlı kaşar peyniri",
          ],
          steps: ({ mainIngredient }) => [
            `${mainIngredient} dilimlenir veya uygun büyüklükte doğranır.`,
            "Fırın kabı hafifçe yağlanır.",
            `${mainIngredient} fırın kabına yerleştirilir.`,
            "Üzerine zeytinyağı gezdirilir, tuz ve karabiber serpilir.",
            "İsteğe bağlı olarak üzerine rendelenmiş kaşar peyniri eklenir.",
            "Önceden ısıtılmış fırında sebzeler yumuşayıp üzeri kızarana kadar pişirilir.",
            "Fırından çıkarılıp biraz dinlendirildikten sonra servis edilir.",
          ],
        },
      },
    ],
  },
  {
    id: "MEAT_DISH",
    label: "Et Yemekleri",
    subcategories: [
      {
        id: "MEAT_STEW",
        label: "Sulu / Yahni Et Yemekleri",
        recipe: {
          id: "base_meat_stew",
          mainCategory: "MEAT_DISH",
          subCategory: "MEAT_STEW",
          displayName: "Base Sulu Et Yemeği",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Yahni";
          },

          baseIngredients: [
            "kuşbaşı et",
            "soğan",
            "sıvı yağ",
            "salça",
            "tuz",
            "karabiber",
            "su",
          ],

          steps: ({ mainIngredient }) => [
            "Soğan yemeklik doğranır.",
            "Tencereye yağ alınır ve soğanlar kavrulur.",
            `${mainIngredient} eklenir ve rengi dönene kadar kavrulur.`,
            "Salça eklenir ve birkaç dakika daha pişirilir.",
            "Üzerine su eklenir.",
            "Et tamamen yumuşayana kadar kısık ateşte pişirilir.",
            "Tuz ve karabiber eklenir.",
            "Dilerseniz patates ve havuç eklenerek daha zengin bir yemek elde edilebilir.",
            "Servis edilmeden önce kısa süre dinlendirilir.",
          ],
        },
      },
      {
        id: "GRILLED_MEAT",
        label: "Izgara / Kızartma Et Yemekleri",
        recipe: {
          id: "base_grilled_meat",
          mainCategory: "MEAT_DISH",
          subCategory: "GRILLED_MEAT",
          displayName: "Base Izgara Et",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return "Izgara " + cap;
          },

          baseIngredients: [
            "et (biftek veya pirzola)",
            "zeytinyağı",
            "tuz",
            "karabiber",
          ],

          steps: ({ mainIngredient }) => [
            `${mainIngredient} kağıt havluyla kurulanır.`,
            "Her iki tarafı zeytinyağı ile hafifçe yağlanır.",
            "Tuz ve karabiber serpilir.",
            "Tava veya ızgara iyice ısıtılır.",
            `${mainIngredient} yüksek ateşte mühürlenir.`,
            "Ardından orta ateşte istenilen pişme seviyesine göre pişirilir.",
            "Piştikten sonra 2–3 dakika dinlendirilir.",
            "Servis edilir.",
          ],
        },
      },
    ],
  },
  {
    id: "CHICKEN_DISH",
    label: "Tavuk Yemekleri",
    subcategories: [
      {
        id: "CHICKEN_STEW",
        label: "Sulu Tavuk Yemekleri",
        recipe: {
          id: "base_chicken_stew",
          mainCategory: "CHICKEN_DISH",
          subCategory: "CHICKEN_STEW",
          displayName: "Base Sulu Tavuk Yemeği",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Yahnisi";
          },

          baseIngredients: [
            "tavuk eti",
            "soğan",
            "sıvı yağ",
            "salça",
            "tuz",
            "karabiber",
            "su",
          ],

          steps: ({ mainIngredient }) => [
            "Soğan doğranır ve tencerede yağ ile kavrulur.",
            `${mainIngredient} eklenir, rengi dönene kadar kavrulur.`,
            "Salça eklenir ve birkaç dakika daha pişirilir.",
            "Üzerine su eklenir.",
            "Tavuk eti yumuşayana kadar kısık ateşte pişirilir.",
            "Tuz ve karabiber eklenir.",
            "İsteğe göre patates ve havuç eklenebilir.",
            "Servis edilmeden önce dinlendirilir.",
          ],
        },
      },
      {
        id: "OVEN_CHICKEN",
        label: "Fırın Tavuk",
        recipe: {
          id: "base_oven_chicken",
          mainCategory: "CHICKEN_DISH",
          subCategory: "OVEN_CHICKEN",
          displayName: "Base Fırın Tavuk",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return "Fırında " + cap;
          },

          baseIngredients: [
            "tavuk eti",
            "zeytinyağı",
            "tuz",
            "karabiber",
            "kekik",
          ],

          steps: ({ mainIngredient }) => [
            `${mainIngredient} fırın tepsisine yerleştirilir.`,
            "Üzerine zeytinyağı gezdirilir.",
            "Tuz, karabiber ve kekik serpilir.",
            "Önceden ısıtılmış fırında üzeri kızarana kadar pişirilir.",
            "Dilerseniz patates ve havuç ekleyerek tek tepsilik yemek oluşturabilirsiniz.",
            "Fırından aldıktan sonra birkaç dakika dinlendirilir.",
          ],
        },
      },
      {
        id: "SAUTEED_CHICKEN",
        label: "Sote Tavuk Yemekleri",
        recipe: {
          id: "base_sauteed_chicken",
          mainCategory: "CHICKEN_DISH",
          subCategory: "SAUTEED_CHICKEN",
          displayName: "Base Tavuk Sote",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Sote";
          },

          baseIngredients: [
            "tavuk eti",
            "soğan",
            "sıvı yağ",
            "tuz",
            "karabiber",
          ],

          steps: ({ mainIngredient }) => [
            "Tavuk eti küçük parçalar halinde doğranır.",
            "Tava iyice ısıtılır, yağ eklenir.",
            `${mainIngredient} eklenir ve yüksek ateşte mühürlenir.`,
            "Soğan eklenir ve birlikte sote yapılır.",
            "Tuz ve karabiber eklenir.",
            "İsteğe göre biber, mantar veya krema eklenebilir.",
            "Tavuklar tamamen pişince servis edilir.",
          ],
        },
      },
    ],
  },
  {
    id: "PASTA",
    label: "Makarna Yemekleri",
    subcategories: [
      {
        id: "PASTA_PLAIN",
        label: "Sade / Basit Soslu Makarna",
        recipe: {
          id: "base_pasta_plain",
          mainCategory: "PASTA",
          subCategory: "PASTA_PLAIN",
          displayName: "Base Sade Makarna",

          nameTemplate: () => "Sade Makarna",

          baseIngredients: ["makarna", "zeytinyağı", "tuz"],

          steps: () => [
            "Makarnayı haşlamak için bir tencereye su alınır ve kaynatılır.",
            "Su kaynayınca tuz eklenir.",
            "Makarna eklenir ve paketteki süreye göre haşlanır.",
            "Süzülür ve üzerine zeytinyağı gezdirilir.",
            "Dilerseniz domates sosu veya tereyağı eklenebilir.",
            "Servis edilir.",
          ],
        },
      },
      {
        id: "PASTA_VEGETARIAN",
        label: "Sebzeli Makarnalar",
        recipe: {
          id: "base_pasta_vegetarian",
          mainCategory: "PASTA",
          subCategory: "PASTA_VEGETARIAN",
          displayName: "Base Sebzeli Makarna",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + "li Makarna";
          },

          baseIngredients: [
            "makarna",
            "sebzeler",
            "zeytinyağı",
            "tuz",
            "karabiber",
          ],

          steps: ({ mainIngredient }) => [
            "Makarnayı haşlamak için su kaynatılır ve tuz eklenir.",
            "Makarna haşlanır ve süzülür.",
            `${mainIngredient} uygun şekilde doğranır.`,
            "Tavaya zeytinyağı alınır, sebzeler sotelenir.",
            "Haşlanmış makarna sebzelerin üzerine eklenir.",
            "Tuz ve karabiber ile tatlandırılır.",
            "İsteğe göre parmesan veya kaşar rendesi eklenebilir.",
            "Servis edilir.",
          ],
        },
      },
      {
        id: "PASTA_MEAT",
        label: "Etli / Kıymalı Makarnalar",
        recipe: {
          id: "base_pasta_meat",
          mainCategory: "PASTA",
          subCategory: "PASTA_MEAT",
          displayName: "Base Etli Makarna",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + "lı Makarna";
          },

          baseIngredients: [
            "makarna",
            "kıyma veya et",
            "soğan",
            "salça",
            "zeytinyağı",
            "tuz",
            "karabiber",
          ],

          steps: ({ mainIngredient }) => [
            "Makarnayı haşlamak için su kaynatılır ve tuz eklenir.",
            "Makarna haşlanır ve süzülür.",
            "Soğan doğranır ve yağ ile kavrulur.",
            `${mainIngredient} eklenir ve pişirilir.`,
            "Salça eklenir, karıştırılır.",
            "Kısa süre piştikten sonra makarna ile birleştirilir.",
            "Tuz ve karabiber ile tatlandırılır.",
            "Servis edilir.",
          ],
        },
      },
      {
        id: "PASTA_CHICKEN",
        label: "Tavuklu Makarnalar",
        recipe: {
          id: "base_pasta_chicken",
          mainCategory: "PASTA",
          subCategory: "PASTA_CHICKEN",
          displayName: "Base Tavuklu Makarna",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + "lu Makarna";
          },

          baseIngredients: [
            "makarna",
            "tavuk eti",
            "sıvı yağ",
            "soğan",
            "tuz",
            "karabiber",
          ],

          steps: ({ mainIngredient }) => [
            "Makarnayı haşlamak için su kaynatılır ve tuz eklenir.",
            "Makarna haşlanır ve süzülür.",
            "Tavuk eti küçük doğranır.",
            "Tava ısıtılır, yağ eklenir ve tavuk sotelenir.",
            "Soğan eklenir ve birlikte pişirilir.",
            "Haşlanmış makarna tavaya eklenir ve karıştırılır.",
            "Tuz ve karabiber ile tatlandırılır.",
            "Dilerseniz krema veya sebze eklenebilir.",
            "Servis edilir.",
          ],
        },
      },
      {
        id: "PASTA_SEAFOOD",
        label: "Deniz Ürünlü Makarnalar",
        recipe: {
          id: "base_pasta_seafood",
          mainCategory: "PASTA",
          subCategory: "PASTA_SEAFOOD",
          displayName: "Base Deniz Ürünlü Makarna",

          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + "li Makarna";
          },

          baseIngredients: [
            "makarna",
            "deniz ürünleri",
            "zeytinyağı",
            "sarımsak",
            "tuz",
            "karabiber",
          ],

          steps: ({ mainIngredient }) => [
            "Makarnayı haşlamak için su kaynatılır ve tuz eklenir.",
            "Makarna haşlanır ve süzülür.",
            "Tava ısıtılır, zeytinyağı eklenir.",
            "Sarımsak hafifçe kavrulur.",
            `${mainIngredient} eklenir ve kısa süre pişirilir (deniz ürünleri uzun pişirilmez).`,
            "Haşlanmış makarna tavaya eklenir ve karıştırılır.",
            "Tuz ve karabiber eklenir.",
            "Dilerseniz krema veya limon suyu ekleyebilirsiniz.",
            "Servis edilir.",
          ],
        },
      },
    ],
  },
  {
    id: "SEAFOOD_DISH",
    label: "Deniz Ürünleri Yemekleri",
    subcategories: [
      {
        id: "GRILLED_SEAFOOD",
        label: "Izgara / Fırın Deniz Ürünleri",
        recipe: {
          id: "base_grilled_seafood",
          mainCategory: "SEAFOOD_DISH",
          subCategory: "GRILLED_SEAFOOD",
          displayName: "Base Izgara Deniz Ürünü",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return "Izgara " + cap;
          },
          baseIngredients: [
            "deniz ürünü (balık, somon, levrek vb.)",
            "zeytinyağı",
            "tuz",
            "karabiber",
            "limon",
          ],
          steps: ({ mainIngredient }) => [
            `${mainIngredient} temizlenir ve güzelce yıkanır.`,
            "Kağıt havluyla kurulanır.",
            "Üzerine zeytinyağı gezdirilir.",
            "Tuz ve karabiber serpilir.",
            "Izgara veya fırın ısıtılır.",
            `${mainIngredient} her iki tarafı da kızarana kadar pişirilir.`,
            "Servis ederken üzerine limon sıkılır.",
          ],
        },
      },
      {
        id: "SEAFOOD_STEW",
        label: "Güveç / Sulu Deniz Ürünleri",
        recipe: {
          id: "base_seafood_stew",
          mainCategory: "SEAFOOD_DISH",
          subCategory: "SEAFOOD_STEW",
          displayName: "Base Deniz Ürünü Güveç",
          nameTemplate: ({ mainIngredient }) => {
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Güveç";
          },
          baseIngredients: [
            "deniz ürünleri karışımı (balık, karides vb.)",
            "soğan",
            "sarımsak",
            "domates veya domates sosu",
            "zeytinyağı",
            "tuz",
            "karabiber",
          ],
          steps: ({ mainIngredient }) => [
            "Soğan ve sarımsak doğranır.",
            "Tencereye veya güveç kabına zeytinyağı alınır, soğan ve sarımsak kavrulur.",
            "Domates veya domates sosu eklenir, birkaç dakika pişirilir.",
            `${mainIngredient} eklenir ve hafifçe karıştırılır.`,
            "Kısa süre pişirilir (deniz ürünleri fazla pişirilmez).",
            "Tuz ve karabiber eklenir.",
            "İsteğe göre üzerine maydanoz serpilerek servis edilir.",
          ],
        },
      },
    ],
  },
  {
    id: "MILK_DESSERT",
    label: "Sütlü Tatlılar",
    subcategories: [
      {
        id: "SUTLAC",
        label: "Sütlaç",
        recipe: {
          id: "base_sutlac",
          mainCategory: "MILK_DESSERT",
          subCategory: "SUTLAC",
          displayName: "Base Sütlaç",

          nameTemplate: () => "Sütlaç",

          baseIngredients: ["süt", "pirinç", "şeker", "su"],

          steps: () => [
            "Pirinç yıkanır ve su ile haşlanır.",
            "Pirinçler suyunu çekince süt eklenir.",
            "Kısık ateşte karıştırarak kaynatılır.",
            "Şeker eklenir ve birkaç dakika daha pişirilir.",
            "Kıvam alınca kaselere paylaştırılır.",
            "İsteğe göre tarçın serpilerek servis edilir.",
          ],
        },
      },
      {
        id: "MUHALLEBI",
        label: "Muhallebi",
        recipe: {
          id: "base_muhallebi",
          mainCategory: "MILK_DESSERT",
          subCategory: "MUHALLEBI",
          displayName: "Base Muhallebi",

          nameTemplate: () => "Muhallebi",

          baseIngredients: [
            "süt",
            "şeker",
            "un",
            "nişasta",
            "tereyağı",
            "vanilin",
          ],

          steps: () => [
            "Tencereye un ve nişasta alınır.",
            "Üzerine süt eklenip karıştırılarak açılır.",
            "Şeker eklenir ve pişene kadar sürekli karıştırılır.",
            "Koyulaşınca ocaktan alınır, tereyağı ve vanilin eklenir.",
            "Pürüzsüz kıvam için karıştırılır.",
            "Kâselere paylaştırılır ve soğuyunca servis edilir.",
          ],
        },
      },
      {
        id: "PUDDING",
        label: "Puding / Kremalı Tatlılar",
        recipe: {
          id: "base_pudding",
          mainCategory: "MILK_DESSERT",
          subCategory: "PUDDING",
          displayName: "Base Puding",

          nameTemplate: ({ mainIngredient }) => {
            if (!mainIngredient) return "Puding";
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Puding";
          },

          baseIngredients: ["süt", "şeker", "nişasta", "kakao veya aroma"],

          steps: ({ mainIngredient }) => [
            "Tencereye süt, şeker ve nişasta alınır.",
            mainIngredient
              ? `${mainIngredient} eklenir (kakao, çikolata, muz aroma vb.).`
              : "Kakao veya aroma eklenir.",
            "Sürekli karıştırarak koyulaşana kadar pişirilir.",
            "Kaselere alınır ve soğutulur.",
            "İsteğe göre üzeri çikolata, meyve veya fındık ile süslenir.",
          ],
        },
      },
    ],
  },
  {
    id: "PASTRY",
    label: "Hamur İşleri",
    subcategories: [
      {
        id: "BOREK",
        label: "Börekler",
        recipe: {
          id: "base_borek",
          mainCategory: "PASTRY",
          subCategory: "BOREK",
          displayName: "Base Börek",

          nameTemplate: ({ mainIngredient }) => {
            if (!mainIngredient) return "Börek";
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + "lı Börek";
          },

          baseIngredients: [
            "yufka",
            "yağ (tereyağı veya sıvı yağ)",
            "yumurta",
            "iç malzeme (peynir, patates, kıyma vb.)",
            "tuz",
          ],

          steps: ({ mainIngredient }) => [
            "Yufka tezgaha serilir, üzerine yağ sürülür.",
            mainIngredient
              ? `${mainIngredient} iç harcı hazırlanır.`
              : "İç harç hazırlanır.",
            "Yufka istenen şekilde kesilir.",
            "Hazırlanan iç harç yufkanın içine yerleştirilir.",
            "Sarma veya katlama işlemi yapılır.",
            "Üzerine yumurta sarısı sürülür.",
            "Önceden ısıtılmış fırında kızarana kadar pişirilir.",
            "Sıcak servis edilir.",
          ],
        },
      },
      {
        id: "POGACA",
        label: "Poğaçalar",
        recipe: {
          id: "base_pogaca",
          mainCategory: "PASTRY",
          subCategory: "POGACA",
          displayName: "Base Poğaça",

          nameTemplate: ({ mainIngredient }) => {
            if (!mainIngredient) return "Poğaça";
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + "lı Poğaça";
          },

          baseIngredients: [
            "un",
            "yoğurt",
            "yağ (tereyağı veya sıvı yağ)",
            "yumurta",
            "kabartma tozu veya maya",
            "tuz",
            "iç malzeme (peynir, patates, zeytin vb.)",
          ],

          steps: ({ mainIngredient }) => [
            "Un, yağ, yoğurt ve kabartma tozu/maya karıştırılarak hamur hazırlanır.",
            mainIngredient
              ? `${mainIngredient} iç harcı hazırlanır.`
              : "İç malzeme hazırlanır.",
            "Hamur bezelere ayrılır.",
            "Ortasına iç malzeme eklenir ve kapatılır.",
            "Tepsiye dizilir.",
            "Üzerine yumurta sarısı sürülür.",
            "Önceden ısıtılmış fırında kızarana kadar pişirilir.",
            "Sıcak servis edilir.",
          ],
        },
      },
      {
        id: "PIZZA",
        label: "Pizzalar",
        recipe: {
          id: "base_pizza",
          mainCategory: "PASTRY",
          subCategory: "PIZZA",
          displayName: "Base Pizza",

          nameTemplate: ({ mainIngredient }) => {
            if (!mainIngredient) return "Pizza";
            const cap =
              mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);
            return cap + " Pizza";
          },

          baseIngredients: [
            "un",
            "maya",
            "su",
            "zeytinyağı",
            "tuz",
            "domates sosu",
            "mozzarella veya kaşar peyniri",
            "ekstra malzeme (sebze, et, tavuk vb.)",
          ],

          steps: ({ mainIngredient }) => [
            "Un, maya, su, zeytinyağı ve tuz karıştırılarak hamur yoğrulur.",
            "Hamur mayalanmaya bırakılır.",
            "Hamur açılarak tepsiye yerleştirilir.",
            "Üzerine domates sosu sürülür.",
            "Peynir eklenir.",
            mainIngredient
              ? `${mainIngredient} pizza üzerine yerleştirilir.`
              : "Ekstra malzemeler yerleştirilir.",
            "Önceden ısıtılmış fırında kızarana kadar pişirilir.",
            "Sıcak servis edilir.",
          ],
        },
      },
    ],
  },
];

export const INGREDIENT_GROUPS = {
  vegetables: [
    "kabak",
    "patates",
    "havuç",
    "brokoli",
    "karnabahar",
    "biber",
    "domates",
    "soğan",
    "sarım­sak",
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
  meats: ["dana eti", "kuzu eti", "kuşbaşı et", "kıyma"],
  poultry: ["tavuk", "tavuk göğsü", "tavuk but", "tavuk suyu"],
  seafood: ["balık", "somon", "levrek", "karides", "midye", "kalamar"],
  dairy: ["süt", "krema", "tereyağı", "yoğurt", "peynir", "kaşar"],
  grains: ["pirinç", "bulgur", "kinoa"],
  pasta: ["spagetti", "makarna", "penne", "fusilli", "fettuccine"],
  fats: ["zeytinyağı", "ayçiçek yağı", "tereyağı"],
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
  sweeteners: ["şeker", "bal"],
  liquids: ["su", "et suyu", "sebze suyu", "tavuk suyu"],
};
