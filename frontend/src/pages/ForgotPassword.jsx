import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { forgotPassword } from "../api";
import login from "../assets/login.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword({ email });
      setResetLink(res.data.reset_link);
      toast.success("Reset link generated!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div
        className="hidden md:flex w-1/2 bg-gradient-to-br from-red-700 to-red-500 text-white items-center justify-center p-16"
        style={{
          backgroundImage: `url(${login})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div>
          <h1 className="text-5xl font-bold mb-6">
            Reset Your Password
          </h1>
          <p className="text-lg opacity-90">
            Enter your email to receive a password reset link.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 dark:bg-gray-900 p-10">
        <form
          onSubmit={handleForgotPassword}
          className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md transition duration-300"
        >
          <h2 className="text-3xl font-bold mb-8 text-center dark:text-white">
            Forgot Password
          </h2>

          <div className="space-y-5">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition duration-300 disabled:opacity-50 font-semibold"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          {resetLink && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-sm">
                Reset link: <a href={resetLink} className="underline">{resetLink}</a>
              </p>
            </div>
          )}

          <p className="text-center mt-6 text-sm dark:text-gray-300">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-red-500 hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}