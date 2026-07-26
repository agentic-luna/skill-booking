"use client";

import React, { useEffect } from "react";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import AlertBox from "@/components/ui/alert-box";

export default function GlobalAlert() {
  const { isOpen, title, description, type, hideAlert } = useAlertStore();

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      hideAlert();
    }, 3500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideAlert();
    };
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, hideAlert]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-full max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
      <AlertBox
        variant={type}
        title={title}
        description={description}
        onClose={hideAlert}
        className="shadow-xl bg-background/95 backdrop-blur-md border"
      />
    </div>
  );
}

