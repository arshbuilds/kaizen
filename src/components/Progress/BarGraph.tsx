import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { MonthStats } from "@/src/types/progressTypes";
import { modifyForBarGraph } from "@/src/utils/genUtils";

// Register chart elements
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Props = {
  data: MonthStats;
};

const BarGraph = ({ data }: Props) => {
  const endDate = new Date();
  const { weekdays, completionRate } = modifyForBarGraph(data, endDate);

  const barData = {
    labels: weekdays,
    datasets: [
      {
        label: "Weekly Progress",
        data: completionRate,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 0,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return <Bar className="bg-[#1a2332] p-4 my-4 rounded-xl" data={barData} options={options} />;
};

export default BarGraph;
