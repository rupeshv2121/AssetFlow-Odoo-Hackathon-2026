import { apiClient } from "@/services/apiClient";
import { AssetCategory } from "@/types/orgSetup";

export async function listCategories(): Promise<AssetCategory[]> {
  const { data } = await apiClient.get<{ categories: AssetCategory[] }>("/categories");
  return data.categories;
}

export async function createCategory(input: { name: string }): Promise<AssetCategory> {
  const { data } = await apiClient.post<{ category: AssetCategory }>("/categories", input);
  return data.category;
}

export async function updateCategory(id: string, input: { name: string }): Promise<AssetCategory> {
  const { data } = await apiClient.patch<{ category: AssetCategory }>(`/categories/${id}`, input);
  return data.category;
}
