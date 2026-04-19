import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { resetPassword } from "../api";
import register from "../assets/register.jpg";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/\d/.test(pwd)) return "Password must contain at least one number.";
    return "";
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ token, password });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reset password");
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
          backgroundImage: `url(${register})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div>
          <h1 className="text-5xl font-bold mb-6">
            Set New Password
          </h1>
          <p className="text-lg opacity-90">
            Enter your new password to complete the reset.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 dark:bg-gray-900 p-10">
        <form
          onSubmit={handleResetPassword}
          className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md transition duration-300"
        >
          <h2 className="text-3xl font-bold mb-8 text-center dark:text-white">
            Reset Password
          </h2>

          <div className="space-y-5">
            <div>
              <input
                type="password"
                placeholder="New Password"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition duration-300 disabled:opacity-50 font-semibold"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>

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