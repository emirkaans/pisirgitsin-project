"use client";

import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-medium text-gray-950 mb-1">
            Gizlilik Politikası
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Son güncelleme tarihi: {new Date().toLocaleDateString("tr-TR")}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Giriş
              </h2>
              <p className="text-gray-600 mb-4">
                PişirGitsin olarak, gizliliğinize saygı duyuyor ve kişisel
                verilerinizin korunmasına önem veriyoruz. Bu gizlilik
                politikası, web sitemizi kullanırken hangi bilgileri
                topladığımızı ve bu bilgileri nasıl kullandığımızı
                açıklamaktadır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Toplanan Bilgiler
              </h2>
              <p className="text-gray-600 mb-4">
                Web sitemizi kullanırken aşağıdaki bilgileri toplayabiliriz:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Ad, soyad ve e-posta adresi gibi kayıt bilgileri</li>
                <li>Tarif beğenileri ve menü tercihleri</li>
                <li>Tarif değerlendirmeleri ve yorumlar</li>
                <li>
                  Tarayıcı türü, işletim sistemi ve IP adresi gibi teknik
                  bilgiler
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. Bilgilerin Kullanımı
              </h2>
              <p className="text-gray-600 mb-4">
                Topladığımız bilgileri aşağıdaki amaçlar için kullanıyoruz:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Hizmetlerimizi sunmak ve geliştirmek</li>
                <li>Kullanıcı deneyimini kişiselleştirmek</li>
                <li>Güvenliği sağlamak ve dolandırıcılığı önlemek</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                4. Çerezler
              </h2>
              <p className="text-gray-600 mb-4">
                Web sitemizde çerezler kullanıyoruz. Çerezler, web sitemizi daha
                iyi kullanmanızı sağlamak ve size daha iyi bir deneyim sunmak
                için kullanılır. Çerezleri tarayıcı ayarlarınızdan kontrol
                edebilirsiniz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                5. Veri Güvenliği
              </h2>
              <p className="text-gray-600 mb-4">
                Kişisel verilerinizin güvenliği bizim için önemlidir.
                Verilerinizi korumak için uygun teknik ve organizasyonel
                önlemleri alıyoruz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                6. İletişim
              </h2>
              <p className="text-gray-600 mb-4">
                Gizlilik politikamız hakkında sorularınız veya endişeleriniz
                varsa, lütfen bizimle iletişime geçin:
              </p>
              <p className="text-gray-600">E-posta: info@pisirgitsin.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
