"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastItem {
  id: string;
  type: "success" | "error";
  message: string;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toastsState: ToastItem[] = [];
const listeners: Set<ToastListener> = new Set();

function notify() {
  listeners.forEach((l) => l([...toastsState]));
}

export const toast = {
  success: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastsState = [...toastsState, { id, type: "success", message }];
    notify();
    setTimeout(() => {
      toastsState = toastsState.filter((t) => t.id !== id);
      notify();
    }, 4500);
  },
  error: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastsState = [...toastsState, { id, type: "error", message }];
    notify();
    setTimeout(() => {
      toastsState = toastsState.filter((t) => t.id !== id);
      notify();
    }, 4500);
  },
  dismiss: (id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notify();
  },
};

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
            item.type === "success"
              ? "bg-white border-emerald-200 text-zinc-900"
              : "bg-white border-red-200 text-zinc-900"
          }`}
        >
          {item.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs font-medium leading-relaxed">
            {item.message}
          </div>
          <button
            onClick={() => toast.dismiss(item.id)}
            className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
