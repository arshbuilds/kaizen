"use client";
import { logoutUser } from "@/src/services/authServices";
import React from "react";

const LogoutButton = () => {

  return <button onClick={() => logoutUser()}>logout</button>;
};

export default LogoutButton;
