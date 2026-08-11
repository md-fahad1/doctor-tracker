"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, ChevronRight } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";

const emptyForm = { name: "", specialization: "", hospital: "", phone: "", email: "" };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/doctors", {
        params: { search, specialization, from, to, page, limit: 8 },
      });
      setDoctors(data.doctors);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [search, specialization, from, to, page]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setPage(1);
  }, [search, specialization, from, to]);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Doctors</h1>
          <p className="text-sm text-slate-500">Manage doctors and their patient lists.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialization, hospital..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <input
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          placeholder="Filter by specialization"
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
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
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : doctors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  No doctors found.
                </td>
              </tr>
            ) : (
              doctors.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{doc.name}</td>
                  <td className="px-5 py-3 text-slate-600">{doc.specialization}</td>
                  <td className="px-5 py-3 text-slate-600">{doc.hospital}</td>
                  <td className="px-5 py-3 text-slate-600">
                    <div>{doc.phone}</div>
                    <div className="text-xs text-slate-400">{doc.email}</div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/doctors/${doc._id}`}
                      className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium"
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Doctor">
        <form onSubmit={handleCreate} className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {["name", "specialization", "hospital", "phone", "email"].map((field) => (
            <input
              key={field}
              required
              type={field === "email" ? "email" : "text"}
              placeholder={field[0].toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          ))}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5"
          >
            {saving ? "Saving..." : "Save Doctor"}
          </button>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}
