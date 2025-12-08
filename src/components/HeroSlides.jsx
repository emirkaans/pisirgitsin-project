"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const slides = [
  {
    id: 1,
    title: "Kolay Tarifler",
    description: "Pratik ve lezzetli tariflerle mutfağınızı şenlendirin",
    image: "/images/hero-1.jpg",
    link: "/listeler/kolay-tarifler",
  },
  {
    id: 2,
    title: "Yeni Tarifler",
    description: "En son eklediğimiz lezzetli tarifler",
    image: "/images/hero-2.jpg",
    link: "/listeler/yeni-tarifler",
  },
  {
    id: 3,
    title: "Özel Tarifler",
    description: "Sizin için özenle seçtiğimiz özel tarifler",
    image: "/images/hero-3.jpg",
    link: "/listeler/ozel-tarifler",
  },
];

const HeroSlides = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                {slide.title}
              </h1>
              <p className="text-lg text-white mb-8">{slide.description}</p>
              <Link
                href={slide.link}
                className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors"
              >
                Tarifleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-colors"
      >
        <IconChevronLeft size={24} className="text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-colors"
      >
        <IconChevronRight size={24} className="text-white" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlides;
