import { rankedUserType } from "@/src/types/userTypes";
import Image from "next/image";
import React from "react";

const Rising = ({ doc }: { doc: rankedUserType }) => {
  return (
    <li className="flex w-full items-center gap-3 rounded-md bg-[#1b0d38] px-3 py-2 text-white">
      {/* rank square */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#2f2f47] text-lg font-bold">
        #{doc.rank}
      </div>

      {/* avatar placeholder */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-black/40"> 
        <Image
          src={doc.pfpUrl}
          alt="profile pic"
          width={48}
          height={48}
          className="object-contain"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium max-w-[8rem]">
            {doc.userName}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <span className="flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-xs">
          ⚡ {doc.xp}
        </span>
      </div>
    </li>
  );
};

export default Rising;
