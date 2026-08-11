"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  ShieldCheck,
  Users as UsersIcon,
  X,
  SearchX,
} from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

const AVATAR_COLORS = [
  "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
  "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
];

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
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
    <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
      {children}
    </label>
  );
}

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  const effectiveSearch = useMemo(() => {
    const trimmed = search.trim();
    return trimmed.length >= 1 ? trimmed : "";
  }, [search]);

  const hasActiveFilters = Boolean(effectiveSearch || role || status);

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== "admin") return;

    setLoading(true);

    try {
      const { data } = await api.get("/users", {
        params: {
          search: effectiveSearch,
          role,
          status,
          page,
          limit: 10,
        },
      });

      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.totalUsers ?? data.users?.length ?? 0);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [user, effectiveSearch, role, status, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [effectiveSearch, role, status]);

  const clearFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (selectedUser) => {
    setEditing(selectedUser);
    setForm({
      name: selectedUser.name || "",
      email: selectedUser.email || "",
      password: "",
      role: selectedUser.role || "user",
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      if (editing) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        await api.put(`/users/${editing._id}`, payload);
      } else {
        await api.post("/users", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }

      closeModal();
      fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editing
            ? "Failed to update user"
            : "Failed to create user")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async (selectedUser) => {
    if (selectedUser._id === user?._id) {
      alert("You cannot suspend your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Suspend ${selectedUser.name}?\n\nThis user will no longer be able to access Doctor Tracker until their account is activated again.`
    );

    if (!confirmed) return;

    setActionLoading(selectedUser._id);

    try {
      await api.patch(`/users/${selectedUser._id}/suspend`);
      fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to suspend user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (selectedUser) => {
    setActionLoading(selectedUser._id);

    try {
      await api.patch(`/users/${selectedUser._id}/activate`);
      fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to activate user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (selectedUser) => {
    if (selectedUser._id === user?._id) {
      alert("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedUser.name}?\n\nThis user account will be permanently deleted. This action cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading(selectedUser._id);

    try {
      await api.delete(`/users/${selectedUser._id}`);

      setUsers((prev) =>
        prev.filter((item) => item._id !== selectedUser._id)
      );

      setTotalUsers((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const skeletonRows = useMemo(
    () => Array.from({ length: 7 }),
    []
  );

  if (authLoading || !user) {
    return (
      <ProtectedLayout>
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-32 rounded bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-96 rounded-2xl bg-slate-100" />
        </div>
      </ProtectedLayout>
    );
  }

  if (user.role !== "admin") {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? "Loading..."
              : `${totalUsers} user${
                  totalUsers === 1 ? "" : "s"
                } registered`}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
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

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10 sm:w-auto"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10 sm:w-auto"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <UsersIcon className="h-4 w-4 text-slate-400" />
            User Accounts
          </h2>

          <span className="text-xs text-slate-400">
            {totalUsers} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-left">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Joined
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                skeletonRows.map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4" colSpan={6}>
                      <div className="h-9 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <SearchX className="h-5 w-5 text-slate-400" />
                      </span>

                      <p className="text-sm font-medium text-slate-600">
                        No users found
                      </p>

                      <p className="text-xs text-slate-400">
                        {hasActiveFilters
                          ? "Try adjusting or clearing your filters."
                          : "Users you create will show up here."}
                      </p>

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-1 text-xs font-medium text-teal-700 hover:text-teal-800"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const isCurrentUser = item._id === user._id;
                  const isActionLoading =
                    actionLoading === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(
                              item.name
                            )}`}
                          >
                            {initialsOf(item.name)}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-slate-900">
                                {item.name}
                              </span>

                              {isCurrentUser && (
                                <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-flex">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="break-all">
                          {item.email}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {item.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                            User
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {item.status === "suspended" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            disabled={isActionLoading}
                            aria-label="Edit user"
                            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Edit user"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {item.status === "suspended" ? (
                            <button
                              type="button"
                              onClick={() => handleActivate(item)}
                              disabled={
                                isActionLoading || isCurrentUser
                              }
                              aria-label="Activate user"
                              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Activate user"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSuspend(item)}
                              disabled={
                                isActionLoading || isCurrentUser
                              }
                              aria-label="Suspend user"
                              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Suspend user"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={
                              isActionLoading || isCurrentUser
                            }
                            aria-label="Delete user"
                            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit User" : "Add User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <FieldLabel>Full Name</FieldLabel>

            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="e.g. Sarah Ahmed"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
            />
          </div>

          <div>
            <FieldLabel>Email</FieldLabel>

            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              placeholder="e.g. sarah@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
            />
          </div>

          <div>
            <FieldLabel>
              Password {editing && "(optional)"}
            </FieldLabel>

            <input
              required={!editing}
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              placeholder={
                editing
                  ? "Leave empty to keep current password"
                  : "Enter password"
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
            />
          </div>

          <div>
            <FieldLabel>Role</FieldLabel>

            <select
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value,
                })
              }
              disabled={
                editing?._id === user?._id
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            {editing?._id === user?._id && (
              <p className="mt-1.5 text-xs text-slate-400">
                You cannot change your own admin role.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? editing
                ? "Saving..."
                : "Creating..."
              : editing
              ? "Save changes"
              : "Create User"}
          </button>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}