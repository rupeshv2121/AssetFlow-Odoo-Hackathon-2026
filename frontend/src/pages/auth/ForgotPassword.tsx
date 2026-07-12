import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">Reset your password</h1>
        <p className="mb-6 text-sm text-gray-500">
          Enter your account email and we'll send you a reset link.
        </p>

        {result ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">{result.message}</p>
            {result.devResetLink && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="mb-1 font-medium">Dev mode — no email service is configured.</p>
                <Link to={result.devResetLink.replace(window.location.origin, "")} className="break-all underline">
                  {result.devResetLink}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                placeholder="you@company.com"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
