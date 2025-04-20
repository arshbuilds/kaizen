"use client";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useQueryClient } from '@tanstack/react-query'
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  pass: z
    .string()
    .min(8, "Password has to be a minimum of 8 characters")
    .max(20),
});

type loginFormType = z.infer<typeof loginFormSchema>

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginFormType>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = (data:loginFormType) => {
    console.log(data)
  }

  return(
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}
      <input {...register("pass")} placeholder="Password" />
      {errors.pass && <p>{errors.pass.message}</p>}
      <button type="submit">Login</button>
      {/* <input {...register("name")} placeholder="Habit name" />
      {errors.name && <p>{errors.name.message}</p>} */}
    </form>
  );
};

export default LoginForm;
