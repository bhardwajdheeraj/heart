import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loginUser, getCurrentUser, setAuthToken } from "../api";
import { useAuth } from "../context/AuthContext";
import login from "../assets/login.jpg";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!email.trim() || !password.trim()) {
      setErrors({
        email: !email.trim() ? "Email is required." : "",
        password: !password.trim() ? "Password is required." : "",
      });
      setLoading(false);
      return;
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const res = await loginUser({ email: trimmedEmail, password });
      const accessToken = res.data.access_token;
      if (accessToken) {
        sessionStorage.setItem("access_token", accessToken);
        setAuthToken(accessToken);
      }

      const me = await getCurrentUser();
      setUser(me.data);
      toast.success("Welcome back!");
      navigate("/home");
    } catch (error) {
      console.error("Login attempt failed. Details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      sessionStorage.removeItem("access_token");
      setAuthToken(null);

      const serverDown = error.code === "ERR_NETWORK" || !error.response;
      const message = serverDown
        ? "Server not running. Please start the backend and try again."
        : error.response?.data?.error || "Invalid email or password";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
            backgroundImage: `url(${login})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-3 mb-6 bg-white/10 w-max px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
              <Activity className="w-5 h-5 text-rose-400" />
              <span className="font-semibold tracking-wide">HeartSense Intelligence</span>
            </div>
            <h1 className="text-5xl font-extrabold mb-4 leading-tight">
              Predict. Prevent. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-primary">Protect.</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-md font-medium leading-relaxed">
              Empowering proactive cardiovascular health through advanced AI risk assessment.
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Form Panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] relative z-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Log in to your account to continue</p>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-white/50 dark:border-gray-800 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70">
            <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    className={`w-full bg-white dark:bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-11 pr-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300 font-medium`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full bg-white dark:bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-11 pr-12 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300 font-medium`}
                    placeholder="Enter your password"
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
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary to-rose-600 hover:from-primary-dark hover:to-rose-700 text-white font-bold py-4 px-4 rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5"
                >
                  {loading ? (
                     <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                  ) : (
                     <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:text-primary-dark font-bold hover:underline transition-all">
                Create one now
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}