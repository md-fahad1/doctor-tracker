"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Stethoscope, Users, TrendingUp } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import StatCard from "@/components/StatCard";
import api from "@/lib/api";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const PIE_COLORS = ["#0284c7", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#4f46e5", "#db2777"];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const trendData =
    stats?.monthlyPatientTrend.map((m) => ({
      name: MONTH_NAMES[m.month - 1],
      patients: m.count,
    })) || [];

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">
        A snapshot of doctors, patients, and recent activity.
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading analytics...</p>
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
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">
                Patients per Doctor (Top 10)
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.patientsPerDoctor}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="doctorName" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="patientCount" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">
                New Patients (Last 6 Months)
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="patients" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">
                Patients by Condition
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.conditionBreakdown}
                    dataKey="count"
                    nameKey="condition"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => entry.condition}
                  >
                    {stats.conditionBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </ProtectedLayout>
  );
}
