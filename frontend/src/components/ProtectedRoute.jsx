import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // ⏳ While checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Checking authentication...</p>
      </div>
    );
  }

  // ❌ If user is not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ If user is logged in
  return children;
}