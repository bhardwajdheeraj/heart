import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);



export default function ProbabilityChart({ probability }) {
  const percentage = probability * 100;

  const data = {
    labels: ["Risk", "Safe"],
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: ["#ef4444", "#22c55e"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: "#9CA3AF", // works well in both modes
        },
      },
    },
  };

  return (
    <div className="w-72 mx-auto mt-6 
    bg-white dark:bg-gray-800 
    p-6 rounded-xl shadow-lg 
    transition-colors duration-300">

      <Doughnut data={data} options={options} />

      <p className="text-center mt-4 text-gray-700 dark:text-gray-300 font-medium">
        Risk Probability: {percentage.toFixed(2)}%
      </p>

    </div>
  );
}