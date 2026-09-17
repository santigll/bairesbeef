"use server";

import { revalidatePath } from "next/cache";
import {
  generateId,
  getProducts,
  getVariantGroups,
  saveProducts,
  saveVariantGroups,
  slugify,
} from "@/lib/data";

function revalidatePublicPages() {
  revalidatePath("/admin/variantes");
  revalidatePath("/admin/productos");
  revalidatePath("/tienda");
}

export type VariantGroupFormState = { error?: string };

export async function upsertGroup(
  _prevState: VariantGroupFormState,
  formData: FormData
): Promise<VariantGroupFormState> {
  try {
    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    if (!name) throw new Error("El nombre es obligatorio.");

    const groups = await getVariantGroups();

    if (id) {
      const index = groups.findIndex((g) => g.id === id);
      if (index === -1) throw new Error("Variante no encontrada.");
      groups[index] = { ...groups[index], name };
    } else {
      const maxOrder = groups.reduce((max, g) => Math.max(max, g.order), 0);
      groups.push({ id: generateId("vg"), name, order: maxOrder + 1, options: [] });
    }

    await saveVariantGroups(groups);
    revalidatePublicPages();
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ocurrió un error inesperado." };
  }
}

export async function deleteGroup(formData: FormData) {
  const id = String(formData.get("id") || "");
  const [groups, products] = await Promise.all([getVariantGroups(), getProducts()]);

  const inUse = products.some((p) =>
    p.variantSelections?.some((sel) => sel.groupId === id)
  );
  if (inUse) {
    return; // guarded in the UI: only offered when unused
  }

  await saveVariantGroups(groups.filter((g) => g.id !== id));
  revalidatePublicPages();
}

export type AddOptionFormState = { error?: string };

export async function addOption(
  _prevState: AddOptionFormState,
  formData: FormData
): Promise<AddOptionFormState> {
  try {
    const groupId = String(formData.get("groupId") || "");
    const label = String(formData.get("label") || "").trim();
    if (!label) throw new Error("El nombre de la opción es obligatorio.");

    const groups = await getVariantGroups();
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error("Variante no encontrada.");

    const base = slugify(label) || "opcion";
    const taken = new Set(group.options.map((o) => o.key));
    let key = base;
    let i = 2;
    while (taken.has(key)) {
      key = `${base}-${i}`;
      i += 1;
    }

    group.options.push({ key, label });
    await saveVariantGroups(groups);
    revalidatePublicPages();
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ocurrió un error inesperado." };
  }
}

export async function removeOption(formData: FormData) {
  const groupId = String(formData.get("groupId") || "");
  const key = String(formData.get("key") || "");

  const [groups, products] = await Promise.all([getVariantGroups(), getProducts()]);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;
  group.options = group.options.filter((o) => o.key !== key);

  // Cascade: drop the removed option from any product's matching variant
  // slot, so nothing references a key that no longer exists in the group.
  let productsChanged = false;
  const updatedProducts = products.map((p) => {
    if (!p.variantSelections?.some((sel) => sel.groupId === groupId && sel.optionKeys.includes(key))) {
      return p;
    }
    productsChanged = true;
    return {
      ...p,
      variantSelections: p.variantSelections.map((sel) => {
        if (sel.groupId !== groupId) return sel;
        const optionNotes = { ...sel.optionNotes };
        delete optionNotes[key];
        return {
          ...sel,
          optionKeys: sel.optionKeys.filter((k) => k !== key),
          optionNotes,
        };
      }),
    };
  });

  await Promise.all([
    saveVariantGroups(groups),
    productsChanged ? saveProducts(updatedProducts) : Promise.resolve(),
  ]);
  revalidatePublicPages();
}
