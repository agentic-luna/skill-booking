import { create } from "zustand";

export type AlertType = "info" | "success" | "warning" | "destructive";

interface AlertState {
  isOpen: boolean;
  title: string;
  description: string;
  type: AlertType;
  showAlert: (title: string, description: string, type?: AlertType) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  type: "info",
  showAlert: (title, description, type = "info") =>
    set({ isOpen: true, title, description, type }),
  hideAlert: () => set({ isOpen: false }),
}));
