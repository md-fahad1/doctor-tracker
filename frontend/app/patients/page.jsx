"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  SearchX,
} from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";

const AVATAR_COLORS = {
  male: "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  female: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  other: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const CONDITION_COLORS = [
  "bg-teal-50 text-teal-700 ring-teal-100",
  "bg-sky-50 text-sky-700 ring-sky-100",
  "bg-violet-50 text-violet-700 ring-violet-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-pink-50 text-pink-700 ring-pink-100",
];

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function hashColor(str = "", palette) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const effectiveSearch = useMemo(() => {
    const trimmed = search.trim();
    return trimmed.length >= 1 ? trimmed : "";
  }, [search]);

  const hasActiveFilters = Boolean(effectiveSearch || condition || from || to);

  const requestId = useRef(0);

  const fetchPatients = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const { data } = await api.get("/patients", {
        params: { search: effectiveSearch, condition, from, to, page, limit: 10 },
      });
      if (currentRequest !== requestId.current) return;
      setPatients(data.patients);
      setTotalPages(data.totalPages);
      setTotalPatients(data.totalPatients ?? data.patients.length);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [effectiveSearch, condition, from, to, page]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    setPage(1);
  }, [effectiveSearch, condition, from, to]);

  const clearAllFilters = () => {
    setSearch("");
    setCondition("");
    setFrom("");
    setTo("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/patients/${editing._id}`, editing);
      setEditing(null);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update patient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this patient?")) return;
    await api.delete(`/patients/${id}`);
    setPatients((prev) => prev.filter((p) => p._id !== id));
  };

  const skeletonRows = useMemo(() => Array.from({ length: 6 }), []);

  return (
    <ProtectedLayout>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Patients
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? "Loading..."
              : `${totalPatients} patient${totalPatients === 1 ? "" : "s"} across every doctor`}
          </p>
        </div>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or condition..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Filter by condition"
              className="w-44 rounded-lg border border-slate-300 py-2 pl-3 pr-8 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
            />
            {condition && (
              <button
                type="button"
                onClick={() => setCondition("")}
                aria-label="Clear condition filter"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-600/10">
            <CalendarDays className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[124px] bg-transparent text-sm text-slate-700 focus:outline-none"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-[124px] bg-transparent text-sm text-slate-700 focus:outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ---------- Table ---------- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-left">
            <tr>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Name
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Doctor
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Condition
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Age / Gender
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              skeletonRows.map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-3.5" colSpan={6}>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <SearchX className="h-5 w-5 text-slate-400" />
                    </span>
                    <p className="text-sm font-medium text-slate-600">
                      No patients found
                    </p>
                    <p className="text-xs text-slate-400">
                      {hasActiveFilters
                        ? "Try adjusting or clearing your filters."
                        : "Patients you add will show up here."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-1 text-xs font-medium text-teal-700 hover:text-teal-800"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p._id} className="group transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          AVATAR_COLORS[p.gender] || AVATAR_COLORS.other
                        }`}
                      >
                        {initialsOf(p.name)}
                      </span>
                      <span className="font-medium text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {p.doctor?.name ? (
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                          {initialsOf(p.doctor.name)}
                        </span>
                        <span>{p.doctor.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${hashColor(
                        p.condition,
                        CONDITION_COLORS
                      )}`}
                    >
                      {p.condition}
                    </span>
                  </td>
                  <td className="px-5 py-3 capitalize text-slate-600">
                    {p.age} / {p.gender}
                  </td>
                  <td className="px-5 py-3 font-[ui-monospace] text-[13px] text-slate-500">
                    {p.phone}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1 transition-opacity opacity-100">
                      <button
                        onClick={() => setEditing({ ...p })}
                        aria-label="Edit patient"
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        aria-label="Delete patient"
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit patient">
        {editing && (
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Name
              </label>
              <input
                required
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                  Age
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={editing.age}
                  onChange={(e) => setEditing({ ...editing, age: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                  Gender
                </label>
                <select
                  value={editing.gender}
                  onChange={(e) => setEditing({ ...editing, gender: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Phone
              </label>
              <input
                required
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Condition
              </label>
              <input
                required
                value={editing.condition}
                onChange={(e) => setEditing({ ...editing, condition: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </Modal>
    </ProtectedLayout>
  );
}