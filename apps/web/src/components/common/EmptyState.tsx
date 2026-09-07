"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  badge?: string;
  compact?: boolean;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  secondaryLabel,
  onSecondaryAction,
  badge,
  compact = false,
  className = ""
}: EmptyStateProps) {
  const effectiveActionLabel = action?.label || actionLabel;
  const effectiveOnAction = action?.onClick || onAction;

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        compact ? "p-4 sm:p-6" : "p-8 sm:p-12"
      } text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}
    >
      <div className="relative mb-3">
        <div
          className={`${
            compact ? "w-10 h-10" : "w-14 h-14"
          } rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm`}
        >
          <Icon className={compact ? "w-5 h-5" : "w-7 h-7"} />
        </div>
        {badge && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-indigo-600 text-white shadow-sm">
            {badge}
          </span>
        )}
      </div>

      <h3 className={`${compact ? "text-sm" : "text-base"} font-bold text-slate-900 dark:text-white mb-1`}>
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-4">
        {description}
      </p>

      {(effectiveActionLabel || secondaryLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {effectiveActionLabel && effectiveOnAction && (
            <button
              type="button"
              onClick={effectiveOnAction}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
            >
              {effectiveActionLabel}
            </button>
          )}
          {secondaryLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold rounded-xl transition"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
