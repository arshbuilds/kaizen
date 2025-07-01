"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { updateUserData } from "@/src/services/authServices";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const tiles = [
  { id: "fitness", emoji: "💪", label: "Fitness" },
  { id: "finance", emoji: "💰", label: "Finance" },
  { id: "learning", emoji: "📚", label: "Learning" },
  { id: "creativity", emoji: "🎨", label: "Creativity" },
  { id: "mindfulness", emoji: "🧘", label: "Mindfulness" },
  { id: "career", emoji: "🚀", label: "Career" },
] as const;

const ProfileSettingsSchema = z.object({
  name: z.string(),
  role: z.string(),
  interests: z.string().array(),
});

type ProfileSettingsFormType = z.infer<typeof ProfileSettingsSchema>;

const ProfileSettings = () => {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileSettingsFormType>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: { interests: user!.interests, name: user?.userName, role: user?.role },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async ({
      data,
    }: {
      data: { name: string; interests: string[]; role: string };
    }) => {
      console.log(data);
      return await updateUserData({ userId: user!.userId, data });
    },
    onSuccess: () => {
      toast.success("Information updated sucessfully");
    },
    onError: (err) => {
      toast.error("Some error occured");
      console.error("update error", err);
    },
  });

  const selected = watch("interests");
  const onSubmit = (data: ProfileSettingsFormType) => {
    saveSettingsMutation.mutate({ data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Field 1 */}
      {errors.interests && <>{errors.interests.message}</>}
      {errors.name && <>{errors.name.message}</>}
      {errors.role && <>{errors.role.message}</>}
      <div className="bg-[#1a2332] backdrop-blur-sm border border-slate-700/50 rounded-xl p-3">
        <h3 className="text-white font-semibold mb-3 px-3">Username</h3>
        <input
          {...register("name")}
          type="text"
          name="name"
          placeholder="e.g. Start a YouTube Channel"
          className="w-full bg-slate-700/50 text-white placeholder-gray-400 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {/* Field 2 */}
      <div className="bg-[#1a2332] backdrop-blur-sm border border-slate-700/50 rounded-xl p-3">
        <h3 className="text-white font-semibold mb-3 px-3">Role</h3>
        <input
          {...register("role")}
          type="text"
          name="role"
          placeholder="e.g. mindfulness explorer"
          className="w-full bg-slate-700/50 text-white placeholder-gray-400 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {/* Interests selector */}
      <div className="grid grid-cols-3 gap-4 max-w-sm bg-[#1a2332] rounded-xl p-4">
        {tiles.map((t) => {
          const active = selected.includes(t.id);
          return (
            <label
              key={t.id}
              className={clsx(
                "flex flex-col shadow-lg items-center justify-center rounded-xl border p-4 cursor-pointer select-none bg-[#443f71]/20 transition",
                active ? "text-white shadow-cyan-500" : "text-slate-200",
                "hover:ring-2 hover:ring-indigo-400"
              )}
            >
              {/* same name, individual value → RHF array[5][6] */}
              <input
                type="checkbox"
                value={t.id}
                {...register("interests")}
                className="hidden"
              />

              <span className="text-3xl">{t.emoji}</span>
              <span className="mt-2 text-sm">{t.label}</span>
            </label>
          );
        })}
      </div>

      <button
        type="submit"
        className="px-2 self-center bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
      >
        Save settings
      </button>
    </form>
  );
};

export default ProfileSettings;
