import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Program } from "@/constants/mockData";
import { User } from "@/features/auth/store/auth.types";

export interface ParticipantDetail {
  fullName: string;
  email: string;
  mobile: string;
  age?: string;
  gender: string;
  state: string;
  ticketType?: { name: string; price: number };
}

export interface PrimaryParticipant {
  fullName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  ticketType?: { name: string; price: number };
}

interface BookingModalState {
  isOpen: boolean;
  step: number;
  qty: number;
  program: Program | null;
  selectedTicketName: string | null;
  selectedTicketPrice: number | null;
  
  primary: PrimaryParticipant;
  additionals: ParticipantDetail[];
  
  termsAgreed: boolean;
  cancellationAgreed: boolean;
  notificationsAgreed: boolean;
  
  primaryErrors: Partial<Record<keyof PrimaryParticipant, string>>;
  additionalErrors: Record<number, Partial<Record<keyof ParticipantDetail, string>>>;
  razorpayAlert: boolean;
  paymentLoading: boolean;
  paymentSuccess: boolean;
  bookingRef: string | null;

  onSuccessCallback: (() => void) | null;

  // Actions
  openBookingModal: (program: Program, user?: User | null, onSuccess?: () => void) => void;
  closeBookingModal: () => void;
  setStep: (step: number) => void;
  setQty: (qty: number) => void;
  setSelectedTicket: (name: string, price: number) => void;
  setPrimary: (primary: PrimaryParticipant) => void;
  updatePrimaryField: (field: keyof PrimaryParticipant, value: string) => void;
  setAdditionals: (additionals: ParticipantDetail[]) => void;
  updateAdditionalField: (index: number, field: keyof ParticipantDetail, value: string) => void;
  setTermsAgreed: (agreed: boolean) => void;
  setCancellationAgreed: (agreed: boolean) => void;
  setNotificationsAgreed: (agreed: boolean) => void;
  setPrimaryErrors: (errors: Partial<Record<keyof PrimaryParticipant, string>>) => void;
  setAdditionalErrors: (errors: Record<number, Partial<Record<keyof ParticipantDetail, string>>>) => void;
  getFormattedParticipants: () => any[];
  setRazorpayAlert: (open: boolean) => void;
  setPaymentLoading: (loading: boolean) => void;
  setPaymentSuccess: (success: boolean, ref?: string) => void;
  resetBooking: () => void;
}

const initialPrimaryState: PrimaryParticipant = {
  fullName: "",
  email: "",
  mobile: "",
  dob: "",
  gender: "",
  city: "",
  state: "",
  country: "India",
};

export const useBookingModalStore = create<BookingModalState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      step: 0,
      qty: 1,
      program: null,
      selectedTicketName: null,
      selectedTicketPrice: null,

      primary: initialPrimaryState,
      additionals: [],

      termsAgreed: false,
      cancellationAgreed: false,
      notificationsAgreed: false,

      primaryErrors: {},
      additionalErrors: {},
      razorpayAlert: false,
      paymentLoading: false,
      paymentSuccess: false,
      bookingRef: null,

      onSuccessCallback: null,

      openBookingModal: (program, user, onSuccess) => {
        const state = get();
        const isDifferentProgram = !state.program || state.program.id !== program.id;
        
        const defaultName = user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : "";
        const defaultEmail = user?.email || "";
        const defaultMobile = user?.phone || "";

        if (isDifferentProgram) {
          set({
            isOpen: true,
            step: 0,
            qty: 1,
            program,
            primary: {
              ...initialPrimaryState,
              fullName: defaultName,
              email: defaultEmail,
              mobile: defaultMobile,
              ticketType: program.ticketTypes && program.ticketTypes.length > 0 
                ? { name: program.ticketTypes[0].name, price: program.ticketTypes[0].price } 
                : undefined,
            },
            additionals: [],
            termsAgreed: false,
            cancellationAgreed: false,
            notificationsAgreed: false,
            primaryErrors: {},
            additionalErrors: {},
            razorpayAlert: false,
            paymentLoading: false,
            paymentSuccess: false,
            bookingRef: null,
            onSuccessCallback: onSuccess || null,
          });
        } else {
          const updatedPrimary: PrimaryParticipant = {
            ...state.primary,
            fullName: state.primary.fullName || defaultName,
            email: state.primary.email || defaultEmail,
            mobile: state.primary.mobile || defaultMobile,
          };
          set({
            program,
            primary: updatedPrimary,
            onSuccessCallback: onSuccess || null,
          });
        }
      },

      closeBookingModal: () => {
        set({ isOpen: false });
      },

      setStep: (step) => set({ step }),

      setQty: (qty) => {
        const extra = Math.max(0, qty - 1);
        const currentAdditionals = get().additionals;
        
        let updatedAdditionals = [...currentAdditionals];
        if (updatedAdditionals.length < extra) {
          const needed = extra - updatedAdditionals.length;
          const newEntries = Array(needed).fill(null).map(() => ({
            fullName: "",
            email: "",
            mobile: "",
            age: "",
            gender: "",
            state: "",
            ticketType: get().program?.ticketTypes && get().program!.ticketTypes!.length > 0 
              ? { name: get().program!.ticketTypes![0].name, price: get().program!.ticketTypes![0].price } 
              : undefined,
          }));
          updatedAdditionals = [...updatedAdditionals, ...newEntries];
        } else if (updatedAdditionals.length > extra) {
          updatedAdditionals = updatedAdditionals.slice(0, extra);
        }

        set({ qty, additionals: updatedAdditionals });
      },

      setSelectedTicket: (name, price) => {
        // Obsolete, left for interface compliance if needed elsewhere, but does nothing globally now.
      },

      setPrimary: (primary) => set({ primary }),

      updatePrimaryField: (field, value) => {
        set((state) => ({
          primary: { ...state.primary, [field]: value },
          primaryErrors: { ...state.primaryErrors, [field]: undefined },
        }));
      },

      setAdditionals: (additionals) => set({ additionals }),

      updateAdditionalField: (index, field, value) => {
        set((state) => {
          const updated = [...state.additionals];
          if (updated[index]) {
            updated[index] = { ...updated[index], [field]: value };
          }
          const updatedErrors = { ...state.additionalErrors };
          if (updatedErrors[index]) {
            updatedErrors[index] = { ...updatedErrors[index], [field]: undefined };
          }
          return { additionals: updated, additionalErrors: updatedErrors };
        });
      },

      setTermsAgreed: (termsAgreed) => set({ termsAgreed }),
      setCancellationAgreed: (cancellationAgreed) => set({ cancellationAgreed }),
      setNotificationsAgreed: (notificationsAgreed) => set({ notificationsAgreed }),

      setPrimaryErrors: (primaryErrors) => set({ primaryErrors }),
      setAdditionalErrors: (additionalErrors) => set({ additionalErrors }),

      getFormattedParticipants: () => {
        const state = get();
        const list = [
          {
            isPrimary: true,
            fullName: state.primary.fullName,
            email: state.primary.email,
            mobile: state.primary.mobile,
            dob: state.primary.dob,
            gender: state.primary.gender,
            city: state.primary.city,
            state: state.primary.state,
            country: state.primary.country,
            ticketType: state.primary.ticketType,
          },
          ...state.additionals.map((a) => ({
            isPrimary: false,
            fullName: a.fullName,
            email: a.email,
            mobile: a.mobile,
            gender: a.gender,
            state: a.state,
            ticketType: a.ticketType,
          })),
        ];
        return list;
      },

      setRazorpayAlert: (razorpayAlert) => set({ razorpayAlert }),
      setPaymentLoading: (paymentLoading) => set({ paymentLoading }),
      
      setPaymentSuccess: (paymentSuccess, ref) => {
        set({ paymentSuccess, bookingRef: ref || null });
      },

      resetBooking: () => {
        set({
          step: 0,
          qty: 1,
          termsAgreed: false,
          cancellationAgreed: false,
          notificationsAgreed: false,
          primary: initialPrimaryState,
          additionals: [],
          primaryErrors: {},
          additionalErrors: {},
          razorpayAlert: false,
          paymentLoading: false,
          paymentSuccess: false,
          bookingRef: null,
          selectedTicketName: null,
          selectedTicketPrice: null,
        });
      },
    }),
    {
      name: "bookmytraining_booking_modal_v1",
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage so it survives app switches/reloads during payments
      partialize: (state) => ({
        isOpen: state.isOpen,
        step: state.step,
        qty: state.qty,
        program: state.program,
        selectedTicketName: state.selectedTicketName,
        selectedTicketPrice: state.selectedTicketPrice,
        primary: state.primary,
        additionals: state.additionals,
        termsAgreed: state.termsAgreed,
        cancellationAgreed: state.cancellationAgreed,
        notificationsAgreed: state.notificationsAgreed,
        paymentSuccess: state.paymentSuccess,
        bookingRef: state.bookingRef,
      }),
    }
  )
);
