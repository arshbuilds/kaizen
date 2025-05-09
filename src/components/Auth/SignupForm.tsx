"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { signupWithEmailPass } from "@/src/services/authServices";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { userType } from "@/src/types/userTypes";
import { toast } from "sonner";

const signUpFormSchema = z.object({
  username: z.string().min(1, "Please enter a valid name"),
  email: z.string().email("This is not a valid email"),
  pass: z
    .string()
    .min(8, "Password has to be a minimum of 8 characters")
    .max(20),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms and Conditions" }),
  }),
});

type signUpFormType = z.infer<typeof signUpFormSchema>;

const SignupForm = () => {
  const signupMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      pass: string;
      username: string;
    }) => {
      return await signupWithEmailPass({
        email: data.email,
        pass: data.pass,
        username: data.username,
      });
    },
    onSuccess: (userData: userType) => {
      useAuthStore.getState().setUser(userData);
      toast.success("Signup successfull");
    },
    onError: (err) => {
      console.error("Signup error", err);
      toast.error("Some error occured");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signUpFormType>({
    resolver: zodResolver(signUpFormSchema),
  });

  const onSubmit = (data: signUpFormType) => {
    signupMutation.mutate(data);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register("username")}
        type="text"
        placeholder="Full name"
        className="w-full px-4 py-2 rounded-lg bg-[#1e293b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
      {errors.username && <p>{errors.username.message}</p>}
      <input
        {...register("email")}
        type="email"
        placeholder="Email address"
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

      {/* Terms checkbox */}
      <div className="flex items-center text-sm text-gray-400">
        <input
          {...register("agreeToTerms")}
          type="checkbox"
          id="terms"
          className="mr-2"
        />
        <label htmlFor="terms">
          I agree to the{" "}
          <a href="#" className="text-blue-400 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-400 underline">
            Privacy Policy
          </a>
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
      >
        Create Account
      </button>
    </form>
  );
};

export default SignupForm;
