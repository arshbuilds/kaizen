"use client";
import { useState } from "react";
import { CiHome, CiSquareCheck } from "react-icons/ci";
import { FiTarget } from "react-icons/fi";
import { FaChartBar } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function Navbar({hidden}:{hidden: string[]}) {
  const [activeTab, setActiveTab] = useState(0);
  const pathname = usePathname();
  const navItems = [
    { icon: CiHome, label: "Home" },
    { icon: CiSquareCheck, label: "Tasks" },
    { icon: FiTarget, label: "Goals" },
    { icon: FaChartBar, label: "Analytics" },
    { icon: FaUserAlt, label: "Profile" },
  ];
  return (
    <div
      className={`${hidden.includes(pathname) && "hidden"} fixed bottom-0 left-0 right-0 flex items-center justify-center z-50 w-full`}
    >
      <div className="relative w-full">
        {/* Main navigation container */}
        <div className="bg-[#262636] w-full backdrop-blur-sm p-4 border border-gray-700/50">
          <div className="flex items-center justify-evenly space-x-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === index;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`
                    relative p-2 rounded-2xl transition-all duration-300 ease-out
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
