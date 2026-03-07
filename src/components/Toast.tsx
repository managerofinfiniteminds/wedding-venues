"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "save" | "remove";
  visible: boolean;
}

export function Toast({ message, type, visible }: ToastProps) {
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (visible) {
      setRendered(true);
    } else {
      const t = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!rendered && !visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white whitespace-nowrap ${
          type === "save" ? "bg-[#3b6341]" : "bg-gray-600"
        }`}
      >
        {type === "save" ? "♥" : "♡"} {message}
      </div>
    </div>
  );
}
