import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ShapBarChart({ topFeatures }) {
  if (!topFeatures || topFeatures.length === 0) return null;

  const labels = topFeatures.map((f) => f.feature.toUpperCase());
  const dataValues = topFeatures.map((f) => f.impact);
  
  const backgroundColors = topFeatures.map((f) =>
    f.impact >= 0 ? "rgba(239, 68, 68, 0.8)" : "rgba(34, 197, 94, 0.8)" // Red for positive impact (increased risk), Green for negative
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Impact on Risk Prediction",
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y", // horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Impact: ${context.raw > 0 ? "+" : ""}${context.raw.toFixed(4)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "#9CA3AF",
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-64 mt-4">
      <Bar data={data} options={options} />
    </div>
  );
}
