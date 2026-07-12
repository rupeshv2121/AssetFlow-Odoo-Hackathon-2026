import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as assetService from "@/services/assetService";
import * as categoryService from "@/services/categoryService";
import { useAuth } from "@/context/AuthContext";
import { Asset, AssetStatus } from "@/types/asset";
import { AssetCategory } from "@/types/orgSetup";

const STATUS_OPTIONS: AssetStatus[] = [
  "AVAILABLE",
  "ALLOCATED",
  "RESERVED",
  "UNDER_MAINTENANCE",
  "LOST",
  "RETIRED",
  "DISPOSED",
];

const statusColor: Record<AssetStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  ALLOCATED: "bg-blue-100 text-blue-700",
  RESERVED: "bg-purple-100 text-purple-700",
  UNDER_MAINTENANCE: "bg-amber-100 text-amber-700",
  LOST: "bg-red-100 text-red-700",
  RETIRED: "bg-gray-200 text-gray-600",
  DISPOSED: "bg-gray-200 text-gray-400",
};

const emptyForm = {
  name: "",
  categoryId: "",
  serialNumber: "",
  acquisitionDate: "",
  acquisitionCost: "",
  condition: "",
  location: "",
  isBookable: false,
};

export default function AssetDirectory() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await assetService.listAssets({
        q: q || undefined,
        categoryId: categoryId || undefined,
        status: (status || undefined) as AssetStatus | undefined,
      });
      setAssets(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  }, [q, categoryId, status]);

  useEffect(() => {
    categoryService.listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await assetService.createAsset({
        name: form.name,
        categoryId: form.categoryId,
        serialNumber: form.serialNumber || undefined,
        acquisitionDate: form.acquisitionDate || undefined,
        acquisitionCost: form.acquisitionCost ? Number(form.acquisitionCost) : undefined,
        condition: form.condition || undefined,
        location: form.location || undefined,
        isBookable: form.isBookable,
      });
      setShowForm(false);
      setForm(emptyForm);
      loadAssets();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to register asset");
    } finally {
      setIsSubmitting(false);
    }
  }

  function holderLabel(asset: Asset): string {
    const holder = asset.allocations[0];
    if (!holder) return "—";
    return holder.employee?.name || holder.department?.name || "—";
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Asset Directory</h1>
          <p className="text-sm text-gray-500">Register and track assets through their lifecycle.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {showForm ? "Cancel" : "Register Asset"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-md border border-gray-200 bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Acquisition Date</label>
            <input
              type="date"
              value={form.acquisitionDate}
              onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Acquisition Cost</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.acquisitionCost}
              onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Condition</label>
            <input
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              placeholder="New, Good, Fair..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isBookable}
                onChange={(e) => setForm({ ...form, isBookable: e.target.checked })}
              />
              Shared / bookable resource
            </label>
          </div>

          {formError && <p className="sm:col-span-2 text-sm text-red-600">{formError}</p>}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tag, name, serial..."
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && !error && (
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Tag</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Held By</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">{a.assetTag}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-2 text-gray-600">{a.category.name}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{holderLabel(a)}</td>
                  <td className="px-4 py-2 text-gray-600">{a.location || "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <Link to={`/assets/${a.id}`} className="text-sm text-gray-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    No assets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
