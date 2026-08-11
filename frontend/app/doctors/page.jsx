"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, ChevronRight, X, Stethoscope, SlidersHorizontal } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";

const emptyForm = { name: "", specialization: "", hospital: "", phone: "", email: "" };

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function FieldLabel({ children }) {
  return <label className="block text-xs font-medium text-slate-600 mb-1">{children}</label>;
}

function TableSkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
          <div className="h-3 bg-slate-100 rounded w-28" />
        </div>
      </td>
      <td className="px-5 py-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
      <td className="px-5 py-3"><div className="h-3 bg-slate-100 rounded w-32" /></td>
      <td className="px-5 py-3"><div className="h-3 bg-slate-100 rounded w-28" /></td>
      <td className="px-5 py-3" />
    </tr>
  ));
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const requestId = useRef(0);

  const effectiveSearch = useMemo(() => {
    const trimmed = search.trim();
    return trimmed.length >= 1 ? trimmed : "";
  }, [search]);

  const hasActiveFilters = Boolean(effectiveSearch || specialization || from || to);

  const fetchDoctors = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const { data } = await api.get("/doctors", {
        params: { search: effectiveSearch, specialization, from, to, page, limit: 8 },
      });
      if (currentRequest !== requestId.current) return;
      setDoctors(data.doctors);
      setTotalPages(data.totalPages);
      setTotalDoctors(data.totalDoctors ?? data.doctors.length);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [effectiveSearch, specialization, from, to, page]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    setPage(1);
  }, [effectiveSearch, specialization, from, to]);

  const clearFilters = () => {
    setSearch("");
    setSpecialization("");
    setFrom("");
    setTo("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/doctors", form);
      setModalOpen(false);
      setForm(emptyForm);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create doctor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Doctors</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? "Loading..." : `${totalDoctors} doctor${totalDoctors === 1 ? "" : "s"} on record`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-slate-500">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Search & Filter
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialization, hospital..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <input
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="Specialization"
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 w-40"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 px-2 py-2"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Specialization</th>
              <th className="px-5 py-3 font-medium">Hospital</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <TableSkeletonRows />
            ) : doctors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Stethoscope className="w-6 h-6 text-slate-300" />
                    <p className="text-sm text-slate-400">
                      {hasActiveFilters ? "No doctors match your filters." : "No doctors found."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-teal-700 font-medium hover:text-teal-800"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              doctors.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(doc.name)}`}
                      >
                        {initials(doc.name)}
                      </div>
                      <span className="font-medium text-slate-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                      {doc.specialization}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{doc.hospital}</td>
                  <td className="px-5 py-3 text-slate-600">
                    <div>{doc.phone}</div>
                    <div className="text-xs text-slate-400">{doc.email}</div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/doctors/${doc._id}`}
                      className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-medium"
                    >
                      Patients <ChevronRight className="w-4 h-4" />
                    </Link>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Doctor">
        <form onSubmit={handleCreate} className="space-y-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <FieldLabel>Full Name</FieldLabel>
            <input
              required
              placeholder="e.g. Dr. Sarah Johnson"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Specialization</FieldLabel>
              <input
                required
                placeholder="e.g. Cardiology"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <FieldLabel>Hospital</FieldLabel>
              <input
                required
                placeholder="e.g. City General"
                value={form.hospital}
                onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <FieldLabel>Phone</FieldLabel>
            <input
              required
              placeholder="e.g. +1 555 123 4567"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <FieldLabel>Email</FieldLabel>
            <input
              required
              type="email"
              placeholder="e.g. sarah.johnson@hospital.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
          >
            {saving ? "Saving..." : "Save Doctor"}
          </button>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}