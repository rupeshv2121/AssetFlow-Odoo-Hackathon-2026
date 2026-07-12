import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import * as categoryService from "@/services/categoryService";
import { AssetCategory } from "@/types/orgSetup";

interface Props {
  categories: AssetCategory[];
  refetch: () => void;
}

type FieldRow = { key: string; value: string };

function extraFieldsToRows(extraFields: AssetCategory["extraFields"]): FieldRow[] {
  if (!extraFields) return [];
  return Object.entries(extraFields).map(([key, value]) => ({ key, value: String(value) }));
}

export default function CategoriesTab({ categories, refetch }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<FieldRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function startCreate() {
    setEditingId(null);
    setName("");
    setFields([]);
    setError(null);
    setShowForm(true);
  }

  function startEdit(cat: AssetCategory) {
    setEditingId(cat.id);
    setName(cat.name);
    setFields(extraFieldsToRows(cat.extraFields));
    setError(null);
    setShowForm(true);
  }

  function updateField(index: number, patch: Partial<FieldRow>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const extraFields = fields.reduce<Record<string, string>>((acc, f) => {
        if (f.key.trim()) acc[f.key.trim()] = f.value;
        return acc;
      }, {});
      const payload = { name, extraFields: Object.keys(extraFields).length ? extraFields : undefined };
      if (editingId) {
        await categoryService.updateCategory(editingId, payload);
      } else {
        await categoryService.createCategory(payload);
      }
      setShowForm(false);
      refetch();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Asset Categories</h2>
        <button
          onClick={startCreate}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Electronics, Furniture, Vehicles..."
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Category-specific fields <span className="text-gray-400">(optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setFields((f) => [...f, { key: "", value: "" }])}
                className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline"
              >
                <Plus size={12} /> Add field
              </button>
            </div>
            <p className="mb-2 text-xs text-gray-400">
              e.g. "Warranty Period" → "2 years" for Electronics
            </p>
            <div className="space-y-2">
              {fields.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={f.key}
                    onChange={(e) => updateField(i, { key: e.target.value })}
                    placeholder="Field name"
                    className="w-1/2 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  />
                  <input
                    value={f.value}
                    onChange={(e) => updateField(i, { value: e.target.value })}
                    placeholder="Value"
                    className="w-1/2 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    className="rounded-md border border-gray-300 px-2 text-gray-500 hover:bg-gray-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingId ? "Save changes" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Custom Fields</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => {
              const rows = extraFieldsToRows(c.extraFields);
              return (
                <tr key={c.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {rows.length === 0 ? (
                      "—"
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {rows.map((r) => (
                          <span
                            key={r.key}
                            className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"
                          >
                            {r.key}: {r.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => startEdit(c)} className="text-sm text-gray-600 hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
