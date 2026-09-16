"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Banner } from "@/lib/types";

export default function PromoBanner({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const banner = banners[Math.min(index, banners.length - 1)];

  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      {banner.imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={banner.imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
        </div>
      )}

      <Link
        href={banner.linkUrl || "/tienda"}
        className="relative z-10 block"
      >
        <div className="container-page flex min-h-[220px] items-center py-12 sm:min-h-[300px]">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl leading-none tracking-wide sm:text-5xl">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="mt-3 text-paper/70 sm:text-lg">{banner.subtitle}</p>
            )}
          </div>
        </div>
      </Link>

      {banners.length > 1 && (
        <div className="relative z-10 flex justify-center gap-2 pb-5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Ir al banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-accent" : "w-1.5 bg-paper/30"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
