"use server";

import { revalidatePath } from "next/cache";
import { generateId, getBanners, saveBanners } from "@/lib/data";
import { saveUploadedImage } from "@/lib/uploads";
import type { Banner } from "@/lib/types";

function revalidatePublicPages() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
  revalidatePath("/tienda");
}

export type BannerFormState = { error?: string };

export async function upsertBanner(
  _prevState: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  try {
    const id = String(formData.get("id") || "");
    const title = String(formData.get("title") || "").trim();
    const subtitle = String(formData.get("subtitle") || "").trim();
    const linkUrl = String(formData.get("linkUrl") || "/tienda").trim();
    const active = formData.get("active") === "on";
    const removeImage = formData.get("removeImage") === "on";
    const imageFile = formData.get("image") as File | null;

    if (!title) throw new Error("El título es obligatorio.");

    const banners = await getBanners();
    const uploadedUrl = await saveUploadedImage(imageFile);

    if (id) {
      const index = banners.findIndex((b) => b.id === id);
      if (index === -1) throw new Error("Banner no encontrado.");
      const existing = banners[index];
      banners[index] = {
        ...existing,
        title,
        subtitle,
        linkUrl,
        active,
        imageUrl: uploadedUrl ?? (removeImage ? "" : existing.imageUrl),
      };
    } else {
      const maxOrder = banners.reduce((max, b) => Math.max(max, b.order), 0);
      const newBanner: Banner = {
        id: generateId("banner"),
        title,
        subtitle,
        linkUrl,
        active,
        imageUrl: uploadedUrl ?? "",
        order: maxOrder + 1,
      };
      banners.push(newBanner);
    }

    await saveBanners(banners);
    revalidatePublicPages();
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ocurrió un error inesperado." };
  }
}

export async function deleteBanner(formData: FormData) {
  const id = String(formData.get("id") || "");
  const banners = await getBanners();
  await saveBanners(banners.filter((b) => b.id !== id));
  revalidatePublicPages();
}

export async function moveBanner(formData: FormData) {
  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "");
  const banners = await getBanners();

  const index = banners.findIndex((b) => b.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= banners.length) return;

  const orderA = banners[index].order;
  const orderB = banners[swapWith].order;
  banners[index].order = orderB;
  banners[swapWith].order = orderA;

  await saveBanners(banners);
  revalidatePublicPages();
}
