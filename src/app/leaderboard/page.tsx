"use client";
import Champions from "@/src/components/Leaderboard/Champions";
import Rising from "@/src/components/Leaderboard/Rising";
import Loading from "@/src/components/Loading/Loading";
import { useAuth } from "@/src/hooks/useAuth";
import { getAllUsersByRank } from "@/src/services/leaderBoardServices";
import { modifyForNonTop3 } from "@/src/utils/genUtils";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Arena = () => {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await getAllUsersByRank();
      return data;
    },
  });
  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <>Some error occured</>;
  }

  const nonTop3Ranks = modifyForNonTop3({docs: data!, userId: user!.userId})

  return (
    <div className="min-h-screen p-4 mx-auto pb-24">
      <div className="space-y-6">
        <h1 className="mb-10 text-2xl text-center md:text-4xl font-extrabold tracking-wider text-white">
          HALL OF CHAMPIONS
        </h1>
        <div className="relative flex justify-center">
          <span className="absolute h-2 w-80 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent blur-lg"></span>
          <span className="h-px w-72 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></span>
        </div>

        <div className="flex items-end justify-center gap-4 md:gap-8 my-16">
          {data ? (
            data
              ?.slice(0, 3)
              .map((doc, index) => <Champions key={index} doc={doc} />)
          ) : (
            <></>
          )}
        </div>
        <h1 className="mb-10 text-xl text-center md:text-4xl font-bold tracking-wider text-white">
          RISING CHAMPIONS
        </h1>
        {nonTop3Ranks ? (
          nonTop3Ranks.map((doc, index) => <Rising doc={doc!} key={index}/>)
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Arena;
