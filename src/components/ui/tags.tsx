import React from "react";

type Props = {
  title: string;
};

export const ProfileTag = (props: Props) => {
  return (
    <div className="flex justify-center items-center w-max bg-purple-600/90 p-2 px-4 rounded-4xl shadow-lg">
      {props.title}
    </div>
  );
};
