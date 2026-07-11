"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const adminLoginSchema = z.object({
  identifier: z.string().min(3, "Enter your admin email or username"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      await adminLogin(data.identifier, data.password);
      router.push("/admin/dashboard");
    } catch { /* error set in store */ }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Admin Portal</h2>
        </div>
        <p className="text-sm text-muted-foreground">Sign in with your administrator credentials</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-pulse">{error}</div>}

        <div className="space-y-1.5">
          <Label htmlFor="identifier">Email or Username</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="identifier" placeholder="admin@bookmyskill.com" type="text" className="pl-10" {...register("identifier")} disabled={isLoading} />
          </div>
          {errors.identifier && <p className="text-xs text-destructive">{errors.identifier.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} className="pl-10 pr-10" {...register("password")} disabled={isLoading} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" tabIndex={-1}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isLoading ? "Authenticating..." : "Access Admin Panel"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Are you a client or host?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">User Login</Link>
      </div>
    </div>
  );
}
