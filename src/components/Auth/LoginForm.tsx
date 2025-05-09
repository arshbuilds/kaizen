"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginWithEmailPass } from "@/src/services/authServices";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { userType } from "@/src/types/userTypes";
import { toast } from "sonner";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  pass: z
    .string()
    .min(8, "Password has to be a minimum of 8 characters")
    .max(20),
});

type loginFormType = z.infer<typeof loginFormSchema>

const LoginForm = () => {

  const loginMutation = useMutation({
    mutationFn: async (data: {email: string, pass: string}) => {
      return await loginWithEmailPass({email: data.email, pass: data.pass})
    },
    onSuccess: (userData: userType) => {
      useAuthStore.getState().setUser(userData);
      toast.success("Login successfull")
    },
      onError: (err) => {
      toast.error("Some error occured")
      console.error("Login error", err);
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginFormType>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = (data:loginFormType) => {
    loginMutation.mutate(data)
  }

  return(
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register("email")}
        type="text"
        placeholder="Full name"
        className="w-full px-4 py-2 rounded-lg bg-[#1e293b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
      {errors.email && <p>{errors.email.message}</p>}
      <input
        {...register("pass")}
        type="password"
        placeholder="Password"
        className="w-full px-4 py-2 rounded-lg bg-[#1e293b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
      {errors.pass && <p>{errors.pass.message}</p>}

      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
      >
        Create Account
      </button>
    </form>
  );
};

export default LoginForm;
