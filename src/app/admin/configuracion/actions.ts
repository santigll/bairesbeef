"use server";

import { revalidatePath } from "next/cache";
import { getSettings, saveSettings } from "@/lib/data";
import { saveUploadedImage } from "@/lib/uploads";

export async function updateSettings(formData: FormData) {
  const current = await getSettings();
  const logoFile = formData.get("logo") as File | null;
  const uploadedLogo = await saveUploadedImage(logoFile);

  const bullets = String(formData.get("mayoristaBullets") || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  await saveSettings({
    ...current,
    storeName: String(formData.get("storeName") || current.storeName).trim(),
    tagline: String(formData.get("tagline") || current.tagline).trim(),
    logoUrl: uploadedLogo ?? current.logoUrl,
    whatsappMinorista: String(formData.get("whatsappMinorista") || "").trim(),
    whatsappMayorista: String(formData.get("whatsappMayorista") || "").trim(),
    mayoristaIntro: String(formData.get("mayoristaIntro") || "").trim(),
    mayoristaBullets: bullets.length > 0 ? bullets : current.mayoristaBullets,
    address: String(formData.get("address") || "").trim(),
    hours: String(formData.get("hours") || "").trim(),
    instagram: String(formData.get("instagram") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    minOrderNote: String(formData.get("minOrderNote") || "").trim(),
  });

  revalidatePath("/", "layout");
}
