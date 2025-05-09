import React from "react";
import { AchievementsCard } from "../ui/cards";
import { FaFireAlt, FaMedal } from "react-icons/fa";
import { GiMeditation } from "react-icons/gi";

const AchievementsSection = ({
  dayStreak,
  meditationHours,
  badgesCount,
}: {
  dayStreak: number;
  meditationHours: number;
  badgesCount: number;
}) => {
  const items = [
    {
      icon: FaFireAlt,
      value: dayStreak,
      label: "Day Streak",
      isTime: false,
      iconColor: "#ff9121",
      gradient: { from: "#74487c", to: " #5d439c" },
    },
    {
      icon: GiMeditation,
      value: meditationHours,
      label: "Meditation",
      isTime: true,
      iconColor: "#ac9bfb",
      gradient: { from: "#5747a7", to: "#5a46a6" },
    },
    {
      icon: FaMedal,
      value: badgesCount,
      label: "Badges",
      isTime: false,
      iconColor: "#e4b871",
      gradient: { from: "#714c87", to: "#704c82" },
    },
  ];

  return (
    <div className="rounded-xl bg-[#1a2332] p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Achievements & Streaks</h3>
      <div className="flex flex-row gap-4">
        {items.map((item, index) => (
          <AchievementsCard
            key={index}
            icon={item.icon}
            value={item.value}
            label={item.label}
            isTime={item.isTime}
            iconColor={item.iconColor}
            gradient={item.gradient}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementsSection;
