"use client";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useQueryClient } from '@tanstack/react-query'
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signUpFormSchema = z.object({
  name: z.string().min(1, "Please enter a valid name"),
  email: z.string().email("This is not a valid email"),
  pass: z
    .string()
    .min(8, "Password has to be a minimum of 8 characters")
    .max(20),
});

type signUpFormType = z.infer<typeof signUpFormSchema>;

const SignupForm = () => {
  // const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signUpFormType>({
    resolver: zodResolver(signUpFormSchema),
  });

  const onSubmit = (data: signUpFormType) => {
    console.log(data);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Name" />
      {errors.name && <p>{errors.name.message}</p>}
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
