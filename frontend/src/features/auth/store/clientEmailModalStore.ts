import { create } from "zustand";

interface ClientEmailModalState {
  isOpen: boolean;
  email: string;
  isSent: boolean;
  magicLink: string | null;
  localMessage: string | null;

  openModal: (initialEmail?: string) => void;
  closeModal: () => void;
  setEmail: (email: string) => void;
  setIsSent: (sent: boolean) => void;
  setMagicLink: (link: string | null) => void;
  setLocalMessage: (msg: string | null) => void;
  resetState: () => void;
}

export const useClientEmailModalStore = create<ClientEmailModalState>((set) => ({
  isOpen: false,
  email: "",
  isSent: false,
  magicLink: null,
  localMessage: null,

  openModal: (initialEmail = "") => {
    set({
      isOpen: true,
      email: initialEmail,
      isSent: false,
      magicLink: null,
      localMessage: null,
    });
  },

  closeModal: () => set({ isOpen: false }),
  setEmail: (email) => set({ email }),
  setIsSent: (isSent) => set({ isSent }),
  setMagicLink: (magicLink) => set({ magicLink }),
  setLocalMessage: (localMessage) => set({ localMessage }),

  resetState: () => {
    set({
      email: "",
      isSent: false,
      magicLink: null,
      localMessage: null,
    });
  },
}));
