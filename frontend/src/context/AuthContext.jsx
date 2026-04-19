import { createContext, useContext, useEffect, useState, useRef } from "react";
import { getCurrentUser, setAuthToken } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const fetchInProgress = useRef(false);

  useEffect(() => {
    if (initialized || fetchInProgress.current) return;

    const token = sessionStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      setInitialized(true);
      setUser(null);
      setAuthToken(null);
      return;
    }

    setAuthToken(token);
    fetchInProgress.current = true;

    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch {
        sessionStorage.removeItem("access_token");
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
        fetchInProgress.current = false;
      }
    };

    fetchUser();
  }, [initialized]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);