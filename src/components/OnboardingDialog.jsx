// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { useAuth } from "@/context/AuthContext";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

// const ALLERGEN_OPTIONS = [
//   "süt",
//   "yoğurt",
//   "peynir",
//   "kaşar",
//   "tereyağı",
//   "krema",
//   "yumurta",
//   "fındık",
//   "ceviz",
//   "badem",
//   "fıstık",
//   "kaju",
//   "susam",
//   "tahin",
//   "balık",
//   "karides",
//   "midye",
//   "kalamar",
// ];

// const DIET_OPTIONS = [
//   "vegan",
//   "vejetaryen",
//   "glütensiz",
//   "laktozsuz",
//   "ketojenik",
// ];

// const CATEGORY_OPTIONS = [
//   "Çorbalar",
//   "Zeytinyağlılar",
//   "Ana Yemek",
//   "Tatlı",
//   "Salata",
//   "Atıştırmalık",
// ];

// export default function OnboardingDialog() {
//   const { user, isUserLoggedIn, loading: authLoading } = useAuth();

//   const [open, setOpen] = useState(false);
//   const [profileLoading, setProfileLoading] = useState(true);

//   const [step, setStep] = useState(1);

//   const [allergens, setAllergens] = useState([]);
//   const [diets, setDiets] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const userId = user?.id ?? null;

//   useEffect(() => {
//     const run = async () => {
//       if (authLoading) return;

//       if (!isUserLoggedIn || !userId) {
//         setOpen(false);
//         setProfileLoading(false);
//         return;
//       }

//       setProfileLoading(true);

//       const { data, error } = await supabase
//         .from("profile")
//         .select("onboarding_completed,allergens,diets,categories")
//         .eq("id", userId)
//         .single();

//       if (error) {
//         console.error(error);
//         setProfileLoading(false);
//         return;
//       }

//       const completed = data?.onboarding_completed === true;

//       if (!completed) {
//         setAllergens(data?.allergens ?? []);
//         setDiets(data?.diets ?? []);
//         setCategories(data?.categories ?? []);
//         setStep(1);
//         setOpen(true);
//       } else {
//         setOpen(false);
//       }

//       setProfileLoading(false);
//     };

//     run();
//   }, [authLoading, isUserLoggedIn, userId]);

//   const toggle = (setList, value) => {
//     setList((prev) =>
//       prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
//     );
//   };

//   const stepTitle = useMemo(() => {
//     if (step === 1) return "Alerjilerin / intoleransların";
//     if (step === 2) return "Beslenme tarzın";
//     if (step === 3) return "Sevdiğin kategoriler";
//     if (step === 4) return "Favori tarifler";
//     return "Onboarding";
//   }, [step]);

//   const stepDesc = useMemo(() => {
//     if (step === 1) return "Seçtiklerin önerilerden çıkarılacak.";
//     if (step === 2) return "İstersen boş bırakabilirsin.";
//     if (step === 3) return "Seçtiklerin önerilerde öncelik alır.";
//     if (step === 4) return "Bunu da birazdan ekleyeceğiz.";
//     return "";
//   }, [step]);

//   const saveCurrentStep = async () => {
//     if (!userId) return false;
//     setSaving(true);
//     setError("");

//     const payload =
//       step === 1
//         ? { allergens }
//         : step === 2
//         ? { diets }
//         : step === 3
//         ? { categories }
//         : {};

//     const { error } = await supabase
//       .from("profile")
//       .update(payload)
//       .eq("id", userId);

//     setSaving(false);

//     if (error) {
//       console.error(error);
//       setError("Kaydedilemedi. Tekrar dene.");
//       return false;
//     }

//     return true;
//   };

//   const finish = async () => {
//     if (!userId) return;
//     setSaving(true);
//     setError("");

//     // Son adımda istersen son step verisini de kaydetmek istersin (şu an step4 yok)
//     const { error } = await supabase
//       .from("profile")
//       .update({ onboarding_completed: true })
//       .eq("id", userId);

//     setSaving(false);

//     if (error) {
//       console.error(error);
//       setError("Kaydedilemedi. Tekrar dene.");
//       return;
//     }

//     setOpen(false);
//   };

//   const handleNext = async () => {
//     if (step <= 3) {
//       const ok = await saveCurrentStep();
//       if (ok) setStep((s) => s + 1);
//       return;
//     }
//     // step === 4
//     await finish();
//   };

//   const handleBack = () => {
//     if (step <= 1) return;
//     setStep((s) => s - 1);
//   };

//   const handleSkip = async () => {
//     // Skip: onboarding_completed=true yap, kapat
//     await finish();
//   };

//   const isLast = step === 4;

//   if (authLoading || profileLoading) return null;

//   return (
//     <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
//       <DialogContent className="sm:max-w-lg">
//         <DialogHeader>
//           <DialogTitle>{stepTitle}</DialogTitle>
//           <DialogDescription>
//             Adım {step} / 4 — {stepDesc}
//           </DialogDescription>
//         </DialogHeader>

//         {step === 1 && (
//           <div className="grid grid-cols-2 gap-3">
//             {ALLERGEN_OPTIONS.map((a) => (
//               <label
//                 key={a}
//                 className="flex items-center gap-2 rounded-md border p-2 text-sm"
//               >
//                 <Checkbox
//                   checked={allergens.includes(a)}
//                   onCheckedChange={() => toggle(setAllergens, a)}
//                 />
//                 <span className="capitalize">{a}</span>
//               </label>
//             ))}
//           </div>
//         )}

//         {step === 2 && (
//           <div className="grid grid-cols-2 gap-3">
//             {DIET_OPTIONS.map((d) => (
//               <label
//                 key={d}
//                 className="flex items-center gap-2 rounded-md border p-2 text-sm"
//               >
//                 <Checkbox
//                   checked={diets.includes(d)}
//                   onCheckedChange={() => toggle(setDiets, d)}
//                 />
//                 <span className="capitalize">{d}</span>
//               </label>
//             ))}
//           </div>
//         )}

//         {step === 3 && (
//           <div className="grid grid-cols-2 gap-3">
//             {CATEGORY_OPTIONS.map((c) => (
//               <label
//                 key={c}
//                 className="flex items-center gap-2 rounded-md border p-2 text-sm"
//               >
//                 <Checkbox
//                   checked={categories.includes(c)}
//                   onCheckedChange={() => toggle(setCategories, c)}
//                 />
//                 <span>{c}</span>
//               </label>
//             ))}
//           </div>
//         )}

//         {step === 4 && (
//           <div className="text-sm text-gray-600">
//             Buraya “10–15 tarif” seçtirme UI’ını ekleyeceğiz.
//             <div className="mt-2">Şimdilik “Bitir” veya Geç diyebilirsin.</div>
//           </div>
//         )}

//         {error && <div className="text-sm text-red-600">{error}</div>}

//         <div className="flex items-center justify-between pt-2">
//           <Button
//             variant="outline"
//             onClick={handleBack}
//             disabled={saving || step === 1}
//           >
//             Geri
//           </Button>

//           <div className="flex gap-2">
//             <Button variant="ghost" onClick={handleSkip} disabled={saving}>
//               Geç
//             </Button>

//             <Button onClick={handleNext} disabled={saving}>
//               {saving ? "Kaydediliyor..." : isLast ? "Bitir" : "Devam"}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const ALLERGEN_OPTIONS = [
  "süt",
  "yoğurt",
  "peynir",
  "kaşar",
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

const DIET_OPTIONS = [
  "vegan",
  "vejetaryen",
  "glütensiz",
  "laktozsuz",
  "ketojenik",
];

const CATEGORY_OPTIONS = [
  "Çorbalar",
  "Zeytinyağlılar",
  "Ana Yemek",
  "Tatlı",
  "Salata",
  "Atıştırmalık",
  "Et Yemekleri",
  "Tavuk Yemekleri",
  "Hamur İşleri",
  "Baklagil Yemekleri",
];

export default function OnboardingDialog() {
  const { user, isUserLoggedIn, loading: authLoading } = useAuth();

  const [open, setOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // UI içi step
  const [step, setStep] = useState(0);

  const [allergens, setAllergens] = useState([]);
  const [diets, setDiets] = useState([]);
  const [categories, setCategories] = useState([]);

  // Step 4 state
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const [saving, setSaving] = useState(false);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [error, setError] = useState("");

  const userId = user?.id ?? null;

  // Profile’ı çek → onboarding tamam mı? (ve varsa önceki seçimleri doldur)
  useEffect(() => {
    const run = async () => {
      if (authLoading) return;

      if (!isUserLoggedIn || !userId) {
        setOpen(false);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      const { data, error } = await supabase
        .from("profile")
        .select(
          "onboarding_completed,allergens,diets,categories,favorite_recipe_ids"
        )
        .eq("id", userId)
        .single();

      if (error) {
        console.error(error);
        setProfileLoading(false);
        return;
      }

      const completed = data?.onboarding_completed === true;

      if (!completed) {
        setAllergens(data?.allergens ?? []);
        setDiets(data?.diets ?? []);
        setCategories(data?.categories ?? []);
        setFavoriteIds(
          Array.isArray(data?.favorite_recipe_ids)
            ? data.favorite_recipe_ids
            : []
        );
        setStep(0);
        setOpen(true);
      } else {
        setOpen(false);
      }

      setProfileLoading(false);
    };

    run();
  }, [authLoading, isUserLoggedIn, userId]);

  const toggleListItem = (setList, value) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const toggleFavoriteId = (recipeId) => {
    const id = Number(recipeId);
    if (!Number.isFinite(id)) return;
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const stepTitle = useMemo(() => {
    if (step === 0) return "Küçük bir başlangıç";
    if (step === 1) return "Alerjilerin / intoleransların";
    if (step === 2) return "Beslenme tarzın";
    if (step === 3) return "Sevdiğin kategoriler";
    if (step === 4) return "Sevdiğin tarifleri seç";
    return "Onboarding";
  }, [step]);

  const stepDesc = useMemo(() => {
    if (step === 0) return "";
    if (step === 1) return "Hangi içeriklere alerjin var?";
    if (step === 2) return "Belli bir tarza göre besleniyor musun?";
    if (step === 3) return "En sevdiğin yemekler hangi kategorilerde?";
    if (step === 4) return "Aşağıdan birkaç tane seçmen yeterli";
    return "";
  }, [step]);

  // Step 4'e gelince featured tarifleri çek
  useEffect(() => {
    const fetchFeatured = async () => {
      if (!open) return;
      if (step !== 4) return;
      if (!userId) return;

      setLoadingFeatured(true);
      setError("");

      const { data, error } = await supabase
        .from("recipe")
        .select("id,name,image_url,likes_count,saves_count,views_count")
        .eq("is_featured", true)
        .order("saves_count", { ascending: false })
        .order("likes_count", { ascending: false })
        .order("views_count", { ascending: false })
        .limit(15);

      setLoadingFeatured(false);

      if (error) {
        console.error(error);
        setError("Tarifler yüklenemedi.");
        return;
      }

      setFeaturedRecipes(data ?? []);
    };

    fetchFeatured();
  }, [open, step, userId]);

  // Her adımda ilgili alanı kaydet
  const saveCurrentStep = async () => {
    if (!userId) return false;
    setSaving(true);
    setError("");

    const payload =
      step === 1
        ? { allergens }
        : step === 2
        ? { diets }
        : step === 3
        ? { categories }
        : {};

    const { error } = await supabase
      .from("profile")
      .update(payload)
      .eq("id", userId);

    setSaving(false);

    if (error) {
      console.error(error);
      setError("Kaydedilemedi. Tekrar dene.");
      return false;
    }

    return true;
  };

  const finish = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");

    // Step 4: favorileri de yaz + onboarding tamamla
    const { error } = await supabase
      .from("profile")
      .update({
        favorite_recipe_ids: favoriteIds,
        onboarding_completed: true,
      })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      console.error(error);
      setError("Kaydedilemedi. Tekrar dene.");
      return;
    }

    setOpen(false);
  };

  const handleNext = async () => {
    if (step <= 3) {
      const ok = await saveCurrentStep();
      if (ok) setStep((s) => s + 1);
      return;
    }
    // step === 4
    await finish();
  };

  const handleBack = () => {
    if (step <= 1) return;
    setStep((s) => s - 1);
  };

  const handleSkip = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");

    // Skip: sadece onboarding_completed=true
    const { error } = await supabase
      .from("profile")
      .update({ onboarding_completed: true })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      console.error(error);
      setError("Kaydedilemedi. Tekrar dene.");
      return;
    }

    setOpen(false);
  };

  const isLast = step === 4;

  if (authLoading || profileLoading) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogContent className="sm:max-w-3xl lg:max-w-[%80]">
        <DialogHeader>
          <DialogTitle>{stepTitle}</DialogTitle>
          <DialogDescription>
            {step > 0 && `Adım ${step} / 4 — ${stepDesc}`}
          </DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4 text-center">
            <div className="text-2xl">👋</div>

            <h2 className="text-lg font-semibold">Hoş geldin!</h2>

            <p className="text-sm text-muted-foreground">
              Seni biraz tanımamıza yardımcı olur musun?
            </p>

            <p className="text-sm text-muted-foreground">
              Birkaç kısa soruyla sana daha uygun tarifler önereceğiz. Hepsi 1–2
              dakika sürüyor.
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <Button onClick={() => setStep(1)}>Başlayalım</Button>

              <Button variant="ghost" onClick={handleSkip}>
                Atla
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {ALLERGEN_OPTIONS.map((a) => (
              <label
                key={a}
                className="flex items-center gap-2 rounded-md border p-2 text-sm"
              >
                <Checkbox
                  checked={allergens.includes(a)}
                  onCheckedChange={() => toggleListItem(setAllergens, a)}
                />
                <span className="capitalize">{a}</span>
              </label>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-3">
            {DIET_OPTIONS.map((d) => (
              <label
                key={d}
                className="flex items-center gap-2 rounded-md border p-2 text-sm"
              >
                <Checkbox
                  checked={diets.includes(d)}
                  onCheckedChange={() => toggleListItem(setDiets, d)}
                />
                <span className="capitalize">{d}</span>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-3">
            {CATEGORY_OPTIONS.map((c) => (
              <label
                key={c}
                className="flex items-center gap-2 rounded-md border p-2 text-sm"
              >
                <Checkbox
                  checked={categories.includes(c)}
                  onCheckedChange={() => toggleListItem(setCategories, c)}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div>
            {loadingFeatured ? (
              <div className="text-sm text-gray-600">
                Tarifler yükleniyor...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {featuredRecipes.map((r) => (
                  <label
                    key={r.id}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:bg-muted/30"
                  >
                    <div className="aspect-[16/10] bg-muted">
                      <img
                        src={r.image_url || ""}
                        alt={r.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-3 flex gap-2 items-start">
                      <Checkbox
                        checked={favoriteIds.includes(Number(r.id))}
                        onCheckedChange={() => toggleFavoriteId(r.id)}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {r.name}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-3 text-xs text-muted-foreground">
              Seçilenler: {favoriteIds.length}
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-600">{error}</div>}

        {step > 0 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={saving || step === 1}
            >
              Geri
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip} disabled={saving}>
                Atla
              </Button>

              <Button
                onClick={handleNext}
                disabled={saving || (step === 4 && loadingFeatured)}
              >
                {saving ? "Kaydediliyor..." : isLast ? "Bitir" : "Devam"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
