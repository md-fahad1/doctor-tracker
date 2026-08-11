"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/patients", {
        params: { search, condition, from, to, page, limit: 10 },
      });
      setPatients(data.patients);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [search, condition, from, to, page]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    setPage(1);
  }, [search, condition, from, to]);

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

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Patients</h1>
      <p className="text-sm text-slate-500 mb-6">All patients across every doctor.</p>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or condition..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <input
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="Filter by condition"
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
              <th className="px-5 py-3 font-medium">Doctor</th>
              <th className="px-5 py-3 font-medium">Condition</th>
              <th className="px-5 py-3 font-medium">Age / Gender</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  No patients found.
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-5 py-3 text-slate-600">{p.doctor?.name || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{p.condition}</td>
                  <td className="px-5 py-3 text-slate-600 capitalize">
                    {p.age} / {p.gender}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{p.phone}</td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button
                      onClick={() => setEditing({ ...p })}
                      className="text-sky-600 hover:text-sky-700 inline-flex"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-500 hover:text-red-700 inline-flex"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Patient">
        {editing && (
          <form onSubmit={handleUpdate} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <input
              required
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              required
              type="number"
              min="0"
              value={editing.age}
              onChange={(e) => setEditing({ ...editing, age: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={editing.gender}
              onChange={(e) => setEditing({ ...editing, gender: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              required
              value={editing.phone}
              onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              required
              value={editing.condition}
              onChange={(e) => setEditing({ ...editing, condition: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </Modal>
    </ProtectedLayout>
  );
}
