"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

const listeler = [
  {
    id: "kolay-tarifler",
    baslik: "Kolay Tarifler",
    aciklama: "Pratik ve lezzetli tariflerle mutfağınızı şenlendirin",
    icon: "🍳",
    renk: "bg-green-100 text-green-800",
  },
  {
    id: "yeni-tarifler",
    baslik: "Yeni Tarifler",
    aciklama: "En son eklediğimiz lezzetli tarifler",
    icon: "✨",
    renk: "bg-blue-100 text-blue-800",
  },
  {
    id: "ozel-tarifler",
    baslik: "Özel Tarifler",
    aciklama: "Sizin için özenle seçtiğimiz özel tarifler",
    icon: "⭐",
    renk: "bg-purple-100 text-purple-800",
  },
  {
    id: "populer-tarifler",
    baslik: "Popüler Tarifler",
    aciklama: "En çok beğenilen tarifler",
    icon: "🔥",
    renk: "bg-red-100 text-red-800",
  },
];

const ListelerSayfasi = () => {
  return (
    <div className="min-h-screen bg-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center border-b mb-12">
          <h1 className="text-3xl font-medium text-gray-900 mb-3">
            Özel Tarif Listeleri
          </h1>
          <p className="text-lg text-gray-600">
            Size özel hazırladığımız tarif listelerini keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listeler.map((liste) => (
            <Link
              key={liste.id}
              href={`/listeler/${liste.id}`}
              className="group bg-white rounded-lg shadow overflow-hidden hover:shadow-sm transition-all"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`${liste.renk} p-3 rounded-lg text-2xl group-hover:scale-110 transition-transform`}
                  >
                    {liste.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-800 transition-colors">
                      {liste.baslik}
                    </h2>
                    <p className="text-gray-600 mb-4">{liste.aciklama}</p>
                    <div className="flex items-center text-green-600 group-hover:translate-x-2 transition-transform">
                      <span className="text-sm font-medium">
                        Listeyi Görüntüle
                      </span>
                      <IconArrowRight size={20} className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListelerSayfasi;
