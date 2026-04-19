import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero.jpg";
import aboutImage from "../assets/about.jpg";
import services from "../assets/services.webp";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section
        className="relative min-h-screen flex items-center justify-between px-10 md:px-20 text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* LEFT TEXT */}
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Empower Your <br /> Heart Health with AI
          </h1>

          <p className="text-lg opacity-90">
            Advanced AI-powered cardiovascular risk assessment and real-time
            medical assistance to help you stay ahead of heart disease.
          </p>

          <div className="space-x-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition duration-300 shadow-lg"
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/login")}
              className="border border-white px-8 py-3 rounded-lg hover:bg-white hover:text-red-600 transition duration-300"
            >
              Login
            </button>
          </div>
        </div>

        {/* RIGHT LARGE GLASS IMAGE CARD */}
        <div className="relative z-10 hidden md:flex w-1/2 justify-end items-center">
          {/* Glow Effect Behind */}
          <div className="absolute w-[520px] h-[520px] bg-red-500/30 blur-3xl rounded-full animate-pulse"></div>

          {/* Floating Glass Card */}
          <div
            className="relative bg-white/10 backdrop-blur-xl border border-white/20 
                  rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] 
                  p-6 w-[500px] animate-float"
          >
            <img
              src={aboutImage}
              alt="AI Dashboard"
              className="rounded-2xl w-full h-80 object-cover"
            />

            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold">
                AI-Powered Cardiovascular Intelligence
              </h3>
              <p className="text-sm opacity-80 mt-2">
                Real-time analytics and predictive modeling for smarter heart
                health decisions.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ================= ABOUT SECTION ================= */}
      <section className="py-24 px-8 md:px-20 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              The Journey Behind HeartSense Intelligence
            </h2>
            <p className="text-gray-100 dark:text-gray-300 leading-relaxed">
              Inspired by a passion for preventive healthcare, HeartSense
              Intelligence leverages machine learning to detect cardiovascular
              risk early and empower users with actionable insights.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition duration-500">
            <img
              src={aboutImage}
              alt="Medical AI"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      </section>

      {/* ================= SERVICES SECTION ================= */}
      <section className="py-24 px-8 md:px-20"  style={{ backgroundImage: `url(${services})`, backgroundSize: "cover",
          backgroundPosition: "center",}}>
        <h2 className="text-4xl font-bold text-center mb-16">
          Comprehensive Heart Health Services
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow hover:shadow-2xl transition duration-300 hover:-translate-y-3 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              Risk Assessment
            </h3>
            <p>AI-based heart disease prediction using clinical data.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow hover:shadow-2xl transition duration-300 hover:-translate-y-3 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              AI Medical Chat
            </h3>
            <p>Get instant medical guidance powered by LLM technology.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow hover:shadow-2xl transition duration-300 hover:-translate-y-3 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              Prediction History
            </h3>
            <p>Track and analyze your previous cardiovascular reports.</p>
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="py-24 bg-gradient-to-r from-red-700 to-red-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Take Control of Your Heart Health Now
        </h2>

        <p className="mb-8 opacity-90">
          Join today and start monitoring your cardiovascular risk
          intelligently.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="bg-white text-red-600 px-10 py-3 rounded-lg font-semibold hover:scale-105 transition"
        >
          Join Us Today
        </button>
      </section>
    </div>
  );
}
