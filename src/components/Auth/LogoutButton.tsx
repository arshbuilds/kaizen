"use client";
import { logoutUser } from "@/src/services/authServices";
import React from "react";

const LogoutButton = () => {
  return <button className="self-center w-full border text-white bg-red-600 py-2 rounded-lg transition" onClick={() => logoutUser()}>logout</button>;
};

export default LogoutButton;
