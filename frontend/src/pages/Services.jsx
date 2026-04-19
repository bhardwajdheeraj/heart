export default function Services() {
  return (
    <div className="py-16 px-10 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      <h1 className="text-4xl font-bold text-secondary dark:text-red-400 text-center mb-10">
        Our Services
      </h1>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        
        <div className="bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-4">Heart Risk Prediction</h2>
          <p className="text-gray-700 dark:text-gray-300">
            AI-powered classification with probability score and 
            risk categorization.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-4">AI Medical Chatbot</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Get instant responses to common cardiovascular questions.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-4">Consultation Support</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Connect with certified healthcare professionals.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-4">Health Analytics</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Track prediction history and monitor trends over time.
          </p>
        </div>

      </div>
    </div>
  );
}