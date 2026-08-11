
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Phone, Mail, Building2, Users } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import api from "@/lib/api";

const emptyForm = { name: "", age: "", gender: "male", phone: "", condition: "" };

const CONDITION_COLORS = [
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-cyan-50 text-cyan-700",
];

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function conditionColor(condition) {
  let hash = 0;
  for (let i = 0; i < condition.length; i++) hash = condition.charCodeAt(i) + ((hash << 5) - hash);
  return CONDITION_COLORS[Math.abs(hash) % CONDITION_COLORS.length];
}

function FieldLabel({ children }) {
  return <label className="block text-xs font-medium text-slate-600 mb-1">{children}</label>;
}

export default function DoctorDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [doctorRes, patientsRes] = await Promise.all([
        api.get(`/doctors/${id}`),
        api.get(`/doctors/${id}/patients`),
      ]);
      setDoctor(doctorRes.data);
      setPatients(patientsRes.data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post(`/doctors/${id}/patients`, form);
      setModalOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add patient");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!confirm("Remove this patient?")) return;
    await api.delete(`/patients/${patientId}`);
    setPatients((prev) => prev.filter((p) => p._id !== patientId));
  };

  const maleCount = patients.filter((p) => p.gender === "male").length;
  const femaleCount = patients.filter((p) => p.gender === "female").length;
  const avgAge = patients.length
    ? Math.round(patients.reduce((sum, p) => sum + Number(p.age || 0), 0) / patients.length)
    : 0;

  return (
    <ProtectedLayout>
      <button
        onClick={() => router.push("/doctors")}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to doctors
      </button>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 bg-slate-100 rounded w-40 max-w-full" />
              <div className="h-3 bg-slate-100 rounded w-56 max-w-full" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 h-64" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6">
            <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 w-full sm:w-auto">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xl font-semibold shrink-0">
                  {initials(doctor.name)}
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-semibold text-slate-900 break-words">
                    {doctor.name}
                  </h1>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                      {doctor.specialization}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="break-words">{doctor.hospital}</span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 break-all">
                      <Phone className="w-3.5 h-3.5 shrink-0" /> {doctor.phone}
                    </span>

                    <span className="inline-flex items-center gap-1 break-all">
                      <Mail className="w-3.5 h-3.5 shrink-0" /> {doctor.email}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg px-4 py-2.5 w-full sm:w-auto shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Patient
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">Total Patients</p>
              <p className="text-2xl font-semibold text-slate-900">{patients.length}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">Male</p>
              <p className="text-2xl font-semibold text-slate-900">{maleCount}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">Female</p>
              <p className="text-2xl font-semibold text-slate-900">{femaleCount}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">Avg. Age</p>
              <p className="text-2xl font-semibold text-slate-900">{avgAge || "—"}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" /> Patients
              </h2>

              <span className="text-xs text-slate-400">{patients.length} total</span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Age / Gender</th>
                    <th className="px-5 py-3 font-medium">Condition</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        No patients yet for this doctor.
                      </td>
                    </tr>
                  ) : (
                    patients.map((p, i) => (
                      <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                            >
                              {initials(p.name)}
                            </div>

                            <span className="font-medium text-slate-900 whitespace-nowrap">
                              {p.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3 text-slate-600 capitalize whitespace-nowrap">
                          {p.age} yrs · {p.gender}
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${conditionColor(p.condition)}`}
                          >
                            {p.condition}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                          {p.phone}
                        </td>

                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDeletePatient(p._id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                            title="Remove patient"
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
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Patient">
        <form onSubmit={handleAddPatient} className="space-y-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <FieldLabel>Full Name</FieldLabel>
            <input
              required
              placeholder="e.g. John Carter"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Age</FieldLabel>
              <input
                required
                type="number"
                min="0"
                placeholder="e.g. 34"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <FieldLabel>Gender</FieldLabel>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
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
            <FieldLabel>Condition</FieldLabel>
            <input
              required
              placeholder="e.g. Hypertension"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
          >
            {saving ? "Saving..." : "Add Patient"}
          </button>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}
