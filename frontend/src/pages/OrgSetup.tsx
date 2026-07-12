import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import * as departmentService from "@/services/departmentService";
import * as categoryService from "@/services/categoryService";
import * as employeeService from "@/services/employeeService";
import { Department, AssetCategory, Employee } from "@/types/orgSetup";
import DepartmentsTab from "@/pages/orgSetup/DepartmentsTab";
import CategoriesTab from "@/pages/orgSetup/CategoriesTab";
import EmployeesTab from "@/pages/orgSetup/EmployeesTab";

type Tab = "departments" | "categories" | "employees";
const VALID_TABS: Tab[] = ["departments", "categories", "employees"];

export default function OrgSetup() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: Tab = VALID_TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "departments";
  const setTab = (t: Tab) => setSearchParams({ tab: t });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [d, c, e] = await Promise.all([
        departmentService.listDepartments(),
        categoryService.listCategories(),
        employeeService.listEmployees(),
      ]);
      setDepartments(d);
      setCategories(c);
      setEmployees(e);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load organization data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "departments", label: "Departments" },
    { key: "categories", label: "Asset Categories" },
    { key: "employees", label: "Employee Directory" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Organization Setup</h1>
      <p className="mb-6 text-sm text-gray-500">Master data everything else depends on.</p>

      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && !error && (
        <>
          {tab === "departments" && (
            <DepartmentsTab departments={departments} employees={employees} refetch={loadAll} />
          )}
          {tab === "categories" && <CategoriesTab categories={categories} refetch={loadAll} />}
          {tab === "employees" && (
            <EmployeesTab employees={employees} departments={departments} refetch={loadAll} />
          )}
        </>
      )}
    </div>
  );
}
