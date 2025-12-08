// src/app/page.js
"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const categories = [
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

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-7xl flex items-center w-full gap-4 flex-col mx-auto px-4 py-16">
        <h2 className="text-3xl text-orange-950 font-bold mb-4">Kategoriler</h2>
        <div className="grid  w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/kategoriler/${category.id}`}
              className="group relative h-48 rounded-lg overflow-hidden"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-50 transition duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-xl font-semibold">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
