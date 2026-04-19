import heroImage from "../assets/hero_heart.png";
import mlImage from "../assets/ml_model.png";
import instantImage from "../assets/instant.png";
import doctorImage from "../assets/doctor.png";

export default function Home() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">

      {/* HERO SECTION */}
      <div className="bg-primary dark:bg-red-800 text-white py-20 px-10 transition-colors duration-300">
        
        <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl mx-auto">
          
          {/* Left Content */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold mb-6">
              AI-Powered Heart Disease Prediction
            </h1>
            <p className="text-xl">
              Early detection saves lives. HeartSense Intelligence uses advanced 
              machine learning algorithms to assess cardiovascular risk 
              and assist in preventive healthcare.
            </p>
          </div>

          {/* Right Image */}
          <div>
            <img
              src={heroImage}
              alt="Heart Health"
              className="rounded-xl shadow-2xl w-full"
            />
          </div>

        </div>

      </div>

      {/* WHY CHOOSE US */}
      <div className="py-16 px-10 text-center">
        <h2 className="text-3xl font-bold text-secondary dark:text-red-400 mb-6">
          Why Choose Us?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-10">
          
          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg transition-colors duration-300 hover:shadow-xl">
            
            {/* Image Added */}
            <img
              src={mlImage}
              alt="Accurate ML Models"
              className="rounded-lg mb-4 h-48 w-full object-cover"
            />

            <h3 className="text-xl font-semibold mb-3">
              Accurate ML Models
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Trained on clinical datasets with optimized ensemble algorithms.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg transition-colors duration-300 hover:shadow-xl">
            
            {/* Image Added */}
            <img
              src={instantImage}
              alt="Instant Prediction"
              className="rounded-lg mb-4 h-48 w-full object-cover"
            />

            <h3 className="text-xl font-semibold mb-3">
              Instant Prediction
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get real-time cardiovascular risk analysis within seconds.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg transition-colors duration-300 hover:shadow-xl">
            
            {/* Image Added */}
            <img
              src={doctorImage}
              alt="Medical Guidance"
              className="rounded-lg mb-4 h-48 w-full object-cover"
            />

            <h3 className="text-xl font-semibold mb-3">
              Medical Guidance
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Integrated AI chatbot and doctor consultation support.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}