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
});

type signUpFormType = z.infer<typeof signUpFormSchema>;

const SignupForm = () => {

  const signupMutation = useMutation({
    mutationFn: async (data: {email: string, pass: string, username: string}) => {
      return await signupWithEmailPass({email: data.email, pass: data.pass, username: data.username})
    }, 
    onSuccess: (userData: userType) => {
      useAuthStore.getState().setUser(userData)
      toast.success("Signup successfull")
    },
    onError: (err) => {
      console.error("Signup error", err);
      toast.error("Some error occured")
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signUpFormType>({
    resolver: zodResolver(signUpFormSchema),
  });

  const onSubmit = (data: signUpFormType) => {
    signupMutation.mutate(data)   
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} placeholder="Name" />
      {errors.username && <p>{errors.username.message}</p>}
      <input {...register("email")} placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}
      <input {...register("pass")} placeholder="Password" />
      {errors.pass && <p>{errors.pass.message}</p>}
      <button type="submit">Signup</button>
      {/* <input {...register("name")} placeholder="Habit name" />
      {errors.name && <p>{errors.name.message}</p>} */}
    </form>
  );
};

export default SignupForm;
