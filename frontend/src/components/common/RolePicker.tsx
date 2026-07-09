"use client";

import { Check, User, Users, Shield } from "lucide-react";
import type { UserRole } from "@/features/auth/store/authStore";

interface RolePickerProps {
  selected: UserRole;
  onChange: (role: UserRole) => void;
  roles?: UserRole[];
}

const ICONS: Record<UserRole, React.ReactNode> = {
  client: <User className="h-4 w-4 mb-1" />,
  host: <Users className="h-4 w-4 mb-1" />,
  admin: <Shield className="h-4 w-4 mb-1" />,
};

export default function RolePicker({
  selected,
  onChange,
  roles = ["client", "host", "admin"],
}: RolePickerProps) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${roles.length}, 1fr)` }}>
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all relative ${
            selected === role
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          {ICONS[role]}
          <span className="text-xs font-semibold capitalize">{role}</span>
          {selected === role && (
            <span className="absolute top-1.5 right-1.5 bg-primary text-white rounded-full p-0.5">
              <Check className="h-2 w-2" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
