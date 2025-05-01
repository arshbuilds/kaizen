import React from "react";
import Image from "next/image";
import { FaArrowLeft, FaCamera } from "react-icons/fa";
import { FirestoreTimestamp } from "@/src/lib/firebase";
import { getYearFromTimestamp } from "@/src/lib/date";
import { InterestTag } from "../ui/tags";
import Link from "next/link";

type userProps = {
  pfpUrl: string;
  createdAt: FirestoreTimestamp;
  interests: Array<string>;
  followers: number;
// type AchievementsProps
  following: number;
  goals: number;
};

const UserData = ({ pfpUrl, createdAt, interests, followers, following, goals }: userProps) => {
  const year = getYearFromTimestamp(createdAt);
  return (
    <div className="rounded-xl my-4 bg-[#2c2a4a] p-6 text-white">
      <span className="text-gray-400 text-sm">
      <Link href={'/'} className="absolute left-10 top-10 flex items-center gap-1"><FaArrowLeft/>Back</Link></span>
      <div className="flex flex-col items-center">
        {/* Profile Image with Camera Icon */}
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-md">
            <Image
              width={100}
              height={100}
              alt="Profile Picture"
              src={pfpUrl}
            />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 transform">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6c5ce7]">
              <FaCamera className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold text-white">Trinity Mitchell</h2>
          <p className="text-gray-400">Mindfulness Explorer</p>
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
        <div className="mt-8 flex w-full justify-between border-t border-gray-700 pt-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-white">{following}</span>
            <span className="text-xs text-gray-400">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-white">{followers}</span>
            <span className="text-xs text-gray-400">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-white">{goals}</span>
            <span className="text-xs text-gray-400">Goals</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserData;
