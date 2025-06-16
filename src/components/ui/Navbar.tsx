"use client";

import { useState } from "react";
import { CiHome, CiSquareCheck } from "react-icons/ci";
import { FiTarget } from "react-icons/fi";
import { FaChartBar } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";

export default function Navbar() {
  const [activeTab, setActiveTab] = useState(0);

  const navItems = [
    { icon: CiHome, label: "Home" },
    { icon: CiSquareCheck, label: "Tasks" },
    { icon: FiTarget, label: "Goals" },
    { icon: FaChartBar, label: "Analytics" },
    { icon: FaUserAlt, label: "Profile" },
  ];

  return (
    <div className="relative bottom-0 flex items-center justify-center p-4">
      <div className="relative">
        {/* Main navigation container */}
        <div className="bg-[#262636] backdrop-blur-sm rounded-3xl p-4 border border-gray-700/50">
          <div className="flex items-center space-x-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === index;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`
                    relative p-4 rounded-2xl transition-all duration-300 ease-out
                    ${
                      isActive
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                        : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300"
                    }
                  `}
                  aria-label={item.label}
                >
                  <Icon
                    size={24}
                    className={`transition-transform duration-200 ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-blue-500 rounded-full"></div>
      </div>
    </div>
  );
}
