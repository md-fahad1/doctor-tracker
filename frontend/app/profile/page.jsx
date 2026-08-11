"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleUserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  Camera,
  Loader2,
} from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState(null);

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => {
        setProfile(data);
        setName(data.name || "");
      })
      .catch(() => {
        if (user) setName(user.name || "");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;

  setAvatarError("");

  if (!file.type.startsWith("image/")) {
    setAvatarError("Please choose an image file.");
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    setAvatarError("Image must be under 3MB.");
    return;
  }

  const formData = new FormData();
  formData.append("avatar", file);

  setUploading(true);
  try {
    const { data } = await api.post("/auth/avatar", formData);
    setProfile((prev) => ({ ...prev, avatar: data.avatar }));
    updateUser({ avatar: data.avatar });
  } catch (err) {
    console.error(err);
    setAvatarError(err.response?.data?.message || "Failed to upload image.");
  } finally {
    setUploading(false);
  }
};

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameMessage(null);
    setSavingName(true);
    try {
      await api.put("/auth/me", { name });
      setNameMessage({ type: "success", text: "Name updated." });
    } catch (err) {
      setNameMessage({
        type: "error",
        text:
          err.response?.status === 404
            ? "This backend doesn't have a profile-update endpoint yet."
            : err.response?.data?.message || "Failed to update name.",
      });
    } finally {
      setSavingName(false);
    }
  };


  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account details and security settings.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-32 rounded-2xl bg-slate-100" />
          <div className="h-56 rounded-2xl bg-slate-100" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: identity card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center">
              <div className="relative group">
                {profile?.avatar?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar.url}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-2xl font-semibold mb-4">
                    {initialsOf(profile?.name) || "A"}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="absolute bottom-4 right-0 w-7 h-7 rounded-full bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shadow-sm transition-colors disabled:opacity-60"
                  aria-label="Change profile picture"
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {avatarError && (
                <p className="text-xs text-rose-600 mb-2 -mt-1">{avatarError}</p>
              )}

              <p className="text-lg font-semibold text-slate-900">{profile?.name}</p>
              <p className="text-sm text-slate-500">{profile?.email}</p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                {profile?.role ? profile.role[0].toUpperCase() + profile.role.slice(1) : "Admin"}
              </span>

              {joinedDate && (
                <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Member since {joinedDate}
                </p>
              )}

              <p className="mt-4 text-[11px] text-slate-400">
                JPG, PNG or WEBP. Max 3MB.
              </p>
            </div>
          </div>

          {/* Right: editable sections */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <CircleUserRound className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Basic Information</h2>
              </div>

              <form onSubmit={handleSaveName} className="space-y-4">
                {nameMessage && (
                  <div
                    className={`text-sm rounded-lg px-3.5 py-2.5 border ${
                      nameMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-rose-50 text-rose-700 border-rose-100"
                    }`}
                  >
                    {nameMessage.text}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      disabled
                      value={profile?.email || ""}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Email can't be changed here.</p>
                </div>

                <button
                  type="submit"
                  disabled={savingName || name === profile?.name}
                  className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingName ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}