import { loginWithGoogle } from "@/src/services/authServices";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { userType } from "@/src/types/userTypes";
import { useMutation } from "@tanstack/react-query";
import React from "react";
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

  const onSubmit = () => {
    googleMutation.mutate();
  };
  return <button onClick={onSubmit}>GoogleLogin</button>;
};

export default GoogleLogin;
