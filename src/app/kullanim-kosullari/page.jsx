"use client";

import Link from "next/link";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-medium text-gray-950 mb-1">
            Kullanım Koşulları
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Son güncelleme tarihi: {new Date().toLocaleDateString("tr-TR")}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Genel Hükümler
              </h2>
              <p className="text-gray-600 mb-4">
                PişirGitsin web sitesini kullanarak, aşağıdaki kullanım
                koşullarını kabul etmiş sayılırsınız. Bu koşulları kabul
                etmiyorsanız, lütfen web sitemizi kullanmayınız.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Hizmet Kullanımı
              </h2>
              <p className="text-gray-600 mb-4">
                Web sitemizi kullanırken aşağıdaki kurallara uymanız
                gerekmektedir:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Doğru ve güncel bilgiler sağlamak</li>
                <li>Hesap güvenliğinizi korumak</li>
                <li>Başkalarının haklarına saygı göstermek</li>
                <li>Yasalara ve etik kurallara uymak</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. Kullanıcı İçerikleri
              </h2>
              <p className="text-gray-600 mb-4">
                Web sitemize yüklediğiniz içeriklerden siz sorumlusunuz.
                İçerikleriniz:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Telif hakkı ihlali içermemeli</li>
                <li>Yanıltıcı veya zararlı olmamalı</li>
                <li>Başkalarının haklarını ihlal etmemeli</li>
                <li>Yasalara uygun olmalı</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                4. Fikri Mülkiyet
              </h2>
              <p className="text-gray-600 mb-4">
                Web sitemizdeki tüm içerikler (metin, görsel, logo vb.)
                PişirGitsin'in fikri mülkiyetidir. Bu içerikleri izinsiz
                kullanmak, kopyalamak veya dağıtmak yasaktır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                5. Sorumluluk Reddi
              </h2>
              <p className="text-gray-600 mb-4">
                Web sitemizdeki tarifler ve içerikler bilgilendirme amaçlıdır.
                Tariflerin uygulanmasından doğacak sonuçlardan PişirGitsin
                sorumlu değildir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                6. Değişiklikler
              </h2>
              <p className="text-gray-600 mb-4">
                Bu kullanım koşullarını önceden haber vermeksizin değiştirme
                hakkımız saklıdır. Değişiklikler web sitemizde yayınlandığı anda
                yürürlüğe girer.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                7. İletişim
              </h2>
              <p className="text-gray-600 mb-4">
                Kullanım koşullarımız hakkında sorularınız veya endişeleriniz
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

export default TermsOfUse;
