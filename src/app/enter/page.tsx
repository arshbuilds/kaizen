"use client";
import React, { useEffect, useState } from "react";
import SignupForm from "@/src/components/Auth/SignupForm";
import LoginForm from "@/src/components/Auth/LoginForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/src/stores/useAuthStore";
import GoogleLogin from "@/src/components/Auth/GoogleLogin";

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
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] px-4">
      <div className="my-12 w-full max-w-sm bg-[#0f172a] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-sm">Logo</span>
          </div>
          <h1 className="text-white text-2xl font-semibold">Kaizen</h1>
          <p className="text-sm text-gray-400 mb-6">
            Continuous self improvement
          </p>
          {/* Toggle Buttons */}
          <div className="flex w-full bg-[#1e293b] rounded-lg p-1 mb-4">
            <button
              onClick={() => setOpenForm(false)}
              className={`w-1/2 py-2 text-sm   ${
                !openForm
                  ? "bg-purple-600 text-white rounded-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setOpenForm(true)}
              className={`w-1/2 py-2 text-sm  ${
                openForm
                  ? "bg-purple-600 text-white rounded-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>
        {openForm ? <SignupForm /> : <LoginForm />}
        {/* Divider */}
        <div className="text-center my-4 text-sm text-gray-400">
          or continue with
        </div>
        <GoogleLogin />
      </div>
    </div>
  );
};

export default Enter;

// <div>
//   <div>
//     <button
//       onClick={() => setOpenForm(true)}
//       className="bg-black text-white py-2 px-4 rounded"
//     >
//       Sign Up
//     </button>
//     <button
//       onClick={() => setOpenForm(false)}
//       className="bg-black text-white py-2 px-4 rounded"
//     >
//       login
//     </button>
//   </div>
// </div>
