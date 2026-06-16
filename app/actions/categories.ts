"use server";

import { revalidatePath } from "next/cache";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/db/categories";

export async function getCategoriesAction(): Promise<{ id: string; name: string; color: string }[]> {
  try {
    return await getCategories();
  } catch {
    return [];
  }
}

export async function createCategoryAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = ((formData.get("name") as string | null) ?? "").trim();
  if (!name) return "Category name is required";
  if (name.length > 30) return "Category name must be 30 characters or less";

  const color = (formData.get("color") as string | null) ?? "#6366f1";

  try {
    await createCategory({ name, color });
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to create category";
  }

  revalidatePath("/dashboard");
  return null;
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = ((formData.get("name") as string | null) ?? "").trim();
  if (!name) return "Category name is required";
  if (name.length > 30) return "Category name must be 30 characters or less";

  const color = (formData.get("color") as string | null) ?? "#6366f1";

  try {
    await updateCategory(categoryId, { name, color });
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to update category";
  }

  revalidatePath("/dashboard");
  return null;
}

export async function deleteCategoryAction(
  categoryId: string,
): Promise<string | null> {
  try {
    await deleteCategory(categoryId);
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to delete category";
  }

  revalidatePath("/dashboard");
  return null;
}
