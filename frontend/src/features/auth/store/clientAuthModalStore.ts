import { create } from "zustand";

interface ClientAuthModalState {
  isOpen: boolean;
  activeTab: "login" | "signup";
  signupStep: 1 | 2;
  
  // Login form state
  loginIdentifier: string;
  loginPassword: string;
  showLoginPassword: boolean;

  // Signup form state
  firstName: string;
  lastName: string;
  phone: string;
  signupPassword: string;
  showSignupPassword: boolean;
  otp: string;
  localMessage: string | null;

  // Success callback
  onSuccessCallback: (() => void) | null;

  // Actions
  openModal: (tab?: "login" | "signup", onSuccess?: () => void) => void;
  closeModal: () => void;
  setActiveTab: (tab: "login" | "signup") => void;
  setSignupStep: (step: 1 | 2) => void;
  setLoginIdentifier: (val: string) => void;
  setLoginPassword: (val: string) => void;
  setShowLoginPassword: (show: boolean) => void;
  setFirstName: (val: string) => void;
  setLastName: (val: string) => void;
  setPhone: (val: string) => void;
  setSignupPassword: (val: string) => void;
  setShowSignupPassword: (show: boolean) => void;
  setOtp: (val: string) => void;
  setLocalMessage: (msg: string | null) => void;
  resetForm: () => void;
}

export const useClientAuthModalStore = create<ClientAuthModalState>((set) => ({
  isOpen: false,
  activeTab: "login",
  signupStep: 1,

  loginIdentifier: "",
  loginPassword: "",
  showLoginPassword: false,

  firstName: "",
  lastName: "",
  phone: "",
  signupPassword: "",
  showSignupPassword: false,
  otp: "",
  localMessage: null,

  onSuccessCallback: null,

  openModal: (tab = "login", onSuccess) => {
    set({
      isOpen: true,
      activeTab: tab,
      onSuccessCallback: onSuccess || null,
      localMessage: null,
    });
  },

  closeModal: () => {
    set({ isOpen: false });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab, localMessage: null });
  },

  setSignupStep: (step) => set({ signupStep: step, localMessage: null }),
  setLoginIdentifier: (loginIdentifier) => set({ loginIdentifier }),
  setLoginPassword: (loginPassword) => set({ loginPassword }),
  setShowLoginPassword: (showLoginPassword) => set({ showLoginPassword }),
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setPhone: (phone) => set({ phone }),
  setSignupPassword: (signupPassword) => set({ signupPassword }),
  setShowSignupPassword: (showSignupPassword) => set({ showSignupPassword }),
  setOtp: (otp) => set({ otp }),
  setLocalMessage: (localMessage) => set({ localMessage }),

  resetForm: () => {
    set({
      loginIdentifier: "",
      loginPassword: "",
      showLoginPassword: false,
      firstName: "",
      lastName: "",
      phone: "",
      signupPassword: "",
      showSignupPassword: false,
      otp: "",
      signupStep: 1,
      localMessage: null,
    });
  },
}));
