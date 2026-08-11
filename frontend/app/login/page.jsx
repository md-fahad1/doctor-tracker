"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CalendarClock,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const FEATURES = [
  {
    icon: CalendarClock,
    text: "Live scheduling across every provider",
  },
  {
    icon: FolderKanban,
    text: "Unified patient and visit records",
  },
  {
    icon: ShieldCheck,
    text: "Role-based access for your care team",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't sign you in. Check your email and password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen flex flex-col lg:flex-row bg-white font-[family-name:var(--font-body)]`}
    >
      {/* ---------- Left / top panel : brand + context ---------- */}
      <div className="relative overflow-hidden bg-slate-950 px-6 py-10 sm:px-10 sm:py-12 lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:px-16 lg:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="h-5 w-5 text-teal-400" strokeWidth={2} />
            <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-tight text-white">
              Doctor Tracker
            </span>
          </div>
          <div className="mt-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Admin Console
          </div>

          <h1 className="mt-10 max-w-sm font-[family-name:var(--font-display)] text-[26px] font-medium leading-[1.25] tracking-tight text-white sm:text-[28px] lg:mt-16 lg:text-[30px]">
            Run your clinic&rsquo;s day from one console.
          </h1>
          <p className="mt-3 hidden max-w-xs text-[14.5px] leading-relaxed text-slate-400 sm:block">
            Scheduling, patient records, and care teams, brought together for
            the pace of a real clinic.
          </p>

          <ul className="mt-9 hidden space-y-3.5 sm:block">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[13.5px] text-slate-300">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.06] ring-1 ring-white/[0.08]">
                  <Icon className="h-3.5 w-3.5 text-teal-400" strokeWidth={2} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-10 flex items-center gap-2 border-t border-white/[0.08] pt-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-slate-500 lg:mt-0">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-teal-400" />
          System operational
        </div>
      </div>

      {/* ---------- Right / bottom panel : form ---------- */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12 sm:px-10">
        <div className="w-full max-w-[380px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)] sm:p-8">
            <div className="mb-7">
              <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-tight text-slate-900">
                Welcome back
              </h2>
              <p className="mt-1.5 text-[13.5px] text-slate-500">
                Sign in to manage your clinic&rsquo;s operations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[13px] font-medium text-slate-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
                    placeholder="you@hospital.com"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-[12.5px] font-medium text-teal-700 hover:text-teal-800"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-[14px] text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex select-none items-center gap-2 pt-0.5 text-[13px] text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-teal-700 focus:ring-teal-600/30"
                />
                Keep me signed in
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 py-2.5 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-600/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-[12.5px] text-slate-400">
            Having trouble?{" "}
            <a
              href="mailto:support@doctortracker.app"
              className="font-medium text-slate-500 hover:text-slate-700"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .pulse-dot {
          animation: pulseDot 1.8s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}