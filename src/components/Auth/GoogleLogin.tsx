import { loginWithGoogle } from "@/src/services/authServices";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { userType } from "@/src/types/userTypes";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { FaGoogle } from "react-icons/fa";
import { toast } from "sonner";

const GoogleLogin = () => {
  const googleMutation = useMutation({
    mutationFn: async () => {
      return await loginWithGoogle();
    },
    onSuccess: (userData: userType) => {
      useAuthStore.getState().setUser(userData);
      toast.success("Login successfull");
    },
    onError: (err) => {
      toast.error("Some error occured");
      console.error("Login error", err);
    },
  });

  const handleSubmit = () => {
    googleMutation.mutate();
  };
  return (
    <div className="flex justify-center gap-4">
      <button
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white rounded-lg text-sm"
      >
        <FaGoogle />
        Google
      </button>
    </div>
  );
};

export default GoogleLogin;
