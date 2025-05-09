import React from "react";
import { IconType } from "react-icons";

//TODO:- Messy logic, improve later
export const DailyStatCard = (props: {
  icon: IconType;
  title: string;
  score?: number;
  hours?: number;
  scoreDelta?: number;
  hourDelta?: number;
}) => {
  return (
    <div className="flex-1 rounded-xl bg-[#1a2332] p-4 text-white">
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-br from-pink-500 to-pink-600 p-2 rounded-full">
            <props.icon className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 text-gray-300 text-sm font-medium">
            {props.title}
          </span>
        </div>
        {props.score !== undefined && props.hours === undefined ? (
          <div className="mt-3">
            <h2 className="text-white text-2xl font-bold">{props.score}</h2>
            <p
              className={`${
                props.scoreDelta! > 0 ? "text-green-400" : "text-red-400"
              } text-sm font-medium`}
            >
              {props.scoreDelta! > 0 ? "+" : ""}
              {props.scoreDelta}% vs last week
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <h2 className="text-white text-2xl font-bold">{props.hours}</h2>
            <p
              className={`${
                props.hourDelta! > 0 ? "text-green-400" : "text-red-400"
              } text-sm font-medium`}
            >
              {props.hourDelta! > 0 ? "+" : ""}
              {props.hourDelta!}% vs last week
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

type gradientType = {
  from: string;
  to: string;
};

export const AchievementsCard = (props: {
  label: string;
  icon: IconType;
  value: number;
  isTime: boolean;
  iconColor: string;
  gradient: gradientType;
}) => {
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(to bottom, ${props.gradient.from} ,${props.gradient.to})`,
      }}
      className="flex-1 bg-linear-to-b rounded-lg py-2 px-4 flex flex-col items-center justify-center"
    >
      <div className="text-2xl mb-2">
        <props.icon style={{ color: props.iconColor }} />
      </div>
      <p className="text-sm font-bold">
        {props.value}
        {props.isTime ? "h" : ""}
      </p>
      <p className="text-xs text-center text-gray-300">{props.label}</p>
    </div>
  );
};

export const ProgressCard = ({
  unit,
  Icon,
  title,
  cardValue,
  iconColor,
}: {
  info: string;
  unit: string;
  Icon: IconType;
  title: string;
  cardValue: number;
  iconColor: string;
}) => {
  return (
    <div className="flex-1 rounded-xl bg-[#1a2332] p-4 text-white">
      <p className="text-sm text-gray-400 mb-2">{title}</p>
      <div className="flex flex-col items-start justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-indigo-400">
            {cardValue}
          </span>
          {unit && <span className="text-base font-semibold">{unit}</span>}
        </div>
        <div className="text-xl">
          <Icon style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
};
