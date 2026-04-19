export default function RiskMeter({ probability }) {
  const percentage = (probability * 100).toFixed(0);

  return (
    <div className="mt-6 transition-colors duration-300">
      
      <div className="flex justify-between mb-2 text-gray-800 dark:text-gray-200">
        <span className="font-medium">Risk Level</span>
        <span>{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
        <div
          className="bg-red-500 h-4 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

    </div>
  );
}