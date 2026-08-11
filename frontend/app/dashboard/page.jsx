"use client";

import { useEffect, useState } from "react";
import { Stethoscope, Users, TrendingUp } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import StatCard from "@/components/StatCard";
import api from "@/lib/api";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const BAR_COLORS = [
  "bg-sky-600", "bg-violet-600", "bg-emerald-600", "bg-amber-500",
  "bg-rose-500", "bg-cyan-600", "bg-indigo-600", "bg-pink-600",
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const maxPatientsPerDoctor = stats
    ? Math.max(1, ...stats.patientsPerDoctor.map((d) => d.patientCount))
    : 1;
  const maxTrend = Math.max(1, ...trendData.map((d) => d.patients));
  const totalConditionCount = stats
    ? stats.conditionBreakdown.reduce((sum, c) => sum + c.count, 0)
    : 0;

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">
        A snapshot of doctors, patients, and recent activity.
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading analytics...</p>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>
      ) : !stats ? (
        <p className="text-sm text-slate-400">No data available.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Doctors" value={stats.totalDoctors} icon={Stethoscope} accent="sky" />
            <StatCard label="Total Patients" value={stats.totalPatients} icon={Users} accent="emerald" />
            <StatCard
              label="Avg. Patients / Doctor"
              value={
                stats.totalDoctors
                  ? (stats.totalPatients / stats.totalDoctors).toFixed(1)
                  : 0
              }
              icon={TrendingUp}
              accent="violet"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patients per doctor — vertical bar chart built from divs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-6">
                Patients per Doctor (Top 10)
              </h2>
              {stats.patientsPerDoctor.length === 0 ? (
                <p className="text-sm text-slate-400">No data yet.</p>
              ) : (
                <div className="flex items-end gap-3 h-56">
                  {stats.patientsPerDoctor.map((d, i) => (
                    <div key={d.doctorId} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900">
                        {d.patientCount}
                      </span>
                      <div
                        className={`w-full rounded-t-md ${BAR_COLORS[i % BAR_COLORS.length]} transition-all`}
                        style={{
                          height: `${(d.patientCount / maxPatientsPerDoctor) * 100}%`,
                          minHeight: "4px",
                        }}
                      />
                      <span
                        className="text-[10px] text-slate-500 text-center leading-tight w-full truncate"
                        title={d.doctorName}
                      >
                        {d.doctorName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly patient trend — bar chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-6">
                New Patients (Last 6 Months)
              </h2>
              {trendData.length === 0 ? (
                <p className="text-sm text-slate-400">No data yet.</p>
              ) : (
                <div className="flex items-end gap-3 h-56">
                  {trendData.map((m) => (
                    <div key={m.name} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900">
                        {m.patients}
                      </span>
                      <div
                        className="w-full rounded-t-md bg-emerald-600 transition-all"
                        style={{
                          height: `${(m.patients / maxTrend) * 100}%`,
                          minHeight: "4px",
                        }}
                      />
                      <span className="text-[10px] text-slate-500">{m.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Patients by condition — horizontal proportional bars */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900 mb-5">
                Patients by Condition
              </h2>
              {stats.conditionBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.conditionBreakdown.map((c, i) => {
                    const pct = totalConditionCount
                      ? Math.round((c.count / totalConditionCount) * 100)
                      : 0;
                    return (
                      <div key={c.condition}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">
                            {c.condition}
                          </span>
                          <span className="text-xs text-slate-500">
                            {c.count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </ProtectedLayout>
  );
}