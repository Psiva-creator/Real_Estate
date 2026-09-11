'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';

interface PropertyGalleryProps {
  mainImage: string;
  galleryImages: string[];
  title: string;
  locale: Locale;
}

export default function PropertyGallery({
  mainImage,
  galleryImages = [],
  title,
  locale,
}: PropertyGalleryProps) {
  const dict = getDictionary(locale);

  // Deduplicate and combine images
  const allImages = [
    mainImage,
    ...galleryImages.filter((img) => img && img !== mainImage),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const currentSrc = imgErrors[currentIndex]
    ? '/images/property-placeholder.svg'
    : allImages[currentIndex] || '/images/property-placeholder.svg';

  return (
    <div className="space-y-3">
      {/* Featured Main Image Box */}
      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-md group">
        <Image
          src={currentSrc}
          alt={`${title} - Photo ${currentIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={() => {
            setImgErrors((prev) => ({ ...prev, [currentIndex]: true }));
          }}
        />

        {/* Previous / Next Arrow Overlays */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white backdrop-blur-sm flex items-center justify-center opacity-80 hover:opacity-100 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={dict.propertyDetail.prevImage}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white backdrop-blur-sm flex items-center justify-center opacity-80 hover:opacity-100 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={dict.propertyDetail.nextImage}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Index Badge */}
        <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {currentIndex + 1} / {allImages.length}
          </span>
        </div>
      </div>

      {/* Clickable Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {allImages.map((img, idx) => {
            const isSelected = idx === currentIndex;
            const thumbSrc = imgErrors[idx] ? '/images/property-placeholder.svg' : img;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden shrink-0 border transition-all ${
                  isSelected
                    ? 'ring-2 ring-emerald-600 ring-offset-2 border-emerald-500 scale-105 shadow-sm'
                    : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                }`}
                aria-label={`Select photo ${idx + 1}`}
              >
                <Image
                  src={thumbSrc}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                  onError={() => {
                    setImgErrors((prev) => ({ ...prev, [idx]: true }));
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
