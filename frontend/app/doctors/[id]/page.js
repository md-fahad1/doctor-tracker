"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import api from "@/lib/api";

const emptyForm = { name: "", age: "", gender: "male", phone: "", condition: "" };

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

  return (
    <ProtectedLayout>
      <button
        onClick={() => router.push("/doctors")}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to doctors
      </button>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{doctor.name}</h1>
              <p className="text-sm text-slate-500">
                {doctor.specialization} · {doctor.hospital}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {doctor.phone} · {doctor.email}
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg px-4 py-2"
            >
              <Plus className="w-4 h-4" /> Add Patient
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Age</th>
                  <th className="px-5 py-3 font-medium">Gender</th>
                  <th className="px-5 py-3 font-medium">Condition</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                      No patients yet for this doctor.
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-5 py-3 text-slate-600">{p.age}</td>
                      <td className="px-5 py-3 text-slate-600 capitalize">{p.gender}</td>
                      <td className="px-5 py-3 text-slate-600">{p.condition}</td>
                      <td className="px-5 py-3 text-slate-600">{p.phone}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeletePatient(p._id)}
                          className="text-red-500 hover:text-red-700"
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
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Patient">
        <form onSubmit={handleAddPatient} className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            required
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          <input
            required
            placeholder="Condition"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5"
          >
            {saving ? "Saving..." : "Add Patient"}
          </button>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}