"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronRight,
  X,
  Stethoscope,
  SlidersHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const emptyForm = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

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
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function FieldLabel({ children }) {
  return (
    <label className="mb-1 block text-xs font-medium text-slate-600">
      {children}
    </label>
  );
}

function TableSkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100" />
          <div className="h-3 w-28 rounded bg-slate-100" />
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="h-3 w-24 rounded bg-slate-100" />
      </td>
      <td className="px-5 py-3">
        <div className="h-3 w-32 rounded bg-slate-100" />
      </td>
      <td className="px-5 py-3">
        <div className="h-3 w-28 rounded bg-slate-100" />
      </td>
      <td className="px-5 py-3">
        <div className="h-3 w-20 rounded bg-slate-100" />
      </td>
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

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteDoctor, setDeleteDoctor] = useState(null);
  const [deletePatientCount, setDeletePatientCount] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const requestId = useRef(0);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const effectiveSearch = useMemo(() => {
    const trimmed = search.trim();
    return trimmed.length >= 1 ? trimmed : "";
  }, [search]);

  const hasActiveFilters = Boolean(
    effectiveSearch || specialization || from || to,
  );

  const fetchDoctors = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    try {
      const { data } = await api.get("/doctors", {
        params: {
          search: effectiveSearch,
          specialization,
          from,
          to,
          page,
          limit: 8,
        },
      });

      if (currentRequest !== requestId.current) return;

      setDoctors(data.doctors);
      setTotalPages(data.totalPages);
      setTotalDoctors(data.totalDoctors ?? data.doctors.length);
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
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

  const openAddModal = () => {
    setForm(emptyForm);
    setError("");
    setEditingDoctor(null);
    setModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setError("");
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      hospital: doctor.hospital || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
    });
    setModalOpen(true);
  };

  const closeDoctorModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingDoctor(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor._id}`, form);
      } else {
        await api.post("/doctors", form);
      }

      closeDoctorModal();
      await fetchDoctors();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingDoctor
            ? "Failed to update doctor"
            : "Failed to create doctor"),
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = async (doctor) => {
    setDeleteDoctor(doctor);
    setDeletePatientCount(0);
    setDeleteConfirmText("");
    setDeleteError("");
    setDeleteLoading(true);

    try {
      const { data } = await api.get(`/doctors/${doctor._id}/patients`);

      if (Array.isArray(data)) {
        setDeletePatientCount(data.length);
      } else if (Array.isArray(data?.patients)) {
        setDeletePatientCount(data.patients.length);
      } else {
        setDeletePatientCount(0);
      }
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Unable to check the doctor's patients.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteDoctor(null);
    setDeletePatientCount(0);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  const handleDeleteDoctor = async () => {
    if (!deleteDoctor) return;

    if (
      deletePatientCount > 0 &&
      deleteConfirmText.trim().toUpperCase() !== "DELETE"
    ) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await api.delete(`/doctors/${deleteDoctor._id}`);

      setDoctors((prev) =>
        prev.filter((doctor) => doctor._id !== deleteDoctor._id),
      );

      setTotalDoctors((prev) => Math.max(prev - 1, 0));

      if (doctors.length === 1 && page > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      }

      closeDeleteModal();
      await fetchDoctors();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete doctor");
      setDeleteLoading(false);
    }
  };

  const deleteConfirmationValid =
    deletePatientCount === 0 ||
    deleteConfirmText.trim().toUpperCase() === "DELETE";

  return (
    <ProtectedLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Doctors</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {loading
              ? "Loading..."
              : `${totalDoctors} doctor${
                  totalDoctors === 1 ? "" : "s"
                } on record`}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </button>
        )}
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Search & Filter
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative min-w-0 flex-1 lg:min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialization, hospital..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <input
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="Specialization"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 sm:w-40"
          />

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 sm:w-auto"
            />

            <span className="hidden text-xs text-slate-400 sm:block">to</span>

            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 sm:w-auto"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex w-fit items-center gap-1.5 px-2 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Specialization</th>
                <th className="px-5 py-3 font-medium">Hospital</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableSkeletonRows />
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Stethoscope className="h-6 w-6 text-slate-300" />

                      <p className="text-sm text-slate-400">
                        {hasActiveFilters
                          ? "No doctors match your filters."
                          : "No doctors found."}
                      </p>

                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm font-medium text-teal-700 hover:text-teal-800"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr
                    key={doc._id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(
                            doc.name,
                          )}`}
                        >
                          {initials(doc.name)}
                        </div>

                        <span className="font-medium text-slate-900">
                          {doc.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                        {doc.specialization}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-slate-600">{doc.hospital}</td>

                    <td className="px-5 py-3 text-slate-600">
                      <div>{doc.phone}</div>
                      <div className="text-xs text-slate-400">{doc.email}</div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/doctors/${doc._id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-800"
                        >
                          Patients
                          <ChevronRight className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() => openEditModal(doc)}
                          aria-label={`Edit ${doc.name}`}
                          title="Edit doctor"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openDeleteModal(doc)}
                          aria-label={`Delete ${doc.name}`}
                          title="Delete doctor"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
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

        <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex justify-center sm:justify-end">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeDoctorModal}
        title={editingDoctor ? "Edit Doctor" : "Add Doctor"}
      >
        <form onSubmit={handleSaveDoctor} className="space-y-3">
          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Specialization</FieldLabel>
              <input
                required
                placeholder="e.g. Cardiology"
                value={form.specialization}
                onChange={(e) =>
                  setForm({
                    ...form,
                    specialization: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <FieldLabel>Hospital</FieldLabel>
              <input
                required
                placeholder="e.g. City General"
                value={form.hospital}
                onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? editingDoctor
                ? "Saving..."
                : "Creating..."
              : editingDoctor
                ? "Save Changes"
                : "Save Doctor"}
          </button>
        </form>
      </Modal>

      <Modal
        open={!!deleteDoctor}
        onClose={closeDeleteModal}
        title="Delete Doctor"
      >
        {deleteDoctor && (
          <div className="space-y-5">
            {deleteError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">
                  Delete {deleteDoctor.name}?
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-600">
                  This action cannot be undone. The doctor and all associated
                  patient records will be permanently deleted.
                </p>
              </div>
            </div>

            {deleteLoading ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-teal-700" />
                  Checking patient records...
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Associated patients
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Patient records connected to this doctor
                      </p>
                    </div>

                    <span className="text-2xl font-semibold text-slate-900">
                      {deletePatientCount}
                    </span>
                  </div>
                </div>

                {deletePatientCount > 0 && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Type DELETE to confirm
                    </label>

                    <input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      autoComplete="off"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium uppercase tracking-wide text-slate-900 placeholder:normal-case placeholder:tracking-normal focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      This confirmation is required because this doctor has{" "}
                      {deletePatientCount} associated patient
                      {deletePatientCount === 1 ? "" : "s"}.
                    </p>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={deleteLoading}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteDoctor}
                    disabled={deleteLoading || !deleteConfirmationValid}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteLoading ? "Deleting..." : "Delete Doctor"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </ProtectedLayout>
  );
}
