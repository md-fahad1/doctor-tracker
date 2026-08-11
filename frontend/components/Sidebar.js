"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Settings,
  CircleUserRound,
  LogOut,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
];

const accountLinks = [
  { href: "/profile", label: "Profile", icon: CircleUserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function NavSection({ label, links, pathname }) {
  
  return (
    <div className="mb-5">
      <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-teal-600" />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-teal-400" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
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

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-sm shadow-teal-200">
          <Stethoscope className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 leading-tight">Doctor Tracker</p>
          <p className="text-[11px] text-slate-400 leading-tight">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <NavSection label="Main" links={mainLinks} pathname={pathname} />
        <NavSection label="Account" links={accountLinks} pathname={pathname} />
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-2 py-2 mb-1 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {profile?.avatar?.url ? (
            <img
              src={profile.avatar.url}
              alt={profile.name}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-semibold shrink-0">
              {initialsOf(profile?.name) || "A"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 truncate">{profile?.name}</p>
            <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
          </div>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}