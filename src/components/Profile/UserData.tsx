import React from "react";
import { FirestoreTimestamp } from "@/src/lib/firebase";
import { getYearFromTimestamp } from "@/src/lib/date";
import { InterestTag } from "../ui/tags";
import Link from "next/link";
import { Cog } from "lucide-react";
import PfpUploader from "./PfpUploader";

const UserData = ({
  pfpUrl,
  createdAt,
  interests,
  name,
  role,
}: // followers,
// following,
// goals,
{
  pfpUrl: string;
  createdAt: FirestoreTimestamp;
  interests: Array<string>;
  followers: number;
  name: string;
  role: string;
  // type AchievementsProps
  following: number;
  goals: number;
}) => {
  const year = getYearFromTimestamp(createdAt);
  return (
    <div className="rounded-xl my-4 p-6 bg-[#2e2d48]/20 text-white shadow-lg shadow-[#222952]">
      <span className="text-gray-400 text-sm">
        <Link
          href={"/profile/settings"}
          className="absolute right-5 top-10 flex items-center gap-1"
        >
          <Cog />
        </Link>
      </span>
      <div className="flex flex-col items-center">
        {/* Profile Image with Camera Icon */}
        <PfpUploader pfpUrl={pfpUrl} />

        {/* User Info */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold text-white">{name}</h2>
          <p className="text-gray-400">{role}</p>
        </div>

        {/* User Details */}
        <div className="mt-2 flex items-center justify-center space-x-4 text-gray-400">
          <span>{year}</span>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {interests.map((string, index) => (
            <InterestTag title={string} key={index} />
          ))}
        </div>
        {/* Stats */}
        {/* <div className="mt-8 flex w-full justify-between border-t border-gray-700 pt-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-white">
              {following}
            </span>
            <span className="text-xs text-gray-400">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-white">
              {followers}
            </span>
            <span className="text-xs text-gray-400">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-white">{goals}</span>
            <span className="text-xs text-gray-400">Goals</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default UserData;
