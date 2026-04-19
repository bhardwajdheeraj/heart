import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser, setAuthToken } from "../api";
import { Activity, User, LogOut, Moon, Sun, Menu, X, ChevronDown, UserCircle2 } from "lucide-react";

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      sessionStorage.removeItem("access_token");
      setAuthToken(null);
      setUser(null);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed");
    }
  };

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Predict", path: "/predict" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "History", path: "/prediction-history" }
  ];

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : "US";
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              HeartSense
            </span>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center space-x-8">
            
            {!user ? (
               <div className="flex items-center space-x-4">
               <Link 
                 to="/login" 
                 className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition-colors"
               >
                 Sign In
               </Link>
               <Link
                 to="/register"
                 className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
               >
                 Get Started
               </Link>
             </div>
            ) : (
              <div className="flex flex-1 items-center justify-center space-x-1 border border-gray-200 dark:border-gray-800 rounded-full p-1 bg-gray-50/50 dark:bg-gray-900/50">
                {navLinks.map((link) => {
                  const isActive = location.pathname.includes(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? "bg-white dark:bg-gray-800 text-primary shadow-sm" 
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                })}
              </div>
            )}

            <div className="flex items-center space-x-4 border-l pl-6 border-gray-200 dark:border-gray-800">
              {/* DARK MODE */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* USER DROPDOWN */}
              {user && (
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-1.5 pr-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-rose-400 flex items-center justify-center text-white font-semibold text-xs text-shadow shadow-inner">
                      {getInitials(user.email)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fadeIn origin-top-right">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate('/dashboard');
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <UserCircle2 className="w-4 h-4 text-gray-400" />
                          <span>My Profile</span>
                        </button>
                        <button 
                          onClick={logout}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
               {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 space-y-2 shadow-lg animate-fadeIn">
          {user ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm text-gray-500">Logged in as</p>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <Link 
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl bg-primary text-white font-medium"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}