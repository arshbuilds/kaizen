"use client";
import React, { useState } from "react";
// import {
//   loginWithEmailPass,
//   loginWithGoogle,
//   signupWithEmailPass,
// } from "@/src/services/authServices";
import SignupForm from "@/src/components/Auth/SignupForm";
import LoginForm from "@/src/components/Auth/LoginForm";

const Enter = () => {
  const [openForm, setOpenForm] = useState(true);
  return (
    <div>
      <div>
        <button
          onClick={() => setOpenForm(true)}
          className="bg-black text-white py-2 px-4 rounded"
        >
          Sign Up
        </button>
        <button
          onClick={() => setOpenForm(false)}
          className="bg-black text-white py-2 px-4 rounded"
        >
          login
        </button>
      </div>
      <div>{openForm ? <SignupForm /> : <LoginForm />}</div>
    </div>
  );
};

export default Enter;
