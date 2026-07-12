import { apiClient } from "@/services/apiClient";
import { Asset, AssetDetail, AssetStatus } from "@/types/asset";

export interface AssetFilters {
  q?: string;
  categoryId?: string;
  status?: AssetStatus;
  location?: string;
}

export async function listAssets(filters: AssetFilters = {}): Promise<Asset[]> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const { data } = await apiClient.get<{ assets: Asset[] }>("/assets", { params });
  return data.assets;
}

export async function getAsset(id: string): Promise<AssetDetail> {
  const { data } = await apiClient.get<{ asset: AssetDetail }>(`/assets/${id}`);
  return data.asset;
}

export interface CreateAssetInput {
  name: string;
  categoryId: string;
  serialNumber?: string;
  acquisitionDate?: string;
  acquisitionCost?: number;
  condition?: string;
  location?: string;
  isBookable?: boolean;
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const { data } = await apiClient.post<{ asset: Asset }>("/assets", input);
  return data.asset;
}

export async function updateAsset(id: string, input: Partial<CreateAssetInput>): Promise<Asset> {
  const { data } = await apiClient.patch<{ asset: Asset }>(`/assets/${id}`, input);
  return data.asset;
}

export async function updateAssetStatus(
  id: string,
  status: "AVAILABLE" | "LOST" | "RETIRED" | "DISPOSED"
): Promise<Asset> {
  const { data } = await apiClient.patch<{ asset: Asset }>(`/assets/${id}/status`, { status });
  return data.asset;
}
