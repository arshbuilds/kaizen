import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { MonthStats } from "@/src/types/progressTypes";
import { modifyForLineChart } from "@/src/utils/genUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data }: { data: MonthStats }) => {
  const { weekDays, timeSpent } = modifyForLineChart({ monthStats: data });
  console.log(weekDays, timeSpent);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const, // or "bottom" as const, etc.
      },
      title: {
        display: true,
        text: "Time Spent",

      },
    },
  };
  const chartData = {
    labels: weekDays,
    datasets: [
      {
        label: "Time spent",
        data: [29, 12, 45, 12, 34, 90],
        borderColor: "rgb(80, 180, 209)",
        fill: true,
        tension: 0.4,
      },
    ],
  };
  return <Line className="bg-slate-800 border border-purple-400/30 p-4 my-4 rounded-xl" options={options} data={chartData} />;
};

export default LineChart;
