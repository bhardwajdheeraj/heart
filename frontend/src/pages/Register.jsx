import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getCurrentUser } from "../api";
import api from "../api";
import register from "../assets/register.jpg";
import { Mail, Lock, Eye, EyeOff, UserPlus, Activity, Loader2, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser();
        navigate("/home");
      } catch {
        // Not logged in, stay on register
      }
    };
    checkUser();
  }, [navigate]);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/\d/.test(pwd)) return "Password must contain at least one number.";
    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!email.trim() || !password || !confirmPassword) {
      setErrors({
        email: !email.trim() ? "Email is required." : "",
        password: !password ? "Password is required." : "",
        confirmPassword: !confirmPassword ? "Confirm your password." : "",
      });
      setLoading(false);
      return;
    }

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
      const trimmedEmail = email.trim().toLowerCase();
      await api.post("/register", { email: trimmedEmail, password });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength; // 0 to 4
  };

  const strength = getPasswordStrength();
  const strengthColors = ["bg-gray-200 dark:bg-gray-700", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 font-sans">
      
      {/* LEFT SIDE: Image Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${register})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
             <div className="flex items-center gap-3 mb-6 bg-white/10 w-max px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
              <Activity className="w-5 h-5 text-rose-400" />
              <span className="font-semibold tracking-wide">Join HeartSense</span>
            </div>
            <h1 className="text-5xl font-extrabold mb-4 leading-tight">
              Your Heart's <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-primary">Analytics Engine.</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-md font-medium leading-relaxed">
              Create an account to track risk profiles, access AI consultations, and generate clinical reports.
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Form Panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] relative z-10 my-auto py-8"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Join us for a healthier tomorrow</p>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-white/50 dark:border-gray-800 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70">
            <form onSubmit={handleRegister} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    className={`w-full bg-white dark:bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-11 pr-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300 font-medium`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full bg-white dark:bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-11 pr-12 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300 font-medium`}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.password && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.password}</p>}
                </div>
                
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="px-1 mt-2">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? strengthColors[strength] : "bg-gray-200 dark:bg-gray-700"}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-bold mt-1.5 ${strength > 0 ? strengthColors[strength].replace('bg-', 'text-') : 'text-gray-500'}`}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full bg-white dark:bg-gray-800 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-11 pr-12 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300 font-medium`}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.confirmPassword && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 transform hover:-translate-y-0.5"
                >
                  {loading ? (
                     <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</>
                  ) : (
                     <><UserPlus className="w-5 h-5" /> Sign Up</>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
               Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary-dark font-bold hover:underline transition-all">
                Sign in instead
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}