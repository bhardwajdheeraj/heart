import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 dark:bg-gray-800 
    text-white p-6 fixed transition-colors duration-300">

      <h2 className="text-2xl font-bold mb-10">
        HeartAI
      </h2>

      <nav className="space-y-4">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `block hover:text-blue-400 transition ${
              isActive ? "text-blue-400 font-semibold" : ""
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/predict"
          className={({ isActive }) =>
            `block hover:text-blue-400 transition ${
              isActive ? "text-blue-400 font-semibold" : ""
            }`
          }
        >
          Prediction
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `block hover:text-blue-400 transition ${
              isActive ? "text-blue-400 font-semibold" : ""
            }`
          }
        >
          History
        </NavLink>

      </nav>
    </div>
  );
}