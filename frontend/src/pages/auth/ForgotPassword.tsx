import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Boxes } from "lucide-react";
import * as authService from "@/services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; devResetLink?: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white px-4">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />

      <Link
        to="/"
        aria-label="Back to home"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-md bg-white/60 px-3 py-2 text-sm text-gray-700 shadow-md backdrop-blur-md hover:bg-white hover:text-sky-700"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back</span>
      </Link>

      <div className="relative w-full max-w-sm rounded-2xl border border-sky-100/60 bg-white/90 p-8 shadow-xl shadow-sky-100/60 backdrop-blur-md">
        <div className="mb-4 flex justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm">
            <Boxes size={18} />
          </span>
        </div>

        <h1 className="text-center text-xl font-bold text-gray-900">Reset your password</h1>
        <p className="mt-1.5 text-center text-sm text-gray-500">
          Enter your account email and we'll send you a reset link.
        </p>

        {result ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-700">{result.message}</p>
            {result.devResetLink && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="mb-1 font-medium">Dev mode — no email service is configured.</p>
                <Link to={result.devResetLink.replace(window.location.origin, "")} className="break-all underline">
                  {result.devResetLink}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="you@company.com"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-800 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
