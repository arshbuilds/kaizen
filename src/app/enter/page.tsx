"use client";
import React, { useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";

export default function EnterPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#0f172a] px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Kaizen Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/30 mb-3">
            <span className="text-white text-2xl font-bold">改善</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kaizen</h1>
          <p className="text-slate-400 text-sm mt-1">
            Continuous self improvement & adaptive growth
          </p>
        </div>

        {/* Auth Toggle */}
        <div className="flex w-full max-w-sm bg-slate-900/80 border border-slate-800 rounded-xl p-1 mb-6 shadow-inner">
          <button
            onClick={() => setIsSignUp(false)}
            className={`w-1/2 py-2 text-sm font-medium rounded-lg transition-all ${
              !isSignUp
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`w-1/2 py-2 text-sm font-medium rounded-lg transition-all ${
              isSignUp
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Clerk Form */}
        <div className="w-full flex justify-center">
          {isSignUp ? (
            <SignUp
              routing="hash"
              signInUrl="#/sign-in"
              fallbackRedirectUrl="/today"
            />
          ) : (
            <SignIn
              routing="hash"
              signUpUrl="#/sign-up"
              fallbackRedirectUrl="/today"
            />
          )}
        </div>
      </div>
    </div>
  );
}
