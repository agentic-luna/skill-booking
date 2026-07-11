import React from "react";
import { UserCheck, FileText, ExternalLink, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface KycDetailModalProps {
  selectedHost: any;
  onClose: () => void;
  onApprove: (hostProfileId: string) => void;
  onRejectTrigger: () => void;
}

export default function KycDetailModal({
  selectedHost,
  onClose,
  onApprove,
  onRejectTrigger
}: KycDetailModalProps) {
  if (!selectedHost) return null;

  return (
    <Dialog open={selectedHost !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> Host Profile KYC Verification
          </DialogTitle>
          <DialogDescription className="text-xs">
            Examine credentials, bank listings, and government documents submitted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Host Contact Info */}
          <div className="grid grid-cols-2 gap-4 border bg-muted/20 p-3.5 rounded-xl">
            <div>
              <div className="text-[9px] font-semibold text-muted-foreground uppercase">Full Name</div>
              <div className="font-bold text-foreground text-sm">{selectedHost.firstName} {selectedHost.lastName}</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold text-muted-foreground uppercase">KYC Status</div>
              <div className="mt-0.5">
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                  selectedHost.hostProfile?.kycStatus === "APPROVED"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : selectedHost.hostProfile?.kycStatus === "PENDING"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {selectedHost.hostProfile?.kycStatus || "PENDING"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[9px] font-semibold text-muted-foreground uppercase">Email Address</div>
              <div className="font-semibold text-foreground">{selectedHost.email}</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold text-muted-foreground uppercase">Phone Number</div>
              <div className="font-semibold text-foreground">{selectedHost.phone}</div>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="space-y-1">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase">Expertise & Biography</div>
            <div className="p-3 bg-card border rounded-xl leading-relaxed">
              {selectedHost.hostProfile?.bio || <span className="italic text-muted-foreground/40">No biography provided</span>}
            </div>
          </div>

          {/* Documents Submission */}
          <div className="space-y-2">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase">Submitted Identification Documents</div>
            {selectedHost.hostProfile?.govIdUrl ? (
              <div className="flex items-center justify-between border border-primary/20 bg-primary/5 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">Government Issued ID Card</div>
                    <div className="text-[9px] text-muted-foreground">Verification document upload</div>
                  </div>
                </div>
                <a 
                  href={selectedHost.hostProfile.govIdUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold flex items-center gap-1 shrink-0 bg-primary/10 px-3 py-1 rounded-lg"
                >
                  View Link <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <div className="p-3 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/10">
                No identification card upload url attached to profile.
              </div>
            )}
          </div>

          {/* Bank Details */}
          <div className="space-y-2">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase">Linked Escrow Bank Account Details</div>
            {selectedHost.hostProfile?.bankDetail ? (
              <div className="grid grid-cols-2 gap-3 border p-3.5 rounded-xl bg-card">
                <div>
                  <div className="text-[9px] text-muted-foreground">Account Holder Name</div>
                  <div className="font-bold text-foreground truncate">{selectedHost.hostProfile.bankDetail.accountHolderName}</div>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground">Bank Name</div>
                  <div className="font-bold text-foreground">{selectedHost.hostProfile.bankDetail.bankName}</div>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground">IFSC Routing Code</div>
                  <div className="font-mono font-bold text-foreground">{selectedHost.hostProfile.bankDetail.ifscCode}</div>
                </div>
                {selectedHost.hostProfile.bankDetail.upiId && (
                  <div>
                    <div className="text-[9px] text-muted-foreground">UPI Payment Address</div>
                    <div className="font-mono text-foreground font-semibold">{selectedHost.hostProfile.bankDetail.upiId}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/10">
                No payout bank routing configuration submitted yet.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 flex sm:justify-between items-center gap-2">
          <Button
            variant="outline"
            type="button"
            className="text-xs h-9 rounded-xl mr-auto"
            onClick={onClose}
          >
            Close View
          </Button>
          
          {selectedHost.hostProfile?.kycStatus === "PENDING" && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-xs font-semibold h-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5"
                onClick={onRejectTrigger}
              >
                <X className="mr-1 h-3.5 w-3.5" /> Reject Submission
              </Button>
              <Button 
                className="text-xs font-semibold h-9 rounded-xl shadow-xs"
                onClick={() => onApprove(selectedHost.hostProfile.id)}
              >
                <Check className="mr-1 h-3.5 w-3.5" /> Verify & Approve
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
