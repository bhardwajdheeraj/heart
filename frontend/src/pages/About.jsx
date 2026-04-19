export default function About() {
  return (
    <div className="py-16 px-10 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      <h1 className="text-4xl font-bold text-secondary dark:text-red-400 mb-8 text-center">
        About HeartSense Intelligence
      </h1>

      <div className="max-w-4xl mx-auto text-lg text-gray-700 dark:text-gray-300 leading-8">
        <p>
          HeartSense Intelligence is an AI-driven healthcare platform 
          designed to assist in early detection of cardiovascular diseases 
          using advanced machine learning models.
        </p>

        <p className="mt-6">
          Our system integrates ensemble learning algorithms such as 
          Random Forest, XGBoost, and LightGBM to provide accurate 
          risk classification and probability estimation.
        </p>

        <p className="mt-6">
          The goal is not to replace doctors, but to support 
          preventive decision-making and promote awareness.
        </p>
      </div>

    </div>
  );
}