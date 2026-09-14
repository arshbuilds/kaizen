"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, BatteryCharging, Globe, Check, Loader2 } from "lucide-react";
import { UserPreferencesDto, UpdatePreferencesInput } from "@/src/lib/validations/userSchemas";
import { ApiResponse } from "@/src/types/api";
import { SubtleQuote } from "@/src/components/ui/SubtleQuote";

const TARGET_PRESETS = [
  { label: "1h (Light)", minutes: 60 },
  { label: "2h (Moderate)", minutes: 120 },
  { label: "3h (Focused)", minutes: 180 },
  { label: "4h+ (Intense)", minutes: 240 },
];

const FOCUS_PRESETS = [
  { label: "25m (Pomodoro)", minutes: 25 },
  { label: "45m (Standard)", minutes: 45 },
  { label: "60m (Deep Work)", minutes: 60 },
  { label: "90m (Ultradian)", minutes: 90 },
];

const WORK_BLOCK_OPTIONS = [
  { id: "morning", label: "Morning", desc: "6 AM – 12 PM" },
  { id: "afternoon", label: "Afternoon", desc: "12 PM – 5 PM" },
  { id: "evening", label: "Evening", desc: "5 PM – 9 PM" },
  { id: "night", label: "Night", desc: "9 PM – 12 AM" },
] as const;

export function PlanningPreferencesForm() {
  const queryClient = useQueryClient();

  // Local form state
  const [dailyTarget, setDailyTarget] = useState<number>(180);
  const [focusDuration, setFocusDuration] = useState<number>(45);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([
    "morning",
    "afternoon",
  ]);
  const [timezone, setTimezone] = useState<string>("UTC");

  const { data, isLoading, isError } = useQuery<ApiResponse<UserPreferencesDto>>({
    queryKey: ["preferences"],
    queryFn: async () => {
      const res = await fetch("/api/preferences");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      return res.json();
    },
  });

  // Sync server data to local form once loaded
  useEffect(() => {
    if (data?.success && data.data) {
      setDailyTarget(data.data.dailyTargetMinutes);
      setFocusDuration(data.data.focusDurationMinutes);
      setSelectedBlocks(data.data.preferredWorkBlocks || ["morning", "afternoon"]);
      setTimezone(
        data.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      );
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload: UpdatePreferencesInput) => {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<UserPreferencesDto> = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = !json.success ? json.error : "Failed to update preferences";
        throw new Error(errorMsg);
      }
      return json.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["preferences"], { success: true, data: updated });
      toast.success("Planning preferences saved");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update preferences");
    },
  });

  const handleToggleBlock = (blockId: string) => {
    if (selectedBlocks.includes(blockId)) {
      if (selectedBlocks.length === 1) {
        toast.warning("Keep at least one preferred focus window");
        return;
      }
      setSelectedBlocks(selectedBlocks.filter((b) => b !== blockId));
    } else {
      setSelectedBlocks([...selectedBlocks, blockId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      dailyTargetMinutes: dailyTarget,
      focusDurationMinutes: focusDuration,
      preferredWorkBlocks: selectedBlocks as ("morning" | "afternoon" | "evening" | "night")[],
      timezone,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400 text-sm gap-2">
        <Loader2 className="animate-spin" size={18} />
        <span>Loading planning preferences...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-sm">
        Failed to load preferences. Please check your connection and refresh.
      </div>
    );
  }

  const hours = Math.floor(dailyTarget / 60);
  const minutes = dailyTarget % 60;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Subtle Quote Demonstration */}
      <SubtleQuote
        quote="We do not rise to the level of our goals. We fall to the level of our systems."
        attribution="James Clear"
        context="Atomic Habits"
      />

      {/* 1. Daily Target Focus Time */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
            <Clock size={16} className="text-blue-400" />
            <span>Daily Available Focus Time</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-950/60 text-blue-300 border border-blue-800/40">
            {hours > 0 ? `${hours}h ` : ""}
            {minutes > 0 ? `${minutes}m` : ""}
            {hours === 0 && minutes === 0 ? "0m" : ""} / day
          </span>
        </div>

        <p className="text-xs text-slate-400">
          How much uninterrupted time can you realistically invest each day? Kaizen will never schedule more work than this limit.
        </p>

        {/* Quick Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {TARGET_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.minutes}
              onClick={() => setDailyTarget(preset.minutes)}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                dailyTarget === preset.minutes
                  ? "bg-blue-600/20 border-blue-500 text-white"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Range Slider for Custom Fine Tuning */}
        <div className="pt-2">
          <input
            type="range"
            min={30}
            max={480}
            step={15}
            value={dailyTarget}
            onChange={(e) => setDailyTarget(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>30m</span>
            <span>2h</span>
            <span>4h</span>
            <span>6h</span>
            <span>8h</span>
          </div>
        </div>
      </div>

      {/* 2. Single Focus Session Duration */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
          <BatteryCharging size={16} className="text-indigo-400" />
          <span>Preferred Focus Session Length</span>
        </div>
        <p className="text-xs text-slate-400">
          Individual work interval before taking a cognitive break.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {FOCUS_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.minutes}
              onClick={() => setFocusDuration(preset.minutes)}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                focusDuration === preset.minutes
                  ? "bg-indigo-600/20 border-indigo-500 text-white"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Peak Energy & Work Windows */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="text-slate-200 font-medium text-sm">
          Peak Energy & Work Windows
        </div>
        <p className="text-xs text-slate-400">
          Select the periods when you perform your best deep work.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {WORK_BLOCK_OPTIONS.map((block) => {
            const isSelected = selectedBlocks.includes(block.id);
            return (
              <button
                type="button"
                key={block.id}
                onClick={() => handleToggleBlock(block.id)}
                className={`flex items-start justify-between p-3 rounded-xl border text-left transition-colors ${
                  isSelected
                    ? "bg-slate-800/90 border-blue-500/80 text-white"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{block.label}</div>
                  <div className="text-[10px] text-slate-500">{block.desc}</div>
                </div>
                {isSelected && (
                  <Check size={14} className="text-blue-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Timezone */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
          <Globe size={16} className="text-slate-400" />
          <span>Timezone</span>
        </div>
        <p className="text-xs text-slate-400">
          Used to calculate day boundaries for your daily plan and reviews.
        </p>
        <input
          type="text"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="e.g. Asia/Kolkata or America/New_York"
          className="w-full bg-slate-950/70 text-slate-200 placeholder-slate-500 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>Saving Preferences...</span>
          </>
        ) : (
          <span>Save Planning Constraints</span>
        )}
      </button>
    </form>
  );
}
