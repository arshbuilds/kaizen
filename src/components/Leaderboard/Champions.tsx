import { rankedUserType } from "@/src/types/userTypes";
import clsx from "clsx";
import { Crown } from "lucide-react";
import Image from "next/image";
import React from "react";

const Champions = ({ doc }: { doc: rankedUserType }) => {
  const frame = {
    1: "border-4 border-yellow-400/60",
    2: "border-4 border-slate-300/60",
    3: "border-4 border-orange-500/60",
  }[doc.rank];
  const podium = {
    1: "order-2 -translate-y-6", // middle & raised
    2: "order-1", // left
    3: "order-3 translate-y-6", // right
  }[doc.rank];

  return (
    <div className={clsx(podium, "flex flex-col items-center")}>
      <div
        className={clsx(
          "relative flex w-28 flex-col items-center bg-[#2B1A55]/60 text-center text-white shadow-lg",
          frame
        )}
      >
        {/* Crown */}
        {doc.rank === 1 && (
          <Crown
            width={24}
            height={24}
            className="absolute -top-7 text-yellow-400"
          />
        )}

        {/* Rank badge */}
        <RankBadge rank={doc.rank} />
        {/* Avatar / controller */}
        <div className="m-2 flex h-20 w-24 items-center justify-center rounded border border-[#7B68EE]/60 bg-[#1B0F3F]">
          <Image
            src={doc.pfpUrl}
            alt=""
            width={48}
            height={48}
            className="object-contain"
          />
        </div>

        {/* Points */}
        <div className="mt-2 w-full text-center flex items-center justify-center bg-[#F4D35E]/20 px-2 py-1 text-sm font-semibold text-[#F4D35E]">
          ⚡{doc.xp}
        </div>
      </div>
      <p className="mt-1 text-sm font-bold tracking-wide">{doc.userName}</p>
    </div>
  );
};

function RankBadge({ rank }: { rank: number }) {
  const colours: Record<number, string> = {
    1: "bg-yellow-400/60 text-black",
    2: "bg-slate-300/60 text-slate-800",
    3: "bg-orange-500/60 text-white",
  };

  return (
    <span
      className={`absolute -top-1.5 -right-1.5 h-6 w-6 grid place-content-center text-xs font-bold ${colours[rank]}`}
    >
      {rank}
    </span>
  );
}

export default Champions;
