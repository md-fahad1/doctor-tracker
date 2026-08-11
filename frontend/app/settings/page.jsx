"use client";

import { useEffect, useState } from "react";
import { Bell, Palette, Database, Info } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";

const STORAGE_KEY = "doctor-tracker:preferences";

const DEFAULT_PREFS = {
  emailNotifications: true,
  weeklySummary: false,
  newPatientAlerts: true,
  compactTables: false,
};

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="pr-4">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-teal-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Preferences are stored in the browser only — there's no backend
  // endpoint for user settings yet, so this won't sync across devices.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
    } catch {
      // ignore malformed/local storage errors, fall back to defaults
    } finally {
      setLoaded(true);
    }
  }, []);

  const updatePref = (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch {
      // storage might be unavailable (private browsing, etc.) — fail silently
    }
  };

  return (
    <ProtectedLayout>
      <div className="mb-6 flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your notification and display preferences.
          </p>
        </div>
        {savedFlash && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
            Saved
          </span>
        )}
      </div>

      {!loaded ? (
        <div className="animate-pulse space-y-6">
          <div className="h-48 rounded-2xl bg-slate-100" />
          <div className="h-32 rounded-2xl bg-slate-100" />
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Choose what you want to be notified about.
            </p>
            <div className="divide-y divide-slate-100">
              <Toggle
                label="Email notifications"
                description="Receive email updates about important account activity."
                checked={prefs.emailNotifications}
                onChange={(v) => updatePref("emailNotifications", v)}
              />
              <Toggle
                label="Weekly summary report"
                description="A recap of new doctors and patients added this week."
                checked={prefs.weeklySummary}
                onChange={(v) => updatePref("weeklySummary", v)}
              />
              <Toggle
                label="New patient alerts"
                description="Get notified whenever a patient is added to any doctor."
                checked={prefs.newPatientAlerts}
                onChange={(v) => updatePref("newPatientAlerts", v)}
              />
            </div>
          </div>

          {/* Display */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Display</h2>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Adjust how tables and lists appear.
            </p>
            <div className="divide-y divide-slate-100">
              <Toggle
                label="Compact tables"
                description="Reduce row padding to fit more data on screen."
                checked={prefs.compactTables}
                onChange={(v) => updatePref("compactTables", v)}
              />
            </div>
          </div>

          {/* System info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">System</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Application</span>
                <span className="text-slate-800 font-medium">Doctor Tracker</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Version</span>
                <span className="text-slate-800 font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">API Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-400 px-1">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              These preferences are saved in this browser only. They won't sync across
              devices until a settings endpoint is added to the backend.
            </p>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}