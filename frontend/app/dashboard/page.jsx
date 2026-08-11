"use client";

import { useEffect, useState } from "react";
import {
  Stethoscope,
  Users,
  TrendingUp,
  Search,
  Bell,
  Mail,
  Menu,
  Activity,
  AlertCircle,
} from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import api from "@/lib/api";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SLICE_COLORS = ["#0ea5e9", "#f59e0b", "#8b5cf6", "#10b981", "#f43f5e", "#06b6d4"];
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

function CircleStat({ label, value, subtitle, icon: Icon, ring }) {
  const ringClasses = {
    sky: "border-sky-500 text-sky-600",
    emerald: "border-emerald-500 text-emerald-600",
    violet: "border-violet-500 text-violet-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shrink-0 ${ringClasses[ring]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-slate-100 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-100 rounded w-24" />
        <div className="h-6 bg-slate-100 rounded w-16" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const todayLabel = new Date().toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load dashboard stats");
      })
      .finally(() => setLoading(false));
  }, []);

  const trendData =
    stats?.monthlyPatientTrend.map((m) => ({
      name: MONTH_NAMES[m.month - 1],
      patients: m.count,
    })) || [];
  const maxTrend = Math.max(1, ...trendData.map((d) => d.patients));

  const totalConditionCount = stats
    ? stats.conditionBreakdown.reduce((sum, c) => sum + c.count, 0)
    : 0;

  // Build the conic-gradient string for the donut from real condition data
  let donutGradient = "#e2e8f0";
  if (stats && totalConditionCount > 0) {
    let cursor = 0;
    const segments = stats.conditionBreakdown.map((c, i) => {
      const start = cursor;
      const pct = (c.count / totalConditionCount) * 100;
      cursor += pct;
      return `${SLICE_COLORS[i % SLICE_COLORS.length]} ${start}% ${cursor}%`;
    });
    donutGradient = `conic-gradient(${segments.join(", ")})`;
  }

  return (
    <ProtectedLayout>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

        <div className="flex items-center gap-3 ml-auto">
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search..."
              className="pl-9 pr-4 py-2 text-sm rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 w-56"
            />
          </div>
          <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800">
            <Mail className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : !stats ? (
        <p className="text-sm text-slate-400">No dashboard data available.</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <CircleStat
              label="Total Doctors"
              value={stats.totalDoctors}
              subtitle="Registered"
              icon={Stethoscope}
              ring="sky"
            />
            <CircleStat
              label="Total Patients"
              value={stats.totalPatients}
              subtitle={todayLabel}
              icon={Users}
              ring="emerald"
            />
            <CircleStat
              label="Avg Patients / Doctor"
              value={stats.totalDoctors ? (stats.totalPatients / stats.totalDoctors).toFixed(1) : "0"}
              subtitle="Across all doctors"
              icon={TrendingUp}
              ring="violet"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut: patients by condition */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-1">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">Patients Summary</h2>
              <p className="text-xs text-slate-400 mb-6">By condition</p>

              {stats.conditionBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400 py-12 text-center">No condition data yet.</p>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <div
                      className="w-44 h-44 rounded-full flex items-center justify-center"
                      style={{ background: donutGradient }}
                    >
                      <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-slate-900">{stats.totalPatients}</span>
                        <span className="text-[11px] text-slate-400">Total Patients</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {stats.conditionBreakdown.slice(0, 6).map((c, i) => (
                      <div key={c.condition} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
                          />
                          <span className="text-slate-600 truncate">{c.condition}</span>
                        </div>
                        <span className="text-slate-900 font-medium">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right side: today appointment style list = top doctors, next patient style = trend */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Top doctors, styled like "Today Appointment" list */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-900">Top Doctors</h2>
                  <span className="text-xs text-slate-400">By patients</span>
                </div>

                {stats.patientsPerDoctor.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No doctors ranked yet.</p>
                ) : (
                  <div className="space-y-1">
                    {stats.patientsPerDoctor.slice(0, 5).map((d, i) => (
                      <div
                        key={d.doctorId}
                        className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                        >
                          {initials(d.doctorName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 truncate">{d.doctorName}</p>
                          <p className="text-xs text-slate-400">Patients</p>
                        </div>
                        <span className="text-sm font-semibold text-sky-600 shrink-0">
                          {d.patientCount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Monthly trend, styled like a compact stat panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-900">New Patients</h2>
                  <span className="text-xs text-slate-400">6 months</span>
                </div>

                {trendData.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No recent activity.</p>
                ) : (
                  <div className="flex items-end gap-2 h-36">
                    {trendData.map((m) => (
                      <div key={m.name} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-700">
                          {m.patients}
                        </span>
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-sky-500 to-sky-400 group-hover:opacity-90 transition-all"
                          style={{
                            height: `${(m.patients / maxTrend) * 100}%`,
                            minHeight: "4px",
                          }}
                        />
                        <span className="text-[10px] text-slate-400">{m.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Condition progress bars, spans full width under the two panels above */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:col-span-2">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Condition Breakdown</h2>
                {stats.conditionBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.conditionBreakdown.map((c, i) => {
                      const pct = totalConditionCount
                        ? Math.round((c.count / totalConditionCount) * 100)
                        : 0;
                      return (
                        <div key={c.condition} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-28 truncate shrink-0">
                            {c.condition}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right shrink-0">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </ProtectedLayout>
  );
}