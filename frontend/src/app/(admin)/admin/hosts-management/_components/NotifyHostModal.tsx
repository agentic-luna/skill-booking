import React from "react";
import { MessageSquare, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NotifyHostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedHost: any;
  notifySubject: string;
  onSubjectChange: (val: string) => void;
  notifyBody: string;
  onBodyChange: (val: string) => void;
  onSend: () => void;
  onCancel: () => void;
}

export default function NotifyHostModal({
  isOpen,
  onOpenChange,
  selectedHost,
  notifySubject,
  onSubjectChange,
  notifyBody,
  onBodyChange,
  onSend,
  onCancel
}: NotifyHostModalProps) {
  if (!selectedHost) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Notify Host Personally
          </DialogTitle>
          <DialogDescription className="text-xs">
            Draft a direct personal notice dispatch message to {selectedHost.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-muted-foreground">Notification Subject</label>
            <Input
              type="text"
              placeholder="e.g. Schedule Update, Action Required on profile"
              className="h-9 rounded-xl text-xs"
              value={notifySubject}
              onChange={(e) => onSubjectChange(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-muted-foreground">Message Body Context</label>
            <textarea
              placeholder="Draft your detailed email/SMS announcement here..."
              className="w-full h-32 rounded-xl text-xs p-3 bg-background border outline-none resize-none focus:ring-1 focus:ring-primary/20"
              value={notifyBody}
              onChange={(e) => onBodyChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            type="button"
            className="text-xs h-9 rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            className="text-xs font-semibold h-9 rounded-xl shadow-xs"
            onClick={onSend}
          >
            <Send className="h-3.5 w-3.5 mr-1" /> Dispatch Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
