"use client";

import { useState, useEffect, useRef } from "react";

interface TimerProps {
  /** Duração em segundos (padrão: 25 min pomodoro) */
  durationSeconds?: number;
  /** Chamado quando o timer esgota */
  onFinish?: () => void;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Timer({ durationSeconds = 25 * 60, onFinish }: TimerProps) {
  const [seconds, setSeconds] = useState(durationSeconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            onFinish?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = 1 - seconds / durationSeconds;

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* Circular progress */}
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke="#6366f1" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-900 tabular-nums">
            {pad(minutes)}:{pad(secs)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={() => setRunning((r) => !r)}
        className="px-6 py-2 rounded-full bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        {running ? "Pausar" : "Retomar"}
      </button>
    </div>
  );
}
