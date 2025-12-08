"use client";

import { useState } from "react";
import { IconMail, IconPhone, IconMapPin } from "@tabler/icons-react";
import { toast } from "sonner";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
    toast.success("Mesajınız başarıyla gönderildi!");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-gray-950 mb-3">İletişim</h1>
          <p className=" text-gray-600">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle
            iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* İletişim Bilgileri */}
          <div className="bg-white rounded-lg border  p-4">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">
              İletişim Bilgileri
            </h2>
            <div className="grid grid-cols-3 gap-2  text-sm justify-between">
              <div className="flex flex-col justify-center p-2  border rounded-md  items-center">
                <IconMail
                  className="w-6 h-6 text-orange-900 mt-1"
                  strokeWidth={1.5}
                />

                <h3 className=" font-medium text-gray-900">E-posta</h3>
                <p className="text-gray-600 ">info@pisirgitsin.com</p>
              </div>
              <div className="flex flex-col justify-center p-2  border rounded-md  items-center">
                <IconPhone
                  className="w-6 h-6 text-orange-900 mt-1"
                  strokeWidth={1.5}
                />

                <h3 className=" font-medium text-gray-900">Telefon</h3>
                <p className="text-gray-600">+90 (212) 123 45 67</p>
              </div>

              <div className="flex flex-col justify-center p-2  border rounded-md  items-center">
                <IconMapPin
                  className="w-6 h-6 text-orange-900 mt-1"
                  strokeWidth={1.5}
                />

                <h3 className=" font-medium text-gray-900">Adres</h3>
                <p className="text-gray-600 text-center">
                  Maltepe Cad., No:123, Çankaya, Ankara
                </p>
              </div>
            </div>

            {/* Harita */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Konum</h3>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3007.966685554854!2d29.0125!3d41.0817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDA0JzUyLjEiTiAyOcKwMDAnNDUuMCJF!5e0!3m2!1str!2str!4v1620000000000!5m2!1str!2str"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="bg-white rounded-lg border  p-4">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">
              Bize Ulaşın
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Adınız Soyadınız
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border rounded-lg px-3 py-2  text-sm w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  E-posta Adresiniz
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border rounded-lg px-3 py-2  text-sm w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Konu
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="border rounded-lg px-3 py-2  text-sm w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="border rounded-lg px-3 py-2  text-sm w-full"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md   text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
