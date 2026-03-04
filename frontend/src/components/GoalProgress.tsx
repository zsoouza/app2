import { Goal } from "@/types";
import { clsx } from "clsx";

const labels: Record<string, string> = {
  DAILY_MINUTES:   "Minutos por dia",
  WEEKLY_SESSIONS: "Sessões por semana",
};

interface GoalProgressProps {
  goal: Goal;
}

export function GoalProgress({ goal }: GoalProgressProps) {
  const pct = goal.percentage ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{labels[goal.type] ?? goal.type}</span>
        <span className="text-sm font-medium text-gray-800">
          {goal.current ?? 0} / {goal.targetValue}
          {goal.type === "DAILY_MINUTES" ? " min" : " sessões"}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={clsx(
            "h-2 rounded-full transition-all duration-500",
            pct >= 100 ? "bg-green-500" : "bg-primary-500"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5 text-right">{pct}%</p>
    </div>
  );
}
