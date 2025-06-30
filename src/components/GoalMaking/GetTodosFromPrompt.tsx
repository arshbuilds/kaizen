"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/src/hooks/useAuth";
import { getTasksFromPrompt } from "@/src/services/ai/getTasks";
import { uploadTasksForGoals } from "@/src/services/goalServices";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Clock, Pencil } from "lucide-react";

const habitSchema = z.object({
  title: z.string().min(1, "Please enter a valid title"),
  description: z.string(),
  weeks: z.number(),
  tags: z.string(),
});

type HabitForm = z.infer<typeof habitSchema>;

const GetTodosFromPrompt = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();
  const { register, handleSubmit } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
  });
  const addGoalAndTasks = useMutation({
    mutationFn: async (data: HabitForm) => {
      const tasks = await getTasksFromPrompt(data.description, data.weeks);
      await uploadTasksForGoals(
        tasks,
        user!.userId,
        data.title,
        data.tags,
        data.description,
        data.weeks
      );
    },
    onMutate: () => {
      toast.loading("adding goal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.dismiss();
      toast.success("Goal Added succesfully");
    },
    onError: (_err) => {
      console.error(_err);
      toast.error("Some error occured");
      throw _err;
    },
  });

  const onSubmit = (data: HabitForm) => {
    addGoalAndTasks.mutate(data);
    router.push("/goals");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Field 1*/}
      <div className="bg-[#262636]/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            1
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="text-white font-semibold">Name Your Goal</h3>
          </div>
        </div>
        <input
          {...register("title")}
          type="text"
          placeholder="e.g. Start a YouTube Channel"
          className="w-full bg-slate-700/50 text-white placeholder-gray-400 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {/* field 2 */}
      <div className="bg-[#262636]/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            2
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            <h3 className="text-white font-semibold">Why This Matters</h3>
          </div>
        </div>
        <div className="relative">
          <textarea
            {...register("description")}
            placeholder="Describe what achieving this goal means to you..."
            rows={3}
            className="w-full bg-slate-700/50 text-white placeholder-gray-400 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          />
          <div className="absolute bottom-3 right-3">
            <Pencil className="text-gray-400" width={20} height={20} />
          </div>
        </div>
      </div>

      {/* Field 3*/}
      <div className="bg-[#262636]/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            3
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <h3 className="text-white font-semibold">Tags</h3>
          </div>
        </div>
        <input
          {...register("tags")}
          type="text"
          placeholder="seperate by commas (,)"
          className="w-full bg-slate-700/50 text-white placeholder-gray-400 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {/* Field 4 */}
      <div className="bg-[#262636]/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            4
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h3 className="text-white font-semibold">Set Number of Weeks</h3>
          </div>
        </div>
        <div className="relative">
          <input
            {...register("weeks", { valueAsNumber: true })}
            type="number"
            placeholder="Enter number of weeks"
            min="1"
            className="w-full bg-slate-700/50 text-white placeholder-gray-400 border border-slate-600 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Clock className="text-gray-400" width={20} height={20} />
          </div>
        </div>
      </div>

      <Button
        disabled={addGoalAndTasks.isPending}
        type="submit"
        variant="secondary"
      >
        Add goal
      </Button>
    </form>
  );
};

export default GetTodosFromPrompt;
