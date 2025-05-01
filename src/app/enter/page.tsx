"use client";
import React, { useEffect, useState } from "react";
// import {
//   loginWithEmailPass,
//   loginWithGoogle,
//   signupWithEmailPass,
// } from "@/src/services/authServices";
import SignupForm from "@/src/components/Auth/SignupForm";
import LoginForm from "@/src/components/Auth/LoginForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/src/stores/useAuthStore";

const Enter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const [openForm, setOpenForm] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, redirectTo, router]);
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
