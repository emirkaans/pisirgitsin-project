"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
// import recipes from "@/lib/api.json";
import { IconArrowLeft } from "@tabler/icons-react";

const EtiketSayfasi = () => {
  const params = useParams();
  const router = useRouter();
  const etiket = decodeURIComponent(params.etiket);
  const [recipes, setRecipes] = useState([]);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from("recipe")
        .select("*")

      if (error) {
        setFetchError(error.message || "Veri alınamadı");
      } else {
        setRecipes(Array.isArray(data) ? data : []);
      }
    };

    fetchRecipes();
  }, []);

  const etiketliTarifler = recipes.filter((recipe) =>
    recipe.labels.includes(etiket)
  );

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl  mx-auto">
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-green-600 hover:text-green-700"
          >
            <IconArrowLeft size={20} className="mr-2" />
            Geri Dön
          </button>
        </div>

        <h1 className="text-2xl font-medium border-b text-gray-900 mb-8">
          "{etiket}" tarifler
        </h1>

        {etiketliTarifler.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Bu etikete sahip tarif bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {etiketliTarifler.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/tarif/${recipe.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {recipe.name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {recipe.difficulty}
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {recipe.time_in_minutes} dk
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recipe.labels.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EtiketSayfasi;
