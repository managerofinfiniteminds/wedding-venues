"use client";

import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { Toast } from "./Toast";

interface FavoriteButtonProps {
  venueId: string;
  venueName: string;
  size?: "sm" | "md";
}

export function FavoriteButton({
  venueId,
  venueName,
  size = "md",
}: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"save" | "remove">("save");
  const [toastMessage, setToastMessage] = useState("");
  const [animating, setAnimating] = useState(false);

  const saved = isFavorite(venueId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const willSave = !saved;
    toggle(venueId);

    // Pulse animation
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    // Toast
    setToastType(willSave ? "save" : "remove");
    setToastMessage(willSave ? "Saved to favorites" : "Removed");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  if (size === "sm") {
    return (
      <>
        <button
          onClick={handleClick}
          aria-label={
            saved
              ? `Remove ${venueName} from favorites`
              : `Save ${venueName} to favorites`
          }
          className={`p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all duration-200 ${
            saved ? "text-pink-500" : "text-gray-400 hover:text-pink-500"
          }`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              animating ? "scale-125" : "scale-100"
            }`}
            viewBox="0 0 24 24"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
        <Toast message={toastMessage} type={toastType} visible={toastVisible} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={
          saved
            ? `Remove ${venueName} from favorites`
            : `Save ${venueName} to favorites`
        }
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
          saved
            ? "border-pink-300 bg-pink-50 text-pink-600 hover:bg-pink-100"
            : "border-gray-300 bg-white/90 text-gray-600 hover:border-pink-300 hover:text-pink-600"
        }`}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            animating ? "scale-125" : "scale-100"
          }`}
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{saved ? "Saved ♥" : "Save"}</span>
      </button>
      <Toast message={toastMessage} type={toastType} visible={toastVisible} />
    </>
  );
}
