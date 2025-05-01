import React from "react";

type Props = {
  title: string;
};

export const InterestTag = (props: Props) => {
  return (
    <span className="rounded-full bg-[#3d3a5c] px-4 py-1 text-sm text-gray-300">
      {props.title}
    </span>
  );
};
