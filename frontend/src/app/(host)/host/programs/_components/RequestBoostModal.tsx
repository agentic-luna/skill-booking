import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Rocket, Loader2 } from "lucide-react";
import { useHostStore } from "@/features/host/store/hostStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAuthStore } from "@/features/auth/store/authStore";

export function RequestBoostModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  eventTitle: string;
}) {
  const [duration, setDuration] = useState("7");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestBoost, verifyBoostPayment, boostPricing, fetchBoostPricing } = useHostStore();
  const { user } = useAuthStore();
  const showAlert = useAlertStore((s) => s.showAlert);

  useEffect(() => {
    if (isOpen) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  const pricing = boostPricing || { "7": 500, "15": 900, "30": 1500 };
  useEffect(() => {
    fetchBoostPricing();
  }, [fetchBoostPricing]);


  const handleSubmit = async () => {
    if (!eventId) return;
    setIsSubmitting(true);
    try {
      const response = await requestBoost(eventId, Number(duration));
      const { boostRequest, razorpayOrder } = response;

      if (!razorpayOrder) {
        throw new Error("Razorpay order not created");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "BookMySkill",
        description: `Boost Event: ${eventTitle}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            await verifyBoostPayment({
              boostId: boostRequest.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            showAlert("Boost Successful", "Your event is now boosted and highlighted!", "success");
            onClose();
          } catch (err: any) {
            showAlert("Verification Failed", err.message || "Failed to verify payment.", "destructive");
          }
        },
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#a0f212",
        },
      };

      // MOCK MODE: Bypass Razorpay window and force success
      if (process.env.NODE_ENV === 'development' || true) {
        setTimeout(async () => {
          try {
            await verifyBoostPayment({
              boostId: boostRequest.id,
              razorpayPaymentId: "mock_payment_id",
              razorpayOrderId: razorpayOrder.id,
              razorpaySignature: "MOCK_SUCCESS",
            });
            showAlert("Boost Successful (Mock Mode)", "Your event is now boosted and highlighted!", "success");
            onClose();
          } catch (err: any) {
            showAlert("Verification Failed", err.message || "Failed to verify mock payment.", "destructive");
          }
        }, 1000); // simulate 1s delay
        return;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        showAlert("Payment Failed", response.error.description, "destructive");
      });
      rzp.open();
    } catch (error: any) {
      showAlert("Error", error.message || "Failed to request boost.", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Rocket className="h-5 w-5 text-[#a0f212]" /> Request Event Boost
          </DialogTitle>
          <DialogDescription className="text-sm pt-2">
            Boost <strong>{eventTitle}</strong> to show up first in search results and the landing page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Boost Duration</Label>
            <div className="grid grid-cols-2 gap-3">
              {[7, 15, 30].map((days) => (
                <div
                  key={days}
                  onClick={() => setDuration(days.toString())}
                  className={`border rounded-xl p-4 text-center cursor-pointer transition-all ${
                    duration === days.toString()
                      ? "border-[#a0f212] bg-[#a0f212]/10 text-black shadow-sm ring-2 ring-[#a0f212]/30"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <div className="text-lg font-black">{days} Days</div>
                  <div className="text-[10px] uppercase tracking-wider mt-1 opacity-70">
                    {days === 30 ? "1 Month" : "Duration"}
                  </div>
                  <div className="text-sm font-bold text-green-600 mt-2">
                    ₹{pricing[days.toString()]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-[#0b0c01] text-white hover:bg-black/80"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Rocket className="h-4 w-4 mr-2" />}
            Pay ₹{pricing[duration]} to Boost
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
